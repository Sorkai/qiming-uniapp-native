<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";
import { getEfficientIndex } from "@/api/statistics";
import {
  ElTooltip,
  ElCheckbox,
  ElCheckboxGroup,
  ElDialog,
  ElButton
} from "element-plus";

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

const dialogVisible = ref(false);
const selectedSuggestion = ref(null);

const showDetails = item => {
  selectedSuggestion.value = item;
  dialogVisible.value = true;
};

// 默认显示优化建议
showOptimizePanel.value = true;

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
        
        <!-- 优化建议面板 -->
        <div v-if="optimizeSuggestions.length" class="optimize-suggestions mt-6">
          <h3 class="suggestion-main-title">
            <re-icon icon="ep:opportunity" class="mr-2" />
            AI 教学优化建议
          </h3>
          <el-row :gutter="16" class="suggestion-row">
            <el-col
              v-for="(item, index) in optimizeSuggestions"
              :key="index"
              :span="8"
              class="suggestion-col"
            >
              <el-card class="suggestion-card" shadow="hover">
                <template #header>
                  <div class="card-header">
                    <span>{{ item.courseName }}</span>
                  </div>
                </template>
                <div class="suggestion-content">
                  <p>{{ item.optimizeDirection }}</p>
                </div>
                <div class="card-footer">
                  <el-button type="primary" link @click="showDetails(item)"
                    >查看详情</el-button
                  >
                </div>
              </el-card>
            </el-col>
          </el-row>
        </div>

        <!-- 优化建议详情弹窗 -->
        <el-dialog
          v-model="dialogVisible"
          :title="selectedSuggestion?.courseName + ' 的优化建议'"
          width="40%"
          center
          append-to-body
        >
          <div class="dialog-content">
            <p>{{ selectedSuggestion?.optimizeDirection }}</p>
          </div>
          <template #footer>
            <span class="dialog-footer">
              <el-button type="primary" @click="dialogVisible = false"
                >我知道了</el-button
              >
            </span>
          </template>
        </el-dialog>
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

.optimize-suggestions {
  .suggestion-main-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: var(--el-text-color-primary);
  }

  .suggestion-row {
    // 让el-row里的列高度对齐
    align-items: stretch;
  }

  .suggestion-col {
    display: flex;
  }

  .suggestion-card {
    border-radius: 8px;
    border: 1px solid #e0e0e0;
    margin-bottom: 16px;
    transition: all 0.3s;
    // 占满列可使所有卡片等高
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;

    // 使 body 区域也为弹性布局以便 footer 底部对齐
    :deep(.el-card__body) {
      display: flex;
      flex-direction: column;
      flex: 1 1 auto;
      height: 100%;
    }

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      transform: translateY(-4px);
    }

    .card-header {
      font-weight: 600;
      color: var(--el-color-primary);
    }

    .suggestion-content {
      color: #606266;
      flex: 1 1 auto;
      // 保留最小高度防止过短
      min-height: 120px;
    }

    .card-footer {
      text-align: right;
      margin-top: auto; // 推到底部
      padding-top: 8px;
    }
  }
}

.dialog-content {
  padding: 20px;
  line-height: 1.8;
  font-size: 16px;
  white-space: pre-wrap;
}
</style>
