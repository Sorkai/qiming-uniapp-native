<template>
  <div
    v-show="visible"
    class="course-study-root"
    :class="currentTheme"
  >
    <!-- 头部 -->
    <CourseHeader
      :current-theme="currentTheme"
      title="章节模式"
      :user-avatar="userAvatar"
      :user-nickname="userNickname"
      @go-back="$emit('go-back')"
      @toggle-theme="$emit('toggle-theme')"
      @go-to-account="$emit('go-to-account')"
      @logout="$emit('logout')"
    />

    <div class="study-container" :class="currentTheme">
      <div class="main-layout">
        <!-- 左侧区域 -->
        <div class="left-section">
          <!-- 课程介绍标题 -->
          <div class="card intro-card">
            <div class="intro-title">课程介绍</div>
          </div>

          <!-- 视频播放区域 -->
          <div class="card video-card">
            <div class="video-header">
              <div class="video-title">
                <span class="chapter-num">{{ activeNode }}</span>
                <span class="chapter-name">{{ currentHour?.title || "加载中..." }}</span>
              </div>
              <div class="video-label">视频播放</div>
            </div>
            <div class="video-wrapper">
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
                {{ loading ? "加载中..." : "暂无视频" }}
              </div>
            </div>
          </div>

          <!-- 知识点描述 -->
          <div class="card describe-card">
            <div class="section-title">
              <span class="sparkle-icon">✨</span>
              知识点描述
            </div>
            <div class="describe-content" v-html="courseContentHtml" />
          </div>
        </div>

        <!-- 右侧区域 -->
        <div class="right-section">
          <!-- AI 助教 -->
          <div class="card ai-helper-card glow-border">
            <div class="ai-helper-content">
              <div class="ai-avatar">
                <img :src="aiPeopleAvatar" alt="AI" />
              </div>
              <div class="ai-info">
                <div class="ai-name">AI助教</div>
                <div class="ai-greeting">Hi～我是您的AI助教</div>
              </div>
              <div class="ai-input-wrapper">
                <input
                  type="text"
                  placeholder="输入您的问题，"
                  class="ai-mini-input"
                  @click="$emit('open-ai')"
                />
                <div class="send-btn-mini" @click="$emit('open-ai')">
                  <SendIcon />
                </div>
              </div>
            </div>
          </div>

          <!-- 下方并排区域 (纪要 & 目录) -->
          <div class="bottom-split">
            <!-- AI 视频内容纪要 -->
            <div class="card summary-card">
              <div class="section-title">AI 视频内容纪要</div>
              <div class="summary-list-wrapper">
                <el-scrollbar>
                  <ul class="summary-list">
                    <li v-for="(item, index) in mockSummary" :key="index">
                      <span class="dot">•</span>
                      <span class="text">{{ item }}</span>
                    </li>
                  </ul>
                </el-scrollbar>
              </div>
            </div>

            <!-- 章节目录 -->
            <div class="card catalog-card">
              <div class="section-title">章节目录</div>
              <div class="catalog-list-wrapper">
                <el-scrollbar>
                  <div class="chapter-list">
                    <template v-for="(chapter, cIndex) in chapterList" :key="chapter.chapterId">
                      <div class="chapter-item">
                        <div class="chapter-title">
                          <span class="badge">第{{ Number(cIndex) + 1 }}章</span>
                          <span class="text">{{ chapter.name }}</span>
                        </div>
                        <div
                          v-for="(hour, hIndex) in chapter.hourList"
                          :key="hour.hourId"
                          class="hour-item"
                          :class="{ active: activeNode === (Number(cIndex) + 1) + '.' + (Number(hIndex) + 1) }"
                          @click="$emit('node-click', (Number(cIndex) + 1) + '.' + (Number(hIndex) + 1), hour)"
                        >
                          <div class="hour-info">
                            <div class="hour-index">{{ Number(cIndex) + 1 }}.{{ Number(hIndex) + 1 }}</div>
                            <div class="hour-main">
                              <div class="hour-title">{{ hour.title }}</div>
                              <div class="hour-meta">
                                <span>必学 {{ hour.finished }}/1</span>
                                <div class="mini-progress">
                                  <div class="progress-inner" :style="{ width: (Number(hour.finished) * 100) + '%' }"></div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div class="hour-status">
                            <div v-if="hour.finished === 1" class="check-icon">
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                </el-scrollbar>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- AI 展开对话框 (保留原有逻辑) -->
    <transition name="ai-slide">
      <div
        v-if="isAiDialogVisible"
        class="ai-full-dialog"
      >
        <div class="ai-dialog-header">
          <div class="header-left" @click="$emit('close-ai')">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="#409eff" stroke-width="4" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>
          </div>
          <div class="header-center">
            <span class="online-dot"></span>
            <span class="title">AI 智能助教</span>
          </div>
          <div class="header-right">
            <div class="action-btn" @click="$emit('clear-chat')">🗑️</div>
            <div class="action-btn" @click="$emit('close-ai')">✖️</div>
          </div>
        </div>

        <div class="ai-dialog-body">
          <el-scrollbar ref="chatScrollRef">
            <div class="chat-welcome">
              <div class="ai-large-avatar">
                <img :src="aiPeopleAvatar" alt="" />
              </div>
              <h3>Hi～我是您的AI助教</h3>
              <p>课程学习中欢迎随时提问，我将全力为您答疑解惑，共同进步哦！</p>
            </div>

            <div class="chat-list">
              <div
                v-for="(message, index) in chatMessages"
                :key="index"
                class="message-item"
                :class="message.role"
              >
                <div class="message-bubble">
                  <div v-if="message.role === 'user'">{{ message.content }}</div>
                  <div v-else class="markdown-content" v-html="parseMarkdown(message.content)" />
                </div>
              </div>
              <div v-if="isTyping" class="message-item ai">
                <div class="message-bubble typing">
                  <span>.</span><span>.</span><span>.</span>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>

        <div class="ai-dialog-footer">
          <el-input
            v-model="internalMsg"
            type="textarea"
            :autosize="{ minRows: 1, maxRows: 4 }"
            placeholder="请输入您的问题"
            @keydown.enter.prevent="$emit('send-message', internalMsg)"
          />
          <div
            class="send-btn"
            :class="{ disabled: !internalMsg.trim() || sendingMessage }"
            @click="$emit('send-message', internalMsg)"
          >
            <SendIcon />
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import CourseHeader from "./CourseHeader.vue";
import SendIcon from "@/assets/course-icons/send-icon.svg?component";
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
  'go-back', 'toggle-theme', 'go-to-account', 'logout',
  'video-loaded', 'video-ended', 'open-ai', 'close-ai', 
  'clear-chat', 'send-message', 'node-click'
]);

