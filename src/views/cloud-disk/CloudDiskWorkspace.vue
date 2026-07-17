<template>
  <section class="cloud-disk-workspace" :aria-labelledby="titleId">
    <header class="disk-header">
      <div class="disk-heading">
        <div class="disk-title-row">
          <span class="disk-title-icon" aria-hidden="true">
            <el-icon><FolderOpened /></el-icon>
          </span>
          <div>
            <h2 :id="titleId">{{ title }}</h2>
            <p>{{ subtitle }}</p>
          </div>
        </div>
        <span v-if="!loading && !loadError" class="disk-count">
          共 {{ total }} 个文件
        </span>
      </div>

      <div class="disk-header-actions">
        <input
          ref="fileInputRef"
          class="visually-hidden"
          type="file"
          @change="handleFileChange"
        />
        <el-button
          type="primary"
          :icon="Upload"
          :loading="uploading"
          class="touch-button"
          @click="chooseFile"
        >
          上传文件
        </el-button>
      </div>
    </header>

    <el-alert
      class="capability-alert"
      type="info"
      :closable="false"
      show-icon
      :title="CLOUD_DISK_DELETE_UNAVAILABLE"
    />

    <div class="disk-toolbar">
      <el-input
        v-model="searchQuery"
        :prefix-icon="Search"
        clearable
        class="disk-search"
        aria-label="筛选当前页文件"
        placeholder="筛选当前页文件"
      />
      <el-button
        :icon="Refresh"
        :loading="loading"
        class="touch-button"
        @click="loadFiles(pageNum)"
      >
        刷新
      </el-button>
    </div>

    <div v-if="loadError" class="disk-state disk-state--error" role="alert">
      <el-icon class="disk-state-icon"><WarningFilled /></el-icon>
      <div class="disk-state-copy">
        <h3>文件列表加载失败</h3>
        <p>{{ loadError }}</p>
      </div>
      <el-button
        type="primary"
        :icon="Refresh"
        class="touch-button"
        @click="loadFiles(pageNum)"
      >
        重新加载
      </el-button>
    </div>

    <div v-else-if="loading" class="disk-loading" aria-busy="true">
      <el-skeleton :rows="5" animated />
    </div>

    <el-empty
      v-else-if="filteredFiles.length === 0"
      :description="emptyDescription"
    />

    <template v-else>
      <div v-if="isMobile" class="mobile-file-list">
        <article
          v-for="file in filteredFiles"
          :key="file.id"
          class="mobile-file-card"
        >
          <div class="mobile-file-main">
            <span class="file-kind-icon" :class="`is-${file.kind}`">
              <el-icon><component :is="getFileIcon(file.kind)" /></el-icon>
            </span>
            <div class="mobile-file-copy">
              <h3>{{ file.name }}</h3>
              <p>{{ file.kindLabel }} · {{ file.sizeLabel }}</p>
            </div>
          </div>

          <div class="mobile-file-actions" :class="{ 'has-share': showShare }">
            <el-button
              :icon="View"
              class="touch-button"
              @click="openCloudFile(file)"
            >
              查看
            </el-button>
            <el-button
              type="primary"
              plain
              :icon="Download"
              class="touch-button"
              @click="downloadCloudFile(file)"
            >
              下载
            </el-button>
            <el-button
              v-if="showShare"
              :icon="Share"
              class="touch-button"
              @click="shareCloudFile(file)"
            >
              分享
            </el-button>
            <el-button
              type="danger"
              plain
              :icon="Delete"
              class="touch-button"
              disabled
              title="删除功能尚未接入后端"
            >
              删除不可用
            </el-button>
          </div>
        </article>
      </div>

      <el-table
        v-else
        :data="filteredFiles"
        row-key="id"
        class="desktop-file-table"
      >
        <el-table-column label="文件名" min-width="280">
          <template #default="{ row }">
            <div class="desktop-file-name">
              <span class="file-kind-icon" :class="`is-${row.kind}`">
                <el-icon><component :is="getFileIcon(row.kind)" /></el-icon>
              </span>
              <span>{{ row.name }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="类型" width="120">
          <template #default="{ row }">
            {{ row.extension ? row.extension.toUpperCase() : row.kindLabel }}
          </template>
        </el-table-column>
        <el-table-column prop="sizeLabel" label="大小" width="120" />
        <el-table-column
          label="操作"
          :width="showShare ? 350 : 270"
          align="right"
        >
          <template #default="{ row }">
            <div class="desktop-file-actions">
              <el-button :icon="View" @click="openCloudFile(row)">
                查看
              </el-button>
              <el-button
                type="primary"
                plain
                :icon="Download"
                @click="downloadCloudFile(row)"
              >
                下载
              </el-button>
              <el-button
                v-if="showShare"
                :icon="Share"
                @click="shareCloudFile(row)"
              >
                分享
              </el-button>
              <el-tooltip content="删除功能尚未接入后端" placement="top">
                <span>
                  <el-button type="danger" plain :icon="Delete" disabled>
                    删除
                  </el-button>
                </span>
              </el-tooltip>
            </div>
          </template>
        </el-table-column>
      </el-table>

      <div v-if="total > pageSize" class="disk-pagination">
        <el-pagination
          :current-page="pageNum"
          :page-size="pageSize"
          :total="total"
          :pager-count="isMobile ? 5 : 7"
          :layout="isMobile ? 'prev, pager, next' : 'total, prev, pager, next'"
          @current-change="loadFiles"
        />
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, useId } from "vue";
import {
  Delete,
  Document,
  Download,
  Files,
  FolderOpened,
  Headset,
  Picture,
  Refresh,
  Search,
  Share,
  Upload,
  VideoCamera,
  View,
  WarningFilled
} from "@element-plus/icons-vue";
import { usePageResponsive } from "@/utils/pageResponsive";
import { CLOUD_DISK_DELETE_UNAVAILABLE, useCloudDisk } from "./useCloudDisk";
import type { CloudDiskFileKind } from "./cloudDiskRuntime";

