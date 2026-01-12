<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import type { ChatMessage, ChatSession } from "./types";

defineOptions({
  name: "AiChatDialog"
});

const props = defineProps<{
  visible: boolean;
  screenshot?: string;
  messages: ChatMessage[];
  loading?: boolean;
  suggestions?: string[];
}>();

const emit = defineEmits<{
  (e: "update:visible", value: boolean): void;
  (e: "send", message: string): void;
  (e: "retry"): void;
  (e: "newCapture"): void;
  (e: "viewHistory"): void;
}>();

// 输入框内容
const inputMessage = ref("");
const messageListRef = ref<HTMLElement>();

// 对话框可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val)
});

// 发送消息
const handleSend = () => {
  const message = inputMessage.value.trim();
  if (!message || props.loading) return;
  
  emit("send", message);
  inputMessage.value = "";
};

// 使用建议问题
const useSuggestion = (suggestion: string) => {
  inputMessage.value = suggestion;
  handleSend();
};

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messageListRef.value) {
      messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
    }
  });
};

// 监听消息变化，自动滚动
watch(() => props.messages.length, () => {
  scrollToBottom();
});

// 格式化时间
const formatTime = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("zh-CN", {
    hour: "2-digit",
    minute: "2-digit"
  });
};

// 关闭对话框
const handleClose = () => {
  dialogVisible.value = false;
};
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="AI识屏助手"
    width="520px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    class="ai-chat-dialog"
    append-to-body
    destroy-on-close
  >
    <template #header>
      <div class="dialog-header">
        <div class="header-left">
          <svg class="ai-icon" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
              fill="currentColor"
            />
          </svg>
          <span class="title">AI识屏助手</span>
        </div>
        <div class="header-actions">
          <el-tooltip content="查看历史记录" placement="bottom">
            <el-button text @click="emit('viewHistory')">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0 0 13 21a9 9 0 0 0 0-18zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z"
                  fill="currentColor"
                />
              </svg>
            </el-button>
          </el-tooltip>
          <el-tooltip content="重新截图" placement="bottom">
            <el-button text @click="emit('newCapture')">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                <path
                  d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14zm-5-6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"
                  fill="currentColor"
                />
              </svg>
            </el-button>
          </el-tooltip>
        </div>
      </div>
    </template>

    <div class="chat-container">
      <!-- 截图预览 -->
      <div v-if="screenshot" class="screenshot-preview">
        <img :src="screenshot" alt="截图" />
        <div class="screenshot-label">当前识别的截图</div>
      </div>

      <!-- 消息列表 -->
      <div ref="messageListRef" class="message-list">
        <div
          v-for="msg in messages"
          :key="msg.id"
          class="message-item"
          :class="msg.role"
        >
          <div class="message-avatar">
            <template v-if="msg.role === 'user'">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                  fill="currentColor"
                />
              </svg>
            </template>
            <template v-else>
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                  fill="currentColor"
                />
              </svg>
            </template>
          </div>
          <div class="message-content">
            <div v-if="msg.image" class="message-image">
              <img :src="msg.image" alt="截图" />
            </div>
            <div class="message-text">
              <template v-if="msg.loading">
                <div class="typing-indicator">
                  <span></span>
                  <span></span>
                </div>
              </template>
              <template v-else>
                {{ msg.content }}
              </template>
            </div>
            <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>
      </div>

      <!-- 建议问题 -->
      <div v-if="suggestions && suggestions.length > 0" class="suggestions">
        <div class="suggestions-label">您可能想问：</div>
        <div class="suggestions-list">
          <el-tag
            v-for="(suggestion, index) in suggestions"
            :key="index"
            class="suggestion-tag"
            effect="plain"
            @click="useSuggestion(suggestion)"
          >
            {{ suggestion }}
          </el-tag>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="input-area">
        <el-input
          v-model="inputMessage"
          placeholder="输入您的问题..."
          :disabled="loading"
          @keyup.enter="handleSend"
        >
          <template #append>
            <el-button
              type="primary"
              :loading="loading"
              :disabled="!inputMessage.trim()"
              @click="handleSend"
            >
              发送
            </el-button>
          </template>
        </el-input>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.ai-chat-dialog {
  :deep(.el-dialog__header) {
    padding: 0;
    margin: 0;
  }

  :deep(.el-dialog__body) {
    padding: 0;
  }

  :deep(.el-dialog__footer) {
    padding: 16px;
    border-top: 1px solid var(--el-border-color-lighter);
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;

  .header-left {
    display: flex;
    align-items: center;
    gap: 10px;

    .ai-icon {
      width: 24px;
      height: 24px;
    }

    .title {
      font-size: 16px;
      font-weight: 600;
    }
  }

  .header-actions {
    display: flex;
    gap: 4px;

    .el-button {
      color: rgba(255, 255, 255, 0.9);

      &:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.1);
      }
    }
  }
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 450px;
}

.screenshot-preview {
  padding: 12px 16px;
  background: var(--el-fill-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);

  img {
    max-width: 100%;
    max-height: 120px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .screenshot-label {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 16px;

  .message-item {
    display: flex;
    gap: 12px;
    margin-bottom: 16px;

    &.user {
      flex-direction: row-reverse;

      .message-content {
        align-items: flex-end;
      }

      .message-text {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
      }

      .message-avatar {
        background: var(--el-color-primary-light-7);
        color: var(--el-color-primary);
      }
    }

    &.assistant {
      .message-avatar {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #fff;
      }

      .message-text {
        background: var(--el-fill-color-light);
        color: var(--el-text-color-primary);
      }
    }
  }

  .message-avatar {
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 50%;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .message-content {
    display: flex;
    flex-direction: column;
    max-width: 75%;
  }

  .message-image {
    margin-bottom: 8px;

    img {
      max-width: 200px;
      border-radius: 8px;
    }
  }

  .message-text {
    padding: 10px 14px;
    border-radius: 12px;
    font-size: 14px;
    line-height: 1.5;
    word-break: break-word;
  }

  .message-time {
    margin-top: 4px;
    font-size: 11px;
    color: var(--el-text-color-placeholder);
  }
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;

  span {
    width: 8px;
    height: 8px;
    background: currentColor;
    border-radius: 50%;
    opacity: 0.4;
    animation: typing 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }
  }
}

@keyframes typing {
  0%,
  80%,
  100% {
    transform: scale(0.6);
    opacity: 0.4;
  }

  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.suggestions {
  padding: 12px 16px;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-lighter);

  .suggestions-label {
    margin-bottom: 8px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }

  .suggestions-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .suggestion-tag {
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }
  }
}

.input-area {
  .el-input {
    :deep(.el-input-group__append) {
      padding: 0;

      .el-button {
        margin: 0;
        border-radius: 0 4px 4px 0;
      }
    }
  }
}
</style>
