import { home } from "@/router/enums";
const Layout = () => import("@/layout/index.vue");

export default {
  path: "/",
  name: "main",
  component: Layout,
  redirect: "/home",
  meta: {
    icon: "ep/home-filled",
    title: "启明智教",
    rank: home
  },
  children: []
} satisfies RouteConfigsTable;
