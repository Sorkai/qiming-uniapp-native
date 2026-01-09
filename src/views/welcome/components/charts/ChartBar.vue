<script setup lang="ts">
import { useDark, useECharts } from "@pureadmin/utils";
import { type PropType, ref, computed, watch, nextTick } from "vue";

const props = defineProps({
  requireData: {
    type: Array as PropType<Array<number>>,
    default: () => []
  },
  questionData: {
    type: Array as PropType<Array<number>>,
    default: () => []
  }
});

const { isDark } = useDark();

const theme = computed(() => (isDark.value ? "dark" : "light"));

const chartRef = ref();
const { setOptions } = useECharts(chartRef, {
  theme
});

// 监听主题变化，重新渲染图表
watch(
  () => isDark.value,
  async () => {
    await nextTick();
    updateChart();
  }
);

const updateChart = () => {
  setOptions({
    container: ".bar-card",
    color: ["#41b6ff", "#e85f33"],
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "none"
      }
    },
    grid: {
      top: "20px",
      left: "50px",
      right: 0
    },
    legend: {
      data: ["需求人数", "提问数量"],
      textStyle: {
        color: isDark.value ? "#ffffff" : "#606266",
        fontSize: "0.875rem"
      },
      bottom: 0
    },
    xAxis: [
      {
        type: "category",
        data: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
        axisLabel: {
          fontSize: "0.875rem",
          color: isDark.value ? "#fafafa" : "#606266"
        },
        axisLine: {
          lineStyle: {
            color: isDark.value ? "#334155" : "#e5e7eb"
          }
        },
        axisPointer: {
          type: "shadow"
        }
      }
    ],
    yAxis: [
      {
        type: "value",
        axisLabel: {
          fontSize: "0.875rem",
          color: isDark.value ? "#fafafa" : "#606266"
        },
        splitLine: {
          show: false
        }
      }
    ],
    series: [
      {
        name: "需求人数",
        type: "bar",
        barWidth: 10,
        itemStyle: {
          color: "#41b6ff",
          borderRadius: [10, 10, 0, 0]
        },
        data: props.requireData
      },
      {
        name: "提问数量",
        type: "bar",
        barWidth: 10,
        itemStyle: {
          color: "#e86033ce",
          borderRadius: [10, 10, 0, 0]
        },
        data: props.questionData
      }
    ]
  });
};

watch(
  () => props,
  async () => {
    await nextTick();
    updateChart();
  },
  {
    deep: true,
    immediate: true
  }
);
</script>

<template>
  <div ref="chartRef" style="width: 100%; height: 365px" />
</template>
