<template>
  <div class="ai-helper-sections" :class="currentTheme">
    <!-- AI 助教入口框 -->
    <div
      class="out-ai-showbox-pro"
      style="
        position: fixed;
        top: 5.83333vw;
        right: 1vw !important;
        width: 25vw !important;
        height: 10.4167vw;
        z-index: 100;
      "
    >
      <div class="out-ai-pro-talk-box glow-border">
        <div class="inset-div">
          <div class="photo">
            <img :src="aiPeopleAvatar" alt="" />
          </div>
          <div class="ai-hepler-pro-box">
            <div class="people-name">AI助教</div>
            <div class="init-talk-cotent">Hi～我是您的AI助教</div>
          </div>
          <div class="ai-hepler-pro-input">
            <div class="el-input">
              <input
                type="text"
                autocomplete="off"
                placeholder="输入您的问题，与AI助教互动问答..."
                class="el-input__inner"
                style="padding-left: 10px; padding-right: 40px; font-size: 14px"
                @click="openAiDialog"
              />
            </div>
            <span class="mock-send-btn" @click="openAiDialog">
              <SendIcon />
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- AI 展开对话框 -->
    <transition name="ai-slide">
      <div
        v-if="isAiDialogVisible"
        ref="aiDialogRef"
        class="ai-draggable-dialog auto"
        style="
          width: 25vw !important;
          right: 1vw !important;
          top: calc(5.83333vw + 10.4167vw + 0.5vw) !important;
          height: 600px !important;
          z-index: 999;
          display: flex;
          flex-direction: column;
        "
      >
        <div class="ai-dialog-header-bar">
          <div class="header-left">
            <div class="header-back-btn spotlight-button" @click="closeAiDialog">
              <svg viewBox="0 0 24 24" width="18" height="18" stroke="#409eff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
            </div>
          </div>
          <div class="header-title-wrap">
            <span class="status-dot"></span>
            <span class="header-title">AI 智能助教</span>
          </div>
          <div class="header-right">
            <el-tooltip content="清空对话" placement="top">
              <div class="header-action-btn" @click="clearChat">
                <i class="el-icon-delete"></i>
              </div>
            </el-tooltip>
            <div class="header-action-btn close-btn" @click="closeAiDialog">
              <i class="el-icon-close"></i>
            </div>
          </div>
        </div>

        <div class="ai-fill-bg" style="flex: 1; overflow: hidden; display: flex; flex-direction: column; border: none !important; background: transparent !important;">
          <div class="dialog-content" style="flex: 1; overflow: hidden;">
            <div class="ai-talk-box">
              <el-scrollbar ref="scrollbarRef" style="height: 100%; box-sizing: border-box">
                <div class="header-tips-box">
                  <div class="robbot-icon">
                    <img :src="aiPeopleAvatar" alt="" style="transform: scaleX(-1)" />
                  </div>
                  <div class="code-icon">
                    <img src="@/assets/course-detail-images/course-detail-icon2.png" alt="" />
                  </div>
                  <p class="code-hello">Hi～我是您的AI助教</p>
                  <div class="ai-heler-header-tips">
                    课程学习中欢迎随时提问，我将全力为您答疑解惑，共同进步哦！
                  </div>
                </div>

                <transition-group name="chat-list" tag="div" class="chat-messages-list">
                  <div
                    v-for="(message, index) in chatMessages"
                    :key="index"
                    class="chat-message-item"
                    :class="message.role === 'user' ? 'user-message' : 'ai-message'"
                  >
                    <div class="ai-chat-share-container_nVXTe">
                      <div class="chat-common_3Wk2t margin-bottom-16">
                        <div :class="message.role === 'user' ? 'question-container_2GfLA' : 'answer-box-wrapper_1QYRS'">
                          <div :class="message.role === 'user' ? 'question-content_1e1fE' : 'answer-content-box_2Pu7S'">
                            <div v-if="message.role === 'user'">{{ message.content }}</div>
                            <div v-else class="markdown-content">
                              <p class="result" v-html="parseMarkdown(message.content)" />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="isTyping" key="typing">
                    <div class="ai-chat-share-container_nVXTe">
                      <div class="chat-common_3Wk2t margin-bottom-16">
                        <div class="answer-box-wrapper_1QYRS full-line_3ITtH chat-ans_1oSN6">
                          <div class="answer-content-box_2Pu7S chat-answer-content-box">
                            <div class="markdown-content">
                              <p class="result">
                                <span class="typing-dot">.</span>
                                <span class="typing-dot">.</span>
                                <span class="typing-dot">.</span>
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition-group>
              </el-scrollbar>
            </div>
            <div class="talk-input-box">
              <div class="input-box">
                <div class="ai-pro-content-edit-box">
                  <div class="input-fill-box-new">
                    <div class="el-textarea">
                      <textarea
                        v-model="currentMessage"
                        autocomplete="off"
                        placeholder="请输入您的问题"
                        maxlength="300"
                        class="el-textarea__inner"
                        :style="
                          currentMessage.trim()
                            ? 'min-height: 40px; line-height: 1.5; padding-right: 40px !important;'
                            : 'min-height: 40px; height: 40px; line-height: 40px; padding-top: 0 !important; padding-bottom: 0 !important; padding-right: 40px !important;'
                        "
                        @keydown.enter.prevent="sendMessage"
                      />
                    </div>
                  </div>
                  <div
                    class="add-new-talk"
                    :class="{ 'not-allowed': !currentMessage.trim() }"
                  >
                    <AddNewTalkIcon />
                  </div>
                </div>
                <div
                  :class="currentMessage.trim() && !sendingMessage ? 'send-btn' : 'not-send-btn'"
                  @click="sendMessage"
                >
                  <NotSendBtnIcon v-if="!currentMessage.trim() || sendingMessage" />
                  <SendIcon v-else />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, onMounted, onUnmounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import SendIcon from "@/assets/course-icons/send-icon.svg?component";
