<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useDark } from "@pureadmin/utils";
import { ElMessage, ElMessageBox } from "element-plus";

// 导入 SVG 图标组件
import IconDocument from "@/assets/home-icons/document.svg?component";
import IconFolder from "@/assets/home-icons/folder.svg?component";
import IconCheckCircle from "@/assets/home-icons/check-circle.svg?component";
import IconEdit from "@/assets/home-icons/edit.svg?component";
import IconClock from "@/assets/home-icons/clock.svg?component";

defineOptions({
  name: "ExamPaperMyPapers"
});

const router = useRouter();
const { isDark } = useDark();

// 搜索表单
const searchForm = reactive({
  keyword: "",
  status: "",
  courseId: ""
});

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 10,
  total: 3
});

// 试卷列表
const paperList = ref([
  {
    id: 1,
    title: "2024年春季期中考试",
    courseName: "高等数学",
    createTime: "2024-03-10 09:00",
    updateTime: "2024-03-15 14:30",
    status: 1,
    questionCount: 25,
    totalPoints: 100,
    publishCount: 2
  },
  {
    id: 2,
    title: "第三章单元测试",
    courseName: "线性代数",
    createTime: "2024-03-08 10:00",
    updateTime: "2024-03-14 10:20",
    status: 0,
    questionCount: 15,
    totalPoints: 50,
    publishCount: 0
  },
  {
    id: 3,
    title: "期末复习作业",
    courseName: "概率论",
    createTime: "2024-03-05 14:00",
    updateTime: "2024-03-13 16:45",
    status: 1,
    questionCount: 20,
    totalPoints: 80,
    publishCount: 1
  }
]);

const loading = ref(false);

// 课程列表
const courseList = ref([
  { id: 1, name: "高等数学" },
  { id: 2, name: "线性代数" },
  { id: 3, name: "概率论" }
]);

// 统计数据
const statistics = ref({
  total: 12,
  published: 8,
  draft: 4,
  recent: 3
});

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  loadData();
};

// 重置
const handleReset = () => {
  searchForm.keyword = "";
  searchForm.status = "";
  searchForm.courseId = "";
  handleSearch();
};

// 加载数据
const loadData = () => {
  loading.value = true;
  // 模拟加载
  setTimeout(() => {
    loading.value = false;
  }, 500);
};

// 创建新试卷
const createPaper = () => {
  router.push("/exam-paper/editor");
};

// 编辑试卷
const editPaper = (paper: any) => {
  router.push(`/exam-paper/editor/${paper.id}`);
};

