<script setup lang="ts">
import { ref, computed, nextTick, watch, onMounted, onBeforeUnmount } from "vue";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import { ElMessage } from "element-plus";
import "highlight.js/styles/github.css";
import type { ChatMessage } from "./types";
import { getSavedCourseTheme } from "@/utils/courseTheme";

defineOptions({
  name: "AiChatDialog"
});

const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          "</code></pre>"
        );
      } catch (__) {}
    }
    return (
      '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + "</code></pre>"
    );
  }
});

const props = defineProps<{
  visible: boolean;
  screenshot?: string;
  messages: ChatMessage[];
  loading?: boolean;
  suggestions?: string[];
  streaming?: boolean;
  historyList?: any[];
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "send", message: string): void;
  (e: "retry"): void;
  (e: "newCapture"): void;
  (e: "stop"): void;
  (e: "openChat"): void;
  (e: "loadHistory", id: string): void;
  (e: "reset"): void;
  (e: "uploadImage", file: File | File[]): void;
}>();

const inputMessage = ref("");
const messageListRef = ref<HTMLElement>();
const inputRef = ref<any>();
const fileInputRef = ref<HTMLInputElement>();
const isDragActive = ref(false);
const dragDepth = ref(0);
const isDarkDialog = ref(false);
let themeObserver: MutationObserver | null = null;

const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit("update:visible", val)
});

const syncDialogTheme = () => {
  if (typeof document === "undefined") return;
  isDarkDialog.value =
    document.documentElement.classList.contains("dark") ||
    document.body?.classList.contains("dark") ||
    getSavedCourseTheme("light") === "dark";
};

watch(
  () => props.visible,
  val => {
    if (val) {
      syncDialogTheme();
      nextTick(() => {
        inputRef.value?.focus();
      });
    }
  }
);

onMounted(() => {
  syncDialogTheme();
  themeObserver = new MutationObserver(syncDialogTheme);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class", "data-theme"]
  });
  themeObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
  window.addEventListener("storage", syncDialogTheme);
});

onBeforeUnmount(() => {
  themeObserver?.disconnect();
  themeObserver = null;
  window.removeEventListener("storage", syncDialogTheme);
});

const isStreaming = computed(() => {
  if (props.streaming) return true;
  const last = props.messages[props.messages.length - 1];
  return last?.role === "assistant" && !!last?.loading && props.loading;
});

const handleSend = () => {
  const message = inputMessage.value.trim();
  if (!message || props.loading) return;

  emit("send", message);
  inputMessage.value = "";
};

const handleStop = () => {
  emit("stop");
};

const useSuggestion = (suggestion: string) => {
  inputMessage.value = suggestion;
  handleSend();
};

const isNativeWebViewRuntime = () =>
  typeof document !== "undefined" &&
  document.documentElement.classList.contains("qiming-native-webview");

const isImageFile = (file: File) => {
  if (file.type?.startsWith("image/")) return true;
  return /\.(png|jpe?g|webp|gif|bmp|heic|heif)$/i.test(file.name || "");
};

const emitFiles = (files: File[]) => {
  const imageFiles = files.filter(isImageFile);
  if (!imageFiles.length) {
    ElMessage.warning("请上传图片文件");
    return;
  }

  emit("uploadImage", imageFiles.length === 1 ? imageFiles[0] : imageFiles);
};

const resolveNativeGalleryFile = (filePath: string): Promise<File> => {
  const plusApi = (window as any).plus;
  return new Promise((resolve, reject) => {
    plusApi?.io?.resolveLocalFileSystemURL?.(
      filePath,
      entry => {
        entry.file?.(
          file => {
            resolve(file as File);
          },
          reject
        );
      },
      reject
    );
  });
};

const pickNativeImages = () => {
  if (!isNativeWebViewRuntime()) return false;

  const plusApi = (window as any).plus;
  if (!plusApi?.gallery?.pick || !plusApi?.io?.resolveLocalFileSystemURL) {
    return false;
  }

  plusApi.gallery.pick(
    async result => {
      try {
        const paths = Array.isArray(result?.files)
          ? result.files
          : [typeof result === "string" ? result : result?.file].filter(
              Boolean
            );
        const files = await Promise.all(
          paths.map(path => resolveNativeGalleryFile(String(path)))
        );
        emitFiles(files);
      } catch (error) {
        console.error("读取系统相册图片失败:", error);
        ElMessage.error("读取图片失败，请重试");
      }
    },
    error => {
      if (error?.code === 12) return;
      console.warn("系统相册选择失败，回退文件选择", error);
      fileInputRef.value?.click();
    },
    {
      filter: "image",
      multiple: true,
      maximum: 9,
      system: false
    }
  );

  return true;
};

const triggerFileUpload = () => {
  if (pickNativeImages()) return;
  fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);
  if (files.length) {
    emitFiles(files);
    target.value = "";
  }
};

const handleDragEnter = (event: DragEvent) => {
  if (props.loading) return;
  event.preventDefault();
  dragDepth.value += 1;
  isDragActive.value = true;
};

const handleDragOver = (event: DragEvent) => {
  if (props.loading) return;
  event.preventDefault();
  if (event.dataTransfer) {
    event.dataTransfer.dropEffect = "copy";
  }
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  dragDepth.value = Math.max(0, dragDepth.value - 1);
  if (dragDepth.value === 0) {
    isDragActive.value = false;
  }
};