const props = withDefaults(
  defineProps<{
    title: string;
    subtitle: string;
    showShare?: boolean;
  }>(),
  {
    showShare: false
  }
);

const { isMobile } = usePageResponsive();
const fileInputRef = ref<HTMLInputElement>();
const titleId = useId();
const {
  filteredFiles,
  total,
  pageNum,
  pageSize,
  searchQuery,
  loading,
  uploading,
  loadError,
  loadFiles,
  uploadCloudFile,
  openCloudFile,
  downloadCloudFile,
  shareCloudFile
} = useCloudDisk();

const emptyDescription = computed(() =>
  searchQuery.value.trim()
    ? "当前页没有匹配的文件"
    : `${props.title}中还没有文件`
);

const getFileIcon = (kind: CloudDiskFileKind) => {
  switch (kind) {
    case "image":
      return Picture;
    case "video":
      return VideoCamera;
    case "audio":
      return Headset;
    case "archive":
      return Files;
    default:
      return Document;
  }
};

const chooseFile = () => {
  if (!uploading.value) fileInputRef.value?.click();
};

const handleFileChange = async (event: Event) => {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (file) await uploadCloudFile(file);
  input.value = "";
};
</script>

<style lang="scss" scoped>
.cloud-disk-workspace {
  box-sizing: border-box;
  width: 100%;
  min-width: 0;
  padding: 20px;
  color: var(--el-text-color-primary);
}

.disk-header,
.disk-heading,
.disk-title-row,
.disk-header-actions,
.disk-toolbar,
.desktop-file-name,
.desktop-file-actions,
.mobile-file-main,
.mobile-file-actions,
.disk-state {
  display: flex;
  align-items: center;
}

.disk-header {
  justify-content: space-between;
  gap: 20px;
}

.disk-heading {
  gap: 18px;
  min-width: 0;
}

.disk-title-row {
  gap: 12px;
  min-width: 0;

  h2 {
    margin: 0;
    font-size: 18px;
    line-height: 1.4;
  }

  p {
    margin: 3px 0 0;
    font-size: 13px;
    line-height: 1.5;
    color: var(--el-text-color-secondary);
  }
}

.disk-title-icon,
.file-kind-icon {
  display: inline-flex;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  border-radius: 8px;
}

