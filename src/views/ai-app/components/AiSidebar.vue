<script setup lang="ts">
import AiSidebar from "@/views/account/ai-app/components/AiSidebar.vue";

defineOptions({ name: "AiSidebarProxy", inheritAttrs: false });

const props = defineProps<InstanceType<typeof AiSidebar>["$props"]>();
</script>

<template>
  <AiSidebar v-bind="props" v-bind="$attrs" />
</template>
