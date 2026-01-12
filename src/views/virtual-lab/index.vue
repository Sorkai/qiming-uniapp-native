<template>
  <div class="main">
    <el-card class="box-card header-card">
      <div class="header-content">
        <div class="header-left">
          <h2>🧪 虚拟实验室管理</h2>
          <p>管理 HTML 动画与 AI 生成的互动实验内容</p>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalTasks }}</span>
            <span class="stat-label">任务总数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.completedTasks }}</span>
            <span class="stat-label">已完成</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.processingTasks }}</span>
            <span class="stat-label">进行中</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>HTML 动画任务列表</span>
          <el-button type="success" :loading="syncLoading" @click="handleForceSync">
            <el-icon class="mr-1"><Refresh /></el-icon>
            强制同步
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="选择课程">
          <el-select
            v-model="searchForm.courseId"
            placeholder="请选择课程"
            filterable
            clearable
            style="width: 240px"
            @change="handleCourseChange"
          >
            <el-option
              v-for="course in courseList"
              :key="course.courseId"
              :label="course.title"
              :value="course.courseId"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="选择章节">
          <el-select
            v-model="searchForm.chapterId"
            placeholder="请选择章节"
            filterable
            clearable
            :disabled="!searchForm.courseId"
            style="width: 240px"
            @change="handleSearch"
          >
            <el-option
              v-for="chapter in chapterList"
              :key="chapter.chapterId"
              :label="chapter.name"
              :value="chapter.chapterId"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :disabled="!searchForm.courseId || !searchForm.chapterId" @click="handleSearch">
            查询
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 当前章节信息 -->
      <div v-if="currentAnimationData" class="chapter-info">
        <el-descriptions :column="3" border>
          <el-descriptions-item label="当前展示版本">
            <el-tag v-if="currentAnimationData.displayVersionResolved" type="success">
              {{ currentAnimationData.displayVersionRaw === 'latest' ? `latest (v${currentAnimationData.displayVersionResolved})` : `v${currentAnimationData.displayVersionResolved}` }}
            </el-tag>
            <el-tag v-else type="info">未设置</el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="课程ID">{{ currentAnimationData.courseId }}</el-descriptions-item>
          <el-descriptions-item label="章节ID">{{ currentAnimationData.chapterId }}</el-descriptions-item>
        </el-descriptions>

        <div class="action-bar">
          <el-button type="primary" :loading="generateLoading" @click="handleGenerate">
            <el-icon class="mr-1"><VideoPlay /></el-icon>
            生成新版本
          </el-button>
          <el-button type="warning" @click="showSetVersionDialog = true">
            <el-icon class="mr-1"><Setting /></el-icon>
            设置展示版本
          </el-button>
        </div>
      </div>

      <!-- 空状态提示 -->
      <el-empty v-if="!searchForm.courseId || !searchForm.chapterId" description="请先选择课程和章节" />

      <!-- 任务列表 -->
      <el-table v-else v-loading="loading" :data="taskList" stripe style="width: 100%">
        <el-table-column prop="version" label="版本" align="center" width="80">
          <template #default="{ row }">
            <el-tag v-if="row.version > 0" :type="row.version.toString() === currentAnimationData?.displayVersionResolved ? 'success' : 'info'">
              v{{ row.version }}
            </el-tag>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="taskId" label="任务ID" align="left" min-width="280">
          <template #default="{ row }">
            <el-tooltip :content="row.taskId" placement="top">
              <span class="task-id">{{ row.taskId.slice(0, 8) }}...{{ row.taskId.slice(-8) }}</span>
            </el-tooltip>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" align="center" width="120">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="fileName" label="文件名" align="left" min-width="200">
          <template #default="{ row }">
            <span v-if="row.fileName">{{ row.fileName }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="fileSize" label="文件大小" align="center" width="100">
          <template #default="{ row }">
            <span v-if="row.fileSize > 0">{{ formatFileSize(row.fileSize) }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column prop="createdAt" label="创建时间" align="center" width="170" />
        <el-table-column prop="completedAt" label="完成时间" align="center" width="170">
          <template #default="{ row }">
            <span v-if="row.completedAt">{{ row.completedAt }}</span>
            <span v-else class="text-gray-400">-</span>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template #default="{ row }">
            <el-button
              v-if="row.status === 'completed' && row.fileUrl"
              type="primary"
              size="small"
              @click="handlePreview(row)"
            >
              预览
            </el-button>
            <el-button
              v-if="row.status === 'completed' && row.version > 0"
              type="success"
              size="small"
              @click="handleSetVersion(row.version.toString())"
            >
              设为展示
            </el-button>
            <el-tag v-if="row.status === 'failed'" type="danger" size="small">
              {{ row.errorMessage || '生成失败' }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 设置展示版本弹窗 -->
    <el-dialog v-model="showSetVersionDialog" title="设置展示版本" width="400px">
      <el-form label-width="100px">
        <el-form-item label="版本选择">
          <el-radio-group v-model="setVersionForm.versionType">
            <el-radio value="latest">最新版本 (latest)</el-radio>
            <el-radio value="specific">指定版本</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="setVersionForm.versionType === 'specific'" label="版本号">
          <el-select v-model="setVersionForm.version" placeholder="请选择版本">
            <el-option
              v-for="task in completedTasks"
              :key="task.version"
              :label="`v${task.version}`"
              :value="task.version.toString()"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showSetVersionDialog = false">取消</el-button>
        <el-button type="primary" :loading="setVersionLoading" @click="confirmSetVersion">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 预览弹窗 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="`HTML 动画预览 - v${currentPreviewTask?.version || ''}`"
      width="90%"
      class="lab-dialog"
    >
      <div class="lab-iframe-container">
        <iframe
          v-if="currentPreviewTask"
          :src="currentPreviewTask.fileUrl"
          frameborder="0"
          allowfullscreen
          class="lab-iframe"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage } from "element-plus";
import { Refresh, VideoPlay, Setting } from "@element-plus/icons-vue";
import { getCourseList, getCourseHoursList } from "@/api/course";
import {
  getHtmlAnimationList,
  generateHtmlAnimation,
  setHtmlAnimationDisplay,
  forceSyncHtmlAnimation,
  type HtmlAnimationTask,
  type HtmlAnimationListResult
} from "@/api/htmlAnimation";

defineOptions({
  name: "VirtualLabManage"
});

interface CourseItem {
  courseId: number;
  title: string;
}

interface ChapterItem {
  chapterId: number;
  name: string;
}

const loading = ref(false);
const generateLoading = ref(false);
const syncLoading = ref(false);
const setVersionLoading = ref(false);

// 课程和章节数据
const courseList = ref<CourseItem[]>([]);
const chapterList = ref<ChapterItem[]>([]);

// 当前动画数据
const currentAnimationData = ref<HtmlAnimationListResult | null>(null);
const taskList = ref<HtmlAnimationTask[]>([]);

// 统计数据
const stats = computed(() => {
  const total = taskList.value.length;
  const completed = taskList.value.filter(t => t.status === "completed").length;
  const processing = taskList.value.filter(t => t.status === "pending" || t.status === "processing").length;
  return {
    totalTasks: total,
    completedTasks: completed,
    processingTasks: processing
  };
});

// 已完成的任务（用于版本选择）
const completedTasks = computed(() => {
  return taskList.value.filter(t => t.status === "completed" && t.version > 0);
});

const searchForm = reactive({
  courseId: null as number | null,
  chapterId: null as number | null
});

// 设置版本表单
const showSetVersionDialog = ref(false);
const setVersionForm = reactive({
  versionType: "latest",
  version: ""
});

// 预览相关
const previewDialogVisible = ref(false);
const currentPreviewTask = ref<HtmlAnimationTask | null>(null);

// 加载课程列表
const loadCourseList = async () => {
  try {
    const res = await getCourseList({ pageNum: 1, pageSize: 1000 });
    courseList.value = res.data.courseList.map(c => ({
      courseId: c.courseId,
      title: c.title
    }));
  } catch (error) {
    console.error("获取课程列表失败", error);
    ElMessage.error("获取课程列表失败");
  }
};

// 课程变化时加载章节
const handleCourseChange = async (courseId: number | null) => {
  searchForm.chapterId = null;
  chapterList.value = [];
  currentAnimationData.value = null;
  taskList.value = [];

  if (!courseId) return;

  try {
    const res = await getCourseHoursList({ courseId });
    chapterList.value = res.data.courseChapters.map(c => ({
      chapterId: c.chapterId,
      name: c.name
    }));
  } catch (error) {
    console.error("获取章节列表失败", error);
    ElMessage.error("获取章节列表失败");
  }
};

// 查询动画任务列表
const handleSearch = async () => {
  if (!searchForm.courseId || !searchForm.chapterId) {
    currentAnimationData.value = null;
    taskList.value = [];
    return;
  }

  loading.value = true;
  try {
    const res = await getHtmlAnimationList({
      courseId: searchForm.courseId,
      chapterId: searchForm.chapterId
    });
    currentAnimationData.value = res.data;
    taskList.value = res.data.tasks || [];
  } catch (error) {
    console.error("获取动画任务列表失败", error);
    ElMessage.error("获取动画任务列表失败");
    currentAnimationData.value = null;
    taskList.value = [];
  } finally {
    loading.value = false;
  }
};

const resetSearch = () => {
  searchForm.courseId = null;
  searchForm.chapterId = null;
  chapterList.value = [];
  currentAnimationData.value = null;
  taskList.value = [];
};

// 生成新版本
const handleGenerate = async () => {
  if (!searchForm.courseId || !searchForm.chapterId) return;

  generateLoading.value = true;
  try {
    const res = await generateHtmlAnimation({
      courseId: searchForm.courseId,
      chapterId: searchForm.chapterId
    });
    ElMessage.success(res.data.message || "生成任务已启动");
    // 重新加载列表
    setTimeout(() => handleSearch(), 1000);
  } catch (error) {
    console.error("生成动画失败", error);
    ElMessage.error("生成动画失败");
  } finally {
    generateLoading.value = false;
  }
};

// 强制同步
const handleForceSync = async () => {
  syncLoading.value = true;
  try {
    const res = await forceSyncHtmlAnimation();
    ElMessage.success(`同步完成：共 ${res.data.totalChapters} 章节，成功 ${res.data.successChapters} 章节`);
    // 如果当前有选中章节，刷新数据
    if (searchForm.courseId && searchForm.chapterId) {
      handleSearch();
    }
  } catch (error) {
    console.error("同步失败", error);
    ElMessage.error("同步失败");
  } finally {
    syncLoading.value = false;
  }
};

// 设置展示版本
const handleSetVersion = async (version: string) => {
  if (!searchForm.courseId || !searchForm.chapterId) return;

  try {
    await setHtmlAnimationDisplay({
      courseId: searchForm.courseId,
      chapterId: searchForm.chapterId,
      version
    });
    ElMessage.success("设置成功");
    handleSearch();
  } catch (error) {
    console.error("设置展示版本失败", error);
    ElMessage.error("设置展示版本失败");
  }
};

const confirmSetVersion = async () => {
  if (!searchForm.courseId || !searchForm.chapterId) return;

  const version = setVersionForm.versionType === "latest" ? "latest" : setVersionForm.version;
  if (setVersionForm.versionType === "specific" && !setVersionForm.version) {
    ElMessage.warning("请选择版本号");
    return;
  }

  setVersionLoading.value = true;
  try {
    await setHtmlAnimationDisplay({
      courseId: searchForm.courseId,
      chapterId: searchForm.chapterId,
      version
    });
    ElMessage.success("设置成功");
    showSetVersionDialog.value = false;
    handleSearch();
  } catch (error) {
    console.error("设置展示版本失败", error);
    ElMessage.error("设置展示版本失败");
  } finally {
    setVersionLoading.value = false;
  }
};

// 预览
const handlePreview = (task: HtmlAnimationTask) => {
  currentPreviewTask.value = task;
  previewDialogVisible.value = true;
};

// 工具函数
const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "等待中",
    processing: "生成中",
    completed: "已完成",
    failed: "失败"
  };
  return labels[status] || status;
};

