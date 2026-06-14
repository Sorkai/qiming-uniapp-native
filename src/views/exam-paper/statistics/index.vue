<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useDark } from "@pureadmin/utils";
import { ElMessage } from "element-plus";
import {
  getLearningAnalytics,
  getCourseList,
  type LearningAnalyticsData,
  type LearningAnalyticsOverview,
  type ScoreDistributionItem,
  type KnowledgePointMastery,
  type QuestionTypeStatItem,
  type ExamTrendItem,
  type StudentRankingItem
} from "@/api/examPaper";
import {
  isNativeWebViewRuntime,
  logNativeFallback
} from "@/utils/nativeRuntime";
import { createNativeDemoLearningAnalytics } from "@/views/exam-paper/nativeDemoOverview";

// 导入 SVG 图标组件
import IconDocument from "@/assets/home-icons/document.svg?component";
import IconUsers from "@/assets/home-icons/users.svg?component";
import IconChart from "@/assets/home-icons/chart.svg?component";
import IconCheckCircle from "@/assets/home-icons/check-circle.svg?component";

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
const nativeDemoCourseList = [
  { id: 1, name: "高等数学" },
  { id: 2, name: "嵌入式 Linux" },
  { id: 3, name: "计算机基础" },
  { id: 4, name: "线性代数" }
];

// 总体统计数据
const overviewStats = reactive<LearningAnalyticsOverview>({
  totalExams: 0,
  totalStudents: 0,
  avgScore: 0,
  passRate: 0
});

// 成绩分布数据
const scoreDistribution = ref<ScoreDistributionItem[]>([]);
interface ScoreDistributionWithStudents extends ScoreDistributionItem {
  students: string[];
}
const scoreDistributionWithStudents = ref<ScoreDistributionWithStudents[]>([]);
const expandedRanges = ref<string[]>([]);

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
    up: "#739CF9",
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

const surnamePool =
  "赵 钱 孙 李 周 吴 郑 王 冯 陈 褚 卫 蒋 沈 韩 杨 朱 秦 尤 许 何 吕 施 张 孔 曹 严 华 金 魏 陶 姜 戚 谢 邹 喻 柏 水 窦 章 云 苏 潘 葛 奚 范 彭 郎 鲁 韦 昌 马 苗 凤 花 方 俞 任 袁 柳 鲍 史 唐 费 廉 岑 薛 雷 贺 倪 汤 滕 殷 罗 毕 郝 邬 安 常 乐 于 时 傅 皮 卞 齐 康 伍 余 元 卜 顾 孟 平 黄 和 穆 萧 尹 姚 邵 湛 汪 祁 毛 禹 狄 米 贝 明 臧 计 伏 成 戴 谈 宋 茅 庞 熊 纪 舒 屈 项 祝 董 梁 杜 阮 蓝 闵 席 季 麻 强 贾 路 娄 危 江 童 颜 郭 梅 盛 林 刁 钟 徐 邱 骆 高 夏 蔡 田 樊 胡 凌 霍 虞 万 支 柯 管 卢 莫 房 裘 缪 干 解 应 宗 丁 宣 贲 邓 郁 单 杭 洪 包 诸 左 石 崔 吉 钮 龚 程 嵇 邢 裴 陆 荣 翁 荀 羊 惠 甄 麴 家 封 芮 羿 储 靳 汲 邴 糜 松 井 段 富 巫 乌 焦 巴 弓 牧 隗 山 谷 车 侯 宓 蓬 全 郗 班 仰 秋 仲 伊 宫 宁 仇 栾 暴 甘 钭 厉 戎 祖 武 符 刘 景 詹 束 龙 叶 幸 司 韶 郜 黎 蓟 薄 印 宿 白 怀 蒲 邰 从 鄂 索 咸 籍 赖 卓 蔺 屠 蒙 池 乔 阴 郁 胥 能 苍 双 闻 莘 党 翟 谭 贡 劳 逄 姬 申 扶 堵 冉 宰 郦 雍 却 璩 桑 桂 濮 牛 寿 通 边 扈 燕 冀 郏 浦 尚 农 温 别 庄 晏 柴 瞿 阎 充 慕 连 茹 习 宦 艾 鱼 容 向 古 易 慎 戈 廖 庾 终 暨 居 衡 步 都 耿 满 弘 匡 国 文 寇 广 禄 阙 东 欧 殳 沃 利 蔚 越 夔 隆 师 巩 聂 晁 勾 敖 融 冷 訾 辛 阚 那 简 饶 空 曾 毋 沙 乜 养 鞠 须 丰 巢 关 蒯 相 查 后 荆 红 游 竺 权 逯 盖 益 桓 公".split(
    " "
  );

