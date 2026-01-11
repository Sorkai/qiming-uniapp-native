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
  }
];
