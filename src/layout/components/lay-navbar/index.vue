<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import dayjs from "dayjs";
import "dayjs/locale/zh-cn";
import { useNav } from "@/layout/hooks/useNav";
import LaySearch from "../lay-search/index.vue";
import LayNotice from "../lay-notice/index.vue";
import LayNavMix from "../lay-sidebar/NavMix.vue";
import { useTranslationLang } from "@/layout/hooks/useTranslationLang";
import LaySidebarFullScreen from "../lay-sidebar/components/SidebarFullScreen.vue";
import LaySidebarBreadCrumb from "../lay-sidebar/components/SidebarBreadCrumb.vue";
import LaySidebarTopCollapse from "../lay-sidebar/components/SidebarTopCollapse.vue";
import LaySidebarOverallStyle from "../lay-sidebar/components/SidebarOverallStyle.vue";

import GlobalizationIcon from "@/assets/svg/globalization.svg?component";
import AccountSettingsIcon from "~icons/ri/user-settings-line";
import LogoutCircleRLine from "~icons/ri/logout-circle-r-line";
import Setting from "~icons/ri/settings-3-line";
import Check from "~icons/ep/check";
import ArrowDown from "~icons/ep/arrow-down";

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
    <div class="navbar bg-white/10 dark:bg-white/[0.03] backdrop-blur-[20px] dark:backdrop-blur-[20px] border-b border-white/20 dark:border-white/10 transition-all duration-700">
    <div class="flex items-center h-full flex-1 min-w-0 px-8">
      <LaySidebarTopCollapse
        v-if="device === 'mobile'"
        class="hamburger-container"
        :is-active="pureApp.sidebar.opened"
        @toggleClick="toggleSideBar"
      />

      <div v-if="device !== 'mobile'" class="flex items-center ml-4">
        <span class="text-xl font-black italic tracking-tighter text-blue-600/80 uppercase">Intelledu</span>
        <div class="h-4 w-[1px] bg-gray-300 mx-4"></div>
        <span
          class="text-sm font-medium text-gray-500/80 dark:text-gray-400/80 font-mono tracking-tight mr-4 whitespace-nowrap"
        >
          {{ currentTime }}
        </span>
        <div class="h-4 w-[1px] bg-gray-300 mr-4"></div>
      </div>

      <LaySidebarBreadCrumb
        v-if="layout !== 'mix' && device !== 'mobile'"
        class="breadcrumb-container"
      />
    </div>

    <LayNavMix v-if="layout === 'mix'" />

    <div v-if="/vertical|double/.test(layout)" class="vertical-header-right flex items-center justify-end px-4 h-full shrink-0">
      <!-- 全屏 -->
      <LaySidebarFullScreen id="full-screen" class="navbar-item" />
      <!-- 整体风格 (含夜间模式) -->
      <LaySidebarOverallStyle id="header-overall" class="navbar-item" />
      
      <!-- 退出登录 -->
      <el-dropdown trigger="click" @visible-change="v => (visible = v)" class="ml-2">
        <span
          class="el-dropdown-link group select-none bg-gray-50 dark:bg-white/5 hover:bg-white dark:hover:bg-white transition-all duration-200 px-3 py-1.5 rounded-full flex items-center justify-center cursor-pointer border border-gray-100 dark:border-white/10"
        >
          <img :src="userAvatar" class="w-[24px] h-[24px] rounded-full ring-2 ring-white dark:ring-gray-800" />
        <p v-if="username" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-900">
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
            <el-dropdown-item @click="toAccountSettings">
              <IconifyIconOffline
                :icon="AccountSettingsIcon"
                class="mr-2 text-lg"
              />
              {{ t("buttons.pureAccountSettings") }}
            </el-dropdown-item>
            <el-dropdown-item @click="logout" class="text-red-500 hover:text-red-600">
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

.logout-menu {
  padding: 8px;
  border-radius: 16px;
  backdrop-filter: blur(40px);
  background-color: rgba(255, 255, 255, 0.3) !important;
  border: 1px solid rgba(255, 255, 255, 0.4);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  
  :deep(.el-dropdown-menu__item) {
    border-radius: 10px;
    margin-bottom: 4px;
    padding: 10px 18px;
    font-weight: 500;
    
    &:last-child {
      margin-bottom: 0;
    }

    &:hover {
      background-color: rgba(59, 130, 246, 0.1) !important;
      color: #2563eb !important;
    }
  }
}

:global(html.dark) .logout-menu {
  background-color: rgba(30, 30, 35, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(40px);
}
</style>
