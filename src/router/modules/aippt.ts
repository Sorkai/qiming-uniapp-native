import { $t } from "@/plugins/i18n";

export default {
  path: "/aippt",
  name: "AiPPT",
  component: () => import("@/views/aippt/index.vue"),
  meta: {
    title: $t("menus.aiPPT"),
    rank: 12,
    icon: "ri:presentation-fill"
  }
};
