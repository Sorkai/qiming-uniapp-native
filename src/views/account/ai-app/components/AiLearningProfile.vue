<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  User,
  Medal,
  TrendCharts,
  Star,
  Trophy,
  Reading,
  VideoPlay,
  Avatar,
  Refresh,
  EditPen,
  Clock
} from "@element-plus/icons-vue";
import {
  assistantApiErrorMessage,
  createAssistantProfileCorrection,
  getAssistantProfileCurrent,
  listAssistantProfileCorrections,
  listAssistantProfileEvents,
  listAssistantProfileHistory,
  refreshAssistantProfile,
  type AssistantProfileCorrectionItem,
  type AssistantProfileCurrentResp,
  type AssistantProfileEvent,
  type AssistantProfileHistoryItem
} from "@/api/frontend/assistant";

const props = defineProps<{
  courseId?: number;
  targetStudentId?: number;
  requiresTargetStudent?: boolean;
}>();

const emit = defineEmits<{
  (event: "profile-loaded", payload: AssistantProfileCurrentResp): void;
}>();

const loading = ref(false);
const refreshing = ref(false);
const correctionSubmitting = ref(false);
const profile = ref<AssistantProfileCurrentResp | null>(null);
const profileHistory = ref<AssistantProfileHistoryItem[]>([]);
const profileEvents = ref<AssistantProfileEvent[]>([]);
const profileCorrections = ref<AssistantProfileCorrectionItem[]>([]);
const correctionDimension = ref("");
const correctionValue = ref(80);
const correctionReason = ref("");

const learner = computed(
  () =>
    profile.value?.learner || {
      name: "学习者",
      role: "student",
      course: "当前课程",
      enroll_days: 0,
      study_minutes: 0
    }
);

const icons = [Medal, TrendCharts, Trophy, Star, Star];
const dimensions = computed(() =>
  (profile.value?.dimensions || []).map((dimension, index) => ({
    ...dimension,
    color: dimension.color || ["#5e7ff8", "#10b981", "#f59e0b", "#8b5cf6"][index % 4],
    icon: icons[index % icons.length]
  }))
);
const knowledgeMap = computed(() => profile.value?.knowledge_map || []);
const tags = computed(() => profile.value?.tags || []);
const profileMeta = computed<Partial<AssistantProfileCurrentResp>>(
  () => profile.value || {}
);
const canCreateCorrection = computed(() => !!props.targetStudentId);
const currentDimension = computed(() =>
  dimensions.value.find(item => (item.key || item.label) === correctionDimension.value)
);
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

const percentLabel = (value?: number) => {
  if (value === undefined || value === null) return "暂无";
  const normalized = value <= 1 ? value * 100 : value;
  return `${Math.round(normalized)}%`;
};

const decisionType = (decision?: string) => {
  if (decision === "write_delta") return "success";
  if (decision === "skip") return "info";
  if (decision === "merge_without_event") return "warning";
  return "info";
};