const getStatusTagType = (status: string): "info" | "warning" | "success" | "danger" => {
  const types: Record<string, "info" | "warning" | "success" | "danger"> = {
    pending: "info",
    processing: "warning",
    completed: "success",
    failed: "danger"
  };
  return types[status] || "info";
};

const formatFileSize = (bytes: number) => {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
};

onMounted(() => {
  loadCourseList();
});
</script>

<style lang="scss" scoped>
.main {
  padding: 12px;

  .header-card {
    margin-bottom: 16px;
    border-radius: 24px;
    overflow: hidden;
    background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%);
    border: 1px solid #e2e8f0;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    html.dark & {
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
      border: 1px solid rgb(255 255 255 / 10%);
    }

    &:hover {
      box-shadow: 0 20px 40px -10px rgba(148, 163, 184, 0.1);

      html.dark & {
        box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.5);
      }
    }

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
    }

    .header-left {
      h2 {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 600;
        color: #1e293b;

        html.dark & {
          color: #fff;
        }
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #64748b;

        html.dark & {
          color: rgba(255, 255, 255, 0.75);
        }
      }
    }

    .header-stats {
      display: flex;
      gap: 32px;

      .stat-item {
        text-align: center;

        .stat-value {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: #1e293b;

          html.dark & {
            color: #fff;
          }
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin-top: 4px;

          html.dark & {
            color: rgba(255, 255, 255, 0.6);
          }
        }
      }
    }
  }

  .box-card {
    margin-bottom: 16px;
    border-radius: 16px;
    overflow: hidden;
    border: 1px solid var(--el-border-color-light);
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04);

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .search-form {
      margin-bottom: 16px;
    }
  }

  .chapter-info {
    margin-bottom: 16px;
    padding: 16px;
    background: #f5f7fa;
    border-radius: 12px;

    .action-bar {
      margin-top: 16px;
      display: flex;
      gap: 12px;
    }
  }

  .task-id {
    font-family: monospace;
    font-size: 12px;
    color: #606266;
  }

  .text-gray-400 {
    color: #c0c4cc;
  }

  .mr-1 {
    margin-right: 4px;
  }
}

.lab-iframe-container {
  width: 100%;
  height: 70vh;

  .lab-iframe {
    width: 100%;
    height: 100%;
    border-radius: 12px;
    background: #f5f7fa;
  }
}

:deep(.el-card__header) {
  border-radius: 16px 16px 0 0;
}

:deep(.el-card__body) {
  padding: 16px;
}

:deep(.el-table) {
  --el-table-header-padding: 8px 0;
  --el-table-cell-padding: 8px 0;
  border-radius: 12px;
  overflow: hidden;
}

:deep(.el-dialog) {
  border-radius: 16px;
}

:deep(.el-button) {
  border-radius: 8px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.header-card .el-card__body) {
  padding: 24px;
}

:deep(.el-descriptions) {
  --el-descriptions-item-bordered-label-background: #fafafa;
}
</style>