// 复制试卷
const copyPaper = (paper: any) => {
  ElMessageBox.confirm(`确定要复制试卷"${paper.title}"吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "info"
  }).then(() => {
    ElMessage.success("复制成功");
  });
};

// 删除试卷
const deletePaper = (paper: any) => {
  ElMessageBox.confirm(`确定要删除试卷"${paper.title}"吗？`, "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    ElMessage.success("删除成功");
    loadData();
  });
};

// 发布试卷
const publishPaper = (paper: any) => {
  router.push(`/exam-paper/publish/${paper.id}`);
};

// 获取状态标签类型
const getStatusType = (status: number) => {
  return status === 1 ? "success" : "info";
};

// 获取状态文本
const getStatusText = (status: number) => {
  return status === 1 ? "已发布" : "草稿";
};

// 分页变化
const handlePageChange = () => {
  loadData();
};

onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="my-papers-page" :class="{ 'is-dark': isDark }">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <IconFolder />
        </div>
        <div class="header-info">
          <h1 class="page-title">我的试卷</h1>
          <p class="page-desc">
            管理您创建的所有试卷，支持编辑、发布和删除操作
          </p>
        </div>
      </div>
      <el-button
        type="primary"
        size="large"
        class="create-btn"
        @click="createPaper"
      >
        <el-icon class="mr-2"><Plus /></el-icon>
        新建试卷
      </el-button>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">
          <IconDocument />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.total }}</div>
          <div class="stat-label">试卷总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon published">
          <IconCheckCircle />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.published }}</div>
          <div class="stat-label">已发布</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon draft">
          <IconEdit />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.draft }}</div>
          <div class="stat-label">草稿</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon recent">
          <IconClock />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.recent }}</div>
          <div class="stat-label">近7天创建</div>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="试卷标题"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部"
            clearable
            style="width: 120px"
          >
            <el-option label="草稿" value="0" />
            <el-option label="已发布" value="1" />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select
            v-model="searchForm.courseId"
            placeholder="全部"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="course in courseList"
              :key="course.id"
              :label="course.name"
              :value="course.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon class="mr-1"><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon class="mr-1"><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 试卷列表 -->
    <div class="list-card">
      <el-table v-loading="loading" :data="paperList" class="paper-table">
        <el-table-column prop="title" label="试卷标题" min-width="200">
          <template #default="{ row }">
            <div class="paper-title-cell">
              <div class="paper-icon">
                <IconDocument />
              </div>
              <div class="paper-info">
                <el-link type="primary" @click="editPaper(row)">
                  {{ row.title }}
                </el-link>
                <span class="paper-course">{{ row.courseName }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="questionCount"
          label="题目数"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <span class="count-badge">{{ row.questionCount }}题</span>
          </template>
        </el-table-column>
        <el-table-column
          prop="totalPoints"
          label="总分"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <span class="score-badge">{{ row.totalPoints }}分</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              :type="getStatusType(row.status)"
              size="small"
              effect="light"
            >
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="publishCount"
          label="发布次数"
          width="100"
          align="center"
        />
        <el-table-column prop="updateTime" label="更新时间" width="160" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link size="small" @click="editPaper(row)">
              <el-icon class="mr-1"><Edit /></el-icon>
              编辑
            </el-button>
            <el-button
              type="success"
              link
              size="small"
              @click="publishPaper(row)"
            >
              <el-icon class="mr-1"><Upload /></el-icon>
              发布
            </el-button>
            <el-button type="warning" link size="small" @click="copyPaper(row)">
              <el-icon class="mr-1"><CopyDocument /></el-icon>
              复制
            </el-button>
            <el-button
              type="danger"
              link
              size="small"
              @click="deletePaper(row)"
            >
              <el-icon class="mr-1"><Delete /></el-icon>
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          background
          @change="handlePageChange"
        />
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

/* 统一圆角 */
$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16px;
$radius-xl: 20px;

.my-papers-page {
  min-height: 100%;
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
        background: rgba(102, 126, 234, 0.15);
        color: #818cf8;
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

    .search-card {
      background: $dark-card-bg;
      border-color: $dark-border;
      box-shadow: $dark-shadow;
    }

    .list-card {
      background: $dark-card-bg;
      border-color: $dark-border;
      box-shadow: $dark-shadow;

      .paper-title-cell {
        .paper-icon {
          background: rgba(102, 126, 234, 0.15);
          color: #818cf8;
        }

        .paper-course {
          color: $dark-text-muted;
        }
      }

      .count-badge,
      .score-badge {
        background: rgba(255, 255, 255, 0.05);
        color: $dark-text-secondary;
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
    background: $primary-gradient;
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

  .create-btn {
    height: 48px;
    padding: 0 28px;
    font-size: 15px;
    font-weight: 600;
    background: $primary-gradient;
    border: none;
    border-radius: 24px;
    box-shadow: 0 8px 20px rgba(102, 126, 234, 0.3);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 12px 28px rgba(102, 126, 234, 0.4);
      transform: translateY(-2px);
    }
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
      width: 56px;
      height: 56px;
      color: #fff;
      background: $primary-gradient;
      border-radius: $radius-md;

      &.published {
        background: $success-gradient;
      }

      &.draft {
        background: $warning-gradient;
      }

      &.recent {
        background: $info-gradient;
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

.search-card {
  padding: 20px 24px;
  margin-bottom: 24px;
  background: $light-card-bg;
  border: 1px solid $light-border;
  border-radius: $radius-lg;
  box-shadow: $light-shadow;

  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.list-card {
  padding: 24px;
  background: $light-card-bg;
  border: 1px solid $light-border;
  border-radius: $radius-lg;
  box-shadow: $light-shadow;

  .paper-table {
    :deep(.el-table__header th) {
      background: #f8fafc;
      font-weight: 600;
    }
  }

  .paper-title-cell {
    display: flex;
    gap: 12px;
    align-items: center;

    .paper-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 44px;
      height: 44px;
      color: #7c3aed;
      background: linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%);
      border-radius: $radius-sm;

      svg {
        width: 22px;
        height: 22px;
      }
    }

    .paper-info {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .paper-course {
        font-size: 12px;
        color: $light-text-muted;
      }
    }
  }

  .count-badge,
  .score-badge {
    display: inline-block;
    padding: 4px 10px;
    font-size: 13px;
    font-weight: 500;
    color: $light-text-secondary;
    background: #f1f5f9;
    border-radius: 6px;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
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
