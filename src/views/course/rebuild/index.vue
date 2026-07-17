<template>
  <main class="rebuild-page">
    <header class="page-header">
      <div>
        <el-button text :icon="ArrowLeft" @click="router.push('/course/list')"
          >返回课程列表</el-button
        >
        <h1>课程重建进度</h1>
        <p>操作 ID：{{ operationId }}</p>
      </div>
      <el-button
        :icon="Refresh"
        :loading="isRefreshing"
        @click="loadOperation()"
        >刷新</el-button
      >
    </header>

    <el-alert
      v-if="networkMessage"
      class="network-alert"
      title="暂时无法更新进度"
      type="warning"
      :description="networkMessage"
      :closable="false"
      show-icon
    />

    <el-skeleton v-if="isInitialLoading" :rows="8" animated />

    <template v-else-if="operation">
      <section class="operation-summary" :class="`status-${operation.status}`">
        <div class="summary-heading">
          <div>
            <p class="summary-label">当前状态</p>
            <h2>{{ statusText[operation.status] || operation.status }}</h2>
          </div>
          <el-tag :type="statusTagType" effect="plain" size="large">
            {{ phaseText[operation.phase] || operation.phase }}
          </el-tag>
        </div>
        <p class="summary-description">{{ operationDescription }}</p>

        <el-descriptions
          :column="isMobile ? 1 : 3"
          border
          class="operation-details"
        >
          <el-descriptions-item label="源课程 ID">
            {{ operation.sourceCourseId }}
          </el-descriptions-item>
          <el-descriptions-item label="新课程 ID">
            {{ operation.newCourseId || "尚未创建" }}
          </el-descriptions-item>
          <el-descriptions-item label="当前阶段">
            {{ phaseText[operation.phase] || operation.phase }}
          </el-descriptions-item>
        </el-descriptions>
      </section>

      <section
        class="progress-section"
        aria-labelledby="rebuild-progress-title"
      >
        <h2 id="rebuild-progress-title">执行阶段</h2>
        <el-steps
          :active="progressStep"
          finish-status="success"
          process-status="process"
        >
          <el-step title="受理" />
          <el-step title="预检与撤销" />
          <el-step title="替换课程" />
          <el-step title="清理与初始化" />
          <el-step title="完成" />
        </el-steps>
      </section>

      <section class="facts-section" aria-labelledby="rebuild-facts-title">
        <div class="section-heading">
          <div>
            <h2 id="rebuild-facts-title">完成事实</h2>
            <p>只有三项事实均成功，课程重建才算完整完成。</p>
          </div>
        </div>
        <div class="facts-grid">
          <article v-for="fact in facts" :key="fact.key" class="fact-panel">
            <div class="fact-panel__heading">
              <h3>{{ fact.label }}</h3>
              <el-tag :type="factTagType(fact.value.status)" effect="plain">
                {{ factStatusText[fact.value.status] || fact.value.status }}
              </el-tag>
            </div>
            <p>{{ fact.description }}</p>
            <dl>
              <div>
                <dt>待处理</dt>
                <dd>{{ fact.value.pending }}</dd>
              </div>
              <div>
                <dt>失败</dt>
                <dd :class="{ 'is-failed': fact.value.failed > 0 }">
                  {{ fact.value.failed }}
                </dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <el-alert
        v-if="operation.errorCode || operation.status === 'attention_required'"
        class="operation-alert"
        :title="operation.errorCode || '需要人工对账'"
        :description="operation.errorMessage || attentionDescription"
        :type="operation.status === 'attention_required' ? 'warning' : 'error'"
        :closable="false"
        show-icon
      />

      <section
        v-if="operation.retryable"
        class="retry-section"
        aria-labelledby="retry-title"
      >
        <div class="section-heading">
          <div>
            <h2 id="retry-title">重试失败作业</h2>
            <p>只选择已确认可安全重试的作业；系统会再次校验其当前状态。</p>
          </div>
        </div>
        <el-checkbox-group v-model="selectedJobTypes" class="job-type-list">
          <el-checkbox
            v-for="job in retryJobOptions"
            :key="job.value"
            :value="job.value"
            class="job-type-option"
          >
            <span>{{ job.label }}</span>
            <small>{{ job.description }}</small>
          </el-checkbox>
        </el-checkbox-group>
        <el-checkbox
          v-if="operation.status === 'attention_required'"
          v-model="ambiguousRetryConfirmed"
          class="ambiguous-confirmation"
        >
          我已完成 provider、AI-Agent
          与本地任务记录的对账，确认允许重新提交结果不确定的任务。
        </el-checkbox>
        <div class="retry-actions">
          <el-button
            type="primary"
            :loading="isRetrying"
            :disabled="!canRetry"
            @click="retrySelectedJobs"
            >重试所选作业</el-button
          >
        </div>
      </section>

      <section
        v-if="operation.status === 'completed'"
        class="completion-actions"
      >
        <el-result
          icon="success"
          title="课程重建已完成"
          sub-title="源课程已替换，清理和新课时初始化均已成功。"
        >
          <template #extra>
            <el-button
              type="primary"
              :disabled="!operation.newCourseId"
              @click="goToNewCourse"
              >前往新课程</el-button
            >
            <el-button @click="router.push('/course/list')"
              >返回课程列表</el-button
            >
          </template>
        </el-result>
      </section>
    </template>

    <el-result
      v-else
      icon="error"
      title="无法读取课程重建进度"
      :sub-title="loadError || '请检查操作 ID 或稍后刷新。'"
    >
      <template #extra>
        <el-button type="primary" @click="loadOperation()">重新加载</el-button>
        <el-button @click="router.push('/course/list')">返回课程列表</el-button>
      </template>
    </el-result>
  </main>
