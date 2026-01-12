<template>
  <div class="course-detail-root" :class="currentTheme">
    <div class="layout-container" :class="currentTheme">
      <!-- 侧边栏菜单 -->
      <CourseSidebar
        :current-theme="currentTheme"
        :active-menu="activeMenu"
        @menu-click="handleMenuClick"
      />

      <div class="layout-inner-content" :class="currentTheme">
        <!-- 课程学习 (视频、目录、AI助教) -->
        <CourseStudy
          v-if="courseId"
          ref="courseStudyRef"
          :visible="activeMenu === 'course-learn'"
          :current-theme="currentTheme"
          :user-avatar="userAvatar"
          :user-nickname="userNickname"
          :course-name="courseDetail?.courseName"
          :current-hour="currentHour"
          :current-video-url="currentVideoUrl"
          :loading="loading"
          :course-content-html="courseContentHtml"
          :is-ai-dialog-visible="isAiDialogVisible"
          :chat-messages="chatMessages"
          :is-typing="isTyping"
          :sending-message="sendingMessage"
          :chapter-list="courseDetail?.courseChapterList"
          :active-node="activeNode"
          @go-back="goBack"
          @toggle-theme="e => toggleTheme(e)"
          @go-to-account="goToAccount"
          @logout="handleLogout"
          @video-loaded="videoLoaded"
          @video-ended="videoEnded"
          @open-ai="openAiDialog"
          @close-ai="closeAiDialog"
          @clear-chat="clearChat"
          @send-message="handleSendMessage"
          @node-click="handleNodeClick"
        />

        <!-- 知识点掌握 -->
        <MasteryPage
          :visible="activeMenu === 'mastery'"
          :current-theme="currentTheme"
          :study-effect-data="studyEffectData"
          :user-avatar="userAvatar"
          :user-nickname="userNickname"
          @go-back="goBack"
          @toggle-theme="e => toggleTheme(e)"
          @go-to-account="goToAccount"
          @logout="handleLogout"
        />

        <!-- 课程问答 -->
        <CourseQA
          :visible="activeMenu === 'course-qa'"
          :current-theme="currentTheme"
          :user-avatar="userAvatar"
          :user-nickname="userNickname"
          :qa-stats="qaStats"
          :qa-history-list="qaHistoryList"
          :chat-messages="chatMessages"
          :is-typing="isTyping"
          @go-back="goBack"
          @toggle-theme="e => toggleTheme(e)"
          @go-to-account="goToAccount"
          @logout="handleLogout"
          @send-message="handleSendMessage"
        />

        <!-- 作业考试 -->
        <HomeworkExam
          v-if="courseId"
          :visible="activeMenu === 'homework-exam'"
          :current-theme="currentTheme"
          :course-id="courseId"
          :homework-list="homeworkList"
          :exam-list="examList"
          :user-avatar="userAvatar"
          :user-nickname="userNickname"
          @go-back="goBack"
          @toggle-theme="e => toggleTheme(e)"
          @go-to-account="goToAccount"
          @logout="handleLogout"
        />

        <!-- 课程资料 -->
        <CourseMaterials
          :visible="activeMenu === 'course-materials'"
          :current-theme="currentTheme"
          :course-attr-list="courseAttrList"
          :user-avatar="userAvatar"
          :user-nickname="userNickname"
          @go-back="goBack"
          @toggle-theme="e => toggleTheme(e)"
          @go-to-account="goToAccount"
          @logout="handleLogout"
        />

        <!-- HTML 动画 -->
        <HtmlAnimations
          :visible="activeMenu === 'html-animations'"
          :current-theme="currentTheme"
          :loading="htmlAnimationLoading"
          :animation-list="htmlAnimationList"
          :user-avatar="userAvatar"
          :user-nickname="userNickname"
          @go-back="goBack"
          @toggle-theme="e => toggleTheme(e)"
          @go-to-account="goToAccount"
          @logout="handleLogout"
        />

        <!-- 课程成绩 -->
        <CourseGrades
          :visible="activeMenu === 'grades'"
          :current-theme="currentTheme"
          :course-scores="courseScores"
          :user-avatar="userAvatar"
          :user-nickname="userNickname"
          :course-id="courseId"
          @go-back="goBack"
          @toggle-theme="e => toggleTheme(e)"
          @go-to-account="goToAccount"
          @logout="handleLogout"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { storageLocal } from "@pureadmin/utils";
import { userKey } from "@/utils/auth";
import { useUserStoreHook } from "@/store/modules/user";

