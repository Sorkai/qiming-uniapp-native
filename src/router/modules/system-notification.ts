  import { $t } from "@/plugins/i18n";
import { h } from "vue";
import Message from "@icon-park/vue-next/es/icons/Message";

export default {
  path: "/system-notification",
  name: "SystemNotification",
  component: () => import("@/views/system-notification/index.vue"),
  meta: {
    icon: () => h(Message),
    title: $t("menus.systemNotification"),
    rank: 11,
    roles: ["admin", "teacher"]
  }
} as RouteConfigsTable;
