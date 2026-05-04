<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import dayjs from "dayjs";
import { storageLocal } from "@pureadmin/utils";
import { userKey, type DataInfo } from "@/utils/auth";

import ChatIcon from "@/assets/aiagentsvg/chat-bubble-balloon-svgrepo-com.svg?component";
import ResourceIcon from "@/assets/aiagentsvg/data-development-resource-library-svgrepo-com.svg?component";
import PathIcon from "@/assets/aiagentsvg/path-location-svgrepo-com.svg?component";
import ProfileIcon from "@/assets/aiagentsvg/chart-user-square-svgrepo-com.svg?component";
import AssessmentIcon from "@/assets/aiagentsvg/chart-line-svgrepo-com.svg?component";
import AutomationIcon from "@/assets/aiagentsvg/script-coding-programming-svgrepo-com.svg?component";
import AgentPdfWorkbench from "@/views/ai-app/AgentPdfWorkbench.vue";

import * as echarts from "echarts";
import katex from "katex";
import "katex/dist/katex.min.css";
import {
  ArrowLeftBold,
  ChatDotRound,
  ArrowDown,
  Search,
  User,
  DataAnalysis,
  MagicStick,
  Connection,
  Switch,
  Notebook,
  FolderOpened,
  PieChart,
  Collection,
  Cpu,
  Paperclip,
  Check,
  Coordinate,
  Guide,
  VideoPlay,
  Monitor
} from "@element-plus/icons-vue";

defineOptions({
  name: "AiAppPage"
});

type ThemeAccent = {
  accent: string;
  accentStrong: string;
  accentRgb: string;
  secondary: string;
};

const route = useRoute();
const router = useRouter();
const userInfo = storageLocal().getItem<DataInfo<number>>(userKey);
const layoutStorage = storageLocal().getItem("responsive-layout") as
  | { darkMode?: boolean }
  | undefined;
const currentTheme = ref(
  (storageLocal().getItem("course_theme") as string) ||
    (layoutStorage?.darkMode ? "dark" : "light")
);

const activeRail = ref("chat");
const activeCourse = ref("数据结构与算法");
const activeContextTab = ref("execution");
const coursePanelOpen = ref(true); // Default open for the new column design

const placeholders = [
  "输入一个教学或学习任务，例如：为本章生成课前诊断题。",
  "帮我分析一下当前课程的难点，并给学生出几道练习题。",
  "根据当前学情，生成一份个性化的复习计划建议。",
  "我想为这节课设计一个互动环节，有什么好的创意吗？",
  "帮我总结一下《数据结构》中红黑树的核心知识点。"
];
const currentPlaceholderIndex = ref(0);
let placeholderTimer: any = null;

const radarChartRef = ref<HTMLElement>();
const barChartRef = ref<HTMLElement>();
let radarChart: echarts.ECharts | null = null;
let barChart: echarts.ECharts | null = null;

const initCharts = () => {
  if (radarChartRef.value) {
    radarChart = echarts.init(radarChartRef.value);
    radarChart.setOption({
      radar: {
        indicator: [
          { name: "逻辑思维", max: 100 },
          { name: "代码实现", max: 100 },
          { name: "理论知识", max: 100 },
          { name: "问题解决", max: 100 },
          { name: "创新能力", max: 100 }
        ],
        shape: "polygon",
        splitNumber: 5,
        axisName: {
          formatter: "{value}",
          color: "var(--text-muted)",
          backgroundColor: "var(--panel-soft)",
          borderRadius: 4,
          padding: [4, 8],
          fontWeight: 800,
          fontSize: 12
        },
        splitLine: {
          lineStyle: {
            color: [
              "rgba(154, 183, 248, 0.1)",
              "rgba(154, 183, 248, 0.2)",
              "rgba(154, 183, 248, 0.4)",
              "rgba(154, 183, 248, 0.6)",
              "rgba(154, 183, 248, 0.8)"
            ].reverse()
          }
        },
        splitArea: { show: false },
        axisLine: { lineStyle: { color: "rgba(154, 183, 248, 0.2)" } }
      },
      series: [
        {
          type: "radar",
          symbol: "circle",
          symbolSize: 6,
          itemStyle: { color: "var(--accent-strong)" },
          areaStyle: {
            color: new echarts.graphic.RadialGradient(0.5, 0.5, 1, [
              { color: "rgba(154, 183, 248, 0.1)", offset: 0 },
              { color: "rgba(154, 183, 248, 0.6)", offset: 1 }
            ])
          },
          lineStyle: { width: 3, color: "var(--accent)" },
          data: [{ value: [88, 76, 92, 70, 84], name: "当前能力画像" }]
        }
      ]
    });
  }

  if (barChartRef.value) {
    barChart = echarts.init(barChartRef.value);
    barChart.setOption({
      tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
      grid: {
        top: "10%",
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true
      },
      xAxis: {
        type: "category",
        data: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        axisTick: { show: false },
        axisLine: { lineStyle: { color: "var(--border)" } },
        axisLabel: { color: "var(--text-subtle)", fontWeight: 700 }
      },
      yAxis: {
        type: "value",
        splitLine: { lineStyle: { color: "var(--border)", type: "dashed" } },
        axisLine: { show: false },
        axisLabel: { color: "var(--text-subtle)" }
      },
      series: [
        {
          name: "学习时长",
          type: "bar",
          barWidth: "30%",
          showBackground: true,
          backgroundStyle: { color: "var(--panel-soft)", borderRadius: 8 },
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "var(--accent)" },
              { offset: 1, color: "var(--accent-strong)" }
            ]),
            borderRadius: [10, 10, 0, 0]
          },
          data: [120, 200, 150, 80, 70, 110, 130]
        },
        {
          name: "掌握程度",
          type: "line",
          smooth: true,
          symbol: "none",
          lineStyle: {
            width: 4,
            color: "var(--accent-secondary)",
            shadowBlur: 10,
            shadowColor: "rgba(0,0,0,0.1)"
          },
          data: [100, 130, 120, 150, 140, 180, 170]
        }
      ]
    });
  }
};

const renderMath = (tex: string) => {
  try {
    return katex.renderToString(tex, {
      throwOnError: false,
      displayMode: false
    });
  } catch (e) {
    return tex;
  }
};

const currentTime = ref("");

const updateTime = () => {
  const now = dayjs();
  const weekDay = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"][
    now.day()
  ];
  currentTime.value = `${now.format("M月D日")} ${weekDay} ${now.format("HH:mm")}`;
};

let timer: any = null;

const isNewTab = computed(() => route.query.newTab === "true");

onMounted(() => {
  // 如果不是新标签页打开，且是教师模式，则自动弹出新标签页并留在原地显示动画
  if (!isNewTab.value && mode.value === "教师模式") {
    const url =
      window.location.href +
      (window.location.href.includes("?") ? "&" : "?") +
      "newTab=true";
    window.open(url, "_blank");
  }

  updateTime();
  timer = setInterval(updateTime, 1000);
  nextTick(() => {
    initCharts();
  });
  window.addEventListener("resize", handleResize);
  placeholderTimer = setInterval(() => {
    currentPlaceholderIndex.value =
      (currentPlaceholderIndex.value + 1) % placeholders.length;
  }, 4000);
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
  window.removeEventListener("resize", handleResize);
  if (placeholderTimer) clearInterval(placeholderTimer);
  radarChart?.dispose();
  barChart?.dispose();
});

