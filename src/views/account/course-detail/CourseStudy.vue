<template>
  <div v-show="visible" class="course-study-root" :class="currentTheme">
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
                <h2 class="lesson-title">
                  {{ currentHour?.title || "加载中..." }}
                </h2>
              </div>
              <div class="video-actions">
                <button class="action-btn" title="收藏">
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"
                    />
                  </svg>
                </button>
                <button class="action-btn" title="分享">
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                </button>
              </div>
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
                    <svg
                      viewBox="0 0 24 24"
                      width="48"
                      height="48"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="1.5"
                    >
                      <polygon points="5 3 19 12 5 21 5 3" />
                    </svg>
                  </div>
                  <span>{{ loading ? "视频加载中..." : "暂无视频内容" }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="content-grid">
            <div ref="knowledgeCardRef" class="knowledge-card glass-card">
              <div class="card-header">
                <div class="header-icon knowledge-icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <h3 class="card-title">知识点描述</h3>
              </div>
              <div class="card-body">
                <el-scrollbar>
                  <div
                    ref="knowledgeContentRef"
                    class="knowledge-content"
                    v-html="courseContentHtml"
                  />
                </el-scrollbar>
              </div>
            </div>

            <div ref="summaryCardRef" class="summary-card glass-card">
              <div class="card-header">
                <div class="header-icon summary-icon">
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path
                      d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
                    />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <h3 class="card-title">AI 视频纪要</h3>
                <span class="ai-badge">AI 生成</span>
              </div>
              <div class="card-body">
                <el-scrollbar>
                  <ul ref="summaryContentRef" class="summary-list">
                    <li
                      v-for="(item, index) in mockSummary"
                      :key="index"
                      class="summary-item"
                    >
                      <span class="item-number">{{ index + 1 }}</span>
                      <span class="item-text">{{ item }}</span>
                    </li>
                  </ul>
                </el-scrollbar>
              </div>
            </div>
          </div>
        </div>

        <div class="right-sidebar">
          <div class="ai-assistant-widget" @click="$emit('open-ai')">
            <div class="ai-glow" />
            <div class="ai-content">
              <div class="ai-avatar">
                <img :src="aiPeopleAvatar" alt="AI" />
                <div class="pulse-ring" />
              </div>
              <div class="ai-info">
                <span class="ai-title">AI 智能助教</span>
                <span class="ai-status">
                  <span class="status-dot" />
                  在线 · 随时为您解答
                </span>
              </div>
              <div class="ai-arrow">
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>

          <div class="chapter-catalog glass-card">
            <div class="catalog-header">
              <h3 class="catalog-title">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
                章节目录
              </h3>
              <span class="chapter-count">{{ getTotalLessons() }} 课时</span>
            </div>
            <div class="catalog-body">
              <el-scrollbar ref="catalogScrollRef">
                <div class="chapter-tree">
                  <div
                    v-for="(chapter, cIndex) in chapterList"
                    :key="chapter.chapterId"
                    class="chapter-node"
                  >
                    <div class="chapter-title-row">
                      <div class="chapter-indicator" />
                      <span class="chapter-label"
                        >第{{ Number(cIndex) + 1 }}章</span
                      >
                      <span class="chapter-name">{{ chapter.name }}</span>
                    </div>
                    <div class="lessons-container">
                      <div
                        v-for="(hour, hIndex) in chapter.hourList"
                        :key="hour.hourId"
                        class="lesson-node"
                        :class="{
                          active:
                            activeNode ===
                            `${Number(cIndex) + 1}.${Number(hIndex) + 1}`,
                          completed: hour.finished === 1
                        }"
                        @click="
                          $emit(
                            'node-click',
                            `${Number(cIndex) + 1}.${Number(hIndex) + 1}`,
                            hour
                          )
                        "
                      >
                        <div class="lesson-left">
                          <div class="lesson-icon">
                            <svg
                              v-if="hour.finished === 1"
                              viewBox="0 0 24 24"
                              width="14"
                              height="14"
                              fill="currentColor"
                            >
                              <path
                                d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"
                              />
                            </svg>
                            <svg
                              v-else
                              viewBox="0 0 24 24"
                              width="14"
                              height="14"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                            >
                              <polygon points="5 3 19 12 5 21 5 3" />
                            </svg>
                          </div>
                          <div class="lesson-info">
                            <span class="lesson-num"
                              >{{ Number(cIndex) + 1 }}.{{
                                Number(hIndex) + 1
                              }}</span
                            >
                            <span class="lesson-name">{{ hour.title }}</span>
                          </div>
                        </div>
                        <div class="lesson-right">
                          <div
                            v-if="
                              activeNode ===
                              `${Number(cIndex) + 1}.${Number(hIndex) + 1}`
                            "
                            class="playing-indicator"
                          >
                            <span /><span /><span />
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
      <div
        v-if="isAiDialogVisible"
        class="ai-dialog-overlay"
        @click.self="$emit('close-ai')"
      >
        <div class="ai-dialog">
          <div class="dialog-header">
            <div class="header-left">
              <div class="ai-dialog-avatar">
                <img :src="aiPeopleAvatar" alt="AI" />
              </div>
              <div class="header-info">
                <span class="header-title">AI 智能助教</span>
                <span class="header-status">
                  <span class="online-indicator" />
                  在线
                </span>
              </div>
            </div>
            <div class="header-actions">
              <button
                class="header-btn"
                title="清空对话"
                @click="$emit('clear-chat')"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path
                    d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                  />
                </svg>
              </button>
              <button class="header-btn close-btn" @click="$emit('close-ai')">
                <svg
                  viewBox="0 0 24 24"
                  width="18"
                  height="18"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
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
                    <button
                      class="quick-btn"
                      @click="handleQuickQuestion('这节课的重点是什么？')"
                    >
                      这节课的重点是什么？
                    </button>
                    <button
                      class="quick-btn"
                      @click="handleQuickQuestion('帮我总结一下知识点')"
                    >
                      帮我总结一下知识点
                    </button>
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
                      <div v-if="message.role === 'user'" class="message-text">
                        {{ message.content }}
                      </div>
                      <div
                        v-else
                        class="message-text ai-text"
                        v-html="parseMarkdown(message.content)"
                      />
                    </div>
                  </div>
                  <div v-if="isTyping" class="message-row ai">
                    <div class="message-content">
                      <div class="typing-indicator">
                        <span /><span /><span />
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
                :autosize="{ minRows: 1, maxRows: 4 }"
                placeholder="输入您的问题..."
                @keydown.enter.exact.prevent="handleSend"
              />
              <button
                class="send-button"
                :class="{ active: internalMsg.trim() && !sendingMessage }"
                :disabled="!internalMsg.trim() || sendingMessage"
                @click="handleSend"
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
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
import { ref, watch, nextTick, onMounted, onUnmounted, computed } from "vue";
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
const catalogScrollRef = ref(null);

