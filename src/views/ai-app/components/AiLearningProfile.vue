<script setup lang="ts">
import { ref } from "vue";
import {
  User,
  Medal,
  TrendCharts,
  Star,
  Trophy,
  Cpu,
  Reading,
  VideoPlay
} from "@element-plus/icons-vue";

// 课程上下文：嵌入式 Linux 开发实践教程
const learner = ref({
  name: "嵌入式 Linux 学员",
  role: "Qt + TFLite 进阶选手",
  course: "嵌入式 Linux 开发实践教程",
  enrollDays: 18,
  studyMinutes: 1240
});

const dimensions = ref([
  { label: "Qt GUI 编程熟练度", value: 82, color: "#10b981", icon: Medal },
  { label: "C++ / 交叉编译基础", value: 88, color: "#3b82f6", icon: TrendCharts },
  { label: "TFLite 推理与量化理解", value: 64, color: "#f59e0b", icon: Trophy },
  { label: "硬件加速 (Delegate) 实战", value: 55, color: "#ef4444", icon: Star },
  { label: "工程化与调试能力", value: 76, color: "#8b5cf6", icon: Star }
]);

// 知识图谱掌握度（章节级）
const knowledgeMap = ref([
  { label: "Qt 模块体系", mastery: 95 },
  { label: "信号与槽 / 布局管理", mastery: 86 },
  { label: "Qt Designer & uic", mastery: 70 },
  { label: "QThread / QtConcurrent", mastery: 58 },
  { label: "交叉编译与 sysroot", mastery: 90 },
  { label: "TFLite Converter (量化)", mastery: 62 },
  { label: "TFLite Interpreter C++ API", mastery: 48 },
  { label: "GPU / NNAPI Delegate", mastery: 35 },
  { label: "V4L2 摄像头采集", mastery: 40 },
  { label: "QPainter 推理结果叠加", mastery: 30 }
]);

const RecentTags = [
  "Qt 信号槽达人",
  "交叉编译稳健",
  "TFLite 量化新手",
  "偏好 3D 推演视频",
  "夜间高产学员"
];
</script>

<template>
  <div class="h-full flex flex-col p-6 bg-gray-50/30 overflow-y-auto">
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-800">全息学习画像</h2>
      <p class="text-sm text-gray-500 mt-1">
        AI 实时抓取并总结你的学习特征 · 课程：{{ learner.course }}
      </p>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Left Profile Card -->
      <div
        class="col-span-1 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col items-center"
      >
        <div
          class="relative w-24 h-24 rounded-full bg-gradient-to-r from-primary to-purple-500 p-1 mb-4"
        >
          <div
            class="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden"
          >
            <el-icon :size="40" class="text-primary"><Cpu /></el-icon>
          </div>
          <div
            class="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white"
          />
        </div>
        <h3 class="text-lg font-bold text-gray-800">{{ learner.name }}</h3>
        <p class="text-sm text-gray-400 mt-1">{{ learner.role }}</p>

        <!-- 简要数据 -->
        <div class="mt-4 w-full grid grid-cols-2 gap-2 text-center">
          <div class="bg-gray-50 rounded-xl py-2">
            <div class="text-lg font-bold text-primary">
              {{ learner.enrollDays }}
            </div>
            <div class="text-[11px] text-gray-400">学习天数</div>
          </div>
          <div class="bg-gray-50 rounded-xl py-2">
            <div class="text-lg font-bold text-primary">
              {{ learner.studyMinutes }}
            </div>
            <div class="text-[11px] text-gray-400">累计分钟</div>
          </div>
        </div>

        <div class="mt-6 flex flex-wrap justify-center gap-2">
          <el-tag
            v-for="(tag, i) in RecentTags"
            :key="i"
            effect="plain"
            round
            class="!border-primary/20 !text-primary bg-primary/5"
          >
            {{ tag }}
          </el-tag>
        </div>
      </div>

      <!-- Right Skills Details -->
      <div
        class="col-span-1 md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
      >
        <h4 class="font-bold text-gray-700 mb-6 flex items-center gap-2">
          <el-icon class="text-primary"><TrendCharts /></el-icon>
          能力维度分析
        </h4>

        <div class="space-y-6">
          <div v-for="dim in dimensions" :key="dim.label">
            <div class="flex justify-between items-center mb-2">
              <span
                class="text-sm font-medium text-gray-600 flex items-center gap-2"
              >
                <el-icon :style="{ color: dim.color }"
                  ><component :is="dim.icon"
                /></el-icon>
                {{ dim.label }}
              </span>
              <span class="text-sm font-bold" :style="{ color: dim.color }">{{
                dim.value
              }}</span>
            </div>
            <el-progress
              :percentage="dim.value"
              :color="dim.color"
              :stroke-width="10"
              :show-text="false"
              stroke-linecap="round"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 知识图谱掌握度 -->
    <div
      class="mt-6 bg-white rounded-3xl p-6 border border-gray-100 shadow-sm"
    >
      <div class="flex items-center justify-between mb-6">
        <h4 class="font-bold text-gray-700 flex items-center gap-2">
          <el-icon class="text-primary"><Reading /></el-icon>
          知识图谱掌握度
        </h4>
        <span class="text-xs text-gray-400">基于课程章节 + 测验数据生成</span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
        <div
          v-for="node in knowledgeMap"
          :key="node.label"
          class="flex items-center gap-3"
        >
          <span class="w-44 flex-shrink-0 text-sm text-gray-600 truncate">{{
            node.label
          }}</span>
          <el-progress
            class="flex-1"
            :percentage="node.mastery"
            :stroke-width="8"
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
        </div>
      </div>

      <div class="mt-6 flex items-center gap-2 text-xs text-gray-400">
        <el-icon><VideoPlay /></el-icon>
        <span
          >建议下一步：补强 <span class="text-primary font-bold"
            >GPU / NNAPI Delegate</span
          > 与 <span class="text-primary font-bold">V4L2 摄像头采集</span> 两个低分项。</span
        >
      </div>
    </div>
  </div>
</template>
