<template>
  <div
    v-show="visible"
    data-v-cebc91e2=""
    data-v-2cf49992=""
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

    <div data-v-cebc91e2="" class="study-container" :class="currentTheme">
      <div data-v-cebc91e2="" :class="currentTheme" style="overflow: hidden">
        <div class="aloneMapCourrseWarp">
          <div class="left-warp">
            <div class="courseMsg-box">
              <div class="small-text">
                <i />同学们，本次我们学习的知识点是
              </div>
              <div class="kg-name">
                {{ currentHour?.title || courseName || "加载中..." }}
              </div>
            </div>
            <div
              class="preview-warp"
              style="
                width: 100%;
                height: 369px;
                background: rgb(0, 0, 0);
                border-radius: 0.83333vw;
              "
            >
              <video
                v-if="currentVideoUrl"
                ref="videoPlayerRef"
                controls
                style="width: 100%; height: 100%"
                :src="currentVideoUrl"
                @loadeddata="$emit('video-loaded')"
                @ended="$emit('video-ended')"
              />
              <div
                v-else
                class="loading-placeholder"
                style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  height: 100%;
                  color: #fff;
                "
              >
                {{ loading ? "加载中..." : "暂无视频" }}
              </div>
            </div>
            <div
              class="kgDescribe-warp"
              style="height: auto"
            >
              <div class="top-test">
                <img :src="describeImgSrc" alt="" /><span>知识点描述</span>
              </div>
              <div class="introduce-div">
                <div v-html="courseContentHtml" />
              </div>
            </div>
          </div>

          <div class="rigth-warp" style="width: 25vw; margin-right: 1vw;">
            <!-- AI助教 -->
            <div>
              <div data-v-0762fd62="" class="ai-helper-sections" :class="currentTheme">
                <div
                  data-v-0762fd62=""
                  class="out-ai-showbox-pro"
                  style="
                    position: fixed;
                    top: 5.83333vw;
                    right: 1vw !important;
                    width: 25vw !important;
                    height: 10.4167vw;
                  "
                >
                  <div
                    data-v-0762fd62=""
                    class="out-ai-pro-talk-box glow-border"
                  >
                    <div data-v-0762fd62="" class="inset-div">
                      <div data-v-0762fd62="" class="photo">
                        <img :src="aiPeopleAvatar" alt="" />
                      </div>
                      <div data-v-0762fd62="" class="ai-hepler-pro-box">
                        <div data-v-0762fd62="" class="people-name">AI助教</div>
                        <div data-v-0762fd62="" class="init-talk-cotent">Hi～我是您的AI助教</div>
                      </div>
                      <div data-v-0762fd62="" class="ai-hepler-pro-input">
                        <div data-v-0762fd62="" class="el-input">
                          <input
                            type="text"
                            autocomplete="off"
                            placeholder="输入您的问题，与AI助教互动问答..."
                            class="el-input__inner"
                            style="padding-left: 10px; padding-right: 40px; font-size: 14px"
                            @click="$emit('open-ai')"
                          />
                        </div>
                        <span data-v-0762fd62="" class="mock-send-btn" @click="$emit('open-ai')">
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
                        <div class="header-back-btn spotlight-button" @click="$emit('close-ai')">
                          <svg viewBox="0 0 24 24" width="18" height="18" stroke="#409eff" stroke-width="4" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"></polyline></svg>
                        </div>
                      </div>
                      <div class="header-title-wrap">
                        <span class="status-dot"></span>
                        <span class="header-title">AI 智能助教</span>
                      </div>
                      <div class="header-right">
                        <el-tooltip content="清空对话" placement="top">
                          <div class="header-action-btn" @click="$emit('clear-chat')">
                            <i class="el-icon-delete"></i>
                          </div>
                        </el-tooltip>
                        <div class="header-action-btn close-btn" @click="$emit('close-ai')">
                          <i class="el-icon-close"></i>
                        </div>
                      </div>
                    </div>

                    <div class="ai-fill-bg" style="flex: 1; overflow: hidden; display: flex; flex-direction: column;">
                      <div class="dialog-content" style="flex: 1; overflow: hidden;">
                        <div class="ai-talk-box">
                          <el-scrollbar ref="chatScrollRef" class="chat-scrollbar">
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
                                        <div v-else class="markdown-content" v-html="parseMarkdown(message.content)" />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div v-if="isTyping" key="typing" class="ai-message chat-message-item">
                                <div class="ai-chat-share-container_nVXTe">
                                  <div class="answer-content-box_2Pu7S">
                                    <span class="typing-dot">.</span>
                                    <span class="typing-dot">.</span>
                                    <span class="typing-dot">.</span>
                                  </div>
                                </div>
                              </div>
                            </transition-group>
                          </el-scrollbar>
                        </div>
                        <div class="talk-input-box">
                          <div class="input-box">
                            <div class="ai-pro-content-edit-box">
                              <el-input
                                v-model="internalMsg"
                                type="textarea"
                                autosize
                                placeholder="请输入您的问题"
                                @keydown.enter.prevent="$emit('send-message', internalMsg)"
                              />
                            </div>
                            <div
                              :class="internalMsg.trim() && !sendingMessage ? 'send-btn' : 'not-send-btn'"
                              @click="$emit('send-message', internalMsg)"
                            >
                              <SendIcon v-if="internalMsg.trim() && !sendingMessage" />
                              <NotSendBtnIcon v-else />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </transition>
              </div>
            </div>

            <!-- 目录 -->
            <div 
              ref="catalogRef"
              class="rightTreeWarp" 
              :style="{ top: catalogTop }"
            >
              <div class="top-title">目录</div>
              <el-scrollbar class="my-scrollbar" style="height: calc(100% - 3.38542vw)">
                <div class="chapterList-box">
                  <ul class="list">
                    <span class="position_first_bg" />
                    <template v-for="(chapter, cIndex) in chapterList" :key="chapter.chapterId">
                      <li class="clearfix font_gray_inclined chapter">
                        <span class="catalogue_title3 fl"><b>第{{ cIndex + 1 }}章</b></span>
                        <em class="Sectionmark-em fl" />
                        <span class="catalogue_title fl catalogue_titleweight">{{ chapter.name }}</span>
                      </li>
                      <div v-for="(hour, hIndex) in chapter.hourList" :key="hour.hourId" class="inner-li">
                        <li
                          class="clearfix video"
                          :class="{ activeNode: activeNode === `${cIndex + 1}.${hIndex + 1}` }"
                          @click="$emit('node-click', `${cIndex + 1}.${hIndex + 1}`, hour)"
                        >
                          <span class="catalogue_title3 fl cataloguediv-l"><b class="pl5">{{ cIndex + 1 }}.{{ hIndex + 1 }}</b></span>
                          <div class="fl cataloguediv-c haveRe">
                            <span class="catalogue_title">{{ hour.title }}</span>
                            <div class="resource-box clearfix">
                              <div class="resource-text">必学 <span>{{ hour.finished }}</span>/1</div>
                              <div class="resource-bar">
                                <el-progress :percentage="hour.finished * 100" :stroke-width="6" :show-text="true" />
                              </div>
                            </div>
                          </div>
                          <em class="Sectionmark-em" />
                          <div class="icon-box">
                            <div v-if="hour.finished === 1" class="isFinish">
                              <img src="@/assets/course-detail-images/course-detail-icon3.png" alt="" />
                            </div>
                          </div>
                        </li>
                      </div>
                    </template>
                    <li v-if="loading || !chapterList?.length" class="clearfix chapter">
                      <span class="catalogue_title fl">{{ loading ? '加载中...' : '暂无章节数据' }}</span>
                    </li>
                  </ul>
                </div>
              </el-scrollbar>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";
