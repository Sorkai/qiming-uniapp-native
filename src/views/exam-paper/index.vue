<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useDark } from "@pureadmin/utils";
import { ArrowRight, Plus } from "@element-plus/icons-vue";
import {
  getOverviewStatistics,
  getRecentPapers,
  getLearningAnalytics,
  getSystemTemplateStats
} from "@/api/examPaper";
import { logNativeFallback } from "@/utils/nativeRuntime";

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
    color: "linear-gradient(135deg, #4A7FC8 0%, #739CF9 100%)",
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
    color: "linear-gradient(135deg, #4A7FC8 0%, #80C8FA 100%)",
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
    color: "linear-gradient(135deg, #d97706 0%, #f59e0b 100%)",
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
    color: "linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)",
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
    logNativeFallback("获取学情概览失败", e);
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
    logNativeFallback("获取总览统计失败", e);
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
    logNativeFallback("获取最近试卷失败", e);
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
    logNativeFallback("获取模板统计失败", e);
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
                color="#739CF9"
              />
            </div>
            <div class="stat-item">
              <div class="stat-label">优秀率</div>
              <el-progress
                :percentage="learningStats.excellentRate"
                :stroke-width="10"
                color="#4A7FC8"
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
/* 与教师管理端整体设计风格对齐：使用 Element Plus CSS 变量 + 渐变 header-card + 圆角 16px + 卡片阴影 */

.exam-paper-index {
  min-height: 100%;
  padding: 16px;
  background-color: var(--el-bg-color-page);
  transition: all 0.3s ease;
}

/* ============ 顶部欢迎区（对齐 competition 的 header-card） ============ */
.welcome-section {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
  padding: 24px 28px;
  background: linear-gradient(135deg, #c7d9fb 0%, #fcd9b6 100%);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgb(0 0 0 / 12%);

  .welcome-content {
    flex: 1;
    min-width: 260px;

    .welcome-badge {
      display: inline-block;
      padding: 4px 10px;
      margin-bottom: 10px;
      font-size: 12px;
      font-weight: 600;
      color: var(--el-color-primary);
      background: rgb(255 255 255 / 65%);
      border-radius: 999px;
    }

    .welcome-title {
      margin: 0 0 8px;
      font-size: 24px;
      font-weight: 700;
      color: #1f2937;
    }

    .welcome-desc {
      margin: 0;
      font-size: 14px;
      color: #4b5563;
    }
  }

  .quick-actions {
    .create-btn {
      height: 44px;
      padding: 0 22px;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-color-primary);
      background: #fff;
      border: none;
      border-radius: 10px;
      box-shadow: 0 4px 12px rgb(0 0 0 / 12%);
      transition: all 0.3s ease;

      &:hover {
        color: var(--el-color-primary);
        background: #fff;
        box-shadow: 0 8px 20px rgb(0 0 0 / 18%);
        transform: translateY(-2px);
      }
    }
  }
}

/* ============ 4 个统计卡片（对齐 overview-cards） ============ */
.stats-section {
  margin-bottom: 16px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;

  @media (max-width: 1100px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
}

.stat-card {
  position: relative;
  display: flex;
  gap: 14px;
  align-items: center;
  padding: 18px 20px;
  overflow: hidden;
  background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%);
  border: none;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 12px 24px rgb(0 0 0 / 15%);
    transform: translateY(-4px);
  }

  /* 后 3 个 card 的渐变 */
  &:nth-child(2) {
    background: linear-gradient(135deg, #6ee7b7 0%, #34d399 100%);
  }

  &:nth-child(3) {
    background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%);
  }

  &:nth-child(4) {
    background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%);
  }

  .stat-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    background: rgb(255 255 255 / 35%);
    border-radius: 12px;
    backdrop-filter: blur(6px);

    svg {
      width: 26px;
      height: 26px;
      color: #fff;
    }
  }

  .stat-info {
    .stat-value {
      font-size: 28px;
      font-weight: 700;
      line-height: 1;
      color: #1e3a5f;
    }

    .stat-label {
      margin-top: 6px;
      font-size: 13px;
      color: #374151;
    }
  }
}

