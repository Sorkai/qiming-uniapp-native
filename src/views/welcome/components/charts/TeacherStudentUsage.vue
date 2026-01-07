<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";
import { getTeacherUsage, getStudentUsage } from "@/api/statistics";

defineOptions({
  name: "TeacherStudentUsage"
});

const loading = ref(true);
const teacherData = ref<{date: string; usageNum: number}[]>([]);
const studentData = ref<{date: string; usageNum: number}[]>([]);

const { isDark } = useDark();
const theme = computed(() => (isDark.value ? "dark" : "light"));

const chartRef = ref();
const { setOptions } = useECharts(chartRef, {
  theme
});

// 获取教师和学生使用情况数据
const fetchData = async () => {
  loading.value = true;
  try {
    const [teacherRes, studentRes] = await Promise.all([
      getTeacherUsage(),
      getStudentUsage()
    ]);
    
    if (teacherRes?.data?.usageInfoList) {
      teacherData.value = teacherRes.data.usageInfoList;
    }
    
    if (studentRes?.data?.usageInfoList) {
      studentData.value = studentRes.data.usageInfoList;
    }
    
    renderChart();
  } catch (error) {
    console.error("获取使用情况数据失败:", error);
  } finally {
    loading.value = false;
  }
};

// 渲染图表
const renderChart = () => {
  // 从数据中提取日期和使用次数
  const dates = teacherData.value.map(item => item.date);
  const teacherUsage = teacherData.value.map(item => item.usageNum);
  const studentUsage = studentData.value.map(item => item.usageNum);

  setOptions({
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "line",
        lineStyle: {
          color: "#4f46e5",
          width: 1,
          type: "dashed"
        }
      },
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      borderColor: "#f1f5f9",
      borderWidth: 1,
      textStyle: {
        color: "#1e293b"
      }
    },
    legend: {
      data: ["教研活动", "学生学习"],
      bottom: 0,
      icon: "circle",
      itemGap: 24,
      textStyle: {
        color: "#64748b"
      }
    },
    grid: {
      top: 30,
      left: 40,
      right: 20,
      bottom: 50
    },
    xAxis: [
      {
        type: "category",
        data: dates,
        boundaryGap: false,
        axisLine: {
          lineStyle: {
            color: "#f1f5f9"
          }
        },
        axisLabel: {
          color: "#94a3b8",
          fontSize: 11
        },
        axisTick: {
          show: false
        }
      }
    ],
    yAxis: [
      {
        type: "value",
        splitLine: {
          lineStyle: {
            color: "#f1f5f9",
            type: "dashed"
          }
        },
        axisLabel: {
          color: "#94a3b8",
          fontSize: 11
        }
      }
    ],
    series: [
      {
        name: "教研活动",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: "#4f46e5"
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(79, 70, 229, 0.2)" },
              { offset: 1, color: "rgba(79, 70, 229, 0)" }
            ]
          }
        },
        data: teacherUsage
      },
      {
        name: "学生学习",
        type: "line",
        smooth: true,
        showSymbol: false,
        lineStyle: {
          width: 3,
          color: "#06b6d4"
        },
        areaStyle: {
          color: {
            type: "linear",
            x: 0,
            y: 0,
            x2: 0,
            y2: 1,
            colorStops: [
              { offset: 0, color: "rgba(6, 182, 212, 0.2)" },
              { offset: 1, color: "rgba(6, 182, 212, 0)" }
            ]
          }
        },
        data: studentUsage
      }
    ]
  });
};

watch(
  () => [teacherData.value, studentData.value],
  () => {
    renderChart();
  },
  { deep: true }
);

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