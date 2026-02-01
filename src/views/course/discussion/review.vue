<script setup lang="ts">
/**
 * 教师端- 课程讨论管理
 *教师可以管理所授课程的讨论内容，包括审核、置顶、删除等操作
 */
import { ref, reactive, onMounted, onActivated, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Refresh,
  Check,
  Close,
  Delete,
  Top,
  MoreFilled
} from "@element-plus/icons-vue";
import {
  getAdminDiscussions,
  getAdminDiscussionDetail,
  getTeacherCourseStats,
  type ReviewQueueItem
} from "@/api/discussion-admin";
import { getCourseList } from "@/api/course";
import type { DiscussionPost } from "@/api/discussion";
import HeartIcon from "@/assets/commentareasrelatedsvgs/heart-svgrepo-com.svg?component";
import CommentIcon from "@/assets/commentareasrelatedsvgs/comment-lines-svgrepo-com.svg?component";
import TrendIcon from "@/assets/commentareasrelatedsvgs/trend-up-svgrepo-com.svg?component";
import InfoIcon from "@/assets/commentareasrelatedsvgs/information-circle-svgrepo-com.svg?component";

defineOptions({
  name: "TeacherDiscussionManage"
});

// 标签类型
type TagType = "danger" | "warning" | "info" | "success" | "primary";

// 状态
const loading = ref(false);
const discussions = ref<ReviewQueueItem[]>([]);
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
  keyword: "",
  type: "all" as "all" | "post" | "reply" // 类型筛选：全部/帖子/回复
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

