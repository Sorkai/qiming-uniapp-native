<script setup lang="ts">
import { getMine } from "@/api/user";
import { useRouter } from "vue-router";
import { useEventListener, useMediaQuery } from "@vueuse/core";
import { ref, watch, nextTick, onBeforeMount, onBeforeUnmount } from "vue";
import { ReText } from "@/components/ReText";
import Profile from "./components/Profile.vue";
import Preferences from "./components/Preferences.vue";
import SecurityLog from "./components/SecurityLog.vue";
import { useGlobal } from "@pureadmin/utils";
import AccountManagement from "./components/AccountManagement.vue";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
import LaySidebarTopCollapse from "@/layout/components/lay-sidebar/components/SidebarTopCollapse.vue";
import { logNativeFallback } from "@/utils/nativeRuntime";

import leftLine from "~icons/ri/arrow-left-s-line";
import ProfileIcon from "~icons/ri/user-3-line";
import PreferencesIcon from "~icons/ri/settings-3-line";
import SecurityLogIcon from "~icons/ri/window-line";
import AccountManagementIcon from "~icons/ri/profile-line";

defineOptions({
  name: "AccountSettings"
});

const router = useRouter();
const isMobile = useMediaQuery("(max-width: 768px)");
const isOpen = ref(!isMobile.value);
const mobileMenuRef = ref<HTMLDivElement | null>(null);
const menuToggleRef = ref<InstanceType<typeof LaySidebarTopCollapse> | null>(
  null
);
let previousBodyOverflow = "";
let bodyScrollLocked = false;

const mobileMenuFocusableSelector = [
  '[role="menuitem"]',
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])'
].join(",");

const getMobileMenuFocusable = () =>
  Array.from(
    mobileMenuRef.value?.querySelectorAll<HTMLElement>(
      mobileMenuFocusableSelector
    ) || []
  ).filter(element => element.getClientRects().length > 0);

const setMenuOpen = (open: boolean) => {
  isOpen.value = open;
};

const restoreBodyScroll = () => {
  if (!bodyScrollLocked) return;
  document.body.style.overflow = previousBodyOverflow;
  bodyScrollLocked = false;
};

watch(isOpen, async open => {
  if (!isMobile.value) {
    restoreBodyScroll();
    return;
  }

  if (open) {
    if (!bodyScrollLocked) {
      previousBodyOverflow = document.body.style.overflow;
    }
    document.body.style.overflow = "hidden";
    bodyScrollLocked = true;
    await nextTick();
    mobileMenuRef.value?.focus();
    return;
  }

  restoreBodyScroll();
  await nextTick();
  const toggleElement = menuToggleRef.value?.$el as HTMLElement | undefined;
  toggleElement?.focus();
});

watch(isMobile, mobile => {
  if (!mobile) restoreBodyScroll();
  setMenuOpen(!mobile);
});

useEventListener(window, "keydown", event => {
  if (!isMobile.value || !isOpen.value) return;

  if (event.key === "Escape") {
    event.preventDefault();
    setMenuOpen(false);
    return;
  }

  if (event.key !== "Tab") return;

  const menu = mobileMenuRef.value;
  const focusableElements = getMobileMenuFocusable();
  if (!menu || focusableElements.length === 0) {
    event.preventDefault();
    menu?.focus();
    return;
  }

  const activeElement = document.activeElement;
  const activeIndex = focusableElements.indexOf(activeElement as HTMLElement);
  const nextIndex = event.shiftKey
    ? activeIndex <= 0
      ? focusableElements.length - 1
      : activeIndex - 1
    : activeIndex < 0 || activeIndex === focusableElements.length - 1
      ? 0
      : activeIndex + 1;

  event.preventDefault();
  focusableElements[nextIndex]?.focus();
});

onBeforeUnmount(() => {
  restoreBodyScroll();
});

const { $storage } = useGlobal<GlobalPropertiesApi>();
onBeforeMount(() => {
  useDataThemeChange().dataThemeChange($storage.layout?.overallStyle);
});

const userInfo = ref({
  avatar: "",
  username: "",
  nickname: ""
});
const panes = [
  {
    key: "profile",
    label: "个人信息",
    icon: ProfileIcon,
    component: Profile
  },
  {
    key: "preferences",
    label: "偏好设置",
    icon: PreferencesIcon,
    component: Preferences
  },
  {
    key: "securityLog",
    label: "安全日志",
    icon: SecurityLogIcon,
    component: SecurityLog
  },
  {
    key: "accountManagement",
    label: "账户管理",
    icon: AccountManagementIcon,
    component: AccountManagement
  }
];
const witchPane = ref("profile");

getMine()
  .then(res => {
    userInfo.value = res.data;
  })
  .catch(error => {
    logNativeFallback("获取账号设置用户信息失败", error);
  });
</script>

