<template>
  <div class="student-assistant-page" :class="currentTheme">
    <section v-loading="loading" class="assistant-hero">
      <div class="hero-copy">
        <div class="eyebrow">学习画像</div>
        <h3>{{ learnerName }}</h3>
        <p>{{ courseName }}</p>
      </div>
      <div class="hero-actions">
        <el-select
          v-model="selectedCourseId"
          class="course-select"
          placeholder="全部课程"
          clearable
          :loading="courseLoading"
          @change="loadProfile"
        >
          <el-option
            v-for="course in courseOptions"
            :key="course.id"
            :label="course.name"
            :value="course.id"
          />
        </el-select>
        <el-button
          type="primary"
          :icon="Refresh"
          :loading="refreshing"
          @click="handleRefresh"
        >
          刷新画像
        </el-button>
      </div>
    </section>

    <el-alert
      v-if="errorText"
      class="page-alert"
      type="warning"
      :closable="false"
      show-icon
      :title="errorText"
    />

    <section class="metric-strip">
      <div v-for="item in metricItems" :key="item.label" class="metric-cell">
        <span>{{ item.label }}</span>
        <b>{{ item.value }}</b>
      </div>
    </section>

    <section class="assistant-layout">
      <div class="main-stack">
        <section class="panel">
          <div class="panel-title">
            <el-icon><TrendCharts /></el-icon>
            <span>能力维度</span>
          </div>
          <div v-if="dimensions.length" class="dimension-grid">
            <button
              v-for="dimension in dimensions"
              :key="dimension.key || dimension.label"
              type="button"
              class="dimension-card"
              @click="selectedDimension = dimension"
            >
              <div class="dimension-head">
                <span>{{ dimension.label }}</span>
                <b>{{ dimension.value }}%</b>
              </div>
              <el-progress
                :percentage="dimension.value"
                :show-text="false"
                :stroke-width="8"
                :color="dimension.color"
              />
              <p>{{ readableText(dimension.description, "暂无维度说明") }}</p>
              <div class="tag-row">
                <el-tag v-if="dimension.level" effect="plain" size="small">
                  {{ text(dimension.level) }}
                </el-tag>
                <el-tag v-if="dimension.trend" effect="plain" size="small">
                  {{ text(dimension.trend) }}
                </el-tag>
              </div>
            </button>
          </div>
          <el-empty v-else description="暂无画像维度" :image-size="92" />
        </section>

        <section class="panel">
          <div class="panel-title">
            <el-icon><Histogram /></el-icon>
            <span>知识掌握</span>
          </div>
          <div v-if="knowledgeMap.length" class="knowledge-list">
            <div
              v-for="item in knowledgeMap"
              :key="item.label"
              class="knowledge-row"
            >
              <span>{{ text(item.label, "知识点") }}</span>
              <div class="knowledge-bar">
                <i :style="{ width: `${progress(item.mastery)}%` }" />
              </div>
              <b>{{ percent(item.mastery) }}</b>
            </div>
          </div>
          <el-empty v-else description="暂无知识点数据" :image-size="92" />
        </section>
      </div>

      <aside class="side-stack">
        <section class="panel compact-panel">
          <div class="panel-title">
            <el-icon><Collection /></el-icon>
            <span>学习标签</span>
          </div>
          <div v-if="profileTags.length" class="tag-row large">
            <el-tag v-for="tag in profileTags" :key="tag" effect="plain" round>
              {{ text(tag, "学习标签") }}
            </el-tag>
          </div>
          <el-empty v-else description="暂无标签" :image-size="70" />
        </section>

        <section class="panel compact-panel">
          <div class="panel-title">
            <el-icon><Flag /></el-icon>
            <span>关注项</span>
          </div>
          <div v-if="riskFlags.length" class="risk-list">
            <el-tag
              v-for="flag in riskFlags"
              :key="flag"
              type="warning"
              effect="plain"
            >
              {{ text(flag, "需关注") }}
            </el-tag>
          </div>
          <el-empty v-else description="暂无风险项" :image-size="70" />
        </section>
      </aside>
    </section>

    <section class="activity-grid">
      <div class="panel">
        <div class="panel-title">
          <el-icon><DataAnalysis /></el-icon>
          <span>画像事件</span>
        </div>
        <el-timeline v-if="events.length">
          <el-timeline-item
            v-for="event in events"
            :key="`${event.event_source}-${event.trigger_id || event.summary}`"
            :timestamp="compactRef(event.trigger_id, '触发')"
            :type="tagType(event.decision)"
          >
            <div class="activity-title">
              {{ text(event.event_source, "画像事件") }}
              <el-tag
                size="small"
                effect="plain"
                :type="tagType(event.decision)"
              >
                {{ text(event.decision) }}
              </el-tag>
            </div>
            <p>
              {{
                readableText(event.summary || event.skip_reason, "事件已记录")
              }}
            </p>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无画像事件" :image-size="80" />
      </div>

      <div class="panel">
        <div class="panel-title">
          <el-icon><Clock /></el-icon>
          <span>历史版本</span>
        </div>
        <div v-if="historyList.length" class="history-list">
          <div
            v-for="item in historyList"
            :key="`${item.profile_id}-${item.profile_version}`"
            class="history-item"
          >
            <div>
              <b>版本 {{ item.profile_version }}</b>
              <span>{{ dateText(item.updated_at) }}</span>
            </div>
            <p>
              {{
                readableText(
                  item.summary || item.updated_reason,
                  "画像快照已更新"
                )
              }}
            </p>
          </div>
        </div>
        <el-empty v-else description="暂无历史版本" :image-size="80" />
      </div>

      <div class="panel">
        <div class="panel-title">
          <el-icon><EditPen /></el-icon>
          <span>纠偏记录</span>
        </div>
        <div v-if="corrections.length" class="history-list">
          <div
            v-for="item in corrections"
            :key="item.correction_id"
            class="history-item"
          >
            <div>
              <b>{{ text(item.dimension_key, "画像维度") }}</b>
              <el-tag size="small" effect="plain" :type="tagType(item.status)">
                {{ text(item.status) }}
              </el-tag>
            </div>
            <p>{{ readableText(item.reason, "暂无原因") }}</p>
          </div>
        </div>
        <el-empty v-else description="暂无纠偏记录" :image-size="80" />
      </div>
    </section>

    <el-dialog
      v-model="dimensionVisible"
      width="520px"
      :title="selectedDimension?.label || '维度详情'"
      class="account-assistant-dialog"
    >
      <div v-if="selectedDimension" class="dimension-detail">
        <div class="detail-score">{{ selectedDimension.value }}%</div>
        <p>{{ readableText(selectedDimension.description, "暂无维度说明") }}</p>
        <div v-if="dimensionEvidence.length" class="evidence-list">
          <el-tag v-for="item in dimensionEvidence" :key="item" effect="plain">
            {{ readableText(item, "依据") }}
          </el-tag>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import {
  Clock,
  Collection,
  DataAnalysis,
  EditPen,
  Flag,
  Histogram,
  Refresh,
  TrendCharts
} from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { getFrontendCourseList } from "@/api/frontend/course";
import {
  getAssistantProfileCurrent,
  listAssistantProfileCorrections,
  listAssistantProfileEvents,
  listAssistantProfileHistory,
  refreshAssistantProfile,
  type AssistantProfileCorrectionItem,
  type AssistantProfileCurrentResp,
  type AssistantProfileDimension,
  type AssistantProfileEvent,
  type AssistantProfileHistoryItem
} from "@/api/frontend/assistant";
import {
  backendText,
  compactRefLabel,
  dateText,
  durationText,
  inlineBackendText,
  percentLabel,
  progressValue,
  tagType
} from "./assistantDisplay";

