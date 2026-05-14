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
  Avatar,
  Clock,
  DataBoard,
  Calendar,
  Bell,
  ChatLineRound,
  Close,
  CircleCheckFilled,
  WarningFilled,
  ArrowRight
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

// 数字人面板引用（用于触发朗读 + 自动口型）
const virtualHumanRef = ref<{ speak?: (text: string) => void } | null>(null);

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
  { key: "chat", label: "互动答疑", icon: "ChatDotRound" },
  { key: "generation", label: "教学资源", icon: "FolderOpened" },
  { key: "agentpdf", label: "资料研读", icon: "Document" },
  { key: "path", label: "学习计划", icon: "Guide" },
  { key: "profile", label: "学情分析", icon: "User" },
  { key: "assessment", label: "测验评估", icon: "DataAnalysis" },
  { key: "automation", label: "常规任务", icon: "Check" }
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

const selectedTaskId = ref("");

const mockTaskHistory = ref([
  {
    date: "2026-05-13",
    time: "18:00",
    status: "success",
    log: "任务执行成功，耗时 1.2s，产出物已归档并发送通知。"
  },
  {
    date: "2026-05-06",
    time: "18:00",
    status: "success",
    log: "任务执行成功，耗时 1.5s，产出物已归档。"
  },
  {
    date: "2026-04-29",
    time: "18:00",
    status: "warning",
    log: "任务执行完成，部分来源数据缺失，已使用默认值填充计算。"
  },
  {
    date: "2026-04-22",
    time: "18:00",
    status: "success",
    log: "任务执行成功，耗时 1.1s，产出物已归档。"
  }
]);