// 卡片高度同步相关
const knowledgeCardRef = ref<HTMLElement | null>(null);
const summaryCardRef = ref<HTMLElement | null>(null);
const knowledgeContentRef = ref<HTMLElement | null>(null);
const summaryContentRef = ref<HTMLElement | null>(null);
const cardBodyHeight = ref<number>(0);

// 响应式最小高度：使用 vh 单位，最小 15vh，确保在不同设备上都有合适的高度
const MIN_CARD_BODY_HEIGHT_VH = 15; // 最小高度为视口高度的 15%

// 计算同步后的卡片高度
const syncedCardHeight = computed(() => {
  if (cardBodyHeight.value > 0) {
    return `${cardBodyHeight.value}px`;
  }
  return "auto";
});

// 计算两个内容区域的高度，取较小值作为统一高度
const calculateSyncedHeight = () => {
  nextTick(() => {
    const knowledgeContent = knowledgeContentRef.value;
    const summaryContent = summaryContentRef.value;

    if (!knowledgeContent || !summaryContent) return;

    // 获取内容的实际高度
    const knowledgeHeight = knowledgeContent.scrollHeight;
    const summaryHeight = summaryContent.scrollHeight;

    // 取较小值
    let minHeight = Math.min(knowledgeHeight, summaryHeight);

    // 计算响应式最小高度（基于视口高度）
    const viewportHeight = window.innerHeight;
    const minHeightVh = viewportHeight * (MIN_CARD_BODY_HEIGHT_VH / 100);

    // 确保不小于最小高度
    minHeight = Math.max(minHeight, minHeightVh);

    // 加上 card-header 的高度（约 81px）和 padding
    const headerHeight = 81;
    const paddingHeight = 40; // 上下 padding 各 20px

    cardBodyHeight.value = minHeight + headerHeight + paddingHeight;
  });
};

