<script setup lang="ts">
import AiChatModule from "@/views/account/ai-app/components/AiChatModule.vue";

defineOptions({ name: "AiChatModuleProxy", inheritAttrs: false });

const props = defineProps<InstanceType<typeof AiChatModule>["$props"]>();
</script>

<template>
  <AiChatModule v-bind="props" v-bind="$attrs" />
</template>
