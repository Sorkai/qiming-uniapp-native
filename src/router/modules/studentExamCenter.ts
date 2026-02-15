export default {
  path: "/student-exam-center",
  name: "StudentExamCenter",
  component: () => import("@/views/exam-paper/student-center/index.vue"),
  meta: {
    icon: "ri:file-list-2-line",
    title: "试题试卷中心",
    rank: 5,
    roles: ["student"]
  }
} as RouteConfigsTable;