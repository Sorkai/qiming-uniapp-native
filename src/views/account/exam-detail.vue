<template>
  <div class="exam-detail-container" :class="currentTheme">
    <!-- 头部 -->
    <div class="header" :class="currentTheme">
      <div class="header-content">
        <div class="back-btn" @click="confirmExit">
          <el-icon><ArrowLeft /></el-icon> 返回
        </div>
        <div class="title">考试</div>
        <div v-if="examStarted && !examCompleted" class="timer">
          剩余时间: {{ formatRemainingTime }}
        </div>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="main-content" :class="currentTheme">
      <el-card v-loading="loading">
        <template #header>
          <div class="card-header">
            <h3>{{ exam.title }}</h3>
            <div class="meta-info">
              <span>总题数：{{ exam.questionNum }} 题</span>
              <span>总分值：{{ exam.totalPoints }} 分</span>
              <span>时间限制：{{ exam.timeLimit }} 分钟</span>
              <span v-if="examStatus === 3" class="exam-status completed"
                >已完成</span
              >
              <span v-else-if="examStatus === 4" class="exam-status expired"
                >已过期</span
              >
              <span v-else-if="examStatus === 1" class="exam-status not-started"
                >未开始</span
              >
              <span v-else-if="examStatus === 2" class="exam-status in-progress"
                >进行中</span
              >
            </div>
          </div>
        </template>

        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="10" animated />
        </div>

        <div v-else class="questions-container">
          <!-- 考试描述 -->
          <div v-if="exam.description" class="description">
            <div class="label">考试说明：</div>
            <div class="content">{{ exam.description }}</div>
          </div>

          <!-- 问题列表 -->
          <div
            v-if="exam.questionList && exam.questionList.length > 0"
            class="questions-list"
          >
            <div
              v-for="(question, index) in exam.questionList"
              :key="question.questionId"
              class="question-item"
              :class="{ dark: currentTheme === 'dark' }"
            >
              <div class="question-header">
                <div class="question-title">
                  <span class="question-number">{{ index + 1 }}.</span>
                  <span>{{ question.title }}</span>
                  <span class="question-type">{{
                    getQuestionType(question.questionType)
                  }}</span>
                  <span class="question-score">{{ question.points }} 分</span>
                </div>
              </div>

              <div class="question-content" v-html="question.stem" />

              <!-- 选项 - 单选题 -->
              <div v-if="question.questionType === 1" class="options">
                <el-radio-group
                  v-model="answers[question.questionId]"
                  :disabled="!examStarted || examCompleted"
                >
                  <el-radio
                    v-for="option in parseOptions(question.options)"
                    :key="option.optionId"
                    :label="option.optionId"
                    :disabled="!examStarted || examCompleted"
                  >
                    {{ option.optionId }}. {{ option.content }}
                  </el-radio>
                </el-radio-group>
              </div>

              <!-- 选项 - 多选题 -->
              <div v-else-if="question.questionType === 2" class="options">
                <el-checkbox-group
                  v-model="answers[question.questionId]"
                  :disabled="!examStarted || examCompleted"
                >
                  <el-checkbox
                    v-for="option in parseOptions(question.options)"
                    :key="option.optionId"
                    :label="option.optionId"
                    :disabled="!examStarted || examCompleted"
                  >
                    {{ option.optionId }}. {{ option.content }}
                  </el-checkbox>
                </el-checkbox-group>
              </div>

              <!-- 判断题 -->
              <div v-else-if="question.questionType === 3" class="options">
                <el-radio-group
                  v-model="answers[question.questionId]"
                  :disabled="!examStarted || examCompleted"
                >
                  <el-radio label="1" :disabled="!examStarted || examCompleted"
                    >正确</el-radio
                  >
                  <el-radio label="0" :disabled="!examStarted || examCompleted"
                    >错误</el-radio
                  >
                </el-radio-group>
              </div>

              <!-- 填空题 -->
              <div v-else-if="question.questionType === 4" class="options">
                <el-input
                  v-model="answers[question.questionId]"
                  type="text"
                  placeholder="请输入答案"
                  :disabled="!examStarted || examCompleted"
                />
              </div>

              <!-- 简答题 -->
              <div v-else-if="question.questionType === 5" class="options">
                <el-input
                  v-model="answers[question.questionId]"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入答案"
                  :disabled="!examStarted || examCompleted"
                />
              </div>

              <!-- 代码题 -->
              <div v-else-if="question.questionType === 6" class="options">
                <el-input
                  v-model="answers[question.questionId]"
                  type="textarea"
                  :rows="6"
                  placeholder="请输入代码答案"
                  :disabled="!examStarted || examCompleted"
                />
              </div>
            </div>
          </div>

          <!-- 开始考试按钮 -->
          <div
            v-if="examStatus === 2 && !examStarted && !examCompleted"
            class="start-exam-btn"
          >
            <el-button type="primary" size="large" @click="startExam"
              >开始考试</el-button
            >
            <p>
              考试说明：请在点击"开始考试"按钮后开始答题，考试计时将从点击开始后计算。
            </p>
          </div>

          <!-- 考试未开始或已过期提示 -->
          <div v-else-if="examStatus === 1" class="exam-notice">
            <el-alert
              title="考试尚未开始"
              type="info"
              :closable="false"
              description="请在考试开始时间后参加考试"
              show-icon
            />
          </div>
          <div v-else-if="examStatus === 4" class="exam-notice">
            <el-alert
              title="考试已结束"
              type="warning"
              :closable="false"
              description="考试已过期，无法参加"
              show-icon
            />
          </div>

          <!-- 已完成考试结果 -->
          <div v-if="examCompleted || examStatus === 3" class="exam-result">
            <el-result
              icon="success"
              title="考试已完成"
              :sub-title="`您的得分：${submissionResult ? submissionResult.score : '—'}/${submissionResult ? submissionResult.totalScore : '—'}`"
            >
              <template #extra>
                <el-button type="primary" @click="goBack">返回课程</el-button>
              </template>
            </el-result>
          </div>
        </div>

        <el-empty
          v-if="
            !loading &&
            (!exam || !exam.questionList || exam.questionList.length === 0)
          "
          description="未找到考试或考试已过期"
        />
      </el-card>
    </div>

    <!-- 底部操作栏 -->
    <div
      v-if="examStarted && !examCompleted"
      class="footer-actions"
      :class="currentTheme"
    >
      <el-button
        type="primary"
        size="large"
        @click="submitExam"
        :loading="submitting"
      >
        提交考试
      </el-button>
    </div>

    <!-- 提交结果弹窗 -->
    <el-dialog
      v-model="showResultDialog"
      :title="resultDialogTitle"
      width="400px"
    >
      <div class="result-content">
        <div v-if="submissionResult" class="score-info">
          <div class="score">{{ submissionResult.score }}</div>
          <div class="total-score">/ {{ submissionResult.totalScore }}</div>
        </div>
        <div class="result-message">{{ resultDialogMessage }}</div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="goBack">返回课程</el-button>
          <el-button type="primary" @click="showResultDialog = false"
            >确定</el-button
          >
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { ArrowLeft } from "@element-plus/icons-vue";
import dayjs from "dayjs";
import {
  getExamDetail,
  submitExamAnswers,
  type ExamDetailResult,
  type ExamAnswerResult
} from "@/api/frontend/work";

