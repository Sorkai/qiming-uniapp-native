<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import MarkdownIt from "markdown-it";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import type { ChatMessage } from "./types";

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
  (e: "uploadImage", file: File): void;
}>();

const inputMessage = ref("");
const messageListRef = ref<HTMLElement>();
const inputRef = ref<any>();
const fileInputRef = ref<HTMLInputElement>();

const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit("update:visible", val)
});

watch(
  () => props.visible,
  val => {
    if (val) {
      nextTick(() => {
        inputRef.value?.focus();
      });
    }
  }
);

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

const triggerFileUpload = () => {
  fileInputRef.value?.click();
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    emit("uploadImage", file);
    target.value = "";
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
    class="ai-chat-dialog modern-style"
    append-to-body
    destroy-on-close
    :show-close="false"
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

    <div class="chat-layout">
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
    width: 100vw;
    max-width: 100vw;
    height: 100vh;
    height: 100dvh;
    min-width: 0;
    min-height: 0;
    border: none;
    border-radius: 0;
    box-shadow: none;
    transform: none !important;

    .el-dialog__header,
    .el-dialog__footer {
      border-radius: 0;
    }
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
  display: flex;
  flex: 1;
  height: 100%;
  min-height: 0;
  overflow: hidden;

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
        background:
          linear-gradient(
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
  .dialog-header {
    align-items: flex-start;
    padding: 14px 16px;

    .header-content {
      min-width: 0;

      .header-text {
        min-width: 0;

        .sub-title {
          white-space: normal;
          line-height: 1.4;
        }
      }
    }
  }

  .chat-layout {
    flex-direction: column;

    .chat-sidebar {
      width: 100%;
      height: auto;
      border-right: none;
      border-bottom: 1px solid var(--ai-primary-soft-border);

      .sidebar-title {
        padding: 12px 16px 0;
        border-bottom: none;
      }

      .history-list {
        display: flex;
        gap: 10px;
        padding: 12px 16px 14px;
        overflow-x: auto;
        overflow-y: hidden;
        -webkit-overflow-scrolling: touch;

        .history-item {
          flex: 0 0 180px;
          margin-bottom: 0;
        }
      }
    }
  }

  .preview-banner {
    padding: 10px 16px;

    .banner-inner {
      align-items: flex-start;
    }
  }

  .message-area {
    padding: 16px;
    -webkit-overflow-scrolling: touch;

    .message-row {
      gap: 10px;
      margin-bottom: 18px;
    }

    .avatar-col {
      .user-avatar,
      .ai-avatar {
        width: 36px;
        height: 36px;
        border-radius: 11px;

        svg {
          width: 20px;
          height: 20px;
        }
      }
    }

    .content-col {
      max-width: calc(100% - 46px);

      .bubble {
        padding: 10px 12px;
        font-size: 13px;
      }

      .content-image {
        :deep(.el-image) {
          max-width: min(100%, 220px);
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
    padding: 6px 16px;
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
    padding: 12px 12px calc(12px + var(--pure-safe-area-bottom));

    .input-container {
      gap: 8px;
      padding: 8px 10px;
      border-radius: 14px;

      .upload-btn {
        width: 36px;
        height: 36px;
        margin-bottom: 0;
      }

      :deep(.el-textarea__inner) {
        min-height: 36px;
        padding: 6px 8px;
        font-size: 13px;
      }
    }

    .send-action {
      .el-button {
        width: 36px;
        height: 36px;
      }
    }
  }
}

@media screen and (max-width: 480px) {
  .dialog-header {
    padding: 12px 14px;

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
        padding: 10px 12px 12px;

        .history-item {
          flex-basis: 160px;
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
</style>
