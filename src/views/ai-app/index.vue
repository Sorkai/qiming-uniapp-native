<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { storageLocal } from "@pureadmin/utils";
import { ElMessage } from "element-plus";
import {
  Cpu,
  FolderOpened,
  Document,
  Guide,
  User,
  DataAnalysis,
  MagicStick,
  Box,
  Monitor,
  ArrowDown,
  Microphone,
  Expand,
  Fold,
  Avatar,
  Clock,
  DataBoard,
  Calendar,
  Bell,
  ChatLineRound,
  Close,
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
import AiGovernanceDashboard from "@/views/account/ai-app/components/AiGovernanceDashboard.vue";
import VirtualHumanPanel from "./components/VirtualHumanPanel.vue";
import FloatingDigitalHuman2D from "@/views/account/ai-app/components/FloatingDigitalHuman2D.vue";

import emptyStateDevelopmentAnimation from "@/assets/aiapplottie/empty-state-development-animation.json";
import onlineChartAnimation from "@/assets/aiapplottie/online-chart-animation.json";
import saasAnimation from "@/assets/aiapplottie/saas-animation.json";

import { useUserStore } from "@/store/modules/user";
import { type DataInfo, userKey } from "@/utils/auth";
import {
  assistantApiErrorMessage,
  createAssistantConversation,
  getAssistantBootstrap,
  getAssistantConversation,
  getAssistantConversationGroups,
  streamAssistantChat,
  type AssistantBootstrapCourse,
  type AssistantBootstrapResp,
  type AssistantBootstrapStudent,
  type AssistantChatResource,
  type AssistantChatStreamEvent,
  type AssistantChatTraceStep,
  type AssistantConversationItem,
  type AssistantOption,
  type AssistantSkill
} from "@/api/frontend/assistant";

defineOptions({ name: "AiAppWorkbench" });

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

type CourseView = AssistantBootstrapCourse & {
  id: number;
  name: string;
};

type StudentView = AssistantBootstrapStudent & {
  id: number;
  name: string;
  avatar: string;
};

type ConversationView = AssistantConversationItem & {
  id: string;
  title: string;
  time?: string;
  course: string;
  courseId?: number;
  status?: string;
};

type ChatMessageView = {
  id: string | number;
  role: string;
  type: "system" | "user";
  content: string;
  resources?: AssistantChatResource[];
  sourceRefs?: AssistantChatStreamEvent["source_refs"];
  videoSegments?: AssistantChatStreamEvent["video_segments"];
  followups?: AssistantChatStreamEvent["followups"];
  resourceTask?: AssistantChatStreamEvent["resource_task"];
  safetyStatus?: string;
  safetySummary?: string;
  safetyFlags?: string[];
  metadata?: Record<string, any>;
  profileEvent?: Record<string, any>;
  streaming?: boolean;
  error?: boolean;
};

const assistantBootstrap = ref<AssistantBootstrapResp | null>(null);
const isBootstrapping = ref(false);
const isChatStreaming = ref(false);
const featureFlags = computed(
  () => assistantBootstrap.value?.feature_flags || {}
);

const selectedAgentKey = ref("");
const selectedModelKey = ref("");
const thinkingModeKey = ref("");
const selectedSkillKeys = ref<string[]>([]);

const loginRoleType = computed(() => {
  const userInfoRoleType =
    storageLocal().getItem<DataInfo<number>>(userKey)?.roleType;
  const localRoleType = window.localStorage.getItem("userRoleType");
  return Number(userInfoRoleType || localRoleType) || 0;
});
const bootstrapRole = computed(() =>
  String(assistantBootstrap.value?.role || "").toLowerCase()
);
const normalizedRoles = computed(() =>
  (userStore.roles || []).map(role => String(role).toLowerCase())
);
const roleMode = computed<{
  mode: "管理员模式" | "教师模式" | "学生模式";
  apiMode: "admin" | "teacher" | "student";
  userLabel: "管理员" | "教师" | "学生";
}>(() => {
  if (loginRoleType.value === 1) {
    return { mode: "学生模式", apiMode: "student", userLabel: "学生" };
  }
  if (loginRoleType.value === 2) {
    return { mode: "教师模式", apiMode: "teacher", userLabel: "教师" };
  }
  if (loginRoleType.value === 3) {
    return { mode: "管理员模式", apiMode: "admin", userLabel: "管理员" };
  }

  if (bootstrapRole.value === "student") {
    return { mode: "学生模式", apiMode: "student", userLabel: "学生" };
  }
  if (bootstrapRole.value === "teacher") {
    return { mode: "教师模式", apiMode: "teacher", userLabel: "教师" };
  }
  if (bootstrapRole.value === "admin") {
    return { mode: "管理员模式", apiMode: "admin", userLabel: "管理员" };
  }

  if (
    normalizedRoles.value.includes("student") ||
    normalizedRoles.value.includes("common")
  ) {
    return { mode: "学生模式", apiMode: "student", userLabel: "学生" };
  }
  if (normalizedRoles.value.includes("teacher")) {
    return { mode: "教师模式", apiMode: "teacher", userLabel: "教师" };
  }
  if (normalizedRoles.value.includes("admin")) {
    return { mode: "管理员模式", apiMode: "admin", userLabel: "管理员" };
  }

  return { mode: "学生模式", apiMode: "student", userLabel: "学生" };
});
const mode = computed(() => roleMode.value.mode);
const apiMode = computed(() => roleMode.value.apiMode);
const currentUserRoleLabel = computed(() => roleMode.value.userLabel);
const isStaffMode = computed(() => apiMode.value !== "student");

const isNewTab = ref(false);

const layoutStorage = storageLocal().getItem("responsive-layout") as
  | { darkMode?: boolean }
  | undefined;
const currentTheme = ref(
  (storageLocal().getItem("course_theme") as string) ||
    (layoutStorage?.darkMode ? "dark" : "light")
);
const pdfServiceUrl = "https://agentpdf.intelledu.cn";

const resolveRailFromPath = (path: string) => {
  const key = path.split("/").filter(Boolean).pop() || "chat";
  const knownRails = [
    "chat",
    "generation",
    "agentpdf",
    "path",
    "profile",
    "assessment",
    "governance",
    "automation"
  ];
  return knownRails.includes(key) ? key : "chat";
};

// 会话数据集
const activeRail = ref(resolveRailFromPath(route.path));
watch(
  () => route.path,
  newPath => {
    activeRail.value = resolveRailFromPath(newPath);
  }
);
const activeCourse = ref<CourseView | null>(null);

// 侧边栏 / 数字人面板 收起状态
const sidebarCollapsed = ref(false);
const humanCollapsed = ref(false);
const toggleSidebar = () => (sidebarCollapsed.value = !sidebarCollapsed.value);
const toggleHuman = () => (humanCollapsed.value = !humanCollapsed.value);
const humanPanelStyle = computed(() => ({
  width: humanCollapsed.value
    ? "64px"
    : isStaffMode.value
      ? "clamp(360px, 26vw, 460px)"
      : "clamp(320px, 23vw, 420px)"
}));
const humanStageClass = computed(() => {
  if (humanCollapsed.value) return "flex-1";
  return isStaffMode.value
    ? "flex-none min-h-[390px] max-h-[560px] h-[64vh]"
    : "flex-none min-h-[360px] max-h-[520px] h-[60vh]";
});

type DigitalHumanState = "standby" | "listening" | "thinking" | "saying";

const digitalHumanStreamState = ref<DigitalHumanState | null>(null);
const digitalHumanState = computed<DigitalHumanState>(() => {
  if (digitalHumanStreamState.value) return digitalHumanStreamState.value;
  if (activeRail.value === "chat" && activeCourse.value) return "listening";
  return "standby";
});

const normalizeDigitalHumanState = (
  value?: string | null
): DigitalHumanState | null => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s-]+/g, "");

  if (!normalized) return null;

  const stateMap: Record<string, DigitalHumanState> = {
    idle: "standby",
    standby: "standby",
    waiting: "standby",
    wait: "standby",
    ready: "standby",
    待机: "standby",
    listening: "listening",
    listen: "listening",
    hearing: "listening",
    倾听: "listening",
    聆听: "listening",
    thinking: "thinking",
    think: "thinking",
    reasoning: "thinking",
    processing: "thinking",
    loading: "thinking",
    思考: "thinking",
    推理: "thinking",
    saying: "saying",
    speaking: "saying",
    speak: "saying",
    talking: "saying",
    answer: "saying",
    answering: "saying",
    explaining: "saying",
    讲解: "saying",
    说话: "saying",
    回答: "saying"
  };

  return stateMap[normalized] || null;
};

