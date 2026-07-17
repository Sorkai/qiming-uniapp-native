<script setup lang="ts">
import {
  computed,
  onBeforeUnmount,
  onMounted,
  reactive,
  ref,
  watch
} from "vue";
import {
  onBeforeRouteLeave,
  onBeforeRouteUpdate,
  useRoute,
  useRouter
} from "vue-router";
import { useDark } from "@pureadmin/utils";
import { ElMessage, ElMessageBox } from "element-plus";

import { useUserStoreHook } from "@/store/modules/user";
import {
  PaperStatus,
  autoGradeObjective,
  getPaperDetail,
  getPaperStatusText,
  getSubmissionDetail,
  getSubmissionList,
  releaseScores,
  submitGrade,
  type Paper,
  type StudentSubmission
} from "@/api/examPaper";

import RichContent from "../editor/components/RichContent.vue";
import IconDocument from "@/assets/home-icons/document.svg?component";
import {
  buildGradingAnswerDrafts,
  formatGradingAnswer,
  getFrozenSnapshotQuestions,
  getUnmatchedAnswerIds,
  isGradeScoreValid,
  isObjectiveQuestionType,
  type GradingAnswerDraft,
  type GradingAnswerValue,
  type GradingQuestionLike
} from "./gradingRuntime";

defineOptions({
  name: "ExamPaperGradingDetail"
});

const route = useRoute();
const router = useRouter();
const { isDark } = useDark();
const userStore = useUserStoreHook();

const paper = ref<Paper | null>(null);
const submissions = ref<StudentSubmission[]>([]);
const submissionDetail = ref<StudentSubmission | null>(null);
const gradingAnswers = ref<GradingAnswerDraft[]>([]);
const selectedSubmissionId = ref<number | null>(null);

const pageLoading = ref(false);
const listLoading = ref(false);
const detailLoading = ref(false);
const countsLoading = ref(false);
const actionLoading = ref<"save" | "auto" | "release" | "">("");
const pageError = ref("");
const listError = ref("");
const detailError = ref("");
const countsError = ref("");
const hasUnsavedChanges = ref(false);

const searchForm = reactive({
  keyword: "",
  gradeStatus: undefined as number | undefined
});

const appliedFilters = reactive({
  keyword: "",
  gradeStatus: undefined as number | undefined
});

const pagination = reactive({
  pageNum: 1,
  pageSize: 10,
  total: 0
});

const submissionCounts = reactive<{
  total: number | null;
  pending: number | null;
  grading: number | null;
  graded: number | null;
}>({
  total: null,
  pending: null,
  grading: null,
  graded: null
});

const gradeStatusOptions = [
  { value: 0, label: "待批改" },
  { value: 1, label: "批改中" },
  { value: 2, label: "已批改" }
];

const paperId = computed(() => Number(route.params.id));
const isReadOnlyRoute = computed(
  () => route.name === "ExamPaperGradingView" || route.path.endsWith("/detail")
);
const normalizedRoles = computed(() =>
  (userStore.roles || []).map(role => String(role).toLowerCase())
);
const hasGradingRole = computed(() =>
  normalizedRoles.value.some(role =>
    ["admin", "teacher", "super-admin"].includes(role)
  )
);
const isScoreReleased = computed(
  () => paper.value?.status === PaperStatus.SCORE_RELEASED
);
const canGrade = computed(
  () => hasGradingRole.value && !isReadOnlyRoute.value && !isScoreReleased.value
);

const currentListIndex = computed(() =>
  submissions.value.findIndex(
    item => item.submissionId === selectedSubmissionId.value
  )
);

const currentScore = computed(() =>
  gradingAnswers.value.reduce(
    (total, item) => total + (typeof item.score === "number" ? item.score : 0),
    0
  )
);

const currentMaxScore = computed(() =>
  gradingAnswers.value.reduce(
    (total, item) => total + Number(item.question.points || 0),
    0
  )
);

const invalidGradeCount = computed(
  () =>
    gradingAnswers.value.filter(
      item => !isGradeScoreValid(item.score, item.question.points)
    ).length
);

const allScoresValid = computed(
  () => gradingAnswers.value.length > 0 && invalidGradeCount.value === 0
);

const gradeProgress = computed(() => {
  if (!submissionCounts.total || submissionCounts.graded === null) return 0;
  return Math.round((submissionCounts.graded / submissionCounts.total) * 100);
});

const canReleaseScores = computed(
  () =>
    canGrade.value &&
    !countsLoading.value &&
    submissionCounts.total !== null &&
    submissionCounts.total > 0 &&
    submissionCounts.pending === 0 &&
    submissionCounts.grading === 0
);

let detailRequestSequence = 0;
let listRequestSequence = 0;

const getErrorMessage = (error: unknown, fallback: string) => {
  const responseMessage = (error as { response?: { data?: { msg?: string } } })
    ?.response?.data?.msg;
  if (responseMessage) return responseMessage;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
};

const assertApiSuccess = <T,>(
  response: { code: number; msg?: string; data: T },
  fallback: string
): T => {
  if (response.code !== 0) {
    throw new Error(response.msg || fallback);
  }
  return response.data;
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
};

const formatDuration = (seconds?: number) => {
  if (!seconds || seconds <= 0) return "-";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remain = seconds % 60;
  return hours > 0
    ? `${hours}小时${minutes}分${remain}秒`
    : `${minutes}分${remain}秒`;
};

const getGradeStatusType = (
  status: number
): "warning" | "primary" | "success" | "info" => {
  if (status === 0) return "warning";
  if (status === 1) return "primary";
  if (status === 2) return "success";
  return "info";
};

const getGradeStatusText = (status: number) => {
  if (status === 0) return "待批改";
  if (status === 1) return "批改中";
  if (status === 2) return "已批改";
  return "状态未知";
};

