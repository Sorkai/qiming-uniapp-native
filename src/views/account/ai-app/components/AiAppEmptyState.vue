<script setup lang="ts">
import type { Component } from "vue";

defineProps<{
  title: string;
  description?: string;
  icon?: Component;
  compact?: boolean;
}>();
</script>

<template>
  <section class="ai-app-empty-state" :class="{ 'is-compact': compact }">
    <div v-if="icon" class="ai-app-empty-state__icon" aria-hidden="true">
      <el-icon :size="compact ? 20 : 28">
        <component :is="icon" />
      </el-icon>
    </div>
    <h3>{{ title }}</h3>
    <p v-if="description">{{ description }}</p>
  </section>
</template>

<style scoped>
.ai-app-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: min(100%, 420px);
  min-height: 220px;
  padding: 32px;
  color: #475569;
  text-align: center;
  background: #fff;
  border: 1px solid #e5eaf2;
  border-radius: 16px;
  box-shadow: 0 8px 22px rgb(15 23 42 / 4%);
}

.ai-app-empty-state.is-compact {
  min-height: 160px;
  padding: 24px;
}

.ai-app-empty-state__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  margin-bottom: 14px;
  color: #2f6fcb;
  background: #edf4ff;
  border: 1px solid #dbe8fb;
  border-radius: 12px;
}

.ai-app-empty-state.is-compact .ai-app-empty-state__icon {
  width: 36px;
  height: 36px;
  margin-bottom: 10px;
}

.ai-app-empty-state h3 {
  margin: 0;
  color: #1f2937;
  font-size: 16px;
  font-weight: 650;
  line-height: 1.35;
}

.ai-app-empty-state p {
  max-width: 34ch;
  margin: 8px 0 0;
  color: #64748b;
  font-size: 13px;
  line-height: 1.6;
}
</style>
