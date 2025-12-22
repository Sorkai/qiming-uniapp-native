<script setup lang="ts">
import { computed, watch, nextTick, onMounted, onUnmounted, ref } from "vue";
import * as echarts from "echarts";
import {
  Document,
  TrendCharts,
  Trophy,
  Calendar,
  Clock,
  Edit,
  Coffee
} from "@element-plus/icons-vue";
import CourseHeader from "./CourseHeader.vue";

defineOptions({
  name: "CourseGrades"
});

// Props
const props = defineProps<{
  visible: boolean;
  currentTheme: string;
  courseScores: any | null;
  userAvatar: string;
  userNickname: string;
}>();

// Emits
defineEmits<{
  (e: "go-back"): void;
  (e: "toggle-theme"): void;
  (e: "go-to-account"): void;
  (e: "logout"): void;
}>();

// 模拟成绩列表数据
const gradesList = ref([
  {
    name: "第一章测验",
    type: "考试",
    score: 95,
    submitTime: "2024-01-15 14:30",
    gradedTime: "2024-01-16 09:00",
    comment: "完成得很好，对知识点掌握扎实！"
  },
  {
    name: "课后作业1",
    type: "作业",
    score: 88,
    submitTime: "2024-01-18 16:20",
    gradedTime: "2024-01-19 10:30",
    comment: "整体不错，部分细节需要注意。"
  },
  {
    name: "实验报告1",
    type: "实验",
    score: 92,
    submitTime: "2024-01-20 11:00",
    gradedTime: "2024-01-21 15:00",
    comment: "实验过程记录详细，分析到位。"
  },
  {
    name: "期中考试",
    type: "考试",
    score: 85,
    submitTime: "2024-01-25 10:00",
    gradedTime: "2024-01-28 14:00",
    comment: "基础扎实，继续保持！"
  }
]);

// 计算统计数据
const statistics = computed(() => {
  if (!gradesList.value.length) {
    return {
      totalAssignments: 0,
      completedAssignments: 0,
      averageScore: 0,
      highestScore: 0,
      completionRate: 0
    };
  }

  const completed = gradesList.value.filter(item => item.score !== null);
  const scores = completed.map(item => parseFloat(item.score as any));

  return {
    totalAssignments: gradesList.value.length,
    completedAssignments: completed.length,
    averageScore: scores.length
      ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
      : 0,
    highestScore: scores.length ? Math.max(...scores).toFixed(1) : 0,
    completionRate: gradesList.value.length
      ? ((completed.length / gradesList.value.length) * 100).toFixed(0)
      : 0
  };
});

// 获取成绩等级
const getGradeLevel = (score: number) => {
  if (score >= 90) return { label: "优秀", type: "success" as const, color: "#67c23a" };
  if (score >= 80) return { label: "良好", type: "success" as const, color: "#95d475" };
  if (score >= 70) return { label: "中等", type: "warning" as const, color: "#e6a23c" };
  if (score >= 60) return { label: "及格", type: "warning" as const, color: "#f0ad4e" };
  return { label: "不及格", type: "danger" as const, color: "#f56c6c" };
};

// 获取作业类型图标
const getAssignmentIcon = (type: string) => {
  const icons = {
    作业: Document,
    考试: Trophy,
    实验: TrendCharts
  };
  return icons[type] || Document;
};

const gradesChartRef = ref<HTMLElement | null>(null);
const trendChartRef = ref<HTMLElement | null>(null);
const classChartRef = ref<HTMLElement | null>(null);
const masteryChartRef = ref<HTMLElement | null>(null);

let gradeChartInstance: echarts.ECharts | null = null;
let trendChartInstance: echarts.ECharts | null = null;
let classChartInstance: echarts.ECharts | null = null;
let masteryChartInstance: echarts.ECharts | null = null;

