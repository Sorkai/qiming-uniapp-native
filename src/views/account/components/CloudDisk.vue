<template>
  <div class="cloud-disk-container" :class="currentTheme">
    <div class="disk-header">
      <h3>
        <CloudIcon
          style="
            width: 24px;
            height: 24px;
            margin-right: 8px;
            vertical-align: middle;
          "
        />
        学习云盘
      </h3>
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
      v-loading="loading"
      :data="filteredFiles"
      style="width: 100%"
      :row-style="{ cursor: 'pointer' }"
      class="disk-table"
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
import CloudIcon from "@/new student interface icons/file-svgrepo-com.svg?component";

defineProps<{
  currentTheme?: string;
}>();

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

const files = ref<CloudFile[]>([
  {
    id: 1,
    name: "2024年12月六级真题（第一套）-听力音频.mp3",
    type: "audio",
    size: "19.9 MB",
    date: "2025-07-18 15:21",
    url: "https://aiedu-api.intelledu.cn/files/xi28g985hsr1hlnpeycv45whrk311frr45vb55dfalp8v/2024%E5%B9%B412%E6%9C%88%E5%85%AD%E7%BA%A7%E7%9C%9F%E9%A2%98%EF%BC%88%E7%AC%AC%E4%B8%80%E5%A5%97%EF%BC%89-%E5%90%AC%E5%8A%9B%E9%9F%B3%E9%A2%91.mp3"
  },
  {
    id: 2,
    name: "2024年12月六级真题（第一套）.pdf",
    type: "doc",
    size: "1.1 MB",
    date: "2025-07-18 12:34",
    url: "https://aiedu-api.intelledu.cn/files/xi28g985hsr1hlnpeycv45whrk311frr45vb55dfalp8v/2024%E5%B9%B412%E6%9C%88%E5%85%AD%E7%BA%A7%E7%9C%9F%E9%A2%98%EF%BC%88%E7%AC%AC%E4%B8%80%E5%A5%97%EF%BC%89.pdf"
  },
  {
    id: 3,
    name: "同济版高等数学-1.pdf",
    type: "doc",
    size: "73.1 MB",
    date: "2025-07-17 09:12",
    url: "https://aiedu-api.intelledu.cn/files/xi28g985hsr1hlnpeycv45whrk311frr45vb55dfalp8v/%E5%90%8C%E6%B5%8E%E7%89%88%E9%AB%98%E7%AD%89%E6%95%B0%E5%AD%A6-1.pdf"
  },
  {
    id: 4,
    name: "大学普通化学电子书.pdf",
    type: "doc",
    size: "9.8 MB",
    date: "2025-07-16 20:00",
    url: "https://aiedu-api.intelledu.cn/files/xi28g985hsr1hlnpeycv45whrk311frr45vb55dfalp8v/%E5%A4%A7%E5%AD%A6%E6%99%AE%E9%80%9A%E5%8C%96%E5%AD%A6%E7%94%B5%E5%AD%90%E4%B9%A6.pdf"
  },
  {
    id: 5,
    name: "大学普通物理电子书.pdf",
    type: "doc",
    size: "59.1 MB",
    date: "2025-07-15 11:05",
    url: "https://aiedu-api.intelledu.cn/files/xi28g985hsr1hlnpeycv45whrk311frr45vb55dfalp8v/%E5%A4%A7%E5%AD%A6%E6%99%AE%E9%80%9A%E7%89%A9%E7%90%86%E7%94%B5%E5%AD%90%E4%B9%A6.pdf"
  },
  {
    id: 6,
    name: "大学语文第一节.pptx",
    type: "doc",
    size: "458 KB",
    date: "2025-07-14 18:20",
    url: "https://aiedu-api.intelledu.cn/files/xi28g985hsr1hlnpeycv45whrk311frr45vb55dfalp8v/%E5%A4%A7%E5%AD%A6%E8%AF%AD%E6%96%87%E7%AC%AC%E4%B8%80%E8%8A%82.pptx"
  },
  {
    id: 7,
    name: "嵌入式Linux开发实践教程第一节.pptx",
    type: "doc",
    size: "1021 KB",
    date: "2025-07-13 14:00",
    url: "https://aiedu-api.intelledu.cn/files/xi28g985hsr1hlnpeycv45whrk311frr45vb55dfalp8v/%E5%B5%8C%E5%85%A5%E5%BC%8FLinux%E5%BC%80%E5%8F%91%E5%AE%9E%E8%B7%B5%E6%95%99%E7%A8%8B%E7%AC%AC%E4%B8%80%E8%8A%82.pptx"
  },
  {
    id: 8,
    name: "开展第二学期选修课的通知.docx",
    type: "doc",
    size: "5.9 MB",
    date: "2025-07-15 17:04",
    url: "https://aiedu-api.intelledu.cn/files/xi28g985hsr1hlnpeycv45whrk311frr45vb55dfalp8v/%E5%BC%80%E5%B1%95%E7%AC%AC%E4%BA%8C%E5%AD%A6%E6%9C%9F%E9%80%89%E4%BF%AE%E8%AF%BE%E7%9A%84%E9%80%9A%E7%9F%A5.docx"
  },
  {
    id: 9,
    name: "形势与政策课程报告.docx",
    type: "doc",
    size: "5.9 MB",
    date: "2025-07-11 12:22",
    url: "https://aiedu-api.intelledu.cn/files/xi28g985hsr1hlnpeycv45whrk311frr45vb55dfalp8v/%E5%BD%A2%E5%8A%BF%E4%B8%8E%E6%94%BF%E7%AD%96%E8%AF%BE%E7%A8%8B%E6%8A%A5%E5%91%8A.docx"
  },
  {
    id: 10,
    name: "数字电路-设计01.ms14",
    type: "image",
    size: "98 KB",
    date: "2025-07-14 09:37",
    url: "https://aiedu-api.intelledu.cn/files/xi28g985hsr1hlnpeycv45whrk311frr45vb55dfalp8v/%E6%95%B0%E5%AD%97%E7%94%B5%E8%B7%AF-%E8%AE%BE%E8%AE%A101.ms14"
  },
  {
    id: 11,
    name: "数字电路-课程设计指导书.pdf",
    type: "doc",
    size: "113 KB",
    date: "2025-07-13 11:55",
    url: "https://aiedu-api.intelledu.cn/files/xi28g985hsr1hlnpeycv45whrk311frr45vb55dfalp8v/%E6%95%B0%E5%AD%97%E7%94%B5%E8%B7%AF-%E8%AF%BE%E7%A8%8B%E8%AE%BE%E8%AE%A1%E6%8C%87%E5%AF%BC%E4%B9%A6.pdf"
  },
  {
    id: 12,
    name: "有关于开展“校园AI绘画大赛”的通知.docx",
    type: "doc",
    size: "2.9 MB",
    date: "2025-07-12 14:48",
    url: "https://aiedu-api.intelledu.cn/files/xi28g985hsr1hlnpeycv45whrk311frr45vb55dfalp8v/%E6%9C%89%E5%85%B3%E4%BA%8E%E5%BC%80%E5%B1%95%E2%80%9C%E6%A0%A1%E5%9B%ADAI%E7%BB%98%E7%94%BB%E5%A4%A7%E8%B5%9B%E2%80%9D%E7%9A%84%E9%80%9A%E7%9F%A5.docx"
  },
  {
    id: 13,
    name: "计算机组成原理.pdf",
    type: "doc",
    size: "19.7 MB",
    date: "2025-07-12 12:50",
    url: "https://aiedu-api.intelledu.cn/files/xi28g985hsr1hlnpeycv45whrk311frr45vb55dfalp8v/%E8%AE%A1%E7%AE%97%E6%9C%BA%E7%BB%84%E6%88%90%E5%8E%9F%E7%90%86.pdf"
  },
  {
    id: 14,
    name: "美育课程专项-漫画艺术赏析.pptx",
    type: "doc",
    size: "6.5 MB",
    date: "2025-07-15 16:50",
    url: "https://aiedu-api.intelledu.cn/files/xi28g985hsr1hlnpeycv45whrk311frr45vb55dfalp8v/%E7%BE%8E%E8%82%B2%E8%AF%BE%E7%A8%8B%E4%B8%93%E9%A1%B9-%E6%BC%AB%E7%94%BB%E8%89%BA%E6%9C%AF%E8%B5%8F%E6%9E%90.pptx"
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
  ElMessage.info("管理员已停用上传");
};

// 模拟下载
const handleDownload = (file: CloudFile) => {
  if (file.type === "folder") {
    ElMessage.warning("文件夹不能直接下载");
    return;
  }
  ElMessage.success(`开始下载文件: ${file.name}`);
  window.open(file.url, "_blank");
};

// 文件分享
const handleShare = (file: CloudFile) => {
  if (file.url && file.url !== "#") {
    navigator.clipboard
      .writeText(file.url)
      .then(() => {
        ElMessage.success("分享链接已复制到剪贴板");
      })
      .catch(err => {
        ElMessage.error("复制分享链接失败");
        console.error("Failed to copy: ", err);
      });
  } else {
    ElMessage.warning("该文件没有可用的分享链接");
  }
};

// 模拟删除
const handleDelete = (file: CloudFile) => {
  ElMessageBox.confirm(
    `确定要删除 "${file.name}" 吗？此操作不可恢复。`,
    "警告",
    {
      confirmButtonText: "删除",
      cancelButtonText: "取消",
      type: "warning"
    }
  )
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
  box-sizing: border-box;
  width: calc(100% - 2px);
  min-width: 0;
  max-width: 100%;
  padding: 16px;
  overflow: hidden;
  background-color: #fff;
  border: 1px solid var(--el-border-color-light);
  border-radius: 16px;
  box-shadow: 0 2px 12px rgb(0 0 0 / 4%);

  .dark & {
    background-color: #1e293b;
    border-color: #334155;
  }

  .disk-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;

    h3 {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;

      .dark & {
        color: #f1f5f9;
      }
    }

    .actions {
      display: flex;
      gap: 10px;
    }

    .search-input {
      width: 240px;

      :deep(.el-input__wrapper) {
        .dark & {
          background-color: #1e293b;
          box-shadow: 0 0 0 1px #334155 inset;
        }
      }

      :deep(.el-input__inner) {
        .dark & {
          color: #f1f5f9;

          &::placeholder {
            color: #64748b;
          }
        }
      }
    }
  }

  .disk-table {
    width: 100%;
    min-width: 0;
    overflow: hidden;
    border-radius: 12px;

    :deep(.el-table__inner-wrapper) {
      overflow-x: auto;
    }

    :deep(.el-table__header-wrapper) {
      th {
        .dark & {
          color: #94a3b8;
          background-color: #0f172a;
          border-bottom-color: #1e293b;
        }
      }
    }

    :deep(.el-table__row) {
      .dark & {
        color: #f1f5f9;
        background-color: #1e293b;

        td {
          border-bottom-color: #0f172a;
        }

        &:hover > td {
          background-color: #334155;
        }
      }
    }
  }

  .file-name-cell {
    display: flex;
    gap: 8px;
    align-items: center;

    .file-icon {
      color: #606266;

      .dark & {
        color: #94a3b8;
      }
    }
  }

  .empty-state {
    margin-top: 40px;
  }
}
</style>
