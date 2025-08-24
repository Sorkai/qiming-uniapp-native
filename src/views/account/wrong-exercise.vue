<template>
  <div class="practice-container" :class="currentTheme" :data-embedded="embedded">
    <div v-if="!embedded" class="header" :class="currentTheme">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon> 返回
        </div>
        <div class="title">随练</div>
        <div class="placeholder" />
      </div>
    </div>

    <div class="main-content" :class="currentTheme">
  <el-card>
        <template #header>
          <div class="card-header">
            <h3>历史错题</h3>
            <div class="filters">
              <el-select v-model="filterSource" placeholder="来源" clearable size="small" style="width:110px" @change="refreshList">
                <el-option label="作业" :value="1" />
                <el-option label="考试" :value="2" />
                <el-option label="自测题" :value="3" />
              </el-select>
              <el-select v-model="filterType" placeholder="题型" clearable size="small" style="width:110px">
                <el-option v-for="(txt,val) in questionTypeMap" :key="val" :label="txt" :value="Number(val)" />
              </el-select>
              <el-date-picker
                v-model="filterDateRange"
                type="daterange"
                unlink-panels
                range-separator="至"
                start-placeholder="开始日期"
                end-placeholder="结束日期"
                size="small"
                value-format="YYYY-MM-DD"
                style="width:260px"
              />
              <el-button size="small" type="primary" @click="refreshList">筛选</el-button>
              <el-button size="small" @click="resetFilters">重置</el-button>
              <el-button
                size="small"
                type="primary"
                :disabled="batchAnalyzing"
                @click="toggleSelectionMode"
              >{{ selectionMode ? '退出多选' : '多选' }}</el-button>
              <el-button
                v-if="selectionMode"
                size="small"
                :disabled="batchAnalyzing || !filteredRecords.length"
                @click="selectAllVisible"
              >全选</el-button>
              <el-button
                v-if="selectionMode"
                size="small"
                :disabled="batchAnalyzing || !filteredRecords.length"
                @click="invertSelectionVisible"
              >反选</el-button>
              <el-button
                v-if="selectionMode"
                size="small"
                type="success"
                :disabled="batchAnalyzing || selectedUnAnalyzedCount===0"
                :loading="batchAnalyzing"
                @click="batchAnalyzeSelected"
              >分析所选 ({{ selectedUnAnalyzedCount }})</el-button>
              <el-button
                v-else
                size="small"
                type="success"
                :disabled="batchAnalyzing || unAnalyzedCount===0"
                :loading="batchAnalyzing"
                @click="() => batchAnalyze()"
              >批量分析 ({{ unAnalyzedCount }})</el-button>
              <el-input-number v-model="concurrency" :min="1" :max="10" size="small" style="width:110px" :disabled="batchAnalyzing" />
              <span class="hint" v-if="!batchAnalyzing">并发</span>
              <el-button size="small" type="danger" v-if="batchAnalyzing" @click="cancelBatch">取消</el-button>
            </div>
          </div>
        </template>

        <el-empty v-if="loading" description="加载中..." />

        <div v-else>
          <el-empty v-if="!records.length" description="暂无错题记录" />

          <div v-else class="wrong-list">
            <div
              class="wrong-item"
              v-for="item in filteredRecords"
              :key="item.id"
            >
              <div class="select-box" v-if="selectionMode">
                <el-checkbox v-model="selectionMap[item.id]" @change="onSelectChange(item)" />
              </div>
              <div class="w-title" v-html="item.stem" />
              <div class="w-meta">
                <span class="tag">来源：{{ sourceText(item.sourceType) }}</span>
                <span class="tag">错误次数：{{ item.wrongNum }}</span>
                <span
                  class="tag analyzed"
                  v-if="isAnalyzed(item)"
                  :class="{ 'new-analyzed': newlyAnalyzedKeys.has(String(item.questionId || item.id)) }"
                >已分析</span>
                <span class="time">{{ item.lastWrongTime }}</span>
              </div>
              <div class="actions">
                <el-button type="primary" text @click="openDetail(item)">查看</el-button>
              </div>
            </div>

            <div class="pager">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="total"
                :page-size="pageSize"
                :current-page="page"
                @current-change="handlePageChange"
              />
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 批量分析全屏进度 -->
    <transition name="fade">
      <div v-if="batchAnalyzing" class="batch-overlay">
        <div class="overlay-content">
          <h3>AI 分析中...</h3>
          <el-progress :percentage="batchProgressPercent" :stroke-width="20" style="width:320px; margin:10px 0 16px;" />
          <div class="stats">
            <span>总数: {{ totalToAnalyze }}</span>
            <span>完成: {{ completedCount }}</span>
            <span>成功: {{ successCount }}</span>
            <span>失败: {{ failedCount }}</span>
          </div>
          <el-button type="danger" size="small" @click="cancelBatch">取消</el-button>
        </div>
      </div>
    </transition>

    <!-- 详情（沿用现有错题弹窗） -->
    <WrongQuestionDetailWithAI
      v-model="detailVisible"
      :course-id="courseId"
      :wrong="normalizeWrong(itemForDetail)"
      :initial-analysis="findHistory(itemForDetail)"
      @analyzed="cacheAnalysis"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import WrongQuestionDetailWithAI from '@/components/WrongQuestionDetailWithAI.vue';
