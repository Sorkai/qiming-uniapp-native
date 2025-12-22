<template>
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

.header-left {
  display: flex !important;
  align-items: center !important;
}

.header-back {
  cursor: pointer !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  min-width: 44px !important;
  height: 44px !important;
  z-index: 200 !important;
  transition: all 0.3s ease !important;
  background: rgba(255, 255, 255, 0.05) !important;
  border-radius: 12px !important;
  position: relative !important;
  overflow: hidden !important;
}

.header-back:hover {
  transform: translateY(-2px) !important;
  background: rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
}

/* 调整日期与返回按钮距离 */
.current-time {
  margin-left: 25px;
  display: inline-block;
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
</style>
