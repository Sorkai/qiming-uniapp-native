<script setup lang="ts">
import { ref } from "vue";
import { PlatformResourcePreviewDialog } from "@/components/PlatformResourcePreview";

const visible = ref(true);
</script>

<template>
  <PlatformResourcePreviewDialog
    v-model="visible"
    :resource="{
      title: '第四章 知识表示和专家系统｜教学课件.pptx',
      url: '/_codex-ppt-wheel-test.pptx',
      contentFormat: 'pptx',
      resourceType: 'courseware_ppt'
    }"
  />
</template>
