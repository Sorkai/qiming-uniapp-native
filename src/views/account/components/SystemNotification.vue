<template>
  <NotificationUnavailable :class="props.currentTheme" embedded />
</template>

<script setup lang="ts">
import NotificationUnavailable from "@/views/system-notification/NotificationUnavailable.vue";

const props = withDefaults(
  defineProps<{
    currentTheme?: string;
  }>(),
  {
    currentTheme: "light"
  }
);
</script>
