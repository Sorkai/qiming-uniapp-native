<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";

const { title, getLogo } = useNav();
</script>

<template>
  <div class="sidebar-logo-container">
    <router-link
      key="expand"
      :title="title"
      class="sidebar-logo-link"
      to="/"
    >
      <img :src="getLogo()" alt="logo" class="app-logo-img" />
      <span class="sidebar-title">{{ title }}</span>
    </router-link>
  </div>
</template>

<style lang="scss" scoped>
.sidebar-logo-container {
  position: relative;
  width: 100%;
  height: 80px;
  overflow: hidden;
  padding: 0;
  display: flex;
  align-items: center;

  .sidebar-logo-link {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 0 16px;

    img {
      display: inline-block;
      height: 40px;
    }

    .sidebar-title {
      display: inline-block;
      height: 40px;
      margin: 2px 0 0 12px;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 24px;
      font-weight: 900;
      line-height: 40px;
      letter-spacing: 0.05em;
      color: var(--el-color-primary);
      background: linear-gradient(135deg, var(--el-color-primary) 0%, color-mix(in srgb, var(--el-color-primary), #4facfe 100%) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
      transition: all 0.3s;
    }
  }
}
</style>