import { getWrongExerciseHistory, type WrongExerciseAnalyzeResponse } from '@/api/frontend/wrong-exercise';
import { getUserWrongQuestionList, type WrongQuestionListResult } from '@/api/frontend/work';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const currentTheme = ref('light');

// 嵌入模式 props
const props = defineProps<{ embedded?: boolean; courseId?: number }>();
const embedded = computed(() => !!props.embedded);

const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const records = ref<WrongQuestionListResult['list']>([] as any);
// 筛选状态
const filterSource = ref<number | undefined>();
const filterType = ref<number | undefined>();
const filterDateRange = ref<[string, string] | undefined>();
const questionTypeMap: Record<number, string> = {
  1: '单选',
  2: '多选',
  3: '判断',
  4: '填空',
  5: '简答',
  6: '论述'
};

const filteredRecords = computed(() => {
  return records.value.filter(r => {
    if (filterSource.value && r.sourceType !== filterSource.value) return false;
    if (filterType.value && r.questionType !== filterType.value) return false;
    if (filterDateRange.value) {
      const [s, e] = filterDateRange.value;
      const d = r.lastWrongTime.substring(0,10);
      if (d < s || d > e) return false;
    }
    return true;
  });
});

function refreshList() {
  page.value = 1;
  fetchList();
}

function resetFilters() {
  filterSource.value = undefined;
  filterType.value = undefined;
  filterDateRange.value = undefined;
  refreshList();
}

const courseId = computed(() => {
  if (props.courseId) return props.courseId;
  return Number(route.query.courseId || route.params.id);
});

const analysisHistoryMap = ref<Record<string, WrongExerciseAnalyzeResponse>>({});

// 多选相关状态
const selectionMode = ref(false);
const selectionMap = ref<Record<string, boolean>>({});
const selectedIds = computed(() => Object.keys(selectionMap.value).filter(id => selectionMap.value[id]));
const selectedUnAnalyzedCount = computed(() => {
  return filteredRecords.value.filter(r => selectionMap.value[r.id] && !isAnalyzed(r)).length;
});
function toggleSelectionMode() {
  selectionMode.value = !selectionMode.value;
  if (!selectionMode.value) selectionMap.value = {};
}
function onSelectChange(item: any) {
  if (!selectionMode.value) return;
  const id = String(item.id);
  if (!selectionMap.value[id]) delete selectionMap.value[id];
}
function selectAllVisible() {
  for (const item of filteredRecords.value) {
    selectionMap.value[item.id] = true;
  }
}
function invertSelectionVisible() {
  for (const item of filteredRecords.value) {
    const id = item.id;
    selectionMap.value[id] = !selectionMap.value[id];
    if (!selectionMap.value[id]) delete selectionMap.value[id];
  }
}
async function batchAnalyzeSelected() {
  if (batchAnalyzing.value) return;
  const subset = filteredRecords.value.filter(r => selectionMap.value[r.id] && !isAnalyzed(r));
  if (!subset.length) return;
  await batchAnalyze(subset);
}