import CourseHeader from "./CourseHeader.vue";
import SendIcon from "@/assets/course-icons/send-icon.svg?component";
import NotSendBtnIcon from "@/assets/course-icons/not-send-btn.svg?component";
import aiPeopleAvatar from "@/assets/aipeople.jpg";
import resourceTabNormal from "@/assets/course-detail-images/resource-tab-normal-vue.png";
import resourceTabActive from "@/assets/course-detail-images/resource-tab-active-vue.png";

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

watch(() => props.sendingMessage, (newVal) => {
  if (!newVal) internalMsg.value = "";
});

const describeImgSrc = computed(() =>
  props.currentTheme === "dark" ? resourceTabNormal : resourceTabActive
);

const catalogTop = computed(() => {
  if (props.isAiDialogVisible) {
    return 'calc(5.83333vw + 600px + 1vw)';
  } else {
    return 'calc(5.83333vw + 10.4167vw + 1vw)';
  }
});

const parseMarkdown = (text: string) => {
  if (!text) return "";
  let formatted = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  formatted = formatted.replace(/\n/g, "<br>");
  return formatted;
};

// 暴露组件方法，让父组件可以操作视频
defineExpose({
  videoPlayer: videoPlayerRef
});
</script>

<style scoped>
.study-container {
  padding-left: 1.5vw !important;
  padding-right: 1.5vw !important;
  width: 100% !important;
  box-sizing: border-box !important;
  padding-top: 80px;
}

