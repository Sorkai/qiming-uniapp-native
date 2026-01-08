<script setup lang="ts">
import { onMounted, ref, computed, watch } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";
import { getEfficientIndex } from "@/api/statistics";
import {
  ElTooltip,
  ElCheckbox,
  ElCheckboxGroup,
  ElDialog,
  ElButton,
  ElPagination
} from "element-plus";

defineOptions({
  name: "EfficientIndex"
});

const loading = ref(true);
const efficientData = ref<any[]>([]);
const selectedCourses = ref<number[]>([]);
const showOptimizePanel = ref(false); // 默认折叠优化建议面板

const currentPage = ref(1);
const pageSize = ref(5);

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
      selectedCourses.value = efficientData.value.map((_, index) => index);
    }
    
    renderChart();
  } catch (error) {
    console.error("获取教学效率指数数据失败:", error);
  } finally {
    loading.value = false;
  }
};

// 过滤后的总数据
const totalFilteredData = computed(() => {
  return selectedCourses.value.map(index => efficientData.value[index]);
});

// 分页后的图表数据
const pagedData = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value;
  const end = start + pageSize.value;
  return totalFilteredData.value.slice(start, end);
});

// 监听分页和选中项变化重新渲染图表
watch([currentPage, pageSize, selectedCourses], () => {
  renderChart();
});

