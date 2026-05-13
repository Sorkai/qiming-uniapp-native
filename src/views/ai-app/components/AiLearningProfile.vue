<script setup lang="ts">
import { ref } from "vue";
import {
  User,
  Medal,
  TrendCharts,
  Star,
  Trophy
} from "@element-plus/icons-vue";

const dimensions = ref([
  { label: "知识掌握度", value: 85, color: "#10b981", icon: Medal },
  { label: "学习专注力", value: 92, color: "#3b82f6", icon: TrendCharts },
  { label: "抗挫折能力", value: 78, color: "#f59e0b", icon: Trophy },
  { label: "探索创新性", value: 88, color: "#8b5cf6", icon: Star }
]);

const RecentTags = ["二叉树苦手", "偏好视频推演", "夜猫子学霸", "代码调试达人"];
</script>

<template>
  <div class="h-full flex flex-col p-6 bg-gray-50/30 overflow-y-auto">
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-800">全息学习画像</h2>
      <p class="text-sm text-gray-500 mt-1">AI 实时抓取并总结你的学习特征</p>
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
            <el-icon :size="40" class="text-primary"><User /></el-icon>
          </div>
          <div
            class="absolute bottom-0 right-0 bg-green-500 w-5 h-5 rounded-full border-2 border-white"
          />
        </div>
        <h3 class="text-lg font-bold text-gray-800">数据结构 学员</h3>
        <p class="text-sm text-gray-400 mt-1">学习积极分子</p>

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
  </div>
</template>
