export default {
  path: "/online-disk",
  name: "OnlineDisk",
  component: () => import("@/views/online-disk/index.vue"),
  meta: {
    icon: "ri:cloud-line",
    title: "在线云盘",
    rank: 9,
    roles: ["admin"]
  }
} as RouteConfigsTable;
