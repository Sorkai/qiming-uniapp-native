<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import type { ChatMessage } from "./types";

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
}>();

// 输入框内容
const inputMessage = ref("");
const messageListRef = ref<HTMLElement>();
const inputRef = ref<any>();

// 对话框可见性
const dialogVisible = computed({
  get: () => props.visible,
  set: val => emit("update:visible", val)
});

// 监听弹窗显示，自动聚焦
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
watch(
  () => props.messages.length,
  () => {
    scrollToBottom();
  }
);

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
    width="480px"
    :close-on-click-modal="false"
    :close-on-press-escape="true"
    class="ai-chat-dialog"
    append-to-body
    destroy-on-close
    :show-close="false"
  >
    <template #header>
      <div class="dialog-header">
        <div class="header-left">
          <span class="title">AI 识屏助手</span>
        </div>
        <div class="header-actions">
          <div class="action-item" title="重新截图" @click="emit('newCapture')">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M17 3H7c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H7V5h10v14zm-5-6c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"
                fill="currentColor"
              />
            </svg>
          </div>
          <div class="action-item close" title="关闭" @click="handleClose">
            <svg viewBox="0 0 24 24" width="20" height="20">
              <path
                d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>
    </template>

    <div class="chat-container">
      <!-- 截图预览 -->
      <div v-if="screenshot" class="screenshot-preview">
        <div class="preview-content">
          <img :src="screenshot" alt="截图" />
          <div class="screenshot-info">
            <div class="info-title">当前识别的截图</div>
            <div class="info-desc">AI 已准备好分析该内容</div>
          </div>
        </div>
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
              <img
                src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
                alt="user"
              />
            </template>
            <template v-else>
              <div class="ai-avatar-icon">
                <svg viewBox="0 0 24 24">
                  <path
                    d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"
                    fill="currentColor"
                  />
                </svg>
              </div>
            </template>
          </div>
          <div class="message-wrapper">
            <div class="message-content">
              <div v-if="msg.image" class="message-image">
                <el-image
                  :src="msg.image"
                  :preview-src-list="[msg.image]"
                  fit="cover"
                />
              </div>
              <div class="message-text">
                <template v-if="msg.loading">
                  <div class="typing-indicator">
                    <span />
                    <span />
                    <span />
                  </div>
                </template>
                <template v-else>
                  {{ msg.content }}
                </template>
              </div>
            </div>
            <div class="message-time">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>
      </div>

      <!-- 建议问题 (置于输入框上方) -->
      <div v-if="suggestions && suggestions.length > 0" class="suggestions">
        <div class="suggestions-list">
          <div
            v-for="(suggestion, index) in suggestions"
            :key="index"
            class="suggestion-item"
            @click="useSuggestion(suggestion)"
          >
            {{ suggestion }}
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="input-area">
        <div class="input-tools">
          <svg
            viewBox="0 0 24 24"
            width="24"
            height="24"
            class="tool-icon"
            @click="emit('newCapture')"
          >
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor" />
          </svg>
        </div>
        <el-input
          ref="inputRef"
          v-model="inputMessage"
          type="textarea"
          :autosize="{ minRows: 1, maxRows: 4 }"
          placeholder="请输入您的问题..."
          :disabled="loading"
          resize="none"
          @keydown.enter.prevent="handleSend"
        />
        <el-button
          type="success"
          class="send-btn"
          :loading="loading"
          :disabled="!inputMessage.trim()"
          @click="handleSend"
        >
          发送
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style lang="scss" scoped>
.ai-chat-dialog {
  :deep(.el-dialog) {
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
    background: #f3f3f3;
    border-radius: 8px;
  }

  :deep(.el-dialog__header) {
    padding: 0;
    margin: 0;
  }

  :deep(.el-dialog__body) {
    flex: 1;
    padding: 0;
    overflow: hidden;
  }

  :deep(.el-dialog__footer) {
    padding: 0;
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f3f3f3;
  border-bottom: 1px solid #e7e7e7;

  .header-left {
    .title {
      font-size: 15px;
      font-weight: 500;
      color: #1a1a1a;
    }
  }

  .header-actions {
    display: flex;
    gap: 16px;
    align-items: center;

    .action-item {
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 4px;
      color: #515151;
      cursor: pointer;
      border-radius: 4px;
      transition: all 0.2s;

      &:hover {
        background-color: #e2e2e2;
      }

      &.close:hover {
        color: #fff;
        background-color: #fa5151;
      }
    }
  }
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: 520px;
}

.screenshot-preview {
  padding: 16px;
  background: #fff;
  border-bottom: 1px solid #e7e7e7;

  .preview-content {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px;
    background: #f9f9f9;
    border: 1px solid #eee;
    border-radius: 8px;

    img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 4px;
    }

    .screenshot-info {
      .info-title {
        font-size: 14px;
        font-weight: 500;
        color: #333;
      }

      .info-desc {
        margin-top: 4px;
        font-size: 12px;
        color: #999;
      }
    }
  }
}

