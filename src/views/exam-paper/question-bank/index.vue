<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useDark } from "@pureadmin/utils";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  getQuestionBankList,
  getQuestionBankStatistics,
  getQuestionFolders,
  getKnowledgePoints,
  createQuestion,
  updateQuestion,
  deleteQuestion as deleteQuestionApi,
  batchDeleteQuestions,
  importQuestions,
  exportQuestions,
  createQuestionFolder,
  updateQuestionFolder,
  deleteQuestionFolder,
  moveQuestionsToFolder,
  type QuestionBankFullItem,
  type QuestionFolder,
  type KnowledgePoint
} from "@/api/examPaper";

// 导入 SVG 图标组件
import IconDocument from "@/assets/home-icons/document.svg?component";
import IconCheckCircle from "@/assets/home-icons/check-circle.svg?component";
import IconEdit from "@/assets/home-icons/edit.svg?component";
import IconGrid from "@/assets/home-icons/grid.svg?component";
import LatexEditor from "../editor/components/LatexEditor.vue";
import RichMediaUploader from "../editor/components/RichMediaUploader.vue";

defineOptions({
  name: "QuestionBank"
});

const { isDark } = useDark();

// 搜索和筛选
const searchQuery = ref("");
const selectedType = ref("");
const selectedDifficulty = ref("");
const selectedKnowledgePoint = ref("");
const selectedFolderId = ref<number | null>(null);

// 题目类型选项
const questionTypes = [
  { value: "", label: "全部题型" },
  { value: "radio", label: "单选题" },
  { value: "checkbox", label: "多选题" },
  { value: "input", label: "填空题" },
  { value: "textarea", label: "简答题" },
  { value: "judge", label: "判断题" }
];

// 难度选项
const difficultyOptions = [
  { value: "", label: "全部难度" },
  { value: "easy", label: "简单" },
  { value: "medium", label: "中等" },
  { value: "hard", label: "困难" }
];

// 知识点列表
const knowledgePointList = ref<KnowledgePoint[]>([]);
const knowledgePointOptions = computed(() => {
  const options: Array<{ value: string; label: string }> = [
    { value: "", label: "全部知识点" }
  ];
  const flatten = (points: KnowledgePoint[], prefix = "") => {
    points.forEach(p => {
      options.push({ value: p.name, label: prefix + p.name });
      if (p.children && p.children.length > 0) {
        flatten(p.children, prefix + "  ");
      }
    });
  };
  flatten(knowledgePointList.value);
  return options;
});

// 文件夹列表
const folderList = ref<QuestionFolder[]>([]);
const folderTreeData = computed(() => {
  return [
    { id: 0, name: "全部题目", questionCount: statistics.value.total },
    ...folderList.value
  ];
});

// 统计数据
const statistics = ref({
  total: 0,
  radio: 0,
  checkbox: 0,
  judge: 0,
  input: 0,
  textarea: 0
});

// 题库数据
const questions = ref<QuestionBankFullItem[]>([]);
const loading = ref(false);

// 分页
const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(0);

// 选中的题目
const selectedQuestions = ref<number[]>([]);

// 编辑对话框
const editDialogVisible = ref(false);
const editingQuestion = ref<any>(null);
const isNewQuestion = ref(false);

// 文件夹对话框
const folderDialogVisible = ref(false);
const editingFolder = ref<{ id?: number; name: string; parentId?: number }>({
  name: ""
});
const isNewFolder = ref(false);

// 移动到文件夹对话框
const moveDialogVisible = ref(false);
const targetFolderId = ref<number | null>(null);

// 导入对话框
const importDialogVisible = ref(false);
const importFileList = ref<any[]>([]);
const importTargetFolderId = ref<number | null>(null);
const importLoading = ref(false);

// 导出对话框
const exportDialogVisible = ref(false);
const exportFormat = ref<"excel" | "word" | "json">("excel");
const exportScope = ref<"all" | "selected" | "folder">("all");
const exportLoading = ref(false);

// 加载题库列表
const fetchQuestions = async () => {
  loading.value = true;
  try {
    const res = await getQuestionBankList({
      pageNum: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchQuery.value || undefined,
      type: selectedType.value || undefined,
      difficulty: selectedDifficulty.value || undefined,
      knowledgePoint: selectedKnowledgePoint.value || undefined,
      folderId: selectedFolderId.value || undefined
    });
    if (res.code === 0) {
      questions.value = res.data.list;
      total.value = res.data.total;
    }
  } finally {
    loading.value = false;
  }
};

