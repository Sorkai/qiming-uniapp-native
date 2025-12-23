<template>
  <div
    v-show="visible"
    class="course-study-root"
    :class="currentTheme"
  >
    <CourseHeader
      :current-theme="currentTheme"
      title="章节模式"
      :user-avatar="userAvatar"
      :user-nickname="userNickname"
      @go-back="$emit('go-back')"
      @toggle-theme="e => $emit('toggle-theme', e)"
      @go-to-account="$emit('go-to-account')"
      @logout="$emit('logout')"
    />

    <div class="study-container" :class="currentTheme">
      <div class="main-layout">
        <div class="left-main">
          <div class="video-section">
            <div class="video-info-bar">
              <div class="video-meta">
                <span class="lesson-badge">{{ activeNode }}</span>
                <h2 class="lesson-title">{{ currentHour?.title || "加载中..." }}</h2>
              </div>
              <div class="video-actions">
                <button class="action-btn" title="收藏">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
                  </svg>
                </button>
                <button class="action-btn" title="分享">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="18" cy="5" r="3"></circle>
                    <circle cx="6" cy="12" r="3"></circle>
                    <circle cx="18" cy="19" r="3"></circle>
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                  </svg>
                </button></div>
            </div>
            <div class="video-player-wrapper">
              <video
                v-if="currentVideoUrl"
                ref="videoPlayerRef"
                controls
                class="video-player"
                :src="currentVideoUrl"
                @loadeddata="$emit('video-loaded')"
                @ended="$emit('video-ended')"
              />
              <div v-else class="video-placeholder">
                <div class="placeholder-content">
                  <div class="placeholder-icon">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.5">
                      <polygon points="5 3 19 12 5 21 5 3"></polygon>
                    </svg>
                  </div>
                  <span>{{ loading ? "视频加载中..." : "暂无视频内容" }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="content-grid">
            <div class="knowledge-card glass-card">
              <div class="card-header">
                <div class="header-icon knowledge-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                </div>
                <h3 class="card-title">知识点描述</h3>
              </div>
              <div class="card-body">
                <div class="knowledge-content" v-html="courseContentHtml"></div>
              </div>
            </div>

            <div class="summary-card glass-card">
              <div class="card-header">
                <div class="header-icon summary-icon">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                  </svg>
                </div>
                <h3 class="card-title">AI 视频纪要</h3>
                <span class="ai-badge">AI 生成</span>
              </div>
              <div class="card-body">
                <ul class="summary-list">
                  <li v-for="(item, index) in mockSummary" :key="index" class="summary-item">
                    <span class="item-number">{{ index + 1 }}</span>
                    <span class="item-text">{{ item }}</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="right-sidebar">
          <div class="ai-assistant-widget" @click="$emit('open-ai')">
            <div class="ai-glow"></div>
            <div class="ai-content">
              <div class="ai-avatar">
                <img :src="aiPeopleAvatar" alt="AI" />
                <div class="pulse-ring"></div>
              </div>
              <div class="ai-info">
                <span class="ai-title">AI 智能助教</span>
                <span class="ai-status">
                  <span class="status-dot"></span>
                  在线 · 随时为您解答
                </span>
              </div>
              <div class="ai-arrow">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </div>
            </div>
          </div>

          <div class="chapter-catalog glass-card">
            <div class="catalog-header">
              <h3 class="catalog-title">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="8" y1="6" x2="21" y2="6"></line>
                  <line x1="8" y1="12" x2="21" y2="12"></line>
                  <line x1="8" y1="18" x2="21" y2="18"></line>
                  <line x1="3" y1="6" x2="3.01" y2="6"></line>
                  <line x1="3" y1="12" x2="3.01" y2="12"></line>
                  <line x1="3" y1="18" x2="3.01" y2="18"></line>
                </svg>
                章节目录
              </h3>
              <span class="chapter-count">{{ getTotalLessons() }} 课时</span>
            </div>
            <div class="catalog-body">
              <el-scrollbar>
                <div class="chapter-tree">
                  <div
                    v-for="(chapter, cIndex) in chapterList"
                    :key="chapter.chapterId"
                    class="chapter-node"
                  >
                    <div class="chapter-title-row">
                      <div class="chapter-indicator"></div>
                      <span class="chapter-label">第{{ Number(cIndex) + 1 }}章</span>
                      <span class="chapter-name">{{ chapter.name }}</span>
                    </div>
                    <div class="lessons-container">
                      <div
                        v-for="(hour, hIndex) in chapter.hourList"
                        :key="hour.hourId"
                        class="lesson-node"
                        :class="{
                          active: activeNode === `${Number(cIndex) + 1}.${Number(hIndex) + 1}`,
                          completed: hour.finished ===1
                        }"
                        @click="$emit('node-click', `${Number(cIndex) + 1}.${Number(hIndex) + 1}`, hour)"
                      >
                        <div class="lesson-left">
                          <div class="lesson-icon">
                            <svg v-if="hour.finished === 1" viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                            </svg>
                            <svg v-else viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                              <polygon points="5 3 19 12 5 21 5 3"></polygon>
                            </svg>
                          </div>
                          <div class="lesson-info">
                            <span class="lesson-num">{{ Number(cIndex) + 1 }}.{{ Number(hIndex) + 1 }}</span>
                            <span class="lesson-name">{{ hour.title }}</span>
                          </div>
                        </div>
                        <div class="lesson-right">
                          <div v-if="activeNode === `${Number(cIndex) + 1}.${Number(hIndex) + 1}`" class="playing-indicator">
                            <span></span><span></span><span></span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </el-scrollbar>
            </div>
          </div>
        </div>
      </div>
    </div>

    <transition name="ai-dialog">
      <div v-if="isAiDialogVisible" class="ai-dialog-overlay" @click.self="$emit('close-ai')">
        <div class="ai-dialog">
          <div class="dialog-header">
            <div class="header-left">
              <div class="ai-dialog-avatar">
                <img :src="aiPeopleAvatar" alt="AI" />
              </div>
              <div class="header-info">
                <span class="header-title">AI 智能助教</span>
                <span class="header-status">
                  <span class="online-indicator"></span>
                  在线
                </span>
              </div>
            </div>
            <div class="header-actions">
              <button class="header-btn" @click="$emit('clear-chat')" title="清空对话">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                </svg>
              </button>
              <button class="header-btn close-btn" @click="$emit('close-ai')">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <div class="dialog-body">
            <el-scrollbar ref="chatScrollRef">
              <div class="chat-container">
                <div class="welcome-section">
                  <div class="welcome-avatar">
                    <img :src="aiPeopleAvatar" alt="" />
                  </div>
                  <h3>Hi～我是您的 AI 助教</h3>
                  <p>课程学习中欢迎随时提问，我将全力为您答疑解惑！</p>
                  <div class="quick-questions">
                    <button class="quick-btn" @click="handleQuickQuestion('这节课的重点是什么？')">这节课的重点是什么？</button>
                    <button class="quick-btn" @click="handleQuickQuestion('帮我总结一下知识点')">帮我总结一下知识点</button>
                  </div>
                </div>

                <div class="messages-list">
                  <div
                    v-for="(message, index) in chatMessages"
                    :key="index"
                    class="message-row"
                    :class="message.role"
                  >
                    <div class="message-content">
                      <div v-if="message.role === 'user'" class="message-text">{{ message.content }}</div>
                      <div v-else class="message-text ai-text" v-html="parseMarkdown(message.content)"></div>
                    </div></div>
                  <div v-if="isTyping" class="message-row ai">
                    <div class="message-content">
                      <div class="typing-indicator">
                        <span></span><span></span><span></span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </el-scrollbar>
          </div>

          <div class="dialog-footer">
            <div class="input-wrapper">
              <el-input
                v-model="internalMsg"
                type="textarea"
                :autosize="{ minRows: 1, maxRows: 4}"
                placeholder="输入您的问题..."
                @keydown.enter.exact.prevent="handleSend"
              />
              <button
                class="send-button"
                :class="{ active: internalMsg.trim() && !sendingMessage }"
                :disabled="!internalMsg.trim() || sendingMessage"
                @click="handleSend"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import CourseHeader from "./CourseHeader.vue";
