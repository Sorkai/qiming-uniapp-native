import { aiapp } from "@/router/enums";

export default {
  path: "/ai-app",
  redirect: "/ai-app/index",
  meta: {
    icon: "ri:robot-2-line",
    title: "AI App",
    rank: aiapp,
    roles: ["admin", "teacher", "student"]
  },
  children: [
    {
      path: "/ai-app/index",
      name: "AiApp",
      component: () => import("@/views/ai-app/entry.vue"),
      meta: {
        title: "AI App",
        roles: ["admin", "teacher", "student"]
      }
    }
  ]
} satisfies RouteConfigsTable;
