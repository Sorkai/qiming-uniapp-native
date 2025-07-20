<template>
  <div class="cloud-disk-container">
    <div class="disk-header">
      <h3>学习云盘</h3>
      <div class="actions">
        <el-input
          v-model="searchQuery"
          placeholder="搜索您的文件"
          :prefix-icon="Search"
          clearable
          class="search-input"
        />
        <el-button type="primary" :icon="Upload" @click="handleUpload"
          >上传文件</el-button
        >
      </div>
    </div>

    <el-table
      :data="filteredFiles"
      style="width: 100%"
      v-loading="loading"
      :row-style="{ cursor: 'pointer' }"
    >
      <el-table-column prop="name" label="文件名" min-width="250">
        <template #default="{ row }">
          <div class="file-name-cell">
            <el-icon :size="20" class="file-icon">
              <component :is="getFileIcon(row.type)" />
            </el-icon>
            <span>{{ row.name }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="size" label="大小" width="120" />
      <el-table-column prop="date" label="修改日期" width="180" />
      <el-table-column label="操作" width="200">
        <template #default="{ row }">
          <el-button
            type="primary"
            link
            size="small"
            @click.stop="handleDownload(row)"
            >下载</el-button
          >
          <el-button
            type="primary"
            link
            size="small"
            @click.stop="handleShare(row)"
            >分享</el-button
          >
          <el-button
            type="danger"
            link
            size="small"
            @click.stop="handleDelete(row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>

    <div v-if="filteredFiles.length === 0 && !loading" class="empty-state">
      <el-empty description="没有找到文件或文件夹为空" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Upload,
  Search,
  Folder,
  Document,
  Picture as PictureIcon,
  VideoCamera,
  Headset
} from "@element-plus/icons-vue";

// 文件类型定义
type FileType = "folder" | "doc" | "image" | "video" | "audio" | "other";

// 文件接口
interface CloudFile {
  id: number;
  name: string;
  type: FileType;
  size: string;
  date: string;
  url?: string; // 下载地址
}

const searchQuery = ref("");
const loading = ref(false);

// 模拟文件列表 (您可以在这里硬编码您的文件信息)
const files = ref<CloudFile[]>([
  {
    id: 1,
    name: "课程资料",
    type: "folder",
    size: "-",
    date: "2025-07-19 10:30"
  },
  {
    id: 2,
    name: "高等数学-第一章.pdf",
    type: "doc",
    size: "2.5 MB",
    date: "2025-07-18 15:45",
    url: "#"
  },
  {
    id: 3,
    name: "项目设计图.png",
    type: "image",
    size: "800 KB",
    date: "2025-07-17 09:12",
    url: "#"
  },
  {
    id: 4,
    name: "嵌入式Linux开发视频教程.mp4",
    type: "video",
    size: "1.2 GB",
    date: "2025-07-16 20:00",
    url: "#"
  },
  {
    id: 5,
    name: "英语听力练习.mp3",
    type: "audio",
    size: "5.1 MB",
    date: "2025-07-15 11:05",
    url: "#"
  },
  {
    id: 6,
    name: "毕业论文最终版.docx",
    type: "doc",
    size: "1.2 MB",
    date: "2025-07-14 18:20",
    url: "#"
  },
  {
    id: 7,
    name: "学习笔记",
    type: "folder",
    size: "-",
    date: "2025-07-13 14:00"
  },
  {
    id: 8,
    name: "实验报告.pdf",
    type: "doc",
    size: "750 KB",
    date: "2025-07-12 16:50",
    url: "#"
  }
]);

// 根据搜索查询过滤文件
const filteredFiles = computed(() => {
  if (!searchQuery.value) {
    return files.value;
  }
  return files.value.filter(file =>
    file.name.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// 根据文件类型获取图标
const getFileIcon = (type: FileType) => {
  switch (type) {
    case "folder":
      return Folder;
    case "doc":
      return Document;
    case "image":
      return PictureIcon;
    case "video":
      return VideoCamera;
    case "audio":
      return Headset;
    default:
      return Document;
  }
};

// 模拟上传
const handleUpload = () => {
  ElMessage.info("此功能为演示功能");
};

// 模拟下载
const handleDownload = (file: CloudFile) => {
  if (file.type === "folder") {
    ElMessage.warning("文件夹不能直接下载");
    return;
  }
  ElMessage.success(`开始下载文件: ${file.name}`);
  // 实际下载逻辑: window.open(file.url, '_blank');
};

// 模拟分享
const handleShare = (file: CloudFile) => {
  ElMessageBox.alert(
    `文件 "${file.name}" 的分享链接已复制到剪贴板 (演示)。`,
    "分享",
    {
      confirmButtonText: "好的"
    }
  );
};

// 模拟删除
const handleDelete = (file: CloudFile) => {
  ElMessageBox.confirm(`确定要删除 "${file.name}" 吗？此操作不可恢复。`, "警告", {
    confirmButtonText: "删除",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      files.value = files.value.filter(f => f.id !== file.id);
      ElMessage.success(`文件 "${file.name}" 已删除`);
    })
    .catch(() => {
      // 用户取消
    });
};
</script>

<style lang="scss" scoped>
.cloud-disk-container {
  .disk-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
    }

    .actions {
      display: flex;
      gap: 10px;
    }

    .search-input {
      width: 240px;
    }
  }

  .file-name-cell {
    display: flex;
    align-items: center;
    gap: 8px;

    .file-icon {
      color: #606266;
    }
  }

  .empty-state {
    margin-top: 40px;
  }
}
</style>
