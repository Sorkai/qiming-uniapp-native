<script setup lang="ts">
/**
 * 教师端 - 内容审核队列
 * 教师可以审核所授课程中待审核的讨论内容
 */
import { ref, reactive, onMounted, onActivated, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Search,
  Refresh,
  Check,
  Close,
  View,
  Warning,
  Clock
} from "@element-plus/icons-vue";
import {
  getAdminDiscussions,
  getAdminDiscussionDetail,
  reviewPost,
  batchReview,
  getTeacherCourseStats,
  type ReviewQueueItem
} from "@/api/discussion-admin";
import { getCourseList } from "@/api/course";

defineOptions({
  name: "TeacherReviewQueue"
});

// 标签类型
type TagType = "danger" | "warning" | "info" | "success" | "primary";

// 状态
const loading = ref(false);
const reviewItems = ref<ReviewQueueItem[]>([]);
const selectedIds = ref<string[]>([]);
const detailDialogVisible = ref(false);
const currentDetail = ref<ReviewQueueItem | null>(null);

// 统计数据
const stats = ref({
  pending: 0,
  highPriority: 0,
  avgWaitTime: "0小时",
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
  priority: "" as "" | "high" | "medium" | "low"
});

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 20,
  total: 0
});

// 优先级选项
const priorityOptions = [
  { label: "全部", value: "" },
  { label: "高优先级", value: "high" },
  { label: "中优先级", value: "medium" },
  { label: "低优先级", value: "low" }
];

// 优先级标签样式
const priorityTagType = (priority: string): TagType => {
  const map: Record<string, TagType> = {
    high: "danger",
    medium: "warning",
    low: "info"
  };
  return map[priority] || "info";
};

const priorityText = (priority: string): string => {
  const map: Record<string, string> = {
    high: "高",
    medium: "中",
    low: "低"
  };
  return map[priority] || priority;
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
    // 如果选择了课程，直接获取该课程的讨论列表
    if (searchForm.courseId) {
      const res = await getAdminDiscussions(searchForm.courseId, {
        page: pagination.page,
        pageSize: pagination.pageSize,
        sortBy: "latest"
      });
      // 转换为 ReviewQueueItem 格式
      reviewItems.value = res.data.list.map(item => ({
        ...item,
        riskLevel: "low" as const,
        matchedWords: [],
        priority: "medium" as const,
        courseName:
          stats.value.courses.find(c => c.courseId === searchForm.courseId)
            ?.courseName || ""
      })) as ReviewQueueItem[];
      pagination.total = res.data.pagination.total;
      stats.value.pending = res.data.pagination.total;
    } else {
      // 没有选择课程，获取所有课程的讨论列表
      const allItems: ReviewQueueItem[] = [];
      let totalCount = 0;

      // 先确保课程列表已加载
      if (stats.value.courses.length === 0) {
        await fetchCourses();
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
          allItems.push(...items);
          totalCount += res.data.pagination.total;
        } catch (err) {
          console.error(`获取课程 ${course.courseId} 讨论失败:`, err);
        }
      }

      // 分页处理
      const startIndex = (pagination.page - 1) * pagination.pageSize;
      const endIndex = startIndex + pagination.pageSize;
      reviewItems.value = allItems.slice(startIndex, endIndex);
      pagination.total = totalCount;
      stats.value.pending = totalCount;
    }
  } catch (error) {
    console.error("加载审核队列失败", error);
  } finally {
    loading.value = false;
  }
};