// 加载统计数据
const fetchStatistics = async () => {
  try {
    const res = await getQuestionBankStatistics();
    if (res.code === 0) {
      statistics.value = res.data;
    }
  } catch (e) {
    console.error("加载统计数据失败", e);
  }
};

// 加载文件夹列表
const fetchFolders = async () => {
  try {
    const res = await getQuestionFolders();
    if (res.code === 0) {
      folderList.value = res.data;
    }
  } catch (e) {
    console.error("加载文件夹失败", e);
  }
};

// 加载知识点列表
const fetchKnowledgePoints = async () => {
  try {
    const res = await getKnowledgePoints();
    if (res.code === 0) {
      knowledgePointList.value = res.data;
    }
  } catch (e) {
    console.error("加载知识点失败", e);
  }
};

// 打开新建题目对话框
const openNewQuestionDialog = () => {
  isNewQuestion.value = true;
  editingQuestion.value = {
    id: 0,
    type: "radio",
    typeName: "单选题",
    difficulty: "medium",
    difficultyName: "中等",
    stem: "",
    options: [
      { key: "A", content: "" },
      { key: "B", content: "" },
      { key: "C", content: "" },
      { key: "D", content: "" }
    ],
    correctAnswer: "",
    correctAnswers: [],
    analysis: "",
    referenceAnswer: "",
    media: [],
    latex: "",
    knowledgePoints: [],
    points: 5,
    useCount: 0,
    createTime: new Date().toISOString().split("T")[0],
    folderId: selectedFolderId.value
  };
  editDialogVisible.value = true;
};

// 打开编辑题目对话框
const openEditDialog = (question: QuestionBankFullItem) => {
  isNewQuestion.value = false;
  editingQuestion.value = JSON.parse(JSON.stringify(question));
  editDialogVisible.value = true;
};

// 保存题目
const saveQuestion = async () => {
  if (!editingQuestion.value.stem) {
    ElMessage.warning("请输入题目内容");
    return;
  }

  const typeInfo = questionTypes.find(
    t => t.value === editingQuestion.value.type
  );
  editingQuestion.value.typeName = typeInfo?.label || "";

  const diffInfo = difficultyOptions.find(
    d => d.value === editingQuestion.value.difficulty
  );
  editingQuestion.value.difficultyName = diffInfo?.label || "";

  try {
    if (isNewQuestion.value) {
      const res = await createQuestion(editingQuestion.value);
      if (res.code === 0) {
        ElMessage.success("题目创建成功");
        editDialogVisible.value = false;
        fetchQuestions();
        fetchStatistics();
      }
    } else {
      const res = await updateQuestion(editingQuestion.value);
      if (res.code === 0) {
        ElMessage.success("题目更新成功");
        editDialogVisible.value = false;
        fetchQuestions();
      }
    }
  } catch (e) {
    ElMessage.error("保存失败");
  }
};

// 删除题目
const handleDeleteQuestion = (question: QuestionBankFullItem) => {
  ElMessageBox.confirm(
    `确定要删除题目"${question.stem.substring(0, 30)}..."吗？`,
    "删除确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(async () => {
      try {
        const res = await deleteQuestionApi(question.id);
        if (res.code === 0) {
          ElMessage.success("删除成功");
          fetchQuestions();
          fetchStatistics();
        }
      } catch (e) {
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {});
};

// 批量删除
const handleBatchDelete = () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning("请先选择要删除的题目");
    return;
  }

  ElMessageBox.confirm(
    `确定要删除选中的 ${selectedQuestions.value.length} 道题目吗？`,
    "批量删除确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(async () => {
      try {
        const res = await batchDeleteQuestions(selectedQuestions.value);
        if (res.code === 0) {
          ElMessage.success(res.msg || "批量删除成功");
          selectedQuestions.value = [];
          fetchQuestions();
          fetchStatistics();
        }
      } catch (e) {
        ElMessage.error("批量删除失败");
      }
    })
    .catch(() => {});
};

// 添加选项
const addOption = () => {
  if (!editingQuestion.value) return;
  const nextKey = String.fromCharCode(
    65 + editingQuestion.value.options.length
  );
  editingQuestion.value.options.push({ key: nextKey, content: "" });
};

