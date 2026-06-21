<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  DataAnalysis,
  Reading,
  CircleCheck,
  InfoFilled,
  Promotion,
  TrendCharts,
  Refresh,
  ChatDotRound,
  Operation,
  Clock
} from "@element-plus/icons-vue";
import {
  assistantApiErrorMessage,
  applyAssistantAssessmentAction,
  getAssistantAssessmentCurrent,
  listAssistantAssessmentActions,
  listAssistantAssessmentHistory,
  listAssistantAssessmentJobs,
  refreshAssistantAssessment,
  submitAssistantAssessmentFeedback,
  type AssistantAssessmentActionItem,
  type AssistantAssessmentCurrentResp,
  type AssistantAssessmentHistoryItem,
  type AssistantAssessmentJobItem
} from "@/api/frontend/assistant";

const props = defineProps<{
  courseId?: number;
  targetStudentId?: number;
  requiresTargetStudent?: boolean;
}>();

const loading = ref(false);
const refreshLoading = ref(false);
const feedbackSubmitting = ref(false);
const actionSubmitting = ref("");
const assessment = ref<AssistantAssessmentCurrentResp | null>(null);
const assessmentActions = ref<AssistantAssessmentActionItem[]>([]);
const assessmentHistory = ref<AssistantAssessmentHistoryItem[]>([]);
const assessmentJobs = ref<AssistantAssessmentJobItem[]>([]);
const feedbackScore = ref(5);
const feedbackText = ref("");

const courseInfo = computed(
  () =>
    assessment.value?.course_info || {
      name: "当前课程",
      subtitle: "",
      total_chapters: 0,
      finished_chapters: 0
    }
);
const stats = computed(() => assessment.value?.stats || []);
const strengths = computed(() => assessment.value?.strengths || []);
const weakPoints = computed(() => assessment.value?.weak_points || []);
const timeline = computed(() => assessment.value?.timeline || []);
const suggestions = computed(() => assessment.value?.suggestions || []);
const resourceUsage = computed(() => assessment.value?.resource_usage || {});
const feedbackSummary = computed(() => assessment.value?.feedback_summary || {});
const evidence = computed(() => assessment.value?.evidence || []);
const recommendedActions = computed(
  () => assessmentActions.value.length
    ? assessmentActions.value
    : (assessment.value?.recommended_actions || []).map((item, index) => ({
        action_id: `current_${index}`,
        assessment_id: "",
        action: item.action,
        reason: item.reason,
        priority: item.priority,
        target_type: item.target_type,
        target_id: item.target_id,
        status: "pending",
        auto_triggered: item.auto_triggered
      }))
);
const formatDuration = (value?: number) => {
  if (resourceUsage.value.dwell_seconds && !value) {
    const minutes = Math.max(1, Math.round(resourceUsage.value.dwell_seconds / 60));
    if (minutes < 60) return `${minutes} 分钟`;
    return `${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分钟`;
  }
  const ms =
    value ||
    resourceUsage.value.total_dwell_ms ||
    resourceUsage.value.dwell_ms ||
    0;
  if (!ms) return "0 分钟";
  const minutes = Math.max(1, Math.round(ms / 60000));
  if (minutes < 60) return `${minutes} 分钟`;
  return `${Math.floor(minutes / 60)} 小时 ${minutes % 60} 分钟`;
};
const percentLabel = (value?: number) => {
  const normalized = Number(value || 0);
  return `${Math.round(normalized <= 1 ? normalized * 100 : normalized)}%`;
};
const scoreLabel = (value?: number) => {
  if (value === undefined || value === null) return "暂无";
  return `${Number(value).toFixed(1)} / 5`;
};
const contextWarning = computed(() => {
  if (!props.courseId) return "请先选择课程";
  if (props.requiresTargetStudent && !props.targetStudentId) {
    return "请先选择学生";
  }
  return "";
});
const hasRequiredContext = computed(() => !contextWarning.value);

const ensureCourseContext = () => {
  if (hasRequiredContext.value) return true;
  ElMessage.warning(contextWarning.value || "请先选择课程");
  return false;
};

