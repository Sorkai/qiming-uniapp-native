<template>
  <div class="student-assistant-page" :class="currentTheme">
    <section v-loading="loading" class="assistant-hero">
      <div class="hero-copy">
        <div class="eyebrow">学习画像</div>
        <h3>{{ learnerName }}</h3>
        <p>{{ profileDigest }}</p>
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

    <section class="profile-summary-bar">
      <div v-for="item in metricItems" :key="item.label" class="summary-cell">
        <span>{{ item.label }}</span>
        <b>{{ item.value }}</b>
      </div>
    </section>

    <section class="profile-studio">
      <div class="profile-map-panel">
        <div class="section-title">
          <el-icon><TrendCharts /></el-icon>
          <span>画像地形</span>
        </div>
        <div v-if="dimensions.length" class="profile-map-wrap">
          <div class="profile-map" :style="{ '--profile-shape': radarPolygon }">
            <span class="radar-ring ring-outer" />
            <span class="radar-ring ring-middle" />
            <span class="radar-ring ring-inner" />
            <span class="radar-axis horizontal" />
            <span class="radar-axis vertical" />
            <div class="radar-shape" />
            <button
              v-for="point in radarPoints"
              :key="point.key"
              type="button"
              class="radar-point"
              :style="point.style"
              @click="selectedDimension = point.dimension"
            >
              <b>{{ point.value }}%</b>
              <span>{{ point.shortLabel }}</span>
            </button>
          </div>
          <div class="profile-map-copy">
            <span>{{ courseName }}</span>
            <h4>{{ readinessTitle }}</h4>
            <p>{{ profileDigest }}</p>
            <div class="insight-pair">
              <div>
                <small>优势</small>
                <strong>{{ strengthText }}</strong>
              </div>
              <div>
                <small>先补</small>
                <strong>{{ focusText }}</strong>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="profile-empty compact">
          完成一次课程学习后，画像地形会在这里生成。
        </div>
      </div>

      <aside class="signal-panel">
        <div class="section-title">
          <el-icon><Collection /></el-icon>
          <span>学习信号</span>
        </div>
        <div class="signal-list">
          <div v-for="signal in learningSignals" :key="signal.title">
            <span :class="signal.tone">{{ signal.label }}</span>
            <strong>{{ signal.title }}</strong>
            <p>{{ signal.desc }}</p>
          </div>
        </div>
      </aside>
    </section>

    <section class="profile-field-grid">
      <div class="dimension-spectrum">
        <div class="section-title">
          <el-icon><DataAnalysis /></el-icon>
          <span>能力走势</span>
        </div>
        <div v-if="dimensions.length" class="dimension-lanes">
          <button
            v-for="(dimension, index) in dimensions"
            :key="dimension.key || dimension.label"
            type="button"
            class="dimension-lane"
            @click="selectedDimension = dimension"
          >
            <span class="lane-index">{{
              String(index + 1).padStart(2, "0")
            }}</span>
            <div class="lane-main">
              <div class="lane-head">
                <strong>{{ dimension.label }}</strong>
                <span>{{ dimensionTone(dimension) }}</span>
              </div>
              <p>{{ dimensionNarrative(dimension) }}</p>
              <div class="lane-track">
                <i
                  :style="{
                    width: `${dimension.value}%`,
                    backgroundColor: dimension.color
                  }"
                />
              </div>
              <div
                v-if="dimensionEvidencePreview(dimension).length"
                class="evidence-strip"
              >
                <span
                  v-for="item in dimensionEvidencePreview(dimension)"
                  :key="item"
                >
                  {{ item }}
                </span>
              </div>
            </div>
            <b class="lane-score">{{ dimension.value }}%</b>
          </button>
        </div>
        <div v-else class="profile-empty">当前课程还没有足够的画像维度。</div>
      </div>

      <aside class="knowledge-panel">
        <div class="section-title">
          <el-icon><Histogram /></el-icon>
          <span>知识热力</span>
        </div>
        <div v-if="knowledgeHeatmap.length" class="knowledge-heatmap">
          <div
            v-for="item in knowledgeHeatmap"
            :key="item.label"
            class="knowledge-cell"
            :style="{
              backgroundColor: item.color,
              borderColor: item.borderColor
            }"
          >
            <span>{{ item.label }}</span>
            <b>{{ item.percent }}</b>
          </div>
        </div>
        <div v-else class="profile-empty compact">
          继续完成章节任务后，知识点掌握会形成热力分布。
        </div>
      </aside>
    </section>

    <section class="profile-storyline">
      <div class="section-title">
        <el-icon><Clock /></el-icon>
        <span>画像记录</span>
      </div>
      <div class="story-columns">
        <div class="story-column">
          <div class="story-label">最近事件</div>
          <div v-if="events.length" class="story-list">
            <div
              v-for="event in events.slice(0, 4)"
              :key="`${event.event_source}-${event.trigger_id || event.summary}`"
              class="story-item"
            >
              <span>{{ text(event.event_source, "画像事件") }}</span>
              <strong>{{ text(event.decision, "已记录") }}</strong>
              <p>
                {{
                  readableText(
                    event.summary || event.skip_reason,
                    "画像事件已同步"
                  )
                }}
              </p>
            </div>
          </div>
          <div v-else class="story-empty">还没有新的画像事件。</div>
        </div>

        <div class="story-column">
          <div class="story-label">版本变化</div>
          <div v-if="historyList.length" class="story-list">
            <div
              v-for="item in historyList.slice(0, 4)"
              :key="`${item.profile_id}-${item.profile_version}`"
              class="story-item"
            >
              <span>版本 {{ item.profile_version }}</span>
              <strong>{{ dateText(item.updated_at) }}</strong>
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
          <div v-else class="story-empty">首个版本形成后会保留变化记录。</div>
        </div>

        <div class="story-column">
          <div class="story-label">纠偏记录</div>
          <div v-if="corrections.length" class="story-list">
            <div
              v-for="item in corrections.slice(0, 4)"
              :key="item.correction_id"
              class="story-item"
            >
              <span>{{ text(item.dimension_key, "画像维度") }}</span>
              <strong>{{ text(item.status, "已记录") }}</strong>
              <p>{{ readableText(item.reason, "教师已完成画像校准") }}</p>
            </div>
          </div>
          <div v-else class="story-empty">教师校准后会同步到这里。</div>
        </div>
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
        <p>{{ dimensionNarrative(selectedDimension) }}</p>
        <div v-if="dimensionEvidence.length" class="detail-evidence">
          <span v-for="item in dimensionEvidence" :key="item">
            {{ readableText(item, "依据") }}
          </span>
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
  dateText,
  durationText,
  inlineBackendText,
  percentLabel,
  progressValue
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

