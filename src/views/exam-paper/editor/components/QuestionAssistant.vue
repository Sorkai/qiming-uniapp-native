<script setup lang="ts">
import { ref, reactive, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  searchQuestionBank,
  aiGenerateQuestion,
  type QuestionBankItem
} from "@/api/examPaper";

const props = defineProps<{
  visible: boolean;
  currentQuestion?: any;
  questionType?: string;
  knowledgePoints?: string;
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "apply", data: any): void;
}>();

const activeTab = ref("questionBank");
const searchKeyword = ref("");
const knowledgeInput = ref("");

const aiSettings = reactive({
  difficulty: "medium",
  questionType: "radio",
  count: 1,
  includeAnalysis: true,
  polishMode: false
});

const questionBankList = ref<QuestionBankItem[]>([]);
const questionBankLoading = ref(false);

const fetchQuestions = async () => {
  questionBankLoading.value = true;
  try {
    const res = await searchQuestionBank({
      keyword: searchKeyword.value,
      type: props.questionType,
      pageNum: 1,
      pageSize: 50
    });
    if (res.code === 0) {
      questionBankList.value = res.data.list;
    }
  } finally {
    questionBankLoading.value = false;
  }
};

const selectedQuestions = ref<number[]>([]);
const aiGenerating = ref(false);
const aiGeneratedQuestions = ref<any[]>([]);

const difficultyOptions = [
  { value: "easy", label: "简单" },
  { value: "medium", label: "中等" },
  { value: "hard", label: "困难" }
];

const questionTypeOptions = [
  { value: "radio", label: "单选题" },
  { value: "checkbox", label: "多选题" },
  { value: "judge", label: "判断题" },
  { value: "input", label: "填空题" },
  { value: "textarea", label: "简答题" }
];

watch(
  () => props.visible,
  val => {
    if (val) {
      selectedQuestions.value = [];
      aiGeneratedQuestions.value = [];
      aiSettings.polishMode = false;
      fetchQuestions(); // 加载题库

      if (props.currentQuestion?.stem) {
        knowledgeInput.value = props.currentQuestion.stem;
        aiSettings.polishMode = true;
      }
      if (props.knowledgePoints) {
        knowledgeInput.value = props.knowledgePoints;
      }
      if (props.questionType) {
        aiSettings.questionType = props.questionType;
      }
    }
  }
);

watch(searchKeyword, () => {
  fetchQuestions();
});

const getTypeName = (type: string) => {
  const types: Record<string, string> = {
    radio: "单选题",
    checkbox: "多选题",
    judge: "判断题",
    input: "填空题",
    textarea: "简答题"
  };
  return types[type] || "未知";
};

const getDifficultyName = (difficulty: string) => {
  const d: Record<string, string> = {
    easy: "简单",
    medium: "中等",
    hard: "困难"
  };
  return d[difficulty] || "未知";
};

const getDifficultyType = (difficulty: string) => {
  const types: Record<string, "success" | "warning" | "danger" | "info"> = {
    easy: "success",
    medium: "warning",
    hard: "danger"
  };
  return types[difficulty] || "info";
};

const toggleSelectQuestion = (id: number) => {
  const index = selectedQuestions.value.indexOf(id);
  if (index === -1) {
    selectedQuestions.value.push(id);
  } else {
    selectedQuestions.value.splice(index, 1);
  }
};

const applySelectedQuestions = () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning("请先选择题目");
    return;
  }
  const questions = questionBankList.value.filter(q =>
    selectedQuestions.value.includes(q.id)
  );
  emit("apply", { type: "questionBank", questions });
  emit("update:visible", false);
};

const generateWithAI = async () => {
  if (!knowledgeInput.value.trim()) {
    ElMessage.warning("请输入知识点或题目内容");
    return;
  }
  aiGenerating.value = true;
  aiGeneratedQuestions.value = [];
  try {
    const res = await aiGenerateQuestion({
      knowledgePoints: knowledgeInput.value,
      questionType: aiSettings.questionType,
      difficulty: aiSettings.difficulty,
      count: aiSettings.count,
      includeAnalysis: aiSettings.includeAnalysis,
      polishMode: aiSettings.polishMode,
      originalContent: aiSettings.polishMode ? knowledgeInput.value : undefined
    });

    if (res.code === 0) {
      aiGeneratedQuestions.value = res.data;
      ElMessage.success(`成功生成 ${res.data.length} 道题目`);
    }
  } catch {
    ElMessage.error("AI 生成失败,请重试");
  } finally {
    aiGenerating.value = false;
  }
};

