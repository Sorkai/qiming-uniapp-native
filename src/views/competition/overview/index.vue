<template>
  <div class="main">
    <!-- 头部统计 -->
    <el-card class="box-card header-card">
      <div class="header-content">
        <div class="header-left">
          <h2>赛事大屏概览</h2>
          <p>实时查看各类竞赛活动的整体数据与统计信息</p>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalEvents }}</span>
            <span class="stat-label">赛事总数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.ongoingEvents }}</span>
            <span class="stat-label">进行中</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalParticipants }}</span>
            <span class="stat-label">总参与人数</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 四大模块统计卡片 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card
          class="overview-card coding-card"
          shadow="always"
          @click="goToModule('oj')"
        >
          <div class="card-bg-icon">💻</div>
          <div class="card-content">
            <div class="card-header">
              <span class="card-icon">💻</span>
              <span class="card-title">编程竞赛</span>
            </div>
            <div class="card-stats">
              <div class="stat-main">
                <span class="stat-number">{{ ojStats.totalProblems }}</span>
                <span class="stat-unit">道题目</span>
              </div>
              <div class="stat-sub">
                <span class="stat-label">累计提交</span>
                <span class="stat-value">{{ ojStats.submissions }}</span>
              </div>
            </div>
            <div class="card-footer">
              <span class="trend-up">在线编程判题系统 (OJ)</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card
          class="overview-card quiz-card"
          shadow="always"
          @click="goToModule('quiz-bank')"
        >
          <div class="card-bg-icon">🥇</div>
          <div class="card-content">
            <div class="card-header">
              <span class="card-icon">🥇</span>
              <span class="card-title">知识竞赛</span>
            </div>
            <div class="card-stats">
              <div class="stat-main">
                <span class="stat-number">{{ quizStats.questions }}</span>
                <span class="stat-unit">道题目</span>
              </div>
              <div class="stat-sub">
                <span class="stat-label">题库分类</span>
                <span class="stat-value">{{ quizStats.categories }}</span>
              </div>
            </div>
            <div class="card-footer">
              <span class="trend-up">选择题/判断题/填空题等</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card
          class="overview-card essay-card"
          shadow="always"
          @click="goToModule('essay')"
        >
          <div class="card-bg-icon">📄</div>
          <div class="card-content">
            <div class="card-header">
              <span class="card-icon">📄</span>
              <span class="card-title">作文比赛</span>
            </div>
            <div class="card-stats">
              <div class="stat-main">
                <span class="stat-number">{{ essayStats.totalEssays }}</span>
                <span class="stat-unit">篇作文</span>
              </div>
              <div class="stat-sub">
                <span class="stat-label">平均分数</span>
                <span class="stat-value">{{ essayStats.avgScore }}</span>
              </div>
            </div>
            <div class="card-footer">
              <span class="trend-up">AI智能批改评分</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="12" :lg="6">
        <el-card
          class="overview-card event-card"
          shadow="always"
          @click="goToModule('event-manage')"
        >
          <div class="card-bg-icon">🏆</div>
          <div class="card-content">
            <div class="card-header">
              <span class="card-icon">🏆</span>
              <span class="card-title">综合赛事</span>
            </div>
            <div class="card-stats">
              <div class="stat-main">
                <span class="stat-number">{{ eventStats.totalEvents }}</span>
                <span class="stat-unit">场赛事</span>
              </div>
              <div class="stat-sub">
                <span class="stat-label">进行中</span>
                <span class="stat-value">{{ eventStats.ongoingEvents }}</span>
              </div>
            </div>
            <div class="card-footer">
              <span class="trend-up">多类型综合赛事管理</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 近期赛事 -->
    <el-row :gutter="20" class="bottom-row">
      <el-col :xs="24" :lg="16">
        <el-card class="box-card events-card">
          <template #header>
            <div class="card-header">
              <span>📅 近期赛事</span>
              <el-button
                type="primary"
                link
                @click="goToModule('event-manage')"
              >
                查看全部 →
              </el-button>
            </div>
          </template>
          <div v-if="isMobile" class="mobile-events-list">
            <div
              v-for="row in recentEvents"
              :key="row.id || row.title"
              class="mobile-event-card"
            >
              <div class="mobile-event-card__header">
                <div class="event-title-cell">
                  <span class="event-icon">{{ getTypeIcon(row.type) }}</span>
                  <span>{{ row.title }}</span>
                </div>
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </div>

              <div class="mobile-event-card__body">
                <div class="mobile-event-field">
                  <span class="label">Type</span>
                  <span>{{ getTypeLabel(row.type) }}</span>
                </div>
                <div class="mobile-event-field">
                  <span class="label">Start</span>
                  <span>{{ row.startTime }}</span>
                </div>
                <div class="mobile-event-field">
                  <span class="label">Participants</span>
                  <span>{{ row.participants }}</span>
                </div>
              </div>
            </div>

            <el-empty v-if="recentEvents.length === 0" />
          </div>

          <el-table v-else :data="recentEvents" stripe style="width: 100%">
            <el-table-column prop="title" label="赛事名称" min-width="200">
              <template #default="{ row }">
                <div class="event-title-cell">
                  <span class="event-icon">{{ getTypeIcon(row.type) }}</span>
                  <span>{{ row.title }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column
              prop="type"
              label="类型"
              width="120"
              align="center"
            >
              <template #default="{ row }">
                <el-tag :type="getTypeTagType(row.type)" size="small">
                  {{ getTypeLabel(row.type) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="startTime"
              label="开始时间"
              width="160"
              align="center"
            />
            <el-table-column
              prop="participants"
              label="参与人数"
              width="100"
              align="center"
            />
            <el-table-column
              prop="status"
              label="状态"
              width="100"
              align="center"
            >
              <template #default="{ row }">
                <el-tag :type="getStatusTagType(row.status)" size="small">
                  {{ getStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
      <el-col :xs="24" :lg="8">
        <el-card class="box-card rankings-card">
          <template #header>
            <div class="card-header">
              <span>🏅 积分排行榜</span>
            </div>
          </template>
          <div class="rankings-list" :style="{ height: rankingsHeight + 'px' }">
            <div
              v-for="(user, index) in topRankings"
              :key="user.userId"
              class="ranking-item"
              :class="{ 'is-top3': index < 3 }"
            >
              <div class="rank">
                <span v-if="index < 3" class="rank-medal">{{
                  ["🥇", "🥈", "🥉"][index]
                }}</span>
                <span v-else class="rank-number">{{ index + 1 }}</span>
              </div>
              <el-avatar :size="32" :src="formatAvatar(user.avatar)" />
              <div class="user-info">
                <span class="username">{{ user.username }}</span>
              </div>
              <div class="score">{{ user.points }} 分</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";
import { formatAvatar } from "@/utils/avatar";
import { usePageResponsive } from "@/utils/pageResponsive";
import {
  getEventStats,
  getOJStats,
  getQuestionBankStats,
  getEssayStats,
  getEventList,
  getLeaderboard
} from "@/api/competition";

defineOptions({
  name: "CompetitionOverview"
});

const router = useRouter();
const { isMobile } = usePageResponsive();

// 总体统计
const stats = ref({
  totalEvents: 0,
  ongoingEvents: 0,
  totalParticipants: 0
});

// 各模块统计
const ojStats = ref({ totalProblems: 0, submissions: 0 });
const quizStats = ref({ categories: 0, questions: 0 });
const essayStats = ref({ totalEssays: 0, avgScore: 0 });
const eventStats = ref({ totalEvents: 0, ongoingEvents: 0 });

// 近期赛事
const recentEvents = ref<any[]>([]);

// 排行榜
const topRankings = ref<any[]>([]);
const rankingsHeight = computed(() => (isMobile.value ? 240 : 280));

const loadStats = async () => {
  try {
    const { data } = await getEventStats();
    stats.value = data;
    eventStats.value = {
      totalEvents: data.totalEvents,
      ongoingEvents: data.ongoingEvents
    };
  } catch (error) {
    console.error("获取统计数据失败", error);
  }
};

const loadModuleStats = async () => {
  try {
    const ojRes = await getOJStats();
    ojStats.value = {
      totalProblems: ojRes.data.totalProblems,
      submissions: ojRes.data.totalSubmissions
    };
  } catch (error) {
    console.error("获取OJ统计失败", error);
  }

  try {
    const qbRes = await getQuestionBankStats();
    quizStats.value = {
      categories: qbRes.data.totalCategories,
      questions: qbRes.data.totalQuestions
    };
  } catch (error) {
    console.error("获取题库统计失败", error);
  }

  try {
    const essayRes = await getEssayStats();
    essayStats.value = {
      totalEssays: essayRes.data.totalEssays,
      avgScore: essayRes.data.avgScore
    };
  } catch (error) {
    console.error("获取作文统计失败", error);
  }
};

const loadRecentEvents = async () => {
  try {
    const { data } = await getEventList({ pageNum: 1, pageSize: 5 });
    recentEvents.value = data.eventList || [];
  } catch (error) {
    console.error("获取近期赛事失败", error);
  }
};

const loadRankings = async () => {
  try {
    const { data } = await getLeaderboard({ type: "total" });
    topRankings.value = (data.list || []).slice(0, 5);
  } catch (error) {
    console.error("获取排行榜失败", error);
  }
};

const goToModule = (module: string) => {
  router.push(`/competition/${module}`);
};

// 工具函数
const getTypeLabel = (type: string) => {
  const labels: Record<string, string> = {
    coding: "编程竞赛",
    quiz: "知识竞赛",
    essay: "作文比赛",
    comprehensive: "综合竞赛"
  };
  return labels[type] || type;
};

const getTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    coding: "💻",
    quiz: "🥇",
    essay: "📄",
    comprehensive: "🏆"
  };
  return icons[type] || "🎯";
};

const getTypeTagType = (
  type: string
): "primary" | "success" | "warning" | "danger" => {
  const types: Record<string, "primary" | "success" | "warning" | "danger"> = {
    coding: "primary",
    quiz: "danger",
    essay: "warning",
    comprehensive: "success"
  };
  return types[type] || "primary";
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    upcoming: "即将开始",
    ongoing: "进行中",
    ended: "已结束"
  };
  return labels[status] || status;
};

const getStatusTagType = (status: string): "primary" | "success" | "info" => {
  const types: Record<string, "primary" | "success" | "info"> = {
    upcoming: "primary",
    ongoing: "success",
    ended: "info"
  };
  return types[status] || "info";
};

onMounted(() => {
  loadStats();
  loadModuleStats();
  loadRecentEvents();
  loadRankings();
});
</script>

<style lang="scss" scoped>
.main {
  padding: 12px;

  .header-card {
    margin-bottom: 16px;
    overflow: hidden;
    background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
    border: none;
    border-radius: 16px;
    box-shadow: 0 4px 16px rgb(0 0 0 / 12%);

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 0;
    }

    .header-left {
      h2 {
        margin: 0 0 8px;
        font-size: 24px;
        font-weight: 600;
        color: #fff;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: rgb(255 255 255 / 85%);
      }
    }

    .header-stats {
      display: flex;
      gap: 32px;

      .stat-item {
        text-align: center;

        .stat-value {
          display: block;
          font-size: 28px;
          font-weight: 700;
          color: #fff;
        }

        .stat-label {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: rgb(255 255 255 / 75%);
        }
      }
    }
  }

  .overview-cards {
    margin-bottom: 20px;

    .overview-card {
      position: relative;
      overflow: hidden;
      cursor: pointer;
      border: none;
      border-radius: 16px;
      box-shadow: 0 4px 16px rgb(0 0 0 / 12%);
      transition: all 0.3s ease;

      &:hover {
        box-shadow: 0 12px 24px rgb(0 0 0 / 15%);
        transform: translateY(-4px);
      }

      .card-bg-icon {
        position: absolute;
        right: -10px;
        bottom: -10px;
        font-size: 80px;
        opacity: 0.1;
        transform: rotate(-15deg);
      }

      .card-content {
        position: relative;
        z-index: 1;
        padding: 8px;
      }

      .card-header {
        display: flex;
        gap: 8px;
        align-items: center;
        margin-bottom: 16px;

        .card-icon {
          font-size: 24px;
        }

        .card-title {
          font-size: 16px;
          font-weight: 600;
          color: #1e3a5f;
        }
      }

      .card-stats {
        .stat-main {
          margin-bottom: 12px;

          .stat-number {
            font-size: 36px;
            font-weight: 700;
            line-height: 1;
            color: #1e3a5f;
          }

          .stat-unit {
            margin-left: 4px;
            font-size: 14px;
            color: #374151;
          }
        }

        .stat-sub {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 8px 12px;
          background: rgb(255 255 255 / 50%);
          border-radius: 8px;

          .stat-label {
            font-size: 12px;
            color: #4b5563;
          }

          .stat-value {
            font-size: 16px;
            font-weight: 600;
            color: #1e3a5f;
          }
        }
      }

      .card-footer {
        padding-top: 12px;
        margin-top: 12px;
        border-top: 1px solid rgb(0 0 0 / 10%);

        .trend-up {
          font-size: 12px;
          color: #4b5563;
        }
      }
    }

    .coding-card {
      background: linear-gradient(135deg, #93c5fd 0%, #60a5fa 100%);
    }

    .quiz-card {
      background: linear-gradient(135deg, #c4b5fd 0%, #a78bfa 100%);
    }

    .essay-card {
      background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%);
    }

    .event-card {
      background: linear-gradient(135deg, #6ee7b7 0%, #34d399 100%);
    }
  }

  .box-card {
    margin-bottom: 16px;
    overflow: hidden;
    border: 1px solid var(--el-border-color-light);
    border-radius: 16px;
    box-shadow: 0 4px 16px rgb(0 0 0 / 12%);

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
  }

  .event-title-cell {
    display: flex;
    gap: 8px;
    align-items: center;

    .event-icon {
      font-size: 20px;
    }
  }
}

.bottom-row {
  .events-card,
  .rankings-card {
    display: flex;
    flex-direction: column;
    height: 100%;

    :deep(.el-card__body) {
      display: flex;
      flex: 1;
      flex-direction: column;
      overflow: hidden;
    }
  }

  .rankings-card {
    .rankings-list {
      flex: 1;
      min-height: 280px;
      max-height: 320px;
      overflow-y: auto;
    }
  }
}

.mobile-events-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.mobile-event-card {
  padding: 14px;
  background: var(--el-fill-color-extra-light);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 14px;
}

.mobile-event-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}

.mobile-event-card__body {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 12px;
}

.mobile-event-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.mobile-event-field .label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.rankings-list {
  .ranking-item {
    display: flex;
    align-items: center;
    padding: 10px 12px;
    margin-bottom: 8px;
    background: var(--el-fill-color-light);
    border-radius: 10px;
    transition: all 0.3s ease;

    &:hover {
      background: var(--el-fill-color);
    }

    &.is-top3 {
      background: linear-gradient(
        135deg,
        rgb(251 191 36 / 10%) 0%,
        rgb(245 158 11 / 5%) 100%
      );
    }

    .rank {
      width: 32px;
      text-align: center;

      .rank-medal {
        font-size: 20px;
      }

      .rank-number {
        font-size: 14px;
        font-weight: 600;
        color: var(--el-text-color-secondary);
      }
    }

    .user-info {
      flex: 1;
      margin-left: 10px;

      .username {
        font-size: 14px;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }
    }

    .score {
      font-size: 14px;
      font-weight: 600;
      color: var(--el-color-primary);
    }
  }
}

:deep(.el-card__header) {
  border-radius: 16px 16px 0 0;
}

:deep(.el-card__body) {
  padding: 16px;
}

:deep(.header-card .el-card__body) {
  padding: 24px;
}

@media (max-width: 768px) {
  .main {
    padding: 8px;
  }

  .main .header-card .header-content,
  .main .box-card .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .main .header-card .header-stats {
    width: 100%;
    gap: 16px;
    justify-content: space-between;
  }

  .main .overview-cards {
    margin-bottom: 12px;
  }

  .main .overview-cards .overview-card {
    margin-bottom: 12px;
  }

  .mobile-event-card__body {
    grid-template-columns: 1fr;
  }

  .bottom-row .rankings-card .rankings-list {
    min-height: 220px;
    max-height: none;
  }
}
</style>
