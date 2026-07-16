<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import { Refresh, Search, View } from "@element-plus/icons-vue";
import {
  assistantApiErrorMessage,
  getAssistantDashboardPaths,
  getAssistantDashboardResources,
  getAssistantDashboardRisks,
  getAssistantDashboardStudents,
  getAssistantTaskTrace,
  type AssistantDashboardPathsResp,
  type AssistantDashboardResourcesResp,
  type AssistantDashboardRisksResp,
  type AssistantDashboardStudentItem,
  type AssistantDashboardStudentsResp,
  type AssistantResourceTaskItem,
  type AssistantTaskTraceResp
} from "@/api/frontend/assistant";

const props = defineProps<{
  courseId?: number;
  courseName?: string;
  isStaffMode?: boolean;
  viewerRole?: "teacher" | "admin" | "student";
}>();

const emit = defineEmits<{
  (
    e: "select-student",
    payload: { studentId: number; rail: "profile" | "path" | "assessment" }
  ): void;
  (e: "navigate", rail: "generation"): void;
}>();

const loading = ref(false);
const activeTab = ref("students");
const keyword = ref("");
const riskLevel = ref("");
const profileUpdatedAfter = ref("");

const studentsDashboard = ref<AssistantDashboardStudentsResp | null>(null);
const resourcesDashboard = ref<AssistantDashboardResourcesResp | null>(null);
const risksDashboard = ref<AssistantDashboardRisksResp | null>(null);
const pathsDashboard = ref<AssistantDashboardPathsResp | null>(null);

const taskTraceLoading = ref(false);
const selectedTaskTrace = ref<AssistantTaskTraceResp | null>(null);

const isStaff = computed(() => props.isStaffMode !== false);
const isAdmin = computed(() => props.viewerRole === "admin");
const courseLabel = computed(() => props.courseName || "当前课程");

const studentList = computed(() =>
  [...(studentsDashboard.value?.list || [])].sort(compareStudentsByContent)
);
const recentTasks = computed(
  () => resourcesDashboard.value?.recent_tasks || []
);
const attentionStudents = computed(
  () => risksDashboard.value?.attention_students || []
);
const pathList = computed(() => pathsDashboard.value?.list || []);

const studentSummary = computed(() => {
  const summary = studentsDashboard.value?.summary;
  const list = studentList.value;
  const total = Math.max(
    numberOrZero(summary?.total_students),
    numberOrZero(studentsDashboard.value?.total),
    list.length
  );
  return {
    total_students: total,
    profile_ready_count: Math.max(
      numberOrZero(summary?.profile_ready_count),
      list.filter(item => isReadyStatus(item.profile_status)).length
    ),
    high_risk_count: Math.max(
      numberOrZero(summary?.high_risk_count),
      list.filter(item => item.risk_flags?.includes("high")).length
    ),
    need_replan_count: Math.max(
      numberOrZero(summary?.need_replan_count),
      list.filter(item => item.need_replan).length
    ),
    average_progress:
      summary?.average_progress ??
      (list.length
        ? list.reduce((total, item) => total + numberOrZero(item.progress), 0) /
          list.length
        : 0)
  };
});
const resourceSummary = computed(() => {
  const summary = resourcesDashboard.value?.summary;
  const tasks = recentTasks.value;
  return {
    total_resources: Math.max(
      numberOrZero(summary?.total_resources),
      tasks.length
    ),
    pending_review_count: Math.max(
      numberOrZero(summary?.pending_review_count),
      tasks.filter(item =>
        isPendingStatus((item as any).review_status || item.status)
      ).length
    ),
    blocked_count: Math.max(
      numberOrZero(summary?.blocked_count),
      tasks.filter(item => isBlockedStatus(item.status)).length
    ),
    degraded_count: Math.max(
      numberOrZero(summary?.degraded_count),
      tasks.filter(item => isDegradedStatus(item.status)).length
    ),
    average_quality: summary?.average_quality ?? 0
  };
});
const riskSummary = computed(() => {
  const summary = risksDashboard.value?.summary;
  const list = attentionStudents.value;
  return {
    high_risk_students: Math.max(
      numberOrZero(summary?.high_risk_students),
      list.filter(item => item.risk_flags?.includes("high")).length
    ),
    low_completion_students: Math.max(
      numberOrZero(summary?.low_completion_students),
      list.filter(item => progressValue(item.progress) < 60).length
    ),
    need_replan_students: Math.max(
      numberOrZero(summary?.need_replan_students),
      list.filter(item => item.need_replan).length
    ),
    negative_feedback_students: numberOrZero(
      summary?.negative_feedback_students
    )
  };
});
const pathSummary = computed(() => {
  const summary = pathsDashboard.value?.summary;
  const list = pathList.value;
  return {
    active_path_students: Math.max(
      numberOrZero(summary?.active_path_students),
      list.length
    ),
    average_completion_rate:
      summary?.average_completion_rate ??
      (list.length
        ? list.reduce(
            (total, item) => total + numberOrZero(item.completion_rate),
            0
          ) / list.length
        : 0),
    overdue_node_count: Math.max(
      numberOrZero(summary?.overdue_node_count),
      list.reduce((total, item) => total + numberOrZero(item.overdue_nodes), 0)
    ),
    need_replan_count: numberOrZero(summary?.need_replan_count)
  };
});

const dashboardStats = computed(() => [
  {
    key: "profile",
    label: "已建学习档案",
    value: studentSummary.value?.profile_ready_count ?? 0,
    sub: `${studentSummary.value?.total_students ?? 0} 名学生`,
    tone: "blue"
  },
  {
    key: "resource",
    label: "待处理资源",
    value: resourceSummary.value?.pending_review_count ?? 0,
    sub: `${resourceSummary.value?.degraded_count ?? 0} 项需留意`,
    tone: "blue"
  },
  {
    key: "risk",
    label: "需关注学生",
    value: riskSummary.value?.high_risk_students ?? 0,
    sub: `${riskSummary.value?.need_replan_students ?? 0} 人建议调整计划`,
    tone: "orange"
  },
  {
    key: "path",
    label: "平均学习进度",
    value: percentText(pathSummary.value?.average_completion_rate),
    sub: `${pathSummary.value?.overdue_node_count ?? 0} 个逾期节点`,
    tone: "green"
  }
]);

