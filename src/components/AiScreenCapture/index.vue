<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import { storageLocal } from "@pureadmin/utils";
import { userKey } from "@/utils/auth";
import FloatButton from "./FloatButton.vue";
import CaptureOverlay from "./CaptureOverlay.vue";
import ChatDialog from "./ChatDialog.vue";
import { useScreenCapture } from "./hooks/useScreenCapture";
import { useAiChat } from "./hooks/useAiChat";
import type { CaptureArea } from "./types";

defineOptions({
  name: "AiScreenCapture"
});

const route = useRoute();

const floatButtonRef = ref<InstanceType<typeof FloatButton> | null>(null);
const buttonCenter = ref({ x: 0, y: 0 });

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

const {
  messages,
  loading,
  suggestions,
  analyzeScreenshot,
  sendMessage,
  resetChat
} = useAiChat();

const chatDialogVisible = ref(false);

const userRoleType = computed(() => {
  const userInfo = storageLocal().getItem<any>(userKey);
  return userInfo?.roleType ?? 0;
});

const isStudent = computed(() => userRoleType.value === 1);

const studentBlockedPathPrefixes = [
  "/student-exam-center",
  "/account/homework-detail",
  "/account/exam-detail",
  "/exam-paper"
];

const shouldShowAssistant = computed(() => {
  if (!isStudent.value) return true;
  return !studentBlockedPathPrefixes.some(prefix =>
    route.path.startsWith(prefix)
  );
});

const handleFloatButtonClick = () => {
  if (floatButtonRef.value) {
    buttonCenter.value = floatButtonRef.value.getButtonCenter();
  }
  startCapture();
};

const handleCapture = async (area: CaptureArea) => {
  try {
    const base64 = await captureScreen(area);
    const compressedImage = await compressImage(base64);

    enterChatMode();
    chatDialogVisible.value = true;

    await analyzeScreenshot(compressedImage);
  } catch (error) {
    console.error("截图失败:", error);
    ElMessage.error("截图失败，请重试");
    resetCapture();
  }
};

const handleCancelCapture = () => {
  cancelCapture();
};

const handleSendMessage = (message: string) => {
  sendMessage(message);
};

const handleNewCapture = () => {
  chatDialogVisible.value = false;
  resetChat();
  resetCapture();
  setTimeout(() => {
    startCapture();
  }, 300);
};

watch(chatDialogVisible, visible => {
  if (!visible) {
    // 用户关闭窗口后不保留任何记录
    resetChat();
    resetCapture();
  }
});

watch(shouldShowAssistant, visible => {
  if (!visible) {
    chatDialogVisible.value = false;
    resetChat();
    resetCapture();
  }
});
</script>

<template>
  <div v-if="shouldShowAssistant" class="ai-screen-capture">
    <FloatButton
      ref="floatButtonRef"
      :disabled="status !== 'idle' || isProcessing"
      @click="handleFloatButtonClick"
    />

    <CaptureOverlay
      v-if="status === 'capturing'"
      :origin="buttonCenter"
      @capture="handleCapture"
      @cancel="handleCancelCapture"
    />

    <ChatDialog
      v-model:visible="chatDialogVisible"
      :screenshot="screenshot"
      :messages="messages"
      :loading="loading"
      :suggestions="suggestions"
      @send="handleSendMessage"
      @new-capture="handleNewCapture"
    />
  </div>
</template>
