<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { useDark } from "@pureadmin/utils";
import { startExam, saveAnswer, saveDuration, submitExam } from "@/api/examPaper";
import RichContent from "@/views/exam-paper/editor/components/RichContent.vue";

defineOptions({
  name: "ExamPaperDo"
});

const route = useRoute();
const router = useRouter();
const { isDark } = useDark();

// 试卷ID
const paperId = computed(() => Number(route.params.id));

// 加载状态
const loading = ref(true);
const submitting = ref(false);

// 考试数据
const examData = reactive({
  submissionId: 0,
  paper: null as any,
  remainingTime: 0 // 剩余时间（秒）
});

// 当前题目索引
const currentQuestionIndex = ref(0);

// 学生答案（使用时间戳记录）
interface AnswerRecord {
  questionId: number;
  answer: string | string[];
  duration: number; // 该题累计答题时长（秒，从后端获取）
  enterTime: number; // 进入该题的时间戳（毫秒）
}
const answers = ref<Map<number, AnswerRecord>>(new Map());

// 考试计时器
let examTimer: ReturnType<typeof setInterval> | null = null;

// 当前题目计时器（每秒更新当前题目的用时）
let questionTimer: ReturnType<typeof setInterval> | null = null;

// 用于强制刷新题目用时显示的响应式变量
const questionTimerTick = ref(0);

// 所有题目列表（扁平化）
const allQuestions = computed(() => {
  if (!examData.paper?.questionGroups) return [];
  const questions: any[] = [];
  examData.paper.questionGroups.forEach((group: any) => {
    group.questions.forEach((q: any) => {
      questions.push({
        ...q,
        groupName: group.groupName,
        groupId: group.groupId
      });
    });
  });
  return questions;
});

// 当前题目
const currentQuestion = computed(() => allQuestions.value[currentQuestionIndex.value]);

// 当前题目的答案记录
const currentAnswerRecord = computed(() => {
  if (!currentQuestion.value) return null;
  return answers.value.get(currentQuestion.value.questionId);
});

// 格式化剩余时间
const formattedRemainingTime = computed(() => {
  const hours = Math.floor(examData.remainingTime / 3600);
  const minutes = Math.floor((examData.remainingTime % 3600) / 60);
  const seconds = examData.remainingTime % 60;
  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
});

// 答题进度
const answeredCount = computed(() => {
  let count = 0;
  answers.value.forEach(record => {
    if (record.answer !== "" && record.answer !== null && 
        (Array.isArray(record.answer) ? record.answer.length > 0 : true)) {
      count++;
    }
  });
  return count;
});

// 初始化答案记录
const initAnswerRecords = () => {
  allQuestions.value.forEach(q => {
    if (!answers.value.has(q.questionId)) {
      answers.value.set(q.questionId, {
        questionId: q.questionId,
        answer: q.questionType === 2 ? [] : "", // 多选题用数组
        duration: 0, // 从后端获取
        enterTime: 0
      });
    }
  });
};

// 进入题目（记录进入时间戳）
const enterQuestion = (questionId: number) => {
  const record = answers.value.get(questionId);
  if (record) {
    record.enterTime = Date.now();
  }
};

// 离开题目（发送时间戳给后端）
const leaveQuestion = async (questionId: number) => {
  const record = answers.value.get(questionId);
  if (record && record.enterTime > 0) {
    const leaveTime = Date.now();
    // 发送时间戳给后端，后端计算并累加时长
    try {
      await saveDuration({
        submissionId: examData.submissionId,
        questionId,
        enterTime: record.enterTime,
        leaveTime: leaveTime
      });
    } catch (error) {
      console.error("保存答题时长失败:", error);
    }
    record.enterTime = 0;
  }
};

