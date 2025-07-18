<template>
  <el-dialog
    v-model="visible"
    title="错题详情"
    width="60%"
    :before-close="handleClose"
  >
    <div class="wrong-question-detail">
      <h3 class="question-title">{{ wrongQuestion.title }}</h3>
      <div class="question-stem" v-html="wrongQuestion.stem"></div>

      <div v-if="isChoiceQuestion" class="question-options">
        <h4>选项:</h4>
        <ul>
          <li
            v-for="(option, idx) in parsedOptions"
            :key="idx"
            :class="{
              'is-correct': isOptionCorrect(option.optionId),
              'is-user-answer': isUserAnswer(option.optionId)
            }"
          >
            <span class="option-label">{{ getOptionLabel(idx) }}.</span>
            <span v-html="option.content"></span>
          </li>
        </ul>
      </div>

      <div class="question-answers">
        <h4>你的答案:</h4>
        <p :class="{ 'is-correct-answer': isUserAnswerCorrect }">
          {{ displayUserAnswer }}
        </p>

        <h4>正确答案:</h4>
        <p>{{ displayCorrectAnswer }}</p>

        <div v-if="wrongQuestion.analysis">
          <h4>解析:</h4>
          <div v-html="wrongQuestion.analysis"></div>
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";

interface Option {
  optionId: string;
  content: string;
}

interface WrongQuestion {
  id: number;
  sourceType: number;
  sourceId: number;
  sourceName: string;
  questionId: number;
  questionType: number;
  title: string;
  stem: string;
  options: string | null; // Stringified JSON array
  analysis: string | null;
  answer: string; // Stringified, can be array for multi-choice/fill-in-blank
  userAnswer: string;
  wrongNum: number;
  lastWrongTime: string;
}

const props = defineProps<{
  modelValue: boolean;
  wrongQuestion: WrongQuestion | null;
}>();

const emit = defineEmits(["update:modelValue"]);

const visible = ref(props.modelValue);

watch(
  () => props.modelValue,
  newVal => {
    visible.value = newVal;
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

const isChoiceQuestion = computed(() => {
  return (
    props.wrongQuestion?.questionType === 1 ||
    props.wrongQuestion?.questionType === 2
  );
});

const parsedOptions = computed<Option[]>(() => {
  if (props.wrongQuestion?.options && isChoiceQuestion.value) {
    try {
      return JSON.parse(props.wrongQuestion.options);
    } catch (e) {
      console.error("Failed to parse options:", e);
      return [];
    }
  }
  return [];
});

const parsedCorrectAnswer = computed<string[]>(() => {
  if (props.wrongQuestion?.answer) {
    try {
      // Answers can be array for multi-choice or single string in an array for others
      const answer = JSON.parse(props.wrongQuestion.answer);
      return Array.isArray(answer) ? answer : [answer];
    } catch (e) {
      return [props.wrongQuestion.answer]; // Fallback if not JSON or single string
    }
  }
  return [];
});

const displayCorrectAnswer = computed(() => {
  if (!props.wrongQuestion) return "";
  if (isChoiceQuestion.value) {
    const labels = parsedCorrectAnswer.value.map(ans => {
      const index = parsedOptions.value.findIndex(opt => opt.optionId === ans);
      return index !== -1 ? getOptionLabel(index) : ans; // Fallback to optionId if label not found
    });
    return labels.join(", ");
  }
  return parsedCorrectAnswer.value.join(", ");
});

const displayUserAnswer = computed(() => {
  if (!props.wrongQuestion) return "";
  if (isChoiceQuestion.value) {
    const labels = props.wrongQuestion.userAnswer.split(",").map(ans => {
      const index = parsedOptions.value.findIndex(
        opt => opt.optionId === ans.trim()
      );
      return index !== -1 ? getOptionLabel(index) : ans.trim();
    });
    return labels.join(", ");
  }
  return props.wrongQuestion.userAnswer;
});

const isUserAnswerCorrect = computed(() => {
  if (!props.wrongQuestion) return false;

  const userAnswer = props.wrongQuestion.userAnswer;
  const correctAnswer = parsedCorrectAnswer.value;

  if (isChoiceQuestion.value) {
    // For choice questions, compare sorted arrays of option IDs
    const userAnsArray = userAnswer
      .split(",")
      .map(s => s.trim())
      .sort();
    const correctAnsArray = correctAnswer.sort();
    return JSON.stringify(userAnsArray) === JSON.stringify(correctAnsArray);
  } else {
    // For other types, direct string comparison
    return userAnswer === correctAnswer[0];
  }
});

const getOptionLabel = (index: number) => {
  return String.fromCharCode(65 + index); // A, B, C, ...
};

const isOptionCorrect = (optionId: string) => {
  return parsedCorrectAnswer.value.includes(optionId);
};

const isUserAnswer = (optionId: string) => {
  if (!props.wrongQuestion || !props.wrongQuestion.userAnswer) return false;
  // For multiple choices, userAnswer might be "A,B" or "optionId1,optionId2"
  return props.wrongQuestion.userAnswer
    .split(",")
    .map(s => s.trim())
    .includes(optionId);
};
</script>

<style scoped>
.wrong-question-detail {
  padding: 10px;
}

.question-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 15px;
  color: #333;
}

.question-stem {
  margin-bottom: 20px;
  line-height: 1.6;
  color: #555;
}

.question-options h4,
.question-answers h4 {
  font-size: 16px;
  margin-top: 20px;
  margin-bottom: 10px;
  color: #333;
}

.question-options ul {
  list-style: none;
  padding: 0;
}

.question-options li {
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
  display: flex;
  align-items: flex-start;
  color: #666;
}

.question-options li:last-child {
  border-bottom: none;
}

.option-label {
  font-weight: bold;
  margin-right: 8px;
  flex-shrink: 0;
}

.question-options li.is-correct {
  color: #67c23a; /* Green for correct options */
}

.question-options li.is-user-answer {
  background-color: #f0f9eb; /* Light green background for user's selected options */
}

.question-options li.is-correct.is-user-answer {
  background-color: #e1f3d8; /* Darker light green if user selected correct option */
}

.question-answers p {
  font-size: 15px;
  line-height: 1.6;
  color: #666;
  white-space: pre-wrap; /* Preserve whitespace and breaks */
}

.question-answers .is-correct-answer {
  color: #67c23a; /* Green if user's answer is correct */
  font-weight: bold;
}
</style>
