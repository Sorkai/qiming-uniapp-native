<script setup lang="ts">
import { onMounted, ref, watch, computed } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";
import {
  getCourseUsersProgress,
  getCourseUsersExamInfo
} from "@/api/statistics";
import { getCourseList } from "@/api/course";

defineOptions({
  name: "CourseStatistics"
});

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
    // 并行请求两个接口
    const [progressRes, examRes] = await Promise.all([
      getCourseUsersProgress(),
      getCourseUsersExamInfo()
    ]);

    // 缓存所有课程的进度数据
    if (progressRes?.data?.courseUsersProgress) {
      allProgressData.value = progressRes.data.courseUsersProgress;
      console.log("所有课程进度数据:", allProgressData.value);
    }

    // 缓存所有课程的考试数据 - 修复数据结构
    if (examRes?.data?.courseUsersExamInfo) {
      allExamData.value = examRes.data.courseUsersExamInfo;
      console.log("所有课程考试数据:", allExamData.value);
    }

    // 如果已经选择了课程，则渲染对应课程的数据
    if (selectedCourse.value) {
      renderCourseData(selectedCourse.value);
    }
  } catch (error) {
    console.error("获取课程数据失败:", error);
    renderEmptyProgressChart();
    renderEmptyExamChart();
  } finally {
    progressLoading.value = false;
    examLoading.value = false;
  }
};

// 根据选择的课程ID渲染对应的数据
const renderCourseData = (courseId: number) => {
  progressLoading.value = true;
  examLoading.value = true;

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

// 渲染学生进度图表
const renderProgressChart = courseData => {
  // 如果没有学生数据或者学生数据为空数组，显示空图表
  if (!courseData.usersProgress || courseData.usersProgress.length === 0) {
    renderEmptyProgressChart("该课程暂无学生进度数据");
    return;
  }

  const userNames = courseData.usersProgress.map(user => user.userName);
  const progressData = courseData.usersProgress.map(user => user.progress);

  setProgressOptions({
    tooltip: {
      trigger: "axis",
      axisPointer: {
        type: "shadow"
      }
    },
    grid: {
      left: 80,
      right: 100,
      top: 20,
      bottom: 60
    },
    xAxis: {
      type: "value",
      name: "完成进度(%)",
      max: 100,
      axisLabel: {
        formatter: "{value}%"
      }
    },
    yAxis: {
      type: "category",
      data: userNames,
      axisLabel: {
        fontSize: "0.75rem",
        formatter: function (value) {
          // 显示完整名字，不截断
          return value;
        }
      }
    },
    series: [
      {
        name: "完成进度",
        type: "bar",
        data: progressData,
        label: {
          show: true,
          position: "right",
          formatter: "{c}%"
        },
        itemStyle: {
          color: function (params) {
            const progress = params.value;
            if (progress < 30) return "#e85f33"; // 使用橙色表示低进度
            if (progress < 70) return "#f39c12"; // 黄色表示中等进度
            return "#41b6ff"; // 使用蓝色表示高进度
          },
          borderRadius: [0, 10, 10, 0] // 统一圆角风格
        }
      }
    ]
  });
};

// 渲染空的进度图表
const renderEmptyProgressChart = (message = "暂无课程进度数据") => {
  setProgressOptions({
    title: {
      text: message,
      left: "center",
      top: "center"
    },
    xAxis: {
      type: "value",
      show: false
    },
    yAxis: {
      type: "category",
      show: false
    },
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
        fontSize: 14
      }
    },
    tooltip: {
      trigger: "item",
      formatter: "{b}: {c}人 ({d}%)"
    },
    legend: {
      bottom: 0,
      data: levels
    },
    series: [
      {
        name: "成绩分布",
        type: "pie",
        radius: ["40%", "70%"], // 改为环形图风格
        center: ["50%", "50%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10, // 统一圆角风格
          borderColor: isDark.value ? "#1d1e1f" : "#fff",
          borderWidth: 2
        },
        data: levels.map((level, index) => ({
          name: level,
          value: counts[index],
          itemStyle: {
            color: [
              "#e85f33", // 差 - 橙色
              "#f39c12", // 中等 - 黄色
              "#41b6ff", // 良好 - 蓝色
              "#27ae60" // 优秀 - 绿色
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
          formatter: "{b}: {c}人 ({d}%)"
        },
        labelLine: {
          show: true
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
      top: "center"
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
        <div class="mb-4">
          <el-select
            v-model="selectedCourse"
            placeholder="请选择课程"
            class="w-64"
            :disabled="courseOptions.length === 0"
          >
            <el-option
              v-for="item in courseOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <!-- 课程进度图表 -->
          <el-card shadow="never">
            <template #header>
              <div class="flex justify-between items-center">
                <span class="font-medium">学生课程进度</span>
                <el-tag size="small" v-if="progressLoading">加载中...</el-tag>
              </div>
            </template>
            <el-skeleton :loading="progressLoading" animated :rows="5">
              <template #default>
                <div
                  ref="progressChartRef"
                  style="width: 100%; height: 300px"
                ></div>
              </template>
            </el-skeleton>
          </el-card>

          <!-- 考试成绩图表 -->
          <el-card shadow="never">
            <template #header>
              <div class="flex justify-between items-center">
                <span class="font-medium">学生考试成绩</span>
                <div class="flex items-center gap-2">
                  <el-select
                    v-model="selectedExam"
                    placeholder="请选择考试"
                    size="small"
                    style="width: 120px"
                    :disabled="examOptions.length === 0"
                  >
                    <el-option
                      v-for="item in examOptions"
                      :key="item.value"
                      :label="item.label"
                      :value="item.value"
                    />
                  </el-select>
                  <el-tag size="small" v-if="examLoading">加载中...</el-tag>
                </div>
              </div>
            </template>
            <el-skeleton :loading="examLoading" animated :rows="5">
              <template #default>
                <div
                  ref="examChartRef"
                  style="width: 100%; height: 300px"
                ></div>
              </template>
            </el-skeleton>
          </el-card>
        </div>
      </template>
    </el-skeleton>
  </div>
</template>
