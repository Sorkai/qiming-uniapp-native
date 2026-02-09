<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";

defineOptions({
  name: "ExamPaperStatistics"
});

// 时间范围
const dateRange = ref<[Date, Date] | null>(null);

// 课程筛选
const selectedCourse = ref<number | null>(null);

// 课程列表
const courseList = ref([
  { id: 1, name: "高等数学" },
  { id: 2, name: "线性代数" },
  { id: 3, name: "概率论" }
]);

// 总体统计数据
const overviewStats = reactive({
  totalExams: 28,
  totalStudents: 156,
  avgScore: 78.5,
  passRate: 85.2
});

// 成绩分布数据
const scoreDistribution = ref([
  { range: "0-59", count: 12, percentage: 7.7 },
  { range: "60-69", count: 18, percentage: 11.5 },
  { range: "70-79", count: 45, percentage: 28.8 },
  { range: "80-89", count: 52, percentage: 33.3 },
  { range: "90-100", count: 29, percentage: 18.6 }
]);

// 知识点掌握情况
const knowledgePoints = ref([
  { name: "极限与连续", mastery: 85, questionCount: 45 },
  { name: "导数与微分", mastery: 78, questionCount: 62 },
  { name: "积分计算", mastery: 72, questionCount: 58 },
  { name: "级数理论", mastery: 65, questionCount: 35 },
  { name: "多元函数", mastery: 70, questionCount: 42 }
]);

// 题型正确率
const questionTypeStats = ref([
  { type: "单选题", correctRate: 82, avgTime: 45 },
  { type: "多选题", correctRate: 68, avgTime: 72 },
  { type: "判断题", correctRate: 88, avgTime: 25 },
  { type: "填空题", correctRate: 75, avgTime: 90 },
  { type: "简答题", correctRate: 70, avgTime: 180 }
]);

// 近期考试趋势
const examTrends = ref([
  { date: "2024-01", avgScore: 72, passRate: 78 },
  { date: "2024-02", avgScore: 75, passRate: 82 },
  { date: "2024-03", avgScore: 78, passRate: 85 },
  { date: "2024-04", avgScore: 80, passRate: 88 }
]);

// 学生排名
const studentRanking = ref([
  { rank: 1, name: "张三", score: 98, trend: "up" },
  { rank: 2, name: "李四", score: 95, trend: "same" },
  { rank: 3, name: "王五", score: 93, trend: "up" },
  { rank: 4, name: "赵六", score: 91, trend: "down" },
  { rank: 5, name: "钱七", score: 89, trend: "up" }
]);

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

// 刷新数据
const refreshData = () => {
  // 模拟刷新
  console.log("刷新数据", dateRange.value, selectedCourse.value);
};

// 导出报告
const exportReport = () => {
  console.log("导出报告");
};

onMounted(() => {
  // 初始化图表等
});
</script>