// 导入 API
import {
  getCourseDetail,
  reportCourseLesson,
  getCourseScore,
  getCourseStudyEffect
} from "@/api/frontend/course";
import { getCourseContentByName } from "@/utils/courseContents";
import {
  courseAIChatStream,
  getConversationHistory
} from "@/api/frontend/chat";
import {
  getUserCourseHomeworkList,
  getUserCourseExamList
} from "@/api/frontend/work";
import { getHtmlAnimationDisplay } from "@/api/htmlAnimation";

// 导入拆分后的组件
import {
  CourseSidebar,
  CourseStudy,
  MasteryPage,
  CourseQA,
  HomeworkExam,
  CourseMaterials,
  HtmlAnimations,
  CourseGrades
} from "./course-detail/index";

// 导入资源
import avatarDefault from "@/assets/course-detail-images/avatar-default.png";

const router = useRouter();
const route = useRoute();

// 基础状态
const baseCourseId = ref<number | null>(null);
const courseId = computed(() => baseCourseId.value);
const courseDetail = ref<any>(null);
const loading = ref(false);
const currentTheme = ref(storageLocal().getItem("course_theme") as string || "light");
const activeMenu = ref(
  (storageLocal().getItem(`course_detail_active_menu_${route.params.id}`) as string) ||
    "course-learn"
);

// 监听菜单变化并持久化
watch(activeMenu, newVal => {
  storageLocal().setItem(`course_detail_active_menu_${route.params.id}`, newVal);
  // 切换菜单时加载对应数据
  if (newVal === "homework-exam") {
    fetchHomeworkList();
    fetchExamList();
  } else if (newVal === "grades") {
    fetchCourseScores();
  } else if (newVal === "html-animations") {
    fetchHtmlAnimations();
  } else if (newVal === "mastery") {
    fetchCourseStudyEffect();
  }
});

// 监听路由参数变化，处理课程切换
watch(
  () => route.params.id,
  newId => {
    if (newId) {
      const id = Number(newId);
      baseCourseId.value = id;

      // 恢复新课程的菜单状态
      const savedMenu = storageLocal().getItem(
        `course_detail_active_menu_${id}`
      ) as string;
      activeMenu.value = savedMenu || "course-learn";

      // 恢复新课程的课时状态
      const savedNode = storageLocal().getItem(
        `course_detail_active_node_${id}`
      ) as string;
      activeNode.value = savedNode || "1.1";

      fetchCourseDetail();

      // 如果不是默认页，加载对应数据
      if (activeMenu.value !== "course-learn") {
        const menuName = activeMenu.value;
        if (menuName === "homework-exam") {
          fetchHomeworkList();
          fetchExamList();
        } else if (menuName === "grades") {
          fetchCourseScores();
        } else if (menuName === "html-animations") {
          fetchHtmlAnimations();
        } else if (menuName === "mastery") {
          fetchCourseStudyEffect();
        }
      }
    }
  }
);

// 用户信息
const userInfo = storageLocal().getItem(userKey) || {};
const userAvatar = ref((userInfo as any)?.avatar || avatarDefault);
const userNickname = ref(
  (userInfo as any)?.nickname || (userInfo as any)?.username || "用户"
);

// 课程学习相关
const courseStudyRef = ref(null);
const currentHour = ref(null);
const currentVideoUrl = ref("");
const activeNode = ref(
  (storageLocal().getItem(`course_detail_active_node_${route.params.id}`) as string) || "1.1"
);
const autoPlayOnLoad = ref(false);
const courseContentHtml = computed(() => {
  return courseDetail.value ? getCourseContentByName(courseDetail.value.courseName) : "加载中...";
});

// AI 聊天相关
const isAiDialogVisible = ref(false);
const conversationId = ref("");
const previousChapterId = ref<number | null>(null);
const chatMessages = ref<any[]>([]);
const isTyping = ref(false);
const sendingMessage = ref(false);
const cancelStreamRequest = ref<any>(null);

// 知识点掌握相关
const studyEffectData = ref<any>({
  courseId: 0,
  keyPointNum: 0,
  difficultPointNum: 0,
  knowledgePointNum: 0,
  conceptNum: 0,
  chapterList: []
});

// 课程问答相关
const qaStats = ref({
  totalQuestions: 12,
  solvedQuestions: 10,
  solveRate: "83%",
  avgResponseTime: "5分钟"
});
const qaHistoryList = ref<any[]>([]);

// 作业考试相关
const homeworkList = ref<any[]>([]);
const examList = ref<any[]>([]);

// 课程资料相关
const courseAttrList = ref<any[]>([]);

// HTML 动画相关
const htmlAnimationList = ref<any[]>([]);
const htmlAnimationLoading = ref(false);

// 成绩相关
const courseScores = ref<any>(null);

