<script setup lang="ts">
/**
 * 管理员端 - 敏感词管理
 * 管理敏感词库，包括添加、编辑、删除、导入导出
 */
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Plus,
  Search,
  Refresh,
  Delete,
  Edit,
  Upload,
  Download
} from "@element-plus/icons-vue";
import {
  getSensitiveWords,
  addSensitiveWord,
  updateSensitiveWord,
  deleteSensitiveWord,
  importSensitiveWords,
  type SensitiveWord,
  type SensitiveWordLevel
} from "@/api/discussion-admin";

defineOptions({
  name: "SensitiveWordsManage"
});

// 状态
const loading = ref(false);
const words = ref<SensitiveWord[]>([]);
const selectedRows = ref<SensitiveWord[]>([]);
const dialogVisible = ref(false);
const importDialogVisible = ref(false);
const isEdit = ref(false);
const currentWord = ref<SensitiveWord | null>(null);

// 统计
const stats = ref({
  total: 0,
  high: 0,
  medium: 0,
  low: 0
});

// 搜索表单
const searchForm = reactive({
  keyword: "",
  level: "" as SensitiveWordLevel | "",
  category: "",
  isEnabled: undefined as boolean | undefined
});

// 表单数据
const formData = reactive({
  word: "",
  level: "medium" as SensitiveWordLevel,
  category: "",
  replacement: "***",
  isEnabled: true
});

// 导入数据
const importData = reactive({
  content: "",
  level: "medium" as SensitiveWordLevel,
  category: ""
});

// 分页
const pagination = reactive({
  page: 1,
  pageSize: 50,
  total: 0
});

// 级别选项
const levelOptions = [
  { label: "高风险", value: "high", type: "danger" },
  { label: "中风险", value: "medium", type: "warning" },
  { label: "低风险", value: "low", type: "info" }
];

// 分类选项
const categoryOptions = [
  "政治敏感",
  "色情低俗",
  "暴力血腥",
  "恶意广告",
  "人身攻击",
  "违法犯罪",
  "其他"
];

// 级别标签样式
const getLevelType = (level: SensitiveWordLevel) => {
  const map: Record<string, string> = {
    high: "danger",
    medium: "warning",
    low: "info"
  };
  return map[level] || "info";
};

const getLevelText = (level: SensitiveWordLevel) => {
  const map: Record<string, string> = {
    high: "高风险",
    medium: "中风险",
    low: "低风险"
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
    if (searchForm.keyword) params.keyword = searchForm.keyword;
    if (searchForm.level) params.level = searchForm.level;
    if (searchForm.category) params.category = searchForm.category;
    if (searchForm.isEnabled !== undefined)
      params.isEnabled = searchForm.isEnabled;

    const { data } = await getSensitiveWords(params);
    words.value = data.list;
    pagination.total = data.pagination.total;
    stats.value = data.stats;
  } catch (error) {
    console.error("加载敏感词失败", error);
  } finally {
    loading.value = false;
  }
};

// 搜索
const handleSearch = () => {
  pagination.page = 1;
  fetchData();
};

// 重置
const resetSearch = () => {
  searchForm.keyword = "";
  searchForm.level = "";
  searchForm.category = "";
  searchForm.isEnabled = undefined;
  handleSearch();
};

// 分页
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
const handleSelectionChange = (rows: SensitiveWord[]) => {
  selectedRows.value = rows;
};

// 打开添加弹窗
const openAddDialog = () => {
  isEdit.value = false;
  currentWord.value = null;
  formData.word = "";
  formData.level = "medium";
  formData.category = "";
  formData.replacement = "***";
  formData.isEnabled = true;
  dialogVisible.value = true;
};

// 打开编辑弹窗
const openEditDialog = (row: SensitiveWord) => {
  isEdit.value = true;
  currentWord.value = row;
  formData.word = row.word;
  formData.level = row.level;
  formData.category = row.category || "";
  formData.replacement = row.replacement || "***";
  formData.isEnabled = row.isEnabled;
  dialogVisible.value = true;
};

// 提交表单
const submitForm = async () => {
  if (!formData.word.trim()) {
    ElMessage.warning("请输入敏感词");
    return;
  }

  try {
    if (isEdit.value && currentWord.value) {
      await updateSensitiveWord(currentWord.value.id, {
        word: formData.word,
        level: formData.level,
        category: formData.category || undefined,
        replacement: formData.replacement,
        isEnabled: formData.isEnabled
      });
      ElMessage.success("更新成功");
    } else {
      await addSensitiveWord({
        word: formData.word,
        level: formData.level,
        category: formData.category || undefined,
        replacement: formData.replacement,
        isEnabled: formData.isEnabled
      });
      ElMessage.success("添加成功");
    }
    dialogVisible.value = false;
    fetchData();
  } catch (error) {
    ElMessage.error(isEdit.value ? "更新失败" : "添加失败");
  }
};

