<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useDark } from "@pureadmin/utils";
import {
  getOverviewStatistics,
  getRecentPapers,
  getLearningAnalytics,
  getSystemTemplateStats
} from "@/api/examPaper";

// 导入 SVG 图标组件
import IconDocument from "@/assets/home-icons/document.svg?component";
import IconCheckCircle from "@/assets/home-icons/check-circle.svg?component";
import IconEdit from "@/assets/home-icons/edit.svg?component";
import IconChart from "@/assets/home-icons/chart.svg?component";
import IconGrid from "@/assets/home-icons/grid.svg?component";
import IconClock from "@/assets/home-icons/clock.svg?component";
import IconFolder from "@/assets/home-icons/folder.svg?component";
import IconTrending from "@/assets/home-icons/trending.svg?component";
import IconTarget from "@/assets/home-icons/target.svg?component";
import IconZap from "@/assets/home-icons/zap.svg?component";
import IconBook from "@/assets/home-icons/book.svg?component";
import IconClipboard from "@/assets/home-icons/clipboard.svg?component";

defineOptions({
  name: "ExamPaperIndex"
});

const router = useRouter();
const { isDark } = useDark();

// 统计数据
const statistics = ref({
  totalPapers: 0,
  publishedCount: 0,
  gradingCount: 0,
  averageScore: 0
});

// 最近编辑的试卷
const recentPapers = ref<any[]>([]);

// 试卷模板（基本信息前端定义，使用人数从后端获取）
const templates = ref([
  {
    id: 1,
    templateKey: "standard",
    name: "标准考试模板",
    description: "单选10道·多选5道·填空5道·大题10道",
    icon: IconDocument,
    color: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    questionCount: 30,
    totalPoints: 100,
    useCount: 0
  },
  {
    id: 2,
    templateKey: "quick",
    name: "快速测验模板",
    description: "仅包含客观题，适合课堂小测和随堂练习",
    icon: IconZap,
    color: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
    questionCount: 5,
    totalPoints: 25,
    useCount: 0
  },
  {
    id: 3,
    templateKey: "comprehensive",
    name: "综合能力测试",
    description: "单选10道·简答5道，适合综合能力评估",
    icon: IconBook,
    color: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    questionCount: 15,
    totalPoints: 75,
    useCount: 0
  },
  {
    id: 4,
    templateKey: "survey",
    name: "学情调查问卷",
    description: "单选10道·多选2道·简答5道·判断5道",
    icon: IconClipboard,
    color: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
    questionCount: 22,
    totalPoints: 120,
    useCount: 0
  }
]);

// 学情概览数据
const learningStats = ref({
  passRate: 0,
  excellentRate: 0,
  averageScore: 0,
  participantCount: 0
});

// 课程筛选器数据
const selectedCourse = ref("all");
const courseOptions = [
  { value: "all", label: "全部课程" },
  { value: "math", label: "高等数学" },
  { value: "linear", label: "线性代数" },
  { value: "prob", label: "概率论" }
];

// 加载学情概览数据
const loadLearningStats = async (courseId?: number) => {
  try {
    const params = courseId ? { courseId } : undefined;
    const res = await getLearningAnalytics(params);
    if (res.code === 0 && res.data?.overview) {
      const o = res.data.overview;
      learningStats.value = {
        passRate: o.passRate,
        excellentRate: Math.round(
          res.data.scoreDistribution?.find(d => d.range === "90-100")
            ?.percentage || 0
        ),
        averageScore: o.avgScore,
        participantCount: o.totalStudents
      };
    }
  } catch (e) {
    console.error("获取学情概览失败", e);
  }
};

// 处理课程切换
const handleCourseChange = (val: string) => {
  if (val === "all") {
    loadLearningStats();
  } else {
    // 将课程value映射为courseId
    const courseIdMap: Record<string, number> = {
      math: 1,
      linear: 2,
      prob: 3
    };
    loadLearningStats(courseIdMap[val]);
  }
};

// 创建新试卷
const createNewPaper = () => {
  router.push("/exam-paper/editor");
};

