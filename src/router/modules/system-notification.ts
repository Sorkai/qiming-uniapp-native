import { $t } from "@/plugins/i18n";

export default {
  path: "/system-notification",
  name: "SystemNotification",
  component: () => import("@/views/system-notification/index.vue"),
  meta: {
    icon: "ri:notification-3-line",
    title: $t("menus.systemNotification"),
    rank: 10,
    roles: ["admin", "teacher"]
  }
} as RouteConfigsTable;
