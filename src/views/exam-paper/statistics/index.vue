<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useDark } from "@pureadmin/utils";
import { ElMessage } from "element-plus";
import {
  getLearningAnalytics,
  getCourseList,
  type LearningAnalyticsOverview,
  type ScoreDistributionItem,
  type KnowledgePointMastery,
  type QuestionTypeStatItem,
  type ExamTrendItem,
  type StudentRankingItem
} from "@/api/examPaper";

// 导入 SVG 图标组件
import IconDocument from "@/assets/home-icons/document.svg?component";
import IconUsers from "@/assets/home-icons/users.svg?component";
import IconChart from "@/assets/home-icons/chart.svg?component";
import IconCheckCircle from "@/assets/home-icons/check-circle.svg?component";
import IconTrending from "@/assets/home-icons/trending.svg?component";

defineOptions({
  name: "ExamPaperStatistics"
});

const { isDark } = useDark();

// 加载状态
const loading = ref(false);

// 时间范围
const dateRange = ref<[Date, Date] | null>(null);

// 课程筛选
const selectedCourse = ref<number | null>(null);

// 课程列表
const courseList = ref<Array<{ id: number; name: string }>>([]);

// 总体统计数据
const overviewStats = reactive<LearningAnalyticsOverview>({
  totalExams: 0,
  totalStudents: 0,
  avgScore: 0,
  passRate: 0
});

// 成绩分布数据
const scoreDistribution = ref<ScoreDistributionItem[]>([]);

// 知识点掌握情况
const knowledgePoints = ref<KnowledgePointMastery[]>([]);

// 题型正确率
const questionTypeStats = ref<QuestionTypeStatItem[]>([]);

// 近期考试趋势
const examTrends = ref<ExamTrendItem[]>([]);

// 学生排名
const studentRanking = ref<StudentRankingItem[]>([]);

// 获取趋势图标
const getTrendIcon = (trend: string) => {
  const icons: Record<string, string> = {
    up: "Top",
    down: "Bottom",
    same: "Minus"
  };
  return icons[trend] || "Minus";
};

// 获取趋势颜色
const getTrendColor = (trend: string) => {
  const colors: Record<string, string> = {
    up: "#67c23a",
    down: "#f56c6c",
    same: "#909399"
  };
  return colors[trend] || "#909399";
};

// 获取掌握度状态
const getMasteryStatus = (mastery: number) => {
  if (mastery >= 80) return "success";
  if (mastery >= 60) return "warning";
  return "exception";
};

// 加载课程列表
const loadCourseList = async () => {
  try {
    const res = await getCourseList();
    if (res.code === 0 && res.data) {
      courseList.value = res.data;
    }
  } catch (error) {
    console.error("加载课程列表失败:", error);
  }
};

// 加载学情分析数据
const loadAnalyticsData = async () => {
  loading.value = true;
  try {
    const params: any = {};
    if (selectedCourse.value) {
      params.courseId = selectedCourse.value;
    }
    if (dateRange.value && dateRange.value.length === 2) {
      params.startDate = dateRange.value[0].toISOString().split("T")[0];
      params.endDate = dateRange.value[1].toISOString().split("T")[0];
    }

    const res = await getLearningAnalytics(params);
    if (res.code === 0 && res.data) {
      const data = res.data;

      // 更新总览数据
      Object.assign(overviewStats, data.overview);

      // 更新成绩分布
      scoreDistribution.value = data.scoreDistribution || [];

      // 更新知识点掌握情况
      knowledgePoints.value = data.knowledgePoints || [];

      // 更新题型正确率
      questionTypeStats.value = data.questionTypeStats || [];

      // 更新考试趋势
      examTrends.value = data.examTrends || [];

      // 更新学生排名
      studentRanking.value = data.studentRanking || [];
    } else {
      ElMessage.error("加载学情分析数据失败");
    }
  } catch (error) {
    console.error("加载学情分析数据失败:", error);
    ElMessage.error("加载学情分析数据失败");
  } finally {
    loading.value = false;
  }
};

// 刷新数据
const refreshData = () => {
  loadAnalyticsData();
};

// 导出报告
const exportReport = () => {
  ElMessage.info("导出报告功能开发中");
};

onMounted(() => {
  loadCourseList();
  loadAnalyticsData();
});
</script>

