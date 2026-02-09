<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";

defineOptions({
  name: "ExamPaperIndex"
});

const router = useRouter();

// 统计数据
const statistics = ref({
  totalPapers: 12,
  publishedCount: 8,
  gradingCount: 3,
  averageScore: 78.5
});

// 最近编辑的试卷
const recentPapers = ref([
  {
    id: 1,
    title: "2024年春季期中考试",
    courseName: "高等数学",
    updateTime: "2024-03-15 14:30",
    status: 1,
    questionCount: 25,
    totalPoints: 100
  },
  {
    id: 2,
    title: "第三章单元测试",
    courseName: "线性代数",
    updateTime: "2024-03-14 10:20",
    status: 0,
    questionCount: 15,
    totalPoints: 50
  },
  {
    id: 3,
    title: "期末复习作业",
    courseName: "概率论",
    updateTime: "2024-03-13 16:45",
    status: 1,
    questionCount: 20,
    totalPoints: 80
  }
]);

// 试卷模板
const templates = ref([
  {
    id: 1,
    name: "标准考试模板",
    description: "包含单选、多选、判断、填空、简答题型",
    icon: "ri:file-text-line",
    color: "#409eff"
  },
  {
    id: 2,
    name: "快速测验模板",
    description: "仅包含客观题，适合课堂小测",
    icon: "ri:timer-line",
    color: "#67c23a"
  },
  {
    id: 3,
    name: "综合能力测试",
    description: "包含材料分析、论述等主观题",
    icon: "ri:book-open-line",
    color: "#e6a23c"
  },
  {
    id: 4,
    name: "问卷调查模板",
    description: "矩阵题、量表题等调查类题型",
    icon: "ri:survey-line",
    color: "#909399"
  }
]);

// 学情概览数据
const learningStats = ref({
  passRate: 85,
  excellentRate: 32,
  averageScore: 78.5,
  participantCount: 156
});

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

onMounted(() => {
  // 加载数据
});
</script>

<template>
  <div class="exam-paper-index">
    <!-- 顶部欢迎区域 -->
    <div class="welcome-section">
      <div class="welcome-content">
        <h1 class="welcome-title">题目组卷器</h1>
        <p class="welcome-desc">
          创建、编辑和管理您的试卷，支持多种题型和智能AI辅助
        </p>
      </div>
      <div class="quick-actions">
        <el-button type="primary" size="large" @click="createNewPaper">
          <el-icon class="mr-2"><Plus /></el-icon>
          新建空白试卷
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <el-row :gutter="20" class="stats-row">
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #409eff">
            <el-icon :size="24"><Document /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.totalPapers }}</div>
            <div class="stat-label">试卷总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #67c23a">
            <el-icon :size="24"><CircleCheck /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.publishedCount }}</div>
            <div class="stat-label">已发布</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #e6a23c">
            <el-icon :size="24"><Edit /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.gradingCount }}</div>
            <div class="stat-label">待阅卷</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6">
        <el-card class="stat-card" shadow="hover">
          <div class="stat-icon" style="background: #909399">
            <el-icon :size="24"><TrendCharts /></el-icon>
          </div>
          <div class="stat-info">
            <div class="stat-value">{{ statistics.averageScore }}</div>
            <div class="stat-label">平均分</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <!-- 左侧：模板和最近试卷 -->
      <el-col :xs="24" :lg="16">
        <!-- 试卷模板 -->
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <span class="section-title">
                <el-icon class="mr-2"><Grid /></el-icon>
                从模板开始
              </span>
              <el-button text type="primary" @click="viewMoreTemplates">
                查看全部
                <el-icon class="ml-1"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
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
                <el-icon :size="32"><component :is="template.icon" /></el-icon>
              </div>
              <div class="template-info">
                <div class="template-name">{{ template.name }}</div>
                <div class="template-desc">{{ template.description }}</div>
              </div>
            </div>
          </div>
        </el-card>

        <!-- 最近编辑 -->
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <span class="section-title">
                <el-icon class="mr-2"><Clock /></el-icon>
                最近编辑
              </span>
              <el-button text type="primary" @click="viewMorePapers">
                查看全部
                <el-icon class="ml-1"><ArrowRight /></el-icon>
              </el-button>
            </div>
          </template>
          <div class="recent-papers">
            <div
              v-for="paper in recentPapers"
              :key="paper.id"
              class="paper-item"
              @click="editPaper(paper.id)"
            >
              <div class="paper-icon">
                <el-icon :size="40"><Document /></el-icon>
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
        </el-card>
      </el-col>

      <!-- 右侧：学情概览 -->
      <el-col :xs="24" :lg="8">
        <el-card class="section-card learning-stats-card">
          <template #header>
            <div class="section-header">
              <span class="section-title">
                <el-icon class="mr-2"><DataAnalysis /></el-icon>
                学情概览
              </span>
            </div>
          </template>
          <div class="learning-stats">
            <div class="stat-item">
              <div class="stat-label">及格率</div>
              <el-progress
                :percentage="learningStats.passRate"
                :stroke-width="12"
                status="success"
              />
            </div>
            <div class="stat-item">
              <div class="stat-label">优秀率</div>
              <el-progress
                :percentage="learningStats.excellentRate"
                :stroke-width="12"
                color="#409eff"
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
          </div>
          <el-button
            type="primary"
            plain
            class="view-detail-btn"
            @click="router.push('/exam-paper/statistics')"
          >
            查看详细分析
          </el-button>
        </el-card>

        <!-- 快捷入口 -->
        <el-card class="section-card">
          <template #header>
            <div class="section-header">
              <span class="section-title">
                <el-icon class="mr-2"><Operation /></el-icon>
                快捷入口
              </span>
            </div>
          </template>
          <div class="quick-links">
            <div
              class="quick-link-item"
              @click="router.push('/exam-paper/grading')"
            >
              <el-icon :size="24" color="#e6a23c"><Edit /></el-icon>
              <span>阅卷管理</span>
            </div>
            <div
              class="quick-link-item"
              @click="router.push('/exam-paper/my-papers')"
            >
              <el-icon :size="24" color="#409eff"><Folder /></el-icon>
              <span>我的试卷</span>
            </div>
            <div
              class="quick-link-item"
              @click="router.push('/exam-paper/statistics')"
            >
              <el-icon :size="24" color="#67c23a"><TrendCharts /></el-icon>
              <span>学情分析</span>
            </div>
            <div
              class="quick-link-item"
              @click="router.push('/exam-paper/templates')"
            >
              <el-icon :size="24" color="#909399"><Files /></el-icon>
              <span>试卷模板</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<style lang="scss" scoped>
