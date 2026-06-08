<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { ElMessage } from "element-plus";
import {
  DataAnalysis,
  Reading,
  CircleCheck,
  InfoFilled,
  Promotion,
  TrendCharts
} from "@element-plus/icons-vue";
import {
  getAssistantAssessmentCurrent,
  type AssistantAssessmentCurrentResp
} from "@/api/frontend/assistant";

const props = defineProps<{
  courseId?: number;
  targetStudentId?: number;
}>();

const loading = ref(false);
const assessment = ref<AssistantAssessmentCurrentResp | null>(null);

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

const timelineType = (type: string) => {
  if (["primary", "success", "warning", "danger", "info"].includes(type)) {
    return type as "primary" | "success" | "warning" | "danger" | "info";
  }
  return "primary";
};

const loadAssessment = async () => {
  loading.value = true;
  try {
    const { data } = await getAssistantAssessmentCurrent({
      course_id: props.courseId,
      target_student_id: props.targetStudentId
    });
    assessment.value = data;
  } catch (error: any) {
    console.error("[AiAssessment] 学习评估加载失败:", error);
    ElMessage.error(error?.message || "学习评估加载失败");
  } finally {
    loading.value = false;
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
