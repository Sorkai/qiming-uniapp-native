<template>
  <view class="native-shell">
    <view v-if="!loaded || loadError" class="shell-state">
      <view class="brand-mark">
        <text class="brand-mark__text">启</text>
      </view>
      <text class="shell-title">启明智教</text>
      <text class="shell-subtitle">{{ stateText }}</text>
      <button v-if="loadError" class="retry-button" @click="reloadWebview">
        重新加载
      </button>
    </view>

    <web-view
      id="qiming-webview"
      class="qiming-webview"
      :src="webviewSrc"
      :webview-styles="webviewStyles"
      :update-title="false"
      @load="handleLoad"
      @error="handleError"
      @message="handleMessage"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { onBackPress, onLoad, onShow } from "@dcloudio/uni-app";

type WebMessage = {
  source?: string;
  type?: string;
  href?: string;
  title?: string;
  online?: boolean;
  timestamp?: number;
};

const loaded = ref(false);
const loadError = ref(false);
const webviewVersion = ref(0);
const lastMessage = ref<WebMessage | null>(null);

const entryPath = "/hybrid/html/index.html#/account/ai-app";
const webviewSrc = computed(() => `${entryPath}?v=${webviewVersion.value}`);
const webviewStyles = {
  progress: {
    color: "#2F7DFF"
  }
};

const stateText = computed(() => {
  if (loadError.value) return "页面加载失败，请检查离线资源或网络连接。";
  if (lastMessage.value?.type === "offline") return "当前网络不可用，已保留本地页面。";
  return "正在打开学习助手...";
});

function extractMessages(event: any): WebMessage[] {
  const data = event?.detail?.data;
  if (Array.isArray(data)) return data;
  if (data) return [data];
  return [];
}

function handleLoad() {
  loaded.value = true;
  loadError.value = false;
}

function handleError(event: any) {
  loaded.value = false;
  loadError.value = true;
  console.error("[QimingNative] web-view load failed", event);
}

function handleMessage(event: any) {
  const messages = extractMessages(event);
  const message = messages.find(item => item?.source === "qiming-h5");
  if (message) {
    lastMessage.value = message;
    if (message.type === "loaded" || message.type === "bridge-ready") {
      loaded.value = true;
      loadError.value = false;
    }
  }
}

function reloadWebview() {
  loaded.value = false;
  loadError.value = false;
  webviewVersion.value += 1;
}

onLoad(() => {
  uni.setNavigationBarTitle({ title: "启明智教" });
});

onShow(() => {
  uni.setKeepScreenOn({ keepScreenOn: true });
});

onBackPress(() => {
  uni.showModal({
    title: "退出应用",
    content: "确定要退出启明智教吗？",
    confirmText: "退出",
    cancelText: "继续学习",
    success(result) {
      if (result.confirm) {
        // #ifdef APP-PLUS
        plus.runtime.quit();
        // #endif
      }
    }
  });
  return true;
});
</script>

<style scoped>
.native-shell {
  position: relative;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  background: #f7f8fc;
}

.qiming-webview {
  width: 100%;
  height: 100%;
}

.shell-state {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48rpx;
  background: #f7f8fc;
}

.brand-mark {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 112rpx;
  height: 112rpx;
  margin-bottom: 28rpx;
  border-radius: 32rpx;
  background: #2f7dff;
  box-shadow: 0 20rpx 48rpx rgba(47, 125, 255, 0.24);
}

.brand-mark__text {
  color: #fff;
  font-size: 48rpx;
  font-weight: 700;
}

.shell-title {
  color: #172033;
  font-size: 40rpx;
  font-weight: 700;
  line-height: 1.3;
}

.shell-subtitle {
  max-width: 560rpx;
  margin-top: 16rpx;
  color: #68748a;
  font-size: 28rpx;
  line-height: 1.5;
  text-align: center;
}

.retry-button {
  min-width: 208rpx;
  height: 88rpx;
  margin-top: 36rpx;
  padding: 0 36rpx;
  border: 0;
  border-radius: 44rpx;
  color: #fff;
  font-size: 28rpx;
  line-height: 88rpx;
  background: #2f7dff;
}
</style>
