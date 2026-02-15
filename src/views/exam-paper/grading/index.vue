<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useDark } from "@pureadmin/utils";
import { ElMessage } from "element-plus";
import {
  getGradingStatistics,
  getGradingPaperList,
  autoGradeObjective
} from "@/api/examPaper";

// 导入 SVG 图标组件
import IconEdit from "@/assets/home-icons/edit.svg?component";
import IconClock from "@/assets/home-icons/clock.svg?component";
import IconCheckCircle from "@/assets/home-icons/check-circle.svg?component";
import IconDocument from "@/assets/home-icons/document.svg?component";
import IconClipboard from "@/assets/home-icons/clipboard.svg?component";

defineOptions({
  name: "ExamPaperGrading"
});

const router = useRouter();
const { isDark } = useDark();

// 搜索条件
const searchForm = reactive({
  keyword: "",
  status: "",
  courseId: null as number | null
});

// 课程列表
const courseList = ref([
  { id: 1, name: "高等数学" },
  { id: 2, name: "线性代数" },
  { id: 3, name: "概率论" }
]);

// 状态选项
const statusOptions = [
  { value: "pending", label: "待阅卷" },
  { value: "grading", label: "阅卷中" },
  { value: "completed", label: "已完成" }
];

// 统计数据
const statistics = ref({
  pending: 0,
  grading: 0,
  completed: 0,
  total: 0
});

// 待阅卷列表
const gradingList = ref<any[]>([]);

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 3
});

// 加载状态
const loading = ref(false);

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await getGradingStatistics();
    if (res.code === 0 && res.data) {
      statistics.value = res.data;
    }
  } catch (e) {
    console.error("获取阅卷统计失败", e);
  }
};

// 搜索/加载列表
const handleSearch = async () => {
  loading.value = true;
  try {
    const res = await getGradingPaperList({
      pageNum: pagination.currentPage,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      status: (searchForm.status as any) || undefined,
      courseId: searchForm.courseId || undefined
    });
    if (res.code === 0 && res.data) {
      gradingList.value = res.data.list || [];
      pagination.total = res.data.total || 0;
    }
  } catch (e) {
    console.error("获取阅卷列表失败", e);
  } finally {
    loading.value = false;
  }
};

// 重置搜索
const handleReset = () => {
  searchForm.keyword = "";
  searchForm.status = "";
  searchForm.courseId = null;
  handleSearch();
};

// 进入阅卷
const handleGrade = (row: any) => {
  router.push(`/exam-paper/grading/${row.id}`);
};

// 批量自动批改客观题
const handleAutoGrade = async (row: any) => {
  try {
    const res = await autoGradeObjective(row.id);
    if (res.code === 0) {
      ElMessage.success(`已自动批改 ${res.data.gradedCount} 份客观题`);
      loadStatistics();
      handleSearch();
    } else {
      ElMessage.error(res.msg || "自动批改失败");
    }
  } catch (error) {
    console.error("自动批改失败:", error);
    ElMessage.error("自动批改失败");
  }
};

// 查看详情
const handleView = (row: any) => {
  router.push(`/exam-paper/grading/${row.id}/detail`);
};

// 获取状态标签类型
const getStatusType = (
  status: string
): "success" | "warning" | "info" | "primary" | "danger" => {
  const types: Record<
    string,
    "success" | "warning" | "info" | "primary" | "danger"
  > = {
    pending: "warning",
    grading: "primary",
    completed: "success"
  };
  return types[status] || "info";
};

// 获取状态文本
const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    pending: "待阅卷",
    grading: "阅卷中",
    completed: "已完成"
  };
  return texts[status] || "未知";
};

// 计算进度百分比
const getProgress = (row: any) => {
  if (row.studentCount === 0) return 0;
  return Math.round((row.gradedCount / row.studentCount) * 100);
};

// 分页变化
const handlePageChange = (page: number) => {
  pagination.currentPage = page;
  handleSearch();
};

onMounted(() => {
  loadStatistics();
  handleSearch();
});
</script>

