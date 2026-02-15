<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useDark } from "@pureadmin/utils";
import { ElMessage } from "element-plus";
import {
  getStudentPaperList,
  getPaperDetail,
  type StudentPaperItem
} from "@/api/examPaper";

defineOptions({
  name: "StudentExamCenter"
});

const router = useRouter();
const { isDark } = useDark();

// 筛选条件
const activeTab = ref<"available" | "completed" | "expired">("available");
const searchQuery = ref("");
const selectedCourse = ref("");
const selectedStatus = ref("");

// 数据
const papers = ref<StudentPaperItem[]>([]);
const loading = ref(false);

// 分页
const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);

// 课程选项(从后端获取)
const courseOptions = ref([
  { id: 0, name: "全部课程" },
  { id: 1, name: "高等数学" },
  { id: 2, name: "大学英语" },
  { id: 3, name: "计算机基础" }
]);

// 统计数据
const statistics = ref({
  available: 0,
  completed: 0,
  expired: 0,
  avgScore: 0
});

// 过滤后的试卷列表
const filteredPapers = computed(() => {
  let result = papers.value;

  // 按标签页筛选
  if (activeTab.value === "available") {
    result = result.filter(p => p.status === "available");
  } else if (activeTab.value === "completed") {
    result = result.filter(p => p.status === "completed");
  } else if (activeTab.value === "expired") {
    result = result.filter(p => p.status === "expired");
  }

  // 按搜索关键词筛选
  if (searchQuery.value) {
    const keyword = searchQuery.value.toLowerCase();
    result = result.filter(
      p =>
        p.title.toLowerCase().includes(keyword) ||
        p.description?.toLowerCase().includes(keyword)
    );
  }

  // 按课程筛选
  if (selectedCourse.value && selectedCourse.value !== "0") {
    result = result.filter(p => p.courseId === Number(selectedCourse.value));
  }

  return result;
});

// 获取试卷列表
const fetchPapers = async () => {
  loading.value = true;
  try {
    const res = await getStudentPaperList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      status: activeTab.value,
      keyword: searchQuery.value || undefined,
      courseId: selectedCourse.value ? Number(selectedCourse.value) : undefined
    });
    if (res.code === 0) {
      papers.value = res.data.list;
      total.value = res.data.total;
      statistics.value = res.data.statistics || statistics.value;
    }
  } catch (error) {
    console.error("获取试卷列表失败:", error);
    ElMessage.error("获取试卷列表失败");
  } finally {
    loading.value = false;
  }
};

// 开始考试
const startExam = (paper: StudentPaperItem) => {
  if (paper.status !== "available") {
    ElMessage.warning("该试卷当前不可答题");
    return;
  }
  router.push(`/exam-paper/do/${paper.id}`);
};

// 查看详情
const viewDetail = (paper: StudentPaperItem) => {
  router.push(`/exam-paper/detail/${paper.id}`);
};

// 查看成绩
const viewScore = (paper: StudentPaperItem) => {
  if (paper.status !== "completed") {
    ElMessage.warning("该试卷尚未完成");
    return;
  }
  router.push(`/exam-paper/result/${paper.submissionId}`);
};

// 获取状态标签类型
const getStatusType = (
  status: string
): "success" | "warning" | "danger" | "info" => {
  switch (status) {
    case "available":
      return "success";
    case "completed":
      return "info";
    case "expired":
      return "danger";
    default:
      return "info";
  }
};

// 获取状态文本
const getStatusText = (status: string): string => {
  switch (status) {
    case "available":
      return "可答题";
    case "completed":
      return "已完成";
    case "expired":
      return "已过期";
    default:
      return "未知";
  }
};

