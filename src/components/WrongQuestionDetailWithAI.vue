<template>
  <el-dialog
    v-model="visible"
    :title="titleText"
    width="70%"
    :before-close="handleClose"
    :class="['custom-ai-detail-dialog', currentTheme]"
    :append-to-body="true"
    :destroy-on-close="true"
  >
    <div class="wrap" :class="{ dark: currentTheme === 'dark' }" v-loading="loading">
      <!-- 原题区域 -->
      <section class="block">
        <h3 class="h3">题目</h3>
        <div class="stem" v-html="wrong?.stem" />
        <div v-if="isChoice" class="options">
          <ul>
            <li v-for="(opt, i) in parsedOptions" :key="i">
              <b class="label">{{ opt.optionId }}.</b>
              <span v-html="opt.content" />
            </li>
          </ul>
        </div>
        <div class="answers">
          <el-button text type="primary" @click="toggleBase">{{ baseOpened ? '隐藏答案/解析' : '查看答案/解析' }}</el-button>
          <el-collapse-transition>
            <div v-show="baseOpened" class="base">
              <div class="line"><span>学生答案：</span><b class="uans">{{ wrong?.userAnswer }}</b></div>
              <div class="line"><span>正确答案：</span><b class="cans">{{ displayCorrectAnswer }}</b></div>
              <div v-if="wrong?.analysis" class="prewrap">{{ wrong?.analysis }}</div>
            </div>
          </el-collapse-transition>
        </div>
      </section>

      <!-- AI 分析 -->
      <section class="block">
        <div class="ai-header">
          <h3 class="h3">AI 错题分析</h3>
          <el-button
            v-if="!analysis"
            type="primary"
            :loading="analyzing"
            @click="doAnalyze"
          >立即分析</el-button>
        </div>

        <div v-if="analysis" class="analysis">
          <el-descriptions :column="2" border>
            <el-descriptions-item label="错误类型">{{ analysis.error_type }}</el-descriptions-item>
            <el-descriptions-item label="涉及知识点">
              <el-tag v-for="(kp, i) in analysis.knowledge_points" :key="i" class="mr8" type="info">{{ kp }}</el-tag>
            </el-descriptions-item>
            <el-descriptions-item :span="2" label="错误原因">
              <div class="prewrap">{{ analysis.error_reason }}</div>
            </el-descriptions-item>
            <el-descriptions-item :span="2" label="学习建议">
              <div class="prewrap">{{ analysis.learning_suggestions }}</div>
            </el-descriptions-item>
          </el-descriptions>
        </div>
        <el-empty v-else description="未分析，点击立即分析获取结果" />
      </section>

      <!-- 相似练习 -->
      <section class="block" v-if="generatedExercises.length">
        <h3 class="h3">相似练习（{{ generatedExercises.length }}）</h3>
        <div class="sim-list">
          <div v-for="(ex, idx) in generatedExercises" :key="ex.exercise_id || idx" class="sim-item">
            <div class="q"><b>{{ idx + 1 }}.</b><div class="qtxt" v-html="ex.question" /></div>
            <div v-if="ex.options && ex.options.length" class="opts">
              <ul>
                <li v-for="(o, i2) in ex.options" :key="i2">
                  <template v-if="needsPrefix(o)"><b>{{ abcd(i2) }}.</b> {{ stripPrefix(o) }}</template>
                  <template v-else><span v-html="o" /></template>
                </li>
              </ul>
            </div>
            <el-button text type="primary" @click="toggleExplain(idx)">{{ showExplain[idx] ? '隐藏解析' : '查看解析' }}</el-button>
            <el-collapse-transition>
              <div v-show="showExplain[idx]" class="exp">
                <div v-if="ex.correct_answer" class="line">正确答案：<b>{{ ex.correct_answer }}</b></div>
                <div v-if="ex.explanation" class="prewrap">{{ ex.explanation }}</div>
              </div>
            </el-collapse-transition>
          </div>
        </div>
      </section>
    </div>

    <template #footer>
      <el-button @click="handleClose">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { ElMessage } from 'element-plus';
import { analyzeWrongExercise, type WrongExerciseAnalyzeResponse, type GeneratedExercise } from '@/api/frontend/wrong-exercise';

