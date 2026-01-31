<script setup lang="ts">
/**
 * 教师端- 课程讨论管理
 *教师可以管理所授课程的讨论内容，包括审核、置顶、删除等操作
 */
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Refresh,
  Check,
  Close,
  Delete,
  Top,
  View,
  MoreFilled
} from "@element-plus/icons-vue";
import {
  getTeacherDiscussions,
  getTeacherCourseStats,
  reviewPost,
  batchReview,
  batchDelete,
  type ReviewQueueItem
} from "@/api/discussion-admin";
import { pinPost, unpinPost, deleteDiscussion } from "@/api/discussion";

defineOptions({
  name: "TeacherDiscussionManage"
});

// 标签类型
type TagType = "danger" | "warning" | "info" | "success" | "primary";

// 状态
const loading = ref(false);
const discussions = ref<ReviewQueueItem[]>([]);
const selectedIds = ref<string[]>([]);
const detailDialogVisible = ref(false);
const currentDetail = ref<ReviewQueueItem | null>(null);

// 统计数据
const stats = ref({
  totalPosts: 0,
  totalReplies: 0,
  pendingReview: 0,
  pendingReports: 0,
  todayPosts: 0,
  weekPosts: 0,
  courses: [] as Array<{
    courseId: string;
    courseName: string;
    postCount: number;
    pendingCount: number;
  }>
});

// 搜索表单
const searchForm = reactive({
  courseId: "",
  status: "" as "" | "pending" | "approved" | "rejected",
  keyword: ""
});

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

// 状态选项
const statusOptions = [
  { label: "全部", value: "" },
  { label: "待审核", value: "pending" },
  { label: "已通过", value: "approved" },
  { label: "已拒绝", value: "rejected" }
];

// 状态标签样式
const statusTagType = (status: string): TagType => {
  const map: Record<string, TagType> = {
    pending: "warning",
    approved: "success",
    rejected: "danger",
    auto_approved: "success"
  };
  return map[status] || "info";
};

// 状态显示文本
const statusText = (status: string): string => {
  const map: Record<string, string> = {
    pending: "待审核",
    approved: "已通过",
    rejected: "已拒绝",
    auto_approved: "自动通过"
  };
  return map[status] || status;
};

// 风险等级标签
const riskLevelType = (level: string): TagType => {
  const map: Record<string, TagType> = {
    low: "success",
    medium: "warning",
    high: "danger",
    critical: "danger"
  };
  return map[level] || "info";
};

const riskLevelText = (level: string): string => {
  const map: Record<string, string> = {
    low: "低风险",
    medium: "中风险",
    high: "高风险",
    critical: "严重"
  };
  return map[level] || level;
};

// 加载数据
const fetchData = async () => {
  loading.value = true;
  try {
    const params: any = {
      page: pagination.page,
      pageSize: pagination.pageSize
    };
    if (searchForm.courseId) params.courseId = searchForm.courseId;
    if (searchForm.status) params.status = searchForm.status;
    if (searchForm.keyword) params.keyword = searchForm.keyword;

    const res = await getTeacherDiscussions(params);
    discussions.value = res.data.list;
    pagination.total = res.data.pagination.total;
  } catch (error) {
    console.error("加载讨论列表失败", error);
  } finally {
    loading.value = false;
  }
};

// 加载统计数据
const fetchStats = async () => {
  try {
    const res = await getTeacherCourseStats();
    stats.value = res;
  } catch (error) {
    console.error("加载统计数据失败", error);
  }
};

//搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchData();
};

// 重置搜索
const resetSearch = () => {
  searchForm.courseId = "";
  searchForm.status = "";
  searchForm.keyword = "";
  handleSearch();
};

// 分页变化
const handlePageChange = (page: number) => {
  pagination.page = page;
  fetchData();
};

const handleSizeChange = (size: number) => {
  pagination.pageSize = size;
  pagination.page = 1;
  fetchData();
};

// 选择变化
const handleSelectionChange = (rows: ReviewQueueItem[]) => {
  selectedIds.value = rows.map(r => r.id);
};