// 监听窗口大小变化，重新计算高度
const handleResize = () => {
  calculateSyncedHeight();
};

// 监听内容变化
watch(
  () => props.courseContentHtml,
  () => {
    calculateSyncedHeight();
  }
);

// 监听组件可见性
watch(
  () => props.visible,
  val => {
    if (val) {
      calculateSyncedHeight();
    }
  }
);

onMounted(() => {
  calculateSyncedHeight();
  window.addEventListener("resize", handleResize);
});

onUnmounted(() => {
  window.removeEventListener("resize", handleResize);
});

// 监听 activeNode 变化，自动滚动到当前课时
watch(
  () => props.activeNode,
  () => {
    if (!props.visible) return;
    nextTick(() => {
      const activeEl = document.querySelector(".lesson-node.active");
      if (activeEl) {
        activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    });
  },
  { immediate: true }
);

// 当组件变为可见时，也触发一次滚动
watch(
  () => props.visible,
  val => {
    if (val) {
      nextTick(() => {
        const activeEl = document.querySelector(".lesson-node.active");
        if (activeEl) {
          activeEl.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
      });
    }
  }
);

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
    emit("send-message", internalMsg.value);
  }
};

const handleQuickQuestion = (question: string) => {
  internalMsg.value = question;
  handleSend();
};

watch(
  () => props.sendingMessage,
  newVal => {
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

$shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 5%);
$shadow-md:
  0 4px 6px -1px rgb(0 0 0 / 10%),
  0 2px 4px -2px rgb(0 0 0 / 10%);
$shadow-lg:
  0 10px 15px -3px rgb(0 0 0 / 10%),
  0 4px 6px -4px rgb(0 0 0 / 10%);
$shadow-xl:
  0 20px 25px -5px rgb(0 0 0 / 10%),
  0 8px 10px -6px rgb(0 0 0 / 10%);

@keyframes pulse {
  0% {
    opacity: 0.8;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(1.3);
  }
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }

  50% {
    opacity: 0.4;
  }
}

@keyframes playing {
  0%,
  100% {
    transform: scaleY(1);
  }

  50% {
    transform: scaleY(0.5);
  }
}

@keyframes typing {
  0%,
  60%,
  100% {
    opacity: 0.4;
    transform: translateY(0);
  }

  30% {
    opacity: 1;
    transform: translateY(-6px);
  }
}

.course-study-root {
  width: 100%;
  height: 100%;
  overflow: hidden; /* 禁止根容器滚动，改为局部滚动 */
  background: transparent;

  &.dark {
    background: transparent;
  }
}

.study-container {
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 80px 32px 24px;
}

.main-layout {
  display: flex;
  flex: 1;
  gap: 32px;
  align-items: stretch;
  min-height: 0; /* 允许 flex 子项在溢出时收缩 */
}

.left-main {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
  padding-right: 0; /* 移除右边距，因为滚动条隐藏了 */
  overflow-y: auto; /* 左侧内容独立滚动 */

  /* 隐藏滚动条但保持滚动功能 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE and Edge */
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari and Opera */
  }
}

.video-section {
  flex-shrink: 0; /* 视频区域不收缩 */
  overflow: hidden;
  background: #000;
  border-radius: $radius-xl;
  box-shadow: $shadow-xl;
}