const applyDigitalHumanDirective = (event: AssistantChatStreamEvent) => {
  const directive = event.digital_human;
  const backendState = normalizeDigitalHumanState(
    directive?.state ||
      directive?.status ||
      directive?.phase ||
      directive?.action ||
      directive?.mode ||
      directive?.gesture ||
      directive?.emotion
  );

  if (backendState) {
    digitalHumanStreamState.value = backendState;
    return true;
  }

  return false;
};

// 数字人引用：右侧 VRM 面板负责原有展示，小圆圈负责轻量状态检查。
const virtualHumanRef = ref<{
  speak?: (text: string) => void;
  pauseRender?: () => void;
  resumeRender?: () => void;
} | null>(null);
const floatingHumanRef = ref<{
  speak?: (text: string) => void;
  pauseRender?: () => void;
  resumeRender?: () => void;
} | null>(null);

const speakDigitalHumans = (text: string) => {
  const speakText = text || "";
  if (!speakText) return;
  virtualHumanRef.value?.speak?.(speakText);
  floatingHumanRef.value?.speak?.(speakText);
};

const myCourses = ref<CourseView[]>([]);
const myStudents = ref<StudentView[]>([]);
const selectedStudentId = ref<number | undefined>();
const conversations = ref<ConversationView[]>([]);
const activeConversationId = ref("");
const manuallySelectedCourseId = ref<number | undefined>();

const routeCourseId = computed(() => {
  const raw = route.query.courseId || route.query.course_id;
  const value = Array.isArray(raw) ? raw[0] : raw;
  const courseId = Number(value);
  return Number.isFinite(courseId) && courseId > 0 ? courseId : undefined;
});
const fallbackCourse = computed(
  () =>
    myCourses.value.find(
      course => course.id === assistantBootstrap.value?.selected_course_id
    ) ||
    myCourses.value[0] ||
    null
);
const effectiveCourse = computed(
  () => activeCourse.value || fallbackCourse.value
);
const selectedCourseId = computed(() => effectiveCourse.value?.id);
const selectedCourseName = computed(() => effectiveCourse.value?.name || "");
const selectedTargetStudentId = computed(() =>
  isStaffMode.value ? selectedStudentId.value : undefined
);
const courseScopedRails = [
  "generation",
  "path",
  "profile",
  "assessment",
  "governance"
];
const studentScopedRails = ["generation", "path", "profile", "assessment"];
const isCourseSwitching = ref(false);
const selectedCoursePickerId = computed({
  get: () => selectedCourseId.value,
  set: courseId => {
    void handleCourseContextChange(Number(courseId));
  }
});

async function handleCourseContextChange(courseId?: number) {
  const normalizedCourseId = Number(courseId);
  if (!Number.isFinite(normalizedCourseId) || normalizedCourseId <= 0) return;
  const targetCourse = myCourses.value.find(
    course => course.id === normalizedCourseId
  );
  if (!targetCourse) return;
  if (targetCourse.id === selectedCourseId.value) {
    activeCourse.value = targetCourse;
    manuallySelectedCourseId.value = targetCourse.id;
    return;
  }

  isCourseSwitching.value = true;
  manuallySelectedCourseId.value = targetCourse.id;
  activeCourse.value = targetCourse;
  activeConversationId.value = "";
  if (isStaffMode.value) {
    selectedStudentId.value = undefined;
    myStudents.value = [];
  }
  resetChatGreeting();
  try {
    await loadAssistantBootstrap();
  } finally {
    isCourseSwitching.value = false;
  }
}

// 【请求还原】：保留原版所有的侧边功能项
const railItems = ref([
  { key: "chat", label: "互动答疑", icon: "ChatDotRound" },
  { key: "generation", label: "教学资源", icon: "FolderOpened" },
  { key: "agentpdf", label: "资料研读", icon: "Document" },
  { key: "path", label: "学习计划", icon: "Guide" },
  { key: "profile", label: "学情分析", icon: "User" },
  { key: "assessment", label: "测验评估", icon: "DataAnalysis" },
  { key: "governance", label: "治理看板", icon: "DataBoard" },
  { key: "automation", label: "常规任务", icon: "Check" }
]);

const selectedTaskId = ref("");

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
const routineTaskRole = computed(() =>
  apiMode.value === "student" ? "student" : "teacher"
);
const visibleRoutineTasks = computed(() =>
  routineTasks.value.filter(task => task.role === routineTaskRole.value)
);

// === 智能画像、智能体与资源数据 ===
const profileDimensions = ref([
  { label: "知识基础", value: 85 },
  { label: "认知风格", value: 78 },
  { label: "易错点偏好", value: 65 },
  { label: "学习进度", value: 90 },
  { label: "探索欲", value: 82 },
  { label: "抗挫折能力", value: 88 }
]);

const agentTrace = ref<AssistantChatTraceStep[]>([]);
const generatedResources = ref<AssistantChatResource[]>([]);
const streamCancel = ref<null | (() => void)>(null);
const messages = ref<ChatMessageView[]>([]);

const agentItems = computed(() => {
  if (agentTrace.value.length) {
    return agentTrace.value.map((step, index) => ({
      id: `${step.agent}-${step.stage}-${index}`,
      name: step.agent || step.stage || "学习助手",
      desc:
        step.status === "degraded" || step.status === "blocked"
          ? step.degraded_reason || step.summary || step.stage || "降级处理中"
          : step.summary || step.stage || "处理中",
      status:
        step.status === "done" || step.status === "completed"
          ? "done"
          : "running"
    }));
  }

  return (assistantBootstrap.value?.agents || []).map(agent => ({
    id: agent.key,
    name: agent.label,
    desc: agent.description || "学习助手 Agent",
    status: "done"
  }));
});

const inspectorResources = computed(() =>
  generatedResources.value.map(resource => ({
    title: resource.title,
    kind: resource.type || "学习资源",
    desc: resource.desc || "学习助手推荐资源",
    eta: resource.preview_url ? "可预览" : "已生成",
    preview_url: resource.preview_url
  }))
);

const resetChatGreeting = () => {
  const courseName = selectedCourseName.value || "当前课程";
  messages.value = [
    {
      id: "assistant-greeting",
      role: "智能助教",
      type: "system",
      content:
        assistantBootstrap.value?.message ||
        `你好，${courseName} 的学习助手已就绪。你可以直接提出学习问题，我会结合课程、画像和学习路径给出建议。`
    }
  ];
};

