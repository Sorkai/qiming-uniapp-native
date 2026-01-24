<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from "vue";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { emitter } from "@/utils/mitt";
import { useNav } from "@/layout/hooks/useNav";
import LaySearch from "../lay-search/index.vue";
import LayNotice from "../lay-notice/index.vue";
import LayNavMix from "../lay-sidebar/NavMix.vue";
import { useTranslationLang } from "@/layout/hooks/useTranslationLang";
import LaySidebarFullScreen from "../lay-sidebar/components/SidebarFullScreen.vue";
import LaySidebarBreadCrumb from "../lay-sidebar/components/SidebarBreadCrumb.vue";
import LaySidebarTopCollapse from "../lay-sidebar/components/SidebarTopCollapse.vue";
import LaySidebarOverallStyle from "../lay-sidebar/components/SidebarOverallStyle.vue";
import { getUserDetail } from "@/api/user";
import { useUserStoreHook } from "@/store/modules/user";

import GlobalizationIcon from "@/assets/svg/globalization.svg?component";
import AccountSettingsIcon from "~icons/ri/user-settings-line";
import LockPasswordLine from "~icons/ri/lock-password-line";
import LogoutCircleRLine from "~icons/ri/logout-circle-r-line";
import Setting from "~icons/ri/settings-3-line";
import Check from "~icons/ep/check";
import ArrowDown from "~icons/ep/arrow-down";
import DefaultAvatar from "@/assets/user.jpg";

const {
  layout,
  device,
  logout,
  onPanel,
  pureApp,
  username,
  userAvatar,
  avatarsStyle,
  toggleSideBar,
  toAccountSettings,
  getDropdownItemStyle,
  getDropdownItemClass
} = useNav();

const visible = ref(false);

const currentTime = ref("");

const updateTime = () => {
  const now = dayjs();
  const weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
    now.day()
  ];
  currentTime.value = `${now.format("M月D日")} ${weekDay} ${now.format("HH:mm")}`;
};

let timer: ReturnType<typeof setInterval>;

onMounted(() => {
  updateTime();
  timer = setInterval(updateTime, 1000);

  // 这里的逻辑修改为：无论 store 中是否有头像，都强制刷新一次用户信息，确保是最新的
  // 增加 console.log 方便调试
  console.log("[LayNavbar] 组件挂载，准备获取用户信息...");
  const userStore = useUserStoreHook();

  getUserDetail()
    .then(res => {
      console.log("[LayNavbar] 获取用户信息接口响应:", res);
      // 兼容两种响应结构
      const data = res.data || res;
      if (data && data.userInfo) {
        console.log("[LayNavbar] 获取到用户信息:", data.userInfo);
        const userInfo = data.userInfo;
        // 只要返回了信息就更新 store
        if (userInfo.avatar !== undefined) {
          console.log("[LayNavbar] 更新头像:", userInfo.avatar);
          userStore.SET_AVATAR(userInfo.avatar);
        }
        if (userInfo.nickname) {
          userStore.SET_NICKNAME(userInfo.nickname);
        }
      }
    })
    .catch(err => {
      console.error("[LayNavbar] 获取用户信息失败:", err);
    });
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});

const {
  t,
  locale,
  translationCh,
  translationTw,
  translationEn,
  translationJa,
  translationKo
} = useTranslationLang();
</script>