<template>
  <div class="statistics-container" :class="{ 'is-dark': isDark }">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <IconTrending />
        </div>
        <div class="header-info">
          <h1 class="page-title">学情分析</h1>
          <p class="page-desc">全面了解学生学习情况和考试表现</p>
        </div>
      </div>
      <div class="header-actions">
        <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          style="width: 260px"
          @change="refreshData"
        />
        <el-select
          v-model="selectedCourse"
          placeholder="全部课程"
          clearable
          style="width: 160px"
          @change="refreshData"
        >
          <el-option
            v-for="course in courseList"
            :key="course.id"
            :label="course.name"
            :value="course.id"
          />
        </el-select>
        <el-button type="primary" @click="exportReport">
          <el-icon class="mr-1"><Download /></el-icon>
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon exams">
          <IconDocument />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ overviewStats.totalExams }}</div>
          <div class="stat-label">考试总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon students">
          <IconUsers />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ overviewStats.totalStudents }}</div>
          <div class="stat-label">参与学生</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon score">
          <IconChart />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ overviewStats.avgScore }}</div>
          <div class="stat-label">平均分</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon pass">
          <IconCheckCircle />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ overviewStats.passRate }}%</div>
          <div class="stat-label">及格率</div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-row">
      <!-- 成绩分布 -->
      <div class="chart-card">
        <div class="card-header">
          <span class="card-title">成绩分布</span>
        </div>
        <div class="score-distribution">
          <div
            v-for="item in scoreDistribution"
            :key="item.range"
            class="distribution-item"
          >
            <div class="range-label">{{ item.range }}分</div>
            <div class="bar-wrapper">
              <div
                class="bar"
                :style="{ width: item.percentage + '%' }"
                :class="{
                  fail: item.range === '0-59',
                  pass: item.range === '60-69',
                  good: item.range === '70-79',
                  excellent: item.range === '80-89',
                  perfect: item.range === '90-100'
                }"
              />
            </div>
            <div class="count">{{ item.count }}人 ({{ item.percentage }}%)</div>
          </div>
        </div>
      </div>

      <!-- 题型正确率 -->
      <div class="chart-card">
        <div class="card-header">
          <span class="card-title">题型正确率</span>
        </div>
        <div class="question-type-stats">
          <div
            v-for="item in questionTypeStats"
            :key="item.type"
            class="type-item"
          >
            <div class="type-info">
              <span class="type-name">{{ item.type }}</span>
              <span class="type-rate">{{ item.correctRate }}%</span>
            </div>
            <el-progress
              :percentage="item.correctRate"
              :stroke-width="10"
              :status="
                item.correctRate >= 80
                  ? 'success'
                  : item.correctRate >= 60
                    ? ''
                    : 'exception'
              "
            />
            <div class="type-time">平均用时: {{ item.avgTime }}秒</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 知识点和排名 -->
    <div class="detail-row">
      <!-- 知识点掌握情况 -->
      <div class="detail-card">
        <div class="card-header">
          <span class="card-title">知识点掌握情况</span>
          <el-button text size="small">查看全部</el-button>
        </div>
        <div class="knowledge-list">
          <div
            v-for="item in knowledgePoints"
            :key="item.name"
            class="knowledge-item"
          >
            <div class="knowledge-info">
              <span class="knowledge-name">{{ item.name }}</span>
              <span class="knowledge-count">{{ item.questionCount }}题</span>
            </div>
            <el-progress
              :percentage="item.mastery"
              :stroke-width="8"
              :status="getMasteryStatus(item.mastery)"
            />
          </div>
        </div>
      </div>

      <!-- 学生排名 -->
      <div class="detail-card">
        <div class="card-header">
          <span class="card-title">学生排名 TOP5</span>
          <el-button text size="small">查看全部</el-button>
        </div>
        <div class="ranking-list">
          <div
            v-for="student in studentRanking"
            :key="student.rank"
            class="ranking-item"
          >
            <div class="rank-badge" :class="{ top3: student.rank <= 3 }">
              {{ student.rank }}
            </div>
            <div class="student-info">
              <span class="student-name">{{ student.name }}</span>
              <span class="student-score">{{ student.score }}分</span>
            </div>
            <el-icon :color="getTrendColor(student.trend)">
              <component :is="getTrendIcon(student.trend)" />
            </el-icon>
          </div>
        </div>
      </div>

      <!-- 考试趋势 -->
      <div class="detail-card">
        <div class="card-header">
          <span class="card-title">考试趋势</span>
        </div>
        <div class="trend-list">
          <div v-for="item in examTrends" :key="item.date" class="trend-item">
            <div class="trend-date">{{ item.date }}</div>
            <div class="trend-stats">
              <span class="trend-score">平均分: {{ item.avgScore }}</span>
              <span class="trend-pass">及格率: {{ item.passRate }}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/* 浅色模式变量 */
