<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storageLocal } from "@pureadmin/utils";
import {
  ArrowLeftBold,
  Cpu,
  ChatDotRound,
  FolderOpened,
  Document,
  Guide,
  User,
  DataAnalysis,
  MagicStick,
  Box,
  Monitor,
  ArrowDown,
  Top,
  Expand,
  Fold,
  Avatar
} from "@element-plus/icons-vue";

// 引入三个拆分后的组件
import AiSidebar from "./components/AiSidebar.vue";
import AiChatModule from "./components/AiChatModule.vue";
import AiInspector from "./components/AiInspector.vue";
import AgentPdfWorkbench from "./AgentPdfWorkbench.vue";
import LottieAnimation from "@/components/LottieAnimation.vue";

import AiResourceGeneration from "./components/AiResourceGeneration.vue";
import AiLearningPath from "./components/AiLearningPath.vue";
import AiLearningProfile from "./components/AiLearningProfile.vue";
import AiAssessment from "./components/AiAssessment.vue";
import VirtualHumanPanel from "./components/VirtualHumanPanel.vue";

// 引入 Lottie 动画资源
import creditCardAnimation from "@/assets/aiapplottie/credit-card-animation.json";
import emptyStateDevSettingsAnimation from "@/assets/aiapplottie/empty-state-dev-settings-animation.json";
import emptyStateDevelopmentAnimation from "@/assets/aiapplottie/empty-state-development-animation.json";
import emptyStateLockedContentAnimation from "@/assets/aiapplottie/empty-state-locked-content-animation.json";
import emptyStateMediaAnimation from "@/assets/aiapplottie/empty-state-media-animation.json";
import emptyStateResponsiveAnimation from "@/assets/aiapplottie/empty-state-responsive-animation.json";
import emptyStateSignatureAnimation from "@/assets/aiapplottie/empty-state-signature-animation.json";
import emptyStateUploadMediaAnimation from "@/assets/aiapplottie/empty-state-upload-media-animation.json";
import lockedFilesAnimation from "@/assets/aiapplottie/locked-files-animation.json";
import onlineChartAnimation from "@/assets/aiapplottie/online-chart-animation.json";
import saasAnimation from "@/assets/aiapplottie/saas-animation.json";

import { useUserStore } from "@/store/modules/user";
import { useNav } from "@/layout/hooks/useNav";

defineOptions({ name: "AiAppWorkbench" });

const route = useRoute();
const router = useRouter();
const { getLogo } = useNav();
const userStore = useUserStore();

// 权限判断
const isAdmin = ref(userStore.roles.includes("admin"));
const isTeacher = ref(userStore.roles.includes("teacher") || isAdmin.value);

// === 模拟/基础状态数据 ===
const mode = ref("学生模式");
// 如果是老师或管理员，默认进入管理视角
onMounted(() => {
  if (isTeacher.value) {
    mode.value = "教师模式";
  }
});

const isNewTab = ref(false);

const layoutStorage = storageLocal().getItem("responsive-layout") as
  | { darkMode?: boolean }
  | undefined;
const currentTheme = ref(
  (storageLocal().getItem("course_theme") as string) ||
    (layoutStorage?.darkMode ? "dark" : "light")
);
const pdfServiceUrl = "https://agentpdf.intelledu.cn";

// 会话数据集
const activeRail = ref(route.path.split("/").pop() || "chat");
watch(
  () => route.path,
  newPath => {
    activeRail.value = newPath.split("/").pop() || "chat";
  }
);
const activeCourse = ref(null);

// 侧边栏 / 数字人面板 收起状态
const sidebarCollapsed = ref(false);
const humanCollapsed = ref(false);
const toggleSidebar = () => (sidebarCollapsed.value = !sidebarCollapsed.value);
const toggleHuman = () => (humanCollapsed.value = !humanCollapsed.value);

// 学生拥有的课程（动态拉取）
const myCourses = ref(["数据结构", "算法设计", "高等数学", "大学物理"]);