// 切换题目
const switchQuestion = (index: number) => {
  if (index < 0 || index >= allQuestions.value.length) return;
  
  // 离开当前题目
  if (currentQuestion.value) {
    leaveQuestion(currentQuestion.value.questionId);
  }

  // 切换到新题目
  currentQuestionIndex.value = index;
  
  // 进入新题目
  if (allQuestions.value[index]) {
    enterQuestion(allQuestions.value[index].questionId);
  }
};

// 上一题
const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    switchQuestion(currentQuestionIndex.value - 1);
  }
};

// 下一题
const nextQuestion = () => {
  if (currentQuestionIndex.value < allQuestions.value.length - 1) {
    switchQuestion(currentQuestionIndex.value + 1);
  }
};

// 更新答案
const updateAnswer = (value: string | string[]) => {
  if (!currentQuestion.value) return;
  const record = answers.value.get(currentQuestion.value.questionId);
  if (record) {
    record.answer = value;
    // 自动保存答案（不需要发送时长，只在离开题目时发送时间戳）
    autoSaveAnswer(currentQuestion.value.questionId, value);
  }
};

// 自动保存答案（仅保存答案内容）
const autoSaveAnswer = async (questionId: number, answer: string | string[]) => {
  if (!examData.submissionId) return;
  try {
    await saveAnswer({
      submissionId: examData.submissionId,
      questionId,
      answer
    });
  } catch (error) {
    console.error("自动保存失败:", error);
  }
};

// 提交试卷
const handleSubmit = async () => {
  // 先停止当前题目计时
  if (currentQuestion.value) {
    leaveQuestion(currentQuestion.value.questionId);
  }

  const unansweredCount = allQuestions.value.length - answeredCount.value;

  let confirmMessage = "确定要提交试卷吗？";
  if (unansweredCount > 0) {
    confirmMessage = `还有 ${unansweredCount} 道题未作答，确定要提交吗？`;
  }

  try {
    await ElMessageBox.confirm(confirmMessage, "提交确认", {
      confirmButtonText: "确定提交",
      cancelButtonText: "继续答题",
      type: "warning"
    });

    submitting.value = true;

    // 提交前保存所有答案的最终时长
    const finalAnswers: Array<{ questionId: number; answer: string | string[]; duration: number }> = [];
    answers.value.forEach(record => {
      finalAnswers.push({
        questionId: record.questionId,
        answer: record.answer,
        duration: record.duration
      });
    });

    // 调用提交接口
    const res = await submitExam(examData.submissionId);
    
    if (res.code === 0) {
      ElMessage.success("试卷提交成功！");
      // 停止计时器
      stopTimers();
      // 跳转到结果页或返回列表
      router.push("/exam-paper");
    } else {
      ElMessage.error(res.msg || "提交失败");
      // 重新进入当前题目计时
      if (currentQuestion.value) {
        enterQuestion(currentQuestion.value.questionId);
      }
    }
  } catch {
    // 用户取消提交，重新进入当前题目计时
    if (currentQuestion.value) {
      enterQuestion(currentQuestion.value.questionId);
    }
  } finally {
    submitting.value = false;
  }
};

// 启动考试计时器
const startExamTimer = () => {
  examTimer = setInterval(() => {
    if (examData.remainingTime > 0) {
      examData.remainingTime--;
    } else {
      // 时间到，自动提交
      ElMessage.warning("考试时间到，正在自动提交...");
      handleSubmit();
    }
  }, 1000);
};

// 启动题目计时器（实时更新当前题目用时显示）
const startQuestionTimer = () => {
  questionTimer = setInterval(() => {
    // 每秒更新计数器，触发 computed 重新计算
    questionTimerTick.value++;
  }, 1000);
};

// 停止所有计时器
const stopTimers = () => {
  if (examTimer) {
    clearInterval(examTimer);
    examTimer = null;
  }
  if (questionTimer) {
    clearInterval(questionTimer);
    questionTimer = null;
  }
};

