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
              <div class="w-title" v-html="item.stem" />
              <div class="w-meta">
                <span class="tag">来源：{{ sourceText(item.sourceType) }}</span>
                <span class="tag">错误次数：{{ item.wrongNum }}</span>
                <span class="time">{{ item.lastWrongTime }}</span>
              </div>
              <div class="actions">
                <el-button type="primary" text @click="openDetail(item)">查看</el-button>
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
    <WrongQuestionDetailWithAI
      v-model="detailVisible"
      :course-id="courseId"
      :wrong="normalizeWrong(itemForDetail)"
      :initial-analysis="findHistory(itemForDetail)"
      @analyzed="cacheAnalysis"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ArrowLeft } from '@element-plus/icons-vue';
import dayjs from 'dayjs';
import WrongQuestionDetailWithAI from '@/components/WrongQuestionDetailWithAI.vue';
import { getWrongExerciseHistory, type WrongExerciseAnalyzeResponse } from '@/api/frontend/wrong-exercise';
import { getUserWrongQuestionList, type WrongQuestionListResult } from '@/api/frontend/work';

const route = useRoute();
const router = useRouter();
const currentTheme = ref('light');

const page = ref(1);
const pageSize = ref(10);
const total = ref(0);
const loading = ref(false);
const records = ref<WrongQuestionListResult['list']>([] as any);

const courseId = computed(() => Number(route.query.courseId || route.params.id));

const analysisHistoryMap = ref<Record<string, WrongExerciseAnalyzeResponse>>({});

const fetchList = async () => {
  loading.value = true;
  try {
    const { code, data } = await getUserWrongQuestionList({
      pageNum: page.value,
      pageSize: pageSize.value,
      courseId: courseId.value
    } as any);
    if (code === 200 && data) {
      records.value = (data as any).list || [];
      total.value = (data as any).total || 0;
    }
  } finally {
    loading.value = false;
  }
};

const fetchAnalyzedHistory = async () => {
  try {
    const { data } = await getWrongExerciseHistory({ course_id: courseId.value, page: 1, page_size: 100 });
    if (data && data.records) {
      const map: Record<string, WrongExerciseAnalyzeResponse> = {};
      for (const rec of data.records) {
        map[String(rec.original_exercise_id)] = {
          analysis: rec.analysis,
          generated_exercises: rec.generated_exercises
        } as WrongExerciseAnalyzeResponse;
      }
      analysisHistoryMap.value = map;
    }
  } catch {}
};

const handlePageChange = (p: number) => {
  page.value = p;
  fetchList();
};

// 详情弹窗
const detailVisible = ref(false);
const itemForDetail = ref<any | null>(null);
const openDetail = (item: any) => {
  itemForDetail.value = item;
  detailVisible.value = true;
};
function normalizeWrong(item: any | null) {
  if (!item) return null;
  return {
  id: item.id,
  questionId: item.questionId,
  questionType: item.questionType,
  title: item.title,
  stem: item.stem,
  options: item.options,
  analysis: item.analysis,
  answer: item.answer,
  userAnswer: item.userAnswer
  };
}

function findHistory(item: any | null) {
  if (!item) return null;
  const key = String(item.questionId || item.id);
  return analysisHistoryMap.value[key] || null;
}

function cacheAnalysis(payload: { key: string; response: WrongExerciseAnalyzeResponse }) {
  analysisHistoryMap.value[payload.key] = payload.response;
}

const formatTime = (t: string) => dayjs(t).format('YYYY-MM-DD HH:mm');
const sourceText = (s: number) => ({ 1: '作业', 2: '考试', 3: '自测题' } as any)[s] || '未知';

const goBack = () => router.back();

onMounted(async () => {
  await fetchList();
  fetchAnalyzedHistory();
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
