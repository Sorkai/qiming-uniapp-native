import { h } from "vue";
import FolderClose from "@icon-park/vue-next/es/icons/FolderClose";

export default {
  path: "/online-disk",
  name: "OnlineDisk",
  component: () => import("@/views/online-disk/index.vue"),
  meta: {
    icon: () => h(FolderClose),
    title: "在线云盘",
    rank: 11,
    roles: ["admin"]
  }
} as RouteConfigsTable;
