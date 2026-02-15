<script setup lang="ts">
import { ref, reactive, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useDark } from "@pureadmin/utils";
import { ElMessage, ElMessageBox } from "element-plus";
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
  loadStatistics();
  loadData();
  fetchFolders();
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

    <!-- 主内容区域：左侧文件夹 + 右侧列表 -->
    <div class="main-content">
      <!-- 左侧文件夹侧边栏 -->
      <div class="folder-sidebar">
        <div class="folder-header">
          <span class="folder-title">文件夹</span>
          <el-button type="primary" link size="small" @click="openNewFolderDialog">
            <el-icon><Plus /></el-icon>
            新建
          </el-button>
        </div>
        <div class="folder-list">
          <div
            v-for="folder in folderTreeData"
            :key="folder.id"
            class="folder-item"
            :class="{ active: selectedFolderId === (folder.id === 0 ? null : folder.id) || (folder.id === 0 && selectedFolderId === null) }"
            @click="selectFolder(folder.id)"
          >
            <div class="folder-item-content">
              <el-icon class="folder-icon"><Folder /></el-icon>
              <span class="folder-name">{{ folder.name }}</span>
              <span class="folder-count">{{ folder.paperCount || 0 }}</span>
            </div>
            <div v-if="folder.id !== 0" class="folder-actions" @click.stop>
              <el-dropdown trigger="click">
                <el-icon class="more-icon"><MoreFilled /></el-icon>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item @click="openEditFolderDialog(folder as PaperFolder)">
                      <el-icon><Edit /></el-icon>
                      重命名
                    </el-dropdown-item>
                    <el-dropdown-item @click="handleDeleteFolder(folder as PaperFolder)">
                      <el-icon><Delete /></el-icon>
                      删除
                    </el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
            <!-- 子文件夹 -->
            <template v-if="(folder as PaperFolder).children?.length">
              <div
                v-for="child in (folder as PaperFolder).children"
                :key="child.id"
                class="folder-item child"
                :class="{ active: selectedFolderId === child.id }"
                @click.stop="selectFolder(child.id)"
              >
                <div class="folder-item-content">
                  <el-icon class="folder-icon"><Folder /></el-icon>
                  <span class="folder-name">{{ child.name }}</span>
                  <span class="folder-count">{{ child.paperCount || 0 }}</span>
                </div>
                <div class="folder-actions" @click.stop>
                  <el-dropdown trigger="click">
                    <el-icon class="more-icon"><MoreFilled /></el-icon>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item @click="openEditFolderDialog(child)">
                          <el-icon><Edit /></el-icon>
                          重命名
                        </el-dropdown-item>
                        <el-dropdown-item @click="handleDeleteFolder(child)">
                          <el-icon><Delete /></el-icon>
                          删除
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- 右侧内容区域 -->
      <div class="content-area">
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
            <el-table-column label="操作" width="260" fixed="right">
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
                <el-button
                  type="info"
                  link
                  size="small"
                  @click="openMoveDialog([row.paperId])"
                >
                  <el-icon class="mr-1"><FolderOpened /></el-icon>
                  移动
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
          <el-select v-model="targetFolderId" placeholder="请选择文件夹" style="width: 100%">
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

    .folder-sidebar {
      background: $dark-card-bg;
      border-color: $dark-border;

      .folder-header {
        border-color: $dark-border;

        .folder-title {
          color: $dark-text-primary;
        }
      }

      .folder-item {
        color: $dark-text-secondary;

        &:hover {
          background: rgba(255, 255, 255, 0.05);
        }

        &.active {
          background: rgba(102, 126, 234, 0.15);
          color: #818cf8;
        }

        .folder-count {
          background: rgba(255, 255, 255, 0.1);
          color: $dark-text-muted;
        }
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

.main-content {
  display: flex;
  gap: 24px;

  @media (width <= 1024px) {
    flex-direction: column;
  }
}

.folder-sidebar {
  flex-shrink: 0;
  width: 260px;
  background: $light-card-bg;
  border: 1px solid $light-border;
  border-radius: $radius-lg;
  box-shadow: $light-shadow;

  @media (width <= 1024px) {
    width: 100%;
  }

  .folder-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 20px;
    border-bottom: 1px solid $light-border;

    .folder-title {
      font-size: 16px;
      font-weight: 600;
      color: $light-text-primary;
    }
  }

  .folder-list {
    padding: 12px 0;
  }

  .folder-item {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    padding: 12px 20px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: #f8fafc;

      .folder-actions {
        opacity: 1;
      }
    }

    &.active {
      background: rgba(102, 126, 234, 0.1);
      color: #667eea;

      .folder-icon {
        color: #667eea;
      }
    }

    &.child {
      padding-left: 44px;
    }

    .folder-item-content {
      display: flex;
      flex: 1;
      gap: 10px;
      align-items: center;
    }

    .folder-icon {
      font-size: 18px;
      color: $light-text-muted;
    }

    .folder-name {
      flex: 1;
      font-size: 14px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .folder-count {
      padding: 2px 8px;
      font-size: 12px;
      color: $light-text-muted;
      background: #f1f5f9;
      border-radius: 10px;
    }

    .folder-actions {
      opacity: 0;
      transition: opacity 0.2s ease;

      .more-icon {
        padding: 4px;
        font-size: 16px;
        color: $light-text-muted;
        cursor: pointer;
        border-radius: 4px;

        &:hover {
          background: rgba(0, 0, 0, 0.05);
        }
      }
    }
  }
}

.content-area {
  flex: 1;
  min-width: 0;
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
