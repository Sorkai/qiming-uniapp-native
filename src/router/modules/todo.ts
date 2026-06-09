import { $t } from "@/plugins/i18n";

export default {
  path: "/todo",
  name: "Todo",
  component: () => import("@/views/todo/index.vue"),
  meta: {
    icon: "ri:task-line",
    title: $t("menus.todo"),
    rank: 11,
    roles: ["admin", "teacher"]
  }
} as RouteConfigsTable;