defineProps<{
  currentTheme?: string;
}>();

interface CourseOption {
  id: number;
  name: string;
}

type DisplayDimension = AssistantProfileDimension & {
  color: string;
  value: number;
};

const palette = ["#6f9cf8", "#18b6a3", "#f1a65a", "#8f7cf6", "#ef6f8f"];

const loading = ref(false);
const refreshing = ref(false);
const courseLoading = ref(false);
const errorText = ref("");
const selectedCourseId = ref<number>();
const courseOptions = ref<CourseOption[]>([]);
const profile = ref<AssistantProfileCurrentResp>();
const historyList = ref<AssistantProfileHistoryItem[]>([]);
const events = ref<AssistantProfileEvent[]>([]);
const corrections = ref<AssistantProfileCorrectionItem[]>([]);
const selectedDimension = ref<DisplayDimension>();

const requestParams = computed(() =>
  selectedCourseId.value ? { course_id: selectedCourseId.value } : undefined
);

const learnerName = computed(() => profile.value?.learner?.name || "我的画像");
const courseName = computed(
  () =>
    profile.value?.learner?.course ||
    courseOptions.value.find(item => item.id === selectedCourseId.value)
      ?.name ||
    "全部课程"
);

const metricItems = computed(() => [
  { label: "置信度", value: percentLabel(profile.value?.confidence) },
  {
    label: "画像版本",
    value: profile.value?.profile_version
      ? `V${profile.value.profile_version}`
      : "暂无"
  },
  { label: "最近更新", value: dateText(profile.value?.updated_at) },
  {
    label: "学习时长",
    value: durationText(profile.value?.learner?.study_minutes || 0)
  },
  {
    label: "入课天数",
    value: profile.value?.learner?.enroll_days
      ? `${profile.value.learner.enroll_days} 天`
      : "暂无"
  },
  {
    label: "更新状态",
    value: backendText(profile.value?.last_update_decision, "暂无")
  }
]);