const applyAIQuestion = (question: any) => {
  emit("apply", { type: "ai", questions: [question] });
  emit("update:visible", false);
};

const handleClose = () => {
  emit("update:visible", false);
};

const addOptionToGenerated = (question: any) => {
  const keys = ["A", "B", "C", "D", "E", "F", "G", "H"];
  const nextKey =
    keys[question.options.length] ||
    String.fromCharCode(65 + question.options.length);
  question.options.push({ key: nextKey, content: "" });
};

const removeOptionFromGenerated = (question: any, index: number) => {
  if (question.options.length > 2) {
    question.options.splice(index, 1);
  }
};

const addBlankToGenerated = (question: any) => {
  if (!question.blanks) question.blanks = [];
  question.blanks.push({ answer: "" });
};

const removeBlankFromGenerated = (question: any, index: number) => {
  if (question.blanks.length > 1) {
    question.blanks.splice(index, 1);
  }
};

const applyAllAIQuestions = () => {
  if (aiGeneratedQuestions.value.length === 0) return;
  emit("apply", { type: "ai", questions: aiGeneratedQuestions.value });
  emit("update:visible", false);
};
</script>

<template>
  <el-dialog
    :model-value="visible"
    width="900px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <template #header>
      <div class="dialog-header">
        <span class="dialog-title">
          <el-icon><MagicStick /></el-icon>
          题目助手
        </span>
        <span class="dialog-hint">
          <el-icon><InfoFilled /></el-icon>
          双击 Ctrl/Command 键可快速唤起
        </span>
      </div>
    </template>

    <el-tabs v-model="activeTab">
      <!-- 题库选题 Tab -->
      <el-tab-pane label="题库选题" name="questionBank">
        <div class="tab-content">
          <div class="search-bar">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索题目或知识点..."
              clearable
              prefix-icon="Search"
            />
          </div>

          <div v-loading="questionBankLoading" class="question-list">
            <div
              v-for="question in questionBankList"
              :key="question.id"
              class="question-item"
              :class="{ selected: selectedQuestions.includes(question.id) }"
              @click="toggleSelectQuestion(question.id)"
            >
              <el-checkbox
                :model-value="selectedQuestions.includes(question.id)"
              />
              <div class="question-content">
                <div class="question-meta">
                  <el-tag size="small" effect="light">{{
                    getTypeName(question.type)
                  }}</el-tag>
                  <el-tag
                    size="small"
                    :type="getDifficultyType(question.difficulty)"
                    effect="light"
                    >{{ getDifficultyName(question.difficulty) }}</el-tag
                  >
                  <span class="question-points"
                    >{{ question.points || 5 }}分</span
                  >
                </div>
                <div class="question-stem-text">{{ question.stem }}</div>
                <div v-if="question.options" class="question-options-preview">
                  <span
                    v-for="opt in question.options"
                    :key="opt.key"
                    class="option-preview"
                  >
                    {{ opt.key }}. {{ opt.content }}
                  </span>
                </div>
                <div v-if="question.knowledgePoints" class="question-knowledge">
                  <el-tag
                    v-for="kp in question.knowledgePoints"
                    :key="kp"
                    size="small"
                    type="info"
                    effect="plain"
                    class="kp-tag"
                  >
                    {{ kp }}
                  </el-tag>
                </div>
              </div>
            </div>

            <div
              v-if="questionBankList.length === 0 && !questionBankLoading"
              class="empty-list"
            >
              <el-empty description="没有找到匹配的题目" :image-size="80" />
            </div>
          </div>

          <div class="action-bar">
            <span class="selected-count"
              >已选择 {{ selectedQuestions.length }} 道题目</span
            >
            <el-button type="primary" @click="applySelectedQuestions"
              >应用选中题目</el-button
            >
          </div>
        </div>
      </el-tab-pane>

      <!-- AI 出题 Tab -->
      <el-tab-pane label="AI 出题 / 润色" name="aiGenerate">
        <div class="tab-content">
          <!-- 润色模式提示 -->
          <div v-if="aiSettings.polishMode" class="polish-hint">
            <el-alert title="润色模式" type="info" :closable="false" show-icon>
              <template #default>
                <span
                  >已检测到当前题目内容，AI
                  将基于已有内容进行润色和优化出题。</span
                >
              </template>
            </el-alert>
          </div>

          <el-form label-width="80px">
            <el-form-item label="知识点">
              <el-input
                v-model="knowledgeInput"
                type="textarea"
                :rows="3"
                placeholder="请输入知识点、题目内容或关键词，AI 将根据这些信息生成题目..."
              />
            </el-form-item>
            <el-form-item label="题型">
              <el-select v-model="aiSettings.questionType" style="width: 100%">
                <el-option
                  v-for="opt in questionTypeOptions"
                  :key="opt.value"
                  :label="opt.label"
                  :value="opt.value"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="难度">
              <el-radio-group v-model="aiSettings.difficulty">
                <el-radio-button
                  v-for="opt in difficultyOptions"
                  :key="opt.value"
                  :value="opt.value"
                >
                  {{ opt.label }}
                </el-radio-button>
              </el-radio-group>
            </el-form-item>
            <el-form-item label="生成数量">
              <el-input-number v-model="aiSettings.count" :min="1" :max="10" />
            </el-form-item>
            <el-form-item label="包含解析">
              <el-switch v-model="aiSettings.includeAnalysis" />
            </el-form-item>
          </el-form>

          <div class="ai-actions">
            <el-button
              type="primary"
              :loading="aiGenerating"
              @click="generateWithAI"
            >
              <el-icon><MagicStick /></el-icon>
              {{ aiSettings.polishMode ? "AI 润色出题" : "AI 生成题目" }}
            </el-button>
          </div>

          <!-- AI 生成结果 -->
          <div v-if="aiGeneratedQuestions.length > 0" class="ai-results">
            <div class="results-header">
              <span class="results-title"
                >生成结果（{{ aiGeneratedQuestions.length }} 道题目）</span
              >
              <el-button
                type="primary"
                size="small"
                @click="applyAllAIQuestions"
                >全部应用</el-button
              >
            </div>

            <div
              v-for="(question, index) in aiGeneratedQuestions"
              :key="question.id"
              class="generated-question"
            >
              <div class="question-header">
                <div class="question-header-left">
                  <span class="question-number">第 {{ index + 1 }} 题</span>
                  <el-tag size="small" effect="light">{{
                    getTypeName(question.type)
                  }}</el-tag>
                  <el-tag
                    size="small"
                    :type="getDifficultyType(question.difficulty)"
                    effect="light"
                    >{{ getDifficultyName(question.difficulty) }}</el-tag
                  >
                </div>
                <el-button
                  type="primary"
                  size="small"
                  @click="applyAIQuestion(question)"
                  >应用此题</el-button
                >
              </div>

              <!-- 题干编辑 -->
              <div class="question-field">
                <label class="field-label">题干</label>
                <el-input
                  v-model="question.stem"
                  type="textarea"
                  :rows="2"
                  placeholder="编辑题干内容"
                />
              </div>

              <!-- 选项编辑（单选/多选） -->
              <div
                v-if="
                  question.options &&
                  (question.type === 'radio' ||
                    question.type === 'checkbox' ||
                    question.type === 'judge')
                "
                class="question-field"
              >
                <div class="field-label-row">
                  <label class="field-label">选项</label>
                  <el-button
                    v-if="question.type !== 'judge'"
                    link
                    type="primary"
                    size="small"
                    @click="addOptionToGenerated(question)"
                  >
                    <el-icon><Plus /></el-icon>
                    添加选项
                  </el-button>
                </div>
                <div
                  v-for="(opt, optIdx) in question.options"
                  :key="opt.key"
                  class="option-edit-item"
                >
                  <div class="option-correct-mark">
                    <el-radio
                      v-if="
                        question.type === 'radio' || question.type === 'judge'
                      "
                      v-model="question.correctAnswer"
                      :value="opt.key"
                    />
                    <el-checkbox
                      v-else-if="question.type === 'checkbox'"
                      v-model="question.correctAnswers"
                      :value="opt.key"
                    />
                  </div>
                  <span class="option-key-label">{{ opt.key }}.</span>
                  <el-input
                    v-model="opt.content"
                    :placeholder="`选项 ${opt.key} 内容`"
                    :disabled="question.type === 'judge'"
                    class="option-edit-input"
                  />
                  <el-button
                    v-if="question.type !== 'judge'"
                    link
                    type="danger"
                    size="small"
                    @click="removeOptionFromGenerated(question, optIdx)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
                <div class="correct-hint">
                  <el-icon><InfoFilled /></el-icon>
                  <span
                    v-if="
                      question.type === 'radio' || question.type === 'judge'
                    "
                  >
                    点击选项前的圆圈设置正确答案
                  </span>
                  <span v-else> 点击选项前的复选框设置正确答案（可多选） </span>
                </div>
              </div>

              <!-- 填空题答案编辑 -->
              <div
                v-if="question.type === 'input' && question.blanks"
                class="question-field"
              >
                <div class="field-label-row">
                  <label class="field-label">填空答案</label>
                  <el-button
                    link
                    type="primary"
                    size="small"
                    @click="addBlankToGenerated(question)"
                  >
                    <el-icon><Plus /></el-icon>
                    添加填空
                  </el-button>
                </div>
                <div
                  v-for="(blank, blankIdx) in question.blanks"
                  :key="blankIdx"
                  class="blank-edit-item"
                >
                  <span class="blank-label">第 {{ blankIdx + 1 }} 空：</span>
                  <el-input
                    v-model="blank.answer"
                    placeholder="正确答案"
                    class="blank-edit-input"
                  />
                  <el-button
                    link
                    type="danger"
                    size="small"
                    @click="removeBlankFromGenerated(question, blankIdx)"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </div>

              <!-- 简答题参考答案编辑 -->
              <div v-if="question.type === 'textarea'" class="question-field">
                <label class="field-label">参考答案</label>
                <el-input
                  v-model="question.referenceAnswer"
                  type="textarea"
                  :rows="3"
                  placeholder="编辑参考答案"
                />
              </div>

              <!-- 解析编辑 -->
              <div v-if="question.analysis" class="question-field">
                <label class="field-label">解析</label>
                <el-input
                  v-model="question.analysis"
                  type="textarea"
                  :rows="2"
                  placeholder="编辑题目解析"
                />
              </div>
            </div>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-dialog>
