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
  Refresh
} from "@element-plus/icons-vue";
import {
  getAssistantProfileCurrent,
  refreshAssistantProfile,
  type AssistantProfileCurrentResp
} from "@/api/frontend/assistant";

const props = defineProps<{
  courseId?: number;
  targetStudentId?: number;
}>();

const emit = defineEmits<{
  (event: "profile-loaded", payload: AssistantProfileCurrentResp): void;
}>();

const loading = ref(false);
const refreshing = ref(false);
const profile = ref<AssistantProfileCurrentResp | null>(null);

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

const loadProfile = async () => {
  loading.value = true;
  try {
    const { data } = await getAssistantProfileCurrent({
      course_id: props.courseId,
      target_student_id: props.targetStudentId
    });
    profile.value = data;
    emit("profile-loaded", data);
  } catch (error: any) {
    console.error("[AiLearningProfile] 学习画像加载失败:", error);
    ElMessage.error(error?.message || "学习画像加载失败");
  } finally {
    loading.value = false;
  }
};

const handleRefresh = async () => {
  refreshing.value = true;
  try {
    const { data } = await refreshAssistantProfile({
      course_id: props.courseId,
      target_student_id: props.targetStudentId,
      trigger: "manual_refresh"
    });
    ElMessage.success(data.message || "学习画像刷新完成");
    await loadProfile();
  } catch (error: any) {
    console.error("[AiLearningProfile] 学习画像刷新失败:", error);
    ElMessage.error(error?.message || "学习画像刷新失败");
  } finally {
    refreshing.value = false;
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
          </div>
        </div>
        <el-empty v-else description="暂无学习画像维度" :image-size="100" />
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
