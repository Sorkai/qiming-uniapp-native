<script setup lang="ts">
import { ref } from "vue";
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
  <div class="navbar bg-[#fff] dark:bg-[#1d1e1f] border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
    <div class="flex items-center h-full flex-1 min-w-0 px-4">
      <LaySidebarTopCollapse
        v-if="device === 'mobile'"
        class="hamburger-container"
        :is-active="pureApp.sidebar.opened"
        @toggleClick="toggleSideBar"
      />

      <div v-if="device !== 'mobile'" class="flex items-center">
        <!-- 品牌名称 -->
        <div class="brand-title flex items-center select-none cursor-default group mr-4">
          <div class="flex items-baseline pt-1">
            <span class="text-lg font-bold italic text-slate-400 dark:text-slate-500 tracking-tight mr-1 transition-colors group-hover:text-blue-500" style="font-family: 'Inter', sans-serif;">Intelledu</span>
            <span class="text-xl font-black bg-gradient-to-r from-blue-600 to-emerald-500 bg-clip-text text-transparent">启明智教</span>
          </div>
        </div>

        <div class="h-4 w-[1px] bg-slate-200 dark:bg-slate-700 mx-1"></div>
      </div>

      <LaySidebarBreadCrumb
        v-if="layout !== 'mix' && device !== 'mobile'"
        class="breadcrumb-container ml-4"
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
          class="el-dropdown-link select-none bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10 transition-all duration-200 px-3 py-1.5 rounded-full flex items-center justify-center cursor-pointer border border-gray-100 dark:border-white/10"
        >
          <img :src="userAvatar" class="w-[24px] h-[24px] rounded-full ring-2 ring-white dark:ring-gray-800" />
          <p v-if="username" class="ml-2 text-sm font-medium text-gray-700 dark:text-gray-200">
            {{ username }}
          </p>
          <IconifyIconOffline
            :icon="ArrowDown"
            :class="[
              'ml-1 text-[12px] text-gray-400 dark:text-gray-500 transition-transform duration-300',
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
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
  z-index: 10;

  .navbar-item {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    height: 100%;
    padding: 0 12px;
    cursor: pointer;
    color: #4b5563;
    transition: all 0.2s;

    &:hover {
      background: rgba(0, 0, 0, 0.025);
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
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
    
    .navbar-item:hover {
      background: rgba(255, 255, 255, 0.05);
    }
    
    .navbar-item {
      color: #e5e7eb;
    }
  }
}

.logout-menu {
  padding: 8px;
  border-radius: 12px;
  
  :deep(.el-dropdown-menu__item) {
    border-radius: 8px;
    margin-bottom: 2px;
    padding: 8px 16px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}
</style>