const handleResize = () => {
  radarChart?.resize();
  barChart?.resize();
};

const currentPlaceholder = computed(
  () => placeholders[currentPlaceholderIndex.value]
);

// Quick tools and style
const showTools = ref(true);
const chatStyle = ref("balanced"); // gentle, professional, balanced

const chatStyles = [
  { key: "gentle", label: "温柔", desc: "更具亲和力，适合辅导" },
  { key: "professional", label: "专业", desc: "严谨客观，知识能力更强" },
  { key: "balanced", label: "平衡", desc: "兼顾温度与深度" }
];

const mode = computed(() => {
  if (route.query.mode === "student") return "学生模式";
  if (route.query.mode === "teacher") return "教师模式";
  if (userInfo?.roles?.includes("student")) return "学生模式";
  return "教师模式";
});

const fallbackPath = computed(() => {
  if (
    route.path.startsWith("/account") ||
    userInfo?.roles?.includes("student")
  ) {
    return "/account";
  }
  return "/welcome";
});

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push(fallbackPath.value);
};

const leftRailItems = [
  { key: "chat", label: "智能辅导", icon: ChatIcon },
  { key: "generation", label: "资源生成", icon: ResourceIcon },
  { key: "agentpdf", label: "Agent PDF", icon: FolderOpened },
  { key: "path", label: "路径规划", icon: PathIcon },
  { key: "profile", label: "学习画像", icon: ProfileIcon },
  { key: "assessment", label: "学习评估", icon: AssessmentIcon },
  { key: "automation", label: "自动化", icon: AutomationIcon }
];

const agents = [
  {
    id: "doc",
    name: "讲解专家",
    role: "讲解文档生成",
    icon: Notebook,
    status: "idle"
  },
  {
    id: "map",
    name: "思维导图",
    role: "知识脉络构建",
    icon: Connection,
    status: "idle"
  },
  {
    id: "exercise",
    name: "题库专家",
    role: "精准练习出题",
    icon: Collection,
    status: "idle"
  },
  {
    id: "video",
    name: "视听专家",
    role: "教学视频制作",
    icon: VideoPlay,
    status: "idle"
  },
  {
    id: "code",
    name: "实战教练",
    role: "代码案例演示",
    icon: Monitor,
    status: "idle"
  }
];

const courses = [
  {
    name: "数据结构与算法",
    tag: "计算机",
    progress: 72,
    cover:
      "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400&auto=format&fit=crop&q=60"
  },
  {
    name: "民法总论",
    tag: "法学",
    progress: 48,
    cover:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=60"
  },
  {
    name: "微观经济学",
    tag: "经济学",
    progress: 63,
    cover:
      "https://images.unsplash.com/photo-1611974714658-75d325ad04da?w=400&auto=format&fit=crop&q=60"
  }
];

const contextTabs = [
  { key: "execution", label: "执行" },
  { key: "document", label: "文档" },
  { key: "sources", label: "来源" }
];

const executionSteps = [
  { title: "分析课程上下文", status: "done" },
  { title: "读取学习画像", status: "running" },
  { title: "准备资源", status: "pending" }
];

const sourceItems = ["课程资料", "学习画像", "最近练习"];

const pdfServiceUrl = "https://agentpdf.intelledu.cn";

const accentMap: Record<string, ThemeAccent> = {
  light: {
    accent: "#9ab7f8",
    accentStrong: "#7698f0",
    accentRgb: "154, 183, 248",
    secondary: "#b4c9f9"
  },
  default: {
    accent: "#9ab7f8",
    accentStrong: "#7698f0",
    accentRgb: "154, 183, 248",
    secondary: "#b4c9f9"
  },
  saucePurple: {
    accent: "#7c57e8",
    accentStrong: "#693ac9",
    accentRgb: "124, 87, 232",
    secondary: "#b394ff"
  },
  pink: {
    accent: "#eb4ea2",
    accentStrong: "#d84493",
    accentRgb: "235, 78, 162",
    secondary: "#ff9ac8"
  },
  dusk: {
    accent: "#f2545b",
    accentStrong: "#e13c39",
    accentRgb: "242, 84, 91",
    secondary: "#ff9a88"
  },
  volcano: {
    accent: "#f9733d",
    accentStrong: "#e85f33",
    accentRgb: "249, 115, 61",
    secondary: "#ffb066"
  },
  mingQing: {
    accent: "#1eb9b9",
    accentStrong: "#13a8a8",
    accentRgb: "30, 185, 185",
    secondary: "#67e8f0"
  },
  auroraGreen: {
    accent: "#58b947",
    accentStrong: "#479f39",
    accentRgb: "88, 185, 71",
    secondary: "#8ce99a"
  }
};

const makeLightTheme = (accent: ThemeAccent): Record<string, string> => ({
  "--page-bg": "#f3f6fc",
  "--panel-bg": "#ffffff",
  "--panel-soft": "#f8fafe",
  "--panel-muted": "#edf2fb",
  "--border": "rgba(100, 116, 139, 0.14)",
  "--border-strong": `rgba(${accent.accentRgb}, 0.28)`,
  "--text": "#252b36",
  "--text-muted": "#5f6878",
  "--text-subtle": "#9aa4b5",
  "--accent": accent.accent,
  "--accent-strong": accent.accentStrong,
  "--accent-soft": `rgba(${accent.accentRgb}, 0.1)`,
  "--accent-softer": `rgba(${accent.accentRgb}, 0.06)`,
  "--accent-line": `rgba(${accent.accentRgb}, 0.16)`,
  "--accent-secondary": accent.secondary,
  "--shadow": "0 10px 24px rgba(15, 23, 42, 0.06)"
});

const darkTheme: Record<string, string> = {
  "--page-bg": "#0b1220",
  "--panel-bg": "#111827",
  "--panel-soft": "#162033",
  "--panel-muted": "#0f172a",
  "--border": "rgba(148, 163, 184, 0.14)",
  "--border-strong": "rgba(56, 189, 248, 0.24)",
  "--text": "#f8fafc",
  "--text-muted": "#b8c2d6",
  "--text-subtle": "#8190aa",
  "--accent": "#38bdf8",
  "--accent-strong": "#0ea5e9",
  "--accent-soft": "rgba(56, 189, 248, 0.12)",
  "--accent-softer": "rgba(56, 189, 248, 0.08)",
  "--accent-line": "rgba(56, 189, 248, 0.18)",
  "--accent-secondary": "#67e8f9",
  "--shadow": "0 12px 30px rgba(0, 0, 0, 0.28)"
};

const themeVars = computed<Record<string, string>>(() => {
  if (currentTheme.value === "dark") return darkTheme;
  return makeLightTheme(accentMap[currentTheme.value] || accentMap.light);
});

const formatProgress = (progress: number) => `${progress}%`;

const activeCourseInfo = computed(
  () => courses.find(course => course.name === activeCourse.value) || courses[0]
);

