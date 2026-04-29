<script setup lang="ts">
import { nextTick, ref, watch, computed } from "vue";
import { ElMessage } from "element-plus";
import { useRoute } from "vue-router";
import { storageLocal } from "@pureadmin/utils";
import { userKey } from "@/utils/auth";
import FloatButton from "./FloatButton.vue";
import CaptureOverlay from "./CaptureOverlay.vue";
import CaptureLoadingOverlay from "./CaptureLoadingOverlay.vue";
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
  historyList,
  currentImage,
  analyzeScreenshot,
  sendMessage,
  resetChat,
  stopGenerate,
  loadHistory,
  fetchConversations,
  uploadAndContinue
} = useAiChat({ courseId: courseIdRef });

const chatDialogVisible = ref(false);
const captureLoadingVisible = ref(false);
const captureLoadingPreview = ref("");
const captureLoadingStage = ref<"capturing" | "optimizing" | "starting">(
  "capturing"
);
let captureLoadingStartedAt = 0;
const CAPTURE_LOADING_MIN_DURATION = 480;

const openCaptureLoading = (
  preview: string,
  stage: "capturing" | "optimizing" | "starting" = "capturing"
) => {
  captureLoadingPreview.value = preview;
  captureLoadingStage.value = stage;
  captureLoadingStartedAt = Date.now();
  captureLoadingVisible.value = true;
};

const updateCaptureLoadingStage = (
  stage: "capturing" | "optimizing" | "starting"
) => {
  if (!captureLoadingVisible.value) return;
  captureLoadingStage.value = stage;
};

const resetCaptureLoading = () => {
  captureLoadingVisible.value = false;
  captureLoadingPreview.value = "";
  captureLoadingStage.value = "capturing";
};

const closeCaptureLoading = async () => {
  if (!captureLoadingVisible.value) return;

  const remaining =
    CAPTURE_LOADING_MIN_DURATION - (Date.now() - captureLoadingStartedAt);
  if (remaining > 0) {
    await new Promise(resolve => setTimeout(resolve, remaining));
  }

  resetCaptureLoading();
};

/** 当进入课程页面且处于聊天模式时，尝试加载已有会话历史 */
watch(
  [courseIdRef, chatDialogVisible],
  ([cId, visible]) => {
    if (visible) {
      fetchConversations(); // 每次打开弹窗都刷新一下列表
    }
    if (
      visible &&
      cId &&
      !conversationId.value &&
      messages.value.length === 0
    ) {
      // 加载课程相关历史（可选）
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
    openCaptureLoading("", "capturing");
    const base64 = await captureScreen(area);
    captureLoadingPreview.value = base64;
    updateCaptureLoadingStage("optimizing");
    const compressedImage = await compressImage(base64);

    updateCaptureLoadingStage("starting");
    enterChatMode();
    chatDialogVisible.value = true;

    // 先发送带有截图的用户消息，然后静默等待 AI 分析，而不是让 analyzeScreenshot 自动添加消息
    // 或者我们直接调用 analyzeScreenshot，它内部会由 useAiChat 处理
    const analyzeTask = analyzeScreenshot(compressedImage).catch(err => {
      console.error("AI分析启动失败:", err);
    });
    await nextTick();
    await closeCaptureLoading();
    await analyzeTask;
  } catch (error) {
    await closeCaptureLoading();
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
  sendMessage(message);
};

const handleUploadImage = async (file: File) => {
  try {
    enterChatMode();
    chatDialogVisible.value = true;
    // 调用新封装的上传并继续对话逻辑，内部支持 WebP 转换和大小控制
    await uploadAndContinue(file);
  } catch (error) {
    console.error("图片上传失败:", error);
    ElMessage.error("图片上传失败");
  }
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
  resetCaptureLoading();
  resetChat();
  resetCapture();
  setTimeout(() => {
    startCapture();
  }, 300);
};

watch(chatDialogVisible, visible => {
  if (!visible) {
    resetCaptureLoading();
    // 用户关闭窗口后不保留任何记录
    resetChat();
    resetCapture();
  }
});

watch(shouldShowAssistant, visible => {
  if (!visible) {
    chatDialogVisible.value = false;
    resetCaptureLoading();
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

    <CaptureLoadingOverlay
      :visible="captureLoadingVisible"
      :stage="captureLoadingStage"
      :preview="captureLoadingPreview"
    />

    <ChatDialog
      v-model:visible="chatDialogVisible"
      :screenshot="currentImage || screenshot"
      :messages="messages"
      :loading="loading"
      :suggestions="suggestions"
      :history-list="historyList"
      @send="handleSendMessage"
      @stop="handleStopGenerate"
      @new-capture="handleNewCapture"
      @open-chat="handleOpenChat"
      @load-history="loadHistory"
      @reset="resetChat"
      @upload-image="handleUploadImage"
    />
  </div>
</template>
