<script setup lang="ts">
import { ref, watch } from "vue";
import { ElMessage } from "element-plus";
import FloatButton from "./FloatButton.vue";
import CaptureOverlay from "./CaptureOverlay.vue";
import ChatDialog from "./ChatDialog.vue";
import HistoryDialog from "./HistoryDialog.vue";
import { useScreenCapture } from "./hooks/useScreenCapture";
import { useAiChat } from "./hooks/useAiChat";
import type { CaptureArea, ChatSession } from "./types";

defineOptions({
  name: "AiScreenCapture"
});

// 浮动按钮引用
const floatButtonRef = ref<InstanceType<typeof FloatButton> | null>(null);

// 按钮中心位置（用于涟漪效果）
const buttonCenter = ref({ x: 0, y: 0 });

// 截图功能
const {
  status,
  screenshot,
  isProcessing,
  startCapture,
  cancelCapture,
  captureScreen,
  resetCapture,
  enterChatMode,
  compressImage
} = useScreenCapture();

// AI对话功能
const {
  messages,
  loading,
  suggestions,
  analyzeScreenshot,
  sendMessage,
  resetChat,
  startNewChat
} = useAiChat();

// 对话框可见性
const chatDialogVisible = ref(false);
const historyDialogVisible = ref(false);

// 处理浮动按钮点击
const handleFloatButtonClick = () => {
  // 获取按钮中心位置
  if (floatButtonRef.value) {
    buttonCenter.value = floatButtonRef.value.getButtonCenter();
  }
  startCapture();
};

// 处理截图完成
const handleCapture = async (area: CaptureArea) => {
  try {
    // 执行截图
    const base64 = await captureScreen(area);
    
    // 压缩图片
    const compressedImage = await compressImage(base64);
    
    // 进入对话模式
    enterChatMode();
    chatDialogVisible.value = true;
    
    // 发送截图进行分析
    await analyzeScreenshot(compressedImage);
  } catch (error) {
    console.error("截图失败:", error);
    ElMessage.error("截图失败，请重试");
    resetCapture();
  }
};

// 处理取消截图
const handleCancelCapture = () => {
  cancelCapture();
};

// 处理发送消息
const handleSendMessage = (message: string) => {
  sendMessage(message);
};

// 处理重新截图
const handleNewCapture = () => {
  chatDialogVisible.value = false;
  resetChat();
  resetCapture();
  // 延迟启动新截图，等待对话框关闭
  setTimeout(() => {
    startCapture();
  }, 300);
};

// 处理查看历史
const handleViewHistory = () => {
  historyDialogVisible.value = true;
};

// 处理加载历史会话
const handleLoadHistory = (session: ChatSession) => {
  // 关闭历史弹窗
  historyDialogVisible.value = false;
  
  // 加载会话到对话框
  const { loadSession } = useAiChat();
  loadSession(session);
  
  // 打开对话框
  chatDialogVisible.value = true;
};

// 监听对话框关闭
watch(chatDialogVisible, (visible) => {
  if (!visible) {
    // 对话框关闭时重置状态
    resetCapture();
  }
});
</script>

<template>
  <div class="ai-screen-capture">
    <!-- 浮动按钮 -->
    <FloatButton
      ref="floatButtonRef"
      :disabled="status !== 'idle' || isProcessing"
      @click="handleFloatButtonClick"
    />

    <!-- 截图遮罩层 -->
    <CaptureOverlay
      v-if="status === 'capturing'"
      :origin="buttonCenter"
      @capture="handleCapture"
      @cancel="handleCancelCapture"
    />

    <!-- AI对话弹窗 -->
    <ChatDialog
      v-model:visible="chatDialogVisible"
      :screenshot="screenshot"
      :messages="messages"
      :loading="loading"
      :suggestions="suggestions"
      @send="handleSendMessage"
      @new-capture="handleNewCapture"
      @view-history="handleViewHistory"
    />

    <!-- 历史记录弹窗 -->
    <HistoryDialog
      v-model:visible="historyDialogVisible"
      @load="handleLoadHistory"
    />
  </div>
</template>

<style lang="scss" scoped>
.ai-screen-capture {
  // 容器不需要特殊样式，子组件都是fixed定位
}
</style>