.disk-title-icon {
  width: 40px;
  height: 40px;
  font-size: 20px;
}

.disk-count {
  flex: 0 0 auto;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.disk-header-actions,
.desktop-file-actions {
  gap: 8px;
}

.capability-alert {
  margin-top: 18px;
}

.disk-toolbar {
  gap: 10px;
  margin-top: 16px;
}

.disk-search {
  width: min(360px, 100%);

  :deep(.el-input__wrapper) {
    min-height: 44px;
  }
}

.touch-button {
  min-height: 44px;
}

.disk-loading,
.disk-state,
.desktop-file-table,
.mobile-file-list {
  margin-top: 18px;
}

.disk-state {
  gap: 14px;
  min-height: 120px;
  padding: 18px;
  background: var(--el-color-danger-light-9);
  border: 1px solid var(--el-color-danger-light-7);
  border-radius: 8px;
}

.disk-state-icon {
  flex: 0 0 auto;
  font-size: 26px;
  color: var(--el-color-danger);
}

.disk-state-copy {
  flex: 1;
  min-width: 0;

  h3,
  p {
    margin: 0;
  }

  h3 {
    font-size: 15px;
  }

  p {
    margin-top: 4px;
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
    overflow-wrap: anywhere;
  }
}

.desktop-file-name {
  gap: 10px;
  min-width: 0;

  > span:last-child {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.file-kind-icon {
  width: 36px;
  height: 36px;

  &.is-image {
    color: var(--el-color-success);
    background: var(--el-color-success-light-9);
  }

  &.is-video {
    color: var(--el-color-danger);
    background: var(--el-color-danger-light-9);
  }

  &.is-audio,
  &.is-archive {
    color: var(--el-color-warning);
    background: var(--el-color-warning-light-9);
  }
}

.desktop-file-actions {
  justify-content: flex-end;
}

.mobile-file-list {
  display: grid;
  gap: 12px;
}

.mobile-file-card {
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}

.mobile-file-main {
  gap: 12px;
  align-items: flex-start;
}

.mobile-file-copy {
  min-width: 0;

  h3,
  p {
    margin: 0;
  }

  h3 {
    font-size: 14px;
    line-height: 1.55;
    overflow-wrap: anywhere;
  }

  p {
    margin-top: 5px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.mobile-file-actions {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 8px;
  margin-top: 14px;

  &.has-share {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  :deep(.el-button) {
    width: 100%;
    min-width: 0;
    min-height: 44px;
    margin: 0;
  }
}

.disk-pagination {
  display: flex;
  justify-content: flex-end;
  margin-top: 18px;
  overflow-x: auto;

  :deep(.btn-prev),
  :deep(.btn-next),
  :deep(.number) {
    min-width: 44px;
    height: 44px;
  }
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
  border: 0;
}

@media (width <= 768px) {
  .cloud-disk-workspace {
    padding: max(8px, env(safe-area-inset-top, 0px))
      max(8px, env(safe-area-inset-right, 0px))
      max(8px, env(safe-area-inset-bottom, 0px))
      max(8px, env(safe-area-inset-left, 0px));
  }

  .disk-header,
  .disk-heading,
  .disk-state {
    align-items: stretch;
  }

  .disk-header,
  .disk-heading,
  .disk-state {
    flex-direction: column;
  }

  .disk-heading {
    gap: 8px;
  }

  .disk-header-actions,
  .disk-header-actions :deep(.el-button) {
    width: 100%;
  }

  .disk-toolbar {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .disk-search {
    width: 100%;
  }

  .disk-state .touch-button {
    width: 100%;
  }

  .disk-pagination {
    justify-content: center;
  }
}

@media (width <= 380px) {
  .cloud-disk-workspace {
    padding-inline-start: max(6px, env(safe-area-inset-left, 0px));
    padding-inline-end: max(6px, env(safe-area-inset-right, 0px));
  }

  .disk-toolbar {
    grid-template-columns: 1fr;
  }

  .mobile-file-actions {
    grid-template-columns: 1fr;

    &.has-share {
      grid-template-columns: 1fr;
    }
  }
}
</style>