const updateAssistantMessage = (
  id: string | number,
  patch: Partial<ChatMessageView>
) => {
  const target = messages.value.find(item => item.id === id);
  if (target) Object.assign(target, patch);
};

const handleAssistantStreamEvent = (
  event: AssistantChatStreamEvent,
  assistantMessageId: string | number
) => {
  const hasBackendHumanState = applyDigitalHumanDirective(event);
  const directiveText =
    event.digital_human?.speech_text ||
    event.digital_human?.highlight_text ||
    "";

  if (event.conversation_id) {
    activeConversationId.value = event.conversation_id;
  }

  if (event.event === "digital_human.directive") {
    if (event.digital_human?.speak && directiveText) {
      speakDigitalHumans(directiveText);
    }
    return;
  }

  if (event.event === "conversation.created") {
    if (!hasBackendHumanState) digitalHumanStreamState.value = "thinking";
    void loadConversationGroups();
    return;
  }

  if (event.event === "assistant.delta") {
    if (!hasBackendHumanState) digitalHumanStreamState.value = "thinking";
    const target = messages.value.find(item => item.id === assistantMessageId);
    if (target) target.content += event.delta || "";
    return;
  }

  if (event.event === "assistant.completed") {
    const content = event.content_text || "";
    updateAssistantMessage(assistantMessageId, {
      content:
        content ||
        messages.value.find(item => item.id === assistantMessageId)?.content ||
        "学习助手已完成回复。",
      resources: event.resources || [],
      sourceRefs: event.source_refs || [],
      videoSegments: event.video_segments || [],
      followups: event.followups || [],
      resourceTask: event.resource_task,
      safetyStatus: event.safety_status,
      safetySummary: event.safety_summary,
      safetyFlags: event.safety_flags || event.sensitive_word_hits || [],
      profileEvent: event.profile_event,
      streaming: false
    });
    agentTrace.value = event.trace || [];
    generatedResources.value = event.resources || [];
    if (event.conversation_title) {
      const active = conversations.value.find(
        item => item.conversation_id === event.conversation_id
      );
      if (active) active.title = event.conversation_title;
    }
    if (event.profile_event) {
      if (event.profile_event.decision === "skip") {
        ElMessage.info(event.profile_event.skip_reason || "本轮画像无需更新");
      } else {
        ElMessage.success("学习画像已同步更新");
      }
    }
    const degradedTrace = (event.trace || []).find(step =>
      ["degraded", "blocked"].includes(step.status)
    );
    if (degradedTrace?.degraded_reason) {
      ElMessage.warning(degradedTrace.degraded_reason);
    }
    if (!hasBackendHumanState) digitalHumanStreamState.value = "saying";
    speakDigitalHumans(directiveText || content || "");
    isChatStreaming.value = false;
    window.setTimeout(() => {
      if (
        !isChatStreaming.value &&
        digitalHumanStreamState.value === "saying"
      ) {
        digitalHumanStreamState.value = null;
      }
    }, 2400);
    void loadConversationGroups();
    return;
  }

  if (event.event === "error") {
    updateAssistantMessage(assistantMessageId, {
      content: event.error_message || "学习助手响应失败，请稍后重试。",
      streaming: false,
      error: true
    });
    isChatStreaming.value = false;
    digitalHumanStreamState.value = null;
    ElMessage.error(event.error_message || "学习助手响应失败");
  }
};

const handleSendMessage = (text: string) => {
  const trimmed = text.trim();
  if (!trimmed || isChatStreaming.value) return;
  if (featureFlags.value.chat_stream === false) {
    ElMessage.warning("当前学习助手对话能力暂不可用");
    return;
  }
  if (!selectedCourseId.value) {
    ElMessage.warning("请先选择课程");
    return;
  }
  if (isStaffMode.value && !selectedTargetStudentId.value) {
    ElMessage.warning("教师/管理员模式下请先选择学生");
    return;
  }

  messages.value.push({
    id: `user-${Date.now()}`,
    role: currentUserRoleLabel.value,
    type: "user",
    content: trimmed
  });

  const assistantMessageId = `assistant-${Date.now()}`;
  messages.value.push({
    id: assistantMessageId,
    role: "智能助教",
    type: "system",
    content: "",
    streaming: true
  });

  isChatStreaming.value = true;
  digitalHumanStreamState.value = "thinking";
  agentTrace.value = [];
  streamCancel.value?.();
  streamCancel.value = streamAssistantChat(
    {
      conversation_id: activeConversationId.value || undefined,
      course_id: selectedCourseId.value,
      target_student_id: selectedTargetStudentId.value,
      mode: apiMode.value,
      selected_agent: selectedAgentKey.value || undefined,
      skill_keys: selectedSkillKeys.value,
      selected_model: selectedModelKey.value || undefined,
      thinking_mode: thinkingModeKey.value || undefined,
      message: trimmed,
      attachment_ids: [],
      enable_realtime_resource:
        selectedSkillKeys.value.includes("resource_hint"),
      preferred_explanation_mode: selectedSkillKeys.value.includes("visual")
        ? "visual"
        : undefined,
      metadata: { ui_entry: "ai_app_workbench" }
    },
    event => handleAssistantStreamEvent(event, assistantMessageId)
  );
};

const handleRegenerateMessage = (assistantMessageId: string | number) => {
  const assistantIndex = messages.value.findIndex(
    item => item.id === assistantMessageId
  );
  const searchEnd =
    assistantIndex >= 0 ? assistantIndex : messages.value.length - 1;
  const lastUserMessage = messages.value
    .slice(0, searchEnd + 1)
    .reverse()
    .find(item => item.type === "user" && item.content.trim());

  if (!lastUserMessage) {
    ElMessage.warning("没有找到可重新生成的问题");
    return;
  }

  handleSendMessage(lastUserMessage.content);
};

// === 栈操作预览弹窗 ===
const stackPreviewVisible = ref(false);
const stackItems = ref<{ key: number; value: string }[]>([
  { key: 1, value: "A" },
  { key: 2, value: "B" },
  { key: 3, value: "C" }
]);
let stackKeySeed = 100;
const stackLog = ref<string[]>(["初始状态：栈顶 -> C, B, A (最后压入 C)"]);
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
    return;
  }
  if (res?.preview_url) {
    window.open(res.preview_url, "_blank");
  }
}

const formatConversationTime = (value?: string) => {
  if (!value) return "";
  return value.slice(5, 16);
};

const courseNameById = (courseId?: number) =>
  myCourses.value.find(course => course.id === courseId)?.name ||
  selectedCourseName.value ||
  "未命名课程";

const normalizeConversation = (
  item: AssistantConversationItem,
  fallbackCourseName?: string
): ConversationView => ({
  ...item,
  id: item.conversation_id,
  title: item.title || "未命名会话",
  time: formatConversationTime(item.last_message_at),
  course: fallbackCourseName || courseNameById(item.course_id),
  courseId: item.course_id,
  status: item.message_count > 0 ? "已同步" : "新会话"
});

const optionLabel = (options: AssistantOption[], key: string) =>
  options.find(item => item.key === key)?.label || key;

const selectedAgentLabel = computed(() =>
  optionLabel(assistantBootstrap.value?.agents || [], selectedAgentKey.value)
);
const selectedModelLabel = computed(() =>
  optionLabel(assistantBootstrap.value?.models || [], selectedModelKey.value)
);
const thinkingModeLabel = computed(() =>
  optionLabel(
    assistantBootstrap.value?.thinking_modes || [],
    thinkingModeKey.value
  )
);