const getPaperStatusType = () => {
  if (paper.value?.status === PaperStatus.SCORE_RELEASED) return "success";
  if (paper.value?.status === PaperStatus.GRADED) return "primary";
  if (paper.value?.status === PaperStatus.GRADING) return "warning";
  return "info";
};

const questionTypeMap: Record<string, string> = {
  "1": "单选题",
  "2": "多选题",
  "3": "判断题",
  "4": "填空题",
  "5": "简答题",
  "6": "论述题",
  "7": "矩阵单选",
  "8": "矩阵多选",
  "9": "连线题",
  "10": "排序题",
  "11": "滑动评分",
  "12": "NPS 评分",
  "13": "星级评分",
  "14": "组合材料题",
  radio: "单选题",
  checkbox: "多选题",
  judge: "判断题",
  input: "填空题",
  textarea: "简答题",
  "textarea-essay": "论述题",
  "matrix-single": "矩阵单选",
  "matrix-multiple": "矩阵多选",
  matching: "连线题",
  ordering: "排序题",
  slider: "滑动评分",
  "nps-rating": "NPS 评分",
  "star-rating": "星级评分",
  composite: "组合材料题"
};

const getQuestionTypeText = (type: number | string) =>
  questionTypeMap[String(type)] || "其他题型";

const getGradingModeText = (type: number | string) =>
  isObjectiveQuestionType(type) ? "客观题" : "人工批改";

const getQuestionContent = (question: GradingQuestionLike) =>
  question.stem || question.title || "题干缺失";

const getCorrectAnswer = (
  question: GradingQuestionLike
): GradingAnswerValue => {
  if (question.correctAnswers?.length) return question.correctAnswers;
  if (question.correctAnswer) return question.correctAnswer;
  if (question.referenceAnswer) return question.referenceAnswer;
  return null;
};

const isAnswerChoice = (value: GradingAnswerValue, key: string) => {
  if (Array.isArray(value)) {
    return value.map(item => String(item)).includes(String(key));
  }
  return String(value ?? "") === String(key);
};

const isStudentOption = (item: GradingAnswerDraft, key: string) =>
  isAnswerChoice(item.answer, key);

const isCorrectOption = (item: GradingAnswerDraft, key: string) =>
  isAnswerChoice(getCorrectAnswer(item.question), key);

const markDirty = () => {
  if (canGrade.value) hasUnsavedChanges.value = true;
};

const setScore = (item: GradingAnswerDraft, score: number) => {
  if (!canGrade.value) return;
  item.score = score;
  markDirty();
};

const confirmDiscardChanges = async () => {
  if (!hasUnsavedChanges.value) return true;
  try {
    await ElMessageBox.confirm(
      "当前答卷有未保存的评分，离开后修改将丢失。",
      "确认离开当前答卷？",
      {
        confirmButtonText: "放弃修改",
        cancelButtonText: "继续批改",
        type: "warning"
      }
    );
    return true;
  } catch {
    return false;
  }
};

const handleBeforeUnload = (event: BeforeUnloadEvent) => {
  if (!hasUnsavedChanges.value) return;
  event.preventDefault();
  event.returnValue = "";
};

const clearSubmissionDetail = () => {
  detailRequestSequence += 1;
  detailLoading.value = false;
  selectedSubmissionId.value = null;
  submissionDetail.value = null;
  gradingAnswers.value = [];
  detailError.value = "";
  hasUnsavedChanges.value = false;
};

const loadPaper = async () => {
  const response = await getPaperDetail(paperId.value);
  const data = assertApiSuccess(response, "获取试卷详情失败");
  if (!data) throw new Error("试卷不存在或已被删除");
  paper.value = data;
};

const loadSubmissionCounts = async () => {
  countsLoading.value = true;
  countsError.value = "";
  const requestParams = (gradeStatus?: number) => ({
    paperId: paperId.value,
    pageNum: 1,
    pageSize: 1,
    gradeStatus
  });

  try {
    const results = await Promise.allSettled([
      getSubmissionList(requestParams()),
      getSubmissionList(requestParams(0)),
      getSubmissionList(requestParams(1)),
      getSubmissionList(requestParams(2))
    ]);
    const countKeys = ["total", "pending", "grading", "graded"] as const;
    let failureCount = 0;

    results.forEach((result, index) => {
      const key = countKeys[index];
      if (
        result.status === "fulfilled" &&
        result.value.code === 0 &&
        result.value.data
      ) {
        submissionCounts[key] = result.value.data.total;
      } else {
        submissionCounts[key] = null;
        failureCount += 1;
      }
    });

    if (failureCount > 0) {
      countsError.value = "部分阅卷统计暂不可用";
    }
  } finally {
    countsLoading.value = false;
  }
};

const loadSubmissionDetail = async (submissionId: number) => {
  const requestSequence = ++detailRequestSequence;
  selectedSubmissionId.value = submissionId;
  detailLoading.value = true;
  detailError.value = "";
  submissionDetail.value = null;
  gradingAnswers.value = [];
  hasUnsavedChanges.value = false;

  try {
    const response = await getSubmissionDetail(submissionId);
    const data = assertApiSuccess(response, "获取答卷详情失败");
    if (requestSequence !== detailRequestSequence) return;
    if (!data) throw new Error("答卷不存在或已被删除");
    if (data.paperId && data.paperId !== paperId.value) {
      throw new Error("答卷与当前试卷不匹配，已停止加载");
    }
    const snapshotQuestions = getFrozenSnapshotQuestions(data.paperSnapshot);

    const unmatchedAnswerIds = getUnmatchedAnswerIds(
      snapshotQuestions,
      data.answers || []
    );
    if (unmatchedAnswerIds.length) {
      throw new Error(
        `答卷题目与试卷版本不一致（题目 ${unmatchedAnswerIds.join("、")}），请联系管理员核对试卷快照`
      );
    }

    submissionDetail.value = data;
    gradingAnswers.value = buildGradingAnswerDrafts(
      snapshotQuestions,
      data.answers || []
    );
  } catch (error) {
    if (requestSequence !== detailRequestSequence) return;
    detailError.value = getErrorMessage(error, "获取答卷详情失败");
  } finally {
    if (requestSequence === detailRequestSequence) {
      detailLoading.value = false;
    }
  }
};