import aiPeopleAvatar from "@/assets/aipeople.jpg";

const props = defineProps<{
  visible: boolean;
  currentTheme: string;
  userAvatar: string;
  userNickname: string;
  courseName: string;
  currentHour: any;
  currentVideoUrl: string;
  loading: boolean;
  courseContentHtml: string;
  isAiDialogVisible: boolean;
  chatMessages: any[];
  isTyping: boolean;
  sendingMessage: boolean;
  chapterList: any[];
  activeNode: string;
}>();

const emit = defineEmits([
  "go-back",
  "toggle-theme",
  "go-to-account",
  "logout",
  "video-loaded",
  "video-ended",
  "open-ai",
  "close-ai",
  "clear-chat",
  "send-message",
  "node-click"
]);

const internalMsg = ref("");
const videoPlayerRef = ref(null);

const mockSummary = [
  "本节课主要介绍了课程的整体目标和学习路径。",
  "详细讲解了基础环境的搭建过程及注意事项。",
  "演示了核心功能模块的实现逻辑。",
  "总结了学习过程中常见的难点与解决方案。"
];

const getTotalLessons = () => {
  if (!props.chapterList) return 0;
  return props.chapterList.reduce((total: number, chapter: any) => {
    return total + (chapter.hourList?.length || 0);
  }, 0);
};