// 渲染图表
const renderChart = () => {
  if (!pagedData.value.length) {
    setOptions({
      xAxis: { data: [] },
      series: []
    });
    return;
  }
  
  const courseNames = pagedData.value.map(item => item.courseName);
  const planTimeData = pagedData.value.map(item => item.planTime);
  const correctPlanTimeData = pagedData.value.map(item => item.correctPlanTime);
  const planWorkTimeData = pagedData.value.map(item => item.planWorkTime);
  const correctPlanWorkTimeData = pagedData.value.map(item => item.correctPlanWorkTime);
  
  setOptions({
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      },
      formatter: (params) => {
        const idx = params[0].dataIndex;
        const item = pagedData.value[idx];
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
      bottom: 0,
      itemGap: 20,
      textStyle: {
        color: isDark.value ? "#e5e7eb" : "#4b5563",
        fontSize: 12
      }
    },
    grid: {
      top: 40,
      left: 20,
      right: 20,
      bottom: 60,
      containLabel: true
    },
    xAxis: [
      {
        type: "category",
        data: courseNames,
        axisTick: {
          alignWithLabel: true
        },
        axisLabel: {
          fontSize: 12,
          interval: 0,
          color: isDark.value ? "#e5e7eb" : "#4b5563",
          rotate: courseNames.length > 5 ? 30 : 0,
          // 自动换行：每行最多8个字
          formatter: (value: string) => {
            if (courseNames.length > 5) return value;
            const maxPerLine = 8;
            if (!value) return "";
            if (value.length <= maxPerLine) return value;
            const lines: string[] = [];
            for (let i = 0; i < value.length; i += maxPerLine) {
              lines.push(value.slice(i, i + maxPerLine));
            }
            return lines.join("\n");
          }
        },
        axisLine: {
          lineStyle: {
            color: isDark.value ? "#52525b" : "#e5e7eb"
          }
        }
      }
    ],
    yAxis: [
      {
        type: "value",
        name: "耗时(分钟)",
        nameTextStyle: {
          color: isDark.value ? "#e5e7eb" : "#4b5563",
          padding: [0, 0, 0, 40]
        },
        splitLine: {
          lineStyle: {
            color: isDark.value ? "#3f3f46" : "#f3f4f6",
            type: "dashed"
          }
        },
        axisLabel: {
          fontSize: 12,
          color: isDark.value ? "#e5e7eb" : "#4b5563"
        }
      }
    ],
    series: [
      {
        name: "备课耗时",
        type: "bar",
        barMaxWidth: 25,
        itemStyle: {
          color: "#5B8FF9",
          borderRadius: [4, 4, 0, 0]
        },
        data: planTimeData
      },
      {
        name: "备课修正耗时",
        type: "bar",
        barMaxWidth: 25,
        itemStyle: {
          color: "#F6BD16",
          borderRadius: [4, 4, 0, 0]
        },
        data: correctPlanTimeData
      },
      {
        name: "作业设计耗时",
        type: "bar",
        barMaxWidth: 25,
        itemStyle: {
          color: "#5AD8A6",
          borderRadius: [4, 4, 0, 0]
        },
        data: planWorkTimeData
      },
      {
        name: "作业设计修正耗时",
        type: "bar",
        barMaxWidth: 25,
        itemStyle: {
          color: "#E8684A",
          borderRadius: [4, 4, 0, 0]
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
      optimizeDirection: item.optimizeDirection,
      expectedEffect: item.expectedEffect,
      difficulty: item.difficulty
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
        <div class="flex flex-col gap-6">
          <!-- 筛选控制区域 -->
          <div v-if="efficientData.length" class="flex flex-col md:flex-row items-start md:items-center gap-6 p-6 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 dark:from-[#18181b] dark:to-[#27272a] rounded-2xl border border-indigo-100/50 dark:border-indigo-500/20 shadow-lg backdrop-blur-md">
            <div class="flex items-center gap-4 shrink-0">
              <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                <IconifyIconOnline icon="ep:filter" class="text-2xl" />
              </div>
              <div class="flex flex-col">
                <span class="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent uppercase tracking-wider text-glow">筛选分析课程</span>
                <span class="text-xs text-indigo-400 dark:text-indigo-300/60 font-medium mt-0.5">FILTER & ANALYSIS</span>
              </div>
            </div>
            
            <div class="hidden md:block h-12 w-[1px] bg-gradient-to-b from-transparent via-indigo-200/50 to-transparent dark:via-indigo-500/20 mx-2"></div>

            <div class="flex-1 w-full overflow-hidden">
              <el-checkbox-group v-model="selectedCourses" @change="handleCoursesChange" class="flex flex-wrap gap-x-10 gap-y-4">
                <el-checkbox 
                  v-for="(item, index) in efficientData" 
                  :key="index" 
                  :label="index"
                  size="large"
                >
                  <span class="text-base font-bold text-slate-700 dark:text-slate-200 hover:text-indigo-600 transition-colors">{{ item.courseName }}</span>
                </el-checkbox>
              </el-checkbox-group>
            </div>
          </div>

          <!-- 图表主体 -->
          <div class="relative bg-white/50 dark:bg-[#18181b] p-8 rounded-3xl border border-indigo-100/50 dark:border-indigo-500/10 shadow-sm">
            <div
              ref="chartRef"
              class="chart-container"
              style="width: 100%; height: 600px"
            ></div>
            
            <!-- 分页部件 -->
            <div v-if="totalFilteredData.length > pageSize" class="flex justify-center mt-6">
              <el-pagination
                v-model:current-page="currentPage"
                :page-size="pageSize"
                :total="totalFilteredData.length"
                layout="prev, pager, next"
                class="pure-pagination"
              />
            </div>
          </div>

          <!-- 智能建议板块 -->
          <div v-if="optimizeSuggestions.length" class="optimize-suggestions mt-4">
            <div class="flex items-center justify-between mb-6">
              <h3 class="flex items-center text-lg font-bold text-gray-800 dark:text-gray-200">
                <span class="w-2 h-6 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full mr-3"></span>
                AI 提效建议报告
              </h3>
              <el-button 
                type="primary" 
                plain 
                round 
                size="small"
                @click="showOptimizePanel = !showOptimizePanel"
              >
                {{ showOptimizePanel ? '关闭报告' : '展开报告' }}
              </el-button>
            </div>
            
            <el-collapse-transition>
              <div v-show="showOptimizePanel">
                <el-row :gutter="20" class="suggestion-row">
                  <el-col
                    v-for="(item, index) in pagedData"
                    :key="index"
                    :xs="24"
                    :sm="12"
                    :md="12"
                    class="mb-6"
                  >
                    <div class="suggestion-card-new p-5 h-full flex flex-col justify-between bg-white dark:bg-[#18181b] border border-slate-100 dark:border-gray-800">
                      <div>
                        <div class="flex items-center gap-2 mb-4">
                          <div class="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                            <IconifyIconOnline icon="ep:opportunity" />
                          </div>
                          <span class="font-bold text-gray-800 dark:text-gray-200 truncate">{{ item.courseName }}</span>
                        </div>
                        <p class="text-sm text-gray-500 dark:text-gray-400 line-clamp-4 leading-relaxed italic mb-4">
                          "{{ item.optimizeDirection }}"
                        </p>
                      </div>
                      <div class="flex justify-end pt-3 border-t border-gray-50 dark:border-gray-800 text-right">
                        <el-button 
                          type="primary" 
                          link 
                          size="small" 
                          class="group"
                          @click="showDetails(item)"
                        >
                          深度解析 
                          <IconifyIconOnline icon="ep:arrow-right" class="ml-1 transition-transform group-hover:translate-x-1" />
                        </el-button>
                      </div>
                    </div>
                  </el-col>
                </el-row>
              </div>
            </el-collapse-transition>
          </div>
        </div>

        <!-- 优化建议详情弹窗 -->
        <el-dialog
          v-model="dialogVisible"
          :title="selectedSuggestion?.courseName + ' 提效方案'"
          width="500px"
          destroy-on-close
          class="rounded-2xl"
          append-to-body
        >
          <div class="p-4">
            <div class="bg-indigo-50 dark:bg-indigo-500/10 rounded-xl p-5 border border-indigo-100 dark:border-indigo-500/20 mb-6">
              <h4 class="font-bold text-indigo-700 dark:text-indigo-400 flex items-center mb-2">
                <IconifyIconOnline icon="ep:magic-stick" class="mr-2" />
                AI 诊断核心方向
              </h4>
              <p class="text-indigo-600 dark:text-indigo-300 leading-relaxed">{{ selectedSuggestion?.optimizeDirection }}</p>
            </div>
            <div class="space-y-4">
              <div class="flex gap-3">
                <div class="text-emerald-500 mt-1"><IconifyIconOnline icon="ep:circle-check" /></div>
                <div>
                  <h5 class="text-sm font-bold text-gray-700 dark:text-gray-300">预期效果</h5>
                  <p class="text-xs text-gray-500 dark:text-gray-500">{{ selectedSuggestion?.expectedEffect || '暂无数据' }}</p>
                </div>
              </div>
              <div class="flex gap-3">
                <div class="text-amber-500 mt-1"><IconifyIconOnline icon="ep:warning" /></div>
                <div>
                  <h5 class="text-sm font-bold text-gray-700 dark:text-gray-300">执行难度</h5>
                  <p class="text-xs text-gray-500 dark:text-gray-500">{{ selectedSuggestion?.difficulty || '暂无数据' }}</p>
                </div>
              </div>
            </div>
          </div>
          <template #footer>
            <div class="px-6 pb-6">
              <el-button type="primary" class="w-full h-11 rounded-xl" @click="dialogVisible = false">
                我知道了
              </el-button>
            </div>
          </template>
        </el-dialog>
      </template>
    </el-skeleton>
  </div>
</template>

<style lang="scss" scoped>
.suggestion-card-new {
  border-radius: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
    transform: translateY(-2px);
  }
}

.text-glow {
  text-shadow: 0 0 10px rgba(37, 99, 235, 0.2);
}

:deep(.el-checkbox) {
  margin-right: 0;
  height: 32px;
}

:deep(.el-checkbox__label) {
  color: #64748b;
  font-weight: 500;
}

:deep(.el-checkbox.is-checked .el-checkbox__label) {
  color: #5B8FF9;
}

.line-clamp-4 {
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 4;
  overflow: hidden;
}

.chart-container {
  transition: all 0.3s ease;
}
</style>
