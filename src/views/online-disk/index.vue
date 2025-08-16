<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>在线云盘</span>
        </div>
      </template>

      <div class="filter-container">
        <el-input
          v-model="listQuery.name"
          placeholder="文件名"
          style="width: 200px"
          class="filter-item"
          :prefix-icon="Search"
          @keyup.enter="handleFilter"
        />
        <el-button
          class="filter-item"
          type="primary"
          :icon="Search"
          @click="handleFilter"
        >
          搜索
        </el-button>
        <el-button
          class="filter-item"
          type="primary"
          :icon="Upload"
          @click="handleUpload"
        >
          上传文件
        </el-button>
      </div>

      <el-table
        :data="filteredList"
        style="width: 100%; margin-top: 20px"
        border
      >
        <el-table-column label="文件名" prop="name" sortable>
          <template #default="{ row }">
            <div class="file-name-cell">
              <el-icon :size="20" class="file-icon">
                <component :is="getFileIcon(row.name)" />
              </el-icon>
              <span style="margin-left: 10px">{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="大小" prop="size" sortable width="120" />
        <el-table-column
          label="创建时间"
          prop="createTime"
          sortable
          width="180"
        />
        <el-table-column label="操作" width="200" align="center">
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
import { ref, computed } from "vue";
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

defineOptions({
  name: "OnlineDisk"
});

const fileList = ref([
  {
    name: "教案、教学设计.docx",
    size: "23.6 KB",
    createTime: "2023-10-01 10:00",
    url: "https://aiedu-file.lehinet.com/files/mdih93h4tg8hgsxbb893jdfw8r3hghsdkqq/%E6%95%99%E6%A1%88%E3%80%81%E6%95%99%E5%AD%A6%E8%AE%BE%E8%AE%A1.docx"
  },
  {
    name: "学生名单.docx",
    size: "12.9 KB",
    createTime: "2023-10-02 14:30",
    url: "https://aiedu-file.lehinet.com/files/mdih93h4tg8hgsxbb893jdfw8r3hghsdkqq/%E5%AD%A6%E7%94%9F%E5%90%8D%E5%8D%95.docx"
  },
  {
    name: "参与的教研活动资料.docx",
    size: "14.3 KB",
    createTime: "2023-10-05 09:00",
    url: "https://aiedu-file.lehinet.com/files/mdih93h4tg8hgsxbb893jdfw8r3hghsdkqq/%E5%8F%82%E4%B8%8E%E7%9A%84%E6%95%99%E7%A0%94%E6%B4%BB%E5%8A%A8%E8%B5%84%E6%96%99.docx"
  },
  {
    name: "作业评分标准和标准答案.docx",
    size: "3.1 MB",
    createTime: "2023-10-10 16:45",
    url: "https://aiedu-file.lehinet.com/files/mdih93h4tg8hgsxbb893jdfw8r3hghsdkqq/%E4%BD%9C%E4%B8%9A%E8%AF%84%E5%88%86%E6%A0%87%E5%87%86%E5%92%8C%E6%A0%87%E5%87%86%E7%AD%94%E6%A1%88.docx"
  },
  {
    name: "个人学术论文.docx",
    size: "14.3 KB",
    createTime: "2023-10-12 11:20",
    url: "https://aiedu-file.lehinet.com/files/mdih93h4tg8hgsxbb893jdfw8r3hghsdkqq/%E4%B8%AA%E4%BA%BA%E5%AD%A6%E6%9C%AF%E8%AE%BA%E6%96%87.docx"
  },
  {
    name: "与学生或家长的沟通记录.docx",
    size: "14.6 KB",
    createTime: "2023-10-15 18:00",
    url: "https://aiedu-file.lehinet.com/files/mdih93h4tg8hgsxbb893jdfw8r3hghsdkqq/%E4%B8%8E%E5%AD%A6%E7%94%9F%E6%88%96%E5%AE%B6%E9%95%BF%E7%9A%84%E6%B2%9F%E9%80%9A%E8%AE%B0%E5%BD%95.docx"
  }
]);

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

<style scoped>
.app-container {
  padding: 20px;
}
.filter-container {
  margin-bottom: 20px;
}
.filter-item {
  margin-right: 10px;
}
.file-name-cell {
  display: flex;
  align-items: center;
  gap: 8px;
}
.file-icon {
  color: #606266;
}
</style>
