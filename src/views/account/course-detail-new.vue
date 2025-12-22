<template>
  <div id="app" :class="currentTheme">
    <div class="layout-container" :class="currentTheme">
      <!-- 侧边栏菜单 -->
      <CourseSidebar
        :current-theme="currentTheme"
        :active-menu="activeMenu"
        @menu-click="handleMenuClick"
      />

      <div class="layout-inner-content" :class="currentTheme">
        <!-- 课程资料 -->
        <CourseMaterials
          :visible="activeMenu === 'course-materials'"
          :current-theme="currentTheme"
          :course-attr-list="courseAttrList"
          :user-avatar="userAvatar"
          :user-nickname="userNickname"
          @go-back="goBack"
          @toggle-theme="toggleTheme"
          @go-to-account="goToAccount"
          @logout="handleLogout"
        />

        <!-- HTML 动画列表 -->
        <HtmlAnimations
          :visible="activeMenu === 'html-animations'"
          :current-theme="currentTheme"
          :loading="htmlAnimationLoading"
          :animation-list="htmlAnimationList"
          :user-avatar="userAvatar"
          :user-nickname="userNickname"
          @go-back="goBack"
          @toggle-theme="toggleTheme"
          @go-to-account="goToAccount"
          @logout="handleLogout"
        />

        <!-- 作业考试 -->
        <HomeworkExam
          :visible="activeMenu === 'homework-exam'"
          :current-theme="currentTheme"
          :course-id="courseId"
          :homework-list="homeworkList"
          :exam-list="examList"
          :user-avatar="userAvatar"
          :user-nickname="userNickname"
          @go-back="goBack"
          @toggle-theme="toggleTheme"
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
          @go-back="goBack"
          @toggle-theme="toggleTheme"
          @go-to-account="goToAccount"
          @logout="handleLogout"
        />

        <!-- 课程学习、知识点、课程问答 - 保持原有结构，后续可继续拆分 -->
        <!-- 这些模块较复杂，包含 AI 助教等交互功能，暂时保留在主文件中 -->
        
        <!-- 课程学习占位 -->
        <div v-show="activeMenu === 'course-learn'" class="course-learn-placeholder">
          <CourseHeader
            :current-theme="currentTheme"
            title="章节模式"
            :user-avatar="userAvatar"
            :user-nickname="userNickname"
            @go-back="goBack"
            @toggle-theme="toggleTheme"
            @go-to-account="goToAccount"
            @logout="handleLogout"
          />
          <div class="placeholder-content">
            <p>课程学习模块（包含视频播放、目录、AI助教）</p>
            <p>该模块较复杂，建议后续继续拆分为：</p>
            <ul>
              <li>CourseVideoPlayer.vue - 视频播放器</li>
              <li>CourseCatalog.vue - 课程目录</li>
              <li>AiAssistant.vue - AI助教对话</li>
            </ul>
          </div>
        </div>

        <!-- 知识点占位 -->
        <div v-show="activeMenu === 'mastery'" class="mastery-placeholder">
          <CourseHeader
            :current-theme="currentTheme"
            title="知识点掌握"
            :user-avatar="userAvatar"
            :user-nickname="userNickname"
            @go-back="goBack"
            @toggle-theme="toggleTheme"
            @go-to-account="goToAccount"
            @logout="handleLogout"
          />
          <div class="placeholder-content">
            <p>知识点掌握模块</p>
            <p>该模块包含图表展示，建议后续拆分为 MasteryPage.vue</p>
          </div>
        </div>

        <!-- 课程问答占位 -->
        <div v-show="activeMenu === 'course-qa'" class="course-qa-placeholder">
          <CourseHeader
            :current-theme="currentTheme"
            title="课程问答"
            :user-avatar="userAvatar"
            :user-nickname="userNickname"
            @go-back="goBack"
            @toggle-theme="toggleTheme"
            @go-to-account="goToAccount"
            @logout="handleLogout"
          />
          <div class="placeholder-content">
            <p>课程问答模块</p>
            <p>该模块包含聊天功能，建议后续拆分为 CourseQA.vue</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { ElMessage, ElMessageBox } from "element-plus";
import { storageLocal } from "@pureadmin/utils";
import { userKey } from "@/utils/auth";
import { useUserStoreHook } from "@/store/modules/user";

