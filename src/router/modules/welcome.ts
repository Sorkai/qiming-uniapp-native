import { welcome } from "@/router/enums";

export default {
  path: "/welcome",
  redirect: "/welcome/index",
  meta: {
    icon: "ep:home-filled",
    title: "welcome",
    rank: welcome
  },
  children: [
    {
      path: "/welcome/index",
      name: "WelcomePage",
      component: () => import("@/views/welcome/index.vue"),
      meta: {
        title: "welcome"
      }
    }
  ]
} satisfies RouteConfigsTable;