// 加载课程列表
const fetchCourses = async () => {
  try {
    const res = await getTeacherCourseStats();
    if (res?.courses && res.courses.length > 0) {
      stats.value.courses = res.courses;
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

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchData();
};

// 重置搜索
const resetSearch = () => {
  searchForm.courseId = "";
  searchForm.priority = "";
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

// 审核通过
const handleApprove = async (row: ReviewQueueItem) => {
  try {
    await reviewPost(row.id, { action: "approve" });
    ElMessage.success("审核通过");
    fetchData();
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
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error("操作失败");
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
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error("批量审核失败");
    }
  }
};

// 批量审核拒绝
const handleBatchReject = async () => {
  if (selectedIds.value.length === 0) {
    ElMessage.warning("请选择要审核的内容");
    return;
  }
  try {
    const { value } = await ElMessageBox.prompt(
      `确定要批量拒绝 ${selectedIds.value.length} 条内容吗？`,
      "批量拒绝",
      {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        inputPlaceholder: "请输入拒绝原因（选填）",
        type: "warning"
      }
    );
    const res = await batchReview({
      postIds: selectedIds.value,
      action: "reject",
      note: value
    });
    ElMessage.success(`成功拒绝 ${res.success} 条，失败 ${res.failed} 条`);
    selectedIds.value = [];
    fetchData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error("批量审核失败");
    }
  }
};

// 格式化时间
const formatTime = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// 计算等待时间
const getWaitTime = (dateStr: string) => {
  if (!dateStr) return "-";
  const now = new Date();
  const created = new Date(dateStr);
  const diffMs = now.getTime() - created.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

  if (diffHours > 24) {
    const days = Math.floor(diffHours / 24);
    return `${days}天${diffHours % 24}小时`;
  }
  if (diffHours > 0) {
    return `${diffHours}小时${diffMins}分钟`;
  }
  return `${diffMins}分钟`;
};

// 处理详情弹窗审核通过
const handleDetailApprove = () => {
  if (currentDetail.value) {
    handleApprove(currentDetail.value);
    detailDialogVisible.value = false;
  }
};

// 处理详情弹窗审核拒绝
const handleDetailReject = () => {
  if (currentDetail.value) {
    handleReject(currentDetail.value);
    detailDialogVisible.value = false;
  }
};

// 数据是否已加载的标志
const dataLoaded = ref(false);

// 初始化加载数据
const initData = async () => {
  // 防止重复加载
  if (loading.value || dataLoaded.value) return;

  console.log("[index.vue] initData 开始执行");
  await fetchCourses();
  await fetchData();
  dataLoaded.value = true;
  console.log("[index.vue] initData 执行完成");
};

const route = useRoute();

// 监听路由名称变化，当路由名称存在时加载数据
// 根据 vue-pure-admin 的路由机制，route.name 存在表示动态路由已完全初始化
// 这是解决页面刷新时数据不加载的关键
watch(
  () => route.name,
  newName => {
    console.log("[index.vue] 路由 name 变化:", newName);
    // 当路由名称存在时加载数据
    if (newName && !dataLoaded.value) {
      console.log("[index.vue] 开始加载数据");
      initData();
    }
  },
  { immediate: true }
);

// 当组件从 keep-alive 缓存中被激活时重新加载数据
onActivated(() => {
  console.log("[index.vue] onActivated 触发");
  dataLoaded.value = false; // 重置标志以允许重新加载
  initData();
});
</script>

<template>
  <div class="review-queue p-4">
    <!-- 统计卡片 -->
    <el-row :gutter="20" class="mb-6">
      <el-col :xs="8" :sm="8" :md="8">
        <el-card shadow="hover" class="stat-card pending">
          <div class="stat-content">
            <div class="stat-icon warning">
              <el-icon :size="30"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.pending }}</div>
              <div class="stat-label">待审核内容</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="8" :sm="8" :md="8">
        <el-card shadow="hover" class="stat-card high">
          <div class="stat-content">
            <div class="stat-icon danger">
              <el-icon :size="30"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.highPriority }}</div>
              <div class="stat-label">高风险预警</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="8" :sm="8" :md="8">
        <el-card shadow="hover" class="stat-card avg">
          <div class="stat-content">
            <div class="stat-icon info">
              <el-icon :size="30"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.avgWaitTime }}</div>
              <div class="stat-label">平均处理时效</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏 -->
    <el-card shadow="never" class="mb-4 search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="所属课程">
          <el-select
            v-model="searchForm.courseId"
            placeholder="筛选课程"
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
                  effect="plain"
                  round
                >
                  {{ course.pendingCount }}
                </el-tag>
              </div>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="优先级">
          <el-select
            v-model="searchForm.priority"
            placeholder="内容优先级"
            clearable
            style="width: 150px"
          >
            <el-option
              v-for="opt in priorityOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleSearch">
            查询审核
          </el-button>
          <el-button :icon="Refresh" @click="resetSearch">重置条件</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 操作栏 -->
    <el-card shadow="never" class="mb-4 action-bar">
      <div class="flex justify-between items-center">
        <div class="flex gap-4 items-center">
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
            :icon="Close"
            :disabled="selectedIds.length === 0"
            @click="handleBatchReject"
          >
            批量拒绝
          </el-button>
          <div v-if="selectedIds.length > 0" class="batch-info animate-pulse">
            <el-icon class="mr-1"><Warning /></el-icon>
            已选中 {{ selectedIds.length }} 个待审项
          </div>
        </div>
        <el-button :icon="Refresh" plain @click="initData">同步数据</el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never" class="data-card">
      <el-table
        v-loading="loading"
        :data="reviewItems"
        row-class-name="review-table-row"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="讨论内容" min-width="400">
          <template #default="{ row }">
            <div class="review-content">
              <div class="content-title">
                {{ row.title || "(无标题)" }}
              </div>
              <div class="content-excerpt">
                {{ row.content.substring(0, 150)
                }}{{ row.content.length > 150 ? "..." : "" }}
              </div>
              <div class="content-meta">
                <div class="meta-item">
                  <el-avatar :size="20" :src="row.author?.avatar" />
                  <span class="font-medium text-gray-700 dark:text-gray-300">
                    {{ row.author?.name }}
                  </span>
                </div>
                <div class="meta-item">
                  <el-icon><View /></el-icon>
                  <span>{{ row.courseName || "未知课程" }}</span>
                </div>
                <div class="meta-item">
                  <el-icon><Clock /></el-icon>
                  <span>{{ formatTime(row.createdAt) }}</span>
                </div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="priorityTagType(row.priority)" effect="light" round>
              {{ priorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="风险评估" width="110" align="center">
          <template #default="{ row }">
            <el-tag
              :type="riskLevelType(row.riskLevel)"
              effect="dark"
              round
              size="small"
            >
              {{ riskLevelText(row.riskLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="命词词库" width="160">
          <template #default="{ row }">
            <div v-if="row.matchedWords?.length" class="flex flex-wrap gap-1">
              <el-tag
                v-for="word in row.matchedWords.slice(0, 2)"
                :key="word"
                type="danger"
                size="small"
                effect="plain"
              >
                {{ word }}
              </el-tag>
              <el-tooltip
                v-if="row.matchedWords.length > 2"
                :content="row.matchedWords.slice(2).join(', ')"
              >
                <el-tag type="info" size="small" effect="plain">
                  +{{ row.matchedWords.length - 2 }}
                </el-tag>
              </el-tooltip>
            </div>
            <span v-else class="text-gray-300">-</span>
          </template>
        </el-table-column>
        <el-table-column label="等待已久" width="120" align="center">
          <template #default="{ row }">
            <div
              class="flex flex-col items-center"
              :class="{
                'text-red-500 font-bold': getWaitTime(row.createdAt).includes(
                  '天'
                )
              }"
            >
              <span class="text-xs text-gray-400 mb-1">已等待</span>
              <span class="text-sm">
                {{ getWaitTime(row.createdAt) }}
              </span>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          label="审核操作"
          width="160"
          align="center"
          fixed="right"
        >
          <template #default="{ row }">
            <div class="action-btns">
              <el-tooltip content="进入详情审核" placement="top">
                <div class="btn-icon-wrapper view" @click="viewDetail(row)">
                  <el-icon :size="18"><View /></el-icon>
                </div>
              </el-tooltip>
              <el-tooltip content="直接通过" placement="top">
                <div
                  class="btn-icon-wrapper approve"
                  @click="handleApprove(row)"
                >
                  <el-icon :size="18"><Check /></el-icon>
                </div>
              </el-tooltip>
              <el-tooltip content="违规拒绝" placement="top">
                <div class="btn-icon-wrapper reject" @click="handleReject(row)">
                  <el-icon :size="18"><Close /></el-icon>
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
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="内容审核详情"
      width="800px"
      destroy-on-close
      border-radius="16px"
      class="custom-dialog"
    >
      <div v-if="currentDetail" class="review-detail px-2">
        <!-- 风险提示 -->
        <el-alert
          v-if="
            currentDetail.riskLevel === 'high' ||
            currentDetail.riskLevel === 'critical'
          "
          type="error"
          :closable="false"
          show-icon
          class="mb-6 rounded-xl"
        >
          <template #title>
            <span class="font-bold text-base">系统预警：检测到高风险内容</span>
          </template>
          <template #default>
            <div class="mt-1">
              该内容已被系统算法标记为高风险，请审慎阅读并严格把关。
              <div v-if="currentDetail.matchedWords?.length" class="mt-2">
                <span class="font-medium opacity-80">命中敏感词：</span>
                <el-tag
                  v-for="word in currentDetail.matchedWords"
                  :key="word"
                  type="danger"
                  size="small"
                  class="mr-1"
                >
                  {{ word }}
                </el-tag>
              </div>
            </div>
          </template>
        </el-alert>

        <div class="grid grid-cols-3 gap-6 mb-6">
          <div class="col-span-2">
            <!-- 内容 -->
            <div class="content-section">
              <div class="flex items-center justify-between mb-4">
                <h3 class="text-lg font-bold text-gray-800 dark:text-gray-200">
                  讨论正文
                </h3>
                <el-tag
                  :type="priorityTagType(currentDetail.priority)"
                  effect="dark"
                >
                  {{ priorityText(currentDetail.priority) }} 优先级
                </el-tag>
              </div>
              <div
                class="content-box p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm"
              >
                <h4
                  v-if="currentDetail.title"
                  class="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100"
                >
                  {{ currentDetail.title }}
                </h4>
                <div
                  class="content-html prose dark:prose-invert max-w-none text-gray-700 leading-relaxed"
                  v-html="currentDetail.contentHtml || currentDetail.content"
                />
              </div>
            </div>
          </div>

          <div class="col-span-1 space-y-6">
            <!-- 侧边栏信息 -->
            <div class="info-card p-5 bg-gray-50 dark:bg-gray-800 rounded-2xl">
              <h4
                class="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4"
              >
                发布者信息
              </h4>
              <div class="flex items-center gap-3 mb-4">
                <el-avatar :size="48" :src="currentDetail.author?.avatar" />
                <div>
                  <div class="font-bold text-gray-900 dark:text-gray-100">
                    {{ currentDetail.author?.name }}
                  </div>
                  <div class="text-xs text-gray-500">
                    UID: {{ currentDetail.author?.id?.substring(0, 8) }}
                  </div>
                </div>
              </div>
              <div class="space-y-3">
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">所属课程</span>
                  <span class="font-medium truncate ml-2">{{
                    currentDetail.courseName || "未知课程"
                  }}</span>
                </div>
                <div class="flex justify-between text-sm">
                  <span class="text-gray-500">发布时间</span>
                  <span class="font-medium">{{
                    formatTime(currentDetail.createdAt)
                  }}</span>
                </div>
              </div>
            </div>

            <div
              class="info-card p-5 bg-orange-50 dark:bg-orange-950/20 rounded-2xl border border-orange-100 dark:border-orange-900/30"
            >
              <h4
                class="text-sm font-bold text-orange-600 dark:text-orange-400 uppercase tracking-wider mb-4"
              >
                审核状态
              </h4>
              <div class="space-y-4">
                <div>
                  <div class="text-xs text-orange-600/70 mb-1">等待时长</div>
                  <div
                    class="text-lg font-bold"
                    :class="{
                      'text-red-500': getWaitTime(
                        currentDetail.createdAt
                      ).includes('天')
                    }"
                  >
                    {{ getWaitTime(currentDetail.createdAt) }}
                  </div>
                </div>
                <div>
                  <div class="text-xs text-orange-600/70 mb-1">风险等级</div>
                  <el-tag
                    :type="riskLevelType(currentDetail.riskLevel)"
                    effect="dark"
                  >
                    {{ riskLevelText(currentDetail.riskLevel) }}
                  </el-tag>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <div
          class="flex justify-between items-center bg-gray-50 dark:bg-gray-800 -mx-5 -mb-5 px-6 py-4 rounded-b-2xl"
        >
          <div class="text-sm text-gray-500 italic">
            请确认内容符合社区准则后再予以通过
          </div>
          <div class="flex gap-3">
            <el-button size="large" @click="detailDialogVisible = false">
              暂时跳过
            </el-button>
            <el-button
              type="danger"
              size="large"
              plain
              :icon="Close"
              @click="handleDetailReject"
            >
              违规屏蔽
            </el-button>
            <el-button
              type="success"
              size="large"
              :icon="Check"
              @click="handleDetailApprove"
            >
              准予通过
            </el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.review-queue {
  padding: 24px;
  background-color: #f8fafc;
  min-height: calc(100vh - 88px);

  html.dark & {
    background-color: #1a1a1a;
  }

  :deep(.el-card) {
    border: none;
    border-radius: 16px;
    box-shadow:
      0 4px 6px -1px rgb(0 0 0 / 0.1),
      0 2px 4px -2px rgb(0 0 0 / 0.1);
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
    position: relative;
    border-left: 4px solid transparent;

    &.pending {
      border-left-color: #e6a23c;
    }
    &.high {
      border-left-color: #f56c6c;
    }
    &.avg {
      border-left-color: #409eff;
    }

    .stat-content {
      display: flex;
      gap: 20px;
      align-items: center;
      padding: 12px 4px;

      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 60px;
        height: 60px;
        color: #fff;
        border-radius: 18px;
        box-shadow: 0 8px 16px -4px rgb(0 0 0 / 0.1);
        transition: transform 0.3s;

        &.warning {
          background: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
        }

        &.danger {
          background: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
        }

        &.info {
          background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
        }
      }

      .stat-info {
        .stat-number {
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.2;

          html.dark & {
            color: #f1f5f9;
          }
        }

        .stat-label {
          margin-top: 4px;
          font-size: 14px;
          font-weight: 500;
          color: #64748b;

          html.dark & {
            color: #94a3b8;
          }
        }
      }

      &:hover .stat-icon {
        transform: scale(1.1) rotate(5deg);
      }
    }
  }

  .search-card {
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(8px);

    html.dark & {
      background: rgba(36, 36, 36, 0.8);
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

  .action-bar {
    .batch-info {
      display: flex;
      align-items: center;
      padding: 4px 12px;
      background: #f1f5f9;
      border-radius: 8px;
      font-size: 13px;
      color: #475569;

      html.dark & {
        background: #334155;
        color: #cbd5e1;
      }
    }
  }

  .data-card {
    :deep(.el-table) {
      --el-table-header-bg-color: #f8fafc;
      --el-table-row-hover-bg-color: #f1f5f9;
      border-radius: 12px;

      html.dark & {
        --el-table-header-bg-color: #1e1e1e;
        --el-table-row-hover-bg-color: #2c2c2c;
      }

      .el-table__header {
        th {
          font-weight: 600;
          color: #475569;
          height: 50px;

          html.dark & {
            color: #94a3b8;
          }
        }
      }

      .el-table__row {
        height: 80px;
        transition: all 0.2s;

        &:hover {
          td {
            background-color: var(--el-table-row-hover-bg-color) !important;
          }
        }
      }
    }
  }

  .review-content {
    .content-title {
      font-size: 15px;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 4px;

      html.dark & {
        color: #f1f5f9;
      }
    }

    .content-excerpt {
      max-width: 500px;
      line-height: 1.6;
      color: #64748b;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;

      html.dark & {
        color: #94a3b8;
      }
    }

    .content-meta {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-top: 8px;

      .meta-item {
        display: flex;
        align-items: center;
        gap: 4px;
        color: #94a3b8;
        font-size: 12px;
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

      &:hover {
        background: rgba(0, 0, 0, 0.05);
        transform: scale(1.1);
      }

      &.approve:hover {
        color: #10b981;
        background: rgba(16, 185, 129, 0.1);
      }
      &.reject:hover {
        color: #ef4444;
        background: rgba(239, 68, 68, 0.1);
      }
      &.view:hover {
        color: #3b82f6;
        background: rgba(59, 130, 246, 0.1);
      }
    }
  }

  .review-detail {
    .content-box {
      border: 1px solid #e2e8f0;
      background: #ffffff;
      transition: all 0.3s;

      html.dark & {
        border-color: #334155;
        background: #1e1e1e;
      }

      &:hover {
        border-color: #3b82f6;
        box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
      }
    }
  }
}

/* 按钮点击波纹效果增强 */
.el-button {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border-radius: 10px;

  &:not(.is-disabled):active {
    transform: scale(0.95);
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
