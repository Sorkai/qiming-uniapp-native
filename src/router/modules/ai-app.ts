import { aiapp } from "@/router/enums";

export default {
  path: "/ai-app",
  redirect: "/ai-app/chat",
  meta: {
    icon: "ri:magic-line",
    title: "学习助手",
    rank: aiapp,
    roles: ["admin", "teacher", "student"]
  },
  children: [
    {
      path: "/ai-app/chat",
      name: "AiAppChat",
      component: () => import("@/views/ai-app/index.vue"),
      meta: {
        title: "互动答疑",
        icon: "ri:chat-3-line",
        roles: ["admin", "teacher", "student"]
      }
    },
    {
      path: "/ai-app/generation",
      name: "AiAppGeneration",
      component: () => import("@/views/ai-app/index.vue"),
      meta: {
        title: "教学资源",
        icon: "ri:folder-open-line",
        roles: ["admin", "teacher", "student"]
      }
    },
    {
      path: "/ai-app/agentpdf",
      name: "AiAppAgentPdf",
      component: () => import("@/views/ai-app/index.vue"),
      meta: {
        title: "资料研读",
        icon: "ri:file-pdf-line",
        roles: ["admin", "teacher", "student"]
      }
    },
    {
      path: "/ai-app/path",
      name: "AiAppPath",
      component: () => import("@/views/ai-app/index.vue"),
      meta: {
        title: "学习计划",
        icon: "ri:map-pin-line",
        roles: ["admin", "teacher", "student"]
      }
    },
    {
      path: "/ai-app/profile",
      name: "AiAppProfile",
      component: () => import("@/views/ai-app/index.vue"),
      meta: {
        title: "学情分析",
        icon: "ri:user-smile-line",
        roles: ["admin", "teacher", "student"]
      }
    },
    {
      path: "/ai-app/assessment",
      name: "AiAppAssessment",
      component: () => import("@/views/ai-app/index.vue"),
      meta: {
        title: "测验评估",
        icon: "ri:bar-chart-box-line",
        roles: ["admin", "teacher", "student"]
      }
    },
    {
      path: "/ai-app/governance",
      name: "AiAppGovernance",
      component: () => import("@/views/ai-app/index.vue"),
      meta: {
        title: "治理看板",
        icon: "ri:dashboard-line",
        roles: ["admin", "teacher"]
      }
    },
    {
      path: "/ai-app/automation",
      name: "AiAppAutomation",
      component: () => import("@/views/ai-app/index.vue"),
      meta: {
        title: "常规任务",
        icon: "ri:check-double-line",
        roles: ["admin", "teacher", "student"]
      }
    }
  ]
} satisfies RouteConfigsTable;
