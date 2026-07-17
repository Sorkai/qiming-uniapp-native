<template>
  <CloudDiskWorkspace
    title="教学云盘"
    subtitle="管理当前教师账号上传的教学资料"
  />
</template>

<script setup lang="ts">
import CloudDiskWorkspace from "./CloudDiskWorkspace.vue";

defineOptions({
  name: "CloudDisk"
});
</script>
