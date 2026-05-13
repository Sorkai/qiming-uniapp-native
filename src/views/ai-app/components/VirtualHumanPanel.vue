<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from "vue";
import { Refresh, FullScreen, Warning, Loading } from "@element-plus/icons-vue";

// 数字人已集成到项目 public/virtual-people 目录下，由 Vite 统一托管
const humanUrl = computed(() => {
  // 获取当前基础路径，动态兼容部署环境
  const base = window.location.origin;
  return `${base}/virtual-people/index.html`;
});

const iframeRef = ref<HTMLIFrameElement | null>(null);
const loading = ref(true);
const errored = ref(false);
const reloadKey = ref(0);
let probeTimer: ReturnType<typeof setTimeout> | null = null;

function handleLoad() {
  loading.value = false;
  errored.value = false;
  if (probeTimer) {
    clearTimeout(probeTimer);
    probeTimer = null;
  }
}

function handleError() {
  loading.value = false;
  errored.value = true;
}

function refresh() {
  loading.value = true;
  errored.value = false;
  reloadKey.value++;
  schedulePing();
}

function openFull() {
  window.open(humanUrl.value, "_blank", "noopener");
}

function schedulePing() {
  if (probeTimer) clearTimeout(probeTimer);
  // 如果 6 秒后 iframe 还没 onload，认为静态资源加载异常
  probeTimer = setTimeout(() => {
    if (loading.value) {
      errored.value = true;
      loading.value = false;
    }
  }, 6000);
}

onMounted(() => {
  schedulePing();
});

onUnmounted(() => {
  if (probeTimer) clearTimeout(probeTimer);
});
</script>

<template>
  <div class="h-full w-full flex flex-col bg-white">
    <!-- 顶部条 -->
    <div
      class="flex items-center justify-between px-4 py-2.5 border-b border-gray-100 bg-white/80 backdrop-blur rounded-t-3xl"
    >
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span class="text-[13px] font-semibold text-gray-700"
          >启明数字人</span
        >
        <span class="text-[11px] text-gray-400">VRM · FBX 实时驱动</span>
      </div>
      <div class="flex items-center gap-1.5">
        <el-tooltip content="刷新" placement="top">
          <el-button
            :icon="Refresh"
            circle
            size="small"
            text
            @click="refresh"
          />
        </el-tooltip>
        <el-tooltip content="新窗口打开" placement="top">
          <el-button
            :icon="FullScreen"
            circle
            size="small"
            text
            @click="openFull"
          />
        </el-tooltip>
      </div>
    </div>

    <!-- 主区 -->
    <div class="flex-1 relative bg-gradient-to-br from-slate-50 to-white">
      <!-- iframe -->
      <iframe
        v-show="!errored"
        ref="iframeRef"
        :key="reloadKey"
        :src="humanUrl"
        class="absolute inset-0 w-full h-full border-0"
        allow="autoplay; xr-spatial-tracking; fullscreen"
        @load="handleLoad"
        @error="handleError"
      />

      <!-- 加载态 -->
      <div
        v-if="loading && !errored"
        class="absolute inset-0 flex flex-col items-center justify-center text-gray-400 gap-3"
      >
        <el-icon :size="28" class="animate-spin"><Loading /></el-icon>
        <span class="text-xs">正在加载数字人资源...</span>
      </div>

      <!-- 错误兜底 -->
      <div
        v-if="errored"
        class="absolute inset-0 flex flex-col items-center justify-center px-6 text-center"
      >
        <el-icon :size="36" class="text-amber-500 mb-3"><Warning /></el-icon>
        <h4 class="text-sm font-bold text-gray-700 mb-1">
          数字人资源加载失败
        </h4>
        <p class="text-xs text-gray-500 leading-relaxed max-w-[260px]">
          请检查
          <code
            class="bg-gray-100 text-rose-500 px-1 py-0.5 rounded text-[11px] mx-0.5"
            >public/virtual-people/motions.json</code
          >
          与对应的
          <code
            class="bg-gray-100 text-rose-500 px-1 py-0.5 rounded text-[11px] mx-0.5"
            >VRM / FBX / GLB</code
          >
          静态文件是否存在且可访问，然后再刷新。
        </p>
        <el-button class="mt-4" type="primary" plain round @click="refresh"
          ><el-icon class="mr-1"><Refresh /></el-icon>重新加载</el-button
        >
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-spin {
  animation: vh-spin 1s linear infinite;
}
@keyframes vh-spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