// 初始化成绩占比图表 (Pie)
const initGradesChart = () => {
  if (!gradesChartRef.value || !props.courseScores) return;
  if (gradeChartInstance) gradeChartInstance.dispose();
  gradeChartInstance = echarts.init(
    gradesChartRef.value,
    props.currentTheme === "dark" ? "dark" : undefined
  );

  const option = {
    backgroundColor: "transparent",
    title: {
      text: "成绩占比分布",
      left: "center",
      textStyle: {
        fontSize: 14,
        color: props.currentTheme === "dark" ? "#e0e0e0" : "#333"
      }
    },
    tooltip: { trigger: "item", formatter: "{b}: {c}" },
    legend: {
      orient: "horizontal",
      bottom: 0,
      textStyle: { color: props.currentTheme === "dark" ? "#e0e0e0" : "#333" }
    },
    series: [
      {
        type: "pie",
        radius: ["40%", "70%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: props.currentTheme === "dark" ? "#2a2a2a" : "#fff",
          borderWidth: 2
        },
        label: { show: false, position: "center" },
        emphasis: {
          label: { show: true, fontSize: 16, fontWeight: "bold" }
        },
        data: [
          {
            value: props.courseScores.courseScore,
            name: "课时成绩",
            itemStyle: { color: "#409eff" }
          },
          {
            value: props.courseScores.workScore,
            name: "作业成绩",
            itemStyle: { color: "#604ffd" }
          },
          {
            value: props.courseScores.examScore,
            name: "考试成绩",
            itemStyle: { color: "#ff6b6b" }
          }
        ]
      }
    ]
  };
  gradeChartInstance.setOption(option);
};

// 初始化成绩趋势图表 (Line)
const initTrendChart = () => {
  if (!trendChartRef.value) return;
  if (trendChartInstance) trendChartInstance.dispose();
  trendChartInstance = echarts.init(
    trendChartRef.value,
    props.currentTheme === "dark" ? "dark" : undefined
  );

  const option = {
    backgroundColor: "transparent",
    title: {
      text: "学习成绩趋势",
      left: "center",
      textStyle: {
        fontSize: 14,
        color: props.currentTheme === "dark" ? "#e0e0e0" : "#333"
      }
    },
    tooltip: { trigger: "axis" },
    xAxis: {
      type: "category",
      data: gradesList.value.map(item => item.name.substring(0, 5)),
      axisLabel: { color: props.currentTheme === "dark" ? "#a0a0a0" : "#666" }
    },
    yAxis: {
      type: "value",
      max: 100,
      axisLabel: { color: props.currentTheme === "dark" ? "#a0a0a0" : "#666" },
      splitLine: {
        lineStyle: { color: props.currentTheme === "dark" ? "#3e3e3e" : "#eee" }
      }
    },
    series: [
      {
        data: gradesList.value.map(item => item.score),
        type: "line",
        smooth: true,
        symbolSize: 8,
        lineStyle: { width: 3, color: "#604ffd" },
        itemStyle: { color: "#604ffd" },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: "rgba(96, 79, 253, 0.3)" },
            { offset: 1, color: "rgba(96, 79, 253, 0)" }
          ])
        }
      }
    ]
  };
  trendChartInstance.setOption(option);
};

// 初始化班级对比图表 (Bar)
const initClassChart = () => {
  if (!classChartRef.value) return;
  if (classChartInstance) classChartInstance.dispose();
  classChartInstance = echarts.init(
    classChartRef.value,
    props.currentTheme === "dark" ? "dark" : undefined
  );

  const option = {
    backgroundColor: "transparent",
    title: {
      text: "班级成绩对比",
      left: "center",
      textStyle: {
        fontSize: 14,
        color: props.currentTheme === "dark" ? "#e0e0e0" : "#333"
      }
    },
    tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
    legend: {
      bottom: 0,
      textStyle: { color: props.currentTheme === "dark" ? "#e0e0e0" : "#333" }
    },
    xAxis: {
      type: "category",
      data: ["作业1", "作业2", "测验1", "期中"],
      axisLabel: { color: props.currentTheme === "dark" ? "#a0a0a0" : "#666" }
    },
    yAxis: {
      type: "value",
      max: 100,
      axisLabel: { color: props.currentTheme === "dark" ? "#a0a0a0" : "#666" },
      splitLine: {
        lineStyle: { color: props.currentTheme === "dark" ? "#3e3e3e" : "#eee" }
      }
    },
    series: [
      {
        name: "个人得分",
        type: "bar",
        data: [88, 92, 95, 85],
        itemStyle: { color: "#409eff", borderRadius: [4, 4, 0, 0] }
      },
      {
        name: "班级平均",
        type: "bar",
        data: [75, 82, 80, 78],
        itemStyle: { color: "#67c23a", borderRadius: [4, 4, 0, 0] }
      }
    ]
  };
  classChartInstance.setOption(option);
};