const dimensions = computed<DisplayDimension[]>(() =>
  (profile.value?.dimensions || []).map((dimension, index) => ({
    ...dimension,
    label: backendText(dimension.label || dimension.key, "画像维度"),
    value: progressValue(dimension.value ?? dimension.score),
    color: dimension.color || palette[index % palette.length]
  }))
);

const knowledgeMap = computed(() => profile.value?.knowledge_map || []);
const profileTags = computed(() => profile.value?.tags || []);
const riskFlags = computed(() => profile.value?.risk_flags || []);
const dimensionVisible = computed({
  get: () => !!selectedDimension.value,
  set: value => {
    if (!value) selectedDimension.value = undefined;
  }
});
const dimensionEvidence = computed(
  () => selectedDimension.value?.evidence || []
);

const text = (value?: string | number | null, fallback = "暂无") =>
  backendText(value, fallback);
const readableText = (value?: string | number | null, fallback = "暂无") =>
  inlineBackendText(value, fallback);
const progress = (value?: number | null) => progressValue(value);
const percent = (value?: number | null) => percentLabel(value);
const compactRef = (value?: string | number | null, label = "编号") =>
  compactRefLabel(value, label);

const normalizeCourse = (course: any): CourseOption | null => {
  const id = Number(course.course_id ?? course.courseId ?? course.id);
  if (!id) return null;
  return {
    id,
    name:
      course.course_name ||
      course.courseName ||
      course.name ||
      course.title ||
      `课程 ${id}`
  };
};

const loadCourses = async () => {
  courseLoading.value = true;
  try {
    const { code, data } = await getFrontendCourseList({
      pageNum: 1,
      pageSize: 100
    });
    if (code === 200) {
      courseOptions.value = (data?.list || [])
        .map(normalizeCourse)
        .filter(Boolean);
      if (!selectedCourseId.value && courseOptions.value.length) {
        selectedCourseId.value = courseOptions.value[0].id;
      }
    }
  } catch {
    courseOptions.value = [];
  } finally {
    courseLoading.value = false;
  }
};

