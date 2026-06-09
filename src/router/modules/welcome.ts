import { welcome } from "@/router/enums";

export default {
  path: "/welcome",
  redirect: "/welcome/index",
  meta: {
    icon: "ep:home-filled",
    title: "欢迎",
    rank: welcome
  },
  children: [
    {
      path: "/welcome/index",
      name: "WelcomePage",
      component: () => import("@/views/welcome/index.vue"),
      meta: {
        title: "欢迎"
      }
    }
  ]
} satisfies RouteConfigsTable;
