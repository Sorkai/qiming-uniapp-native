<template>
  <div
    class="layout-header"
    :class="currentTheme"
    isatlas="1"
  >
    <div
      id="header-content-layout only-filter"
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
        <span data-v-3e66491d="" class="current-time">{{ currentDate }}</span>
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
            {{ title }}
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
</template>

<script setup lang="ts">
import { computed } from "vue";
import ThemeSunIcon from "@/assets/course-icons/theme-sun.svg?component";
import ThemeMoonIcon from "@/assets/course-icons/theme-moon.svg?component";

const props = defineProps<{
  currentTheme: string;
  title: string;
  userAvatar: string;
  userNickname: string;
}>();

defineEmits<{
  (e: "go-back"): void;
  (e: "toggle-theme"): void;
  (e: "go-to-account"): void;
  (e: "logout"): void;
}>();

// 当前日期，格式化为"年月日"
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
</script>

<style scoped>
.user-dropdown-area {
  display: flex;
  align-items: center;
  height: 100%;
}

.user-dropdown-area .avatar-info {
  display: flex !important;
  align-items: center !important;
  padding: 4px 12px !important;
  border-radius: 20px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  background: rgba(0, 0, 0, 0.02) !important;
}

.user-dropdown-area .avatar-info:hover {
  background-color: rgba(64, 158, 255, 0.1) !important;
  transform: translateY(-1px) !important;
}

.user-dropdown-area .avatar-info:active {
  transform: scale(0.95) !important;
}

.layout-header.dark .user-dropdown-area .avatar-info {
  background: rgba(255, 255, 255, 0.05) !important;
}

.layout-header.dark .user-dropdown-area .avatar-info:hover {
  background-color: rgba(64, 158, 255, 0.2) !important;
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

.layout-header.dark .user-dropdown-area .name {
  color: #e0e0e0;
}

.user-dropdown-area .el-icon-arrow-down {
  font-size: 12px;
  color: #999;
}

.layout-header.dark .user-dropdown-area .el-icon-arrow-down {
  color: #b4b4c7;
}

.header-left {
  display: flex !important;
  align-items: center !important;
  padding-left: 0 !important; /* 向左移动 */
}

.header-back {
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 36px !important;
  height: 36px !important;
  z-index: 200 !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  background: rgba(64, 158, 255, 0.1) !important;
  border-radius: 10px !important;
  position: relative !important;
  overflow: hidden !important;
}

.header-back:hover {
  transform: scale(1.05) !important;
  background: rgba(64, 158, 255, 0.2) !important;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2) !important;
}

.header-back:active {
  transform: scale(0.95) !important;
}

/* 调整日期与返回按钮距离 */
.current-time {
  margin-left: 25px !important;
  display: inline-block !important;
  font-size: 18px !important;
  font-weight: bold !important;
  color: #409eff !important;
}

.layout-header.dark .current-time {
  color: #4facfe !important;
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

/* 移除章节模式背景 */
.custom-mode {
  background: transparent !important;
}

/* 头部固定定位 - 确保所有页面位置一致 */
.layout-header {
  position: fixed !important;
  top: 15px !important;
  left: 15px !important;
  right: 15px !important;
  height: 56px !important;
  z-index: 90 !important;
  display: flex !important;
  align-items: center !important;
  padding: 0 20px !important;
  background: rgba(255, 255, 255, 0.6) !important;
  backdrop-filter: blur(10px) !important;
  border-radius: 20px !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
  box-sizing: border-box !important;
  transition: all 0.3s ease !important;
  overflow: hidden !important; /* 关键：防止内部背景溢出圆角 */
}

.layout-header:hover {
  background: rgba(255, 255, 255, 0.8) !important;
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.1) !important;
}

.layout-header.dark {
  background: rgba(30, 30, 30, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.layout-header.dark:hover {
  background: rgba(40, 40, 50, 0.8) !important;
}

.layout-header .header-content {
  display: flex !important;
  align-items: center !important;
  width: 100% !important;
  height: 100% !important;
  background: transparent !important;
}

.layout-header .item.header-left {
  flex: 1 !important;
  display: flex !important;
  align-items: center !important;
  padding-left: 0 !important; /* 向左移动 */
  min-width: 0 !important;
}

.layout-header .item.header-center {
  flex: 0 0 auto !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  white-space: nowrap !important;
  padding: 0 20px !important; /* 防止与两侧重叠 */
  z-index: 2 !important;
}

.layout-header .item.header-right {
  flex: 1 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  padding-right: 60px !important; /* 进一步增加右边距以将内容向左推 */
  min-width: 0 !important;
}

.layout-header .item.header-right {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
}

/* 主题切换按钮样式 */
.theme-mode {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  margin-left: 20px !important;
  padding: 6px 12px !important;
  border-radius: 20px !important;
  background: rgba(0, 0, 0, 0.03) !important;
  cursor: pointer !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.theme-mode:hover {
  background: rgba(64, 158, 255, 0.1) !important;
  transform: translateY(-1px) !important;
}

.theme-mode:active {
  transform: scale(0.9) !important;
}

.layout-header.dark .theme-mode {
  background: rgba(255, 255, 255, 0.05) !important;
}

.layout-header.dark .theme-mode:hover {
  background: rgba(64, 158, 255, 0.2) !important;
}

/* 标题样式 */
.study-mode .mode-item {
  font-size: 18px !important;
  font-weight: 600 !important;
  color: #303133 !important;
}

.layout-header.dark .study-mode .mode-item {
  color: #e0e0e0 !important;
}

/* 头部左侧区域 */
.layout-header .item.header-left {
  display: flex !important;
  align-items: center !important;
  flex-shrink: 0 !important;
}

/* 头部右侧区域 */
.layout-header .item.header-right {
  display: flex !important;
  align-items: center !important;
  flex-shrink: 0 !important;
}

/* 深色模式下返回按钮背景 */
.layout-header.dark .header-back {
  background: rgba(255, 255, 255, 0.08) !important;
}

.layout-header.dark .header-back:hover {
  background: rgba(255, 255, 255, 0.15) !important;
}

/* 深色模式下返回按钮 SVG 图标颜色 */
.layout-header.dark .header-back svg {
  stroke: #4facfe !important;
}

/* 深色模式下主题切换图标 */
.layout-header.dark .theme-mode svg {
  fill: #b4b4c7 !important;
  stroke: #b4b4c7 !important;
}
</style>
