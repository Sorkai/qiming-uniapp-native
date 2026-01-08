<script setup lang="ts">
import { onMounted, ref, watch, computed, nextTick } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";
import { message } from "@/utils/message";
import { utils, writeFile } from "xlsx";
import {
  getCourseUsersProgress,
  getCourseUsersExamInfo
} from "@/api/statistics";
import { getCourseList } from "@/api/course";
import {
  ElPagination,
  ElSelect,
  ElOption,
  ElButton,
  ElRadioGroup,
  ElRadioButton
} from "element-plus";

interface CourseOption {
  value: number;
  label: string;
}

interface ExamOption {
  value: number;
  label: string;
  examId: number;
  examName: string;
}

const loading = ref(true);
const progressLoading = ref(false);
const examLoading = ref(false);
const courseOptions = ref<CourseOption[]>([]);
const examOptions = ref<ExamOption[]>([]);
const selectedCourse = ref<number>();
const selectedExam = ref<number>();

// 进度排序与分页
const progressSortOrder = ref<"none" | "asc" | "desc">("none");
const progressPage = ref(1);
const progressPageSize = ref(10);

// 缓存所有课程的数据
const allProgressData = ref<any[]>([]);
const allExamData = ref<any[]>([]);

const progressChartRef = ref();
const examChartRef = ref();

const { isDark } = useDark();
const theme = computed(() => (isDark.value ? "dark" : "light"));

const { setOptions: setProgressOptions } = useECharts(progressChartRef, {
  theme
});

const { setOptions: setExamOptions } = useECharts(examChartRef, {
  theme
});

const handleExport = () => {
  if (!selectedCourse.value) {
    message("请先选择课程", { type: "warning" });
    return;
  }

  const course = courseOptions.value.find(c => c.value === selectedCourse.value);
  const courseName = course?.label || "课程";

  // 1. 学生进度数据
  const progressData = sortedUsers.value.map(user => ({
    学生姓名: user.userName,
    "完成百分比(%)": user.progress
  }));

  // 2. 成绩分布数据
  const courseExamData = allExamData.value.filter(
    item => item.courseId === selectedCourse.value
  );

  const examRows = [];
  const levelTexts = { 1: "差", 2: "中等", 3: "良好", 4: "优秀" };

  courseExamData.forEach(exam => {
    exam.examInfo.forEach(info => {
      examRows.push({
        考核项目: exam.examName,
        成绩等级: levelTexts[info.level] || `等级${info.level}`,
        学生人数: info.levelNum
      });
    });
  });

  const wb = utils.book_new();
  const ws1 = utils.json_to_sheet(progressData);
  const ws2 = utils.json_to_sheet(examRows);

  utils.book_append_sheet(wb, ws1, "学生进度详情");
  utils.book_append_sheet(wb, ws2, "成绩分布统计");

  writeFile(wb, `${courseName}_分析报告_${new Date().getTime()}.xlsx`);
  message("导出分析报告成功", { type: "success" });
};

