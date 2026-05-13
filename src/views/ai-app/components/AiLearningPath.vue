<script setup lang="ts">
import { ref } from "vue";
import {
  Location,
  Aim,
  Check,
  VideoPlay,
  Edit
} from "@element-plus/icons-vue";

const roadmapData = ref([
  {
    title: "第一阶段：基础概念强化",
    status: "completed",
    nodes: [
      { name: "二叉树的定义与性质", type: "video", done: true },
      { name: "完全二叉树满二叉树", type: "quiz", done: true }
    ]
  },
  {
    title: "第二阶段：核心算法突破 (当前)",
    status: "active",
    nodes: [
      { name: "红黑树的左旋与右旋", type: "video", done: false, current: true },
      { name: "红黑树插入修复逻辑", type: "code", done: false }
    ]
  },
  {
    title: "第三阶段：应用与拓展",
    status: "pending",
    nodes: [
      { name: "B树与B+树对比", type: "doc", done: false },
      { name: "数据库索引实战", type: "code", done: false }
    ]
  }
]);
</script>

<template>
  <div
    class="h-full flex flex-col p-6 bg-gray-50/30 overflow-y-auto custom-scrollbar"
  >
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-800">个性化路径规划</h2>
      <p class="text-sm text-gray-500 mt-1">
        基于学习画像为你动态规划的最优学习路线
      </p>
    </div>

    <div class="max-w-3xl mx-auto w-full relative">
      <div
        v-for="(phase, index) in roadmapData"
        :key="index"
        class="relative pl-8 mb-12"
      >
        <!-- Connecting Line -->
        <div
          v-if="index !== roadmapData.length - 1"
          class="absolute left-[11px] top-8 bottom-[-48px] w-0.5"
          :class="
            phase.status === 'completed'
              ? 'bg-primary'
              : 'bg-gray-200 border-dashed'
          "
        />

        <!-- Timeline Node -->
        <div
          class="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-white z-10"
          :class="{
            'border-primary text-primary': phase.status === 'completed',
            'border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]':
              phase.status === 'active',
            'border-gray-300': phase.status === 'pending'
          }"
        >
          <div
            v-if="phase.status === 'completed'"
            class="w-3 h-3 bg-primary rounded-full"
          />
          <div
            v-else-if="phase.status === 'active'"
            class="w-2.5 h-2.5 bg-blue-500 rounded-full animate-ping"
          />
          <div v-else class="w-2 h-2 bg-gray-300 rounded-full" />
        </div>

        <h3
          class="text-lg font-bold mb-4"
          :class="
            phase.status === 'pending' ? 'text-gray-400' : 'text-gray-800'
          "
        >
          {{ phase.title }}
        </h3>

        <div class="grid gap-3">
          <div
            v-for="(node, nIndex) in phase.nodes"
            :key="nIndex"
            class="flex items-center p-3 rounded-lg border transition-all"
            :class="{
              'bg-primary/5 border-primary/20 text-primary': node.current,
              'bg-white border-gray-100 opacity-60':
                !node.done && !node.current,
              'bg-white border-gray-100 hover:border-primary/30 cursor-pointer':
                node.done
            }"
          >
            <el-icon
              class="mr-3"
              :class="
                node.done
                  ? 'text-green-500'
                  : node.current
                    ? 'text-blue-500'
                    : 'text-gray-300'
              "
            >
              <Check v-if="node.done" />
              <Location v-else-if="node.current" />
              <Aim v-else />
            </el-icon>

            <div
              class="flex-1 font-medium text-sm"
              :class="!node.done && !node.current ? 'text-gray-400' : ''"
            >
              {{ node.name }}
            </div>

            <el-tag
              v-if="node.type === 'video'"
              size="small"
              type="info"
              class="!border-none bg-gray-50"
            >
              <el-icon class="mr-1"><VideoPlay /></el-icon> 视频
            </el-tag>
            <el-tag
              v-else-if="node.type === 'quiz'"
              size="small"
              type="info"
              class="!border-none bg-gray-50"
            >
              <el-icon class="mr-1"><Edit /></el-icon> 练习
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
