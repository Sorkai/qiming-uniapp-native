<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  Search,
  MagicStick,
  Refresh,
  Download,
  CircleCheck,
  EditPen,
  Delete,
  Stamp
} from "@element-plus/icons-vue";
import {
  assistantApiErrorMessage,
  createAssistantResourceTask,
  deleteAssistantResource,
  getAssistantResourceTask,
  getAssistantTaskTrace,
  listAssistantResourceTaskLogs,
  listAssistantResourceTasks,
  listAssistantResourceVersions,
  listAssistantResources,
  publishAssistantResource,
  reportAssistantResourceUsage,
  reviewAssistantResource,
  updateAssistantResource,
  type AssistantResourceSummary,
  type AssistantResourceTaskItem,
  type AssistantResourceTaskLogItem,
  type AssistantResourceUsageEventType,
  type AssistantResourceVersionItem,
  type AssistantChatTraceStep
} from "@/api/frontend/assistant";

const props = defineProps<{
  courseId?: number;
  targetStudentId?: number;
  requiresTargetStudent?: boolean;
}>();

const contextWarning = computed(() => {
  if (!props.courseId) return "请先选择课程";
  if (props.requiresTargetStudent && !props.targetStudentId) {
    return "请先选择学生";
  }
  return "";
});
const hasRequiredContext = computed(() => !contextWarning.value);

const loading = ref(false);
const resourceLoading = ref(false);
const creating = ref(false);
const searchQuery = ref("");
const resourceType = ref("");
const tasks = ref<AssistantResourceTaskItem[]>([]);
const resources = ref<AssistantResourceSummary[]>([]);
const selectedTaskId = ref("");
const taskLogs = ref<AssistantResourceTaskLogItem[]>([]);
const taskTrace = ref<AssistantChatTraceStep[]>([]);
const detailVisible = ref(false);
const selectedResource = ref<AssistantResourceSummary | null>(null);
const resourceVersions = ref<AssistantResourceVersionItem[]>([]);
const resourceOpenedAt = ref(0);
const resourceFeedbackScore = ref(5);
const resourceFeedbackText = ref("");
const feedbackSubmitting = ref(false);
const completeSubmitting = ref(false);
const governanceSubmitting = ref(false);
const editMode = ref(false);
const detailActivePanels = ref(["summary", "feedback"]);
const taskActivePanels = ref<string[]>([]);
let taskPollingTimer: number | undefined;
let taskPollingInFlight = false;
let resourceRequestSequence = 0;
const editForm = ref({
  title: "",
  summary: "",
  description: "",
  content_format: "markdown",
  content_body: "",
  knowledge_point_id: "",
  knowledge_relevance: 0,
  edit_reason: ""
});

const ensureCourseContext = () => {
  if (hasRequiredContext.value) return true;
  ElMessage.warning(contextWarning.value || "请先选择课程");
  return false;
};

const resetResourceSelection = () => {
  resourceRequestSequence += 1;
  resourceLoading.value = false;
  selectedTaskId.value = "";
  taskLogs.value = [];
  taskTrace.value = [];
  detailVisible.value = false;
  selectedResource.value = null;
  resourceVersions.value = [];
  editMode.value = false;
};

const selectedTask = computed(() =>
  tasks.value.find(task => task.task_id === selectedTaskId.value)
);

const selectedTaskLabel = computed(() =>
  selectedTask.value ? taskTitle(selectedTask.value) : ""
);

const filteredResources = computed(() => {
  const keyword = searchQuery.value.trim().toLowerCase();
  const hasTaskAssociations = resources.value.some(
    resource => resource.task_id
  );
  return resources.value.filter(resource => {
    const matchesTask =
      !selectedTaskId.value ||
      !hasTaskAssociations ||
      resource.task_id === selectedTaskId.value;
    const matchesKeyword =
      !keyword ||
      resource.title.toLowerCase().includes(keyword) ||
      resource.summary?.toLowerCase().includes(keyword) ||
      resource.recommendation?.toLowerCase().includes(keyword);
    const matchesType =
      !resourceType.value || resource.resource_type === resourceType.value;
    return matchesTask && matchesKeyword && matchesType;
  });
});

const resourceTypeOptions = computed(() =>
  Array.from(new Set(resources.value.map(item => item.resource_type))).filter(
    Boolean
  )
);

const statusTextMap: Record<string, string> = {
  completed: "已完成",
  completed_with_warnings: "带警告完成",
  partial: "部分完成",
  ready: "可用",
  published: "已发布",
  approved: "已通过",
  safe: "安全",
  failed: "失败",
  blocked: "已阻断",
  rejected: "已驳回",
  deleted: "已删除",
  degraded: "降级",
  processing: "处理中",
  pending: "待处理",
  changes_requested: "需修改",
  draft: "草稿",
  reviewed: "已审核",
  not_configured: "未配置",
  exportable_only: "仅可导出",
  missing: "缺失",
  running: "运行中",
  queued: "排队中",
  default: "默认"
};

const warningFlagTextMap: Record<string, string> = {
  rag_empty: "知识库无证据",
  llm_unavailable: "模型不可用",
  llm_json_invalid: "JSON 解析失败",
  json_repair_failed: "JSON 修复失败",
  degraded: "降级生成",
  not_configured: "能力未配置",
  evidence_insufficient: "证据不足",
  storage_degraded: "存储降级",
  html_animation_processing: "动画处理中",
  html_animation_failed: "动画失败",
  pptx_processing: "PPT 处理中",
  question_bank_processing: "题库处理中",
  runtime_not_configured: "运行环境未配置",
  safety_warning: "安全提醒",
  safety_blocked: "安全阻断"
};

const resourceTypeTextMap: Record<string, string> = {
  explanation_doc: "讲解文档",
  mind_map: "思维导图",
  courseware_ppt: "课件",
  exercise_set: "练习题",
  extended_reading: "拓展阅读",
  html_animation: "动画演示",
  coding_practice_case: "编程案例",
  video: "视频",
  animation: "动画",
  html: "网页",
  code: "代码",
  document: "文档"
};