// 获取当前题目实时用时（包含正在计时的部分）
const getCurrentQuestionDuration = computed(() => {
  // 依赖 questionTimerTick 来触发每秒更新
  questionTimerTick.value;
  
  if (!currentAnswerRecord.value) return 0;
  let duration = currentAnswerRecord.value.duration; // 后端返回的累计时长
  if (currentAnswerRecord.value.enterTime > 0) {
    // 加上当前正在计时的部分
    duration += Math.floor((Date.now() - currentAnswerRecord.value.enterTime) / 1000);
  }
  return duration;
});

// 格式化题目用时
const formatDuration = (seconds: number) => {
  if (seconds < 60) return `${seconds}秒`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}分${secs}秒`;
};

// 判断题目是否已作答
const isQuestionAnswered = (questionId: number) => {
  const record = answers.value.get(questionId);
  if (!record) return false;
  if (Array.isArray(record.answer)) {
    return record.answer.length > 0;
  }
  return record.answer !== "" && record.answer !== null;
};

// 加载考试数据
const loadExamData = async () => {
  loading.value = true;
  try {
    const res = await startExam(paperId.value);
    if (res.code === 0 && res.data) {
      examData.submissionId = res.data.submissionId;
      examData.paper = res.data.paper;
      examData.remainingTime = res.data.remainingTime;
      
      // 初始化答案记录
      initAnswerRecords();
      
      // 进入第一题
      if (allQuestions.value.length > 0) {
        enterQuestion(allQuestions.value[0].questionId);
      }
      
      // 启动计时器
      startExamTimer();
      startQuestionTimer();
    } else {
      ElMessage.error(res.msg || "加载考试失败");
      router.back();
    }
  } catch (error) {
    console.error("加载考试失败:", error);
    ElMessage.error("加载考试失败");
    router.back();
  } finally {
    loading.value = false;
  }
};

// 页面离开前确认
const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  e.preventDefault();
  e.returnValue = "";
};

onMounted(() => {
  loadExamData();
  window.addEventListener("beforeunload", handleBeforeUnload);
});

onBeforeUnmount(() => {
  stopTimers();
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>

<template>
  <div class="exam-do-container" :class="{ 'is-dark': isDark }" v-loading="loading">
    <!-- 顶部信息栏 -->
    <div class="exam-header">
      <div class="header-left">
        <h2 class="paper-title">{{ examData.paper?.title || "加载中..." }}</h2>
        <span class="paper-info">
          共 {{ allQuestions.length }} 题 | 已答 {{ answeredCount }} 题
        </span>
      </div>
      <div class="header-center">
        <div class="timer" :class="{ warning: examData.remainingTime < 300 }">
          <el-icon><Clock /></el-icon>
          <span>剩余时间：{{ formattedRemainingTime }}</span>
        </div>
      </div>
      <div class="header-right">
        <el-button type="primary" :loading="submitting" @click="handleSubmit">
          <el-icon><Check /></el-icon>
          交卷
        </el-button>
      </div>
    </div>

    <!-- 主内容区 -->
    <div class="exam-main">
      <!-- 左侧题目导航 -->
      <div class="question-nav">
        <div class="nav-header">
          <span>答题卡</span>
        </div>
        <div class="nav-grid">
          <div
            v-for="(q, index) in allQuestions"
            :key="q.questionId"
            class="nav-item"
            :class="{
              active: index === currentQuestionIndex,
              answered: isQuestionAnswered(q.questionId)
            }"
            @click="switchQuestion(index)"
          >
            {{ index + 1 }}
          </div>
        </div>
        <div class="nav-legend">
          <div class="legend-item">
            <span class="dot answered"></span>
            <span>已答</span>
          </div>
          <div class="legend-item">
            <span class="dot"></span>
            <span>未答</span>
          </div>
          <div class="legend-item">
            <span class="dot active"></span>
            <span>当前</span>
          </div>
        </div>
      </div>

      <!-- 中间答题区 -->
      <div class="question-content">
        <template v-if="currentQuestion">
          <!-- 题目头部 -->
          <div class="question-header">
            <div class="question-info">
              <span class="question-index">第 {{ currentQuestionIndex + 1 }} 题</span>
              <el-tag size="small" type="info">{{ currentQuestion.groupName }}</el-tag>
              <span class="question-points">（{{ currentQuestion.points }} 分）</span>
            </div>
            <div class="question-timer">
              <el-icon><Timer /></el-icon>
              <span>本题用时：{{ formatDuration(getCurrentQuestionDuration) }}</span>
            </div>
          </div>

          <!-- 题干 -->
          <div class="question-stem">
            <RichContent :content="currentQuestion.stem" />
          </div>

          <!-- 选项区域 -->
          <div class="question-options">
            <!-- 单选题 -->
            <template v-if="currentQuestion.questionType === 1 || currentQuestion.questionType === 3">
              <el-radio-group
                :model-value="currentAnswerRecord?.answer"
                @update:model-value="updateAnswer"
                class="options-group"
              >
                <el-radio
                  v-for="option in currentQuestion.options"
                  :key="option.key"
                  :value="option.key"
                  class="option-item"
                  :class="{ 'is-checked': currentAnswerRecord?.answer === option.key }"
                >
                  <span class="option-key">{{ option.key }}.</span>
                  <span class="option-content">
                    <RichContent :content="option.content" />
                  </span>
                </el-radio>
              </el-radio-group>
            </template>

            <!-- 多选题 -->
            <template v-else-if="currentQuestion.questionType === 2">
              <el-checkbox-group
                :model-value="currentAnswerRecord?.answer as string[]"
                @update:model-value="updateAnswer"
                class="options-group"
              >
                <el-checkbox
                  v-for="option in currentQuestion.options"
                  :key="option.key"
                  :value="option.key"
                  class="option-item"
                  :class="{ 'is-checked': (currentAnswerRecord?.answer as string[])?.includes(option.key) }"
                >
                  <span class="option-key">{{ option.key }}.</span>
                  <span class="option-content">
                    <RichContent :content="option.content" />
                  </span>
                </el-checkbox>
              </el-checkbox-group>
            </template>

            <!-- 填空题 -->
            <template v-else-if="currentQuestion.questionType === 4">
              <el-input
                :model-value="currentAnswerRecord?.answer as string"
                @update:model-value="updateAnswer"
                placeholder="请输入答案"
                class="fill-input"
              />
            </template>

            <!-- 简答题/论述题 -->
            <template v-else-if="currentQuestion.questionType === 5 || currentQuestion.questionType === 6">
              <el-input
                :model-value="currentAnswerRecord?.answer as string"
                @update:model-value="updateAnswer"
                type="textarea"
                :rows="8"
                placeholder="请输入答案"
                class="essay-input"
              />
            </template>
          </div>

          <!-- 底部导航 -->
          <div class="question-footer">
            <el-button
              :disabled="currentQuestionIndex === 0"
              @click="prevQuestion"
            >
              <el-icon><ArrowLeft /></el-icon>
              上一题
            </el-button>
            <el-button
              v-if="currentQuestionIndex < allQuestions.length - 1"
              type="primary"
              @click="nextQuestion"
            >
              下一题
              <el-icon><ArrowRight /></el-icon>
            </el-button>
            <el-button
              v-else
              type="success"
              :loading="submitting"
              @click="handleSubmit"
            >
              <el-icon><Check /></el-icon>
              交卷
            </el-button>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.exam-do-container {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;

  &.is-dark {
    background: #0f172a;

    .exam-header {
      background: rgba(30, 41, 59, 0.9);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .paper-title {
      color: #f1f5f9;
    }

    .question-nav {
      background: rgba(30, 41, 59, 0.8);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .question-content {
      background: rgba(30, 41, 59, 0.8);
    }

    .question-stem {
      color: #f1f5f9;
    }
  }
}

.exam-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    .paper-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .paper-info {
      font-size: 14px;
      color: #6b7280;
    }
  }

  .header-center {
    .timer {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: #f0f9ff;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      color: #0369a1;

      &.warning {
        background: #fef2f2;
        color: #dc2626;
        animation: pulse 1s infinite;
      }
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.exam-main {
  display: flex;
  flex: 1;
  padding: 20px;
  gap: 20px;
}

.question-nav {
  width: 200px;
  flex-shrink: 0;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .nav-header {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e5e7eb;
  }

  .nav-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 8px;
    margin-bottom: 16px;
  }

  .nav-item {
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 6px;
    font-size: 13px;
    cursor: pointer;
    background: #f5f7fa;
    border: 1px solid #e5e7eb;
    transition: all 0.2s;

    &:hover {
      border-color: #667eea;
    }

    &.active {
      background: #667eea;
      color: #fff;
      border-color: #667eea;
    }

    &.answered {
      background: #10b981;
      color: #fff;
      border-color: #10b981;
    }

    &.answered.active {
      background: #667eea;
      border-color: #667eea;
    }
  }

  .nav-legend {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;

    .legend-item {
      display: flex;
      align-items: center;
      gap: 8px;
      font-size: 12px;
      color: #6b7280;

      .dot {
        width: 12px;
        height: 12px;
        border-radius: 3px;
        background: #f5f7fa;
        border: 1px solid #e5e7eb;

        &.answered {
          background: #10b981;
          border-color: #10b981;
        }

        &.active {
          background: #667eea;
          border-color: #667eea;
        }
      }
    }
  }
}

.question-content {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid #e5e7eb;

    .question-info {
      display: flex;
      align-items: center;
      gap: 12px;

      .question-index {
        font-size: 16px;
        font-weight: 600;
      }

      .question-points {
        font-size: 14px;
        color: #6b7280;
      }
    }

    .question-timer {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;
      color: #6b7280;
      padding: 6px 12px;
      background: #f5f7fa;
      border-radius: 6px;
    }
  }

  .question-stem {
    font-size: 16px;
    line-height: 1.8;
    margin-bottom: 24px;
    color: #1f2937;
  }

  .question-options {
    margin-bottom: 24px;

    .options-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .option-item {
      display: flex;
      align-items: flex-start;
      padding: 0; // 移除默认内边距
      background: #fff;
      border-radius: 8px;
      border: 2px solid #e5e7eb;
      transition: all 0.2s;
      cursor: pointer;
      width: 100%; // 确保所有选项框宽度一致

      // 隐藏默认的 radio/checkbox 图标
      :deep(.el-radio__input),
      :deep(.el-checkbox__input) {
        display: none;
      }

      // 让 label 占满整个空间，垂直居中
      :deep(.el-radio__label),
      :deep(.el-checkbox__label) {
        padding: 12px 16px; // 将内边距移到 label 上
        margin: 0; // 移除默认边距
        display: flex;
        align-items: flex-start; // 恢复为顶部对齐
        width: 100%;
        text-align: left; // 强制左对齐
      }

      &:hover {
        border-color: #667eea;
        background: #f8f9ff;
      }

      // 选中状态
      &.is-checked {
        background: #e0e7ff;
        border-color: #667eea;

        .option-key {
          color: #667eea;
        }
      }

      .option-key {
        font-weight: 600;
        margin-right: 8px;
        flex-shrink: 0;
        width: 20px; // 使用固定宽度而不是 min-width，确保所有选项标识宽度完全一致
        text-align: left;
      }

      .option-content {
        flex: 1;
        text-align: left; // 内容左对齐
        word-break: break-word; // 长文本自动换行
      }
    }

    .fill-input {
      max-width: 400px;
    }

    .essay-input {
      width: 100%;
    }
  }

  .question-footer {
    display: flex;
    justify-content: center;
    gap: 16px;
    padding-top: 20px;
    border-top: 1px solid #e5e7eb;
  }
}
</style>