/* ============ 主体内容区 ============ */
.content-section {
  display: grid;
  grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
}

.overview-main-content,
.side-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

/* 统一的卡片样式 */
.section-card {
  padding: 18px 20px;
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgb(0 0 0 / 8%);
  transition: box-shadow 0.25s ease;

  &:hover {
    box-shadow: 0 8px 20px rgb(0 0 0 / 10%);
  }
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--el-border-color-lighter);

  .section-title {
    display: flex;
    gap: 10px;
    align-items: center;
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);

    .title-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      color: #fff;
      background: linear-gradient(
        135deg,
        var(--el-color-primary) 0%,
        var(--el-color-primary-light-3) 100%
      );
      border-radius: 8px;

      &.clock {
        background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
      }

      &.stats {
        background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
      }

      &.quick {
        background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
      }

      svg {
        width: 16px;
        height: 16px;
      }
    }
  }
}

/* ============ 模板卡片 ============ */
.templates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  @media (max-width: 800px) {
    grid-template-columns: 1fr;
  }
}

.template-card {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 14px;
  cursor: pointer;
  background-color: var(--el-fill-color-extra-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  transition: all 0.25s ease;

  &:hover {
    background-color: var(--el-fill-color-light);
    border-color: var(--el-color-primary-light-5);
    box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
    transform: translateY(-2px);

    .template-arrow {
      color: var(--el-color-primary);
      opacity: 1;
      transform: translateX(0);
    }
  }

  .template-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    color: #fff;
    border-radius: 12px;
    box-shadow: 0 4px 10px rgb(0 0 0 / 12%);

    svg {
      width: 24px;
      height: 24px;
    }
  }

  .template-info {
    flex: 1;
    min-width: 0;
  }

  .template-name {
    margin-bottom: 4px;
    overflow: hidden;
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .template-desc {
    overflow: hidden;
    font-size: 12px;
    color: var(--el-text-color-regular);
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .template-meta {
    margin-top: 6px;
    font-size: 12px;
    color: var(--el-text-color-secondary);

    .meta-divider {
      margin: 0 6px;
      color: var(--el-border-color);
    }
  }

  .template-arrow {
    display: flex;
    align-items: center;
    color: var(--el-text-color-placeholder);
    opacity: 0;
    transition: all 0.3s ease;
    transform: translateX(-6px);
  }
}

/* ============ 最近编辑试卷 ============ */
.recent-papers {
  .paper-item {
    display: flex;
    gap: 14px;
    align-items: center;
    padding: 12px 14px;
    cursor: pointer;
    border-radius: 10px;
    transition: background 0.2s ease;

    & + .paper-item {
      margin-top: 4px;
    }

    &:hover {
      background-color: var(--el-fill-color-light);
    }

    .paper-icon {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
      border-radius: 10px;

      svg {
        width: 22px;
        height: 22px;
      }
    }

    .paper-info {
      flex: 1;
      min-width: 0;
    }

    .paper-title {
      margin-bottom: 4px;
      overflow: hidden;
      font-size: 14px;
      font-weight: 600;
      color: var(--el-text-color-primary);
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .paper-meta {
      margin-bottom: 2px;
      font-size: 12px;
      color: var(--el-text-color-regular);

      .divider {
        margin: 0 6px;
        color: var(--el-border-color);
      }
    }

    .paper-time {
      font-size: 11px;
      color: var(--el-text-color-placeholder);
    }

    .paper-status {
      flex-shrink: 0;
    }
  }
}

/* ============ 学情概览 ============ */
.learning-stats-card {
  .course-filter {
    width: 130px;
  }

  .learning-stats {
    .stat-item {
      margin-bottom: 14px;

      .stat-label {
        margin-bottom: 8px;
        font-size: 13px;
        color: var(--el-text-color-regular);
      }

      .stat-value-large {
        font-size: 26px;
        font-weight: 700;
        color: var(--el-color-primary);

        .stat-unit {
          margin-left: 4px;
          font-size: 12px;
          font-weight: normal;
          color: var(--el-text-color-secondary);
        }
      }
    }

    .view-detail-btn {
      width: 100%;
      height: 40px;
      margin-top: 6px;
      font-weight: 600;
      border-radius: 10px;
    }
  }
}

/* ============ 快捷入口 ============ */
.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  .quick-link-item {
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    padding: 18px 12px;
    cursor: pointer;
    background-color: var(--el-fill-color-extra-light);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 12px;
    transition: all 0.25s ease;

    &:hover {
      background-color: var(--el-fill-color-light);
      border-color: var(--el-color-primary-light-5);
      box-shadow: 0 4px 12px rgb(0 0 0 / 8%);
      transform: translateY(-2px);
    }

    .link-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      color: #fff;
      background: linear-gradient(
        135deg,
        var(--el-color-primary) 0%,
        var(--el-color-primary-light-3) 100%
      );
      border-radius: 10px;
      box-shadow: 0 4px 10px rgb(0 0 0 / 10%);

      &.papers {
        background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
      }

      &.stats {
        background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
      }

      &.templates {
        background: linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%);
      }

      svg {
        width: 22px;
        height: 22px;
      }
    }

    span {
      font-size: 13px;
      font-weight: 500;
      color: var(--el-text-color-primary);
    }
  }
}