// 查看详情
const viewDetail = (row: ReviewQueueItem) => {
  currentDetail.value = row;
  detailDialogVisible.value = true;
};

// 审核通过
const handleApprove = async (row: ReviewQueueItem) => {
  try {
    await reviewPost(row.id, { action: "approve" });
    ElMessage.success("审核通过");
    fetchData();
    fetchStats();
  } catch (error) {
    ElMessage.error("操作失败");
  }
};

// 审核拒绝
const handleReject = async (row: ReviewQueueItem) => {
  try {
    const { value } = await ElMessageBox.prompt("请输入拒绝原因", "拒绝审核", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      inputPlaceholder: "请输入拒绝原因（选填）"
    });
    await reviewPost(row.id, { action: "reject", note: value });
    ElMessage.success("已拒绝");
    fetchData();
    fetchStats();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error("操作失败");
    }
  }
};

// 置顶/取消置顶
const handleTogglePin = async (row: ReviewQueueItem) => {
  try {
    if (row.isPinned) {
      await unpinPost(row.id);
      ElMessage.success("已取消置顶");
    } else {
      await pinPost(row.id);
      ElMessage.success("已置顶");
    }
    fetchData();
  } catch (error) {
    ElMessage.error("操作失败");
  }
};

// 删除
const handleDelete = async (row: ReviewQueueItem) => {
  try {
    await ElMessageBox.confirm("确定要删除这条讨论吗？", "提示", {
      type: "warning"
    });
    await deleteDiscussion(row.id);
    ElMessage.success("删除成功");
    fetchData();
    fetchStats();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

// 批量审核通过
const handleBatchApprove = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning("请选择要审核的内容");
    return;
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量通过 ${selectedIds.value.length} 条内容吗？`,
      "批量审核",
      { type: "info" }
    );
    const res = await batchReview({
      postIds: selectedIds.value,
      action: "approve"
    });
    ElMessage.success(`成功通过 ${res.success} 条，失败 ${res.failed} 条`);
    selectedIds.value = [];
    fetchData();
    fetchStats();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error("批量审核失败");
    }
  }
};

// 批量删除
const handleBatchDelete = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning("请选择要删除的内容");
    return;
  }
  try {
    await ElMessageBox.confirm(
      `确定要批量删除 ${selectedIds.value.length} 条内容吗？此操作不可恢复！`,
      "批量删除",
      { type: "warning" }
    );
    const res = await batchDelete({ postIds: selectedIds.value });
    ElMessage.success(`成功删除 ${res.success} 条，失败 ${res.failed} 条`);
    selectedIds.value = [];
    fetchData();
    fetchStats();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error("批量删除失败");
    }
  }
};

// 格式化时间
const formatTime = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

onMounted(() => {
  fetchData();
  fetchStats();
});
</script>

<template>
  <div class="discussion-manage p-4">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number text-primary">{{ stats.totalPosts }}</div>
            <div class="stat-label">帖子总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number text-success">{{ stats.totalReplies }}</div>
            <div class="stat-label">回复总数</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number text-warning">
              {{ stats.pendingReview }}
            </div>
            <div class="stat-label">待审核</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number text-info">{{ stats.todayPosts }}</div>
            <div class="stat-label">今日新增</div>
          </div>
        </el-card>
      </el-col></el-row>

    <!-- 搜索栏 -->
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="课程">
          <el-select
            v-model="searchForm.courseId"
            placeholder="全部课程"
            clearable
            style="width: 200px"
          >
            <el-option
              v-for="course in stats.courses"
              :key="course.courseId"
              :label="course.courseName"
              :value="course.courseId"
            ><span>{{ course.courseName }}</span>
              <el-badge
                v-if="course.pendingCount > 0"
                :value="course.pendingCount"
                class="ml-2"
                type="warning"
              />
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="全部状态"
            clearable
            style="width: 120px"
          >
            <el-option
              v-for="opt in statusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="关键词">
          <el-input
            v-model="searchForm.keyword"
            placeholder="搜索标题/内容"
            clearable
            style="width: 200px"
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            搜索
          </el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card shadow="never" class="mb-4">
      <div class="flex justify-between items-center">
        <div class="flex gap-2">
          <el-button
            type="success"
            :icon="Check"
            :disabled="selectedIds.length === 0"
            @click="handleBatchApprove"
          >
            批量通过
          </el-button>
          <el-button
            type="danger"
            :icon="Delete"
            :disabled="selectedIds.length === 0"
            @click="handleBatchDelete"
          >
            批量删除
          </el-button><span v-if="selectedIds.length > 0" class="ml-4text-gray-500">
            已选择 {{ selectedIds.length }} 项
          </span>
        </div>
        <el-button :icon="Refresh" @click="fetchData">刷新</el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="discussions"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="内容" min-width="320">
          <template #default="{ row }">
            <div class="post-content">
              <div class="post-header">
                <el-tag
                  v-if="row.isPinned"
                  size="small"
                  type="danger"
                  effect="dark"
                  class="pin-tag"
                ><el-icon class="mr-1"><Top /></el-icon>置顶
                </el-tag>
                <span class="post-title">{{ row.title || "(无标题)" }}</span></div>
              <div class="post-excerpt">
                {{ row.content.substring(0, 80) }}...
              </div>
              <div class="post-meta">
                <el-avatar
                  :size="18"
                  :src="row.author?.avatar"
                  class="meta-avatar"
                />
                <span class="meta-author">{{ row.author?.name }}</span>
                <el-divider direction="vertical" />
                <span class="meta-course">{{
                  row.courseName || "未知课程"
                }}</span>
                <el-divider direction="vertical" />
                <span class="meta-time">{{ formatTime(row.createdAt) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" size="small">
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="风险" width="90" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="row.riskLevel"
              :type="riskLevelType(row.riskLevel)"
              size="small"
            >
              {{ riskLevelText(row.riskLevel) }}
            </el-tag>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column label="统计" width="120" align="center">
          <template #default="{ row }">
            <div class="stats-info">
              <span class="stat-item" title="点赞">👍 {{ row.likeCount }}</span>
              <span class="stat-item" title="回复">💬 {{ row.replyCount }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="160" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-tooltip content="查看详情" placement="top">
                <el-button link type="primary" @click="viewDetail(row)">
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>
              <template v-if="row.status === 'pending'">
                <el-tooltip content="通过" placement="top">
                  <el-button link type="success" @click="handleApprove(row)">
                    <el-icon><Check /></el-icon>
                  </el-button>
                </el-tooltip>
                <el-tooltip content="拒绝" placement="top">
                  <el-button link type="warning" @click="handleReject(row)">
                    <el-icon><Close /></el-icon>
                  </el-button>
                </el-tooltip>
              </template>
              <el-dropdown trigger="click">
                <el-button link type="info">
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="handleTogglePin(row)">
                      <el-icon><Top /></el-icon>
                      {{ row.isPinned ? "取消置顶" : "置顶" }}
                    </el-dropdown-item>
                    <el-dropdown-item divided @click="handleDelete(row)">
                      <el-icon class="text-red-500"><Delete /></el-icon>
                      <span class="text-red-500">删除</span>
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="讨论详情"
      width="700px"
      destroy-on-close
    >
      <div v-if="currentDetail" class="detail-content">
        <div class="detail-header mb-4">
          <h3 class="text-lg font-medium">
            {{ currentDetail.title || "(无标题)" }}
          </h3>
          <div class="flex items-center gap-4mt-2 text-gray-500text-sm">
            <span>作者：{{ currentDetail.author?.name }}</span>
            <span>发布时间：{{ formatTime(currentDetail.createdAt) }}</span>
            <el-tag :type="statusTagType(currentDetail.status)" size="small">
              {{ statusText(currentDetail.status) }}
            </el-tag>
          </div>
        </div>

        <el-divider />

        <div class="detail-body">
          <div
            class="content-html prose max-w-none"
            v-html="currentDetail.contentHtml || currentDetail.content"
          />
        </div>

        <el-divider />

        <div class="detail-footer">
          <div class="flex items-center gap-4text-sm text-gray-500">
            <span>👍 {{ currentDetail.likeCount }} 点赞</span>
            <span>💬 {{ currentDetail.replyCount }} 回复</span>
            <span>👁 {{ currentDetail.viewCount }} 浏览</span>
          </div>
          <div v-if="currentDetail.tags?.length" class="mt-2">
            <el-tag
              v-for="tag in currentDetail.tags"
              :key="tag"
              size="small"
              class="mr-2"
            >
              {{ tag }}
            </el-tag>
          </div>
          <div
            v-if="currentDetail.matchedWords?.length"
            class="mt-3 p-3 bg-red-50 rounded"
          >
            <span class="text-red-600 font-medium">匹配敏感词：</span>
            <el-tag
              v-for="word in currentDetail.matchedWords"
              :key="word"
              type="danger"
              size="small"
              class="ml-2"
            >
              {{ word }}
            </el-tag>
          </div>
        </div>
      </div>

      <template #footer>
        <div class="flex justify-between">
          <div>
            <el-button
              v-if="currentDetail?.status === 'pending'"
              type="success"
              @click="
                handleApprove(currentDetail!);
                detailDialogVisible = false;
              "
            >
              审核通过
            </el-button>
            <el-button
              v-if="currentDetail?.status === 'pending'"
              type="warning"
              @click="
                handleReject(currentDetail!);
                detailDialogVisible = false;
              "
            >
              审核拒绝
            </el-button>
          </div>
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.discussion-manage {
  :deep(.el-card) {
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 12px 0 rgb(0 0 0 / 5%);
    transition: all 0.3s;

    html.dark & {
      box-shadow: 0 4px 12px 0 rgb(0 0 0 / 20%);
    }

    &:hover {
      box-shadow: 0 8px 24px 0 rgb(0 0 0 / 10%);

      html.dark & {
        box-shadow: 0 8px 24px 0 rgb(0 0 0 / 40%);
      }
    }
  }

  .stat-card {
    .stat-content {
      padding: 10px 0;
      text-align: center;

      .stat-number {
        font-size: 28px;
        font-weight: 600;
      }

      .stat-label {
        margin-top: 8px;
        font-size: 14px;
        color: #909399;
      }
    }
  }

  .search-form {
    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }

  .post-content {
    .post-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 8px;

      .pin-tag {
        flex-shrink: 0;
        display: inline-flex;
        align-items: center;
      }

      .post-title {
        font-weight: 500;
        color: #303133;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
    }

    .post-excerpt {
      font-size: 13px;
      color: #606266;
      line-height: 1.5;
      margin-bottom: 8px;display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .post-meta {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #909399;

      .meta-avatar {
        flex-shrink: 0;
        margin-right: 4px;
      }

      .meta-author {
        max-width: 80px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .meta-course {
        max-width: 100px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .meta-time {
        flex-shrink: 0;}

      :deep(.el-divider--vertical) {
        margin: 0 8px;
      }
    }
  }

  .stats-info {
    display: flex;
    justify-content: center;
    gap: 12px;
    font-size: 13px;
    color: #606266;

    .stat-item {
      display: inline-flex;
      align-items: center;
      gap: 2px;
    }
  }

  .action-btns {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;

    :deep(.el-button) {
      padding: 4px 6px;

      .el-icon {
        font-size: 16px;
      }
    }
  }

  .detail-content {
    .content-html {
      line-height: 1.8;

      :deep(p) {
        margin-bottom: 1em;
      }

      :deep(code) {
        padding: 2px 6px;
        background: #f5f5f5;
        border-radius: 4px;
      }

      :deep(pre) {
        padding: 12px;
        overflow-x: auto;
        background: #f5f5f5;
        border-radius: 8px;
      }
    }
  }
}
</style>