const selectCourse = (courseName: string) => {
  activeCourse.value = courseName;
  coursePanelOpen.value = false;
};

const getStatusText = (status: string) => {
  if (status === "done") return "完成";
  if (status === "running") return "进行中";
  return "等待";
};

const currentExecutionSteps = computed(() => executionSteps);

const currentSourceItems = computed(() => sourceItems);
</script>

<template>
  <div class="ai-app-page" :class="currentTheme" :style="themeVars">
    <div v-if="!isNewTab && mode === '教师模式'" class="placeholder-container">
      <div class="animation-box">
        <div class="pulse-ring" />
        <el-icon class="ai-icon"><Cpu /></el-icon>
      </div>
      <h2>AI 工作台已在新窗口打开</h2>
      <p>正在同步智能代理状态...</p>
      <button class="reopen-btn" @click="goBack">返回上一级</button>
    </div>
    <div v-else :class="['page-shell', { 'is-fullscreen': isNewTab }]">
      <header class="app-header reveal" style="--delay: 0.04s">
        <div class="header-left">
          <button
            type="button"
            class="back-btn"
            aria-label="返回"
            @click="goBack"
          >
            <el-icon><ArrowLeftBold /></el-icon>
          </button>

          <div class="flex items-center ml-4">
            <span
              class="logo-text text-xl font-black italic tracking-tighter uppercase"
              >IntellEdu</span
            >
            <div class="h-4 w-[1px] bg-gray-300 mx-4" />
            <span
              class="text-sm font-medium text-gray-500/80 dark:text-gray-400/80 font-mono tracking-tight mr-4 whitespace-nowrap"
            >
              {{ currentTime }}
            </span>
            <div class="h-4 w-[1px] bg-gray-300 mr-4" />
          </div>

          <div class="text-sm font-medium text-gray-600 dark:text-gray-400">
            {{ route.meta.title }}
          </div>
        </div>

        <div class="header-actions">
          <span class="mode-pill">{{ mode }}</span>
        </div>
      </header>

      <div :class="['app-body', { 'is-agent-pdf': activeRail === 'agentpdf' }]">
        <div class="rail-area reveal" style="--delay: 0.08s">
          <aside class="nav-rail">
            <button
              v-for="(item, index) in leftRailItems"
              :key="item.key"
              type="button"
              class="rail-item reveal"
              :class="{ active: activeRail === item.key }"
              :style="{ '--delay': `${0.1 + index * 0.03}s` }"
              @click="activeRail = item.key"
            >
              <span class="rail-icon">
                <el-icon><component :is="item.icon" /></el-icon>
              </span>
              <span class="rail-label">{{ item.label }}</span>
            </button>
          </aside>
        </div>

        <aside
          v-if="activeRail !== 'agentpdf'"
          class="course-column reveal"
          style="--delay: 0.12s"
        >
          <div class="column-header">
            <h3>选择课程</h3>
            <span class="count">{{ courses.length }}</span>
          </div>
          <div class="course-scroll">
            <button
              v-for="(course, index) in courses"
              :key="course.name"
              type="button"
              class="course-card"
              :class="{ active: activeCourse === course.name }"
              :style="{ '--item-delay': `${index * 0.06}s` }"
              @click="selectCourse(course.name)"
            >
              <div class="course-cover">
                <img :src="course.cover" :alt="course.name" />
                <div class="progress-overlay">
                  <span class="progress-val">{{ course.progress }}%</span>
                </div>
              </div>
              <div class="course-info">
                <span class="course-tag">{{ course.tag }}</span>
                <span class="course-name">{{ course.name }}</span>
                <div class="progress-mini">
                  <div
                    class="progress-bar"
                    :style="{ width: `${course.progress}%` }"
                  />
                </div>
              </div>
            </button>
          </div>
        </aside>

        <main class="workspace">
          <!-- Chat / Tutoring -->
          <section
            v-if="activeRail === 'chat'"
            class="content-view tutoring-view reveal"
          >
            <header class="view-header">
              <div class="view-title">
                <el-icon><ChatDotRound /></el-icon>
                <h2>智能辅导</h2>
              </div>
              <div class="view-actions">
                <span class="status-indicator">
                  <span class="dot active" />
                  AI 助教已就绪
                </span>
              </div>
            </header>

            <div class="view-body">
              <div class="tutoring-main">
                <div class="tutoring-copy">
                  <h1>我们今天构建什么课程能力？</h1>
                  <p>
                    基于当前课程《{{
                      activeCourseInfo.name
                    }}》，您可以尝试以下指令：
                  </p>
                </div>

                <div class="composer-container">
                  <div class="composer">
                    <div class="composer-top-bar">
                      <div class="quick-tools">
                        <button
                          v-for="tool in [
                            { icon: PieChart, label: '学情' },
                            { icon: Collection, label: '习题' },
                            { icon: MagicStick, label: 'Skill' }
                          ]"
                          :key="tool.label"
                          class="tool-btn"
                        >
                          <el-icon><component :is="tool.icon" /></el-icon>
                          <span>{{ tool.label }}</span>
                        </button>
                      </div>
                      <div class="divider" />
                      <div class="style-selector">
                        <button
                          v-for="style in chatStyles"
                          :key="style.key"
                          class="style-btn"
                          :class="{ active: chatStyle === style.key }"
                          @click="chatStyle = style.key"
                        >
                          {{ style.label }}
                        </button>
                      </div>
                    </div>

                    <textarea
                      class="composer-input"
                      :placeholder="currentPlaceholder"
                    />

                    <div class="composer-bottom">
                      <div class="composer-left">
                        <button class="attach-btn" title="上传附件">
                          <el-icon><Paperclip /></el-icon>
                        </button>
                        <div class="active-context">
                          <span class="tag">当前关联</span>
                          <span class="val">{{ activeCourseInfo.name }}</span>
                        </div>
                      </div>
                      <button type="button" class="send-btn">
                        <el-icon><Promotion /></el-icon>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Resource Generation -->
          <section
            v-else-if="activeRail === 'generation'"
            class="content-view generation-view reveal"
          >
            <header class="view-header">
              <div class="view-title">
                <el-icon><Cpu /></el-icon>
                <h2>多智能体协同生成</h2>
              </div>
              <button class="primary-gen-btn mini">
                <el-icon><MagicStick /></el-icon>
                一键生成全套
              </button>
            </header>

            <div class="view-body">
              <div class="gen-intro">
                <h3>协作智能体矩阵</h3>
                <p>
                  依据您的专业背景与课程《{{
                    activeCourseInfo.name
                  }}》自动生成多模态资料
                </p>
              </div>
              <div class="agent-grid">
                <div v-for="agent in agents" :key="agent.id" class="agent-card">
                  <div class="agent-icon-box">
                    <el-icon><component :is="agent.icon" /></el-icon>
                  </div>
                  <div class="agent-info">
                    <h4>{{ agent.name }}</h4>
                    <p>{{ agent.role }}</p>
                  </div>
                  <div class="agent-status">
                    <span class="status-dot" :class="agent.status" />
                    {{ agent.status === "idle" ? "待命" : "生成中" }}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section
            v-else-if="activeRail === 'agentpdf'"
            class="content-view agentpdf-view reveal"
          >
            <header class="view-header">
              <div class="view-title">
                <el-icon><FolderOpened /></el-icon>
                <h2>Agent PDF 工作台</h2>
              </div>
            </header>

            <div class="view-body agentpdf-body">
              <section class="agentpdf-workbench-panel">
                <div class="card-title-row">
                  <div>
                    <h3>翻译工作台</h3>
                    <p class="card-subtitle">上传 PDF 并开始翻译任务</p>
                  </div>
                </div>
                <AgentPdfWorkbench :service-url="pdfServiceUrl" />
              </section>
            </div>
          </section>

          <!-- Learning Path -->
          <section
            v-else-if="activeRail === 'path'"
            class="content-view path-view reveal"
          >
            <header class="view-header">
              <div class="view-title">
                <el-icon><Guide /></el-icon>
                <h2>动态学习路径规划</h2>
              </div>
              <div class="path-meta">
                <span class="meta-item">专业：计算机科学</span>
                <span class="meta-item"
                  >进度：{{ activeCourseInfo.progress }}%</span
                >
              </div>
            </header>

            <div class="view-body">
              <div class="path-steps">
                <div
                  v-for="(step, idx) in [
                    {
                      title: '知识点回顾',
                      type: 'DOC',
                      desc: '红黑树基础理论与特性',
                      status: 'done'
                    },
                    {
                      title: '逻辑梳理',
                      type: 'MAP',
                      desc: '构建动态平衡调整脉络图',
                      status: 'active'
                    },
                    {
                      title: '进阶实战',
                      type: 'CODE',
                      desc: '实现旋转与变色算法逻辑',
                      status: 'pending'
                    },
                    {
                      title: '能力评估',
                      type: 'EXAM',
                      desc: '完成 10 道针对性练习题',
                      status: 'pending'
                    }
                  ]"
                  :key="idx"
                  class="path-step-card"
                  :class="step.status"
                >
                  <div class="step-num">{{ idx + 1 }}</div>
                  <div class="step-main">
                    <div class="step-badge">{{ step.type }}</div>
                    <h4>{{ step.title }}</h4>
                    <p>{{ step.desc }}</p>
                  </div>
                  <button class="step-btn">
                    <template v-if="step.status === 'done'">重新复习</template>
                    <template v-else-if="step.status === 'active'"
                      >继续学习</template
                    >
                    <template v-else>立即开始</template>
                  </button>
                </div>
              </div>
            </div>
          </section>

          <!-- Learning Profile -->
          <section
            v-else-if="activeRail === 'profile'"
            class="content-view profile-view reveal"
          >
            <header class="view-header">
              <div class="view-title">
                <el-icon><User /></el-icon>
                <h2>学习画像</h2>
              </div>
            </header>
            <div class="view-body">
              <div class="profile-grid">
                <div class="profile-card hero">
                  <div class="hero-header">
                    <div class="avatar-large">
                      <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                        alt="avatar"
                      />
                    </div>
                    <div class="hero-info">
                      <h3>{{ userInfo?.username || "演示用户" }}</h3>
                      <p>计算机科学与技术 · 大三</p>
                    </div>
                  </div>
                  <div class="hero-stats">
                    <div class="stat-item">
                      <span class="val">128</span>
                      <span class="lab">累计学时</span>
                    </div>
                    <div class="stat-item">
                      <span class="val">12</span>
                      <span class="lab">获得证书</span>
                    </div>
                    <div class="stat-item">
                      <span class="val">92</span>
                      <span class="lab">综合评分</span>
                    </div>
                  </div>
                </div>
                <div class="profile-card">
                  <h4>核心技能雷达</h4>
                  <div ref="radarChartRef" class="chart-container" />
                </div>
                <div class="profile-card">
                  <h4>学习活跃度</h4>
                  <div class="activity-grid">
                    <div
                      v-for="n in 28"
                      :key="n"
                      class="activity-dot"
                      :class="{ active: n % 3 === 0, strong: n % 7 === 0 }"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          <!-- Learning Assessment -->
          <section
            v-else-if="activeRail === 'assessment'"
            class="content-view assessment-view reveal"
          >
            <header class="view-header">
              <div class="view-title">
                <el-icon><DataAnalysis /></el-icon>
                <h2>学习评估</h2>
              </div>
            </header>
            <div class="view-body">
              <div class="assessment-content">
                <div class="assessment-card highlight">
                  <div class="score-main">
                    <span class="score-val">88</span>
                    <span class="score-unit">分</span>
                  </div>
                  <div class="score-desc">
                    <h4>当前课程掌握度：良好</h4>
                    <p v-html="renderMath('P(x) = \\sum_{i=0}^{n} a_i x^i')" />
                    <p>
                      您的算法逻辑理解较强，但在时空复杂度分析上仍有提升空间。
                    </p>
                  </div>
                </div>
                <div class="knowledge-mastery">
                  <h4>学习活跃度趋势</h4>
                  <div
                    ref="barChartRef"
                    class="chart-container"
                    style="height: 240px"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- Automation -->
          <section
            v-else-if="activeRail === 'automation'"
            class="content-view automation-view reveal"
          >
            <header class="view-header">
              <div class="view-title">
                <el-icon><Switch /></el-icon>
                <h2>自动化任务</h2>
              </div>
              <button class="primary-gen-btn mini">新建工作流</button>
            </header>
            <div class="view-body">
              <div class="auto-list">
                <div
                  v-for="task in [
                    {
                      name: '课后总结自动生成',
                      desc: '每节直播课结束后，自动提取关键知识点并生成总结文档',
                      status: true
                    },
                    {
                      name: '个性化错题集推送',
                      desc: '每周五晚上 8 点，根据本周评估结果整理薄弱项练习题',
                      status: true
                    },
                    {
                      name: '学习进度超前提醒',
                      desc: '当课程学习进度超过 10% 的平均水平时，自动推送进阶实操案例',
                      status: false
                    }
                  ]"
                  :key="task.name"
                  class="auto-card"
                >
                  <div class="auto-info">
                    <h4>{{ task.name }}</h4>
                    <p>{{ task.desc }}</p>
                  </div>
                  <el-switch v-model="task.status" />
                </div>
              </div>
            </div>
          </section>

          <!-- Fallback -->
          <section v-else class="content-view empty-view reveal">
            <header class="view-header">
              <div class="view-title">
                <h2>
                  {{ leftRailItems.find(i => i.key === activeRail)?.label }}
                </h2>
              </div>
            </header>
            <div class="view-body centered">
              <div class="empty-state">
                <el-icon><Monitor /></el-icon>
                <h3>模块开发中</h3>
                <p>该功能模块正在紧锣密鼓地建设中...</p>
              </div>
            </div>
          </section>
        </main>

        <aside
          v-if="activeRail !== 'agentpdf'"
          class="context-panel panel reveal"
          style="--delay: 0.18s"
        >
          <div class="context-tabs">
            <button
              v-for="tab in contextTabs"
              :key="tab.key"
              type="button"
              :class="{ active: activeContextTab === tab.key }"
              @click="activeContextTab = tab.key"
            >
              {{ tab.label }}
            </button>
          </div>

          <template v-if="activeContextTab === 'execution'">
            <div class="panel-title compact">
              <span>执行轨迹</span>
            </div>
            <div class="trace-list">
              <div
                v-for="step in currentExecutionSteps"
                :key="step.title"
                class="trace-item"
              >
                <span class="trace-name">{{ step.title }}</span>
                <span class="trace-status" :class="step.status">
                  {{ getStatusText(step.status) }}
                </span>
              </div>
            </div>
          </template>

          <template v-else-if="activeContextTab === 'document'">
            <div class="empty-state">
              <el-icon><Notebook /></el-icon>
              <p>暂无打开的文档</p>
            </div>
          </template>

          <template v-else>
            <div class="source-list">
              <div
                v-for="item in currentSourceItems"
                :key="item"
                class="source-item"
              >
                {{ item }}
              </div>
            </div>
          </template>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ai-app-page {
  --page-bg: #f3f6fc;
  --panel-bg: #fff;
  --panel-soft: #f8fafe;
  --panel-muted: #edf2fb;
  --border: rgb(100 116 139 / 14%);
  --border-strong: rgb(111 143 247 / 28%);
  --text: #252b36;
  --text-muted: #5f6878;
  --text-subtle: #9aa4b5;
  --accent: #6f8ff7;
  --accent-strong: #5b74ea;
  --accent-soft: rgb(111 143 247 / 10%);
  --accent-softer: rgb(111 143 247 / 6%);
  --accent-line: rgb(111 143 247 / 16%);
  --accent-secondary: #66c6ff;
  --shadow: 0 10px 24px rgb(15 23 42 / 6%);
  --radius-page: 24px;
  --radius-panel: 24px;
  --radius-control: 16px;
  --radius-inner: 12px;
  min-height: 100vh;
  padding: 20px;
  overflow: hidden;
  font-family: "Avenir Next", "PingFang SC", "Helvetica Neue", sans-serif;
  color: var(--text);
  background: linear-gradient(180deg, #eef3fb 0%, var(--page-bg) 100%);

  &:has(.is-fullscreen) {
    padding: 0;
    max-width: none;
    background: var(--page-bg);

    .app-header {
      margin: 12px 14px 0 !important;
      border-radius: 16px !important;
    }

    .app-body {
      padding: 16px;
    }
  }
}

.page-shell,
.page-shell * {
  box-sizing: border-box;
}

.placeholder-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 80vh;
  text-align: center;
  color: var(--text-muted);

  .animation-box {
    position: relative;
    width: 100px;
    height: 100px;
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    justify-content: center;

    .ai-icon {
      font-size: 48px;
      color: var(--accent-strong);
      z-index: 2;
    }

    .pulse-ring {
      position: absolute;
      width: 100%;
      height: 100%;
      border: 4px solid var(--accent-soft);
      border-radius: 50%;
      animation: pulse-bloom 2s infinite;
    }
  }

  h2 {
    font-size: 24px;
    font-weight: 800;
    margin-bottom: 8px;
    color: var(--text);
  }

  p {
    font-size: 16px;
    opacity: 0.7;
    margin-bottom: 24px;
  }

  .reopen-btn {
    padding: 10px 24px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--panel-bg);
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 600;

    &:hover {
      background: var(--panel-soft);
      border-color: var(--accent-line);
      color: var(--accent-strong);
    }
  }
}