const routineTasks = ref([
  {
    id: "r1",
    title: "学情周报生成",
    desc: "每周五 18:00 自动汇总本周学习数据并生成专属报告",
    role: "student",
    status: "active",
    lastRun: "上周五 18:00",
    icon: "Calendar"
  },
  {
    id: "r2",
    title: "遗忘曲线复习推送",
    desc: "每日 20:00 基于艾宾浩斯曲线生成错题回顾任务",
    role: "student",
    status: "active",
    lastRun: "昨天 20:00",
    icon: "Bell"
  },
  {
    id: "r3",
    title: "课前预习资料速递",
    desc: "根据明日课表提前生成包含重难点的预习大纲",
    role: "student",
    status: "paused",
    lastRun: "-",
    icon: "Document"
  },
  {
    id: "r4",
    title: "班级共性错题汇总",
    desc: "每日 22:00 分析班级作业数据并生成共性盲点看板",
    role: "teacher",
    status: "active",
    lastRun: "昨天 22:00",
    icon: "DataBoard"
  },
  {
    id: "r5",
    title: "答疑区高频问题聚合",
    desc: "每周日 12:00 自动整理答疑区相似提问并生成FAQ",
    role: "teacher",
    status: "active",
    lastRun: "上周日 12:00",
    icon: "ChatLineRound"
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
    name: "学情诊断专家",
    desc: "分析答疑记录更新画像",
    status: "running"
  },
  {
    id: "a2",
    name: "课程研发助手",
    desc: "梳理知识点与内容大纲",
    status: "running"
  },
  {
    id: "a3",
    name: "练习题出题人",
    desc: "根据重难点生成练习题",
    status: "running"
  },
  {
    id: "a4",
    name: "讲义排版校对",
    desc: "为您整合导出专属辅导",
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
      "同学你好，你的「数据结构」智能辅导平台已就绪。专属助教已经分析了你上次的『二叉树』测验，发现存在易混淆点。今天我们需要针对性突破吗？"
  },
  {
    id: 2,
    role: "学生",
    type: "user",
    content: "是的，红黑树的左旋和右旋我总是搞混，手写代码也容易记错指针变换。"
  },
  {
    id: 3,
    role: "智能助教",
    type: "system",
    content:
      "很典型的痛点！我正在调度排版校对助手和出题助手为你构建一套专属的复习资源，先看看这份概念视频，再到沙盒里试着做做题：",
    resources: [
      {
        title: "红黑树左旋右旋 3D动画",
        type: "video",
        desc: "直观展示节点指针的转移过程"
      },
      {
        title: "易错点专项练习",
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

  // 演示用：用户提问后立即让数字人开口朗读固定的「演示回复」(自动驱动口型)
  const demoReply =
    "栈是一种先进后出(LIFO)的线性结构，只能在栈顶进行插入和删除。核心操作包括 push 压栈、pop 出栈、peek 查看栈顶，常用于函数调用、表达式求值与括号匹配。右侧已为你生成可交互的栈操作动画，点击即可预览。";
  virtualHumanRef.value?.speak?.(demoReply);

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
        role: "智能助教",
        type: "system",
        content: demoReply,
        resources: [
          {
            title: "栈操作交互动画 (push / pop / peek)",
            type: "animation",
            desc: "点击查看 LIFO 压栈与出栈过程"
          },
          {
            title: "栈的典型应用场景梳理 (PDF)",
            type: "doc",
            desc: "函数调用 / 括号匹配 / 表达式求值"
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

// === 栈操作预览弹窗 ===
const stackPreviewVisible = ref(false);
const stackItems = ref<{ key: number; value: string }[]>([
  { key: 1, value: "A" },
  { key: 2, value: "B" },
  { key: 3, value: "C" }
]);
let stackKeySeed = 100;
const stackLog = ref<string[]>([
  "初始状态：栈顶 -> C, B, A (最后压入 C)"
]);
function stackPush() {
  const candidate = ["D", "E", "F", "G", "H", "X", "Y", "Z"];
  const v = candidate[Math.floor(Math.random() * candidate.length)];
  stackItems.value.push({ key: ++stackKeySeed, value: v });
  stackLog.value.unshift(`push(${v})  → 栈顶现为 ${v}`);
}
function stackPop() {
  if (!stackItems.value.length) {
    stackLog.value.unshift("pop() 失败：栈为空");
    return;
  }
  const top = stackItems.value[stackItems.value.length - 1];
  stackItems.value.pop();
  stackLog.value.unshift(
    `pop()    → 弹出 ${top.value}，现栈顶 ${stackItems.value[stackItems.value.length - 1]?.value || "空"}`
  );
}
function stackPeek() {
  const top = stackItems.value[stackItems.value.length - 1];
  stackLog.value.unshift(
    top ? `peek()   → 栈顶是 ${top.value}` : "peek() 失败：栈为空"
  );
}
function stackReset() {
  stackItems.value = [
    { key: ++stackKeySeed, value: "A" },
    { key: ++stackKeySeed, value: "B" },
    { key: ++stackKeySeed, value: "C" }
  ];
  stackLog.value = ["重置：栈顶 -> C, B, A"];
}
function handlePreview(res: any) {
  if (res?.type === "animation") {
    stackPreviewVisible.value = true;
  }
}

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
    document.title = `学习助手 (${mode.value})`;
  }
});

const quickMessage = ref("");
const quickCourse = ref("");
const selectedMockAgent = ref("练习题助手");
const quickInteractionMessages = [
  "老师好",
  "这一段没听懂",
  "请再讲一遍",
  "我做完了"
];

const handleQuickInteraction = (text: string) => {
  virtualHumanRef.value?.speak?.(text);
};

const handleNewChat = (payload: { course: string }) => {
  activeCourse.value = payload.course;
  if (quickMessage.value.trim()) {
    // 切换到聊天栏目，确保 VirtualHumanPanel 渲染 (v-show 会让 ref 可用)
    activeRail.value = "chat";
    // 微延时等待 DOM 切换完成，确保 ref 绑定到实例上
    setTimeout(() => {
      handleSendMessage(quickMessage.value);
      quickMessage.value = "";
    }, 100);
  }
};
</script>

<template>
  <div
    class="ai-app-root h-[calc(100vh-140px)] flex flex-col font-sans rounded-xl overflow-hidden shadow-sm bg-white"
    :class="[
      activeRail === 'chat'
        ? 'bg-gradient-to-br from-[rgb(253,229,250)] via-[rgb(233,231,255)] to-[rgb(254,214,233)]'
        : '',
      currentTheme
    ]"
  >
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
        <!-- 教师专属：顶部学生选择器工具栏 -->
        <div
          v-if="
            isTeacher && ['path', 'profile', 'assessment'].includes(activeRail)
          "
          class="flex-none flex items-center justify-end gap-3 bg-white px-6 py-3 border-b border-gray-100 z-10 relative shadow-sm"
        >
          <span class="text-xs text-gray-500 font-medium">分析对象:</span>
          <el-select
            v-model="selectedStudentId"
            placeholder="请选择学生"
            size="small"
            style="width: 160px"
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
              <div class="flex items-center gap-2">
                <el-avatar :size="18" :src="item.avatar" />
                <span class="text-sm">{{ item.name }}</span>
              </div>
            </el-option>
          </el-select>
        </div>

        <!-- 主体内容 (第三块) -->
        <main class="flex-1 overflow-hidden relative">
          <!-- 【场景 A1】 智能辅导对谈框 (已选课) -->
          <div
            v-if="activeRail === `chat` && activeCourse"
            class="h-full w-full flex stretch p-4 gap-4 overflow-hidden"
          >
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
                  @preview="handlePreview"
                />
              </div>
            </transition>

            <!-- 数字人面板 -->
            <transition appear name="panel-reveal">
              <div
                class="flex-shrink-0 h-full flex flex-col gap-4 transition-all duration-700 cubic-bezier(0.34, 1.56, 0.64, 1) relative"
                :class="humanCollapsed ? 'w-16' : 'w-[420px]'"
              >
                <!-- 收起 / 展开 把手：挂在外层，避免被圆角容器裁切 -->
                <button
                  class="absolute top-4 left-0 -translate-x-1/2 w-7 h-7 rounded-full bg-white/95 backdrop-blur border border-gray-200 shadow-md flex items-center justify-center text-gray-500 hover:text-primary hover:border-primary/40 hover:scale-110 transition-all z-[140]"
                  :title="humanCollapsed ? '展开数字人' : '收起数字人'"
                  @click="toggleHuman"
                >
                  <el-icon :size="12">
                    <Fold v-if="humanCollapsed" />
                    <Expand v-else />
                  </el-icon>
                </button>

                <!-- 原有的数字人容器 (现在嵌套在 flex 容器中) -->
                <div
                  class="flex-1 bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/50 overflow-hidden relative"
                >
                  <VirtualHumanPanel
                    ref="virtualHumanRef"
                    v-show="!humanCollapsed"
                  />
                  <!-- 收起态 (数字人这一窄条的内容) -->
                  <div
                    v-show="humanCollapsed"
                    class="h-full flex flex-col items-center justify-center text-gray-400 select-none cursor-pointer gap-6 group/btn"
                    @click="toggleHuman"
                  >
                    <div
                      class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary group-hover/btn:scale-125 transition-transform duration-500"
                    >
                      <el-icon :size="20"><Avatar /></el-icon>
                    </div>
                    <span
                      class="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400 group-hover/btn:text-primary transition-colors"
                      style="writing-mode: vertical-rl"
                      >专属助教</span
                    >
                  </div>
                </div>

                <!-- 快速互动：仅在展开态显示在数字人底部 -->
                <transition name="el-zoom-in-bottom">
                  <div
                    v-show="!humanCollapsed"
                    class="flex-none bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-3 shadow-md flex flex-col gap-2 overflow-hidden z-[100]"
                    style="min-height: 180px"
                  >
                    <div
                      class="text-[10px] font-bold text-gray-500 uppercase tracking-widest text-center border-b border-gray-100 pb-1.5 mb-1"
                    >
                      快速互动
                    </div>
                    <div class="flex flex-col gap-2">
                      <el-button
                        v-for="msg in quickInteractionMessages"
                        :key="msg"
                        type="primary"
                        plain
                        size="default"
                        class="!w-full !m-0 !text-[12px] !rounded-xl !border-blue-100 !bg-blue-50/50 hover:!bg-blue-500 hover:!text-white transition-all duration-300"
                        @click="handleQuickInteraction(msg)"
                      >
                        {{ msg }}
                      </el-button>
                    </div>
                  </div>
                </transition>
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
                  请先选择一门课程，然后随时寻求学习辅导
                </p>
              </div>

              <div
                class="bg-white rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 focus-within:shadow-[0_8px_30px_rgb(0,0,0,0.08)] focus-within:border-primary/20 transition-all duration-500 overflow-hidden"
              >
                <el-input
                  v-model="quickMessage"
                  type="textarea"
                  :autosize="{ minRows: 2, maxRows: 8 }"
                  placeholder="可以输入想要了解的知识点。输入 @ 提及课程或文件..."
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
                        <el-icon class="ml-1 text-[12px]"
                          ><ArrowDown
                        /></el-icon>
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
                        <el-icon class="mr-1.5 text-[14px]"
                          ><Monitor
                        /></el-icon>
                        {{ mode }}
                        <el-icon class="ml-1 text-[12px]"
                          ><ArrowDown
                        /></el-icon>
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
                        <el-icon class="ml-1 text-[12px]"
                          ><ArrowDown
                        /></el-icon>
                      </span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item command="练习题助手"
                            >练习题助手</el-dropdown-item
                          >
                          <el-dropdown-item command="辅导助教"
                            >辅导助教</el-dropdown-item
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
          <div
            v-else-if="activeRail === `agentpdf`"
            class="h-full w-full overflow-hidden"
          >
            <div class="h-full bg-white overflow-hidden">
              <AgentPdfWorkbench :service-url="pdfServiceUrl" />
            </div>
          </div>

          <div v-else-if="activeRail === `generation`" class="h-full w-full">
            <div class="h-full bg-white overflow-hidden">
              <AiResourceGeneration />
            </div>
          </div>

          <div v-else-if="activeRail === `path`" class="h-full w-full">
            <div
              v-if="isTeacher && !selectedStudentId"
              class="h-full w-full flex items-center justify-center bg-white"
            >
              <div
                class="flex flex-col items-center justify-center bg-transparent lottie-empty-state"
              >
                <LottieAnimation
                  :animationData="onlineChartAnimation"
                  :width="360"
                  :height="360"
                />
                <h3 class="mt-4 text-lg font-black text-gray-600">
                  尚未选择学生
                </h3>
                <p class="mt-2 text-sm text-gray-400">
                  请在顶部选择需要分析的学生以查看个性化路径规划
                </p>
              </div>
            </div>
            <div v-else class="h-full bg-white overflow-hidden">
              <AiLearningPath :student-id="selectedStudentId" />
            </div>
          </div>

          <div
            v-else-if="activeRail === `profile`"
            class="h-full w-full p-4 bg-white"
          >
            <div
              v-if="isTeacher && !selectedStudentId"
              class="h-full w-full flex items-center justify-center"
            >
              <div
                class="flex flex-col items-center justify-center bg-transparent lottie-empty-state"
              >
                <LottieAnimation
                  :animationData="emptyStateDevelopmentAnimation"
                  :width="360"
                  :height="360"
                />
                <h3 class="mt-4 text-lg font-black text-gray-600">
                  尚未选择学生
                </h3>
                <p class="mt-2 text-sm text-gray-400">
                  请在顶部选择学生以查看学习画像与学情分析
                </p>
              </div>
            </div>
            <div v-else class="h-full flex gap-4 overflow-hidden">
              <!-- 左：完整学习画像 -->
              <div
                class="flex-1 h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <AiLearningProfile :student-id="selectedStudentId" />
              </div>
              <!-- 右：原 chat 右侧的画像 / 智能体 / 拓展资源 选项卡 -->
              <div
                class="w-[360px] flex-shrink-0 h-full bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <AiInspector
                  :profileDimensions="
                    selectedStudentId
                      ? myStudents.find(s => s.id === selectedStudentId)
                          ?.profileDimensions || profileDimensions
                      : profileDimensions
                  "
                  :agentItems="agentItems"
                  :resources="generatedResources"
                />
              </div>
            </div>
          </div>

          <div v-else-if="activeRail === `assessment`" class="h-full w-full">
            <div
              v-if="isTeacher && !selectedStudentId"
              class="h-full w-full flex items-center justify-center bg-white"
            >
              <div
                class="flex flex-col items-center justify-center bg-transparent lottie-empty-state"
              >
                <LottieAnimation
                  :animationData="saasAnimation"
                  :width="360"
                  :height="360"
                />
                <h3 class="mt-4 text-lg font-black text-gray-600">
                  尚未选择学生
                </h3>
                <p class="mt-2 text-sm text-gray-400">
                  请在顶部选择学生以查看学习评估报告
                </p>
              </div>
            </div>
            <div v-else class="h-full bg-white overflow-hidden">
              <AiAssessment :student-id="selectedStudentId" />
            </div>
          </div>

          <!-- 【场景 C】 常规任务 (原自动化) -->
          <div
            v-else-if="activeRail === `automation`"
            class="h-full w-full overflow-hidden flex justify-center bg-white"
          >
            <div
              class="flex w-full h-full gap-4 transition-all duration-500 ease-in-out p-6"
              :class="selectedTaskId ? 'max-w-full' : 'max-w-5xl'"
            >
              <!-- 左侧：任务列表 -->
              <div
                class="h-full bg-white p-2 overflow-y-auto transition-all duration-500"
                :class="selectedTaskId ? 'w-[45%]' : 'w-full'"
              >
                <div class="mb-8">
                  <h2 class="text-2xl font-bold text-gray-800">常规任务计划</h2>
                  <p class="text-sm text-gray-500 mt-2">
                    助手会在后台为您自动执行这些周期性或触发式任务，提升教与学的效率。
                  </p>
                </div>

                <div class="space-y-4">
                  <div
                    v-for="task in routineTasks.filter(t =>
                      mode === '学生模式'
                        ? t.role === 'student'
                        : t.role === 'teacher'
                    )"
                    :key="task.id"
                    class="flex items-start justify-between p-5 rounded-2xl border transition-all group cursor-pointer"
                    :class="
                      selectedTaskId === task.id
                        ? 'border-primary/40 bg-primary/5 shadow-md shadow-primary/10'
                        : 'border-gray-100 hover:border-primary/20 hover:shadow-md bg-gray-50/50'
                    "
                    @click="selectedTaskId = task.id"
                  >
                    <div class="flex items-start gap-4">
                      <div
                        class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center transition-transform"
                        :class="
                          selectedTaskId === task.id
                            ? 'text-primary scale-110'
                            : 'text-primary group-hover:scale-110'
                        "
                      >
                        <component :is="task.icon" class="w-6 h-6" />
                      </div>
                      <div>
                        <h4
                          class="text-base font-semibold text-gray-800 flex items-center gap-2"
                        >
                          {{ task.title }}
                          <span
                            class="px-2 py-0.5 text-[10px] rounded-full"
                            :class="
                              task.status === 'active'
                                ? 'bg-green-100 text-green-600'
                                : 'bg-gray-200 text-gray-500'
                            "
                          >
                            {{ task.status === "active" ? "运行中" : "已暂停" }}
                          </span>
                        </h4>
                        <p class="text-sm text-gray-500 mt-1 line-clamp-2">
                          {{ task.desc }}
                        </p>
                        <p
                          class="text-xs text-gray-400 mt-2 flex items-center gap-1"
                        >
                          <el-icon><Clock /></el-icon> 上次执行：{{
                            task.lastRun
                          }}
                        </p>
                      </div>
                    </div>
                    <div
                      class="flex flex-col items-end justify-between h-full pl-2"
                    >
                      <el-switch
                        v-model="task.status"
                        active-value="active"
                        inactive-value="paused"
                        style="--el-switch-on-color: var(--el-color-primary)"
                        @click.stop
                      />
                      <el-button
                        type="primary"
                        link
                        class="mt-4 transition-opacity"
                        :class="
                          selectedTaskId === task.id
                            ? 'opacity-100 font-bold'
                            : 'opacity-0 group-hover:opacity-100'
                        "
                      >
                        记录 <el-icon class="ml-1"><ArrowRight /></el-icon>
                      </el-button>
                    </div>
                  </div>

                  <div
                    v-if="
                      routineTasks.filter(t =>
                        mode === '学生模式'
                          ? t.role === 'student'
                          : t.role === 'teacher'
                      ).length === 0
                    "
                    class="text-center py-12 text-gray-400"
                  >
                    <el-empty
                      description="暂无计划中的常规任务"
                      :image-size="120"
                    />
                  </div>
                </div>
              </div>

              <!-- 右侧：历史记录面板 -->
              <div
                v-if="selectedTaskId"
                class="flex-1 h-full bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden animate-fade-in"
              >
                <!-- 头部 -->
                <div
                  class="flex items-center justify-between p-6 border-b border-gray-50"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 bg-primary/10 text-primary rounded-xl flex items-center justify-center"
                    >
                      <el-icon :size="20"><Document /></el-icon>
                    </div>
                    <div>
                      <h3 class="text-lg font-bold text-gray-800">
                        {{
                          routineTasks.find(t => t.id === selectedTaskId)?.title
                        }}
                      </h3>
                      <p class="text-[13px] text-gray-400 mt-0.5">
                        任务执行历史记录
                      </p>
                    </div>
                  </div>
                  <el-button
                    circle
                    plain
                    size="small"
                    @click="selectedTaskId = ''"
                  >
                    <el-icon><Close /></el-icon>
                  </el-button>
                </div>

                <!-- 时间轴区域 -->
                <div class="flex-1 overflow-y-auto p-8 relative bg-gray-50/30">
                  <el-timeline class="task-timeline">
                    <el-timeline-item
                      v-for="(item, index) in mockTaskHistory"
                      :key="index"
                      :type="item.status === 'success' ? 'success' : 'warning'"
                      :icon="
                        item.status === 'success'
                          ? 'CircleCheckFilled'
                          : 'WarningFilled'
                      "
                      :color="item.status === 'success' ? '#67C23A' : '#E6A23C'"
                      size="large"
                    >
                      <div
                        class="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <div class="flex items-center justify-between mb-2">
                          <span class="text-sm font-bold text-gray-700">{{
                            item.date
                          }}</span>
                          <span class="text-xs font-medium text-gray-400">{{
                            item.time
                          }}</span>
                        </div>
                        <p class="text-[13px] text-gray-600 leading-relaxed">
                          {{ item.log }}
                        </p>

                        <div
                          v-if="item.status === 'success' && index === 0"
                          class="mt-3 py-2 px-3 bg-gray-50 rounded-lg flex items-center justify-between border border-gray-100"
                        >
                          <span
                            class="text-xs text-gray-500 font-medium flex items-center gap-1.5"
                          >
                            <el-icon class="text-primary"
                              ><FolderOpened
                            /></el-icon>
                            产出报告.pdf
                          </span>
                          <el-button
                            type="primary"
                            link
                            size="small"
                            class="text-xs"
                            >查看</el-button
                          >
                        </div>
                      </div>
                    </el-timeline-item>
                  </el-timeline>
                </div>
              </div>
            </div>
          </div>

          <!-- 【场景 D】 其他未开发项 -->
          <div
            v-else
            class="h-full w-full flex items-center justify-center p-4"
          >
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
                }}」属于预期规划内，即将上线，敬请期待...
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>

    <!-- 栈操作可视化预览弹窗 -->
    <el-dialog
      v-model="stackPreviewVisible"
      title="栈 (Stack) 操作可视化"
      width="640px"
      align-center
      destroy-on-close
    >
      <div class="flex gap-6">
        <!-- 栈可视化区 -->
        <div
          class="relative w-44 h-72 mx-auto bg-gradient-to-b from-indigo-50 to-purple-50 rounded-2xl border-2 border-dashed border-indigo-300 flex flex-col-reverse items-center p-3 gap-2 overflow-hidden"
        >
          <div
            class="absolute top-2 left-3 text-[11px] font-bold text-indigo-500"
          >
            栈顶 (top) ↑
          </div>
          <div
            class="absolute bottom-2 right-3 text-[11px] font-bold text-purple-500"
          >
            栈底 (bottom)
          </div>
          <transition-group name="stack-anim" tag="div" class="flex flex-col-reverse gap-2 w-full items-center">
            <div
              v-for="item in stackItems"
              :key="item.key"
              class="w-28 h-9 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold flex items-center justify-center shadow-lg"
            >
              {{ item.value }}
            </div>
          </transition-group>
          <div
            v-if="!stackItems.length"
            class="absolute inset-0 flex items-center justify-center text-gray-400 text-sm"
          >
            栈为空
          </div>
        </div>

        <!-- 操作 + 日志 -->
        <div class="flex-1 flex flex-col gap-3">
          <div class="flex flex-wrap gap-2">
            <el-button type="primary" @click="stackPush">push 压栈</el-button>
            <el-button type="danger" @click="stackPop">pop 出栈</el-button>
            <el-button type="warning" @click="stackPeek">peek 栈顶</el-button>
            <el-button @click="stackReset">重置</el-button>
          </div>
          <div class="text-xs text-gray-500">
            栈大小：<b class="text-indigo-600">{{ stackItems.length }}</b>
            ｜ 栈顶元素：<b class="text-pink-600">{{
              stackItems[stackItems.length - 1]?.value || "—"
            }}</b>
          </div>
          <div
            class="flex-1 min-h-[180px] max-h-[220px] overflow-auto rounded-lg bg-gray-900 text-emerald-300 font-mono text-[12px] p-3 leading-relaxed"
          >
            <div v-for="(line, i) in stackLog" :key="i">› {{ line }}</div>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button @click="stackPreviewVisible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.stack-anim-enter-active,
.stack-anim-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.stack-anim-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.7);
}
.stack-anim-leave-to {
  opacity: 0;
  transform: translateY(-40px) scale(0.7);
}
</style>

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

/* 让 Lottie 空状态动画的白色区域与渐变背景融合，呈现真正的"透明"效果 */
.lottie-empty-state {
  :deep(svg) {
    mix-blend-mode: multiply;
    background: transparent !important;
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
