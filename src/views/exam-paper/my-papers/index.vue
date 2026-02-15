<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useDark } from "@pureadmin/utils";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Folder,
  FolderAdd,
  MoreFilled,
  Search,
  Refresh,
  Edit,
  Upload,
  FolderOpened,
  CopyDocument,
  Delete
} from "@element-plus/icons-vue";
import {
  getMyPaperStatistics,
  getPaperList,
  getPaperFolders,
  createPaperFolder,
  updatePaperFolder,
  deletePaperFolder,
  movePapersToFolder,
  type PaperStatus,
  type PaperFolder
} from "@/api/examPaper";

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
const paperList = ref<any[]>([]);

const loading = ref(false);

// 课程列表
const courseList = ref([
  { id: 1, name: "高等数学" },
  { id: 2, name: "线性代数" },
  { id: 3, name: "概率论" }
]);

// 统计数据
const statistics = ref({
  total: 0,
  published: 0,
  draft: 0,
  recent: 0
});

const statCards = computed(() => [
  {
    label: "试卷总数",
    value: statistics.value.total,
    icon: IconDocument,
    color: "#6366f1"
  },
  {
    label: "已发布",
    value: statistics.value.published,
    icon: IconCheckCircle,
    color: "#10b981"
  },
  {
    label: "草稿箱",
    value: statistics.value.draft,
    icon: IconEdit,
    color: "#f59e0b"
  },
  {
    label: "最近编辑",
    value: statistics.value.recent,
    icon: IconClock,
    color: "#3b82f6"
  }
]);

// ==================== 文件夹相关状态 ====================
const folderList = ref<PaperFolder[]>([]);
const folderTreeData = computed(() => {
  return [
    { id: 0, name: "全部试卷", paperCount: statistics.value.total },
    ...folderList.value
  ];
});
const selectedFolderId = ref<number | null>(null);
const folderDialogVisible = ref(false);
const editingFolder = ref<{ id?: number; name: string; parentId?: number }>({
  name: ""
});
const isNewFolder = ref(false);
const moveDialogVisible = ref(false);
const targetFolderId = ref<number | null>(null);
const selectedPaperIds = ref<number[]>([]);

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

// 加载统计数据
const loadStatistics = async () => {
  try {
    const res = await getMyPaperStatistics();
    if (res.code === 0 && res.data) {
      statistics.value = res.data;
    }
  } catch (e) {
    console.error("获取统计数据失败", e);
  }
};

// 加载试卷列表
const loadData = async () => {
  loading.value = true;
  try {
    const res = await getPaperList({
      pageNum: pagination.page,
      pageSize: pagination.pageSize,
      keyword: searchForm.keyword || undefined,
      status:
        searchForm.status !== ""
          ? (Number(searchForm.status) as PaperStatus)
          : undefined,
      courseId: searchForm.courseId ? Number(searchForm.courseId) : undefined
    });
    if (res.code === 0 && res.data) {
      paperList.value = res.data.list || [];
      pagination.total = res.data.total || 0;
    }
  } catch (e) {
    console.error("获取试卷列表失败", e);
  } finally {
    loading.value = false;
  }
};

// ==================== 文件夹相关方法 ====================
const fetchFolders = async () => {
  try {
    const res = await getPaperFolders();
    if (res.code === 0 && res.data) {
      folderList.value = res.data;
    }
  } catch (e) {
    console.error("获取文件夹列表失败", e);
  }
};

const selectFolder = (folderId: number | null) => {
  selectedFolderId.value = folderId === 0 ? null : folderId;
  pagination.page = 1;
  loadData();
};

const openNewFolderDialog = () => {
  isNewFolder.value = true;
  editingFolder.value = { name: "" };
  folderDialogVisible.value = true;
};

const openEditFolderDialog = (folder: PaperFolder) => {
  isNewFolder.value = false;
  editingFolder.value = { id: folder.id, name: folder.name };
  folderDialogVisible.value = true;
};

const saveFolder = async () => {
  if (!editingFolder.value.name.trim()) {
    ElMessage.warning("请输入文件夹名称");
    return;
  }
  try {
    if (isNewFolder.value) {
      await createPaperFolder({
        name: editingFolder.value.name,
        parentId: editingFolder.value.parentId
      });
      ElMessage.success("创建成功");
    } else {
      await updatePaperFolder({
        id: editingFolder.value.id!,
        name: editingFolder.value.name
      });
      ElMessage.success("更新成功");
    }
    folderDialogVisible.value = false;
    fetchFolders();
  } catch (e) {
    console.error("保存文件夹失败", e);
  }
};

