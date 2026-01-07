<script setup lang="ts">
import { ref, onMounted } from "vue";
import { type IconifyIcon } from "@iconify/vue";
import { useDark } from "../utils";
import { ReNormalCountTo } from "@/components/ReCountTo";

const { isDark } = useDark();

interface StatItem {
  title: string;
  value: string | number;
  unit: string;
  trend: number;
  icon: string;
  color: string;
  bgColor: string;
}

const stats = ref<StatItem[]>([
  {
    title: "累计授课时长",
    value: "1,280",
    unit: "小时",
    trend: 12.5,
    icon: "ep:timer",
    color: "#4f46e5",
    bgColor: "#eef2ff"
  },
  {
    title: "本周活跃学生",
    value: "856",
    unit: "人",
    trend: 8.2,
    icon: "ep:user",
    color: "#0891b2",
    bgColor: "#ecfeff"
  },
  {
    title: "平均作业完成率",
    value: "92.4",
    unit: "%",
    trend: -1.5,
    icon: "ep:finished",
    color: "#10b981",
    bgColor: "#f0fdf4"
  },
  {
    title: "AI 生成教案",
    value: "42",
    unit: "份",
    trend: 25.0,
    icon: "ep:magic-stick",
    color: "#8b5cf6",
    bgColor: "#f5f3ff"
  }
]);
</script>

<template>
  <el-row :gutter="20">
    <el-col v-for="(item, index) in stats" :key="index" :xs="24" :sm="12" :md="6">
      <div 
        class="stat-card p-6 bg-white dark:bg-[var(--el-bg-color-overlay)] rounded-[24px] shadow-sm border border-gray-100 dark:border-transparent mb-4 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 group"
      >
        <!-- 背景装饰 -->
        <div class="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 transition-transform duration-700 group-hover:scale-150" :style="{ backgroundColor: item.color }"></div>
        
        <div class="flex justify-between items-start mb-6 relative z-10">
          <div 
            class="icon-wrapper w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-transparent group-hover:shadow-current"
            :style="{ 
              backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : item.bgColor, 
              color: item.color,
              '--tw-shadow-color': item.color + '33'
            }"
          >
            <IconifyIconOnline :icon="item.icon" />
          </div>
          <div 
            class="trend-tag px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md"
            :class="item.trend >= 0 ? 'bg-green-50/80 dark:bg-green-500/10 text-green-600' : 'bg-red-50/80 dark:bg-red-500/10 text-red-600'"
          >
            {{ item.trend >= 0 ? '+' : '' }}{{ item.trend }}%
            <IconifyIconOnline 
              :icon="item.trend >= 0 ? 'ep:caret-top' : 'ep:caret-bottom'" 
            />
          </div>
        </div>
        
        <div class="relative z-10">
          <p class="text-gray-500 dark:text-gray-400 text-sm mb-2 font-semibold tracking-wide uppercase">{{ item.title }}</p>
          <div class="flex items-baseline gap-2">
            <span class="text-3xl font-black text-gray-900 dark:text-white tabular-nums">
              <ReNormalCountTo
                :startVal="0"
                :endVal="parseFloat(item.value.toString().replace(/,/g, ''))"
                :duration="2000"
                :decimals="item.unit === '%' ? 1 : 0"
              />
            </span>
            <span class="text-gray-400 dark:text-gray-500 text-sm font-medium">{{ item.unit }}</span>
          </div>
        </div>
        
        <!-- 底部进度条装饰 -->
        <div class="absolute bottom-0 left-0 h-1 transition-all duration-500 group-hover:w-full" :style="{ width: '30%', backgroundColor: item.color }"></div>
      </div>
    </el-col>
  </el-row>
</template>

<style scoped>
.stat-card {
  position: relative;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, transparent 100%);
  pointer-events: none;
}
</style>