<template>
  <div
    class="navbar bg-white/10 dark:bg-white/[0.03] backdrop-blur-[20px] dark:backdrop-blur-[20px] border-b border-white/20 dark:border-white/10 transition-all duration-700"
  >
    <div class="flex items-center h-full flex-1 min-w-0 px-8">
      <LaySidebarTopCollapse
        v-if="device === 'mobile'"
        class="hamburger-container"
        :is-active="pureApp.sidebar.opened"
        @toggleClick="toggleSideBar"
      />

      <div v-if="device !== 'mobile'" class="flex items-center ml-4">
        <span
          class="text-xl font-black italic tracking-tighter text-blue-600/80 uppercase"
          >Intelledu</span
        >
        <div class="h-4 w-[1px] bg-gray-300 mx-4" />
        <span
          class="text-sm font-medium text-gray-500/80 dark:text-gray-400/80 font-mono tracking-tight mr-4 whitespace-nowrap"
        >
          {{ currentTime }}
        </span>
        <div class="h-4 w-[1px] bg-gray-300 mr-4" />
      </div>

      <LaySidebarBreadCrumb
        v-if="layout !== 'mix' && device !== 'mobile'"
        class="breadcrumb-container"
      />
    </div>

    <LayNavMix v-if="layout === 'mix'" />

    <div
      v-if="/vertical|double/.test(layout)"
      class="vertical-header-right flex items-center justify-end px-4 h-full shrink-0"
    >
      <!-- 全屏 -->
      <LaySidebarFullScreen id="full-screen" class="navbar-item" />
      <!-- 整体风格 (含夜间模式) -->
      <LaySidebarOverallStyle id="header-overall" class="navbar-item" />

      <!-- 退出登录 -->
      <el-dropdown
        trigger="click"
        class="ml-2"
        @visible-change="v => (visible = v)"
      >
        <span
          class="el-dropdown-link group select-none bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white transition-all duration-200 px-3 py-1.5 rounded-full flex items-center justify-center cursor-pointer border border-gray-100 dark:border-white/10"
        >
          <el-avatar
            :size="24"
            :src="userAvatar"
            class="ring-2 ring-white dark:ring-gray-800 object-cover"
          >
            {{ username?.charAt(0) || "U" }}
          </el-avatar>
          <p
            v-if="username"
            class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-900"
          >
            {{ username }}
          </p>
          <IconifyIconOffline
            :icon="ArrowDown"
            :class="[
              'ml-1 text-[12px] text-gray-400 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-700 transition-transform duration-300',
              { 'rotate-180': visible }
            ]"
          />
        </span>
        <template #dropdown>
          <el-dropdown-menu class="logout-menu">
            <el-dropdown-item @click="() => emitter.emit('openEditProfile')">
              <IconifyIconOffline
                :icon="AccountSettingsIcon"
                class="mr-2 text-lg"
              />
              修改资料
            </el-dropdown-item>
            <el-dropdown-item @click="() => emitter.emit('openChangePassword')">
              <IconifyIconOffline
                :icon="LockPasswordLine"
                class="mr-2 text-lg"
              />
              修改密码
            </el-dropdown-item>
            <el-dropdown-item
              class="text-red-500 hover:text-red-600"
              @click="logout"
            >
              <IconifyIconOffline
                :icon="LogoutCircleRLine"
                class="mr-2 text-lg"
              />
              {{ t("buttons.pureLoginOut") }}
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.navbar {
  width: 100%;
  height: 72px; // 增加到 72px 让视觉更通透
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.04);
  z-index: 1001; // 确保压过标签栏
  position: relative;

  .navbar-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 20px;
    cursor: pointer;
    color: #64748b;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    &:hover {
      background: rgba(59, 130, 246, 0.08);
      color: #3b82f6;
    }
  }

  .el-dropdown-link {
    &:hover {
      p {
        color: #111827 !important;
      }
      .rotate-180,
      IconifyIconOffline {
        color: #4b5563 !important;
      }
    }
  }
}

.breadcrumb-container {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 适配深色模式 */
:global(html.dark) {
  .navbar {
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.4);

    .navbar-item:hover {
      background: rgba(255, 255, 255, 0.05);
      color: #60a5fa;
    }

    .navbar-item {
      color: #e5e7eb;
    }
  }
}
</style>

<style lang="scss">
/* 全局样式 - 下拉菜单圆角（教师端/管理员端） */
/* 针对 el-popper 容器 */
.el-popper:has(.logout-menu) {
  border-radius: 16px !important;
  overflow: hidden !important;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;

  /*隐藏箭头 */
  .el-popper__arrow {
    display: none !important;
  }
}

.logout-menu {
  padding: 8px !important;
  border-radius: 16px !important;
  backdrop-filter: blur(40px);
  background-color: rgba(255, 255, 255, 0.95) !important;
  border: 1px solid rgba(220, 226, 247, 0.6) !important;
  box-shadow:
    0 10px 25px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
  overflow: hidden !important;
  margin: 0 !important;

  /* 清除伪元素 */
  &::before,
  &::after {
    display: none !important;
  }

  .el-dropdown-menu__item {
    border-radius: 10px;
    margin-bottom: 4px;
    padding: 10px 18px;
    font-weight: 500;
    transition: all 0.2s ease;

    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      background-color: rgba(200, 212, 240, 0.4) !important;
      color: #333 !important;
    }

    .mr-2 {
      margin-right: 8px;
    }
  }

  /* 退出登录项 - 红色 */
  .el-dropdown-menu__item:last-child {
    color: #f56c6c;

    &:hover {
      background-color: rgba(245, 108, 108, 0.1) !important;
      color: #f56c6c !important;
    }
  }
}

/* 深色模式适配 */
html.dark .el-popper:has(.logout-menu) {
  background: transparent !important;
}

html.dark .logout-menu {
  background-color: rgba(17, 27, 45, 0.98) !important;
  border: 1px solid rgba(56, 189, 248, 0.2) !important;
  box-shadow: 0 10px 25px -3px rgba(0, 0, 0, 0.4) !important;

  .el-dropdown-menu__item {
    color: #e2e8f0;

    &:hover {
      background-color: rgba(56, 189, 248, 0.15) !important;
      color: #f1f5f9 !important;
    }
  }

  .el-dropdown-menu__item:last-child {
    color: #f87171;

    &:hover {
      background-color: rgba(248, 113, 113, 0.15) !important;
      color: #f87171 !important;
    }
  }
}
</style>