</template>

<style lang="scss" scoped>
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .dialog-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
  }

  .dialog-hint {
    display: flex;
    align-items: center;
    gap: 4px;
    font-size: 12px;
    color: #909399;
    background: #f0f9eb;
    padding: 4px 12px;
    border-radius: 12px;
  }
}

.tab-content {
  padding: 16px 0;
}

.search-bar {
  margin-bottom: 16px;
}

.question-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: 16px;
}

.question-item {
  display: flex;
  gap: 12px;
  padding: 14px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #00bfa5;
    background: rgba(0, 191, 165, 0.02);
  }

  &.selected {
    background: rgba(0, 191, 165, 0.05);
    border-color: #00bfa5;
  }

  .question-content {
    flex: 1;
  }
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;

  .question-points {
    margin-left: auto;
    font-size: 13px;
    color: #909399;
  }
}

.question-stem-text {
  font-size: 14px;
  line-height: 1.6;
  color: #303133;
  margin-bottom: 12px;
}

.question-options-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 12px;

  .option-preview {
    font-size: 13px;
    color: #606266;
  }
}

.question-knowledge {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  .kp-tag {
    border-radius: 4px;
  }
}

.empty-list {
  padding: 40px 0;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 16px;
  border-top: 1px solid #e4e7ed;

  .selected-count {
    font-size: 14px;
    color: #606266;
  }
}