// 教师关联的学生列表
const myStudents = ref([
  { 
    id: "s1", 
    name: "吴同学", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Wu",
    profileDimensions: [
      { label: "知识基础", value: 72 },
      { label: "认知风格", value: 88 },
      { label: "易错点偏好", value: 45 },
      { label: "学习进度", value: 62 },
      { label: "探索欲", value: 92 },
      { label: "抗挫折能力", value: 78 }
    ]
  },
  { 
    id: "s2", 
    name: "张同学", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zhang",
    profileDimensions: [
      { label: "知识基础", value: 45 },
      { label: "认知风格", value: 60 },
      { label: "易错点偏好", value: 85 },
      { label: "学习进度", value: 30 },
      { label: "探索欲", value: 55 },
      { label: "抗挫折能力", value: 40 }
    ]
  },
  { 
    id: "s3", 
    name: "赵同学", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zhao",
    profileDimensions: [
      { label: "知识基础", value: 98 },
      { label: "认知风格", value: 95 },
      { label: "易错点偏好", value: 15 },
      { label: "学习进度", value: 99 },
      { label: "探索欲", value: 96 },
      { label: "抗挫折能力", value: 97 }
    ]
  },
  { 
    id: "s4", 
    name: "钱同学", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Qian",
    profileDimensions: [
      { label: "知识基础", value: 65 },
      { label: "认知风格", value: 72 },
      { label: "易错点偏好", value: 58 },
      { label: "学习进度", value: 84 },
      { label: "探索欲", value: 70 },
      { label: "抗挫折能力", value: 82 }
    ]
  },
  { 
    id: "s5", 
    name: "孙同学", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sun",
    profileDimensions: [
      { label: "知识基础", value: 52 },
      { label: "认知风格", value: 68 },
      { label: "易错点偏好", value: 82 },
      { label: "学习进度", value: 48 },
      { label: "探索欲", value: 65 },
      { label: "抗挫折能力", value: 50 }
    ]
  },
  { 
    id: "s6", 
    name: "周同学", 
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zhou",
    profileDimensions: [
      { label: "知识基础", value: 88 },
      { label: "认知风格", value: 82 },
      { label: "易错点偏好", value: 35 },
      { label: "学习进度", value: 81 },
      { label: "探索欲", value: 89 },
      { label: "抗挫折能力", value: 91 }
    ]
  }
]);
const selectedStudentId = ref("");

// 【请求还原】：保留原版所有的侧边功能项
const railItems = ref([
  { key: "chat", label: "智能辅导", icon: "ChatDotRound" },
  { key: "generation", label: "资源生成", icon: "FolderOpened" },
  { key: "agentpdf", label: "Agent PDF", icon: "Document" },
  { key: "path", label: "路径规划", icon: "Guide" },
  { key: "profile", label: "学习画像", icon: "User" },
  { key: "assessment", label: "学习评估", icon: "DataAnalysis" },
  { key: "automation", label: "自动化", icon: "MagicStick" }
]);

const conversations = ref([
  {
    id: 1,
    title: "关于图的遍历算法探讨",
    time: "上午 10:23",
    course: "数据结构",
    status: "分析中"
  },
  {
    id: 2,
    title: "红黑树左旋右旋原理解析",
    time: "昨天 14:15",
    course: "数据结构",
    status: "已解答"
  },
  {
    id: 3,
    title: "动态规划: 斐波那契数列变形",
    time: "昨天 09:30",
    course: "算法设计",
    status: "已解答"
  }
]);

// === 智能画像、智能体与资源数据 ===
const profileDimensions = ref([
  { label: "知识基础", value: 85 },
  { label: "认知风格", value: 78 },
  { label: "易错点偏好", value: 65 },
  { label: "学习进度", value: 90 },
  { label: "探索欲", value: 82 },
  { label: "抗挫折能力", value: 88 }
]);

