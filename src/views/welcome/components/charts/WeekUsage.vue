<script setup lang="ts">
import { onMounted, ref, computed, watch, nextTick } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";
import { getWeekUsage } from "@/api/statistics";

defineOptions({
  name: "WeekUsage"
});

const loading = ref(true);
const weekData = ref({
  studentTotalNum: 0,
  teacherTotalNum: 0
});

const { isDark } = useDark();
const theme = computed(() => (isDark.value ? "dark" : "light"));

// 用于强制重新渲染图表的 key
const chartKey = ref(0);

const chartRef = ref();
const { setOptions } = useECharts(chartRef, {
  theme,
  renderer: "svg" // 使用 SVG 渲染器，在 Safari 和 Firefox 上更稳定
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
const renderChart = async () => {
  // 确保 DOM 已更新
  await nextTick();
  
  // 确保图表容器存在
  if (!chartRef.value) {
    console.warn("WeekUsage 图表容器不存在，等待 DOM 渲染...");
    return;
  }
  
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
        radius: ["50%", "75%"],
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
          fontSize: 12,
          fontWeight: 500
        },
        labelLine: {
          show: true
        },
        data: [
          { value: studentTotalNum, name: "学生使用", itemStyle: { color: "#5B8FF9" } },
          { value: teacherTotalNum, name: "老师使用", itemStyle: { color: "#F6BD16" } }
        ]
      }
    ]
  });
};

// 监听主题变化，强制重新渲染图表
watch(
  () => isDark.value,
  async () => {
    // 强制重新渲染图表容器（通过改变 key 让 Vue 销毁并重建 DOM）
    chartKey.value++;
    
    // 等待 DOM 更新和 CSS 动画完成
    await nextTick();
    setTimeout(() => {
      if (!loading.value) {
        renderChart();
      }
    }, 300); // 延时确保 CSS 动画完成
  }
);

// 监听 loading 状态变化，确保图表在 DOM 渲染后初始化
watch(
  () => loading.value,
  async (newLoading, oldLoading) => {
    if (oldLoading && !newLoading) {
      // loading 从 true 变为 false，DOM 已渲染，重新渲染图表
      await nextTick();
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
        <div ref="chartRef" :key="chartKey" style="width: 100%; height: 350px"></div>
      </template>
    </el-skeleton>
  </div>
</template>
