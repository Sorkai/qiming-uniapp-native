<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useDark } from "../utils";
import { ReNormalCountTo } from "@/components/ReCountTo";
import { getCourseStats, type CourseStatsResult } from "@/api/course";

const { isDark } = useDark();
const loading = ref(true);

interface StatItem {
  title: string;
  value: string | number;
  unit: string;
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

const toNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const buildStats = (data?: CourseStatsResult): StatItem[] => {
  const completionRate = data?.avgCompletionRate ?? data?.completionRate ?? 0;
  const values = [
    {
      title: "课程总数",
      value: toNumber(data?.totalCourses),
      unit: "门",
      icon: "ep:collection"
    },
    {
      title: "累计课时",
      value: toNumber(data?.totalHours),
      unit: data?.totalHoursUnit || "分钟",
      icon: "ep:timer"
    },
    {
      title: "活跃学生",
      value: toNumber(data?.activeStudents),
      unit: "人",
      icon: "ep:user"
    },
    {
      title: "平均完成率",
      value: toNumber(completionRate),
      unit: "%",
      icon: "ep:finished"
    }
  ];

  return values.map((item, index) => ({
    ...item,
    color: colors[index % colors.length],
    bgColor: bgColors[index % bgColors.length]
  }));
};

const stats = ref<StatItem[]>(buildStats());

onMounted(async () => {
  try {
    const { data } = await getCourseStats();
    if (data) stats.value = buildStats(data);
  } catch (error) {
    console.error("Failed to fetch course overview:", error);
  } finally {
    loading.value = false;
  }
});
</script>

<template>
  <el-row v-loading="loading" :gutter="20">
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

@media screen and (max-width: 768px) {
  .stat-card {
    padding: 16px !important;
    margin-bottom: 10px !important;
    border-radius: 16px !important;
  }
}
</style>