// 使用模板创建
const useTemplate = (templateId: number) => {
  router.push(`/exam-paper/editor?template=${templateId}`);
};

// 编辑试卷
const editPaper = (paperId: number) => {
  router.push(`/exam-paper/editor/${paperId}`);
};

// 查看更多试卷
const viewMorePapers = () => {
  router.push("/exam-paper/my-papers");
};

// 查看更多模板
const viewMoreTemplates = () => {
  router.push("/exam-paper/templates");
};

// 获取状态标签类型
const getStatusType = (status: number) => {
  return status === 1 ? "success" : "info";
};

// 获取状态文本
const getStatusText = (status: number) => {
  return status === 1 ? "已发布" : "草稿";
};

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await getOverviewStatistics();
    if (res.code === 0 && res.data) {
      statistics.value = res.data;
    }
  } catch (e) {
    console.error("获取总览统计失败", e);
  }
};

// 加载最近试卷
const loadRecentPapers = async () => {
  try {
    const res = await getRecentPapers(5);
    if (res.code === 0 && res.data) {
      recentPapers.value = res.data;
    }
  } catch (e) {
    console.error("获取最近试卷失败", e);
  }
};

// 加载系统模板统计（使用人数）
const loadTemplateStats = async () => {
  try {
    const res = await getSystemTemplateStats();
    if (res.code === 0 && res.data) {
      res.data.forEach(stat => {
        const t = templates.value.find(
          item => item.templateKey === stat.templateKey
        );
        if (t) {
          t.useCount = stat.useCount;
        }
      });
    }
  } catch (e) {
    console.error("获取模板统计失败", e);
  }
};

onMounted(() => {
  loadStatistics();
  loadRecentPapers();
  loadLearningStats();
  loadTemplateStats();
});
</script>

