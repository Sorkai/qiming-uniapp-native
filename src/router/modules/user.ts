export default {
  path: "/user",
  name: "User",
  redirect: "/user/list",
  meta: {
    icon: "ri:user-fill",
    title: "用户管理",
    rank: 2,
    roles: ["admin"] // 只有admin角色可以看到用户管理
  },
  children: [
    {
      path: "/user/list",
      name: "UserList",
      component: () => import("@/views/user/list/index.vue"),
      meta: {
        title: "用户列表",
        roles: ["admin"] // 只有admin角色可以看到用户列表
      }
    }
  ]
};
