<script setup lang="ts">
import AiChatModule from "@/views/account/ai-app/components/AiChatModule.vue";

defineOptions({ name: "AiChatModuleProxy", inheritAttrs: false });
const props = defineProps<{
  messages: any[];
  activeCourse: string;
  courses?: string[];
  mode?: string;
  userAvatar?: string;
  agents?: any[];
  models?: any[];
  thinkingModes?: any[];
  selectedAgent?: string;
  selectedModel?: string;
  thinkingMode?: string;
  modelReady?: boolean;
  modelDisabledReason?: string;
  loading?: boolean;
}>();
</script>

<template>
  <AiChatModule v-bind="{ ...props, ...$attrs }" />
</template>