interface RadarPoint {
  key: string;
  dimension: DisplayDimension;
  left: string;
  top: string;
  shortLabel: string;
  value: number;
  style: Record<string, string>;
}

interface LearningSignal {
  label: string;
  title: string;
  desc: string;
  tone: "calm" | "good" | "warn" | "hot";
}

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
      : "生成中"
  },
  {
    label: "最近更新",
    value: profile.value?.updated_at
      ? dateText(profile.value.updated_at)
      : "待更新"
  },
  {
    label: "学习时长",
    value: durationText(profile.value?.learner?.study_minutes || 0)
  },
  {
    label: "入课天数",
    value: profile.value?.learner?.enroll_days
      ? `${profile.value.learner.enroll_days} 天`
      : "0 天"
  },
  {
    label: "更新状态",
    value: backendText(profile.value?.last_update_decision, "待生成")
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

const scoreBand = (value: number) => {
  if (value >= 80) return "优势保持";
  if (value >= 60) return "稳定推进";
  if (value >= 40) return "正在建立";
  return "优先补强";
};

const dimensionTone = (dimension: DisplayDimension) => {
  const level = backendText(dimension.level, "");
  const trend = backendText(dimension.trend, "");
  return [level, trend || scoreBand(dimension.value)]
    .filter(Boolean)
    .join(" · ");
};

const cleanEvidence = (items?: string[]) =>
  Array.from(
    new Set(
      (items || [])
        .map(item => readableText(item, ""))
        .map(item => item.trim())
        .filter(Boolean)
    )
  );

const dimensionEvidencePreview = (dimension: DisplayDimension) =>
  cleanEvidence([
    ...(dimension.evidence || []),
    ...(dimension.evidence_refs || []),
    ...(dimension.source_refs || [])
  ]).slice(0, 2);

const dimensionNarrative = (dimension: DisplayDimension) => {
  const described = readableText(dimension.description, "");
  if (described) return described;

  const level = backendText(dimension.level, "");
  const trend = backendText(dimension.trend, "");
  const evidence = dimensionEvidencePreview(dimension)[0];
  const base =
    dimension.value >= 80
      ? "已经比较稳定，可以继续承接综合任务。"
      : dimension.value >= 60
        ? "具备继续推进的基础，适合用章节练习巩固。"
        : dimension.value >= 40
          ? "仍在建立中，建议配合例题讲解和短频复盘。"
          : "是当前优先补强点，先从基础资源和关键例题回收。";
  const trendText = trend ? `趋势：${trend}。` : "";
  const levelText = level ? `状态：${level}。` : "";
  const evidenceText = evidence ? `依据：${evidence}。` : "";
  return `${dimension.label}${base}${levelText}${trendText}${evidenceText}`;
};

const sortedDimensions = computed(() =>
  [...dimensions.value].sort((a, b) => b.value - a.value)
);
const strongestDimensions = computed(() => sortedDimensions.value.slice(0, 2));
const focusDimensions = computed(() =>
  [...dimensions.value].sort((a, b) => a.value - b.value).slice(0, 2)
);
const averageScore = computed(() => {
  if (!dimensions.value.length) return progressValue(profile.value?.confidence);
  const total = dimensions.value.reduce((sum, item) => sum + item.value, 0);
  return Math.round(total / dimensions.value.length);
});
const readinessTitle = computed(() => {
  if (averageScore.value >= 80) return "画像表现稳定";
  if (averageScore.value >= 60) return "学习节奏正在成型";
  if (averageScore.value >= 40) return "处在关键补强期";
  return "先接住基础节点";
});
const strengthText = computed(
  () =>
    strongestDimensions.value.map(item => item.label).join("、") || "等待数据"
);
const focusText = computed(
  () => focusDimensions.value.map(item => item.label).join("、") || "等待数据"
);
const profileDigest = computed(() => {
  if (!dimensions.value.length) {
    return `${courseName.value}的画像正在积累，完成章节学习后会形成更细判断。`;
  }
  return `当前${courseName.value}中，${strengthText.value}更稳，${focusText.value}建议先补。`;
});

const shortLabel = (label: string) =>
  label
    .replace(/[能力程度维度掌握学习知识目标动机偏好基础]/g, "")
    .replace(/[与和的]/g, "")
    .slice(0, 4) || label.slice(0, 4);

const radarPoints = computed<RadarPoint[]>(() => {
  const source = dimensions.value.slice(0, 8);
  const count = source.length || 1;
  return source.map((dimension, index) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * index) / count;
    const radius = 12 + (dimension.value / 100) * 36;
    const left = `${50 + Math.cos(angle) * radius}%`;
    const top = `${50 + Math.sin(angle) * radius}%`;
    return {
      key: dimension.key || `${dimension.label}-${index}`,
      dimension,
      left,
      top,
      shortLabel: shortLabel(dimension.label),
      value: dimension.value,
      style: {
        "--tone": dimension.color,
        left,
        top
      }
    };
  });
});