</template>

<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ArrowLeft, Refresh } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import { useAppStoreHook } from "@/store/modules/app";
import { isAdmin } from "@/utils/auth";
import {
  getCourseRebuild,
  retryCourseRebuildJobs,
  type CourseRebuildFact,
  type CourseRebuildJobType,
  type CourseRebuildOperation,
  type CourseRebuildOperationPhase,
  type CourseRebuildOperationStatus
} from "@/api/course";

const route = useRoute();
const router = useRouter();
const appStore = useAppStoreHook();
const isMobile = computed(() => appStore.getDevice === "mobile");
const operationId = computed(() => String(route.params.operationId || ""));
const operation = ref<CourseRebuildOperation>();
const isInitialLoading = ref(true);
const isRefreshing = ref(false);
const isRetrying = ref(false);
const loadError = ref("");
const networkMessage = ref("");
const selectedJobTypes = ref<CourseRebuildJobType[]>([]);
const ambiguousRetryConfirmed = ref(false);

let pollTimer: number | null = null;
let transientFailureCount = 0;
const operationStartedAt = Number(
  sessionStorage.getItem(`course-rebuild-started-at:${operationId.value}`) ||
    Date.now()
);

const statusText: Record<CourseRebuildOperationStatus, string> = {
  queued: "等待执行",
  running: "正在执行",
  converging: "正在收敛",
  restoring_source: "正在恢复源证据",
  completed: "已完成",
  failed: "重建失败",
  attention_required: "需要人工介入"
};

const phaseText: Record<CourseRebuildOperationPhase, string> = {
  admission: "受理",
  preflight: "预检",
  evidence_revoke: "撤销源证据",
  replace: "替换课程",
  source_restore: "恢复源证据",
  converge: "清理与初始化",
  done: "已结束"
};

const factStatusText: Record<string, string> = {
  not_started: "未开始",
  pending: "处理中",
  succeeded: "已成功",
  failed: "失败",
  committed: "已提交"
};

const retryJobOptions: Array<{
  value: CourseRebuildJobType;
  label: string;
  description: string;
}> = [
  {
    value: "source_cache_invalidate",
    label: "源课程缓存失效",
    description: "重新使源课程的缓存失效。"
  },
  {
    value: "source_storage_cleanup",
    label: "源课程对象清理",
    description: "删除清理清单中的源课程对象。"
  },
  {
    value: "source_ai_cleanup",
    label: "源课程 AI 数据清理",
    description: "清理源课程关联的 AI-Agent 数据。"
  },
  {
    value: "new_course_hour_initialize",
    label: "新课时初始化",
    description: "重新初始化新课时的视频或文档任务。"
  },
  {
    value: "source_evidence_restore",
    label: "源证据恢复",
    description: "仅在替换未提交的恢复场景中使用。"
  }
];

const isTerminal = computed(() =>
  ["completed", "failed", "attention_required"].includes(
    operation.value?.status || ""
  )
);

const statusTagType = computed(() => {
  switch (operation.value?.status) {
    case "completed":
      return "success";
    case "failed":
      return "danger";
    case "attention_required":
      return "warning";
    default:
      return "info";
  }
});