.aloneMapCourrseWarp {
  width: 100% !important;
  display: flex;
}

.left-warp {
  flex: 1 !important;
  max-width: calc(100% - 26vw) !important;
  margin-right: 1vw !important;
}

.kg-name {
  color: #409eff;
  font-weight: 800;
  font-size: 1.8vw;
  margin-top: 10px;
  margin-bottom: 10px;
}

.dark .kg-name { color: #4facfe; }

.kgDescribe-warp {
  margin-top: 20px;
  border: 1px solid #c6e2ff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(64, 158, 255, 0.1);
}

.dark .kgDescribe-warp { background: #1a1a1a; border-color: #333; }

.rightTreeWarp {
  width: 25vw !important;
  right: 1vw !important;
  position: fixed !important;
  overflow: hidden !important;
  border-radius: 16px !important;
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  transition: top 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.dark .rightTreeWarp { background: rgba(26, 26, 26, 0.8); border-color: rgba(255, 255, 255, 0.1); }

.rightTreeWarp::after {
  content: ""; position: absolute; inset: 0; border-radius: 16px; padding: 1.5px;
  background: linear-gradient(90deg, #409eff, #604ffd, #409eff);
  background-size: 200% 100%;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
  animation: ai-border-marquee 3s linear infinite;
  pointer-events: none;
}

@keyframes ai-border-marquee { 0% { background-position: 0% 0%; } 100% { background-position: 200% 0%; } }

.activeNode { background: #e1f0ff; border: 1px solid #a0cfff !important; }
.dark .activeNode { background: #2c3e50; border-color: #409eff !important; }

/* AI Assistant Styles (Partial) */
.ai-draggable-dialog {
  box-shadow: -10px 0 40px rgba(0, 0, 0, 0.1) !important;
  backdrop-filter: blur(25px) saturate(150%);
  border: 1px solid rgba(255, 255, 255, 0.3) !important;
  background: rgba(255, 255, 255, 0.6) !important;
  border-radius: 20px !important;
  position: relative;
}

.dark .ai-draggable-dialog { background: rgba(30, 30, 30, 0.7); }

.ai-draggable-dialog::after {
  content: ""; position: absolute; inset: 0; border-radius: 20px; padding: 1.5px;
  background: linear-gradient(90deg, #409eff, #604ffd, #409eff);
  background-size: 200%; animation: ai-border-marquee 3s linear infinite;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude; pointer-events: none;
}

/* Reusing complex styles from original */
.ai-slide-enter-active, .ai-slide-leave-active { transition: all 0.5s cubic-bezier(0.34, 1.56, 0.64, 1); }
.ai-slide-enter-from, .ai-slide-leave-to { transform: translateX(100%) scale(0.9); opacity: 0; filter: blur(10px); }

.chat-messages-list { display: flex; flex-direction: column; gap: 12px; padding: 10px; }
.chat-message-item { display: flex; width: 100%; }
.user-message { justify-content: flex-end; }
.ai-message { justify-content: flex-start; }

.question-content_1e1fE {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%) !important;
  color: white !important; border-radius: 18px 18px 2px 18px !important; padding: 12px 16px;
}

.answer-content-box_2Pu7S {
  background: #f4f7f9; border-radius: 18px 18px 18px 2px; border: 1px solid #eef2f5; padding: 12px 16px;
}

.dark .answer-content-box_2Pu7S { background: #2c2c2c; border-color: #444; color: #e0e0e0; }

.typing-dot { display: inline-block; animation: dot-pulse 1.5s infinite; margin: 0 2px; color: #409eff; font-weight: bold; }
@keyframes dot-pulse { 0%, 100% { opacity: 0.3; transform: scale(1); } 50% { opacity: 1; transform: scale(1.3); } }
</style>
