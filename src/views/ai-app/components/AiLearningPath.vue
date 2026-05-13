<script setup lang="ts">
import { computed } from "vue";
import {
  Location,
  Aim,
  Check,
  VideoPlay,
  Edit,
  Cpu,
  Reading,
  Guide
} from "@element-plus/icons-vue";
import { getStudentDataset } from "./studentDatasets";

const props = defineProps<{ studentId?: string }>();

const dataset = computed(() => getStudentDataset(props.studentId));
const courseMeta = computed(() => dataset.value.path.courseMeta);
const roadmapData = computed(() => dataset.value.path.roadmap);
</script>

<template>
  <div
    class="h-full flex flex-col p-6 bg-transparent overflow-y-auto custom-scrollbar"
  >
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-1">
        <el-icon class="text-primary"><Guide /></el-icon>
        <h2 class="text-xl font-bold text-text_color_primary">个性化路径规划</h2>
      </div>
      <p class="text-sm text-text_color_regular mt-1">
        基于AI学情画像动态生成的专属进阶路线
      </p>

      <!-- 课程信息卡 - 适配平台卡片风格 -->
      <div
        class="mt-4 max-w-4xl bg-bg_color border border-gray-200 dark:border-gray-800 rounded-xl p-5 flex items-center gap-4 transition-all hover:shadow-md"
      >
        <div
          class="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
        >
          <el-icon :size="28"><Cpu /></el-icon>
        </div>
        <div class="flex-1 min-w-0">
          <div class="flex items-center gap-2 flex-wrap">
            <span class="font-bold text-text_color_primary lg:text-lg">{{ courseMeta.name }}</span>
            <el-tag size="small" effect="plain" round>{{
              courseMeta.subtitle
            }}</el-tag>
          </div>
          <div class="mt-2 text-xs text-text_color_regular flex items-center gap-3">
            <span
              >当前阶段：<span class="text-primary font-bold">{{
                courseMeta.currentPhase
              }}</span>
              / {{ courseMeta.totalPhase }}</span
            >
            <span class="w-[1px] h-3 bg-gray-200 dark:bg-gray-700"></span>
            <span>预计 {{ courseMeta.estimatedHours }} 学时</span>
          </div>
        </div>
        <el-button type="primary" round>
          <el-icon class="mr-1"><Reading /></el-icon>{{ studentId ? '继续分析' : '继续学习' }}
        </el-button>
      </div>
    </div>

    <div class="max-w-4xl w-full relative">
      <div
        v-for="(phase, index) in roadmapData"
        :key="index"
        class="relative pl-10 mb-12"
      >
        <!-- Connecting Line -->
        <div
          v-if="index !== roadmapData.length - 1"
          class="absolute left-[11px] top-8 bottom-[-48px] w-0.5"
          :class="
            phase.status === 'completed'
              ? 'bg-primary'
              : 'bg-gray-200 dark:bg-gray-800 border-dashed border-l'
          "
        />

        <!-- Timeline Node -->
        <div
          class="absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center border-2 bg-bg_color z-10"
          :class="{
            'border-primary text-primary': phase.status === 'completed',
            'border-blue-500 shadow-[0_0_12px_rgba(var(--el-color-primary-rgb),0.3)]':
              phase.status === 'active',
            'border-gray-300 dark:border-gray-700': phase.status === 'pending'
          }"
        >
          <el-icon v-if="phase.status === 'completed'" :size="12"><Check /></el-icon>
        <div
          v-else-if="phase.status === 'active'"
          class="w-2.5 h-2.5 bg-primary rounded-full animate-ping"
        />
        <div v-else class="w-2 h-2 bg-gray-300 dark:bg-gray-700 rounded-full" />
      </div>

      <div class="flex items-center justify-between mb-4 hover:translate-x-2 transition-transform duration-500 cursor-default">
        <div>
          <h3
            class="text-lg font-black tracking-tight"
            :class="
              phase.status === 'pending' ? 'text-text_color_regular opacity-40' : 'text-text_color_primary'
            "
          >
            {{ phase.title }}
          </h3>
            <p
              v-if="phase.summary"
              class="mt-1 text-xs text-text_color_regular"
              :class="phase.status === 'pending' ? 'opacity-50' : ''"
            >
              {{ phase.summary }}
            </p>
          </div>
          <el-tag v-if="phase.status === 'active'" size="small" effect="dark">进行中</el-tag>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div
            v-for="(node, nIndex) in phase.nodes"
            :key="nIndex"
            class="flex items-center p-4 rounded-xl border transition-all duration-300 group"
            :class="{
              'bg-primary/5 border-primary/20 text-primary shadow-sm': node.current,
              'bg-bg_color border-gray-100 dark:border-gray-800 opacity-60':
                !node.done && !node.current,
              'bg-bg_color border-gray-100 dark:border-gray-800 hover:border-primary/50 hover:shadow-md cursor-pointer':
                node.done || (!node.done && !node.current)
            }"
          >
            <div
              class="w-8 h-8 rounded-lg flex-c mr-3 transition-colors"
              :class="
                node.done
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                  : node.current
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-400 dark:bg-gray-800'
              "
            >
              <el-icon :size="16">
                <Check v-if="node.done" />
                <Location v-else-if="node.current" />
                <component :is="node.type === 'video' ? 'VideoPlay' : (node.type === 'code' ? 'Cpu' : 'Reading')" v-else />
              </el-icon>
            </div>

            <div
              class="flex-1 font-medium text-sm truncate"
              :class="!node.done && !node.current ? 'text-text_color_regular' : ''"
            >
              {{ node.name }}
            </div>

            <el-tag
              size="small"
              :type="node.type === 'video' ? 'info' : (node.type === 'code' ? 'warning' : 'success')"
              effect="plain"
              class="ml-2 !border-none"
            >
              {{ node.type === 'video' ? '视频' : (node.type === 'code' ? '实验' : (node.type === 'quiz' ? '练习' : '文档')) }}
            </el-tag>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
