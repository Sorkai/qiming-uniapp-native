<template>
  <el-dialog
    v-model="visible"
    :title="titleText"
    width="70%"
    :before-close="handleClose"
  >
    <div class="wrap" v-loading="loading">
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
                <li v-for="(o, i2) in ex.options" :key="i2"><b>{{ abcd(i2) }}.</b> {{ o }}</li>
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
.wrap { max-height: 70vh; overflow: auto; }
.block { margin-bottom: 18px; }
.h3 { margin: 0 0 10px; font-weight: 600; }
.stem { background:#f7f8fa; padding: 10px 12px; border-radius: 6px; }
.options ul { list-style:none; padding:0; margin:8px 0 0; }
.options li { padding:6px 0; }
.options .label { margin-right:6px; }
.answers { margin-top: 8px; }
.base { margin-top: 8px; background:#f9fafb; padding:10px; border-radius:6px; }
.uans { color:#409eff; }
.cans { color:#67c23a; }
.ai-header { display:flex; align-items:center; justify-content:space-between; }
.prewrap { white-space: pre-wrap; }
.sim-list { display:flex; flex-direction:column; gap:12px; }
.sim-item { padding:10px; border:1px solid #f0f0f0; border-radius:8px; }
.q { display:flex; gap:8px; }
.qtxt { flex:1; }
.exp { margin-top:8px; background:#f9fafb; padding:10px; border-radius:6px; }
.mr8 { margin-right: 8px; }
</style>
