<template>
  <!-- 课程资料 -->
  <div
    v-show="visible"
    data-v-2cf49992=""
    class="course-materials-wrapper"
    :class="currentTheme"
  >
    <!-- 头部 -->
    <CourseHeader
      :current-theme="currentTheme"
      title="课程资料"
      :user-avatar="userAvatar"
      :user-nickname="userNickname"
      @go-back="$emit('go-back')"
      @toggle-theme="e => $emit('toggle-theme', e)"
      @go-to-account="$emit('go-to-account')"
      @logout="$emit('logout')"
    />

    <!-- 内容 -->
    <div class="materials-container" :class="currentTheme">
      <div
        v-if="courseAttrList && courseAttrList.length > 0"
        class="materials-list"
      >
        <div
          v-for="(item, index) in courseAttrList"
          :key="index"
          class="material-item"
          :class="{ dark: currentTheme === 'dark' }"
          @click="viewMaterial(item)"
        >
          <div class="material-icon">
            <img v-if="item.rType === 'IMAGE'" :src="logo" alt="图片" />
            <img
              v-else-if="item.rType === 'VIDEO'"
              :src="logo"
              alt="视频"
            />
            <img
              v-else-if="item.rType === 'DOCUMENT'"
              :src="logo"
              alt="文档"
            />
            <img v-else :src="logo" alt="资源" />
          </div>
          <div class="material-info">
            <div class="material-title">{{ item.title }}</div>
            <div class="material-type">
              {{ getMaterialTypeName(item.rType) }}
            </div>
          </div>
          <div class="material-action">
            <el-button size="small" type="primary">查看</el-button>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无课程资料" />
    </div>
  </div>
</template>

<script setup lang="ts">
import CourseHeader from "./CourseHeader.vue";
import logo from "@/assets/kecheng.jpg";

// Props
const props = defineProps<{
  visible: boolean;
  currentTheme: string;
  courseAttrList: any[];
  userAvatar: string;
  userNickname: string;
}>();

// Emits
defineEmits<{
  (e: "go-back"): void;
  (e: "toggle-theme", event: MouseEvent): void;
  (e: "go-to-account"): void;
  (e: "logout"): void;
}>();

// 获取课程资料类型名称
const getMaterialTypeName = (type: string) => {
  const typeMap: Record<string, string> = {
    IMAGE: "图片",
    VIDEO: "视频",
    DOCUMENT: "文档",
    PDF: "PDF文档",
    AUDIO: "音频"
  };
  return typeMap[type] || "其他资源";
};

// 查看课程资料
const viewMaterial = (material: any) => {
  if (material && material.fileUrl) {
    window.open(material.fileUrl, "_blank");
  }
};
</script>

<style scoped>
/* 课程资料相关样式 */
.course-materials-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: transparent;
}

.materials-container {
  padding: 60px 20px 20px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  padding-left: 2vw;
  padding-right: 2vw;
}

.materials-title {
  font-size: 18px;
  margin-bottom: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.materials-list {
  display: grid;
  gap: 20px;
  width: 100%;
  max-width: 100%;
}

.material-item {
  display: flex;
  align-items: center;
  border: 1px solid #ebeef5;
  border-radius: 12px;
  padding: 20px;
  background-color: #fff;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.material-item.dark {
  background-color: #2a2a2a;
  border-color: #3e3e3e;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
}

.material-item:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.material-item.dark:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
}

.material-icon {
  flex-shrink: 0;
  margin-right: 15px;
}

.material-icon img {
  width: 50px;
  height: 50px;
  object-fit: contain;
}

.material-info {
  flex-grow: 1;
  overflow: hidden;
}

.material-info .material-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 5px;
  color: #303133;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.material-item.dark .material-info .material-title {
  color: #e0e0e0;
}

.material-info .material-type {
  font-size: 15px;
  color: #909399;
}

.material-item.dark .material-info .material-type {
  color: #aaa;
}

.material-action {
  flex-shrink: 0;
  margin-left: 10px;
}

.material-action .el-button {
  font-size: 15px;
  padding: 10px 20px;
}
</style>