const shuffleSurnames = (list: string[]) => {
  const shuffled = [...list];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const buildScoreDistributionWithStudents = (
  distribution: ScoreDistributionItem[]
): ScoreDistributionWithStudents[] => {
  return distribution.map(item => {
    const shuffledSurnames = shuffleSurnames(surnamePool);
    const students = Array.from({ length: item.count }, (_, index) => {
      const surname = shuffledSurnames[index % shuffledSurnames.length];
      return `${surname}同学`;
    });
    return {
      ...item,
      students
    };
  });
};

const toggleRangeExpand = (range: string) => {
  if (expandedRanges.value.includes(range)) {
    expandedRanges.value = expandedRanges.value.filter(item => item !== range);
    return;
  }
  expandedRanges.value = [...expandedRanges.value, range];
};

const isRangeExpanded = (range: string) => expandedRanges.value.includes(range);

const applyAnalyticsPayload = (data: LearningAnalyticsData) => {
  Object.assign(overviewStats, data.overview);
  scoreDistribution.value = data.scoreDistribution || [];
  scoreDistributionWithStudents.value = buildScoreDistributionWithStudents(
    scoreDistribution.value
  );
  expandedRanges.value =
    scoreDistributionWithStudents.value.length > 0
      ? [scoreDistributionWithStudents.value[0].range]
      : [];
  knowledgePoints.value = data.knowledgePoints || [];
  questionTypeStats.value = data.questionTypeStats || [];
  examTrends.value = data.examTrends || [];
  studentRanking.value = data.studentRanking || [];
};

const applyNativeAnalyticsFallback = (reason: string, error?: unknown) => {
  if (!isNativeWebViewRuntime()) return false;

  logNativeFallback(reason, error);
  applyAnalyticsPayload(
    createNativeDemoLearningAnalytics(selectedCourse.value || undefined)
  );
  return true;
};

// 加载课程列表
const loadCourseList = async () => {
  try {
    const res = await getCourseList();
    if (res.code === 0 && res.data) {
      courseList.value = res.data;
    } else if (isNativeWebViewRuntime()) {
      logNativeFallback("使用原生演示课程列表", res);
      courseList.value = nativeDemoCourseList;
    }
  } catch (error) {
    logNativeFallback("加载课程列表失败:", error);
    if (isNativeWebViewRuntime()) {
      courseList.value = nativeDemoCourseList;
    }
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
      applyAnalyticsPayload(res.data);
    } else if (!applyNativeAnalyticsFallback("使用原生演示学情分析数据", res)) {
      ElMessage.error("加载学情分析数据失败");
    }
  } catch (error) {
    if (!applyNativeAnalyticsFallback("加载学情分析数据失败:", error)) {
      ElMessage.error("加载学情分析数据失败");
    }
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
          <IconifyIconOnline icon="ri:line-chart-line" />
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
            v-for="item in scoreDistributionWithStudents"
            :key="item.range"
            class="distribution-panel"
            :class="{ expanded: isRangeExpanded(item.range) }"
          >
            <div
              class="distribution-item"
              @click="toggleRangeExpand(item.range)"
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
              <div class="distribution-meta">
                <div class="count">
                  {{ item.count }}人 ({{ item.percentage }}%)
                </div>
                <div class="expand-action">
                  {{ isRangeExpanded(item.range) ? "收起名单" : "展开名单" }}
                </div>
              </div>
            </div>
            <div v-show="isRangeExpanded(item.range)" class="student-name-list">
              <span
                v-for="(name, idx) in item.students"
                :key="`${item.range}-${name}-${idx}`"
                class="student-chip"
              >
                {{ name }}
              </span>
            </div>
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
$light-bg: var(--el-bg-color-page);
$light-card-bg: var(--el-bg-color);
$light-text-primary: var(--el-text-color-primary);
$light-text-secondary: var(--el-text-color-regular);
$light-text-muted: var(--el-text-color-secondary);
$light-border: var(--el-border-color-lighter);
$light-shadow:
  0 4px 6px -1px rgb(0 0 0 / 10%),
  0 2px 4px -2px rgb(0 0 0 / 10%);
$light-shadow-lg:
  0 10px 15px -3px rgb(0 0 0 / 10%),
  0 4px 6px -4px rgb(0 0 0 / 10%);

/* 深色模式变量 */
$dark-bg: var(--el-bg-color-page);
$dark-card-bg: var(--el-bg-color);
$dark-text-primary: var(--el-text-color-primary);
$dark-text-secondary: var(--el-text-color-regular);
$dark-text-muted: var(--el-text-color-secondary);
$dark-border: var(--el-border-color-lighter);
$dark-shadow:
  0 4px 6px -1px rgb(0 0 0 / 30%),
  0 2px 4px -2px rgb(0 0 0 / 30%);
$dark-shadow-lg:
  0 10px 15px -3px rgb(0 0 0 / 40%),
  0 4px 6px -4px rgb(0 0 0 / 40%);

/* 主色调 */
$primary-gradient: linear-gradient(135deg, #4a7fc8 0%, #739cf9 100%);
$success-gradient: linear-gradient(135deg, #739cf9 0%, #80c8fa 100%);
$warning-gradient: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
$info-gradient: linear-gradient(135deg, #475569 0%, #64748b 100%);
$pink-gradient: linear-gradient(135deg, #fb7185 0%, #f97316 100%);
$cyan-gradient: linear-gradient(135deg, #4a7fc8 0%, #80c8fa 100%);

/* 统一圆角 */
$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16px;
$radius-xl: 20px;

.statistics-container {
  box-sizing: border-box;
  min-height: 100%;
  padding: 24px;
  overflow-x: hidden;
  transition: all 0.3s ease;

  &.is-dark {
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
        background: rgba(115, 156, 249, 0.15);
        color: #80c8fa;
      }
    }

    .stat-card {
      background: $dark-card-bg;
      border-color: $dark-border;
      box-shadow: $dark-shadow;

      &:hover {
        box-shadow: $dark-shadow-lg;
      }

      .stat-info {
        .stat-value {
          color: $dark-text-primary;
        }

        .stat-label {
          color: $dark-text-secondary;
        }
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

      .range-label {
        color: $dark-text-primary;
      }

      .count {
        color: $dark-text-muted;
      }

      .distribution-panel {
        background: rgba(115, 156, 249, 0.08);
        border-color: rgba(255, 255, 255, 0.06);

        &.expanded {
          border-color: rgba(128, 200, 250, 0.4);
        }
      }

      .student-name-list {
        border-top-color: rgba(255, 255, 255, 0.14);
      }

      .student-chip {
        color: $dark-text-primary;
        background: rgba(115, 156, 249, 0.18);
        border-color: rgba(128, 200, 250, 0.35);
      }

      .expand-action {
        color: #80c8fa;
      }

      .bar-wrapper {
        background: rgba(255, 255, 255, 0.1);
      }

      .type-item {
        .type-name {
          color: $dark-text-primary;
        }

        .type-time {
          color: $dark-text-muted;
        }
      }

      .knowledge-item {
        .knowledge-name {
          color: $dark-text-primary;
        }

        .knowledge-count {
          color: $dark-text-muted;
        }
      }

      .ranking-item {
        border-color: $dark-border;

        .student-name {
          color: $dark-text-primary;
        }
      }

      .trend-item {
        border-color: $dark-border;

        .trend-date {
          color: $dark-text-primary;
        }

        .trend-score,
        .trend-pass {
          color: $dark-text-muted;
        }
      }
    }
  }
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: 104px;
  padding: 24px;
  margin-bottom: 24px;
  background: $light-card-bg;
  border: 1px solid $light-border;
  border-radius: $radius-lg;
  box-shadow: $light-shadow;

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    color: #fff;
    background: $primary-gradient;
    border-radius: $radius-md;
    flex-shrink: 0;
    box-shadow: 0 6px 16px rgb(74 127 200 / 30%);

    svg {
      width: 28px !important;
      height: 28px !important;
      display: block;
    }
  }

  .header-info {
    .page-title {
      margin: 0 0 4px;
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

    :deep(.el-button--primary) {
      color: #fff;
      background: $primary-gradient;
      border: none;

      &:hover {
        opacity: 0.92;
      }
    }
  }
}

@media (max-width: 1200px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
    gap: 18px;

    .header-content {
      gap: 16px;
    }

    .header-info {
      .page-title {
        margin-bottom: 6px;
        font-size: 22px;
      }
    }

    .header-actions {
      display: grid;
      grid-template-columns: minmax(0, 1.35fr) minmax(160px, 0.75fr) 160px;
      gap: 12px;
      width: 100%;

      :deep(.el-date-editor),
      :deep(.el-select),
      :deep(.el-button) {
        width: 100% !important;
        margin-left: 0;
      }
    }
  }
}

@media (max-width: 768px) {
  .statistics-container {
    padding: 10px 8px 92px;
  }

  .page-header {
    flex-direction: column;
    align-items: stretch;
    min-height: 0;
    gap: 12px;
    padding: 14px;
    margin-bottom: 12px;
    border-radius: 18px;

    .header-content {
      display: grid;
      grid-template-columns: 44px minmax(0, 1fr);
      align-items: center;
      gap: 12px;
    }

    .header-icon {
      width: 44px;
      height: 44px;
      border-radius: 14px;

      svg {
        width: 22px;
        height: 22px;
      }
    }

    .header-info {
      min-width: 0;

      .page-title {
        margin-bottom: 4px;
        font-size: 21px;
        line-height: 1.2;
      }

      .page-desc {
        font-size: 13px;
        line-height: 1.45;
      }
    }

    .header-actions {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      align-items: stretch;
      gap: 8px;
      width: 100%;

      :deep(.el-date-editor),
      :deep(.el-select),
      :deep(.el-button) {
        width: 100% !important;
        min-width: 0;
        height: 36px;
        margin-left: 0;
      }

      :deep(.el-date-editor) {
        grid-column: 1 / -1;
      }

      :deep(.el-input__wrapper),
      :deep(.el-select__wrapper) {
        min-height: 36px;
        font-size: 13px;
      }

      :deep(.el-button) {
        padding: 0 10px;
        font-size: 13px;
      }

      :deep(.el-button + .el-button) {
        margin-left: 0;
      }
    }
  }
}

.stats-section {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
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
      width: 56px;
      height: 56px;
      color: #fff;
      border-radius: $radius-md;
      flex-shrink: 0;

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
        width: 26px;
        height: 26px;
      }
    }

    .stat-info {
      .stat-value {
        margin-bottom: 4px;
        font-size: 28px;
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

  @media (max-width: 1200px) {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .stats-section {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;

    .stat-card {
      display: grid;
      grid-template-columns: 40px minmax(0, 1fr);
      gap: 10px;
      align-items: center;
      min-height: 78px;
      padding: 12px;
      border-radius: 18px;

      .stat-icon {
        grid-column: 1;
        width: 40px;
        height: 40px;
        border-radius: 14px;

        svg {
          width: 20px;
          height: 20px;
        }
      }

      .stat-info {
        grid-column: 2;
        min-width: 0;

        .stat-value {
          margin-bottom: 4px;
          font-size: 22px;
          line-height: 1.05;
        }

        .stat-label {
          font-size: 12px;
          line-height: 1.35;
          white-space: normal;
        }
      }
    }
  }

  .charts-row,
  .detail-row {
    gap: 12px;
    margin-bottom: 12px;
  }

  .chart-card,
  .detail-card {
    padding: 14px;
    border-radius: 18px;

    .card-header {
      margin-bottom: 12px;

      .card-title {
        font-size: 15px;
        line-height: 1.35;
      }
    }
  }

  .score-distribution {
    .distribution-panel {
      padding: 10px;

      .distribution-item {
        display: grid;
        grid-template-columns: 56px minmax(0, 1fr);
        gap: 8px;
      }

      .range-label {
        width: auto;
        font-size: 12px;
      }

      .distribution-meta {
        grid-column: 1 / -1;
        align-items: flex-start;
        min-width: 0;
      }

      .count,
      .expand-action {
        text-align: left;
      }
    }
  }
}

@media (max-width: 360px) {
  .stats-section {
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
  .distribution-panel {
    padding: 12px;
    margin-bottom: 12px;
    background: rgba(115, 156, 249, 0.05);
    border: 1px solid rgba(115, 156, 249, 0.15);
    border-radius: $radius-md;
    transition: all 0.2s ease;

    &:last-child {
      margin-bottom: 0;
    }

    &.expanded {
      border-color: #80c8fa;
      box-shadow: 0 4px 12px rgb(74 127 200 / 12%);
    }

    .distribution-item {
      display: flex;
      gap: 12px;
      align-items: center;
      cursor: pointer;
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
          background: linear-gradient(90deg, #80c8fa, #80c8fa);
        }

        &.excellent {
          background: linear-gradient(90deg, #739cf9, #a1b5f7);
        }

        &.perfect {
          background: linear-gradient(90deg, #4a7fc8, #80c8fa);
        }
      }
    }

    .distribution-meta {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      min-width: 128px;
      gap: 4px;
    }

    .count {
      font-size: 13px;
      color: $light-text-muted;
      text-align: right;
    }

    .expand-action {
      font-size: 12px;
      font-weight: 600;
      color: #4a7fc8;
    }

    .student-name-list {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 12px;
      padding-top: 12px;
      border-top: 1px dashed $light-border;
      max-height: 110px;
      overflow-y: auto;
    }

    .student-chip {
      padding: 4px 10px;
      font-size: 12px;
      color: #2f5f9b;
      background: rgba(74, 127, 200, 0.12);
      border: 1px solid rgba(74, 127, 200, 0.2);
      border-radius: 999px;
      white-space: nowrap;
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
        color: #4a7fc8;
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

  @media (max-width: 1200px) {
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
        color: #4a7fc8;
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

/* SVG 图标样式 —— 仅作用于本页的线性图标容器，避免影响 echarts 图表 / el-empty / el-icon 等填充型 SVG */
:deep(.header-icon svg),
:deep(.stat-icon svg) {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