.polish-hint {
  margin-bottom: 16px;
}

.ai-actions {
  text-align: center;
  padding: 20px 0;
  border-bottom: 1px dashed #e4e7ed;
  margin-bottom: 24px;
}

.ai-results {
  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;

    .results-title {
      font-weight: 600;
      color: #303133;
    }
  }
}

.generated-question {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 16px;
  background: #fcfcfc;

  .question-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #f0f0f0;

    .question-header-left {
      display: flex;
      align-items: center;
      gap: 8px;

      .question-number {
        font-weight: 600;
        color: #00bfa5;
        margin-right: 4px;
      }
    }
  }

  .question-field {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .field-label {
      display: block;
      font-size: 13px;
      font-weight: 600;
      color: #606266;
      margin-bottom: 8px;
    }

    .field-label-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 8px;

      .field-label {
        margin-bottom: 0;
      }
    }
  }

  .option-edit-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .option-correct-mark {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
    }

    .option-key-label {
      font-weight: 600;
      color: #909399;
      width: 20px;
    }

    .option-edit-input {
      flex: 1;
    }
  }

  .correct-hint {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 8px;
    font-size: 12px;
    color: #909399;
  }

  .blank-edit-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 8px;

    .blank-label {
      font-size: 13px;
      color: #606266;
      width: 70px;
    }

    .blank-edit-input {
      flex: 1;
    }
  }
}
</style>