<template>
  <div class="exam-paper-index" :class="{ 'is-dark': isDark }">
    <!-- 顶部欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <div class="welcome-badge">智能组卷系统</div>
        <h1 class="welcome-title">题目组卷器</h1>
        <p class="welcome-desc">
          创建、编辑和管理您的试卷，支持多种题型和智能AI辅助
        </p>
      </div>
      <div class="quick-actions">
        <el-button
          type="primary"
          size="large"
          class="create-btn"
          @click="createNewPaper"
        >
          <el-icon class="mr-2"><Plus /></el-icon>
          新建空白试卷
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">
            <IconDocument />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.totalPapers }}</div>
            <div class="stat-label">试卷总数</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon published">
            <IconCheckCircle />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.publishedCount }}</div>
            <div class="stat-label">已发布</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon grading">
            <IconEdit />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.gradingCount }}</div>
            <div class="stat-label">待阅卷</div>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon score">
            <IconChart />
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.averageScore }}</div>
            <div class="stat-label">平均分</div>
          </div>
        </div>
      </div>
    </div>

    <div class="content-section">
      <!-- 左侧：模板和最近试卷 -->
      <div class="overview-main-content">
        <!-- 试卷模板 -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title">
              <div class="title-icon">
                <IconGrid />
              </div>
              <span>从模板开始</span>
            </div>
            <el-button text type="primary" @click="viewMoreTemplates">
              查看全部<el-icon class="ml-1"><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="templates-grid">
            <div
              v-for="template in templates"
              :key="template.id"
              class="template-card"
              @click="useTemplate(template.id)"
            >
              <div
                class="template-icon"
                :style="{ background: template.color }"
              >
                <component :is="template.icon" />
              </div>
              <div class="template-info">
                <div class="template-name">{{ template.name }}</div>
                <div class="template-desc">{{ template.description }}</div>
                <div class="template-meta">
                  <span>{{ template.questionCount }}题</span>
                  <span class="meta-divider">·</span>
                  <span>{{ template.totalPoints }}分</span>
                  <span class="meta-divider">·</span>
                  <span>{{ template.useCount }}人使用</span>
                </div>
              </div>
              <div class="template-arrow">
                <el-icon><ArrowRight /></el-icon>
              </div>
            </div>
          </div>
        </div>

        <!-- 最近编辑 -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title">
              <div class="title-icon clock">
                <IconClock />
              </div>
              <span>最近编辑</span>
            </div>
            <el-button text type="primary" @click="viewMorePapers">
              查看全部
              <el-icon class="ml-1"><ArrowRight /></el-icon>
            </el-button>
          </div>
          <div class="recent-papers">
            <div
              v-for="paper in recentPapers"
              :key="paper.id"
              class="paper-item"
              @click="editPaper(paper.id)"
            >
              <div class="paper-icon">
                <IconDocument />
              </div>
              <div class="paper-info">
                <div class="paper-title">{{ paper.title }}</div>
                <div class="paper-meta">
                  <span>{{ paper.courseName }}</span>
                  <span class="divider">|</span>
                  <span>{{ paper.questionCount }}题</span>
                  <span class="divider">|</span>
                  <span>{{ paper.totalPoints }}分</span>
                </div>
                <div class="paper-time">{{ paper.updateTime }}</div>
              </div>
              <div class="paper-status">
                <el-tag :type="getStatusType(paper.status)" size="small">
                  {{ getStatusText(paper.status) }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：学情概览和快捷入口 -->
      <div class="side-content">
        <div class="section-card learning-stats-card">
          <div class="section-header">
            <div class="section-title">
              <div class="title-icon stats">
                <IconTrending />
              </div>
              <span>学情概览</span>
            </div>
            <el-select
              v-model="selectedCourse"
              placeholder="选择课程"
              size="small"
              class="course-filter"
              @change="handleCourseChange"
            >
              <el-option
                v-for="item in courseOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </div>
          <div class="learning-stats">
            <div class="stat-item">
              <div class="stat-label">及格率</div>
              <el-progress
                :percentage="learningStats.passRate"
                :stroke-width="10"
                status="success"
              />
            </div>
            <div class="stat-item">
              <div class="stat-label">优秀率</div>
              <el-progress
                :percentage="learningStats.excellentRate"
                :stroke-width="10"
                color="#667eea"
              />
            </div>
            <div class="stat-item">
              <div class="stat-label">平均分</div>
              <div class="stat-value-large">
                {{ learningStats.averageScore }}
                <span class="stat-unit">分</span>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-label">参与人数</div>
              <div class="stat-value-large">
                {{ learningStats.participantCount }}
                <span class="stat-unit">人</span>
              </div>
            </div>
            <el-button
              type="primary"
              class="view-detail-btn"
              @click="router.push('/exam-paper/statistics')"
            >
              查看详细分析
            </el-button>
          </div>
        </div>

        <!-- 快捷入口 -->
        <div class="section-card">
          <div class="section-header">
            <div class="section-title">
              <div class="title-icon quick">
                <IconTarget />
              </div>
              <span>快捷入口</span>
            </div>
          </div>
          <div class="quick-links">
            <div
              class="quick-link-item"
              @click="router.push('/exam-paper/grading')"
            >
              <div class="link-icon grading">
                <IconEdit />
              </div>
              <span>阅卷管理</span>
            </div>
            <div
              class="quick-link-item"
              @click="router.push('/exam-paper/my-papers')"
            >
              <div class="link-icon papers">
                <IconFolder />
              </div>
              <span>我的试卷</span>
            </div>
            <div
              class="quick-link-item"
              @click="router.push('/exam-paper/statistics')"
            >
              <div class="link-icon stats">
                <IconChart />
              </div>
              <span>学情分析</span>
            </div>
            <div
              class="quick-link-item"
              @click="router.push('/exam-paper/templates')"
            >
              <div class="link-icon templates">
                <IconGrid />
              </div>
              <span>试卷模板</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
/*浅色模式变量 */
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

/* 统一圆角 */
$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16px;
$radius-xl: 20px;

.exam-paper-index {
  min-height: 100%;
  padding: 24px;
  transition: all 0.3s ease;

  &.is-dark {
    .welcome-section {
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
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

    .section-card {
      background: $dark-card-bg;
      border-color: $dark-border;
      box-shadow: $dark-shadow;

      .section-title span {
        color: $dark-text-primary;
      }
    }

    .template-card {
      background: rgba(255, 255, 255, 0.03);
      border-color: $dark-border;

      &:hover {
        background: rgba(255, 255, 255, 0.06);
      }

      .template-name {
        color: $dark-text-primary;
      }

      .template-desc {
        color: $dark-text-secondary;
      }

      .template-meta {
        color: $dark-text-muted;
      }

      .template-arrow {
        color: $dark-text-muted;
      }
    }

    .paper-item {
      border-color: $dark-border;

      &:hover {
        background: rgba(255, 255, 255, 0.03);
      }

      .paper-icon {
        background: rgba(102, 126, 234, 0.15);
        color: #818cf8;
      }

      .paper-title {
        color: $dark-text-primary;
      }

      .paper-meta {
        color: $dark-text-secondary;
      }

      .paper-time {
        color: $dark-text-muted;
      }
    }

    .learning-stats-card {
      .stat-label {
        color: $dark-text-secondary;
      }

      .stat-value-large {
        color: #818cf8;

        .stat-unit {
          color: $dark-text-muted;
        }
      }
    }

    .quick-link-item {
      background: rgba(255, 255, 255, 0.03);
      border-color: $dark-border;

      &:hover {
        background: rgba(255, 255, 255, 0.06);
      }

      span {
        color: $dark-text-secondary;
      }
    }
  }
}

.welcome-section {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 40px;
  margin-bottom: 24px;
  overflow: hidden;
  background: $primary-gradient;
  border-radius: $radius-xl;
  box-shadow: 0 20px 40px rgba(102, 126, 234, 0.3);

  @media (width <= 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
    padding: 30px;

    .create-btn {
      width: 100%;
    }
  }

  .welcome-content {
    .welcome-badge {
      display: inline-block;
      padding: 6px 16px;
      margin-bottom: 16px;
      font-size: 12px;
      font-weight: 500;
      color: #fff;
      background: rgba(255, 255, 255, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.3);
      border-radius: 20px;
    }

    .welcome-title {
      margin: 0 0 12px;
      font-size: 32px;
      font-weight: 700;
      color: #fff;
    }

    .welcome-desc {
      margin: 0;
      font-size: 15px;
      color: rgba(255, 255, 255, 0.9);
    }
  }

  .create-btn {
    height: 52px;
    padding: 0 32px;
    font-size: 16px;
    font-weight: 600;
    color: #667eea;
    background: #fff;
    border: none;
    border-radius: 26px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
      transform: translateY(-3px);
    }
  }
}

.stats-section {
  margin-bottom: 24px;

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;

    @media (width <= 1200px) {
      grid-template-columns: repeat(2, 1fr);
    }

    @media (width <= 768px) {
      grid-template-columns: 1fr;
    }
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
      width: 60px;
      height: 60px;
      color: #fff;
      background: $primary-gradient;
      border-radius: $radius-md;

      &.published {
        background: $success-gradient;
      }

      &.grading {
        background: $warning-gradient;
      }

      &.score {
        background: $info-gradient;
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

.content-section {
  display: grid;
  grid-template-columns: 1fr 380px;
  gap: 20px;

  @media (width <= 1200px) {
    grid-template-columns: 1fr;
  }
}

.overview-main-content,
.side-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-card {
  padding: 24px;
  background: $light-card-bg;
  border: 1px solid $light-border;
  border-radius: $radius-lg;
  box-shadow: $light-shadow;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    .section-title {
      display: flex;
      gap: 12px;
      align-items: center;
      font-size: 18px;
      font-weight: 600;

      span {
        color: $light-text-primary;
      }

      .title-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 36px;
        height: 36px;
        color: #fff;
        background: $primary-gradient;
        border-radius: $radius-sm;

        &.clock {
          background: $info-gradient;
        }

        &.stats {
          background: $success-gradient;
        }

        &.quick {
          background: $warning-gradient;
        }

        svg {
          width: 20px;
          height: 20px;
        }
      }
    }
  }
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (width <= 900px) {
    grid-template-columns: 1fr;
  }
}

.template-card {
  display: flex;
  gap: 16px;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  background: #f8fafc;
  border: 1px solid $light-border;
  border-radius: $radius-md;
  transition: all 0.3s ease;

  &:hover {
    background: #f1f5f9;
    box-shadow: $light-shadow;
    transform: translateX(4px);

    .template-arrow {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .template-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    color: #fff;
    border-radius: $radius-md;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

    svg {
      width: 26px;
      height: 26px;
    }
  }

  .template-info {
    flex: 1;
    min-width: 0;

    .template-name {
      margin-bottom: 4px;
      font-size: 15px;
      font-weight: 600;
      color: $light-text-primary;
    }

    .template-desc {
      overflow: hidden;
      font-size: 13px;
      color: $light-text-secondary;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .template-meta {
      margin-top: 4px;
      font-size: 12px;
      color: $light-text-muted;

      .meta-divider {
        margin: 0 4px;
      }
    }
  }

  .template-arrow {
    color: $light-text-muted;
    opacity: 0;
    transition: all 0.3s ease;
    transform: translateX(-8px);
  }
}

.recent-papers {
  .paper-item {
    display: flex;
    gap: 16px;
    align-items: center;
    padding: 16px;
    cursor: pointer;
    border-bottom: 1px solid $light-border;
    border-radius: $radius-md;
    transition: all 0.3s ease;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #f8fafc;
    }

    .paper-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      color: #7c3aed;
      background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
      border-radius: $radius-md;

      svg {
        width: 28px;
        height: 28px;
      }
    }

    .paper-info {
      flex: 1;
      min-width: 0;

      .paper-title {
        margin-bottom: 4px;
        font-size: 15px;
        font-weight: 500;
        color: $light-text-primary;
      }

      .paper-meta {
        margin-bottom: 4px;
        font-size: 13px;
        color: $light-text-secondary;

        .divider {
          margin: 0 8px;
          color: $light-border;
        }
      }

      .paper-time {
        font-size: 12px;
        color: $light-text-muted;
      }
    }
  }
}

.learning-stats-card {
  .section-header {
    border-bottom: 1px solid
      v-bind('isDark ? "rgba(255, 255, 255, 0.1)" : "#f1f5f9"');
    padding-bottom: 16px;
    margin-bottom: 16px;
  }

  .course-filter {
    width: 120px;
  }

  .learning-stats {
    .stat-item {
      margin-bottom: 20px;

      &:last-child {
        margin-bottom: 0;
      }

      .stat-label {
        margin-bottom: 10px;
        font-size: 14px;
        color: $light-text-secondary;
      }

      .stat-value-large {
        font-size: 36px;
        font-weight: 700;
        color: #667eea;

        .stat-unit {
          margin-left: 4px;
          font-size: 14px;
          font-weight: normal;
          color: $light-text-muted;
        }
      }
    }
  }

  .view-detail-btn {
    width: 100%;
    height: 44px;
    margin-top: 20px;
    font-weight: 600;
    background: $primary-gradient;
    border: none;
    border-radius: $radius-md;

    &:hover {
      opacity: 0.9;
    }
  }
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  .quick-link-item {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    padding: 20px 16px;
    cursor: pointer;
    background: #f8fafc;
    border: 1px solid $light-border;
    border-radius: $radius-md;
    transition: all 0.3s ease;

    &:hover {
      background: #f1f5f9;
      transform: translateY(-2px);
    }

    .link-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      color: #fff;
      border-radius: $radius-md;

      &.grading {
        background: $warning-gradient;
      }

      &.papers {
        background: $primary-gradient;
      }

      &.stats {
        background: $success-gradient;
      }

      &.templates {
        background: $info-gradient;
      }

      svg {
        width: 22px;
        height: 22px;
      }
    }

    span {
      font-size: 13px;
      color: $light-text-secondary;
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