const handleSend = () => {
  if (internalMsg.value.trim() && !props.sendingMessage) {
    emit("send-message", internalMsg.value);}
};

const handleQuickQuestion = (question: string) => {
  internalMsg.value = question;
  handleSend();
};

watch(
  () => props.sendingMessage,
  (newVal) => {
    if (!newVal) internalMsg.value = "";
  }
);

const parseMarkdown = (text: string) => {
  if (!text) return "";
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
};

defineExpose({
  videoPlayer: videoPlayerRef
});
</script>

<style scoped lang="scss">
$primary: #6366f1;
$primary-light: #818cf8;
$primary-dark: #4f46e5;
$accent: #f43f5e;
$success: #10b981;
$warning: #f59e0b;

$gray-50: #f8fafc;
$gray-100: #f1f5f9;
$gray-200: #e2e8f0;
$gray-300: #cbd5e1;
$gray-400: #94a3b8;
$gray-500: #64748b;
$gray-600: #475569;
$gray-700: #334155;
$gray-800: #1e293b;
$gray-900: #0f172a;

$radius-sm: 8px;
$radius-md: 12px;
$radius-lg: 16px;
$radius-xl: 24px;

$shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
$shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
$shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
$shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

.course-study-root {
  width: 100%;
  height: 100%;
  background: transparent;
  overflow-y: auto; /* 关键：允许纵向滚动 */
  overflow-x: hidden;

  &.dark {
    background: transparent;
  }
}

.study-container {
  padding: 88px 32px 100px; /* 增加底部留白 */
  box-sizing: border-box;
  min-height: min-content;
}

.main-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start; /* 防止子项被拉伸 */
}

.left-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

.video-section {
  background: #000;
  border-radius: $radius-xl;
  overflow: hidden;
  box-shadow: $shadow-xl;
}

.video-player-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;

  .video-player {
    width: 100%;
    height: 100%;
    display: block;
  }

  .video-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, $gray-800 0%, $gray-900 100%);

    .placeholder-content {
      text-align: center;
      color: $gray-400;

      .placeholder-icon {
        margin-bottom: 16px;opacity: 0.5;
      }

      span {
        font-size: 15px;
        font-weight: 500;
      }
    }
  }
}

.video-info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  background: linear-gradient(135deg, $gray-800 0%, $gray-900 100%);

  .video-meta {
    display: flex;
    align-items: center;
    gap: 16px;

    .lesson-badge {
      background: $primary;
      color: #fff;
      padding: 6px 14px;
      border-radius: 20px;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    .lesson-title {
      font-size: 18px;
      font-weight: 600;
      color: #fff;
      margin: 0;
    }
  }

  .video-actions {
    display: flex;
    gap: 8px;

    .action-btn {
      width: 40px;
      height: 40px;
      border: none;
      background: rgba(255, 255, 255, 0.1);
      border-radius: $radius-md;
      color: $gray-300;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(255, 255, 255, 0.2);
        color: #fff;
      }
    }
  }
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px; /* 增加底部间距 */
}

