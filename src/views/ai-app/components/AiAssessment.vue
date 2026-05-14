<script setup lang="ts">
import { computed } from "vue";
import {
  DataAnalysis,
  Reading,
  CircleCheck,
  InfoFilled,
  Cpu,
  Promotion,
  TrendCharts
} from "@element-plus/icons-vue";
import { getStudentDataset } from "./studentDatasets";

const props = defineProps<{ studentId?: string }>();

const dataset = computed(() => getStudentDataset(props.studentId));
const courseInfo = computed(() => dataset.value.assessment.courseInfo);
const stats = computed(() => dataset.value.assessment.stats);
const strengths = computed(() => dataset.value.assessment.strengths);
const weakPoints = computed(() => dataset.value.assessment.weakPoints);
const timeline = computed(() => dataset.value.assessment.timeline);
const suggestions = computed(() => dataset.value.assessment.suggestions);
</script>

<template>
  <div class="h-full flex flex-col p-6 bg-transparent overflow-y-auto">
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
          章节 {{ courseInfo.finishedChapters }} /
          {{ courseInfo.totalChapters }}
        </el-tag>
        <el-button type="primary" plain round icon="Download"
          >导出报告</el-button
        >
      </div>
    </div>

    <!-- 核心统计 - 适配平台看板风格 -->
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div
        v-for="(s, i) in stats"
        :key="i"
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
          class="text-[10px] font-bold px-3 py-1 rounded-full bg-primary/5 text-primary border border-primary/10"
        >
          {{ s.sub }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 弱点警示 - 针对性UI重构 -->
      <div
        class="bg-bg_color p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-red-500"
      >
        <h4
          class="font-bold text-red-600 flex items-center gap-2 mb-6 uppercase tracking-wider text-sm"
        >
          <el-icon :size="18"><InfoFilled /></el-icon>
          薄弱知识点警示
        </h4>
        <div class="space-y-4">
          <div
            v-for="(w, i) in weakPoints"
            :key="i"
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
      </div>

      <!-- 优势能力 -->
      <div
        class="bg-bg_color p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm border-l-4 border-l-green-500"
      >
        <h4
          class="font-bold text-green-600 flex items-center gap-2 mb-6 uppercase tracking-wider text-sm"
        >
          <el-icon :size="18"><CircleCheck /></el-icon>
          稳定优势能力
        </h4>
        <div class="space-y-4">
          <div
            v-for="(item, i) in strengths"
            :key="i"
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
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-5 gap-6 mt-6 pb-6">
      <!-- 动态流水 -->
      <div
        class="lg:col-span-2 bg-bg_color p-6 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm"
      >
        <h4
          class="font-bold text-text_color_primary flex items-center gap-2 mb-8 text-sm uppercase"
        >
          <el-icon class="text-primary"><TrendCharts /></el-icon>
          最近评估动态
        </h4>
        <el-timeline class="pl-2">
          <el-timeline-item
            v-for="(activity, index) in timeline"
            :key="index"
            :type="activity.type"
            :timestamp="activity.time"
            hollow
          >
            <span class="text-[13px] text-text_color_regular">{{
              activity.content
            }}</span>
          </el-timeline-item>
        </el-timeline>
      </div>

      <!-- AI 建议 - 卡片视觉重构 -->
      <div
        class="lg:col-span-3 bg-gradient-to-br from-primary/5 via-bg_color to-primary/5 p-8 rounded-xl border border-primary/20 shadow-lg relative overflow-hidden group"
      >
        <!-- 背景装饰 -->
        <div
          class="absolute -right-8 -top-8 w-32 h-32 bg-primary/10 rounded-full blur-3xl opacity-50"
        />

        <h4
          class="font-bold text-primary flex items-center gap-2 mb-8 text-sm uppercase relative z-10"
        >
          <el-icon :size="20" class="animate-bounce"><Promotion /></el-icon>
          AI 提升建议报告
        </h4>

        <div class="space-y-4 relative z-10">
          <div
            v-for="(tip, i) in suggestions"
            :key="i"
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

        <div class="mt-8 flex items-center gap-3 relative z-10">
          <el-button
            type="primary"
            size="large"
            class="shadow-lg shadow-primary/20"
          >
            <el-icon class="mr-2"><Reading /></el-icon>更新学习路径
          </el-button>
          <el-button size="large" plain round>暂不处理</el-button>
        </div>
      </div>
    </div>
  </div>
</template>
