export default [
  {
    path: "/course/list",
    name: "CourseList",
    component: () => import("@/views/course/list/index.vue"),
    meta: {
      icon: "ri:list-check",
      title: "课程列表",
      rank: 3
    }
  },
  {
    path: "/course/category",
    name: "CourseCategory",
    component: () => import("@/views/course/category/index.vue"),
    meta: {
      icon: "ri:node-tree",
      title: "课程分类",
      rank: 4
    }
  },
  {
    path: "/course/assessment",
    name: "CourseAssessment",
    component: () => import("@/views/course/assessment/index.vue"),
    meta: {
      icon: "ri:edit-box-line",
      title: "作业与考试",
      rank: 5
    }
  },
  {
    path: "/course/teacherplan",
    name: "CourseTeacherPlan",
    component: () => import("@/views/course/teacherplan/index.vue"),
    meta: {
      icon: "ri:calendar-todo-fill",
      title: "教案管理",
      rank: 6
    }
  },
  {
    path: "/course/animation",
    name: "CourseAnimation",
    component: () => import("@/views/course/animation/index.vue"),
    meta: {
      icon: "ri:magic-line",
      title: "AI动画",
      rank: 7
    }
  },
  {
    path: "/course/classroom",
    name: "CourseClassroom",
    component: () => import("@/views/course/classroom/index.vue"),
    meta: {
      icon: "ri:community-line",
      title: "3D虚拟教室",
      rank: 8
    }
  },
  {
    path: "/course/discussion",
    name: "CourseDiscussion",
    redirect: "/course/discussion/review",
    meta: {
      icon: "ri:discuss-line",
      title: "讨论管理",
      rank: 9,
      roles: ["admin", "teacher"]
    },
    children: [
      {
        path: "/course/discussion/review",
        name: "CourseDiscussionReview",
        component: () => import("@/views/course/discussion/review.vue"),
        meta: {
          icon: "ri:chat-3-line",
          title: "讨论列表",
          roles: ["admin", "teacher"]
        }
      },
      {
        path: "/course/discussion/index",
        name: "CourseDiscussionIndex",
        component: () => import("@/views/course/discussion/index.vue"),
        meta: {
          icon: "ri:checkbox-circle-line",
          title: "内容审核",
          roles: ["admin", "teacher"]
        }
      },
      {
        path: "/course/discussion/reports",
        name: "CourseDiscussionReports",
        component: () => import("@/views/course/discussion/reports.vue"),
        meta: {
          icon: "ri:alarm-warning-line",
          title: "举报处理",
          roles: ["admin", "teacher"]
        }
      },
      {
        path: "/course/discussion/sensitive-words",
        name: "SensitiveWordsManage",
        component: () =>
          import("@/views/system/discussion/sensitive-words.vue"),
        meta: {
          icon: "ri:prohibited-line",
          title: "敏感词管理",
          roles: ["admin"]
        }
      },
      {
        path: "/course/discussion/user-reputation",
        name: "UserReputationManage",
        component: () =>
          import("@/views/system/discussion/user-reputation.vue"),
        meta: {
          icon: "ri:user-star-line",
          title: "用户信誉",
          roles: ["admin"]
        }
      },
      {
        path: "/course/discussion/statistics",
        name: "DiscussionStatistics",
        component: () => import("@/views/system/discussion/statistics.vue"),
        meta: {
          icon: "ri:bar-chart-box-line",
          title: "讨论统计",
          roles: ["admin"]
        }
      }
    ]
  }
];