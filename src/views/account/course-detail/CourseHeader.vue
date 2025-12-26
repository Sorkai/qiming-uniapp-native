<template>
  <div class="layout-header" :class="currentTheme">
    <div class="header-content">
      <!-- 左侧区域：返回按钮、日期、主题切换 -->
      <div class="header-left">
        <div
          class="back-btn spotlight-button"
          @click="$emit('go-back')"
          @mousemove="handleButtonMouseMove"
        >
          <svg
            viewBox="0 0 24 24"
            width="20"
            height="20"
            stroke="currentColor"
            stroke-width="3"
            fill="none"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
        </div>
        <span class="header-date">{{ currentDate }}</span>
        <div
          class="theme-toggle-premium"
          :class="{ 'is-dark': currentTheme === 'dark' }"
          @click="$emit('toggle-theme', $event)"
        >
          <div class="toggle-icon sun-icon">
            <IconifyIconOffline :icon="Sunny" />
          </div>
          <div class="toggle-icon moon-icon">
            <IconifyIconOffline :icon="Moon" />
          </div>
          <div class="toggle-handle"></div>
        </div>
      </div>

      <!-- 中间区域：紫色渐变标题底衬 -->
      <div class="header-center">
        <div class="title-capsule">
          {{ title }}
        </div>
      </div>

      <!-- 右侧区域：像素级复刻主导航栏的用户胶囊 -->
      <div class="header-right">
        <el-dropdown
          trigger="click"
          @visible-change="v => (visible = v)"
          popper-class="course-user-dropdown"
        >
          <div class="user-capsule">
            <img :src="userAvatar" class="user-avatar" />
            <span v-if="userNickname" class="user-name">
              {{ userNickname }}
            </span>
            <IconifyIconOffline
              :icon="ArrowDown"
              class="dropdown-arrow"
              :class="{ 'rotate-180': visible }"
            />
          </div>
          <template #dropdown>
            <el-dropdown-menu class="logout">
              <el-dropdown-item @click="$emit('go-to-account')">
                <IconifyIconOffline :icon="Setting" style="margin: 5px" />
                账号管理
              </el-dropdown-item>
              <el-dropdown-item divided @click="$emit('logout')" class="logout-item">
                <IconifyIconOffline :icon="LogoutIcon" style="margin: 5px" />
                退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import Sunny from "~icons/ep/sunny";
import Moon from "~icons/ep/moon";
import ArrowDown from "~icons/ep/arrow-down";
import Setting from "~icons/ri/user-settings-line";
import LogoutIcon from "~icons/ri/logout-circle-r-line";

const props = defineProps<{
  currentTheme: string;
  title: string;
  userAvatar: string;
  userNickname: string;
}>();

const visible = ref(false);

defineEmits<{
  (e: "go-back"): void;
  (e: "toggle-theme", event: MouseEvent): void;
  (e: "go-to-account"): void;
  (e: "logout"): void;
}>();

