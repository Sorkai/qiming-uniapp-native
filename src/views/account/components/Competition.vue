<template>
  <div class="competition" :class="currentTheme">
    <!-- 顶部横幅 -->
    <div class="competition-banner">
      <div class="banner-content">
        <div class="banner-left">
          <h2>
            <CompetitionIcon
              style="
                width: 28px;
                height: 28px;
                margin-right: 8px;
                vertical-align: middle;
              "
            />
            赛事场
          </h2>
          <p>在线编程挑战、题库训练、作文批改，全方位提升你的能力！</p>
        </div>
        <div class="banner-right">
          <div class="user-rank">
            <div class="rank-icon">🥇</div>
            <div class="rank-info">
              <span class="rank-label">当前排名</span>
              <span class="rank-value">#{{ userRank }}</span>
            </div>
          </div>
          <div class="user-points">
            <div class="points-icon">⭐</div>
            <div class="points-info">
              <span class="points-label">积分</span>
              <span class="points-value">{{ userPoints }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 功能模块网格 -->
    <div class="modules-grid">
      <!-- 在线 OJ -->
      <div class="module-card oj-card" @click="goToModule('oj')">
        <div class="card-icon">
          <img :src="onlineOjJudgementIcon" alt="在线 OJ 图标" />
        </div>
        <div class="card-content">
          <h3>在线 OJ</h3>
          <p>算法编程在线评测，实时反馈结果</p>
          <div class="card-stats">
            <span
              ><strong>{{ ojStats.total }}</strong> 道题目</span
            >
            <span
              ><strong>{{ ojStats.solved }}</strong> 已通过</span
            >
          </div>
        </div>
        <div class="card-action">
          <el-button type="primary" round>开始刷题</el-button>
        </div>
      </div>

      <!-- 在线题库训练 -->
      <div class="module-card training-card" @click="goToModule('training')">
        <div class="card-icon">
          <img :src="trainSetsIcon" alt="题库训练集图标" />
        </div>
        <div class="card-content">
          <h3>题库训练集</h3>
          <p>海量题目分类训练，巩固知识点</p>
          <div class="card-stats">
            <span
              ><strong>{{ trainingStats.categories }}</strong> 个分类</span
            >
            <span
              ><strong>{{ trainingStats.questions }}</strong> 道题目</span
            >
          </div>
        </div>
        <div class="card-action">
          <el-button type="success" round>进入训练</el-button>
        </div>
      </div>

      <!-- 作文批改 -->
      <div class="module-card essay-card" @click="goToModule('essay')">
        <div class="card-icon">
          <img :src="writingCorrectIcon" alt="作文批改检测图标" />
        </div>
        <div class="card-content">
          <h3>作文批改检测</h3>
          <p>AI 智能批改中英文作文，提升写作能力</p>
          <div class="card-stats">
            <span>支持 <strong>中文</strong> / <strong>英文</strong></span>
          </div>
        </div>
        <div class="card-action">
          <el-button type="warning" round>开始批改</el-button>
        </div>
      </div>

      <!-- 国家安全知识竞赛 -->
      <div class="module-card security-card" @click="goToModule('security')">
        <div class="card-icon">
          <img :src="encryptedKnowledgeIcon" alt="国家安全知识竞赛图标" />
        </div>
        <div class="card-content">
          <h3>国家安全知识竞赛</h3>
          <p>学习国家安全知识，参与在线竞赛</p>
          <div class="card-stats">
            <span
              ><strong>{{ securityStats.participants }}</strong> 人参与</span
            >
          </div>
        </div>
        <div class="card-action">
          <el-button type="danger" round>参与竞赛</el-button>
        </div>
      </div>
    </div>

    <!-- 活动赛事区域 -->
    <div class="events-section">
      <div class="section-header">
        <h3>🔥 热门赛事</h3>
        <el-button text type="primary">查看全部</el-button>
      </div>
      <div class="events-list">
        <div
          v-for="event in hotEvents"
          :key="event.id"
          class="event-card"
          :class="{ 'is-ongoing': event.status === 'ongoing' }"
        >
          <div class="event-status">
            <el-tag :type="getEventStatusType(event.status)" size="small">
              {{ getEventStatusLabel(event.status) }}
            </el-tag>
          </div>
          <div class="event-info">
            <h4>{{ event.title }}</h4>
            <p>{{ event.description }}</p>
            <div class="event-meta">
              <span class="time">
                <el-icon><Clock /></el-icon>
                {{ event.time }}
              </span>
              <span class="participants">
                <el-icon><User /></el-icon>
                {{ event.participants }} 人报名
              </span>
            </div>
          </div>
          <div class="event-action">
            <el-button
              :type="event.status === 'upcoming' ? 'primary' : 'default'"
              :disabled="event.status === 'ended'"
              size="small"
            >
              {{
                event.status === "upcoming"
                  ? "立即报名"
                  : event.status === "ongoing"
                    ? "进入比赛"
                    : "已结束"
              }}
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 排行榜区域 -->
    <div class="leaderboard-section">
      <div class="section-header">
        <h3>🏅 积分排行榜</h3>
        <el-radio-group v-model="leaderboardType" size="small">
          <el-radio-button value="weekly">本周</el-radio-button>
          <el-radio-button value="monthly">本月</el-radio-button>
          <el-radio-button value="total">总榜</el-radio-button>
        </el-radio-group>
      </div>
      <div class="leaderboard-list">
        <div
          v-for="(user, index) in leaderboard"
          :key="user.id"
          class="leaderboard-item"
          :class="{ 'is-top3': index < 3 }"
        >
          <div class="rank">
            <span v-if="index < 3" class="rank-medal">{{
              ["🥇", "🥈", "🥉"][index]
            }}</span>
            <span v-else class="rank-number">{{ index + 1 }}</span>
          </div>
          <el-avatar :size="40" :src="formatAvatar(user.avatar)" />
          <div class="user-info">
            <span class="username">{{ user.username }}</span>
            <span class="solved">{{ user.solved }} 题</span>
          </div>
          <div class="points">{{ user.points }} 分</div>
        </div>
      </div>
    </div>

    <!-- OJ 模态框 -->
    <el-dialog
      v-model="ojDialogVisible"
      title="在线 OJ"
      width="90%"
      class="oj-dialog"
    >
      <div class="oj-content">
        <!-- 题目分类筛选 -->
        <div class="oj-filters">
          <el-select v-model="ojFilter.difficulty" placeholder="难度" clearable>
            <el-option label="简单" value="easy" />
            <el-option label="中等" value="medium" />
            <el-option label="困难" value="hard" />
          </el-select>
          <el-select v-model="ojFilter.category" placeholder="分类" clearable>
            <el-option label="数组" value="array" />
            <el-option label="字符串" value="string" />
            <el-option label="动态规划" value="dp" />
            <el-option label="树" value="tree" />
            <el-option label="图" value="graph" />
          </el-select>
          <el-input
            v-model="ojFilter.keyword"
            placeholder="搜索题目..."
            clearable
            style="width: 200px"
          />
        </div>
        <!-- 题目列表 -->
        <el-table :data="ojProblems" stripe style="width: 100%">
          <el-table-column type="index" width="60" label="#" />
          <el-table-column prop="title" label="题目" />
          <el-table-column prop="difficulty" label="难度" width="100">
            <template #default="{ row }">
              <el-tag :type="getDifficultyType(row.difficulty)" size="small">
                {{ getDifficultyLabel(row.difficulty) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="acceptance" label="通过率" width="100" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-icon v-if="row.status === 'solved'" class="solved-icon"
                ><CircleCheck
              /></el-icon>
              <el-icon
                v-else-if="row.status === 'attempted'"
                class="attempted-icon"
                ><Warning
              /></el-icon>
              <span v-else>-</span>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default>
              <el-button type="primary" size="small" text>开始</el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-dialog>

    <!-- 题库训练模态框 -->
    <el-dialog v-model="trainingDialogVisible" title="题库训练集" width="80%">
      <div class="training-content">
        <div class="training-categories">
          <div
            v-for="category in trainingCategories"
            :key="category.id"
            class="category-card"
            @click="selectCategory(category)"
          >
            <div class="category-icon">{{ category.icon }}</div>
            <div class="category-info">
              <h4>{{ category.name }}</h4>
              <p>{{ category.count }} 道题目</p>
            </div>
            <el-progress
              :percentage="category.progress"
              :stroke-width="6"
              :show-text="false"
            />
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 作文批改模态框 -->
    <el-dialog v-model="essayDialogVisible" title="作文批改检测" width="80%">
      <div class="essay-content">
        <div class="essay-type-selector">
          <el-radio-group v-model="essayType" size="large">
            <el-radio-button value="chinese">中文作文</el-radio-button>
            <el-radio-button value="english">英文作文</el-radio-button>
          </el-radio-group>
        </div>
        <el-input
          v-model="essayContent"
          type="textarea"
          :rows="12"
          :placeholder="
            essayType === 'chinese'
              ? '请输入中文作文内容...'
              : 'Please enter your English essay...'
          "
        />
        <div class="essay-actions">
          <el-button
            type="primary"
            size="large"
            :loading="essayAnalyzing"
            @click="analyzeEssay"
          >
            {{ essayAnalyzing ? "AI 分析中..." : "开始批改" }}
          </el-button>
        </div>
        <div v-if="essayResult" class="essay-result">
          <h4>批改结果</h4>
          <div class="result-score">
            <div class="score-circle">
              <span class="score-value">{{ essayResult.score }}</span>
              <span class="score-label">分</span>
            </div>
          </div>
          <div class="result-details">
            <div class="detail-item">
              <span class="label">内容评价：</span>
              <span class="value">{{ essayResult.content }}</span>
            </div>
            <div class="detail-item">
              <span class="label">结构评价：</span>
              <span class="value">{{ essayResult.structure }}</span>
            </div>
            <div class="detail-item">
              <span class="label">语言评价：</span>
              <span class="value">{{ essayResult.language }}</span>
            </div>
            <div class="detail-item">
              <span class="label">改进建议：</span>
              <span class="value">{{ essayResult.suggestions }}</span>
            </div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 国家安全竞赛模态框 -->
    <el-dialog
      v-model="securityDialogVisible"
      title="国家安全知识竞赛"
      width="70%"
    >
      <div class="security-content">
        <div v-if="!securityQuizStarted" class="security-intro">
          <div class="intro-icon">🛡️</div>
          <h3>国家安全教育知识竞赛</h3>
          <p>
            测试你对国家安全知识的了解程度，每次竞赛 10 道题目，限时 10 分钟
          </p>
          <div class="intro-stats">
            <div class="stat">
              <span class="value">10</span>
              <span class="label">题目数量</span>
            </div>
            <div class="stat">
              <span class="value">10</span>
              <span class="label">分钟限时</span>
            </div>
            <div class="stat">
              <span class="value">100</span>
              <span class="label">满分</span>
            </div>
          </div>
          <el-button type="primary" size="large" @click="startSecurityQuiz"
            >开始答题</el-button
          >
        </div>
        <div v-else class="security-quiz">
          <div class="quiz-header">
            <span class="question-num"
              >第 {{ currentQuestionIndex + 1 }} / 10 题</span
            >
            <span class="timer">
              <el-icon><Clock /></el-icon>
              {{ formatTime(remainingTime) }}
            </span>
          </div>
          <div class="quiz-question">
            <h4>{{ currentQuestion.question }}</h4>
            <el-radio-group v-model="selectedAnswer" class="options">
              <el-radio
                v-for="(option, idx) in currentQuestion.options"
                :key="idx"
                :value="idx"
                class="option-item"
              >
                {{ option }}
              </el-radio>
            </el-radio-group>
          </div>
          <div class="quiz-actions">
            <el-button
              type="primary"
              :disabled="selectedAnswer === null"
              @click="nextQuestion"
            >
              {{ currentQuestionIndex === 9 ? "提交答案" : "下一题" }}
            </el-button>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { formatAvatar } from "@/utils/avatar";
import { Clock, User, CircleCheck, Warning } from "@element-plus/icons-vue";
import { ElMessage } from "element-plus";
import CompetitionIcon from "@/new student interface icons/trophy-prize-medal-3-svgrepo-com.svg?component";
import onlineOjJudgementIcon from "@/assets/comoprtitionarena/onlineojjudgement.svg?url";
import trainSetsIcon from "@/assets/comoprtitionarena/trainsets.svg?url";
import writingCorrectIcon from "@/assets/comoprtitionarena/writingcorrect.svg?url";
import encryptedKnowledgeIcon from "@/assets/comoprtitionarena/encryptedknowledge.svg?url";

defineProps<{
  currentTheme?: string;
}>();

const userRank = ref(128);
const userPoints = ref(2580);

const ojStats = ref({ total: 500, solved: 45 });
const trainingStats = ref({ categories: 12, questions: 3000 });
const securityStats = ref({ participants: 1580 });

const leaderboardType = ref("weekly");

const hotEvents = ref([
  {
    id: 1,
    title: "2024 春季算法挑战赛",
    description: "参与编程挑战，赢取丰厚奖品",
    time: "2024-03-15 14:00",
    participants: 256,
    status: "upcoming"
  },
  {
    id: 2,
    title: "国家安全知识网络竞赛",
    description: "全民国家安全教育日专题活动",
    time: "进行中",
    participants: 1024,
    status: "ongoing"
  },
  {
    id: 3,
    title: "英语写作大赛",
    description: "展示你的英语写作能力",
    time: "2024-02-28",
    participants: 512,
    status: "ended"
  }
]);

const leaderboard = ref([
  { id: 1, username: "算法大神", avatar: "", solved: 320, points: 9800 },
  { id: 2, username: "代码狂人", avatar: "", solved: 285, points: 8500 },
  { id: 3, username: "编程小王子", avatar: "", solved: 260, points: 7800 },
  { id: 4, username: "刷题达人", avatar: "", solved: 230, points: 6900 },
  { id: 5, username: "技术新星", avatar: "", solved: 200, points: 6000 }
]);

// OJ 相关
const ojDialogVisible = ref(false);
const ojFilter = ref({ difficulty: "", category: "", keyword: "" });
const ojProblems = ref([
  {
    id: 1,
    title: "两数之和",
    difficulty: "easy",
    acceptance: "45.2%",
    status: "solved"
  },
  {
    id: 2,
    title: "无重复字符的最长子串",
    difficulty: "medium",
    acceptance: "32.1%",
    status: "attempted"
  },
  {
    id: 3,
    title: "寻找两个正序数组的中位数",
    difficulty: "hard",
    acceptance: "18.5%",
    status: ""
  },
  {
    id: 4,
    title: "最长回文子串",
    difficulty: "medium",
    acceptance: "28.7%",
    status: ""
  },
  {
    id: 5,
    title: "正则表达式匹配",
    difficulty: "hard",
    acceptance: "22.3%",
    status: ""
  }
]);

// 训练相关
const trainingDialogVisible = ref(false);
const trainingCategories = ref([
  { id: 1, name: "数据结构", icon: "📊", count: 150, progress: 35 },
  { id: 2, name: "算法基础", icon: "🧮", count: 200, progress: 20 },
  { id: 3, name: "数据库", icon: "🗄️", count: 100, progress: 60 },
  { id: 4, name: "操作系统", icon: "💻", count: 80, progress: 15 },
  { id: 5, name: "计算机网络", icon: "🌐", count: 120, progress: 40 },
  { id: 6, name: "设计模式", icon: "🎨", count: 50, progress: 80 }
]);

// 作文批改相关
const essayDialogVisible = ref(false);
const essayType = ref("chinese");
const essayContent = ref("");
const essayAnalyzing = ref(false);
const essayResult = ref<{
  score: number;
  content: string;
  structure: string;
  language: string;
  suggestions: string;
} | null>(null);

// 国家安全竞赛相关
const securityDialogVisible = ref(false);
const securityQuizStarted = ref(false);
const currentQuestionIndex = ref(0);
const selectedAnswer = ref<number | null>(null);
const remainingTime = ref(600);
const securityQuestions = ref([
  {
    question: "《中华人民共和国国家安全法》是哪一年颁布实施的？",
    options: ["2014年", "2015年", "2016年", "2017年"],
    answer: 1
  },
  {
    question: "全民国家安全教育日是每年的哪一天？",
    options: ["4月1日", "4月15日", "5月1日", "5月15日"],
    answer: 1
  },
  {
    question: "以下哪项不属于国家安全的范畴？",
    options: ["政治安全", "军事安全", "个人隐私", "文化安全"],
    answer: 2
  }
]);

const currentQuestion = ref(securityQuestions.value[0]);

const getEventStatusType = (status: string) => {
  const types: Record<
    string,
    "success" | "primary" | "info" | "warning" | "danger"
  > = {
    upcoming: "primary",
    ongoing: "success",
    ended: "info"
  };
  return types[status] || "info";
};

const getEventStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    upcoming: "即将开始",
    ongoing: "进行中",
    ended: "已结束"
  };
  return labels[status] || status;
};

const getDifficultyType = (difficulty: string) => {
  const types: Record<string, "success" | "warning" | "danger"> = {
    easy: "success",
    medium: "warning",
    hard: "danger"
  };
  return types[difficulty] || "info";
};

const getDifficultyLabel = (difficulty: string) => {
  const labels: Record<string, string> = {
    easy: "简单",
    medium: "中等",
    hard: "困难"
  };
  return labels[difficulty] || difficulty;
};

const goToModule = (module: string) => {
  switch (module) {
    case "oj":
      ojDialogVisible.value = true;
      break;
    case "training":
      trainingDialogVisible.value = true;
      break;
    case "essay":
      essayDialogVisible.value = true;
      break;
    case "security":
      securityDialogVisible.value = true;
      break;
  }
};

const selectCategory = (category: { id: number; name: string }) => {
  ElMessage.info(`进入 ${category.name} 训练模块`);
};

const analyzeEssay = async () => {
  if (!essayContent.value.trim()) {
    ElMessage.warning("请先输入作文内容");
    return;
  }
  essayAnalyzing.value = true;
  // 模拟 AI 分析
  await new Promise(resolve => setTimeout(resolve, 2000));
  essayResult.value = {
    score: 85,
    content: "内容充实，主题明确，论据充分",
    structure: "结构完整，层次分明，过渡自然",
    language: "语言流畅，用词准确，表达清晰",
    suggestions: "建议在结尾部分加强总结，可以引用一些名人名言增强说服力"
  };
  essayAnalyzing.value = false;
};

const startSecurityQuiz = () => {
  securityQuizStarted.value = true;
  currentQuestionIndex.value = 0;
  selectedAnswer.value = null;
  remainingTime.value = 600;
  currentQuestion.value = securityQuestions.value[0];
};

const nextQuestion = () => {
  if (currentQuestionIndex.value < 9) {
    currentQuestionIndex.value++;
    selectedAnswer.value = null;
    if (currentQuestionIndex.value < securityQuestions.value.length) {
      currentQuestion.value =
        securityQuestions.value[currentQuestionIndex.value];
    }
  } else {
    ElMessage.success("答题完成！");
    securityQuizStarted.value = false;
    securityDialogVisible.value = false;
  }
};

const formatTime = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};
</script>

