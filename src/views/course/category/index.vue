<template>
  <div class="main category-page">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>课程分类</span>
          <el-button type="primary" @click="handleOpenDialog()">
            创建分类
          </el-button>
        </div>
      </template>

      <el-form :inline="!isMobile" :model="searchForm" class="search-form">
        <el-form-item label="分类名称">
          <el-input
            v-model="searchForm.categoryName"
            placeholder="请输入分类名称"
            clearable
          />
        </el-form-item>
        <el-form-item class="search-form__actions">
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <div v-if="isMobile" v-loading="loading" class="mobile-category-list">
        <div
          v-for="row in tableData"
          :key="row.categoryId"
          class="mobile-category-card"
        >
          <div class="mobile-category-card__header">
            <div class="mobile-category-name">{{ row.name }}</div>
            <div class="mobile-category-meta">
              Category ID: {{ row.categoryId }}
            </div>
          </div>

          <div class="mobile-category-card__actions">
            <el-button type="primary" @click="handleOpenDialog(row)">
              编辑
            </el-button>
            <el-button type="danger" plain @click="handleDelete(row)">
              删除
            </el-button>
          </div>
        </div>

        <el-empty v-if="!loading && tableData.length === 0" />
      </div>

      <el-table
        v-else
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
      >
        <el-table-column
          prop="categoryId"
          label="分类ID"
          align="center"
          width="120"
        />
        <el-table-column
          prop="name"
          label="分类名称"
          align="center"
          min-width="200"
        />
        <el-table-column label="操作" align="center" width="250">
          <template #default="{ row }">
            <el-button
              type="primary"
              size="small"
              @click="handleOpenDialog(row)"
            >
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
          :layout="paginationLayout"
          :size="isMobile ? 'small' : 'default'"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 分类表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.categoryId ? '编辑分类' : '创建分类'"
      :width="getDialogWidth('500px')"
      destroy-on-close
      align-center
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="categoryName">
          <el-input
            v-model="formData.categoryName"
            placeholder="请输入分类名称"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import { usePageResponsive } from "@/utils/pageResponsive";
import {
  getCategoryList,
  upsertCategory,
  deleteCategory
} from "@/api/category";

// 表格数据
interface TableItem {
  categoryId: number;
  name: string;
}

const loading = ref(false);
const tableData = ref<TableItem[]>([]);
const total = ref(0);
const { isMobile, paginationLayout, getDialogWidth } = usePageResponsive();

// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 20
});

// 搜索表单
const searchForm = reactive({
  categoryName: ""
});

// 处理搜索
const handleSearch = () => {
  queryParams.pageNum = 1;
  loadTableData();
};

// 重置搜索
const resetSearch = () => {
  searchForm.categoryName = "";
  queryParams.pageNum = 1;
  loadTableData();
};

// 加载表格数据
const loadTableData = async () => {
  loading.value = true;
  try {
    const categoryName = searchForm.categoryName.trim();
    const { data } = await getCategoryList({
      ...queryParams,
      categoryName: categoryName || undefined
    });
    const categoryList = data.categoryList || [];
    const filteredList = categoryName
      ? categoryList.filter(item => item.name?.includes(categoryName))
      : categoryList;
    tableData.value = filteredList;
    total.value = categoryName ? filteredList.length : data.total;
  } catch (error) {
    console.error("获取分类列表失败", error);
    ElMessage.error("获取分类列表失败");
  } finally {
    loading.value = false;
  }
};

// 分页相关方法
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
  categoryId: 0,
  categoryName: ""
});

const formRules = {
  categoryName: [
    { required: true, message: "请输入分类名称", trigger: "blur" },
    { min: 1, max: 50, message: "长度在 1 到 50 个字符", trigger: "blur" }
  ]
};

// 打开表单弹窗
const handleOpenDialog = (row?: TableItem) => {
  dialogVisible.value = true;

  // 重置表单
  formData.categoryId = 0;
  formData.categoryName = "";

  // 如果是编辑模式，填充表单数据
  if (row) {
    formData.categoryId = row.categoryId;
    formData.categoryName = row.name;
  }
};

// 提交表单
const handleSubmit = async () => {
  formRef.value?.validate(async valid => {
    if (!valid) return;

    try {
      await upsertCategory(formData);
      ElMessage.success(formData.categoryId ? "编辑成功" : "新增成功");
      dialogVisible.value = false;
      loadTableData(); // 重新加载数据
    } catch (error) {
      console.error("保存分类失败", error);
      ElMessage.error("保存失败，请重试");
    }
  });
};

// 删除分类
const handleDelete = (row: TableItem) => {
  ElMessageBox.confirm(`确定要删除分类 "${row.name}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        await deleteCategory({ categoryId: row.categoryId });
        ElMessage.success("删除成功");
        loadTableData(); // 重新加载数据
      } catch (error) {
        console.error("删除分类失败", error);
        ElMessage.error("删除失败，请重试");
      }
    })
    .catch(() => {
      // 取消删除，不做任何操作
    });
};

onMounted(() => {
  loadTableData();
});
</script>

<style lang="scss" scoped>
.main {
  padding: 12px;

  .box-card {
    margin-bottom: 16px;
    overflow: hidden;
    border: 1px solid var(--el-border-color-light);
    border-radius: 16px;
    box-shadow: 0 2px 12px rgb(0 0 0 / 4%);

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .search-form {
      margin-bottom: 16px;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}

.mobile-category-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-category-card {
  padding: 16px;
  background: var(--el-fill-color-extra-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
}

.mobile-category-card__header {
  margin-bottom: 12px;
}

.mobile-category-name {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.mobile-category-meta {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.mobile-category-card__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

.mobile-category-card__actions :deep(.el-button) {
  width: 100%;
  margin-left: 0;
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

  overflow: hidden;
  border-radius: 12px;
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

@media (max-width: 768px) {
  .main.category-page {
    padding: 6px 6px calc(var(--pure-mobile-tab-height, 58px) + 38px);
  }

  .main .box-card .card-header {
    flex-wrap: wrap;
    gap: 10px;
  }

  :deep(.box-card > .el-card__header) {
    padding: 9px 12px;
  }

  :deep(.box-card > .el-card__body) {
    padding: 8px 10px;
  }

  .main .box-card {
    margin-bottom: 10px;
    border-radius: 14px;
  }

  :deep(.search-form .el-form-item) {
    width: 100%;
    margin-right: 0;
    margin-bottom: 7px;
  }

  :deep(.search-form .el-input) {
    width: 100%;
  }

  :deep(.search-form .el-button) {
    width: 100%;
    min-height: 32px;
    font-size: 13px;
  }

  :deep(.search-form__actions .el-form-item__content) {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
    width: 100%;
  }

  :deep(.search-form__actions .el-button) {
    margin-left: 0;
  }

  .main .pagination-container {
    justify-content: center;
    padding-bottom: 14px;
  }

  .mobile-category-list {
    gap: 7px;
    padding-bottom: 16px;
  }

  .mobile-category-card {
    padding: 9px 10px;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 6px 18px rgb(28 39 68 / 6%);
  }

  .mobile-category-card__header {
    margin-bottom: 8px;
  }

  .mobile-category-name {
    font-size: 13.5px;
    line-height: 1.3;
  }

  .mobile-category-meta {
    margin-top: 2px;
    font-size: 11px;
  }

  .mobile-category-card__actions {
    gap: 7px;
  }

  .mobile-category-card__actions :deep(.el-button) {
    min-height: 30px;
    padding: 6px 12px;
    font-size: 12px;
  }
}
</style>