const route = useRoute();
const router = useRouter();
const currentTheme = ref((route.query.theme as string) || "light");

// 考试相关数据
const loading = ref(true);
const submitting = ref(false);
const exam = ref<ExamDetailResult>({} as ExamDetailResult);
const answers = reactive<Record<number, string | string[]>>({});
const examStarted = ref(false);
const examCompleted = ref(false);
const remainingTime = ref(0);
const examTimer = ref<number | null>(null);
const examStatus = ref(0); // 考试状态：1-未开始，2-进行中，3-已完成，4-已过期

// 提交结果相关
const showResultDialog = ref(false);
const resultDialogTitle = ref("考试提交结果");
const resultDialogMessage = ref("");
const submissionResult = ref<ExamAnswerResult | null>(null);

// 解析选项
const parseOptions = (optionsStr: string | null) => {
  if (!optionsStr || optionsStr === "null") return [];
  try {
    const options = JSON.parse(optionsStr);
    if (Array.isArray(options)) {
      return options.map((opt, index) => ({
        optionId: String.fromCharCode(65 + index),
        content: opt
      }));
    }
    return [];
  } catch (e) {
    console.error("解析选项出错", e);
    return [];
  }
};

// 格式化剩余时间
const formatRemainingTime = computed(() => {
  const minutes = Math.floor(remainingTime.value / 60);
  const seconds = remainingTime.value % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
});

