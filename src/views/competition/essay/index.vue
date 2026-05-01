<template>
  <div class="main essay-manage" :class="{ 'essay-manage--mobile': isMobile }">
    <!-- 头部统计 -->
    <el-card class="box-card header-card">
      <div class="header-content">
        <div class="header-left">
          <h2>📄 作文批改管理</h2>
          <p>查看学生作文、AI智能批改与评分反馈</p>
        </div>
        <div class="header-stats">
          <div class="stat-item">
            <span class="stat-value">{{ stats.totalEssays }}</span>
            <span class="stat-label">作文总数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.pendingReview }}</span>
            <span class="stat-label">待批改</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.avgScore }}</span>
            <span class="stat-label">平均分</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ stats.todaySubmit }}</span>
            <span class="stat-label">今日提交</span>
          </div>
        </div>
      </div>
    </el-card>

    <!-- 主内容区 -->
    <el-card class="box-card">
      <template #header>
        <div class="card-header">
          <span>作文列表</span>
          <el-button
            type="primary"
            :class="{ 'header-action-button': isMobile }"
            @click="openTopicDialog()"
          >
            发布作文题目
          </el-button>
        </div>
      </template>

      <!-- 搜索区域 -->
      <div class="toolbar">
        <el-form
          :inline="!isMobile"
          :model="searchForm"
          :label-position="isMobile ? 'top' : 'right'"
          class="search-form"
        >
          <el-form-item label="学生姓名">
            <el-input
              v-model="searchForm.studentName"
              placeholder="请输入学生姓名"
              clearable
              :style="{ width: isMobile ? '100%' : '150px' }"
            />
          </el-form-item>
          <el-form-item label="作文题目">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入题目关键词"
              clearable
              :style="{ width: isMobile ? '100%' : '180px' }"
            />
          </el-form-item>
          <el-form-item label="批改状态">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择"
              clearable
              :style="{ width: isMobile ? '100%' : '120px' }"
            >
              <el-option label="待批改" value="pending" />
              <el-option label="AI已批改" value="ai_reviewed" />
              <el-option label="教师已批改" value="teacher_reviewed" />
            </el-select>
          </el-form-item>
          <el-form-item label="分数范围">
            <el-input-number
              v-model="searchForm.minScore"
              :min="0"
              :max="100"
              placeholder="最低"
              :class="{ 'score-input--mobile': isMobile }"
              :style="{ width: isMobile ? '100%' : '100px' }"
            />
            <span
              :class="
                isMobile ? 'range-separator range-separator--mobile' : 'mx-2'
              "
            >
              -
            </span>
            <el-input-number
              v-model="searchForm.maxScore"
              :min="0"
              :max="100"
              placeholder="最高"
              :class="{ 'score-input--mobile': isMobile }"
              :style="{ width: isMobile ? '100%' : '100px' }"
            />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="loadEssayList">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 作文列表 -->
      <template v-if="isMobile">
        <div v-loading="loading" class="mobile-essay-list">
          <div
            v-for="row in essayList"
            :key="row.essayId"
            class="mobile-essay-card"
          >
            <div class="mobile-card-head">
              <div class="mobile-card-head-main">
                <span class="mobile-card-id">#{{ row.essayId }}</span>
                <el-link
                  type="primary"
                  class="mobile-card-title"
                  @click="viewEssayDetail(row)"
                >
                  {{ row.title }}
                </el-link>
              </div>
              <el-tag
                :type="getStatusType(row.status)"
                size="small"
                effect="light"
              >
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </div>

            <div class="mobile-essay-meta">
              <span>学生：{{ row.studentName }}</span>
              <span>班级：{{ row.className }}</span>
              <span>字数：{{ row.wordCount }}</span>
              <span>提交：{{ row.submitTime }}</span>
            </div>

            <div class="mobile-score-grid">
              <div class="score-card">
                <span class="score-card-label">AI评分</span>
                <strong
                  :class="
                    row.aiScore ? getScoreClass(row.aiScore) : 'text-gray'
                  "
                >
                  {{ row.aiScore ?? "-" }}
                </strong>
              </div>
              <div class="score-card">
                <span class="score-card-label">教师评分</span>
                <strong
                  :class="
                    row.teacherScore
                      ? getScoreClass(row.teacherScore)
                      : 'text-gray'
                  "
                >
                  {{ row.teacherScore ?? "-" }}
                </strong>
              </div>
            </div>

            <div class="mobile-card-actions">
              <el-button
                type="primary"
                size="small"
                plain
                @click="viewEssayDetail(row)"
              >
                查看详情
              </el-button>
              <el-button
                type="success"
                size="small"
                plain
                @click="openReviewDialog(row)"
              >
                批改
              </el-button>
            </div>
          </div>

          <el-empty
            v-if="!loading && essayList.length === 0"
            description="暂无作文"
          />
        </div>
      </template>
      <div v-else class="table-shell">
        <el-table
          v-loading="loading"
          :data="essayList"
          stripe
          style="width: 100%"
        >
          <el-table-column
            prop="essayId"
            label="ID"
            width="80"
            align="center"
          />
          <el-table-column prop="studentName" label="学生姓名" width="120" />
          <el-table-column prop="className" label="班级" width="120" />
          <el-table-column prop="title" label="作文题目" min-width="200">
            <template #default="{ row }">
              <el-link type="primary" @click="viewEssayDetail(row)">
                {{ row.title }}
              </el-link>
            </template>
          </el-table-column>
          <el-table-column
            prop="wordCount"
            label="字数"
            width="80"
            align="center"
          />
          <el-table-column
            prop="aiScore"
            label="AI评分"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <span v-if="row.aiScore" :class="getScoreClass(row.aiScore)">
                {{ row.aiScore }}
              </span>
              <span v-else class="text-gray">-</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="teacherScore"
            label="教师评分"
            width="100"
            align="center"
          >
            <template #default="{ row }">
              <span
                v-if="row.teacherScore"
                :class="getScoreClass(row.teacherScore)"
              >
                {{ row.teacherScore }}
              </span>
              <span v-else class="text-gray">-</span>
            </template>
          </el-table-column>
          <el-table-column
            prop="status"
            label="状态"
            width="120"
            align="center"
          >
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" size="small">
                {{ getStatusLabel(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column
            prop="submitTime"
            label="提交时间"
            width="160"
            align="center"
          />
          <el-table-column
            label="操作"
            width="180"
            align="center"
            fixed="right"
          >
            <template #default="{ row }">
              <el-button
                type="primary"
                size="small"
                link
                @click="viewEssayDetail(row)"
              >
                查看详情
              </el-button>
              <el-button
                type="success"
                size="small"
                link
                @click="openReviewDialog(row)"
              >
                批改
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <div class="pagination-container">
        <el-pagination
          v-model:current-page="queryParams.pageNum"
          v-model:page-size="queryParams.pageSize"
          :page-sizes="[10, 20, 50]"
          :layout="paginationLayout"
          :size="isMobile ? 'small' : 'default'"
          :total="total"
          @size-change="loadEssayList"
          @current-change="loadEssayList"
        />
      </div>
    </el-card>

    <!-- 作文详情弹窗 -->
    <el-dialog
      v-model="detailDialogVisible"
      title="作文详情"
      :width="getDialogWidth('900px', '96%')"
      :fullscreen="isMobile"
      destroy-on-close
    >
      <div v-if="currentEssay" class="essay-detail">
        <!-- 基本信息 -->
        <div class="essay-meta">
          <el-descriptions :column="isMobile ? 1 : 4" border size="small">
            <el-descriptions-item label="学生姓名">{{
              currentEssay.studentName
            }}</el-descriptions-item>
            <el-descriptions-item label="班级">{{
              currentEssay.className
            }}</el-descriptions-item>
            <el-descriptions-item label="字数">{{
              currentEssay.wordCount
            }}</el-descriptions-item>
            <el-descriptions-item label="提交时间">{{
              currentEssay.submitTime
            }}</el-descriptions-item>
          </el-descriptions>
        </div>

        <!-- 作文内容 -->
        <div class="essay-content-section">
          <h4>📝 {{ currentEssay.title }}</h4>
          <div class="essay-content">
            {{ currentEssay.content }}
          </div>
        </div>

        <!-- AI批改结果 -->
        <div v-if="currentEssay.aiReview" class="ai-review-section">
          <h4>🤖 AI智能批改</h4>
          <div class="score-display">
            <div class="total-score">
              <span class="score-value">{{ currentEssay.aiScore }}</span>
              <span class="score-label">综合得分</span>
            </div>
            <div class="dimension-scores">
              <div
                v-for="(score, key) in currentEssay.aiReview.dimensions"
                :key="key"
                class="dimension-item"
              >
                <span class="dim-label">{{ getDimensionLabel(key) }}</span>
                <el-progress
                  :percentage="score"
                  :stroke-width="8"
                  :color="getProgressColor(score)"
                />
              </div>
            </div>
          </div>

          <div class="ai-feedback">
            <div class="feedback-section">
              <h5>✅ 优点</h5>
              <ul>
                <li
                  v-for="(item, idx) in currentEssay.aiReview.strengths"
                  :key="idx"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
            <div class="feedback-section">
              <h5>⚠️ 待改进</h5>
              <ul>
                <li
                  v-for="(item, idx) in currentEssay.aiReview.weaknesses"
                  :key="idx"
                >
                  {{ item }}
                </li>
              </ul>
            </div>
            <div class="feedback-section">
              <h5>💡 修改建议</h5>
              <p>{{ currentEssay.aiReview.suggestions }}</p>
            </div>
          </div>
        </div>

        <!-- 教师评语 -->
        <div v-if="currentEssay.teacherReview" class="teacher-review-section">
          <h4>👨‍🏫 教师评语</h4>
          <div class="teacher-score">
            <span>教师评分：</span>
            <span class="score-value">{{ currentEssay.teacherScore }}</span>
          </div>
          <div class="teacher-comment">
            {{ currentEssay.teacherReview }}
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 批改弹窗 -->
    <el-dialog
      v-model="reviewDialogVisible"
      title="作文批改"
      :width="getDialogWidth('800px', '96%')"
      :fullscreen="isMobile"
      destroy-on-close
    >
      <div v-if="reviewEssay" class="review-form">
        <div class="essay-preview">
          <h4>{{ reviewEssay.title }}</h4>
          <div class="essay-text">{{ reviewEssay.content }}</div>
        </div>

        <el-divider />

        <el-form
          ref="reviewFormRef"
          :model="reviewForm"
          :rules="reviewRules"
          :label-width="isMobile ? undefined : '100px'"
          :label-position="isMobile ? 'top' : 'right'"
        >
          <el-form-item label="教师评分" prop="score">
            <el-input-number
              v-model="reviewForm.score"
              :min="0"
              :max="100"
              :step="1"
              :class="{ 'score-input--mobile': isMobile }"
            />
            <span class="ml-2 text-gray">分</span>
          </el-form-item>
          <el-form-item label="评语" prop="comment">
            <el-input
              v-model="reviewForm.comment"
              type="textarea"
              :rows="6"
              placeholder="请输入教师评语..."
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="success"
              :loading="aiReviewLoading"
              @click="requestAIReview"
            >
              🤖 请求AI批改
            </el-button>
          </el-form-item>
        </el-form>
      </div>
      <template #footer>
        <el-button @click="reviewDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitReview">提交批改</el-button>
      </template>
    </el-dialog>

    <!-- 发布题目弹窗 -->
    <el-dialog
      v-model="topicDialogVisible"
      title="发布作文题目"
      :width="getDialogWidth('600px', '96%')"
      :fullscreen="isMobile"
      destroy-on-close
    >
      <el-form
        ref="topicFormRef"
        :model="topicForm"
        :rules="topicRules"
        :label-width="isMobile ? undefined : '100px'"
        :label-position="isMobile ? 'top' : 'right'"
      >
        <el-form-item label="题目" prop="title">
          <el-input v-model="topicForm.title" placeholder="请输入作文题目" />
        </el-form-item>
        <el-form-item label="类型" prop="type">
          <el-select v-model="topicForm.type" placeholder="请选择类型">
            <el-option label="记叙文" value="narrative" />
            <el-option label="议论文" value="argumentative" />
            <el-option label="说明文" value="expository" />
            <el-option label="应用文" value="practical" />
          </el-select>
        </el-form-item>
        <el-form-item label="字数要求" prop="wordLimit">
          <el-input-number
            v-model="topicForm.minWords"
            :min="100"
            :max="5000"
            :class="{ 'score-input--mobile': isMobile }"
          />
          <span
            :class="
              isMobile ? 'range-separator range-separator--mobile' : 'mx-2'
            "
          >
            -
          </span>
          <el-input-number
            v-model="topicForm.maxWords"
            :min="100"
            :max="5000"
            :class="{ 'score-input--mobile': isMobile }"
          />
          <span class="ml-2">字</span>
        </el-form-item>
        <el-form-item label="题目要求" prop="requirement">
          <el-input
            v-model="topicForm.requirement"
            type="textarea"
            :rows="4"
            placeholder="请输入作文要求和写作提示..."
          />
        </el-form-item>
        <el-form-item label="截止时间" prop="deadline">
          <el-date-picker
            v-model="topicForm.deadline"
            type="datetime"
            placeholder="请选择截止时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
            :style="{ width: isMobile ? '100%' : undefined }"
          />
        </el-form-item>
        <el-form-item label="目标班级" prop="targetClasses">
          <el-select
            v-model="topicForm.targetClasses"
            multiple
            placeholder="请选择目标班级"
            style="width: 100%"
          >
            <el-option label="计算机2301班" value="cs2301" />
            <el-option label="计算机2302班" value="cs2302" />
            <el-option label="软件工程2301班" value="se2301" />
            <el-option label="人工智能2301班" value="ai2301" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="topicDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="publishTopic">发布</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, type FormInstance } from "element-plus";
import { usePageResponsive } from "@/utils/pageResponsive";
import {
  getEssayStats,
  getEssayList,
  getEssayDetail,
  submitTeacherReview,
  requestAIReview as requestAIReviewApi,
  publishEssayTopic
} from "@/api/competition";

defineOptions({
  name: "EssayManage"
});

const { isMobile, paginationLayout, getDialogWidth } = usePageResponsive();

// 统计数据
const stats = ref({
  totalEssays: 0,
  pendingReview: 0,
  avgScore: 0,
  todaySubmit: 0
});

// 列表数据
const loading = ref(false);
const essayList = ref<any[]>([]);
const total = ref(0);

const queryParams = reactive({
  pageNum: 1,
  pageSize: 20
});

const searchForm = reactive({
  studentName: "",
  title: "",
  status: "",
  minScore: undefined as number | undefined,
  maxScore: undefined as number | undefined
});

// 详情弹窗
const detailDialogVisible = ref(false);
const currentEssay = ref<any>(null);

// 批改弹窗
const reviewDialogVisible = ref(false);
const reviewFormRef = ref<FormInstance>();
const reviewEssay = ref<any>(null);
const reviewForm = reactive({
  essayId: 0,
  score: 80,
  comment: ""
});
const reviewRules = {
  score: [{ required: true, message: "请输入评分", trigger: "blur" }],
  comment: [{ required: true, message: "请输入评语", trigger: "blur" }]
};
const aiReviewLoading = ref(false);

// 发布题目弹窗
const topicDialogVisible = ref(false);
const topicFormRef = ref<FormInstance>();
const topicForm = reactive({
  title: "",
  type: "",
  minWords: 800,
  maxWords: 1200,
  requirement: "",
  deadline: "",
  targetClasses: [] as string[]
});
const topicRules = {
  title: [{ required: true, message: "请输入题目", trigger: "blur" }],
  type: [{ required: true, message: "请选择类型", trigger: "change" }],
  requirement: [{ required: true, message: "请输入题目要求", trigger: "blur" }],
  deadline: [{ required: true, message: "请选择截止时间", trigger: "change" }],
  targetClasses: [
    { required: true, message: "请选择目标班级", trigger: "change" }
  ]
};

const loadStats = async () => {
  try {
    const { data } = await getEssayStats();
    stats.value = data;
  } catch (error) {
    console.error("获取统计数据失败", error);
  }
};

const loadEssayList = async () => {
  loading.value = true;
  try {
    const params = { ...queryParams, ...searchForm };
    const { data } = await getEssayList(params);
    essayList.value = data.list;
    total.value = data.total;
  } catch (error) {
    ElMessage.error("获取作文列表失败");
  } finally {
    loading.value = false;
  }
};

const resetSearch = () => {
  searchForm.studentName = "";
  searchForm.title = "";
  searchForm.status = "";
  searchForm.minScore = undefined;
  searchForm.maxScore = undefined;
  queryParams.pageNum = 1;
  loadEssayList();
};

const viewEssayDetail = async (row: any) => {
  try {
    const { data } = await getEssayDetail({ essayId: row.essayId });
    currentEssay.value = data;
    detailDialogVisible.value = true;
  } catch (error) {
    ElMessage.error("获取作文详情失败");
  }
};

const openReviewDialog = async (row: any) => {
  try {
    const { data } = await getEssayDetail({ essayId: row.essayId });
    reviewEssay.value = data;
    reviewForm.essayId = row.essayId;
    reviewForm.score = row.teacherScore || 80;
    reviewForm.comment = row.teacherReview || "";
    reviewDialogVisible.value = true;
  } catch (error) {
    ElMessage.error("获取作文详情失败");
  }
};

const requestAIReview = async () => {
  aiReviewLoading.value = true;
  try {
    const { data } = await requestAIReviewApi({ essayId: reviewForm.essayId });
    reviewEssay.value.aiScore = data.score;
    reviewEssay.value.aiReview = data.review;
    ElMessage.success("AI批改完成");
  } catch (error) {
    ElMessage.error("AI批改失败");
  } finally {
    aiReviewLoading.value = false;
  }
};

const submitReview = async () => {
  reviewFormRef.value?.validate(async valid => {
    if (!valid) return;
    try {
      await submitTeacherReview(reviewForm);
      ElMessage.success("批改成功");
      reviewDialogVisible.value = false;
      loadEssayList();
      loadStats();
    } catch (error) {
      ElMessage.error("批改失败");
    }
  });
};

const openTopicDialog = () => {
  topicForm.title = "";
  topicForm.type = "";
  topicForm.minWords = 800;
  topicForm.maxWords = 1200;
  topicForm.requirement = "";
  topicForm.deadline = "";
  topicForm.targetClasses = [];
  topicDialogVisible.value = true;
};

const publishTopic = async () => {
  topicFormRef.value?.validate(async valid => {
    if (!valid) return;
    try {
      await publishEssayTopic(topicForm);
      ElMessage.success("发布成功");
      topicDialogVisible.value = false;
    } catch (error) {
      ElMessage.error("发布失败");
    }
  });
};

// 工具函数
const getScoreClass = (score: number) => {
  if (score >= 85) return "score-excellent";
  if (score >= 70) return "score-good";
  if (score >= 60) return "score-pass";
  return "score-fail";
};

const getStatusType = (status: string) => {
  const types: Record<string, "info" | "warning" | "success"> = {
    pending: "info",
    ai_reviewed: "warning",
    teacher_reviewed: "success"
  };
  return types[status] || "info";
};

const getStatusLabel = (status: string) => {
  const labels: Record<string, string> = {
    pending: "待批改",
    ai_reviewed: "AI已批改",
    teacher_reviewed: "教师已批改"
  };
  return labels[status] || status;
};

const getDimensionLabel = (key: string) => {
  const labels: Record<string, string> = {
    content: "内容",
    structure: "结构",
    language: "语言",
    creativity: "创意",
    logic: "逻辑"
  };
  return labels[key] || key;
};

const getProgressColor = (score: number) => {
  if (score >= 80) return "#10b981";
  if (score >= 60) return "#f59e0b";
  return "#ef4444";
};

onMounted(() => {
  loadStats();
  loadEssayList();
});
</script>

<style lang="scss" scoped>
.main {
  padding: 12px;
  color: var(--el-text-color-primary);

  .header-card {
    margin-bottom: 16px;
    background: linear-gradient(135deg, #fcd34d 0%, #fbbf24 100%);
    border: none;
    border-radius: 16px;

    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
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
      display: grid;
      grid-template-columns: repeat(4, minmax(90px, 1fr));
      gap: 16px;

      .stat-item {
        text-align: center;
        padding: 14px 12px;
        background: rgb(255 255 255 / 40%);
        border: 1px solid rgb(255 255 255 / 28%);
        border-radius: 14px;
        backdrop-filter: blur(10px);

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

  .box-card {
    border-radius: 16px;

    .card-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }

    .toolbar {
      margin-bottom: 16px;
    }

    .search-form {
      display: flex;
      flex-wrap: wrap;
      gap: 12px 0;
    }
  }

  .table-shell {
    overflow-x: auto;

    :deep(.el-table) {
      min-width: 1080px;
    }
  }

  .pagination-container {
    display: flex;
    justify-content: flex-end;
    margin-top: 16px;
  }

  .text-gray {
    color: var(--el-text-color-placeholder);
  }

  .score-excellent {
    font-weight: 600;
    color: #10b981;
  }

  .score-good {
    font-weight: 600;
    color: #3b82f6;
  }

  .score-pass {
    font-weight: 600;
    color: #f59e0b;
  }

  .score-fail {
    font-weight: 600;
    color: #ef4444;
  }

  .mobile-essay-list {
    display: grid;
    gap: 12px;
  }

  .mobile-essay-card {
    padding: 16px;
    background: linear-gradient(180deg, #fff 0%, #fffaf0 100%);
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 18px;
    box-shadow: 0 10px 24px rgb(15 23 42 / 6%);
  }

  .mobile-card-head {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  .mobile-card-head-main {
    display: grid;
    gap: 6px;
    min-width: 0;
  }

  .mobile-card-id {
    font-size: 12px;
    font-weight: 700;
    color: #92400e;
    letter-spacing: 0.08em;
  }

  .mobile-card-title {
    font-size: 16px;
    font-weight: 600;
    line-height: 1.5;
  }

  .mobile-essay-meta {
    display: grid;
    gap: 8px;
    margin-bottom: 12px;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }

  .mobile-score-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
    margin-bottom: 12px;
  }

  .score-card {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 12px;
    background: #fff;
    border: 1px solid #fde7b0;
    border-radius: 14px;

    strong {
      font-size: 20px;
      font-weight: 700;
    }
  }

  .score-card-label {
    font-size: 12px;
    color: #78716c;
  }

  .mobile-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .range-separator {
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .score-input--mobile {
    width: 100%;
  }
}

// 作文详情样式
.essay-detail {
  .essay-meta {
    margin-bottom: 20px;
  }

  .essay-content-section {
    margin-bottom: 24px;

    h4 {
      margin: 0 0 12px;
      font-size: 18px;
      font-weight: 600;
    }

    .essay-content {
      padding: 16px;
      font-size: 15px;
      line-height: 1.8;
      text-indent: 2em;
      white-space: pre-wrap;
      background: var(--el-fill-color-light);
      border-radius: 8px;
    }
  }

  .ai-review-section,
  .teacher-review-section {
    padding: 16px;
    margin-bottom: 24px;
    background: var(--el-fill-color-lighter);
    border-radius: 12px;

    h4 {
      margin: 0 0 16px;
      font-size: 16px;
      font-weight: 600;
    }
  }

  .score-display {
    display: flex;
    gap: 32px;
    margin-bottom: 20px;

    .total-score {
      padding: 16px 24px;
      color: #fff;
      text-align: center;
      background: linear-gradient(135deg, #10b981, #059669);
      border-radius: 12px;

      .score-value {
        display: block;
        font-size: 36px;
        font-weight: 700;
      }

      .score-label {
        font-size: 12px;
        opacity: 0.85;
      }
    }

    .dimension-scores {
      display: grid;
      flex: 1;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;

      .dimension-item {
        .dim-label {
          display: block;
          margin-bottom: 4px;
          font-size: 12px;
          color: var(--el-text-color-secondary);
        }
      }
    }
  }

  .ai-feedback {
    .feedback-section {
      margin-bottom: 16px;

      h5 {
        margin: 0 0 8px;
        font-size: 14px;
        font-weight: 600;
      }

      ul {
        padding-left: 20px;
        margin: 0;

        li {
          margin-bottom: 4px;
          font-size: 14px;
          line-height: 1.6;
        }
      }

      p {
        margin: 0;
        font-size: 14px;
        line-height: 1.6;
      }
    }
  }

  .teacher-score {
    margin-bottom: 12px;
    font-size: 14px;

    .score-value {
      margin-left: 8px;
      font-size: 24px;
      font-weight: 700;
      color: #3b82f6;
    }
  }

  .teacher-comment {
    padding: 12px;
    font-size: 14px;
    line-height: 1.6;
    background: #fff;
    border-radius: 8px;
  }
}

// 批改表单样式
.review-form {
  .essay-preview {
    margin-bottom: 16px;

    h4 {
      margin: 0 0 12px;
      font-size: 16px;
      font-weight: 600;
    }

    .essay-text {
      max-height: 200px;
      padding: 12px;
      overflow-y: auto;
      font-size: 14px;
      line-height: 1.8;
      text-indent: 2em;
      background: var(--el-fill-color-light);
      border-radius: 8px;
    }
  }
}

.essay-manage--mobile {
  padding: 8px;

  .header-card {
    .header-content {
      flex-direction: column;
      align-items: stretch;
      gap: 18px;
    }

    .header-left {
      h2 {
        font-size: 22px;
        line-height: 1.3;
      }

      p {
        line-height: 1.6;
      }
    }

    .header-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 12px;

      .stat-item {
        text-align: left;
      }
    }
  }

  .box-card {
    .card-header {
      flex-direction: column;
      align-items: stretch;
    }

    .search-form {
      display: block;

      :deep(.el-form-item) {
        margin-right: 0;
        margin-bottom: 12px;
      }

      :deep(.el-form-item__content) {
        width: 100%;
        flex-wrap: wrap;
      }
    }
  }

  .header-action-button {
    width: 100%;
  }

  .range-separator--mobile {
    width: 100%;
    min-height: 20px;
    margin: 2px 0;
  }

  .pagination-container {
    justify-content: center;

    :deep(.el-pagination) {
      flex-wrap: wrap;
      justify-content: center;
      row-gap: 8px;
    }
  }

  .essay-detail {
    .essay-content-section {
      h4 {
        font-size: 16px;
        line-height: 1.5;
      }

      .essay-content {
        padding: 14px;
        font-size: 14px;
        line-height: 1.75;
      }
    }

    .score-display {
      flex-direction: column;
      gap: 16px;

      .total-score {
        padding: 14px 18px;

        .score-value {
          font-size: 30px;
        }
      }

      .dimension-scores {
        grid-template-columns: 1fr;
      }
    }
  }

  .review-form {
    .essay-preview {
      h4 {
        line-height: 1.5;
      }

      .essay-text {
        max-height: 240px;
        text-indent: 0;
      }
    }
  }
}
</style>