const asRecord = (value: unknown): Record<string, any> =>
  value && typeof value === "object" ? (value as Record<string, any>) : {};

const payloadRecord = (value: unknown) => {
  const record = asRecord(value);
  const nested = asRecord(record.data);
  return Object.keys(nested).length &&
    !("summary" in record) &&
    !("list" in record)
    ? nested
    : record;
};

const pickArray = <T,>(record: Record<string, any>, keys: string[]): T[] => {
  for (const key of keys) {
    if (Array.isArray(record[key])) return record[key] as T[];
  }
  return [];
};

const numberOrZero = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const isReadyStatus = (status?: string) =>
  ["ready", "completed", "published", "active", "ok", "success"].includes(
    String(status || "").toLowerCase()
  );

const isPendingStatus = (status?: string) =>
  ["pending", "reviewing", "waiting", "draft"].includes(
    String(status || "").toLowerCase()
  );

const isBlockedStatus = (status?: string) =>
  ["blocked", "rejected", "failed"].includes(
    String(status || "").toLowerCase()
  );

const isDegradedStatus = (status?: string) =>
  String(status || "")
    .toLowerCase()
    .includes("degraded");

const normalizeStudentsDashboard = (
  raw: unknown
): AssistantDashboardStudentsResp => {
  const record = payloadRecord(raw);
  const summary = asRecord(record.summary);
  const list = pickArray<AssistantDashboardStudentItem>(record, [
    "list",
    "students",
    "items",
    "records",
    "results"
  ]);
  return {
    status: String(record.status || "ok"),
    message: record.message,
    course_id: Number(record.course_id || props.courseId || 0),
    total: numberOrZero(record.total ?? summary.total_students ?? list.length),
    summary: {
      total_students: numberOrZero(
        summary.total_students ??
          record.total_students ??
          record.total ??
          list.length
      ),
      profile_ready_count: numberOrZero(
        summary.profile_ready_count ?? record.profile_ready_count
      ),
      high_risk_count: numberOrZero(
        summary.high_risk_count ?? record.high_risk_count
      ),
      need_replan_count: numberOrZero(
        summary.need_replan_count ?? record.need_replan_count
      ),
      average_progress: numberOrZero(
        summary.average_progress ?? record.average_progress
      )
    },
    list
  };
};

const normalizeResourcesDashboard = (
  raw: unknown
): AssistantDashboardResourcesResp => {
  const record = payloadRecord(raw);
  const summary = asRecord(record.summary);
  return {
    status: String(record.status || "ok"),
    message: record.message,
    course_id: Number(record.course_id || props.courseId || 0),
    summary: {
      total_resources: numberOrZero(
        summary.total_resources ?? record.total_resources
      ),
      pending_review_count: numberOrZero(
        summary.pending_review_count ?? record.pending_review_count
      ),
      blocked_count: numberOrZero(
        summary.blocked_count ?? record.blocked_count
      ),
      degraded_count: numberOrZero(
        summary.degraded_count ?? record.degraded_count
      ),
      average_quality: numberOrZero(
        summary.average_quality ?? record.average_quality
      )
    },
    type_distribution: pickArray(record, ["type_distribution", "types"]),
    status_distribution: pickArray(record, ["status_distribution", "statuses"]),
    review_distribution: pickArray(record, ["review_distribution", "reviews"]),
    recent_tasks: pickArray<AssistantResourceTaskItem>(record, [
      "recent_tasks",
      "tasks",
      "list",
      "items",
      "records"
    ])
  };
};

const normalizeRisksDashboard = (raw: unknown): AssistantDashboardRisksResp => {
  const record = payloadRecord(raw);
  const summary = asRecord(record.summary);
  return {
    status: String(record.status || "ok"),
    message: record.message,
    course_id: Number(record.course_id || props.courseId || 0),
    summary: {
      high_risk_students: numberOrZero(
        summary.high_risk_students ?? record.high_risk_students
      ),
      low_completion_students: numberOrZero(
        summary.low_completion_students ?? record.low_completion_students
      ),
      need_replan_students: numberOrZero(
        summary.need_replan_students ?? record.need_replan_students
      ),
      negative_feedback_students: numberOrZero(
        summary.negative_feedback_students ?? record.negative_feedback_students
      )
    },
    risk_flags: pickArray(record, ["risk_flags", "flags", "distribution"]),
    attention_students: pickArray<AssistantDashboardStudentItem>(record, [
      "attention_students",
      "students",
      "list",
      "items",
      "records"
    ])
  };
};

const normalizePathsDashboard = (raw: unknown): AssistantDashboardPathsResp => {
  const record = payloadRecord(raw);
  const summary = asRecord(record.summary);
  return {
    status: String(record.status || "ok"),
    message: record.message,
    course_id: Number(record.course_id || props.courseId || 0),
    summary: {
      active_path_students: numberOrZero(
        summary.active_path_students ?? record.active_path_students
      ),
      average_completion_rate: numberOrZero(
        summary.average_completion_rate ?? record.average_completion_rate
      ),
      overdue_node_count: numberOrZero(
        summary.overdue_node_count ?? record.overdue_node_count
      ),
      need_replan_count: numberOrZero(
        summary.need_replan_count ?? record.need_replan_count
      )
    },
    list: pickArray(record, ["list", "paths", "items", "records", "results"])
  };
};