import AddNewTalkIcon from "@/assets/course-icons/add-new-talk-icon.svg?component";
import NotSendBtnIcon from "@/assets/course-icons/not-send-btn.svg?component";
import aiPeopleAvatar from "@/assets/aipeople.jpg";
import { courseAIChatStream, getConversationHistory } from "@/api/frontend/chat";

const props = defineProps<{
  courseId: number;
  currentTheme: string;
  chapterId: number | null;
}>();

const isAiDialogVisible = ref(false);
const aiDialogRef = ref(null);
const scrollbarRef = ref(null);
const chatMessages = ref<Array<{ role: string; content: string; timestamp: string }>>([]);
const currentMessage = ref("");
const sendingMessage = ref(false);
const isTyping = ref(false);
const conversationId = ref("");
const previousChapterId = ref<number | null>(null);
const cancelStreamRequest = ref<any>(null);

// 监听聊天记录变化，自动滚动到底部
watch(() => chatMessages.value, () => {
  nextTick(() => {
    scrollToBottom();
  });
}, { deep: true });

// 监听对话框显示，添加外部点击监听
watch(isAiDialogVisible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      document.addEventListener("click", handleClickOutside);
    });
  } else {
    document.removeEventListener("click", handleClickOutside);
  }
});

const scrollToBottom = () => {
  if (scrollbarRef.value) {
    const scrollEl = (scrollbarRef.value as any).$el.querySelector(".el-scrollbar__wrap");
    if (scrollEl) {
      scrollEl.scrollTop = scrollEl.scrollHeight;
    }
  }
};

const openAiDialog = () => {
  isAiDialogVisible.value = true;
};

