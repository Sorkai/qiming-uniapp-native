<template>
  <!-- 课程问答页面 -->
  <div
    v-show="visible"
    data-v-2cf49992=""
    class="course-qa-wrapper"
    :class="currentTheme"
  >
    <!-- 头部 -->
    <CourseHeader
      :current-theme="currentTheme"
      title="课程问答"
      :user-avatar="userAvatar"
      :user-nickname="userNickname"
      @go-back="$emit('go-back')"
      @toggle-theme="e => $emit('toggle-theme', e)"
      @go-to-account="$emit('go-to-account')"
      @logout="$emit('logout')"
    />

    <div class="course-qa-container" :class="currentTheme">
      <!-- 两列布局 -->
      <div class="qa-content-layout">
        <!-- 左侧区域 - 统计和历史 -->
        <div class="qa-content-left">
          <div class="left-scroll">
            <!-- 统计数据 -->
            <ul class="qa-data-ul">
              <li>
                <div class="qa-data-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>
                </div>
                <div class="qa-data-info">
                  <span class="text">累计提问</span>
                  <span class="num">{{ qaStats.totalQuestions || 0 }}</span>
                </div>
              </li>
              <li>
                <div class="qa-data-icon success">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </div>
                <div class="qa-data-info">
                  <span class="text">已解决</span>
                  <span class="num">{{ qaStats.solvedQuestions || 0 }}</span>
                </div>
              </li>
              <li>
                <div class="qa-data-icon warning">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 14l-5-5 1.41-1.41L12 14.17l7.59-7.59L21 8l-9 9z"/></svg>
                </div>
                <div class="qa-data-info">
                  <span class="text">解答率</span>
                  <span class="num">{{ qaStats.solveRate || "0%" }}</span>
                </div>
              </li>
              <li>
                <div class="qa-data-icon info">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
                </div>
                <div class="qa-data-info">
                  <span class="text">响应时间</span>
                  <span class="num">{{ qaStats.avgResponseTime || "0分钟" }}</span>
                </div>
              </li>
            </ul>

            <!-- 历史问答 -->
            <div class="qa-history-container">
              <h3 class="qa-section-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M6.5 2C4.01472 2 2 4.01472 2 6.5V17.5C2 19.9853 4.01472 22 6.5 22H17.5C19.9853 22 22 19.9853 22 17.5V6.5C22 4.01472 19.9853 2 17.5 2H6.5ZM6 7.5C6 7.22386 6.22386 7 6.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H6.5C6.22386 8 6 7.77614 6 7.5ZM6.5 11C6.22386 11 6 11.2239 6 11.5C6 11.7761 6.22386 12 6.5 12H17.5C17.7761 12 18 11.7761 18 11.5C18 11.2239 17.7761 11 17.5 11H6.5ZM6 15.5C6 15.2239 6.22386 15 6.5 15H13.5C13.7761 15 14 15.2239 14 15.5C14 15.7761 13.7761 16 13.5 16H6.5C6.22386 16 6 15.7761 6 15.5Z"
                    :fill="currentTheme === 'dark' ? '#fff' : '#CFD8F0'"
                  />
                </svg>
                历史问答
              </h3>

              <div
                v-if="qaHistoryList.length > 0"
                class="qa-history-list"
              >
                <div
                  v-for="(item, index) in qaHistoryList"
                  :key="index"
                  class="qa-history-item"
                  :class="{ active: selectedHistoryItem === index }"
                  @click="selectHistoryItem(index)"
                >
                  <div class="qa-history-title">{{ item.question }}</div>
                  <div class="qa-history-time">
                    {{ formatDate(item.timestamp) }}
                  </div>
                </div>
              </div>
              <div v-else class="qa-empty-history">
                <p>暂无历史问答</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 右侧区域 - 聊天 -->
        <div class="qa-content-right">
          <div class="qa-chat-container">
            <div class="qa-chat-header">
              <h3>课程问答</h3>
              <p>向教师提问，或使用AI智能解答</p>
            </div>

            <!-- 聊天区域 -->
            <div ref="chatBodyRef" class="qa-chat-body">
              <div
                v-if="chatMessages.length > 0"
                class="qa-chat-messages"
              >
                <div
                  v-for="(message, index) in chatMessages"
                  :key="index"
                  class="qa-message-item"
                  :class="message.role"
                >
                  <div class="qa-message-avatar">
                    <img
                      :src="
                        message.role === 'user'
                          ? userAvatar
                          : aiPeopleAvatar
                      "
                      alt="Avatar"
                    />
                  </div>
                  <div class="qa-message-content">
                    <div class="qa-message-name">
                      {{
                        message.role === "user"
                          ? userNickname
                          : "智能助手"
                      }}
                    </div>
                    <div
                      class="qa-message-text"
                      v-html="parseMarkdown(message.content)"
                    />
                    <div class="qa-message-time">
                      {{ formatMessageTime(message.timestamp) }}
                    </div>
                  </div>
                </div>
                <!-- 正在输入提示 -->
                <div v-if="isTyping" class="qa-typing-indicator">
                  <span />
                  <span />
                  <span />
                </div>
              </div>
              <div v-else class="qa-empty-chat">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="64"
                  height="64"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <path
                    fill-rule="evenodd"
                    clip-rule="evenodd"
                    d="M12 2C6.477 2 2 6.477 2 12c0 5.523 4.477 10 10 10 1.5 0 2.921-.33 4.21-.92l3.715 1.483a1 1 0 001.317-1.024l-.473-4.593A9.96 9.96 0 0022 12c0-5.523-4.477-10-10-10zm0 18a8 8 0 110-16 8 8 0 010 16z"
                    fill="#CFD8F0"
                  />
                  <circle cx="8" cy="10" r="1.5" fill="#CFD8F0" />
                  <circle cx="12" cy="10" r="1.5" fill="#CFD8F0" />
                  <circle cx="16" cy="10" r="1.5" fill="#CFD8F0" />
                </svg>
                <p>暂无对话，发送第一条消息开始聊天</p>
              </div>
            </div>

            <!-- 输入区域 -->
            <div class="qa-chat-footer">
              <div class="qa-input-wrapper">
                <textarea
                  v-model="currentMessage"
                  class="qa-input"
                  placeholder="输入您的问题..."
                  @keydown.enter.prevent="handleSend"
                ></textarea>
                <button
                  class="qa-send-button"
                  :disabled="!currentMessage.trim() || isTyping"
                  @click="handleSend"
                >
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from "vue";
import CourseHeader from "./CourseHeader.vue";
import aiPeopleAvatar from "@/assets/aipeople.jpg";
import SendIcon from "@/assets/course-icons/send-icon.svg?component";