<template>
  <el-container class="account-settings-shell h-full">
    <button
      v-if="isMobile && isOpen"
      type="button"
      class="account-settings-backdrop"
      aria-label="关闭设置菜单"
      tabindex="-1"
      @click="setMenuOpen(false)"
    />
    <el-aside
      v-if="isOpen"
      class="pure-account-settings overflow-hidden px-2 border-r-[1px] border-[var(--pure-border-color)]"
      :class="{ 'is-mobile': isMobile }"
      :width="isMobile ? 'min(84vw, 300px)' : '240px'"
    >
      <div
        id="account-settings-mobile-menu"
        ref="mobileMenuRef"
        class="account-settings-drawer-content"
        :role="isMobile ? 'dialog' : undefined"
        :aria-modal="isMobile ? 'true' : undefined"
        :aria-label="isMobile ? '账户设置菜单' : undefined"
        :tabindex="isMobile ? -1 : undefined"
      >
        <el-menu :default-active="witchPane" class="pure-account-settings-menu">
          <el-menu-item class="back-menu-item" @click="router.go(-1)">
            <div class="flex items-center">
              <IconifyIconOffline :icon="leftLine" />
              <span class="ml-2">返回</span>
            </div>
          </el-menu-item>
          <div class="flex items-center ml-8 mt-4 mb-4">
            <el-avatar :size="48" :src="userInfo.avatar" />
            <div class="ml-4 flex flex-col max-w-[130px]">
              <ReText class="font-bold self-baseline">
                {{ userInfo.nickname }}
              </ReText>
              <ReText class="self-baseline" type="info">
                {{ userInfo.username }}
              </ReText>
            </div>
          </div>
          <el-menu-item
            v-for="item in panes"
            :key="item.key"
            :index="item.key"
            @click="
              () => {
                witchPane = item.key;
                if (isMobile) {
                  setMenuOpen(false);
                }
              }
            "
          >
            <div class="flex items-center z-10">
              <el-icon><IconifyIconOffline :icon="item.icon" /></el-icon>
              <span>{{ item.label }}</span>
            </div>
          </el-menu-item>
        </el-menu>
      </div>
    </el-aside>
    <el-main
      class="account-settings-main"
      :aria-hidden="isMobile && isOpen ? 'true' : undefined"
      :inert="isMobile && isOpen"
    >
      <LaySidebarTopCollapse
        v-if="isMobile"
        ref="menuToggleRef"
        class="account-settings-menu-toggle px-0"
        :is-active="isOpen"
        role="button"
        tabindex="0"
        aria-controls="account-settings-mobile-menu"
        :aria-expanded="isOpen"
        :aria-label="isOpen ? '关闭设置菜单' : '打开设置菜单'"
        @toggleClick="setMenuOpen(!isOpen)"
        @keydown.enter.prevent="setMenuOpen(!isOpen)"
        @keydown.space.prevent="setMenuOpen(!isOpen)"
      />
      <component
        :is="panes.find(item => item.key === witchPane).component"
        :class="[!isMobile && 'ml-[120px]']"
      />
    </el-main>
  </el-container>
</template>

<style lang="scss">
.pure-account-settings {
  background: var(--pure-theme-menu-bg);

  &.el-aside {
    background: var(--pure-theme-menu-bg);
  }

  html.dark & {
    background: var(--el-bg-color);
  }

  &.is-mobile {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    z-index: 2100;
    width: min(84vw, 300px) !important;
    max-width: calc(100vw - 44px);
    box-sizing: border-box;
    padding-top: calc(
      8px + var(--pure-safe-area-top, env(safe-area-inset-top, 0px))
    );
    padding-bottom: calc(
      8px + var(--pure-safe-area-bottom, env(safe-area-inset-bottom, 0px))
    );
    overflow-y: auto !important;
    background: var(--pure-theme-menu-bg) !important;
    border-right: 1px solid var(--pure-border-color);
    box-shadow: 12px 0 32px rgb(15 23 42 / 24%);
  }
}

.account-settings-drawer-content {
  height: 100%;
  outline: none;
}

.account-settings-main {
  padding: 8px;
}

.account-settings-backdrop {
  position: fixed;
  inset: 0;
  z-index: 2090;
  padding: 0;
  cursor: pointer;
  background: rgb(15 23 42 / 46%);
  border: 0;
}

.pure-account-settings-menu {
  background-color: transparent;
  border: none;

  .back-menu-item {
    height: 50px;

    &:hover {
      font-size: var(--el-font-size-base);
      transition: all 0.2s;
    }
  }

  .el-menu-item {
    height: 48px;
    color: var(--pure-theme-menu-text);
    background-color: transparent;
    transition: color 0.2s;

    &:hover {
      color: var(--pure-theme-menu-title-hover);
      background-color: transparent;
    }

    &.is-active {
      color: #fff;

      &:hover {
        color: #fff;
      }

      &::before {
        position: absolute;
        inset: 0 8px;
        clear: both;
        margin: 4px 0;
        content: "";
        background: var(--el-color-primary);
        border-radius: 3px;
      }
    }
  }
}

.self-baseline {
  align-self: baseline;
}

@media (width <= 768px) {
  .account-settings-shell {
    min-width: 0;
    min-height: 100dvh;
  }

  .account-settings-main {
    width: 100%;
    min-width: 0;
    box-sizing: border-box;
    padding-top: calc(
      8px + var(--pure-safe-area-top, env(safe-area-inset-top, 0px))
    );
    padding-right: 8px;
    padding-bottom: calc(
      8px + var(--pure-safe-area-bottom, env(safe-area-inset-bottom, 0px))
    );
    padding-left: 8px;
  }

  .account-settings-menu-toggle {
    display: flex;
    width: 44px;
    min-width: 44px;
    height: 44px;
    align-items: center;
    justify-content: center;
  }
}
</style>

<style lang="scss" scoped>
body[layout] {
  :deep(.el-menu--vertical) {
    .el-menu-item.is-active {
      color: #fff;
      transition: color 0.2s;

      &:hover {
        color: #fff;
      }
    }
  }
}
</style>