@keyframes pulse-bloom {
  0% {
    transform: scale(0.6);
    opacity: 1;
  }
  100% {
    transform: scale(1.4);
    opacity: 0;
  }
}

.page-shell {
  max-width: 1880px;
  margin: 0 auto;

  &.is-fullscreen {
    max-width: none;
    margin: 0;
    height: 100vh;
    display: flex;
    flex-direction: column;

    .app-body {
      height: calc(100vh - 100px);
      flex: 1;
    }
  }
}

button,
textarea {
  font: inherit;
  color: inherit;
}

button:focus-visible,
textarea:focus-visible {
  outline: 2px solid var(--accent-line);
  outline-offset: 2px;
}

.panel,
.app-header,
.nav-rail {
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-panel);
  box-shadow: var(--shadow);
}

.reveal {
  opacity: 0;
  transform: translateY(10px);
  animation: reveal-up 0.42s ease forwards;
  animation-delay: var(--delay, 0s);
}

.app-header {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 64px;
  padding: 12px 24px;
  margin: 12px 14px 18px; // 左右留白
  border-radius: 16px; // 圆角
  background: rgba(255, 255, 255, 0.4) !important; 
  backdrop-filter: blur(16px) saturate(160%) !important; 
  -webkit-backdrop-filter: blur(16px) saturate(160%) !important;
  border: 1px solid rgba(255, 255, 255, 0.4) !important; 
  // 增加了一层柔和的阴影，有深度但不厚重
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.05) !important; 
  z-index: 100;

  .logo-text {
    color: #3b82f6;
    font-style: italic;
    text-shadow: 0 0 10px rgba(59, 130, 246, 0.3);
    transition: all 0.3s ease;

    &:hover {
      text-shadow: 0 0 15px rgba(59, 130, 246, 0.6);
    }
  }
}