const handleDrop = (event: DragEvent) => {
  event.preventDefault();
  dragDepth.value = 0;
  isDragActive.value = false;
  if (props.loading) return;

  const files = Array.from(event.dataTransfer?.files || []);
  if (files.length) {
    emitFiles(files);
  }
};

const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
};

watch(
  () => props.messages.length,
  () => {
    scrollToBottom();
  }
);

watch(
  () => {
    const last = props.messages[props.messages.length - 1];
    return last?.content?.length ?? 0;
  },
  () => {
    scrollToBottom();
  }
);

const handleNewChat = () => {
  emit("reset");
  inputMessage.value = "";
};

const formatTime = (timestamp: number) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
};

const handleClose = () => {
  dialogVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    :class="[
      'ai-chat-dialog modern-style',
      {
        'is-native-dark': isDarkDialog
      }
    ]"
    append-to-body
    destroy-on-close
    :show-close="false"
    @dragenter="handleDragEnter"
    @dragover="handleDragOver"
    @dragleave="handleDragLeave"
    @drop="handleDrop"
  >
    <template #header>
      <div class="dialog-header">
        <div class="header-content">
          <div class="header-icon">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path
                d="M12 2L4.5 20.29L5.21 21L12 18L18.79 21L19.5 20.29L12 2Z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div class="header-text">
            <span class="main-title">AI 识屏分析</span>
            <span class="sub-title">智能助手正在为您服务</span>
          </div>
        </div>
        <div class="header-ops">
          <div class="op-btn plus" title="开启新对话" @click="handleNewChat">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div class="op-btn" title="重新截图" @click="emit('newCapture')">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path
                d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div class="op-btn close" title="隐藏" @click="handleClose">
            <svg viewBox="0 0 24 24" width="18" height="18">
              <path d="M19 13H5v-2h14v2z" fill="currentColor" />
            </svg>
          </div>
        </div>
      </div>
    </template>

    <div
      class="chat-layout"
      :class="{ 'is-drag-active': isDragActive }"
      @dragenter="handleDragEnter"
      @dragover="handleDragOver"
      @dragleave="handleDragLeave"
      @drop="handleDrop"
    >
      <div v-if="isDragActive" class="drop-overlay">
        <div class="drop-panel">
          <svg viewBox="0 0 24 24" width="28" height="28">
            <path
              d="M19.35 10.04A7.49 7.49 0 0 0 5.38 8.09A6 6 0 0 0 6 20h13a5 5 0 0 0 .35-9.96ZM13 13v4h-2v-4H8l4-4l4 4h-3Z"
              fill="currentColor"
            />
          </svg>
          <span>松开即可上传图片</span>
          <small>支持多张图片继续追问</small>
        </div>
      </div>
      <div v-if="historyList?.length" class="chat-sidebar">
        <div class="sidebar-title">历史对话</div>
        <div class="history-list">
          <div
            v-for="item in historyList"
            :key="item.conversation_id"
            class="history-item"
            :title="item.title"
            @click="emit('loadHistory', item.conversation_id)"
          >
            <div class="item-icon">
              <svg viewBox="0 0 24 24" width="14" height="14">
                <path
                  d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div class="item-body">
              <div class="item-title text-ellipsis">{{ item.title }}</div>
              <div class="item-date">{{ formatDate(item.created_at) }}</div>
            </div>
          </div>
        </div>
      </div>

      <div class="chat-main">
        <div v-if="screenshot" class="preview-banner">
          <div class="banner-inner">
            <div class="image-box">
              <el-image
                :src="screenshot"
                fit="cover"
                :preview-src-list="[screenshot]"
              />
            </div>
            <div class="info-box">
              <div class="label">当前识别目标</div>
              <div class="desc">您可以询问关于此内容的任何细节</div>
            </div>
          </div>
        </div>

        <div ref="messageListRef" class="message-area">
          <div v-if="!messages.length" class="empty-chat-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" width="24" height="24">
                <path
                  d="M20 6h-8l-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2Zm-2 10H6l3.2-4.2l2.3 2.8l1.8-2.3L18 16Z"
                  fill="currentColor"
                />
              </svg>
            </div>
            <div class="empty-title">拖入图片或点击上传，直接向 AI 提问</div>
            <div class="empty-sub">
              也可以先框选屏幕区域，助手会带着截图进入对话。
            </div>
          </div>
          <div
            v-for="msg in messages"
            :key="msg.id"
            class="message-row"
            :class="msg.role"
          >
            <div class="avatar-col">
              <template v-if="msg.role === 'user'">
                <div class="user-avatar">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </template>
              <template v-else>
                <div class="ai-avatar">
                  <svg viewBox="0 0 24 24" width="20" height="20">
                    <path
                      d="M12 2L4.5 20.29L4.71 21L12 18L19.29 21L19.5 20.29L12 2Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </template>
            </div>
            <div class="content-col">
              <div v-if="msg.image" class="content-image">
                <el-image
                  :src="msg.image"
                  :preview-src-list="[msg.image]"
                  fit="cover"
                />
              </div>
              <div
                class="bubble"
                :class="{
                  thinking:
                    msg.role === 'assistant' && msg.loading && !msg.content,
                  streaming:
                    msg.role === 'assistant' && msg.content && msg.loading
                }"
              >
                <template v-if="msg.loading && !msg.content">
                  <div class="thinking-state">
                    <div class="thinking-text">
                      {{ msg.placeholder || "正在思考中，请稍等..." }}
                    </div>
                    <div class="typing">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </template>
                <template v-else>
                  <div
                    v-if="msg.role === 'assistant'"
                    class="markdown-body"
                    v-html="md.render(msg.content || '')"
                  />
                  <span v-else class="bubble-text" v-text="msg.content" />
                  <span
                    v-if="
                      msg.role === 'assistant' && msg.content && msg.loading
                    "
                    class="stream-cursor"
                  />
                </template>
              </div>
              <div class="meta">
                {{ formatTime(msg.timestamp) }}
              </div>
            </div>
          </div>
        </div>

        <div v-if="isStreaming" class="stop-bar">
          <button class="stop-btn" @click="handleStop">
            <svg viewBox="0 0 24 24" width="14" height="14">
              <rect
                x="6"
                y="6"
                width="12"
                height="12"
                rx="2"
                fill="currentColor"
              />
            </svg>
            停止生成
          </button>
        </div>

        <div v-if="suggestions?.length && !isStreaming" class="suggestions-bar">
          <div
            v-for="(s, i) in suggestions"
            :key="i"
            class="suggestion-chip"
            @click="useSuggestion(s)"
          >
            {{ s }}
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="footer-input">
        <div class="input-container">
          <input
            ref="fileInputRef"
            type="file"
            accept="image/*"
            multiple
            style="display: none"
            @change="handleFileChange"
          />
          <el-button
            class="upload-btn"
            :disabled="loading"
            circle
            @click="triggerFileUpload"
          >
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm0 12H4V8h16v10z"
                fill="currentColor"
              />
            </svg>
          </el-button>
          <el-input
            ref="inputRef"
            v-model="inputMessage"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 4 }"
            placeholder="输入您的问题..."
            :disabled="loading"
            resize="none"
            @keydown.enter.prevent="handleSend"
          />
          <div class="send-action">
            <el-button
              v-if="!isStreaming"
              type="primary"
              circle
              :loading="loading && !isStreaming"
              :disabled="!inputMessage.trim()"
              @click="handleSend"
            >
              <svg viewBox="0 0 24 24" width="18" height="18">
                <path
                  d="M2.01 21L23 12L2.01 3L2 10l15 2l-15 2z"
                  fill="currentColor"
                />
              </svg>
            </el-button>
            <el-button v-else type="danger" circle @click="handleStop">
              <svg viewBox="0 0 24 24" width="18" height="18">
                <rect
                  x="6"
                  y="6"
                  width="12"
                  height="12"
                  rx="2"
                  fill="currentColor"
                />
              </svg>
            </el-button>
          </div>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss">
