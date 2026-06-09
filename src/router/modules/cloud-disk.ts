import { $t } from "@/plugins/i18n";

export default {
  path: "/cloud-disk",
  name: "CloudDisk",
  component: () => import("@/views/cloud-disk/index.vue"),
  meta: {
    icon: "ri:folder-cloud-line",
    title: $t("menus.cloudDisk"),
    rank: 8,
    roles: ["teacher"]
  }
} as RouteConfigsTable;