const fetchList = async () => {
  loading.value = true;
  try {
    const { code, data } = await getUserWrongQuestionList({
      pageNum: page.value,
      pageSize: pageSize.value,
  courseId: courseId.value,
  sourceType: filterSource.value
    } as any);
    if (code === 200 && data) {
      records.value = (data as any).list || [];
      total.value = (data as any).total || 0;
    }
  } finally {
    loading.value = false;
  }
};

const fetchAnalyzedHistory = async () => {
  try {
    const { data } = await getWrongExerciseHistory({ course_id: courseId.value, page: 1, page_size: 100 });
    if (data && data.records) {
      const map: Record<string, WrongExerciseAnalyzeResponse> = {};
      for (const rec of data.records) {
        map[String(rec.original_exercise_id)] = {
          analysis: rec.analysis,
          generated_exercises: rec.generated_exercises
        } as WrongExerciseAnalyzeResponse;
      }
      analysisHistoryMap.value = map;
    }
  } catch {}
};

const handlePageChange = (p: number) => {
  page.value = p;
  fetchList();
};

// 详情弹窗
const detailVisible = ref(false);
const itemForDetail = ref<any | null>(null);
const openDetail = (item: any) => {
  itemForDetail.value = item;
  detailVisible.value = true;
};
function normalizeWrong(item: any | null) {
  if (!item) return null;
  return {
  id: item.id,
  questionId: item.questionId,
  questionType: item.questionType,
  title: item.title,
  stem: item.stem,
  options: item.options,
  analysis: item.analysis,
  answer: item.answer,
  userAnswer: item.userAnswer
  };
}

function findHistory(item: any | null) {
  if (!item) return null;
  const key = String(item.questionId || item.id);
  return analysisHistoryMap.value[key] || null;
}

function cacheAnalysis(payload: { key: string; response: WrongExerciseAnalyzeResponse }) {
  analysisHistoryMap.value[payload.key] = payload.response;
}

function isAnalyzed(item: any) {
  const key = String(item.questionId || item.id);
  return !!analysisHistoryMap.value[key];
}

const unAnalyzedCount = computed(() => filteredRecords.value.filter(r => !isAnalyzed(r)).length);

// 批量分析（并发+可取消）
const batchAnalyzing = ref(false);
const batchCancelled = ref(false);
const completedCount = ref(0);
const totalToAnalyze = ref(0);
const concurrency = ref(3);
const batchProgressPercent = computed(() => totalToAnalyze.value === 0 ? 0 : Math.round((completedCount.value / totalToAnalyze.value) * 100));
const failedCount = ref(0);
const successCount = ref(0);
const newlyAnalyzedKeys = ref<Set<string>>(new Set());

function cancelBatch() {
  batchCancelled.value = true;
}