const closeAiDialog = () => {
  isAiDialogVisible.value = false;
  if (cancelStreamRequest.value) {
    cancelStreamRequest.value();
    cancelStreamRequest.value = null;
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (!aiDialogRef.value) return;
  const target = event.target as HTMLElement;
  if (aiDialogRef.value && !(aiDialogRef.value as any).contains(target) && !target.closest(".out-ai-showbox-pro")) {
    closeAiDialog();
  }
};

const initChat = () => {
  const storedConversationId = localStorage.getItem(`chat_${props.courseId}`);
  if (storedConversationId) {
    conversationId.value = storedConversationId;
    loadChatHistory();
  } else {
    conversationId.value = Date.now().toString() + Math.random().toString(36).substring(2);
    localStorage.setItem(`chat_${props.courseId}`, conversationId.value);
    previousChapterId.value = props.chapterId;
  }
};

const loadChatHistory = async () => {
  try {
    const response = await getConversationHistory(conversationId.value);
    if (response && response.code === 200 && response.data && response.data.history) {
      chatMessages.value = response.data.history;
    }
  } catch (error) {
    console.error("加载聊天历史失败:", error);
  }
};

const sendMessage = async () => {
  if (!currentMessage.value.trim() || sendingMessage.value) return;

  const userMessage = currentMessage.value.trim();
  const currentChapterId = props.chapterId;

  if (currentChapterId !== null && previousChapterId.value !== null && currentChapterId !== previousChapterId.value) {
    conversationId.value = Date.now().toString() + Math.random().toString(36).substring(2);
    localStorage.setItem(`chat_${props.courseId}`, conversationId.value);
    chatMessages.value = [];
  }

  previousChapterId.value = currentChapterId;

  chatMessages.value.push({
    role: "user",
    content: userMessage,
    timestamp: new Date().toISOString()
  });

  currentMessage.value = "";
  sendingMessage.value = true;
  isTyping.value = true;

  try {
    let aiMessageAdded = false;
    let currentResponseIndex = -1;

    cancelStreamRequest.value = courseAIChatStream(
      {
        course_id: props.courseId,
        conversation_id: conversationId.value,
        message: userMessage,
        chapter_id: currentChapterId
      },
      (data) => {
        if (data.conversation_id) {
          conversationId.value = data.conversation_id;
          localStorage.setItem(`chat_${props.courseId}`, conversationId.value);
        }

        if (data.delta) {
          if (!aiMessageAdded) {
            isTyping.value = false;
            aiMessageAdded = true;
            currentResponseIndex = chatMessages.value.length;
            chatMessages.value.push({
              role: "ai",
              content: data.delta,
              timestamp: new Date().toISOString()
            });
          } else {
            chatMessages.value[currentResponseIndex].content += data.delta;
          }
        }

        if (data.finished) {
          sendingMessage.value = false;
          isTyping.value = false;
        }
      }
    );
  } catch (error) {
    console.error("发送消息失败:", error);
    ElMessage.error("发送失败，请重试");
    chatMessages.value.push({
      role: "ai",
      content: "抱歉，发生了错误，请稍后重试。",
      timestamp: new Date().toISOString()
    });
    sendingMessage.value = false;
    isTyping.value = false;
  }
};

const parseMarkdown = (text: string) => {
  if (!text) return "";
  return text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/
/g, "<br>");
};

const clearChat = () => {
  ElMessageBox.confirm("确定要清空所有聊天记录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  }).then(() => {
    chatMessages.value = [];
    ElMessage.success("聊天记录已清空");
  }).catch(() => {});
};

onMounted(() => {
  initChat();
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});

defineExpose({
  isAiDialogVisible,
  openAiDialog,
  closeAiDialog,
  handleExternalSend: (content: string) => {
    currentMessage.value = content;
    sendMessage();
  }
});
</script>

<style scoped>
/* 包含必要的 AI 相关样式 */
.ai-helper-sections {
  position: relative;
}

.out-ai-pro-talk-box {
  position: relative;
  overflow: hidden;
  transition: all 0.3s ease;
  border-radius: 12px !important;
  background: rgba(255, 255, 255, 0.05);
}

.out-ai-pro-talk-box::after {
  content: "";
  position: absolute;
  inset: 0;
  border-radius: inherit;
  padding: 1.5px;
  background: linear-gradient(90deg, #409eff, #604ffd, #409eff);
  background-size: 200% 100%;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  animation: ai-border-marquee 3s linear infinite;
  pointer-events: none;
}

@keyframes ai-border-marquee {
  0% { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}

.ai-draggable-dialog {
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(25px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  background: rgba(255, 255, 255, 0.6) !important;
  border-radius: 20px !important;
}

.dark .ai-draggable-dialog {
  background: rgba(30, 30, 30, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.ai-dialog-header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.header-back-btn {
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.9) !important;
  border: 1px solid rgba(64, 158, 255, 0.2);
  position: absolute;
  left: -45px;
  top: 50%;
  transform: translateY(-50%);
  box-shadow: -4px 4px 12px rgba(0, 0, 0, 0.1);
}

.ai-slide-enter-active, .ai-slide-leave-active {
  transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.ai-slide-enter-from, .ai-slide-leave-to {
  transform: translateX(100%) scale(0.9);
  opacity: 0;
}

.typing-dot {
  display: inline-block;
  animation: dot-pulse 1.5s infinite;
  margin: 0 2px;
  color: #409eff;
  font-weight: bold;
}
@keyframes dot-pulse {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.3); }
}

.markdown-content {
  font-size: 14px;
  line-height: 1.6;
}

.question-content_1e1fE {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  color: white !important;
  border-radius: 18px 18px 2px 18px !important;
  padding: 12px 16px;
}

.answer-content-box_2Pu7S {
  background: #f4f7f9 !important;
  border-radius: 18px 18px 18px 2px !important;
  border: 1px solid #eef2f5 !important;
  padding: 12px 16px;
}

.dark .answer-content-box_2Pu7S {
  background: #2c2c2c !important;
  border-color: #444 !important;
  color: #e0e0e0;
}
</style>