.header-left {
  display: flex;
  gap: 14px;
  align-items: center;
  min-width: 0;
}

.back-btn {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  font-size: 24px;
  color: var(--accent-strong);
  cursor: pointer;
  background: var(--accent-soft);
  border: 1px solid var(--accent-line);
  border-radius: 16px;
  transition:
    background 0.2s ease,
    transform 0.2s ease;

  &:hover {
    background: var(--accent-line);
    transform: translateX(-2px);
  }
}

.brand-block {
  min-width: 0;

  h1 {
    margin: 6px 0 0;
    font-size: 26px;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.02em;
  }
}

.brand-art {
  display: flex;
  gap: 10px;
  align-items: baseline;
  margin: 0;
  line-height: 1;
  color: var(--accent);
}

.brand-cn {
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.06em;
  background: linear-gradient(135deg, var(--accent-strong), var(--accent));
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-en {
  font-size: 18px;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -0.06em;
  color: rgb(37 99 235 / 78%);
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  color: var(--text-muted);
}

.mode-pill {
  display: inline-flex;
  align-items: center;
  height: 30px;
  padding: 0 12px;
  font-size: 13px;
  font-weight: 700;
  color: #fff;
  background: var(--accent);
  border-radius: 999px;
  box-shadow: 0 4px 12px rgb(37 99 235 / 14%);
}

.app-body {
  --left-column: 112px;
  --course-column: 280px;
  --right-column: 320px;
  display: grid;
  grid-template-columns:
    var(--left-column) var(--course-column) minmax(0, 1fr)
    var(--right-column);
  gap: 16px;
  align-items: center;
  min-height: calc(100vh - 124px);

  &.is-agent-pdf {
    grid-template-columns: var(--left-column) minmax(0, 1fr);
  }
}

.rail-area {
  display: flex;
  flex-direction: column;
  z-index: 4;
  height: 100%;
  justify-content: center;
}

.nav-rail {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px 10px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: var(--shadow);
  position: relative;
  overflow: hidden;
  height: auto;
  align-self: center;

  &::after {
    position: absolute;
    inset: 0;
    z-index: 0;
    padding: 1.2px;
    pointer-events: none;
    content: "";
    background: linear-gradient(90deg, #97b4f7, #604ffd, #97b4f7);
    background-size: 200% 100%;
    border-radius: 20px;
    mask:
      linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    animation: sidebar-glow-border 3s linear infinite;
    opacity: 0.3;
  }
}

.rail-item {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: center;
  justify-content: center;
  min-height: 72px;
  padding: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: var(--accent-softer);
    transform: translateX(2px);
    color: var(--accent-strong);

    .rail-icon {
      color: var(--accent-strong);
      background: #fff;
    }
  }

  &.active {
    color: #fff;
    background: linear-gradient(135deg, var(--accent), var(--accent-strong));
    box-shadow: 0 4px 12px var(--accent-soft);

    .rail-icon {
      color: var(--accent);
      background: #fff;
    }
  }
}

.rail-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  font-size: 26px;
  color: var(--text-muted);
  background: var(--panel-soft);
  border-radius: 12px;
  transition: all 0.3s ease;

  svg {
    width: 28px;
    height: 28px;
    fill: currentColor;
  }
}

