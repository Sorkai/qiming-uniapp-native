<script setup lang="ts">
import { ref, onMounted } from "vue";
import { type IconifyIcon } from "@iconify/vue";
import { useDark } from "../utils";
import { ReNormalCountTo } from "@/components/ReCountTo";
import {
  getPlatformStats,
  getStudentUsage,
  getTeacherUsage,
  getWeekUsage
} from "@/api/statistics";

const { isDark } = useDark();
const loading = ref(true);

interface StatItem {
  title: string;
  value: string | number;
  unit: string;
  trend: number;
  icon: string;
  color: string;
  bgColor: string;
}

const colors = ["#5B8FF9", "#5AD8A6", "#F6BD16", "#E8684A"];
const bgColors = ["#EBF1FF", "#EFFFF9", "#FFFBF0", "#FFF7F5"];
const darkBgColors = [
  "rgba(91, 143, 249, 0.15)",
  "rgba(90, 216, 166, 0.15)",
  "rgba(246, 189, 22, 0.15)",
  "rgba(232, 104, 74, 0.15)"
];

const stats = ref<StatItem[]>([]);

function withCardStyle(items: Omit<StatItem, "color" | "bgColor">[]) {
  return items.map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
    bgColor: bgColors[index % bgColors.length]
  }));
}

function sumUsage(list?: Array<{ usageNum?: number }>) {
  return (list || []).reduce(
    (total, item) => total + Number(item.usageNum || 0),
    0
  );
}

