<template>
  <div
    class="practice-container"
    :class="currentTheme"
    :data-embedded="embedded"
  >
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
            <h3 class="header-title">
              历史错题
              <span class="count-badge">{{ total }}</span>
            </h3>
          </div>
          
          <!-- 筛选区域 -->
          <div class="filters-section" :class="{ dark: currentTheme === 'dark' }">
            <!-- 第一行：基础筛选 -->
            <div class="filter-row primary-filters">
              <div class="filter-group">
                <label class="filter-label">来源</label>
                <el-select
                  v-model="filterSource"
                  placeholder=" 全部来源 "
                  clearable
                  size="default"
                  class="filter-select"
                  @change="refreshList"
                >
                  <el-option label="作业" :value="1" />
                  <el-option label="考试" :value="2" />
                  <el-option label="自测题" :value="3" />
                </el-select>
              </div>

              <div class="filter-group">
                <label class="filter-label">题型</label>
                <el-select
                  v-model="filterType"
                  placeholder=" 全部题型 "
                  clearable
                  size="default"
                  class="filter-select"
                >
                  <el-option
                    v-for="(txt, val) in questionTypeMap"
                    :key="val"
                    :label="txt"
                    :value="Number(val)"
                  />
                </el-select>
              </div>

              <div class="filter-group date-group">
                <label class="filter-label">日期范围</label>
                <el-date-picker
                  v-model="filterDateRange"
                  type="daterange"
                  unlink-panels
                  range-separator="至"
                  start-placeholder="开始日期"
                  end-placeholder="结束日期"
                  size="default"
                  value-format="YYYY-MM-DD"
                  class="filter-date"
                />
              </div>

              <div class="filter-actions">
                <el-button 
                  type="primary" 
                  size="default"
                  class="action-btn primary-btn"
                  @click="refreshList"
                >
                  <el-icon><Search /></el-icon>
                  筛选
                </el-button>
                <el-button 
                  size="default"
                  class="action-btn"
                  @click="resetFilters"
                >
                  <el-icon><RefreshLeft /></el-icon>
                  重置
                </el-button>
              </div>
            </div>

            <!-- 第二行：批量操作 -->
            <div class="filter-row batch-operations">
              <div class="batch-left">
                <el-button
                  size="default"
                  :type="selectionMode ? 'warning' : 'primary'"
                  :disabled="batchAnalyzing"
                  class="action-btn"
                  @click="toggleSelectionMode"
                >
                  <el-icon><Grid /></el-icon>
                  {{ selectionMode ? "退出多选" : "多选模式" }}
                </el-button>

                <template v-if="selectionMode">
                  <el-button
                    size="default"
                    :disabled="batchAnalyzing || !filteredRecords.length"
                    class="action-btn"
                    @click="selectAllVisible"
                  >
                    <el-icon><Select /></el-icon>
                    全选
                  </el-button>
                  <el-button
                    size="default"
                    :disabled="batchAnalyzing || !filteredRecords.length"
                    class="action-btn"
                    @click="invertSelectionVisible"
                  >
                    <el-icon><Sort /></el-icon>
                    反选
                  </el-button>
                </template>
              </div>

              <div class="batch-right">
                <div v-if="!batchAnalyzing" class="concurrency-control">
                  <label class="filter-label">并发数</label>
                  <el-input-number
                    v-model="concurrency"
                    :min="1"
                    :max="10"
                    size="default"
                    :disabled="batchAnalyzing"
                    class="concurrency-input"
                  />
                </div>

                <el-button
                  v-if="selectionMode"
                  size="default"
                  type="success"
                  :disabled="batchAnalyzing || selectedUnAnalyzedCount === 0"
                  :loading="batchAnalyzing"
                  class="action-btn analyze-btn"
                  @click="batchAnalyzeSelected"
                >
                  <el-icon v-if="!batchAnalyzing"><MagicStick /></el-icon>
                  分析所选 ({{ selectedUnAnalyzedCount }})
                </el-button>
                <el-button
                  v-else
                  size="default"
                  type="success"
                  :disabled="batchAnalyzing || unAnalyzedCount === 0"
                  :loading="batchAnalyzing"
                  class="action-btn analyze-btn"
                  @click="() => batchAnalyze()"
                >
                  <el-icon v-if="!batchAnalyzing"><MagicStick /></el-icon>
                  批量分析 ({{ unAnalyzedCount }})
                </el-button>

                <el-button
                  v-if="batchAnalyzing"
                  size="default"
                  type="danger"
                  class="action-btn"
                  @click="cancelBatch"
                >
                  <el-icon><Close /></el-icon>
                  取消
                </el-button>
              </div>
            </div>
          </div>
        </template>

        <el-empty v-if="loading" description="加载中..." />

        <div v-else>
          <el-empty v-if="!records.length" description="暂无错题记录" />

          <div v-else class="wrong-list">
            <div
              v-for="item in filteredRecords"
              :key="item.id"
              class="wrong-item"
              :class="{ dark: currentTheme === 'dark' }"
            >
              <div v-if="selectionMode" class="select-box">
                <el-checkbox
                  v-model="selectionMap[item.id]"
                  @change="onSelectChange(item)"
                />
              </div>
              <div class="w-title" v-html="item.stem" />
              <div class="w-meta">
                <span class="tag">来源：{{ sourceText(item.sourceType) }}</span>
                <span class="tag">错误次数：{{ item.wrongNum }}</span>
                <span
                  v-if="isAnalyzed(item)"
                  class="tag analyzed"
                  :class="{
                    'new-analyzed': newlyAnalyzedKeys.has(
                      String(item.questionId || item.id)
                    )
                  }"
                  >已分析</span
                >
                <span class="time">{{ item.lastWrongTime }}</span>
              </div>
              <div class="actions">
                <el-button type="primary" text @click="openDetail(item)"
                  >查看</el-button
                >
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
        <div class="overlay-content" :class="{ dark: currentTheme === 'dark' }">
          <h3>AI 分析中...</h3>
          <el-progress
            :percentage="batchProgressPercent"
            :stroke-width="20"
            style="width: 320px; margin: 10px 0 16px"
          />
          <div class="stats">
            <span>总数: {{ totalToAnalyze }}</span>
            <span>完成: {{ completedCount }}</span>
            <span>成功: {{ successCount }}</span>
            <span>失败: {{ failedCount }}</span>
          </div>
          <el-button type="danger" size="small" @click="cancelBatch"
            >取消</el-button
          >
        </div>
      </div>
    </transition>

    <!-- 详情（沿用现有错题弹窗） -->
    <WrongQuestionDetailWithAI
      v-model="detailVisible"
      :course-id="courseId"
      :current-theme="currentTheme"
      :wrong="normalizeWrong(itemForDetail)"
      :initial-analysis="findHistory(itemForDetail)"
      @analyzed="cacheAnalysis"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  ArrowLeft,
  Search,
  RefreshLeft,
  Grid,
  Select,
  Sort,
  MagicStick,
  Close
} from "@element-plus/icons-vue";
import dayjs from "dayjs";
import WrongQuestionDetailWithAI from "@/components/WrongQuestionDetailWithAI.vue";
import {
  getWrongExerciseHistory,
  type WrongExerciseAnalyzeResponse
} from "@/api/frontend/wrong-exercise";
import {
  getUserWrongQuestionList,
  type WrongQuestionListResult
} from "@/api/frontend/work";
import { ElMessage } from "element-plus";

