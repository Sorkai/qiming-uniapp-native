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
            <span class="stat-value">{{ stats.totalLabs }}</span>
            <span class="stat-label">实验总数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.activeLabs }}</span>
            <span class="stat-label">已上线</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalViews }}</span>
            <span class="stat-label">总访问量</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>实验列表</span>
          <el-button type="primary" @click="handleOpenDialog()">
            创建实验
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="实验名称">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入实验名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="分类">
          <el-select
            v-model="searchForm.category"
            placeholder="请选择分类"
            clearable
          >
            <el-option label="HTML动画" value="animation" />
            <el-option label="AI小游戏" value="game" />
            <el-option label="模拟实验" value="simulation" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="已上线" :value="1" />
            <el-option label="已下线" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" stripe style="width: 100%">
        <el-table-column prop="labId" label="ID" align="center" width="80" />
        <el-table-column prop="title" label="实验名称" align="left" min-width="180">
          <template #default="{ row }">
            <div class="lab-title-cell">
              <span class="lab-icon">{{ row.icon }}</span>
              <span>{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="category" label="分类" align="center" width="120">
          <template #default="{ row }">
            <el-tag :type="getCategoryTagType(row.category)">
              {{ getCategoryLabel(row.category) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度" align="center" width="100">
          <template #default="{ row }">
            <el-tag :type="getDifficultyTagType(row.difficulty)" size="small">
              {{ getDifficultyLabel(row.difficulty) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长" align="center" width="100" />
        <el-table-column prop="viewCount" label="访问量" align="center" width="100" />
        <el-table-column prop="status" label="状态" align="center" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已上线' : '已下线' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" align="center" width="160" />
        <el-table-column label="操作" align="center" width="220">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handlePreview(row)">
              预览
            </el-button>
            <el-button type="warning" size="small" @click="handleOpenDialog(row)">
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 实验表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.labId ? '编辑实验' : '创建实验'"
      width="600px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="实验名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入实验名称" />
        </el-form-item>
        <el-form-item label="图标" prop="icon">
          <el-input v-model="formData.icon" placeholder="请输入Emoji图标，如：🧪" />
        </el-form-item>
        <el-form-item label="简介" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入实验简介"
          />
        </el-form-item>
        <el-form-item label="分类" prop="category">
          <el-select v-model="formData.category" placeholder="请选择分类">
            <el-option label="HTML动画" value="animation" />
            <el-option label="AI小游戏" value="game" />
            <el-option label="模拟实验" value="simulation" />
          </el-select>
        </el-form-item>
        <el-form-item label="难度" prop="difficulty">
          <el-select v-model="formData.difficulty" placeholder="请选择难度">
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
        </el-form-item>
        <el-form-item label="预计时长" prop="duration">
          <el-input v-model="formData.duration" placeholder="如：15分钟" />
        </el-form-item>
        <el-form-item label="实验链接" prop="url">
          <el-input v-model="formData.url" placeholder="请输入实验页面URL" />
        </el-form-item>
        <el-form-item label="渐变色" prop="gradient">
          <el-input
            v-model="formData.gradient"
            placeholder="如：linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
          />
        </el-form-item>
        <el-form-item label="精选推荐" prop="featured">
          <el-switch v-model="formData.featured" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio :value="1">上线</el-radio>
            <el-radio :value="0">下线</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 预览弹窗 -->
    <el-dialog
      v-model="previewDialogVisible"
      :title="currentLab?.title"
      width="90%"
      class="lab-dialog"
    >
      <div class="lab-iframe-container">
        <iframe
          v-if="currentLab"
          :src="currentLab.url"
          frameborder="0"
          allowfullscreen
          class="lab-iframe"
        />
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import {
  getLabList,
  upsertLab,
  deleteLab,
  getLabStats
} from "@/api/virtualLab";

defineOptions({
  name: "VirtualLabManage"
});

interface LabItem {
  labId: number;
  title: string;
  icon: string;
  description: string;
  category: "animation" | "game" | "simulation";
  difficulty: "easy" | "medium" | "hard";
  duration: string;
  url: string;
  gradient: string;
  featured: boolean;
  status: number;
  viewCount: number;
  createTime: string;
}

const loading = ref(false);
const tableData = ref<LabItem[]>([]);
const total = ref(0);

const stats = ref({
  totalLabs: 0,
  activeLabs: 0,
  totalViews: 0
});

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20
});

const searchForm = reactive({
  title: "",
  category: "",
  status: ""
});

const handleSearch = () => {
  queryParams.pageNum = 1;
  loadTableData();
};

const resetSearch = () => {
  searchForm.title = "";
  searchForm.category = "";
  searchForm.status = "";
  queryParams.pageNum = 1;
  loadTableData();
};

const loadTableData = async () => {
  loading.value = true;
  try {
    const params = {
      ...queryParams,
      ...searchForm
    };
    const { data } = await getLabList(params);
    tableData.value = data.labList;
    total.value = data.total;
  } catch (error) {
    console.error("获取实验列表失败", error);
    ElMessage.error("获取实验列表失败");
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    const { data } = await getLabStats();
    stats.value = data;
  } catch (error) {
    console.error("获取统计数据失败", error);
  }
};

const handleSizeChange = (val: number) => {
  queryParams.pageSize = val;
  loadTableData();
};

const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val;
  loadTableData();
};

// 表单相关
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const formData = reactive({
  labId: 0,
  title: "",
  icon: "",
  description: "",
  category: "",
  difficulty: "",
  duration: "",
  url: "",
  gradient: "",
  featured: false,
  status: 1
});

const formRules = {
  title: [{ required: true, message: "请输入实验名称", trigger: "blur" }],
  icon: [{ required: true, message: "请输入图标", trigger: "blur" }],
  description: [{ required: true, message: "请输入实验简介", trigger: "blur" }],
  category: [{ required: true, message: "请选择分类", trigger: "change" }],
  difficulty: [{ required: true, message: "请选择难度", trigger: "change" }],
  duration: [{ required: true, message: "请输入预计时长", trigger: "blur" }],
  url: [{ required: true, message: "请输入实验链接", trigger: "blur" }]
};

const handleOpenDialog = (row?: LabItem) => {
  dialogVisible.value = true;
  
  // 重置表单
  formData.labId = 0;
  formData.title = "";
  formData.icon = "";
  formData.description = "";
  formData.category = "";
  formData.difficulty = "";
  formData.duration = "";
  formData.url = "";
  formData.gradient = "";
  formData.featured = false;
  formData.status = 1;
  
  if (row) {
    Object.assign(formData, row);
  }
};

const handleSubmit = async () => {
  formRef.value?.validate(async valid => {
    if (!valid) return;

    try {
      await upsertLab(formData);
      ElMessage.success(formData.labId ? "编辑成功" : "新增成功");
      dialogVisible.value = false;
      loadTableData();
      loadStats();
    } catch (error) {
      console.error("保存实验失败", error);
      ElMessage.error("保存失败，请重试");
    }
  });
};

const handleDelete = (row: LabItem) => {
  ElMessageBox.confirm(`确定要删除实验 "${row.title}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        await deleteLab({ labId: row.labId });
        ElMessage.success("删除成功");
        loadTableData();
        loadStats();
      } catch (error) {
        console.error("删除实验失败", error);
        ElMessage.error("删除失败，请重试");
      }
    })
    .catch(() => {});
};

// 预览相关
const previewDialogVisible = ref(false);
const currentLab = ref<LabItem | null>(null);

const handlePreview = (row: LabItem) => {
  currentLab.value = row;
  previewDialogVisible.value = true;
};

// 工具函数
const getCategoryLabel = (category: string) => {
  const labels: Record<string, string> = {
    animation: "HTML动画",
    game: "AI小游戏",
    simulation: "模拟实验"
  };
  return labels[category] || category;
};

const getCategoryTagType = (category: string): "primary" | "success" | "info" => {
  const types: Record<string, "primary" | "success" | "info"> = {
    animation: "primary",
    game: "success",
    simulation: "info"
  };
  return types[category] || "info";
};

const getDifficultyLabel = (difficulty: string) => {
  const labels: Record<string, string> = {
    easy: "简单",
    medium: "中等",
    hard: "困难"
  };
  return labels[difficulty] || difficulty;
};

const getDifficultyTagType = (difficulty: string): "success" | "warning" | "danger" => {
  const types: Record<string, "success" | "warning" | "danger"> = {
    easy: "success",
    medium: "warning",
    hard: "danger"
  };
  return types[difficulty] || "warning";
};

onMounted(() => {
  loadTableData();
  loadStats();
});
</script>

<style lang="scss" scoped>
.main {
  padding: 12px;

  .header-card {
    margin-bottom: 16px;
    border-radius: 16px;
    overflow: hidden;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border: none;

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
        color: #fff;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: rgba(255, 255, 255, 0.85);
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
          color: #fff;
        }

        .stat-label {
          display: block;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.75);
          margin-top: 4px;
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

  .lab-title-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .lab-icon {
      font-size: 20px;
    }
  }

  .pagination-container {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
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
</style>