const radarPolygon = computed(() =>
  radarPoints.value.length >= 3
    ? radarPoints.value.map(point => `${point.left} ${point.top}`).join(", ")
    : "50% 12%, 88% 74%, 12% 74%"
);

const heatTone = (value: number) => {
  if (value >= 70) {
    return {
      color: "rgb(24 182 163 / 22%)",
      borderColor: "rgb(24 182 163 / 34%)"
    };
  }
  if (value >= 45) {
    return {
      color: "rgb(111 156 248 / 20%)",
      borderColor: "rgb(111 156 248 / 34%)"
    };
  }
  return {
    color: "rgb(241 166 90 / 20%)",
    borderColor: "rgb(241 166 90 / 36%)"
  };
};

const knowledgeHeatmap = computed(() =>
  knowledgeMap.value.slice(0, 12).map(item => {
    const mastery = progressValue(item.mastery);
    const tone = heatTone(mastery);
    return {
      label: backendText(item.label, readableText(item.label, "知识点")),
      percent: percentLabel(item.mastery),
      ...tone
    };
  })
);

const labelFromBackend = (value?: string | number | null, fallback = "") => {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  if (raw.includes(":")) {
    const [prefix, ...rest] = raw.split(":");
    const prefixText = backendText(prefix, "标签");
    const content = readableText(rest.join(":"), "");
    return content ? `${prefixText}：${content}` : prefixText;
  }
  return backendText(raw, readableText(raw, fallback));
};

