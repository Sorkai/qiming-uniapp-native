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
          <div class="toggle-handle">
            <div class="handle-inner">
              <div class="toggle-icon sun-icon">
                <svg viewBox="0 0 24 24" class="sun-svg">
                  <defs>
                    <radialGradient id="sun-core-v3" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stop-color="#FFF9C4" />
                      <stop offset="60%" stop-color="#FFD54F" />
                      <stop offset="100%" stop-color="#F57C00" />
                    </radialGradient>
                  </defs>
                  <circle cx="12" cy="12" r="5.5" fill="url(#sun-core-v3)" />
                  <g class="sun-rays-v3">
                    <rect x="11" y="1" width="2" height="4" rx="1" fill="#F57C00" />
                    <rect x="11" y="19" width="2" height="4" rx="1" fill="#F57C00" />
                    <rect x="1" y="11" width="4" height="2" rx="1" fill="#F57C00" />
                    <rect x="19" y="11" width="4" height="2" rx="1" fill="#F57C00" />
                    <g transform="rotate(45 12 12)">
                      <rect x="11" y="1" width="2" height="4" rx="1" fill="#F57C00" />
                      <rect x="11" y="19" width="2" height="4" rx="1" fill="#F57C00" />
                      <rect x="1" y="11" width="4" height="2" rx="1" fill="#F57C00" />
                      <rect x="19" y="11" width="4" height="2" rx="1" fill="#F57C00" />
                    </g>
                  </g>
                </svg>
              </div>
              <div class="toggle-icon moon-icon">
                <svg viewBox="0 0 24 24" class="moon-svg-v3">
                  <defs>
                    <linearGradient id="moon-grad-v3" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#F1F5F9" />
                      <stop offset="100%" stop-color="#94A3B8" />
                    </linearGradient>
                  </defs>
                  <path d="M12 3C10.1 3 8.3 3.6 6.8 4.7C10.5 5.5 13 8.6 13 12C13 15.4 10.5 18.5 6.8 19.3C8.3 20.4 10.1 21 12 21C16.9 21 21 16.9 21 12C21 7.1 16.9 3 12 3Z" fill="url(#moon-grad-v3)" />
                  <circle cx="15.5" cy="9.5" r="1.2" fill="rgba(100, 116, 139, 0.2)" />
                  <circle cx="17.5" cy="14.5" r="0.8" fill="rgba(100, 116, 139, 0.2)" />
                  <circle cx="14" cy="15" r="0.6" fill="rgba(100, 116, 139, 0.2)" />
                </svg>
              </div>
            </div>
          </div>
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
          teleported
          :popper-options="{ modifiers: [{ name: 'offset', options: { offset: [0, 8] } }] }"
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
import { IconifyIconOffline } from "@/components/ReIcon";
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

<style scoped lang="scss">
/* 头部整体布局 */
.layout-header {
  position: fixed;
  top: 15px;
  left: 90px;
  right: 15px;
  height: 56px;
  z-index: 1000;
  display: flex;
  align-items: center;
  padding: 0 32px;
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  border-radius: 20px;
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  box-sizing: border-box;
  transition: all 0.3s ease;

  &.dark {
    background: rgba(30, 30, 35, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.08);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  height: 100%;
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
  background: #262626;
  color: #4facfe;
  border: 1px solid rgba(79, 172, 254, 0.3);

  &:hover {
    background: #333333;
    border-color: #4facfe;
  }
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
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  pointer-events: none;
  opacity: 0;
}

.sun-svg {
  width: 100%;
  height: 100%;
  filter: drop-shadow(0 0 4px rgba(245, 124, 0, 0.4));
}

.sun-rays-v3 {
  transform-origin: center;
  animation: rotate-sun 15s linear infinite;
}

@keyframes rotate-sun {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.moon-svg-v3 {
  width: 90%;
  height: 90%;
  filter: drop-shadow(0 0 3px rgba(148, 163, 184, 0.5));
  transition: all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.is-dark .moon-svg-v3 {
  transform: rotate(15deg) scale(1.1);
}

.theme-toggle-premium:not(.is-dark) .sun-icon {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.theme-toggle-premium:not(.is-dark) .moon-icon {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.5) rotate(-45deg);
}

.is-dark .moon-icon {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

.is-dark .sun-icon {
  opacity: 0;
  transform: translate(-50%, -50%) scale(0.5) rotate(45deg);
}

.toggle-handle {
  position: absolute;
  top: var(--p);
  left: var(--p);
  width: var(--s);
  height: var(--s);
  background: #fff;
  border-radius: 50%;
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 2;
  overflow: hidden;
}

.handle-inner {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  transition: all 0.5s ease;
}

.is-dark .toggle-handle {
  transform: translateX(calc(var(--w) - var(--s) - var(--p) * 2));
}

.is-dark .handle-inner {
  background: linear-gradient(135deg, #475569 0%, #1e293b 100%);
}

/* 中间标题区域 */
.header-center {
  flex: 0 0 auto;
}

.title-capsule {
  background: linear-gradient(135deg, #8e2de2 0%, #4a00e0 100%);
  color: white;
  padding: 10px 32px;
  border-radius: 16px;
  font-size: 24px;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(74, 0, 224, 0.25);
  white-space: nowrap;
}

.layout-header.dark .title-capsule {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

/* 右侧区域 - 像素级复刻主页面 */
.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.user-capsule {
  display: flex;
  align-items: center;
  height: 34px;
  padding: 0 12px;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 17px;
  cursor: pointer;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
}

.layout-header.dark .user-capsule {
  background: rgba(255, 255, 255, 0.15);

  &:hover {
    background: rgba(255, 255, 255, 0.25);
  }
}

.user-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
}

.user-name {
  margin-left: 8px;
  font-size: 14px;
  font-weight: 400;
  color: #000000d9;
  white-space: nowrap;
}

.layout-header.dark .user-name {
  color: #fff;
}

.dropdown-arrow {
  margin-left: 4px;
  font-size: 12px;
  color: #000000d9;
  transition: transform 0.3s ease;
  display: inline-block;

  &.rotate-180 {
    transform: rotate(180deg);
  }
}

.layout-header.dark .dropdown-arrow {
  color: #fff;
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

<!-- 非 scoped 样式，确保下拉菜单正确显示 -->
<style lang="scss">
.course-user-dropdown {
  z-index: 9999 !important;
  padding: 0 !important;
  border-radius: 8px !important;
  border: 1px solid #ebeef5 !important;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1) !important;
  background: #fff !important;

  .el-dropdown-menu {
    padding: 0;
    background: #fff;
    border: none;
    box-shadow: none;

    .el-dropdown-menu__item {
      display: inline-flex;
      flex-wrap: wrap;
      min-width: 120px;
      padding: 8px 16px;
      font-size: 14px;
      color: #606266;
      line-height: 22px;

      &:hover {
        background-color: #f5f7fa;
        color: var(--el-color-primary);
      }

      &.is-divided {
        margin-top: 0;
        border-top: 1px solid #ebeef5;

        &::before {
          display: none;
        }
      }
    }
  }

  .logout-item {
    color: #f56c6c !important;
    
    &:hover {
      color: #f56c6c !important;
      background-color: #fef0f0 !important;
    }
  }
}
</style>
