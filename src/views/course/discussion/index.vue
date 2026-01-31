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
    <el-row :gutter="16" class="mb-4">
      <el-col :xs="8" :sm="8" :md="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon warning">
              <el-icon :size="28"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.pending }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="8" :sm="8" :md="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon danger">
              <el-icon :size="28"><Warning /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number">{{ stats.highPriority }}</div>
              <div class="stat-label">高优先级</div>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="8" :sm="8" :md="8">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-icon info">
              <el-icon :size="28"><Clock /></el-icon>
            </div>
            <div class="stat-info">
              <div class="stat-number text-sm">{{ stats.avgWaitTime }}</div>
              <div class="stat-label">平均等待</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

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
        <el-form-item label="优先级">
          <el-select
            v-model="searchForm.priority"
            placeholder="全部优先级"
            clearable
            style="width: 140px"
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
            :icon="Close"
            :disabled="selectedIds.length === 0"
            @click="handleBatchReject"
          >
            批量拒绝
          </el-button>
          <span v-if="selectedIds.length > 0" class="ml-4text-gray-500">
            已选择 {{ selectedIds.length }} 项
          </span>
        </div>
        <el-button :icon="Refresh" @click="initData">刷新</el-button>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="reviewItems"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column label="内容" min-width="350">
          <template #default="{ row }">
            <div class="review-content">
              <div class="content-title font-medium">
                {{ row.title || "(无标题)" }}
              </div>
              <div class="content-excerpt text-gray-500text-sm mt-1">
                {{ row.content.substring(0, 120) }}...
              </div>
              <div
                class="content-meta text-gray-400 text-xs mt-2flex items-center gap-3"
              >
                <span class="flex items-center gap-1">
                  <el-avatar :size="18" :src="row.author?.avatar" />
                  {{ row.author?.name }}
                </span>
                <span>{{ row.courseName || "未知课程" }}</span
                ><span>{{ formatTime(row.createdAt) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="优先级" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="priorityTagType(row.priority)" size="small">
              {{ priorityText(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="风险等级" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="riskLevelType(row.riskLevel)" size="small">
              {{ riskLevelText(row.riskLevel) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="敏感词" width="150">
          <template #default="{ row }">
            <div v-if="row.matchedWords?.length" class="flex flex-wrap gap-1">
              <el-tag
                v-for="word in row.matchedWords.slice(0, 3)"
                :key="word"
                type="danger"
                size="small"
              >
                {{ word }}
              </el-tag>
              <el-tag
                v-if="row.matchedWords.length > 3"
                type="info"
                size="small"
              >
                +{{ row.matchedWords.length - 3 }}
              </el-tag>
            </div>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column label="等待时间" width="120" align="center">
          <template #default="{ row }"
            ><span
              class="text-sm"
              :class="{
                'text-red-500': getWaitTime(row.createdAt).includes('天')
              }"
            >
              {{ getWaitTime(row.createdAt) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="140" align="center" fixed="right">
          <template #default="{ row }">
            <div class="action-btns">
              <el-tooltip content="查看详情" placement="top">
                <el-button link type="primary" @click="viewDetail(row)">
                  <el-icon><View /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="通过" placement="top">
                <el-button link type="success" @click="handleApprove(row)">
                  <el-icon><Check /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="拒绝" placement="top">
                <el-button link type="danger" @click="handleReject(row)">
                  <el-icon><Close /></el-icon>
                </el-button>
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
      title="内容审核"
      width="700px"
      destroy-on-close
    >
      <div v-if="currentDetail" class="review-detail">
        <!-- 风险提示 -->
        <el-alert
          v-if="
            currentDetail.riskLevel === 'high' ||
            currentDetail.riskLevel === 'critical'
          "
          type="error"
          :closable="false"
          class="mb-4"
        >
          <template #title>
            <span class="font-medium">⚠️ 高风险内容</span>
          </template>
          <template #default>
            <div>
              该内容被标记为高风险，请仔细审核。
              <span v-if="currentDetail.matchedWords?.length"
                >匹配敏感词：{{ currentDetail.matchedWords.join("、") }}
              </span>
            </div>
          </template>
        </el-alert>

        <!-- 基本信息 -->
        <el-descriptions :column="2" border class="mb-4">
          <el-descriptions-item label="作者">
            <div class="flex items-center gap-2">
              <el-avatar :size="24" :src="currentDetail.author?.avatar" />
              <span>{{ currentDetail.author?.name }}</span>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="课程">
            {{ currentDetail.courseName || "未知课程" }}
          </el-descriptions-item>
          <el-descriptions-item label="提交时间">
            {{ formatTime(currentDetail.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item label="等待时间">
            <span
              :class="{
                'text-red-500': getWaitTime(currentDetail.createdAt).includes(
                  '天'
                )
              }"
            >
              {{ getWaitTime(currentDetail.createdAt) }}
            </span>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag
              :type="priorityTagType(currentDetail.priority)"
              size="small"
            >
              {{ priorityText(currentDetail.priority) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="风险等级">
            <el-tag :type="riskLevelType(currentDetail.riskLevel)" size="small">
              {{ riskLevelText(currentDetail.riskLevel) }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>

        <!-- 内容 -->
        <div class="content-section">
          <div class="section-title text-gray-600 mb-2">内容详情</div>
          <div class="content-box p-4 bg-gray-50 rounded">
            <h4 v-if="currentDetail.title" class="font-medium mb-2">
              {{ currentDetail.title }}
            </h4>
            <div
              class="content-html prose max-w-none"
              v-html="currentDetail.contentHtml || currentDetail.content"
            />
          </div>
        </div>

        <!-- 标签 -->
        <div v-if="currentDetail.tags?.length" class="mt-4">
          <div class="section-title text-gray-600 mb-2">标签</div>
          <div class="flex flex-wrap gap-2">
            <el-tag v-for="tag in currentDetail.tags" :key="tag" size="small">
              {{ tag }}
            </el-tag>
          </div>
        </div>

        <!-- 敏感词匹配 -->
        <div v-if="currentDetail.matchedWords?.length" class="mt-4">
          <div class="section-title text-gray-600 mb-2">匹配敏感词</div>
          <div class="flex flex-wrap gap-2">
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

      <template #footer>
        <div class="flex justify-between">
          <div class="flex gap-2">
            <el-button
              type="success"
              :icon="Check"
              @click="handleDetailApprove"
            >
              审核通过
            </el-button>
            <el-button type="danger" :icon="Close" @click="handleDetailReject">
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
.review-queue {
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
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 8px 0;

      .stat-icon {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 56px;
        height: 56px;
        color: #fff;
        border-radius: 12px;

        &.warning {
          background: linear-gradient(135deg, #e6a23c, #f5c76e);
        }

        &.danger {
          background: linear-gradient(135deg, #f56c6c, #f89898);
        }

        &.info {
          background: linear-gradient(135deg, #909399, #b1b3b8);
        }
      }

      .stat-info {
        .stat-number {
          font-size: 24px;
          font-weight: 600;
          color: #303133;
        }

        .stat-label {
          margin-top: 4px;
          font-size: 14px;
          color: #909399;
        }
      }
    }
  }

  .search-form {
    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }

  .review-content {
    .content-title {
      color: #303133;
    }

    .content-excerpt {
      max-width: 400px;
      line-height: 1.5;
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

  .review-detail {
    .section-title {
      font-size: 14px;
      font-weight: 500;
    }

    .content-box {
      .content-html {
        line-height: 1.8;

        :deep(p) {
          margin-bottom: 1em;
        }

        :deep(code) {
          padding: 2px 6px;
          background: #e8e8e8;
          border-radius: 4px;
        }

        :deep(pre) {
          padding: 12px;
          overflow-x: auto;
          background: #e8e8e8;
          border-radius: 8px;
        }
      }
    }
  }
}
</style>