// 导入拆分后的组件
import {
  CourseHeader,
  CourseSidebar,
  CourseMaterials,
  HtmlAnimations,
  HomeworkExam,
  CourseGrades
} from "./course-detail/index";

// 导入 API
import {
  getCourseDetail,
  getCourseScore,
  CourseScoreResult
} from "@/api/frontend/course";
import {
  getUserCourseHomeworkList,
  getUserCourseExamList
} from "@/api/frontend/work";
import { getHtmlAnimationDisplay } from "@/api/htmlAnimation";

// 导入资源
import avatarDefault from "@/assets/course-detail-images/avatar-default.png";

const router = useRouter();
const route = useRoute();

// 基础状态
const baseCourseId = ref<number | null>(null);
const courseId = computed(() => baseCourseId.value);
const courseDetail = ref<any>(null);
const loading = ref(false);
const currentTheme = ref("light");
const activeMenu = ref("course-learn");

// 用户信息
const userInfo = storageLocal().getItem(userKey) || {};
const userAvatar = ref((userInfo as any)?.avatar || avatarDefault);
const userNickname = ref(
  (userInfo as any)?.nickname || (userInfo as any)?.username || "用户"
);

// 课程资料
const courseAttrList = ref<any[]>([]);

// HTML 动画
const htmlAnimationList = ref<any[]>([]);
const htmlAnimationLoading = ref(false);

// 作业考试
const homeworkList = ref<any[]>([]);
const examList = ref<any[]>([]);

// 成绩
const courseScores = ref<CourseScoreResult | null>(null);

// 主题切换
const toggleTheme = () => {
  const oldTheme = currentTheme.value;
  const newTheme = oldTheme === "light" ? "dark" : "light";

  document.body.classList.remove(oldTheme);
  document.body.classList.add(newTheme);

  currentTheme.value = newTheme;
};

// 菜单切换
const handleMenuClick = (menuName: string) => {
  activeMenu.value = menuName;

  // 根据菜单加载对应数据
  if (menuName === "homework-exam") {
    fetchHomeworkList();
    fetchExamList();
  }

  if (menuName === "grades") {
    fetchCourseScores();
  }

  if (menuName === "html-animations") {
    fetchHtmlAnimations();
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
  router.push("/account/settings");
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
    const { code, data, msg } = await getCourseDetail({
      courseId: courseId.value
    });

    if (code === 200 && data) {
      courseDetail.value = data;
      if (data.courseAttrList) {
        courseAttrList.value = data.courseAttrList;
      }
    } else {
      ElMessage.error(msg || "获取课程详情失败");
    }
  } catch (error) {
    console.error("获取课程详情出错:", error);
    ElMessage.error("获取课程详情数据失败，请稍后重试");
  } finally {
    loading.value = false;
  }
};

// 获取作业列表
const fetchHomeworkList = async () => {
  if (!courseId.value) return;

  try {
    const { code, data, msg } = await getUserCourseHomeworkList({
      courseId: courseId.value
    });

    if (code === 200 && data && (data as any).list) {
      homeworkList.value = (data as any).list;
    }
  } catch (error) {
    console.error("获取作业列表出错:", error);
  }
};

// 获取考试列表
const fetchExamList = async () => {
  if (!courseId.value) return;

  try {
    const { code, data, msg } = await getUserCourseExamList({
      courseId: courseId.value
    });

    if (code === 200 && data && (data as any).list) {
      examList.value = (data as any).list;
    }
  } catch (error) {
    console.error("获取考试列表出错:", error);
  }
};

// 获取 HTML 动画
const fetchHtmlAnimations = async () => {
  if (!courseDetail.value) return;
  htmlAnimationLoading.value = true;
  htmlAnimationList.value = [];
  
  try {
    const chapters = courseDetail.value.courseChapterList || [];
    const promises = chapters.map(async (ch: any) => {
      try {
        const { data } = await getHtmlAnimationDisplay({
          courseId: courseDetail.value.courseId,
          chapterId: ch.chapterId
        });
        if (data && data.url) {
          htmlAnimationList.value.push({
            chapterId: ch.chapterId,
            chapterName: ch.name || ch.chapterName,
            version: data.version,
            url: data.url
          });
        }
      } catch (e) {
        // 忽略无展示版本
      }
    });
    await Promise.all(promises);
  } finally {
    htmlAnimationLoading.value = false;
  }
};