const applyBootstrap = (data: AssistantBootstrapResp) => {
  assistantBootstrap.value = data;
  myCourses.value = (data.courses || []).map(course => ({
    ...course,
    id: course.course_id,
    name: course.course_name
  }));
  myStudents.value = (data.students || []).map(student => ({
    ...student,
    id: student.student_id,
    name: student.student_name,
    avatar:
      student.avatar ||
      `https://api.dicebear.com/7.x/avataaars/svg?seed=${student.student_id}`
  }));

  selectedStudentId.value = data.selected_student_id || myStudents.value[0]?.id;
  const previousCourseId = activeCourse.value?.id;
  const manuallySelectedCourse = manuallySelectedCourseId.value
    ? myCourses.value.find(
        course => course.id === manuallySelectedCourseId.value
      )
    : null;
  const routeSelectedCourse = routeCourseId.value
    ? myCourses.value.find(course => course.id === routeCourseId.value)
    : null;
  const preservedCourse = previousCourseId
    ? myCourses.value.find(course => course.id === previousCourseId)
    : null;
  activeCourse.value =
    manuallySelectedCourse || routeSelectedCourse || preservedCourse || null;
  selectedAgentKey.value = data.agents?.[0]?.key || "";
  selectedModelKey.value = data.models?.[0]?.key || "";
  thinkingModeKey.value = data.thinking_modes?.[0]?.key || "";
  selectedSkillKeys.value = (data.skills || [])
    .filter((skill: AssistantSkill) => skill.default_on)
    .map(skill => skill.key);

  if (activeCourse.value) {
    resetChatGreeting();
  } else {
    activeConversationId.value = "";
    messages.value = [];
  }
};

const loadAssistantBootstrap = async () => {
  isBootstrapping.value = true;
  try {
    const { data } = await getAssistantBootstrap({
      course_id: selectedCourseId.value,
      target_student_id: selectedTargetStudentId.value
    });
    applyBootstrap(data);
    await loadConversationGroups();
  } catch (error: any) {
    console.error("[AiApp] 学习助手启动上下文加载失败:", error);
    ElMessage.error(
      assistantApiErrorMessage(error, "学习助手启动上下文加载失败")
    );
  } finally {
    isBootstrapping.value = false;
  }
};

const loadConversationGroups = async () => {
  try {
    const { data } = await getAssistantConversationGroups({
      target_student_id: selectedTargetStudentId.value
    });
    conversations.value = (data.list || []).flatMap(group =>
      (group.conversations || []).map(item =>
        normalizeConversation(item, group.course_name)
      )
    );
  } catch (error) {
    console.error("[AiApp] 学习助手会话加载失败:", error);
  }
};

const loadConversationMessages = async (conversation: ConversationView) => {
  if (!conversation.conversation_id) return;
  try {
    const { data } = await getAssistantConversation(
      conversation.conversation_id
    );
    activeConversationId.value = conversation.conversation_id;
    const detailConversation = data.conversation || conversation;
    if (detailConversation.metadata)
      conversation.metadata = detailConversation.metadata;
    const course =
      myCourses.value.find(
        item =>
          item.id === (detailConversation.course_id || conversation.course_id)
      ) || myCourses.value.find(item => item.name === conversation.course);
    if (course) activeCourse.value = course;
    messages.value = (data.messages || data.list || []).map(item => ({
      id: item.message_id,
      role: item.role === "user" ? currentUserRoleLabel.value : "智能助教",
      type: item.role === "user" ? "user" : "system",
      content: item.content_text || "",
      metadata: item.metadata
    }));
    if (!messages.value.length) resetChatGreeting();
  } catch (error: any) {
    console.error("[AiApp] 学习助手会话消息加载失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "会话消息加载失败"));
  }
};

const handleSwitchCourse = (courseName: string) => {
  const target = myCourses.value.find(course => course.name === courseName);
  if (!target) return;
  if (target.id !== selectedCourseId.value) {
    void handleCourseContextChange(target.id);
    return;
  }
  activeCourse.value = target;
  activeConversationId.value = "";
  resetChatGreeting();
};

const handleProfileLoaded = (payload: { dimensions?: any[] }) => {
  if (payload.dimensions?.length) {
    profileDimensions.value = payload.dimensions;
  }
};

const handleGovernanceSelectStudent = (payload: {
  studentId: number;
  rail: "profile" | "path" | "assessment";
}) => {
  selectedStudentId.value = payload.studentId;
  activeRail.value = payload.rail;
  if (route.path.startsWith("/ai-app/")) {
    void router.push(`/ai-app/${payload.rail}`);
  }
};

const handleGovernanceNavigate = (rail: "generation") => {
  activeRail.value = rail;
  if (route.path.startsWith("/ai-app/")) {
    void router.push(`/ai-app/${rail}`);
  }
};

const goBack = () => {
  if (window.history.state && window.history.length > 1) {
    router.back();
  } else {
    router.push("/");
  }
};

onMounted(() => {
  if (route.query.newTab === "true") {
    isNewTab.value = true;
    document.title = `学习助手 (${mode.value})`;
  }
  void loadAssistantBootstrap();
});

const quickMessage = ref("");
const quickCourse = ref("");
const quickVoiceListening = ref(false);
const quickUploadInputRef = ref<HTMLInputElement | null>(null);
let quickSpeechRecognition: any = null;
type QuickAttachmentPreview = {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  extension: string;
  previewUrl?: string;
};
const quickAttachments = ref<QuickAttachmentPreview[]>([]);
const quickInteractionMessages = [
  "老师好",
  "这一段没听懂",
  "请再讲一遍",
  "我做完了"
];

const handleQuickInteraction = (text: string) => {
  speakDigitalHumans(text);
};

const handleQuickUploadClick = () => {
  quickUploadInputRef.value?.click();
};

const getQuickFileExtension = (file: File) => {
  const nameExtension = file.name.split(".").pop()?.trim();
  const typeExtension = file.type.split("/").pop()?.trim();
  return (nameExtension || typeExtension || "file").slice(0, 8).toUpperCase();
};

const formatQuickFileSize = (size: number) => {
  if (size < 1024) return `${size} B`;
  const units = ["KB", "MB", "GB"];
  let value = size / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex++;
  }
  return `${value >= 10 ? value.toFixed(1) : value.toFixed(2)} ${
    units[unitIndex]
  }`;
};

const getQuickAttachmentKind = (attachment: QuickAttachmentPreview) => {
  const type = attachment.type.toLowerCase();
  const extension = attachment.extension.toUpperCase();
  if (type.startsWith("image/")) return "图片";
  if (type.includes("pdf") || extension === "PDF") return "PDF";
  if (type.includes("word") || ["DOC", "DOCX"].includes(extension)) {
    return "Word";
  }
  if (
    type.includes("spreadsheet") ||
    ["XLS", "XLSX", "CSV"].includes(extension)
  ) {
    return "表格";
  }
  if (type.includes("presentation") || ["PPT", "PPTX"].includes(extension)) {
    return "PPT";
  }
  return extension || "文件";
};

const revokeQuickAttachmentUrl = (attachment: QuickAttachmentPreview) => {
  if (attachment.previewUrl) {
    URL.revokeObjectURL(attachment.previewUrl);
  }
};

const clearQuickAttachments = () => {
  quickAttachments.value.forEach(revokeQuickAttachmentUrl);
  quickAttachments.value = [];
};