.video-player-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;

  .video-player {
    display: block;
    width: 100%;
    height: 100%;
  }

  .video-placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, $gray-800 0%, $gray-900 100%);

    .placeholder-content {
      color: $gray-400;
      text-align: center;

      .placeholder-icon {
        margin-bottom: 16px;
        opacity: 0.5;
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
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  background: linear-gradient(135deg, $gray-800 0%, $gray-900 100%);

  .video-meta {
    display: flex;
    gap: 16px;
    align-items: center;

    .lesson-badge {
      padding: 6px 14px;
      font-size: 13px;
      font-weight: 700;
      color: #fff;
      letter-spacing: 0.5px;
      background: $primary;
      border-radius: 20px;
    }

    .lesson-title {
      margin: 0;
      font-size: 18px;
      font-weight: 600;
      color: #fff;
    }
  }

  .video-actions {
    display: flex;
    gap: 8px;

    .action-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: $gray-300;
      cursor: pointer;
      background: rgb(255 255 255 / 10%);
      border: none;
      border-radius: $radius-md;
      transition: all 0.2s ease;

      &:hover {
        color: #fff;
        background: rgb(255 255 255 / 20%);
      }
    }
  }
}

.content-grid {
  display: grid;
  flex: 1; /* 填充剩余空间，使底部与右侧章节目录对齐 */
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  min-height: 0; /* 允许收缩 */
}

.glass-card {
  display: flex;
  flex-direction: column;

  /* 让卡片填充 grid 单元格的全部高度 */
  height: 100%;

  /* 响应式最小高度：增加到 25vh，确保卡片有足够的高度 */
  min-height: clamp(25vh, 30vh, 500px);
  overflow: hidden;
  background: rgb(255 255 255 / 90%);
  border: 1px solid rgb(255 255 255 / 60%);
  border-radius: $radius-xl;
  box-shadow:
    0 4px 20px -4px rgb(0 0 0 / 10%),
    0 2px 8px -2px rgb(0 0 0 / 6%);
  backdrop-filter: blur(20px);
  transition:
    box-shadow 0.3s ease,
    transform 0.3s ease;

  &:hover {
    box-shadow:
      0 8px 30px -6px rgb(0 0 0 / 15%),
      0 4px 12px -4px rgb(0 0 0 / 10%);
    transform: translateY(-2px);
  }

  .dark & {
    background: rgb(40 40 40 / 90%);
    border-color: rgb(255 255 255 / 15%);
    box-shadow:
      0 4px 20px -4px rgb(0 0 0 / 30%),
      0 2px 8px -2px rgb(0 0 0 / 20%);

    &:hover {
      box-shadow:
        0 8px 30px -6px rgb(0 0 0 / 40%),
        0 4px 12px -4px rgb(0 0 0 / 30%);
    }
  }
}

.card-header {
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid rgb(0 0 0 / 5%);

  .dark & {
    border-bottom-color: rgb(255 255 255 / 5%);
  }

  .header-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: $radius-md;

    &.knowledge-icon {
      color: $primary;
      background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);

      .dark & {
        background: linear-gradient(
          135deg,
          rgb(99 102 241 / 20%) 0%,
          rgb(99 102 241 / 10%) 100%
        );
      }
    }

    &.summary-icon {
      color: $accent;
      background: linear-gradient(135deg, #fce7f3 0%, #fbcfe8 100%);

      .dark & {
        background: linear-gradient(
          135deg,
          rgb(244 63 94 / 20%) 0%,
          rgb(244 63 94 / 10%) 100%
        );
      }
    }
  }

  .card-title {
    flex: 1;
    margin: 0;
    font-size: 16px;
    font-weight: 700;
    color: $gray-800;

    .dark & {
      color: #fff;
    }
  }

  .ai-badge {
    padding: 4px 10px;
    font-size: 11px;
    font-weight: 600;
    color: $accent;
    background: rgb(244 63 94 / 10%);
    border-radius: 20px;
  }
}

