export default {
  path: "/user",
  name: "User",
  redirect: "/user/list",
  meta: {
    icon: "ri:user-fill",
    title: "用户管理",
    rank: 2
  },
  children: [
    {
      path: "/user/list",
      name: "UserList",
      component: () => import("@/views/user/list/index.vue"),
      meta: {
        title: "用户列表"
      }
    }
  ]
};
