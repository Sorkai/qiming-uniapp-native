<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";

const { isDark } = useDark();

const theme = computed(() => (isDark.value ? "dark" : "light"));

const pieChartRef = ref();
const { setOptions } = useECharts(pieChartRef, {
  theme
});

const renderChart = () => {
  setOptions({
    tooltip: {
      trigger: "item"
    },
    legend: {
      icon: "circle",
      //@ts-expect-error
      right: true,
      textStyle: {
        color: isDark.value ? "#ffffff" : "#333"
      }
    },
    series: [
      {
        name: "饼图",
        type: "pie",
        top: "20%",
        radius: "80%",
        center: ["40%", "50%"],
        color: ["#e6a23c", "#f56c6c", "#53a7ff"],
        data: [
          { value: 400, name: "watchers" },
          { value: 1600, name: "forks" },
          { value: 7200, name: "star" }
        ]
      }
    ]
  });
};

// 监听主题变化，重新渲染图表
watch(
  () => isDark.value,
  () => {
    renderChart();
  }
);

onMounted(() => {
  renderChart();
});
</script>

<template>
  <div ref="pieChartRef" style="width: 100%; height: 35vh" />
</template>
