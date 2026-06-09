<script setup lang="ts">
import { type PropType, ref, computed, watch, onMounted } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";

const props = defineProps({
  data: {
    type: Array as PropType<Array<number>>,
    default: () => []
  },
  color: {
    type: String,
    default: "#41b6ff"
  }
});

const { isDark } = useDark();

const theme = computed(() => (isDark.value ? "dark" : "light"));

const chartRef = ref();
const { setOptions } = useECharts(chartRef, {
  theme,
  renderer: "svg"
});

const renderChart = () => {
  setOptions({
    container: ".line-card",
    xAxis: {
      type: "category",
      show: false,
      data: props.data
    },
    grid: {
      top: "15px",
      bottom: 0,
      left: 0,
      right: 0
    },
    yAxis: {
      show: false,
      type: "value"
    },
    series: [
      {
        data: props.data,
        type: "line",
        symbol: "none",
        smooth: true,
        color: props.color,
        lineStyle: {
          shadowOffsetY: 3,
          shadowBlur: 7,
          shadowColor: props.color
        }
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

// 监听 props 变化
watch(
  () => props,
  () => {
    renderChart();
  },
  { deep: true }
);

onMounted(() => {
  renderChart();
});
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 60px" />
</template>