.course-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow);
  padding: 20px 14px;
  z-index: 3;
  height: calc(100vh - 124px);
  align-self: start;
}

.workspace {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 0;
  overflow: hidden;
  height: calc(100vh - 124px);
  align-self: start;
}

.context-panel {
  height: calc(100vh - 124px);
  padding: 24px 20px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow);
  align-self: start;
}

.column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px; 
  background: var(--panel-soft); // 浅色背景增强区域感
  border-radius: 12px; // 引入 R 角
  margin-bottom: 12px; 
  border: 1px solid var(--border);

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
    color: var(--text);
  }

  .count {
    padding: 2px 8px;
    font-size: 12px;
    font-weight: 700;
    color: var(--accent-strong);
    background: var(--accent-softer);
    border-radius: 8px;
  }
}

.course-scroll {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 10px;
  }
}

.course-card {
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: var(--panel-soft);
  border: 1px solid transparent;
  border-radius: 18px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  text-align: left;

  &:hover {
    background: #fff;
    border-color: var(--accent-line);
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.04);
  }

  &.active {
    background: #fff;
    border-color: var(--accent-strong);
    box-shadow: 0 10px 24px var(--accent-softer);

    .course-name {
      color: var(--accent-strong);
    }
  }
}

.course-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 12px;
  overflow: hidden;
  margin-bottom: 10px;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.progress-overlay {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 4px 8px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  border-radius: 8px;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}

.course-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.course-tag {
  font-size: 11px;
  font-weight: 700;
  color: var(--text-subtle);
}

.course-name {
  font-size: 14px;
  font-weight: 800;
  color: var(--text);
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.progress-mini {
  width: 100%;
  height: 4px;
  background: var(--panel-muted);
  border-radius: 10px;
  margin-top: 6px;
  overflow: hidden;

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent-secondary));
    border-radius: inherit;
  }
}

.composer-top-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 4px 12px;
  margin-bottom: 4px;
  border-bottom: 1px solid var(--panel-muted);
}

.quick-tools {
  display: flex;
  gap: 6px;
}

.tool-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--panel-soft);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  .el-icon {
    font-size: 15px;
  }

  &:hover {
    color: var(--accent-strong);
    border-color: var(--accent-line);
    background: #fff;
  }
}

.divider {
  width: 1px;
  height: 20px;
  background: var(--border);
}

.style-selector {
  display: flex;
  gap: 4px;
  padding: 3px;
  background: var(--panel-muted);
  border-radius: 10px;
}

.style-btn {
  padding: 4px 10px;
  font-size: 12px;
  font-weight: 700;
  color: var(--text-subtle);
  border: none;
  background: transparent;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--text-muted);
  }

  &.active {
    color: var(--accent-strong);
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }
}

.composer-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.attach-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  font-size: 18px;
  color: var(--text-muted);
  background: var(--panel-soft);
  border: 1px solid var(--border);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: var(--accent-strong);
    border-color: var(--accent-line);
    background: #fff;
  }
}

.course-drawer {
  position: absolute;
  top: 0;
  left: calc(100% + 12px);
  z-index: 5;
  width: 318px;
  padding: 16px;
  border-radius: var(--radius-panel);
}

.course-drawer .course-item {
  opacity: 0;
  transform: translateX(-8px);
  animation: course-item-in 0.3s ease forwards;
  animation-delay: var(--item-delay, 0s);
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 72px;
  padding: 0 24px;
  margin-bottom: 20px;
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.03);
}

.ai-app-page.dark .app-header {
  background: rgba(17, 24, 39, 0.4) !important;
  backdrop-filter: blur(12px) saturate(140%) !important;
  -webkit-backdrop-filter: blur(12px) saturate(140%) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.3) !important;

  .logo-text {
    color: #60a5fa;
    text-shadow: 0 0 10px rgba(96, 165, 250, 0.5);
  }
}

.header-left {
  display: flex;
  gap: 20px;
  align-items: center;
  min-width: 0;
}

.back-btn {
  display: inline-flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  font-size: 18px;
  color: var(--text-muted);
  cursor: pointer;
  background: var(--panel-soft);
  border: 1px solid var(--border);
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    color: var(--accent-strong);
    background: var(--accent-softer);
    border-color: var(--accent-line);
    transform: translateX(-2px);
  }
}

.brand-block {
  min-width: 0;

  h1 {
    margin: 2px 0 0;
    font-size: 20px;
    font-weight: 800;
    line-height: 1.2;
    letter-spacing: -0.01em;
    color: var(--text);
  }
}

.brand-art {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 0;
  line-height: 1;
}

.brand-cn {
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.04em;
  color: var(--accent-strong);
}

.brand-en {
  font-size: 14px;
  font-weight: 900;
  font-style: italic;
  letter-spacing: -0.04em;
  color: var(--text-subtle);
  opacity: 0.6;
}

.mode-pill {
  display: inline-flex;
  align-items: center;
  height: 28px;
  padding: 0 12px;
  font-size: 12px;
  font-weight: 700;
  color: var(--accent-strong);
  background: var(--accent-softer);
  border: 1px solid var(--accent-line);
  border-radius: 999px;
}

.workspace {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 0;
  overflow: visible;
  min-height: calc(100vh - 124px);
}

.content-view {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  background: var(--page-bg);
}

.view-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 56px; // 稍微收窄一点，更精致
  padding: 0 20px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 12px; // 引入 R 角设计
  margin-bottom: 12px; // 增加与内容的空隙，使圆角闭合
  flex-shrink: 0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.02);
}

.view-title {
  display: flex;
  align-items: center;
  gap: 12px;
  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    color: var(--text);
  }
  .el-icon {
    font-size: 20px;
    color: var(--accent-strong);
  }
}

.view-body {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;

  &.centered {
    align-items: center;
    justify-content: center;
  }

  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--border);
    border-radius: 10px;
  }
}

/* Tutoring Specific */
.tutoring-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 860px;
  margin: 0 auto;
  width: 100%;
}