const statusTagType = (status?: string) => {
  const value = String(status || "").toLowerCase();
  if (["completed", "ready", "published", "approved", "safe"].includes(value))
    return "success";
  if (["failed", "blocked", "rejected", "deleted", "high"].includes(value))
    return "danger";
  if (
    ["degraded", "processing", "pending", "warning", "need_replan"].includes(
      value
    )
  )
    return "warning";
  return "info";
};

const statusTextMap: Record<string, string> = {
  active: "进行中",
  approved: "已通过",
  blocked: "已拦截",
  cancelled: "已取消",
  changes_requested: "待调整",
  completed: "已完成",
  completed_with_warnings: "已完成，需关注",
  degraded: "处理不完整",
  draft: "待完善",
  failed: "处理失败",
  need_replan: "建议调整计划",
  not_configured: "暂未配置",
  partial: "部分完成",
  pending: "待处理",
  processing: "处理中",
  profile_required: "待补充学习信息",
  published: "已发布",
  ready: "已建立",
  rejected: "未通过",
  reviewing: "审核中",
  running: "处理中",
  safe: "正常",
  waiting_html_animation: "等待生成演示",
  warning: "需关注",
  waiting: "待处理"
};

const resourceTypeTextMap: Record<string, string> = {
  coding_practice_case: "编程练习",
  courseware_ppt: "教学课件",
  exercise_set: "练习题组",
  explanation_doc: "讲解资料",
  extended_reading: "拓展阅读",
  html_animation: "互动演示",
  mind_map: "知识梳理"
};

const riskTextMap: Record<string, string> = {
  high: "学习风险较高",
  "risk-high": "学习风险较高",
  risk_status: "学习状态待关注",
  风险状态: "学习状态待关注",
  low_completion: "学习进度偏慢",
  low_progress: "学习进度偏慢",
  low_predicted_score: "学习表现待提升",
  negative_feedback: "学习反馈待跟进",
  need_replan: "建议调整学习计划",
  predicted_score_below_68: "学习表现待提升",
  profile_required: "学习信息待补充",
  rag_empty: "课程资料不足",
  resource_completion_low: "资源完成度偏低",
  wrong_questions_high: "错题较多"
};

const stageTextMap: Record<string, string> = {
  answer_generating: "生成学习建议",
  completed: "处理完成",
  context_loading: "整理学习信息",
  knowledge_retrieval: "查找课程资料",
  llm_resources: "生成教学资源",
  persisting: "保存处理结果",
  postprocess_queued: "安排后续更新",
  quality_review: "检查内容质量",
  rag_search: "查找课程资料",
  request_preparing: "准备处理",
  request_safety_gate: "检查内容安全",
  request_validating: "核对请求信息",
  resource_generation: "生成教学资源",
  safety_checking: "检查内容安全",
  storage: "保存资源",
  thinking_strategy: "制定处理策略"
};

function displayText(
  map: Record<string, string>,
  value?: string,
  fallback = "处理中"
) {
  const key = String(value || "")
    .trim()
    .toLowerCase();
  return map[key] || fallback;
}

const statusText = (status?: string) => displayText(statusTextMap, status);
const profileStatusText = (status?: string) =>
  displayText(statusTextMap, status, "待补充学习信息");
const resourceTypeText = (type?: string) =>
  displayText(resourceTypeTextMap, type, "学习资源");
const stageText = (stage?: string) =>
  displayText(stageTextMap, stage, "处理中");
const riskText = (risk?: string) => displayText(riskTextMap, risk, "学习提醒");

const progressValue = (value?: number) => {
  if (value === undefined || value === null) return 0;
  const normalized = value <= 1 ? value * 100 : value;
  return Math.max(0, Math.min(100, Math.round(normalized)));
};

function percentText(value?: number) {
  if (value === undefined || value === null) return "暂无";
  return `${progressValue(value)}%`;
}

function qualityText(value?: number) {
  if (value === undefined || value === null) return "暂无";
  return percentText(value);
}

