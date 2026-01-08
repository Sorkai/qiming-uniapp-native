<script setup lang="ts">
import { onMounted, ref, computed } from "vue";
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

const chartRef = ref();
const { setOptions } = useECharts(chartRef, {
  theme
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
      data: ["学生使用", "老师使用"]
    },
    title: {
      text: `总计: ${total}`,
      left: "center",
      top: "center",
      textStyle: {
        fontSize: 16,
        color: isDark.value ? "#fff" : "#333"
      }
    },
    series: [
      {
        name: "使用情况",
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: isDark.value ? "#1d1e1f" : "#fff",
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: "{b}: {c} ({d}%)"
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

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="w-full">
    <el-skeleton :loading="loading" animated :rows="6">
      <template #default>
        <div ref="chartRef" style="width: 100%; height: 350px"></div>
      </template>
    </el-skeleton>
  </div>
</template> 