/* ============ 深色模式适配 ============ */
.exam-paper-index.is-dark {
  .welcome-section {
    background: linear-gradient(135deg, #1e3a8a 0%, #7c2d12 100%);
    box-shadow: 0 4px 16px rgb(0 0 0 / 40%);

    .welcome-content {
      .welcome-badge {
        color: #fff;
        background: rgb(255 255 255 / 18%);
      }

      .welcome-title {
        color: #f1f5f9;
      }

      .welcome-desc {
        color: #cbd5e1;
      }
    }

    .quick-actions .create-btn {
      color: var(--el-color-primary);
      background: #f1f5f9;
    }
  }

  .stat-card {
    .stat-info .stat-value,
    .stat-info .stat-label {
      color: #f8fafc;
    }
  }
}

/* ============ 通用 SVG 描边样式 ============ */
:deep(.template-icon svg),
:deep(.paper-icon svg),
:deep(.link-icon svg),
:deep(.title-icon svg),
:deep(.stat-icon svg) {
  fill: none;
  stroke: currentColor;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

/* 响应式 */
@media (max-width: 768px) {
  .exam-paper-index {
    width: 100%;
    max-width: 100%;
    overflow-x: hidden;
    box-sizing: border-box;
    padding: 10px 8px calc(var(--pure-mobile-tab-height, 58px) + 24px);
  }

  .welcome-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 16px;
    margin-bottom: 12px;
    border-radius: 18px;

    .welcome-content {
      flex: 0 0 auto;
      width: 100%;
      min-width: 0;
    }

    .welcome-badge {
      margin-bottom: 8px;
      font-size: 12px;
    }

    .welcome-title {
      margin-bottom: 6px;
      font-size: 22px;
      line-height: 1.2;
    }

    .welcome-desc {
      font-size: 13px;
      line-height: 1.5;
    }

    .quick-actions {
      width: 100%;

      .create-btn {
        width: 100%;
        height: 38px;
        font-size: 13px;
      }
    }
  }

  .stats-section {
    margin-bottom: 12px;
  }

  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

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
        margin-top: 0;
        font-size: 12px;
        line-height: 1.35;
        white-space: normal;
      }
    }
  }

  .content-section,
  .overview-main-content,
  .side-content {
    gap: 12px;
  }

  .section-card {
    padding: 14px;
    border-radius: 18px;
  }
}

@media (max-width: 360px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style>