const handleDeleteFolder = (folder: PaperFolder) => {
  ElMessageBox.confirm(
    `确定要删除文件夹"${folder.name}"吗？文件夹内的试卷将移至"全部试卷"`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  ).then(async () => {
    try {
      await deletePaperFolder(folder.id);
      ElMessage.success("删除成功");
      if (selectedFolderId.value === folder.id) {
        selectedFolderId.value = null;
      }
      fetchFolders();
      loadData();
    } catch (e) {
      console.error("删除文件夹失败", e);
    }
  });
};

const openMoveDialog = (paperIds: number[]) => {
  selectedPaperIds.value = paperIds;
  targetFolderId.value = null;
  moveDialogVisible.value = true;
};

const handleMoveToFolder = async () => {
  if (targetFolderId.value === null) {
    ElMessage.warning("请选择目标文件夹");
    return;
  }
  try {
    await movePapersToFolder({
      paperIds: selectedPaperIds.value,
      folderId: targetFolderId.value
    });
    ElMessage.success("移动成功");
    moveDialogVisible.value = false;
    loadData();
    fetchFolders();
  } catch (e) {
    console.error("移动试卷失败", e);
  }
};

// 创建新试卷
const createPaper = () => {
  router.push("/exam-paper/editor");
};

// 编辑试卷
const editPaper = (paper: any) => {
  router.push(`/exam-paper/editor/${paper.paperId}`);
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
  router.push(`/exam-paper/publish/${paper.paperId}`);
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
  loadStatistics();
  loadData();
  fetchFolders();
});
</script>

<template>
  <div class="my-papers-page" :class="{ 'is-dark': isDark }">
    <!-- 页面头部 -->
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
      <div class="header-actions">
        <el-button @click="openNewFolderDialog">
          <el-icon class="mr-1"><FolderAdd /></el-icon>
          新建文件夹
        </el-button>
        <el-button type="primary" class="create-btn" @click="createPaper">
          <el-icon class="mr-2"><Plus /></el-icon>
          新建试卷
        </el-button>
      </div>
    </div>

    <!-- 统计概览 -->
    <div class="stats-section">
      <div v-for="item in statCards" :key="item.label" class="stat-card">
        <div
          class="stat-icon"
          :class="{
            published: item.label === '已发布',
            draft: item.label === '草稿箱',
            recent: item.label === '最近编辑'
          }"
        >
          <component :is="item.icon" />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ item.value }}</div>
          <div class="stat-label">{{ item.label }}</div>
        </div>
      </div>
    </div>

    <!-- 主内容区域：左侧文件夹 + 右侧列表 -->
    <div class="main-content">
      <!-- 左侧文件夹侧边栏 -->
      <div class="folder-sidebar">
        <div class="folder-header">
          <span class="folder-title">文件夹</span>
        </div>
        <div class="folder-tree">
          <div
            v-for="folder in folderTreeData"
            :key="folder.id"
            class="folder-item"
            :class="{
              active:
                selectedFolderId === (folder.id === 0 ? null : folder.id) ||
                (folder.id === 0 && selectedFolderId === null)
            }"
            @click="selectFolder(folder.id)"
          >
            <el-icon><Folder /></el-icon>
            <span class="folder-name">{{ folder.name }}</span>
            <span class="folder-count">{{ folder.paperCount || 0 }}</span>
            <div v-if="folder.id !== 0" class="folder-actions" @click.stop>
              <el-button
                link
                size="small"
                @click="openEditFolderDialog(folder as PaperFolder)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button
                link
                size="small"
                type="danger"
                @click="handleDeleteFolder(folder as PaperFolder)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">
        <!-- 工具栏 -->
        <div class="toolbar-card">
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input
                v-model="searchForm.keyword"
                placeholder="搜索试卷标题..."
                style="width: 240px"
                prefix-icon="Search"
                clearable
                @keyup.enter="handleSearch"
                @clear="handleSearch"
              />
              <el-select
                v-model="searchForm.status"
                placeholder="试卷状态"
                style="width: 120px"
                clearable
                @change="handleSearch"
              >
                <el-option label="草稿" value="0" />
                <el-option label="已发布" value="1" />
              </el-select>
              <el-select
                v-model="searchForm.courseId"
                placeholder="所属课程"
                style="width: 150px"
                clearable
                @change="handleSearch"
              >
                <el-option
                  v-for="course in courseList"
                  :key="course.id"
                  :label="course.name"
                  :value="course.id"
                />
              </el-select>
            </div>
            <div class="toolbar-right">
              <el-button @click="loadData">
                <el-icon class="mr-1"><Refresh /></el-icon>
                刷新
              </el-button>
            </div>
          </div>
        </div>

        <!-- 试卷列表 -->
        <div class="list-card">
          <el-table
            v-loading="loading"
            :data="paperList"
            class="paper-table"
            style="width: 100%"
          >
            <el-table-column prop="title" label="试卷标题" min-width="240">
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
            <el-table-column
              prop="status"
              label="状态"
              width="100"
              align="center"
            >
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
            >
              <template #default="{ row }">
                <span class="usage-badge">{{ row.publishCount }}次</span>
              </template>
            </el-table-column>
            <el-table-column
              prop="updateTime"
              label="更新时间"
              width="160"
              align="center"
            />
            <el-table-column label="操作" width="260" fixed="right">
              <template #default="{ row }">
                <el-button
                  type="primary"
                  link
                  size="small"
                  @click="editPaper(row)"
                >
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
                <el-button
                  type="info"
                  link
                  size="small"
                  @click="openMoveDialog([row.paperId])"
                >
                  <el-icon class="mr-1"><FolderOpened /></el-icon>
                  移动
                </el-button>
                <el-button
                  type="warning"
                  link
                  size="small"
                  @click="copyPaper(row)"
                >
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
              @size-change="handlePageChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 文件夹编辑对话框 -->
    <el-dialog
      v-model="folderDialogVisible"
      :title="isNewFolder ? '新建文件夹' : '编辑文件夹'"
      width="400px"
    >
      <el-form label-width="80px">
        <el-form-item label="文件夹名">
          <el-input
            v-model="editingFolder.name"
            placeholder="请输入文件夹名称"
            maxlength="20"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="folderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFolder">确定</el-button>
      </template>
    </el-dialog>

    <!-- 移动到文件夹对话框 -->
    <el-dialog v-model="moveDialogVisible" title="移动到文件夹" width="400px">
      <el-form label-width="80px">
        <el-form-item label="目标文件夹">
          <el-select
            v-model="targetFolderId"
            placeholder="请选择文件夹"
            style="width: 100%"
          >
            <el-option
              v-for="folder in folderList"
              :key="folder.id"
              :label="folder.name"
              :value="folder.id"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="moveDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleMoveToFolder">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