// ================= 方法 =================

// 主题切换
const toggleTheme = (event?: MouseEvent) => {
  if (loading.value) return;

  const x = event?.clientX ?? window.innerWidth / 2;
  const y = event.clientY ?? window.innerHeight / 2;
  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  // 创建扩散遮罩层 (全浏览器兼容方案)
  const overlay = document.createElement("div");
  const isToDark = currentTheme.value === "light";

  overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: 2147483647;
    pointer-events: none;
    background: ${isToDark ? "#1a1a1a" : "#f5f7fa"};
    clip-path: circle(0px at ${x}px ${y}px);
    transition: clip-path 600ms cubic-bezier(0.4, 0, 0.2, 1);
  `;
  document.body.appendChild(overlay);

  // 触发扩散
  requestAnimationFrame(() => {
    overlay.style.clipPath = `circle(${endRadius}px at ${x}px ${y}px)`;
  });

  // 切换实际主题
  setTimeout(() => {
    performThemeToggle();
    nextTick(() => {
      // 渐隐移除遮罩
      overlay.style.transition =
        "opacity 500ms ease, clip-path 600ms cubic-bezier(0.4, 0, 0.2, 1)";
      overlay.style.opacity = "0";

      setTimeout(() => {
        overlay.remove();
      }, 500);
    });
  }, 500);
};

const performThemeToggle = () => {
  const oldTheme = currentTheme.value;
  const newTheme = oldTheme === "light" ? "dark" : "light";
  currentTheme.value = newTheme;
};

// 监听主题变化
watch(currentTheme, (val) => {
  storageLocal().setItem("course_theme", val);
  const other = val === "light" ? "dark" : "light";
  document.documentElement.classList.remove(other);
  document.documentElement.classList.add(val);
  document.body.classList.remove(other);
  document.body.classList.add(val);

  // 同步到管理后台主题设置
  const layout = storageLocal().getItem("responsive-layout") as any;
  if (layout) {
    layout.darkMode = val === "dark";
    storageLocal().setItem("responsive-layout", layout);
  }
}, { immediate: true });

// 菜单切换
const handleMenuClick = (menuName: string) => {
  activeMenu.value = menuName;

  // 如果视频正在播放且切换到了非课程学习菜单，则暂停视频
  const videoPlayerEl = courseStudyRef.value?.videoPlayer;
  if (menuName !== "course-learn" && videoPlayerEl) {
    if (!videoPlayerEl.paused) {
      videoPlayerEl.pause();
    }
  }

  // 加载对应数据
  if (menuName === "homework-exam") {
    fetchHomeworkList();
    fetchExamList();
  } else if (menuName === "grades") {
    fetchCourseScores();
  } else if (menuName === "html-animations") {
    fetchHtmlAnimations();
  } else if (menuName === "mastery") {
    fetchCourseStudyEffect();
  }
};

// 返回
const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push("/account");
  }
};

// 跳转账号管理
const goToAccount = () => {
  // 课程详情页是从学生中心进入的，账号管理应跳转回学生中心
  router.push("/account");
};

// 退出登录
const handleLogout = () => {
  ElMessageBox.confirm("确定要退出登录吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      useUserStoreHook().logOut();
    })
    .catch(() => {});
};

// 获取课程详情
const fetchCourseDetail = async () => {
  if (!courseId.value) return;
  loading.value = true;
  try {
    const { code, data, msg } = await getCourseDetail({ courseId: courseId.value });
    if (code === 200 && data) {
      courseDetail.value = data;
      if (data.courseAttrList) courseAttrList.value = data.courseAttrList;

      // 恢复上次观看的课时或默认加载第一个课时
      if (data.courseChapterList?.length > 0) {
        const savedNodeId = storageLocal().getItem(
          `course_detail_active_node_${courseId.value}`
        ) as string;
        let targetHour = null;
        let targetNodeId = "1.1";

        if (savedNodeId) {
          const parts = savedNodeId.split(".");
          if (parts.length === 2) {
            const cIdx = parseInt(parts[0]) - 1;
            const hIdx = parseInt(parts[1]) - 1;
            targetHour = data.courseChapterList[cIdx]?.hourList?.[hIdx];
            if (targetHour) {
              targetNodeId = savedNodeId;
            }
          }
        }

        if (!targetHour) {
          targetHour = data.courseChapterList[0].hourList?.[0];
        }

        if (targetHour) {
          currentHour.value = targetHour;
          currentVideoUrl.value = targetHour.fileUrl;
          activeNode.value = targetNodeId;
          // 只有在课程学习标签页时才自动播放
          autoPlayOnLoad.value = activeMenu.value === "course-learn";
        }
      }
    } else {
      ElMessage.error(msg || "获取课程详情失败");
    }
  } catch (error) {
    console.error("获取课程详情出错:", error);
  } finally {
    loading.value = false;
  }
};

// 视频加载与播放
const videoLoaded = () => {
  const videoPlayerEl = courseStudyRef.value?.videoPlayer;
  if (autoPlayOnLoad.value && videoPlayerEl) {
    videoPlayerEl.play();
    autoPlayOnLoad.value = false;
  }
};

const videoEnded = async () => {
  if (currentHour.value && currentHour.value.finished !== 1) {
    try {
      await reportCourseLesson({ courseId: courseId.value, hourId: currentHour.value.hourId });
      currentHour.value.finished = 1;
      if (courseDetail.value) courseDetail.value.finishedHours += 1;
      ElMessage.success("学习进度已更新");
    } catch (error) {
      console.error("进度上报失败:", error);
    }
  }
};

const handleNodeClick = (nodeId: string, hour: any) => {
  activeNode.value = nodeId;
  storageLocal().setItem(`course_detail_active_node_${courseId.value}`, nodeId);
  if (hour?.fileUrl) {
    currentHour.value = hour;
    const oldUrl = currentVideoUrl.value;
    currentVideoUrl.value = hour.fileUrl;
    if (oldUrl !== hour.fileUrl) autoPlayOnLoad.value = true;

    const videoPlayerEl = courseStudyRef.value?.videoPlayer;
    if (videoPlayerEl && oldUrl === hour.fileUrl) {
      videoPlayerEl.currentTime = 0;
      videoPlayerEl.play();
    }
  }
};

// AI 聊天逻辑
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

const getCurrentChapterId = () => {
  if (!currentHour.value || !courseDetail.value?.courseChapterList) return null;
  for (const chapter of courseDetail.value.courseChapterList) {
    if (chapter.hourList?.some(h => h.hourId === currentHour.value.hourId)) {
      return chapter.chapterId;
    }
  }
  return null;
};

const handleSendMessage = async (content: string) => {
  if (!content.trim() || sendingMessage.value) return;
  const userMsg = content.trim();
  const currentChapterId = getCurrentChapterId();

  if (currentChapterId !== null && previousChapterId.value !== null && currentChapterId !== previousChapterId.value) {
    conversationId.value = Date.now().toString() + Math.random().toString(36).substring(2);
    chatMessages.value = [];
  }
  previousChapterId.value = currentChapterId;

  chatMessages.value.push({ role: "user", content: userMsg, timestamp: new Date().toISOString() });
  sendingMessage.value = true;
  isTyping.value = true;

  try {
    let aiMessageAdded = false;
    cancelStreamRequest.value = courseAIChatStream(
      { course_id: courseId.value, conversation_id: conversationId.value, message: userMsg, chapter_id: currentChapterId },
      (data) => {
        if (data.conversation_id) conversationId.value = data.conversation_id;
        if (data.delta) {
          if (!aiMessageAdded) {
            isTyping.value = false;
            aiMessageAdded = true;
            chatMessages.value.push({ role: "ai", content: data.delta, timestamp: new Date().toISOString() });
          } else {
            chatMessages.value[chatMessages.value.length - 1].content += data.delta;
          }
        }
        if (data.finished) {
          sendingMessage.value = false;
          isTyping.value = false;
        }
      }
    );
  } catch (error) {
    ElMessage.error("发送失败");
    sendingMessage.value = false;
    isTyping.value = false;
  }
};

const clearChat = () => {
  ElMessageBox.confirm("确定清空聊天记录？", "清空对话", {
    confirmButtonText: "确定清空",
    cancelButtonText: "取消",
    type: "warning",
    customClass: "clear-chat-confirm-dialog",
    confirmButtonClass: "clear-chat-confirm-btn",
    cancelButtonClass: "clear-chat-cancel-btn",
    showClose: true,
    closeOnClickModal: true,
    closeOnPressEscape: true,
    center: true,
    draggable: true,
    icon: "Delete"
  }).then(() => {
    chatMessages.value = [];
    ElMessage.success("聊天记录已清空");
  }).catch(() => {});
};

// 数据获取方法
const fetchHomeworkList = async () => {
  if (!courseId.value) return;
  try {
    const { code, data } = await getUserCourseHomeworkList({ courseId: courseId.value });
    if (code === 200) homeworkList.value = (data as any).list || [];
  } catch (e) {}
};

const fetchExamList = async () => {
  if (!courseId.value) return;
  try {
    const { code, data } = await getUserCourseExamList({ courseId: courseId.value });
    if (code === 200) examList.value = (data as any).list || [];
  } catch (e) {}
};

const fetchHtmlAnimations = async () => {
  if (!courseDetail.value) return;
  htmlAnimationLoading.value = true;
  try {
    const chapters = courseDetail.value.courseChapterList || [];
    const results = await Promise.all(
      chapters.map(async (ch: any) => {
        try {
          const { data } = await getHtmlAnimationDisplay({
            courseId: courseDetail.value.courseId,
            chapterId: ch.chapterId
          });
          if (data?.url) {
            return {
              chapterId: ch.chapterId,
              chapterName: ch.name,
              version: data.version,
              url: data.url,
              previewUrl: data.previewUrl
            };
          }
        } catch (e) {
          return null;
        }
        return null;
      })
    );

    // 过滤掉空值并进行去重（根据 chapterId），防止后端数据重复或并发引起的重复
    const animationData = results.filter(item => item !== null);
    const uniqueMap = new Map();
    animationData.forEach(item => {
      if (!uniqueMap.has(item.chapterId)) {
        uniqueMap.set(item.chapterId, item);
      }
    });

    htmlAnimationList.value = Array.from(uniqueMap.values());
  } finally {
    htmlAnimationLoading.value = false;
  }
};

const fetchCourseScores = async () => {
  if (!courseId.value) return;
  try {
    const response = await getCourseScore({ courseId: courseId.value });
    if (response?.code === 200) courseScores.value = response.data;
  } catch (e) {}
};

const fetchCourseStudyEffect = async () => {
  try {
    const response = await getCourseStudyEffect({ courseId: courseId.value });
    if (response?.code === 200) studyEffectData.value = response.data;
  } catch (e) {}
};

// 初始化课程问答历史数据
const initQAHistory = () => {
  qaHistoryList.value = [
    {
      question: "这门课程的考核方式是什么？",
      answer: "本课程采用线上考试的方式进行考核，总成绩由平时作业（30%）、课堂表现（20%）和期末考试（50%）三部分构成。",
      timestamp: "2025-08-13T16:30:00Z"
    },
    {
      question: "这门课程的成绩构成是怎么样的？",
      answer: "课程成绩由平时作业（30%）、课堂表现（20%）和期末考试（50%）三部分构成。平时作业包括每周的课后练习和项目作业，课堂表现包括课堂参与度和小组讨论。",
      timestamp: "2025-08-13T15:45:00Z"
    },
    {
      question: "期末考试的范围是什么？",
      answer: "期末考试范围包括课程的所有章节内容，特别关注第3、4、7章的核心概念和应用案例。考试形式为线上闭卷，时间为90分钟。",
      timestamp: "2025-08-12T09:15:00Z"
    }
  ];
};

onMounted(async () => {
  document.body.classList.add("course-page");
  baseCourseId.value = Number(route.params.id);
  await fetchCourseDetail();
  initQAHistory();

  // 初始化加载对应数据（如果不是默认页）
  if (activeMenu.value !== "course-learn") {
    const menuName = activeMenu.value;
    if (menuName === "homework-exam") {
      fetchHomeworkList();
      fetchExamList();
    } else if (menuName === "grades") {
      fetchCourseScores();
    } else if (menuName === "html-animations") {
      fetchHtmlAnimations();
    } else if (menuName === "mastery") {
      fetchCourseStudyEffect();
    }
  }

  // 初始化 AI 聊天
  const storedId = localStorage.getItem(`chat_${courseId.value}`);
  if (storedId) {
    conversationId.value = storedId;
    try {
      const res = await getConversationHistory(storedId);
      if (res?.code === 200) chatMessages.value = res.data.history || [];
    } catch (e) {}
  } else {
    conversationId.value = Date.now().toString() + Math.random().toString(36).substring(2);
    localStorage.setItem(`chat_${courseId.value}`, conversationId.value);
  }
});

onBeforeUnmount(() => {
  document.body.classList.remove("course-page");
});
</script>

<style lang="scss">
@import "@/../coursecss/css/chunk-b3e9f934.1c00050a.css";
@import "@/../coursecss/css/chunk-8cf7ce30.92e48af1.css";
@import "@/../coursecss/css/chunk-3cf64ec0.4f07a253.css";
@import "@/../coursecss/css/chunk-3248eec0.130a3cd9.css";
@import "@/../coursecss/css/app.a5f91bbb.css";
@import "@/../coursecss/css/chunk-b4b575b6.fcb08796.css";

.course-detail-root {
  width: 100%;
  min-height: 100vh;
  background-color: #f5f7fa;
  transition: background-color 0.3s ease;

  &.dark {
    background-color: #1a1a1a;
  }

  .layout-container {
    position: relative;
    width: 100%;
    min-height: 100vh;
    display: flex;
    background-color: #f5f7fa;
    transition: background-color 0.3s ease;

    &.dark {
      background-color: #1a1a1a;
    }
  }

  /* 覆盖外部CSS中的侧边栏样式 */
  .layout-sidebar {
    &.light,
    &[class*="light"] {
      height: auto;
      max-height: calc(100vh - 97px);
    }
  }

  .layout-inner-content {
    position: relative;
    flex: 1;
    margin: 20px 15px 15px 90px;
    height: calc(100vh - 35px);
    border-radius: 24px;
    overflow: hidden; /* 容器层级不滚动，由子页面内部滚动 */
    background-color: #f5f7fa;
    transition: all 0.3s ease;

    &.dark {
      background-color: #1a1a1a;
    }
  }
}

/* 清空对话 确认框美化 */
.clear-chat-confirm-dialog {
  border-radius: 20px !important;
  padding: 8px;
  overflow: hidden;
  border: none !important;
  box-shadow: 0 12px 32px 4px rgba(0, 0, 0, 0.15) !important;
  max-width: 400px !important;

  .el-message-box__header {
    padding-top: 25px;
    padding-bottom: 5px;
    
    .el-message-box__title {
      font-weight: 600;
      font-size: 18px;
      color: #303133;
    }

    .el-message-box__headerbtn {
      top: 15px;
      right: 15px;
      font-size: 20px;
    }
  }

  .el-message-box__content {
    padding: 15px 30px 25px;
    
    .el-message-box__container {
      margin-left: 0;
      justify-content: center;
    }
    
    .el-message-box__status {
      display: none;
    }
    
    .el-message-box__message {
      font-size: 15px;
      color: #606266;
      font-weight: 500;
    }
  }

  .el-message-box__btns {
    padding: 0 20px 25px;
    display: flex;
    justify-content: center;
    gap: 16px;

    button {
      height: 42px;
      width: 120px;
      padding: 0;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      margin: 0 !important;
    }
  }
}

.clear-chat-cancel-btn {
  background: #f4f7f9 !important;
  border: 1px solid #e4e7ed !important;
  color: #909399 !important;

  &:hover {
    background: #eef2f5 !important;
    color: #606266 !important;
    border-color: #dcdfe6 !important;
  }
}

.clear-chat-confirm-btn {
  background: linear-gradient(135deg, #409eff 0%, #604ffd 100%) !important;
  border: none !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(64, 158, 255, 0.4);
    opacity: 0.9;
  }

  &:active {
    transform: translateY(0);
  }
}

/* 深色模式适配 */
html.dark {
  .clear-chat-confirm-dialog {
    background-color: #1a1a24 !important;
    border: 1px solid rgba(255, 255, 255, 0.1) !important;

    .el-message-box__title {
      color: #e0e0e0 !important;
    }

    .el-message-box__message {
      color: #c0c4cc !important;
    }
  }

  .clear-chat-cancel-btn {
    background: #2a2a3a !important;
    border-color: #3a3a4a !important;
    color: #909399 !important;

    &:hover {
      background: #3a3a4a !important;
      color: #e0e0e0 !important;
    }
  }
}
</style>

<style scoped lang="scss">
/* ==================== 2. AI 对话窗口样式修复 ==================== */
.course-detail-root {
  :deep(.ai-helper-sections) {
    position: relative;
  }

  :deep(.out-ai-pro-talk-box) {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(245, 247, 250, 0.9) 100%);
    backdrop-filter: blur(20px) saturate(180%);
    border-radius: 20px;
    border: 1px solid rgba(64, 158, 255, 0.2);
    box-shadow: 0 8px 32px -4px rgba(64, 158, 255, 0.2);
    padding: 16px;
    transition: all 0.3s ease;

    .inset-div {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .photo {
      width: 48px;
      height: 48px;
      border-radius: 50%;
      overflow: hidden;
      flex-shrink: 0;
      border: 2px solid rgba(64, 158, 255, 0.3);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .ai-hepler-pro-box {
      flex: 1;
      min-width: 0;
    }

    .people-name {
      font-size: 14px;
      font-weight: 600;
      color: #303133;
      margin-bottom: 4px;
    }

    .init-talk-cotent {
      font-size: 12px;
      color: #909399;
    }

    .ai-hepler-pro-input {
      position: relative;
      margin-top: 12px;

      .el-input__inner {
        height: 40px;
        border-radius: 20px;
        border: 1px solid #dcdfe6;
        background: #fff;
        padding-left: 16px;
        padding-right: 44px;
        font-size: 13px;
        transition: all 0.3s ease;

        &:focus {
          border-color: #409eff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
        }
      }
    }

    .mock-send-btn {
      position: absolute;
      right: 8px;
      top: 50%;
      transform: translateY(-50%);
      width: 28px;
      height: 28px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
      border-radius: 50%;
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-50%) scale(1.1);
        box-shadow: 0 4px 12px rgba(64, 158, 255, 0.4);
      }

      svg {
        width: 14px;
        height: 14px;
        fill: white;
      }
    }
  }

  &.dark :deep(.out-ai-pro-talk-box) {
    background: linear-gradient(135deg, rgba(40, 40, 50, 0.9) 0%, rgba(30, 30, 40, 0.9) 100%);
    border: 1px solid rgba(64, 158, 255, 0.3);
    box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.4);

    .people-name {
      color: #e0e0e0;
    }

    .ai-hepler-pro-input .el-input__inner {
      background: #2c2c2c;
      border-color: #444;
      color: #e0e0e0;
    }
  }

  :deep(.glow-border) {
    position: relative;

    &::before {
      content: "";
      position: absolute;
      inset: -2px;
      border-radius: 22px;
      padding: 2px;
      background: linear-gradient(90deg, #409eff, #604ffd, #409eff);
      background-size: 200% 100%;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      animation: ai-glow-border 3s linear infinite;
      pointer-events: none;
    }
  }

  :deep(.ai-draggable-dialog) {
    position: fixed;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(25px) saturate(150%);
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 20px 60px -10px rgba(64, 158, 255, 0.25);
    overflow: hidden;

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 20px;
      padding: 1.5px;
      background: linear-gradient(90deg, #409eff, #604ffd, #409eff);
      background-size: 200% 100%;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      animation: ai-glow-border 3s linear infinite;
      pointer-events: none;
    }
  }

  &.dark :deep(.ai-draggable-dialog) {
    background: rgba(30, 30, 40, 0.95);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 20px 60px -10px rgba(0, 0, 0, 0.5);
  }

  :deep(.ai-dialog-header-bar) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    background: linear-gradient(135deg, rgba(64, 158, 255, 0.1) 0%, rgba(96, 79, 253, 0.1) 100%);
    border-bottom: 1px solid rgba(64, 158, 255, 0.1);

    .header-title-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .status-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: #67c23a;
      animation: pulse-dot 2s ease-in-out infinite;
    }

    .header-title {
      font-size: 15px;
      font-weight: 600;
      color: #303133;
    }

    .header-left,
    .header-right {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .header-back-btn,
    .header-action-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      background: rgba(64, 158, 255, 0.1);

      &:hover {
        background: rgba(64, 158, 255, 0.2);
        transform: scale(1.05);
      }
    }
  }

  &.dark :deep(.ai-dialog-header-bar) {
    .header-title {
      color: #e0e0e0;
    }
  }

  :deep(.ai-fill-bg) {
    background: linear-gradient(180deg, rgba(245, 247, 250, 0.5) 0%, rgba(255, 255, 255, 0.8) 100%);
  }

  &.dark :deep(.ai-fill-bg) {
    background: linear-gradient(180deg, rgba(30, 30, 40, 0.5) 0%, rgba(40, 40, 50, 0.8) 100%);
  }

  :deep(.ai-talk-box) {
    height: 100%;
    overflow: hidden;
  }

  :deep(.chat-scrollbar) {
    height: 100%;
  }

  :deep(.header-tips-box) {
    text-align: center;
    padding: 20px;

    .robbot-icon {
      width: 60px;
      height: 60px;
      margin: 0 auto 12px;
      border-radius: 50%;
      overflow: hidden;
      border: 3px solid rgba(64, 158, 255, 0.3);

      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
    }

    .code-hello {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      margin: 12px 0 8px;
    }

    .ai-heler-header-tips {
      font-size: 13px;
      color: #909399;
      line-height: 1.6;
    }
  }

  &.dark :deep(.header-tips-box .code-hello) {
    color: #e0e0e0;
  }

  :deep(.talk-input-box) {
    padding: 12px 16px;
    border-top: 1px solid rgba(64, 158, 255, 0.1);
    background: rgba(255, 255, 255, 0.8);

    .input-box {
      display: flex;
      align-items: flex-end;
      gap: 12px;
    }

    .ai-pro-content-edit-box {
      flex: 1;

      .el-textarea__inner {
        border-radius: 16px;
        border: 1px solid #dcdfe6;
        padding: 10px 16px;
        font-size: 14px;
        resize: none;
        max-height: 120px;
        transition: all 0.3s ease;

        &:focus {
          border-color: #409eff;
          box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.2);
        }
      }
    }

    .send-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
      border-radius: 12px;
      cursor: pointer;
      transition: all 0.3s ease;
      flex-shrink: 0;

      &:hover {
        transform: scale(1.05);
        box-shadow: 0 4px 166px rgba(64, 158, 255, 0.4);
      }

      svg {
        width: 20px;
        height: 20px;
        fill: white;
      }
    }

    .not-send-btn {
      width: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: center;
      background: #e4e7ed;
      border-radius: 12px;
      flex-shrink: 0;

      svg {
        width: 20px;
        height: 20px;
        fill: #909399;
      }
    }
  }

  &.dark :deep(.talk-input-box) {
    background: rgba(30, 30, 40, 0.8);
    border-top-color: rgba(255, 255, 255, 0.1);

    .ai-pro-content-edit-box .el-textarea__inner {
      background: #2c2c2c;
      border-color: #444;
      color: #e0e0e0;
    }

    .not-send-btn {
      background: #444;
    }
  }

  /* ====================3. 目录样式修复 ==================== */
  :deep(.rightTreeWarp) {
    position: fixed;
    width: 25vw;
    right: 1vw;
    background: rgba(255, 255, 255, 0.9);
    backdrop-filter: blur(20px) saturate(180%);
    border-radius: 16px;
    border: 1px solid rgba(64, 158, 255, 0.15);
    box-shadow: 0 8px 32px -4px rgba(64, 158, 255, 0.15);
    overflow: hidden;
    transition: top 0.4s cubic-bezier(0.4, 0, 0.2, 1);

    &::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: 16px;
      padding: 1.5px;
      background: linear-gradient(90deg, #409eff, #604ffd, #409eff);
      background-size: 200% 100%;
      -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
      mask-composite: exclude;
      animation: ai-glow-border 3s linear infinite;
      pointer-events: none;
    }

    .top-title {
      padding: 16px 20px;
      font-size: 16px;
      font-weight: 600;
      color: #303133;
      border-bottom: 1px solid rgba(64, 158, 255, 0.1);
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.05) 0%, rgba(96, 79, 253, 0.05) 100%);
    }

    .chapterList-box {
      padding: 12px;
    }

    .list {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    .chapter {
      padding: 12px 16px;
      margin-bottom: 8px;
      border-radius: 10px;
      background: linear-gradient(135deg, rgba(64, 158, 255, 0.08) 0%, rgba(96, 79, 253, 0.08) 100%);

      .catalogue_title3 {
        font-size: 13px;
        font-weight: 600;
        color: #409eff;
        margin-right: 8px;
      }

      .catalogue_title {
        font-size: 14px;
        font-weight: 500;
        color: #303133;
      }
    }

    .inner-li {
      margin-left: 8px;
    }

    .video {
      padding: 10px 12px;
      margin-bottom: 4px;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.3s ease;
      border: 1px solid transparent;

      &:hover {
        background: rgba(64, 158, 255, 0.08);
        border-color: rgba(64, 158, 255, 0.2);
      }

      &.activeNode {
        background: linear-gradient(135deg, rgba(64, 158, 255, 0.15) 0%, rgba(96, 79, 253, 0.15) 100%);
        border-color: rgba(64, 158, 255, 0.3);
      }

      .catalogue_title3 {
        font-size: 12px;
        color: #909399;
        margin-right: 8px;
      }

      .catalogue_title {
        font-size: 13px;
        color: #606266;
        line-height: 1.4;
      }

      .resource-box {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 6px;
      }

      .resource-text {
        font-size: 11px;
        color: #909399;
      }

      .resource-bar {
        flex: 1;
        max-width: 80px;
      }

      .icon-box .isFinish {
        width: 20px;
        height: 20px;

        img {
          width: 100%;
          height: 100%;
        }
      }
    }

    .el-progress-bar__outer {
      background: #e4e7ed;
      border-radius: 4px;
    }

    .el-progress-bar__inner {
      background: linear-gradient(90deg, #409eff, #66b1ff);
      border-radius: 4px;
    }
  }

  &.dark :deep(.rightTreeWarp) {
    background: rgba(30, 30, 40, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.4);

    .top-title {
      color: #e0e0e0;
      border-bottom-color: rgba(255, 255, 255, 0.1);
    }

    .chapter .catalogue_title {
      color: #e0e0e0;
    }

    .video .catalogue_title {
      color: #c0c4cc;
    }

    .el-progress-bar__outer {
      background: #444;
    }
  }
}

@keyframes ai-glow-border {
  0% { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(0.8); }
}
</style>
