<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  ChatLineRound,
  DataAnalysis,
  DataBoard,
  FolderOpened,
  Guide,
  Refresh,
  Search,
  User,
  View,
  Warning
} from "@element-plus/icons-vue";
import {
  assistantApiErrorMessage,
  getAssistantConversationTrace,
  getAssistantDashboardPaths,
  getAssistantDashboardResources,
  getAssistantDashboardRisks,
  getAssistantDashboardStudents,
  getAssistantTaskTrace,
  type AssistantConversationTraceResp,
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
const conversationTraceLoading = ref(false);
const conversationTraceId = ref("");
const selectedConversationTrace = ref<AssistantConversationTraceResp | null>(
  null
);

const isStaff = computed(() => props.isStaffMode !== false);
const courseLabel = computed(() =>
  props.courseName || (props.courseId ? `课程 ${props.courseId}` : "默认课程")
);

const studentSummary = computed(() => studentsDashboard.value?.summary);
const resourceSummary = computed(() => resourcesDashboard.value?.summary);
const riskSummary = computed(() => risksDashboard.value?.summary);
const pathSummary = computed(() => pathsDashboard.value?.summary);

const studentList = computed(() => studentsDashboard.value?.list || []);
const recentTasks = computed(() => resourcesDashboard.value?.recent_tasks || []);
const attentionStudents = computed(
  () => risksDashboard.value?.attention_students || []
);
const pathList = computed(() => pathsDashboard.value?.list || []);

const dashboardStats = computed(() => [
  {
    key: "profile",
    label: "画像就绪",
    value: studentSummary.value?.profile_ready_count ?? 0,
    sub: `${studentSummary.value?.total_students ?? 0} 名学生`,
    icon: User,
    tone: "blue"
  },
  {
    key: "resource",
    label: "待审核资源",
    value: resourceSummary.value?.pending_review_count ?? 0,
    sub: `${resourceSummary.value?.degraded_count ?? 0} 个降级`,
    icon: FolderOpened,
    tone: "violet"
  },
  {
    key: "risk",
    label: "高风险学生",
    value: riskSummary.value?.high_risk_students ?? 0,
    sub: `${riskSummary.value?.need_replan_students ?? 0} 人需重规划`,
    icon: Warning,
    tone: "orange"
  },
  {
    key: "path",
    label: "路径完成率",
    value: percentText(pathSummary.value?.average_completion_rate),
    sub: `${pathSummary.value?.overdue_node_count ?? 0} 个逾期节点`,
    icon: Guide,
    tone: "green"
  }
]);

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

function riskFlagsText(flags?: string[]) {
  return flags?.length ? flags.join("、") : "无";
}

function studentName(row: AssistantDashboardStudentItem) {
  return row.student_name || `学生 ${row.student_id}`;
}

function taskTypesText(row: AssistantResourceTaskItem) {
  return row.resource_types?.length ? row.resource_types.join("、") : "未指定";
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

    studentsDashboard.value = studentsResp.data;
    resourcesDashboard.value = resourcesResp.data;
    risksDashboard.value = risksResp.data;
    pathsDashboard.value = pathsResp.data;
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
  activeTab.value = "trace";
  taskTraceLoading.value = true;
  try {
    const { data } = await getAssistantTaskTrace(taskId);
    selectedTaskTrace.value = data;
  } catch (error: any) {
    console.error("[AiGovernanceDashboard] 加载任务 Trace 失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "任务 Trace 加载失败"));
  } finally {
    taskTraceLoading.value = false;
  }
}

async function loadConversationTrace() {
  const conversationId = conversationTraceId.value.trim();
  if (!conversationId) {
    ElMessage.warning("请先输入会话 ID");
    return;
  }

  conversationTraceLoading.value = true;
  try {
    const { data } = await getAssistantConversationTrace(conversationId);
    selectedConversationTrace.value = data;
  } catch (error: any) {
    console.error("[AiGovernanceDashboard] 加载会话 Trace 失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "会话 Trace 加载失败"));
  } finally {
    conversationTraceLoading.value = false;
  }
}

onMounted(loadDashboard);
watch(
  () => [props.courseId, props.isStaffMode],
  () => {
    void loadDashboard();
  }
);
</script>

<template>
  <div
    v-loading="loading"
    class="h-full bg-white overflow-y-auto custom-scrollbar"
  >
    <div class="a3-governance-page p-6">
      <div class="flex items-start justify-between gap-4 mb-5">
        <div class="min-w-0">
          <div class="flex items-center gap-3 mb-2">
            <span
              class="w-10 h-10 rounded-2xl bg-primary/10 text-primary flex items-center justify-center"
            >
              <el-icon :size="22"><DataBoard /></el-icon>
            </span>
            <div class="min-w-0">
              <h2 class="text-2xl font-bold text-gray-800 leading-tight">
                A3 治理看板
              </h2>
              <p class="text-sm text-gray-500 mt-1">
                班级画像、资源审核、路径风险和执行 Trace 的统一入口
              </p>
            </div>
            <el-tag type="info" effect="plain" round>{{ courseLabel }}</el-tag>
          </div>
        </div>
        <el-button :icon="Refresh" @click="loadDashboard">刷新</el-button>
      </div>

      <el-alert
        v-if="!isStaff"
        type="warning"
        show-icon
        :closable="false"
        title="当前账号暂无治理看板权限"
        description="该模块面向教师和管理员，用于查看班级级画像、资源治理、风险学生和 Trace 信息。"
      />

      <template v-else>
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-5">
          <section
            v-for="item in dashboardStats"
            :key="item.key"
            class="a3-stat-panel rounded-2xl border border-gray-100 bg-gray-50/60 p-4"
            :class="`tone-${item.tone}`"
          >
            <div class="flex items-start justify-between gap-3">
              <div>
                <p class="text-sm text-gray-500">{{ item.label }}</p>
                <p class="mt-2 text-2xl font-bold text-gray-800">
                  {{ item.value }}
                </p>
                <p class="mt-1 text-xs text-gray-400">{{ item.sub }}</p>
              </div>
              <span
                class="w-10 h-10 rounded-xl flex items-center justify-center stat-icon"
              >
                <el-icon :size="20"><component :is="item.icon" /></el-icon>
              </span>
            </div>
          </section>
        </div>

        <div
          class="mb-5 flex flex-col lg:flex-row lg:items-center justify-between gap-3 rounded-2xl border border-gray-100 bg-white p-4"
        >
          <div class="flex flex-col sm:flex-row gap-3">
            <el-input
              v-model="keyword"
              clearable
              :prefix-icon="Search"
              placeholder="按学生姓名或画像摘要搜索"
              class="governance-search"
              @keyup.enter="loadDashboard"
            />
            <el-select
              v-model="riskLevel"
              clearable
              placeholder="风险筛选"
              class="governance-risk"
              @change="loadDashboard"
            >
              <el-option label="高风险" value="high" />
              <el-option label="需要重规划" value="need_replan" />
              <el-option label="需要教师关注" value="attention" />
              <el-option label="低完成度" value="low_progress" />
            </el-select>
            <el-date-picker
              v-model="profileUpdatedAfter"
              type="date"
              value-format="YYYY-MM-DD"
              placeholder="画像更新后"
              class="governance-date"
              @change="loadDashboard"
            />
          </div>
          <div class="flex items-center gap-2">
            <el-button @click="resetFilters">重置</el-button>
            <el-button type="primary" :icon="Search" @click="loadDashboard">
              查询
            </el-button>
          </div>
        </div>

        <el-tabs v-model="activeTab" class="a3-governance-tabs">
          <el-tab-pane label="学生画像" name="students">
            <section class="rounded-2xl border border-gray-100 bg-white p-4">
              <div class="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 class="text-base font-semibold text-gray-800">
                    学生画像队列
                  </h3>
                  <p class="text-xs text-gray-400 mt-1">
                    查看画像就绪、风险标签和最新画像事件
                  </p>
                </div>
                <el-tag type="info" effect="plain">
                  {{ studentsDashboard?.total ?? 0 }} 条
                </el-tag>
              </div>

              <el-table
                :data="studentList"
                height="430"
                class="governance-table"
              >
                <el-table-column label="学生" min-width="190">
                  <template #default="{ row }">
                    <div class="flex items-center gap-3 min-w-0">
                      <el-avatar :size="34" :src="row.avatar">
                        {{ studentName(row).slice(0, 1) }}
                      </el-avatar>
                      <div class="min-w-0">
                        <p class="font-medium text-gray-800 truncate">
                          {{ studentName(row) }}
                        </p>
                        <p class="text-xs text-gray-400 truncate">
                          {{ row.summary || "暂无画像摘要" }}
                        </p>
                      </div>
                    </div>
                  </template>
                </el-table-column>
                <el-table-column label="进度" width="140">
                  <template #default="{ row }">
                    <div class="space-y-1">
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
                <el-table-column label="预测分" width="100">
                  <template #default="{ row }">
                    {{ row.predicted_score ?? "暂无" }}
                  </template>
                </el-table-column>
                <el-table-column label="画像状态" width="130">
                  <template #default="{ row }">
                    <el-tag
                      :type="statusTagType(row.profile_status)"
                      effect="plain"
                    >
                      {{ row.profile_status || "unknown" }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="风险标签" min-width="180">
                  <template #default="{ row }">
                    <span class="text-sm text-gray-600">
                      {{ riskFlagsText(row.risk_flags) }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="更新时间" width="130">
                  <template #default="{ row }">
                    {{ formatDate(row.last_updated_at) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="210" fixed="right">
                  <template #default="{ row }">
                    <el-button
                      type="primary"
                      link
                      @click="handleSelectStudent(row, 'profile')"
                    >
                      画像
                    </el-button>
                    <el-button link @click="handleSelectStudent(row, 'path')">
                      路径
                    </el-button>
                    <el-button
                      link
                      @click="handleSelectStudent(row, 'assessment')"
                    >
                      测评
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </section>
          </el-tab-pane>

          <el-tab-pane label="资源治理" name="resources">
            <div class="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-4">
              <section class="rounded-2xl border border-gray-100 bg-white p-4">
                <div class="flex items-center justify-between gap-3 mb-4">
                  <h3 class="text-base font-semibold text-gray-800">
                    资源治理概览
                  </h3>
                  <el-button type="primary" link @click="emit('navigate', 'generation')">
                    进入资源治理
                  </el-button>
                </div>
                <div class="space-y-3">
                  <div class="governance-row">
                    <span>资源总数</span>
                    <strong>{{ resourceSummary?.total_resources ?? 0 }}</strong>
                  </div>
                  <div class="governance-row">
                    <span>待审核</span>
                    <strong>{{ resourceSummary?.pending_review_count ?? 0 }}</strong>
                  </div>
                  <div class="governance-row">
                    <span>被阻断</span>
                    <strong>{{ resourceSummary?.blocked_count ?? 0 }}</strong>
                  </div>
                  <div class="governance-row">
                    <span>平均质量</span>
                    <strong>
                      {{ qualityText(resourceSummary?.average_quality) }}
                    </strong>
                  </div>
                </div>

                <div class="mt-5">
                  <p class="text-sm font-medium text-gray-700 mb-2">
                    审核分布
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <el-tag
                      v-for="item in resourcesDashboard?.review_distribution || []"
                      :key="item.key"
                      effect="plain"
                      :type="statusTagType(item.key)"
                    >
                      {{ item.label || item.key }} {{ item.count }}
                    </el-tag>
                    <el-empty
                      v-if="!resourcesDashboard?.review_distribution?.length"
                      description="暂无审核数据"
                      :image-size="80"
                    />
                  </div>
                </div>
              </section>

              <section class="rounded-2xl border border-gray-100 bg-white p-4">
                <div class="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 class="text-base font-semibold text-gray-800">
                      最近资源任务
                    </h3>
                    <p class="text-xs text-gray-400 mt-1">
                      用于检查生成状态、降级原因和执行链路
                    </p>
                  </div>
                </div>

                <el-table :data="recentTasks" height="420">
                  <el-table-column label="任务 ID" min-width="190">
                    <template #default="{ row }">
                      <span class="font-mono text-xs text-gray-600">
                        {{ row.task_id }}
                      </span>
                    </template>
                  </el-table-column>
                  <el-table-column label="类型" min-width="150">
                    <template #default="{ row }">
                      {{ taskTypesText(row) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="状态" width="110">
                    <template #default="{ row }">
                      <el-tag :type="statusTagType(row.status)" effect="plain">
                        {{ row.status }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="阶段" min-width="120">
                    <template #default="{ row }">
                      {{ row.stage || "暂无" }}
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
                  <el-table-column label="更新时间" width="130">
                    <template #default="{ row }">
                      {{ formatDate(row.updated_at || row.created_at) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="100" fixed="right">
                    <template #default="{ row }">
                      <el-button
                        type="primary"
                        link
                        :icon="View"
                        @click="loadTaskTrace(row.task_id)"
                      >
                        Trace
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </section>
            </div>
          </el-tab-pane>

          <el-tab-pane label="风险中心" name="risks">
            <div class="grid grid-cols-1 xl:grid-cols-[360px_minmax(0,1fr)] gap-4">
              <section class="rounded-2xl border border-gray-100 bg-white p-4">
                <h3 class="text-base font-semibold text-gray-800 mb-4">
                  风险摘要
                </h3>
                <div class="space-y-3">
                  <div class="governance-row">
                    <span>高风险学生</span>
                    <strong>{{ riskSummary?.high_risk_students ?? 0 }}</strong>
                  </div>
                  <div class="governance-row">
                    <span>低完成度</span>
                    <strong>
                      {{ riskSummary?.low_completion_students ?? 0 }}
                    </strong>
                  </div>
                  <div class="governance-row">
                    <span>需要重规划</span>
                    <strong>{{ riskSummary?.need_replan_students ?? 0 }}</strong>
                  </div>
                  <div class="governance-row">
                    <span>负反馈</span>
                    <strong>
                      {{ riskSummary?.negative_feedback_students ?? 0 }}
                    </strong>
                  </div>
                </div>

                <div class="mt-5">
                  <p class="text-sm font-medium text-gray-700 mb-2">
                    风险标签分布
                  </p>
                  <div class="flex flex-wrap gap-2">
                    <el-tag
                      v-for="item in risksDashboard?.risk_flags || []"
                      :key="item.key"
                      type="warning"
                      effect="plain"
                    >
                      {{ item.label || item.key }} {{ item.count }}
                    </el-tag>
                    <el-empty
                      v-if="!risksDashboard?.risk_flags?.length"
                      description="暂无风险标签"
                      :image-size="80"
                    />
                  </div>
                </div>
              </section>

              <section class="rounded-2xl border border-gray-100 bg-white p-4">
                <h3 class="text-base font-semibold text-gray-800 mb-4">
                  需要关注的学生
                </h3>
                <el-table :data="attentionStudents" height="420">
                  <el-table-column label="学生" min-width="190">
                    <template #default="{ row }">
                      <div class="flex items-center gap-3 min-w-0">
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
                  <el-table-column label="风险" min-width="180">
                    <template #default="{ row }">
                      {{ riskFlagsText(row.risk_flags) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="进度" width="110">
                    <template #default="{ row }">
                      {{ percentText(row.progress) }}
                    </template>
                  </el-table-column>
                  <el-table-column label="重规划" width="100">
                    <template #default="{ row }">
                      <el-tag
                        :type="row.need_replan ? 'warning' : 'info'"
                        effect="plain"
                      >
                        {{ row.need_replan ? "需要" : "暂无" }}
                      </el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column label="操作" width="150" fixed="right">
                    <template #default="{ row }">
                      <el-button
                        type="primary"
                        link
                        @click="handleSelectStudent(row, 'assessment')"
                      >
                        看测评
                      </el-button>
                      <el-button link @click="handleSelectStudent(row, 'path')">
                        路径
                      </el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </section>
            </div>
          </el-tab-pane>

          <el-tab-pane label="路径进展" name="paths">
            <section class="rounded-2xl border border-gray-100 bg-white p-4">
              <div class="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
                <div class="governance-mini">
                  <span>活跃路径</span>
                  <strong>{{ pathSummary?.active_path_students ?? 0 }}</strong>
                </div>
                <div class="governance-mini">
                  <span>平均完成</span>
                  <strong>
                    {{ percentText(pathSummary?.average_completion_rate) }}
                  </strong>
                </div>
                <div class="governance-mini">
                  <span>逾期节点</span>
                  <strong>{{ pathSummary?.overdue_node_count ?? 0 }}</strong>
                </div>
                <div class="governance-mini">
                  <span>需重规划</span>
                  <strong>{{ pathSummary?.need_replan_count ?? 0 }}</strong>
                </div>
              </div>

              <el-table :data="pathList" height="460">
                <el-table-column label="学生" min-width="150">
                  <template #default="{ row }">
                    {{ row.student_name || `学生 ${row.student_id}` }}
                  </template>
                </el-table-column>
                <el-table-column label="路径版本" width="110">
                  <template #default="{ row }">
                    v{{ row.path_version }}
                  </template>
                </el-table-column>
                <el-table-column label="摘要" min-width="220">
                  <template #default="{ row }">
                    <span class="line-clamp-2">
                      {{ row.summary || row.path_id }}
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="120">
                  <template #default="{ row }">
                    <el-tag :type="statusTagType(row.status)" effect="plain">
                      {{ row.status }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="应用状态" width="120">
                  <template #default="{ row }">
                    {{ row.apply_status || "暂无" }}
                  </template>
                </el-table-column>
                <el-table-column label="完成度" width="150">
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
                <el-table-column label="逾期" width="80">
                  <template #default="{ row }">
                    {{ row.overdue_nodes }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="100" fixed="right">
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

          <el-tab-pane label="Trace" name="trace">
            <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_380px] gap-4">
              <section
                v-loading="taskTraceLoading"
                class="rounded-2xl border border-gray-100 bg-white p-4 min-h-[430px]"
              >
                <div class="flex items-center justify-between gap-4 mb-4">
                  <div>
                    <h3 class="text-base font-semibold text-gray-800">
                      资源任务 Trace
                    </h3>
                    <p class="text-xs text-gray-400 mt-1">
                      从资源治理表点击 Trace 后查看完整执行链路
                    </p>
                  </div>
                  <el-tag
                    v-if="selectedTaskTrace?.task?.status"
                    :type="statusTagType(selectedTaskTrace.task.status)"
                    effect="plain"
                  >
                    {{ selectedTaskTrace.task.status }}
                  </el-tag>
                </div>

                <template v-if="selectedTaskTrace">
                  <div class="rounded-xl bg-gray-50 p-3 mb-4">
                    <p class="font-mono text-xs text-gray-600 break-all">
                      {{ selectedTaskTrace.task.task_id }}
                    </p>
                    <p class="text-xs text-gray-400 mt-1">
                      {{ selectedTaskTrace.task.stage || "暂无阶段" }}
                    </p>
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
                          {{ step.agent_label || step.agent || step.agent_key }}
                        </p>
                        <p class="text-xs text-gray-500">
                          {{ step.stage }}，{{ step.status }}
                          <span v-if="step.duration_ms">
                            ，{{ step.duration_ms }}ms
                          </span>
                        </p>
                        <p v-if="step.summary" class="text-sm text-gray-600">
                          {{ step.summary }}
                        </p>
                        <p
                          v-if="step.degraded_reason"
                          class="text-xs text-orange-500"
                        >
                          降级原因：{{ step.degraded_reason }}
                        </p>
                      </div>
                    </el-timeline-item>
                  </el-timeline>
                  <el-empty
                    v-else
                    description="该任务暂无 Trace 步骤"
                    :image-size="120"
                  />

                  <div v-if="selectedTaskTrace.logs?.length" class="mt-4">
                    <p class="text-sm font-medium text-gray-700 mb-2">
                      执行日志
                    </p>
                    <div class="space-y-2">
                      <div
                        v-for="(log, index) in selectedTaskTrace.logs"
                        :key="`${log.stage}-${index}`"
                        class="rounded-xl bg-gray-50 p-3"
                      >
                        <div class="flex items-center justify-between gap-3">
                          <span class="text-sm font-medium text-gray-700">
                            {{ log.stage }}
                          </span>
                          <el-tag
                            size="small"
                            :type="statusTagType(log.status)"
                            effect="plain"
                          >
                            {{ log.status }}
                          </el-tag>
                        </div>
                        <p class="text-sm text-gray-500 mt-1">
                          {{ log.message }}
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
                  description="请先从资源任务中选择一个 Trace"
                  :image-size="120"
                />
              </section>

              <section
                v-loading="conversationTraceLoading"
                class="rounded-2xl border border-gray-100 bg-white p-4 min-h-[430px]"
              >
                <h3 class="text-base font-semibold text-gray-800 mb-2">
                  会话 Trace 查询
                </h3>
                <p class="text-xs text-gray-400 mb-4">
                  输入 conversation_id 后查看安全状态、来源引用和资源链接
                </p>

                <div class="flex gap-2 mb-4">
                  <el-input
                    v-model="conversationTraceId"
                    clearable
                    placeholder="conversation_id"
                    @keyup.enter="loadConversationTrace"
                  >
                    <template #prefix>
                      <el-icon><ChatLineRound /></el-icon>
                    </template>
                  </el-input>
                  <el-button type="primary" @click="loadConversationTrace">
                    查询
                  </el-button>
                </div>

                <template v-if="selectedConversationTrace">
                  <div class="rounded-xl bg-gray-50 p-3 mb-4">
                    <p class="text-sm font-medium text-gray-800">
                      {{ selectedConversationTrace.title || "未命名会话" }}
                    </p>
                    <p class="font-mono text-xs text-gray-500 mt-1 break-all">
                      {{ selectedConversationTrace.conversation_id }}
                    </p>
                  </div>

                  <div class="space-y-3">
                    <div class="governance-row">
                      <span>安全状态</span>
                      <el-tag
                        :type="
                          statusTagType(selectedConversationTrace.safety?.status)
                        "
                        effect="plain"
                      >
                        {{ selectedConversationTrace.safety?.status || "暂无" }}
                      </el-tag>
                    </div>
                    <div class="governance-row">
                      <span>来源引用</span>
                      <strong>
                        {{ selectedConversationTrace.source_refs?.length ?? 0 }}
                      </strong>
                    </div>
                    <div class="governance-row">
                      <span>资源链接</span>
                      <strong>
                        {{
                          selectedConversationTrace.resource_links?.length ?? 0
                        }}
                      </strong>
                    </div>
                  </div>

                  <el-timeline
                    v-if="selectedConversationTrace.trace?.length"
                    class="mt-5"
                  >
                    <el-timeline-item
                      v-for="(step, index) in selectedConversationTrace.trace"
                      :key="`${step.stage}-${index}`"
                      :timestamp="formatDate(step.finished_at || step.started_at)"
                      :type="statusTagType(step.status)"
                    >
                      <p class="text-sm font-medium text-gray-800">
                        {{ step.agent_label || step.agent || step.agent_key }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ step.stage }}，{{ step.status }}
                      </p>
                      <p v-if="step.summary" class="text-sm text-gray-600 mt-1">
                        {{ step.summary }}
                      </p>
                    </el-timeline-item>
                  </el-timeline>
                </template>
                <el-empty
                  v-else
                  description="暂无会话 Trace"
                  :image-size="120"
                />
              </section>
            </div>
          </el-tab-pane>
        </el-tabs>
      </template>
    </div>
  </div>
</template>

<style scoped>
.a3-governance-page {
  min-width: 0;
}

.a3-stat-panel {
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;
}

.a3-stat-panel:hover {
  border-color: rgb(64 158 255 / 28%);
  transform: translateY(-1px);
}

.stat-icon {
  color: var(--el-color-primary);
  background: rgb(64 158 255 / 10%);
}

.tone-violet .stat-icon {
  color: #7c3aed;
  background: rgb(124 58 237 / 10%);
}

.tone-orange .stat-icon {
  color: #d97706;
  background: rgb(217 119 6 / 12%);
}

.tone-green .stat-icon {
  color: #059669;
  background: rgb(5 150 105 / 10%);
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
  padding: 12px;
  background: rgb(249 250 251 / 72%);
  border: 1px solid rgb(243 244 246);
  border-radius: 14px;
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

  .governance-search,
  .governance-risk,
  .governance-date {
    width: 100%;
  }
}
</style>