export interface NormalizedWrongQuestion {
  id: number | string;
  questionId?: number | string;
  questionType?: number;
  title?: string;
  stem: string;
  options?: string | null;
  analysis?: string | null;
  answer?: string;
  userAnswer?: string;
}

const props = defineProps<{
  modelValue: boolean;
  courseId: number | string;
  currentTheme?: string;
  wrong: NormalizedWrongQuestion | null;
  initialAnalysis?: WrongExerciseAnalyzeResponse | null;
}>();

const emit = defineEmits(['update:modelValue', 'analyzed']);

const visible = ref<boolean>(props.modelValue);
const loading = ref(false);
const analyzing = ref(false);
const baseOpened = ref(false);
const analysis = ref<WrongExerciseAnalyzeResponse['analysis'] | null>(props.initialAnalysis?.analysis || null);
const generatedExercises = ref<GeneratedExercise[]>(props.initialAnalysis?.generated_exercises || []);

watch(() => props.modelValue, v => (visible.value = v));
watch(() => visible.value, v => emit('update:modelValue', v));
watch(
  () => props.initialAnalysis,
  v => {
    analysis.value = v?.analysis || null;
    generatedExercises.value = v?.generated_exercises || [];
  }
);

const titleText = computed(() => props.wrong?.title || '错题详情');
const isChoice = computed(() => props.wrong?.questionType === 1 || props.wrong?.questionType === 2);

const parsedOptions = computed(() => {
  const raw = props.wrong?.options;
  const out: Array<{ optionId: string; content: string }> = [];
  if (!raw || !isChoice.value) return out;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
    if (Array.isArray(parsed)) {
      return parsed.map((c: any, i: number) => ({ optionId: String.fromCharCode(65 + i), content: String(c) }));
    }
    if (parsed && typeof parsed === 'object') {
      // { "A": "...", "B": "..." }
      const keys = Object.keys(parsed).sort();
      for (const k of keys) out.push({ optionId: k, content: String(parsed[k]) });
      return out;
    }
    return out;
  } catch {
    return out;
  }
});

const displayCorrectAnswer = computed(() => {
  const ans = props.wrong?.answer;
  if (!ans) return '';
  try {
    const parsed = JSON.parse(ans);
    return Array.isArray(parsed) ? parsed.join(', ') : String(parsed);
  } catch {
    return String(ans);
  }
});

const toggleBase = () => (baseOpened.value = !baseOpened.value);
const abcd = (i: number) => String.fromCharCode(65 + i);
// 判断是否需要我们加前缀（如果后端已经带 'A.' 或 'A、' 等就不再加）
const needsPrefix = (o: string) => !/^\s*[A-D][\.|、]/.test(o);
const stripPrefix = (o: string) => o.replace(/^\s*[A-D][\.|、]\s*/, '');
const showExplain = ref<Record<number, boolean>>({});
const toggleExplain = (i: number) => (showExplain.value[i] = !showExplain.value[i]);

const doAnalyze = async () => {
  if (!props.wrong) return;
  analyzing.value = true;
  try {
    const original_exercise_id = String(props.wrong.questionId || props.wrong.id);
    const { data } = await analyzeWrongExercise({
      course_id: props.courseId,
      original_exercise_id,
      original_exercise_content: props.wrong.stem,
      student_answer: props.wrong.userAnswer || '',
      correct_answer: props.wrong.answer || ''
    });
    if (data) {
      analysis.value = data.analysis;
      generatedExercises.value = data.generated_exercises || [];
      emit('analyzed', { key: original_exercise_id, response: data });
      ElMessage.success('分析完成');
    }
  } catch (e) {
    ElMessage.error('分析失败');
  } finally {
    analyzing.value = false;
  }
};

const handleClose = () => (visible.value = false);
</script>