// 初始化个人雷达图 (Radar)
const initMasteryChart = () => {
  if (!masteryChartRef.value) return;
  if (masteryChartInstance) masteryChartInstance.dispose();
  masteryChartInstance = echarts.init(
    masteryChartRef.value,
    props.currentTheme === "dark" ? "dark" : undefined
  );

  const option = {
    backgroundColor: "transparent",
    title: {
      text: "个人雷达图",
      left: "center",
      textStyle: {
        fontSize: 14,
        color: props.currentTheme === "dark" ? "#e0e0e0" : "#333"
      }
    },
    radar: {
      indicator: [
        { name: "课时成绩", max: 100 },
        { name: "作业成绩", max: 100 },
        { name: "考试成绩", max: 100 },
        { name: "平均分", max: 100 },
        { name: "完成率", max: 100 }
      ],
      nameGap: 10,
      radius: "60%",
      center: ["50%", "55%"],
      axisName: {
        color: props.currentTheme === "dark" ? "#a0a0a0" : "#666",
        formatter: (name: string) => {
          return name === "课时成绩" ? `{a|${name}}` : name;
        },
        rich: {
          a: {
            padding: [40, 0, 0, 0]
          }
        }
      },
      splitArea: { show: false },
      splitLine: {
        lineStyle: { color: props.currentTheme === "dark" ? "#3e3e3e" : "#eee" }
      }
    },
    series: [
      {
        type: "radar",
        data: [
          {
            value: [
              props.courseScores?.courseScore || 85,
              props.courseScores?.workScore || 90,
              props.courseScores?.examScore || 78,
              parseFloat(statistics.value.averageScore as any) || 88,
              parseFloat(statistics.value.completionRate as any) || 95
            ],
            name: "个人能力",
            itemStyle: { color: "#604ffd" },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: "rgba(96, 79, 253, 0.4)" },
                { offset: 1, color: "rgba(96, 79, 253, 0.1)" }
              ])
            }
          }
        ]
      }
    ]
  };
  masteryChartInstance.setOption(option);
};

const initAllCharts = () => {
  initGradesChart();
  initTrendChart();
  initClassChart();
  initMasteryChart();
};

// 监听分数变化或可见性变化
watch(
  () => [props.visible, props.courseScores, props.currentTheme],
  () => {
    if (props.visible) {
      nextTick(() => {
        initAllCharts();
      });
    }
  },
  { deep: true }
);

const handleResize = () => {
  gradeChartInstance?.resize();
  trendChartInstance?.resize();
  classChartInstance?.resize();
  masteryChartInstance?.resize();
};

onMounted(() => {
  window.addEventListener("resize", handleResize);
  if (props.visible) {
    initAllCharts();
  }
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
  gradeChartInstance?.dispose();
  trendChartInstance?.dispose();
  classChartInstance?.dispose();
  masteryChartInstance?.dispose();
});
</script>