.el-dialog.ai-chat-dialog.modern-style {
  --ai-primary: var(--el-color-primary);
  --ai-primary-strong: var(--el-color-primary-dark-2);
  --ai-primary-mid: var(--el-color-primary-light-3);
  --ai-primary-soft: var(--el-color-primary-light-9);
  --ai-primary-soft-border: var(--el-color-primary-light-7);

  position: fixed !important;
  top: 50% !important;
  left: 50% !important;
  transform: translate(-50%, -50%) !important;
  margin: 0 !important;
  display: flex;
  flex-direction: column;
  width: min(80vw, 1000px);
  height: min(60vw, calc(100vh - 80px), 750px);
  min-width: 520px;
  min-height: 390px;
  padding: 0;
  overflow: hidden;
  background-color: var(--el-bg-color-page);
  border: 1px solid var(--ai-primary-soft-border);
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.1);

  .el-dialog__header {
    flex-shrink: 0;
    padding: 0;
    margin: 0;
    border-radius: 20px 20px 0 0;
    overflow: hidden;
  }

  .el-dialog__body {
    flex: 1;
    min-height: 0;
    padding: 0;
    overflow: hidden;
  }

  .el-dialog__footer {
    flex-shrink: 0;
    padding: 0;
    border-radius: 0 0 20px 20px;
    overflow: hidden;
    background: var(--el-bg-color);
  }
}