$light-bg: #f5f7fa;
$light-card-bg: #fff;
$light-text-primary: #1f2937;
$light-text-secondary: #6b7280;
$light-text-muted: #9ca3af;
$light-border: #e5e7eb;
$light-shadow:
  0 4px 6px -1px rgb(0 0 0 / 10%),
  0 2px 4px -2px rgb(0 0 0 / 10%);
$light-shadow-lg:
  0 10px 15px -3px rgb(0 0 0 / 10%),
  0 4px 6px -4px rgb(0 0 0 / 10%);

/* 深色模式变量 */
$dark-bg: #0f172a;
$dark-card-bg: rgba(30, 41, 59, 0.8);
$dark-text-primary: #f1f5f9;
$dark-text-secondary: #94a3b8;
$dark-text-muted: #64748b;
$dark-border: rgba(255, 255, 255, 0.1);
$dark-shadow:
  0 4px 6px -1px rgb(0 0 0 / 30%),
  0 2px 4px -2px rgb(0 0 0 / 30%);
$dark-shadow-lg:
  0 10px 15px -3px rgb(0 0 0 / 40%),
  0 4px 6px -4px rgb(0 0 0 / 40%);

/* 主色调 */
$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$success-gradient: linear-gradient(135deg, #10b981 0%, #34d399 100%);
$warning-gradient: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
$info-gradient: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
$pink-gradient: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
$cyan-gradient: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);

/* 统一圆角 */
$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16px;
$radius-xl: 20px;

.statistics-container {
  min-height: 100%;
  padding: 24px;
  background: $light-bg;
  transition: all 0.3s ease;

  &.is-dark {
    background: $dark-bg;

    .page-header {
      background: $dark-card-bg;
      border-color: $dark-border;

      .page-title {
        color: $dark-text-primary;
      }

      .page-desc {
        color: $dark-text-secondary;
      }

      .header-icon {
        background: rgba(16, 185, 129, 0.15);
        color: #34d399;
      }
    }

    .stat-card {
      background: $dark-card-bg;
      border-color: $dark-border;
      box-shadow: $dark-shadow;

      &:hover {
        box-shadow: $dark-shadow-lg;
      }

      .stat-value {
        color: $dark-text-primary;
      }

      .stat-label {
        color: $dark-text-secondary;
      }
    }

    .chart-card,
    .detail-card {
      background: $dark-card-bg;
      border-color: $dark-border;
      box-shadow: $dark-shadow;

      .card-title {
        color: $dark-text-primary;
      }

      .range-label,
      .type-name,
      .knowledge-name,
      .student-name,
      .trend-date {
        color: $dark-text-primary;
      }

      .count,
      .type-time,
      .knowledge-count,
      .trend-score,
      .trend-pass {
        color: $dark-text-muted;
      }

      .bar-wrapper {
        background: rgba(255, 255, 255, 0.1);
      }

      .ranking-item {
        border-color: $dark-border;
      }

      .trend-item {
        border-color: $dark-border;
      }
    }
  }
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  margin-bottom: 24px;
  background: $light-card-bg;
  border: 1px solid $light-border;
  border-radius: $radius-lg;
  box-shadow: $light-shadow;

  .header-content {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 64px;
    height: 64px;
    color: #fff;
    background: $success-gradient;
    border-radius: $radius-md;

    svg {
      width: 32px;
      height: 32px;
    }
  }

  .header-info {
    .page-title {
      margin: 0 0 8px;
      font-size: 24px;
      font-weight: 700;
      color: $light-text-primary;
    }

    .page-desc {
      margin: 0;
      font-size: 14px;
      color: $light-text-secondary;
    }
  }

  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
  }
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  @media (width <= 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (width <= 768px) {
    grid-template-columns: 1fr;
  }

  .stat-card {
    display: flex;
    gap: 20px;
    align-items: center;
    padding: 24px;
    cursor: pointer;
    background: $light-card-bg;
    border: 1px solid $light-border;
    border-radius: $radius-lg;
    box-shadow: $light-shadow;
    transition: all 0.3s ease;

    &:hover {
      box-shadow: $light-shadow-lg;
      transform: translateY(-4px);
    }

    .stat-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      color: #fff;
      border-radius: $radius-md;

      &.exams {
        background: $primary-gradient;
      }

      &.students {
        background: $pink-gradient;
      }

      &.score {
        background: $cyan-gradient;
      }

      &.pass {
        background: $success-gradient;
      }

      svg {
        width: 28px;
        height: 28px;
      }
    }

    .stat-info {
      .stat-value {
        margin-bottom: 6px;
        font-size: 32px;
        font-weight: 700;
        line-height: 1;
        color: $light-text-primary;
      }

      .stat-label {
        font-size: 14px;
        color: $light-text-secondary;
      }
    }
  }
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;

  @media (width <= 1200px) {
    grid-template-columns: 1fr;
  }
}