const uniqueLabels = (items: string[]) =>
  Array.from(new Set(items.map(item => item.trim()).filter(Boolean)));

const displayTags = computed(() => {
  const labels = uniqueLabels(
    profileTags.value.map(item => labelFromBackend(item))
  ).filter(item => item !== "标签" && item !== "学习标签");
  if (labels.length) return labels.slice(0, 5);
  return strongestDimensions.value.map(
    item => `${scoreBand(item.value)}：${item.label}`
  );
});

const riskLabels = computed(() =>
  uniqueLabels(
    riskFlags.value.map(item => labelFromBackend(item, "关注项"))
  ).slice(0, 4)
);

const learningSignals = computed<LearningSignal[]>(() => {
  const signals: LearningSignal[] = [];
  if (displayTags.value.length) {
    signals.push({
      label: "标签",
      title: displayTags.value.slice(0, 2).join(" / "),
      desc: displayTags.value.slice(2).join("、") || "标签已按课程画像归并。",
      tone: "calm"
    });
  }
  if (riskLabels.value.length) {
    signals.push({
      label: "关注",
      title: riskLabels.value.slice(0, 2).join(" / "),
      desc: "这些信号会影响后续学习路径的优先级。",
      tone: "warn"
    });
  }
  if (focusDimensions.value.length) {
    signals.push({
      label: "先补",
      title: focusText.value,
      desc: "适合拆成短练习、例题回看和错因复盘。",
      tone: "hot"
    });
  }
  signals.push({
    label: "状态",
    title: readinessTitle.value,
    desc: `最近更新：${
      profile.value?.updated_at ? dateText(profile.value.updated_at) : "待更新"
    }。`,
    tone: averageScore.value >= 60 ? "good" : "calm"
  });
  return signals.slice(0, 4);
});

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
  --profile-surface: linear-gradient(
    145deg,
    rgb(255 255 255 / 96%),
    rgb(247 250 255 / 92%)
  );
  --profile-surface-plain: rgb(255 255 255 / 88%);
  --profile-border: rgb(151 180 247 / 18%);
  --profile-line: rgb(151 180 247 / 16%);
  --profile-muted: #66728b;
  --profile-strong: #17223b;
  --profile-soft: rgb(111 156 248 / 10%);

  display: flex;
  flex-direction: column;
  gap: 18px;
  color: #27324a;

  &.dark {
    --profile-surface: linear-gradient(
      145deg,
      rgb(18 28 46 / 96%),
      rgb(13 21 36 / 94%)
    );
    --profile-surface-plain: rgb(16 25 42 / 88%);
    --profile-border: rgb(96 165 250 / 18%);
    --profile-line: rgb(96 165 250 / 16%);
    --profile-muted: #aab7cf;
    --profile-strong: #f7fbff;
    --profile-soft: rgb(96 165 250 / 12%);

    color: #e6edf7;
  }
}

