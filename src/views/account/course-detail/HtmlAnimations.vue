<template>
  <!-- HTML 动画列表 -->
  <div
    v-show="visible"
    class="course-materials-wrapper"
    :class="currentTheme"
  >
    <!-- 头部 -->
    <CourseHeader
      :current-theme="currentTheme"
      title="HTML动画"
      :user-avatar="userAvatar"
      :user-nickname="userNickname"
      @go-back="$emit('go-back')"
      @toggle-theme="$emit('toggle-theme')"
      @go-to-account="$emit('go-to-account')"
      @logout="$emit('logout')"
    />

    <!-- 内容 -->
    <div class="materials-container" :class="currentTheme">
      <div v-if="loading" class="materials-list">
        <el-empty description="加载中..." />
      </div>
      <div v-else-if="animationList.length === 0" class="materials-list">
        <el-empty description="暂无可展示的章节动画" />
      </div>
      <div v-else class="materials-list">
        <div
          v-for="item in animationList"
          :key="item.chapterId"
          class="material-item"
          :class="{ dark: currentTheme === 'dark' }"
          @click="openHtmlAnimation(item)"
        >
          <div class="material-icon">
            <img :src="logo" alt="动画" />
          </div>
          <div class="material-info">
            <div class="material-title">{{ item.chapterName }}</div>
            <div class="material-type">版本: {{ item.version }}</div>
          </div>
          <div class="material-action">
            <el-button size="small" type="primary">查看</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <el-dialog
      v-model="htmlAnimPreviewVisible"
      title="HTML动画预览"
      width="85%"
      top="5vh"
    >
      <div v-if="htmlAnimPreviewUrl" class="preview-wrapper">
        <iframe :src="htmlAnimPreviewUrl" frameborder="0" class="preview-iframe" />
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="openHtmlAnimInNew">新窗口打开</el-button>
          <el-button type="primary" @click="htmlAnimPreviewVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import CourseHeader from "./CourseHeader.vue";
import logo from "@/assets/kecheng.jpg";

// Props
const props = defineProps<{
  visible: boolean;
  currentTheme: string;
  loading: boolean;
  animationList: Array<{
    chapterId: number;
    chapterName: string;
    version: string;
    url: string;
  }>;
  userAvatar: string;
  userNickname: string;
}>();

// Emits
defineEmits<{
  (e: "go-back"): void;
  (e: "toggle-theme"): void;
  (e: "go-to-account"): void;
  (e: "logout"): void;
}>();

// 内部状态
const htmlAnimPreviewVisible = ref(false);
const htmlAnimPreviewUrl = ref("");

// 打开 HTML 动画预览
const openHtmlAnimation = (item: { url: string }) => {
  htmlAnimPreviewUrl.value = item.url;
  htmlAnimPreviewVisible.value = true;
};

// 在新窗口打开
const openHtmlAnimInNew = () => {
  if (htmlAnimPreviewUrl.value) {
    window.open(htmlAnimPreviewUrl.value, "_blank");
  }
};
</script>

<style scoped>
/* 课程资料相关样式 (复用) */
.course-materials-wrapper {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background-color: #ffffff;
}

.course-materials-wrapper.dark {
  background-color: #1a1a1a;
}

.materials-container {
  padding: 100px 20px 20px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
}

.materials-container.dark {
  background-color: #1a1a1a;
}

.materials-list {
  display: grid;
  gap: 20px;
  width: 90%;
  max-width: 1400px;
}

.material-item {
  display: flex;
  align-items: center;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 20px;
  background-color: #fff;
  transition: all 0.3s;
  cursor: pointer;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  width: 100%;
}

.material-item.dark {
  background-color: #1a1a1a;
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

/* 预览样式 */
.preview-wrapper {
  width: 100%;
  height: 75vh;
  overflow: hidden;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
}

/* 浅色模式次要信息颜色优化 */
:deep(.light .material-info .material-type) {
  color: #409eff;
}

:deep(.light .material-info .material-title) {
  color: #1a1a1a;
  font-weight: bold;
}
</style>