const formatTextMap: Record<string, string> = {
  markdown: "Markdown",
  html: "HTML",
  pptx: "PPTX",
  pdf: "PDF",
  json: "JSON",
  text: "文本"
};

const agentNameMap: Record<string, string> = {
  LearningAssistant: "学习助手",
  ProfileAgent: "画像分析",
  PlannerAgent: "路径规划",
  ExplanationAgent: "讲解生成",
  ExerciseAgent: "练习生成",
  ResourceAgent: "资源生成"
};

const textOf = (
  map: Record<string, string>,
  value?: string,
  fallback = "暂无"
) => {
  const key = String(value || "").trim();
  if (!key) return fallback;
  return map[key] || key;
};

const statusText = (status?: string) => textOf(statusTextMap, status);
const warningFlagText = (flag?: string) =>
  textOf(warningFlagTextMap, flag, "");
const resourceTypeText = (type?: string) => textOf(resourceTypeTextMap, type);
const formatText = (format?: string) => textOf(formatTextMap, format);
const agentText = (name?: string) => textOf(agentNameMap, name, "调度节点");
const taskTitle = (task: AssistantResourceTaskItem) =>
  task.stage ? statusText(task.stage) : `任务 ${task.task_id.slice(0, 8)}`;

const tagType = (status: string) => {
  if (["completed", "ready", "published", "approved", "safe"].includes(status))
    return "success";
  if (["failed", "blocked", "rejected", "deleted"].includes(status))
    return "danger";
  if (
    [
      "completed_with_warnings",
      "partial",
      "degraded",
      "processing",
      "pending",
      "changes_requested"
    ].includes(status)
  )
    return "warning";
  return "warning";
};

const statusProgress = (task: AssistantResourceTaskItem) =>
  Math.min(100, Math.max(0, Math.round(Number(task.progress || 0))));
const taskProgressStatus = (task: AssistantResourceTaskItem) => {
  if (["failed", "blocked"].includes(task.status)) return "exception";
  if (["completed_with_warnings", "partial"].includes(task.status)) {
    return "warning";
  }
  if (task.status === "completed") return "success";
  return undefined;
};

const taskTerminalStatuses = new Set([
  "completed",
  "completed_with_warnings",
  "partial",
  "failed",
  "degraded",
  "cancelled",
  "blocked"
]);
const isTerminalTask = (status?: string) =>
  taskTerminalStatuses.has(String(status || "").toLowerCase());

const qualityLabel = (score?: number) => {
  if (score === undefined || score === null) return "";
  const normalized = score <= 1 ? score * 100 : score;
  return `${Math.round(normalized)}%`;
};

const hasInlinePreview = (resource?: AssistantResourceSummary | null) =>
  !!resource?.content_body && !resource.preview_url;

const incompleteStates = computed(() => {
  const resource = selectedResource.value;
  if (!resource) return [];
  return [
    resource.pptx_status
      ? { label: "PPTX", value: resource.pptx_status }
      : null,
    resource.question_bank_status
      ? { label: "题库", value: resource.question_bank_status }
      : null,
    resource.runtime_status
      ? { label: "代码运行", value: resource.runtime_status }
      : null,
    resource.storage_status
      ? { label: "对象存储", value: resource.storage_status }
      : null,
    resource.html_animation_status
      ? { label: "HTML 动画", value: resource.html_animation_status }
      : null
  ].filter(Boolean) as { label: string; value: string }[];
});

const showAsIncomplete = (value?: string) =>
  [
    "not_configured",
    "exportable_only",
    "degraded",
    "processing",
    "missing"
  ].includes(String(value || ""));

const reportResourceUsage = async (
  resource: AssistantResourceSummary,
  eventType: AssistantResourceUsageEventType,
  extra: Record<string, any> = {}
) => {
  try {
    await reportAssistantResourceUsage({
      resource_id: resource.resource_id,
      course_id: props.courseId,
      target_student_id: props.targetStudentId,
      event_type: eventType,
      ...extra
    });
  } catch (error) {
    console.warn("[AiResourceGeneration] 资源使用事件上报失败:", error);
  }
};

const resourceQuery = (taskId = selectedTaskId.value) => ({
  course_id: props.courseId,
  target_student_id: props.targetStudentId,
  task_id: taskId || undefined
});

