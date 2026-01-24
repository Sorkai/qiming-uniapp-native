<template>
  <div class="main">
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>在线云盘</span>
          <el-button type="primary" :icon="Upload" @click="handleUpload">
            上传文件
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="listQuery" class="search-form">
        <el-form-item label="文件名">
          <el-input
            v-model="listQuery.name"
            placeholder="请输入文件名"
            clearable
            @keyup.enter="handleFilter"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" :icon="Search" @click="handleFilter">
            搜索
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="filteredList" stripe style="width: 100%">
        <el-table-column
          label="文件名"
          prop="name"
          align="left"
          min-width="250"
        >
          <template #default="{ row }">
            <div class="file-name-cell">
              <el-icon :size="20" class="file-icon">
                <component :is="getFileIcon(row.name)" />
              </el-icon>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="大小" prop="size" align="center" width="120" />
        <el-table-column
          label="创建时间"
          prop="createTime"
          align="center"
          width="180"
        />
        <el-table-column label="操作" width="220" align="center">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="handleDownload(row)"
              >下载</el-button
            >
            <el-button type="danger" size="small" @click="handleDelete(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Upload,
  Search,
  Document,
  Folder,
  VideoCamera,
  Tickets,
  Present
} from "@element-plus/icons-vue";
import { getFileList } from "@/api/user";

defineOptions({
  name: "OnlineDisk"
});

// 默认数据，当API请求失败时使用
const defaultFileList = [
  {
    name: "教案、教学设计.docx",
    size: "23.6 KB",
    createTime: "2023-10-01 10:00",
    url: "https://aiedu-api.intelledu.cn/files/mdih93h4tg8hgsxbb893jdfw8r3hghsdkqq/%E6%95%99%E6%A1%88%E3%80%81%E6%95%99%E5%AD%A6%E8%AE%BE%E8%AE%A1.docx"
  },
  {
    name: "学生名单.docx",
    size: "12.9 KB",
    createTime: "2023-10-02 14:30",
    url: "https://aiedu-api.intelledu.cn/files/mdih93h4tg8hgsxbb893jdfw8r3hghsdkqq/%E5%AD%A6%E7%94%9F%E5%90%8D%E5%8D%95.docx"
  },
  {
    name: "参与的教研活动资料.docx",
    size: "14.3 KB",
    createTime: "2023-10-05 09:00",
    url: "https://aiedu-api.intelledu.cn/files/mdih93h4tg8hgsxbb893jdfw8r3hghsdkqq/%E5%8F%82%E4%B8%8E%E7%9A%84%E6%95%99%E7%A0%94%E6%B4%BB%E5%8A%A8%E8%B5%84%E6%96%99.docx"
  },
  {
    name: "作业评分标准和标准答案.docx",
    size: "3.1 MB",
    createTime: "2023-10-10 16:45",
    url: "https://aiedu-api.intelledu.cn/files/mdih93h4tg8hgsxbb893jdfw8r3hghsdkqq/%E4%BD%9C%E4%B8%9A%E8%AF%84%E5%88%86%E6%A0%87%E5%87%86%E5%92%8C%E6%A0%87%E5%87%86%E7%AD%94%E6%A1%88.docx"
  },
  {
    name: "个人学术论文.docx",
    size: "14.3 KB",
    createTime: "2023-10-12 11:20",
    url: "https://aiedu-api.intelledu.cn/files/mdih93h4tg8hgsxbb893jdfw8r3hghsdkqq/%E4%B8%AA%E4%BA%BA%E5%AD%A6%E6%9C%AF%E8%AE%BA%E6%96%87.docx"
  },
  {
    name: "与学生或家长的沟通记录.docx",
    size: "14.6 KB",
    createTime: "2023-10-15 18:00",
    url: "https://aiedu-api.intelledu.cn/files/mdih93h4tg8hgsxbb893jdfw8r3hghsdkqq/%E4%B8%8E%E5%AD%A6%E7%94%9F%E6%88%96%E5%AE%B6%E9%95%BF%E7%9A%84%E6%B2%9F%E9%80%9A%E8%AE%B0%E5%BD%95.docx"
  }
];

const fileList = ref<any[]>(defaultFileList);
const loading = ref(false);

// 格式化文件大小
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
};

// 从API获取文件列表
const fetchFileList = async () => {
  loading.value = true;
  try {
    const res = await getFileList({ pageNum: 1, pageSize: 100 });
    // 支持多种响应格式：{ fileList: [...] } 或 { data: { fileList: [...] } }
    const fileListData = res?.fileList || res?.data?.fileList;
    if (fileListData && fileListData.length > 0) {
      fileList.value = fileListData.map(file => ({
        name: file.fileName,
        size: formatFileSize(file.size),
        createTime: new Date().toLocaleString("zh-CN", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit"
        }),
        url: file.fileUrl
      }));
    }
    // 如果API返回空数据，保持默认数据不变（fileList已初始化为defaultFileList）
  } catch (error) {
    console.error("获取文件列表失败:", error);
    // API请求失败时保持默认数据不变
  } finally {
    loading.value = false;
  }
};

// 组件挂载时获取数据
onMounted(() => {
  fetchFileList();
});

const listQuery = ref({
  name: ""
});

const filteredList = computed(() => {
  const { name } = listQuery.value;
  if (name) {
    return fileList.value.filter(item =>
      item.name.toLowerCase().includes(name.toLowerCase())
    );
  }
  return fileList.value;
});

const getFileIcon = (fileName: string) => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pptx":
      return Present;
    case "pdf":
      return Document;
    case "docx":
      return Document;
    case "zip":
      return Folder;
    case "mp4":
      return VideoCamera;
    case "xlsx":
      return Tickets;
    default:
      return Document;
  }
};

const handleFilter = () => {
  // The list is already filtered by computed property, this is for the enter keyup
};

const resetSearch = () => {
  listQuery.value.name = "";
};

const handleUpload = () => {
  ElMessage.info("请实名认证后上传文件");
};

const handleDownload = row => {
  ElMessage.success(`开始下载: ${row.name}`);
  window.open(row.url, "_blank");
};

const handleDelete = row => {
  ElMessageBox.confirm(`确定要删除文件 "${row.name}" 吗?`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      const index = fileList.value.findIndex(item => item.name === row.name);
      if (index !== -1) {
        fileList.value.splice(index, 1);
        ElMessage.success("删除成功");
      }
    })
    .catch(() => {
      ElMessage.info("已取消删除");
    });
};
</script>

<style lang="scss" scoped>
.main {
  padding: 24px;

  .box-card {
    border: none;
    border-radius: 20px;
    box-shadow: 0 4px 16px rgb(0 0 0 / 5%);
    transition: all 0.3s;

    &:hover {
      box-shadow: 0 8px 24px rgb(0 0 0 / 8%);
    }

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;

      span {
        font-size: 18px;
        font-weight: 600;
      }
    }

    .search-form {
      margin-bottom: 20px;

      :deep(.el-input__wrapper) {
        border-radius: 12px;
      }
    }
  }

  .file-name-cell {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .file-icon {
    color: #409eff;
  }
}

:deep(.el-card__header) {
  padding: 20px 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-card__body) {
  padding: 24px;
}

:deep(.el-table) {
  --el-table-header-padding: 12px 0;
  --el-table-cell-padding: 12px 0;

  overflow: hidden;
  border-radius: 16px;
}

:deep(.el-button) {
  border-radius: 10px;
  padding: 8px 16px;
}

:deep(.el-button--small) {
  border-radius: 8px;
  padding: 5px 12px;
}
</style>
