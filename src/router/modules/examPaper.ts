export default {
  path: "/exam-paper",
  redirect: "/exam-paper/index",
  meta: {
    icon: "ri:file-list-3-line",
    title: "题目组卷器",
    rank: 8
  },
  children: [
    {
      path: "/exam-paper/index",
      name: "ExamPaperIndex",
      component: () => import("@/views/exam-paper/index.vue"),
      meta: {
        title: "试卷总览",
        icon: "ri:dashboard-line"
      }
    },
    {
      path: "/exam-paper/my-papers",
      name: "ExamPaperMyPapers",
      component: () => import("@/views/exam-paper/my-papers/index.vue"),
      meta: {
        title: "我的试卷",
        icon: "ri:file-paper-2-line"
      }
    },
    {
      path: "/exam-paper/templates",
      name: "ExamPaperTemplates",
      component: () => import("@/views/exam-paper/templates/index.vue"),
      meta: {
        title: "试卷模板",
        icon: "ri:layout-grid-line"
      }
    },
    {
      path: "/exam-paper/grading",
      name: "ExamPaperGrading",
      component: () => import("@/views/exam-paper/grading/index.vue"),
      meta: {
        title: "阅卷管理",
        icon: "ri:edit-box-line"
      }
    },
    {
      path: "/exam-paper/statistics",
      name: "ExamPaperStatistics",
      component: () => import("@/views/exam-paper/statistics/index.vue"),
      meta: {
        title: "学情分析",
        icon: "ri:bar-chart-box-line"
      }
    },
    {
      path: "/exam-paper/question-bank",
      name: "ExamPaperQuestionBank",
      component: () => import("@/views/exam-paper/question-bank/index.vue"),
      meta: {
        title: "题库管理",
        icon: "ri:database-2-line"
      }
    },
    {
      path: "/exam-paper/editor",
      name: "ExamPaperEditor",
      component: () => import("@/views/exam-paper/editor/index.vue"),
      meta: {
        title: "编辑试卷",
        showLink: false,
        showParent: false,
        hiddenTag: true
      }
    },
    {
      path: "/exam-paper/editor/:id",
      name: "ExamPaperEditorEdit",
      component: () => import("@/views/exam-paper/editor/index.vue"),
      meta: {
        title: "编辑试卷",
        showLink: false,
        showParent: false,
        hiddenTag: true
      }
    },
    {
      path: "/exam-paper/grading/:id",
      name: "ExamPaperGradingDetail",
      component: () => import("@/views/exam-paper/grading/detail.vue"),
      meta: {
        title: "阅卷详情",
        showLink: false,
        showParent: false,
        hiddenTag: true
      }
    },
    {
      path: "/exam-paper/grading/:id/detail",
      name: "ExamPaperGradingView",
      component: () => import("@/views/exam-paper/grading/detail.vue"),
      meta: {
        title: "查看阅卷",
        showLink: false,
        showParent: false,
        hiddenTag: true
      }
    }
  ]
} satisfies RouteConfigsTable;