// 获取课程列表
const fetchCourseList = async () => {
  loading.value = true;
  try {
    const res = await getCourseList({ pageNum: 1, pageSize: 100 });
    if (res?.data?.courseList) {
      courseOptions.value = res.data.courseList.map(course => ({
        value: course.courseId,
        label: course.title
      }));

      if (courseOptions.value.length > 0) {
        selectedCourse.value = courseOptions.value[0].value;
      }
    }
  } catch (error) {
    console.error("获取课程列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 获取所有课程数据（只调用一次）
const fetchAllData = async () => {
  progressLoading.value = true;
  examLoading.value = true;
  try {
    // 并行请求三个接口（模拟增加作业和小测数据）
    const [progressRes, examRes] = await Promise.all([
      getCourseUsersProgress(),
      getCourseUsersExamInfo()
    ]);

    // 缓存所有课程的进度数据
    if (progressRes?.data?.courseUsersProgress) {
      allProgressData.value = progressRes.data.courseUsersProgress;
    }

    // 缓存所有课程的考试数据
    if (examRes?.data?.courseUsersExamInfoList) {
      // 模拟扩展：为每个考试数据添加类型标识
      allExamData.value = examRes.data.courseUsersExamInfoList.flatMap(item => {
        // 原始考试数据
        const exam = { ...item, type: "exam" };
        // 模拟生成作业数据
        const homework = {
          ...item,
          examId: item.examId + 1000,
          examName: item.examName.replace("考试", "作业"),
          type: "homework"
        };
        // 模拟生成小测数据
        const quiz = {
          ...item,
          examId: item.examId + 2000,
          examName: item.examName.replace("考试", "小测"),
          type: "quiz"
        };
        return [exam, homework, quiz];
      });
    }
  } catch (error) {
    console.error("获取课程数据失败:", error);
    renderEmptyProgressChart();
    renderEmptyExamChart();
  } finally {
    progressLoading.value = false;
    examLoading.value = false;
    if (selectedCourse.value) {
      nextTick(() => {
        renderCourseData(selectedCourse.value);
      });
    }
  }
};

// 根据选择的课程ID渲染对应的数据
const renderCourseData = (courseId: number) => {
  try {
    // 从缓存中查找对应课程的进度数据
    const progressData = allProgressData.value.find(
      item => item.courseId === courseId
    );
    if (progressData) {
      renderProgressChart(progressData);
    } else {
      renderEmptyProgressChart("该课程暂无学生进度数据");
    }

    // 从缓存中查找对应课程的所有考试数据
    const courseExamData = allExamData.value.filter(
      item => item.courseId === courseId
    );
    if (courseExamData && courseExamData.length > 0) {
      // 更新考试选项
      examOptions.value = courseExamData.map(item => ({
        value: item.examId,
        label: item.examName,
        examId: item.examId,
        examName: item.examName
      }));

      // 默认选择第一个考试
      if (examOptions.value.length > 0) {
        selectedExam.value = examOptions.value[0].value;
        const selectedExamData = courseExamData.find(
          item => item.examId === selectedExam.value
        );
        if (selectedExamData) {
          renderExamChart(selectedExamData);
        }
      }
    } else {
      examOptions.value = [];
      selectedExam.value = undefined;
      renderEmptyExamChart("该课程暂无考试成绩数据");
    }
  } catch (error) {
    console.error("渲染课程数据失败:", error);
    renderEmptyProgressChart();
    renderEmptyExamChart();
  } finally {
    progressLoading.value = false;
    examLoading.value = false;
  }
};

// 根据选择的考试渲染考试图表
const renderSelectedExamChart = (examId: number) => {
  if (!selectedCourse.value || !examId) return;

  const courseExamData = allExamData.value.filter(
    item => item.courseId === selectedCourse.value
  );
  const selectedExamData = courseExamData.find(item => item.examId === examId);

  if (selectedExamData) {
    renderExamChart(selectedExamData);
  } else {
    renderEmptyExamChart("该考试暂无成绩数据");
  }
};

// 获取当前选中课程的全部学生进度
const currentCourseUsers = computed(() => {
  if (!selectedCourse.value) return [];
  const courseData = allProgressData.value.find(
    item => item.courseId === selectedCourse.value
  );
  return courseData?.usersProgress || [];
});

// 排序后的学生数据
const sortedUsers = computed(() => {
  const users = [...currentCourseUsers.value];
  if (progressSortOrder.value === "asc") {
    return users.sort((a, b) => Number(a.progress) - Number(b.progress));
  } else if (progressSortOrder.value === "desc") {
    return users.sort((a, b) => Number(b.progress) - Number(a.progress));
  }
  return users;
});

// 分页后的学生数据
const pagedUsers = computed(() => {
  const start = (progressPage.value - 1) * progressPageSize.value;
  return sortedUsers.value.slice(start, start + progressPageSize.value);
});

// 监听状态变化重新渲染图表
watch([pagedUsers, progressSortOrder], () => {
  if (progressLoading.value) return;
  if (pagedUsers.value.length > 0) {
    updateProgressChart(pagedUsers.value);
  } else {
    renderEmptyProgressChart("暂无数据");
  }
});

// 渲染学生进度图表（改名为 updateProgressChart，接收已处理的数据）
const updateProgressChart = users => {
  const userNames = users.map(user => user.userName);
  const progressData = users.map(user => user.progress);

  setProgressOptions({
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    grid: {
      left: 20,
      right: 60, // 增加右侧间距以显示百分比文字
      top: 20,
      bottom: 20,
      containLabel: true
    },
    xAxis: {
      type: "value",
      name: "完成进度(%)",
      max: 100,
      axisLabel: {
        formatter: "{value}%",
        color: isDark.value ? "#e5e7eb" : "#4b5563"
      },
      splitLine: {
        lineStyle: {
          color: isDark.value ? "#3f3f46" : "#f3f4f6",
          type: "dashed"
        }
      }
    },
    yAxis: {
      type: "category",
      data: userNames,
      axisLabel: {
        fontSize: 12,
        color: isDark.value ? "#e5e7eb" : "#4b5563"
      },
      axisLine: {
        lineStyle: {
          color: isDark.value ? "#52525b" : "#e5e7eb"
        }
      }
    },
    series: [
      {
        name: "完成进度",
        type: "bar",
        data: progressData,
        barMaxWidth: 24,
        label: {
          show: true,
          position: "right",
          formatter: "{c}%",
          color: isDark.value ? "#e5e7eb" : "#4b5563",
          fontWeight: "bold"
        },
        itemStyle: {
          color: function (params) {
            const progress = params.value as number;
            if (progress < 30) return "#E8684A";
            if (progress < 70) return "#F6BD16";
            return "#5B8FF9";
          },
          borderRadius: [0, 6, 6, 0]
        }
      }
    ]
  });
};

// 保持原有的 renderProgressChart 逻辑以初始化加载
const renderProgressChart = courseData => {
  progressPage.value = 1; // 切换课程时重置页码
  if (!courseData.usersProgress || courseData.usersProgress.length === 0) {
    renderEmptyProgressChart("该课程暂无学生进度数据");
    return;
  }
  updateProgressChart(pagedUsers.value);
};

// 渲染空的进度图表
const renderEmptyProgressChart = (message = "暂无课程进度数据") => {
  setProgressOptions({
    title: {
      text: message,
      left: "center",
      top: "center",
      textStyle: {
        color: isDark.value ? "#52525b" : "#9ca3af",
        fontSize: 14,
        fontWeight: "normal"
      }
    },
    xAxis: { show: false },
    yAxis: { show: false },
    series: []
  });
};

// 渲染考试成绩图表
const renderExamChart = courseData => {
  // 如果没有考试信息或者考试信息为空数组，显示空图表
  if (!courseData.examInfo || courseData.examInfo.length === 0) {
    renderEmptyExamChart("该课程暂无考试成绩数据");
    return;
  }

  // 转换等级为文字说明
  const levelTexts = {
    1: "差",
    2: "中等",
    3: "良好",
    4: "优秀"
  };

  const levels = courseData.examInfo.map(
    item => levelTexts[item.level] || `等级${item.level}`
  );
  const counts = courseData.examInfo.map(item => item.levelNum);

  setExamOptions({
    title: {
      text: courseData.examName,
      left: "center",
      top: 0,
      textStyle: {
        fontSize: 14,
        color: isDark.value ? "#e5e7eb" : "#4b5563"
      }
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}人 ({d}%)"
    },
    legend: {
      bottom: 0,
      itemGap: 15,
      data: levels,
      textStyle: {
        color: isDark.value ? "#e5e7eb" : "#4b5563"
      }
    },
    series: [
      {
        name: "成绩分布",
        type: "pie",
        radius: ["40%", "65%"],
        center: ["50%", "50%"],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 8,
          borderColor: isDark.value ? "#1d1e1f" : "#fff",
          borderWidth: 2
        },
        data: levels.map((level, index) => ({
          name: level,
          value: counts[index],
          itemStyle: {
            color: [
              "#E8684A", 
              "#F6BD16", 
              "#5B8FF9", 
              "#5AD8A6"
            ][index % 4]
          }
        })),
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: "rgba(0, 0, 0, 0.5)"
          }
        },
        label: {
          show: true,
          formatter: "{b}: {c}人",
          color: isDark.value ? "#e5e7eb" : "#4b5563"
        },
        labelLine: {
          show: true,
          lineStyle: {
            color: isDark.value ? "#52525b" : "#e5e7eb"
          }
        }
      }
    ]
  });
};