.message-list {
  flex: 1;
  padding: 20px 16px;
  overflow-y: auto;
  background: #f3f3f3;

  .message-item {
    display: flex;
    gap: 12px;
    margin-bottom: 24px;

    &.user {
      flex-direction: row-reverse;

      .message-wrapper {
        align-items: flex-end;
      }

      .message-text {
        color: #000;
        background: #95ec69; // 微信用户气泡颜色

        &::after {
          right: -10px;
          left: auto;
          border-right-color: transparent;
          border-left-color: #95ec69;
        }
      }
    }

    &.assistant {
      .message-wrapper {
        align-items: flex-start;
      }

      .message-text {
        color: #000;
        background: #fff; // 微信AI/他人气泡颜色

        &::after {
          right: auto;
          left: -10px;
          border-right-color: #fff;
          border-left-color: transparent;
        }
      }
    }
  }

  .message-avatar {
    flex-shrink: 0;
    width: 40px;
    height: 40px;
    overflow: hidden;
    border-radius: 4px;

    img {
      width: 100%;
      height: 100%;
    }

    .ai-avatar-icon {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      color: #fff;
      background: #07c160;

      svg {
        width: 24px;
        height: 24px;
      }
    }
  }

  .message-wrapper {
    display: flex;
    flex-direction: column;
    max-width: calc(100% - 100px);
  }

  .message-content {
    position: relative;
  }

  .message-text {
    position: relative;
    padding: 10px 12px;
    font-size: 15px;
    line-height: 1.6;
    word-break: break-word;
    border-radius: 6px;
    box-shadow: 0 1px 2px rgb(0 0 0 / 5%);

    &::after {
      position: absolute;
      top: 14px;
      width: 0;
      height: 0;
      content: "";
      border: 5px solid transparent;
    }
  }

  .message-image {
    margin-bottom: 8px;

    :deep(.el-image) {
      max-width: 240px;
      border-radius: 6px;
      box-shadow: 0 2px 8px rgb(0 0 0 / 10%);
    }
  }

  .message-time {
    margin: 6px 0;
    font-size: 11px;
    color: #b2b2b2;
  }
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
  height: 20px;
  padding: 0 4px;

  span {
    width: 6px;
    height: 6px;
    background: #000;
    border-radius: 50%;
    opacity: 0.3;
    animation: typing 1.4s infinite ease-in-out both;

    &:nth-child(1) {
      animation-delay: -0.32s;
    }

    &:nth-child(2) {
      animation-delay: -0.16s;
    }

    &:nth-child(3) {
      animation-delay: -0.08s;
    }
  }
}

@keyframes typing {
  0%,
  80%,
  100% {
    opacity: 0.3;
    transform: scale(0.8);
  }

  40% {
    opacity: 0.7;
    transform: scale(1.2);
  }
}

.suggestions {
  padding: 12px 16px;
  background: #f3f3f3;

  .suggestions-list {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    justify-content: flex-start;
  }

  .suggestion-item {
    padding: 6px 12px;
    font-size: 13px;
    color: #576b95; // 微信链接色
    cursor: pointer;
    background: #fff;
    border: 1px solid #eee;
    border-radius: 16px;
    transition: all 0.2s;

    &:hover {
      background: #f5f5f5;
      border-color: #ddd;
    }
  }
}

.input-area {
  display: flex;
  align-items: flex-end;
  gap: 12px;
  padding: 12px 16px 20px;
  background: #f7f7f7;
  border-top: 1px solid #e7e7e7;

  .input-tools {
    display: flex;
    align-items: center;
    justify-content: center;
    padding-bottom: 6px;
    color: #515151;
    cursor: pointer;

    &:hover {
      color: #07c160;
    }
  }

  .el-input {
    flex: 1;

    :deep(.el-textarea__inner) {
      padding: 8px 12px;
      font-size: 15px;
      line-height: normal;
      background: #fff;
      border: none;
      border-radius: 4px;

      &:focus {
        box-shadow: none;
      }
    }
  }

  .send-btn {
    padding: 0 16px;
    height: 36px;
    font-weight: 500;
    background: #07c160;
    border: none;

    &:hover {
      background: #06ae56;
    }

    &.is-disabled {
      color: #999;
      background: #e1e1e1;
    }
  }
}
</style>
