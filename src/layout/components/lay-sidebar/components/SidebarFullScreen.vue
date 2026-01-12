<script setup lang="ts">
import { useNav } from "@/layout/hooks/useNav";
import FullScreenIcon from "@/assets/new-release/full-screen-svgrepo-com.svg?component";

const { isFullscreen, toggle } = useNav();
</script>

<template>
  <div class="fullscreen-wrapper">
    <span
      class="fullscreen-icon select-none flex items-center justify-center cursor-pointer transition-all duration-200"
      @click="toggle"
      :title="isFullscreen ? '退出全屏' : '全屏'"
    >
      <FullScreenIcon class="w-[28px] h-[28px] outline-none" />
    </span>
  </div>
</template>

<style scoped>
.fullscreen-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.fullscreen-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #374151;
}

.fullscreen-icon:hover {
  transform: scale(1.1);
  color: #3b82f6;
}

:global(html.dark) .fullscreen-icon {
  color: #e5e7eb;
}

:global(html.dark) .fullscreen-icon:hover {
  color: #60a5fa;
}
</style>
