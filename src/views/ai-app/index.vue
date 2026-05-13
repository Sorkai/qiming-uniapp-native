<script setup lang="ts">
import { ref, onMounted } from "vue";
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
  Top
} from "@element-plus/icons-vue";

// 引入三个拆分后的组件
import AiSidebar from "./components/AiSidebar.vue";
import AiChatModule from "./components/AiChatModule.vue";
import AiInspector from "./components/AiInspector.vue";
import AgentPdfWorkbench from "./AgentPdfWorkbench.vue";

import { useNav } from "@/layout/hooks/useNav";

defineOptions({ name: "AiAppWorkbench" });

const route = useRoute();
const router = useRouter();
const { getLogo } = useNav();

// === 模拟/基础状态数据 ===
const mode = ref("学生模式");
const isNewTab = ref(false);

const layoutStorage = storageLocal().getItem("responsive-layout") as
  | { darkMode?: boolean }
  | undefined;
const currentTheme = ref(
  (storageLocal().getItem("course_theme") as string) ||
    (layoutStorage?.darkMode ? "dark" : "light")
);

// 会话数据集
const activeRail = ref("chat");
const activeCourse = ref(null);

// 学生拥有的课程（动态拉取）
const myCourses = ref(["数据结构", "算法设计", "高等数学", "大学物理"]);

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
    class="ai-app-root h-screen w-full flex bg-gradient-to-br from-[rgb(253,229,250)] via-[rgb(233,231,255)] to-[rgb(254,214,233)] font-sans"
    :class="currentTheme"
  >
    <!-- 极简左侧边栏 (第一块) -->
    <aside
      class="w-[260px] flex-shrink-0 z-20 bg-white border-r border-gray-100 flex flex-col transition-all duration-300"
    >
      <!-- 品牌Logo区 -->
      <div class="h-16 flex items-center border-b border-gray-100 px-6">
        <img :src="getLogo()" alt="logo" class="h-8 w-8 object-contain mr-3" />
        <span
          class="text-xl font-black italic tracking-tighter uppercase"
          style="color: var(--el-color-primary)"
          >IntellEdu</span
        >
      </div>
      <div class="flex-1 overflow-hidden">
        <AiSidebar
          v-model:activeRail="activeRail"
          :railItems="railItems"
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
    </aside>

    <!-- 右边总体容器 (上边栏 + 主体) -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 上边栏 (第二块) -->
      <header
        class="h-16 flex-shrink-0 bg-white/80 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-6 z-10"
      >
        <div class="flex items-center gap-3">
          <el-button
            :icon="ArrowLeftBold"
            circle
            plain
            class="shadow-sm hover:-translate-x-1 transition-transform"
            @click="goBack"
          />
          <div class="w-[1px] h-5 bg-gray-200 mx-2" />
          <h2 class="text-[15px] font-black text-gray-800 tracking-tight">
            AI 协作工坊
          </h2>
          <el-tag
            size="small"
            type="primary"
            effect="light"
            class="ml-2 !rounded-full"
            >基于大模型的系统</el-tag
          >
        </div>
        <div class="flex items-center justify-end gap-4 flex-1">
          <span class="text-sm font-bold text-gray-600 pr-2"
            >当前模式: {{ mode }}</span
          >
          <el-avatar
            :size="30"
            src="https://avatars.githubusercontent.com/u/44761321?v=4"
            class="shadow-sm border border-gray-100 hover:scale-110 transition-transform cursor-pointer"
          />
        </div>
      </header>

      <!-- 主体内容 (第三块) -->
      <main class="flex-1 overflow-hidden relative">
        <!-- 【场景 A1】 智能辅导对谈框 (已选课) -->
        <div
          v-if="activeRail === `chat` && activeCourse"
          class="h-full w-full flex stretch p-4 gap-4 overflow-hidden"
        >
          <!-- 对话流核心面板 -->
          <div
            class="flex-1 h-full bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100/50 overflow-hidden relative group"
          >
            <!-- 柔和的顶部遮罩渐变 -->
            <div
              class="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-white to-transparent pointer-events-none z-10"
            />
            <AiChatModule
              :messages="messages"
              :activeCourse="activeCourse"
              @send="handleSendMessage"
            />
          </div>

          <!-- 右侧分析面板 (彻底移除响应式隐藏类，确保永远可见) -->
          <div
            class="w-[340px] flex-shrink-0 h-full bg-white rounded-3xl shadow-[0_2px_20px_rgba(0,0,0,0.02)] border border-gray-100/50 overflow-hidden transform hover:-translate-y-0.5 transition-transform duration-500"
          >
            <AiInspector
              :profileDimensions="profileDimensions"
              :agentItems="agentItems"
              :resources="generatedResources"
            />
          </div>
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
              <p class="text-[15px] font-medium tracking-wide" style="color: rgba(140,80,159,0.7)">
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
                    class="w-9 h-9 flex items-center justify-center rounded-full transition-all transform border"
                    :class="
                      quickCourse && quickMessage.trim()
                        ? 'bg-black border-black text-white hover:bg-gray-800 hover:scale-105 shadow-md cursor-pointer'
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
        <div v-else-if="activeRail === `agentpdf`" class="h-full w-full p-4">
          <div
            class="h-full bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <AgentPdfWorkbench />
          </div>
        </div>

        <!-- 【场景 C】 其他未开发项 -->
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
</template>

<style scoped lang="scss">
.ai-app-root {
  --el-color-primary: #5e7ff8; // 强制保持平台蓝
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
