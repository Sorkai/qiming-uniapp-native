<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

defineOptions({
  name: "AiAppEntryRedirect"
});

const route = useRoute();
const router = useRouter();

router.replace({
  path: "/account/ai-app",
  query: {
    ...route.query,
    newTab: "true"
  }
});
</script>

<template>
  <div class="ai-app-entry-redirect" />
</template>
