export default {
  path: "/system/discussion",
  name: "DiscussionAdmin",
  redirect: "/system/discussion/sensitive-words",
  meta: {
    icon: "ri:shield-check-line",
    title: "讨论管理",
    rank: 15,
    roles: ["admin"]
  },
  children: [
    {
      path: "/system/discussion/sensitive-words",
      name: "SensitiveWordsManage",
      component: () => import("@/views/system/discussion/sensitive-words.vue"),
      meta: {
        icon: "ri:prohibited-line",
        title: "敏感词管理",
        roles: ["admin"]
      }
    },
    {
      path: "/system/discussion/user-reputation",
      name: "UserReputationManage",
      component: () => import("@/views/system/discussion/user-reputation.vue"),
      meta: {
        icon: "ri:user-star-line",
        title: "用户信誉",
        roles: ["admin"]
      }
    },
    {
      path: "/system/discussion/statistics",
      name: "DiscussionStatistics",
      component: () => import("@/views/system/discussion/statistics.vue"),
      meta: {
        icon: "ri:bar-chart-box-line",
        title: "讨论统计",
        roles: ["admin"]
      }
    }
  ]
};