const loadSubmissionPage = async (preferredSubmissionId?: number | null) => {
  const requestSequence = ++listRequestSequence;
  listLoading.value = true;
  listError.value = "";
  let nextSubmissionId: number | null = null;

  try {
    const response = await getSubmissionList({
      paperId: paperId.value,
      pageNum: pagination.pageNum,
      pageSize: pagination.pageSize,
      keyword: appliedFilters.keyword || undefined,
      gradeStatus: appliedFilters.gradeStatus
    });
    const data = assertApiSuccess(response, "获取答卷列表失败");
    if (requestSequence !== listRequestSequence) return;
    if (!data) throw new Error("答卷列表响应为空");

    submissions.value = data.list || [];
    pagination.total = data.total || 0;
    const preferredExists = submissions.value.some(
      item => item.submissionId === preferredSubmissionId
    );
    nextSubmissionId = preferredExists
      ? preferredSubmissionId || null
      : submissions.value[0]?.submissionId || null;

    if (!nextSubmissionId) clearSubmissionDetail();
  } catch (error) {
    if (requestSequence !== listRequestSequence) return;
    submissions.value = [];
    pagination.total = 0;
    clearSubmissionDetail();
    listError.value = getErrorMessage(error, "获取答卷列表失败");
  } finally {
    if (requestSequence === listRequestSequence) {
      listLoading.value = false;
    }
  }

  if (requestSequence === listRequestSequence && nextSubmissionId) {
    await loadSubmissionDetail(nextSubmissionId);
  }
};

const initializePage = async () => {
  pageError.value = "";
  paper.value = null;
  listRequestSequence += 1;
  listLoading.value = false;
  submissions.value = [];
  pagination.total = 0;
  clearSubmissionDetail();

  if (!hasGradingRole.value) {
    pageError.value = "当前账号没有阅卷权限，请使用教师或管理员账号访问。";
    return;
  }
  if (!Number.isInteger(paperId.value) || paperId.value <= 0) {
    pageError.value = "试卷参数无效，请从阅卷列表重新进入。";
    return;
  }

  pageLoading.value = true;
  try {
    await Promise.all([loadPaper(), loadSubmissionCounts()]);
    await loadSubmissionPage();
  } catch (error) {
    pageError.value = getErrorMessage(error, "阅卷页面加载失败");
  } finally {
    pageLoading.value = false;
  }
};

const refreshAfterAction = async (preferredSubmissionId?: number | null) => {
  await Promise.all([loadPaper(), loadSubmissionCounts()]);
  await loadSubmissionPage(preferredSubmissionId);
};

const refreshAfterActionSafely = async (
  preferredSubmissionId?: number | null
) => {
  try {
    await refreshAfterAction(preferredSubmissionId);
  } catch (error) {
    ElMessage.warning(
      getErrorMessage(error, "操作已成功，但最新阅卷数据刷新失败，请手动重试")
    );
  }
};

const handleSelectSubmission = async (submissionId: number) => {
  if (
    submissionId === selectedSubmissionId.value ||
    detailLoading.value ||
    !(await confirmDiscardChanges())
  ) {
    return;
  }
  await loadSubmissionDetail(submissionId);
};

const handleAdjacentSubmission = async (offset: number) => {
  const target = submissions.value[currentListIndex.value + offset];
  if (target) await handleSelectSubmission(target.submissionId);
};

const handleSearch = async () => {
  if (!(await confirmDiscardChanges())) {
    searchForm.keyword = appliedFilters.keyword;
    searchForm.gradeStatus = appliedFilters.gradeStatus;
    return;
  }
  appliedFilters.keyword = searchForm.keyword.trim();
  appliedFilters.gradeStatus = searchForm.gradeStatus;
  pagination.pageNum = 1;
  await loadSubmissionPage();
};

const handleReset = async () => {
  if (!(await confirmDiscardChanges())) {
    searchForm.keyword = appliedFilters.keyword;
    searchForm.gradeStatus = appliedFilters.gradeStatus;
    return;
  }
  searchForm.keyword = "";
  searchForm.gradeStatus = undefined;
  appliedFilters.keyword = "";
  appliedFilters.gradeStatus = undefined;
  pagination.pageNum = 1;
  await loadSubmissionPage();
};

const handlePageChange = async (page: number) => {
  if (page === pagination.pageNum || !(await confirmDiscardChanges())) return;
  pagination.pageNum = page;
  await loadSubmissionPage();
};

const submitCurrentGrade = async () => {
  if (!canGrade.value || !submissionDetail.value) return;
  if (!allScoresValid.value) {
    ElMessage.warning(`还有 ${invalidGradeCount.value} 道题未完成有效评分`);
    return;
  }

  actionLoading.value = "save";
  try {
    const response = await submitGrade({
      submissionId: submissionDetail.value.submissionId,
      grades: gradingAnswers.value.map(item => ({
        questionId: item.question.questionId,
        score: item.score as number,
        comment: item.comment.trim() || undefined
      }))
    });
    assertApiSuccess(response, "保存批改失败");
    hasUnsavedChanges.value = false;
    ElMessage.success("批改结果已保存");
    await refreshAfterActionSafely(submissionDetail.value.submissionId);
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "保存批改失败"));
  } finally {
    actionLoading.value = "";
  }
};

