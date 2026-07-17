<script setup lang="ts">
import AiSidebar from "@/views/account/ai-app/components/AiSidebar.vue";

defineOptions({ name: "AiSidebarProxy", inheritAttrs: false });
const props = defineProps<{
  activeRail: string;
  conversations: any[];
  courses: string[];
}>();
</script>

<template>
  <AiSidebar v-bind="{ ...props, ...$attrs }" />
</template>
