<script setup lang="ts">
import { ref, computed } from "vue";
import { ElMessage } from "element-plus";

defineOptions({ name: "RichMediaUploader" });

interface MediaItem {
  url: string;
  name: string;
  type: "image" | "audio" | "video";
  size?: number;
}

const props = defineProps<{
  modelValue: MediaItem[];
}>();

const emit = defineEmits<{
  "update:modelValue": [value: MediaItem[]];
}>();

const mediaList = computed({
  get: () => props.modelValue || [],
  set: val => emit("update:modelValue", val)
});

const activeTab = ref<"image" | "audio" | "video">("image");

const imageAccept = "image/jpeg,image/png,image/gif,image/webp,image/svg+xml";
const audioAccept = "audio/mpeg,audio/wav,audio/ogg,audio/mp3";
const videoAccept = "video/mp4,video/webm,video/ogg";

const acceptMap = {
  image: imageAccept,
  audio: audioAccept,
  video: videoAccept
};
const labelMap = { image: "图片", audio: "音频", video: "视频" };
const maxSizeMap = { image: 5, audio: 20, video: 100 }; // MB

const filteredMedia = (type: string) =>
  mediaList.value.filter(m => m.type === type);

const handleFileChange = (file: any) => {
  const raw = file.raw || file;
  const type = activeTab.value;
  const maxSize = maxSizeMap[type] * 1024 * 1024;

  if (raw.size > maxSize) {
    ElMessage.error(`${labelMap[type]}文件大小不能超过 ${maxSizeMap[type]}MB`);
    return false;
  }

  // 使用 FileReader 转为 base64 URL（实际项目中应上传到服务器）
  const reader = new FileReader();
  reader.onload = e => {
    const url = e.target?.result as string;
    const newItem: MediaItem = {
      url,
      name: raw.name,
      type,
      size: raw.size
    };
    mediaList.value = [...mediaList.value, newItem];
  };
  reader.readAsDataURL(raw);
  return false; // 阻止自动上传
};

const removeMedia = (index: number, type: string) => {
  const items = [...mediaList.value];
  const typeItems = items.filter(m => m.type === type);
  const target = typeItems[index];
  const globalIndex = items.indexOf(target);
  if (globalIndex !== -1) {
    items.splice(globalIndex, 1);
    mediaList.value = items;
  }
};

const formatSize = (bytes?: number) => {
  if (!bytes) return "";
  if (bytes < 1024) return bytes + "B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + "KB";
  return (bytes / (1024 * 1024)).toFixed(1) + "MB";
};

// 音频播放
const playingAudio = ref<string | null>(null);
const audioRef = ref<HTMLAudioElement | null>(null);

const toggleAudio = (url: string) => {
  if (playingAudio.value === url) {
    audioRef.value?.pause();
    playingAudio.value = null;
  } else {
    playingAudio.value = url;
    setTimeout(() => audioRef.value?.play(), 50);
  }
};
</script>