// 获取考试详情
const fetchExamDetail = async () => {
  try {
    loading.value = true;
    const examId = Number(route.query.examId);
    const courseId = Number(route.query.courseId);

    if (!examId || !courseId) {
      ElMessage.error("参数错误");
      router.back();
      return;
    }

    const response = await getExamDetail({
      examId,
      courseId
    });

    if (response.code === 200 && response.data) {
      exam.value = response.data;

      // 设置考试状态
      const now = dayjs();
      const startTime = dayjs(response.data.availableFrom);
      const endTime = dayjs(response.data.availableTo);

      if (response.data.finished === 1) {
        examStatus.value = 3; // 已完成
        examCompleted.value = true;
        submissionResult.value = {
          score: response.data.score || 0,
          totalScore: exam.value.totalPoints
        };
      } else if (now.isAfter(endTime)) {
        examStatus.value = 4; // 已过期
      } else if (now.isBefore(startTime)) {
        examStatus.value = 1; // 未开始
      } else {
        examStatus.value = 2; // 进行中
      }

      console.log("处理后的考试数据:", exam.value);
      console.log("计算出的考试状态:", examStatus.value);
    } else {
      ElMessage.error(response.msg || "获取考试详情失败");
    }
  } catch (error) {
    console.error("获取考试详情失败", error);
    ElMessage.error("获取考试详情失败");
  } finally {
    loading.value = false;
  }
};

// 开始考试
const startExam = () => {
  ElMessageBox.confirm("确认开始考试？开始后计时不可暂停。", "开始考试", {
    confirmButtonText: "确认开始",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      examStarted.value = true;
      remainingTime.value = exam.value.timeLimit * 60; // 转换为秒
      startTimer();
    })
    .catch(() => {});
};

// 开始计时器
const startTimer = () => {
  if (examTimer.value) clearInterval(examTimer.value);

  examTimer.value = window.setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value -= 1;
    } else {
      // 时间到，自动提交
      clearInterval(examTimer.value!);
      ElMessage.warning("考试时间已到，系统将自动提交答案");
      submitExam();
    }
  }, 1000);
};

