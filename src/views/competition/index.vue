<template>
  <div class="main">
    <el-card class="box-card header-card">
      <div class="header-content">
        <div class="header-left">
          <h2>赛事管理</h2>
          <p>管理在线编程竞赛、题库训练与作文批改等赛事活动</p>
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

    <!-- 大屏概览统计卡片 -->
    <el-row :gutter="20" class="overview-cards">
      <el-col :span="6">
        <el-card class="overview-card coding-card" shadow="always">
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
              <span class="trend-up">在线编程判题系统</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card quiz-card" shadow="always">
          <div class="card-bg-icon">🥇</div>
          <div class="card-content">
            <div class="card-header">
              <span class="card-icon">🥇</span>
              <span class="card-title">知识竞赛</span>
            </div>
            <div class="card-stats">
              <div class="stat-main">
                <span class="stat-number">{{ trainingStats.questions }}</span>
                <span class="stat-unit">道题目</span>
              </div>
              <div class="stat-sub">
                <span class="stat-label">题库分类</span>
                <span class="stat-value">{{ trainingStats.categories }}</span>
              </div>
            </div>
            <div class="card-footer">
              <span class="trend-up">题库训练与竞赛</span>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="overview-card essay-card" shadow="always">
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
      <el-col :span="6">
        <el-card class="overview-card comprehensive-card" shadow="always">
          <div class="card-bg-icon">🏆</div>
          <div class="card-content">
            <div class="card-header">
              <span class="card-icon">🏆</span>
              <span class="card-title">综合竞赛</span>
            </div>
            <div class="card-stats">
              <div class="stat-main">
                <span class="stat-number">{{
                  comprehensiveStats.totalEvents
                }}</span>
                <span class="stat-unit">场赛事</span>
              </div>
              <div class="stat-sub">
                <span class="stat-label">平均得分</span>
                <span class="stat-value">{{
                  comprehensiveStats.avgScore
                }}</span>
              </div>
            </div>
            <div class="card-footer">
              <span class="trend-up">多类型综合赛事</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>赛事列表</span>
          <el-button type="primary" @click="handleOpenDialog()">
            创建赛事
          </el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="赛事名称">
          <el-input
            v-model="searchForm.title"
            placeholder="请输入赛事名称"
            clearable
          />
        </el-form-item>
        <el-form-item label="类型">
          <el-select
            v-model="searchForm.type"
            placeholder="请选择类型"
            clearable
          >
            <el-option label="编程竞赛" value="coding" />
            <el-option label="知识竞赛" value="quiz" />
            <el-option label="作文比赛" value="essay" />
            <el-option label="综合竞赛" value="comprehensive" />
          </el-select>
        </el-form-item>
        <el-form-item label="状态">
          <el-select
            v-model="searchForm.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="即将开始" value="upcoming" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">搜索</el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table
        v-loading="loading"
        :data="tableData"
        stripe
        style="width: 100%"
      >
        <el-table-column prop="eventId" label="ID" align="center" width="80" />
        <el-table-column
          prop="title"
          label="赛事名称"
          align="left"
          min-width="200"
        >
          <template #default="{ row }">
            <div class="event-title-cell">
              <span class="event-icon">{{ getTypeIcon(row.type) }}</span>
              <span>{{ row.title }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="type" label="类型" align="center" width="120">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          prop="startTime"
          label="开始时间"
          align="center"
          width="160"
        />
        <el-table-column
          prop="endTime"
          label="结束时间"
          align="center"
          width="160"
        />
        <el-table-column
          prop="participants"
          label="参与人数"
          align="center"
          width="100"
        />
        <el-table-column prop="status" label="状态" align="center" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusTagType(row.status)">
              {{ getStatusLabel(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="280">
          <template #default="{ row }">
            <el-button type="info" size="small" @click="viewParticipants(row)">
              查看报名
            </el-button>
            <el-button type="primary" size="small" @click="viewRankings(row)">
              排行榜
            </el-button>
            <el-button
              type="warning"
              size="small"
              @click="handleOpenDialog(row)"
            >
              编辑
            </el-button>
            <el-button type="danger" size="small" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>

    <!-- 赛事表单弹窗 -->
    <el-dialog
      v-model="dialogVisible"
      :title="formData.eventId ? '编辑赛事' : '创建赛事'"
      width="650px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="赛事名称" prop="title">
          <el-input v-model="formData.title" placeholder="请输入赛事名称" />
        </el-form-item>
        <el-form-item label="赛事简介" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="3"
            placeholder="请输入赛事简介"
          />
        </el-form-item>
        <el-form-item label="赛事类型" prop="type">
          <el-select v-model="formData.type" placeholder="请选择类型">
            <el-option label="编程竞赛" value="coding" />
            <el-option label="知识竞赛" value="quiz" />
            <el-option label="作文比赛" value="essay" />
            <el-option label="综合竞赛" value="comprehensive" />
          </el-select>
        </el-form-item>
        <el-form-item label="开始时间" prop="startTime">
          <el-date-picker
            v-model="formData.startTime"
            type="datetime"
            placeholder="请选择开始时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="结束时间" prop="endTime">
          <el-date-picker
            v-model="formData.endTime"
            type="datetime"
            placeholder="请选择结束时间"
            format="YYYY-MM-DD HH:mm:ss"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </el-form-item>
        <el-form-item label="题目数量" prop="questionCount">
          <el-input-number
            v-model="formData.questionCount"
            :min="1"
            :max="100"
          />
        </el-form-item>
        <el-form-item label="时间限制" prop="timeLimit">
          <el-input-number v-model="formData.timeLimit" :min="10" :max="300" />
          <span class="ml-2 text-gray-500">分钟</span>
        </el-form-item>
        <el-form-item label="满分" prop="totalScore">
          <el-input-number
            v-model="formData.totalScore"
            :min="10"
            :max="1000"
            :step="10"
          />
        </el-form-item>
        <el-form-item label="赛事状态" prop="status">
          <el-select v-model="formData.status" placeholder="请选择状态">
            <el-option label="即将开始" value="upcoming" />
            <el-option label="进行中" value="ongoing" />
            <el-option label="已结束" value="ended" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSubmit">确定</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 报名列表弹窗 -->
    <el-dialog
      v-model="participantsDialogVisible"
      title="报名列表"
      width="700px"
    >
      <el-table :data="participantsList" stripe style="width: 100%">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="realName" label="姓名" />
        <el-table-column prop="className" label="班级" />
        <el-table-column prop="registerTime" label="报名时间" />
        <el-table-column prop="status" label="状态">
          <template #default="{ row }">
            <el-tag :type="row.status === 'completed' ? 'success' : 'info'">
              {{ row.status === "completed" ? "已完成" : "未参与" }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
    </el-dialog>

    <!-- 排行榜弹窗 -->
    <el-dialog v-model="rankingsDialogVisible" title="排行榜" width="700px">
      <div class="rankings-list">
        <div
          v-for="(user, index) in rankingsList"
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
          <el-avatar :size="40" :src="formatAvatar(user.avatar)" />
          <div class="user-info">
            <span class="username">{{ user.username }}</span>
            <span class="class-name">{{ user.className }}</span>
          </div>
          <div class="score">{{ user.score }} 分</div>
          <div class="time">用时 {{ user.duration }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { formatAvatar } from "@/utils/avatar";
import { ElMessage, ElMessageBox, type FormInstance } from "element-plus";
import {
  getEventList,
  upsertEvent,
  deleteEvent,
  getEventStats,
  getEventParticipants,
  getEventRankings,
  getOJStats,
  getQuestionBankStats,
  getEssayStats
} from "@/api/competition";

defineOptions({
  name: "CompetitionManage"
});

interface EventItem {
  eventId: number;
  title: string;
  description: string;
  type: "coding" | "quiz" | "essay" | "comprehensive";
  startTime: string;
  endTime: string;
  questionCount: number;
  timeLimit: number;
  totalScore: number;
  participants: number;
  status: "upcoming" | "ongoing" | "ended";
}

const loading = ref(false);
const tableData = ref<EventItem[]>([]);
const total = ref(0);

const stats = ref({
  totalEvents: 0,
  ongoingEvents: 0,
  totalParticipants: 0
});

const ojStats = ref({ totalProblems: 0, submissions: 0 });
const trainingStats = ref({ categories: 0, questions: 0 });
const essayStats = ref({ totalEssays: 0, avgScore: 0 });
const comprehensiveStats = ref({ totalEvents: 0, avgScore: 0 });

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20
});

const searchForm = reactive({
  title: "",
  type: "",
  status: ""
});

const handleSearch = () => {
  queryParams.pageNum = 1;
  loadTableData();
};

const resetSearch = () => {
  searchForm.title = "";
  searchForm.type = "";
  searchForm.status = "";
  queryParams.pageNum = 1;
  loadTableData();
};

const loadTableData = async () => {
  loading.value = true;
  try {
    const params = {
      ...queryParams,
      ...searchForm
    };
    const { data } = await getEventList(params);
    tableData.value = data.eventList;
    total.value = data.total;
  } catch (error) {
    console.error("获取赛事列表失败", error);
    ElMessage.error("获取赛事列表失败");
  } finally {
    loading.value = false;
  }
};

const loadStats = async () => {
  try {
    const { data } = await getEventStats();
    stats.value = data;
  } catch (error) {
    console.error("获取统计数据失败", error);
  }
};

const loadModuleStats = async () => {
  try {
    // 加载 OJ 统计
    const ojRes = await getOJStats();
    ojStats.value = {
      totalProblems: ojRes.data.totalProblems,
      submissions: ojRes.data.totalSubmissions
    };
  } catch (error) {
    console.error("获取OJ统计失败", error);
  }

  try {
    // 加载题库统计
    const qbRes = await getQuestionBankStats();
    trainingStats.value = {
      categories: qbRes.data.totalCategories,
      questions: qbRes.data.totalQuestions
    };
  } catch (error) {
    console.error("获取题库统计失败", error);
  }

  try {
    // 加载作文统计
    const essayRes = await getEssayStats();
    essayStats.value = {
      totalEssays: essayRes.data.totalEssays,
      avgScore: essayRes.data.avgScore
    };
  } catch (error) {
    console.error("获取作文统计失败", error);
  }

  // 综合竞赛统计使用赛事统计数据
  comprehensiveStats.value = {
    totalEvents: stats.value.totalEvents,
    avgScore: 82
  };
};

const handleSizeChange = (val: number) => {
  queryParams.pageSize = val;
  loadTableData();
};

const handleCurrentChange = (val: number) => {
  queryParams.pageNum = val;
  loadTableData();
};

// 表单相关
const dialogVisible = ref(false);
const formRef = ref<FormInstance>();
const formData = reactive({
  eventId: 0,
  title: "",
  description: "",
  type: "",
  startTime: "",
  endTime: "",
  questionCount: 10,
  timeLimit: 60,
  totalScore: 100,
  status: "upcoming"
});

const formRules = {
  title: [{ required: true, message: "请输入赛事名称", trigger: "blur" }],
  description: [{ required: true, message: "请输入赛事简介", trigger: "blur" }],
  type: [{ required: true, message: "请选择赛事类型", trigger: "change" }],
  startTime: [{ required: true, message: "请选择开始时间", trigger: "change" }],
  endTime: [{ required: true, message: "请选择结束时间", trigger: "change" }],
  status: [{ required: true, message: "请选择状态", trigger: "change" }]
};

const handleOpenDialog = (row?: EventItem) => {
  dialogVisible.value = true;

  // 重置表单
  formData.eventId = 0;
  formData.title = "";
  formData.description = "";
  formData.type = "";
  formData.startTime = "";
  formData.endTime = "";
  formData.questionCount = 10;
  formData.timeLimit = 60;
  formData.totalScore = 100;
  formData.status = "upcoming";

  if (row) {
    Object.assign(formData, row);
  }
};

const handleSubmit = async () => {
  formRef.value?.validate(async valid => {
    if (!valid) return;

    try {
      await upsertEvent(formData);
      ElMessage.success(formData.eventId ? "编辑成功" : "新增成功");
      dialogVisible.value = false;
      loadTableData();
      loadStats();
    } catch (error) {
      console.error("保存赛事失败", error);
      ElMessage.error("保存失败，请重试");
    }
  });
};

const handleDelete = (row: EventItem) => {
  ElMessageBox.confirm(`确定要删除赛事 "${row.title}" 吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        await deleteEvent({ eventId: row.eventId });
        ElMessage.success("删除成功");
        loadTableData();
        loadStats();
      } catch (error) {
        console.error("删除赛事失败", error);
        ElMessage.error("删除失败，请重试");
      }
    })
    .catch(() => {});
};

// 报名列表
const participantsDialogVisible = ref(false);
const participantsList = ref<any[]>([]);

const viewParticipants = async (row: EventItem) => {
  try {
    const { data } = await getEventParticipants({ eventId: row.eventId });
    participantsList.value = data.list;
    participantsDialogVisible.value = true;
  } catch (error) {
    ElMessage.error("获取报名列表失败");
  }
};

// 排行榜
const rankingsDialogVisible = ref(false);
const rankingsList = ref<any[]>([]);

const viewRankings = async (row: EventItem) => {
  try {
    const { data } = await getEventRankings({ eventId: row.eventId });
    rankingsList.value = data.list;
    rankingsDialogVisible.value = true;
  } catch (error) {
    ElMessage.error("获取排行榜失败");
  }
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
  loadTableData();
  loadStats();
  loadModuleStats();
});
</script>

<style lang="scss" scoped>
.main {
  padding: 12px;

  .header-card {
    margin-bottom: 16px;
    overflow: hidden;
    background: linear-gradient(135deg, #fcd9b6 0%, #f9a8d4 100%);
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
        color: #1f2937;
      }

      p {
        margin: 0;
        font-size: 14px;
        color: #4b5563;
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
          color: #1f2937;
        }

        .stat-label {
          display: block;
          margin-top: 4px;
          font-size: 12px;
          color: #6b7280;
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

    .comprehensive-card {
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

    .search-form {
      margin-bottom: 16px;
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

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .dialog-footer {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }
}

.rankings-list {
  .ranking-item {
    display: flex;
    align-items: center;
    padding: 12px 16px;
    margin-bottom: 8px;
    background: var(--el-fill-color-light);
    border-radius: 12px;
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
      width: 40px;
      text-align: center;

      .rank-medal {
        font-size: 24px;
      }

      .rank-number {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-secondary);
      }
    }

    .user-info {
      flex: 1;
      margin-left: 12px;

      .username {
        display: block;
        font-weight: 500;
        color: var(--el-text-color-primary);
      }

      .class-name {
        display: block;
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }

    .score {
      margin-right: 20px;
      font-size: 18px;
      font-weight: 700;
      color: var(--el-color-primary);
    }

    .time {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}

:deep(.el-card__header) {
  border-radius: 16px 16px 0 0;
}

:deep(.el-card__body) {
  padding: 16px;
}

:deep(.el-table) {
  --el-table-header-padding: 8px 0;
  --el-table-cell-padding: 8px 0;

  overflow: hidden;
  border-radius: 12px;
}

:deep(.el-dialog) {
  border-radius: 16px;
}

:deep(.el-button) {
  border-radius: 8px;
}

:deep(.el-input__wrapper) {
  border-radius: 8px;
}

:deep(.header-card .el-card__body) {
  padding: 24px;
}
</style>