const loadResources = async () => {
  if (!hasRequiredContext.value) {
    tasks.value = [];
    resources.value = [];
    resetResourceSelection();
    return;
  }
  loading.value = true;
  const taskId = selectedTaskId.value;
  const requestSequence = ++resourceRequestSequence;
  try {
    const [taskResult, resourceResult] = await Promise.allSettled([
      listAssistantResourceTasks({
        course_id: props.courseId,
        target_student_id: props.targetStudentId
      }),
      listAssistantResources(resourceQuery(taskId))
    ]);
    tasks.value =
      taskResult.status === "fulfilled"
        ? taskResult.value?.data?.list || []
        : [];
    if (
      requestSequence === resourceRequestSequence &&
      taskId === selectedTaskId.value
    ) {
      resources.value =
        resourceResult.status === "fulfilled"
          ? resourceResult.value?.data?.list || []
          : [];
    }
    scheduleTaskPolling();
    if (
      taskResult.status === "rejected" ||
      resourceResult.status === "rejected"
    ) {
      console.warn("[AiResourceGeneration] 部分学习资源接口加载失败", {
        taskError:
          taskResult.status === "rejected" ? taskResult.reason : undefined,
        resourceError:
          resourceResult.status === "rejected"
            ? resourceResult.reason
            : undefined
      });
    }
  } catch (error: any) {
    console.error("[AiResourceGeneration] 学习资源加载失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "学习资源加载失败"));
  } finally {
    loading.value = false;
  }
};

const loadTaskActivity = async (taskId: string) => {
  try {
    const [logsResult, traceResult] = await Promise.allSettled([
      listAssistantResourceTaskLogs(taskId),
      getAssistantTaskTrace(taskId)
    ]);
    taskLogs.value =
      logsResult.status === "fulfilled"
        ? logsResult.value?.data?.list || []
        : [];
    taskTrace.value =
      traceResult.status === "fulfilled"
        ? traceResult.value?.data?.trace || []
        : [];
  } catch (error: any) {
    console.error("[AiResourceGeneration] 任务日志加载失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "任务日志加载失败"));
  }
};

const loadTaskResources = async (taskId: string) => {
  const requestSequence = ++resourceRequestSequence;
  resourceLoading.value = true;
  try {
    const { data } = await listAssistantResources(resourceQuery(taskId));
    if (
      requestSequence === resourceRequestSequence &&
      selectedTaskId.value === taskId
    ) {
      resources.value = data.list || [];
    }
  } catch (error: any) {
    if (
      requestSequence === resourceRequestSequence &&
      selectedTaskId.value === taskId
    ) {
      resources.value = [];
      ElMessage.error(assistantApiErrorMessage(error, "任务资源加载失败"));
    }
  } finally {
    if (requestSequence === resourceRequestSequence) {
      resourceLoading.value = false;
    }
  }
};

const selectTask = async (taskId: string) => {
  selectedTaskId.value = taskId;
  taskLogs.value = [];
  taskTrace.value = [];
  resources.value = [];
  resourceType.value = "";
  taskActivePanels.value = ["logs", "trace"];

  await Promise.all([loadTaskActivity(taskId), loadTaskResources(taskId)]);
};

const stopTaskPolling = () => {
  if (taskPollingTimer) window.clearTimeout(taskPollingTimer);
  taskPollingTimer = undefined;
};

const upsertTask = (task: AssistantResourceTaskItem) => {
  const index = tasks.value.findIndex(item => item.task_id === task.task_id);
  if (index >= 0) {
    tasks.value[index] = { ...tasks.value[index], ...task };
  } else {
    tasks.value = [task, ...tasks.value];
  }
};

const scheduleTaskPolling = () => {
  stopTaskPolling();
  if (!tasks.value.some(task => !isTerminalTask(task.status))) return;
  const delay = document.hidden ? 10000 : 2000;
  taskPollingTimer = window.setTimeout(() => {
    taskPollingTimer = undefined;
    void refreshPendingTasks();
  }, delay);
};

const refreshPendingTasks = async () => {
  if (taskPollingInFlight || !hasRequiredContext.value) return;
  const pendingTasks = tasks.value.filter(task => !isTerminalTask(task.status));
  if (!pendingTasks.length) {
    stopTaskPolling();
    return;
  }

  taskPollingInFlight = true;
  let hasNewTerminalTask = false;
  try {
    const results = await Promise.allSettled(
      pendingTasks.map(task => getAssistantResourceTask(task.task_id))
    );
    results.forEach((result, index) => {
      if (result.status !== "fulfilled" || !result.value.data.task) return;
      const previous = pendingTasks[index];
      const latest = result.value.data.task;
      upsertTask(latest);
      if (!isTerminalTask(previous.status) && isTerminalTask(latest.status)) {
        hasNewTerminalTask = true;
      }
      if (selectedTaskId.value === latest.task_id) {
        void loadTaskActivity(latest.task_id);
      }
    });
  } catch (error) {
    console.warn("[AiResourceGeneration] 任务状态刷新失败:", error);
  } finally {
    taskPollingInFlight = false;
  }

  if (hasNewTerminalTask) void loadResources();
  else scheduleTaskPolling();
};

const handleCreateTask = async () => {
  if (!ensureCourseContext()) return;
  creating.value = true;
  try {
    const { data } = await createAssistantResourceTask({
      course_id: props.courseId,
      target_student_id: props.targetStudentId,
      resource_types: [
        "explanation_doc",
        "mind_map",
        "courseware_ppt",
        "exercise_set",
        "extended_reading",
        "html_animation",
        "coding_practice_case"
      ],
      prompt: "请围绕当前课程薄弱点生成一组个性化学习资源"
    });
    ElMessage.success(data.message || "资源生成任务已创建");
    await loadResources();
    if (data.task?.task_id) {
      await selectTask(data.task.task_id);
    }
  } catch (error: any) {
    console.error("[AiResourceGeneration] 创建资源任务失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "创建资源任务失败"));
  } finally {
    creating.value = false;
  }
};

const openResourceDetail = (resource: AssistantResourceSummary) => {
  selectedResource.value = resource;
  editForm.value = {
    title: resource.title || "",
    summary: resource.summary || "",
    description: resource.description || "",
    content_format: resource.content_format || "markdown",
    content_body: resource.content_body || "",
    knowledge_point_id: resource.knowledge_point_id || "",
    knowledge_relevance: resource.knowledge_relevance || 0,
    edit_reason: ""
  };
  editMode.value = false;
  resourceVersions.value = [];
  detailActivePanels.value = ["summary", "feedback"];
  detailVisible.value = true;
  resourceOpenedAt.value = Date.now();
  resourceFeedbackScore.value = 5;
  resourceFeedbackText.value = "";
  void reportResourceUsage(resource, "open", {
    metadata: {
      content_format: resource.content_format || "",
      html_animation_status: resource.html_animation_status || ""
    }
  });
  void loadResourceVersions(resource.resource_id);
};

const handleResourceDialogClosed = () => {
  const resource = selectedResource.value;
  if (resource && resourceOpenedAt.value) {
    void reportResourceUsage(resource, "heartbeat", {
      dwell_ms: Math.max(Date.now() - resourceOpenedAt.value, 0),
      progress_percent: 100
    });
  }
  selectedResource.value = null;
  resourceOpenedAt.value = 0;
};

const openUrl = (url?: string, resource?: AssistantResourceSummary) => {
  if (!url) {
    ElMessage.warning("当前资源暂无可访问链接");
    return;
  }
  if (resource) {
    void reportResourceUsage(resource, "view", {
      metadata: { target: url }
    });
  }
  window.open(url, "_blank");
};

const loadResourceVersions = async (resourceId: string) => {
  try {
    const { data } = await listAssistantResourceVersions(resourceId);
    resourceVersions.value = data.list || [];
  } catch (error) {
    console.warn("[AiResourceGeneration] 资源版本加载失败:", error);
  }
};

const handleCompleteResource = async () => {
  if (!selectedResource.value) return;
  if (!ensureCourseContext()) return;
  completeSubmitting.value = true;
  try {
    await reportResourceUsage(selectedResource.value, "complete", {
      completed: true,
      progress_percent: 100
    });
    ElMessage.success("已记录资源完成状态");
  } finally {
    completeSubmitting.value = false;
  }
};

const handleSubmitFeedback = async () => {
  if (!selectedResource.value) return;
  if (!ensureCourseContext()) return;
  feedbackSubmitting.value = true;
  try {
    await reportResourceUsage(selectedResource.value, "feedback", {
      feedback_score: resourceFeedbackScore.value,
      feedback_text: resourceFeedbackText.value.trim()
    });
    ElMessage.success("资源反馈已提交");
    resourceFeedbackText.value = "";
  } finally {
    feedbackSubmitting.value = false;
  }
};

const syncSelectedResource = (resource?: AssistantResourceSummary) => {
  if (!resource) return;
  selectedResource.value = resource;
  const index = resources.value.findIndex(
    item => item.resource_id === resource.resource_id
  );
  if (index >= 0) resources.value[index] = resource;
};

const handleSaveResource = async () => {
  if (!selectedResource.value) return;
  if (!ensureCourseContext()) return;
  governanceSubmitting.value = true;
  try {
    const { data } = await updateAssistantResource(
      selectedResource.value.resource_id,
      {
        ...editForm.value,
        knowledge_relevance: Number(editForm.value.knowledge_relevance || 0)
      }
    );
    syncSelectedResource(data.resource);
    editMode.value = false;
    ElMessage.success(data.message || "资源已保存为草稿，等待审核");
    await loadResourceVersions(selectedResource.value.resource_id);
  } catch (error: any) {
    console.error("[AiResourceGeneration] 资源保存失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "资源保存失败"));
  } finally {
    governanceSubmitting.value = false;
  }
};

const handleReviewResource = async (reviewStatus: string) => {
  if (!selectedResource.value) return;
  if (!ensureCourseContext()) return;
  governanceSubmitting.value = true;
  try {
    const { data } = await reviewAssistantResource(
      selectedResource.value.resource_id,
      {
        review_status: reviewStatus,
        review_comment:
          reviewStatus === "approved"
            ? "内容准确，可以发布"
            : "请根据教师意见调整"
      }
    );
    syncSelectedResource(data.resource);
    ElMessage.success(data.message || "资源审核状态已更新");
    await loadResources();
  } catch (error: any) {
    console.error("[AiResourceGeneration] 资源审核失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "资源审核失败"));
  } finally {
    governanceSubmitting.value = false;
  }
};

const handlePublishResource = async () => {
  if (!selectedResource.value) return;
  if (!ensureCourseContext()) return;
  governanceSubmitting.value = true;
  try {
    const { data } = await publishAssistantResource(
      selectedResource.value.resource_id
    );
    syncSelectedResource(data.resource);
    const status = data.resource?.status || data.status;
    if (status === "degraded" || data.resource?.storage_status === "degraded") {
      ElMessage.warning(data.message || "资源已发布但存在降级状态");
    } else {
      ElMessage.success(data.message || "资源已发布");
    }
    await loadResources();
  } catch (error: any) {
    console.error("[AiResourceGeneration] 资源发布失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "资源发布失败"));
  } finally {
    governanceSubmitting.value = false;
  }
};

const handleDeleteResource = async () => {
  if (!selectedResource.value) return;
  if (!ensureCourseContext()) return;
  governanceSubmitting.value = true;
  try {
    const { data } = await deleteAssistantResource(
      selectedResource.value.resource_id
    );
    ElMessage.success(data.message || "资源已删除");
    detailVisible.value = false;
    await loadResources();
  } catch (error: any) {
    console.error("[AiResourceGeneration] 资源删除失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "资源删除失败"));
  } finally {
    governanceSubmitting.value = false;
  }
};

onMounted(() => {
  void loadResources();
});
onBeforeUnmount(stopTaskPolling);
watch(
  () => [props.courseId, props.targetStudentId],
  () => {
    stopTaskPolling();
    resetResourceSelection();
    void loadResources();
  }
);
</script>

<template>
  <div
    v-loading="loading"
    class="resource-workbench h-full flex flex-col bg-transparent overflow-hidden"
  >
    <div class="resource-shell">
      <div class="resource-toolbar">
        <div class="resource-toolbar__title">
          <h2>资源生成工作台</h2>
          <p v-if="selectedTaskLabel" class="resource-toolbar__scope">
            当前展示：{{ selectedTaskLabel }} 的生成资源
          </p>
        </div>

        <div class="resource-toolbar__controls">
          <el-input
            v-model="searchQuery"
            placeholder="搜索资源标题、摘要或建议"
            class="resource-search"
            :prefix-icon="Search"
          />
          <el-select
            v-model="resourceType"
            placeholder="资源类型"
            class="resource-type-select"
            clearable
          >
            <el-option label="全部" value="" />
            <el-option
              v-for="type in resourceTypeOptions"
              :key="type"
              :label="resourceTypeText(type)"
              :value="type"
            />
          </el-select>
          <el-button plain :icon="Refresh" @click="loadResources">
            刷新
          </el-button>
          <el-button
            type="primary"
            :loading="creating"
            :disabled="!hasRequiredContext"
            @click="handleCreateTask"
          >
            <template #icon>
              <el-icon><MagicStick /></el-icon>
            </template>
            新建生成任务
          </el-button>
        </div>
      </div>

      <div class="resource-main">
        <div class="workbench-panel task-panel">
          <div class="workbench-panel__header">
            <span>任务中心</span>
            <el-tag size="small" effect="plain"
              >{{ tasks.length }} 个任务</el-tag
            >
          </div>
          <div class="flex-1 overflow-y-auto p-4 space-y-3">
            <div
              v-for="task in tasks"
              :key="task.task_id"
              class="task-card"
              :class="selectedTaskId === task.task_id ? 'is-active' : ''"
              role="button"
              tabindex="0"
              :aria-pressed="selectedTaskId === task.task_id"
              @click="selectTask(task.task_id)"
              @keydown.enter.prevent="selectTask(task.task_id)"
              @keydown.space.prevent="selectTask(task.task_id)"
            >
              <div class="flex items-center justify-between gap-2">
                <span class="font-semibold text-base text-gray-800 truncate">
                  {{ taskTitle(task) }}
                </span>
                <el-tag
                  size="small"
                  :type="tagType(task.status)"
                  effect="plain"
                >
                  {{ statusText(task.status) }}
                </el-tag>
              </div>
              <el-progress
                class="resource-progress mt-4"
                :percentage="statusProgress(task)"
                :status="taskProgressStatus(task)"
                :stroke-width="12"
                striped
                striped-flow
                :duration="14"
              />
              <p v-if="task.error_message" class="mt-2 text-xs text-red-500">
                {{ task.error_message }}
              </p>
              <p
                v-else-if="task.health_summary"
                class="mt-2 text-xs leading-5 text-gray-500"
              >
                {{ task.health_summary }}
              </p>
              <div
                v-if="
                  task.incomplete_resource_count || task.failed_resource_count
                "
                class="mt-2 flex flex-wrap gap-1.5"
              >
                <el-tag
                  v-if="task.incomplete_resource_count"
                  size="small"
                  type="warning"
                  effect="plain"
                >
                  {{ task.incomplete_resource_count }} 个不完整
                </el-tag>
                <el-tag
                  v-if="task.failed_resource_count"
                  size="small"
                  type="danger"
                  effect="plain"
                >
                  {{ task.failed_resource_count }} 个失败
                </el-tag>
              </div>
              <div
                v-if="task.warning_flags?.length"
                class="mt-2 flex flex-wrap gap-1.5"
              >
                <el-tag
                  v-for="flag in task.warning_flags.slice(0, 4)"
                  :key="flag"
                  size="small"
                  type="warning"
                  effect="plain"
                  class="!rounded-md"
                >
                  {{ warningFlagText(flag) || flag }}
                </el-tag>
                <el-tag
                  v-if="task.warning_flags.length > 4"
                  size="small"
                  type="warning"
                  effect="plain"
                  class="!rounded-md"
                >
                  +{{ task.warning_flags.length - 4 }}
                </el-tag>
              </div>
              <div class="mt-3 flex flex-wrap gap-1.5">
                <el-tag
                  v-for="type in task.resource_types || []"
                  :key="type"
                  size="small"
                  effect="plain"
                  class="!rounded-md"
                >
                  {{ resourceTypeText(type) }}
                </el-tag>
              </div>
            </div>
            <el-empty v-if="!tasks.length" description="暂无生成任务" />
          </div>
          <div
            v-if="selectedTaskId"
            class="task-collapse-wrap border-t border-gray-100 px-4 py-3"
          >
            <el-collapse v-model="taskActivePanels">
              <el-collapse-item title="任务日志" name="logs">
                <el-timeline v-if="taskLogs.length">
                  <el-timeline-item
                    v-for="log in taskLogs"
                    :key="`${log.occurred_at}-${log.stage}`"
                    :timestamp="log.occurred_at"
                    :type="tagType(log.status)"
                    hollow
                  >
                    <span class="text-sm text-gray-600">{{ log.message }}</span>
                  </el-timeline-item>
                </el-timeline>
                <el-empty v-else description="暂无任务日志" :image-size="72" />
              </el-collapse-item>
              <el-collapse-item
                v-if="taskTrace.length"
                title="调度记录"
                name="trace"
              >
                <div class="space-y-2">
                  <div
                    v-for="(step, index) in taskTrace"
                    :key="`${step.agent_key || step.agent}-${step.stage}-${index}`"
                    class="rounded-lg bg-white border border-gray-100 px-3 py-2 text-sm"
                  >
                    <div class="flex items-center justify-between gap-2">
                      <span class="font-semibold text-gray-700">
                        {{
                          agentText(
                            step.agent_label || step.agent || step.agent_key
                          )
                        }}
                      </span>
                      <el-tag
                        size="small"
                        :type="tagType(step.status)"
                        effect="plain"
                      >
                        {{ statusText(step.status) }}
                      </el-tag>
                    </div>
                    <p class="mt-1 text-gray-500 leading-relaxed">
                      {{
                        step.degraded_reason ||
                        step.summary ||
                        statusText(step.stage)
                      }}
                    </p>
                    <div
                      v-if="step.warning_flags?.length"
                      class="mt-2 flex flex-wrap gap-1.5"
                    >
                      <el-tag
                        v-for="flag in step.warning_flags"
                        :key="flag"
                        size="small"
                        type="warning"
                        effect="plain"
                      >
                        {{ warningFlagText(flag) || flag }}
                      </el-tag>
                    </div>
                  </div>
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>

        <div
          v-loading="resourceLoading"
          class="min-h-0 overflow-y-auto"
          element-loading-text="正在加载任务资源"
        >
          <div
            v-if="filteredResources.length"
            class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 auto-rows-max"
          >
            <article
              v-for="res in filteredResources"
              :key="res.resource_id"
              class="resource-card"
            >
              <div class="flex items-start justify-between gap-3">
                <div class="min-w-0">
                  <el-tag
                    size="small"
                    effect="plain"
                    :type="tagType(res.status)"
                  >
                    {{ resourceTypeText(res.resource_type) }}
                  </el-tag>
                  <h3
                    class="mt-3 text-lg font-semibold text-gray-800 line-clamp-2"
                  >
                    {{ res.title }}
                  </h3>
                </div>
                <el-tag size="small" :type="tagType(res.status)" effect="plain">
                  {{ statusText(res.status) }}
                </el-tag>
              </div>

              <p class="mt-3 text-sm text-gray-600 leading-6 line-clamp-2">
                {{ res.summary || res.recommendation || "暂无摘要" }}
              </p>

              <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div class="resource-metric">
                  <span>质量</span>
                  <b>{{ qualityLabel(res.quality_score) || "暂无" }}</b>
                </div>
                <div class="resource-metric">
                  <span>格式</span>
                  <b>{{ formatText(res.content_format) }}</b>
                </div>
              </div>

              <div class="resource-state-group">
                <div class="resource-state-tags">
                  <el-tag
                    v-if="res.review_status"
                    size="small"
                    :type="tagType(res.review_status)"
                    effect="plain"
                  >
                    审核 {{ statusText(res.review_status) }}
                  </el-tag>
                  <el-tag
                    v-if="res.safety_status"
                    size="small"
                    :type="res.safety_status === 'safe' ? 'success' : 'warning'"
                    effect="plain"
                  >
                    {{ statusText(res.safety_status) }}
                  </el-tag>
                  <el-tag v-if="res.version_no" size="small" effect="plain">
                    v{{ res.version_no }}
                  </el-tag>
                </div>

                <p
                  v-if="
                    (res.html_animation_status &&
                      res.html_animation_status !== 'ready') ||
                    showAsIncomplete(res.storage_status)
                  "
                  class="resource-state-alert line-clamp-2"
                >
                  {{
                    res.html_animation_message ||
                    res.html_animation_error ||
                    res.storage_error ||
                    "资源存在处理中或降级状态"
                  }}
                </p>
              </div>
              <div
                class="mt-5 flex items-center justify-between pt-4 border-t border-gray-100"
              >
                <span class="text-sm text-gray-400">
                  {{ res.updated_at || "暂无更新时间" }}
                </span>
                <div class="flex items-center gap-2">
                  <el-button
                    size="small"
                    type="primary"
                    plain
                    @click="openResourceDetail(res)"
                  >
                    详情
                  </el-button>
                  <el-button
                    size="small"
                    plain
                    :icon="Download"
                    @click="openUrl(res.download_url, res)"
                  >
                    下载
                  </el-button>
                </div>
              </div>
            </article>
          </div>
          <el-empty
            v-else
            :description="
              selectedTaskId ? '该任务暂未生成可展示资源' : '暂无学习资源'
            "
          />
        </div>
      </div>
    </div>

    <el-dialog
      v-model="detailVisible"
      width="820px"
      destroy-on-close
      class="assistant-resource-dialog"
      modal-class="assistant-resource-dialog-mask"
      @closed="handleResourceDialogClosed"
    >
      <template #header>
        <div class="pr-8">
          <div class="text-base font-bold text-gray-800">
            {{ selectedResource?.title || "资源详情" }}
          </div>
          <div class="mt-2 flex flex-wrap gap-1.5">
            <el-tag size="small" effect="plain">
              {{ resourceTypeText(selectedResource?.resource_type) }}
            </el-tag>
            <el-tag
              v-if="selectedResource?.content_format"
              size="small"
              effect="plain"
            >
              {{ formatText(selectedResource.content_format) }}
            </el-tag>
            <el-tag
              v-if="selectedResource?.quality_score !== undefined"
              size="small"
              type="success"
              effect="plain"
            >
              质量 {{ qualityLabel(selectedResource.quality_score) }}
            </el-tag>
            <el-tag
              v-if="selectedResource?.safety_status"
              size="small"
              :type="
                selectedResource.safety_status === 'safe'
                  ? 'success'
                  : 'warning'
              "
              effect="plain"
            >
              {{ statusText(selectedResource.safety_status) }}
            </el-tag>
            <el-tag
              v-if="selectedResource?.review_status"
              size="small"
              :type="tagType(selectedResource.review_status)"
              effect="plain"
            >
              审核 {{ statusText(selectedResource.review_status) }}
            </el-tag>
            <el-tag
              v-if="selectedResource?.version_no"
              size="small"
              effect="plain"
            >
              v{{ selectedResource.version_no }}
            </el-tag>
          </div>
        </div>
      </template>

      <div v-if="selectedResource" class="resource-detail">
        <el-collapse v-model="detailActivePanels">
          <el-collapse-item title="资源摘要" name="summary">
            <p class="text-base text-gray-700 leading-7">
              {{
                selectedResource.description ||
                selectedResource.summary ||
                selectedResource.recommendation ||
                "暂无摘要"
              }}
            </p>
            <div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              <div class="detail-metric">
                <span>知识点</span>
                <b>{{ selectedResource.knowledge_point_id || "未关联" }}</b>
              </div>
              <div class="detail-metric">
                <span>关联度</span>
                <b>{{
                  qualityLabel(selectedResource.knowledge_relevance) || "暂无"
                }}</b>
              </div>
              <div class="detail-metric">
                <span>更新时间</span>
                <b>{{ selectedResource.updated_at || "暂无" }}</b>
              </div>
              <div class="detail-metric">
                <span>对象存储</span>
                <b>{{ statusText(selectedResource.storage_status) }}</b>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item v-if="editMode" title="编辑草稿" name="edit">
            <div class="space-y-3">
              <el-input v-model="editForm.title" placeholder="资源标题" />
              <el-input v-model="editForm.summary" placeholder="资源摘要" />
              <el-input
                v-model="editForm.description"
                type="textarea"
                :rows="2"
                placeholder="资源说明"
              />
              <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
                <el-input
                  v-model="editForm.content_format"
                  placeholder="正文格式"
                />
                <el-input
                  v-model="editForm.knowledge_point_id"
                  placeholder="知识点标识"
                />
                <el-input-number
                  v-model="editForm.knowledge_relevance"
                  :min="0"
                  :max="1"
                  :step="0.05"
                  class="!w-full"
                />
              </div>
              <el-input
                v-model="editForm.content_body"
                type="textarea"
                :rows="8"
                placeholder="资源正文"
              />
              <el-input v-model="editForm.edit_reason" placeholder="编辑原因" />
              <div class="flex justify-end gap-2">
                <el-button @click="editMode = false">取消</el-button>
                <el-button
                  type="primary"
                  :loading="governanceSubmitting"
                  @click="handleSaveResource"
                >
                  保存草稿
                </el-button>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item
            v-if="hasInlinePreview(selectedResource)"
            title="正文预览"
            name="preview"
          >
            <pre class="content-preview">{{
              selectedResource.content_body
            }}</pre>
          </el-collapse-item>

          <el-collapse-item
            v-if="
              incompleteStates.length ||
              selectedResource.html_animation_task_id ||
              selectedResource.object_key
            "
            title="状态与存储"
            name="status"
          >
            <div v-if="incompleteStates.length" class="flex flex-wrap gap-2">
              <el-tag
                v-for="item in incompleteStates"
                :key="`${item.label}-${item.value}`"
                size="small"
                :type="showAsIncomplete(item.value) ? 'warning' : 'success'"
                effect="plain"
              >
                {{ item.label }}：{{ statusText(item.value) }}
              </el-tag>
            </div>
            <div
              v-if="selectedResource.html_animation_task_id"
              class="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-700"
            >
              <div class="font-semibold">
                动画任务：{{
                  statusText(selectedResource.html_animation_status)
                }}
              </div>
              <div class="mt-1 leading-6">
                {{
                  selectedResource.html_animation_message ||
                  selectedResource.html_animation_error ||
                  "暂无状态说明"
                }}
              </div>
              <div class="mt-2 font-mono text-xs">
                {{ selectedResource.html_animation_task_id }}
              </div>
            </div>
            <div
              v-if="selectedResource.object_key"
              class="mt-4 text-sm text-gray-500"
            >
              存储标识：{{ selectedResource.object_key }}
            </div>
          </el-collapse-item>

          <el-collapse-item
            v-if="
              selectedResource.safety_summary ||
              selectedResource.safety_flags?.length
            "
            title="安全与引用状态"
            name="safety"
          >
            <p
              v-if="selectedResource.safety_summary"
              class="text-sm leading-7 text-gray-600"
            >
              {{ selectedResource.safety_summary }}
            </p>
            <div
              v-if="selectedResource.safety_flags?.length"
              class="mt-3 flex flex-wrap gap-2"
            >
              <el-tag
                v-for="flag in selectedResource.safety_flags"
                :key="flag"
                size="small"
                type="warning"
                effect="plain"
              >
                {{ flag }}
              </el-tag>
            </div>
          </el-collapse-item>

          <el-collapse-item
            v-if="selectedResource.citations?.length"
            title="引用来源"
            name="citations"
          >
            <div class="space-y-3">
              <div
                v-for="(citation, index) in selectedResource.citations"
                :key="`${citation.title || citation.url || index}`"
                class="rounded-lg border border-gray-100 px-4 py-3 text-sm text-gray-600"
              >
                <div class="font-semibold text-gray-700">
                  {{ citation.title || citation.source || `引用 ${index + 1}` }}
                </div>
                <div v-if="citation.snippet" class="mt-1 leading-7">
                  {{ citation.snippet }}
                </div>
                <a
                  v-if="citation.url"
                  :href="citation.url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="mt-1 inline-block text-primary"
                >
                  {{ citation.url }}
                </a>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item
            v-if="resourceVersions.length"
            title="资源版本"
            name="versions"
          >
            <div class="space-y-3">
              <div
                v-for="version in resourceVersions"
                :key="version.version_id"
                class="rounded-lg border border-gray-100 px-4 py-3 text-sm text-gray-600"
              >
                <div class="flex items-center justify-between gap-2">
                  <span class="font-semibold text-gray-700">
                    v{{ version.version_no }} · {{ version.title }}
                  </span>
                  <el-tag
                    v-if="version.safety_status"
                    size="small"
                    :type="
                      version.safety_status === 'safe' ? 'success' : 'warning'
                    "
                    effect="plain"
                  >
                    {{ statusText(version.safety_status) }}
                  </el-tag>
                </div>
                <p v-if="version.edit_reason" class="mt-1">
                  {{ version.edit_reason }}
                </p>
                <div class="mt-1 text-gray-400">
                  {{ version.created_at || "" }}
                </div>
              </div>
            </div>
          </el-collapse-item>

          <el-collapse-item title="资源反馈" name="feedback">
            <div class="flex items-center gap-3">
              <el-rate v-model="resourceFeedbackScore" :max="5" />
              <span class="text-sm text-gray-500"
                >{{ resourceFeedbackScore }} / 5</span
              >
            </div>
            <el-input
              v-model="resourceFeedbackText"
              class="mt-3"
              type="textarea"
              :rows="3"
              maxlength="300"
              show-word-limit
              placeholder="这份资源对你是否有帮助？"
            />
          </el-collapse-item>
        </el-collapse>
      </div>

      <template #footer>
        <div class="flex items-center justify-between gap-3 flex-wrap">
          <div class="flex items-center gap-2">
            <el-button
              :icon="CircleCheck"
              :loading="completeSubmitting"
              @click="handleCompleteResource"
            >
              标记完成
            </el-button>
            <el-button :icon="EditPen" plain @click="editMode = !editMode">
              编辑
            </el-button>
            <el-button
              :icon="Stamp"
              plain
              :loading="governanceSubmitting"
              @click="handleReviewResource('approved')"
            >
              审核通过
            </el-button>
            <el-button
              type="danger"
              plain
              :icon="Delete"
              :loading="governanceSubmitting"
              @click="handleDeleteResource"
            >
              删除
            </el-button>
          </div>
          <div class="flex items-center gap-2">
            <el-button
              v-if="selectedResource?.preview_url"
              type="primary"
              plain
              @click="openUrl(selectedResource.preview_url, selectedResource)"
            >
              打开预览
            </el-button>
            <el-button
              plain
              type="primary"
              :loading="governanceSubmitting"
              @click="handlePublishResource"
            >
              发布
            </el-button>
            <el-button
              type="primary"
              :loading="feedbackSubmitting"
              @click="handleSubmitFeedback"
            >
              提交反馈
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.resource-workbench {
  --resource-radius: 18px;
  --resource-inner-radius: 14px;
  --resource-border: #e8edf5;
}

.resource-shell {
  display: flex;
  min-height: 0;
  flex: 1;
  flex-direction: column;
  gap: 16px;
  background: transparent;
}

.resource-main {
  display: grid;
  min-height: 0;
  flex: 1;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 16px;
  background: transparent;
}

.resource-toolbar {
  position: relative;
  display: flex;
  gap: 14px;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  padding: 12px 14px 12px 18px;
  overflow: visible;
  background: #fff;
  border: 1px solid #edf2f8;
  border-radius: var(--resource-radius);
  box-shadow: none;
  backdrop-filter: none;
}

@media (max-width: 1280px) {
  .resource-main {
    grid-template-columns: 1fr;
  }
}

.resource-toolbar::before {
  content: "";
  display: none;
}

.resource-toolbar__title,
.resource-toolbar__controls {
  position: relative;
  z-index: 1;
}

.resource-toolbar__title {
  min-width: 0;
}

.resource-toolbar__title h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.2;
  color: #2f3746;
}

.resource-toolbar__scope {
  margin: 4px 0 0;
  overflow: hidden;
  font-size: 13px;
  line-height: 18px;
  color: #64748b;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.resource-toolbar__controls {
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
  min-width: 0;
}

.resource-search {
  width: min(360px, 38vw);
}

.resource-type-select {
  width: 150px;
}

.resource-toolbar :deep(.el-input__wrapper) {
  min-height: 36px;
  background: rgba(255, 255, 255, 0.82);
  border-radius: 10px;
  box-shadow:
    inset 0 0 0 1px rgba(132, 151, 176, 0.16),
    0 1px 0 rgba(255, 255, 255, 0.72) !important;
}

.resource-toolbar :deep(.el-button) {
  border-radius: 10px;
}

.resource-card {
  background: rgba(255, 255, 255, 0.76);
  border: 1px solid rgba(224, 233, 247, 0.86);
  border-radius: var(--resource-inner-radius);
  box-shadow: 0 8px 24px rgba(38, 54, 78, 0.05);
  backdrop-filter: blur(12px);
}

.workbench-panel {
  display: flex;
  min-height: 0;
  overflow: hidden;
  flex-direction: column;
  border: 1px solid rgba(206, 224, 250, 0.9);
  border-radius: var(--resource-radius);
  box-shadow:
    0 12px 30px rgba(70, 113, 180, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
  backdrop-filter: blur(16px);
}

.task-panel {
  background: linear-gradient(
    180deg,
    rgba(237, 246, 255, 0.84),
    rgba(248, 251, 255, 0.7)
  );
}

.workbench-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  font-size: 16px;
  font-weight: 600;
  color: #2f3746;
  background: rgba(255, 255, 255, 0.34);
  border-bottom: 1px solid rgba(211, 226, 248, 0.82);
}

.task-card {
  padding: 16px;
  cursor: pointer;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(185, 207, 242, 0.78);
  border-radius: var(--resource-inner-radius);
  box-shadow: 0 8px 20px rgba(77, 121, 190, 0.08);
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;

  &:hover,
  &.is-active {
    background: #fff;
    border-color: #8fb3f4;
    box-shadow: 0 12px 26px rgba(77, 121, 190, 0.12);
  }

  &:focus-visible {
    outline: 2px solid #5b8def;
    outline-offset: 2px;
  }
}

.resource-card {
  padding: 18px;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    background: #fbfdff;
    border-color: #9cbcf3;
    box-shadow: 0 12px 28px rgba(58, 94, 150, 0.08);
  }
}

.resource-metric,
.detail-metric {
  min-width: 0;
  padding: 12px;
  background: #f7f9fc;
  border-radius: 10px;

  span {
    display: block;
    font-size: 13px;
    color: #8a95a6;
  }

  b {
    display: block;
    margin-top: 4px;
    overflow: hidden;
    font-size: 15px;
    font-weight: 600;
    color: #303847;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.resource-state-group {
  display: grid;
  row-gap: 22px;
  margin-top: 18px;
}

.resource-state-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 10px;
  align-items: flex-start;
}

.resource-state-alert {
  min-height: 52px;
  padding: 12px 16px;
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: #b45309;
  background: #fff8e6;
  border-radius: 10px;
}

.resource-progress {
  :deep(.el-progress-bar__outer) {
    background-color: #edf1f7;
  }
}

.task-collapse-wrap {
  :deep(.el-collapse) {
    display: grid;
    gap: 10px;
    border: 0;
  }

  :deep(.el-collapse-item) {
    overflow: hidden;
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(197, 216, 245, 0.82);
    border-radius: var(--resource-inner-radius);
  }

  :deep(.el-collapse-item__header) {
    height: 52px;
    padding: 0 14px;
    font-size: 15px;
    font-weight: 600;
    color: #303847;
    background: #fff;
    border-bottom: 0;
    border-radius: var(--resource-inner-radius);
  }

  :deep(.el-collapse-item.is-active .el-collapse-item__header),
  :deep(.el-collapse-item__header.is-active) {
    border-bottom: 1px solid rgba(213, 226, 247, 0.82);
    border-radius: var(--resource-inner-radius) var(--resource-inner-radius) 0 0;
  }

  :deep(.el-collapse-item__wrap) {
    overflow: hidden;
    background: rgba(255, 255, 255, 0.72);
    border-bottom: 0;
    border-radius: 0 0 var(--resource-inner-radius) var(--resource-inner-radius);
  }

  :deep(.el-collapse-item__content) {
    padding: 12px 14px 14px;
  }
}

.resource-detail {
  :deep(.el-collapse) {
    border-top: none;
    border-bottom: none;
  }

  :deep(.el-collapse-item__header) {
    height: 48px;
    font-size: 16px;
    font-weight: 600;
    color: #303847;
  }

  :deep(.el-collapse-item__content) {
    padding-bottom: 18px;
  }
}

.content-preview {
  max-height: 340px;
  padding: 16px;
  overflow: auto;
  font-size: 14px;
  line-height: 1.8;
  color: #374151;
  white-space: pre-wrap;
  word-break: break-word;
  background: #f7f9fc;
  border: 1px solid var(--resource-border);
  border-radius: var(--resource-radius);
}

:global(.assistant-resource-dialog.el-dialog),
:global(.assistant-resource-dialog-mask .el-dialog) {
  overflow: hidden !important;
  border-radius: 18px !important;
}

:global(.assistant-resource-dialog .el-dialog__body),
:global(.assistant-resource-dialog-mask .el-dialog__body) {
  padding-top: 8px;
}

@media (max-width: 960px) {
  .resource-toolbar {
    align-items: flex-start;
    flex-direction: column;
  }

  .resource-toolbar__controls {
    justify-content: flex-start;
    width: 100%;
  }

  .resource-search,
  .resource-type-select {
    flex: 1 1 220px;
    width: auto;
  }
}
</style>