<template>
  <div class="statistics-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <div class="header-left">
        <h2 class="page-title">学情分析</h2>
        <p class="page-desc">全面了解学生学习情况和考试表现</p>
      </div>
      <div class="header-right">
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
          <el-icon><Download /></el-icon>
          导出报告
        </el-button>
      </div>
    </div>

    <!-- 总体统计 -->
    <div class="overview-stats">
      <el-card class="stat-card" shadow="never">
        <div class="stat-icon exams">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ overviewStats.totalExams }}</div>
          <div class="stat-label">考试总数</div>
        </div> </el-card
      ><el-card class="stat-card" shadow="never">
        <div class="stat-icon students">
          <el-icon><User /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ overviewStats.totalStudents }}</div>
          <div class="stat-label">参与学生</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="never">
        <div class="stat-icon score">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ overviewStats.avgScore }}</div>
          <div class="stat-label">平均分</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="never">
        <div class="stat-icon pass">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ overviewStats.passRate }}%</div>
          <div class="stat-label">及格率</div>
        </div>
      </el-card>
    </div>

    <!-- 图表区域 -->
    <div class="charts-row">
      <!-- 成绩分布 -->
      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>成绩分布</span>
          </div>
        </template>
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
      </el-card>

      <!-- 题型正确率 -->
      <el-card class="chart-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>题型正确率</span>
          </div>
        </template>
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
      </el-card>
    </div>

    <!-- 知识点和排名 -->
    <div class="detail-row">
      <!-- 知识点掌握情况 -->
      <el-card class="detail-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>知识点掌握情况</span
            ><el-button text size="small">查看全部</el-button>
          </div>
        </template>
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
      </el-card>

      <!-- 学生排名 -->
      <el-card class="detail-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>学生排名 TOP5</span>
            <el-button text size="small">查看全部</el-button>
          </div>
        </template>
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
      </el-card>

      <!-- 考试趋势 -->
      <el-card class="detail-card" shadow="never">
        <template #header>
          <div class="card-header">
            <span>考试趋势</span>
          </div>
        </template>
        <div class="trend-list">
          <div v-for="item in examTrends" :key="item.date" class="trend-item">
            <div class="trend-date">{{ item.date }}</div>
            <div class="trend-stats">
              <span class="trend-score">平均分: {{ item.avgScore }}</span>
              <span class="trend-pass">及格率: {{ item.passRate }}%</span>
            </div></div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.statistics-container {
  padding: 20px;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;

  .header-left {
    .page-title {
      font-size: 22px;
      font-weight: 600;
      color: #303133;
      margin: 0 0 8px 0;
    }

    .page-desc {
      font-size: 14px;
      color: #909399;
      margin: 0;
    }
  }

  .header-right {
    display: flex;
    gap: 12px;
  }
}

.overview-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;

  .stat-card {
    :deep(.el-card__body) {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 24px;
    }

    .stat-icon {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;

      &.exams {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
      }

      &.students {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: #fff;
      }

      &.score {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: #fff;
      }

      &.pass {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        color: #fff;
      }
    }

    .stat-info {
      .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: #303133;
        line-height: 1;
        margin-bottom: 8px;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
      }
    }
  }
}

.charts-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 20px;

  .chart-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
    }

    .score-distribution {
      .distribution-item {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 16px;

        &:last-child {
          margin-bottom: 0;
        }

        .range-label {
          width: 70px;
          font-size: 13px;
          color: #606266;
        }

        .bar-wrapper {
          flex: 1;
          height: 20px;
          background: #f5f7fa;
          border-radius: 10px;
          overflow: hidden;

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
          color: #909399;
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
            color: #303133;
          }

          .type-rate {
            font-size: 14px;
            font-weight: 600;
            color: #409eff;
          }
        }

        .type-time {
          font-size: 12px;
          color: #909399;
          margin-top: 4px;
        }
      }
    }
  }
}

.detail-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;

  .detail-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-weight: 600;
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
            color: #303133;
          }

          .knowledge-count {
            font-size: 12px;
            color: #909399;
          }
        }
      }
    }

    .ranking-list {
      .ranking-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .rank-badge {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: #f5f7fa;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: 600;
          color: #909399;

          &.top3 {
            background: linear-gradient(135deg, #ffd700, #ffb347);
            color: #fff;
          }
        }

        .student-info {
          flex: 1;
          display: flex;
          justify-content: space-between;

          .student-name {
            font-size: 14px;
            color: #303133;
          }

          .student-score {
            font-size: 14px;
            font-weight: 600;
            color: #409eff;
          }
        }
      }
    }

    .trend-list {
      .trend-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .trend-date {
          font-size: 14px;
          color: #303133;
          font-weight: 500;
        }

        .trend-stats {
          display: flex;
          gap: 16px;

          .trend-score,
          .trend-pass {
            font-size: 13px;
            color: #606266;
          }
        }
      }
    }
  }
}
</style>
