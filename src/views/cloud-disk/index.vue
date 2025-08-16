<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>教学云盘</span>
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
  name: "CloudDisk"
});

const fileList = ref([
  {
    name: "课程介绍.pptx",
    size: "2.3 MB",
    createTime: "2023-10-01 10:00",
    url: "#"
  },
  {
    name: "第一章：Vue基础.pdf",
    size: "5.1 MB",
    createTime: "2023-10-02 14:30",
    url: "#"
  },
  {
    name: "第二章：组件化开发.docx",
    size: "1.2 MB",
    createTime: "2023-10-05 09:00",
    url: "#"
  },
  {
    name: "期中项目要求.zip",
    size: "10.5 MB",
    createTime: "2023-10-10 16:45",
    url: "#"
  },
  {
    name: "教学视频-1.mp4",
    size: "128 MB",
    createTime: "2023-10-12 11:20",
    url: "#"
  },
  {
    name: "学生成绩表.xlsx",
    size: "350 KB",
    createTime: "2023-10-15 18:00",
    url: "#"
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
  // window.open(row.url, '_blank');
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