const internalMsg = ref("");
const videoPlayerRef = ref(null);

const mockSummary = [
  "本节课主要介绍了课程的整体目标和学习路径。",
  "详细讲解了基础环境的搭建过程及注意事项。",
  "演示了核心功能模块的实现逻辑。",
  "总结了学习过程中常见的难点与解决方案。"
];

watch(() => props.sendingMessage, (newVal) => {
  if (!newVal) internalMsg.value = "";
});

const parseMarkdown = (text: string) => {
  if (!text) return "";
  return text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
};

defineExpose({
  videoPlayer: videoPlayerRef
});
</script>

<style scoped lang="scss">
.course-study-root {
  width: 100%;
  height: 100%;
  background: #f5f7fa;
  &.dark { background: #1a1a1a; }
}

.study-container {
  padding: 80px 24px 24px;
  height: 100%;
  box-sizing: border-box;
}

.main-layout {
  display: flex;
  gap: 20px;
  height: 100%;
}

.left-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}

.right-section {
  width: 500px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  &.dark { background: #2c2c2c; color: #e0e0e0; }
}

/* 左侧卡片 */
.intro-card {
  padding: 15px 20px;
  .intro-title {
    font-size: 18px;
    font-weight: 600;
    color: #ff6b6b;
  }
}

.video-card {
  .video-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    .video-title {
      font-size: 20px;
      font-weight: bold;
      .chapter-num { margin-right: 12px; }
      .chapter-name { color: #333; }
    }
    .video-label {
      color: #ff6b6b;
      font-size: 14px;
    }
  }
  .video-wrapper {
    width: 100%;
    aspect-ratio: 16 / 9;
    background: #000;
    border-radius: 12px;
    overflow: hidden;
    .video-player { width: 100%; height: 100%; }
    .video-placeholder {
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      color: #fff;
    }
  }
}

.describe-card {
  flex: 1;
  .section-title {
    font-size: 18px;
    font-weight: 600;
    color: #4facfe;
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
    .sparkle-icon { font-size: 20px; }
  }
  .describe-content {
    color: #666;
    line-height: 1.6;
  }
}

/* 右侧卡片 */
.ai-helper-card {
  padding: 15px;
  .ai-helper-content {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .ai-avatar {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid #4facfe;
    img { width: 100%; height: 100%; object-fit: cover; }
  }
  .ai-info {
    flex: 1;
    .ai-name { font-weight: bold; font-size: 15px; }
    .ai-greeting { font-size: 12px; color: #999; }
  }
  .ai-input-wrapper {
    display: flex;
    align-items: center;
    background: #f0f2f5;
    border-radius: 20px;
    padding: 4px 4px 4px 12px;
    width: 220px;
    .ai-mini-input {
      border: none;
      background: transparent;
      outline: none;
      flex: 1;
      font-size: 12px;
      color: #666;
    }
    .send-btn-mini {
      width: 28px;
      height: 28px;
      background: #4facfe;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      svg { width: 14px; height: 14px; fill: #fff; }
    }
  }
}

.bottom-split {
  flex: 1;
  display: flex;
  gap: 15px;
  min-height: 0;
}

.summary-card, .catalog-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 15px;
  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: #ff6b6b;
    margin-bottom: 12px;
  }
}

.summary-list {
  list-style: none;
  padding: 0;
  margin: 0;
  li {
    display: flex;
    gap: 8px;
    margin-bottom: 10px;
    font-size: 13px;
    line-height: 1.5;
    color: #555;
    .dot { color: #ff6b6b; font-weight: bold; }
  }
}

.summary-list-wrapper, .catalog-list-wrapper {
  flex: 1;
  min-height: 0;
}

.chapter-item {
  margin-bottom: 15px;
  .chapter-title {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;
    .badge {
      background: #e1f0ff;
      color: #409eff;
      font-size: 11px;
      padding: 2px 6px;
      border-radius: 4px;
      font-weight: bold;
    }
    .text { font-weight: 600; font-size: 14px; color: #333; }
  }
}

.hour-item {
  padding: 10px;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s;
  &:hover { background: #f0f7ff; }
  &.active {
    background: #eef6ff;
    border: 1px solid #c6e2ff;
  }
  .hour-info {
    display: flex;
    gap: 10px;
    flex: 1;
  }
  .hour-index { color: #999; font-size: 12px; padding-top: 2px; }
  .hour-main { flex: 1; }
  .hour-title { font-size: 13px; color: #555; margin-bottom: 4px; }
  .hour-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: #999;
    .mini-progress {
      flex: 1;
      height: 4px;
      background: #eee;
      border-radius: 2px;
      max-width: 60px;
      .progress-inner { height: 100%; background: #409eff; border-radius: 2px; }
    }
  }
  .hour-status {
    .check-icon {
      color: #67c23a;
      background: #e1f3d8;
      width: 20px;
      height: 20px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

/* AI 对话框样式 */
.ai-full-dialog {
  position: fixed;
  top: 80px;
  right: 24px;
  bottom: 24px;
  width: 450px;
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
  overflow: hidden;
  border: 1px solid rgba(64, 158, 255, 0.2);
}

.ai-dialog-header {
  padding: 15px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #eee;
  .header-left { cursor: pointer; }
  .header-center {
    display: flex;
    align-items: center;
    gap: 8px;
    .online-dot { width: 8px; height: 8px; background: #67c23a; border-radius: 50%; }
    .title { font-weight: bold; }
  }
  .header-right {
    display: flex;
    gap: 12px;
    .action-btn { cursor: pointer; opacity: 0.6; &:hover { opacity: 1; } }
  }
}

.ai-dialog-body {
  flex: 1;
  min-height: 0;
  background: #f8fafc;
}

.chat-welcome {
  text-align: center;
  padding: 30px 20px;
  .ai-large-avatar {
    width: 64px;
    height: 64px;
    border-radius: 50%;
    margin: 0 auto 15px;
    overflow: hidden;
    border: 3px solid #fff;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    img { width: 100%; height: 100%; object-fit: cover; }
  }
  h3 { margin-bottom: 8px; color: #333; }
  p { font-size: 13px; color: #999; line-height: 1.5; }
}

.chat-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.message-item {
  display: flex;
  &.user { justify-content: flex-end; }
  &.ai { justify-content: flex-start; }
  .message-bubble {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.5;
  }
  &.user .message-bubble {
    background: #4facfe;
    color: #fff;
    border-bottom-right-radius: 2px;
  }
  &.ai .message-bubble {
    background: #fff;
    color: #333;
    border-bottom-left-radius: 2px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  }
}

.ai-dialog-footer {
  padding: 15px 20px;
  display: flex;
  align-items: flex-end;
  gap: 12px;
  border-top: 1px solid #eee;
  .send-btn {
    width: 40px;
    height: 40px;
    background: #4facfe;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    flex-shrink: 0;
    &.disabled { background: #ccc; cursor: not-allowed; }
    svg { width: 20px; height: 20px; fill: #fff; }
  }
}

.glow-border {
  position: relative;
  &::after {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 18px;
    padding: 2px;
    background: linear-gradient(90deg, #4facfe, #00f2fe, #4facfe);
    background-size: 200% 100%;
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: glow-move 3s linear infinite;
    pointer-events: none;
  }
}

@keyframes glow-move {
  0% { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}

.ai-slide-enter-active, .ai-slide-leave-active { transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1); }
.ai-slide-enter-from, .ai-slide-leave-to { transform: translateX(100%); opacity: 0; }
</style>