// 删除选项
const removeOption = (index: number) => {
  if (!editingQuestion.value || editingQuestion.value.options.length <= 2)
    return;
  editingQuestion.value.options.splice(index, 1);
  editingQuestion.value.options.forEach((opt: any, i: number) => {
    opt.key = String.fromCharCode(65 + i);
  });
};

// 打开导入对话框
const openImportDialog = () => {
  importFileList.value = [];
  importTargetFolderId.value = selectedFolderId.value;
  importDialogVisible.value = true;
};

// 文件变化处理
const handleImportFileChange = (file: any) => {
  const allowedTypes = [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-excel",
    "application/json",
    "text/csv"
  ];
  const allowedExtensions = [".xlsx", ".xls", ".json", ".csv"];
  const fileName = file.name || "";
  const ext = fileName.substring(fileName.lastIndexOf(".")).toLowerCase();

  if (
    !allowedTypes.includes(file.raw?.type) &&
    !allowedExtensions.includes(ext)
  ) {
    ElMessage.error("仅支持 Excel (.xlsx/.xls)、JSON、CSV 格式文件");
    return false;
  }

  if (file.raw?.size > 10 * 1024 * 1024) {
    ElMessage.error("文件大小不能超过 10MB");
    return false;
  }

  importFileList.value = [file];
  return true;
};

// 移除文件
const handleImportFileRemove = () => {
  importFileList.value = [];
};

// 确认导入
const confirmImport = async () => {
  if (importFileList.value.length === 0) {
    ElMessage.warning("请先选择要导入的文件");
    return;
  }

  importLoading.value = true;
  try {
    const res = await importQuestions({
      file: importFileList.value[0]?.raw,
      folderId: importTargetFolderId.value || undefined
    });
    if (res.code === 0) {
      ElMessage.success(
        `导入成功：${res.data.importedCount} 道，失败：${res.data.failedCount} 道`
      );
      importDialogVisible.value = false;
      fetchQuestions();
      fetchStatistics();
    }
  } catch (e) {
    ElMessage.error("导入失败，请检查文件格式是否正确");
  } finally {
    importLoading.value = false;
  }
};

// 打开导出对话框
const openExportDialog = () => {
  exportFormat.value = "excel";
  if (selectedQuestions.value.length > 0) {
    exportScope.value = "selected";
  } else if (selectedFolderId.value) {
    exportScope.value = "folder";
  } else {
    exportScope.value = "all";
  }
  exportDialogVisible.value = true;
};

// 确认导出
const confirmExport = async () => {
  exportLoading.value = true;
  try {
    const params: {
      ids?: number[];
      folderId?: number;
      format: "json" | "excel" | "word";
    } = {
      format: exportFormat.value
    };

    if (
      exportScope.value === "selected" &&
      selectedQuestions.value.length > 0
    ) {
      params.ids = selectedQuestions.value;
    } else if (exportScope.value === "folder" && selectedFolderId.value) {
      params.folderId = selectedFolderId.value;
    }

    const res = await exportQuestions(params);
    if (res.code === 0) {
      ElMessage.success("导出成功，文件即将开始下载");
      // 模拟下载
      if (res.data.downloadUrl) {
        const link = document.createElement("a");
        link.href = res.data.downloadUrl;
        link.download = `题库导出_${new Date().toLocaleDateString()}.${exportFormat.value === "excel" ? "xlsx" : exportFormat.value}`;
        link.click();
      }
      exportDialogVisible.value = false;
    }
  } catch (e) {
    ElMessage.error("导出失败");
  } finally {
    exportLoading.value = false;
  }
};

// 下载导入模板
const downloadImportTemplate = () => {
  ElMessage.info("正在下载导入模板...");
  // 实际项目中这里应该调用后端接口下载模板
};

// 文件夹相关操作
const openNewFolderDialog = () => {
  isNewFolder.value = true;
  editingFolder.value = { name: "", parentId: undefined };
  folderDialogVisible.value = true;
};