const loadProfile = async () => {
  loading.value = true;
  errorText.value = "";
  try {
    const params = requestParams.value;
    const [currentResp, historyResp, eventsResp, correctionsResp] =
      await Promise.allSettled([
        getAssistantProfileCurrent(params),
        listAssistantProfileHistory({ ...params, limit: 12 }),
        listAssistantProfileEvents({ ...params, limit: 12 }),
        listAssistantProfileCorrections({ ...params, limit: 12 })
      ]);

    if (currentResp.status === "fulfilled" && currentResp.value.code === 200) {
      profile.value = currentResp.value.data;
    } else {
      profile.value = undefined;
      errorText.value = "学习画像暂不可用";
    }

    historyList.value =
      historyResp.status === "fulfilled" && historyResp.value.code === 200
        ? historyResp.value.data.items || []
        : [];
    events.value =
      eventsResp.status === "fulfilled" && eventsResp.value.code === 200
        ? eventsResp.value.data.items || []
        : [];
    corrections.value =
      correctionsResp.status === "fulfilled" &&
      correctionsResp.value.code === 200
        ? correctionsResp.value.data.items || []
        : [];
  } catch {
    errorText.value = "学习画像暂不可用";
  } finally {
    loading.value = false;
  }
};

const handleRefresh = async () => {
  refreshing.value = true;
  try {
    const { code, data, msg } = await refreshAssistantProfile({
      ...requestParams.value,
      trigger: "student_profile_page",
      message: "学生主动刷新画像"
    });
    if (code === 200 && data?.accepted !== false) {
      ElMessage.success(
        backendText(data.decision, data.message || "画像已刷新")
      );
      await loadProfile();
    } else {
      ElMessage.warning(msg || data?.message || "画像刷新暂未生效");
    }
  } catch {
    ElMessage.error("画像刷新失败");
  } finally {
    refreshing.value = false;
  }
};

onMounted(async () => {
  await loadCourses();
  await loadProfile();
});
</script>

<style scoped lang="scss">
.student-assistant-page {
  display: flex;
  flex-direction: column;
  gap: 18px;
  color: #27324a;

  &.dark {
    color: #e6edf7;
  }
}

.assistant-hero,
.metric-strip,
.panel {
  background: linear-gradient(
    145deg,
    rgb(255 255 255 / 94%),
    rgb(247 250 255 / 90%)
  );
  border: 1px solid rgb(151 180 247 / 16%);
  border-radius: 18px;
  box-shadow: none;

  .dark &,
  .student-assistant-page.dark & {
    background: linear-gradient(
      145deg,
      rgb(18 28 46 / 96%),
      rgb(15 23 42 / 92%)
    );
    border-color: rgb(96 165 250 / 16%);
    box-shadow: none;
  }
}

.assistant-hero {
  display: flex;
  gap: 18px;
  align-items: center;
  justify-content: space-between;
  min-height: 132px;
  padding: 26px;
  overflow: hidden;

  .hero-copy {
    min-width: 0;
  }

  .eyebrow {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 700;
    color: #6f8fea;
  }

  h3 {
    margin: 0;
    font-size: 30px;
    font-weight: 800;
    letter-spacing: 0;
    color: #17223b;

    .dark & {
      color: #f8fbff;
    }
  }

  p {
    margin: 8px 0 0;
    color: #6b7590;

    .dark & {
      color: #aab7cf;
    }
  }
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;

  .course-select {
    width: 220px;
  }
}

.page-alert {
  border-radius: 14px;
}

.metric-strip {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  padding: 18px;
}

.metric-cell {
  min-width: 0;
  padding: 0 16px;
  border-right: 1px solid rgb(151 180 247 / 14%);

  &:last-child {
    border-right: 0;
  }

  span {
    display: block;
    margin-bottom: 8px;
    font-size: 13px;
    color: #7a849c;
  }

  b {
    display: block;
    overflow: hidden;
    font-size: 20px;
    color: #1f2c48;
    text-overflow: ellipsis;
    white-space: nowrap;

    .dark & {
      color: #f5f8ff;
    }
  }
}

