<template>
  <CloudDiskWorkspace
    :class="props.currentTheme"
    title="学习云盘"
    subtitle="管理当前学生账号上传的学习文件"
    show-share
  />
</template>

<script setup lang="ts">
import CloudDiskWorkspace from "@/views/cloud-disk/CloudDiskWorkspace.vue";

const props = withDefaults(
  defineProps<{
    currentTheme?: string;
  }>(),
  {
    currentTheme: "light"
  }
);
</script>