<template>
  <div class="rich-media-uploader">
    <div class="media-tabs">
      <div
        v-for="tab in ['image', 'audio', 'video'] as const"
        :key="tab"
        class="media-tab"
        :class="{ active: activeTab === tab }"
        @click="activeTab = tab"
      >
        <el-icon v-if="tab === 'image'"><Picture /></el-icon>
        <el-icon v-else-if="tab === 'audio'"><Headset /></el-icon>
        <el-icon v-else><VideoCamera /></el-icon>
        <span>{{ labelMap[tab] }}</span>
        <span v-if="filteredMedia(tab).length" class="media-count">
          {{ filteredMedia(tab).length }}
        </span>
      </div>
    </div>

    <div class="media-content">
      <!-- 图片 -->
      <div v-show="activeTab === 'image'" class="media-section">
        <div class="media-grid">
          <div
            v-for="(item, idx) in filteredMedia('image')"
            :key="idx"
            class="media-item image-item"
          >
            <img :src="item.url" :alt="item.name" class="image-preview" />
            <div class="media-overlay">
              <span class="media-name">{{ item.name }}</span>
              <el-button
                link
                type="danger"
                size="small"
                @click="removeMedia(idx, 'image')"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <el-upload
            class="media-upload-trigger"
            :accept="acceptMap.image"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
          >
            <div class="upload-placeholder">
              <el-icon><Plus /></el-icon>
              <span>上传图片</span>
              <span class="upload-hint">≤{{ maxSizeMap.image }}MB</span>
            </div>
          </el-upload>
        </div>
      </div>

      <!-- 音频 -->
      <div v-show="activeTab === 'audio'" class="media-section">
        <div class="media-list">
          <div
            v-for="(item, idx) in filteredMedia('audio')"
            :key="idx"
            class="media-item audio-item"
          >
            <el-icon class="audio-icon" @click="toggleAudio(item.url)">
              <VideoPlay v-if="playingAudio !== item.url" />
              <VideoPause v-else />
            </el-icon>
            <div class="audio-info">
              <span class="media-name">{{ item.name }}</span>
              <span class="media-size">{{ formatSize(item.size) }}</span>
            </div>
            <el-button
              link
              type="danger"
              size="small"
              @click="removeMedia(idx, 'audio')"
            >
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
          <audio
            v-if="playingAudio"
            ref="audioRef"
            :src="playingAudio"
            @ended="playingAudio = null"
          />
          <el-upload
            class="media-upload-btn"
            :accept="acceptMap.audio"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
          >
            <el-button link type="primary" size="small">
              <el-icon><Plus /></el-icon>
              上传音频（≤{{ maxSizeMap.audio }}MB）
            </el-button>
          </el-upload>
        </div>
      </div>

      <!-- 视频 -->
      <div v-show="activeTab === 'video'" class="media-section">
        <div class="media-list">
          <div
            v-for="(item, idx) in filteredMedia('video')"
            :key="idx"
            class="media-item video-item"
          >
            <video
              :src="item.url"
              class="video-preview"
              controls
              preload="metadata"
            />
            <div class="video-info">
              <span class="media-name">{{ item.name }}</span>
              <span class="media-size">{{ formatSize(item.size) }}</span>
              <el-button
                link
                type="danger"
                size="small"
                @click="removeMedia(idx, 'video')"
              >
                <el-icon><Delete /></el-icon>
              </el-button>
            </div>
          </div>
          <el-upload
            class="media-upload-btn"
            :accept="acceptMap.video"
            :auto-upload="false"
            :show-file-list="false"
            :on-change="handleFileChange"
          >
            <el-button link type="primary" size="small">
              <el-icon><Plus /></el-icon>
              上传视频（≤{{ maxSizeMap.video }}MB）
            </el-button>
          </el-upload>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.rich-media-uploader {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  overflow: hidden;

  .media-tabs {
    display: flex;
    border-bottom: 1px solid #e4e7ed;
    background: #fafafa;

    .media-tab {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 8px 16px;
      font-size: 13px;
      color: #606266;
      cursor: pointer;
      transition: all 0.2s;
      border-bottom: 2px solid transparent;

      &:hover {
        color: #739cf9;
        background: rgba(115, 156, 249, 0.05);
      }

      &.active {
        color: #739cf9;
        border-bottom-color: #739cf9;
        background: rgba(115, 156, 249, 0.05);
      }

      .media-count {
        font-size: 11px;
        background: #739cf9;
        color: #fff;
        padding: 0 6px;
        border-radius: 10px;
        min-width: 18px;
        text-align: center;
      }
    }
  }

  .media-content {
    padding: 12px;
  }

  .media-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;

    .image-item {
      position: relative;
      width: 100px;
      height: 100px;
      border-radius: 6px;
      overflow: hidden;
      border: 1px solid #e4e7ed;

      .image-preview {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .media-overlay {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0, 0, 0, 0.6);
        padding: 4px 6px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        opacity: 0;
        transition: opacity 0.2s;

        .media-name {
          font-size: 11px;
          color: #fff;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }
      }

      &:hover .media-overlay {
        opacity: 1;
      }
    }

    .media-upload-trigger {
      :deep(.el-upload) {
        width: 100px;
        height: 100px;
        border: 1px dashed #d9d9d9;
        border-radius: 6px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;

        &:hover {
          border-color: #739cf9;
        }
      }

      .upload-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        color: #909399;
        font-size: 12px;

        .el-icon {
          font-size: 20px;
        }

        .upload-hint {
          font-size: 10px;
          color: #c0c4cc;
        }
      }
    }
  }

  .media-list {
    .audio-item,
    .video-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 10px;
      border: 1px solid #e4e7ed;
      border-radius: 6px;
      margin-bottom: 8px;
    }

    .audio-icon {
      font-size: 24px;
      color: #739cf9;
      cursor: pointer;

      &:hover {
        color: #009688;
      }
    }

    .audio-info,
    .video-info {
      flex: 1;
      display: flex;
      align-items: center;
      gap: 8px;

      .media-name {
        font-size: 13px;
        color: #303133;
      }

      .media-size {
        font-size: 12px;
        color: #909399;
      }
    }

    .video-item {
      flex-direction: column;
      align-items: stretch;

      .video-preview {
        width: 100%;
        max-height: 200px;
        border-radius: 4px;
        background: #000;
      }

      .video-info {
        padding-top: 6px;
      }
    }

    .media-upload-btn {
      margin-top: 4px;

      :deep(.el-upload) {
        width: 100%;
      }
    }
  }
}
</style>