.glass-card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.5);
  border-radius: $radius-xl;
  box-shadow: $shadow-lg;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: all 0.3s ease;
  min-height: 300px; /* 改为最小高度，让卡片随内容撑开 */

  &:hover {
    box-shadow: $shadow-xl;transform: translateY(-2px);
  }

  .dark & {
    background: rgba(40, 40, 40, 0.8);
    border-color: rgba(255, 255, 255, 0.1);
  }
}

.card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  .dark & {
    border-bottom-color: rgba(255, 255, 255, 0.05);
  }

  .header-icon {
    width: 40px;
    height: 40px;
    border-radius: $radius-md;
    display: flex;
    align-items: center;
    justify-content: center;

    &.knowledge-icon {
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
      color: $primary;

      .dark & {
        background: linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(99, 102, 241, 0.1) 100%);
      }
    }

    &.summary-icon {
      background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);
      color: $accent;

      .dark & {
        background: linear-gradient(135deg, rgba(244, 63, 94, 0.2) 0%, rgba(244, 63, 94, 0.1) 100%);
      }
    }
  }

  .card-title {
    font-size: 16px;
    font-weight: 700;
    color: $gray-800;
    margin: 0;flex: 1;

    .dark & {
      color: #fff;
    }
  }

  .ai-badge {
    font-size: 11px;
    font-weight: 600;
    color: $accent;
    background: rgba(244, 63, 94, 0.1);
    padding: 4px 10px;
    border-radius:20px;
  }
}

.card-body {
  flex: 1;
  padding: 20px 24px;
}

.knowledge-content {
  font-size: 14px;
  line-height: 1.8;
  color: $gray-600;

  .dark & {
    color: $gray-300;
  }
}

.summary-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.summary-item {
  display: flex;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  .dark & {
    border-bottom-color: rgba(255, 255, 255, 0.05);
  }

  &:last-child {
    border-bottom: none;
  }

  .item-number {
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    color: #fff;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    flex-shrink: 0;}

  .item-text {
    font-size: 14px;
    line-height: 1.6;
    color: $gray-600;

    .dark & {
      color: $gray-300;
    }
  }
}

.right-sidebar {
  width: 380px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex-shrink: 0;
  position: sticky;
  top: 88px; /* 对应 Header 高度 */
  height: fit-content;
}

.ai-assistant-widget {
  position: relative;
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
  border-radius: $radius-xl;
  padding: 24px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 20px 40px -10px rgba(99, 102, 241, 0.4);

    .ai-arrow {
      transform: translateX(4px);
    }

    .pulse-ring {
      animation: pulse 1s ease-out infinite;
    }
  }

  .ai-glow {
    position: absolute;
    top: -50%;
    right: -50%;
    width: 100%;
    height: 100%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.2) 0%, transparent 70%);
    pointer-events: none;
  }

  .ai-content {
    position: relative;
    display: flex;
    align-items: center;
    gap: 16px;
    z-index: 1;
  }

  .ai-avatar {
    position: relative;
    width: 56px;
    height: 56px;

    img {
      width: 100%;
      height: 100%;
      border-radius: 16px;
      object-fit: cover;
      border: 2px solid rgba(255, 255, 255, 0.3);
    }

    .pulse-ring {
      position: absolute;
      inset: -4px;
      border: 2px solid rgba(255, 255, 255, 0.5);
      border-radius: 20px;
      opacity: 0;
    }
  }

  .ai-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;

    .ai-title {
      font-size: 16px;
      font-weight: 700;
      color: #fff;
    }

    .ai-status {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 13px;
      color: rgba(255, 255, 255, 0.8);

      .status-dot {
        width: 8px;
        height: 8px;
        background: #10b981;
        border-radius: 50%;
        animation: blink 2s ease-in-out infinite;
      }
    }
  }

  .ai-arrow {
    color: rgba(255, 255, 255, 0.8);
    transition: transform 0.3s ease;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.3);
    opacity: 0;
  }
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.chapter-catalog {
  flex: 1;
  min-height: 0;

  .catalog-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);

    .dark & {
      border-bottom-color: rgba(255, 255, 255, 0.05);
    }

    .catalog-title {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 16px;
      font-weight: 700;
      color: $gray-800;
      margin: 0;

      svg { color: $primary; }

      .dark & { color: #fff; }
    }

    .chapter-count {
      font-size: 13px;
      color: $gray-500;
      background: $gray-100;
      padding: 4px 12px;
      border-radius: 20px;

      .dark & {
        background: rgba(255, 255, 255, 0.1);
        color: $gray-400;
      }
    }
  }

  .catalog-body {
    flex: 1;
    padding: 16px;
    overflow: hidden;

    :deep(.el-scrollbar) { height: 100%; }}
}

