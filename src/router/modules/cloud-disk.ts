import { $t } from "@/plugins/i18n";
import { h } from "vue";
import FolderClose from "@icon-park/vue-next/es/icons/FolderClose";

export default {
  path: "/cloud-disk",
  name: "CloudDisk",
  component: () => import("@/views/cloud-disk/index.vue"),
  meta: {
    icon: () => h(FolderClose),
    title: $t("menus.cloudDisk"),
    rank: 10,
    roles: ["teacher"]
  }
} as RouteConfigsTable;