const removeQuickAttachment = (id: string) => {
  const attachment = quickAttachments.value.find(item => item.id === id);
  if (attachment) revokeQuickAttachmentUrl(attachment);
  quickAttachments.value = quickAttachments.value.filter(
    item => item.id !== id
  );
};

const handleQuickAttachmentChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  const files = Array.from(input.files || []);
  if (!files.length) return;

  const createdAt = Date.now();
  const nextAttachments = files.map((file, index) => ({
    id: `${file.name}-${file.size}-${file.lastModified}-${createdAt}-${index}`,
    file,
    name: file.name,
    size: file.size,
    type: file.type || "",
    extension: getQuickFileExtension(file),
    previewUrl: file.type.startsWith("image/")
      ? URL.createObjectURL(file)
      : undefined
  }));
  quickAttachments.value = [...quickAttachments.value, ...nextAttachments];
  ElMessage.success(
    files.length > 1
      ? `已选择 ${files.length} 个文件`
      : `已选择 ${files[0].name}`
  );
  input.value = "";
};

const handleQuickVoiceInput = () => {
  const SpeechRecognition =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    ElMessage.warning("当前浏览器暂不支持系统语音输入");
    return;
  }

  if (quickVoiceListening.value && quickSpeechRecognition) {
    quickSpeechRecognition.stop?.();
    return;
  }

  const initialText = quickMessage.value.trim();
  const recognition = new SpeechRecognition();
  quickSpeechRecognition = recognition;
  recognition.lang = "zh-CN";
  recognition.continuous = false;
  recognition.interimResults = true;
  let committedSpeechText = "";

  recognition.onresult = (event: any) => {
    let interimText = "";
    for (let index = event.resultIndex; index < event.results.length; index++) {
      const transcript = event.results[index][0]?.transcript || "";
      if (event.results[index].isFinal) {
        committedSpeechText += transcript;
      } else {
        interimText += transcript;
      }
    }
    const spokenText = `${committedSpeechText}${interimText}`.trim();
    const separator = initialText && spokenText ? " " : "";
    quickMessage.value = `${initialText}${separator}${spokenText}`.trim();
  };

  recognition.onerror = (event: any) => {
    quickVoiceListening.value = false;
    if (event?.error === "not-allowed") {
      ElMessage.warning("请允许浏览器使用麦克风");
    } else if (!["aborted", "no-speech"].includes(event?.error)) {
      ElMessage.warning("语音输入暂时不可用");
    }
  };

  recognition.onend = () => {
    quickVoiceListening.value = false;
    quickSpeechRecognition = null;
  };

  try {
    quickVoiceListening.value = true;
    recognition.start();
  } catch {
    quickVoiceListening.value = false;
    quickSpeechRecognition = null;
  }
};

const handleNewChat = async (payload: { course: string }) => {
  const course = myCourses.value.find(item => item.name === payload.course);
  if (course && course.id !== selectedCourseId.value) {
    await handleCourseContextChange(course.id);
  } else if (course) {
    activeCourse.value = course;
  }
  const courseId = course?.id || selectedCourseId.value;
  const courseName = course?.name || payload.course;
  if (!courseId) {
    ElMessage.warning("请先选择课程");
    return;
  }
  if (isStaffMode.value && !selectedTargetStudentId.value) {
    ElMessage.warning("请先选择学生");
    return;
  }
  resetChatGreeting();
  try {
    const { data } = await createAssistantConversation({
      course_id: courseId,
      target_student_id: selectedTargetStudentId.value,
      title: courseName ? `${courseName} 学习辅导` : "学习辅导",
      metadata: {
        ui_entry: "ai_app_sidebar",
        selected_agent: selectedAgentKey.value,
        selected_model: selectedModelKey.value,
        thinking_mode: thinkingModeKey.value,
        skill_keys: selectedSkillKeys.value.join(",")
      }
    });
    const conversationId =
      data.conversation?.conversation_id || data.conversation_id;
    if (!conversationId) {
      throw new Error("后端未返回会话 ID");
    }
    const conversation: AssistantConversationItem = data.conversation || {
      conversation_id: conversationId,
      title: data.title || (courseName ? `${courseName} 学习辅导` : "学习辅导"),
      message_count: 0,
      course_id: courseId,
      target_student_id: selectedTargetStudentId.value
    };
    activeConversationId.value = conversation.conversation_id;
    conversations.value = [
      normalizeConversation(conversation, course?.name),
      ...conversations.value.filter(
        item => item.conversation_id !== conversation.conversation_id
      )
    ];
  } catch (error: any) {
    console.error("[AiApp] 创建学习助手会话失败:", error);
    ElMessage.error(assistantApiErrorMessage(error, "创建会话失败"));
    return;
  }

  const pendingMessage = quickMessage.value.trim();
  if (pendingMessage) {
    // 切换到聊天栏目，确保数字人状态与课程上下文同步。
    activeRail.value = "chat";
    // 微延时等待课程上下文切换完成。
    setTimeout(() => {
      handleSendMessage(pendingMessage);
      quickMessage.value = "";
      clearQuickAttachments();
    }, 100);
  }
};

const syncHumanRenderState = () => {
  if (!virtualHumanRef.value) return;
  const shouldPause =
    document.hidden || activeRail.value !== "chat" || humanCollapsed.value;
  if (shouldPause) {
    virtualHumanRef.value.pauseRender?.();
  } else {
    virtualHumanRef.value.resumeRender?.();
  }
};

watch([humanCollapsed, activeRail], () => {
  syncHumanRenderState();
});

watch(selectedStudentId, () => {
  if (
    isCourseSwitching.value ||
    isBootstrapping.value ||
    !assistantBootstrap.value ||
    !isStaffMode.value
  )
    return;
  activeConversationId.value = "";
  resetChatGreeting();
  void loadAssistantBootstrap();
});

const handleVisibilityChange = () => {
  syncHumanRenderState();
};

onMounted(() => {
  document.addEventListener("visibilitychange", handleVisibilityChange);
  setTimeout(() => {
    syncHumanRenderState();
  }, 0);
});

onUnmounted(() => {
  streamCancel.value?.();
  quickSpeechRecognition?.stop?.();
  quickSpeechRecognition = null;
  clearQuickAttachments();
  document.removeEventListener("visibilitychange", handleVisibilityChange);
});
</script>