.assistant-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 320px;
  gap: 18px;
}

.main-stack,
.side-stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-width: 0;
}

.panel {
  min-width: 0;
  padding: 22px;
}

.compact-panel {
  min-height: 184px;
}

.panel-title {
  display: flex;
  gap: 9px;
  align-items: center;
  margin-bottom: 18px;
  font-size: 17px;
  font-weight: 800;
  color: #1e2a44;

  .dark & {
    color: #f3f7ff;
  }

  .el-icon {
    width: 30px;
    height: 30px;
    color: #6f8fea;
    background: rgb(151 180 247 / 14%);
    border-radius: 10px;
  }
}

.dimension-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.dimension-card {
  min-width: 0;
  padding: 16px;
  text-align: left;
  cursor: pointer;
  background: rgb(248 251 255 / 74%);
  border: 1px solid rgb(151 180 247 / 14%);
  border-radius: 14px;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: rgb(111 156 248 / 44%);
    transform: translateY(-2px);
  }

  .dark & {
    background: rgb(15 23 42 / 72%);
    border-color: rgb(96 165 250 / 14%);
  }

  p {
    display: -webkit-box;
    min-height: 44px;
    margin: 12px 0;
    overflow: hidden;
    color: #69748e;
    line-height: 22px;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;

    .dark & {
      color: #aab7cf;
    }
  }
}

.dimension-head {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;

  span,
  b {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    font-weight: 800;
    color: #263452;
  }

  b {
    font-size: 20px;
    color: #496fde;
  }
}

.tag-row,
.risk-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-row.large {
  gap: 10px;
}

.knowledge-list,
.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.knowledge-row {
  display: grid;
  grid-template-columns: minmax(120px, 0.9fr) minmax(120px, 1fr) 56px;
  gap: 12px;
  align-items: center;

  span,
  b {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: #47546d;
  }

  b {
    text-align: right;
    color: #25324d;
  }
}

.knowledge-bar {
  height: 9px;
  overflow: hidden;
  background: rgb(151 180 247 / 16%);
  border-radius: 999px;

  i {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #6f9cf8, #18b6a3);
    border-radius: inherit;
  }
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;
}

.activity-title {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
  font-weight: 800;
}

.activity-grid p,
.history-item p {
  margin: 0;
  color: #6b7590;
  line-height: 22px;
}

.history-item {
  padding: 13px 14px;
  background: rgb(248 251 255 / 78%);
  border: 1px solid rgb(151 180 247 / 12%);
  border-radius: 13px;

  .dark & {
    background: rgb(15 23 42 / 70%);
    border-color: rgb(96 165 250 / 14%);
  }

  div {
    display: flex;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 6px;
  }

  b,
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  b {
    color: #24314e;
  }

  span {
    color: #8b95aa;
  }
}

.dimension-detail {
  .detail-score {
    margin-bottom: 10px;
    font-size: 36px;
    font-weight: 900;
    color: #496fde;
  }

  p {
    margin: 0 0 14px;
    color: #5f6b83;
    line-height: 24px;
  }
}

.evidence-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

@media (width <= 1199px) {
  .metric-strip {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    row-gap: 16px;
  }

  .metric-cell:nth-child(3n) {
    border-right: 0;
  }

  .assistant-layout {
    grid-template-columns: 1fr;
  }

  .side-stack {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 767px) {
  .assistant-hero {
    align-items: stretch;
    padding: 20px;
    flex-direction: column;

    h3 {
      font-size: 24px;
    }
  }

  .hero-actions,
  .hero-actions .course-select {
    width: 100%;
  }

  .metric-strip,
  .dimension-grid,
  .side-stack,
  .activity-grid {
    grid-template-columns: 1fr;
  }

  .metric-cell {
    padding: 10px 0;
    border-right: 0;
    border-bottom: 1px solid rgb(151 180 247 / 12%);

    &:last-child {
      border-bottom: 0;
    }
  }

  .knowledge-row {
    grid-template-columns: 1fr;
  }
}
</style>