<style scoped>
.wrap {
  max-height: 70vh;
  overflow: auto;
  padding: 4px;
}
.wrap.dark {
  color: #e0e0e0;
}
.block {
  margin-bottom: 24px;
}
.h3 {
  margin: 0 0 12px;
  font-weight: 600;
  font-size: 18px;
}
.stem {
  background: #f7f8fa;
  padding: 12px 16px;
  border-radius: 8px;
  color: #333;
  line-height: 1.6;
  margin-bottom: 12px;
}
.wrap.dark .stem {
  background: #333;
  color: #e0e0e0;
}
.wrap.dark .stem :deep(*) {
  color: #e0e0e0 !important;
}
.options ul {
  list-style: none;
  padding: 0;
  margin: 8px 0 0;
}
.options li {
  padding: 8px 0;
  display: flex;
  align-items: flex-start;
  color: #333;
}
.wrap.dark .options li {
  color: #e0e0e0;
}
.options .label {
  margin-right: 8px;
  color: #409eff;
  font-weight: bold;
}
.wrap.dark .options .label {
  color: #4facfe;
}
.answers {
  margin-top: 12px;
}
.base {
  margin-top: 12px;
  background: #f9fafb;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #eee;
}
.wrap.dark .base {
  background: #252525;
  color: #e0e0e0;
  border-color: #444;
}
.uans {
  color: #409eff;
}
.cans {
  color: #67c23a;
}
.ai-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.prewrap {
  white-space: pre-wrap;
  line-height: 1.6;
}
.sim-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.sim-item {
  padding: 16px;
  border: 1px solid #f0f0f0;
  border-radius: 10px;
  background: #fff;
  color: #333;
}
.wrap.dark .sim-item {
  border-color: #444;
  background: #2a2a2a;
  color: #e0e0e0;
}
.q {
  display: flex;
  gap: 8px;
  margin-bottom: 10px;
  font-weight: 500;
}
.qtxt {
  flex: 1;
}
.exp {
  margin-top: 12px;
  background: #f9fafb;
  padding: 12px;
  border-radius: 8px;
  font-size: 14px;
}
.wrap.dark .exp {
  background: #333;
  color: #e0e0e0;
}
.mr8 {
  margin-right: 8px;
}
</style>

<style>
/* 彻底加固深色模式弹窗样式（处理 Portal 渲染） */
.custom-ai-detail-dialog.dark .el-dialog,
html.dark .custom-ai-detail-dialog .el-dialog {
  background-color: #1a1a1a !important;
  border: 1px solid #333 !important;
  box-shadow: 0 12px 32px 4px rgba(0, 0, 0, 0.4) !important;
}

.custom-ai-detail-dialog.dark .el-dialog__header,
html.dark .custom-ai-detail-dialog .el-dialog__header {
  background-color: #1a1a1a !important;
  border-bottom: 1px solid #333 !important;
  margin-right: 0 !important;
  padding: 20px !important;
}

.custom-ai-detail-dialog.dark .el-dialog__title,
html.dark .custom-ai-detail-dialog .el-dialog__title {
  color: #e0e0e0 !important;
}

.custom-ai-detail-dialog.dark .el-dialog__body,
html.dark .custom-ai-detail-dialog .el-dialog__body {
  background-color: #1a1a1a !important;
  color: #e0e0e0 !important;
  padding: 20px !important;
}

.custom-ai-detail-dialog.dark .el-dialog__footer,
html.dark .custom-ai-detail-dialog .el-dialog__footer {
  background-color: #1a1a1a !important;
  border-top: 1px solid #333 !important;
  padding: 10px 20px 20px !important;
}

/* 描述列表深色模式加固 */
.custom-ai-detail-dialog.dark .el-descriptions__body,
html.dark .custom-ai-detail-dialog .el-descriptions__body {
  background-color: #252525 !important;
}

.custom-ai-detail-dialog.dark .el-descriptions__label,
html.dark .custom-ai-detail-dialog .el-descriptions__label {
  background-color: #333 !important;
  color: #aaa !important;
  border-color: #444 !important;
}

.custom-ai-detail-dialog.dark .el-descriptions__content,
html.dark .custom-ai-detail-dialog .el-descriptions__content {
  background-color: #252525 !important;
  color: #e0e0e0 !important;
  border-color: #444 !important;
}

.custom-ai-detail-dialog.dark .el-descriptions--border,
html.dark .custom-ai-detail-dialog .el-descriptions--border {
  border-color: #444 !important;
}

/* 按钮和空状态加固 */
.custom-ai-detail-dialog.dark .el-button--default:not(.is-text),
html.dark .custom-ai-detail-dialog .el-button--default:not(.is-text) {
  background-color: #333 !important;
  border-color: #444 !important;
  color: #e0e0e0 !important;
}

.custom-ai-detail-dialog.dark .el-empty__description p,
html.dark .custom-ai-detail-dialog .el-empty__description p {
  color: #888 !important;
}
</style>