.chapter-tree {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chapter-node {
  .chapter-title-row {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 16px;
    background: $gray-50;
    border-radius: $radius-md;
    margin-bottom: 8px;

    .dark & { background: rgba(255, 255, 255, 0.05); }

    .chapter-indicator {
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, $primary 0%, $primary-light 100%);
      border-radius: 2px;
    }

    .chapter-label {
      font-size: 12px;
      font-weight: 600;
      color: $primary;
      background: rgba(99, 102, 241, 0.1);
      padding: 2px 8px;
      border-radius: 4px;
    }

    .chapter-name {
      font-size: 14px;
      font-weight: 600;
      color: $gray-700;

      .dark & { color: $gray-200; }
    }
  }

  .lessons-container {
    display: flex;
    flex-direction: column;
    gap: 4px;
    padding-left: 16px;
  }
}

.lesson-node {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: $radius-md;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;

  &:hover {
    background: rgba(99, 102, 241, 0.05);
    border-color: rgba(99, 102, 241, 0.1);
  }

  &.active {
    background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0.05) 100%);
    border-color: rgba(99, 102, 241, 0.2);

    .lesson-icon { background: $primary; color: #fff; }
    .lesson-num { color: $primary; }
  }

  &.completed {
    .lesson-icon { background: $success; color: #fff; }}

  .lesson-left {
    display: flex;
    align-items: center;
    gap: 12px;
    flex: 1;min-width: 0;
  }

  .lesson-icon {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: $gray-100;
    color: $gray-500;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;transition: all 0.2s ease;

    .dark & { background: rgba(255, 255, 255, 0.1); color: $gray-400; }
  }

  .lesson-info {
    display: flex;
    flex-direction: column;
    gap: 2px;
    min-width: 0;

    .lesson-num {
      font-size: 11px;
      font-weight: 600;
      color: $gray-400;
    }

    .lesson-name {
      font-size: 13px;
      color: $gray-600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;

      .dark & { color: $gray-300; }
    }
  }

  .lesson-right { flex-shrink: 0; }
}

.playing-indicator {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 16px;

  span {
    width: 3px;
    background: $primary;
    border-radius: 2px;
    animation: playing 0.8s ease-in-out infinite;

    &:nth-child(1) { height: 8px; animation-delay: 0s; }
    &:nth-child(2) { height: 12px; animation-delay: 0.2s; }
    &:nth-child(3) { height: 6px; animation-delay: 0.4s; }
  }
}

@keyframes playing {
  0%, 100% { transform: scaleY(1); }
  50% { transform: scaleY(0.5); }
}

.ai-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 40px;
}

