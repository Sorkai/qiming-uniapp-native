export default {
  path: "/course",
  name: "Course",
  redirect: "/course/list",
  meta: {
    icon: "ri:book-fill",
    title: "课程管理",
    rank: 3
  },
  children: [
    {
      path: "/course/list",
      name: "CourseList",
      component: () => import("@/views/course/list/index.vue"),
      meta: {
        title: "课程列表"
      }
    },
    {
      path: "/course/category",
      name: "CourseCategory",
      component: () => import("@/views/course/category/index.vue"),
      meta: {
        title: "课程分类"
      }
    },
    {
      path: "/course/assessment",
      name: "CourseAssessment",
      component: () => import("@/views/course/assessment/index.vue"),
      meta: {
        title: "作业与考试"
      }
    },
    {
      path: "/course/teacherplan",
      name: "CourseTeacherPlan",
      component: () => import("@/views/course/teacherplan/index.vue"),
      meta: {
        title: "教案管理"
      }
    }
    ,
    {
      path: "/course/animation",
      name: "CourseAnimation",
      component: () => import("@/views/course/animation/index.vue"),
      meta: {
        title: "AI动画"
      }
    }
  ]
};