<template>
  <div class="grading-container" :class="{ 'is-dark': isDark }">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <IconClipboard />
        </div>
        <div class="header-info">
          <h1 class="page-title">阅卷管理</h1>
          <p class="page-desc">管理和批阅学生提交的试卷答案</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon pending">
          <IconClock />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.pending }}</div>
          <div class="stat-label">待阅卷</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon grading">
          <IconEdit />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.grading }}</div>
          <div class="stat-label">阅卷中</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon completed">
          <IconCheckCircle />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon total">
          <IconDocument />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.total }}</div>
          <div class="stat-label">总答卷数</div>
        </div>
      </div>
    </div>

    <!-- 搜索区域 -->
    <div class="search-card">
      <el-form :model="searchForm" inline>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="试卷名称"
            clearable
            style="width: 200px"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部状态"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="item in statusOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="课程">
          <el-select
            v-model="searchForm.courseId"
            placeholder="全部课程"
            clearable
            style="width: 160px"
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

    <!-- 阅卷列表 -->
    <div class="list-card">
      <el-table v-loading="loading" :data="gradingList" class="grading-table">
        <el-table-column prop="paperTitle" label="试卷名称" min-width="200">
          <template #default="{ row }">
            <div class="paper-info-cell">
              <div class="paper-icon">
                <IconDocument />
              </div>
              <div class="paper-details">
                <span class="paper-title">{{ row.paperTitle }}</span>
                <span class="paper-course">{{ row.courseName }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="studentCount"
          label="答卷数"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <span class="count-badge">{{ row.studentCount }}</span>
          </template>
        </el-table-column>
        <el-table-column label="阅卷进度" width="220">
          <template #default="{ row }">
            <div class="progress-info">
              <el-progress
                :percentage="getProgress(row)"
                :status="row.status === 'completed' ? 'success' : ''"
                :stroke-width="10"
              />
              <span class="progress-text">
                {{ row.gradedCount }}/{{ row.studentCount }}
              </span>
            </div>
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
          prop="deadline"
          label="截止时间"
          width="120"
          align="center"
        />
        <el-table-column
          prop="publishTime"
          label="发布时间"
          width="160"
          align="center"
        />
        <el-table-column label="操作" width="280" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status !== 'completed'"
              type="primary"
              size="small"
              @click="handleGrade(row)"
            >
              <el-icon class="mr-1"><Edit /></el-icon>
              阅卷
            </el-button>
            <el-button
              v-if="row.status !== 'completed'"
              type="success"
              size="small"
              @click="handleAutoGrade(row)"
            >
              <el-icon class="mr-1"><MagicStick /></el-icon>
              自动批改
            </el-button>
            <el-button size="small" @click="handleView(row)">
              <el-icon class="mr-1"><View /></el-icon>
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          :page-size="pagination.pageSize"
          :total="pagination.total"
          layout="total, prev, pager, next"
          background
          @current-change="handlePageChange"
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
$danger-gradient: linear-gradient(135deg, #ef4444 0%, #f87171 100%);

/* 统一圆角 */
$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16px;
$radius-xl: 20px;

.grading-container {
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

      .paper-info-cell {
        .paper-icon {
          background: rgba(102, 126, 234, 0.15);
          color: #818cf8;
        }

        .paper-course {
          color: $dark-text-muted;
        }

        .paper-title {
          color: $dark-text-primary;
        }
      }

      .count-badge {
        background: rgba(255, 255, 255, 0.05);
        color: $dark-text-secondary;
      }

      .progress-text {
        color: $dark-text-muted;
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
    background: $warning-gradient;
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
      border-radius: $radius-md;

      &.pending {
        background: $danger-gradient;
      }

      &.grading {
        background: $info-gradient;
      }

      &.completed {
        background: $success-gradient;
      }

      &.total {
        background: $warning-gradient;
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

  .grading-table {
    :deep(.el-table__header th) {
      background: #f8fafc;
      font-weight: 600;
    }
  }

  .paper-info-cell {
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

    .paper-details {
      display: flex;
      flex-direction: column;
      gap: 4px;

      .paper-title {
        font-weight: 500;
        color: $light-text-primary;
      }

      .paper-course {
        font-size: 12px;
        color: $light-text-muted;
      }
    }
  }

  .count-badge {
    display: inline-block;
    padding: 4px 12px;
    font-size: 14px;
    font-weight: 600;
    color: $light-text-secondary;
    background: #f1f5f9;
    border-radius: 6px;
  }

  .progress-info {
    display: flex;
    gap: 12px;
    align-items: center;

    .el-progress {
      flex: 1;
    }

    .progress-text {
      font-size: 12px;
      color: $light-text-muted;
      white-space: nowrap;
    }
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