// Props
const props = defineProps<{
  visible: boolean;
  currentTheme: string;
  userAvatar: string;
  userNickname: string;
  qaStats: {
    totalQuestions: number;
    solvedQuestions: number;
    solveRate: string;
    avgResponseTime: string;
  };
  qaHistoryList: any[];
  chatMessages: any[];
  isTyping: boolean;
}>();

// Emits
const emit = defineEmits<{
  (e: "go-back"): void;
  (e: "toggle-theme", event: MouseEvent): void;
  (e: "go-to-account"): void;
  (e: "logout"): void;
  (e: "send-message", content: string): void;
}>();

const chatBodyRef = ref<HTMLElement | null>(null);
const selectedHistoryItem = ref(-1);
const currentMessage = ref("");

const handleSend = () => {
  if (!currentMessage.value.trim() || props.isTyping) return;
  emit("send-message", currentMessage.value);
  currentMessage.value = "";
};

// 格式化日期
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

// 格式化消息时间
const formatMessageTime = (timestamp: string) => {
  if (!timestamp) return "";
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}`;
};

// 简单的Markdown解析函数
const parseMarkdown = (text: string) => {
  if (!text) return "";
  let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/\n/g, "<br>");
  return formatted;
};

// 滚动聊天窗口到底部
const scrollToBottomQA = () => {
  if (chatBodyRef.value) {
    chatBodyRef.value.scrollTop = chatBodyRef.value.scrollHeight;
  }
};

// 选择历史记录
const selectHistoryItem = (index: number) => {
  selectedHistoryItem.value = index;
  // 这里逻辑由主组件通过 Props 传入数据控制显示，暂不在此处直接修改 chatMessages
};

watch(
  () => props.chatMessages,
  () => {
    nextTick(() => {
      scrollToBottomQA();
    });
  },
  { deep: true }
);

watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      nextTick(() => {
        scrollToBottomQA();
      });
    }
  }
);
</script>

<style scoped>
/* 课程问答样式 */
.course-qa-wrapper {
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  padding-top: 80px;
  background-color: transparent; /* 背景透明，由父布局控制，防止“蒙一层” */
  box-sizing: border-box;
  position: relative;
}

.course-qa-wrapper.dark {
  background-color: transparent;
}

.course-qa-container {
  flex: 1;
  padding: 20px 20px 20px 10px;
  width: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.qa-content-layout {
  display: flex;
  flex: 1;
  gap: 20px;
  width: 100%;
  height: 100%;
}

.qa-content-left {
  width: 30%;
  min-width: 320px;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  border: 1px solid #eef2f7;
}

.dark .qa-content-left {
  background-color: #1a1a1a;
  border-color: #333;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

.left-scroll {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.qa-data-ul {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0;
  margin: 0 0 24px 0;
  list-style: none;
  width: 100%;
}

.qa-data-ul li {
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  height: 80px;
  border: 1px solid #eef2f7;
  transition: all 0.3s ease;
}

.dark .qa-data-ul li {
  background-color: #2a2a2a;
  border-color: #3a3a3a;
}

.qa-data-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background-color: rgba(64, 158, 255, 0.1);
  color: #409eff;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.qa-data-icon.success { background-color: rgba(103, 194, 58, 0.1); color: #67c23a; }
.qa-data-icon.warning { background-color: rgba(230, 162, 60, 0.1); color: #e6a23c; }
.qa-data-icon.info { background-color: rgba(144, 147, 153, 0.1); color: #909399; }

.qa-data-info { display: flex; flex-direction: column; justify-content: center; }
.qa-data-ul .text { font-size: 13px; color: #909399; margin-bottom: 4px; font-weight: 500; line-height: 1; }
.dark .qa-data-ul .text { color: #a0a0a0; }
.qa-data-ul .num { font-size: 20px; font-weight: 700; color: #2c3e50; line-height: 1; }
.dark .qa-data-ul .num { color: #ffffff; }

.qa-section-title { display: flex; align-items: center; gap: 10px; font-size: 16px; margin-bottom: 16px; color: #303133; font-weight: 700; }
.dark .qa-section-title { color: #ffffff; }

.qa-history-list { display: flex; flex-direction: column; gap: 10px; }
.qa-history-item { background-color: #ffffff; border-radius: 10px; padding: 14px; cursor: pointer; transition: all 0.3s ease; border: 1px solid #eef2f7; margin-bottom: 8px; }
.dark .qa-history-item { background-color: #2a2a2a; border-color: #3a3a3a; }
.qa-history-item:hover { background-color: #f5f9ff; border-color: #d0e5ff; transform: translateX(4px); }
.qa-history-item.active { background-color: #ecf5ff; border-color: #409eff; border-left: 4px solid #409eff; }
.qa-history-title { font-size: 14px; margin-bottom: 6px; color: #303133; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; font-weight: 600; }
.dark .qa-history-title { color: #e0e0e0; }
.qa-history-time { font-size: 12px; color: #909399; }

.qa-content-right {
  flex: 1;
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(64, 158, 255, 0.08);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid #eef2f7;
}

.dark .qa-content-right { background-color: #1a1a1a; border-color: #333; }

.qa-chat-header { padding: 16px 24px; border-bottom: 1px solid #f0f2f5; background-color: #fff; }
.dark .qa-chat-header { background-color: #1a1a1a; border-bottom: 1px solid #333; }
.qa-chat-header h3 { margin: 0 0 4px 0; font-size: 18px; color: #303133; font-weight: 700; }
.dark .qa-chat-header h3 { color: #ffffff; }
.qa-chat-header p { margin: 0; font-size: 13px; color: #909399; }

.qa-chat-body { flex: 1; padding: 24px; overflow-y: auto; background-color: #ffffff; display: flex; flex-direction: column; }
.dark .qa-chat-body { background-color: #16161a; }
.qa-chat-messages { display: flex; flex-direction: column; gap: 24px; }

.qa-message-item { display: flex; gap: 12px; max-width: 85%; }
.qa-message-item.ai { align-self: flex-start; }
.qa-message-item.user { align-self: flex-end; flex-direction: row-reverse; }

.qa-message-avatar { width: 36px; height: 36px; border-radius: 50%; overflow: hidden; flex-shrink: 0; border: 2px solid #fff; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1); }
.qa-message-avatar img { width: 100%; height: 100%; object-fit: cover; }

.qa-message-content { background-color: #fff; padding: 14px 18px; border-radius: 16px; border-top-left-radius: 4px; box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03); position: relative; }
.qa-message-item.user .qa-message-content { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: #fff; border-radius: 16px; border-top-right-radius: 4px; border-top-left-radius: 16px; }
.dark .qa-message-content { background-color: #2a2a2a; color: #e0e0e0; }

.qa-message-name { font-size: 12px; font-weight: 600; margin-bottom: 6px; color: #909399; }
.qa-message-item.user .qa-message-name { color: rgba(255, 255, 255, 0.8); text-align: right; }
.qa-message-text { font-size: 14px; line-height: 1.6; color: #303133; }
.dark .qa-message-text { color: #e0e0e0; }
.qa-message-item.user .qa-message-text { color: #fff; }
.qa-message-time { font-size: 11px; color: #c0c4cc; margin-top: 8px; }

.qa-typing-indicator { display: inline-flex; align-items: center; gap: 5px; padding: 10px 15px; background-color: #f0f0f0; border-radius: 20px; }
.dark .qa-typing-indicator { background-color: #444; }
.qa-typing-indicator span { display: block; width: 8px; height: 8px; background-color: #CFD8F0; border-radius: 50%; animation: typing 1.4s infinite both; }
.qa-typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
.qa-typing-indicator span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typing { 0% { transform: scale(1); opacity: 0.7; } 50% { transform: scale(1.5); opacity: 1; } 100% { transform: scale(1); opacity: 0.7; } }

.qa-chat-footer { padding: 20px 24px; background-color: #ffffff; border-top: 1px solid #f0f2f5; flex-shrink: 0; }
.dark .qa-chat-footer { background-color: #1a1a1a; border-top: 1px solid #333; }

.qa-input-wrapper {
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background-color: #ffffff;
  padding: 8px 12px;
  border-radius: 12px;
  border: 1px solid #eef2f7;
  transition: all 0.3s ease;
}

.dark .qa-input-wrapper {
  background-color: #2a2a2a;
  border-color: #3a3a3a;
}

.qa-input-wrapper:focus-within {
  border-color: #409eff;
  background-color: #ffffff;
  box-shadow: 0 0 0 3px rgba(64, 158, 255, 0.1);
}

.dark .qa-input-wrapper:focus-within {
  background-color: #2a2a2a;
}

.qa-input {
  flex: 1;
  border: none;
  background: none;
  resize: none;
  min-height: 40px;
  max-height: 120px;
  outline: none;
  font-size: 14px;
  line-height: 1.5;
  color: #303133;
  font-family: inherit;
  padding: 8px 0;
}

.dark .qa-input {
  color: #e0e0e0;
}

.qa-input::placeholder {
  color: #909399;
}

.qa-send-button {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.qa-send-button:hover:not(:disabled) {
  transform: scale(1.05);
  box-shadow: 0 4px 12px rgba(79, 172, 254, 0.4);
}

.qa-send-button:disabled {
  background: #e0e0e0;
  cursor: not-allowed;
}

.qa-closed-notice { text-align: center; padding: 16px; background-color: #fef0f0; color: #f56c6c; border-radius: 12px; font-size: 14px; display: flex; align-items: center; justify-content: center; gap: 10px; border: 1px solid #fde2e2; font-weight: 500; }
.dark .qa-closed-notice { background-color: rgba(245, 108, 108, 0.1); border-color: rgba(245, 108, 108, 0.2); }

/* 浅色模式颜色优化 */
:deep(.light .qa-data-ul .text) { color: #604ffd; }
:deep(.light .qa-section-title), :deep(.light .qa-chat-header h3), :deep(.light .qa-history-title) { color: #1a73e8; }
:deep(.light .qa-message-time), :deep(.light .qa-chat-header p) { color: #409eff; }
</style>
