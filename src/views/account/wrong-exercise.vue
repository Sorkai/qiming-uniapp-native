<template>
  <div class="practice-container" :class="currentTheme">
    <div class="header" :class="currentTheme">
      <div class="header-content">
        <div class="back-btn" @click="goBack">
          <el-icon><ArrowLeft /></el-icon> 返回
        </div>
        <div class="title">随练</div>
        <div class="placeholder" />
      </div>
    </div>

    <div class="main-content" :class="currentTheme">
      <el-card>
        <template #header>
          <div class="card-header">
            <h3>历史错题</h3>
            <div class="meta">
              <span>仅展示当前课程</span>
            </div>
          </div>
        </template>

        <el-empty v-if="loading" description="加载中..." />

        <div v-else>
          <el-empty v-if="!records.length" description="暂无错题记录" />

          <div v-else class="wrong-list">
            <div
              class="wrong-item"
              v-for="item in records"
              :key="item.id"
            >
              <div class="w-title" v-html="item.original_exercise_content" />
              <div class="w-meta">
                <span class="tag">学生答案：{{ item.student_answer }}</span>
                <span class="tag right">正确：{{ item.correct_answer }}</span>
                <span class="time">{{ formatTime(item.created_at) }}</span>
              </div>
              <div class="actions">
                <el-button type="primary" text @click="openDetail(item)">查看</el-button>
                <el-button type="success" text @click="analyze(item)">智能分析/相似题</el-button>
              </div>
            </div>

            <div class="pager">
              <el-pagination
                background
                layout="prev, pager, next"
                :total="total"
                :page-size="pageSize"
                :current-page="page"
                @current-change="handlePageChange"
              />
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 详情（沿用现有错题弹窗） -->
    <WrongQuestionDetailDialog
      v-model="detailVisible"
      :wrong-question="toLegacyWrong(itemForDetail)"
    />

    <!-- 智能分析弹窗 -->
    <WrongExerciseAnalyzeDialog
      v-model="analyzeVisible"
      :original="currentOriginal"
      :response="analyzeResp"
      :loading="analyzing"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import WrongQuestionDetailDialog from '@/components/WrongQuestionDetailDialog.vue';
import WrongExerciseAnalyzeDialog from '@/components/WrongExerciseAnalyzeDialog.vue';
import { getWrongExerciseHistory, analyzeWrongExercise, type WrongExerciseHistoryRecord, type WrongExerciseAnalyzeResponse } from '@/api/frontend/wrong-exercise';

const route = useRoute();
const router = useRouter();
const currentTheme = ref('light');

const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const records = ref<WrongExerciseHistoryRecord[]>([]);

const courseId = computed(() => Number(route.query.courseId || route.params.id));

const fetchHistory = async () => {
  loading.value = true;
  try {
    const { data } = await getWrongExerciseHistory({ course_id: courseId.value, page: page.value, page_size: pageSize.value });
    if (data) {
      total.value = data.total;
      records.value = data.records || [];
    }
  } finally {
    loading.value = false;
  }
};

const handlePageChange = (p: number) => {
  page.value = p;
  fetchHistory();
};

// 详情弹窗
const detailVisible = ref(false);
const itemForDetail = ref<WrongExerciseHistoryRecord | null>(null);
const openDetail = (item: WrongExerciseHistoryRecord) => {
  itemForDetail.value = item;
  detailVisible.value = true;
};

function toLegacyWrong(item: WrongExerciseHistoryRecord | null) {
  if (!item) return null;
  return {
    id: 0,
    sourceType: 1,
    sourceId: 0,
    sourceName: '错题详情',
    questionId: 0,
  questionType: 5,
    title: '错题',
    stem: item.original_exercise_content,
    options: null,
    analysis: item.analysis ? `${item.analysis.error_type}：${item.analysis.error_reason}` : '',
    answer: JSON.stringify(item.correct_answer),
    userAnswer: String(item.student_answer),
    wrongNum: 1,
    lastWrongTime: item.created_at
  };
}

// 智能分析
const analyzeVisible = ref(false);
const analyzing = ref(false);
const analyzeResp = ref<WrongExerciseAnalyzeResponse | null>(null);
const currentOriginal = ref<{ original_exercise_content: string; student_answer: string; correct_answer: string } | null>(null);

const analyze = async (item: WrongExerciseHistoryRecord) => {
  analyzeVisible.value = true;
  analyzeResp.value = null;
  currentOriginal.value = {
    original_exercise_content: item.original_exercise_content,
    student_answer: item.student_answer,
    correct_answer: item.correct_answer
  };
  analyzing.value = true;
  try {
    const { data } = await analyzeWrongExercise({
      course_id: courseId.value,
      original_exercise_id: item.original_exercise_id,
      original_exercise_content: item.original_exercise_content,
      student_answer: item.student_answer,
      correct_answer: item.correct_answer
    });
    if (data) analyzeResp.value = data;
  } finally {
    analyzing.value = false;
  }
};

const formatTime = (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm');

const goBack = () => router.back();

onMounted(() => {
  fetchHistory();
});
</script>

<style scoped>
.practice-container {
  min-height: 100vh;
  padding: 70px 0 30px;
  background-color: #f5f7fa;
}
.header {
  position: fixed;
  top: 0; left: 0; right: 0; height: 60px;
  background: #fff; box-shadow: 0 2px 8px rgba(0,0,0,.1);
}
.header .header-content { display:flex; align-items:center; justify-content:space-between; height:100%; padding:0 20px; max-width: 1100px; margin:0 auto; }
.header .title { font-size: 18px; font-weight: 600; }
.header .placeholder { min-width:60px; }

.main-content { max-width: 1000px; margin: 0 auto; padding: 0 20px; }
.card-header { display:flex; align-items:center; justify-content:space-between; }

.wrong-list { display: flex; flex-direction: column; gap: 14px; }
.wrong-item { padding: 14px; background: #fff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); }
.w-title { font-weight: 600; margin-bottom: 6px; }
.w-meta { color: #666; font-size: 13px; display:flex; gap:10px; align-items:center; }
.w-meta .tag { background:#f5f7ff; padding:2px 6px; border-radius: 4px; }
.w-meta .right { background:#f0fff4; color:#2f9e44; }
.w-meta .time { margin-left:auto; color:#999; }
.actions { margin-top: 8px; display:flex; gap:8px; }
.pager { display:flex; justify-content:center; margin-top: 10px; }
</style>