const runAutoGrade = async () => {
  if (!canGrade.value || !(await confirmDiscardChanges())) return;
  try {
    await ElMessageBox.confirm(
      "系统只会自动处理单选、多选、判断、填空、矩阵、连线和排序题，其他题型保留人工评分。",
      "自动批改客观题",
      {
        confirmButtonText: "开始批改",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
  } catch {
    return;
  }

  actionLoading.value = "auto";
  try {
    const response = await autoGradeObjective(paperId.value);
    const data = assertApiSuccess(response, "自动批改失败");
    hasUnsavedChanges.value = false;
    ElMessage.success(`已自动批改 ${data?.gradedCount || 0} 份客观题`);
    await refreshAfterActionSafely(selectedSubmissionId.value);
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "自动批改失败"));
  } finally {
    actionLoading.value = "";
  }
};

const releaseAllScores = async () => {
  if (!canReleaseScores.value || !(await confirmDiscardChanges())) return;
  try {
    await ElMessageBox.confirm(
      "发布后学生将可以查看成绩。请确认所有答卷均已复核。",
      "发布全部成绩",
      {
        confirmButtonText: "确认发布",
        cancelButtonText: "取消",
        type: "warning"
      }
    );
  } catch {
    return;
  }

  actionLoading.value = "release";
  try {
    const response = await releaseScores(paperId.value);
    assertApiSuccess(response, "发布成绩失败");
    hasUnsavedChanges.value = false;
    ElMessage.success("成绩已发布");
    await refreshAfterActionSafely(selectedSubmissionId.value);
  } catch (error) {
    ElMessage.error(getErrorMessage(error, "发布成绩失败"));
  } finally {
    actionLoading.value = "";
  }
};

const goBack = () => router.push("/exam-paper/grading");

onBeforeRouteLeave(async () => confirmDiscardChanges());

onBeforeRouteUpdate(async (to, from) => {
  if (to.params.id === from.params.id) return true;
  return confirmDiscardChanges();
});

watch(
  () => route.params.id,
  (current, previous) => {
    if (previous !== undefined && current !== previous) initializePage();
  }
);

onMounted(() => {
  window.addEventListener("beforeunload", handleBeforeUnload);
  initializePage();
});

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBeforeUnload);
});
</script>