.tutoring-copy {
  text-align: center;
  margin-bottom: 32px;
  h1 {
    font-size: 32px;
    font-weight: 900;
    margin-bottom: 12px;
    background: linear-gradient(135deg, var(--text) 0%, var(--text-muted) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  p {
    font-size: 15px;
    color: var(--text-subtle);
  }
}

.composer-container {
  width: 100%;
}

/* Generation Specific */
.gen-intro {
  text-align: left;
  h3 {
    margin: 0;
    font-size: 20px;
    font-weight: 800;
  }
  p {
    margin: 4px 0 0;
    color: var(--text-subtle);
    font-size: 14px;
  }
}

.primary-gen-btn.mini {
  padding: 8px 16px;
  font-size: 13px;
}

.agentpdf-header-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.tool-btn.compact {
  padding: 8px 12px;
  border-radius: 12px;
}

.agentpdf-body {
  gap: 18px;
  padding: 0;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.agentpdf-workbench-panel {
  padding: 24px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow);
  width: 100%;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.panel-card {
  padding: 22px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow);
}

.workbench-shell {
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 100%;
}

.card-title-row {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 10px;

  h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 800;
    color: var(--text);
  }
}

.card-subtitle {
  margin: 6px 0 0;
  font-size: 14px;
  color: var(--text-subtle);
}

/* Path Specific */
.path-step-card {
  display: flex;
  align-items: flex-start;
  gap: 20px;
  padding: 24px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;
  position: relative;

  &.done {
    opacity: 0.8;
    .step-num {
      background: #10b981;
    }
  }
  &.active {
    border-color: var(--accent-strong);
    box-shadow: 0 8px 24px var(--accent-softer);
    transform: translateX(4px);
    &::before {
      content: "";
      position: absolute;
      left: 0;
      top: 24px;
      bottom: 24px;
      width: 4px;
      background: var(--accent-strong);
      border-radius: 0 4px 4px 0;
    }
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  }
}

.step-num {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #cbd5e1;
  color: #fff;
  border-radius: 50%;
  font-weight: 800;
  flex-shrink: 0;
}

.step-main {
  flex: 1;
  h4 {
    margin: 0;
    font-size: 16px;
    font-weight: 800;
  }
  p {
    margin: 6px 0 0;
    font-size: 14px;
    color: var(--text-muted);
  }
}

.step-badge {
  display: inline-block;
  padding: 2px 8px;
  background: var(--panel-soft);
  color: var(--text-subtle);
  border-radius: 6px;
  font-size: 10px;
  font-weight: 800;
  margin-bottom: 8px;
}

.step-btn {
  padding: 10px 20px;
  border-radius: 12px;
  border: 1px solid var(--accent-line);
  background: var(--accent-softer);
  color: var(--accent-strong);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  &:hover {
    background: var(--accent-strong);
    color: #fff;
  }
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text-subtle);
  .dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #cbd5e1;
    &.active {
      background: #10b981;
      box-shadow: 0 0 8px #10b981;
    }
  }
}

/* Profile Grid */
.profile-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

.profile-card {
  padding: 24px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-panel);
  box-shadow: var(--shadow);

  h4 {
    margin: 0 0 16px;
    font-size: 16px;
    font-weight: 800;
  }

  &.hero {
    grid-column: 1 / -1;
    background: linear-gradient(
      135deg,
      var(--accent) 0%,
      var(--accent-strong) 100%
    );
    color: #fff;
    border: none;
  }
}

.hero-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 24px;
}

.avatar-large {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  border: 4px solid rgba(255, 255, 255, 0.2);
  overflow: hidden;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.hero-info {
  h3 {
    margin: 0;
    font-size: 24px;
    font-weight: 900;
  }
  p {
    margin: 4px 0 0;
    opacity: 0.8;
    font-size: 14px;
  }
}

.hero-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-inner);
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  .val {
    font-size: 24px;
    font-weight: 900;
  }
  .lab {
    font-size: 12px;
    opacity: 0.8;
    font-weight: 700;
  }
}

.chart-container {
  width: 100%;
  height: 300px;
}

.radar-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: var(--text-subtle);
  gap: 12px;
  .el-icon {
    font-size: 40px;
    opacity: 0.3;
  }
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
}

.activity-dot {
  aspect-ratio: 1;
  background: var(--panel-muted);
  border-radius: 4px;
  &.active {
    background: var(--accent);
    opacity: 0.5;
  }
  &.strong {
    background: var(--accent-strong);
    opacity: 1;
  }
}

/* Assessment Styles */
.assessment-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.assessment-card.highlight {
  display: flex;
  align-items: center;
  gap: 32px;
  padding: 32px;
  background: linear-gradient(to right, var(--accent-softer), transparent);
  border-radius: var(--radius-panel);
  border: 1px solid var(--accent-line);
}

.score-main {
  display: flex;
  align-items: baseline;
  color: var(--accent-strong);
  .score-val {
    font-size: 64px;
    font-weight: 900;
    line-height: 1;
  }
  .score-unit {
    font-size: 18px;
    font-weight: 800;
    margin-left: 4px;
  }
}

.score-desc {
  h4 {
    margin: 0 0 8px;
    font-size: 18px;
    font-weight: 800;
  }
  p {
    margin: 0;
    color: var(--text-muted);
    line-height: 1.6;
  }
}

.mastery-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.mastery-item {
  .mastery-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 8px;
    font-size: 14px;
    font-weight: 700;
  }
}

.mastery-bar {
  height: 8px;
  background: var(--panel-muted);
  border-radius: 10px;
  overflow: hidden;
  .fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent), var(--accent-strong));
    border-radius: inherit;
  }
}

/* Automation Styles */
.auto-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.auto-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 24px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-panel);
  box-shadow: var(--shadow);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--accent-line);
    transform: translateY(-2px);
  }
}

.auto-info {
  h4 {
    margin: 0 0 4px;
    font-size: 16px;
    font-weight: 800;
  }
  p {
    margin: 0;
    font-size: 14px;
    color: var(--text-muted);
    max-width: 500px;
  }
}

.start-panel {
  width: 100%;
  max-width: 800px;
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.start-copy {
  margin-bottom: 40px;
  text-align: center;
}

.start-copy h2 {
  margin: 0;
  font-size: 36px;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -0.03em;
  color: var(--text);
  background: linear-gradient(135deg, var(--text) 0%, var(--text-muted) 100%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.composer {
  position: relative;
  padding: 16px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.04);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:focus-within {
    border-color: var(--accent-strong);
    box-shadow: 0 20px 50px var(--accent-softer);
    transform: translateY(-2px);
  }
}

.composer-input {
  width: 100%;
  min-height: 120px;
  padding: 8px;
  font-size: 18px;
  font-weight: 500;
  line-height: 1.6;
  color: var(--text);
  resize: none;
  background: transparent;
  border: 0;
  outline: 0;

  &::placeholder {
    color: var(--text-subtle);
    font-weight: 400;
  }
}

.composer-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  margin-top: 8px;
  border-top: 1px solid var(--panel-muted);
}

.composer-course {
  display: inline-flex;
  gap: 10px;
  align-items: center;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
  color: var(--accent-strong);
  background: var(--accent-softer);
  border-radius: 999px;

  small {
    font-size: 11px;
    font-weight: 600;
    color: var(--accent);
    opacity: 0.8;
  }
}

.send-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 18px;
  color: #fff;
  cursor: pointer;
  background: var(--accent);
  border: 0;
  border-radius: 14px;
  box-shadow: 0 4px 12px var(--accent-soft);
  transition: all 0.3s ease;

  &:hover {
    background: var(--accent-strong);
    transform: translateY(-2px) rotate(-5deg);
    box-shadow: 0 8px 20px var(--accent-soft);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
}

.context-panel {
  height: calc(100vh - 124px);
  padding: 24px 20px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow);
}