const agentItems = ref([
  {
    id: "a1",
    name: "特征提取专家",
    desc: "监听聊天更新学习画像",
    status: "running"
  },
  {
    id: "a2",
    name: "多模态规划师",
    desc: "构建视频与图文骨架",
    status: "running"
  },
  {
    id: "a3",
    name: "代码生成特工",
    desc: "生成带反思断点的算法题",
    status: "running"
  },
  {
    id: "a4",
    name: "排版与渲染器",
    desc: "整合内容导出专属讲义",
    status: "done"
  }
]);

const generatedResources = ref([
  {
    title: "红黑树左旋右旋 3D动画",
    kind: "视频讲解",
    desc: "自动生成的动画讲解逻辑",
    eta: "马上可用"
  },
  {
    title: "数据结构期中错题重组",
    kind: "互动题库",
    desc: "基于你历史易错点生成",
    eta: "马上可用"
  },
  {
    title: "二叉树实战代码沙盒",
    kind: "代码实操",
    desc: "带有智能断点的运行环境",
    eta: "马上可用"
  }
]);

const messages = ref([
  {
    id: 1,
    role: "系统提示",
    type: "system",
    content:
      "同学你好，你的「数据结构」智能辅导平台已就绪。多智能体已经分析了你上次的『二叉树』测验，发现存在易混淆点。今天我们需要针对性突破吗？"
  },
  {
    id: 2,
    role: "学生",
    type: "user",
    content: "是的，红黑树的左旋和右旋我总是搞混，手写代码也容易记错指针变换。"
  },
  {
    id: 3,
    role: "主控智能体",
    type: "system",
    content:
      "很典型的痛点！我正在调用【排版渲染器】和【代码生成特工】为你构建一套专属的复习组件，先看看这份推演视频，再到沙盒里试着填空：",
    resources: [
      {
        title: "红黑树左旋右旋 3D动画",
        type: "video",
        desc: "直观展示节点指针的转移过程"
      },
      {
        title: "易错点专项沙盒 (带断点)",
        type: "code",
        desc: "动手补充左旋函数 core 部分"
      }
    ]
  }
]);

// 模拟交互
const handleSendMessage = (text: string) => {
  messages.value.push({
    id: Date.now(),
    role: "学生",
    type: "user",
    content: text
  });

  setTimeout(() => {
    profileDimensions.value[4].value = Math.min(
      100,
      profileDimensions.value[4].value + 5
    );
    profileDimensions.value[2].value = Math.max(
      0,
      profileDimensions.value[2].value - 5
    );
    agentItems.value.forEach(a => (a.status = "running"));

    setTimeout(() => {
      agentItems.value[0].status = "done";
      agentItems.value[1].status = "done";
      messages.value.push({
        id: Date.now(),
        role: "主控智能体",
        type: "system",
        content:
          "多智能体已深度解析，为你生成额外的知识图谱与拓展阅读，请右侧查收最新的学习资产。",
        resources: [
          {
            title: "图神经网络的拓展前沿 (PDF)",
            type: "doc",
            desc: "为你翻译提取的学术脉络"
          }
        ]
      });
      setTimeout(() => {
        agentItems.value[2].status = "done";
        agentItems.value[3].status = "done";
      }, 1000);
    }, 1500);
  }, 500);
};