// 删除
const handleDelete = async (row: SensitiveWord) => {
  try {
    await ElMessageBox.confirm(`确定要删除敏感词「${row.word}」吗？`, "提示", {
      type: "warning"
    });
    await deleteSensitiveWord(row.id);
    ElMessage.success("删除成功");
    fetchData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error("删除失败");
    }
  }
};

// 批量删除
const batchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning("请选择要删除的敏感词");
    return;
  }
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个敏感词吗？`,
      "提示",
      { type: "warning" }
    );
    // 批量删除
    await Promise.all(
      selectedRows.value.map(row => deleteSensitiveWord(row.id))
    );
    ElMessage.success("批量删除成功");
    fetchData();
  } catch (error: any) {
    if (error !== "cancel") {
      ElMessage.error("批量删除失败");
    }
  }
};

// 切换启用状态
const toggleEnabled = async (row: SensitiveWord) => {
  try {
    await updateSensitiveWord(row.id, { isEnabled: !row.isEnabled });
    row.isEnabled = !row.isEnabled;
    ElMessage.success(row.isEnabled ? "已启用" : "已禁用");
  } catch (error) {
    ElMessage.error("操作失败");
  }
};

// 打开导入弹窗
const openImportDialog = () => {
  importData.content = "";
  importData.level = "medium";
  importData.category = "";
  importDialogVisible.value = true;
};

// 导入
const submitImport = async () => {
  if (!importData.content.trim()) {
    ElMessage.warning("请输入要导入的敏感词");
    return;
  }

  try {
    const wordsToImport = importData.content
      .split("\n")
      .map(w => w.trim())
      .filter(w => w);

    if (wordsToImport.length === 0) {
      ElMessage.warning("没有有效的敏感词");
      return;
    }

    await importSensitiveWords({
      words: wordsToImport,
      level: importData.level,
      category: importData.category || undefined
    });

    ElMessage.success(`成功导入 ${wordsToImport.length} 个敏感词`);
    importDialogVisible.value = false;
    fetchData();
  } catch (error) {
    ElMessage.error("导入失败");
  }
};

// 导出
const handleExport = () => {
  const content = words.value.map(w => w.word).join("\n");
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `敏感词_${new Date().toISOString().slice(0, 10)}.txt`;
  a.click();
  URL.revokeObjectURL(url);
  ElMessage.success("导出成功");
};

// 格式化时间
const formatTime = (dateStr: string) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
};

onMounted(() => {
  fetchData();
});
</script>

<template>
  <div class="sensitive-words-page p-4">
    <!-- 统计卡片 -->
    <el-row :gutter="16" class="mb-4">
      <el-col :xs="6" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number">{{ stats.total }}</div>
            <div class="stat-label">总敏感词</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="6" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number text-danger">{{ stats.high }}</div>
            <div class="stat-label">高风险</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="6" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number text-warning">{{ stats.medium }}</div>
            <div class="stat-label">中风险</div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="6" :sm="6" :md="6">
        <el-card shadow="hover" class="stat-card">
          <div class="stat-content">
            <div class="stat-number text-info">{{ stats.low }}</div>
            <div class="stat-label">低风险</div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索栏和操作栏 -->
    <el-card shadow="never" class="mb-4">
      <div class="flex flex-wrap justify-between items-center gap-4">
        <el-form :inline="true" :model="searchForm" class="search-form">
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索敏感词"
              clearable
              style="width: 150px"
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          <el-form-item label="级别">
            <el-select
              v-model="searchForm.level"
              placeholder="全部级别"
              clearable
              style="width: 120px"
            >
              <el-option
                v-for="opt in levelOptions"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="分类">
            <el-select
              v-model="searchForm.category"
              placeholder="全部分类"
              clearable
              style="width: 140px"
            >
              <el-option
                v-for="cat in categoryOptions"
                :key="cat"
                :label="cat"
                :value="cat"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="状态">
            <el-select
              v-model="searchForm.isEnabled"
              placeholder="全部状态"
              clearable
              style="width: 100px"
            >
              <el-option label="已启用" :value="true" />
              <el-option label="已禁用" :value="false" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" :icon="Search" @click="handleSearch">
              搜索
            </el-button>
            <el-button :icon="Refresh" @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
        <div class="action-btns">
          <el-button type="primary" :icon="Plus" @click="openAddDialog">
            添加敏感词
          </el-button>
          <el-button type="success" :icon="Upload" @click="openImportDialog">
            批量导入
          </el-button>
          <el-button :icon="Download" @click="handleExport">导出</el-button>
          <el-button
            type="danger"
            :icon="Delete"
            :disabled="selectedRows.length === 0"
            @click="batchDelete"
          >
            批量删除
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 数据表格 -->
    <el-card shadow="never">
      <el-table
        v-loading="loading"
        :data="words"
        stripe
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column label="敏感词" prop="word" min-width="150">
          <template #default="{ row }">
            <span :class="{ 'text-gray-400 line-through': !row.isEnabled }">
              {{ row.word }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="风险级别" width="100" align="center">
          <template #default="{ row }">
            <el-tag :type="getLevelType(row.level)" size="small">
              {{ getLevelText(row.level) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="分类"
          prop="category"
          width="120"
          align="center"
        >
          <template #default="{ row }">
            {{ row.category || "-" }}
          </template>
        </el-table-column>
        <el-table-column
          label="替换文本"
          prop="replacement"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <code class="text-xs">{{ row.replacement }}</code>
          </template>
        </el-table-column>
        <el-table-column
          label="命中次数"
          prop="hitCount"
          width="100"
          align="center"
        >
          <template #default="{ row }">
            <el-badge
              :value="row.hitCount || 0"
              :type="row.hitCount > 10 ? 'warning' : 'info'"
            />
          </template>
        </el-table-column>
        <el-table-column label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-switch
              :model-value="row.isEnabled"
              size="small"
              @click.stop="toggleEnabled(row)"
            />
          </template>
        </el-table-column>
        <el-table-column label="创建时间" width="120" align="center">
          <template #default="{ row }">
            <span class="text-sm text-gray-500">
              {{ formatTime(row.createdAt) }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150" align="center" fixed="right">
          <template #default="{ row }">
            <el-button
              link
              type="primary"
              :icon="Edit"
              @click="openEditDialog(row)"
            >
              编辑
            </el-button>
            <el-button
              link
              type="danger"
              :icon="Delete"
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <div class="flex justify-end mt-4">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.pageSize"
          :total="pagination.total"
          :page-sizes="[50, 100, 200]"
          layout="total, sizes, prev, pager, next"
          @current-change="handlePageChange"
          @size-change="handleSizeChange"
        />
      </div>
    </el-card>

    <!-- 添加/编辑弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="isEdit ? '编辑敏感词' : '添加敏感词'"
      width="500px"
      destroy-on-close
    >
      <el-form :model="formData" label-width="100px">
        <el-form-item label="敏感词" required>
          <el-input
            v-model="formData.word"
            placeholder="请输入敏感词"
            :disabled="isEdit"
          />
        </el-form-item>
        <el-form-item label="风险级别" required>
          <el-radio-group v-model="formData.level">
            <el-radio-button
              v-for="opt in levelOptions"
              :key="opt.value"
              :label="opt.value"
            >
              {{ opt.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="分类">
          <el-select
            v-model="formData.category"
            placeholder="选择分类（可选）"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="cat in categoryOptions"
              :key="cat"
              :label="cat"
              :value="cat"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="替换文本">
          <el-input
            v-model="formData.replacement"
            placeholder="命中时替换为此文本，默认为 ***"
          />
        </el-form-item>
        <el-form-item label="启用状态">
          <el-switch v-model="formData.isEnabled" />
        </el-form-item>
      </el-form>

      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">
          {{ isEdit ? "更新" : "添加" }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 批量导入弹窗 -->
    <el-dialog
      v-model="importDialogVisible"
      title="批量导入敏感词"
      width="600px"
      destroy-on-close
    >
      <el-form :model="importData" label-width="100px">
        <el-form-item label="敏感词列表" required>
          <el-input
            v-model="importData.content"
            type="textarea"
            :rows="10"
            placeholder="请输入敏感词，每行一个"
          />
        </el-form-item>
        <el-form-item label="默认级别">
          <el-radio-group v-model="importData.level">
            <el-radio-button
              v-for="opt in levelOptions"
              :key="opt.value"
              :label="opt.value"
            >
              {{ opt.label }}
            </el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="默认分类">
          <el-select
            v-model="importData.category"
            placeholder="选择分类（可选）"
            clearable
            style="width: 100%"
          >
            <el-option
              v-for="cat in categoryOptions"
              :key="cat"
              :label="cat"
              :value="cat"
            />
          </el-select>
        </el-form-item>
      </el-form>
      <div class="text-sm text-gray-500 mt-2">
        <p>提示：</p>
        <ul class="list-disc list-inside">
          <li>每行一个敏感词</li>
          <li>重复的敏感词会自动跳过</li>
          <li>导入的敏感词默认启用</li>
        </ul>
      </div>

      <template #footer>
        <el-button @click="importDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitImport">导入</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style lang="scss" scoped>
.sensitive-words-page {
  :deep(.el-card) {
    border-radius: 12px;
    border: none;
    box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.05);
    transition: all 0.3s;

    html.dark & {
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.2);
    }

    &:hover {
      box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.1);

      html.dark & {
        box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.4);
      }
    }
  }

  .stat-card {
    .stat-content {
      text-align: center;
      padding: 10px 0;

      .stat-number {
        font-size: 28px;
        font-weight: 600;
      }

      .stat-label {
        font-size: 14px;
        color: #909399;
        margin-top: 8px;
      }
    }
  }

  .search-form {
    :deep(.el-form-item) {
      margin-bottom: 0;
    }
  }
}
</style>
