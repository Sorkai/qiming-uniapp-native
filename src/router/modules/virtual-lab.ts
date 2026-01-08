import { $t } from "@/plugins/i18n";

export default {
  path: "/virtual-lab",
  name: "VirtualLab",
  component: () => import("@/views/virtual-lab/index.vue"),
  meta: {
    icon: "ri:flask-line",
    title: $t("menus.virtualLab"),
    rank: 12
  }
} satisfies RouteConfigsTable;
