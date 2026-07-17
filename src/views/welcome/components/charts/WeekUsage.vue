<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useDark, useECharts, useResizeObserver } from "@pureadmin/utils";
import { getWeekUsage } from "@/api/statistics";
import { useAppStoreHook } from "@/store/modules/app";

defineOptions({
  name: "WeekUsage"
});

const loading = ref(true);
const weekData = ref({
  studentTotalNum: 0,
  teacherTotalNum: 0
});
const appStore = useAppStoreHook();
const isMobile = computed(() => appStore.getDevice === "mobile");

const { isDark } = useDark();
const theme = computed(() => (isDark.value ? "dark" : "light"));

const chartRef = ref();
const { setOptions, resize } = useECharts(chartRef, {
  theme
});

useResizeObserver(chartRef, () => resize(), {
  time: 80
});

// 获取一周使用情况数据
const fetchData = async () => {
  loading.value = true;
  try {
    const res = await getWeekUsage();
    if (res?.data) {
      weekData.value = res.data;
      renderChart();
    }
  } catch (error) {
    console.error("获取一周使用情况数据失败:", error);
  } finally {
    loading.value = false;
  }
};

// 渲染图表
const renderChart = () => {
  const { studentTotalNum, teacherTotalNum } = weekData.value;
  const total = studentTotalNum + teacherTotalNum;

  setOptions({
    tooltip: {
      trigger: "item",
      formatter: "{a} <br/>{b}: {c} ({d}%)"
    },
    legend: {
      orient: "horizontal",
      bottom: 0,
      itemGap: isMobile.value ? 12 : 20,
      data: ["学生使用", "老师使用"],
      textStyle: {
        color: isDark.value ? "#ffffff" : "#4b5563"
      }
    },
    title: {
      text: `总次: ${total}`,
      left: "center",
      top: "center",
      textStyle: {
        fontSize: 18,
        fontWeight: "bold",
        color: isDark.value ? "#ffffff" : "#1e293b"
      }
    },
    series: [
      {
        name: "使用分析",
        type: "pie",
        radius: isMobile.value ? ["42%", "66%"] : ["50%", "75%"],
        center: isMobile.value ? ["50%", "44%"] : ["50%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 12,
          borderColor: isDark.value ? "#1d1e1f" : "#fff",
          borderWidth: 4
        },
        label: {
          show: true,
          formatter: "{b}\n{d}%",
          color: isDark.value ? "#ffffff" : "#4b5563",
          fontSize: isMobile.value ? 11 : 12,
          fontWeight: 500
        },
        labelLine: {
          show: true
        },
        data: [
          {
            value: studentTotalNum,
            name: "学生使用",
            itemStyle: { color: "#5B8FF9" }
          },
          {
            value: teacherTotalNum,
            name: "老师使用",
            itemStyle: { color: "#F6BD16" }
          }
        ]
      }
    ]
  });
};

// 监听主题变化，重新渲染图表
watch(
  () => [isDark.value, isMobile.value],
  () => {
    if (!loading.value) {
      renderChart();
    }
  }
);

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="w-full">
    <el-skeleton :loading="loading" animated :rows="6">
      <template #default>
        <div
          ref="chartRef"
          class="usage-chart"
          style="width: 100%; height: 350px"
        />
      </template>
    </el-skeleton>
  </div>
</template>

<style scoped>
@media screen and (max-width: 768px),
  screen and (orientation: landscape) and (max-height: 520px) and (pointer: coarse) {
  .usage-chart {
    height: 320px !important;
  }
}
</style>
