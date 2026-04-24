<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStoreHook } from "@/store/modules/user";

type MobileNavItem = {
  title: string;
  icon: string;
  path: string;
};

const route = useRoute();
const router = useRouter();
const userStore = useUserStoreHook();

const isAdminOrTeacher = computed(() => {
  return userStore.roles?.some(role => role === "admin" || role === "teacher");
});

const profilePath = computed(() =>
  isAdminOrTeacher.value ? "/account-settings" : "/account"
);

// 定义移动端底部导航项
// 建议项：首页、课程、AI助手、个人中心
const navItems = computed<MobileNavItem[]>(() => [
  {
    title: "首页",
    icon: "ep:home-filled",
    path: "/welcome"
  },
  {
    title: "课程",
    icon: "ep:reading",
    path: "/course/list"
  },
  {
    title: "AI助手",
    icon: "ep:chat-dot-round",
    path: "/chatai/index"
  },
  {
    title: "我的",
    icon: "ep:user",
    path: profilePath.value
  }
]);

const visibleNavItems = computed(() => {
  return navItems.value.filter(
    item => router.resolve(item.path).matched.length > 0
  );
});

const activePath = computed(() => route.path);

const isActive = (path: string) => {
  return activePath.value === path || activePath.value.startsWith(`${path}/`);
};

const handleJump = (path: string) => {
  if (route.path === path) return;
  router.push(path);
};
</script>

<template>
  <div class="nav-mobile-container">
    <div
      v-for="item in visibleNavItems"
      :key="item.path"
      class="nav-mobile-item"
      :class="{ active: isActive(item.path) }"
      @click="handleJump(item.path)"
    >
      <IconifyIconOnline :icon="item.icon" class="nav-icon" />
      <span class="nav-title">{{ item.title }}</span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.nav-mobile-container {
  position: fixed;
  bottom: 0;
  left: 0;
  z-index: 2000;
  display: flex;
  width: 100%;
  height: var(--pure-mobile-tab-height);
  padding-bottom: var(--pure-safe-area-bottom);
  background: var(--el-bg-color-overlay);
  box-shadow: 0 -1px 10px rgba(0, 0, 0, 0.05);
  border-top: 1px solid var(--el-border-color-lighter);
}

.nav-mobile-item {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-regular);
  transition: all 0.3s;

  .nav-icon {
    font-size: 20px;
    margin-bottom: 2px;
  }

  .nav-title {
    font-size: 11px;
    font-weight: 500;
  }

  &.active {
    color: var(--el-color-primary);

    .nav-icon {
      transform: translateY(-2px);
    }
  }

  &:active {
    opacity: 0.7;
    background: var(--el-fill-color-light);
  }
}
</style>