.card-body {
  display: flex;
  flex: 1;
  flex-direction: column;
  padding: 0; /* 移除 padding，让 scrollbar 占满 */
  overflow: hidden;

  :deep(.el-scrollbar) {
    flex: 1;

    .el-scrollbar__wrap {
      padding: 20px 24px;
    }

    /* 显示美化的滚动条 */
    .el-scrollbar__bar {
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    &:hover .el-scrollbar__bar {
      opacity: 1;
    }

    .el-scrollbar__bar.is-vertical {
      right: 4px;
      width: 6px;

      .el-scrollbar__thumb {
        background: rgb(99 102 241 / 30%);
        border-radius: 3px;

        &:hover {
          background: rgb(99 102 241 / 50%);
        }
      }
    }
  }
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
  padding: 0;
  margin: 0;
  list-style: none;
}

.summary-item {
  display: flex;
  gap: 14px;
  padding: 14px 0;
  border-bottom: 1px solid rgb(0 0 0 / 5%);

  .dark & {
    border-bottom-color: rgb(255 255 255 / 5%);
  }

  &:last-child {
    border-bottom: none;
  }

  .item-number {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    font-size: 12px;
    font-weight: 700;
    color: #fff;
    background: linear-gradient(135deg, $primary 0%, $primary-light 100%);
    border-radius: 50%;
  }

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
  position: sticky;
  top: 100px;
  z-index: 10;
  display: flex;
  flex-shrink: 0;
  flex-direction: column;
  gap: 20px;

  /* 让右侧栏从视频区域下方开始，与左侧卡片对齐 */
  align-self: flex-start;
  width: 380px;

  /* 设置最大高度，让章节目录可以滚动 */
  height: calc(100vh - 120px);
  min-height: 0;
}

.ai-assistant-widget {
  position: relative;
  padding: 24px;
  overflow: hidden;
  cursor: pointer;
  background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
  border-radius: $radius-xl;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    box-shadow: 0 20px 40px -10px rgb(99 102 241 / 40%);
    transform: translateY(-4px) scale(1.02);

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
    pointer-events: none;
    background: radial-gradient(
      circle,
      rgb(255 255 255 / 20%) 0%,
      transparent 70%
    );
  }

  .ai-content {
    position: relative;
    z-index: 1;
    display: flex;
    gap: 16px;
    align-items: center;
  }

  .ai-avatar {
    position: relative;
    width: 56px;
    height: 56px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border: 2px solid rgb(255 255 255 / 30%);
      border-radius: 16px;
    }

    .pulse-ring {
      position: absolute;
      inset: -4px;
      border: 2px solid rgb(255 255 255 / 50%);
      border-radius: 20px;
      opacity: 0;
    }
  }

  .ai-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 4px;

    .ai-title {
      font-size: 16px;
      font-weight: 700;
      color: #fff;
    }

    .ai-status {
      display: flex;
      gap: 6px;
      align-items: center;
      font-size: 13px;
      color: rgb(255 255 255 / 80%);

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
    color: rgb(255 255 255 / 80%);
    transition: transform 0.3s ease;
  }
}

.chapter-catalog {
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
  height: 100%;
  overflow: hidden;
  box-shadow:
    0 4px 20px -4px rgb(0 0 0 / 10%),
    0 2px 8px -2px rgb(0 0 0 / 6%);

  .catalog-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 24px;
    border-bottom: 1px solid rgb(0 0 0 / 5%);

    .dark & {
      border-bottom-color: rgb(255 255 255 / 5%);
    }

    .catalog-title {
      display: flex;
      gap: 10px;
      align-items: center;
      margin: 0;
      font-size: 16px;
      font-weight: 700;
      color: $gray-800;

      svg {
        color: $primary;
      }

      .dark & {
        color: #fff;
      }
    }

    .chapter-count {
      padding: 4px 12px;
      font-size: 13px;
      color: $gray-500;
      background: $gray-100;
      border-radius: 20px;

      .dark & {
        color: $gray-400;
        background: rgb(255 255 255 / 10%);
      }
    }
  }

  .catalog-body {
    display: flex;
    flex: 1;
    flex-direction: column;
    min-height: 0;
    padding: 16px;
    overflow: hidden;

    :deep(.el-scrollbar) {
      height: 100%;

      .el-scrollbar__wrap {
        height: 100%;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .el-scrollbar__view {
        height: auto;
      }

      .el-scrollbar__bar.is-vertical {
        right: 2px;
        width: 6px;
        opacity: 0;
        transition: opacity 0.3s ease;

        .el-scrollbar__thumb {
          background: rgb(99 102 241 / 30%);
          border-radius: 3px;

          &:hover {
            background: rgb(99 102 241 / 50%);
          }
        }
      }

      &:hover .el-scrollbar__bar.is-vertical {
        opacity: 1;
      }
    }
  }
}

