<template>
  <CloudDiskWorkspace
    title="在线云盘"
    subtitle="管理当前管理员账号上传的平台文件"
  />
</template>

<script setup lang="ts">
import CloudDiskWorkspace from "@/views/cloud-disk/CloudDiskWorkspace.vue";

defineOptions({
  name: "OnlineDisk"
});
</script>
