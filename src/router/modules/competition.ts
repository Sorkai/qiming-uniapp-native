import { $t } from "@/plugins/i18n";

export default {
  path: "/competition",
  redirect: "/competition/overview",
  meta: {
    icon: "ri:trophy-line",
    title: $t("menus.competition"),
    rank: 13,
    roles: ["admin", "teacher"]
  },
  children: [
    {
      path: "/competition/overview",
      name: "CompetitionOverview",
      component: () => import("@/views/competition/overview/index.vue"),
      meta: {
        icon: "ri:dashboard-3-line",
        title: "大屏概览"
      }
    },
    {
      path: "/competition/oj",
      name: "CompetitionOJ",
      component: () => import("@/views/competition/oj/index.vue"),
      meta: {
        icon: "ri:code-s-slash-line",
        title: "编程竞赛(OJ)"
      }
    },
    {
      path: "/competition/question-bank",
      name: "CompetitionQuestionBank",
      component: () => import("@/views/competition/question-bank/index.vue"),
      meta: {
        icon: "ri:questionnaire-line",
        title: "知识竞赛题库"
      }
    },
    {
      path: "/competition/essay",
      name: "CompetitionEssay",
      component: () => import("@/views/competition/essay/index.vue"),
      meta: {
        icon: "ri:file-text-line",
        title: "作文比赛"
      }
    },
    {
      path: "/competition/event-manage",
      name: "CompetitionEventManage",
      component: () => import("@/views/competition/event-manage/index.vue"),
      meta: {
        icon: "ri:calendar-event-line",
        title: "综合赛事管理"
      }
    }
  ]
} satisfies RouteConfigsTable;
