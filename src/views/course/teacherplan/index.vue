<template>
  <div class="teacher-plan-container p-4">
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <!-- 头部区域 -->
      <div class="px-6 py-8 bg-gradient-to-r from-indigo-500 to-purple-600 text-white relative">
        <div class="relative z-10 text-center">
          <h1 class="text-3xl font-bold mb-2">教案智能工作台</h1>
          <p class="opacity-90">利用 AI 快速生成、优化和管理您的教学方案</p>
        </div>
        <!-- 装饰背景 -->
        <div class="absolute top-0 right-0 w-64 h-full opacity-10 pointer-events-none">
          <el-icon class="text-[120px] rotate-12"><Reading /></el-icon>
        </div>
      </div>

      <!-- Tab 控制器 -->
      <div class="bg-white px-6">
        <div class="flex border-b border-gray-100">
          <button
            v-for="tab in tabs"
            :key="tab.name"
            class="px-8 py-4 text-sm font-medium transition-all relative"
            :class="activeTab === tab.name ? 'text-indigo-600' : 'text-gray-500 hover:text-gray-700'"
            @click="activeTab = tab.name"
          >
            <div class="flex items-center">
              <el-icon class="mr-2"><component :is="tab.icon" /></el-icon>
              {{ tab.label }}
            </div>
            <!-- 激活状态指示器 -->
            <div
              v-if="activeTab === tab.name"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 rounded-t-full"
            />
          </button>
        </div>
      </div>

      <!-- 内容区域 -->
      <div class="p-6 min-h-[500px]">
        <transition name="fade" mode="out-in">
          <div :key="activeTab">
            <plan-generator v-if="activeTab === 'generate'" @switch-tab="switchTab" />
            <plan-list v-else />
          </div>
        </transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import PlanGenerator from "./components/PlanGenerator.vue";
import PlanList from "./components/PlanList.vue";
import { Reading, List, Cpu } from "@element-plus/icons-vue";

defineOptions({
  name: "CourseTeacherPlan"
});

// 标签页配置
const tabs = [
  { name: "generate", label: "AI 智能生成", icon: "Cpu" },
  { name: "list", label: "教案库", icon: "List" }
];

// 标签页控制
const activeTab = ref("generate");

// 切换标签页
const switchTab = (tabName: string) => {
  activeTab.value = tabName;
};
</script>

<style lang="scss" scoped>
.teacher-plan-container {
  max-width: 1400px;
  margin: 0 auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
 