const loadProfile = async () => {
  if (!hasRequiredContext.value) {
    profile.value = null;
    profileHistory.value = [];
    profileEvents.value = [];
    profileCorrections.value = [];
    return;
  }
  loading.value = true;
  try {
    const params = {
      course_id: props.courseId,
      target_student_id: props.targetStudentId
    };
    const [currentResult, historyResult, eventsResult, correctionsResult] =
      await Promise.allSettled([
        getAssistantProfileCurrent(params),
        listAssistantProfileHistory({ ...params, limit: 6 }),
        listAssistantProfileEvents({ ...params, limit: 8 }),
        listAssistantProfileCorrections({ ...params, limit: 6 })
      ]);
    if (currentResult.status === "fulfilled") {
      profile.value = currentResult.value?.data || null;
    } else {
      profile.value = null;
      console.warn("[AiLearningProfile] 当前画像接口加载失败:", currentResult.reason);
    }
    profileHistory.value =
      historyResult.status === "fulfilled"
        ? historyResult.value?.data?.items || []
        : [];
    profileEvents.value =
      eventsResult.status === "fulfilled" ? eventsResult.value?.data?.items || [] : [];
    profileCorrections.value =
      correctionsResult.status === "fulfilled"
        ? correctionsResult.value?.data?.items || []
        : [];
    if (!correctionDimension.value && profile.value?.dimensions?.length) {
      const first = profile.value.dimensions[0];
      correctionDimension.value = first.key || first.label;
      correctionValue.value = first.value || Math.round(first.score || 80);
    }
    if (profile.value) emit("profile-loaded", profile.value);
  } catch (error: any) {
    console.error("[AiLearningProfile] 学习画像加载失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "学习画像加载失败"));
  } finally {
    loading.value = false;
  }
};

const handleRefresh = async () => {
  if (!ensureCourseContext()) return;
  refreshing.value = true;
  try {
    const { data } = await refreshAssistantProfile({
      course_id: props.courseId,
      target_student_id: props.targetStudentId,
      trigger: "manual_refresh"
    });
    if (data.decision === "skip") {
      ElMessage.info(data.skip_reason || data.message || "本次画像无需更新");
    } else {
      ElMessage.success(data.message || "学习画像刷新完成");
    }
    await loadProfile();
  } catch (error: any) {
    console.error("[AiLearningProfile] 学习画像刷新失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "学习画像刷新失败"));
  } finally {
    refreshing.value = false;
  }
};

const handleSubmitCorrection = async () => {
  if (!ensureCourseContext()) return;
  if (!props.targetStudentId) {
    ElMessage.warning("请选择需要纠偏的学生");
    return;
  }
  if (!correctionDimension.value) {
    ElMessage.warning("请选择画像维度");
    return;
  }
  correctionSubmitting.value = true;
  try {
    const dimension = currentDimension.value;
    const afterJson = JSON.stringify({
      key: dimension?.key || correctionDimension.value,
      label: dimension?.label || correctionDimension.value,
      value: correctionValue.value,
      score: correctionValue.value,
      level: dimension?.level,
      evidence: ["教师纠偏"],
      updated_at: new Date().toISOString()
    });
    const { data } = await createAssistantProfileCorrection({
      course_id: props.courseId,
      target_student_id: props.targetStudentId,
      dimension_key: correctionDimension.value,
      after_json: afterJson,
      reason: correctionReason.value.trim() || "教师人工纠偏"
    });
    ElMessage.success(data.message || "画像纠偏已提交");
    correctionReason.value = "";
    await loadProfile();
  } catch (error: any) {
    console.error("[AiLearningProfile] 学习画像纠偏失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "学习画像纠偏失败"));
  } finally {
    correctionSubmitting.value = false;
  }
};

onMounted(loadProfile);
watch(() => [props.courseId, props.targetStudentId], loadProfile);
</script>

<template>
  <div
    v-loading="loading"
    class="h-full flex flex-col p-6 bg-transparent overflow-y-auto"
  >
    <div class="mb-8 flex items-start justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1">
          <el-icon class="text-primary"><User /></el-icon>
          <h2 class="text-xl font-bold text-text_color_primary">
            全息学习画像
          </h2>
        </div>
        <p class="text-sm text-text_color_regular mt-1">
          AI 实时抓取并总结学习特征 · 课程：{{ learner.course || "当前课程" }}
        </p>
      </div>
      <el-button
        type="primary"
        plain
        round
        :loading="refreshing"
        @click="handleRefresh"
      >
        <el-icon class="mr-1"><Refresh /></el-icon>
        刷新画像
      </el-button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div
        class="col-span-1 bg-bg_color rounded-xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col items-center hover:shadow-md transition-all"
      >
        <div
          class="relative w-28 h-28 rounded-full bg-gradient-to-tr from-primary to-purple-400 p-1 mb-6"
        >
          <div
            class="w-full h-full rounded-full bg-bg_color flex items-center justify-center overflow-hidden"
          >
            <el-icon :size="48" class="text-primary"><Avatar /></el-icon>
          </div>
          <div
            class="absolute bottom-1 right-1 bg-green-500 w-6 h-6 rounded-full border-4 border-bg_color shadow-sm"
          />
        </div>
        <h3 class="text-xl font-bold text-text_color_primary">
          {{ learner.name }}
        </h3>
        <p class="text-sm text-text_color_regular mt-1 mb-6">
          {{ learner.role }}
        </p>

        <div class="w-full grid grid-cols-2 gap-4 text-center">
          <div class="flex flex-col">
            <span class="text-2xl font-black text-primary">{{
              learner.enroll_days
            }}</span>
            <span
              class="text-[11px] text-text_color_regular uppercase tracking-wider"
              >学习天数</span
            >
          </div>
          <div class="flex flex-col">
            <span class="text-2xl font-black text-primary">{{
              learner.study_minutes
            }}</span>
            <span
              class="text-[11px] text-text_color_regular uppercase tracking-wider"
              >累计分钟</span
            >
          </div>
        </div>

        <div class="mt-8 flex flex-wrap justify-center gap-2">
          <el-tag v-for="tag in tags" :key="tag" effect="plain" round size="small">
            {{ tag }}
          </el-tag>
        </div>

        <div class="mt-6 w-full space-y-2 text-xs text-text_color_regular">
          <div class="flex items-center justify-between">
            <span>画像版本</span>
            <b class="text-text_color_primary">
              v{{ profileMeta.profile_version || 0 }}
            </b>
          </div>
          <div class="flex items-center justify-between">
            <span>置信度</span>
            <b class="text-text_color_primary">
              {{ percentLabel(profileMeta.confidence) }}
            </b>
          </div>
          <div class="flex items-center justify-between">
            <span>更新决策</span>
            <el-tag
              size="small"
              effect="plain"
              :type="decisionType(profileMeta.last_update_decision)"
            >
              {{ profileMeta.last_update_decision || "暂无" }}
            </el-tag>
          </div>
        </div>

        <div v-if="profileMeta.risk_flags?.length" class="mt-5 w-full">
          <div class="mb-2 text-xs font-bold text-text_color_regular">风险标记</div>
          <div class="flex flex-wrap gap-2">
            <el-tag
              v-for="flag in profileMeta.risk_flags"
              :key="flag"
              type="warning"
              effect="plain"
              size="small"
              class="!rounded-md"
            >
              {{ flag }}
            </el-tag>
          </div>
        </div>
      </div>

      <div
        class="col-span-1 md:col-span-2 bg-bg_color rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all"
      >
        <h4
          class="font-bold text-text_color_primary mb-8 flex items-center gap-2"
        >
          <el-icon class="text-primary"><TrendCharts /></el-icon>
          能力维度分析
        </h4>

        <div v-if="dimensions.length" class="space-y-8">
          <div v-for="dim in dimensions" :key="dim.label" class="group">
            <div class="flex justify-between items-center mb-3">
              <span
                class="text-sm font-medium text-text_color_regular flex items-center gap-3"
              >
                <div
                  class="w-8 h-8 rounded-lg flex-c bg-gray-50 dark:bg-gray-800 text-gray-400 group-hover:text-primary transition-colors"
                >
                  <el-icon :style="{ color: dim.color }">
                    <component :is="dim.icon" />
                  </el-icon>
                </div>
                {{ dim.label }}
              </span>
              <span class="text-sm font-bold" :style="{ color: dim.color }"
                >{{ dim.value }}%</span
              >
            </div>
            <el-progress
              :percentage="dim.value"
              :color="dim.color"
              :stroke-width="8"
              :show-text="false"
              stroke-linecap="round"
              class="w-full"
            />
            <div
              v-if="dim.evidence?.length"
              class="mt-3 flex flex-wrap gap-2"
            >
              <el-tag
                v-for="evidence in dim.evidence"
                :key="evidence"
                size="small"
                effect="plain"
                class="!rounded-md"
              >
                {{ evidence }}
              </el-tag>
            </div>
            <div
              v-if="dim.description || dim.trend || dim.updated_at"
              class="mt-2 text-xs text-text_color_regular leading-relaxed"
            >
              <span v-if="dim.description">{{ dim.description }}</span>
              <span v-if="dim.trend" class="ml-2 text-primary">
                趋势：{{ dim.trend }}
              </span>
              <span v-if="dim.updated_at" class="ml-2 opacity-60">
                {{ dim.updated_at }}
              </span>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无学习画像维度" :image-size="100" />
      </div>
    </div>

    <div class="mt-6 grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div
        class="bg-bg_color rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <h4 class="font-bold text-text_color_primary flex items-center gap-2 mb-5">
          <el-icon class="text-primary"><Clock /></el-icon>
          画像历史
        </h4>
        <el-timeline v-if="profileHistory.length">
          <el-timeline-item
            v-for="item in profileHistory"
            :key="item.profile_id"
            :timestamp="item.updated_at"
            hollow
          >
            <div class="text-sm font-bold text-text_color_primary">
              v{{ item.profile_version }}
              <span class="ml-2 text-xs font-normal text-text_color_regular">
                {{ percentLabel(item.confidence) }}
              </span>
            </div>
            <p class="mt-1 text-xs text-text_color_regular leading-relaxed">
              {{ item.summary || item.updated_reason || "画像快照已更新" }}
            </p>
            <div v-if="item.risk_flags?.length" class="mt-2 flex flex-wrap gap-1">
              <el-tag
                v-for="flag in item.risk_flags"
                :key="flag"
                size="small"
                effect="plain"
                class="!rounded-md"
              >
                {{ flag }}
              </el-tag>
            </div>
          </el-timeline-item>
        </el-timeline>
        <el-empty v-else description="暂无历史版本" :image-size="90" />
      </div>

      <div
        class="bg-bg_color rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <h4 class="font-bold text-text_color_primary flex items-center gap-2 mb-5">
          <el-icon class="text-primary"><TrendCharts /></el-icon>
          更新事件
        </h4>
        <div v-if="profileEvents.length" class="space-y-3">
          <div
            v-for="event in profileEvents"
            :key="`${event.event_source}-${event.trigger_id || event.summary}`"
            class="rounded-lg border border-gray-100 dark:border-gray-800 p-3"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="text-sm font-bold text-text_color_primary">
                {{ event.event_source }}
              </span>
              <el-tag
                size="small"
                effect="plain"
                :type="decisionType(event.decision)"
              >
                {{ event.decision || "unknown" }}
              </el-tag>
            </div>
            <p class="mt-2 text-xs text-text_color_regular leading-relaxed">
              {{ event.summary || event.skip_reason || "画像事件已记录" }}
            </p>
            <div v-if="event.changed_dimensions?.length" class="mt-2 flex flex-wrap gap-1">
              <el-tag
                v-for="dimension in event.changed_dimensions"
                :key="dimension"
                size="small"
                type="success"
                effect="plain"
                class="!rounded-md"
              >
                {{ dimension }}
              </el-tag>
            </div>
          </div>
        </div>
        <el-empty v-else description="暂无画像事件" :image-size="90" />
      </div>

      <div
        class="bg-bg_color rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <h4 class="font-bold text-text_color_primary flex items-center gap-2 mb-5">
          <el-icon class="text-primary"><EditPen /></el-icon>
          教师纠偏
        </h4>
        <div v-if="canCreateCorrection" class="space-y-3">
          <el-select
            v-model="correctionDimension"
            class="w-full"
            placeholder="选择画像维度"
          >
            <el-option
              v-for="dim in dimensions"
              :key="dim.key || dim.label"
              :label="dim.label"
              :value="dim.key || dim.label"
            />
          </el-select>
          <div>
            <div class="mb-2 text-xs text-text_color_regular">
              调整分值：{{ correctionValue }}
            </div>
            <el-slider v-model="correctionValue" :min="0" :max="100" />
          </div>
          <el-input
            v-model="correctionReason"
            type="textarea"
            :rows="3"
            maxlength="200"
            show-word-limit
            placeholder="填写纠偏原因"
          />
          <el-button
            type="primary"
            class="w-full"
            :loading="correctionSubmitting"
            @click="handleSubmitCorrection"
          >
            提交纠偏
          </el-button>
        </div>
        <el-alert
          v-else
          type="info"
          show-icon
          :closable="false"
          title="学生本人可查看纠偏记录；教师/管理员选择学生后可提交纠偏。"
        />

        <div class="mt-5 space-y-2">
          <div
            v-for="item in profileCorrections"
            :key="item.correction_id"
            class="rounded-lg bg-gray-50/70 dark:bg-gray-800/30 px-3 py-2 text-xs"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="font-bold text-text_color_primary">
                {{ item.dimension_key }}
              </span>
              <el-tag size="small" effect="plain">{{ item.status }}</el-tag>
            </div>
            <p class="mt-1 text-text_color_regular line-clamp-2">
              {{ item.reason || "暂无原因" }}
            </p>
            <div class="mt-1 text-text_color_regular opacity-60">
              {{ item.operator_role }} · {{ item.created_at }}
            </div>
          </div>
          <el-empty
            v-if="!profileCorrections.length"
            description="暂无纠偏记录"
            :image-size="80"
          />
        </div>
      </div>
    </div>

    <div
      class="mt-6 bg-bg_color rounded-xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-md transition-all"
    >
      <div class="flex items-center justify-between mb-8">
        <h4 class="font-bold text-text_color_primary flex items-center gap-2">
          <el-icon class="text-primary"><Reading /></el-icon>
          知识图谱掌握度
        </h4>
        <span class="text-xs text-text_color_regular opacity-60 italic"
          >基于课程学习数据动态推演</span
        >
      </div>

      <div
        v-if="knowledgeMap.length"
        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-x-12 gap-y-6"
      >
        <div
          v-for="node in knowledgeMap"
          :key="node.label"
          class="flex items-center gap-4 group"
        >
          <span
            class="w-48 flex-shrink-0 text-sm text-text_color_regular truncate group-hover:text-primary transition-colors"
            >{{ node.label }}</span
          >
          <el-progress
            class="flex-1"
            :percentage="node.mastery"
            :stroke-width="10"
            :color="
              node.mastery >= 80
                ? '#10b981'
                : node.mastery >= 60
                  ? '#3b82f6'
                  : node.mastery >= 40
                    ? '#f59e0b'
                    : '#ef4444'
            "
            stroke-linecap="round"
          />
          <span
            class="text-xs font-mono text-text_color_regular w-8 text-right"
            >{{ node.mastery }}</span
          >
        </div>
      </div>
      <el-empty v-else description="暂无知识图谱数据" :image-size="100" />

      <div
        v-if="profile?.message"
        class="mt-8 p-4 bg-primary/5 rounded-xl border border-primary/10 flex items-center gap-3 text-xs text-text_color_regular"
      >
        <el-icon color="var(--el-color-primary)" :size="20"
          ><VideoPlay
        /></el-icon>
        <div class="flex-1">
          <span class="font-bold text-text_color_primary">画像状态：</span>
          {{ profile.message }}
        </div>
      </div>
    </div>
  </div>
</template>