// 提交考试
const submitExam = async () => {
  try {
    // 确认提交
    await ElMessageBox.confirm("确认提交考试吗？提交后将不可修改", "提交确认", {
      confirmButtonText: "确认提交",
      cancelButtonText: "取消",
      type: "warning"
    });

    submitting.value = true;

    // 处理答案格式
    const formattedAnswers = [];
    for (const questionId in answers) {
      const answer = answers[questionId];
      let formattedAnswer = "";

      // 如果是代码题，添加语言信息
      if (
        exam.value.questionList.find(q => q.questionId === Number(questionId))
          ?.questionType === 6
      ) {
        formattedAnswer = Array.isArray(answer)
          ? answer.join("")
          : answer?.toString() || "";
      } else {
        // 如果是多选题，需要将数组转换为字符串
        formattedAnswer = Array.isArray(answer)
          ? answer.join(",")
          : answer?.toString() || "";
      }

      formattedAnswers.push({
        questionId: Number(questionId),
        answer: formattedAnswer
      });
    }

    const examId = Number(route.query.examId);
    const courseId = Number(route.query.courseId);

    try {
      const response = await submitExamAnswers({
        examId,
        courseId,
        answers: formattedAnswers
      });

      if (response.code === 0 || response.code === 200) {
        if (examTimer.value) clearInterval(examTimer.value);

        submissionResult.value = {
          score: response.data.score,
          totalScore: exam.value.totalPoints
        };
        resultDialogTitle.value = "考试提交成功";
        resultDialogMessage.value = `您的得分为 ${response.data.score}/${exam.value.totalPoints}`;
        showResultDialog.value = true;
        examCompleted.value = true;
      } else {
        ElMessage.error(response.msg || "提交考试失败");
      }
    } catch (error: any) {
      // 捕获网络请求错误
      if (error.response && error.response.data && error.response.data.msg) {
        // 直接使用后端返回的错误信息
        ElMessage.error(error.response.data.msg);
      } else {
        ElMessage.error("提交考试失败");
      }
    }
  } catch (error: any) {
    if (error === "cancel") return;
    console.error("提交考试失败", error);
    ElMessage.error("操作取消");
  } finally {
    submitting.value = false;
  }
};

// 确认退出
const confirmExit = () => {
  if (examStarted.value && !examCompleted.value) {
    ElMessageBox.confirm(
      "考试尚未完成，确定要退出吗？退出后答案将不会保存",
      "退出确认",
      {
        confirmButtonText: "确认退出",
        cancelButtonText: "取消",
        type: "warning"
      }
    )
      .then(() => {
        if (examTimer.value) clearInterval(examTimer.value);
        goBack();
      })
      .catch(() => {});
  } else {
    goBack();
  }
};

// 获取题目类型文本
const getQuestionType = (type: number): string => {
  const typeMap = {
    1: "单选题",
    2: "多选题",
    3: "判断题",
    4: "填空题",
    5: "简答题",
    6: "代码题"
  };
  return typeMap[type] || "未知题型";
};

// 格式化日期
const formatDate = (dateStr: string): string => {
  if (!dateStr) return "-";
  return dayjs(dateStr).format("YYYY-MM-DD HH:mm:ss");
};

// 返回上一页
const goBack = () => {
  router.back();
};

onMounted(() => {
  fetchExamDetail();
  if (currentTheme.value === "dark") {
    document.documentElement.classList.add("dark");
    document.body.classList.add("dark");
  }

  // 添加页面关闭确认
  window.addEventListener("beforeunload", function (e) {
    if (examStarted.value && !examCompleted.value) {
      e.preventDefault();
      e.returnValue = "考试尚未完成，确定要离开吗？";
    }
  });
});

onBeforeUnmount(() => {
  // 清除计时器
  if (examTimer.value) clearInterval(examTimer.value);

  // 移除页面关闭确认
  window.removeEventListener("beforeunload", function (e) {
    if (examStarted.value && !examCompleted.value) {
      e.preventDefault();
      e.returnValue = "考试尚未完成，确定要离开吗？";
    }
  });
});
</script>