const currentDate = computed(() => {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}年${month}月${day}日`;
});

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
/* 头部整体布局 */
.layout-header {
  position: fixed !important;
  top: 15px !important;
  left: 15px !important;
  right: 15px !important;
  height: 56px !important;
  z-index: 1000 !important;
  display: flex !important;
  align-items: center !important;
  padding: 0 20px !important;
  background: rgba(255, 255, 255, 0.7) !important;
  backdrop-filter: blur(12px) !important;
  border-radius: 20px !important;
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06) !important;
  box-sizing: border-box !important;
  transition: all 0.3s ease !important;
}

.layout-header.dark {
  background: rgba(30, 30, 35, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3) !important;
}

.header-content {
  display: flex !important;
  align-items: center !important;
  justify-content: space-between !important;
  width: 100% !important;
  height: 100% !important;
}

/* 左侧区域 */
.header-left {
  flex: 1;
  display: flex;
  align-items: center;
}

.back-btn {
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background: rgba(64, 158, 255, 0.12);
  border-radius: 12px;
  color: #409eff;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(64, 158, 255, 0.2);
  transform: scale(1.05);
}

.header-date {
  margin-left: 20px;
  font-size: 20px;
  font-weight: 700;
  color: #409eff;
  white-space: nowrap;
}

.layout-header.dark .header-date {
  color: #4facfe;
}

.layout-header.dark .back-btn {
  background: #262626 !important;
  color: #4facfe !important;
  border: 1px solid rgba(79, 172, 254, 0.3) !important;
}

.layout-header.dark .back-btn:hover {
  background: #333333 !important;
  border-color: #4facfe !important;
}

/* 主题切换按钮 */
.theme-toggle-premium {
  --w: 56px;
  --h: 28px;
  --s: 22px;
  --p: 3px;
  margin-left: 18px;
  width: var(--w);
  height: var(--h);
  background: rgba(0, 0, 0, 0.08);
  border-radius: 30px;
  position: relative;
  cursor: pointer;
  transition: all 0.4s ease;
  overflow: hidden;
}

.layout-header.dark .theme-toggle-premium {
  background: rgba(255, 255, 255, 0.15);
}

.toggle-icon {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3; /* 放在滑块上方 */
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  opacity: 0;
}

.sun-icon {
  left: 7px;
  color: #fff;
}

.moon-icon {
  right: 7px;
  color: #64748b;
}

.theme-toggle-premium:not(.is-dark) .sun-icon {
  opacity: 1;
}

.is-dark .moon-icon {
  opacity: 1;
}

.toggle-handle {
  position: absolute;
  top: var(--p);
  left: var(--p);
  width: var(--s);
  height: var(--s);
  background: linear-gradient(135deg, #f6c138 0%, #eab308 100%);
  border-radius: 50%;
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
  z-index: 2;
}

.is-dark .toggle-handle {
  transform: translateX(calc(var(--w) - var(--s) - var(--p) * 2));
  background: linear-gradient(135deg, #fff 0%, #f1f5f9 100%);
}

/* 中间标题区域 */
.header-center {
  flex: 0 0 auto;
}

.title-capsule {
  background: linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%) !important;
  color: white !important;
  padding: 10px 32px !important;
  border-radius: 16px !important;
  font-size: 24px !important;
  font-weight: 700 !important;
  box-shadow: 0 4px 15px rgba(74, 0, 224, 0.25) !important;
  white-space: nowrap !important;
}

.layout-header.dark .title-capsule {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
}

/* 右侧区域 - 像素级复刻主页面 */
.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.user-capsule {
  display: flex !important;
  align-items: center !important;
  height: 34px !important;
  padding: 0 12px !important;
  background: rgba(0, 0, 0, 0.05) !important;
  border-radius: 17px !important;
  cursor: pointer !important;
  transition: all 0.2s ease !important;
  user-select: none !important;
}

.layout-header.dark .user-capsule {
  background: rgba(255, 255, 255, 0.15) !important;
}

.user-capsule:hover {
  background: rgba(0, 0, 0, 0.1) !important;
}

.layout-header.dark .user-capsule:hover {
  background: rgba(255, 255, 255, 0.25) !important;
}

.user-avatar {
  width: 24px !important;
  height: 24px !important;
  border-radius: 50% !important;
  object-fit: cover !important;
  flex-shrink: 0 !important;
}

.user-name {
  margin-left: 8px !important;
  font-size: 14px !important;
  font-weight: 400 !important;
  color: #000000d9 !important;
  white-space: nowrap !important;
}

.layout-header.dark .user-name {
  color: #fff !important;
}

.dropdown-arrow {
  margin-left: 4px !important;
  font-size: 12px !important;
  color: #000000d9 !important;
  transition: transform 0.3s ease !important;
  display: inline-block !important;
}

.layout-header.dark .dropdown-arrow {
  color: #fff !important;
}

/* 下拉菜单样式复刻 */
:global(.course-user-dropdown) {
  padding: 0 !important;
  border-radius: 8px !important;
  border: 1px solid #ebeef5 !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
}

:global(.course-user-dropdown .el-dropdown-menu) {
  padding: 0 !important;
}

:global(.course-user-dropdown .el-dropdown-menu__item) {
  display: inline-flex !important;
  flex-wrap: wrap !important;
  min-width: 120px !important;
  padding: 8px 16px !important;
  font-size: 14px !important;
  color: #606266 !important;
  line-height: 22px !important;
}

:global(.course-user-dropdown .el-dropdown-menu__item:hover) {
  background-color: #f5f7fa !important;
  color: var(--el-color-primary) !important;
}

:global(.course-user-dropdown .logout-item) {
  color: #f56c6c !important;
}

:global(.course-user-dropdown .el-dropdown-menu__item--divided) {
  margin-top: 0 !important;
  border-top: 1px solid #ebeef5 !important;
}

:global(.course-user-dropdown .el-dropdown-menu__item--divided:before) {
  display: none !important;
}

/* 聚光灯按钮效果 */
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
</style>