const timelineType = (type: string) => {
  if (["primary", "success", "warning", "danger", "info"].includes(type)) {
    return type as "primary" | "success" | "warning" | "danger" | "info";
  }
  return "primary";
};

const loadAssessment = async () => {
  if (!hasRequiredContext.value) {
    assessment.value = null;
    assessmentActions.value = [];
    assessmentHistory.value = [];
    assessmentJobs.value = [];
    return;
  }
  loading.value = true;
  try {
    const params = {
      course_id: props.courseId,
      target_student_id: props.targetStudentId
    };
    const [currentResult, actionsResult, historyResult, jobsResult] =
      await Promise.allSettled([
      getAssistantAssessmentCurrent(params),
      listAssistantAssessmentActions(params),
      listAssistantAssessmentHistory(params),
      listAssistantAssessmentJobs(params)
    ]);
    assessment.value =
      currentResult.status === "fulfilled" ? currentResult.value?.data || null : null;
    assessmentActions.value =
      actionsResult.status === "fulfilled" ? actionsResult.value?.data?.list || [] : [];
    assessmentHistory.value =
      historyResult.status === "fulfilled" ? historyResult.value?.data?.list || [] : [];
    assessmentJobs.value =
      jobsResult.status === "fulfilled" ? jobsResult.value?.data?.list || [] : [];
    if (
      currentResult.status === "rejected" ||
      actionsResult.status === "rejected" ||
      historyResult.status === "rejected" ||
      jobsResult.status === "rejected"
    ) {
      console.warn("[AiAssessment] 部分学习评估接口加载失败", {
        currentError:
          currentResult.status === "rejected" ? currentResult.reason : undefined,
        actionsError:
          actionsResult.status === "rejected" ? actionsResult.reason : undefined,
        historyError:
          historyResult.status === "rejected" ? historyResult.reason : undefined,
        jobsError: jobsResult.status === "rejected" ? jobsResult.reason : undefined
      });
    }
  } catch (error: any) {
    console.error("[AiAssessment] 学习评估加载失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "学习评估加载失败"));
  } finally {
    loading.value = false;
  }
};

const handleRefreshAssessment = async () => {
  if (!ensureCourseContext()) return;
  refreshLoading.value = true;
  try {
    const { data } = await refreshAssistantAssessment({
      course_id: props.courseId,
      target_student_id: props.targetStudentId,
      reason: "frontend_manual_refresh",
      mode: "sync"
    });
    if (data.job_id) {
      ElMessage.success(data.message || `评估刷新已提交：${data.job_id}`);
    } else {
      ElMessage.success(data.message || "评估刷新已提交");
    }
    await loadAssessment();
  } catch (error: any) {
    console.error("[AiAssessment] 学习评估刷新失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "学习评估刷新失败"));
  } finally {
    refreshLoading.value = false;
  }
};

const handleSubmitFeedback = async () => {
  if (!ensureCourseContext()) return;
  if (!feedbackText.value.trim() && !feedbackScore.value) {
    ElMessage.warning("请先填写评分或反馈内容");
    return;
  }
  feedbackSubmitting.value = true;
  try {
    const { data } = await submitAssistantAssessmentFeedback({
      course_id: props.courseId,
      target_student_id: props.targetStudentId,
      target_type: "assessment",
      rating: feedbackScore.value,
      content: feedbackText.value.trim(),
      metadata: { ui_entry: "ai_assessment_panel" }
    });
    ElMessage.success(data.message || "评估反馈已提交，已入队刷新评估");
    feedbackText.value = "";
    await loadAssessment();
  } catch (error: any) {
    console.error("[AiAssessment] 评估反馈提交失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "评估反馈提交失败"));
  } finally {
    feedbackSubmitting.value = false;
  }
};

const actionType = (priority?: string) => {
  if (priority === "high") return "danger";
  if (priority === "medium") return "warning";
  return "info";
};

const jobType = (status?: string) => {
  if (status === "completed") return "success";
  if (status === "failed") return "danger";
  if (status === "running" || status === "processing") return "warning";
  return "info";
};

const handleApplyAction = async (action: AssistantAssessmentActionItem) => {
  if (!ensureCourseContext()) return;
  if (action.action_id.startsWith("current_")) {
    ElMessage.info("该动作来自当前快照，请刷新动作列表后再应用");
    return;
  }
  actionSubmitting.value = action.action_id;
  try {
    const { data } = await applyAssistantAssessmentAction(action.action_id);
    ElMessage.success(data.message || "评估动作已应用");
    await loadAssessment();
  } catch (error: any) {
    console.error("[AiAssessment] 应用评估动作失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "应用评估动作失败"));
  } finally {
    actionSubmitting.value = "";
  }
};

onMounted(loadAssessment);
watch(() => [props.courseId, props.targetStudentId], loadAssessment);
</script>

<template>
  <div
    v-loading="loading"
    class="h-full flex flex-col p-6 bg-transparent overflow-y-auto"
  >
    <div class="mb-8 flex justify-between items-end gap-4 flex-wrap">
      <div class="flex items-center gap-4">
        <div
          class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
        >
          <el-icon :size="28"><DataAnalysis /></el-icon>
        </div>
        <div>
          <h2 class="text-xl font-bold text-text_color_primary">
            阶段学习评估
          </h2>
          <p class="text-sm text-text_color_regular mt-1">
            课程：{{ courseInfo.name }} ·
            <span class="opacity-60">{{ courseInfo.subtitle }}</span>
          </p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <el-tag effect="plain" round size="large" class="!bg-bg_color">
          章节 {{ courseInfo.finished_chapters }} /
          {{ courseInfo.total_chapters }}
        </el-tag>
        <el-tag v-if="assessment?.message" type="info" effect="plain" round>
          {{ assessment.message }}
        </el-tag>
        <el-tag
          v-if="assessment?.confidence"
          type="success"
          effect="plain"
          round
        >
          置信度 {{ percentLabel(assessment.confidence) }}
        </el-tag>
        <el-tag
          v-if="assessment?.need_replan"
          type="warning"
          effect="plain"
          round
        >
          建议重规划
        </el-tag>
        <el-button
          type="primary"
          plain
          round
          :icon="Refresh"
          :loading="refreshLoading"
          @click="handleRefreshAssessment"
        >
          刷新评估
        </el-button>
      </div>
    </div>

    <div
      v-if="evidence.length || recommendedActions.length"
      class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6"
    >
      <div
        class="bg-bg_color p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <h4
          class="font-bold text-text_color_primary flex items-center gap-2 mb-5 text-sm uppercase"
        >
          <el-icon class="text-primary"><Operation /></el-icon>
          评估证据链
        </h4>
        <div v-if="evidence.length" class="space-y-3">
          <div
            v-for="item in evidence"
            :key="`${item.source}-${item.summary}`"
            class="rounded-lg bg-gray-50/70 dark:bg-gray-800/30 p-3 text-xs"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-text_color_primary">{{ item.source }}</span>
              <el-tag v-if="item.confidence" size="small" effect="plain">
                {{ percentLabel(item.confidence) }}
              </el-tag>
            </div>
            <p class="mt-2 text-text_color_regular leading-relaxed">
              {{ item.summary }}
            </p>
          </div>
        </div>
        <el-empty v-else description="暂无评估证据" :image-size="90" />
      </div>

      <div
        class="bg-bg_color p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <h4
          class="font-bold text-text_color_primary flex items-center gap-2 mb-5 text-sm uppercase"
        >
          <el-icon class="text-primary"><Promotion /></el-icon>
          待处理优化动作
        </h4>
        <div v-if="recommendedActions.length" class="space-y-3">
          <div
            v-for="action in recommendedActions"
            :key="action.action_id"
            class="rounded-lg bg-gray-50/70 dark:bg-gray-800/30 p-3 text-xs"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2">
                <span class="font-bold text-text_color_primary">
                  {{ action.action }}
                </span>
                <el-tag
                  size="small"
                  effect="plain"
                  :type="actionType(action.priority)"
                >
                  {{ action.priority || "normal" }}
                </el-tag>
              </div>
              <el-tag size="small" effect="plain">{{ action.status }}</el-tag>
            </div>
            <p class="mt-2 text-text_color_regular leading-relaxed">
              {{ action.reason }}
            </p>
            <div class="mt-3 text-right">
              <el-button
                size="small"
                type="primary"
                plain
                :loading="actionSubmitting === action.action_id"
                :disabled="action.action_id.startsWith('current_')"
                @click="handleApplyAction(action)"
              >
                应用动作
              </el-button>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无待处理动作" :image-size="90" />
      </div>
    </div>

    <div v-if="stats.length" class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div
        v-for="s in stats"
        :key="s.label"
        class="bg-bg_color p-6 rounded-xl border border-gray-100 dark:border-gray-800 flex flex-col justify-center items-center shadow-sm hover:shadow-md transition-all group"
      >
        <div
          class="text-text_color_regular text-xs uppercase tracking-widest mb-3"
        >
          {{ s.label }}
        </div>
        <div
          class="text-4xl font-black text-text_color_primary mb-2 group-hover:scale-110 transition-transform"
        >
          {{ s.value }}
        </div>
        <div
          v-if="s.sub"
          class="text-[10px] font-bold px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/10"
        >
          {{ s.sub }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div
        class="bg-bg_color p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-red-500"
      >
        <h4
          class="font-bold text-red-600 flex items-center gap-2 mb-6 uppercase tracking-wider text-sm"
        >
          <el-icon :size="18"><InfoFilled /></el-icon>
          薄弱知识点警示
        </h4>
        <div v-if="weakPoints.length" class="space-y-4">
          <div
            v-for="w in weakPoints"
            :key="w.title"
            class="group p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 hover:border-red-200 transition-colors"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm font-bold text-text_color_primary">{{
                w.title
              }}</span>
              <el-tag
                :type="w.level === 'high' ? 'danger' : 'warning'"
                size="small"
                effect="dark"
                round
              >
                {{ w.level === "high" ? "高危" : "中危" }}
              </el-tag>
            </div>
            <p
              class="text-xs text-text_color_regular leading-relaxed opacity-80"
            >
              {{ w.desc }}
            </p>
          </div>
        </div>
        <el-empty v-else description="暂无薄弱点数据" :image-size="90" />
      </div>

      <div
        class="bg-bg_color p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-green-500"
      >
        <h4
          class="font-bold text-green-600 flex items-center gap-2 mb-6 uppercase tracking-wider text-sm"
        >
          <el-icon :size="18"><CircleCheck /></el-icon>
          稳定优势能力
        </h4>
        <div v-if="strengths.length" class="space-y-4">
          <div
            v-for="item in strengths"
            :key="item.title"
            class="p-4 rounded-xl bg-gray-50/50 dark:bg-gray-800/30 border border-gray-100 dark:border-gray-800 hover:border-green-200 transition-colors"
          >
            <span
              class="text-sm font-bold text-text_color_primary block mb-2"
              >{{ item.title }}</span
            >
            <span
              class="text-xs text-text_color_regular leading-relaxed opacity-80"
              >{{ item.desc }}</span
            >
          </div>
        </div>
        <el-empty v-else description="暂无优势能力数据" :image-size="90" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div
        class="bg-bg_color p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <h4
          class="font-bold text-text_color_primary flex items-center gap-2 mb-5 text-sm uppercase"
        >
          <el-icon class="text-primary"><Reading /></el-icon>
          资源使用闭环
        </h4>
        <div class="grid grid-cols-2 gap-3">
          <div class="rounded-lg bg-gray-50/70 dark:bg-gray-800/30 p-4">
            <div class="text-xs text-text_color_regular">使用次数</div>
            <div class="mt-2 text-2xl font-black text-text_color_primary">
              {{ resourceUsage.usage_count || resourceUsage.open_count || 0 }}
            </div>
          </div>
          <div class="rounded-lg bg-gray-50/70 dark:bg-gray-800/30 p-4">
            <div class="text-xs text-text_color_regular">停留时长</div>
            <div class="mt-2 text-2xl font-black text-text_color_primary">
              {{ formatDuration() }}
            </div>
          </div>
          <div class="rounded-lg bg-gray-50/70 dark:bg-gray-800/30 p-4">
            <div class="text-xs text-text_color_regular">完成率</div>
            <div class="mt-2 text-2xl font-black text-text_color_primary">
              {{ percentLabel(resourceUsage.completion_rate) }}
            </div>
          </div>
          <div class="rounded-lg bg-gray-50/70 dark:bg-gray-800/30 p-4">
            <div class="text-xs text-text_color_regular">资源评分</div>
            <div class="mt-2 text-2xl font-black text-text_color_primary">
              {{
                scoreLabel(
                  resourceUsage.average_resource_score ||
                    resourceUsage.average_feedback_score ||
                    resourceUsage.average_feedback
                )
              }}
            </div>
            <div class="mt-1 text-xs text-text_color_regular">
              {{ resourceUsage.resource_feedback_count || resourceUsage.feedback_count || 0 }}
              条反馈
            </div>
          </div>
        </div>
      </div>

      <div
        class="bg-bg_color p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <h4
          class="font-bold text-text_color_primary flex items-center gap-2 mb-5 text-sm uppercase"
        >
          <el-icon class="text-primary"><ChatDotRound /></el-icon>
          评估反馈
        </h4>
        <div class="grid grid-cols-3 gap-3 mb-4">
          <div class="rounded-lg bg-gray-50/70 dark:bg-gray-800/30 p-3">
            <div class="text-xs text-text_color_regular">反馈数量</div>
            <div class="mt-2 text-xl font-black text-text_color_primary">
              {{ feedbackSummary.feedback_count || feedbackSummary.count || 0 }}
            </div>
          </div>
          <div class="rounded-lg bg-gray-50/70 dark:bg-gray-800/30 p-3">
            <div class="text-xs text-text_color_regular">平均评分</div>
            <div class="mt-2 text-xl font-black text-text_color_primary">
              {{ scoreLabel(feedbackSummary.average_score || feedbackSummary.avg_score) }}
            </div>
          </div>
          <div class="rounded-lg bg-gray-50/70 dark:bg-gray-800/30 p-3">
            <div class="text-xs text-text_color_regular">最近反馈</div>
            <div class="mt-2 text-xs font-medium text-text_color_primary line-clamp-2">
              {{
                feedbackSummary.latest_feedback_at ||
                feedbackSummary.last_feedback_at ||
                feedbackSummary.latest_at ||
                "暂无"
              }}
            </div>
          </div>
        </div>
        <p
          v-if="
            feedbackSummary.latest_feedback ||
            feedbackSummary.latest_content ||
            feedbackSummary.latest_comment
          "
          class="mb-4 rounded-lg bg-primary/5 px-3 py-2 text-xs text-text_color_regular leading-relaxed"
        >
          {{
            feedbackSummary.latest_feedback ||
            feedbackSummary.latest_content ||
            feedbackSummary.latest_comment
          }}
        </p>
        <div class="flex items-center gap-3">
          <el-rate v-model="feedbackScore" />
          <span class="text-xs text-text_color_regular">{{ feedbackScore }} / 5</span>
        </div>
        <el-input
          v-model="feedbackText"
          class="mt-3"
          type="textarea"
          :rows="3"
          maxlength="300"
          show-word-limit
          placeholder="对这次学习评估有什么补充？"
        />
        <div class="mt-3 text-right">
          <el-button
            type="primary"
            :loading="feedbackSubmitting"
            @click="handleSubmitFeedback"
          >
            提交评估反馈
          </el-button>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
      <div
        class="bg-bg_color p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <h4
          class="font-bold text-text_color_primary flex items-center gap-2 mb-5 text-sm uppercase"
        >
          <el-icon class="text-primary"><Clock /></el-icon>
          评估历史
        </h4>
        <el-timeline v-if="assessmentHistory.length">
          <el-timeline-item
            v-for="item in assessmentHistory"
            :key="item.assessment_id"
            :timestamp="item.updated_at || item.created_at"
            hollow
          >
            <div class="flex items-center gap-2">
              <span class="text-sm font-bold text-text_color_primary">
                v{{ item.assessment_version }} · {{ item.overall_level }}
              </span>
              <el-tag v-if="item.need_replan" size="small" type="warning" effect="plain">
                需重规划
              </el-tag>
              <el-tag v-if="item.auto_action_status" size="small" effect="plain">
                {{ item.auto_action_status }}
              </el-tag>
            </div>
            <p class="mt-1 text-xs text-text_color_regular leading-relaxed">
              {{ item.summary || `预测分 ${item.predicted_score}` }}
            </p>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无评估历史" :image-size="90" />
      </div>

      <div
        class="bg-bg_color p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <h4
          class="font-bold text-text_color_primary flex items-center gap-2 mb-5 text-sm uppercase"
        >
          <el-icon class="text-primary"><Refresh /></el-icon>
          评估队列任务
        </h4>
        <div v-if="assessmentJobs.length" class="space-y-3">
          <div
            v-for="job in assessmentJobs"
            :key="job.job_id"
            class="rounded-lg bg-gray-50/70 dark:bg-gray-800/30 p-3 text-xs"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-text_color_primary">
                {{ job.job_type }} · {{ job.trigger_source || "manual" }}
              </span>
              <el-tag size="small" :type="jobType(job.status)" effect="plain">
                {{ job.status }}
              </el-tag>
            </div>
            <div class="mt-2 text-text_color_regular">
              尝试 {{ job.attempt_count }}/{{ job.max_attempts }}
              <span v-if="job.assessment_id"> · {{ job.assessment_id }}</span>
            </div>
            <p v-if="job.error_message" class="mt-1 text-red-500">
              {{ job.error_message }}
            </p>
          </div>
        </div>
        <el-empty v-else description="暂无评估队列任务" :image-size="90" />
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6 pb-6">
      <div
        class="lg:col-span-2 bg-bg_color p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <h4
          class="font-bold text-text_color_primary flex items-center gap-2 mb-8 text-sm uppercase"
        >
          <el-icon class="text-primary"><TrendCharts /></el-icon>
          最近评估动态
        </h4>
        <el-timeline v-if="timeline.length" class="pl-2">
          <el-timeline-item
            v-for="activity in timeline"
            :key="`${activity.time}-${activity.content}`"
            :type="timelineType(activity.type)"
            :timestamp="activity.time"
            hollow
          >
            <span class="text-[13px] text-text_color_regular">{{
              activity.content
            }}</span>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无评估动态" :image-size="90" />
      </div>

      <div
        class="lg:col-span-3 bg-gradient-to-br from-primary/5 via-bg_color to-primary/5 p-8 rounded-xl border border-primary/20 shadow-lg relative overflow-hidden group"
      >
        <h4
          class="font-bold text-primary flex items-center gap-2 mb-8 text-sm uppercase relative z-10"
        >
          <el-icon :size="20"><Promotion /></el-icon>
          AI 提升建议报告
        </h4>

        <div v-if="suggestions.length" class="space-y-4 relative z-10">
          <div
            v-for="(tip, i) in suggestions"
            :key="tip"
            class="flex items-start gap-4 p-4 bg-bg_color border border-gray-100 dark:border-gray-800 group-hover:border-primary/30 transition-all rounded-xl hover:translate-x-2"
          >
            <div
              class="w-6 h-6 rounded-full bg-primary text-white text-[10px] flex items-center justify-center flex-shrink-0 font-bold shadow-sm"
            >
              0{{ i + 1 }}
            </div>
            <span
              class="text-[13px] text-text_color_primary font-medium leading-relaxed"
              >{{ tip }}</span
            >
          </div>
        </div>
        <el-empty v-else description="暂无提升建议" :image-size="100" />

        <div class="mt-8 flex items-center gap-3 relative z-10">
          <el-button type="primary" size="large" class="shadow-lg shadow-primary/20">
            <el-icon class="mr-2"><Reading /></el-icon>查看学习路径
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>