// 类型选项（帖子/回复）
const typeOptions = [
  { label: "全部", value: "all" },
  { label: "帖子", value: "post" },
  { label: "回复", value: "reply" }
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

// 加载数据- 使用 getAdminDiscussions 获取已发布的讨论列表
const fetchData = async () => {
  loading.value = true;
  try {
    if (searchForm.courseId) {
      // 如果选择了课程，直接获取该课程的讨论列表
      const res = await getAdminDiscussions(searchForm.courseId, {
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: "latest"
      });
      // 转换为 ReviewQueueItem 格式
      discussions.value = res.data.list.map(item => ({
        ...item,
        riskLevel: "low" as const,
        matchedWords: [],
        priority: "medium" as const,
        courseName:
          stats.value.courses.find(c => c.courseId === searchForm.courseId)
            ?.courseName || ""
      })) as ReviewQueueItem[];
      pagination.total = res.data.pagination.total;
    } else {
      // 没有选择课程，获取所有课程的讨论列表
      const allDiscussions: ReviewQueueItem[] = [];
      let totalCount = 0;

      // 先确保课程列表已加载
      if (stats.value.courses.length === 0) {
        await fetchStats();
      }

      // 遍历所有课程获取讨论
      for (const course of stats.value.courses) {
        try {
          const res = await getAdminDiscussions(course.courseId, {
            page: 1,
            pageSize: 100,
            sortBy: "latest"
          });
          const items = res.data.list.map(item => ({
            ...item,
            riskLevel: "low" as const,
            matchedWords: [],
            priority: "medium" as const,
            courseName: course.courseName
          })) as ReviewQueueItem[];
          allDiscussions.push(...items);
          totalCount += res.data.pagination.total;
        } catch (err) {
          console.error(`获取课程 ${course.courseId} 讨论失败:`, err);
        }
      }

      // 分页处理
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      discussions.value = allDiscussions.slice(startIndex, endIndex);
      pagination.total = totalCount;
    }
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
    if (res?.courses && res.courses.length > 0) {
      stats.value = res;
      return;
    }
  } catch (error) {
    console.error("getTeacherCourseStats 失败，尝试备用方案", error);
  }

  // 备用方案：使用 getCourseList 获取课程列表
  try {
    console.log("使用 getCourseList 作为备用方案获取课程列表");
    const courseRes = await getCourseList({ pageNum: 1, pageSize: 100 });
    const courseData = (courseRes as any)?.data || courseRes;
    if (courseData?.courseList && courseData.courseList.length > 0) {
      stats.value.courses = courseData.courseList.map((course: any) => ({
        courseId: String(course.courseId),
        courseName: course.title,
        postCount: 0,
        pendingCount: 0
      }));
      console.log("备用方案获取课程列表成功:", stats.value.courses);
    } else {
      console.warn("备用方案也没有获取到课程列表");
    }
  } catch (backupError) {
    console.error("备用方案获取课程列表也失败", backupError);
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
  searchForm.type = "all";
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

// 查看详情
const viewDetail = async (row: ReviewQueueItem) => {
  try {
    // 调用详情接口获取完整信息
    const res = await getAdminDiscussionDetail(row.id);
    if (res && res.data) {
      // 转换为 ReviewQueueItem 格式
      currentDetail.value = {
        ...res.data,
        riskLevel: "low" as const,
        matchedWords: [],
        priority: "medium" as const,
        courseName: res.data.courseName
      } as ReviewQueueItem;
    } else {
      // 如果获取详情失败，使用列表中的数据
      currentDetail.value = row;
    }
    detailDialogVisible.value = true;
  } catch (error) {
    console.error("获取讨论详情失败:", error);
    // 出错时使用列表中的数据
    currentDetail.value = row;
    detailDialogVisible.value = true;
  }
};

// 格式化时间
const formatTime = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// 数据是否已加载的标志
const dataLoaded = ref(false);

// 初始化加载数据
const initData = async (force = false) => {
  // 防止重复加载
  if (loading.value || (dataLoaded.value && !force)) {
    console.log(
      "[review.vue] initData 跳过, loading:",
      loading.value,
      "dataLoaded:",
      dataLoaded.value,
      "force:",
      force
    );
    return;
  }

  console.log("[review.vue] initData 开始执行, force:", force);
  await fetchStats();
  console.log(
    "[review.vue] fetchStats 完成,课程数量:",
    stats.value.courses.length
  );
  await fetchData();
  console.log(
    "[review.vue] fetchData 完成, 讨论数量:",
    discussions.value.length
  );
  dataLoaded.value = true;
  console.log("[review.vue] initData 执行完成");
};

const route = useRoute();

// 生成唯一的组件实例 ID，用于调试
const instanceId = Math.random().toString(36).substring(7);
console.log("[review.vue] 组件实例创建, instanceId:", instanceId);

// 使用 onMounted 确保组件已挂载后再加载数据
onMounted(() => {
  console.log("[review.vue] onMounted 触发, instanceId:", instanceId);
  // 使用 setTimeout 延迟加载，确保路由完全稳定
  setTimeout(() => {
    console.log("[review.vue] setTimeout 回调, dataLoaded:", dataLoaded.value);
    if (!dataLoaded.value) {
      initData();
    }
  }, 100);
});

// 当组件从 keep-alive 缓存中被激活时重新加载数据
onActivated(() => {
  console.log("[review.vue] onActivated 触发, instanceId:", instanceId);
  dataLoaded.value = false; // 重置标志以允许重新加载
  initData();
});
</script>

<template>
  <div class="discussion-manage">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-6">
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number text-primary">{{ stats.totalPosts }}</div>
            <div class="stat-label">库内讨论总量</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number text-success">{{ stats.totalReplies }}</div>
            <div class="stat-label">学生互动回复</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number text-warning">
              {{ stats.pendingReview }}
            </div>
            <div class="stat-label">当前待处理审查</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="12" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number text-info">{{ stats.todayPosts }}</div>
            <div class="stat-label">今日活跃动态</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card shadow="never" class="mb-4">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="归属课程">
          <el-select
            v-model="searchForm.courseId"
            placeholder="筛选对应课程"
            clearable
            style="width: 220px"
          >
            <el-option
              v-for="course in stats.courses"
              :key="course.courseId"
              :label="course.courseName"
              :value="course.courseId"
            >
              <div class="flex justify-between items-center">
                <span>{{ course.courseName }}</span>
                <el-tag
                  v-if="course.pendingCount > 0"
                  size="small"
                  type="warning"
                  effect="light"
                  round
                >
                  {{ course.pendingCount }}
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="审核状态">
          <el-select
            v-model="searchForm.status"
            placeholder="状态筛选"
            clearable
            style="width: 140px"
          >
            <el-option
              v-for="opt in statusOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="模糊搜索">
          <el-input
            v-model="searchForm.keyword"
            placeholder="内容/标题关键字"
            clearable
            style="width: 220px"
            @keyup.enter="handleSearch"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            查询
          </el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <div class="flex justify-end mb-4">
        <el-button :icon="Refresh" link @click="initData(true)"
          >同步状态</el-button
        >
      </div>
      <el-table
        v-loading="loading"
        :data="discussions"
        row-class-name="discussion-table-row"
      >
        <el-table-column label="讨论详情" min-width="350">
          <template #default="{ row }">
            <div class="post-content">
              <div class="post-header">
                <el-tag
                  v-if="row.isPinned"
                  size="small"
                  type="danger"
                  effect="dark"
                  class="pin-tag"
                >
                  <el-icon :size="12" class="mr-1"><Top /></el-icon>精选置顶
                </el-tag>
                <span class="post-title">{{ row.title || "(无标题)" }}</span>
              </div>
              <div class="post-excerpt">
                {{ row.content.substring(0, 100)
                }}{{ row.content.length > 100 ? "..." : "" }}
              </div>
              <div class="post-meta">
                <div class="meta-item">
                  <el-avatar :size="20" :src="row.author?.avatar" />
                  <span class="meta-author">{{ row.author?.name }}</span>
                </div>
                <el-divider direction="vertical" />
                <div class="meta-item">
                  <span>{{ row.courseName || "未知课程" }}</span>
                </div>
                <el-divider direction="vertical" />
                <div class="meta-item">
                  <el-icon :size="16"><Clock /></el-icon>
                  <span>{{ formatTime(row.createdAt) }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="statusTagType(row.status)" effect="light" round>
              {{ statusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="AI 预警" width="100" align="center">
          <template #default="{ row }">
            <el-tag
              v-if="row.riskLevel"
              :type="riskLevelType(row.riskLevel)"
              effect="dark"
              size="small"
              round
            >
              {{ riskLevelText(row.riskLevel) }}
            </el-tag>
            <span v-else class="text-gray-300">-</span>
          </template>
        </el-table-column>
        <el-table-column label="内容热度" width="160" align="center">
          <template #default="{ row }">
            <div class="stats-info">
              <div class="stat-item" title="认可度">
                <el-icon :size="18" class="mr-1 text-red-500"
                  ><HeartIcon
                /></el-icon>
                <span>{{ row.likeCount }}</span>
              </div>
              <div class="stat-item" title="研讨数">
                <el-icon :size="18" class="mr-1 text-blue-500"
                  ><CommentIcon
                /></el-icon>
                <span>{{ row.replyCount }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="详情" width="100" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-tooltip content="查看详情" placement="top">
                <div class="btn-icon-wrapper view" @click="viewDetail(row)">
                  <el-icon :size="18"><InfoIcon /></el-icon>
                </div>
              </el-tooltip>
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
      title="讨论详情审阅"
      width="800px"
      destroy-on-close
      class="custom-dialog"
    >
      <div v-if="currentDetail" class="detail-content">
        <div class="grid grid-cols-3 gap-6 mb-6">
          <div class="col-span-2">
            <!-- 标题与内容 -->
            <div class="detail-main">
              <div class="flex items-center gap-3 mb-4">
                <el-tag
                  :type="statusTagType(currentDetail.status)"
                  effect="dark"
                  round
                >
                  {{ statusText(currentDetail.status) }}
                </el-tag>
                <h3 class="text-xl font-bold text-gray-900 dark:text-gray-100">
                  {{ currentDetail.title || "(无标题)" }}
                </h3>
              </div>

              <div
                class="content-body p-6 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm"
              >
                <div
                  class="content-html prose dark:prose-invert max-w-none text-gray-700 leading-relaxed"
                  v-html="currentDetail.contentHtml || currentDetail.content"
                />
              </div>

              <!-- 统计与标签 -->
              <div class="flex flex-wrap items-center gap-4 mt-6">
                <div
                  class="flex items-center gap-8 text-sm text-gray-500 bg-gray-50 dark:bg-gray-800/50 px-6 py-3 rounded-lg"
                >
                  <span class="flex items-center gap-2">
                    <el-icon :size="20" class="text-red-500"
                      ><HeartIcon
                    /></el-icon>
                    <span
                      class="font-medium text-base text-gray-900 dark:text-gray-100"
                      >{{ currentDetail.likeCount || 0 }}</span
                    >
                    认可
                  </span>
                  <span class="flex items-center gap-2">
                    <el-icon :size="20" class="text-blue-500"
                      ><CommentIcon
                    /></el-icon>
                    <span
                      class="font-medium text-base text-gray-900 dark:text-gray-100"
                      >{{ currentDetail.replyCount || 0 }}</span
                    >
                    研讨
                  </span>
                  <span class="flex items-center gap-2">
                    <el-icon :size="20" class="text-orange-500"
                      ><TrendIcon
                    /></el-icon>
                    <span
                      class="font-medium text-base text-gray-900 dark:text-gray-100"
                      >{{ currentDetail.viewCount || 0 }}</span
                    >
                    浏览
                  </span>
                </div>
                <div v-if="currentDetail.tags?.length" class="flex gap-2">
                  <el-tag
                    v-for="tag in currentDetail.tags"
                    :key="tag"
                    size="small"
                    effect="plain"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>

          <div class="col-span-1 space-y-4">
            <!-- 侧边栏卡片 -->
            <div class="info-card p-5 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4
                class="text-xs font-bold text-gray-400 uppercase mb-4 tracking-tighter"
              >
                发布者信息
              </h4>
              <div class="flex items-center gap-3 mb-4">
                <el-avatar :size="40" :src="currentDetail.author?.avatar" />
                <div>
                  <div
                    class="font-bold text-sm text-gray-900 dark:text-gray-100"
                  >
                    {{ currentDetail.author?.name }}
                  </div>
                  <div class="text-xs text-gray-400">
                    ID: {{ currentDetail.author?.id?.substring(0, 8) }}
                  </div>
                </div>
              </div>
              <div
                class="text-xs text-gray-500 space-y-2 pt-2 border-t border-gray-200 dark:border-gray-700"
              >
                <div class="flex justify-between">
                  <span>所属课程</span>
                  <span class="text-gray-700 dark:text-gray-300 font-medium">{{
                    currentDetail.courseName || "未知"
                  }}</span>
                </div>
                <div class="flex justify-between">
                  <span>发布于</span>
                  <span class="text-gray-700 dark:text-gray-300">{{
                    formatTime(currentDetail.createdAt)
                  }}</span>
                </div>
              </div>
            </div>

            <!-- 风险预警卡片 -->
            <div
              v-if="currentDetail.matchedWords?.length"
              class="info-card p-5 bg-red-50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900/30"
            >
              <h4
                class="text-xs font-bold text-red-600 dark:text-red-400 uppercase mb-3"
              >
                AI 敏感词预警
              </h4>
              <div class="flex flex-wrap gap-1">
                <el-tag
                  v-for="word in currentDetail.matchedWords"
                  :key="word"
                  type="danger"
                  size="small"
                >
                  {{ word }}
                </el-tag>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div
          class="flex justify-end items-center bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-100 dark:border-gray-700"
        >
          <el-button size="large" @click="detailDialogVisible = false"
            >关闭</el-button
          >
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.discussion-manage {
  :deep(.el-card) {
    border: none;
    border-radius: 8px;
    box-shadow:
      0 1px 3px 0 rgb(0 0 0 / 0.1),
      0 1px 2px -1px rgb(0 0 0 / 0.1);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    overflow: hidden;

    html.dark & {
      background-color: #242424;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.3);
    }

    &:hover {
      transform: translateY(-2px);
      box-shadow:
        0 10px 15px -3px rgb(0 0 0 / 0.1),
        0 4px 6px -4px rgb(0 0 0 / 0.1);

      html.dark & {
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.5);
      }
    }
  }

  .stat-card {
    .stat-content {
      padding: 12px 0;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;

      .stat-number {
        font-size: 32px;
        font-weight: 700;
        line-height: 1;
        margin-bottom: 8px;

        &.text-primary {
          color: #3b82f6;
        }
        &.text-success {
          color: #10b981;
        }
        &.text-warning {
          color: #f59e0b;
        }
        &.text-info {
          color: #6366f1;
        }
      }

      .stat-label {
        font-size: 14px;
        font-weight: 500;
        color: #64748b;

        html.dark & {
          color: #94a3b8;
        }
      }
    }
  }

  .search-form {
    padding: 4px 8px;
    :deep(.el-form-item) {
      margin-bottom: 0;
      margin-right: 24px;
    }

    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      border-radius: 8px;
      box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    }
  }

  .post-content {
    .post-header {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 6px;

      .pin-tag {
        flex-shrink: 0;
        border-radius: 6px;
      }

      .post-title {
        font-size: 16px;
        font-weight: 600;
        color: #1e293b;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;

        html.dark & {
          color: #f1f5f9;
        }
      }
    }

    .post-excerpt {
      font-size: 14px;
      color: #64748b;
      line-height: 1.6;
      margin-bottom: 10px;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      html.dark & {
        color: #94a3b8;
      }
    }

    .post-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
      color: #94a3b8;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .meta-author {
        font-weight: 500;
        color: #475569;

        html.dark & {
          color: #cbd5e1;
        }
      }

      :deep(.el-divider--vertical) {
        margin: 0;
        height: 12px;
        border-color: #e2e8f0;

        html.dark & {
          border-color: #334155;
        }
      }
    }
  }

  .stats-info {
    display: flex;
    justify-content: center;
    gap: 16px;

    .stat-item {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 14px;
      background: #f1f5f9;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      color: #475569;
      transition: all 0.2s;

      html.dark & {
        background: #334155;
        color: #cbd5e1;
      }

      &:hover {
        transform: translateY(-1px);
        background: #e2e8f0;
        box-shadow: 0 2px 4px -1px rgb(0 0 0 / 0.06);

        html.dark & {
          background: #475569;
        }
      }
    }
  }

  .action-btns {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;

    .btn-icon-wrapper {
      padding: 8px;
      border-radius: 10px;
      transition: all 0.2s;
      cursor: pointer;
      color: #64748b;

      &:hover {
        background: rgba(0, 0, 0, 0.05);
        transform: scale(1.1);
      }

      &.approve:hover {
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
      }
      &.reject:hover {
        color: #f59e0b;
        background: rgba(245, 158, 11, 0.1);
      }
      &.view:hover {
        color: #3b82f6;
        background: rgba(59, 130, 246, 0.1);
      }
      &.more:hover {
        color: #6366f1;
        background: rgba(99, 102, 241, 0.1);
      }
    }
  }

  .detail-content {
    .content-html {
      line-height: 1.8;
      font-size: 15px;

      :deep(p) {
        margin-bottom: 1.25em;
      }

      :deep(img) {
        border-radius: 8px;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      }
    }
  }
}

/* 按钮样式修正 */
.el-button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 6px;

  &:not(.is-disabled):active {
    transform: scale(0.95);
  }
}

/* 下拉菜单美化 */
:deep(.modern-dropdown) {
  border-radius: 12px !important;
  padding: 6px !important;
  border: none !important;
  box-shadow:
    0 10px 15px -3px rgb(0 0 0 / 0.1),
    0 4px 6px -4px rgb(0 0 0 / 0.1) !important;

  .el-dropdown-menu__item {
    border-radius: 8px !important;
    margin-bottom: 2px !important;
    padding: 10px 16px !important;
    font-weight: 500 !important;
    transition: all 0.2s !important;

    &:last-child {
      margin-bottom: 0 !important;
    }

    &:hover {
      background-color: #f1f5f9 !important;
      color: #3b82f6 !important;

      html.dark & {
        background-color: #334155 !important;
        color: #60a5fa !important;
      }
    }

    &.delete-item:hover {
      background-color: #fef2f2 !important;
      color: #ef4444 !important;

      html.dark & {
        background-color: #450a0a !important;
        color: #f87171 !important;
      }
    }

    .el-icon {
      margin-right: 8px !important;
      font-size: 16px !important;
    }
  }

  :deep(.el-dropdown-menu__item--divided) {
    margin-top: 6px !important;
    border-top: 1px solid #f1f5f9 !important;

    html.dark & {
      border-top-color: #334155 !important;
    }

    &::before {
      display: none !important;
    }
  }
}

/* 滚动条美化 */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}

::-webkit-scrollbar-track {
  background: transparent;
}
</style>

<style lang="scss">
/* 详情弹窗样式 */
.custom-dialog {
  border-radius: 12px !important;
  overflow: hidden;

  .el-dialog__header {
    margin-right: 0;
    padding: 20px 24px;
    border-bottom: 1px solid #f1f5f9;

    html.dark & {
      border-bottom-color: #334155;
    }

    .el-dialog__title {
      font-size: 18px;
      font-weight: 600;
    }
  }

  .el-dialog__body {
    padding: 24px !important;
  }

  .el-dialog__footer {
    padding: 0 !important;
  }
}

/* 全局下拉菜单样式修正 */
.el-popper.modern-dropdown {
  border-radius: 12px !important;
  border: 1px solid #f1f5f9 !important;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1) !important;
  background: white !important;
  padding: 0 !important; /* 关键：移除容器内边距 */

  html.dark & {
    border-color: #334155 !important;
    background-color: #1e1e1e !important;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3) !important;
  }

  /* 移除内部嵌套组件的默认背景和边框 */
  .el-scrollbar,
  .el-dropdown-menu {
    border: none !important;
    background: transparent !important;
    border-radius: 12px !important;
  }

  .el-dropdown-menu {
    padding: 6px !important;
  }

  /* 修正小箭头颜色与边框 */
  .el-popper__arrow::before {
    background: white !important;
    border-color: #f1f5f9 !important;
  }

  html.dark & .el-popper__arrow::before {
    background: #1e1e1e !important;
    border-color: #334155 !important;
  }

  .el-dropdown-menu__item {
    border-radius: 8px !important;
    margin-bottom: 2px !important;
    padding: 10px 16px !important;
    font-size: 14px !important;
    font-weight: 500 !important;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;

    &:last-child {
      margin-bottom: 0 !important;
    }

    &:hover {
      background-color: #eff6ff !important;
      color: #2563eb !important;

      html.dark & {
        background-color: #1e3a8a !important;
        color: #60a5fa !important;
      }
    }

    &.delete-item:hover {
      background-color: #fef2f2 !important;
      color: #dc2626 !important;

      html.dark & {
        background-color: #450a0a !important;
        color: #f87171 !important;
      }
    }

    .el-icon {
      margin-right: 8px !important;
      font-size: 16px !important;
    }
  }

  .el-dropdown-menu__item--divided {
    margin-top: 6px !important;
    border-top: 1px solid #f1f5f9 !important;

    html.dark & {
      border-top-color: #334155 !important;
    }

    &::before {
      display: none !important;
    }
  }
}
</style>
