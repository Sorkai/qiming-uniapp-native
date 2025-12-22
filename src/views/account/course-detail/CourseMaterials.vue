<template>
  <!-- 课程资料 -->
  <div
    v-show="visible"
    data-v-2cf49992=""
    class="course-materials-wrapper"
    :class="currentTheme"
  >
    <!-- 头部 -->
    <div
      data-v-3e66491d=""
      data-v-cebc91e2=""
      class="layout-header"
      :class="currentTheme"
      isatlas="1"
      style="z-index: 10"
    >
      <div
        id="header-content-layout only-filter"
        data-v-3e66491d=""
        class="header-content"
      >
        <div data-v-3e66491d="" class="item header-left">
          <div
            data-v-3e66491d=""
            class="item header-back spotlight-button"
            @click="$emit('go-back')"
            @mousemove="handleButtonMouseMove"
            style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" stroke="#409eff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round" style="display: block; min-width: 24px; min-height: 24px;"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </div>
          <span data-v-3e66491d="" class="current-time">{{
            currentDate
          }}</span>
          <div data-v-3e66491d="" class="theme-mode" @click="$emit('toggle-theme')">
            <ThemeSunIcon
              data-v-3e66491d=""
              :fill="currentTheme === 'light' ? '#CFD8F0' : '#B4B4C7'"
              :stroke="currentTheme === 'light' ? '#CFD8F0' : '#B4B4C7'"
            />
            <ThemeMoonIcon
              data-v-3e66491d=""
              :fill="currentTheme === 'dark' ? '#CFD8F0' : '#B4B4C7'"
              :stroke="currentTheme === 'dark' ? '#CFD8F0' : '#B4B4C7'"
            />
          </div>
        </div>
        <div data-v-3e66491d="" class="item header-center">
          <div
            data-v-cebc91e2=""
            data-v-3e66491d=""
            class="study-mode custom-mode"
          >
            <div
              data-v-cebc91e2=""
              data-v-3e66491d=""
              data-name="0"
              class="mode-item active"
              style="margin: 0 auto"
            >
              课程资料
            </div>
          </div>
        </div>
        <div data-v-3e66491d="" class="item header-right">
          <div class="user-dropdown-area">
            <el-dropdown trigger="click">
              <div class="avatar-info" style="cursor: pointer; display: flex; align-items: center;">
                <img :src="userAvatar" alt="" class="avatar" />
                <span class="name">{{ userNickname }}</span>
                <i class="el-icon-arrow-down" />
              </div>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item @click="$emit('go-to-account')">账号管理</el-dropdown-item>
                  <el-dropdown-item divided @click="$emit('logout')">退出登录</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>
        </div>
      </div>
    </div>

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
import { computed } from "vue";
import ThemeSunIcon from "@/assets/course-icons/theme-sun.svg?component";
import ThemeMoonIcon from "@/assets/course-icons/theme-moon.svg?component";
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
  (e: "toggle-theme"): void;
  (e: "go-to-account"): void;
  (e: "logout"): void;
}>();

// 当前日期
const currentDate = computed(() => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}年${month}月${day}日`;
});

// 处理按钮光效
const handleButtonMouseMove = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  target.style.setProperty("--x", `${x}px`);
  target.style.setProperty("--y", `${y}px`);
};

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

.materials-container.light {
  background-color: #ffffff;
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
  width: 90%;
  max-width: 1400px;
}

.material-item {
  display: flex;
  align-items: center;
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 15px;
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

.material-item {
  padding: 20px;
}

.material-action .el-button {
  font-size: 15px;
  padding: 10px 20px;
}

/* 用户下拉区域样式 */
.user-dropdown-area {
  display: flex;
  align-items: center;
  height: 100%;
}

.user-dropdown-area .avatar-info {
  display: flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 20px;
  transition: background-color 0.3s;
}

.user-dropdown-area .avatar-info:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.dark .user-dropdown-area .avatar-info:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.user-dropdown-area .avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
  object-fit: cover;
}

.user-dropdown-area .name {
  font-size: 14px;
  color: #333;
  margin-right: 4px;
}

.dark .user-dropdown-area .name {
  color: #e0e0e0;
}

.user-dropdown-area .el-icon-arrow-down {
  font-size: 12px;
  color: #999;
}

/* 聚光灯按钮通用样式 */
.spotlight-button {
  position: relative;
  overflow: hidden;
}

.spotlight-button::before {
  content: "";
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at var(--x, 50%) var(--y, 50%),
    rgba(64, 158, 255, 0.4) 0%,
    transparent 70%
  );
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.spotlight-button:hover::before {
  opacity: 1;
}

/* 头部样式 */
.header-left {
  display: flex;
  align-items: center;
}

.header-back {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 44px;
  height: 44px;
  z-index: 200;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  position: relative;
  overflow: hidden;
}

.header-back:hover {
  transform: translateY(-2px);
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 调整日期与返回按钮距离 */
.current-time {
  margin-left: 25px;
  display: inline-block;
}

/* 浅色模式次要信息颜色优化 */
:deep(.light .material-info .material-type) {
  color: #409eff;
}

:deep(.light .material-info .material-title) {
  color: #1a1a1a;
  font-weight: bold;
}

:deep(.light .current-time) {
  color: #409eff;
  font-weight: bold;
  font-size: 18px;
}

/* 深色模式适配 */
:deep(.dark .material-info .material-type) {
  color: #888;
}

:deep(.dark .material-info .material-title) {
  color: #fff;
}

:deep(.dark .current-time) {
  color: #4facfe;
  font-weight: bold;
  font-size: 18px;
}

/* 课程资料页面填满宽度 */
.materials-container {
  padding-left: 2vw;
  padding-right: 2vw;
}

.materials-list {
  width: 100%;
  max-width: 100%;
}
</style>