<style lang="scss" scoped>
.exam-detail-container {
  min-height: 100vh;
  padding: 70px 0 30px;
  background-color: #f5f7fa;
  transition: background-color 0.3s;

  &.dark {
    background-color: #1a1a1a !important;
    color: #e0e0e0 !important;
  }

  .header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    transition: background-color 0.3s;

    &.dark {
      background-color: #252525;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 0 20px;
      max-width: 1200px;
      margin: 0 auto;

      .back-btn {
        display: flex;
        align-items: center;
        cursor: pointer;
        font-size: 14px;
        min-width: 60px;

        .el-icon {
          margin-right: 5px;
        }
      }

      .title {
        font-size: 18px;
        font-weight: bold;
        flex: 1;
        text-align: center;
      }

      .timer {
        font-size: 16px;
        font-weight: bold;
        color: #f56c6c;
        min-width: 100px;
        text-align: right;
      }
    }
  }

  .main-content {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 20px;

    &.dark {
      :deep(.el-card) {
        background-color: #252525 !important;
        color: #e0e0e0 !important;
        border: 1px solid #333 !important;
      }
      :deep(.el-card__header) {
        border-bottom: 1px solid #333 !important;
      }
    }

    .card-header {
      h3 {
        margin: 0;
        margin-bottom: 10px;
        text-align: center;
      }

      .meta-info {
        display: flex;
        flex-wrap: wrap;
        gap: 15px;
        font-size: 14px;
        color: #666;
        justify-content: center;
        margin-bottom: 20px;

        .dark & {
          color: #aaa;
        }

        .exam-status {
          font-weight: bold;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
        }

        .completed {
          color: #67c23a;
          background-color: #f0f9eb;
          border: 1px solid #e1f3d8;

          .dark & {
            background-color: rgba(103, 194, 58, 0.2);
            border-color: rgba(103, 194, 58, 0.3);
          }
        }

        .expired {
          color: #f56c6c;
          background-color: #fef0f0;
          border: 1px solid #fde2e2;

          .dark & {
            background-color: rgba(245, 108, 108, 0.2);
            border-color: rgba(245, 108, 108, 0.3);
          }
        }

        .not-started {
          color: #909399;
          background-color: #f4f4f5;
          border: 1px solid #e9e9eb;

          .dark & {
            background-color: rgba(144, 147, 153, 0.2);
            border-color: rgba(144, 147, 153, 0.3);
          }
        }

        .in-progress {
          color: #e6a23c;
          background-color: #fdf6ec;
          border: 1px solid #faecd8;

          .dark & {
            background-color: rgba(230, 162, 60, 0.2);
            border-color: rgba(230, 162, 60, 0.3);
          }
        }
      }
    }

    .loading-container {
      padding: 20px;
    }

    .questions-container {
      .description {
        margin-bottom: 20px;
        padding: 15px;
        background-color: #f8f9fa;
        border-radius: 4px;

        .label {
          font-weight: bold;
          margin-bottom: 10px;
        }

        .content {
          white-space: pre-wrap;
        }

        .dark & {
          background-color: #333;
          color: #e0e0e0;
        }
      }

      .questions-list {
        .question-item {
          margin-bottom: 30px;
          padding: 20px;
          border-radius: 6px;
          background-color: #fff;
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);

          &.dark {
            background-color: #333;
            box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.15);
            color: #e0e0e0;
          }

          .question-header {
            margin-bottom: 15px;

            .question-title {
              display: flex;
              align-items: center;
              font-size: 16px;
              font-weight: bold;

              .question-number {
                margin-right: 8px;
              }

              .question-type,
              .question-score {
                margin-left: 10px;
                font-size: 14px;
                color: #606266;
                font-weight: normal;

                .dark & {
                  color: #aaa;
                }
              }
            }
          }

          .question-content {
            margin-bottom: 15px;
            line-height: 1.6;

            .dark & {
              :deep(*) {
                color: #e0e0e0 !important;
              }
            }
          }

          .options {
            margin-top: 15px;
          }
        }
      }

      .start-exam-btn {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin: 30px 0;

        p {
          margin-top: 10px;
          color: #909399;
          font-size: 14px;
          text-align: center;
          max-width: 400px;
        }
      }

      .exam-notice {
        margin: 30px 0;
      }

      .exam-result {
        margin: 30px 0;
      }
    }
  }
}

.result-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;

  .score-info {
    display: flex;
    align-items: baseline;
    margin-bottom: 20px;

    .score {
      font-size: 36px;
      font-weight: bold;
      color: #409eff;
    }

    .total-score {
      font-size: 18px;
      color: #606266;
      margin-left: 5px;
    }
  }

  .result-message {
    font-size: 16px;
    text-align: center;
  }
}

.footer-actions {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 60px;
  background-color: #fff;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0 20px;
  transition: background-color 0.3s;

  &.dark {
    background-color: #252525;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.3);
  }
}
</style>