async function batchAnalyze(customList?: any[]) {
  if (batchAnalyzing.value) return;
  const toAnalyze = (customList || filteredRecords.value.filter(r => !isAnalyzed(r)));
  if (!toAnalyze.length) return;
  batchCancelled.value = false;
  batchAnalyzing.value = true;
  completedCount.value = 0;
  totalToAnalyze.value = toAnalyze.length;
  failedCount.value = 0;
  successCount.value = 0;
  const queue = [...toAnalyze];
  let running = 0;

  return new Promise<void>(resolve => {
    const finalizeIfDone = () => {
      if (completedCount.value === totalToAnalyze.value || (batchCancelled.value && running === 0)) {
        batchAnalyzing.value = false;
        if (batchCancelled.value) {
          ElMessage.info(`已取消：完成 ${completedCount.value}/${totalToAnalyze.value}，成功 ${successCount.value}，失败 ${failedCount.value}`);
        } else {
          ElMessage.success(`分析完成：成功 ${successCount.value}，失败 ${failedCount.value}`);
        }
        resolve();
        return true;
      }
      return false;
    };
    const next = () => {
      if (finalizeIfDone()) return;
      if (batchCancelled.value && running === 0) {
        finalizeIfDone();
        return;
      }
  const currentMax = Math.min(10, Math.max(1, concurrency.value));
  while (running < currentMax && queue.length && !batchCancelled.value) {
        const item = queue.shift();
        if (!item) break;
        running++;
        (async () => {
          try {
            const key = String(item.questionId || item.id);
            const { analyzeWrongExercise } = await import('@/api/frontend/wrong-exercise');
            const { data } = await analyzeWrongExercise({
              course_id: courseId.value,
              original_exercise_id: key,
              original_exercise_content: item.stem,
              student_answer: item.userAnswer || '',
              correct_answer: item.answer || ''
            });
            if (data) {
              analysisHistoryMap.value[key] = data;
              successCount.value++;
              newlyAnalyzedKeys.value.add(key);
              // 触发响应性
              newlyAnalyzedKeys.value = new Set(newlyAnalyzedKeys.value);
              setTimeout(() => {
                newlyAnalyzedKeys.value.delete(key);
                newlyAnalyzedKeys.value = new Set(newlyAnalyzedKeys.value);
              }, 1600);
            } else {
              failedCount.value++;
            }
          } catch {
            failedCount.value++;
          } finally {
            completedCount.value++;
            running--;
            next();
          }
        })();
      }
    };
    next();
  });
}

const formatTime = (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm');
const sourceText = (s: number) => ({ 1: '作业', 2: '考试', 3: '自测题' } as any)[s] || '未知';

const goBack = () => { if (!embedded.value) router.back(); };

onMounted(async () => {
  await fetchList();
  fetchAnalyzedHistory();
});
</script>

<style scoped>
.practice-container {
  min-height: 100vh;
  padding: 70px 0 30px;
  background-color: #f5f7fa;
}
.header {
  position: fixed;
  top: 0; left: 0; right: 0; height: 60px;
  background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.1);
}
.header .header-content { display:flex; align-items:center; justify-content:space-between; height:100%; padding:0 20px; max-width: 1100px; margin:0 auto; }
.header .title { font-size: 18px; font-weight: 600; }
.header .placeholder { min-width:60px; }

.main-content { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
.card-header { display:flex; align-items:center; justify-content:space-between; }

.wrong-list { display: flex; flex-direction: column; gap: 14px; }
.wrong-item { padding: 14px; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.w-title { font-weight: 600; margin-bottom: 6px; }
.w-meta { color: #666; font-size: 13px; display:flex; gap:10px; align-items:center; }
.w-meta .tag { background:#f5f7ff; padding:2px 6px; border-radius: 4px; }
.w-meta .right { background:#f0fff4; color:#2f9e44; }
.w-meta .time { margin-left:auto; color:#999; }
.actions { margin-top: 8px; display:flex; gap:8px; }
.pager { display:flex; justify-content:center; margin-top: 10px; }

/* Overlay */
.batch-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.45); display:flex; align-items:center; justify-content:center; z-index:3000; }
.overlay-content { background:#fff; padding:30px 40px; border-radius:16px; box-shadow:0 4px 20px rgba(0,0,0,0.15); text-align:center; }
.overlay-content h3 { margin:0 0 10px; }
.overlay-content .stats { display:flex; gap:14px; justify-content:center; margin:0 0 16px; font-size:13px; color:#555; }

/* Fade + new analyzed animation */
.fade-enter-active, .fade-leave-active { transition: opacity .25s; }
.fade-enter-from, .fade-leave-to { opacity:0; }
.analyzed.new-analyzed { animation: popIn 1.1s ease; position:relative; }
@keyframes popIn { 0% { transform:scale(.6); opacity:0;} 40% { transform:scale(1.05); opacity:1;} 60% { transform:scale(.95);} 100% { transform:scale(1);} }
</style>
