<template>
  <el-card
    shadow="always"
    class="course-card"
    :style="{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)' }"
  >
    <div class="course-thumb-container">
      <el-image :src="course.thumbUrl" fit="cover" class="course-thumb">
        <template #error>
          <div class="image-placeholder">
            <el-icon :size="40"><Picture /></el-icon>
          </div>
        </template>
      </el-image>
      <div class="course-status-tag">
        <el-tag
          :type="course.isRequired === 1 ? 'danger' : 'info'"
          size="small"
          effect="dark"
        >
          {{ course.isRequired === 1 ? "必修" : "选修" }}
        </el-tag>
      </div>
      <div class="course-actions-overlay">
        <el-button
          type="primary"
          size="default"
          circle
          @click="$emit('edit', course)"
        >
          <el-icon :size="18"><Edit /></el-icon>
        </el-button>
        <el-button
          type="danger"
          size="default"
          circle
          @click="$emit('delete', course)"
        >
          <el-icon :size="18"><Delete /></el-icon>
        </el-button>
      </div>
    </div>
    <div class="course-content">
      <h3 class="course-title" :title="course.title">{{ course.title }}</h3>
      <p class="course-desc" :title="course.shortDesc">
        {{ course.shortDesc || "暂无简介" }}
      </p>

      <div class="course-meta">
        <div class="meta-item">
          <el-icon><User /></el-icon>
          <span>{{ course.userName }}</span>
        </div>
        <div class="meta-item">
          <el-icon><Collection /></el-icon>
          <span>{{ course.categoryDesc }}</span>
        </div>
      </div>

      <div class="course-footer">
        <div class="button-row">
          <el-button
            size="default"
            class="action-btn"
            @click="$emit('view-hours', course)"
            >章节课时</el-button
          >
          <el-button
            size="default"
            class="action-btn"
            @click="$emit('view-attrs', course)"
            >附件资源</el-button
          >
        </div>
        <div class="button-row mt-2">
          <el-button
            size="default"
            type="success"
            class="action-btn"
            @click="$emit('allocation', course)"
            >学员分配</el-button
          >
          <el-button
            size="default"
            type="warning"
            class="action-btn"
            @click="$emit('study-status', course)"
            >学习情况</el-button
          >
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import {
  Picture,
  Edit,
  Delete,
  User,
  Collection
} from "@element-plus/icons-vue";

defineProps<{
  course: any;
}>();

defineEmits([
  "edit",
  "delete",
  "view-hours",
  "view-attrs",
  "allocation",
  "study-status"
]);
</script>

<style scoped lang="scss">
.course-card {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background: var(--el-bg-color-overlay);
  border: none !important;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgb(0 0 0 / 12%) !important;
  transition: all 0.3s;

  &:hover {
    box-shadow: 0 12px 32px rgb(0 0 0 / 18%) !important;
    transform: translateY(-5px);

    .course-actions-overlay {
      opacity: 1;
    }
  }

  :deep(.el-card__body) {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0;
  }
}

.course-thumb-container {
  position: relative;
  width: 100%;
  height: 180px;
  overflow: hidden;

  .course-thumb {
    width: 100%;
    height: 100%;
    transition: transform 0.5s;
  }

  &:hover .course-thumb {
    transform: scale(1.1);
  }

  .image-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    color: var(--el-text-color-placeholder);
    background-color: var(--el-fill-color-light);
  }
}

.course-status-tag {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
}

.course-actions-overlay {
  position: absolute;
  inset: 0;
  z-index: 1;
  display: flex;
  gap: 15px;
  align-items: center;
  justify-content: center;
  background: rgb(0 0 0 / 40%);
  opacity: 0;
  transition: opacity 0.3s;
}

.course-content {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 16px;
}

.course-title {
  margin: 0 0 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  white-space: nowrap;
}

.course-desc {
  display: -webkit-box;
  height: 40px;
  margin: 0 0 16px;
  overflow: hidden;
  -webkit-line-clamp: 2;
  font-size: 14px;
  line-height: 20px;
  color: var(--el-text-color-regular);
  -webkit-box-orient: vertical;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 13px;
  color: var(--el-text-color-secondary);

  .meta-item {
    display: flex;
    gap: 4px;
    align-items: center;
  }
}

.course-footer {
  margin-top: auto;

  .button-row {
    display: flex;
    gap: 8px;
  }

  .action-btn {
    flex: 1;
    height: 36px;
    padding: 8px 12px;
    font-size: 13px;
    border-radius: 8px;
  }
}

.course-actions-overlay {
  .el-button {
    width: 40px;
    height: 40px;
  }
}
</style>