<template>
  <div class="grading-detail-page" :class="{ 'is-dark': isDark }">
    <header class="top-bar">
      <div class="top-bar-main">
        <el-button text class="back-button" @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
          <span>返回阅卷列表</span>
        </el-button>
        <el-divider direction="vertical" />
        <div class="paper-heading">
          <IconDocument class="paper-icon" />
          <div class="paper-heading-text">
            <div class="paper-title-row">
              <h1>{{ paper?.title || "阅卷详情" }}</h1>
              <el-tag v-if="paper" size="small" :type="getPaperStatusType()">
                {{ getPaperStatusText(paper.status) }}
              </el-tag>
              <el-tag v-if="isReadOnlyRoute" size="small" type="info">
                只读查看
              </el-tag>
            </div>
            <p v-if="paper">
              {{ paper.courseName || "未关联课程" }} · 满分
              {{ paper.totalPoints }} 分 · {{ paper.totalQuestions }} 题
            </p>
          </div>
        </div>
      </div>

      <div v-if="paper && hasGradingRole" class="top-actions">
        <div class="progress-summary">
          <span class="progress-label">批改进度</span>
          <el-progress
            :percentage="gradeProgress"
            :stroke-width="7"
            :show-text="false"
          />
          <span v-if="submissionCounts.graded !== null">
            {{ submissionCounts.graded }}/{{ submissionCounts.total ?? "-" }}
          </span>
          <span v-else>-</span>
        </div>
        <el-button
          v-if="!isReadOnlyRoute"
          :loading="actionLoading === 'auto'"
          :disabled="!canGrade || Boolean(actionLoading)"
          @click="runAutoGrade"
        >
          <el-icon><MagicStick /></el-icon>
          自动批改客观题
        </el-button>
        <el-button
          v-if="!isReadOnlyRoute"
          type="primary"
          :loading="actionLoading === 'release'"
          :disabled="!canReleaseScores || Boolean(actionLoading)"
          @click="releaseAllScores"
        >
          <el-icon><Promotion /></el-icon>
          {{ isScoreReleased ? "成绩已发布" : "发布成绩" }}
        </el-button>
      </div>
    </header>

    <main class="page-content">
      <el-skeleton
        v-if="pageLoading"
        animated
        :rows="10"
        class="page-skeleton"
      />

      <el-result
        v-else-if="pageError"
        icon="warning"
        title="无法进入阅卷页面"
        :sub-title="pageError"
      >
        <template #extra>
          <el-button @click="goBack">返回阅卷列表</el-button>
          <el-button
            v-if="hasGradingRole"
            type="primary"
            @click="initializePage"
          >
            重新加载
          </el-button>
        </template>
      </el-result>

      <div v-else-if="paper" class="grading-workspace">
        <aside class="submission-panel" aria-label="学生答卷列表">
          <div class="panel-heading">
            <div>
              <h2>学生答卷</h2>
              <p>
                共 {{ pagination.total }} 份
                <span v-if="countsError">· {{ countsError }}</span>
              </p>
            </div>
            <el-tag type="warning" effect="plain">
              待批 {{ submissionCounts.pending ?? "-" }}
            </el-tag>
          </div>

          <div class="submission-filters">
            <el-input
              v-model="searchForm.keyword"
              clearable
              placeholder="学生姓名或学号"
              @keyup.enter="handleSearch"
              @clear="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
            <div class="filter-row">
              <el-select
                v-model="searchForm.gradeStatus"
                clearable
                placeholder="全部状态"
                @change="handleSearch"
              >
                <el-option
                  v-for="option in gradeStatusOptions"
                  :key="option.value"
                  :label="option.label"
                  :value="option.value"
                />
              </el-select>
              <el-button aria-label="重置筛选" @click="handleReset">
                <el-icon><Refresh /></el-icon>
              </el-button>
            </div>
          </div>

          <div class="submission-list-area">
            <el-skeleton v-if="listLoading" animated :rows="6" />
            <div v-else-if="listError" class="inline-state">
              <el-alert :title="listError" type="error" :closable="false" />
              <el-button size="small" @click="loadSubmissionPage()">
                重试
              </el-button>
            </div>
            <el-empty
              v-else-if="submissions.length === 0"
              :image-size="72"
              description="当前筛选条件下暂无答卷"
            />
            <div v-else class="submission-list">
              <button
                v-for="item in submissions"
                :key="item.submissionId"
                type="button"
                class="submission-item"
                :class="{
                  active: item.submissionId === selectedSubmissionId
                }"
                :aria-current="
                  item.submissionId === selectedSubmissionId
                    ? 'true'
                    : undefined
                "
                @click="handleSelectSubmission(item.submissionId)"
              >
                <span class="student-avatar">
                  {{ item.studentName?.slice(-1) || "学" }}
                </span>
                <span class="student-copy">
                  <strong>{{ item.studentName || "未命名学生" }}</strong>
                  <small>{{ item.studentNo || `ID ${item.studentId}` }}</small>
                </span>
                <span class="submission-state">
                  <el-tag
                    size="small"
                    :type="getGradeStatusType(item.gradeStatus)"
                  >
                    {{ getGradeStatusText(item.gradeStatus) }}
                  </el-tag>
                  <b v-if="item.score !== undefined">{{ item.score }} 分</b>
                </span>
              </button>
            </div>
          </div>

          <div
            v-if="pagination.total > pagination.pageSize"
            class="list-pagination"
          >
            <el-pagination
              small
              background
              layout="prev, pager, next"
              :current-page="pagination.pageNum"
              :page-size="pagination.pageSize"
              :total="pagination.total"
              @current-change="handlePageChange"
            />
          </div>
        </aside>

        <section class="answer-panel" aria-label="答卷批改区域">
          <el-skeleton
            v-if="detailLoading"
            animated
            :rows="9"
            class="detail-skeleton"
          />

          <div v-else-if="detailError" class="detail-state">
            <el-result
              icon="error"
              title="答卷加载失败"
              :sub-title="detailError"
            >
              <template #extra>
                <el-button
                  v-if="selectedSubmissionId"
                  type="primary"
                  @click="loadSubmissionDetail(selectedSubmissionId)"
                >
                  重新加载答卷
                </el-button>
              </template>
            </el-result>
          </div>

          <el-empty
            v-else-if="!submissionDetail"
            description="请从左侧选择一份答卷"
          />

          <template v-else>
            <div class="student-toolbar">
              <div class="student-heading">
                <span class="student-avatar large">
                  {{ submissionDetail.studentName?.slice(-1) || "学" }}
                </span>
                <div>
                  <div class="student-name-row">
                    <h2>{{ submissionDetail.studentName }}</h2>
                    <el-tag
                      size="small"
                      :type="getGradeStatusType(submissionDetail.gradeStatus)"
                    >
                      {{ getGradeStatusText(submissionDetail.gradeStatus) }}
                    </el-tag>
                  </div>
                  <p>
                    {{
                      submissionDetail.studentNo ||
                      `ID ${submissionDetail.studentId}`
                    }}
                    <span v-if="submissionDetail.className">
                      · {{ submissionDetail.className }}
                    </span>
                    · 提交于 {{ formatDateTime(submissionDetail.submitTime) }} ·
                    用时 {{ formatDuration(submissionDetail.duration) }}
                  </p>
                </div>
              </div>
              <div class="student-navigation">
                <el-button
                  :disabled="currentListIndex <= 0"
                  aria-label="上一份答卷"
                  @click="handleAdjacentSubmission(-1)"
                >
                  <el-icon><ArrowLeft /></el-icon>
                </el-button>
                <span>{{ currentListIndex + 1 }}/{{ submissions.length }}</span>
                <el-button
                  :disabled="currentListIndex >= submissions.length - 1"
                  aria-label="下一份答卷"
                  @click="handleAdjacentSubmission(1)"
                >
                  <el-icon><ArrowRight /></el-icon>
                </el-button>
              </div>
            </div>

            <el-alert
              v-if="isScoreReleased"
              title="成绩已发布，当前答卷仅可查看。如需修改，请先在后端恢复可批改状态。"
              type="info"
              :closable="false"
              show-icon
              class="answer-notice"
            />
            <el-alert
              v-else-if="isReadOnlyRoute"
              title="当前为只读查看模式，不会提交评分修改。"
              type="info"
              :closable="false"
              show-icon
              class="answer-notice"
            />

            <div class="answer-list">
              <article
                v-for="(item, index) in gradingAnswers"
                :key="item.question.questionId"
                class="answer-item"
                :class="{
                  'needs-grade': !isGradeScoreValid(
                    item.score,
                    item.question.points
                  )
                }"
              >
                <div class="question-heading">
                  <div class="question-labels">
                    <span class="question-number">{{ index + 1 }}</span>
                    <el-tag size="small" effect="plain">
                      {{ getQuestionTypeText(item.question.questionType) }}
                    </el-tag>
                    <el-tag
                      size="small"
                      :type="
                        isObjectiveQuestionType(item.question.questionType)
                          ? 'success'
                          : 'warning'
                      "
                      effect="plain"
                    >
                      {{ getGradingModeText(item.question.questionType) }}
                    </el-tag>
                  </div>
                  <strong>满分 {{ item.question.points }} 分</strong>
                </div>

                <RichContent
                  :content="getQuestionContent(item.question)"
                  class="question-content"
                />

                <div v-if="item.question.options?.length" class="option-list">
                  <div
                    v-for="option in item.question.options"
                    :key="option.key"
                    class="option-item"
                    :class="{
                      selected: isStudentOption(item, option.key),
                      correct: isCorrectOption(item, option.key)
                    }"
                  >
                    <span class="option-key">{{ option.key }}</span>
                    <span>{{ option.content }}</span>
                    <span class="option-marks">
                      <el-tag
                        v-if="isStudentOption(item, option.key)"
                        size="small"
                        effect="plain"
                      >
                        学生选择
                      </el-tag>
                      <el-tag
                        v-if="isCorrectOption(item, option.key)"
                        size="small"
                        type="success"
                        effect="plain"
                      >
                        正确答案
                      </el-tag>
                    </span>
                  </div>
                </div>

                <dl class="answer-comparison">
                  <div>
                    <dt>学生答案</dt>
                    <dd>{{ formatGradingAnswer(item.answer) }}</dd>
                  </div>
                  <div>
                    <dt>
                      {{
                        isObjectiveQuestionType(item.question.questionType)
                          ? "标准答案"
                          : "参考答案"
                      }}
                    </dt>
                    <dd>
                      {{ formatGradingAnswer(getCorrectAnswer(item.question)) }}
                    </dd>
                  </div>
                  <div v-if="item.isCorrect !== undefined">
                    <dt>客观判定</dt>
                    <dd>
                      <el-tag
                        size="small"
                        :type="item.isCorrect ? 'success' : 'danger'"
                      >
                        {{ item.isCorrect ? "正确" : "错误" }}
                      </el-tag>
                    </dd>
                  </div>
                </dl>

                <div class="grading-controls">
                  <div class="score-control">
                    <label :for="`score-${item.question.questionId}`"
                      >评分</label
                    >
                    <el-input-number
                      :id="`score-${item.question.questionId}`"
                      v-model="item.score"
                      :min="0"
                      :max="item.question.points"
                      :step="0.5"
                      :precision="1"
                      :disabled="!canGrade"
                      controls-position="right"
                      @change="markDirty"
                    />
                    <span>/ {{ item.question.points }} 分</span>
                    <el-button
                      size="small"
                      :disabled="!canGrade"
                      @click="setScore(item, item.question.points)"
                    >
                      满分
                    </el-button>
                    <el-button
                      size="small"
                      :disabled="!canGrade"
                      @click="setScore(item, 0)"
                    >
                      零分
                    </el-button>
                  </div>
                  <div class="comment-control">
                    <label :for="`comment-${item.question.questionId}`"
                      >批改评语</label
                    >
                    <el-input
                      :id="`comment-${item.question.questionId}`"
                      v-model="item.comment"
                      type="textarea"
                      :rows="2"
                      :maxlength="500"
                      show-word-limit
                      :disabled="!canGrade"
                      placeholder="记录得分依据或需要学生改进的要点（可选）"
                      @input="markDirty"
                    />
                  </div>
                </div>
              </article>
            </div>
          </template>
        </section>

        <aside
          v-if="submissionDetail"
          class="summary-panel"
          aria-label="评分汇总"
        >
          <div class="panel-heading summary-heading">
            <div>
              <h2>评分汇总</h2>
              <p>{{ gradingAnswers.length }} 道题</p>
            </div>
            <el-tag v-if="hasUnsavedChanges" type="warning" effect="plain">
              未保存
            </el-tag>
          </div>

          <div class="total-score">
            <span>当前总分</span>
            <strong>{{ currentScore }}</strong>
            <small>/ {{ currentMaxScore }} 分</small>
          </div>

          <div class="score-breakdown">
            <div
              v-for="(item, index) in gradingAnswers"
              :key="item.question.questionId"
              class="score-row"
            >
              <span>第 {{ index + 1 }} 题</span>
              <strong
                :class="{
                  invalid: !isGradeScoreValid(item.score, item.question.points)
                }"
              >
                {{ item.score ?? "未评分" }} / {{ item.question.points }}
              </strong>
            </div>
          </div>

          <div class="save-area">
            <el-alert
              v-if="invalidGradeCount > 0"
              :title="`还有 ${invalidGradeCount} 道题未完成有效评分`"
              type="warning"
              :closable="false"
              show-icon
            />
            <el-button
              v-if="!isReadOnlyRoute"
              type="primary"
              size="large"
              :loading="actionLoading === 'save'"
              :disabled="!canGrade || !allScoresValid || Boolean(actionLoading)"
              @click="submitCurrentGrade"
            >
              <el-icon><CircleCheck /></el-icon>
              保存批改结果
            </el-button>
            <p v-if="submissionDetail.graderName">
              最近批改：{{ submissionDetail.graderName }} ·
              {{ formatDateTime(submissionDetail.gradeTime) }}
            </p>
          </div>
        </aside>
      </div>
    </main>
  </div>