.ai-dialog {
  width: 100%;
  max-width: 560px;
  height: 80vh;
  max-height: 700px;
  background: #fff;
  border-radius: $radius-xl;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .dark & { background: $gray-800; }
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid $gray-100;

  .dark & { border-bottom-color: rgba(255, 255, 255, 0.1); }

  .header-left {
    display: flex;
    align-items: center;
    gap: 14px;

    .ai-dialog-avatar {
      width: 44px;
      height: 44px;

      img {
        width: 100%;
        height: 100%;
        border-radius: 12px;
        object-fit: cover;
      }
    }

    .header-info {
      display: flex;
      flex-direction: column;
      gap: 2px;

      .header-title {
        font-size: 16px;
        font-weight: 700;
        color: $gray-800;

        .dark & { color: #fff; }
      }

      .header-status {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: $gray-500;

        .online-indicator {
          width: 6px;
          height: 6px;
          background: $success;
          border-radius: 50%;
        }
      }
    }
  }

  .header-actions {
    display: flex;
    gap: 8px;

    .header-btn {
      width: 36px;
      height: 36px;
      border: none;
      background: $gray-100;
      border-radius: $radius-sm;
      color: $gray-500;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;

      &:hover { background: $gray-200; color: $gray-700; }&.close-btn:hover { background: rgba(244, 63, 94, 0.1); color: $accent; }

      .dark & {
        background: rgba(255, 255, 255, 0.1);
        color: $gray-400;

        &:hover { background: rgba(255, 255, 255, 0.15); color: #fff; }
      }
    }
  }
}

.dialog-body {
  flex: 1;
  overflow: hidden;

  :deep(.el-scrollbar) { height: 100%; }

  .chat-container { padding: 24px; }
}

.welcome-section {
  text-align: center;
  padding: 32px 24px;

  .welcome-avatar {
    width: 72px;
    height: 72px;
    margin: 0 auto 16px;

    img {
      width: 100%;
      height: 100%;
      border-radius: 20px;
      object-fit: cover;
    }
  }

  h3 {
    font-size: 18px;
    font-weight: 700;
    color: $gray-800;
    margin: 0 0 8px;

    .dark & { color: #fff; }
  }

  p {
    font-size: 14px;
    color: $gray-500;
    margin: 0 0 24px;
  }

  .quick-questions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;

    .quick-btn {
      padding: 10px 18px;
      background: $gray-50;
      border: 1px solid $gray-200;
      border-radius: 20px;
      font-size: 13px;
      color: $gray-600;
      cursor: pointer;
      transition: all 0.2s ease;

      &:hover {
        background: rgba(99, 102, 241, 0.1);
        border-color: $primary;
        color: $primary;
      }

      .dark & {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.1);
        color: $gray-300;

        &:hover {
          background: rgba(99, 102, 241, 0.2);
          border-color: $primary;
          color: $primary-light;
        }
      }
    }
  }
}

.messages-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.message-row {
  display: flex;

  &.user {
    justify-content: flex-end;

    .message-content {
      background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
      color: #fff;
      border-radius: $radius-lg $radius-lg 4px $radius-lg;
    }
  }

  &.ai {
    justify-content: flex-start;

    .message-content {
      background: $gray-100;
      color: $gray-700;
      border-radius: $radius-lg $radius-lg $radius-lg 4px;

      .dark & { background: rgba(255, 255, 255, 0.1); color: $gray-200; }
    }
  }

  .message-content {
    max-width: 80%;
    padding: 14px 18px;

    .message-text {
      font-size: 14px;
      line-height: 1.6;

      &.ai-text {
        :deep(strong) { font-weight: 600; color: $primary; }
      }
    }
  }
}

.typing-indicator {
  display: flex;
  gap: 4px;
  padding: 4px 0;

  span {
    width: 8px;
    height: 8px;
    background: $gray-400;
    border-radius: 50%;
    animation: typing 1.4s ease-in-out infinite;

    &:nth-child(2) { animation-delay: 0.2s; }
    &:nth-child(3) { animation-delay: 0.4s; }
  }
}

@keyframes typing {
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
}

.dialog-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid $gray-100;

  .dark & { border-top-color: rgba(255, 255, 255, 0.1); }

  .input-wrapper {
    display: flex;
    align-items: flex-end;
    gap: 12px;
    background: $gray-50;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
    padding: 12px 16px;
    transition: all 0.2s ease;

    &:focus-within {
      border-color: $primary;
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
    }

    .dark & {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.1);
    }

    :deep(.el-textarea) {
      flex: 1;

      .el-textarea__inner {
        background: transparent;
        border: none;
        box-shadow: none;
        padding: 0;
        font-size: 14px;
        resize: none;

        &::placeholder { color: $gray-400; }
      }
    }

    .send-button {
      width: 40px;
      height: 40px;
      border: none;
      background: $gray-200;
      border-radius: $radius-md;
      color: $gray-400;
      cursor: not-allowed;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      flex-shrink: 0;

      &.active {
        background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
        color: #fff;
        cursor: pointer;

        &:hover {
          transform: scale(1.05);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        }
      }

      .dark & {
        background: rgba(255, 255, 255, 0.1);

        &.active {
          background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
        }
      }
    }
  }
}

.ai-dialog-enter-active,
.ai-dialog-leave-active {
  transition: all 0.3s ease;

  .ai-dialog {
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }
}

.ai-dialog-enter-from,
.ai-dialog-leave-to {
  opacity: 0;

  .ai-dialog {
    transform: scale(0.9) translateY(20px);
    opacity: 0;
  }
}
</style>