function usageTrend(list?: Array<{ usageNum?: number }>) {
  const data = list || [];
  if (data.length < 2) return 0;
  const current = Number(data[0]?.usageNum || 0);
  const previous = Number(data[1]?.usageNum || 0);
  if (previous <= 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
}

async function loadUsageFallbackStats() {
  const [teacherRes, studentRes, weekRes] = await Promise.all([
    getTeacherUsage().catch(() => null),
    getStudentUsage().catch(() => null),
    getWeekUsage().catch(() => null)
  ]);

  const teacherList = teacherRes?.data?.usageInfoList || [];
  const studentList = studentRes?.data?.usageInfoList || [];
  const teacherTotal =
    Number(weekRes?.data?.teacherTotalNum ?? sumUsage(teacherList)) || 0;
  const studentTotal =
    Number(weekRes?.data?.studentTotalNum ?? sumUsage(studentList)) || 0;
  const totalUsage = teacherTotal + studentTotal;

  return withCardStyle([
    {
      title: "本周总互动",
      value: totalUsage,
      unit: "次",
      trend: usageTrend([...teacherList, ...studentList]),
      icon: "ep:data-analysis"
    },
    {
      title: "教师教研活跃",
      value: teacherTotal,
      unit: "次",
      trend: usageTrend(teacherList),
      icon: "ep:reading"
    },
    {
      title: "学生学习活跃",
      value: studentTotal,
      unit: "次",
      trend: usageTrend(studentList),
      icon: "ep:user-filled"
    },
    {
      title: "日均教学互动",
      value: Math.round((totalUsage / 7) * 10) / 10,
      unit: "次",
      trend: 0,
      icon: "ep:trend-charts"
    }
  ]);
}

onMounted(async () => {
  try {
    const { data } = await getPlatformStats();
    if (data && data.stats) {
      stats.value = withCardStyle(data.stats);
      return;
    }
  } catch (error) {
    console.info(
      "Platform overview endpoint unavailable, using usage fallback.",
      error
    );
  }

  try {
    stats.value = await loadUsageFallbackStats();
  } catch (error) {
    console.warn("Failed to load platform usage fallback stats:", error);
    stats.value = [];
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <el-row v-loading="loading" :gutter="20" class="stats-overview-grid">
    <el-col
      v-for="(item, index) in stats"
      :key="index"
      :xs="24"
      :sm="12"
      :md="6"
    >
      <div
        class="stat-card p-6 bg-white dark:bg-[var(--el-bg-color-overlay)] rounded-[24px] shadow-sm border border-gray-100 dark:border-transparent mb-4 transition-all duration-500 hover:shadow-xl hover:-translate-y-2 group"
      >
        <!-- 背景装饰 -->
        <div
          class="absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 transition-transform duration-700 group-hover:scale-150"
          :style="{ backgroundColor: item.color }"
        />

        <div class="flex justify-between items-start mb-6 relative z-10">
          <div
            class="icon-wrapper w-14 h-14 rounded-2xl flex items-center justify-center text-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-lg shadow-transparent group-hover:shadow-current"
            :style="{
              backgroundColor: isDark
                ? darkBgColors[stats.indexOf(item) % darkBgColors.length]
                : item.bgColor,
              color: item.color,
              '--tw-shadow-color': item.color + '33'
            }"
          >
            <IconifyIconOnline :icon="item.icon" />
          </div>
          <div
            class="trend-tag px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 backdrop-blur-md"
            :class="
              item.trend >= 0
                ? 'bg-green-50/80 dark:bg-green-500/10 text-green-600'
                : 'bg-red-50/80 dark:bg-red-500/10 text-red-600'
            "
          >
            {{ item.trend >= 0 ? "+" : "" }}{{ item.trend }}%
            <IconifyIconOnline
              :icon="item.trend >= 0 ? 'ep:caret-top' : 'ep:caret-bottom'"
            />
          </div>
        </div>

        <div class="relative z-10">
          <p
            class="text-gray-500 dark:text-gray-300 text-sm mb-2 font-semibold tracking-wide uppercase"
          >
            {{ item.title }}
          </p>
          <div class="flex items-baseline gap-2">
            <span
              class="text-3xl font-black text-gray-900 dark:text-white tabular-nums"
            >
              <ReNormalCountTo
                :startVal="0"
                :endVal="parseFloat(item.value.toString().replace(/,/g, ''))"
                :duration="2000"
                :decimals="item.unit === '%' ? 1 : 0"
              />
            </span>
            <span
              class="text-gray-400 dark:text-gray-300 text-sm font-medium"
              >{{ item.unit }}</span
            >
          </div>
        </div>

        <!-- 底部进度条装饰 -->
        <div
          class="absolute bottom-0 left-0 h-1 transition-all duration-500 group-hover:w-full"
          :style="{ width: '30%', backgroundColor: item.color }"
        />
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
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  content: "";
  background: linear-gradient(
    135deg,
    rgb(255 255 255 / 10%) 0%,
    transparent 100%
  );
}
</style>

<style>
html.qiming-native-webview.ua-mobile .stats-overview-grid {
  --el-row-gutter: 10px;
}

html.qiming-native-webview.ua-mobile .stats-overview-grid > .el-col {
  flex: 0 0 50%;
  max-width: 50%;
  padding-right: 5px !important;
  padding-left: 5px !important;
}

html.qiming-native-webview.ua-mobile .stats-overview-grid .stat-card {
  min-height: 112px;
  padding: 14px !important;
  margin-bottom: 10px !important;
  border-radius: 18px !important;
  transform: none !important;
}

html.qiming-native-webview.ua-mobile
  .stats-overview-grid
  .stat-card
  .icon-wrapper {
  width: 36px !important;
  height: 36px !important;
  border-radius: 12px !important;
  font-size: 18px !important;
}

html.qiming-native-webview.ua-mobile
  .stats-overview-grid
  .stat-card
  .trend-tag {
  padding: 3px 7px !important;
  font-size: 10px !important;
}

html.qiming-native-webview.ua-mobile .stats-overview-grid .stat-card p {
  margin-bottom: 5px !important;
  font-size: 11px !important;
  line-height: 1.25 !important;
  letter-spacing: 0 !important;
}

html.qiming-native-webview.ua-mobile .stats-overview-grid .stat-card .text-3xl {
  font-size: 22px !important;
  line-height: 1.05 !important;
}

html.qiming-native-webview.ua-mobile .stats-overview-grid .stat-card .mb-6 {
  margin-bottom: 12px !important;
}

html.qiming-native-webview.ua-mobile.dark .stats-overview-grid .stat-card {
  background: var(--qiming-native-surface-bg) !important;
  border-color: var(--qiming-native-border-color) !important;
}

html.qiming-native-webview.ua-mobile.dark .stats-overview-grid .stat-card p {
  color: rgb(203 213 225 / 92%) !important;
}

html.qiming-native-webview.ua-mobile.dark
  .stats-overview-grid
  .stat-card
  .text-3xl,
html.qiming-native-webview.ua-mobile.dark
  .stats-overview-grid
  .stat-card
  .text-gray-400 {
  color: rgb(248 250 252 / 96%) !important;
}

html.qiming-native-webview.ua-mobile.dark
  .stats-overview-grid
  .stat-card
  .absolute.-right-4 {
  opacity: 0.08 !important;
}
</style>
