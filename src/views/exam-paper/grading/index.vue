<script setup lang="ts">
import { ref, reactive } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

defineOptions({
  name: "ExamPaperGrading"
});

const router = useRouter();

//搜索条件
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

// 待阅卷列表
const gradingList = ref([
  {
    id: 1,
    paperTitle: "2024年春季期中考试",
    courseName: "高等数学",
    studentCount: 45,
    gradedCount: 30,
    pendingCount: 15,
    status: "grading",
    deadline: "2024-04-20",
    publishTime: "2024-04-1509:00"
  },
  {
    id: 2,
    paperTitle: "第三章单元测试",
    courseName: "线性代数",
    studentCount: 38,
    gradedCount: 38,
    pendingCount: 0,
    status: "completed",
    deadline: "2024-04-18",
    publishTime: "2024-04-10 14:00"
  },
  {
    id: 3,
    paperTitle: "期末模拟考试",
    courseName: "概率论",
    studentCount: 42,
    gradedCount: 0,
    pendingCount: 42,
    status: "pending",
    deadline: "2024-04-25",
    publishTime: "2024-04-22 10:00"
  }
]);

// 分页
const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 3
});

// 加载状态
const loading = ref(false);

// 搜索
const handleSearch = () => {
  loading.value = true;
  setTimeout(() => {
    loading.value = false;
    ElMessage.success("搜索完成");
  }, 500);
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

// 查看详情
const handleView = (row: any) => {
  router.push(`/exam-paper/grading/${row.id}/detail`);
};

// 获取状态标签类型
const getStatusType = (status: string) => {
  const types: Record<string, string> = {
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
</script>

<template>
  <div class="grading-container">
    <!-- 页面标题 -->
    <div class="page-header">
      <h2 class="page-title">阅卷管理</h2>
      <p class="page-desc">管理和批阅学生提交的试卷答案</p>
    </div>

    <!-- 搜索区域 -->
    <el-card class="search-card" shadow="never">
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
          <el-button type="primary" @click="handleSearch"
            ><el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 统计卡片 -->
    <div class="stats-row">
      <el-card class="stat-card" shadow="never">
        <div class="stat-icon pending">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">3</div>
          <div class="stat-label">待阅卷</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="never">
        <div class="stat-icon grading">
          <el-icon><Edit /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">1</div>
          <div class="stat-label">阅卷中</div>
        </div>
      </el-card>
      <el-card class="stat-card" shadow="never">
        <div class="stat-icon completed">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">15</div>
          <div class="stat-label">已完成</div>
        </div> </el-card
      ><el-card class="stat-card" shadow="never">
        <div class="stat-icon total">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">125</div>
          <div class="stat-label">总答卷数</div>
        </div>
      </el-card>
    </div>

    <!-- 阅卷列表 -->
    <el-card class="list-card" shadow="never">
      <el-table v-loading="loading" :data="gradingList" stripe>
        <el-table-column prop="paperTitle" label="试卷名称" min-width="200">
          <template #default="{ row }">
            <div class="paper-info">
              <span class="paper-title">{{ row.paperTitle }}</span>
              <span class="paper-course">{{ row.courseName }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="studentCount"
          label="答卷数"
          width="100"
          align="center"
        />
        <el-table-column label="阅卷进度" width="200">
          <template #default="{ row }">
            <div class="progress-info">
              <el-progress
                :percentage="getProgress(row)"
                :status="row.status === 'completed' ? 'success' : ''"
                :stroke-width="8"
              />
              <span class="progress-text">
                {{ row.gradedCount }}/{{ row.studentCount }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
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
        <el-table-column label="操作" width="180" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status !== 'completed'"
              type="primary"
              size="small"
              @click="handleGrade(row)"
            >
              <el-icon><Edit /></el-icon>
              阅卷
            </el-button>
            <el-button size="small" @click="handleView(row)">
              <el-icon><View /></el-icon>
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
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<style lang="scss" scoped>
.grading-container {
  padding: 20px;
}

.page-header {
  margin-bottom: 20px;

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

.search-card {
  margin-bottom: 20px;

  :deep(.el-card__body) {
    padding-bottom: 2px;
  }
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;

  .stat-card {
    :deep(.el-card__body) {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;

      &.pending {
        background: #fef0f0;
        color: #f56c6c;
      }

      &.grading {
        background: #ecf5ff;
        color: #409eff;
      }

      &.completed {
        background: #f0f9eb;
        color: #67c23a;
      }

      &.total {
        background: #fdf6ec;
        color: #e6a23c;
      }
    }

    .stat-info {
      .stat-value {
        font-size: 28px;
        font-weight: 600;
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

.list-card {
  .paper-info {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .paper-title {
      font-weight: 500;
      color: #303133;
    }

    .paper-course {
      font-size: 12px;
      color: #909399;
    }
  }

  .progress-info {
    display: flex;
    align-items: center;
    gap: 12px;

    .el-progress {
      flex: 1;
    }

    .progress-text {
      font-size: 12px;
      color: #909399;
      white-space: nowrap;
    }
  }

  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
}
</style>