// 渲染空的考试图表
const renderEmptyExamChart = (message = "暂无考试成绩数据") => {
  setExamOptions({
    title: {
      text: message,
      left: "center",
      top: "center",
      textStyle: {
        color: isDark.value ? "#52525b" : "#9ca3af",
        fontSize: 14,
        fontWeight: "normal"
      }
    },
    series: []
  });
};

// 课程变化时从缓存中渲染对应数据
watch(
  () => selectedCourse.value,
  newCourseId => {
    if (
      newCourseId &&
      (allProgressData.value.length > 0 || allExamData.value.length > 0)
    ) {
      renderCourseData(newCourseId);
    }
  }
);

// 考试变化时重新渲染考试图表
watch(
  () => selectedExam.value,
  newExamId => {
    if (newExamId) {
      renderSelectedExamChart(newExamId);
    }
  }
);

onMounted(() => {
  fetchCourseList();
  fetchAllData();
});
</script>

<template>
  <div class="w-full">
    <el-skeleton :loading="loading" animated :rows="1">
      <template #default>
        <div class="flex flex-col gap-6">
          <div class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 bg-gradient-to-br from-indigo-50/60 to-purple-50/40 dark:from-indigo-500/10 dark:to-purple-500/5 rounded-2xl border border-indigo-100/50 dark:border-indigo-500/20 shadow-lg backdrop-blur-md">
            <div class="flex flex-col md:flex-row items-start md:items-center gap-6 flex-1 w-full">
              <div class="flex items-center gap-4 shrink-0">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30">
                  <IconifyIconOnline icon="ep:trend-charts" class="text-2xl" />
                </div>
                <div class="flex flex-col">
                  <span class="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent uppercase tracking-wider text-glow">分析课程数据</span>
                  <span class="text-xs text-indigo-400 dark:text-indigo-300/60 font-medium mt-0.5">STATISTICS & GROWTH</span>
                </div>
              </div>
              
              <div class="hidden md:block h-12 w-[1px] bg-gradient-to-b from-transparent via-indigo-200/50 to-transparent dark:via-indigo-500/20 mx-2"></div>

              <div class="flex items-center gap-3 flex-1 w-full max-lg:max-w-none max-w-lg">
                <el-select
                  v-model="selectedCourse"
                  placeholder="请选择需要分析的课程"
                  size="large"
                  class="w-full custom-select-high"
                  :disabled="courseOptions.length === 0"
                >
                  <template #prefix>
                    <IconifyIconOnline icon="ep:reading" class="text-indigo-500" />
                  </template>
                  <el-option
                    v-for="item in courseOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </div>

            <div class="flex items-center gap-3 shrink-0 self-end md:self-auto">
              <el-button 
                color="#6366f1" 
                size="large"
                class="!rounded-xl shadow-md shadow-indigo-200/50 dark:shadow-none hover:translate-y-[-2px] transition-all" 
                @click="fetchAllData"
              >
                <template #icon>
                  <IconifyIconOnline icon="ep:refresh" />
                </template>
                刷新
              </el-button>
              <el-button
                type="primary"
                size="large"
                class="!rounded-xl shadow-md shadow-indigo-200/50 dark:shadow-none hover:translate-y-[-2px] transition-all"
                @click="handleExport"
              >
                <template #icon>
                  <IconifyIconOnline icon="ep:download" />
                </template>
                导出分析报告
              </el-button>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 mt-4">
            <!-- 课程进度图表 -->
            <div 
              v-loading="progressLoading"
              class="relative bg-white dark:bg-indigo-500/5 p-6 rounded-3xl border border-gray-100 dark:border-indigo-500/10 shadow-sm transition-all hover:shadow-md"
            >
              <div class="flex justify-between items-center mb-6 px-2">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <IconifyIconOnline icon="ep:user" />
                  </div>
                  <span class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
                    学生个人进度报告
                  </span>
                </div>
                <div class="flex items-center gap-4">
                  <div class="flex items-center gap-2 px-2 py-1 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-100 dark:border-gray-700">
                    <span class="text-xs text-gray-500 font-medium">排序:</span>
                    <el-radio-group v-model="progressSortOrder" size="small" class="custom-radio-group">
                      <el-radio-button label="none">默认</el-radio-button>
                      <el-radio-button label="desc">进度降序</el-radio-button>
                      <el-radio-button label="asc">进度升序</el-radio-button>
                    </el-radio-group>
                  </div>
                </div>
              </div>
              <div
                ref="progressChartRef"
                class="chart-container"
                style="width: 100%; height: 550px"
              ></div>
              <!-- 学生进度分页器 -->
              <div v-if="sortedUsers.length > progressPageSize" class="mt-6 flex justify-center">
                <el-pagination
                  v-model:current-page="progressPage"
                  :page-size="progressPageSize"
                  :total="sortedUsers.length"
                  layout="prev, pager, next"
                  class="pure-pagination"
                />
              </div>
            </div>

            <!-- 考试成绩图表 -->
            <div 
              v-loading="examLoading"
              class="relative bg-white dark:bg-indigo-500/5 p-6 rounded-3xl border border-gray-100 dark:border-indigo-500/10 shadow-sm transition-all hover:shadow-md"
            >
              <div class="flex justify-between items-center mb-6 px-2">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                    <IconifyIconOnline icon="ep:document-checked" />
                  </div>
                  <span class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center">
                    成绩分布深度分析
                  </span>
                </div>
                <div class="flex items-center gap-2">
                  <el-select
                    v-model="selectedExam"
                    placeholder="选择考试"
                    size="small"
                    style="width: 140px"
                    class="custom-select"
                    :disabled="examOptions.length === 0"
                  >
                    <el-option
                      v-for="item in examOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                </div>
              </div>
              <div
                ref="examChartRef"
                class="chart-container"
                style="width: 100%; height: 550px"
              ></div>
            </div>
          </div>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>


<style scoped>
.text-glow {
  text-shadow: 0 0 10px rgba(99, 102, 241, 0.2);
}

:deep(.custom-select-high) {
  .el-input__wrapper {
    background-color: rgba(255, 255, 255, 0.8) !important;
    backdrop-filter: blur(4px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.08) !important;
    border-radius: 12px !important;
    padding: 2px 12px;
    transition: all 0.3s;

    &:hover,
    &.is-focus {
      box-shadow: 0 4px 15px rgba(99, 102, 241, 0.15) !important;
    }
  }

  .el-input__inner {
    font-weight: 600;
  }
}

.chart-container {
  transition: all 0.3s ease;
}

:deep(.el-select) {
  --el-select-input-focus-border-color: #4f46e5;
}
</style>
