<script setup lang="ts">
import { onMounted, ref, watch, computed, nextTick } from "vue";
import { useDark, useECharts } from "@pureadmin/utils";
import { message } from "@/utils/message";
import ClipboardIcon from "@/assets/new-release/clipboard-note-document-report-paper-list-data-svgrepo-com.svg?component";
import { utils, writeFile } from "xlsx";
import {
  getCourseUsersProgress,
  getCourseUsersExamInfo
} from "@/api/statistics";
import { getCourseList } from "@/api/course";
import { getHomeworkList } from "@/api/homework";
import { getExamList } from "@/api/exam";
import { isAdmin } from "@/utils/auth";
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

// 用于强制重新渲染图表的 key
const progressChartKey = ref(0);
const examChartKey = ref(0);

const { setOptions: setProgressOptions } = useECharts(progressChartRef, {
  theme,
  renderer: "svg" // 使用 SVG 渲染器，在 Safari 和 Firefox 上更稳定
});

const { setOptions: setExamOptions } = useECharts(examChartRef, {
  theme,
  renderer: "svg"
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
    } else {
      console.warn("课程列表为空或格式不正确:", res);
    }
  } catch (error) {
    console.error("获取课程列表失败:", error);
  } finally {
    loading.value = false;
  }
};

// 获取所有课程数据（每次进入调用）
const fetchAllData = async () => {
  progressLoading.value = true;
  examLoading.value = true;
  try {
    // 分开处理，防止一个接口失败导致全部失败
    const [progressRes, examRes, homeworkRes, examListRes] = await Promise.allSettled([
      getCourseUsersProgress(),
      getCourseUsersExamInfo(),
      getHomeworkList({ pageNum: 1, pageSize: 1000 }),
      getExamList({ pageNum: 1, pageSize: 1000 })
    ]);


    // 缓存所有课程的进度数据
    if (progressRes.status === "fulfilled") {
      
      // 尝试多种可能的数据路径
      let progressData = null;
      if (progressRes.value?.data?.courseUsersProgress) {
        progressData = progressRes.value.data.courseUsersProgress;
      } else if (progressRes.value?.data?.list) {
        progressData = progressRes.value.data.list;
      } else if (progressRes.value?.data && Array.isArray(progressRes.value.data)) {
        progressData = progressRes.value.data;
      } else if (progressRes.value?.list) {
        progressData = progressRes.value.list;
      } else if (Array.isArray(progressRes.value)) {
        progressData = progressRes.value;
      }
      
      
      if (Array.isArray(progressData) && progressData.length > 0) {
        allProgressData.value = progressData;
      } else {
        console.warn("进度数据为空或格式不正确");
        allProgressData.value = [];
      }
    } else if (progressRes.status === "rejected") {
      console.error("获取进度数据失败:", progressRes.reason);
      allProgressData.value = [];
    }

    // 获取作业列表数据
    let homeworkList: any[] = [];
    if (homeworkRes.status === "fulfilled" && homeworkRes.value?.data?.homeworkList) {
      homeworkList = homeworkRes.value.data.homeworkList;
    }

    // 获取考试列表数据
    let examList: any[] = [];
    if (examListRes.status === "fulfilled" && examListRes.value?.data?.examList) {
      examList = examListRes.value.data.examList;
    }

    // 缓存所有课程的考试/作业成绩数据
    if (examRes.status === "fulfilled") {
      
      // 尝试多种可能的数据路径
      let examData = null;
      if (examRes.value?.data?.courseUsersExamInfoList) {
        examData = examRes.value.data.courseUsersExamInfoList;
      } else if (examRes.value?.data?.list) {
        examData = examRes.value.data.list;
      } else if (examRes.value?.data && Array.isArray(examRes.value.data)) {
        examData = examRes.value.data;
      } else if (examRes.value?.list) {
        examData = examRes.value.list;
      } else if (Array.isArray(examRes.value)) {
        examData = examRes.value;
      }
      
      
      if (Array.isArray(examData) && examData.length > 0) {
        // 使用真实的考试成绩数据
        allExamData.value = examData.map(item => ({
          ...item,
          type: "exam"
        }));
      } else {
        console.warn("考试成绩数据为空或格式不正确，尝试从作业和考试列表获取");
        // 从作业和考试列表构建数据（使用真实数据，不是模拟数据）
        const combinedData: any[] = [];
        
        // 从作业列表构建数据 - 使用真实的作业信息
        if (homeworkList.length > 0) {
        }
        
        // 按课程分组作业数据
        const homeworkByCourse = new Map<number, any[]>();
        homeworkList.forEach(hw => {
          if (!homeworkByCourse.has(hw.courseId)) {
            homeworkByCourse.set(hw.courseId, []);
          }
          homeworkByCourse.get(hw.courseId)?.push(hw);
        });
        
        // 为每个作业创建条目（即使没有成绩统计数据也添加，以便在下拉框中显示）
        homeworkList.forEach(hw => {
          combinedData.push({
            courseId: hw.courseId,
            courseName: hw.courseName,
            examId: hw.homeworkId,
            examName: `[作业] ${hw.title || "未命名作业"}`,
            type: "homework",
            // 保留基本信息字段，用于在没有成绩分布时展示
            questionNum: hw.questionNum,
            totalPoints: hw.totalPoints,
            // 如果有成绩统计数据则使用，否则使用空数组
            examInfo: hw.scoreDistribution || hw.examInfo || []
          });
        });
        
        // 从考试列表构建数据 - 使用真实的考试信息
        if (examList.length > 0) {
        }
        
        // 为每个考试创建条目（即使没有成绩统计数据也添加）
        examList.forEach(exam => {
          combinedData.push({
            courseId: exam.courseId,
            courseName: exam.courseName,
            examId: exam.examId,
            examName: `[考试] ${exam.title || "未命名考试"}`,
            type: "exam",
            // 保留基本信息字段，用于在没有成绩分布时展示
            questionNum: exam.questionNum,
            totalPoints: exam.totalPoints,
            timeLimit: exam.timeLimit,
            // 如果有成绩统计数据则使用，否则使用空数组
            examInfo: exam.scoreDistribution || exam.examInfo || []
          });
        });
        
        allExamData.value = combinedData;
        if (combinedData.length > 0) {
        }
      }
    } else if (examRes.status === "rejected") {
      console.error("获取考试数据失败:", examRes.reason);
      allExamData.value = [];
    }
  } catch (error) {
    console.error("获取课程数据中发生错误:", error);
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
      item => Number(item.courseId) === Number(courseId)
    );
    if (progressData) {
      renderProgressChart(progressData);
    } else {
      renderEmptyProgressChart("该课程暂无学生进度数据");
    }

    // 从缓存中查找对应课程的所有考试数据
    const courseExamData = allExamData.value.filter(
      item => Number(item.courseId) === Number(courseId)
    );
    if (courseExamData.length > 0) {
    }
    
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
          item => Number(item.examId) === Number(selectedExam.value)
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
    item => Number(item.courseId) === Number(selectedCourse.value)
  );
  const selectedExamData = courseExamData.find(
    item => Number(item.examId) === Number(examId)
  );

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
    item => Number(item.courseId) === Number(selectedCourse.value)
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
const updateProgressChart = async users => {
  // 确保 DOM 已更新
  await nextTick();
  
  // 确保图表容器存在
  if (!progressChartRef.value) {
    console.warn("进度图表容器不存在，等待 DOM 渲染...");
    return;
  }
  
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
          color: isDark.value ? "#cbd5e1" : "#64748b"
        },
        splitLine: {
          lineStyle: {
            color: isDark.value ? "#475569" : "#f1f5f9",
            type: "dashed"
          }
        }
      },
      yAxis: {
        type: "category",
        data: userNames,
        axisLabel: {
          fontSize: 12,
          color: isDark.value ? "#fafafa" : "#475569"
        },
        axisLine: {
          lineStyle: {
            color: isDark.value ? "#475569" : "#e5e7eb"
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
          color: isDark.value ? "#ffffff" : "#4b5563",
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
  // 直接使用传入的数据进行渲染，避免 computed 属性的时序问题
  const usersToRender = courseData.usersProgress.slice(0, progressPageSize.value);
  if (usersToRender.length > 0) {
    updateProgressChart(usersToRender);
  } else {
    renderEmptyProgressChart("该课程暂无学生进度数据");
  }
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
const renderExamChart = async courseData => {
  // 确保 DOM 已更新
  await nextTick();
  
  // 确保图表容器存在
  if (!examChartRef.value) {
    console.warn("考试图表容器不存在，等待 DOM 渲染...");
    return;
  }
  
  
  // 如果有成绩分布数据，显示饼图
  if (courseData.examInfo && courseData.examInfo.length > 0) {
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
        top: 10,
        textStyle: {
          fontSize: 16,
          fontWeight: "bold",
          color: isDark.value ? "#ffffff" : "#1e293b"
        }
      },
      tooltip: {
        trigger: "item",
        formatter: "{b}: {c}人 ({d}%)"
      },
      legend: {
        bottom: "5%",
        itemGap: 20,
        data: levels,
        textStyle: {
          color: isDark.value ? "#fafafa" : "#334155",
          fontSize: 13
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
            borderRadius: 12,
            borderColor: isDark.value ? "#1d1e1f" : "#fff",
            borderWidth: 4
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
            color: isDark.value ? "#ffffff" : "#334155",
            fontSize: 12,
            fontWeight: 500
          },
          labelLine: {
            show: true,
            lineStyle: {
              color: isDark.value ? "#cbd5e1" : "#cbd5e1"
            }
          }
        }
      ]
    });
    return;
  }

  // 如果没有成绩分布数据，但有基本信息（questionNum, totalPoints），显示基本信息图表
  if (courseData.questionNum !== undefined || courseData.totalPoints !== undefined) {
    const chartData = [];
    const colors = ["#5B8FF9", "#5AD8A6", "#F6BD16", "#E8684A"];
    
    if (courseData.questionNum !== undefined && courseData.questionNum > 0) {
      chartData.push({
        name: "题目数量",
        value: courseData.questionNum,
        itemStyle: { color: colors[0] }
      });
    }
    if (courseData.totalPoints !== undefined && courseData.totalPoints > 0) {
      chartData.push({
        name: "总分",
        value: courseData.totalPoints,
        itemStyle: { color: colors[1] }
      });
    }
    if (courseData.timeLimit !== undefined && courseData.timeLimit > 0) {
      chartData.push({
        name: "时限(分钟)",
        value: courseData.timeLimit,
        itemStyle: { color: colors[2] }
      });
    }

    if (chartData.length > 0) {
      setExamOptions({
        title: {
          text: courseData.examName,
          subtext: "基本信息统计",
          left: "center",
          top: 10,
          textStyle: {
            fontSize: 16,
            fontWeight: "bold",
            color: isDark.value ? "#ffffff" : "#1e293b"
          },
          subtextStyle: {
            fontSize: 12,
            color: isDark.value ? "#94a3b8" : "#64748b"
          }
        },
        tooltip: {
          trigger: "axis",
          axisPointer: {
            type: "shadow"
          }
        },
        grid: {
          left: 20,
          right: 40,
          top: 80,
          bottom: 40,
          containLabel: true
        },
        xAxis: {
          type: "category",
          data: chartData.map(item => item.name),
          axisLabel: {
            color: isDark.value ? "#cbd5e1" : "#64748b",
            fontSize: 13
          },
          axisLine: {
            lineStyle: {
              color: isDark.value ? "#475569" : "#e5e7eb"
            }
          }
        },
        yAxis: {
          type: "value",
          axisLabel: {
            color: isDark.value ? "#cbd5e1" : "#64748b"
          },
          splitLine: {
            lineStyle: {
              color: isDark.value ? "#475569" : "#f1f5f9",
              type: "dashed"
            }
          }
        },
        series: [
          {
            name: "数值",
            type: "bar",
            data: chartData,
            barMaxWidth: 60,
            label: {
              show: true,
              position: "top",
              color: isDark.value ? "#ffffff" : "#4b5563",
              fontWeight: "bold",
              fontSize: 14
            },
            itemStyle: {
              borderRadius: [6, 6, 0, 0]
            }
          }
        ]
      });
      return;
    }
  }

  // 如果什么数据都没有，显示空图表
  renderEmptyExamChart("该考试暂无成绩数据");
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
    if (newCourseId) {
      // 无论是否有数据都尝试渲染，renderCourseData 会处理空数据情况
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

// 监听主题变化，使用 key 机制强制重新渲染图表
watch(
  () => isDark.value,
  async () => {
    // 强制重新渲染图表容器（通过改变 key 让 Vue 销毁并重建 DOM 元素）
    progressChartKey.value++;
    examChartKey.value++;
    
    // 等待 DOM 更新和 CSS 动画完成
    await nextTick();
    setTimeout(() => {
      if (!loading.value && selectedCourse.value) {
        // 重新渲染进度图表
        if (pagedUsers.value.length > 0) {
          updateProgressChart(pagedUsers.value);
        } else {
          renderEmptyProgressChart();
        }
        // 重新渲染考试图表
        if (selectedExam.value) {
          renderSelectedExamChart(selectedExam.value);
        }
      }
    }, 300); // 延时确保 CSS 动画完成
  }
);

// 监听 loading 状态变化，确保图表在 DOM 渲染后初始化
watch(
  () => loading.value,
  async (newLoading, oldLoading) => {
    if (oldLoading && !newLoading && selectedCourse.value) {
      // loading 从 true 变为 false，DOM 已渲染，重新渲染图表
      await nextTick();
      renderCourseData(selectedCourse.value);
    }
  }
);

onMounted(async () => {
  // 先获取课程列表，再获取统计数据
  await fetchCourseList();
  await fetchAllData();
  
  // 确保在数据加载完成后渲染
  if (selectedCourse.value) {
    nextTick(() => {
      renderCourseData(selectedCourse.value);
    });
  }
});
</script>

<template>
  <div class="w-full">
    <el-skeleton :loading="loading" animated :rows="1">
      <template #default>
        <div class="flex flex-col gap-6">
          <div
            class="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 bg-gradient-to-br from-blue-50/60 to-sky-50/40 dark:from-[var(--el-bg-color-overlay)] dark:to-[var(--el-bg-color-overlay)] rounded-2xl border border-blue-100/50 dark:border-blue-500/20 shadow-lg backdrop-blur-md"
          >
            <div
              class="flex flex-col md:flex-row items-start md:items-center gap-6 flex-1 w-full"
            >
              <div class="flex items-center gap-4 shrink-0">
                <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                  <ClipboardIcon class="w-6 h-6" />
                </div>
                <div class="flex flex-col">
                  <span class="text-xl font-black bg-gradient-to-r from-blue-600 to-sky-600 bg-clip-text text-transparent uppercase tracking-wider text-glow">分析课程数据</span>
                  <span class="text-xs text-blue-400 dark:text-blue-300/60 font-medium mt-0.5">STATISTICS & GROWTH</span>
                </div>
              </div>
              
              <div class="hidden md:block h-12 w-[1px] bg-gradient-to-b from-transparent via-blue-200/50 to-transparent dark:via-blue-500/20 mx-2"></div>

              <div class="flex items-center gap-3 flex-1 w-full max-lg:max-w-none max-w-lg">
                <el-select
                  v-model="selectedCourse"
                  placeholder="请选择需要分析的课程"
                  size="large"
                  class="w-full custom-select-high"
                  :disabled="courseOptions.length === 0"
                >
                  <template #prefix>
                    <IconifyIconOnline icon="ep:reading" class="text-blue-500" />
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
                class="!rounded-xl shadow-md shadow-blue-200/50 dark:shadow-none hover:translate-y-[-2px] transition-all" 
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
                class="!rounded-xl shadow-md shadow-blue-200/50 dark:shadow-none hover:translate-y-[-2px] transition-all"
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
              class="relative bg-white dark:bg-[var(--el-bg-color-overlay)] p-6 rounded-3xl border border-gray-100 dark:border-blue-500/10 shadow-sm transition-all hover:shadow-md"
            >
              <div class="flex justify-between items-center mb-6 px-2">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
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
                :key="progressChartKey"
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
              class="relative bg-white dark:bg-[var(--el-bg-color-overlay)] p-6 rounded-3xl border border-gray-100 dark:border-blue-500/10 shadow-sm transition-all hover:shadow-md"
            >
              <div class="flex justify-between items-center mb-6 px-2">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-blue-400">
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
                :key="examChartKey"
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
  text-shadow: 0 0 10px rgba(37, 99, 235, 0.2);
}

:deep(.custom-select-high) {
  .el-input__wrapper {
    background-color: var(--el-bg-color) !important;
    backdrop-filter: blur(4px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.08) !important;
    border-radius: 12px !important;
    padding: 2px 12px;
    transition: all 0.3s;

    &:hover,
    &.is-focus {
      box-shadow: 0 4px 15px rgba(37, 99, 235, 0.15) !important;
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
  --el-select-input-focus-border-color: #2563eb;
}
</style>
