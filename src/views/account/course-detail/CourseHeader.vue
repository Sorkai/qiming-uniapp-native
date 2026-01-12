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
        <!-- 切换主框架同款按钮 -->
        <div
          class="theme-btn-premium"
          :class="{ 'is-dark': currentTheme === 'dark' }"
          @click="$emit('toggle-theme', $event)"
        >
          <div class="sun-moon-wrapper">
            <div class="icon sun">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </div>
            <div class="icon moon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
              </svg>
            </div>
          </div>
          <div class="switch-dot"></div>
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
.theme-btn-premium {
  position: relative;
  width: 52px;
  height: 28px;
  padding: 4px;
  margin-left: 18px;
  cursor: pointer;
  background-color: #e2e8f0;
  border-radius: 100px;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);

  &:hover {
    transform: scale(1.05);
    background-color: #cbd5e0;
  }

  &.is-dark {
    background-color: #2d3748;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);

    .switch-dot {
      transform: translateX(24px);
      background-color: #1a202c;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
    }

    .sun {
      transform: translateY(20px) scale(0);
      opacity: 0;
    }

    .moon {
      transform: translateY(0) scale(1);
      opacity: 1;
      color: #f6e05e;
    }
  }

  .sun-moon-wrapper {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
  }

  .icon {
    position: absolute;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);

    svg {
      width: 16px;
      height: 16px;
    }
  }

  .sun {
    left: 0;
    color: #f6ad55;
    transform: translateY(0) scale(1);
    opacity: 1;
  }

  .moon {
    right: 0;
    color: #718096;
    transform: translateY(-20px) scale(0);
    opacity: 0;
  }

  .switch-dot {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 20px;
    height: 20px;
    background-color: #ffffff;
    border-radius: 50%;
    transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
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