.chapter-tree {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.chapter-node {
  .chapter-title-row {
    display: flex;
    gap: 12px;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 8px;
    background: $gray-50;
    border-radius: $radius-md;

    .dark & {
      background: rgb(255 255 255 / 5%);
    }

    .chapter-indicator {
      width: 4px;
      height: 20px;
      background: linear-gradient(180deg, $primary 0%, $primary-light 100%);
      border-radius: 2px;
    }

    .chapter-label {
      padding: 2px 8px;
      font-size: 12px;
      font-weight: 600;
      color: $primary;
      background: rgb(99 102 241 / 10%);
      border-radius: 4px;
    }

    .chapter-name {
      font-size: 14px;
      font-weight: 600;
      color: $gray-700;

      .dark & {
        color: $gray-200;
      }
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
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: $radius-md;
  transition: all 0.2s ease;

  &:hover {
    background: rgb(99 102 241 / 5%);
    border-color: rgb(99 102 241 / 10%);
  }

  &.active {
    background: linear-gradient(
      135deg,
      rgb(99 102 241 / 10%) 0%,
      rgb(99 102 241 / 5%) 100%
    );
    border-color: rgb(99 102 241 / 20%);

    .lesson-icon {
      color: #fff;
      background: $primary;
    }

    .lesson-num {
      color: $primary;
    }
  }

  &.completed {
    .lesson-icon {
      color: #fff;
      background: $success;
    }
  }

  .lesson-left {
    display: flex;
    flex: 1;
    gap: 12px;
    align-items: center;
    min-width: 0;
  }

  .lesson-icon {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    color: $gray-500;
    background: $gray-100;
    border-radius: 8px;
    transition: all 0.2s ease;

    .dark & {
      color: $gray-400;
      background: rgb(255 255 255 / 10%);
    }
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
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 13px;
      color: $gray-600;
      white-space: nowrap;

      .dark & {
        color: $gray-300;
      }
    }
  }

  .lesson-right {
    flex-shrink: 0;
  }
}

.playing-indicator {
  display: flex;
  gap: 2px;
  align-items: flex-end;
  height: 16px;

  span {
    width: 3px;
    background: $primary;
    border-radius: 2px;
    animation: playing 0.8s ease-in-out infinite;

    &:nth-child(1) {
      height: 8px;
      animation-delay: 0s;
    }

    &:nth-child(2) {
      height: 12px;
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      height: 6px;
      animation-delay: 0.4s;
    }
  }
}

.ai-dialog-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(4px);
}

.ai-dialog {
  display: flex;
  flex-direction: column;
  width: 100%;
  max-width: 560px;
  height: 80vh;
  max-height: 700px;
  overflow: hidden;
  background: #fff;
  border-radius: $radius-xl;
  box-shadow: 0 25px 50px -12px rgb(0 0 0 / 25%);

  .dark & {
    background: $gray-800;
  }
}

.dialog-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  border-bottom: 1px solid $gray-100;

  .dark & {
    border-bottom-color: rgb(255 255 255 / 10%);
  }

  .header-left {
    display: flex;
    gap: 14px;
    align-items: center;

    .ai-dialog-avatar {
      width: 44px;
      height: 44px;

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 12px;
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

        .dark & {
          color: #fff;
        }
      }

      .header-status {
        display: flex;
        gap: 6px;
        align-items: center;
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
      display: flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      color: $gray-500;
      cursor: pointer;
      background: $gray-100;
      border: none;
      border-radius: $radius-sm;
      transition: all 0.2s ease;

      &:hover {
        color: $gray-700;
        background: $gray-200;
      }

      &.close-btn:hover {
        color: $accent;
        background: rgb(244 63 94 / 10%);
      }

      .dark & {
        color: $gray-400;
        background: rgb(255 255 255 / 10%);

        &:hover {
          color: #fff;
          background: rgb(255 255 255 / 15%);
        }
      }
    }
  }
}