// 格式化时间
const formatTime = (time: string): string => {
  if (!time) return "-";
  const date = new Date(time);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// 计算剩余时间
const getRemainingTime = (endTime: string): string => {
  if (!endTime) return "-";
  const now = new Date().getTime();
  const end = new Date(endTime).getTime();
  const diff = end - now;

  if (diff <= 0) return "已截止";

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

  if (days > 0) return `剩余${days}天`;
  if (hours > 0) return `剩余${hours}小时`;
  return "即将截止";
};

// 切换标签页
const handleTabChange = () => {
  currentPage.value = 1;
  fetchPapers();
};

// 搜索
const handleSearch = () => {
  currentPage.value = 1;
  fetchPapers();
};

// 分页变化
const handlePageChange = () => {
  fetchPapers();
};

onMounted(() => {
  fetchPapers();
});
</script>

<template>
  <div class="student-exam-center" :class="{ 'is-dark': isDark }">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="header-info">
          <h1 class="page-title">试题试卷中心</h1>
          <p class="page-desc">查看和完成老师发布的试卷</p>
        </div>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card available">
        <div class="stat-icon">
          <el-icon><DocumentChecked /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.available }}</div>
          <div class="stat-label">待完成</div>
        </div>
      </div>
      <div class="stat-card completed">
        <div class="stat-icon">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card expired">
        <div class="stat-icon">
          <el-icon><Clock /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.expired }}</div>
          <div class="stat-label">已过期</div>
        </div>
      </div>
      <div class="stat-card score">
        <div class="stat-icon">
          <el-icon><TrendCharts /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.avgScore }}</div>
          <div class="stat-label">平均分</div>
        </div>
      </div>
    </div>

    <!-- 筛选工具栏 -->
    <div class="filter-toolbar">
      <div class="toolbar-left">
        <el-tabs v-model="activeTab" @tab-change="handleTabChange">
          <el-tab-pane label="可答题" name="available">
            <template #label>
              <span class="tab-label">
                <el-icon><DocumentChecked /></el-icon>
                可答题
                <el-badge
                  v-if="statistics.available > 0"
                  :value="statistics.available"
                  class="tab-badge"
                />
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="已完成" name="completed">
            <template #label>
              <span class="tab-label">
                <el-icon><CircleCheck /></el-icon>
                已完成
              </span>
            </template>
          </el-tab-pane>
          <el-tab-pane label="已过期" name="expired">
            <template #label>
              <span class="tab-label">
                <el-icon><Clock /></el-icon>
                已过期
              </span>
            </template>
          </el-tab-pane>
        </el-tabs>
      </div>
      <div class="toolbar-right">
        <el-input
          v-model="searchQuery"
          placeholder="搜索试卷..."
          prefix-icon="Search"
          clearable
          style="width: 240px"
          @change="handleSearch"
          @clear="handleSearch"
        />
        <el-select
          v-model="selectedCourse"
          placeholder="选择课程"
          style="width: 160px"
          @change="handleSearch"
        >
          <el-option
            v-for="course in courseOptions"
            :key="course.id"
            :label="course.name"
            :value="String(course.id)"
          />
        </el-select>
      </div>
    </div>

    <!-- 试卷列表 -->
    <div v-loading="loading" class="papers-grid">
      <div
        v-for="paper in filteredPapers"
        :key="paper.id"
        class="paper-card"
        :class="paper.status"
      >
        <!-- 卡片头部 -->
        <div class="card-header">
          <div class="header-left">
            <el-tag :type="getStatusType(paper.status)" size="small">
              {{ getStatusText(paper.status) }}
            </el-tag>
            <span v-if="paper.courseName" class="course-tag">
              {{ paper.courseName }}
            </span>
          </div>
          <div v-if="paper.status === 'available'" class="remaining-time">
            <el-icon><Clock /></el-icon>
            <span>{{ getRemainingTime(paper.endTime) }}</span>
          </div>
        </div>

        <!-- 卡片内容 -->
        <div class="card-body">
          <h3 class="paper-title" @click="viewDetail(paper)">
            {{ paper.title }}
          </h3>
          <p v-if="paper.description" class="paper-desc">
            {{ paper.description }}
          </p>

          <div class="paper-meta">
            <div class="meta-item">
              <el-icon><Document /></el-icon>
              <span>{{ paper.totalQuestions }} 题</span>
            </div>
            <div class="meta-item">
              <el-icon><Star /></el-icon>
              <span>{{ paper.totalPoints }} 分</span>
            </div>
            <div class="meta-item">
              <el-icon><Timer /></el-icon>
              <span>{{ paper.timeLimit }} 分钟</span>
            </div>
          </div>

          <div class="paper-time">
            <div class="time-item">
              <span class="time-label">开始时间:</span>
              <span class="time-value">{{ formatTime(paper.startTime) }}</span>
            </div>
            <div class="time-item">
              <span class="time-label">截止时间:</span>
              <span class="time-value">{{ formatTime(paper.endTime) }}</span>
            </div>
          </div>

          <!-- 已完成显示成绩 -->
          <div v-if="paper.status === 'completed' && paper.score !== null" class="score-display">
            <div class="score-label">得分</div>
            <div class="score-value">{{ paper.score }}</div>
          </div>
        </div>

        <!-- 卡片底部操作 -->
        <div class="card-footer">
          <el-button
            v-if="paper.status === 'available'"
            type="primary"
            size="large"
            class="action-btn"
            @click="startExam(paper)"
          >
            <el-icon><Edit /></el-icon>
            开始答题
          </el-button>
          <el-button
            v-else-if="paper.status === 'completed'"
            type="success"
            size="large"
            class="action-btn"
            @click="viewScore(paper)"
          >
            <el-icon><View /></el-icon>
            查看成绩
          </el-button>
          <el-button
            v-else
            size="large"
            class="action-btn"
            disabled
          >
            <el-icon><Lock /></el-icon>
            已过期
          </el-button>
          <el-button
            link
            type="primary"
            @click="viewDetail(paper)"
          >
            查看详情
          </el-button>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="!loading && filteredPapers.length === 0" class="empty-state">
        <el-empty
          :description="
            activeTab === 'available'
              ? '暂无可答题的试卷'
              : activeTab === 'completed'
                ? '暂无已完成的试卷'
                : '暂无已过期的试卷'
          "
          :image-size="120"
        />
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="pagination-wrapper">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[12, 24, 36, 48]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        background
        @size-change="handlePageChange"
        @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
$primary-color: #00bfa5;
$success-color: #10b981;
$warning-color: #f59e0b;
$danger-color: #ef4444;
$info-color: #6b7280;