const openEditFolderDialog = (folder: any) => {
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
      const res = await createQuestionFolder({
        name: editingFolder.value.name,
        parentId: editingFolder.value.parentId
      });
      if (res.code === 0) {
        ElMessage.success("文件夹创建成功");
        folderDialogVisible.value = false;
        fetchFolders();
      }
    } else {
      const res = await updateQuestionFolder({
        id: editingFolder.value.id!,
        name: editingFolder.value.name
      });
      if (res.code === 0) {
        ElMessage.success("文件夹更新成功");
        folderDialogVisible.value = false;
        fetchFolders();
      }
    }
  } catch (e) {
    ElMessage.error("保存失败");
  }
};

const handleDeleteFolder = (folder: any) => {
  ElMessageBox.confirm(
    `确定要删除文件夹"${folder.name}"吗？文件夹内的题目不会被删除。`,
    "删除确认",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
    .then(async () => {
      try {
        const res = await deleteQuestionFolder(folder.id);
        if (res.code === 0) {
          ElMessage.success("删除成功");
          if (selectedFolderId.value === folder.id) {
            selectedFolderId.value = null;
          }
          fetchFolders();
        }
      } catch (e) {
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {});
};

const selectFolder = (folderId: number | string | null) => {
  if (folderId === null) {
    selectedFolderId.value = null;
  } else {
    const id = typeof folderId === "number" ? folderId : Number(folderId);
    selectedFolderId.value = id === 0 ? null : id;
  }
  currentPage.value = 1;
  fetchQuestions();
};

// 移动题目到文件夹
const openMoveDialog = () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning("请先选择要移动的题目");
    return;
  }
  targetFolderId.value = null;
  moveDialogVisible.value = true;
};

const handleMoveToFolder = async () => {
  if (targetFolderId.value === null) {
    ElMessage.warning("请选择目标文件夹");
    return;
  }

  try {
    const res = await moveQuestionsToFolder({
      questionIds: selectedQuestions.value,
      folderId: targetFolderId.value
    });
    if (res.code === 0) {
      ElMessage.success("移动成功");
      moveDialogVisible.value = false;
      selectedQuestions.value = [];
      fetchQuestions();
      fetchFolders();
    }
  } catch (e) {
    ElMessage.error("移动失败");
  }
};

// 获取难度标签类型
const getDifficultyType = (
  difficulty: string
): "success" | "warning" | "danger" | "info" => {
  switch (difficulty) {
    case "easy":
      return "success";
    case "medium":
      return "warning";
    case "hard":
      return "danger";
    default:
      return "info";
  }
};

// 获取题型标签类型
const getTypeTagType = (
  type: string
): "primary" | "success" | "warning" | "danger" | "info" => {
  switch (type) {
    case "radio":
      return "primary";
    case "checkbox":
      return "success";
    case "input":
      return "warning";
    case "textarea":
      return "danger";
    case "judge":
      return "info";
    default:
      return "primary";
  }
};

// 搜索和筛选变化时重新加载
const handleSearch = () => {
  currentPage.value = 1;
  fetchQuestions();
};

// 分页变化
const handlePageChange = () => {
  fetchQuestions();
};

// 初始化
onMounted(() => {
  fetchQuestions();
  fetchStatistics();
  fetchFolders();
  fetchKnowledgePoints();
});
</script>

<template>
  <div class="question-bank" :class="{ 'is-dark': isDark }">
    <!-- 页面标题区域 -->
    <div class="page-header">
      <div class="header-content">
        <div class="header-icon">
          <IconGrid />
        </div>
        <div class="header-info">
          <h1 class="page-title">题库管理</h1>
          <p class="page-desc">
            管理和维护题目，支持创建、编辑、删除和批量操作
          </p>
        </div>
      </div>
      <div class="header-actions">
        <el-button @click="openNewFolderDialog">
          <el-icon class="mr-1"><FolderAdd /></el-icon>
          新建文件夹
        </el-button>
        <el-button
          type="primary"
          size="large"
          class="create-btn"
          @click="openNewQuestionDialog"
        >
          <el-icon class="mr-2"><Plus /></el-icon>
          新建题目
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stat-card">
        <div class="stat-icon">
          <IconDocument />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.total }}</div>
          <div class="stat-label">题目总数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon radio">
          <IconCheckCircle />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.radio }}</div>
          <div class="stat-label">单选题</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon checkbox">
          <IconCheckCircle />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.checkbox }}</div>
          <div class="stat-label">多选题</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon textarea">
          <IconEdit />
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.textarea }}</div>
          <div class="stat-label">简答题</div>
        </div>
      </div>
    </div>

    <div class="question-main-content">
      <!-- 左侧文件夹树 -->
      <div class="folder-sidebar">
        <div class="folder-header">
          <span class="folder-title">题库分类</span>
        </div>
        <div class="folder-tree">
          <div
            v-for="folder in folderTreeData"
            :key="folder.id"
            class="folder-item"
            :class="{
              active: selectedFolderId === (folder.id === 0 ? null : folder.id)
            }"
            @click="selectFolder(folder.id)"
          >
            <el-icon><Folder /></el-icon>
            <span class="folder-name">{{ folder.name }}</span>
            <span class="folder-count">{{ folder.questionCount }}</span>
            <div v-if="folder.id !== 0" class="folder-actions" @click.stop>
              <el-button
                link
                size="small"
                @click="openEditFolderDialog(folder)"
              >
                <el-icon><Edit /></el-icon>
              </el-button>
              <el-button
                link
                size="small"
                type="danger"
                @click="handleDeleteFolder(folder)"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧内容区 -->
      <div class="content-area">
        <!-- 搜索和工具栏 -->
        <div class="toolbar-card">
          <div class="toolbar">
            <div class="toolbar-left">
              <el-input
                v-model="searchQuery"
                placeholder="搜索题目内容..."
                prefix-icon="Search"
                clearable
                style="width: 250px"
                @change="handleSearch"
                @clear="handleSearch"
              />
              <el-select
                v-model="selectedType"
                placeholder="题型"
                style="width: 120px"
                @change="handleSearch"
              >
                <el-option
                  v-for="type in questionTypes"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
              <el-select
                v-model="selectedDifficulty"
                placeholder="难度"
                style="width: 120px"
                @change="handleSearch"
              >
                <el-option
                  v-for="diff in difficultyOptions"
                  :key="diff.value"
                  :label="diff.label"
                  :value="diff.value"
                />
              </el-select>
              <el-select
                v-model="selectedKnowledgePoint"
                placeholder="知识点"
                style="width: 160px"
                clearable
                filterable
                @change="handleSearch"
              >
                <el-option
                  v-for="kp in knowledgePointOptions"
                  :key="kp.value"
                  :label="kp.label"
                  :value="kp.value"
                />
              </el-select>
            </div>
            <div class="toolbar-right">
              <el-button @click="openImportDialog">
                <el-icon class="mr-1"><Upload /></el-icon>
                导入
              </el-button>
              <el-button @click="openExportDialog">
                <el-icon class="mr-1"><Download /></el-icon>
                导出
              </el-button>
              <el-button @click="openMoveDialog">
                <el-icon class="mr-1"><FolderOpened /></el-icon>
                移动
              </el-button>
              <el-button
                type="danger"
                :disabled="selectedQuestions.length === 0"
                @click="handleBatchDelete"
              >
                <el-icon class="mr-1"><Delete /></el-icon>
                批量删除
              </el-button>
            </div>
          </div>
        </div>

        <!-- 题目列表 -->
        <div class="list-card">
          <el-table
            v-loading="loading"
            :data="questions"
            style="width: 100%"
            class="question-table"
            @selection-change="
              (val: any[]) => (selectedQuestions = val.map(v => v.id))
            "
          >
            <el-table-column type="selection" width="55" />
            <el-table-column label="题型" width="100">
              <template #default="{ row }">
                <el-tag
                  :type="getTypeTagType(row.type)"
                  size="small"
                  effect="light"
                >
                  {{ row.typeName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="题目内容" min-width="300">
              <template #default="{ row }">
                <div class="question-stem">{{ row.stem }}</div>
              </template>
            </el-table-column>
            <el-table-column label="知识点" width="180">
              <template #default="{ row }">
                <div class="knowledge-tags">
                  <el-tag
                    v-for="kp in (row.knowledgePoints || []).slice(0, 2)"
                    :key="kp"
                    size="small"
                    type="info"
                    effect="plain"
                    class="kp-tag"
                  >
                    {{ kp }}
                  </el-tag>
                  <span
                    v-if="(row.knowledgePoints || []).length > 2"
                    class="more-kp"
                  >
                    +{{ row.knowledgePoints.length - 2 }}
                  </span>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="难度" width="100">
              <template #default="{ row }">
                <el-tag
                  :type="getDifficultyType(row.difficulty)"
                  size="small"
                  effect="light"
                >
                  {{ row.difficultyName }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="分值" width="80" align="center">
              <template #default="{ row }">
                <span class="points-badge">{{ row.points }}分</span>
              </template>
            </el-table-column>
            <el-table-column label="使用次数" width="100" align="center">
              <template #default="{ row }">
                <span class="usage-badge">{{ row.useCount }}次</span>
              </template>
            </el-table-column>
            <el-table-column label="所属文件夹" width="120">
              <template #default="{ row }">
                <span class="folder-badge">{{ row.folderName || "-" }}</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" @click="openEditDialog(row)">
                  <el-icon class="mr-1"><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button
                  link
                  type="danger"
                  @click="handleDeleteQuestion(row)"
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
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :page-sizes="[10, 20, 50, 100]"
              :total="total"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @size-change="handlePageChange"
              @current-change="handlePageChange"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      :title="isNewQuestion ? '新建题目' : '编辑题目'"
      width="800px"
      destroy-on-close
    >
      <el-form
        v-if="editingQuestion"
        :model="editingQuestion"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="题型">
              <el-select v-model="editingQuestion.type" style="width: 100%">
                <el-option
                  v-for="type in questionTypes.filter(t => t.value)"
                  :key="type.value"
                  :label="type.label"
                  :value="type.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="难度">
              <el-select
                v-model="editingQuestion.difficulty"
                style="width: 100%"
              >
                <el-option
                  v-for="diff in difficultyOptions.filter(d => d.value)"
                  :key="diff.value"
                  :label="diff.label"
                  :value="diff.value"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="分值">
              <el-input-number
                v-model="editingQuestion.points"
                :min="1"
                :max="100"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="题目内容">
          <el-input
            v-model="editingQuestion.stem"
            type="textarea"
            :rows="3"
            placeholder="请输入题目内容"
          />
          <LatexEditor v-model="editingQuestion.latex" />
          <RichMediaUploader v-model="editingQuestion.media" />
        </el-form-item>

        <!-- 选择题选项 -->
        <template
          v-if="
            editingQuestion.type === 'radio' ||
            editingQuestion.type === 'checkbox'
          "
        >
          <el-form-item label="选项">
            <div class="options-editor">
              <div
                v-for="(option, index) in editingQuestion.options"
                :key="option.key"
                class="option-item"
              >
                <span class="option-key">{{ option.key }}.</span>
                <el-input
                  v-model="option.content"
                  placeholder="请输入选项内容"
                  style="flex: 1"
                />
                <el-button
                  link
                  type="danger"
                  :disabled="editingQuestion.options.length <= 2"
                  @click="removeOption(index)"
                >
                  <el-icon><Delete /></el-icon>
                </el-button>
              </div>
              <el-button type="primary" link @click="addOption">
                <el-icon><Plus /></el-icon>
                添加选项
              </el-button>
            </div>
          </el-form-item>
          <el-form-item label="正确答案">
            <el-radio-group
              v-if="editingQuestion.type === 'radio'"
              v-model="editingQuestion.correctAnswer"
            >
              <el-radio
                v-for="option in editingQuestion.options"
                :key="option.key"
                :value="option.key"
              >
                {{ option.key }}
              </el-radio>
            </el-radio-group>
            <el-checkbox-group v-else v-model="editingQuestion.correctAnswers">
              <el-checkbox
                v-for="option in editingQuestion.options"
                :key="option.key"
                :value="option.key"
              >
                {{ option.key }}
              </el-checkbox>
            </el-checkbox-group>
          </el-form-item>
        </template>

        <!-- 判断题答案 -->
        <template v-else-if="editingQuestion.type === 'judge'">
          <el-form-item label="正确答案">
            <el-radio-group v-model="editingQuestion.correctAnswer">
              <el-radio value="T">正确</el-radio>
              <el-radio value="F">错误</el-radio>
            </el-radio-group>
          </el-form-item>
        </template>

        <!-- 填空题答案 -->
        <template v-else-if="editingQuestion.type === 'input'">
          <el-form-item label="正确答案">
            <el-input
              v-model="editingQuestion.correctAnswer"
              placeholder="请输入正确答案"
            />
          </el-form-item>
        </template>

        <!-- 简答题参考答案 -->
        <template v-else-if="editingQuestion.type === 'textarea'">
          <el-form-item label="参考答案">
            <el-input
              v-model="editingQuestion.referenceAnswer"
              type="textarea"
              :rows="4"
              placeholder="请输入参考答案"
            />
          </el-form-item>
        </template>

        <el-form-item label="解析">
          <el-input
            v-model="editingQuestion.analysis"
            type="textarea"
            :rows="3"
            placeholder="请输入题目解析（可选）"
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveQuestion">保存</el-button>
      </template>
    </el-dialog>

    <!-- 文件夹对话框 -->
    <el-dialog
      v-model="folderDialogVisible"
      :title="isNewFolder ? '新建文件夹' : '编辑文件夹'"
      width="400px"
    >
      <el-form :model="editingFolder" label-width="80px">
        <el-form-item label="名称">
          <el-input
            v-model="editingFolder.name"
            placeholder="请输入文件夹名称"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="folderDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="saveFolder">保存</el-button>
      </template>
    </el-dialog>

    <!-- 导入题目对话框 -->
    <el-dialog
      v-model="importDialogVisible"
      title="导入题目"
      width="600px"
      destroy-on-close
    >
      <div class="import-dialog-content">
        <!-- 上传区域 -->
        <el-upload
          class="import-upload"
          drag
          action=""
          :auto-upload="false"
          :limit="1"
          :file-list="importFileList"
          :on-change="handleImportFileChange"
          :on-remove="handleImportFileRemove"
          accept=".xlsx,.xls,.json,.csv"
        >
          <div class="upload-area">
            <el-icon class="upload-icon"><Upload /></el-icon>
            <div class="upload-text">
              将文件拖到此处，或
              <em>点击上传</em>
            </div>
            <div class="upload-hint">
              支持 Excel (.xlsx/.xls)、JSON、CSV 格式，文件大小不超过 10MB
            </div>
          </div>
        </el-upload>

        <!-- 导入设置 -->
        <div class="import-settings">
          <el-form label-width="100px">
            <el-form-item label="目标文件夹">
              <el-select
                v-model="importTargetFolderId"
                placeholder="默认不分类"
                clearable
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
        </div>

        <!-- 模板下载提示 -->
        <div class="import-tips">
          <el-alert type="info" :closable="false" show-icon>
            <template #title>
              <span>
                首次导入？请先
                <el-link
                  type="primary"
                  :underline="false"
                  @click="downloadImportTemplate"
                >
                  下载导入模板
                </el-link>
                ，按照模板格式填写后上传
              </span>
            </template>
          </el-alert>
        </div>
      </div>

      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="importLoading"
          :disabled="importFileList.length === 0"
          @click="confirmImport"
        >
          {{ importLoading ? "导入中..." : "确认导入" }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 导出题目对话框 -->
    <el-dialog
      v-model="exportDialogVisible"
      title="导出题目"
      width="500px"
      destroy-on-close
    >
      <div class="export-dialog-content">
        <el-form label-width="100px">
          <el-form-item label="导出范围">
            <el-radio-group v-model="exportScope">
              <el-radio value="all">全部题目</el-radio>
              <el-radio
                value="selected"
                :disabled="selectedQuestions.length === 0"
              >
                已选题目
                <span v-if="selectedQuestions.length > 0" class="export-count">
                  ({{ selectedQuestions.length }}道)
                </span>
              </el-radio>
              <el-radio value="folder" :disabled="!selectedFolderId">
                当前文件夹
              </el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="导出格式">
            <el-radio-group v-model="exportFormat">
              <el-radio-button value="excel">
                <el-icon class="mr-1"><Document /></el-icon>
                Excel
              </el-radio-button>
              <el-radio-button value="word">
                <el-icon class="mr-1"><Document /></el-icon>
                Word
              </el-radio-button>
              <el-radio-button value="json">
                <el-icon class="mr-1"><Document /></el-icon>
                JSON
              </el-radio-button>
            </el-radio-group>
          </el-form-item>
        </el-form>

        <div class="export-tips">
          <el-alert type="info" :closable="false" show-icon>
            <template #title>
              <span v-if="exportFormat === 'excel'">
                Excel 格式适合打印和编辑，包含题目完整信息
              </span>
              <span v-else-if="exportFormat === 'word'">
                Word 格式适合打印试卷，排版更美观
              </span>
              <span v-else> JSON 格式适合数据备份和系统间迁移 </span>
            </template>
          </el-alert>
        </div>
      </div>

      <template #footer>
        <el-button @click="exportDialogVisible = false">取消</el-button>
        <el-button
          type="primary"
          :loading="exportLoading"
          @click="confirmExport"
        >
          {{ exportLoading ? "导出中..." : "确认导出" }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 移动到文件夹对话框 -->
    <el-dialog v-model="moveDialogVisible" title="移动到文件夹" width="400px">
      <el-form label-width="80px">
        <el-form-item label="目标文件夹">
          <el-select
            v-model="targetFolderId"
            placeholder="请选择目标文件夹"
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

$primary-gradient: linear-gradient(135deg, #4A7FC8 0%, #739CF9 100%);
$success-gradient: linear-gradient(135deg, #739CF9 0%, #80C8FA 100%);
$warning-gradient: linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%);
$danger-gradient: linear-gradient(135deg, #ef4444 0%, #f87171 100%);

$radius-md: 12px;
$radius-lg: 16px;

.question-bank {
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

    .page-header {
      .page-title {
        color: $dark-text-primary;
      }

      .page-desc {
        color: $dark-text-secondary;
      }
    }

    .stat-card {
      .stat-info {
        .stat-value {
          color: $dark-text-primary;
        }

        .stat-label {
          color: $dark-text-secondary;
        }
      }
    }

    .folder-sidebar {
      .folder-header {
        .folder-title {
          color: $dark-text-primary;
        }
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

    .header-actions {
      display: flex;
      gap: 12px;

      :deep(.el-button--primary) {
        color: #fff;
        background: $primary-gradient;
        border: none;

        &:hover {
          opacity: 0.92;
        }
      }
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

      &.radio {
        background: $success-gradient;
      }
      &.checkbox {
        background: $warning-gradient;
      }
      &.textarea {
        background: $danger-gradient;
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

  .question-main-content {
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
        background: rgba(115, 156, 249, 0.05);
      }

      &.active {
        background: rgba(115, 156, 249, 0.1);
        color: #739CF9;
      }

      &.child {
        padding-left: 32px;
      }

      .folder-name {
        flex: 1;
        font-size: 14px;
      }

      .folder-count {
        font-size: 12px;
        color: $light-text-secondary;
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

    .question-stem {
      font-size: 14px;
      line-height: 1.5;
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }

    .knowledge-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;

      .kp-tag {
        border-radius: 4px;
      }

      .more-kp {
        font-size: 12px;
        color: $light-text-secondary;
      }
    }

    .pagination-wrapper {
      padding: 16px 20px;
      display: flex;
      justify-content: flex-end;
      border-top: 1px solid $light-border;
    }
  }

  .options-editor {
    width: 100%;

    .option-item {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;

      .option-key {
        font-weight: 600;
        min-width: 24px;
      }
    }
  }

  // 导入对话框样式
  .import-dialog-content {
    .import-upload {
      :deep(.el-upload) {
        width: 100%;
      }

      :deep(.el-upload-dragger) {
        width: 100%;
        padding: 40px 20px;
        border-radius: $radius-md;
        border: 2px dashed $light-border;
        transition: all 0.3s;

        &:hover {
          border-color: #4A7FC8;
          background: rgba(15, 118, 110, 0.04);
        }
      }
    }

    .upload-area {
      text-align: center;

      .upload-icon {
        font-size: 48px;
        color: #4A7FC8;
        margin-bottom: 12px;
      }

      .upload-text {
        font-size: 16px;
        color: $light-text-primary;
        margin-bottom: 8px;

        em {
          color: #4A7FC8;
          font-style: normal;
          cursor: pointer;
        }
      }

      .upload-hint {
        font-size: 13px;
        color: $light-text-secondary;
      }
    }

    .import-settings {
      margin-top: 20px;
      padding-top: 20px;
      border-top: 1px solid $light-border;
    }

    .import-tips {
      margin-top: 16px;
    }
  }

  // 导出对话框样式
  .export-dialog-content {
    .export-count {
      color: #4A7FC8;
      font-size: 12px;
    }

    .export-tips {
      margin-top: 16px;
    }

    :deep(.el-radio-group) {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    :deep(.el-form-item:last-child .el-radio-group) {
      flex-direction: row;
      gap: 0;
    }
  }
}
</style>