.dialog-body {
  flex: 1;
  overflow: hidden;

  :deep(.el-scrollbar) {
    height: 100%;
  }

  .chat-container {
    padding: 24px;
  }
}

.welcome-section {
  padding: 32px 24px;
  text-align: center;

  .welcome-avatar {
    width: 72px;
    height: 72px;
    margin: 0 auto 16px;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 20px;
    }
  }

  h3 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 700;
    color: $gray-800;

    .dark & {
      color: #fff;
    }
  }

  p {
    margin: 0 0 24px;
    font-size: 14px;
    color: $gray-500;
  }

  .quick-questions {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;

    .quick-btn {
      padding: 10px 18px;
      font-size: 13px;
      color: $gray-600;
      cursor: pointer;
      background: $gray-50;
      border: 1px solid $gray-200;
      border-radius: 20px;
      transition: all 0.2s ease;

      &:hover {
        color: $primary;
        background: rgb(99 102 241 / 10%);
        border-color: $primary;
      }

      .dark & {
        color: $gray-300;
        background: rgb(255 255 255 / 5%);
        border-color: rgb(255 255 255 / 10%);

        &:hover {
          color: $primary-light;
          background: rgb(99 102 241 / 20%);
          border-color: $primary;
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
      color: #fff;
      background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);
      border-radius: $radius-lg $radius-lg 4px $radius-lg;
    }
  }

  &.ai {
    justify-content: flex-start;

    .message-content {
      color: $gray-700;
      background: $gray-100;
      border-radius: $radius-lg $radius-lg $radius-lg 4px;

      .dark & {
        color: $gray-200;
        background: rgb(255 255 255 / 10%);
      }
    }
  }

  .message-content {
    max-width: 80%;
    padding: 14px 18px;

    .message-text {
      font-size: 14px;
      line-height: 1.6;

      &.ai-text {
        :deep(strong) {
          font-weight: 600;
          color: $primary;
        }
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

    &:nth-child(2) {
      animation-delay: 0.2s;
    }

    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

.dialog-footer {
  padding: 16px 24px 24px;
  border-top: 1px solid $gray-100;

  .dark & {
    border-top-color: rgb(255 255 255 / 10%);
  }

  .input-wrapper {
    display: flex;
    gap: 12px;
    align-items: flex-end;
    padding: 12px 16px;
    background: $gray-50;
    border: 1px solid $gray-200;
    border-radius: $radius-lg;
    transition: all 0.2s ease;

    &:focus-within {
      border-color: $primary;
      box-shadow: 0 0 0 3px rgb(99 102 241 / 10%);
    }

    .dark & {
      background: rgb(255 255 255 / 5%);
      border-color: rgb(255 255 255 / 10%);
    }

    :deep(.el-textarea) {
      flex: 1;

      .el-textarea__inner {
        padding: 0;
        font-size: 14px;
        resize: none;
        background: transparent;
        border: none;
        box-shadow: none;

        &::placeholder {
          color: $gray-400;
        }
      }
    }

    .send-button {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      color: $gray-400;
      cursor: not-allowed;
      background: $gray-200;
      border: none;
      border-radius: $radius-md;
      transition: all 0.2s ease;

      &.active {
        color: #fff;
        cursor: pointer;
        background: linear-gradient(135deg, $primary 0%, $primary-dark 100%);

        &:hover {
          box-shadow: 0 4px 12px rgb(99 102 241 / 40%);
          transform: scale(1.05);
        }
      }

      .dark & {
        background: rgb(255 255 255 / 10%);

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
    opacity: 0;
    transform: scale(0.9) translateY(20px);
  }
}
</style>