<template>
  <div
    class="ai-app-root h-[calc(100vh-140px)] flex flex-col overflow-hidden"
    :class="[
      activeRail === 'chat'
        ? 'rounded-xl bg-gradient-to-br from-[rgb(253,229,250)] via-[rgb(233,231,255)] to-[rgb(254,214,233)] shadow-sm'
        : 'bg-transparent',
      currentTheme
    ]"
  >
    <div class="flex-1 flex overflow-hidden">
      <!-- 极简左侧边栏 (第一块) -->
      <aside
        v-if="activeRail === 'chat'"
        class="ai-app-left-rail flex-shrink-0 z-20 bg-white border-r border-gray-100 flex flex-col transition-all duration-300 relative"
        :class="sidebarCollapsed ? 'w-[34px]' : 'w-[260px]'"
      >
        <div v-show="!sidebarCollapsed" class="flex-1 overflow-hidden">
          <AiSidebar
            v-model:activeRail="activeRail"
            :conversations="conversations"
            :courses="myCourses.map(course => course.name)"
            @new-chat="handleNewChat"
            @select-chat="loadConversationMessages"
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
        <!-- 课程 / 学生上下文工具栏 -->
        <div
          v-if="courseScopedRails.includes(activeRail)"
          class="flex-none flex items-center justify-end gap-3 bg-white mb-5 px-6 py-3 border border-gray-100 rounded-[18px] z-10 relative overflow-hidden"
        >
          <span class="text-xs text-gray-500 font-medium">课程:</span>
          <el-select
            v-model="selectedCoursePickerId"
            placeholder="请选择课程"
            size="small"
            style="width: 220px"
            class="course-select"
            :disabled="isBootstrapping || !myCourses.length"
          >
            <template #prefix>
              <el-icon><FolderOpened /></el-icon>
            </template>
            <el-option
              v-for="item in myCourses"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
              <div class="flex items-center justify-between gap-3">
                <span class="text-sm truncate">{{ item.name }}</span>
                <span
                  v-if="item.subtitle"
                  class="text-xs text-gray-400 truncate max-w-[110px]"
                >
                  {{ item.subtitle }}
                </span>
              </div>
            </el-option>
          </el-select>
          <template
            v-if="isStaffMode && studentScopedRails.includes(activeRail)"
          >
            <span class="text-xs text-gray-500 font-medium">分析对象:</span>
            <el-select
              v-model="selectedStudentId"
              placeholder="请选择学生"
              size="small"
              style="width: 160px"
              class="student-select"
              :disabled="isBootstrapping || isCourseSwitching"
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
          </template>
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
                  :activeCourse="activeCourse.name"
                  :courses="myCourses.map(course => course.name)"
                  :mode="mode"
                  :agents="assistantBootstrap?.agents || []"
                  :models="assistantBootstrap?.models || []"
                  :thinkingModes="assistantBootstrap?.thinking_modes || []"
                  :selectedAgent="selectedAgentLabel"
                  :selectedModel="selectedModelLabel"
                  :thinkingMode="thinkingModeLabel"
                  :loading="isChatStreaming"
                  @send="handleSendMessage"
                  @preview="handlePreview"
                  @regenerate="handleRegenerateMessage"
                  @switch-course="handleSwitchCourse"
                  @update:selectedAgent="selectedAgentKey = $event"
                  @update:selectedModel="selectedModelKey = $event"
                  @update:thinkingMode="thinkingModeKey = $event"
                />
              </div>
            </transition>

            <!-- 数字人面板 -->
            <transition appear name="panel-reveal">
              <div
                class="flex-shrink-0 h-full flex flex-col gap-4 transition-all duration-300 relative"
                :style="humanPanelStyle"
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
                  class="bg-white/70 backdrop-blur-xl rounded-[2.5rem] shadow-[0_8px_32px_rgba(0,0,0,0.04)] border border-white/50 overflow-hidden relative"
                  :class="humanStageClass"
                >
                  <VirtualHumanPanel
                    v-show="!humanCollapsed"
                    ref="virtualHumanRef"
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
                    class="flex-1 min-h-[168px] bg-white/80 backdrop-blur-md rounded-2xl border border-white/60 p-3 shadow-md flex flex-col gap-2 overflow-hidden z-[100]"
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
              class="w-full max-w-5xl px-6 space-y-10 relative z-10 transform -translate-y-8"
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

              <div class="quick-chat-card">
                <input
                  ref="quickUploadInputRef"
                  type="file"
                  multiple
                  class="quick-chat-file-input"
                  @change="handleQuickAttachmentChange"
                />
                <div
                  v-if="quickAttachments.length"
                  class="quick-attachment-shelf"
                >
                  <div
                    v-for="attachment in quickAttachments"
                    :key="attachment.id"
                    class="quick-attachment-card"
                    :title="`${attachment.name} · ${formatQuickFileSize(
                      attachment.size
                    )} · ${getQuickAttachmentKind(attachment)}`"
                  >
                    <div class="quick-attachment-preview">
                      <img
                        v-if="attachment.previewUrl"
                        :src="attachment.previewUrl"
                        :alt="attachment.name"
                      />
                      <span v-else>{{ attachment.extension }}</span>
                    </div>
                    <div class="quick-attachment-info">
                      <span class="quick-attachment-name">
                        {{ attachment.name }}
                      </span>
                      <span class="quick-attachment-meta">
                        {{ formatQuickFileSize(attachment.size) }} ·
                        {{ getQuickAttachmentKind(attachment) }}
                      </span>
                    </div>
                    <button
                      type="button"
                      class="quick-attachment-remove"
                      title="删除附件"
                      @click="removeQuickAttachment(attachment.id)"
                    >
                      <el-icon><Close /></el-icon>
                    </button>
                  </div>
                </div>
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

                <div class="quick-chat-toolbar">
                  <div class="quick-chat-tools-left">
                    <button
                      type="button"
                      class="quick-chat-icon-button quick-chat-upload-button"
                      title="上传资料"
                      @click="handleQuickUploadClick"
                    >
                      <span class="quick-chat-upload-plus" aria-hidden="true">
                        +
                      </span>
                    </button>

                    <el-dropdown
                      trigger="click"
                      popper-class="quick-chat-dropdown"
                      @command="c => (quickCourse = c)"
                    >
                      <span
                        class="quick-chat-chip quick-chat-chip--interactive"
                        :class="{ 'is-selected': quickCourse }"
                      >
                        <el-icon class="quick-chat-chip__icon">
                          <FolderOpened />
                        </el-icon>
                        <span class="quick-chat-chip__text">
                          {{ quickCourse || "选择课程" }}
                        </span>
                        <el-icon class="quick-chat-chip__arrow">
                          <ArrowDown />
                        </el-icon>
                      </span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item
                            v-for="c in myCourses"
                            :key="c.id"
                            :command="c.name"
                          >
                            {{ c.name }}
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>

                    <span class="quick-chat-chip quick-chat-chip--static">
                      <el-icon class="quick-chat-chip__icon">
                        <Monitor />
                      </el-icon>
                      <span class="quick-chat-chip__text">{{ mode }}</span>
                    </span>

                    <el-dropdown
                      trigger="click"
                      popper-class="quick-chat-dropdown"
                      @command="a => (selectedAgentKey = a)"
                    >
                      <span
                        class="quick-chat-chip quick-chat-chip--interactive"
                      >
                        <el-icon class="quick-chat-chip__icon">
                          <Cpu />
                        </el-icon>
                        <span class="quick-chat-chip__text">
                          {{ selectedAgentLabel || "选择助手" }}
                        </span>
                        <el-icon class="quick-chat-chip__arrow">
                          <ArrowDown />
                        </el-icon>
                      </span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item
                            v-for="agent in assistantBootstrap?.agents || []"
                            :key="agent.key"
                            :command="agent.key"
                          >
                            {{ agent.label }}
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>
                  </div>

                  <div class="quick-chat-tools-right">
                    <el-dropdown
                      trigger="click"
                      popper-class="quick-chat-dropdown"
                      @command="m => (selectedModelKey = m)"
                    >
                      <span class="quick-chat-model-trigger">
                        <span>{{ selectedModelLabel || "选择模型" }}</span>
                        <el-icon class="quick-chat-chip__arrow">
                          <ArrowDown />
                        </el-icon>
                      </span>
                      <template #dropdown>
                        <el-dropdown-menu>
                          <el-dropdown-item
                            v-for="model in assistantBootstrap?.models || []"
                            :key="model.key"
                            :command="model.key"
                          >
                            {{ model.label }}
                          </el-dropdown-item>
                        </el-dropdown-menu>
                      </template>
                    </el-dropdown>

                    <button
                      type="button"
                      class="quick-chat-icon-button quick-chat-voice-button"
                      :class="{ 'is-listening': quickVoiceListening }"
                      :title="quickVoiceListening ? '停止语音输入' : '语音输入'"
                      @click="handleQuickVoiceInput"
                    >
                      <el-icon><Microphone /></el-icon>
                    </button>
                    <button
                      type="button"
                      class="quick-chat-send-button"
                      :class="{
                        'is-ready': quickCourse && quickMessage.trim()
                      }"
                      :disabled="!quickCourse || !quickMessage.trim()"
                      @click="
                        quickCourse
                          ? handleNewChat({ course: quickCourse })
                          : null
                      "
                    >
                      <svg
                        class="quick-chat-send-icon"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path d="M12 19V5" />
                        <path d="M5.5 11.5 12 5l6.5 6.5" />
                      </svg>
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
            <div class="agent-pdf-shell h-full overflow-hidden">
              <AgentPdfWorkbench :service-url="pdfServiceUrl" />
            </div>
          </div>

          <div v-else-if="activeRail === `generation`" class="h-full w-full">
            <div
              v-if="isStaffMode && !selectedStudentId"
              class="h-full w-full flex items-center justify-center bg-transparent"
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
              </div>
            </div>
            <div v-else class="h-full bg-transparent overflow-hidden">
              <AiResourceGeneration
                :course-id="selectedCourseId"
                :target-student-id="selectedTargetStudentId"
                :requires-target-student="isStaffMode"
              />
            </div>
          </div>

          <div v-else-if="activeRail === `path`" class="h-full w-full">
            <div
              v-if="isStaffMode && !selectedStudentId"
              class="h-full w-full flex items-center justify-center bg-transparent"
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
              </div>
            </div>
            <div v-else class="h-full bg-transparent overflow-hidden">
              <AiLearningPath
                :course-id="selectedCourseId"
                :target-student-id="selectedTargetStudentId"
                :requires-target-student="isStaffMode"
              />
            </div>
          </div>

          <div
            v-else-if="activeRail === `profile`"
            class="h-full w-full bg-transparent"
          >
            <div
              v-if="isStaffMode && !selectedStudentId"
              class="h-full w-full flex items-center justify-center"
            >
              <el-empty description="尚未选择学生" :image-size="120" />
            </div>
            <div v-else class="h-full min-h-0 flex gap-4 overflow-hidden">
              <div
                class="flex-1 h-full min-h-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <AiLearningProfile
                  :course-id="selectedCourseId"
                  :target-student-id="selectedTargetStudentId"
                  :requires-target-student="isStaffMode"
                  :enrolled-courses="myCourses"
                  @profile-loaded="handleProfileLoaded"
                />
              </div>
              <div
                class="w-[440px] flex-shrink-0 h-full min-h-0 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <AiInspector
                  :profileDimensions="profileDimensions"
                  :agentItems="agentItems"
                  :resources="inspectorResources"
                />
              </div>
            </div>
          </div>

          <div v-else-if="activeRail === `assessment`" class="h-full w-full">
            <div
              v-if="isStaffMode && !selectedStudentId"
              class="h-full w-full flex items-center justify-center bg-transparent"
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
              </div>
            </div>
            <div v-else class="h-full bg-transparent overflow-hidden">
              <AiAssessment
                :course-id="selectedCourseId"
                :target-student-id="selectedTargetStudentId"
                :requires-target-student="isStaffMode"
              />
            </div>
          </div>

          <div v-else-if="activeRail === `governance`" class="h-full w-full">
            <div class="governance-shell h-full overflow-hidden">
              <AiGovernanceDashboard
                :course-id="selectedCourseId"
                :course-name="selectedCourseName"
                :is-staff-mode="isStaffMode"
                @select-student="handleGovernanceSelectStudent"
                @navigate="handleGovernanceNavigate"
              />
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
                    v-for="task in visibleRoutineTasks"
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
                    v-if="visibleRoutineTasks.length === 0"
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
                  <el-empty description="暂无真实执行记录" :image-size="120" />
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

    <FloatingDigitalHuman2D
      ref="floatingHumanRef"
      :role-label="currentUserRoleLabel"
      :course-name="selectedCourseName"
      :state="digitalHumanState"
      anchor="appLeftBottom"
      anchor-selector=".ai-app-root"
      :left-zone-width="sidebarCollapsed ? 34 : 260"
      :bottom-offset="82"
      storage-key="ai-app-workspace-floating-digital-human-2d-left-bottom-v2"
    />

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
          class="relative w-44 h-72 mx-auto bg-gray-50 rounded-2xl border border-dashed border-blue-200 flex flex-col-reverse items-center p-3 gap-2 overflow-hidden"
        >
          <div
            class="absolute top-2 left-3 text-[11px] font-bold text-blue-500"
          >
            栈顶 (top) ↑
          </div>
          <div
            class="absolute bottom-2 right-3 text-[11px] font-bold text-gray-500"
          >
            栈底 (bottom)
          </div>
          <transition-group
            name="stack-anim"
            tag="div"
            class="flex flex-col-reverse gap-2 w-full items-center"
          >
            <div
              v-for="item in stackItems"
              :key="item.key"
              class="w-28 h-9 rounded-lg bg-blue-500 text-white font-bold flex items-center justify-center shadow-sm"
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
            栈大小：<b class="text-blue-600">{{ stackItems.length }}</b> ｜
            栈顶元素：<b class="text-blue-600">{{
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
  --ai-app-font:
    "Inter", "NotionInter", -apple-system, BlinkMacSystemFont, "Segoe UI",
    "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", Helvetica, Arial,
    sans-serif;

  font-family: var(--ai-app-font);
  font-synthesis-weight: none;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.ai-app-root :deep(*) {
  font-family: var(--ai-app-font);
}

.ai-app-root :deep(.iconfont),
.ai-app-root :deep([class^="el-icon-"]),
.ai-app-root :deep([class*=" el-icon-"]),
.ai-app-root :deep(.iconify) {
  font-family:
    "iconfont", element-icons, "IconifyIconOnline", "IconifyIconOffline" !important;
}

.agent-pdf-shell {
  background: transparent;
  border-radius: 24px;
}

.governance-shell {
  background: transparent;
  border-radius: 24px;
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

.quick-chat-card {
  overflow: hidden;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(226, 232, 240, 0.9);
  border-radius: 28px;
  box-shadow: 0 12px 38px rgba(82, 61, 110, 0.07);
  transition:
    border-color 0.25s ease,
    box-shadow 0.25s ease,
    transform 0.25s ease;
}

.quick-chat-card:focus-within {
  border-color: rgba(94, 127, 248, 0.2);
  box-shadow: 0 16px 44px rgba(82, 61, 110, 0.1);
}

.quick-chat-file-input {
  display: none;
}

.quick-attachment-shelf {
  display: flex;
  gap: 12px;
  padding: 18px 18px 0;
  overflow-x: auto;
  overscroll-behavior-x: contain;
}

.quick-attachment-shelf::-webkit-scrollbar {
  height: 4px;
}

.quick-attachment-shelf::-webkit-scrollbar-thumb {
  background: rgba(148, 163, 184, 0.28);
  border-radius: 999px;
}

.quick-attachment-card {
  position: relative;
  display: flex;
  flex: 0 0 156px;
  flex-direction: column;
  gap: 9px;
  min-height: 128px;
  padding: 10px;
  overflow: hidden;
  background: rgba(243, 246, 251, 0.92);
  border: 1px solid rgba(226, 232, 240, 0.88);
  border-radius: 19px;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.quick-attachment-card:hover {
  background: #fff;
  border-color: rgba(203, 213, 225, 0.95);
  box-shadow: 0 12px 28px rgba(48, 64, 93, 0.12);
  transform: translateY(-1px);
}

.quick-attachment-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 72px;
  overflow: hidden;
  color: #6b7280;
  font-size: 21px;
  font-weight: 750;
  letter-spacing: 0.01em;
  background: linear-gradient(135deg, #fff, #eef2f7);
  border: 1px solid rgba(226, 232, 240, 0.82);
  border-radius: 15px;
}

.quick-attachment-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.quick-attachment-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
}

.quick-attachment-name,
.quick-attachment-meta {
  display: block;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.quick-attachment-name {
  color: #475467;
  font-size: 13px;
  font-weight: 700;
}

.quick-attachment-meta {
  color: #98a2b3;
  font-size: 11px;
  font-weight: 600;
}

.quick-attachment-remove {
  position: absolute;
  top: 8px;
  right: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  color: #fff;
  pointer-events: none;
  background: rgba(15, 23, 42, 0.76);
  border: 1px solid rgba(255, 255, 255, 0.24);
  border-radius: 999px;
  opacity: 0;
  transition:
    opacity 0.18s ease,
    transform 0.18s ease,
    background 0.18s ease;
  transform: scale(0.86);
}

.quick-attachment-card:hover .quick-attachment-remove {
  pointer-events: auto;
  opacity: 1;
  transform: scale(1);
}

.quick-attachment-remove:hover {
  background: rgba(220, 38, 38, 0.9);
}

.quick-chat-toolbar {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px 16px;
  background: rgba(248, 250, 252, 0.78);
  border-top: 1px solid rgba(241, 245, 249, 0.95);
}

.quick-chat-tools-left,
.quick-chat-tools-right {
  display: flex;
  gap: 8px;
  align-items: center;
  min-width: 0;
}

.quick-chat-tools-left {
  flex-wrap: wrap;
}

.quick-chat-tools-right {
  flex-shrink: 0;
  justify-content: flex-end;
}

.quick-chat-chip {
  display: inline-flex;
  align-items: center;
  max-width: 250px;
  height: 38px;
  padding: 0 14px;
  color: #4b5565;
  white-space: nowrap;
  background: #f1f3f7;
  border: 1px solid transparent;
  border-radius: 16px;
  box-shadow: 0 0 0 rgba(56, 67, 95, 0);
  transition:
    color 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.quick-chat-chip--interactive {
  cursor: pointer;
}

.quick-chat-chip--interactive:hover {
  color: #334155;
  background: #eef1f6;
  border-color: rgba(213, 219, 230, 0.95);
  box-shadow: 0 8px 18px rgba(56, 67, 95, 0.08);
  transform: translateY(-1px);
}

.quick-chat-chip--interactive.is-selected {
  color: #4f69d9;
  background: rgba(94, 127, 248, 0.12);
}

.quick-chat-chip--static {
  cursor: default;
}

.quick-chat-chip__icon {
  flex: 0 0 auto;
  margin-right: 8px;
  font-size: 15px;
}

.quick-chat-chip__text {
  min-width: 0;
  overflow: hidden;
  font-size: 13px;
  font-weight: 600;
  line-height: 1;
  text-overflow: ellipsis;
}

.quick-chat-chip__arrow {
  flex: 0 0 auto;
  margin-left: 7px;
  font-size: 13px;
  color: currentColor;
  opacity: 0.72;
}

.quick-chat-model-trigger {
  display: inline-flex;
  align-items: center;
  max-width: 240px;
  height: 36px;
  padding: 0 8px 0 12px;
  color: #9099aa;
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  border-radius: 14px;
  transition:
    color 0.2s ease,
    background 0.2s ease;
}

.quick-chat-model-trigger span {
  overflow: hidden;
  text-overflow: ellipsis;
}

.quick-chat-model-trigger:hover {
  color: #667085;
  background: rgba(241, 243, 247, 0.86);
}

.quick-chat-icon-button,
.quick-chat-send-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 17px;
  transition:
    color 0.2s ease,
    background 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.quick-chat-icon-button {
  color: #667085;
  background: transparent;
  border: 1px solid transparent;
}

.quick-chat-icon-button:hover {
  color: #344054;
  background: #f1f3f7;
  border-color: rgba(213, 219, 230, 0.95);
}

.quick-chat-upload-button {
  flex: 0 0 auto;
  background: #fff;
  border-color: rgba(223, 228, 236, 0.9);
}

.quick-chat-upload-plus {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  font-size: 31px;
  font-weight: 300;
  line-height: 1;
  transform: translateY(-1px);
}

.quick-chat-voice-button.is-listening {
  color: var(--el-color-primary);
  background: rgba(94, 127, 248, 0.12);
  box-shadow: 0 0 0 4px rgba(94, 127, 248, 0.12);
}

.quick-chat-send-button {
  color: #98a2b3;
  cursor: not-allowed;
  background: #fff;
  border: 1px solid #dfe4ec;
}

.quick-chat-send-button.is-ready {
  color: #fff;
  cursor: pointer;
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
  box-shadow: 0 10px 22px rgba(94, 127, 248, 0.24);
}

.quick-chat-send-button.is-ready:hover {
  box-shadow: 0 14px 28px rgba(94, 127, 248, 0.3);
  transform: translateY(-1px);
}

.quick-chat-send-button:active,
.quick-chat-icon-button:active,
.quick-chat-chip--interactive:active {
  transform: translateY(0) scale(0.98);
}

.quick-chat-send-icon {
  width: 22px;
  height: 22px;
  fill: none;
  stroke: currentColor;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-width: 2.1;
}

:global(.quick-chat-dropdown.el-popper) {
  overflow: visible !important;
  background: #fff !important;
  border: 1px solid rgba(216, 225, 240, 0.95) !important;
  border-radius: 18px !important;
  box-shadow: 0 18px 42px rgba(48, 64, 93, 0.14) !important;
}

:global(.quick-chat-dropdown .el-dropdown-menu) {
  min-width: 220px !important;
  padding: 8px !important;
  overflow: hidden;
  background: #fff !important;
  border-radius: 18px !important;
  box-shadow: none !important;
}

:global(.quick-chat-dropdown .el-dropdown-menu__item) {
  height: 40px !important;
  padding: 0 14px !important;
  margin: 2px 0;
  color: #4f5c6f !important;
  font-size: 14px !important;
  font-weight: 500 !important;
  line-height: 40px !important;
  border-radius: 12px !important;
  transition:
    color 0.18s ease,
    background 0.18s ease;
}

:global(.quick-chat-dropdown .el-dropdown-menu__item:not(.is-disabled):hover),
:global(.quick-chat-dropdown .el-dropdown-menu__item:not(.is-disabled):focus) {
  color: var(--el-color-primary) !important;
  background: rgba(94, 127, 248, 0.1) !important;
}

:global(.quick-chat-dropdown .el-popper__arrow::before) {
  background: #fff !important;
  border-color: rgba(216, 225, 240, 0.95) !important;
  border-radius: 3px;
}

@media (max-width: 768px) {
  .quick-chat-toolbar {
    align-items: stretch;
    flex-direction: column;
  }

  .quick-chat-tools-right {
    justify-content: space-between;
    width: 100%;
  }

  .quick-chat-model-trigger {
    max-width: 180px;
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
