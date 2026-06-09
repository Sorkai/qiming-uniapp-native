<template>
  <el-dialog
    v-model="visible"
    :title="wrongQuestion?.sourceName || '错题详情'"
    width="60%"
    :before-close="handleClose"
    class="custom-wrong-detail-dialog"
  >
    <div class="wrong-question-detail">
      <h3 class="question-title">{{ wrongQuestion?.title }}</h3>
      <div class="question-stem" v-html="wrongQuestion?.stem" />

      <div v-if="isChoiceQuestion" class="question-options">
        <h4>选项:</h4>
        <ul>
          <li
            v-for="(option, idx) in parsedOptions"
            :key="idx"
            :class="{
              'is-correct': isOptionCorrect(option.optionId)
            }"
          >
            <span class="option-label">{{ option.optionId }}.</span>
            <span v-html="option.content" />
          </li>
        </ul>
      </div>

      <div v-show="showAnswerAnalysis" class="question-answers">
        <h4>正确答案:</h4>
        <p>{{ displayCorrectAnswer }}</p>

        <div v-if="wrongQuestion?.analysis">
          <h4>解析:</h4>
          <div v-html="wrongQuestion.analysis" />
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleShowAnswerAnalysis">{{
          showAnswerAnalysis ? "隐藏答案解析" : "查看答案解析"
        }}</el-button>
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";

interface Option {
  optionId: string; // A, B, C, etc.
  content: string;
}

interface WrongQuestion {
  id: number;
  sourceType: number;
  sourceId: number;
  sourceName: string;
  questionId: number;
  questionType: number; // 1: 单选题, 2: 多选题, 3: 判断题, 4: 填空题, 5: 简答题, 6: 编程题
  title: string;
  stem: string;
  options: string | null; // Stringified JSON array of strings, e.g., "["Option A","Option B"]"
  analysis: string | null;
  answer: string; // Stringified, can be array for multi-choice/fill-in-blank, e.g., "['A']" or "Answer Text"
  userAnswer: string; // String for single, comma-separated for multi-choice/fill-in-blank
  wrongNum: number;
  lastWrongTime: string;
}

const props = defineProps<{
  modelValue: boolean;
  wrongQuestion: WrongQuestion | null;
}>();

const emit = defineEmits(["update:modelValue"]);

const visible = ref(props.modelValue);
const showAnswerAnalysis = ref(false); // 控制答案和解析的显示

watch(
  () => props.modelValue,
  newVal => {
    visible.value = newVal;
    // 当对话框关闭时，重置答案显示状态
    if (!newVal) {
      showAnswerAnalysis.value = false;
    }
  }
);

watch(
  () => visible.value,
  newVal => {
    emit("update:modelValue", newVal);
  }
);

const handleClose = () => {
  visible.value = false;
};

const handleShowAnswerAnalysis = () => {
  showAnswerAnalysis.value = !showAnswerAnalysis.value;
};

const isChoiceQuestion = computed(() => {
  return (
    props.wrongQuestion?.questionType === 1 ||
    props.wrongQuestion?.questionType === 2
  );
});

const parsedOptions = computed<Option[]>(() => {
  if (props.wrongQuestion?.options && isChoiceQuestion.value) {
    try {
      const rawOptions: string[] = JSON.parse(props.wrongQuestion.options);
      return rawOptions.map((content, index) => ({
        optionId: String.fromCharCode(65 + index), // Generate A, B, C...
        content: content
      }));
    } catch (e) {
      console.error("Failed to parse options:", e);
      return [];
    }
  }
  return [];
});

const parsedCorrectAnswer = computed<string[]>(() => {
  if (!props.wrongQuestion?.answer) return [];
  try {
    const parsed = JSON.parse(props.wrongQuestion.answer);
    if (Array.isArray(parsed)) {
      return parsed.map(String); // Ensure elements are strings
    } else {
      return [String(parsed)]; // If not an array, treat as a single string
    }
  } catch (e) {
    // If parsing fails, treat as a literal string
    return [props.wrongQuestion.answer];
  }
});

const displayCorrectAnswer = computed(() => {
  if (!props.wrongQuestion) return "";
  // For choice questions, show A, B, C...
  if (isChoiceQuestion.value) {
    return parsedCorrectAnswer.value.join(", ");
  }
  // For other question types, show the raw answer
  return parsedCorrectAnswer.value.join(", ");
});

const isOptionCorrect = (optionId: string) => {
  return parsedCorrectAnswer.value.includes(optionId);
};
</script>

<style scoped>
.wrong-question-detail {
  max-height: 70vh;
  padding: 0;
  overflow-y: auto;
}

.question-title {
  margin-bottom: 15px;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.question-stem {
  margin-bottom: 20px;
  line-height: 1.6;
  color: #555;
}

.question-options h4,
.question-answers h4 {
  margin-top: 20px;
  margin-bottom: 10px;
  font-size: 16px;
  color: #333;
}

.question-options ul {
  padding: 0;
  list-style: none;
}

.question-options li {
  display: flex;
  align-items: flex-start;
  padding: 8px 0;
  color: #666;
  border-bottom: 1px dashed #eee;
}

.question-options li:last-child {
  border-bottom: none;
}

.option-label {
  flex-shrink: 0;
  margin-right: 8px;
  font-weight: bold;
}

.question-options li.is-correct {
  font-weight: bold;
  color: #67c23a; /* Green for correct options */
}

.question-answers p {
  font-size: 15px;
  line-height: 1.6;
  color: #666;
  white-space: pre-wrap; /* Preserve whitespace and breaks */
}
</style>

<style lang="scss">
.custom-wrong-detail-dialog {
  overflow: hidden !important;
  border-radius: 16px !important;

  .el-dialog__header {
    padding: 24px 40px !important;
    margin-right: 0 !important;
    border-bottom: 1px solid var(--el-border-color-lighter) !important;
  }

  .el-dialog__body {
    padding: 32px 40px 40px !important;
  }

  .el-dialog__footer {
    padding: 16px 40px 24px !important;
    border-top: 1px solid var(--el-border-color-lighter) !important;
  }
}

/* 深色模式适配 */
html.dark .custom-wrong-detail-dialog {
  --el-dialog-bg-color: #1a1a1a;

  background-color: var(--el-dialog-bg-color);
  border: 1px solid #333;

  .el-dialog__header {
    border-bottom: 1px solid #333 !important;
  }

  .el-dialog__title {
    color: #e0e0e0;
  }

  .el-dialog__footer {
    border-top: 1px solid #333 !important;
  }

  .question-title {
    color: #e0e0e0;
  }

  .question-stem {
    color: #bbb;
  }

  .question-options h4,
  .question-answers h4 {
    color: #e0e0e0;
  }

  .question-options li {
    color: #aaa;
    border-bottom-color: #333;
  }

  .question-answers p {
    color: #aaa;
  }
}
</style>