.exam-paper-index {
  padding: 20px;
}

.welcome-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 30px;
  margin-bottom: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  color: #fff;

  .welcome-title {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 600;
  }

  .welcome-desc {
    margin: 0;
    font-size: 14px;
    opacity: 0.9;
  }
}

.stats-row {
  margin-bottom: 20px;
}

.stat-card {
  display: flex;
  align-items: center;
  padding: 20px;
  cursor: pointer;
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-4px);
  }

  .stat-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin-right: 16px;
    color: #fff;
    border-radius: 12px;
  }

  .stat-info {
    .stat-value {
      font-size: 28px;
      font-weight: 600;
      line-height: 1.2;
      color: #303133;
    }

    .stat-label {
      font-size: 14px;
      color: #909399;
    }
  }
}

.section-card {
  margin-bottom: 20px;

  .section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    .section-title {
      display: flex;
      align-items: center;
      font-size: 16px;
      font-weight: 600;
    }
  }
}

.templates-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;

  @media (width <= 768px) {
    grid-template-columns: 1fr;
  }
}

.template-card {
  display: flex;
  align-items: center;
  padding: 16px;
  cursor: pointer;
  background: #f5f7fa;
  border-radius: 8px;
  transition: all 0.3s;

  &:hover {
    background: #ecf5ff;
    transform: translateX(4px);
  }

  .template-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 56px;
    height: 56px;
    margin-right: 16px;
    color: #fff;
    border-radius: 12px;
  }

  .template-info {
    flex: 1;

    .template-name {
      margin-bottom: 4px;
      font-size: 15px;
      font-weight: 500;
      color: #303133;
    }

    .template-desc {
      font-size: 12px;
      color: #909399;
    }
  }
}

.recent-papers {
  .paper-item {
    display: flex;
    align-items: center;
    padding: 16px;
    cursor: pointer;
    border-bottom: 1px solid #ebeef5;
    transition: background 0.3s;

    &:last-child {
      border-bottom: none;
    }

    &:hover {
      background: #f5f7fa;
    }

    .paper-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 60px;
      height: 60px;
      margin-right: 16px;
      color: #409eff;
      background: #ecf5ff;
      border-radius: 8px;
    }

    .paper-info {
      flex: 1;

      .paper-title {
        margin-bottom: 4px;
        font-size: 15px;
        font-weight: 500;
        color: #303133;
      }

      .paper-meta {
        margin-bottom: 4px;
        font-size: 13px;
        color: #606266;

        .divider {
          margin: 0 8px;
          color: #dcdfe6;
        }
      }

      .paper-time {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}

.learning-stats-card {
  .learning-stats {
    .stat-item {
      margin-bottom: 20px;

      .stat-label {
        margin-bottom: 8px;
        font-size: 14px;
        color: #606266;
      }

      .stat-value-large {
        font-size: 32px;
        font-weight: 600;
        color: #303133;

        .stat-unit {
          font-size: 14px;
          font-weight: normal;
          color: #909399;
        }
      }
    }
  }

  .view-detail-btn {
    width: 100%;
  }
}

.quick-links {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;

  .quick-link-item {
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
    justify-content: center;
    padding: 20px;
    cursor: pointer;
    background: #f5f7fa;
    border-radius: 8px;
    transition: all 0.3s;

    &:hover {
      background: #ecf5ff;
      transform: translateY(-2px);
    }

    span {
      font-size: 13px;
      color: #606266;
    }
  }
}
</style>