const progressStep = computed(() => {
  const phase = operation.value?.phase;
  if (operation.value?.status === "completed") return 5;
  if (phase === "admission") return 1;
  if (phase === "preflight" || phase === "evidence_revoke") return 2;
  if (phase === "replace" || phase === "source_restore") return 3;
  if (phase === "converge") return 4;
  return 0;
});

const operationDescription = computed(() => {
  switch (operation.value?.status) {
    case "queued":
      return "请求已受理，正在等待后台任务执行。";
    case "running":
      return "正在检查并替换课程数据，请勿重复发起重建。";
    case "converging":
      return "新课程已创建，正在清理源数据并初始化新课时。";
    case "restoring_source":
      return "替换尚未提交，系统正在恢复先前撤销的源证据。";
    case "completed":
      return "替换、清理和初始化均已成功完成。";
    case "failed":
      return "操作已停止。请根据错误信息处理源课程或联系运维。";
    case "attention_required":
      return "外部任务结果存在不确定性，需要管理员完成对账后再决定是否重试。";
    default:
      return "正在读取当前操作状态。";
  }
});

const attentionDescription =
  "请先核对 provider、AI-Agent 与本地任务记录，确认不会产生重复外部任务后再重试。";

const facts = computed<
  Array<{
    key: string;
    label: string;
    description: string;
    value: CourseRebuildFact;
  }>
>(() => {
  if (!operation.value) return [];
  return [
    {
      key: "replacement",
      label: "课程替换",
      description: "新课程创建与源课程数据库删除。",
      value: operation.value.replacement
    },
    {
      key: "cleanup",
      label: "源数据清理",
      description: "源课程缓存、对象存储和 AI 数据清理。",
      value: operation.value.cleanup
    },
    {
      key: "initialization",
      label: "新课时初始化",
      description: "重新提交视频分析或文档知识处理任务。",
      value: operation.value.initialization
    }
  ];
});

const canRetry = computed(
  () =>
    selectedJobTypes.value.length > 0 &&
    (!operation.value ||
      operation.value.status !== "attention_required" ||
      ambiguousRetryConfirmed.value)
);

const factTagType = (status: string) => {
  if (status === "succeeded" || status === "committed") return "success";
  if (status === "failed") return "danger";
  if (status === "pending") return "warning";
  return "info";
};

const clearPollTimer = () => {
  if (pollTimer) {
    window.clearTimeout(pollTimer);
    pollTimer = null;
  }
};

const schedulePolling = (isTransientFailure = false) => {
  clearPollTimer();
  if (isTerminal.value) return;

  const elapsed = Date.now() - operationStartedAt;
  const standardDelay = elapsed < 30_000 ? 2_000 : 5_000;
  const delay = isTransientFailure
    ? Math.min(30_000, standardDelay * 2 ** Math.min(transientFailureCount, 3))
    : standardDelay;

  pollTimer = window.setTimeout(() => void loadOperation(true), delay);
};

const loadOperation = async (isPolling = false) => {
  if (!operationId.value) {
    loadError.value = "缺少课程重建 operation ID。";
    isInitialLoading.value = false;
    return;
  }

  if (!isPolling) isRefreshing.value = true;
  try {
    const nextOperation = await getCourseRebuild(operationId.value);
    operation.value = nextOperation;
    loadError.value = "";
    networkMessage.value = "";
    transientFailureCount = 0;
    selectedJobTypes.value = [];
    ambiguousRetryConfirmed.value = false;
    schedulePolling();
  } catch (error: any) {
    const message = error?.response?.data?.message || error?.message;
    const isTransientFailure = !error?.response;
    if (!isTransientFailure) {
      loadError.value = message || "读取课程重建进度失败。";
      networkMessage.value = "";
      return;
    }

    transientFailureCount += 1;
    networkMessage.value = `${message || "网络连接异常"}，系统将在稍后自动重试。`;
    schedulePolling(true);
  } finally {
    isInitialLoading.value = false;
    isRefreshing.value = false;
  }
};

const retrySelectedJobs = async () => {
  if (!operation.value || !canRetry.value) return;

  isRetrying.value = true;
  try {
    operation.value = await retryCourseRebuildJobs(
      operation.value.operationId,
      {
        jobTypes: selectedJobTypes.value,
        confirmAmbiguous: ambiguousRetryConfirmed.value
      }
    );
    selectedJobTypes.value = [];
    ambiguousRetryConfirmed.value = false;
    transientFailureCount = 0;
    networkMessage.value = "";
    ElMessage.success("已提交所选作业重试，正在恢复进度轮询");
    schedulePolling();
  } catch (error: any) {
    ElMessage.error(
      error?.response?.data?.message ||
        error?.message ||
        "重试失败，请检查作业状态后重试"
    );
  } finally {
    isRetrying.value = false;
  }
};

