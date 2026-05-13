import { aiapp } from "@/router/enums";

export default {
  path: "/ai-app",
  redirect: "/ai-app/chat",
  meta: {
    icon: "ri:robot-2-line",
    title: "AI App",
    rank: aiapp,
    roles: ["admin", "teacher", "student"]
  },
  children: [
    {
      path: "/ai-app/chat",
      name: "AiAppChat",
      component: () => import("@/views/ai-app/index.vue"),
      meta: {
        title: "智能辅导",
        icon: "ri:chat-3-line",
        roles: ["admin", "teacher", "student"]
      }
    },
    {
      path: "/ai-app/generation",
      name: "AiAppGeneration",
      component: () => import("@/views/ai-app/index.vue"),
      meta: {
        title: "资源生成",
        icon: "ri:folder-open-line",
        roles: ["admin", "teacher", "student"]
      }
    },
    {
      path: "/ai-app/agentpdf",
      name: "AiAppAgentPdf",
      component: () => import("@/views/ai-app/index.vue"),
      meta: {
        title: "Agent PDF",
        icon: "ri:file-pdf-line",
        roles: ["admin", "teacher", "student"]
      }
    },
    {
      path: "/ai-app/path",
      name: "AiAppPath",
      component: () => import("@/views/ai-app/index.vue"),
      meta: {
        title: "路径规划",
        icon: "ri:map-pin-line",
        roles: ["admin", "teacher", "student"]
      }
    },
    {
      path: "/ai-app/profile",
      name: "AiAppProfile",
      component: () => import("@/views/ai-app/index.vue"),
      meta: {
        title: "学习画像",
        icon: "ri:user-smile-line",
        roles: ["admin", "teacher", "student"]
      }
    },
    {
      path: "/ai-app/assessment",
      name: "AiAppAssessment",
      component: () => import("@/views/ai-app/index.vue"),
      meta: {
        title: "学习评估",
        icon: "ri:bar-chart-box-line",
        roles: ["admin", "teacher", "student"]
      }
    },
    {
      path: "/ai-app/automation",
      name: "AiAppAutomation",
      component: () => import("@/views/ai-app/index.vue"),
      meta: {
        title: "自动化",
        icon: "ri:magic-line",
        roles: ["admin", "teacher", "student"]
      }
    }
  ]
} satisfies RouteConfigsTable;