$light-bg: #f5f7fa;
$light-card-bg: #fff;
$light-text-primary: #1f2937;
$light-text-secondary: #6b7280;
$light-border: #e5e7eb;
$light-shadow:
  0 4px 6px -1px rgb(0 0 0 / 10%),
  0 2px 4px -2px rgb(0 0 0 / 10%);

$dark-bg: #0f172a;
$dark-card-bg: rgba(30, 41, 59, 0.8);
$dark-text-primary: #f1f5f9;
$dark-text-secondary: #94a3b8;
$dark-border: rgba(255, 255, 255, 0.1);
$dark-shadow:
  0 4px 6px -1px rgb(0 0 0 / 30%),
  0 2px 4px -2px rgb(0 0 0 / 30%);

$primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
$success-gradient: linear-gradient(135deg, #10b981 0%, #34d399 100%);
$warning-gradient: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
$danger-gradient: linear-gradient(135deg, #ef4444 0%, #f87171 100%);
$info-gradient: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);

$radius-md: 12px;
$radius-lg: 16px;

.my-papers-page {
  min-height: 100%;
  padding: 24px;

  &.is-dark {
    .page-header,
    .stat-card,
    .toolbar-card,
    .list-card,
    .folder-sidebar {
      background: $dark-card-bg;
      border-color: $dark-border;
    }

    .page-title,
    .stat-value {
      color: $dark-text-primary;
    }

    .page-desc,
    .stat-label {
      color: $dark-text-secondary;
    }

    .list-card {
      .paper-title-cell {
        .paper-icon {
          background: rgba(124, 58, 237, 0.2);
          color: #a78bfa;
        }

        .paper-course {
          color: $dark-text-secondary;
        }
      }

      .count-badge,
      .score-badge,
      .usage-badge {
        background: #2d3748;
        color: $dark-text-primary;
      }

      :deep(.el-table) {
        background-color: transparent;
        --el-table-bg-color: transparent;
        --el-table-tr-bg-color: transparent;
        color: $dark-text-primary;
      }

      :deep(.el-table__header th) {
        background-color: rgba(255, 255, 255, 0.05);
        color: $dark-text-primary;
      }
    }
  }

  .page-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    background: $light-card-bg;
    border-radius: $radius-lg;
    box-shadow: $light-shadow;
    margin-bottom: 24px;
    border: 1px solid $light-border;

    .header-content {
      display: flex;
      align-items: center;
      gap: 16px;
    }

    .header-icon {
      width: 56px;
      height: 56px;
      border-radius: $radius-md;
      background: $primary-gradient;
      display: flex;
      align-items: center;
      justify-content: center;

      :deep(svg) {
        width: 28px;
        height: 28px;
        color: #fff;
      }
    }

    .page-title {
      font-size: 24px;
      font-weight: 700;
      color: $light-text-primary;
      margin: 0 0 4px;
    }

    .page-desc {
      font-size: 14px;
      color: $light-text-secondary;
      margin: 0;
    }

    .create-btn {
      height: 48px;
      padding: 0 24px;
      border-radius: $radius-md;
      font-weight: 600;
      font-size: 16px;
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
    background: $light-card-bg;
    border-radius: $radius-lg;
    box-shadow: $light-shadow;
    border: 1px solid $light-border;

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: $radius-md;
      background: $primary-gradient;
      display: flex;
      align-items: center;
      justify-content: center;

      &.published {
        background: $success-gradient;
      }
      &.draft {
        background: $warning-gradient;
      }
      &.recent {
        background: $info-gradient;
      }

      :deep(svg) {
        width: 24px;
        height: 24px;
        color: #fff;
      }
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      color: $light-text-primary;
    }

    .stat-label {
      font-size: 14px;
      color: $light-text-secondary;
    }
  }

  .main-content {
    display: flex;
    gap: 20px;
  }

  .folder-sidebar {
    width: 240px;
    background: $light-card-bg;
    border-radius: $radius-lg;
    box-shadow: $light-shadow;
    border: 1px solid $light-border;
    padding: 16px;

    .folder-header {
      padding-bottom: 12px;
      border-bottom: 1px solid $light-border;
      margin-bottom: 12px;

      .folder-title {
        font-weight: 600;
        color: $light-text-primary;
      }
    }

    .folder-item {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 12px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        background: rgba(79, 70, 229, 0.05);
      }

      &.active {
        background: rgba(79, 70, 229, 0.1);
        color: #4f46e5;
      }

      &.child {
        padding-left: 32px;
      }

      .folder-name {
        flex: 1;
        font-size: 14px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .folder-count {
        font-size: 12px;
        color: $light-text-secondary;
        background: #f1f5f9;
        padding: 2px 8px;
        border-radius: 10px;
      }

      &.active .folder-count {
        background: #4f46e5;
        color: #fff;
      }

      .folder-actions {
        display: none;
      }

      &:hover .folder-actions {
        display: flex;
      }
    }
  }

  .content-area {
    flex: 1;
    min-width: 0;
  }

  .toolbar-card {
    padding: 16px 20px;
    background: $light-card-bg;
    border-radius: $radius-lg;
    box-shadow: $light-shadow;
    border: 1px solid $light-border;
    margin-bottom: 20px;

    .toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 12px;
    }

    .toolbar-left,
    .toolbar-right {
      display: flex;
      align-items: center;
      gap: 12px;
    }
  }

  .list-card {
    background: $light-card-bg;
    border-radius: $radius-lg;
    box-shadow: $light-shadow;
    border: 1px solid $light-border;
    overflow: hidden;

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
        border-radius: 8px;

        :deep(svg) {
          width: 22px;
          height: 22px;
        }
      }

      .paper-info {
        display: flex;
        flex-direction: column;
        gap: 2px;

        .paper-course {
          font-size: 12px;
          color: $light-text-secondary;
        }
      }
    }

    .count-badge,
    .score-badge,
    .usage-badge {
      display: inline-block;
      padding: 4px 10px;
      font-size: 13px;
      font-weight: 500;
      color: $light-text-secondary;
      background: #f1f5f9;
      border-radius: 6px;
    }

    .pagination-wrapper {
      padding: 16px 20px;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid $light-border;
    }
  }
}
</style>