const goToNewCourse = () => {
  if (!operation.value?.newCourseId) return;
  void router.push(`/course/${operation.value.newCourseId}`);
};

onMounted(() => {
  if (!isAdmin()) {
    ElMessage.warning("只有管理员可以查看课程重建进度");
    void router.replace("/course/list");
    return;
  }
  void loadOperation();
});

onBeforeUnmount(clearPollTimer);
</script>

<style scoped lang="scss">
.rebuild-page {
  width: min(100%, 1120px);
  margin: 0 auto;
  padding: 24px;
}

.page-header {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 24px;

  h1 {
    margin: 8px 0 4px;
    font-size: 24px;
    line-height: 1.35;
    color: var(--el-text-color-primary);
  }

  p {
    margin: 0;
    overflow-wrap: anywhere;
    color: var(--el-text-color-secondary);
  }
}

.network-alert,
.operation-alert {
  margin-bottom: 20px;
}

.operation-summary,
.progress-section,
.facts-section,
.retry-section,
.completion-actions {
  padding: 24px;
  margin-bottom: 20px;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.operation-summary {
  &.status-completed {
    border-color: var(--el-color-success-light-5);
  }

  &.status-failed {
    border-color: var(--el-color-danger-light-5);
  }

  &.status-attention_required {
    border-color: var(--el-color-warning-light-5);
  }
}

.summary-heading,
.section-heading,
.fact-panel__heading {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  justify-content: space-between;
}

.summary-label {
  margin-bottom: 4px !important;
  font-size: 14px;
  color: var(--el-text-color-secondary);
}

.summary-heading h2,
.progress-section h2,
.facts-section h2,
.retry-section h2 {
  margin: 0;
  font-size: 18px;
  line-height: 1.4;
  color: var(--el-text-color-primary);
}

.summary-description,
.section-heading p {
  margin: 12px 0 0;
  line-height: 1.65;
  color: var(--el-text-color-regular);
}

.operation-details {
  margin-top: 20px;
}

.progress-section h2 {
  margin-bottom: 22px;
}

.facts-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-top: 20px;
}

.fact-panel {
  min-width: 0;
  padding: 18px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-fill-color-blank);

  h3 {
    margin: 0;
    font-size: 16px;
    line-height: 1.4;
    color: var(--el-text-color-primary);
  }

  p {
    min-height: 44px;
    margin: 12px 0 18px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
  }

  dl {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin: 0;

    div {
      padding: 10px;
      background: var(--el-fill-color-light);
      border-radius: 4px;
    }

    dt {
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }

    dd {
      margin: 4px 0 0;
      font-size: 20px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }

    .is-failed {
      color: var(--el-color-danger);
    }
  }
}

.job-type-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  width: 100%;
  margin-top: 20px;
}

.job-type-option {
  display: flex;
  width: 100%;
  min-height: 72px;
  padding: 14px;
  margin-right: 0;
  white-space: normal;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;

  :deep(.el-checkbox__label) {
    display: grid;
    gap: 4px;
    min-width: 0;
    padding-left: 10px;
    line-height: 1.5;
  }

  small {
    color: var(--el-text-color-secondary);
  }
}

.ambiguous-confirmation {
  display: flex;
  margin-top: 18px;
  line-height: 1.6;
  white-space: normal;
}

.retry-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}

.completion-actions {
  :deep(.el-result) {
    padding: 0;
  }
}

@media screen and (max-width: 768px) {
  .rebuild-page {
    padding: 16px;
  }

  .page-header,
  .summary-heading,
  .section-heading {
    flex-direction: column;
  }

  .page-header {
    gap: 12px;

    > .el-button {
      align-self: flex-start;
    }
  }

  .operation-summary,
  .progress-section,
  .facts-section,
  .retry-section,
  .completion-actions {
    padding: 18px;
  }

  .facts-grid,
  .job-type-list {
    grid-template-columns: 1fr;
  }

  .progress-section {
    overflow-x: auto;

    :deep(.el-steps) {
      min-width: 620px;
    }
  }
}

@media (prefers-reduced-motion: reduce) {
  .rebuild-page :deep(*) {
    scroll-behavior: auto !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
