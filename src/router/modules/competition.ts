import { $t } from "@/plugins/i18n";

export default {
  path: "/competition",
  redirect: "/competition/event",
  meta: {
    icon: "ri:trophy-line",
    title: $t("menus.competition"),
    rank: 13,
    roles: ["admin", "teacher"]
  },
  children: [
    {
      path: "/competition/event",
      name: "CompetitionEvent",
      component: () => import("@/views/competition/index.vue"),
      meta: {
        icon: "ri:calendar-event-line",
        title: "赛事管理"
      }
    },
    {
      path: "/competition/oj",
      name: "CompetitionOJ",
      component: () => import("@/views/competition/oj/index.vue"),
      meta: {
        icon: "ri:code-s-slash-line",
        title: "OJ题目管理"
      }
    },
    {
      path: "/competition/essay",
      name: "CompetitionEssay",
      component: () => import("@/views/competition/essay/index.vue"),
      meta: {
        icon: "ri:file-text-line",
        title: "作文批改"
      }
    },
    {
      path: "/competition/question-bank",
      name: "CompetitionQuestionBank",
      component: () => import("@/views/competition/question-bank/index.vue"),
      meta: {
        icon: "ri:questionnaire-line",
        title: "题库管理"
      }
    }
  ]
} satisfies RouteConfigsTable;