<style lang="scss" scoped>
.competition {
  .competition-banner {
    overflow: hidden;
    padding: 28px 32px;
    margin-bottom: 24px;
    background: linear-gradient(135deg, #fcd9b6 0%, #f9a8d4 100%);
    border-radius: 16px;
    box-shadow: 0 4px 16px rgb(0 0 0 / 12%);

    .dark & {
      background: linear-gradient(135deg, #92400e 0%, #831843 100%);
      box-shadow: 0 4px 16px rgb(0 0 0 / 40%);
    }

    .banner-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }

    .banner-left {
      flex: 1;
      min-width: 0;

      h2 {
        display: flex;
        align-items: center;
        margin: 0 0 8px;
        font-size: 28px;
        font-weight: 700;
        line-height: 1.2;
        color: #1f2937;
      }

      p {
        margin: 0;
        font-size: 14px;
        line-height: 1.8;
        color: #4b5563;
      }
    }

    .banner-right {
      display: flex;
      flex-shrink: 0;
      gap: 32px;

      .user-rank,
      .user-points {
        display: flex;
        gap: 12px;
        align-items: center;
        padding: 12px 20px;
        background: rgb(255 255 255 / 50%);
        border-radius: 12px;
        box-shadow: none;
        min-width: 0;

        .rank-icon,
        .points-icon {
          font-size: 32px;
        }

        .rank-info,
        .points-info {
          display: flex;
          flex-direction: column;
          min-width: 0;

          .rank-label,
          .points-label {
            font-size: 12px;
            color: #6b7280;
          }

          .rank-value,
          .points-value {
            font-size: 20px;
            font-weight: 700;
            color: #1f2937;
          }
        }
      }
    }
  }

  .modules-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 32px;
  }

  .module-card {
    display: flex;
    gap: 20px;
    align-items: center;
    padding: 24px;
    cursor: pointer;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgb(0 0 0 / 6%);
    transition: all 0.3s ease;

    .dark & {
      background: #1e293b;
      box-shadow: 0 4px 20px rgb(0 0 0 / 30%);
    }

    &:hover {
      box-shadow: 0 8px 32px rgb(0 0 0 / 12%);
      transform: translateY(-4px);

      .dark & {
        box-shadow: 0 8px 32px rgb(0 0 0 / 50%);
      }
    }

    .card-icon {
      display: flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      width: 64px;
      height: 64px;
      font-size: 32px;
      background: #f3f4f6;
      border-radius: 16px;

      img {
        width: 40px;
        height: 40px;
        object-fit: contain;
      }

      .dark & {
        background: #334155;
      }
    }

    .card-content {
      flex: 1;
      min-width: 0;

      h3 {
        margin: 0 0 6px;
        font-size: 18px;
        font-weight: 600;
        color: #333;

        .dark & {
          color: #f1f5f9;
        }
      }

      p {
        margin: 0 0 8px;
        font-size: 13px;
        line-height: 1.7;
        color: #666;

        .dark & {
          color: #94a3b8;
        }
      }

      .card-stats {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: #999;

        .dark & {
          color: #64748b;
        }

        strong {
          color: #333;

          .dark & {
            color: #e2e8f0;
          }
        }
      }
    }

    .card-action {
      flex-shrink: 0;

      :deep(.el-button) {
        box-shadow: none !important;
      }
    }

    &.oj-card .card-icon {
      background: linear-gradient(135deg, #b6d5f6, #9dc5ef);

      .dark & {
        background: linear-gradient(135deg, #2c467f, #2b4f9b);
      }
    }

    &.training-card .card-icon {
      background: linear-gradient(135deg, #d3c9f7, #c2b6f1);

      .dark & {
        background: linear-gradient(135deg, #53338d, #58409a);
      }
    }

    &.essay-card .card-icon {
      background: linear-gradient(135deg, #f3db92, #edcd76);

      .dark & {
        background: linear-gradient(135deg, #734526, #7f4b1e);
      }
    }

    &.security-card .card-icon {
      background: linear-gradient(135deg, #a9e2cc, #8dd9b8);

      .dark & {
        background: linear-gradient(135deg, #1f5848, #1d614f);
      }
    }
  }

  .events-section,
  .leaderboard-section {
    padding: 24px;
    margin-bottom: 24px;
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 4px 20px rgb(0 0 0 / 6%);

    .dark & {
      background: #1e293b;
      box-shadow: 0 4px 20px rgb(0 0 0 / 30%);
    }

    .section-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;

      h3 {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: #333;

        .dark & {
          color: #f1f5f9;
        }
      }
    }
  }

  .events-list {
    display: flex;
    flex-direction: column;
    gap: 16px;

    .event-card {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 16px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      transition: all 0.3s ease;

      .dark & {
        background: #0f172a;
        border-color: #334155;
      }

      &:hover {
        background: #f3f4f6;
        border-color: #d1d5db;

        .dark & {
          background: #1e293b;
          border-color: #475569;
        }
      }

      &.is-ongoing {
        background: linear-gradient(
          135deg,
          rgb(16 185 129 / 5%),
          rgb(16 185 129 / 10%)
        );
        border-color: #10b981;
      }

      .event-status {
        flex-shrink: 0;
      }

      .event-info {
        flex: 1;
        min-width: 0;

        h4 {
          margin: 0 0 4px;
          font-size: 15px;
          font-weight: 600;
          line-height: 1.5;
          color: #333;

          .dark & {
            color: #f1f5f9;
          }
        }

        p {
          margin: 0 0 8px;
          font-size: 13px;
          line-height: 1.7;
          color: #666;

          .dark & {
            color: #94a3b8;
          }
        }

        .event-meta {
          display: flex;
          gap: 20px;
          font-size: 12px;
          color: #999;

          .dark & {
            color: #64748b;
          }

          span {
            display: flex;
            gap: 4px;
            align-items: center;
          }
        }
      }

      .event-action {
        flex-shrink: 0;

        :deep(.el-button) {
          box-shadow: none !important;
        }
      }
    }
  }

  .leaderboard-list {
    .leaderboard-item {
      display: flex;
      gap: 16px;
      align-items: center;
      padding: 12px 16px;
      border-radius: 8px;
      transition: background 0.2s;

      &:hover {
        background: #f9fafb;

        .dark & {
          background: #0f172a;
        }
      }

      &.is-top3 {
        background: linear-gradient(90deg, rgb(245 158 11 / 10%), transparent);
      }

      .rank {
        width: 40px;
        text-align: center;

        .rank-medal {
          font-size: 24px;
        }

        .rank-number {
          font-size: 16px;
          font-weight: 600;
          color: #666;

          .dark & {
            color: #94a3b8;
          }
        }
      }

      .user-info {
        display: flex;
        flex: 1;
        flex-direction: column;
        min-width: 0;

        .username {
          overflow: hidden;
          font-size: 14px;
          font-weight: 600;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #333;

          .dark & {
            color: #f1f5f9;
          }
        }

        .solved {
          font-size: 12px;
          color: #999;

          .dark & {
            color: #64748b;
          }
        }
      }

      .points {
        flex-shrink: 0;
        font-size: 16px;
        font-weight: 700;
        color: #f59e0b;
      }
    }
  }
}

// OJ 弹窗样式
.oj-content {
  .oj-filters {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-bottom: 20px;

    > * {
      flex: 1 1 180px;
      min-width: 0;
    }
  }

  .solved-icon {
    font-size: 18px;
    color: #10b981;
  }

  .attempted-icon {
    font-size: 18px;
    color: #f59e0b;
  }
}

// 训练弹窗样式
.training-content {
  .training-categories {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;

    .category-card {
      padding: 20px;
      cursor: pointer;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      transition: all 0.3s ease;

      .dark & {
        background: #0f172a;
        border-color: #334155;
      }

      &:hover {
        background: #f3f4f6;
        border-color: #d1d5db;
        transform: translateY(-2px);

        .dark & {
          background: #1e293b;
          border-color: #475569;
        }
      }

      .category-icon {
        margin-bottom: 12px;
        font-size: 32px;
      }

      .category-info {
        margin-bottom: 12px;

        h4 {
          margin: 0 0 4px;
          font-size: 16px;
          font-weight: 600;
          color: #333;

          .dark & {
            color: #f1f5f9;
          }
        }

        p {
          margin: 0;
          font-size: 12px;
          color: #999;

          .dark & {
            color: #94a3b8;
          }
        }
      }
    }
  }
}

// 作文批改样式
.essay-content {
  .essay-type-selector {
    margin-bottom: 20px;
    text-align: center;

    :deep(.el-radio-group) {
      box-shadow: none;
    }

    :deep(.el-radio-button__inner) {
      box-shadow: none !important;
    }
  }

  .essay-actions {
    margin-top: 20px;
    text-align: center;

    :deep(.el-button) {
      box-shadow: none !important;
    }
  }

  .essay-result {
    padding: 20px;
    margin-top: 24px;
    background: #f9fafb;
    border-radius: 12px;

    .dark & {
      background: #0f172a;
    }

    h4 {
      margin: 0 0 16px;
      font-size: 16px;
      font-weight: 600;
      color: #333;

      .dark & {
        color: #f1f5f9;
      }
    }

    .result-score {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;

      .score-circle {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        width: 100px;
        height: 100px;
        background: linear-gradient(135deg, #10b981, #059669);
        border-radius: 50%;

        .score-value {
          font-size: 36px;
          font-weight: 700;
          color: #fff;
        }

        .score-label {
          font-size: 14px;
          color: rgb(255 255 255 / 80%);
        }
      }
    }

    .result-details {
      .detail-item {
        padding: 12px 0;
        border-bottom: 1px solid #e5e7eb;

        .dark & {
          border-color: #334155;
        }

        &:last-child {
          border-bottom: none;
        }

        .label {
          font-weight: 600;
          color: #333;

          .dark & {
            color: #e2e8f0;
          }
        }

        .value {
          color: #666;

          .dark & {
            color: #94a3b8;
          }
        }
      }
    }
  }
}

// 国家安全竞赛样式
.security-content {
  .security-intro {
    padding: 40px;
    text-align: center;

    .intro-icon {
      margin-bottom: 20px;
      font-size: 64px;
    }

    h3 {
      margin: 0 0 12px;
      font-size: 24px;
      font-weight: 600;
      color: #333;

      .dark & {
        color: #f1f5f9;
      }
    }

    p {
      margin: 0 0 24px;
      font-size: 14px;
      color: #666;

      .dark & {
        color: #94a3b8;
      }
    }

    .intro-stats {
      display: flex;
      gap: 48px;
      justify-content: center;
      margin-bottom: 32px;

      .stat {
        text-align: center;

        .value {
          display: block;
          font-size: 32px;
          font-weight: 700;
          color: #ef4444;
        }

        .label {
          font-size: 12px;
          color: #999;

          .dark & {
            color: #64748b;
          }
        }
      }
    }
  }

  .security-quiz {
    .quiz-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 16px;
      margin-bottom: 24px;
      background: #f3f4f6;
      border-radius: 8px;

      .dark & {
        background: #1e293b;
      }

      .question-num {
        font-size: 14px;
        font-weight: 600;
        color: #333;

        .dark & {
          color: #f1f5f9;
        }
      }

      .timer {
        display: flex;
        gap: 6px;
        align-items: center;
        font-size: 18px;
        font-weight: 600;
        color: #ef4444;
      }
    }

    .quiz-question {
      padding: 24px;

      h4 {
        margin: 0 0 24px;
        font-size: 18px;
        font-weight: 600;
        line-height: 1.6;
        color: #333;

        .dark & {
          color: #f1f5f9;
        }
      }

      .options {
        display: flex;
        flex-direction: column;
        gap: 12px;

        .option-item {
          padding: 16px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          transition: all 0.2s;

          .dark & {
            color: #f1f5f9;
            background: #0f172a;
            border-color: #334155;

            &:hover {
              background: #1e293b;
              border-color: #475569;
            }

            :deep(.el-radio__label) {
              color: #f1f5f9;
            }
          }

          &:hover {
            background: #f3f4f6;
            border-color: #d1d5db;
          }
        }
      }
    }

    .quiz-actions {
      padding: 24px;
      text-align: center;

      :deep(.el-button) {
        box-shadow: none !important;
      }
    }
  }
}

@media (width <= 767px) {
  .competition {
    .competition-banner {
      padding: 22px 20px;
      margin-bottom: 18px;
      border-radius: 20px;

      .banner-content {
        align-items: stretch;
        flex-direction: column;
        gap: 18px;
      }

      .banner-left {
        h2 {
          font-size: 24px;
        }

        p {
          font-size: 15px;
        }
      }

      .banner-right {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 12px;

        .user-rank,
        .user-points {
          gap: 10px;
          padding: 14px 16px;
          border-radius: 16px;

          .rank-icon,
          .points-icon {
            font-size: 28px;
          }

          .rank-info,
          .points-info {
            .rank-value,
            .points-value {
              font-size: 24px;
            }
          }
        }
      }
    }

    .modules-grid {
      grid-template-columns: 1fr;
      gap: 14px;
      margin-bottom: 20px;
    }

    .module-card {
      align-items: stretch;
      flex-direction: column;
      gap: 14px;
      padding: 18px;
      border-radius: 18px;

      &:hover {
        transform: none;
      }

      .card-icon {
        width: 56px;
        height: 56px;
        border-radius: 14px;

        img {
          width: 34px;
          height: 34px;
        }
      }

      .card-content {
        h3 {
          font-size: 17px;
        }

        p {
          font-size: 14px;
        }

        .card-stats {
          flex-wrap: wrap;
          gap: 8px 14px;
          font-size: 13px;
          line-height: 1.6;
        }
      }

      .card-action {
        width: 100%;

        :deep(.el-button) {
          width: 100%;
          min-height: 44px;
        }
      }
    }

    .events-section,
    .leaderboard-section {
      padding: 20px;
      margin-bottom: 18px;
      border-radius: 20px;

      .section-header {
        align-items: stretch;
        flex-direction: column;
        gap: 14px;
        margin-bottom: 16px;

        h3 {
          font-size: 17px;
        }
      }
    }

    .events-list {
      gap: 12px;

      .event-card {
        align-items: stretch;
        flex-direction: column;
        gap: 12px;
        padding: 16px;

        .event-info {
          h4 {
            font-size: 16px;
          }

          p {
            font-size: 14px;
          }

          .event-meta {
            flex-wrap: wrap;
            gap: 8px 14px;
            font-size: 13px;
          }
        }

        .event-action {
          width: 100%;

          :deep(.el-button) {
            width: 100%;
            min-height: 40px;
          }
        }
      }
    }

    .leaderboard-section {
      .section-header {
        :deep(.el-radio-group) {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          width: 100%;
          box-shadow: none;
        }

        :deep(.el-radio-button) {
          width: 100%;
        }

        :deep(.el-radio-button__inner) {
          width: 100%;
          min-width: 0;
          box-shadow: none !important;
        }
      }
    }

    .leaderboard-list {
      .leaderboard-item {
        display: grid;
        grid-template-columns: auto auto minmax(0, 1fr);
        grid-template-areas:
          "rank avatar user"
          "rank avatar points";
        gap: 4px 10px;
        align-items: center;
        padding: 14px 12px;

        .rank {
          grid-area: rank;
          width: 28px;

          .rank-medal {
            font-size: 20px;
          }

          .rank-number {
            font-size: 15px;
          }
        }

        :deep(.el-avatar) {
          grid-area: avatar;
        }

        .user-info {
          grid-area: user;
        }

        .points {
          grid-area: points;
          justify-self: start;
          font-size: 15px;
        }
      }
    }
  }

  .oj-content {
    .oj-filters {
      flex-direction: column;
      gap: 10px;

      > * {
        flex: none;
        width: 100%;
      }
    }
  }

  .training-content {
    .training-categories {
      grid-template-columns: 1fr;
      gap: 12px;

      .category-card {
        padding: 16px;

        &:hover {
          transform: none;
        }
      }
    }
  }

  .essay-content {
    .essay-type-selector {
      text-align: left;

      :deep(.el-radio-group) {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        width: 100%;
      }

      :deep(.el-radio-button) {
        width: 100%;
      }

      :deep(.el-radio-button__inner) {
        width: 100%;
        min-width: 0;
      }
    }

    .essay-actions {
      :deep(.el-button) {
        width: 100%;
        min-height: 44px;
      }
    }

    .essay-result {
      padding: 18px 16px;

      .result-score {
        .score-circle {
          width: 88px;
          height: 88px;

          .score-value {
            font-size: 30px;
          }
        }
      }

      .result-details {
        .detail-item {
          line-height: 1.7;
        }
      }
    }
  }

  .security-content {
    .security-intro {
      padding: 16px 0 8px;

      .intro-icon {
        margin-bottom: 16px;
        font-size: 54px;
      }

      h3 {
        font-size: 22px;
      }

      p {
        line-height: 1.8;
      }

      .intro-stats {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 12px;
        margin-bottom: 24px;
      }

      :deep(.el-button) {
        width: 100%;
        min-height: 44px;
        box-shadow: none !important;
      }
    }

    .security-quiz {
      .quiz-header {
        align-items: flex-start;
        flex-direction: column;
        gap: 8px;
        padding: 14px;
        margin-bottom: 16px;
      }

      .quiz-question {
        padding: 8px 0 0;

        h4 {
          margin-bottom: 16px;
          font-size: 17px;
        }

        .options {
          .option-item {
            padding: 14px 12px;
          }
        }
      }

      .quiz-actions {
        padding: 18px 0 0;

        :deep(.el-button) {
          width: 100%;
          min-height: 44px;
        }
      }
    }
  }

  :deep(.el-dialog) {
    width: calc(100vw - 24px) !important;
    margin-top: 6vh !important;
  }

  :deep(.el-dialog__body) {
    padding: 16px !important;
  }
}
</style>