<template>
  <div v-show="visible" class="course-grades-wrapper" :class="currentTheme">
    <!-- 头部 -->
    <CourseHeader
      :current-theme="currentTheme"
      title="课程成绩"
      :user-avatar="userAvatar"
      :user-nickname="userNickname"
      @go-back="$emit('go-back')"
      @toggle-theme="$emit('toggle-theme')"
      @go-to-account="$emit('go-to-account')"
      @logout="$emit('logout')"
    />

    <div class="course-grades-container" :class="currentTheme">
      <div class="grades-content">
        <!-- 核心成绩指标卡片 -->
        <div class="grades-cards">
          <div class="grades-card" :class="currentTheme">
            <div class="grades-card-header">
              <el-icon><Edit /></el-icon>
              <h3>课时成绩</h3>
            </div>
            <div class="grades-card-content">
              <div v-if="courseScores" class="grades-score">
                {{ courseScores.courseScore || 0 }}
              </div>
              <el-skeleton v-else :rows="1" />
            </div>
          </div>

          <div class="grades-card" :class="currentTheme">
            <div class="grades-card-header">
              <el-icon><Document /></el-icon>
              <h3>作业成绩</h3>
            </div>
            <div class="grades-card-content">
              <div v-if="courseScores" class="grades-score">
                {{ courseScores.workScore || 0 }}
              </div>
              <el-skeleton v-else :rows="1" />
            </div>
          </div>

          <div class="grades-card" :class="currentTheme">
            <div class="grades-card-header">
              <el-icon><Coffee /></el-icon>
              <h3>考试成绩</h3>
            </div>
            <div class="grades-card-content">
              <div v-if="courseScores" class="grades-score">
                {{ courseScores.examScore || 0 }}
              </div>
              <el-skeleton v-else :rows="1" />
            </div>
          </div>
        </div>

        <!-- 统计分析卡片区域 -->
        <div class="statistics-cards" :class="currentTheme">
          <el-card class="stat-card" shadow="hover" :class="currentTheme">
            <div class="stat-content">
              <div class="stat-icon total">
                <el-icon :size="32"><Document /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.totalAssignments }}</div>
                <div class="stat-label">总作业数</div>
              </div>
            </div>
          </el-card>

          <el-card class="stat-card" shadow="hover" :class="currentTheme">
            <div class="stat-content">
              <div class="stat-icon completed">
                <el-icon :size="32"><Trophy /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.completedAssignments }}</div>
                <div class="stat-label">已完成</div>
              </div>
            </div>
          </el-card>

          <el-card class="stat-card" shadow="hover" :class="currentTheme">
            <div class="stat-content">
              <div class="stat-icon average">
                <el-icon :size="32"><TrendCharts /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.averageScore }}</div>
                <div class="stat-label">平均分</div>
              </div>
            </div>
          </el-card>

          <el-card class="stat-card" shadow="hover" :class="currentTheme">
            <div class="stat-content">
              <div class="stat-icon highest">
                <el-icon :size="32"><Trophy /></el-icon>
              </div>
              <div class="stat-info">
                <div class="stat-value">{{ statistics.highestScore }}</div>
                <div class="stat-label">最高分</div>
              </div>
            </div>
          </el-card>

          <el-card class="stat-card" shadow="hover" :class="currentTheme">
            <div class="stat-content">
              <div class="stat-icon completion">
                <div class="completion-circle">
                  <span>{{ statistics.completionRate }}%</span>
                </div>
              </div>
              <div class="stat-info">
                <div class="stat-label">完成率</div>
              </div>
            </div>
          </el-card>
        </div>

        <!-- 成绩多维分析图表区域 -->
        <div class="grades-charts-section" :class="currentTheme">
          <div class="section-header">
            <h3>成绩多维分析</h3>
          </div>
          <div class="charts-grid">
            <div class="chart-item-wrapper" :class="currentTheme">
              <div ref="masteryChartRef" class="grades-chart" />
            </div>
            <div class="chart-item-wrapper" :class="currentTheme">
              <div ref="gradesChartRef" class="grades-chart" />
            </div>
            <div class="chart-item-wrapper" :class="currentTheme">
              <div ref="trendChartRef" class="grades-chart" />
            </div>
            <div class="chart-item-wrapper" :class="currentTheme">
              <div ref="classChartRef" class="grades-chart" />
            </div>
          </div>
        </div>

        <!-- 成绩列表详情 -->
        <el-card class="grades-list-card" shadow="never" :class="currentTheme">
          <template #header>
            <div class="card-header">
              <span class="header-title">
                <el-icon><Document /></el-icon> 成绩详情
              </span>
            </div>
          </template>

          <div v-if="gradesList.length === 0" class="empty-state">
            <el-empty description="暂无成绩记录" />
          </div>

          <div v-else class="grades-list" :class="currentTheme">
            <div v-for="(item, index) in gradesList" :key="index" class="grade-item">
              <div class="grade-item-header">
                <div class="item-title">
                  <el-icon class="item-icon" :size="20">
                    <component :is="getAssignmentIcon(item.type)" />
                  </el-icon>
                  <span class="item-name">{{ item.name }}</span>
                  <el-tag v-if="item.type" size="small" class="item-type-tag" effect="plain">
                    {{ item.type }}
                  </el-tag>
                </div>
                <div class="item-score-section">
                  <div v-if="item.score !== null" class="score-display">
                    <div class="score-number" :style="{ color: getGradeLevel(item.score).color }">
                      {{ item.score }}
                    </div>
                    <div class="score-total">/ 100</div>
                    <el-tag :type="getGradeLevel(item.score).type" size="small" class="grade-tag" effect="dark">
                      {{ getGradeLevel(item.score).label }}
                    </el-tag>
                  </div>
                  <el-tag v-else type="info" size="small">未评分</el-tag>
                </div>
              </div>

              <div class="grade-item-body">
                <div class="item-progress">
                  <el-progress
                    :percentage="item.score || 0"
                    :color="getGradeLevel(item.score || 0).color"
                    :show-text="false"
                    :stroke-width="8"
                  />
                </div>
                <div class="item-meta">
                  <div class="meta-item">
                    <el-icon><Calendar /></el-icon>
                    <span>提交时间: {{ item.submitTime || "未提交" }}</span>
                  </div>
                  <div v-if="item.gradedTime" class="meta-item">
                    <el-icon><Clock /></el-icon>
                    <span>评分时间: {{ item.gradedTime }}</span>
                  </div>
                </div>
              </div>

              <div v-if="item.comment" class="grade-item-footer">
                <div class="teacher-comment">
                  <div class="comment-label">教师评语:</div>
                  <div class="comment-content">{{ item.comment }}</div>
                </div>
              </div>
            </div>
          </div>
        </el-card>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.course-grades-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #ffffff;

  &.dark {
    background-color: #1a1a1a;
  }
}