.student-exam-center {
  min-height: 100%;
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #f0f2f5 100%);

  &.is-dark {
    background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);

    .page-header,
    .stat-card,
    .filter-toolbar,
    .paper-card {
      background: rgba(30, 41, 59, 0.8);
      border-color: rgba(255, 255, 255, 0.1);
    }

    .page-title,
    .stat-value,
    .paper-title {
      color: #f1f5f9;
    }

    .page-desc,
    .stat-label,
    .paper-desc {
      color: #94a3b8;
    }
  }

  .page-header {
    display: flex;
    align-items: center;
    padding: 24px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    margin-bottom: 24px;

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      width: 56px;
      height: 56px;
      border-radius: 12px;
      background: linear-gradient(135deg, $primary-color 0%, #00a89f 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 28px;
      color: #fff;
    }

    .page-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 4px;
    }

    .page-desc {
      font-size: 14px;
      color: #6b7280;
      margin: 0;
    }
  }

  .stats-section {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 20px;
    margin-bottom: 24px;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 20px;
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      color: #fff;
    }

    &.available .stat-icon {
      background: linear-gradient(135deg, $success-color 0%, #34d399 100%);
    }

    &.completed .stat-icon {
      background: linear-gradient(135deg, $primary-color 0%, #00a89f 100%);
    }

    &.expired .stat-icon {
      background: linear-gradient(135deg, $danger-color 0%, #f87171 100%);
    }

    &.score .stat-icon {
      background: linear-gradient(135deg, $warning-color 0%, #fbbf24 100%);
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: #1f2937;
    }

    .stat-label {
      font-size: 14px;
      color: #6b7280;
    }
  }

  .filter-toolbar {
    background: #fff;
    border-radius: 12px;
    padding: 16px 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    margin-bottom: 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .toolbar-left {
      flex: 1;

      :deep(.el-tabs) {
        .el-tabs__header {
          margin: 0;
        }

        .el-tabs__nav-wrap::after {
          display: none;
        }

        .tab-label {
          display: flex;
          align-items: center;
          gap: 6px;

          .tab-badge {
            margin-left: 4px;
          }
        }
      }
    }

    .toolbar-right {
      display: flex;
      gap: 12px;
    }
  }

  .papers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
    gap: 20px;
    margin-bottom: 24px;
  }

  .paper-card {
    background: #fff;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
    overflow: hidden;
    transition: all 0.3s;
    border: 2px solid transparent;

    &:hover {
      transform: translateY(-4px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
    }

    &.available {
      border-color: rgba($success-color, 0.2);

      &:hover {
        border-color: $success-color;
      }
    }

    &.completed {
      border-color: rgba($primary-color, 0.2);

      &:hover {
        border-color: $primary-color;
      }
    }

    &.expired {
      opacity: 0.7;
      border-color: rgba($danger-color, 0.2);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      background: linear-gradient(135deg, #f9fafb 0%, #f5f7fa 100%);
      border-bottom: 1px solid #e5e7eb;

      .header-left {
        display: flex;
        align-items: center;
        gap: 8px;

        .course-tag {
          font-size: 12px;
          color: #6b7280;
          padding: 2px 8px;
          background: rgba(0, 191, 165, 0.1);
          border-radius: 4px;
        }
      }

      .remaining-time {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 13px;
        color: $warning-color;
        font-weight: 500;
      }
    }

    .card-body {
      padding: 20px;

      .paper-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 8px;
        color: #1f2937;
        cursor: pointer;
        transition: color 0.2s;

        &:hover {
          color: $primary-color;
        }
      }

      .paper-desc {
        font-size: 14px;
        color: #6b7280;
        margin: 0 0 16px;
        line-height: 1.5;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .paper-meta {
        display: flex;
        gap: 16px;
        margin-bottom: 16px;

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 13px;
          color: #6b7280;

          .el-icon {
            color: $primary-color;
          }
        }
      }

      .paper-time {
        padding: 12px;
        background: #f9fafb;
        border-radius: 8px;
        margin-bottom: 16px;

        .time-item {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          margin-bottom: 4px;

          &:last-child {
            margin-bottom: 0;
          }

          .time-label {
            color: #6b7280;
          }

          .time-value {
            color: #1f2937;
            font-weight: 500;
          }
        }
      }

      .score-display {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 16px;
        background: linear-gradient(135deg, rgba($primary-color, 0.1) 0%, rgba($primary-color, 0.05) 100%);
        border-radius: 8px;
        margin-top: 16px;

        .score-label {
          font-size: 14px;
          color: #6b7280;
        }

        .score-value {
          font-size: 32px;
          font-weight: 700;
          color: $primary-color;
        }
      }
    }

    .card-footer {
      padding: 16px 20px;
      background: #f9fafb;
      border-top: 1px solid #e5e7eb;
      display: flex;
      gap: 12px;

      .action-btn {
        flex: 1;
        font-weight: 500;
      }
    }
  }

  .empty-state {
    grid-column: 1 / -1;
    padding: 60px 0;
  }

  .pagination-wrapper {
    display: flex;
    justify-content: center;
    padding: 20px 0;
  }
}
</style>