<template>
  <el-dialog
    v-model="visible"
    :title="titleText"
    width="70%"
    :before-close="handleClose"
    class="custom-analyze-dialog"
  >
    <div class="wea-body" v-loading="loading">
      <section class="orig">
        <h3 class="section-title">原题</h3>
        <div class="stem" v-html="origContent"></div>
        <div class="answer-line">
          <span>学生答案：</span>
          <span class="answer">{{ original?.student_answer }}</span>
          <span class="sep">|</span>
          <span>正确答案：</span>
          <span class="answer correct">{{ original?.correct_answer }}</span>
        </div>
      </section>

      <section v-if="analysis" class="analysis">
        <h3 class="section-title">智能错题分析</h3>
        <el-descriptions :column="2" border>
          <el-descriptions-item label="错误类型">{{ analysis.error_type }}</el-descriptions-item>
          <el-descriptions-item label="涉及知识点">
            <el-tag
              v-for="(kp, idx) in analysis.knowledge_points"
              :key="idx"
              type="info"
              class="mr8"
              >{{ kp }}</el-tag
            >
          </el-descriptions-item>
          <el-descriptions-item label="错误原因" :span="2">
            <div class="prewrap">{{ analysis.error_reason }}</div>
          </el-descriptions-item>
          <el-descriptions-item label="学习建议" :span="2">
            <div class="prewrap">{{ analysis.learning_suggestions }}</div>
          </el-descriptions-item>
        </el-descriptions>
      </section>

      <section class="generated" v-if="generatedExercises && generatedExercises.length">
        <div class="section-header">
          <h3 class="section-title">相似练习（{{ generatedExercises.length }}）</h3>
        </div>
        <div class="exercise-list">
          <div
            class="exercise-item"
            v-for="(ex, idx) in generatedExercises"
            :key="ex.exercise_id || idx"
          >
            <div class="q-header">
              <span class="idx">{{ idx + 1 }}.</span>
              <div class="q-text" v-html="ex.question"></div>
            </div>
            <div v-if="ex.options && ex.options.length" class="options">
              <el-radio-group v-model="userChoices[idx]">
                <el-radio
                  v-for="(opt, i2) in ex.options"
                  :key="i2"
                  :label="String.fromCharCode(65 + i2)"
                >
                  {{ String.fromCharCode(65 + i2) }}. {{ opt }}
                </el-radio>
              </el-radio-group>
            </div>
            <div class="actions">
              <el-button text type="primary" @click="toggleExplain(idx)">
                {{ showExplain[idx] ? '隐藏解析' : '查看解析' }}
              </el-button>
            </div>
            <el-collapse-transition>
              <div v-show="showExplain[idx]" class="explain">
                <div class="right-ans" v-if="ex.correct_answer">
                  正确答案：<b>{{ ex.correct_answer }}</b>
                </div>
                <div class="prewrap" v-if="ex.explanation">{{ ex.explanation }}</div>
              </div>
            </el-collapse-transition>
          </div>
        </div>
      </section>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">关闭</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue';
import type {
  WrongExerciseAnalyzeResponse,
  GeneratedExercise
} from '@/api/frontend/wrong-exercise';

// 注意：上面导入路径会在创建后修正

const props = defineProps<{
  modelValue: boolean;
  original?: {
    original_exercise_content: string;
    student_answer: string;
    correct_answer: string;
  } | null;
  response?: WrongExerciseAnalyzeResponse | null;
  loading?: boolean;
  title?: string;
}>();

const emit = defineEmits(['update:modelValue']);

const visible = ref<boolean>(props.modelValue);
const showExplain = ref<Record<number, boolean>>({});
const userChoices = ref<Record<number, string>>({});

watch(
  () => props.modelValue,
  v => (visible.value = v)
);
watch(
  () => visible.value,
  v => emit('update:modelValue', v)
);

const titleText = computed(() => props.title || '错题分析与相似练习');
const loading = computed(() => !!props.loading);
const origContent = computed(() => props.original?.original_exercise_content || '');
const analysis = computed<WrongExerciseAnalyzeResponse['analysis'] | null>(() => props.response?.analysis || null);
const generatedExercises = computed<GeneratedExercise[]>(() => props.response?.generated_exercises || []);

const handleClose = () => {
  visible.value = false;
};

const toggleExplain = (idx: number) => {
  showExplain.value[idx] = !showExplain.value[idx];
};
</script>

<style scoped>
.wea-body {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0;
}
.section-title {
  margin: 0 0 10px;
  font-weight: 600;
}
.orig .stem {
  padding: 10px 12px;
  background: #f7f8fa;
  border-radius: 6px;
}
.answer-line {
  margin-top: 8px;
  color: #666;
}
.answer-line .answer {
  color: #97b4f7;
}
.answer-line .correct {
  color: #67c23a;
}
.answer-line .sep { margin: 0 8px; color: #bbb; }

.generated .exercise-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.exercise-item {
  padding: 12px;
  border: 1px solid #f0f0f0;
  border-radius: 8px;
}
.q-header { display: flex; gap: 8px; }
.q-text { flex: 1; }
.options { margin-top: 8px; }
.explain { margin-top: 8px; background: #f9fafb; padding: 10px; border-radius: 6px; }
.prewrap { white-space: pre-wrap; }
.mr8 { margin-right: 8px; }
</style>

<style lang="scss">
.custom-analyze-dialog {
  border-radius: 16px !important;
  overflow: hidden !important;

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
html.dark .custom-analyze-dialog {
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

  .section-title {
    color: #e0e0e0;
  }

  .orig .stem {
    background: #2a2a2a;
    color: #e0e0e0;
    border: 1px solid #3e3e3e;
  }

  .answer-line {
    color: #aaa;
  }

  .exercise-item {
    border-color: #3e3e3e;
    background: #2a2a2a;
    color: #e0e0e0;
  }

  .explain {
    background: #333;
    color: #e0e0e0;
  }

  /* 描述列表适配 */
  .el-descriptions__body {
    background-color: #252525;
  }

  .el-descriptions__label {
    background-color: #333;
    color: #aaa;
    border-color: #444;
  }

  .el-descriptions__content {
    background-color: #252525;
    color: #e0e0e0;
    border-color: #444;
  }

  .el-descriptions--border {
    border-color: #444;
  }
}
</style>