.course-grades-container {
  padding: 80px 20px 20px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: #f5f7fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  box-sizing: border-box;

  &.dark {
    background-color: #1a1a1a;
  }
}

.grades-content {
  width: 100%;
  padding: 0 20px;
}

.grades-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.grades-card {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
  transition: all 0.3s;
  border: 1px solid #c6e2ff;

  &.dark {
    background-color: #2a2a2a;
    border-color: #3e3e3e;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  }

  &:hover {
    box-shadow: 0 8px 24px rgba(64, 158, 255, 0.2);
    transform: translateY(-5px);
    border-color: #409eff;
  }

  .grades-card-header {
    display: flex;
    align-items: center;
    margin-bottom: 20px;
    gap: 12px;

    .el-icon {
      font-size: 24px;
      color: #409eff;
    }

    h3 {
      font-size: 18px;
      font-weight: bold;
      color: #1a1a1a;
      margin: 0;
    }
  }

  &.dark .grades-card-header h3 {
    color: #e0e0e0;
  }

  .grades-score {
    font-size: 48px;
    font-weight: 800;
    color: #604ffd;
    text-align: center;
  }
}

.statistics-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;

  .stat-card {
    border-radius: 12px;
    transition: all 0.3s ease;

    &.dark {
      background-color: #2a2a2a;
      border-color: #3e3e3e;

      .stat-value {
        color: #e0e0e0;
      }

      .stat-label {
        color: #a0a0a0;
      }
    }

    &:hover {
      transform: translateY(-4px);
    }

    :deep(.el-card__body) {
      padding: 20px;
    }
  }

  .stat-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .stat-icon {
    width: 64px;
    height: 64px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &.total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
    &.completed { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
    &.average { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; }
    &.highest { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; }
    &.completion { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; }
  }

  .completion-circle {
    font-size: 18px;
    font-weight: bold;
  }

  .stat-value {
    font-size: 28px;
    font-weight: bold;
    color: #303133;
    line-height: 1.2;
  }

  .stat-label {
    font-size: 14px;
    color: #909399;
  }
}

.grades-charts-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.1);
  margin-bottom: 30px;
  border: 1px solid #c6e2ff;

  &.dark {
    background-color: #2a2a2a;
    border-color: #3e3e3e;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);

    .section-header h3 { color: #e0e0e0; }
  }

  .section-header {
    margin-bottom: 25px;
    border-bottom: 1px solid #f0f2f5;
    padding-bottom: 15px;

    h3 {
      font-size: 20px;
      font-weight: bold;
      color: #1a1a1a;
      margin: 0;
    }
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;

    @media (max-width: 992px) {
      grid-template-columns: 1fr;
    }
  }

  .chart-item-wrapper {
    background: #fcfcfd;
    border-radius: 8px;
    padding: 16px;
    border: 1px solid #f0f2f5;
    height: 380px;

    &.dark {
      background: #333333;
      border-color: #444;
    }
  }

  .grades-chart {
    width: 100%;
    height: 100%;
  }
}