function formatDate(value?: string) {
  if (!value) return "暂无";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function studentName(row: AssistantDashboardStudentItem) {
  return row.student_name || `学生 ${row.student_id}`;
}

function studentContentScore(row: AssistantDashboardStudentItem) {
  const profileStatus = String(row.profile_status || "")
    .trim()
    .toLowerCase();
  const hasProfile = Boolean(
    profileStatus &&
      ![
        "profile_required",
        "not_configured",
        "pending",
        "missing",
        "empty"
      ].includes(profileStatus)
  );
  const hasSummary = Boolean(
    row.summary?.trim() && row.summary.trim() !== "暂无学习概览"
  );
  const hasScore = Number(row.predicted_score) > 0;
  const hasProgress = progressValue(row.progress) > 0;
  const riskCount = row.risk_flags?.filter(Boolean).length || 0;

  return (
    (hasProfile ? 8 : 0) +
    (hasSummary ? 5 : 0) +
    (riskCount ? 4 + Math.min(riskCount, 3) : 0) +
    (row.need_teacher_attention ? 3 : 0) +
    (row.need_replan ? 3 : 0) +
    (hasScore ? 3 : 0) +
    (hasProgress ? 2 : 0) +
    (Number(row.study_minutes) > 0 ? 1 : 0) +
    (row.dimension_scores?.length ? 2 : 0) +
    (row.latest_event ? 1 : 0) +
    (row.last_updated_at ? 1 : 0)
  );
}

function updatedAtTime(row: AssistantDashboardStudentItem) {
  const timestamp = new Date(row.last_updated_at || "").getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function compareStudentsByContent(
  left: AssistantDashboardStudentItem,
  right: AssistantDashboardStudentItem
) {
  const scoreDifference =
    studentContentScore(right) - studentContentScore(left);
  if (scoreDifference) return scoreDifference;

  const updateDifference = updatedAtTime(right) - updatedAtTime(left);
  if (updateDifference) return updateDifference;

  return studentName(left).localeCompare(studentName(right), "zh-CN");
}

function taskTypesText(row: AssistantResourceTaskItem) {
  return row.resource_types?.length
    ? row.resource_types.map(resourceTypeText).join("、")
    : "学习资源";
}

function taskTitle(row: AssistantResourceTaskItem) {
  return row.stage ? stageText(row.stage) : taskTypesText(row);
}

function durationText(duration?: number) {
  const milliseconds = numberOrZero(duration);
  if (!milliseconds) return "";
  return milliseconds >= 1000
    ? `耗时 ${(milliseconds / 1000).toFixed(milliseconds >= 10_000 ? 0 : 1)} 秒`
    : `耗时 ${milliseconds} 毫秒`;
}

function recordDetail(status?: string) {
  const normalizedStatus = String(status || "").toLowerCase();
  if (["failed", "blocked", "rejected"].includes(normalizedStatus)) {
    return "该步骤未完成，已记录为待跟进事项。";
  }
  if (
    ["degraded", "warning", "partial", "completed_with_warnings"].includes(
      normalizedStatus
    )
  ) {
    return "主要处理已完成，仍有事项需要后续关注。";
  }
  if (
    ["completed", "ready", "published", "approved", "safe"].includes(
      normalizedStatus
    )
  ) {
    return "该步骤已完成。";
  }
  return "正在处理该步骤。";
}

async function loadDashboard() {
  if (!isStaff.value) return;
  if (!props.courseId) {
    studentsDashboard.value = null;
    resourcesDashboard.value = null;
    risksDashboard.value = null;
    pathsDashboard.value = null;
    return;
  }
  loading.value = true;
  try {
    const commonParams = { course_id: props.courseId };
    const [studentsResp, resourcesResp, risksResp, pathsResp] =
      await Promise.all([
        getAssistantDashboardStudents({
          ...commonParams,
          keyword: keyword.value.trim() || undefined,
          risk_level: riskLevel.value || undefined,
          profile_updated_after: profileUpdatedAfter.value || undefined,
          page: 1,
          page_size: 20
        }),
        getAssistantDashboardResources(commonParams),
        getAssistantDashboardRisks(commonParams),
        getAssistantDashboardPaths(commonParams)
      ]);

    if (import.meta.env.DEV) {
      console.debug("[AiGovernanceDashboard] dashboard response", {
        course_id: props.courseId,
        students: studentsResp.data,
        resources: resourcesResp.data,
        risks: risksResp.data,
        paths: pathsResp.data
      });
    }

    studentsDashboard.value = normalizeStudentsDashboard(studentsResp.data);
    resourcesDashboard.value = normalizeResourcesDashboard(resourcesResp.data);
    risksDashboard.value = normalizeRisksDashboard(risksResp.data);
    pathsDashboard.value = normalizePathsDashboard(pathsResp.data);
  } catch (error: any) {
    console.error("[AiGovernanceDashboard] 加载治理看板失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "治理看板加载失败"));
  } finally {
    loading.value = false;
  }
}

function resetFilters() {
  keyword.value = "";
  riskLevel.value = "";
  profileUpdatedAfter.value = "";
  void loadDashboard();
}

function handleSelectStudent(
  row: AssistantDashboardStudentItem,
  rail: "profile" | "path" | "assessment"
) {
  emit("select-student", { studentId: row.student_id, rail });
}

async function loadTaskTrace(taskId: string) {
  if (!taskId) return;
  activeTab.value = "records";
  taskTraceLoading.value = true;
  try {
    const { data } = await getAssistantTaskTrace(taskId);
    selectedTaskTrace.value = data;
  } catch (error: any) {
    console.error("[AiGovernanceDashboard] 加载任务处理记录失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "处理记录加载失败"));
  } finally {
    taskTraceLoading.value = false;
  }
}

onMounted(loadDashboard);
watch(
  () => [props.courseId, props.isStaffMode, props.viewerRole],
  () => {
    void loadDashboard();
  }
);
</script>

<template>
  <div
    v-loading="loading"
    class="governance-dashboard-frame h-full overflow-y-auto custom-scrollbar"
  >
    <main class="a3-governance-page p-6">
      <header class="governance-header">
        <div class="min-w-0 flex items-center gap-3">
          <span class="governance-brand-mark" aria-hidden="true">
            <span class="governance-brand-mark__grid">
              <span />
              <span />
              <span />
              <span />
            </span>
          </span>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="governance-heading">课程学习概览</h2>
              <el-tag type="info" effect="plain">{{ courseLabel }}</el-tag>
            </div>
          </div>
        </div>
        <el-button :icon="Refresh" @click="loadDashboard">更新数据</el-button>
      </header>

      <el-alert
        v-if="!isStaff"
        type="warning"
        show-icon
        :closable="false"
        title="当前账号暂无治理看板权限"
        description="该模块面向教师和管理员，用于查看学生学习情况、资源状态和学习计划。"
      />

      <template v-else>
        <section class="governance-summary" aria-label="课程概览">
          <div
            v-for="item in dashboardStats"
            :key="item.key"
            class="governance-summary__item"
            :class="`tone-${item.tone}`"
          >
            <p>{{ item.label }}</p>
            <strong>{{ item.value }}</strong>
            <span>{{ item.sub }}</span>
          </div>
        </section>

        <section class="governance-filter-bar">
          <div class="flex flex-col sm:flex-row gap-3">
            <el-input
              v-model="keyword"
              clearable
              :prefix-icon="Search"
              placeholder="按学生姓名或学习情况搜索"
              class="governance-search"
              @keyup.enter="loadDashboard"
            />
            <el-select
              v-model="riskLevel"
              clearable
              placeholder="关注事项筛选"
              class="governance-risk"
              @change="loadDashboard"
            >
              <el-option label="学习风险较高" value="high" />
              <el-option label="建议调整学习计划" value="need_replan" />
              <el-option label="需要跟进" value="attention" />
              <el-option label="学习进度偏慢" value="low_progress" />
            </el-select>
            <el-date-picker
              v-model="profileUpdatedAfter"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="最近更新日期"
              class="governance-date"
              @change="loadDashboard"
            />
          </div>
          <div class="flex items-center gap-2">
            <el-button @click="resetFilters">重置</el-button>
            <el-button
              class="governance-query-button"
              :icon="Search"
              @click="loadDashboard"
            >
              查询
            </el-button>
          </div>
        </section>

        <el-tabs v-model="activeTab" class="a3-governance-tabs">
          <el-tab-pane label="学生概览" name="students">
            <section class="governance-section">
              <div class="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 class="governance-section__title">学生学习概览</h3>
                  <p class="governance-section__desc">
                    查看学习进度、档案完善度与需要关注的事项
                  </p>
                </div>
                <el-tag type="info" effect="plain">
                  {{ studentsDashboard?.total ?? 0 }} 位学生
                </el-tag>
              </div>

              <el-table
                :data="studentList"
                height="430"
                class="governance-table"
              >
                <el-table-column label="学生" min-width="190" align="center">
                  <template #default="{ row }">
                    <div class="governance-student-cell">
                      <el-avatar :size="34" :src="row.avatar">
                        {{ studentName(row).slice(0, 1) }}
                      </el-avatar>
                      <div class="governance-student-meta min-w-0">
                        <p class="font-medium text-gray-800 truncate">
                          {{ studentName(row) }}
                        </p>
                        <p class="text-xs text-gray-400 truncate">
                          {{ row.summary || "暂无学习概览" }}
                        </p>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="进度" width="140" align="center">
                  <template #default="{ row }">
                    <div class="governance-progress-cell space-y-1">
                      <span class="text-xs text-gray-500">
                        {{ percentText(row.progress) }}
                      </span>
                      <el-progress
                        :percentage="progressValue(row.progress)"
                        :show-text="false"
                        :stroke-width="6"
                      />
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="学习表现" width="112" align="center">
                  <template #default="{ row }">
                    {{ row.predicted_score ?? "暂无" }}
                  </template>
                </el-table-column>
                <el-table-column label="学习档案" width="148" align="center">
                  <template #default="{ row }">
                    <el-tag
                      :type="statusTagType(row.profile_status)"
                      effect="plain"
                    >
                      {{ profileStatusText(row.profile_status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column
                  label="关注事项"
                  min-width="240"
                  align="center"
                >
                  <template #default="{ row }">
                    <div
                      v-if="row.risk_flags?.length"
                      class="governance-tag-list"
                    >
                      <el-tag
                        v-for="flag in row.risk_flags.slice(0, 3)"
                        :key="flag"
                        size="small"
                        type="warning"
                        effect="plain"
                      >
                        {{ riskText(flag) }}
                      </el-tag>
                      <el-tag
                        v-if="row.risk_flags.length > 3"
                        size="small"
                        type="info"
                        effect="plain"
                      >
                        另有 {{ row.risk_flags.length - 3 }} 项
                      </el-tag>
                    </div>
                    <span v-else class="text-sm text-gray-400"
                      >暂无需关注事项</span
                    >
                  </template>
                </el-table-column>
                <el-table-column label="最近更新" width="136" align="center">
                  <template #default="{ row }">
                    {{ formatDate(row.last_updated_at) }}
                  </template>
                </el-table-column>
                <el-table-column
                  label="查看"
                  width="238"
                  fixed="right"
                  align="center"
                >
                  <template #default="{ row }">
                    <div class="governance-action-list">
                      <el-button
                        type="primary"
                        link
                        @click="handleSelectStudent(row, 'profile')"
                      >
                        学习档案
                      </el-button>
                      <el-button link @click="handleSelectStudent(row, 'path')">
                        学习计划
                      </el-button>
                      <el-button
                        link
                        @click="handleSelectStudent(row, 'assessment')"
                      >
                        评估情况
                      </el-button>
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </section>
          </el-tab-pane>

          <el-tab-pane label="教学资源" name="resources">
            <div
              class="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-4"
            >
              <section class="governance-section">
                <div class="flex items-center justify-between gap-3 mb-4">
                  <h3 class="governance-section__title">资源处理情况</h3>
                  <el-button
                    type="primary"
                    link
                    @click="emit('navigate', 'generation')"
                  >
                    查看教学资源
                  </el-button>
                </div>
                <div class="space-y-3">
                  <div class="governance-row">
                    <span>资源总数</span>
                    <strong>{{ resourceSummary?.total_resources ?? 0 }}</strong>
                  </div>
                  <div class="governance-row">
                    <span>待处理</span>
                    <strong>{{
                      resourceSummary?.pending_review_count ?? 0
                    }}</strong>
                  </div>
                  <div class="governance-row">
                    <span>暂不可用</span>
                    <strong>{{ resourceSummary?.blocked_count ?? 0 }}</strong>
                  </div>
                  <div class="governance-row">
                    <span>内容质量</span>
                    <strong>
                      {{ qualityText(resourceSummary?.average_quality) }}
                    </strong>
                  </div>
                </div>

                <div class="mt-5">
                  <p class="text-sm font-medium text-gray-700 mb-2">处理状态</p>
                  <div class="governance-tag-list">
                    <el-tag
                      v-for="item in resourcesDashboard?.review_distribution ||
                      []"
                      :key="item.key"
                      effect="plain"
                      :type="statusTagType(item.key)"
                    >
                      {{ statusText(item.key) }} {{ item.count }}
                    </el-tag>
                    <el-empty
                      v-if="!resourcesDashboard?.review_distribution?.length"
                      description="暂无资源处理数据"
                      :image-size="80"
                    />
                  </div>
                </div>
              </section>

              <section class="governance-section">
                <div class="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 class="governance-section__title">最近处理事项</h3>
                    <p class="governance-section__desc">
                      查看教学资源的处理进度与当前状态
                    </p>
                  </div>
                </div>

                <el-table :data="recentTasks" height="420">
                  <el-table-column label="处理事项" min-width="180">
                    <template #default="{ row }">
                      <span class="font-medium text-gray-700">{{
                        taskTitle(row)
                      }}</span>
                    </template>
                  </el-table-column>
                  <el-table-column label="资源类型" min-width="150">
                    <template #default="{ row }">
                      {{ taskTypesText(row) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="处理状态" width="132">
                    <template #default="{ row }">
                      <el-tag :type="statusTagType(row.status)" effect="plain">
                        {{ statusText(row.status) }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="当前步骤" min-width="130">
                    <template #default="{ row }">
                      {{ stageText(row.stage) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="进度" width="130">
                    <template #default="{ row }">
                      <el-progress
                        :percentage="progressValue(row.progress)"
                        :stroke-width="6"
                      />
                    </template>
                  </el-table-column>
                  <el-table-column label="最后更新" width="136">
                    <template #default="{ row }">
                      {{ formatDate(row.updated_at || row.created_at) }}
                    </template>
                  </el-table-column>
                  <el-table-column
                    v-if="isAdmin"
                    label="记录"
                    width="138"
                    fixed="right"
                  >
                    <template #default="{ row }">
                      <el-button
                        type="primary"
                        link
                        :icon="View"
                        @click="loadTaskTrace(row.task_id)"
                      >
                        查看处理记录
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </section>
            </div>
          </el-tab-pane>

          <el-tab-pane label="需关注事项" name="risks">
            <div
              class="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-4"
            >
              <section class="governance-section">
                <h3 class="governance-section__title mb-4">学习提醒</h3>
                <div class="space-y-3">
                  <div class="governance-row">
                    <span>需优先跟进</span>
                    <strong>{{ riskSummary?.high_risk_students ?? 0 }}</strong>
                  </div>
                  <div class="governance-row">
                    <span>学习进度偏慢</span>
                    <strong>
                      {{ riskSummary?.low_completion_students ?? 0 }}
                    </strong>
                  </div>
                  <div class="governance-row">
                    <span>建议调整计划</span>
                    <strong>{{
                      riskSummary?.need_replan_students ?? 0
                    }}</strong>
                  </div>
                  <div class="governance-row">
                    <span>学习反馈待跟进</span>
                    <strong>
                      {{ riskSummary?.negative_feedback_students ?? 0 }}
                    </strong>
                  </div>
                </div>

                <div class="mt-5">
                  <p class="text-sm font-medium text-gray-700 mb-2">关注原因</p>
                  <div class="governance-tag-list">
                    <el-tag
                      v-for="item in risksDashboard?.risk_flags || []"
                      :key="item.key"
                      type="warning"
                      effect="plain"
                    >
                      {{ riskText(item.key) }} {{ item.count }}
                    </el-tag>
                    <el-empty
                      v-if="!risksDashboard?.risk_flags?.length"
                      description="暂无需关注事项"
                      :image-size="80"
                    />
                  </div>
                </div>
              </section>

              <section class="governance-section">
                <h3 class="governance-section__title mb-4">需要跟进的学生</h3>
                <el-table :data="attentionStudents" height="420">
                  <el-table-column label="学生" min-width="190">
                    <template #default="{ row }">
                      <div
                        class="governance-student-cell governance-student-cell--compact"
                      >
                        <el-avatar :size="32" :src="row.avatar">
                          {{ studentName(row).slice(0, 1) }}
                        </el-avatar>
                        <div class="min-w-0">
                          <p class="font-medium text-gray-800 truncate">
                            {{ studentName(row) }}
                          </p>
                          <p class="text-xs text-gray-400 truncate">
                            {{ row.latest_event || row.summary || "暂无事件" }}
                          </p>
                        </div>
                      </div>
                    </template>
                  </el-table-column>
                  <el-table-column label="关注原因" min-width="210">
                    <template #default="{ row }">
                      <div
                        v-if="row.risk_flags?.length"
                        class="governance-tag-list"
                      >
                        <el-tag
                          v-for="flag in row.risk_flags.slice(0, 2)"
                          :key="flag"
                          size="small"
                          type="warning"
                          effect="plain"
                        >
                          {{ riskText(flag) }}
                        </el-tag>
                        <el-tag
                          v-if="row.risk_flags.length > 2"
                          size="small"
                          type="info"
                          effect="plain"
                        >
                          另有 {{ row.risk_flags.length - 2 }} 项
                        </el-tag>
                      </div>
                      <span v-else class="text-sm text-gray-400"
                        >暂无需关注事项</span
                      >
                    </template>
                  </el-table-column>
                  <el-table-column label="进度" width="110">
                    <template #default="{ row }">
                      {{ percentText(row.progress) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="建议" width="122">
                    <template #default="{ row }">
                      <el-tag
                        :type="row.need_replan ? 'warning' : 'info'"
                        effect="plain"
                      >
                        {{ row.need_replan ? "调整学习计划" : "跟进学习情况" }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="查看" width="168" fixed="right">
                    <template #default="{ row }">
                      <el-button
                        type="primary"
                        link
                        @click="handleSelectStudent(row, 'assessment')"
                      >
                        评估情况
                      </el-button>
                      <el-button link @click="handleSelectStudent(row, 'path')">
                        学习计划
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </section>
            </div>
          </el-tab-pane>

          <el-tab-pane label="学习计划" name="paths">
            <section class="governance-section">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <div class="governance-mini">
                  <span>正在执行计划</span>
                  <strong>{{ pathSummary?.active_path_students ?? 0 }}</strong>
                </div>
                <div class="governance-mini">
                  <span>平均完成进度</span>
                  <strong>
                    {{ percentText(pathSummary?.average_completion_rate) }}
                  </strong>
                </div>
                <div class="governance-mini">
                  <span>逾期学习任务</span>
                  <strong>{{ pathSummary?.overdue_node_count ?? 0 }}</strong>
                </div>
                <div class="governance-mini">
                  <span>建议调整计划</span>
                  <strong>{{ pathSummary?.need_replan_count ?? 0 }}</strong>
                </div>
              </div>

              <el-table :data="pathList" height="460">
                <el-table-column label="学生" min-width="150">
                  <template #default="{ row }">
                    {{ row.student_name || `学生 ${row.student_id}` }}
                  </template>
                </el-table-column>
                <el-table-column label="学习计划" min-width="220">
                  <template #default="{ row }">
                    <span class="line-clamp-2">
                      {{ row.summary || "已生成个人学习计划" }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="当前状态" width="132">
                  <template #default="{ row }">
                    <el-tag :type="statusTagType(row.status)" effect="plain">
                      {{ statusText(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="完成情况" width="150">
                  <template #default="{ row }">
                    <div class="space-y-1">
                      <span class="text-xs text-gray-500">
                        {{ row.completed_nodes }}/{{ row.total_nodes }}
                      </span>
                      <el-progress
                        :percentage="progressValue(row.completion_rate)"
                        :show-text="false"
                        :stroke-width="6"
                      />
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="逾期任务" width="100">
                  <template #default="{ row }">
                    {{ row.overdue_nodes }}
                  </template>
                </el-table-column>
                <el-table-column label="查看" width="100" fixed="right">
                  <template #default="{ row }">
                    <el-button
                      type="primary"
                      link
                      @click="
                        emit('select-student', {
                          studentId: row.student_id,
                          rail: 'path'
                        })
                      "
                    >
                      查看
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </section>
          </el-tab-pane>

          <el-tab-pane v-if="isAdmin" label="处理记录" name="records">
            <section
              v-loading="taskTraceLoading"
              class="governance-section trace-panel min-h-[430px]"
            >
              <div class="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 class="governance-section__title">资源处理记录</h3>
                  <p class="governance-section__desc">
                    仅管理员可查看，用于了解资源处理是否顺利完成
                  </p>
                </div>
                <el-tag
                  v-if="selectedTaskTrace?.task?.status"
                  :type="statusTagType(selectedTaskTrace.task.status)"
                  effect="plain"
                >
                  {{ statusText(selectedTaskTrace.task.status) }}
                </el-tag>
              </div>

              <template v-if="selectedTaskTrace">
                <div class="governance-record-summary">
                  <strong>{{ taskTitle(selectedTaskTrace.task) }}</strong>
                  <span>{{ taskTypesText(selectedTaskTrace.task) }}</span>
                </div>

                <el-timeline v-if="selectedTaskTrace.trace?.length">
                  <el-timeline-item
                    v-for="(step, index) in selectedTaskTrace.trace"
                    :key="`${step.stage}-${index}`"
                    :timestamp="formatDate(step.finished_at || step.started_at)"
                    :type="statusTagType(step.status)"
                  >
                    <div class="space-y-1">
                      <p class="text-sm font-medium text-gray-800">
                        {{ stageText(step.stage) }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ statusText(step.status) }}
                        <span v-if="durationText(step.duration_ms)">
                          ，{{ durationText(step.duration_ms) }}
                        </span>
                      </p>
                      <p class="text-sm text-gray-600">
                        {{ recordDetail(step.status) }}
                      </p>
                    </div>
                  </el-timeline-item>
                </el-timeline>
                <el-empty
                  v-else
                  description="该事项暂无处理记录"
                  :image-size="120"
                />

                <div v-if="selectedTaskTrace.logs?.length" class="mt-4">
                  <p class="text-sm font-medium text-gray-700 mb-2">处理日志</p>
                  <div class="space-y-2">
                    <div
                      v-for="(log, index) in selectedTaskTrace.logs"
                      :key="`${log.stage}-${index}`"
                      class="governance-log-entry"
                    >
                      <div class="flex items-center justify-between gap-3">
                        <span class="text-sm font-medium text-gray-700">
                          {{ stageText(log.stage) }}
                        </span>
                        <el-tag
                          size="small"
                          :type="statusTagType(log.status)"
                          effect="plain"
                        >
                          {{ statusText(log.status) }}
                        </el-tag>
                      </div>
                      <p class="text-sm text-gray-500 mt-1">
                        {{ recordDetail(log.status) }}
                      </p>
                      <p class="text-xs text-gray-400 mt-1">
                        {{ formatDate(log.occurred_at) }}
                      </p>
                    </div>
                  </div>
                </div>
              </template>
              <el-empty
                v-else
                description="请先从教学资源中选择一项处理记录"
                :image-size="120"
              />
            </section>
          </el-tab-pane>
        </el-tabs>
      </template>
    </main>
  </div>
</template>

<style scoped>
.governance-dashboard-frame {
  background: #f7f9fc;
  border-radius: 8px;
}

.a3-governance-page {
  min-width: 0;
  max-width: 1680px;
  margin: 0 auto;
}

.governance-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 0 18px;
  margin-bottom: 18px;
  border-bottom: 1px solid #e4e9f1;
}

.governance-heading {
  margin: 0;
  color: #1e293b;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.35;
  text-wrap: balance;
}

.governance-subheading,
.governance-section__desc {
  margin: 5px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.55;
}

.governance-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin-bottom: 16px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #e3e9f1;
  border-radius: 8px;
}

.governance-summary__item {
  min-width: 0;
  padding: 16px 18px;
  border-right: 1px solid #e8edf4;
}

.governance-summary__item:last-child {
  border-right: 0;
}

.governance-summary__item p,
.governance-summary__item span {
  display: block;
  margin: 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.45;
}

.governance-summary__item strong {
  display: block;
  margin: 5px 0 3px;
  color: #1f2937;
  font-size: 24px;
  font-weight: 700;
  line-height: 1.1;
}

.governance-summary__item.tone-orange strong {
  color: #b45309;
}

.governance-summary__item.tone-green strong {
  color: #047857;
}

.governance-filter-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 12px;
  margin-bottom: 16px;
  background: #fff;
  border: 1px solid #e3e9f1;
  border-radius: 8px;
}

.governance-section {
  padding: 18px;
  background: #fff;
  border: 1px solid #e3e9f1;
  border-radius: 8px;
}

.governance-section__title {
  margin: 0;
  color: #334155;
  font-size: 16px;
  font-weight: 650;
  line-height: 1.45;
}

.governance-brand-mark {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: #2563b7;
  background: #f2f7ff;
  border: 1px solid rgb(111 168 255 / 28%);
  border-radius: 8px;
}

.governance-brand-mark__grid {
  display: grid;
  grid-template-columns: repeat(2, 8px);
  grid-template-rows: repeat(2, 8px);
  gap: 4px;
}

.governance-brand-mark__grid span {
  width: 8px;
  height: 8px;
  background: currentColor;
  border-radius: 3px;
}

.governance-brand-mark__grid span:nth-child(1) {
  opacity: 0.82;
}

.governance-brand-mark__grid span:nth-child(2) {
  opacity: 0.46;
}

.governance-brand-mark__grid span:nth-child(3) {
  opacity: 1;
}

.governance-brand-mark__grid span:nth-child(4) {
  opacity: 0.62;
}

.governance-query-button {
  color: #fff;
  background: #3b82f6;
  border-color: #3b82f6;
  box-shadow: none;
}

.governance-query-button:hover,
.governance-query-button:focus {
  color: #fff;
  background: #2563eb;
  border-color: #2563eb;
}

.governance-query-button:active {
  color: #fff;
  background: #1d4ed8;
  border-color: #1d4ed8;
}

:deep(.governance-dashboard-frame .el-input__wrapper),
:deep(.governance-dashboard-frame .el-select__wrapper),
:deep(.governance-dashboard-frame .el-button) {
  border-radius: 8px;
}

:deep(.governance-dashboard-frame .el-date-editor.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.governance-dashboard-frame .el-tag) {
  border-radius: 4px;
}

.trace-panel {
  line-height: 1.65;
}

.trace-panel h3 {
  line-height: 1.35;
}

.governance-search {
  width: min(360px, 100%);
}

.governance-risk {
  width: 160px;
}

.governance-date {
  width: 170px;
}

.governance-row,
.governance-mini {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-bottom: 1px solid #edf1f5;
}

.governance-row:last-child {
  border-bottom: 0;
}

.governance-row span,
.governance-mini span {
  font-size: 13px;
  color: #6b7280;
}

.governance-row strong,
.governance-mini strong {
  font-size: 15px;
  font-weight: 700;
  color: #1f2937;
}

.governance-mini {
  flex-direction: column;
  align-items: flex-start;
  padding: 0 14px;
  border-right: 1px solid #e8edf4;
  border-bottom: 0;
}

.governance-mini:first-child {
  padding-left: 0;
}

.governance-mini:last-child {
  padding-right: 0;
  border-right: 0;
}

.governance-mini strong {
  font-size: 22px;
}

:deep(.a3-governance-tabs > .el-tabs__header) {
  margin-bottom: 16px;
}

:deep(.governance-table .el-table__cell) {
  vertical-align: middle;
}

:deep(.el-table) {
  --el-table-border-color: #edf1f5;
  --el-table-header-bg-color: #f8fafc;
  --el-table-row-hover-bg-color: #f8fbff;
}

:deep(.el-table th.el-table__cell) {
  color: #64748b;
  font-size: 14px;
  font-weight: 650;
  text-align: center;
}

:deep(.el-table th.el-table__cell .cell) {
  justify-content: center;
  text-align: center;
}

:deep(.el-table .el-table__cell) {
  padding: 11px 0;
}

.governance-student-cell {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) 34px;
  gap: 12px;
  align-items: center;
  width: 100%;
  min-width: 0;
}

.governance-student-cell--compact {
  grid-template-columns: 32px minmax(0, 1fr) 32px;
}

.governance-student-meta {
  text-align: center;
}

.governance-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.governance-progress-cell {
  width: min(116px, 100%);
  margin: 0 auto;
  text-align: left;
}

.governance-action-list {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  white-space: nowrap;
}

.governance-action-list :deep(.el-button + .el-button) {
  margin-left: 0;
}

.governance-record-summary {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 16px;
  background: #f8fafc;
  border: 1px solid #e6ecf3;
  border-radius: 8px;
}

.governance-record-summary strong {
  color: #334155;
  font-size: 14px;
}

.governance-record-summary span {
  color: #64748b;
  font-size: 13px;
  text-align: right;
}

.governance-log-entry {
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #edf1f5;
  border-radius: 8px;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgb(203 213 225 / 72%);
  border-radius: 999px;
}

@media (max-width: 767px) {
  .a3-governance-page {
    padding: 16px;
  }

  .governance-header,
  .governance-filter-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .governance-summary {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .governance-summary__item:nth-child(2) {
    border-right: 0;
  }

  .governance-summary__item:nth-child(-n + 2) {
    border-bottom: 1px solid #e8edf4;
  }

  .governance-mini {
    padding: 0;
    border-right: 0;
  }

  .governance-record-summary {
    align-items: flex-start;
    flex-direction: column;
  }

  .governance-record-summary span {
    text-align: left;
  }

  .governance-search,
  .governance-risk,
  .governance-date {
    width: 100%;
  }
}
</style>
