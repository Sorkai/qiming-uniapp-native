<template>
  <el-card shadow="hover" class="course-card">
    <div class="course-thumb-container">
      <el-image
        :src="course.thumbUrl"
        fit="cover"
        class="course-thumb"
      >
        <template #error>
          <div class="image-placeholder">
            <el-icon :size="40"><Picture /></el-icon>
          </div>
        </template>
      </el-image>
      <div class="course-status-tag">
        <el-tag :type="course.isRequired === 1 ? 'danger' : 'info'" size="small" effect="dark">
          {{ course.isRequired === 1 ? '必修' : '选修' }}
        </el-tag>
      </div>
      <div class="course-actions-overlay">
        <el-button type="primary" size="default" circle @click="$emit('edit', course)">
          <el-icon :size="18"><Edit /></el-icon>
        </el-button>
        <el-button type="danger" size="default" circle @click="$emit('delete', course)">
          <el-icon :size="18"><Delete /></el-icon>
        </el-button>
      </div>
    </div>
    <div class="course-content">
      <h3 class="course-title" :title="course.title">{{ course.title }}</h3>
      <p class="course-desc" :title="course.shortDesc">{{ course.shortDesc || '暂无简介' }}</p>
      
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
          <el-button size="default" class="action-btn" @click="$emit('view-hours', course)">章节课时</el-button>
          <el-button size="default" class="action-btn" @click="$emit('view-attrs', course)">附件资源</el-button>
        </div>
        <div class="button-row mt-2">
          <el-button size="default" type="success" class="action-btn" @click="$emit('allocation', course)">学员分配</el-button>
          <el-button size="default" type="warning" class="action-btn" @click="$emit('study-status', course)">学习情况</el-button>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { Picture, Edit, Delete, User, Collection } from "@element-plus/icons-vue";

defineProps<{
  course: any;
}>();

defineEmits(['edit', 'delete', 'view-hours', 'view-attrs', 'allocation', 'study-status']);
</script>

<style scoped lang="scss">
.course-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  transition: all 0.3s;
  border: none;
  overflow: hidden;
  border-radius: 16px;
  background: var(--el-bg-color-overlay);

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1) !important;
    
    .course-actions-overlay {
      opacity: 1;
    }
  }

  :deep(.el-card__body) {
    padding: 0;
    display: flex;
    flex-direction: column;
    height: 100%;
  }
}

.course-thumb-container {
  position: relative;
  height: 180px;
  width: 100%;
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
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-placeholder);
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 15px;
  opacity: 0;
  transition: opacity 0.3s;
  z-index: 1;
}

.course-content {
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.course-title {
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.course-desc {
  margin: 0 0 16px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  height: 40px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 20px;
}

.course-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  color: var(--el-text-color-secondary);
  font-size: 13px;

  .meta-item {
    display: flex;
    align-items: center;
    gap: 4px;
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
    border-radius: 8px;
    font-size: 13px;
    padding: 8px 12px;
    height: 36px;
  }
}

.course-actions-overlay {
  .el-button {
    width: 40px;
    height: 40px;
  }
}
</style>
