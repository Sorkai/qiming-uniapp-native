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

/** 从路由提取课程上下文（/course/:id 页面） */
const routeCourseId = computed<number | null>(() => {
  if (route.name === "CourseDetail" && route.params.id) {
    const id = Number(route.params.id);
    return Number.isFinite(id) && id > 0 ? id : null;
  }
  return null;
});
const courseIdRef = ref<number | null>(null);
watch(routeCourseId, v => (courseIdRef.value = v), { immediate: true });

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
  conversationId,
  analyzeScreenshot,
  sendMessage,
  resetChat,
  stopGenerate,
  loadHistory
} = useAiChat({ courseId: courseIdRef });

const chatDialogVisible = ref(false);

/** 当进入课程页面且处于聊天模式时，尝试加载已有会话历史 */
watch(
  [courseIdRef, chatDialogVisible],
  ([cId, visible]) => {
    if (
      visible &&
      cId &&
      !conversationId.value &&
      messages.value.length === 0
    ) {
      // 如果是在课程详情页打开，且当前没有对话记录，可以尝试从本地或后端恢复上一次的课程对话
      // 这里可以根据实际需求决定是否自动加载，或者由父组件传入 conversation_id
    }
  },
  { immediate: true }
);

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

    // 先发送带有截图的用户消息，然后静默等待 AI 分析，而不是让 analyzeScreenshot 自动添加消息
    // 或者我们直接调用 analyzeScreenshot，它内部会由 useAiChat 处理
    await analyzeScreenshot(compressedImage).catch(err => {
      console.error("AI分析启动失败:", err);
    });
  } catch (error) {
    console.error("截图失败:", error);
    // 只有在真正的截图插件或 canvas 转换失败时才报错
    ElMessage.error("截图失败，请重试");
    resetCapture();
  }
};

const handleCancelCapture = () => {
  cancelCapture();
};

const handleSendMessage = (message: string) => {
  // 如果在课程详情页，默认使用非流式的单课问答接口（第三个接口对接要求）
  const isCourseDetail = !!courseIdRef.value;
  sendMessage(message, isCourseDetail);
};

const handleStopGenerate = () => {
  stopGenerate();
};

/** 用户直接打开对话（不截图，纯文字对话模式） */
const handleOpenChat = () => {
  chatDialogVisible.value = true;
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
      @stop="handleStopGenerate"
      @new-capture="handleNewCapture"
      @open-chat="handleOpenChat"
    />
  </div>
</template>
