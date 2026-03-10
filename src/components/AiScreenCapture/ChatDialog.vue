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

// 监听消息变化，自动滚动（length 变化 + 流式内容追加均触发）
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
    width="520px"
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

    <div class="chat-main">
      <!-- 智能预览 -->
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

      <!-- 消息列表 -->
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
            <div class="bubble">
              <template v-if="msg.loading">
                <div class="typing">
                  <span />
                  <span />
                  <span />
                </div>
              </template>
              <template v-else>
                {{ msg.content }}
              </template>
            </div>
            <div class="meta">{{ formatTime(msg.timestamp) }}</div>
          </div>
        </div>
      </div>

      <!-- 建议词 -->
      <div v-if="suggestions?.length" class="suggestions-bar">
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

    <template #footer>
      <div class="footer-input">
        <div class="input-container">
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
              type="primary"
              circle
              :loading="loading"
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
          </div>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<!-- 非 scoped：dialog 使用 append-to-body 传送到 body，scoped 样式无法到达 -->
<style lang="scss">
.ai-chat-dialog.modern-style {
  --ai-primary: var(--el-color-primary);
  --ai-primary-strong: var(--el-color-primary-dark-2);
  --ai-primary-mid: var(--el-color-primary-light-3);
  --ai-primary-soft: var(--el-color-primary-light-9);
  --ai-primary-soft-border: var(--el-color-primary-light-7);

  .el-dialog {
    display: flex;
    flex-direction: column;
    height: 650px;
    padding: 0;
    overflow: hidden;
    background-color: var(--el-bg-color-page);
    border: 1px solid var(--ai-primary-soft-border);
    border-radius: 32px;
    box-shadow: 0 18px 44px rgb(0 0 0 / 16%);
  }

  .el-dialog__header {
    padding: 0;
    margin: 0;
    border-top-left-radius: 32px;
    border-top-right-radius: 32px;
    overflow: hidden;
  }

  .el-dialog__body {
    flex: 1;
    padding: 0;
    overflow: hidden;
  }

  .el-dialog__footer {
    padding: 0;
    border-bottom-left-radius: 32px;
    border-bottom-right-radius: 32px;
    overflow: hidden;
    background: var(--el-bg-color);
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

.chat-main {
  display: flex;
  flex-direction: column;
  height: 100%;
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
      display: flex !important; // 确保头像容器显示
      align-items: center;
      justify-content: center;
      width: 40px; // 增大头像尺寸
      height: 40px;
      border-radius: 12px;

      svg {
        width: 24px;
        height: 24px;
        display: block; // 确保svg显示
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
    }

    .content-image {
      margin-bottom: 8px;

      :deep(.el-image) {
        max-width: 280px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgb(0 0 0 / 10%);
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
</style>
