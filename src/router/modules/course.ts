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
    }
  ]
};