</template>

<style lang="scss" scoped>
.grading-detail-page {
  min-height: calc(100vh - 86px);
  color: var(--el-text-color-primary);
  background: var(--el-bg-color-page);
}

.top-bar {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  gap: 16px;
  align-items: center;
  justify-content: space-between;
  min-height: 76px;
  padding: 12px 16px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
}

.top-bar-main,
.top-actions,
.paper-heading,
.paper-title-row,
.progress-summary,
.student-heading,
.student-name-row,
.student-navigation,
.question-labels,
.score-control {
  display: flex;
  align-items: center;
}

.top-bar-main {
  min-width: 0;
}

.back-button {
  flex: 0 0 auto;
}

.paper-heading {
  min-width: 0;
  gap: 10px;
}

.paper-icon {
  width: 24px;
  height: 24px;
  flex: 0 0 auto;
  color: var(--el-color-primary);
}

.paper-heading-text {
  min-width: 0;

  h1 {
    max-width: min(42vw, 680px);
    margin: 0;
    overflow: hidden;
    font-size: 17px;
    font-weight: 650;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  p {
    margin: 4px 0 0;
    overflow: hidden;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.paper-title-row {
  min-width: 0;
  gap: 8px;
}

.top-actions {
  flex: 0 0 auto;
  gap: 8px;
}

.progress-summary {
  width: 178px;
  gap: 8px;
  color: var(--el-text-color-regular);
  font-size: 12px;

  .el-progress {
    min-width: 64px;
    flex: 1;
  }
}

.progress-label {
  white-space: nowrap;
}

.page-content {
  padding: 12px;
}

.page-skeleton {
  max-width: 1180px;
  padding: 24px;
  margin: 0 auto;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.grading-workspace {
  display: grid;
  grid-template-areas: "submissions answers summary";
  grid-template-columns: 270px minmax(420px, 1fr) 260px;
  gap: 12px;
  height: calc(100vh - 186px);
  min-height: 600px;
}

.submission-panel,
.answer-panel,
.summary-panel {
  min-width: 0;
  overflow: hidden;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
}

.submission-panel {
  grid-area: submissions;
  display: flex;
  flex-direction: column;
}

.answer-panel {
  grid-area: answers;
  display: flex;
  flex-direction: column;
}

.summary-panel {
  grid-area: summary;
  display: flex;
  flex-direction: column;
}

.panel-heading {
  display: flex;
  min-height: 62px;
  padding: 12px 14px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color-lighter);

  h2 {
    margin: 0;
    font-size: 15px;
    font-weight: 650;
  }

  p {
    margin: 4px 0 0;
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }
}

.submission-filters {
  display: grid;
  gap: 8px;
  padding: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.filter-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 34px;
  gap: 8px;

  .el-select,
  .el-button {
    width: 100%;
  }
}

.submission-list-area {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 8px;
}

.submission-list {
  display: grid;
  gap: 4px;
}

.submission-item {
  display: grid;
  width: 100%;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  gap: 9px;
  align-items: center;
  padding: 9px;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
  background: transparent;
  border: 1px solid transparent;
  border-radius: 6px;
  transition:
    background-color 160ms ease,
    border-color 160ms ease;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &:focus-visible {
    outline: 2px solid var(--el-color-primary);
    outline-offset: 1px;
  }

  &.active {
    background: var(--el-color-primary-light-9);
    border-color: var(--el-color-primary-light-5);
  }
}

.student-avatar {
  display: inline-flex;
  width: 36px;
  height: 36px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
  font-size: 13px;
  font-weight: 700;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  border-radius: 50%;

  &.large {
    width: 42px;
    height: 42px;
    font-size: 15px;
  }
}

.student-copy,
.submission-state {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.student-copy {
  gap: 3px;

  strong,
  small {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  strong {
    font-size: 13px;
    font-weight: 600;
  }

  small {
    color: var(--el-text-color-secondary);
    font-size: 11px;
  }
}

.submission-state {
  align-items: flex-end;
  gap: 4px;

  b {
    color: var(--el-text-color-regular);
    font-size: 11px;
    font-weight: 600;
  }
}

.list-pagination {
  display: flex;
  min-height: 46px;
  padding: 8px;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-top: 1px solid var(--el-border-color-lighter);
}

.inline-state {
  display: grid;
  gap: 12px;
  justify-items: center;
  padding: 12px 4px;
}

.detail-skeleton,
.detail-state {
  padding: 24px;
}

.student-toolbar {
  display: flex;
  min-height: 72px;
  padding: 12px 16px;
  flex: 0 0 auto;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.student-heading {
  min-width: 0;
  gap: 10px;

  h2 {
    margin: 0;
    font-size: 16px;
    font-weight: 650;
  }

  p {
    margin: 4px 0 0;
    overflow: hidden;
    color: var(--el-text-color-secondary);
    font-size: 12px;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.student-name-row {
  gap: 8px;
}

.student-navigation {
  flex: 0 0 auto;
  gap: 6px;
  margin-left: 12px;
  color: var(--el-text-color-secondary);
  font-size: 12px;

  .el-button {
    width: 32px;
    padding: 0;
  }
}

.answer-notice {
  flex: 0 0 auto;
  border-radius: 0;
}

.answer-list {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 14px;
}

.answer-item {
  padding: 16px;
  margin-bottom: 12px;
  background: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  &.needs-grade {
    border-color: var(--el-color-warning-light-5);
  }
}

.question-heading {
  display: flex;
  gap: 12px;
  align-items: center;
  justify-content: space-between;

  > strong {
    flex: 0 0 auto;
    color: var(--el-text-color-regular);
    font-size: 12px;
    font-weight: 600;
  }
}

.question-labels {
  flex-wrap: wrap;
  gap: 6px;
}

.question-number {
  display: inline-flex;
  width: 26px;
  height: 26px;
  align-items: center;
  justify-content: center;
  color: var(--el-color-white);
  font-size: 12px;
  font-weight: 700;
  background: var(--el-color-primary);
  border-radius: 50%;
}

.question-content {
  margin: 14px 0;
  color: var(--el-text-color-primary);
}

.option-list {
  display: grid;
  gap: 6px;
  margin-bottom: 12px;
}

.option-item {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) auto;
  gap: 8px;
  align-items: center;
  min-height: 38px;
  padding: 7px 9px;
  color: var(--el-text-color-regular);
  font-size: 13px;
  background: var(--el-fill-color-light);
  border: 1px solid transparent;
  border-radius: 6px;

  &.selected {
    border-color: var(--el-color-primary-light-5);
  }

  &.correct {
    background: var(--el-color-success-light-9);
  }
}

.option-key {
  display: inline-flex;
  width: 24px;
  height: 24px;
  align-items: center;
  justify-content: center;
  font-weight: 650;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 50%;
}

.option-marks {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: flex-end;
}

.answer-comparison {
  display: grid;
  gap: 8px;
  margin: 12px 0;

  > div {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr);
    gap: 10px;
    padding: 9px 10px;
    background: var(--el-fill-color-lighter);
    border-radius: 6px;
  }

  dt {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  dd {
    margin: 0;
    color: var(--el-text-color-primary);
    font-size: 13px;
    line-height: 1.6;
    overflow-wrap: anywhere;
    white-space: pre-wrap;
  }
}

.grading-controls {
  display: grid;
  gap: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.score-control {
  flex-wrap: wrap;
  gap: 8px;

  label,
  > span {
    color: var(--el-text-color-regular);
    font-size: 13px;
  }
}

.comment-control {
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  gap: 8px;
  align-items: start;

  label {
    padding-top: 8px;
    color: var(--el-text-color-regular);
    font-size: 13px;
  }
}

.summary-heading {
  flex: 0 0 auto;
}

.total-score {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 3px 8px;
  padding: 16px;
  align-items: end;
  border-bottom: 1px solid var(--el-border-color-lighter);

  span {
    color: var(--el-text-color-secondary);
    font-size: 12px;
  }

  strong {
    grid-row: span 2;
    color: var(--el-color-primary);
    font-size: 30px;
    line-height: 1;
  }

  small {
    color: var(--el-text-color-regular);
  }
}

.score-breakdown {
  min-height: 0;
  flex: 1;
  overflow-y: auto;
  padding: 8px 14px;
}

.score-row {
  display: flex;
  min-height: 34px;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--el-border-color-lighter);
  color: var(--el-text-color-regular);
  font-size: 12px;

  strong {
    color: var(--el-text-color-primary);

    &.invalid {
      color: var(--el-color-warning);
    }
  }
}

.save-area {
  display: grid;
  gap: 10px;
  padding: 14px;
  border-top: 1px solid var(--el-border-color-lighter);

  .el-button {
    width: 100%;
    margin: 0;
  }

  p {
    margin: 0;
    color: var(--el-text-color-secondary);
    font-size: 11px;
    line-height: 1.5;
    text-align: center;
  }
}

@media (width <= 1280px) {
  .grading-workspace {
    grid-template-areas:
      "submissions answers"
      "summary answers";
    grid-template-rows: minmax(0, 1fr) auto;
    grid-template-columns: 250px minmax(420px, 1fr);
  }

  .summary-panel {
    max-height: 280px;
  }

  .top-actions .progress-summary {
    display: none;
  }
}

@media (width <= 960px) {
  .top-bar {
    align-items: flex-start;
  }

  .top-bar-main {
    flex: 1;
  }

  .top-actions {
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .paper-heading-text h1 {
    max-width: 32vw;
  }

  .grading-workspace {
    grid-template-areas:
      "submissions"
      "answers"
      "summary";
    grid-template-columns: minmax(0, 1fr);
    height: auto;
    min-height: 0;
  }

  .submission-panel,
  .answer-panel,
  .summary-panel {
    max-height: none;
  }

  .submission-list-area {
    max-height: 320px;
  }

  .answer-list,
  .score-breakdown {
    overflow: visible;
  }
}

@media (width <= 640px) {
  .grading-detail-page {
    width: 100%;
    max-width: 100%;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .top-bar {
    position: static;
    display: grid;
    width: 100%;
    max-width: 100%;
    padding: 10px;
  }

  .top-bar-main {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 6px;

    .el-divider,
    .paper-icon {
      display: none;
    }
  }

  .back-button {
    width: 44px;
    min-width: 44px;
    height: 44px;
    align-self: start;

    span {
      display: none;
    }
  }

  .paper-heading-text h1 {
    max-width: 100%;
    font-size: 15px;
  }

  .paper-title-row {
    flex-wrap: wrap;
  }

  .top-actions {
    display: grid;
    grid-template-columns: 1fr 1fr;

    .el-button {
      width: 100%;
      min-height: 44px;
      margin: 0;
      white-space: normal;
    }
  }

  .page-content {
    width: 100%;
    max-width: 100%;
    padding: 8px;
    overflow-x: hidden;
  }

  .grading-workspace,
  .submission-panel,
  .answer-panel,
  .summary-panel,
  .answer-list,
  .answer-item,
  .question-content,
  .grading-controls {
    width: 100%;
    max-width: 100%;
    min-width: 0;
  }

  .submission-filters {
    :deep(.el-input__wrapper),
    :deep(.el-select__wrapper) {
      min-height: 44px;
    }
  }

  .filter-row .el-button,
  .student-navigation .el-button {
    width: 44px;
    min-width: 44px;
    height: 44px;
  }

  .submission-item {
    min-height: 58px;
    padding: 10px;
  }

  .list-pagination {
    :deep(.btn-prev),
    :deep(.btn-next),
    :deep(.el-pager li) {
      min-width: 44px;
      height: 44px;
    }
  }

  .student-toolbar {
    align-items: flex-start;
  }

  .student-heading {
    align-items: flex-start;

    p {
      display: -webkit-box;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: normal;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 2;
    }
  }

  .student-avatar.large {
    display: none;
  }

  .answer-list {
    padding: 8px;
  }

  .answer-item {
    padding: 12px;
  }

  .question-content {
    overflow-x: auto;
  }

  .question-content :deep(.rich-content),
  .question-content :deep(.content-text),
  .question-content :deep(.katex-display) {
    max-width: 100%;
  }

  .question-heading {
    align-items: flex-start;
  }

  .option-item {
    grid-template-columns: 28px minmax(0, 1fr);

    > span:nth-child(2) {
      min-width: 0;
      overflow-wrap: anywhere;
    }
  }

  .option-marks {
    grid-column: 2;
    justify-content: flex-start;
  }

  .answer-comparison > div,
  .comment-control {
    grid-template-columns: 1fr;
  }

  .score-control {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) auto;

    .el-input-number {
      width: 100%;
      min-width: 0;

      :deep(.el-input__wrapper) {
        min-height: 44px;
      }
    }

    .el-button {
      width: 100%;
      min-width: 72px;
      min-height: 44px;
      margin: 0;
    }

    .el-button:first-of-type {
      grid-column: 2;
    }

    .el-button:last-of-type {
      grid-column: 3;
    }
  }

  .save-area .el-button {
    min-height: 44px;
  }

  .comment-control label {
    padding-top: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .submission-item {
    transition: none;
  }
}
</style>