.assistant-hero,
.profile-summary-bar,
.profile-map-panel,
.signal-panel,
.dimension-spectrum,
.knowledge-panel,
.profile-storyline {
  min-width: 0;
  background: var(--profile-surface);
  border: 1px solid var(--profile-border);
  border-radius: 18px;
  box-shadow: none;
}

.assistant-hero {
  display: flex;
  gap: 22px;
  align-items: center;
  justify-content: space-between;
  min-height: 132px;
  padding: 26px 28px;
  overflow: hidden;

  .hero-copy {
    min-width: 0;
  }

  .eyebrow {
    margin-bottom: 8px;
    font-size: 13px;
    font-weight: 800;
    color: #6f8fea;
  }

  h3 {
    margin: 0;
    font-size: 31px;
    font-weight: 900;
    letter-spacing: 0;
    color: var(--profile-strong);
  }

  p {
    max-width: 760px;
    margin: 8px 0 0;
    overflow: hidden;
    color: var(--profile-muted);
    line-height: 24px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;

  .course-select {
    width: 240px;
  }
}

.page-alert {
  border-radius: 14px;
}

.profile-summary-bar {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  padding: 18px;
}

.summary-cell {
  min-width: 0;
  padding: 0 16px;
  border-right: 1px solid var(--profile-line);

  &:last-child {
    border-right: 0;
  }

  span {
    display: block;
    margin-bottom: 8px;
    overflow: hidden;
    font-size: 13px;
    color: var(--profile-muted);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  b {
    display: block;
    overflow: hidden;
    font-size: 20px;
    color: var(--profile-strong);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.section-title {
  display: flex;
  gap: 9px;
  align-items: center;
  margin-bottom: 18px;
  font-size: 17px;
  font-weight: 900;
  color: var(--profile-strong);

  .el-icon {
    width: 31px;
    height: 31px;
    color: #6f8fea;
    background: var(--profile-soft);
    border-radius: 10px;
  }
}

.profile-studio {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 18px;
}

.profile-map-panel,
.signal-panel,
.dimension-spectrum,
.knowledge-panel,
.profile-storyline {
  padding: 22px;
}

.profile-map-wrap {
  display: grid;
  grid-template-columns: minmax(270px, 390px) minmax(0, 1fr);
  gap: 24px;
  align-items: center;
}

.profile-map {
  position: relative;
  width: min(100%, 390px);
  aspect-ratio: 1;
  margin: 0 auto;
  overflow: visible;
  border-radius: 50%;
}

.radar-ring,
.radar-axis,
.radar-shape {
  position: absolute;
  pointer-events: none;
}

.radar-ring {
  inset: 10%;
  border: 1px solid var(--profile-line);
  border-radius: 50%;

  &.ring-middle {
    inset: 24%;
  }

  &.ring-inner {
    inset: 38%;
  }
}

.radar-axis {
  background: var(--profile-line);

  &.horizontal {
    top: 50%;
    right: 10%;
    left: 10%;
    height: 1px;
  }

  &.vertical {
    top: 10%;
    bottom: 10%;
    left: 50%;
    width: 1px;
  }
}

.radar-shape {
  inset: 0;
  background:
    radial-gradient(circle at 50% 50%, rgb(24 182 163 / 24%), transparent 62%),
    linear-gradient(135deg, rgb(111 156 248 / 44%), rgb(24 182 163 / 20%));
  clip-path: polygon(var(--profile-shape));
  filter: drop-shadow(0 18px 32px rgb(52 92 173 / 18%));
}

.radar-point {
  position: absolute;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  justify-content: center;
  width: 82px;
  min-height: 50px;
  padding: 7px 8px;
  color: var(--profile-strong);
  text-align: center;
  cursor: pointer;
  background: color-mix(in srgb, var(--tone) 16%, var(--profile-surface-plain));
  border: 1px solid color-mix(in srgb, var(--tone) 44%, transparent);
  border-radius: 14px;
  transform: translate(-50%, -50%);
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: color-mix(in srgb, var(--tone) 72%, transparent);
    transform: translate(-50%, -52%);
  }

  b,
  span {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  b {
    font-size: 16px;
  }

  span {
    font-size: 12px;
    color: var(--profile-muted);
  }
}

.profile-map-copy {
  min-width: 0;
  padding-left: 22px;
  border-left: 1px solid var(--profile-line);

  > span {
    display: block;
    margin-bottom: 10px;
    overflow: hidden;
    color: #6f8fea;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  h4 {
    margin: 0;
    font-size: 26px;
    font-weight: 900;
    color: var(--profile-strong);
  }

  p {
    margin: 12px 0 20px;
    color: var(--profile-muted);
    line-height: 24px;
  }
}

.insight-pair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  div {
    min-width: 0;
    padding-top: 12px;
    border-top: 1px solid var(--profile-line);
  }

  small {
    display: block;
    margin-bottom: 6px;
    color: var(--profile-muted);
  }

  strong {
    display: block;
    overflow: hidden;
    color: var(--profile-strong);
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.signal-list {
  display: flex;
  flex-direction: column;
  gap: 16px;

  div {
    position: relative;
    min-width: 0;
    padding-left: 16px;
    border-left: 2px solid rgb(111 156 248 / 42%);
  }

  span {
    display: inline-flex;
    align-items: center;
    height: 24px;
    padding: 0 9px;
    margin-bottom: 8px;
    font-size: 12px;
    color: #4f73db;
    background: rgb(111 156 248 / 12%);
    border-radius: 999px;

    &.good {
      color: #139b87;
      background: rgb(24 182 163 / 14%);
    }

    &.warn {
      color: #b7791f;
      background: rgb(241 166 90 / 16%);
    }

    &.hot {
      color: #dc4668;
      background: rgb(239 111 143 / 14%);
    }
  }

  strong {
    display: block;
    overflow: hidden;
    color: var(--profile-strong);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  p {
    margin: 6px 0 0;
    color: var(--profile-muted);
    line-height: 22px;
  }
}

.profile-field-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 360px;
  gap: 18px;
}

.dimension-lanes {
  display: flex;
  flex-direction: column;
}

.dimension-lane {
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr) 74px;
  gap: 16px;
  align-items: start;
  width: 100%;
  padding: 18px 0;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 0;
  border-top: 1px solid var(--profile-line);
  transition:
    background-color 0.2s ease,
    padding 0.2s ease;

  &:hover {
    padding-right: 12px;
    padding-left: 12px;
    background: var(--profile-soft);
    border-radius: 14px;
  }
}

.lane-index {
  font-size: 13px;
  font-weight: 900;
  color: #7a9df4;
}

.lane-main {
  min-width: 0;
}

.lane-head {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;

  strong,
  span {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    color: var(--profile-strong);
  }

  span {
    flex: 0 1 auto;
    color: var(--profile-muted);
  }
}

.lane-main p {
  display: -webkit-box;
  margin: 8px 0 12px;
  overflow: hidden;
  color: var(--profile-muted);
  line-height: 22px;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

.lane-track {
  height: 5px;
  overflow: hidden;
  background: rgb(127 140 170 / 20%);
  border-radius: 999px;

  i {
    display: block;
    height: 100%;
    border-radius: inherit;
  }
}

.evidence-strip,
.detail-evidence {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;

  span {
    max-width: 100%;
    padding: 4px 9px;
    overflow: hidden;
    font-size: 12px;
    color: #5f7fe5;
    text-overflow: ellipsis;
    white-space: nowrap;
    background: rgb(111 156 248 / 10%);
    border: 1px solid rgb(111 156 248 / 18%);
    border-radius: 999px;
  }
}

.lane-score {
  font-size: 22px;
  color: #4f73db;
  text-align: right;
}

.knowledge-heatmap {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-auto-rows: 94px;
  gap: 10px;
}

.knowledge-cell {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
  padding: 13px;
  border: 1px solid;
  border-radius: 14px;

  &:first-child,
  &:nth-child(6n) {
    grid-column: span 2;
  }

  span,
  b {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: var(--profile-muted);
  }

  b {
    font-size: 23px;
    color: var(--profile-strong);
  }
}

.profile-storyline {
  overflow: hidden;
}

.story-columns {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
}

.story-column {
  min-width: 0;
  padding-right: 18px;
  padding-left: 18px;
  border-right: 1px solid var(--profile-line);

  &:first-child {
    padding-left: 0;
  }

  &:last-child {
    padding-right: 0;
    border-right: 0;
  }
}

.story-label {
  margin-bottom: 12px;
  font-size: 13px;
  font-weight: 900;
  color: #6f8fea;
}

.story-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.story-item {
  position: relative;
  min-width: 0;
  padding-left: 14px;

  &::before {
    position: absolute;
    top: 6px;
    left: 0;
    width: 6px;
    height: 6px;
    content: "";
    background: #6f9cf8;
    border-radius: 50%;
  }

  span,
  strong {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  span {
    color: var(--profile-muted);
  }

  strong {
    margin-top: 3px;
    color: var(--profile-strong);
  }

  p {
    display: -webkit-box;
    margin: 6px 0 0;
    overflow: hidden;
    color: var(--profile-muted);
    line-height: 22px;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
}

.story-empty,
.profile-empty {
  display: grid;
  min-height: 160px;
  place-items: center;
  color: var(--profile-muted);
  text-align: center;
  background:
    linear-gradient(135deg, rgb(111 156 248 / 8%), transparent 42%),
    var(--profile-surface-plain);
  border: 1px dashed var(--profile-line);
  border-radius: 16px;
}

.profile-empty.compact {
  min-height: 126px;
  padding: 20px;
}

.dimension-detail {
  .detail-score {
    margin-bottom: 10px;
    font-size: 38px;
    font-weight: 900;
    color: #4f73db;
  }

  p {
    margin: 0;
    color: #5f6b83;
    line-height: 24px;
  }
}

@media (width <= 1199px) {
  .profile-summary-bar {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    row-gap: 16px;
  }

  .summary-cell:nth-child(3n) {
    border-right: 0;
  }

  .profile-studio,
  .profile-field-grid {
    grid-template-columns: 1fr;
  }

  .signal-panel {
    min-height: auto;
  }
}

@media (width <= 900px) {
  .profile-map-wrap {
    grid-template-columns: 1fr;
  }

  .profile-map-copy {
    padding-top: 18px;
    padding-left: 0;
    border-top: 1px solid var(--profile-line);
    border-left: 0;
  }

  .story-columns {
    grid-template-columns: 1fr;
    gap: 18px;
  }

  .story-column {
    padding: 0;
    border-right: 0;
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

    p {
      white-space: normal;
    }
  }

  .hero-actions,
  .hero-actions .course-select {
    width: 100%;
  }

  .profile-summary-bar,
  .insight-pair {
    grid-template-columns: 1fr;
  }

  .summary-cell {
    padding: 10px 0;
    border-right: 0;
    border-bottom: 1px solid var(--profile-line);

    &:last-child {
      border-bottom: 0;
    }
  }

  .profile-map-panel,
  .signal-panel,
  .dimension-spectrum,
  .knowledge-panel,
  .profile-storyline {
    padding: 18px;
  }

  .radar-point {
    width: 70px;
  }

  .dimension-lane {
    grid-template-columns: 34px minmax(0, 1fr);
  }

  .lane-score {
    grid-column: 2;
    text-align: left;
  }

  .knowledge-heatmap {
    grid-template-columns: 1fr;
  }

  .knowledge-cell:first-child,
  .knowledge-cell:nth-child(6n) {
    grid-column: auto;
  }
}
</style>