@media screen and (max-width: 768px) {
  .el-dialog.ai-chat-dialog.modern-style {
    top: 0 !important;
    left: 0 !important;
    width: var(--qiming-native-vw, 100vw);
    max-width: var(--qiming-native-vw, 100vw);
    height: 100vh;
    height: 100dvh;
    height: var(--qiming-native-vh, 100dvh);
    min-width: 0;
    min-height: 0;
    border: none;
    border-radius: 0;
    box-shadow: none;
    transform: none !important;
    background: var(--qiming-native-page-bg, #f6f9ff);

    .el-dialog__header,
    .el-dialog__footer {
      border-radius: 0;
    }

    .el-dialog__header {
      border-bottom: 1px solid var(--qiming-native-border-color, rgb(151 180 247 / 20%));
    }

    .el-dialog__footer {
      background: var(--qiming-native-page-bg, rgb(246 249 255 / 96%));
      border-top: 1px solid var(--qiming-native-border-color, rgb(151 180 247 / 18%));
    }
  }

  .el-dialog.ai-chat-dialog.modern-style .dialog-header {
    box-sizing: border-box;
    min-height: calc(54px + var(--pure-safe-area-top, 0px));
    padding:
      calc(8px + var(--pure-safe-area-top, env(safe-area-inset-top, 0px)))
      12px 8px;
    background: var(--qiming-native-navbar-bg, rgb(255 255 255 / 96%));
    border-bottom: 0;
  }

  .el-dialog.ai-chat-dialog.modern-style .dialog-header .header-content {
    min-width: 0;
    gap: 9px;
  }

  .el-dialog.ai-chat-dialog.modern-style .dialog-header .header-icon {
    flex: 0 0 auto;
    width: 30px;
    height: 30px;
    color: #fff;
    border-radius: 12px;
  }

  .el-dialog.ai-chat-dialog.modern-style .dialog-header .header-icon svg {
    width: 18px;
    height: 18px;
  }

  .el-dialog.ai-chat-dialog.modern-style .dialog-header .header-text {
    min-width: 0;
  }

  .el-dialog.ai-chat-dialog.modern-style .dialog-header .main-title {
    max-width: 46vw;
    overflow: hidden;
    color: var(--qiming-native-text-primary, #172033) !important;
    font-size: 17px;
    line-height: 1.18;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .el-dialog.ai-chat-dialog.modern-style .dialog-header .sub-title {
    display: none;
  }

  .el-dialog.ai-chat-dialog.modern-style .dialog-header .header-ops {
    flex-shrink: 0;
    gap: 4px;
  }

  .el-dialog.ai-chat-dialog.modern-style .dialog-header .op-btn {
    width: 32px;
    height: 32px;
    color: var(--qiming-native-text-regular, #475569);
    border-radius: 11px;
  }

  .el-dialog.ai-chat-dialog.modern-style .chat-layout {
    background: var(--qiming-native-page-bg, #f6f9ff);
  }

  .el-dialog.ai-chat-dialog.modern-style .chat-sidebar {
    max-height: 78px;
    background: var(--qiming-native-page-bg, rgb(248 251 255 / 94%));
    border-bottom: 1px solid var(--qiming-native-border-color, rgb(151 180 247 / 20%));
  }

  .el-dialog.ai-chat-dialog.modern-style .chat-sidebar .sidebar-title {
    padding: 6px 12px 0;
    color: var(--qiming-native-text-secondary, #64748b);
    font-size: 11px;
    line-height: 1.2;
  }

  .el-dialog.ai-chat-dialog.modern-style .chat-sidebar .history-list {
    display: flex;
    gap: 7px;
    padding: 7px 12px 9px;
    overflow-x: auto;
    overflow-y: hidden;
    scrollbar-width: none;
  }

  .el-dialog.ai-chat-dialog.modern-style .chat-sidebar .history-list::-webkit-scrollbar {
    display: none;
  }

  .el-dialog.ai-chat-dialog.modern-style .chat-sidebar .history-item {
    flex: 0 0 118px;
    min-height: 40px;
    padding: 7px 9px;
    margin: 0;
    background: var(--qiming-native-surface-bg, rgb(255 255 255 / 88%));
    border: 1px solid var(--qiming-native-border-color, rgb(151 180 247 / 22%));
    border-radius: 13px;
  }

  .el-dialog.ai-chat-dialog.modern-style .preview-banner .banner-inner {
    background: var(--qiming-native-surface-bg, rgb(255 255 255 / 92%));
    border-color: var(--qiming-native-border-color, rgb(151 180 247 / 22%));
  }

  .el-dialog.ai-chat-dialog.modern-style .message-area {
    background: var(--qiming-native-page-bg, #f6f9ff);
  }

  .el-dialog.ai-chat-dialog.modern-style .footer-input {
    background: var(--qiming-native-page-bg, rgb(248 251 255 / 96%));
  }

  .el-dialog.ai-chat-dialog.modern-style .footer-input .input-container {
    background: var(--qiming-native-surface-bg, rgb(255 255 255 / 95%));
    border-color: var(--qiming-native-border-color, rgb(151 180 247 / 24%));
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark {
    --ai-primary-soft-border: rgb(148 163 184 / 20%);

    color: #eaf2ff;
    background: #07111f;
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .dialog-header {
    background: rgb(7 17 31 / 96%);
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .dialog-header .main-title {
    color: #f8fafc !important;
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .dialog-header .op-btn {
    color: #cbd5e1;
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .chat-layout,
  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .message-area {
    background: linear-gradient(180deg, #07111f 0%, #0b1220 100%);
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .chat-sidebar {
    background: rgb(7 17 31 / 94%);
    border-bottom-color: rgb(148 163 184 / 18%);
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .chat-sidebar .sidebar-title {
    color: #94a3b8;
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .chat-sidebar .history-item {
    background: rgb(30 41 59 / 82%);
    border-color: rgb(148 163 184 / 18%);
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .chat-sidebar .item-title {
    color: #e5e7eb;
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .chat-sidebar .item-date,
  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .chat-sidebar .item-icon {
    color: #94a3b8;
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .preview-banner .banner-inner {
    background: rgb(15 23 42 / 86%);
    border-color: rgb(148 163 184 / 18%);
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .preview-banner .label,
  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .preview-banner .desc {
    color: #dbeafe;
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .message-row.assistant .bubble {
    color: #e5e7eb;
    background: rgb(15 23 42 / 92%);
    border-color: rgb(148 163 184 / 18%);
    box-shadow: 0 10px 24px rgb(0 0 0 / 16%);
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .message-row.assistant .bubble.thinking {
    background: rgb(30 41 59 / 88%);
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .thinking-text,
  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .markdown-body,
  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .bubble-text {
    color: #e5e7eb;
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .typing span {
    background: #94a3b8;
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .meta {
    color: #94a3b8;
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .stop-bar {
    background: linear-gradient(180deg, rgb(7 17 31 / 0%) 0%, rgb(7 17 31 / 88%) 100%);
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .footer-input {
    background: rgb(7 17 31 / 96%);
  }

  .el-dialog.ai-chat-dialog.modern-style.is-native-dark .footer-input .input-container {
    background: rgb(2 6 23 / 86%);
    border-color: rgb(148 163 184 / 22%);
    box-shadow: 0 10px 28px rgb(0 0 0 / 24%);
  }
}
</style>

<style lang="scss" scoped>
.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(
    180deg,
    var(--ai-primary-soft) 0%,
    var(--el-bg-color) 100%
  );
  border-bottom: 1px solid var(--ai-primary-soft-border);

  .header-content {
    display: flex;
    gap: 12px;
    align-items: center;

    .header-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      color: #fff;
      background: linear-gradient(
        135deg,
        var(--ai-primary-mid) 0%,
        var(--ai-primary-strong) 100%
      );
      border-radius: 10px;
    }

    .header-text {
      display: flex;
      flex-direction: column;

      .main-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--el-text-color-primary);
      }

      .sub-title {
        font-size: 11px;
        color: var(--el-text-color-placeholder);
      }
    }
  }

  .header-ops {
    display: flex;
    gap: 8px;

    .op-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      color: var(--el-text-color-regular);
      cursor: pointer;
      border-radius: 10px;
      transition: all 0.2s;

      &:hover {
        color: var(--ai-primary);
        background-color: var(--ai-primary-soft);
      }

      &.close:hover {
        color: var(--el-color-danger);
        background-color: var(--el-color-danger-light-9);
      }
    }
  }
}

.chat-layout {
  position: relative;
  display: flex;
  flex: 1;
  height: 100%;
  min-height: 0;
  overflow: hidden;

  &.is-drag-active {
    .chat-main,
    .chat-sidebar {
      filter: blur(1px);
    }
  }

  .drop-overlay {
    position: absolute;
    inset: 0;
    z-index: 20;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
    pointer-events: none;
    background: rgb(239 246 255 / 64%);
    backdrop-filter: blur(10px);

    .drop-panel {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      min-width: min(320px, calc(100vw - 48px));
      padding: 28px 30px;
      color: var(--ai-primary);
      text-align: center;
      background: rgb(255 255 255 / 92%);
      border: 1px solid var(--ai-primary-soft-border);
      border-radius: 18px;
      box-shadow: 0 18px 44px rgb(37 99 235 / 16%);

      span {
        font-size: 15px;
        font-weight: 700;
        color: var(--el-text-color-primary);
      }

      small {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }

  .chat-sidebar {
    display: flex;
    flex-direction: column;
    width: 220px;
    height: 100%;
    background-color: var(--el-fill-color-light);
    border-right: 1px solid var(--ai-primary-soft-border);
    overflow: hidden;

    .sidebar-title {
      flex-shrink: 0;
      padding: 16px 20px;
      font-size: 13px;
      font-weight: 600;
      color: var(--el-text-color-secondary);
      border-bottom: 1px solid var(--ai-primary-soft-border);
    }

    .history-list {
      flex: 1;
      padding: 10px;
      overflow-y: auto;

      .history-item {
        display: flex;
        gap: 10px;
        align-items: center;
        padding: 10px 12px;
        margin-bottom: 4px;
        cursor: pointer;
        border-radius: 12px;
        transition: all 0.2s;

        &:hover {
          background-color: var(--el-fill-color-darker);
        }

        &.active {
          background-color: var(--ai-primary-soft);

          .item-title {
            color: var(--ai-primary);
          }
        }

        .item-icon {
          color: var(--el-text-color-placeholder);
        }

        .item-body {
          flex: 1;
          overflow: hidden;

          .item-title {
            font-size: 13px;
            color: var(--el-text-color-primary);
          }

          .item-date {
            margin-top: 2px;
            font-size: 11px;
            color: var(--el-text-color-placeholder);
          }
        }
      }
    }
  }
}

.chat-main {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  overflow: hidden;
}

.text-ellipsis {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-banner {
  padding: 12px 20px;
  background-color: var(--el-bg-color);
  border-bottom: 1px solid var(--ai-primary-soft-border);

  .banner-inner {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 10px;
    background-color: var(--el-fill-color-blank);
    border: 1px solid var(--ai-primary-soft-border);
    border-radius: 14px;

    .image-box {
      width: 48px;
      height: 48px;
      overflow: hidden;
      border-radius: 10px;

      :deep(.el-image) {
        width: 100%;
        height: 100%;
      }
    }

    .info-box {
      .label {
        font-size: 13px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .desc {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
  }
}

.message-area {
  flex: 1;
  min-height: 0;
  padding: 20px;
  overflow-y: auto;

  .empty-chat-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: 28px 18px;
    text-align: center;
    color: var(--el-text-color-secondary);

    .empty-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 56px;
      height: 56px;
      margin-bottom: 14px;
      color: var(--ai-primary);
      background: var(--ai-primary-soft);
      border: 1px solid var(--ai-primary-soft-border);
      border-radius: 18px;
    }

    .empty-title {
      max-width: 360px;
      font-size: 16px;
      font-weight: 700;
      line-height: 1.45;
      color: var(--el-text-color-primary);
    }

    .empty-sub {
      max-width: 420px;
      margin-top: 8px;
      font-size: 13px;
      line-height: 1.6;
    }
  }

  .message-row {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;

    &.user {
      flex-direction: row-reverse;

      .content-col {
        align-items: flex-end;
      }

      .bubble {
        color: #fff;
        background: linear-gradient(
          135deg,
          var(--ai-primary-mid) 0%,
          var(--ai-primary-strong) 100%
        );
        border-radius: 18px 8px 18px 18px;
      }

      .user-avatar {
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-8);
      }
    }

    &.assistant {
      .bubble {
        background: #f7fbff;
        border: 1px solid var(--ai-primary-soft-border);
        border-radius: 8px 18px 18px 18px;
      }

      .ai-avatar {
        color: #fff;
        background: linear-gradient(
          135deg,
          var(--ai-primary-mid) 0%,
          var(--ai-primary-strong) 100%
        );
      }
    }
  }

  .avatar-col {
    flex-shrink: 0;

    .user-avatar,
    .ai-avatar {
      display: flex !important;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: 12px;

      svg {
        width: 24px;
        height: 24px;
        display: block;
      }
    }
  }

  .content-col {
    display: flex;
    flex-direction: column;
    max-width: 80%;

    .bubble {
      padding: 10px 16px;
      font-size: 14px;
      line-height: 1.6;
      word-break: break-word;
      box-shadow: 0 2px 8px rgb(0 0 0 / 4%);

      &.thinking {
        min-width: 220px;
        background: linear-gradient(
          135deg,
          rgb(248 251 255 / 96%) 0%,
          rgb(238 246 255 / 96%) 100%
        );
      }

      .bubble-text {
        white-space: pre-wrap;
      }

      .stream-cursor {
        display: inline-block;
        width: 2px;
        height: 1em;
        margin-left: 2px;
        vertical-align: text-bottom;
        background-color: var(--ai-primary);
        animation: blink 0.8s step-end infinite;
      }

      &.streaming {
        min-height: 32px;
      }
    }

    .content-image {
      margin-bottom: 8px;

      :deep(.el-image) {
        max-width: 280px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
      }
    }

    .markdown-body {
      padding: 2px 0;
      font-size: 14px;
      line-height: 1.6;
      background: transparent !important;

      :deep(p) {
        margin: 0 0 10px;

        &:last-child {
          margin-bottom: 0;
        }
      }

      :deep(code) {
        padding: 2px 4px;
        font-family: inherit;
        background-color: var(--el-fill-color-darker);
        border-radius: 4px;
      }

      :deep(pre) {
        padding: 12px;
        margin: 10px 0;
        overflow: auto;
        background-color: #f6f8fa;
        border-radius: 8px;

        code {
          padding: 0;
          background-color: transparent;
        }
      }

      :deep(ul),
      :deep(ol) {
        padding-left: 20px;
        margin-bottom: 10px;
      }

      :deep(table) {
        width: 100%;
        margin-bottom: 15px;
        border-collapse: collapse;

        th,
        td {
          padding: 6px 13px;
          border: 1px solid var(--el-border-color);
        }

        tr:nth-child(2n) {
          background-color: var(--el-fill-color-lighter);
        }
      }
    }

    .meta {
      margin-top: 6px;
      font-size: 11px;
      color: var(--el-text-color-placeholder);
    }
  }
}

.typing {
  display: flex;
  gap: 4px;
  align-items: center;
  padding: 4px 0;

  span {
    width: 6px;
    height: 6px;
    background: var(--el-text-color-placeholder);
    border-radius: 50%;
    animation: bounce 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

.thinking-state {
  display: grid;
  gap: 8px;
}

.thinking-text {
  font-size: 13px;
  color: var(--el-text-color-regular);
  letter-spacing: 0.01em;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0.6);
  }

  40% {
    transform: scale(1);
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0;
  }
}

.stop-bar {
  display: flex;
  justify-content: center;
  padding: 8px 20px;

  .stop-btn {
    display: flex;
    gap: 6px;
    align-items: center;
    padding: 6px 16px;
    font-size: 12px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    background-color: var(--el-fill-color-lighter);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 20px;
    transition: all 0.2s;

    &:hover {
      color: var(--el-color-danger);
      background-color: var(--el-color-danger-light-9);
      border-color: var(--el-color-danger-light-5);
    }
  }
}

.suggestions-bar {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 20px;

  .suggestion-chip {
    padding: 6px 12px;
    font-size: 12px;
    color: var(--el-color-primary);
    cursor: pointer;
    background-color: var(--el-color-primary-light-9);
    border: 1px solid var(--el-color-primary-light-8);
    border-radius: 20px;
    transition: all 0.2s;

    &:hover {
      background-color: var(--el-color-primary-light-8);
      transform: translateY(-1px);
    }
  }
}

.footer-input {
  padding: 16px 20px 24px;
  background-color: var(--el-bg-color);
  border-top: 1px solid var(--ai-primary-soft-border);

  .input-container {
    position: relative;
    display: flex;
    align-items: flex-end;
    gap: 12px;
    padding: 8px;
    background-color: var(--el-fill-color-lighter);
    border: 1px solid var(--ai-primary-soft-border);
    border-radius: 16px;
    transition: all 0.2s;

    &:focus-within {
      background-color: var(--el-bg-color);
      border-color: var(--ai-primary);
      box-shadow: 0 0 0 3px var(--el-color-primary-light-8);
    }

    .upload-btn {
      flex-shrink: 0;
      margin-bottom: 2px;
      color: var(--el-text-color-regular);

      &:hover {
        color: var(--ai-primary);
        background-color: var(--ai-primary-soft);
      }
    }

    :deep(.el-textarea__inner) {
      padding: 4px 8px;
      font-size: 14px;
      background: transparent;
      border: none;

      &:focus {
        box-shadow: none;
      }
    }
  }

  .send-action {
    flex-shrink: 0;

    .el-button {
      width: 32px;
      height: 32px;
    }
  }
}

@media screen and (max-width: 768px) {
  .el-dialog.ai-chat-dialog.modern-style {
    background: #f6f9ff;

    .el-dialog__header {
      border-bottom: 1px solid rgb(151 180 247 / 20%);
    }

    .el-dialog__body {
      min-height: 0;
    }

    .el-dialog__footer {
      background: rgb(246 249 255 / 96%);
      border-top: 1px solid rgb(151 180 247 / 18%);
    }
  }

  .dialog-header {
    min-height: calc(54px + var(--pure-safe-area-top, 0px));
    align-items: flex-end;
    padding:
      calc(8px + var(--pure-safe-area-top, env(safe-area-inset-top, 0px)))
      12px 8px;
    background: rgb(255 255 255 / 96%);
    border-bottom: 0;

    .header-content {
      min-width: 0;
      gap: 9px;

      .header-icon {
        flex: 0 0 auto;
        width: 30px;
        height: 30px;
        border-radius: 12px;

        svg {
          width: 18px;
          height: 18px;
        }
      }

      .header-text {
        min-width: 0;

        .main-title {
          overflow: hidden;
          font-size: 17px;
          line-height: 1.18;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .sub-title {
          max-width: 46vw;
          overflow: hidden;
          font-size: 10.5px;
          line-height: 1.25;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      }
    }

    .header-ops {
      flex-shrink: 0;
      gap: 4px;

      .op-btn {
        width: 32px;
        height: 32px;
        color: #475569;
        border-radius: 11px;

        svg {
          width: 18px;
          height: 18px;
        }
      }
    }
  }

  .chat-layout {
    flex-direction: column;
    background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);

    .drop-overlay {
      padding: 18px;

      .drop-panel {
        width: 100%;
        min-width: 0;
        padding: 22px 18px;
        border-radius: 20px;

        span {
          font-size: 15px;
        }
      }
    }

    .chat-sidebar {
      flex: 0 0 auto;
      width: 100%;
      height: auto;
      max-height: 84px;
      background: rgb(248 251 255 / 92%);
      border-right: none;
      border-bottom: 1px solid var(--ai-primary-soft-border);
      box-shadow: none;

      .sidebar-title {
        padding: 7px 12px 0;
        font-size: 11px;
        line-height: 1.2;
        border-bottom: none;
      }

      .history-list {
        flex: 0 0 auto;
        display: flex;
        gap: 7px;
        padding: 7px 12px 9px;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;
        scrollbar-width: none;

        &::-webkit-scrollbar {
          display: none;
        }

        .history-item {
          flex: 0 0 132px;
          min-height: 42px;
          padding: 7px 9px;
          margin-bottom: 0;
          background: rgb(255 255 255 / 86%);
          border: 1px solid rgb(151 180 247 / 24%);
          border-radius: 13px;

          .item-icon {
            flex: 0 0 auto;
            color: #64748b;
          }

          .item-body {
            .item-title {
              font-size: 11.5px;
              line-height: 1.2;
            }

            .item-date {
              font-size: 10px;
              line-height: 1.2;
            }
          }
        }
      }
    }
  }

  .preview-banner {
    padding: 9px 12px 7px;
    background: transparent;

    .banner-inner {
      align-items: center;
      padding: 8px 10px;
      background: rgb(255 255 255 / 90%);
      border-color: rgb(151 180 247 / 22%);
      border-radius: 15px;

      .image-box {
        flex: 0 0 auto;
        width: 42px;
        height: 42px;
        border-radius: 11px;
      }

      .info-box {
        min-width: 0;

        .label {
          font-size: 12px;
          line-height: 1.2;
        }

        .desc {
          max-width: 100%;
          overflow: hidden;
          font-size: 12px;
          line-height: 1.3;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
      }
    }
  }

  .message-area {
    padding: 11px 12px 10px;
    -webkit-overflow-scrolling: touch;

    .empty-chat-state {
      justify-content: flex-start;
      min-height: 0;
      padding: 32px 14px 18px;

      .empty-icon {
        width: 52px;
        height: 52px;
        margin-bottom: 12px;
      }

      .empty-title {
        font-size: 15px;
      }

      .empty-sub {
        font-size: 12px;
      }
    }

    .message-row {
      gap: 8px;
      margin-bottom: 16px;
    }

    .avatar-col {
      .user-avatar,
      .ai-avatar {
        width: 32px;
        height: 32px;
        border-radius: 10px;

        svg {
          width: 18px;
          height: 18px;
        }
      }
    }

    .content-col {
      max-width: calc(100% - 40px);

      .bubble {
        padding: 9px 11px;
        font-size: 13px;
        line-height: 1.55;
        border-radius: 14px;
      }

      .content-image {
        :deep(.el-image) {
          max-width: min(72vw, 250px);
          max-height: 270px;
          overflow: hidden;
          border-radius: 13px;
        }
      }

      .markdown-body {
        font-size: 13px;

        :deep(pre) {
          padding: 10px;
          font-size: 12px;
        }
      }
    }
  }

  .stop-bar {
    padding: 4px 12px 6px;

    .stop-btn {
      min-height: 34px;
      padding: 7px 16px;
      font-size: 12px;
      color: #fff;
      background: rgb(15 23 42 / 88%);
      border: 0;
      border-radius: 18px;
    }
  }

  .suggestions-bar {
    flex-wrap: nowrap;
    padding: 10px 16px 12px;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;

    .suggestion-chip {
      flex-shrink: 0;
      white-space: nowrap;
    }
  }

  .footer-input {
    padding:
      8px 10px
      calc(8px + var(--pure-safe-area-bottom, env(safe-area-inset-bottom, 0px)));
    background: rgb(248 251 255 / 96%);

    .input-container {
      gap: 8px;
      align-items: center;
      padding: 7px 8px;
      background: rgb(255 255 255 / 95%);
      border-color: rgb(151 180 247 / 24%);
      border-radius: 16px;
      box-shadow: 0 10px 28px rgb(89 121 196 / 10%);

      .upload-btn {
        width: 34px;
        height: 34px;
        margin-bottom: 0;
      }

      :deep(.el-textarea__inner) {
        min-height: 34px !important;
        max-height: 94px;
        padding: 6px 8px;
        font-size: 13px;
        line-height: 1.4;
      }
    }

    .send-action {
      .el-button {
        width: 34px;
        height: 34px;
      }
    }
  }
}

@media screen and (max-width: 480px) {
  .dialog-header {
    padding:
      calc(8px + var(--pure-safe-area-top, env(safe-area-inset-top, 0px)))
      10px 8px;

    .header-content {
      .header-text {
        .sub-title {
          display: none;
        }
      }
    }
  }

  .chat-layout {
    .chat-sidebar {
      .history-list {
        padding: 7px 10px 9px;

        .history-item {
          flex-basis: 128px;
        }
      }
    }
  }

  .preview-banner,
  .stop-bar,
  .suggestions-bar,
  .message-area {
    padding-left: 12px;
    padding-right: 12px;
  }

  .footer-input {
    padding-left: 10px;
    padding-right: 10px;
  }
}

:global(html.dark) {
  .el-dialog.ai-chat-dialog.modern-style {
    background: #0f172a;
    border-color: rgb(148 163 184 / 18%);

    .el-dialog__footer {
      background: #0f172a;
    }
  }

  .dialog-header {
    background: linear-gradient(180deg, #172033 0%, #0f172a 100%);
    border-bottom-color: rgb(148 163 184 / 16%);
  }

  .chat-layout {
    .drop-overlay {
      background: rgb(2 6 23 / 66%);

      .drop-panel {
        background: rgb(15 23 42 / 94%);
        border-color: rgb(148 163 184 / 18%);
        box-shadow: 0 18px 44px rgb(0 0 0 / 32%);
      }
    }

    .chat-sidebar {
      background-color: rgb(15 23 42 / 92%);
      border-color: rgb(148 163 184 / 16%);

      .history-item {
        background: rgb(30 41 59 / 70%);
        border-color: rgb(148 163 184 / 14%);

        &:hover {
          background: rgb(51 65 85 / 76%);
        }
      }
    }
  }

  .preview-banner {
    background-color: #0f172a;

    .banner-inner {
      background-color: rgb(15 23 42 / 88%);
      border-color: rgb(148 163 184 / 16%);
    }
  }

  .message-area {
    .message-row.assistant {
      .bubble {
        background: rgb(15 23 42 / 88%);
        border-color: rgb(148 163 184 / 18%);
      }
    }
  }

  .footer-input {
    background-color: #0f172a;
    border-top-color: rgb(148 163 184 / 16%);

    .input-container {
      background-color: rgb(15 23 42 / 88%);
      border-color: rgb(148 163 184 / 18%);
    }
  }
}

@media screen and (max-width: 768px) {
  :global(html.dark) {
    .el-dialog.ai-chat-dialog.modern-style {
      background: #07111f;

      .el-dialog__header,
      .el-dialog__footer {
        border-color: rgb(148 163 184 / 18%);
      }
    }

    .dialog-header {
      background: rgb(7 17 31 / 96%);
    }

    .chat-layout {
      background: linear-gradient(180deg, #07111f 0%, #0b1220 100%);

      .chat-sidebar {
        background: rgb(7 17 31 / 92%);
        box-shadow: none;

        .history-item {
          background: rgb(30 41 59 / 82%);
          border-color: rgb(148 163 184 / 18%);

          .item-icon,
          .item-date {
            color: #94a3b8;
          }

          .item-title {
            color: #e5e7eb;
          }
        }
      }
    }

    .preview-banner {
      background: transparent;

      .banner-inner {
        background: rgb(15 23 42 / 86%);
        border-color: rgb(148 163 184 / 18%);
      }
    }

    .footer-input {
      background: rgb(7 17 31 / 96%);

      .input-container {
        background: rgb(2 6 23 / 82%);
        border-color: rgb(148 163 184 / 22%);
        box-shadow: 0 10px 28px rgb(0 0 0 / 24%);
      }
    }
  }
}
</style>