.context-tabs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  padding: 6px; // 稍微增加内边距
  margin-bottom: 20px;
  background: var(--panel-muted);
  border-radius: 14px; // 保持较大的 R 角

  button {
    height: 38px;
    font-size: 13px;
    font-weight: 800;
    color: var(--text-muted);
    cursor: pointer;
    background: transparent;
    border: 0;
    border-radius: 10px;
    transition:
      background 0.2s ease,
      color 0.2s ease,
      box-shadow 0.2s ease;

    &.active {
      color: var(--accent-strong);
      background: var(--panel-bg);
      box-shadow: 0 4px 12px rgb(15 23 42 / 8%);
    }
  }
}

.trace-item {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: space-between;
  padding: 13px;
  background: var(--panel-soft);
  border: 1px solid var(--border);
  border-radius: 12px;
}

.trace-name {
  font-size: 14px;
}

.trace-status {
  flex-shrink: 0;
  padding: 5px 9px;
  font-size: 12px;
  font-weight: 800;
  border-radius: 999px;

  &.done {
    color: #14804a;
    background: rgb(34 197 94 / 12%);
  }

  &.running {
    color: var(--accent-strong);
    background: var(--accent-soft);
  }

  &.pending {
    color: var(--text-subtle);
    background: rgb(148 163 184 / 14%);
  }
}

.empty-state {
  display: grid;
  place-items: center;
  min-height: 220px;
  color: var(--text-subtle);
  background: var(--panel-soft);
  border: 1px dashed var(--border);
  border-radius: var(--radius-control);

  .el-icon {
    font-size: 28px;
  }

  p {
    margin: 8px 0 0;
    font-size: 14px;
  }
}

.source-item {
  padding: 12px;
  font-size: 14px;
  background: var(--panel-soft);
  border: 1px solid var(--border);
  border-radius: var(--radius-control);
}

.source-list,
.trace-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@keyframes reveal-up {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes course-item-in {
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.course-drawer-enter-active,
.course-drawer-leave-active {
  transition:
    opacity 0.24s ease,
    transform 0.24s ease;
}

.course-drawer-enter-from,
.course-drawer-leave-to {
  opacity: 0;
  transform: translateX(-14px) scale(0.98);
}

.generation-panel,
.path-panel {
  width: 100%;
  max-width: 900px;
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.gen-header,
.path-header {
  h2 {
    margin: 0 0 8px;
    font-size: 28px;
    font-weight: 900;
    color: var(--text);
  }
  p {
    margin: 0;
    font-size: 15px;
    color: var(--text-muted);
  }
}

.agent-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 20px;
}

.agent-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 20px;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-4px);
    border-color: var(--accent-line);
    box-shadow: 0 12px 30px var(--accent-softer);
  }
}

.agent-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  font-size: 24px;
  color: var(--accent-strong);
  background: var(--accent-softer);
  border-radius: 14px;
}

.agent-info {
  flex: 1;
  h4 {
    margin: 0 0 2px;
    font-size: 15px;
    font-weight: 800;
  }
  p {
    margin: 0;
    font-size: 12px;
    color: var(--text-subtle);
  }
}

.agent-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 700;
  color: var(--text-subtle);

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #cbd5e1;

    &.idle {
      background: #10b981;
    }
    &.running {
      background: var(--accent);
      box-shadow: 0 0 8px var(--accent);
      animation: pulse-dot 2s infinite;
    }
  }
}

@keyframes pulse-dot {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
}

.gen-action-bar {
  display: flex;
  justify-content: center;
  margin-top: 12px;
}

.primary-gen-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  background: linear-gradient(
    135deg,
    var(--accent) 0%,
    var(--accent-strong) 100%
  );
  border: none;
  border-radius: 99px;
  box-shadow: 0 10px 24px var(--accent-soft);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 15px 35px var(--accent-soft);
  }
}

.path-meta {
  display: flex;
  gap: 12px;
  .meta-item {
    padding: 4px 12px;
    font-size: 12px;
    font-weight: 700;
    color: var(--accent-strong);
    background: var(--accent-softer);
    border-radius: 8px;
  }
}

.path-steps {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.path-step-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: var(--panel-bg);
  border: 1px solid var(--border);
  border-radius: 24px;
  box-shadow: var(--shadow);
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--accent-line);
    transform: translateX(6px);
  }
}

.step-num {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  font-size: 20px;
  font-weight: 900;
  color: #fff;
  background: var(--accent);
  border-radius: 50%;
  box-shadow: 0 4px 12px var(--accent-soft);
}

.step-content {
  flex: 1;
  h4 {
    margin: 0;
    font-size: 17px;
    font-weight: 800;
  }
  p {
    margin: 4px 0 0;
    font-size: 14px;
    color: var(--text-muted);
  }
}

.step-top {
  display: flex;
  align-items: center;
  gap: 10px;
}

.step-badge {
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--text-subtle);
  background: var(--panel-muted);
  border-radius: 6px;
}

.step-action {
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 800;
  color: var(--accent-strong);
  background: var(--accent-softer);
  border: 1px solid var(--accent-line);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    color: #fff;
    background: var(--accent-strong);
  }
}

.empty-workspace {
  width: 100%;
  max-width: 600px;
  padding: 60px 40px;
  text-align: center;
  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
    color: var(--text-subtle);
    .el-icon {
      font-size: 64px;
      opacity: 0.2;
    }
    h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 800;
      color: var(--text);
    }
    p {
      margin: 0;
      font-size: 15px;
    }
  }
}

@media (width <= 1600px) {
  .app-body {
    grid-template-columns: var(--left-column) var(--course-column) minmax(
        0,
        1fr
      );
  }
  .context-panel {
    display: none;
  }
}

@media (width <= 1200px) {
  .app-body {
    grid-template-columns: var(--left-column) minmax(0, 1fr);
  }
  .course-column {
    display: none;
  }
}

@media (width <= 960px) {
  .view-header {
    height: auto;
    gap: 14px;
    align-items: flex-start;
    flex-direction: column;
    padding: 18px;
  }

  .agentpdf-header-actions {
    flex-wrap: wrap;
  }
}

@media (width <= 768px) {
  .panel-card {
    padding: 18px;
  }
}

@media (width <= 768px) {
  .ai-app-page {
    padding: 12px;
  }

  .app-header {
    height: auto;
    flex-direction: column;
    padding: 16px;
    gap: 16px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .reveal {
    animation: none !important;
  }

  .reveal {
    opacity: 1;
    transform: none;
  }
}
</style>
