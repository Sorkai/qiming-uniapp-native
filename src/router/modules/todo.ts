import { $t } from "@/plugins/i18n";
import { h } from "vue";
import CheckCorrect from "@icon-park/vue-next/es/icons/CheckCorrect";

export default {
  path: "/todo",
  name: "Todo",
  component: () => import("@/views/todo/index.vue"),
  meta: {
    icon: () => h(CheckCorrect),
    title: $t("menus.todo"),
    rank: 12,
    roles: ["admin", "teacher"]
  }
} as RouteConfigsTable;