.grades-list-card {
  border-radius: 12px;

  &.dark {
    background-color: #2a2a2a;
    border-color: #3e3e3e;

    :deep(.el-card__header) { border-bottom-color: #3e3e3e; }
    .card-header .header-title { color: #e0e0e0; }
  }

  .card-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
  }

  :deep(.el-card__body) { padding: 0; }
}

.grades-list {
  &.dark {
    .grade-item {
      border-bottom-color: #3e3e3e;
      &:hover { background: #333; }
      .item-name { color: #e0e0e0; }
      .score-total, .meta-item { color: #a0a0a0; }
      .grade-item-footer .teacher-comment {
        background: #1e293b;
        color: #cbd5e1;
      }
    }
  }

  .grade-item {
    padding: 24px;
    border-bottom: 1px solid #ebeef5;
    transition: all 0.3s ease;

    &:last-child { border-bottom: none; }
    &:hover { background: #f5f7fa; }

    .grade-item-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
    }

    .item-title {
      display: flex;
      align-items: center;
      gap: 12px;
      .item-name { font-size: 16px; font-weight: 600; }
    }

    .score-display {
      display: flex;
      align-items: baseline;
      gap: 4px;
      .score-number { font-size: 32px; font-weight: bold; }
    }

    .grade-item-body {
      .item-progress { margin-bottom: 12px; }
      .item-meta {
        display: flex;
        gap: 24px;
        font-size: 14px;
        color: #666;
        .meta-item { display: flex; align-items: center; gap: 6px; }
      }
    }

    .grade-item-footer {
      margin-top: 16px;
      padding-top: 16px;
      border-top: 1px dashed #e4e7ed;

      .teacher-comment {
        background: #f0f9ff;
        border-left: 3px solid #409eff;
        padding: 12px 16px;
        border-radius: 4px;
        .comment-label { color: #409eff; font-weight: 600; margin-bottom: 4px; }
      }
    }
  }
}

@media (max-width: 768px) {
  .statistics-cards { grid-template-columns: 1fr 1fr; }
  .grade-item-header { flex-direction: column; align-items: flex-start !important; gap: 12px; }
}
</style>
