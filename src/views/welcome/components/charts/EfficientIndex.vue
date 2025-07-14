<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";
import { getEfficientIndex } from "@/api/statistics";
import { ElTooltip, ElCheckbox, ElCheckboxGroup } from "element-plus";

defineOptions({
  name: "EfficientIndex"
});

const loading = ref(true);
const efficientData = ref<any[]>([]);
const selectedCourses = ref<number[]>([]);
const showOptimizePanel = ref(false); // 默认折叠优化建议面板

const { isDark } = useDark();
const theme = computed(() => (isDark.value ? "dark" : "light"));

const chartRef = ref();
const { setOptions } = useECharts(chartRef, {
  theme
});

// 获取教学效率指数数据
const fetchData = async () => {
  loading.value = true;
  try {
    const response = await getEfficientIndex();
    
    if (response?.data?.efficientIndexList) {
      efficientData.value = response.data.efficientIndexList;
      // 默认选中所有课程
      selectedCourses.value = efficientData.value.map((item, index) => index);
    }
    
    renderChart();
  } catch (error) {
    console.error("获取教学效率指数数据失败:", error);
  } finally {
    loading.value = false;
  }
};

// 过滤选中的课程数据
const filteredData = computed(() => {
  return selectedCourses.value.map(index => efficientData.value[index]);
});

// 渲染图表
const renderChart = () => {
  if (!filteredData.value.length) return;
  
  const courseNames = filteredData.value.map(item => item.courseName);
  const planTimeData = filteredData.value.map(item => item.planTime);
  const correctPlanTimeData = filteredData.value.map(item => item.correctPlanTime);
  const planWorkTimeData = filteredData.value.map(item => item.planWorkTime);
  const correctPlanWorkTimeData = filteredData.value.map(item => item.correctPlanWorkTime);
  
  setOptions({
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      formatter: (params) => {
        const idx = params[0].dataIndex;
        const item = filteredData.value[idx];
        let html = `<div style="font-weight:bold">${item.courseName}</div>`;
        
        params.forEach(param => {
          html += `<div style="display:flex;justify-content:space-between;align-items:center;margin:5px 0">
            <span style="display:inline-block;margin-right:5px;border-radius:50%;width:10px;height:10px;background-color:${param.color}"></span>
            <span>${param.seriesName}：${param.value} 分钟</span>
          </div>`;
        });
        
        return html;
      }
    },
    legend: {
      data: ["备课耗时", "备课修正耗时", "作业设计耗时", "作业设计修正耗时"],
      bottom: 0
    },
    grid: {
      top: 10,
      left: 40,
      right: 20,
      bottom: 80
    },
    xAxis: [
      {
        type: "category",
        data: courseNames,
        axisLabel: {
          fontSize: "0.875rem",
          interval: 0,
          rotate: 30
        }
      }
    ],
    yAxis: [
      {
        type: "value",
        name: "耗时(分钟)",
        axisLabel: {
          fontSize: "0.875rem"
        }
      }
    ],
    series: [
      {
        name: "备课耗时",
        type: "bar",
        barWidth: 12,
        itemStyle: {
          color: "#41b6ff",
          borderRadius: [10, 10, 0, 0]
        },
        data: planTimeData
      },
      {
        name: "备课修正耗时",
        type: "bar",
        barWidth: 12,
        itemStyle: {
          color: "#e85f33",
          borderRadius: [10, 10, 0, 0]
        },
        data: correctPlanTimeData
      },
      {
        name: "作业设计耗时",
        type: "bar",
        barWidth: 12,
        itemStyle: {
          color: "#5470c6",
          borderRadius: [10, 10, 0, 0]
        },
        data: planWorkTimeData
      },
      {
        name: "作业设计修正耗时",
        type: "bar",
        barWidth: 12,
        itemStyle: {
          color: "#91cc75",
          borderRadius: [10, 10, 0, 0]
        },
        data: correctPlanWorkTimeData
      }
    ]
  });
};

// 更新选中的课程
const handleCoursesChange = () => {
  renderChart();
};

// 提供优化建议显示
const optimizeSuggestions = computed(() => {
  return efficientData.value.filter(item => item.optimizeDirection?.trim())
    .map(item => ({
      courseName: item.courseName,
      optimizeDirection: item.optimizeDirection
    }));
});

// 切换显示优化建议面板
const toggleOptimizePanel = () => {
  showOptimizePanel.value = !showOptimizePanel.value;
};

watch(
  () => selectedCourses.value,
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
        <div v-if="efficientData.length" class="course-filter mb-4">
          <p class="text-sm font-medium mb-2">选择课程：</p>
          <el-checkbox-group v-model="selectedCourses" @change="handleCoursesChange">
            <el-checkbox 
              v-for="(item, index) in efficientData" 
              :key="index" 
              :label="index"
              size="small"
              class="mr-4 mb-2"
            >
              {{ item.courseName }}
            </el-checkbox>
          </el-checkbox-group>
        </div>
        
        <div ref="chartRef" style="width: 100%; height: 350px"></div>
        
        <!-- 优化建议按钮 -->
        <div class="optimize-toggle" v-if="optimizeSuggestions.length">
          <div class="optimize-header">
            <el-button
              type="primary"
              link
              :icon="showOptimizePanel ? 'CaretTop' : 'CaretBottom'"
              @click="toggleOptimizePanel"
            >
              {{ showOptimizePanel ? '收起优化建议' : '查看优化建议' }}
            </el-button>
          </div>
        </div>
        
        <!-- 优化建议面板 -->
        <div v-if="showOptimizePanel && optimizeSuggestions.length" class="optimize-suggestions">
          <el-collapse accordion>
            <el-collapse-item 
              v-for="(item, index) in optimizeSuggestions" 
              :key="index" 
              :name="index"
            >
              <template #title>
                <span class="optimize-title">{{ item.courseName }} 的优化建议</span>
              </template>
              <div class="optimize-content">
                {{ item.optimizeDirection }}
              </div>
            </el-collapse-item>
          </el-collapse>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>

<style lang="scss" scoped>
.course-filter {
  border-bottom: 1px solid #ebeef5;
  padding-bottom: 10px;
}

:deep(.el-checkbox__label) {
  font-size: 12px;
}

.optimize-toggle {
  margin: 15px 0;
  
  .optimize-header {
    text-align: left;
    border-bottom: 1px solid #ebeef5;
    padding-bottom: 8px;
    margin-bottom: 16px;
    
    :deep(.el-button) {
      padding-left: 0;
    }
  }
}

.optimize-suggestions {
  margin-top: 10px;
  
  :deep(.el-collapse-item__header) {
    font-size: 14px;
    font-weight: 500;
  }
  
  .optimize-title {
    font-weight: 500;
    color: var(--el-color-primary);
  }
  
  .optimize-content {
    padding: 10px;
    line-height: 1.6;
    white-space: pre-line; /* 保留换行符 */
    word-break: break-word; /* 确保长文本自动换行 */
  }
}
</style> 