const route = useRoute();
const router = useRouter();

// 嵌入模式 props
const props = defineProps<{
  embedded?: boolean;
  courseId?: number;
  currentTheme?: string;
}>();

const currentTheme = computed(() => props.currentTheme || "light");
const embedded = computed(() => !!props.embedded);

const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const records = ref<WrongQuestionListResult["list"]>([] as any);
// 筛选状态
const filterSource = ref<number | undefined>();
const filterType = ref<number | undefined>();
const filterDateRange = ref<[string, string] | undefined>();
const questionTypeMap: Record<number, string> = {
  1: "单选",
  2: "多选",
  3: "判断",
  4: "填空",
  5: "简答",
  6: "论述"
};

const filteredRecords = computed(() => {
  return records.value.filter(r => {
    if (filterSource.value && r.sourceType !== filterSource.value) return false;
    if (filterType.value && r.questionType !== filterType.value) return false;
    if (filterDateRange.value) {
      const [s, e] = filterDateRange.value;
      const d = r.lastWrongTime.substring(0, 10);
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

const analysisHistoryMap = ref<Record<string, WrongExerciseAnalyzeResponse>>(
  {}
);

// 多选相关状态
const selectionMode = ref(false);
const selectionMap = ref<Record<string, boolean>>({});
const selectedIds = computed(() =>
  Object.keys(selectionMap.value).filter(id => selectionMap.value[id])
);
const selectedUnAnalyzedCount = computed(() => {
  return filteredRecords.value.filter(
    r => selectionMap.value[r.id] && !isAnalyzed(r)
  ).length;
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
  const subset = filteredRecords.value.filter(
    r => selectionMap.value[r.id] && !isAnalyzed(r)
  );
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
    const { data } = await getWrongExerciseHistory({
      course_id: courseId.value,
      page: 1,
      page_size: 100
    });
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

function cacheAnalysis(payload: {
  key: string;
  response: WrongExerciseAnalyzeResponse;
}) {
  analysisHistoryMap.value[payload.key] = payload.response;
}

function isAnalyzed(item: any) {
  const key = String(item.questionId || item.id);
  return !!analysisHistoryMap.value[key];
}

const unAnalyzedCount = computed(
  () => filteredRecords.value.filter(r => !isAnalyzed(r)).length
);

// 批量分析（并发+可取消）
const batchAnalyzing = ref(false);
const batchCancelled = ref(false);
const completedCount = ref(0);
const totalToAnalyze = ref(0);
const concurrency = ref(3);
const batchProgressPercent = computed(() =>
  totalToAnalyze.value === 0
    ? 0
    : Math.round((completedCount.value / totalToAnalyze.value) * 100)
);
const failedCount = ref(0);
const successCount = ref(0);
const newlyAnalyzedKeys = ref<Set<string>>(new Set());

function cancelBatch() {
  batchCancelled.value = true;
}

async function batchAnalyze(customList?: any[]) {
  if (batchAnalyzing.value) return;
  const toAnalyze =
    customList || filteredRecords.value.filter(r => !isAnalyzed(r));
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
      if (
        completedCount.value === totalToAnalyze.value ||
        (batchCancelled.value && running === 0)
      ) {
        batchAnalyzing.value = false;
        if (batchCancelled.value) {
          ElMessage.info(
            `已取消：完成 ${completedCount.value}/${totalToAnalyze.value}，成功 ${successCount.value}，失败 ${failedCount.value}`
          );
        } else {
          ElMessage.success(
            `分析完成：成功 ${successCount.value}，失败 ${failedCount.value}`
          );
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
            const { analyzeWrongExercise } = await import(
              "@/api/frontend/wrong-exercise"
            );
            const { data } = await analyzeWrongExercise({
              course_id: courseId.value,
              original_exercise_id: key,
              original_exercise_content: item.stem,
              student_answer: item.userAnswer || "",
              correct_answer: item.answer || ""
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

const formatTime = (t: string) => dayjs(t).format("YYYY-MM-DD HH:mm");
const sourceText = (s: number) =>
  (({ 1: "作业", 2: "考试", 3: "自测题" }) as any)[s] || "未知";

const goBack = () => {
  if (!embedded.value) router.back();
};

onMounted(async () => {
  await fetchList();
  fetchAnalyzedHistory();
});
</script>

<style scoped>
@keyframes pop-in {
  0% {
    opacity: 0;
    transform: scale(0.6);
  }

  40% {
    opacity: 1;
    transform: scale(1.05);
  }

  60% {
    transform: scale(0.95);
  }

  100% {
    transform: scale(1);
  }
}

.practice-container {
  min-height: 100vh;
  padding: 70px 0 30px;
  background-color: #f5f7fa;
}

.practice-container.dark {
  background-color: transparent;
}

.practice-container[data-embedded="true"] {
  min-height: auto;
  padding: 20px 0 0;
  background-color: transparent;
}

.header {
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  height: 60px;
  background: #fff;
  box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
}

.header.dark {
  background: #1d1d1d;
  box-shadow: 0 2px 8px rgb(0 0 0 / 30%);
}

.header .header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 1200px;
  height: 100%;
  padding: 0 32px;
  margin: 0 auto;
}

.header .title {
  font-size: 18px;
  font-weight: 600;
}

.header.dark .title {
  color: #e0e0e0;
}

.header .placeholder {
  min-width: 60px;
}

.main-content {
  max-width: 1200px;
  padding: 0 32px;
  margin: 0 auto;
}

.main-content.dark :deep(.el-card) {
  color: #e0e0e0;
  background-color: #2a2a2a;
  border-color: #3e3e3e;
}

.main-content.dark :deep(.el-card__header) {
  color: #e0e0e0;
  border-bottom-color: #3e3e3e;
}

.main-content.dark :deep(.el-empty__description p) {
  color: #aaa;
}

.main-content.dark :deep(.el-empty__image img) {
  opacity: 0.8;
  filter: brightness(0.7);
}

.practice-container[data-embedded="true"] .main-content {
  width: 100%;
  max-width: 100%;
  padding: 0;
}

.practice-container[data-embedded="true"] .el-card {
  width: 100%;
  background: transparent;
  border: none;
  box-shadow: none;
}

.practice-container[data-embedded="true"] :deep(.el-card__header) {
  padding-right: 0;
  padding-left: 0;
}

.practice-container[data-embedded="true"] :deep(.el-card__body) {
  padding-right: 0;
  padding-left: 0;
}

.card-header {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* 标题样式 */
.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 0 0 20px;
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}

.title-icon {
  font-size: 28px;
}

.count-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 28px;
  padding: 0 10px;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #667eea, #764ba2);
  border-radius: 14px;
  box-shadow: 0 2px 8px rgb(102 126 234 / 30%);
}

/* 筛选区域 */
.filters-section {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  background: linear-gradient(135deg, #f8f9ff, #fff);
  border: 1px solid #e8eaf6;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 4%);
}

.filters-section.dark {
  background: linear-gradient(135deg, #1a1f2e, #252b3b);
  border-color: #2d3548;
  box-shadow: 0 2px 12px rgb(0 0 0 / 20%);
}

/* 筛选行 */
.filter-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.primary-filters {
  padding-bottom: 16px;
  border-bottom: 1px solid #e8eaf6;
}

.filters-section.dark .primary-filters {
  border-bottom-color: #2d3548;
}

.batch-operations {
  justify-content: space-between;
}

/* 筛选组 */
.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.date-group {
  flex: 1;
  min-width: 280px;
}

.filter-label {
  font-size: 13px;
  font-weight: 600;
  color: #5a6b8a;
  letter-spacing: 0.3px;
}

.filters-section.dark .filter-label {
  color: #94a3b8;
}

.filter-select {
  width: 140px;
}

/* 下拉框圆角设计 */
.filter-select :deep(.el-input__wrapper) {
  border-radius: 10px;
}

/* 下拉菜单面板圆角设计 */
:deep(.el-select-dropdown) {
  border-radius: 10px;
}

.filter-date {
  width: 100%;
}

/* 日期选择器圆角设计 */
.filter-date :deep(.el-input__wrapper) {
  border-radius: 10px;
}

/* 并发数输入框圆角设计 */
.concurrency-input :deep(.el-input__wrapper) {
  border-radius: 10px;
}

/* 筛选操作按钮 */
.filter-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgb(0 0 0 / 15%);
}

.primary-btn {
  background: linear-gradient(135deg, #667eea, #764ba2);
  border: none;
}

.primary-btn:hover {
  background: linear-gradient(135deg, #5568d3, #6a3f8f);
}

.analyze-btn {
  background: linear-gradient(135deg, #11998e, #38ef7d);
  border: none;
}

.analyze-btn:hover {
  background: linear-gradient(135deg, #0e8577, #2dd46a);
}

/* 批量操作区域 */
.batch-left,
.batch-right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.concurrency-control {
  display: flex;
  align-items: center;
  gap: 8px;
}

.concurrency-input {
  width: 120px;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }

  .filter-group,
  .date-group {
    width: 100%;
  }

  .filter-select,
  .filter-date {
    width: 100%;
  }

  .filter-actions {
    width: 100%;
    margin-left: 0;
  }

  .batch-operations {
    flex-direction: column;
    align-items: stretch;
  }

  .batch-left,
  .batch-right {
    width: 100%;
    justify-content: flex-start;
  }
}

@media (max-width: 768px) {
  .filters-section {
    padding: 16px;
  }

  .header-title {
    font-size: 20px;
  }

  .action-btn {
    padding: 8px 16px;
    font-size: 13px;
  }
}

.wrong-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.wrong-item {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 5%);
}

.wrong-item.dark {
  background: #333;
  box-shadow: 0 1px 3px rgb(0 0 0 / 20%);
}

.w-title {
  margin-bottom: 6px;
  font-weight: 600;
}

.wrong-item.dark .w-title {
  color: #e0e0e0;
}

.w-meta {
  display: flex;
  gap: 10px;
  align-items: center;
  font-size: 13px;
  color: #666;
}

.wrong-item.dark .w-meta {
  color: #aaa;
}

.w-meta .tag {
  padding: 2px 6px;
  background: #f5f7ff;
  border-radius: 4px;
}

.wrong-item.dark .w-meta .tag {
  color: #ccc;
  background: #444;
}

.w-meta .right {
  color: #2f9e44;
  background: #f0fff4;
}

.w-meta .time {
  margin-left: auto;
  color: #999;
}

.actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.pager {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

/* Overlay */
.batch-overlay {
  position: fixed;
  inset: 0;
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 45%);
}

.overlay-content {
  padding: 30px 40px;
  text-align: center;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgb(0 0 0 / 15%);
}

.overlay-content.dark {
  color: #e0e0e0;
  background: #2a2a2a;
}

.overlay-content h3 {
  margin: 0 0 10px;
}

.overlay-content .stats {
  display: flex;
  gap: 14px;
  justify-content: center;
  margin: 0 0 16px;
  font-size: 13px;
  color: #555;
}

.overlay-content.dark .stats {
  color: #aaa;
}

/* Fade + new analyzed animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.analyzed.new-analyzed {
  position: relative;
  animation: pop-in 1.1s ease;
}
</style>