// 获取课程成绩
const fetchCourseScores = async () => {
  if (!courseId.value) return;

  try {
    const response = await getCourseScore({ courseId: courseId.value });
    if (response && response.code === 200 && response.data) {
      courseScores.value = response.data;
    }
  } catch (error) {
    console.error("获取课程成绩失败:", error);
  }
};

onMounted(async () => {
  baseCourseId.value = Number(route.params.id);
  document.body.classList.add(currentTheme.value);
  await fetchCourseDetail();
});
</script>

<style>
@import "@/../coursecss/css/chunk-b3e9f934.1c00050a.css";
@import "@/../coursecss/css/chunk-8cf7ce30.92e48af1.css";
@import "@/../coursecss/css/chunk-3cf64ec0.4f07a253.css";
@import "@/../coursecss/css/chunk-3248eec0.130a3cd9.css";
@import "@/../coursecss/css/app.a5f91bbb.css";
@import "@/../coursecss/css/chunk-b4b575b6.fcb08796.css";

body {
  background-color: #ffffff !important;
}

#app {
  width: 100%;
  min-height: 100vh;
  background-color: #ffffff;
}

#app.dark {
  background-color: #1a1a1a !important;
}

.layout-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
}

.layout-container.dark {
  background-color: #1a1a1a !important;
}

.layout-inner-content {
  position: relative;
  flex: 1;
  margin-left: 90px !important;
  margin-top: 20px !important;
  margin-bottom: 15px !important;
  margin-right: 15px !important;
  height: calc(100vh - 35px) !important;
  border-radius: 24px !important;
  overflow: hidden !important;
  background-color: #ffffff;
  box-shadow: 0 10px 40px -10px rgba(64, 158, 255, 0.1) !important;
  border: 1px solid #eef2f7 !important;
  transition: all 0.3s ease !important;
}

.layout-inner-content.dark {
  background-color: #1a1a1a !important;
  border: 1px solid rgba(60, 60, 80, 0.8) !important;
  box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.6) !important;
}
</style>

<style scoped>
/* 占位内容样式 */
.course-learn-placeholder,
.mastery-placeholder,
.course-qa-placeholder {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.placeholder-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px;
  color: #909399;
}

.placeholder-content p {
  margin: 10px 0;
}

.placeholder-content ul {
  margin-top: 20px;
  text-align: left;
}

.placeholder-content li {
  margin: 8px 0;
  color: #606266;
}

/* 侧边栏样式 */
:deep(.layout-sidebar) {
  width: 80px !important;
  min-width: 80px !important;
  left: 10px !important;
  top: 20px !important;
  height: calc(100vh - 35px) !important;
  border-radius: 24px !important;
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(20px) saturate(180%) !important;
  box-shadow: 0 8px 32px -4px rgba(64, 158, 255, 0.2) !important;
  border: 1px solid rgba(64, 158, 255, 0.2) !important;
  z-index: 100 !important;
  position: fixed !important;
  overflow-y: auto !important;
  overflow-x: hidden !important;
  padding: 15px 0 !important;
  display: flex !important;
  flex-direction: column !important;
  align-items: center !important;
}

:deep(.layout-sidebar::after) {
  content: "" !important;
  position: absolute !important;
  inset: 0 !important;
  border-radius: 24px !important;
  padding: 1.5px !important;
  background: linear-gradient(90deg, #409eff, #604ffd, #409eff) !important;
  background-size: 200% 100% !important;
  -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0) !important;
  mask-composite: exclude !important;
  animation: sidebar-glow-border 3s linear infinite !important;
  pointer-events: none !important;
}

@keyframes sidebar-glow-border {
  0% { background-position: 0% 0%; }
  100% { background-position: 200% 0%; }
}

:deep(.layout-sidebar.dark) {
  background: rgba(30, 30, 40, 0.9) !important;
  box-shadow: 0 8px 32px -4px rgba(0, 0, 0, 0.6) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

:deep(.layout-header) {
  left: 95px !important;
  top: 20px !important;
  width: calc(100% - 110px) !important;
  border-radius: 20px !important;
  z-index: 150 !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(0, 0, 0, 0.05) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
}

:deep(.layout-header.dark) {
  background: rgba(26, 26, 26, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}
</style>