const goBack = () => {
  if (window.history.state && window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
};

onMounted(() => {
  if (route.query.mode) mode.value = route.query.mode as string;
  if (route.query.newTab === "true") {
    isNewTab.value = true;
    document.title = `AI 智能体 (${mode.value})`;
  }
});

const quickMessage = ref("");
const quickCourse = ref("");
const selectedMockAgent = ref("代码生成特工");

const handleNewChat = (payload: { course: string }) => {
  activeCourse.value = payload.course;
  if (quickMessage.value.trim()) {
    handleSendMessage(quickMessage.value);
    quickMessage.value = "";
  }
};
</script>

<template>
  <div
    class="ai-app-root h-[calc(100vh-80px)] flex flex-col bg-gradient-to-br from-[rgb(253,229,250)] via-[rgb(233,231,255)] to-[rgb(254,214,233)] font-sans rounded-xl overflow-hidden shadow-sm"
    :class="currentTheme"
  >
    <!-- 顶部状态栏：仅对 管理员/教师 可见 -->
    <header 
      v-if="isTeacher" 
      class="h-14 bg-white/80 backdrop-blur border-b border-gray-100 flex items-center justify-between px-6 z-30"
    >
      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
            <el-icon><Monitor /></el-icon>
          </div>
          <span class="font-bold text-gray-700">管理看板</span>
        </div>
        <el-divider direction="vertical" />
        <div class="flex items-center gap-2">
          <span class="text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
            {{ isAdmin ? '管理员控制台' : '教师端管理视角' }}
          </span>
        </div>
      </div>

      <div class="flex items-center gap-4">
        <span class="text-xs text-gray-500 font-medium">当前分析学生:</span>
        <el-select 
          v-model="selectedStudentId" 
          placeholder="请选择学生" 
          size="default" 
          style="width: 200px"
          class="student-select"
        >
          <template #prefix>
            <el-icon><User /></el-icon>
          </template>
          <el-option
            v-for="item in myStudents"
            :key="item.id"
            :label="item.name"
            :value="item.id"
          >
            <div class="flex items-center gap-3">
              <el-avatar :size="20" :src="item.avatar" />
              <span>{{ item.name }}</span>
            </div>
          </el-option>
        </el-select>
        <el-tooltip content="刷新数据" placement="bottom">
          <el-button circle icon="Refresh" size="small" border-none bg-transparent />
        </el-tooltip>
      </div>
    </header>

    <div class="flex-1 flex overflow-hidden">
      <!-- 极简左侧边栏 (第一块) -->
      <aside
        v-if="activeRail === 'chat'"
        class="flex-shrink-0 z-20 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 relative"
        :class="sidebarCollapsed ? 'w-[34px]' : 'w-[260px]'"
      >
        <div v-show="!sidebarCollapsed" class="flex-1 overflow-hidden">
          <AiSidebar
            v-model:activeRail="activeRail"
            :conversations="conversations"
            :courses="myCourses"
            @new-chat="handleNewChat"
            @select-chat="
              conv => {
                activeCourse = conv.course;
              }
            "
          />
        </div>

        <!-- 收起态：竖向标识 -->
        <div
          v-show="sidebarCollapsed"
          class="flex-1 flex flex-col items-center justify-center text-gray-400 select-none cursor-pointer"
          @click="toggleSidebar"
        >
          <el-icon :size="14" class="rotate-90 mb-2"><FolderOpened /></el-icon>
          <span
            class="text-[11px] tracking-widest"
            style="writing-mode: vertical-rl"
            >课程 · 历史</span
          >
        </div>

        <!-- 收起 / 展开 把手 -->
        <button
          class="absolute top-3 -right-3 w-6 h-6 rounded-md bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/40 hover:scale-110 transition-all z-30"
          :title="sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
          @click="toggleSidebar"
        >
          <el-icon :size="12">
            <Expand v-if="sidebarCollapsed" />
            <Fold v-else />
          </el-icon>
        </button>
      </aside>

    <!-- 右边总体容器 (主体) -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 主体内容 (第三块) -->
      <main class="flex-1 overflow-hidden relative">
        <!-- 【场景 A1】 智能辅导对谈框 (已选课) -->
        <div v-if="activeRail === `chat` && activeCourse" class="h-full w-full flex stretch p-4 gap-4 overflow-hidden">
          <!-- 对话流核心面板 -->
          <transition appear name="panel-slide">
            <div
              class="flex-1 h-full bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/50 overflow-hidden relative group transition-all duration-500 hover:shadow-[0_20px_40px_rgba(94,127,248,0.1)]"
            >
              <!-- 柔和的顶部遮罩渐变 -->
              <div
                class="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white/80 to-transparent pointer-events-none z-10"
              />
              <AiChatModule
                :messages="messages"
                :activeCourse="activeCourse"
                @send="handleSendMessage"
              />
            </div>
          </transition>

          <!-- 数字人面板 -->
          <transition appear name="panel-reveal">
            <div
              class="flex-shrink-0 h-full bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/50 overflow-hidden transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) relative"
              :class="humanCollapsed ? 'w-[64px]' : 'w-[420px]'"
            >
              <VirtualHumanPanel v-show="!humanCollapsed" />
              <!-- 收起态 -->
              <div
                v-show="humanCollapsed"
                class="h-full flex flex-col items-center justify-center text-gray-400 select-none cursor-pointer gap-6 group/btn"
                @click="toggleHuman"
              >
                <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover/btn:scale-125 transition-transform duration-500">
                  <el-icon :size="20"><Avatar /></el-icon>
                </div>
                <span
                  class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover/btn:text-primary transition-colors"
                  style="writing-mode: vertical-rl"
                  >Digital Assistant</span
                >
              </div>

              <!-- 收起 / 展开 把手 -->
              <button
                class="absolute top-3 -left-3 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/40 hover:scale-110 transition-all z-30"
                :title="humanCollapsed ? '展开数字人' : '收起数字人'"
                @click="toggleHuman"
              >
                <el-icon :size="12">
                  <Fold v-if="humanCollapsed" />
                  <Expand v-else />
                </el-icon>
              </button>
            </div>
          </transition>
        </div>

        <!-- 【场景 A2】 智能辅导欢迎中心 (未选课) -->
        <div
          v-else-if="activeRail === `chat` && !activeCourse"
          class="h-full w-full p-4 flex items-center justify-center relative"
        >
          <!-- 背景装饰 -->
          <div class="absolute inset-0 overflow-hidden pointer-events-none">
            <div
              class="absolute -top-[10%] -right-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl opacity-60"
            />
            <div
              class="absolute -bottom-[10%] -left-[5%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl opacity-60"
            />
          </div>

          <div
            class="w-full max-w-3xl px-6 space-y-10 relative z-10 transform -translate-y-8"
          >
            <!-- 待机状态 Lottie 动画 -->
            <div class="flex justify-center mb-[-20px]">
              <LottieAnimation
                :animationData="saasAnimation"
                :width="280"
                :height="280"
              />
            </div>

            <div class="text-center space-y-4">
              <h1
                class="text-3xl sm:text-[38px] font-bold tracking-tight gradient-text-animate"
              >
                今天想聊点什么？
              </h1>
              <p
                class="text-[15px] font-medium tracking-wide"
                style="color: rgba(140, 80, 159, 0.7)"
              >
                请先选择一门课程，然后随时向大模型提问
              </p>
            </div>

            <div
              class="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-within:border-primary/20 transition-all duration-500 overflow-hidden"
            >
              <el-input
                v-model="quickMessage"
                type="textarea"
                :autosize="{ minRows: 2, maxRows: 8 }"
                placeholder="可向大模型询问任何事。输入 @ 提及课程或文件..."
                class="quick-chat-input"
                resize="none"
                @keyup.enter.prevent="
                  quickCourse ? handleNewChat({ course: quickCourse }) : null
                "
              />

              <div
                class="flex items-center justify-between px-4 py-3 bg-gray-50/50 border-t border-gray-50"
              >
                <div class="flex flex-wrap items-center gap-1.5">
                  <el-dropdown
                    trigger="click"
                    @command="c => (quickCourse = c)"
                  >
                    <span
                      class="inline-flex items-center px-3 py-1.5 rounded-xl text-[13px] font-medium transition-colors"
                      :class="
                        quickCourse
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-600 hover:bg-gray-100 cursor-pointer'
                      "
                    >
                      <el-icon class="mr-1.5 text-[14px]"
                        ><FolderOpened
                      /></el-icon>
                      {{ quickCourse || "选择课程" }}
                      <el-icon class="ml-1 text-[12px]"><ArrowDown /></el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item
                          v-for="c in myCourses"
                          :key="c"
                          :command="c"
                        >
                          {{ c }}
                        </el-dropdown-item>
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>

                  <el-dropdown trigger="click" @command="m => (mode = m)">
                    <span
                      class="inline-flex items-center px-3 py-1.5 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <el-icon class="mr-1.5 text-[14px]"><Monitor /></el-icon>
                      {{ mode }}
                      <el-icon class="ml-1 text-[12px]"><ArrowDown /></el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="学生模式"
                          >学生模式</el-dropdown-item
                        >
                        <el-dropdown-item command="教师模式"
                          >教师模式</el-dropdown-item
                        >
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>

                  <el-dropdown
                    trigger="click"
                    @command="a => (selectedMockAgent = a)"
                  >
                    <span
                      class="inline-flex items-center px-3 py-1.5 rounded-xl text-[13px] font-medium text-gray-600 hover:bg-gray-100 cursor-pointer transition-colors"
                    >
                      <el-icon class="mr-1.5 text-[14px]"><Cpu /></el-icon>
                      {{ selectedMockAgent }}
                      <el-icon class="ml-1 text-[12px]"><ArrowDown /></el-icon>
                    </span>
                    <template #dropdown>
                      <el-dropdown-menu>
                        <el-dropdown-item command="代码生成特工"
                          >代码生成特工</el-dropdown-item
                        >
                        <el-dropdown-item command="多模态规划师"
                          >多模态规划师</el-dropdown-item
                        >
                      </el-dropdown-menu>
                    </template>
                  </el-dropdown>
                </div>

                <div class="flex items-center gap-3">
                  <span
                    class="text-[12px] text-gray-400 font-medium tracking-wide flex items-center pr-2 cursor-pointer hover:text-gray-600 transition-colors"
                  >
                    IntellEdu 4.0 超高
                    <el-icon class="ml-1"><ArrowDown /></el-icon>
                  </span>
                  <button
                    class="w-10 h-10 flex items-center justify-center rounded-xl transition-all transform border"
                    :class="
                      quickCourse && quickMessage.trim()
                        ? 'bg-[#c199f9] border-[#c199f9] text-white hover:bg-[#b085f7] hover:scale-105 shadow-lg shadow-purple-100 cursor-pointer'
                        : 'bg-white border-gray-200 text-gray-300 cursor-not-allowed'
                    "
                    :disabled="!quickCourse || !quickMessage.trim()"
                    @click="
                      quickCourse
                        ? handleNewChat({ course: quickCourse })
                        : null
                    "
                  >
                    <el-icon
                      class="text-lg"
                      :class="
                        quickCourse && quickMessage.trim() ? '' : 'font-bold'
                      "
                      ><Top
                    /></el-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 【场景 B】 Agent PDF 工作台 -->
        <div v-else-if="activeRail === `agentpdf`" class="h-full w-full p-4 overflow-hidden">
          <div
            class="h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <AgentPdfWorkbench :service-url="pdfServiceUrl" />
          </div>
        </div>

        <div v-else-if="activeRail === `generation`" class="h-full w-full p-4">
          <div
            class="h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <AiResourceGeneration />
          </div>
        </div>

        <div v-else-if="activeRail === `path`" class="h-full w-full p-4">
          <div
            class="h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <AiLearningPath :student-id="selectedStudentId" />
          </div>
        </div>

        <div v-else-if="activeRail === `profile`" class="h-full w-full p-4">
          <div
            class="h-full flex gap-4 overflow-hidden"
          >
            <!-- 左：完整学习画像 -->
            <div
              class="flex-1 h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <AiLearningProfile :student-id="selectedStudentId" />
            </div>
            <!-- 右：原 chat 右侧的画像 / 智能体 / 拓展资源 选项卡 -->
            <div
              class="w-[360px] flex-shrink-0 h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
            >
              <AiInspector
                :profileDimensions="selectedStudentId ? (myStudents.find(s => s.id === selectedStudentId)?.profileDimensions || profileDimensions) : profileDimensions"
                :agentItems="agentItems"
                :resources="generatedResources"
              />
            </div>
          </div>
        </div>

        <div v-else-if="activeRail === `assessment`" class="h-full w-full p-4">
          <div
            class="h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <AiAssessment :student-id="selectedStudentId" />
          </div>
        </div>

        <!-- 【场景 C】 其他未开发项 (自动化等) -->
        <div v-else class="h-full w-full flex items-center justify-center p-4">
          <div
            class="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-gray-100 shadow-[0_2px_20px_rgba(0,0,0,0.02)] w-full max-w-2xl transform hover:scale-[1.01] transition-transform duration-500"
          >
            <el-icon :size="80" class="text-gray-200 mb-6 drop-shadow-sm"
              ><Box
            /></el-icon>
            <h3 class="text-xl font-black text-gray-700 mb-2">
              正在积极建设中
            </h3>
            <p class="text-sm text-gray-400">
              目前「{{
                railItems.find(r => r.key === activeRail)?.label
              }}」属于预期赛题规划内，即将与多智能体底座接通...
            </p>
          </div>
        </div>
      </main>
    </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ai-app-root {
  --el-color-primary: #5e7ff8; // 强制保持平台蓝

  // 整体降低色彩饱和度，营造更柔和的视觉氛围
  filter: saturate(0.55);

  // 媒体内容（数字人、图片、视频等）保持原色
  :deep(img),
  :deep(video),
  :deep(canvas),
  :deep(iframe),
  :deep(svg image) {
    filter: saturate(1.82); // 1 / 0.55 ≈ 1.82，抵消父级降饱和
  }
}

/* 全局交互 UI 增强 */
:deep(.el-radio-button__inner) {
  border-radius: 12px !important;
  margin: 0 4px;
  border: 1px solid transparent !important;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  &:hover {
    background: rgba(94, 127, 248, 0.05);
  }
}

:deep(.student-select .el-input__wrapper) {
  border-radius: 12px !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.03) !important;
  transition: all 0.3s ease;
  &:hover {
    box-shadow: 0 4px 16px rgba(94, 127, 248, 0.1) !important;
  }
}

