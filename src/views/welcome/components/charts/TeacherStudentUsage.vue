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
        type: "shadow"
      }
    },
    legend: {
      data: ["老师使用次数", "学生使用次数"],
      bottom: 0
    },
    grid: {
      top: 10,
      left: 40,
      right: 20,
      bottom: 50
    },
    xAxis: [
      {
        type: "category",
        data: dates,
        axisLabel: {
          fontSize: "0.875rem"
        }
      }
    ],
    yAxis: [
      {
        type: "value",
        name: "使用次数",
        axisLabel: {
          fontSize: "0.875rem"
        }
      }
    ],
    series: [
      {
        name: "老师使用次数",
        type: "bar",
        barWidth: 10,
        itemStyle: {
          color: "#41b6ff",
          borderRadius: [10, 10, 0, 0]
        },
        data: teacherUsage
      },
      {
        name: "学生使用次数",
        type: "bar",
        barWidth: 10,
        itemStyle: {
          color: "#e85f33",
          borderRadius: [10, 10, 0, 0]
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