<script setup lang="ts">
import { ref } from "vue";
import {
  DataAnalysis,
  Reading,
  CircleCheck,
  InfoFilled
} from "@element-plus/icons-vue";

const stats = ref([
  { label: "综合评估分", value: "A-", sub: "前 15%" },
  { label: "预估期末分", value: "88", sub: "稳中有升" },
  { label: "完成里程碑", value: "12/20", sub: "进度 60%" }
]);

const timeline = ref([
  { time: "今天 10:00", content: "完成二叉树基础测验", type: "success" },
  {
    time: "昨天 15:30",
    content: "通过红黑树辅导，补齐了短板",
    type: "primary"
  },
  { time: "本周一", content: "提交图算法大作业，获得 A", type: "success" }
]);
</script>

<template>
  <div class="h-full flex flex-col p-6 bg-gray-50/30 overflow-y-auto">
    <div class="mb-8 flex justify-between items-end">
      <div>
        <h2 class="text-xl font-bold text-gray-800">阶段学习评估</h2>
        <p class="text-sm text-gray-500 mt-1">
          根据历次测验与交互数据汇总的智能诊断报告
        </p>
      </div>
      <el-button plain round>导出为 PDF</el-button>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div
        v-for="(s, i) in stats"
        :key="i"
        class="bg-white p-6 rounded-2xl border border-gray-100 flex flex-col justify-center items-center relative overflow-hidden group"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
        />
        <div class="text-gray-500 text-sm mb-2 relative z-10">
          {{ s.label }}
        </div>
        <div class="text-4xl font-black text-gray-800 mb-1 relative z-10">
          {{ s.value }}
        </div>
        <div
          class="text-xs text-primary bg-primary/10 px-2 py-1 rounded-full relative z-10"
        >
          {{ s.sub }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <!-- 弱点警示 -->
      <div class="bg-white p-6 rounded-2xl border border-red-100">
        <h4 class="font-bold text-red-600 flex items-center gap-2 mb-4">
          <el-icon><InfoFilled /></el-icon>
          薄弱知识点警示
        </h4>
        <div class="space-y-3">
          <div
            class="flex flex-col p-3 bg-red-50/50 rounded-lg border border-red-50"
          >
            <span class="text-sm font-bold text-red-700"
              >图论：最短路径 Dijkstra 算法</span
            >
            <span class="text-xs text-red-500 mt-1"
              >最近两次作业错误率 40%，建议重新进行推演沙盒练习。</span
            >
          </div>
          <div
            class="flex flex-col p-3 bg-orange-50/50 rounded-lg border border-orange-50"
          >
            <span class="text-sm font-bold text-orange-700">栈与队列应用</span>
            <span class="text-xs text-orange-500 mt-1"
              >答题时间超出平均值30%，熟练度不足。</span
            >
          </div>
        </div>
      </div>

      <!-- 动态流水 -->
      <div class="bg-white p-6 rounded-2xl border border-gray-100">
        <h4 class="font-bold text-gray-700 flex items-center gap-2 mb-6">
          <el-icon class="text-primary"><DataAnalysis /></el-icon>
          最近评估动态
        </h4>
        <el-timeline>
          <el-timeline-item
            v-for="(activity, index) in timeline"
            :key="index"
            :type="activity.type"
            :timestamp="activity.time"
            hollow
          >
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
      </div>
    </div>
  </div>
</template>