/* 面板转场动画 */
.panel-slide-enter-active {
  transition: all 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}
.panel-slide-enter-from {
  opacity: 0;
  transform: translateX(-30px) scale(0.98);
}

.panel-reveal-enter-active {
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.panel-reveal-enter-from {
  opacity: 0;
  transform: translateX(50px) rotate(1deg);
}

.gradient-text-animate {
  background: linear-gradient(
    -45deg,
    rgb(140, 80, 159),
    rgb(190, 120, 200),
    rgb(140, 80, 159)
  );
  background-size: 200% auto;
  color: transparent;
  -webkit-background-clip: text;
  background-clip: text;
  animation: gradientShift 6s ease-in-out infinite;
}

@keyframes gradientShift {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

.placeholder-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background: white;
  h2 {
    margin-top: 20px;
    font-weight: bold;
  }
  p {
    color: #666;
    margin-top: 10px;
  }
  .reopen-btn {
    margin-top: 30px;
    padding: 10px 24px;
    border-radius: 20px;
    border: 1px solid #ddd;
    background: none;
    cursor: pointer;
  }
}

.pulse-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 20px;
  font-weight: 900;
  color: var(--el-color-primary);
  letter-spacing: -0.5px;
  &::before {
    content: "";
    display: block;
    width: 24px;
    height: 24px;
    background: linear-gradient(135deg, var(--el-color-primary), #829eff);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(94, 127, 248, 0.3);
    animation: simple-pulse 2s infinite;
  }
  &::after {
    content: "IntellEdu";
  }
}

:deep(.quick-chat-input) {
  font-size: 15px;
  color: #374151;
  background-color: transparent !important;
  .el-textarea__inner {
    border: none !important;
    box-shadow: none !important;
    padding: 16px 20px;
    background-color: transparent !important;
    color: #374151;
    &::placeholder {
      color: #9ca3af;
    }
  }
}

@keyframes simple-pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(94, 127, 248, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(94, 127, 248, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(94, 127, 248, 0);
  }
}
</style>