.chart-card,
.detail-card {
  padding: 24px;
  background: $light-card-bg;
  border: 1px solid $light-border;
  border-radius: $radius-lg;
  box-shadow: $light-shadow;

  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: $light-text-primary;
    }
  }
}

.score-distribution {
  .distribution-item {
    display: flex;
    gap: 12px;
    align-items: center;
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .range-label {
      width: 70px;
      font-size: 13px;
      color: $light-text-secondary;
    }

    .bar-wrapper {
      flex: 1;
      height: 20px;
      overflow: hidden;
      background: #f5f7fa;
      border-radius: 10px;

      .bar {
        height: 100%;
        border-radius: 10px;
        transition: width 0.3s;

        &.fail {
          background: linear-gradient(90deg, #f56c6c, #ff9a9e);
        }

        &.pass {
          background: linear-gradient(90deg, #e6a23c, #ffd93d);
        }

        &.good {
          background: linear-gradient(90deg, #409eff, #79bbff);
        }

        &.excellent {
          background: linear-gradient(90deg, #67c23a, #95d475);
        }

        &.perfect {
          background: linear-gradient(90deg, #9c27b0, #ba68c8);
        }
      }
    }

    .count {
      width: 100px;
      font-size: 13px;
      color: $light-text-muted;
      text-align: right;
    }
  }
}

.question-type-stats {
  .type-item {
    margin-bottom: 20px;

    &:last-child {
      margin-bottom: 0;
    }

    .type-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;

      .type-name {
        font-size: 14px;
        color: $light-text-primary;
      }

      .type-rate {
        font-size: 14px;
        font-weight: 600;
        color: #667eea;
      }
    }

    .type-time {
      margin-top: 4px;
      font-size: 12px;
      color: $light-text-muted;
    }
  }
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (width <= 1200px) {
    grid-template-columns: 1fr;
  }
}

.knowledge-list {
  .knowledge-item {
    margin-bottom: 16px;

    &:last-child {
      margin-bottom: 0;
    }

    .knowledge-info {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;

      .knowledge-name {
        font-size: 14px;
        color: $light-text-primary;
      }

      .knowledge-count {
        font-size: 12px;
        color: $light-text-muted;
      }
    }
  }
}

.ranking-list {
  .ranking-item {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px 0;
    border-bottom: 1px solid $light-border;

    &:last-child {
      border-bottom: none;
    }

    .rank-badge {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 28px;
      height: 28px;
      font-size: 14px;
      font-weight: 600;
      color: $light-text-muted;
      background: #f5f7fa;
      border-radius: 50%;

      &.top3 {
        color: #fff;
        background: linear-gradient(135deg, #ffd700, #ffb347);
      }
    }

    .student-info {
      display: flex;
      flex: 1;
      justify-content: space-between;

      .student-name {
        font-size: 14px;
        color: $light-text-primary;
      }

      .student-score {
        font-size: 14px;
        font-weight: 600;
        color: #667eea;
      }
    }
  }
}

.trend-list {
  .trend-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 0;
    border-bottom: 1px solid $light-border;

    &:last-child {
      border-bottom: none;
    }

    .trend-date {
      font-size: 14px;
      font-weight: 500;
      color: $light-text-primary;
    }

    .trend-stats {
      display: flex;
      gap: 16px;

      .trend-score,
      .trend-pass {
        font-size: 13px;
        color: $light-text-secondary;
      }
    }
  }
}

/* SVG 图标样式 */
:deep(svg) {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>