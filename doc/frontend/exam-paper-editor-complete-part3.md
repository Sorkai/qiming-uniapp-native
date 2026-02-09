# 在线组卷编辑器系统 - 完整设计文档（第三部分）

## 九、实施计划（续）

### 9.2 完整文件结构

```
src/views/exam-paper/
├── index.vue                        # 试卷库列表页面
├── editor/
│   ├── index.vue                # 试卷编辑器主页面
│   ├── hooks/
│   │   ├── usePaperEditor.ts        # 编辑器核心逻辑
│   │   ├── useDragDrop.ts           # 拖拽功能
│   │   ├── useAutoSave.ts           # 自动保存
│   │   └── useAIAnalysis.ts         # AI分析
│   └── components/
│       ├── PaperHeader.vue          # 试卷头部信息
│       ├── PaperOutline.vue         # 左侧题目大纲
│       ├── QuestionToolbar.vue      # 顶部题型工具栏
│       ├── PaperOverview.vue        # 右侧试卷总览
│       ├── QuestionList.vue         # 题目列表容器
│       ├── QuestionItem.vue         # 单个题目容器
│       ├── QuestionGroupHeader.vue  # 题型分组头部
│       ├── AIRecommendDialog.vue    # AI推荐题目弹窗
│       ├── ImportFromBankDialog.vue # 从题库导入弹窗
│       └── questions/               # 各种题型组件
│           ├── index.ts             # 题型组件导出
│           ├── SingleChoice.vue     # 单选题
│           ├── MultipleChoice.vue   # 多选题
│           ├── TrueFalse.vue        # 判断题
│           ├── FillBlank.vue        # 填空题
│           ├── ShortAnswer.vue      # 简答题
│           ├── Essay.vue            # 论述题
│           ├── MatrixSingle.vue     # 矩阵单选
│           ├── MatrixMultiple.vue   # 矩阵多选
│           ├── Matching.vue         # 连线题
│           ├── Sorting.vue          # 排序题
│           └── Composite.vue        # 组合题
├── publish/
│   └── index.vue                    # 发布设置页面
├── grading/
│├── index.vue                    # 阅卷列表页面
│   └── detail.vue                   # 阅卷详情页面
├── statistics/
│   ├── index.vue                    # 学情分析页面
│   └── components/
│       ├── ScoreHistogram.vue       # 成绩分布直方图
│       ├── GradePieChart.vue        # 等级分布饼图
│       ├── KnowledgeRadar.vue       # 知识点雷达图
│       └── QuestionAnalysisTable.vue # 题目分析表格
└── history/
    └── index.vue                    # 出题历史页面

src/views/student-exam/
├── list/
│   └── index.vue                    # 考试/作业列表
├── take/
│   ├── index.vue                    # 答题页面
│   └── components/
│       ├── ExamHeader.vue           # 考试头部（倒计时等）
│       ├── QuestionNav.vue          # 题目导航
│       ├── AnswerArea.vue           # 答题区域
│       └── SubmitConfirm.vue        # 提交确认弹窗
├── result/
│   ├── index.vue                    # 成绩查看页面
│   └── components/
│       ├── ScoreCard.vue            # 成绩卡片
│       ├── AbilityRadar.vue         # 能力雷达图
│       └── AnswerDetail.vue         # 答题详情
└── history/
    └── index.vue                    # 考试历史记录

src/api/
├── exam-paper.ts                    # 试卷管理API
├── question-bank.ts                 # 题库API
├── grading.ts                       # 阅卷API
├── statistics.ts                    # 统计分析API
├── ai-analysis.ts                   # AI分析API
└── student-exam.ts                  # 学生端考试API

src/store/modules/
└── examPaper.ts                     # 试卷编辑器状态管理

types/
└── exam-paper.d.ts                  # 类型定义
```

---

## 十、API接口完整定义

### 10.1 试卷管理接口

```typescript
// src/api/exam-paper.ts
import { http } from "@/utils/http";

/** 获取试卷列表 */
export interface PaperListParams {
  pageNum: number;
  pageSize?: number;
  keyword?: string;
  courseId?: number;
  status?: number;
  creatorId?: number;
}

export const getPaperList = (params: PaperListParams) => {
  return http.request<ApiResponse<{
    total: number;
    list: ExamPaper[];
  }>>("get", "/edu/backend/v1/paper/list", { params });
};

/** 获取试卷详情 */
export const getPaperDetail = (paperId: number) => {
  return http.request<ApiResponse<ExamPaper>>(
    "get",
    `/edu/backend/v1/paper/detail/${paperId}`
  );
};

/** 创建试卷 */
export const createPaper = (data: Partial<ExamPaper>) => {
  return http.request<ApiResponse<{ paperId: number }>>(
    "post",
    "/edu/backend/v1/paper/create",
    { data }
  );
};

/** 更新试卷 */
export const updatePaper = (data: Partial<ExamPaper>) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/paper/update",
    { data }
  );
};

/** 删除试卷 */
export const deletePaper = (paperId: number) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/paper/delete",
    { data: { paperId } }
  );
};

/** 复制试卷 */
export const copyPaper = (paperId: number) => {
  return http.request<ApiResponse<{ paperId: number }>>(
    "post",
    "/edu/backend/v1/paper/copy",
    { data: { paperId } }
  );
};

/** 发布试卷 */
export const publishPaper = (data: PublishConfig) => {
  return http.request<ApiResponse<{ publishId: number }>>(
    "post",
    "/edu/backend/v1/paper/publish",
    { data }
  );
};

/** 获取发布列表 */
export const getPublishList = (params: {
  pageNum: number;
  pageSize?: number;
  courseId?: number;
  type?: number;
}) => {
  return http.request<ApiResponse<{
    total: number;
    list: PublishRecord[];
  }>>("get", "/edu/backend/v1/paper/publish/list", { params });
};
```

### 10.2 阅卷接口

```typescript
// src/api/grading.ts

/** 获取待阅卷列表 */
export const getGradingList = (params: {
  pageNum: number;
  pageSize?: number;
  publishId: number;
  gradingStatus?: number;
  keyword?: string;
}) => {
  return http.request<ApiResponse<{
    total: number;
    gradedCount: number;
    list: AnswerRecord[];
  }>>("get", "/edu/backend/v1/grading/list", { params });
};

/** 获取学生答卷详情 */
export const getAnswerDetail = (recordId: number) => {
  return http.request<ApiResponse<{
    studentInfo: StudentInfo;
    questions: GradingQuestion[];
    objectiveScore: number;
    subjectiveScore: number;
    totalScore: number;
  }>>("get", `/edu/backend/v1/grading/detail/${recordId}`);
};

/** 提交阅卷结果 */
export const submitGrading = (data: {
  recordId: number;
  answers: Array<{
    questionId: number;
    score: number;
    comment?: string;
  }>;
}) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/grading/submit",
    { data }
  );
};

/** 导出成绩 */
export const exportGrades = (publishId: number) => {
  return http.request<Blob>(
    "get",
    `/edu/backend/v1/grading/export/${publishId}`,
    { responseType: "blob" }
  );
};
```

### 10.3 学情分析接口

```typescript
// src/api/statistics.ts

/** 获取考试统计概览 */
export const getExamStatistics = (publishId: number) => {
  return http.request<ApiResponse<{
    participantCount: number;
    submittedCount: number;
    averageScore: number;
    highestScore: number;
    lowestScore: number;
    passRate: number;
    excellentRate: number;
  }>>("get", `/edu/backend/v1/statistics/overview/${publishId}`);
};

/** 获取成绩分布数据 */
export const getScoreDistribution = (publishId: number) => {
  return http.request<ApiResponse<{
    histogram: Array<{ range: string; count: number }>;gradeDistribution: Array<{ grade: string; count: number; percentage: number }>;
  }>>("get", `/edu/backend/v1/statistics/distribution/${publishId}`);
};

/** 获取题目分析数据 */
export const getQuestionAnalysis = (publishId: number) => {
  return http.request<ApiResponse<Array<{
    questionId: number;
    questionNo: number;
    questionType: number;
    stem: string;
    correctRate: number;
    avgScore: number;
    fullScore: number;
    discrimination: number;
  }>>>("get", `/edu/backend/v1/statistics/question-analysis/${publishId}`);
};

/** 获取AI学情分析 */
export const getAILearningAnalysis = (publishId: number) => {
  return http.request<ApiResponse<{
    overallAnalysis: string;
    weakPoints: Array<{ name: string; correctRate: number }>;
    strongPoints: Array<{ name: string; correctRate: number }>;teachingSuggestions: string[];knowledgeMastery: Array<{ name: string; mastery: number }>;
  }>>("post", "/edu/backend/v1/ai/learning-analysis", { data: { publishId } });
};
```

### 10.4 学生端接口

```typescript
// src/api/student-exam.ts

/** 获取学生考试列表 */
export const getStudentExamList = (params: {
  pageNum: number;
  pageSize?: number;
  type?: number;
  status?: string;
}) => {
  return http.request<ApiResponse<{
    total: number;
    list: Array<{
      publishId: number;
      title: string;
      type: number;
      courseName: string;
      startTime: string;
      endTime: string;
      timeLimit: number;
      status: number;
      score?: number;
    }>;
  }>>("get", "/edu/frontend/v1/exam/list", { params });
};

/** 开始考试 */
export const startExam = (publishId: number) => {
  return http.request<ApiResponse<{
    recordId: number;
    paper: ExamPaper;
    remainingTime: number;
    savedAnswers?: Record<number, string>;
  }>>("post", "/edu/frontend/v1/exam/start", { data: { publishId } });
};

/** 保存答案 */
export const saveAnswer = (data: {
  recordId: number;
  questionId: number;
  answer: string;
}) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/frontend/v1/exam/save-answer",
    { data }
  );
};

/** 提交试卷 */
export const submitExam = (recordId: number) => {
  return http.request<ApiResponse<{
    totalScore: number;
    objectiveScore: number;
    gradingStatus: number;
  }>>("post", "/edu/frontend/v1/exam/submit", { data: { recordId } });
};

/** 获取考试结果 */
export const getExamResult = (recordId: number) => {
  return http.request<ApiResponse<{
    totalScore: number;
    fullScore: number;
    rank: number;
    totalStudents: number;
    usedTime: number;
    grade: string;
    answers: AnswerDetail[];
    knowledgePoints: Array<{ name: string; mastery: number }>;
  }>>("get", `/edu/frontend/v1/exam/result/${recordId}`);
};

/** 获取AI学习建议 */
export const getAIStudySuggestion = (recordId: number) => {
  return http.request<ApiResponse<{
    overallComment: string;
    weakPoints: Array<{ name: string; suggestion: string }>;
    recommendedExercises: Array<{ questionId: number; stem: string }>;
  }>>("post", "/edu/frontend/v1/ai/study-suggestion", { data: { recordId } });
};
```

---

## 十一、状态管理设计

```typescript
// src/store/modules/examPaper.ts
import { defineStore } from "pinia";
import type { ExamPaper, QuestionGroup, Question } from "@/types/exam-paper";

interface ExamPaperState {
  // 当前编辑的试卷
  currentPaper: ExamPaper | null;
  // 是否有未保存的更改
  hasUnsavedChanges: boolean;
  // 当前选中的题目ID
  activeQuestionId: number | null;
  // 展开的分组ID列表
  expandedGroups: number[];
  // AI分析结果
  aiAnalysis: AIAnalysisResult | null;
  // 加载状态
  loading: boolean;
  // 自动保存状态
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

export const useExamPaperStore = defineStore("examPaper", {
  state: (): ExamPaperState => ({
    currentPaper: null,
    hasUnsavedChanges: false,
    activeQuestionId: null,
    expandedGroups: [],
    aiAnalysis: null,
    loading: false,
    autoSaveStatus: 'idle',
  }),
  
  getters: {
    // 总题数
    totalQuestions: (state) => {
      if (!state.currentPaper) return 0;
      return state.currentPaper.questionGroups.reduce(
        (sum, group) => sum + group.questions.length,
        0
      );
    },
    
    // 总分
    totalPoints: (state) => {
      if (!state.currentPaper) return 0;
      return state.currentPaper.questionGroups.reduce(
        (sum, group) => sum + group.questions.reduce(
          (s, q) => s + q.points,
          0
        ),
        0
      );
    },
    
    // 题型分布
    typeDistribution: (state) => {
      if (!state.currentPaper) return [];
      const distribution: Record<number, { type: number; count: number; points: number }> = {};
      state.currentPaper.questionGroups.forEach(group => {
        group.questions.forEach(q => {
          if (!distribution[q.questionType]) {
            distribution[q.questionType] = { type: q.questionType, count: 0, points: 0 };
          }
          distribution[q.questionType].count++;
          distribution[q.questionType].points += q.points;
        });
      });
      return Object.values(distribution);
    },
  },
  
  actions: {
    // 初始化试卷
    initPaper(paper: ExamPaper) {
      this.currentPaper = paper;
      this.hasUnsavedChanges = false;
      this.expandedGroups = paper.questionGroups.map(g => g.groupId!);
    },
    
    // 添加题型分组
    addQuestionGroup(group: QuestionGroup) {
      if (!this.currentPaper) return;
      this.currentPaper.questionGroups.push(group);
      this.hasUnsavedChanges = true;
    },
    
    // 添加题目
    addQuestion(groupId: number, question: Question) {
      if (!this.currentPaper) return;
      const group = this.currentPaper.questionGroups.find(g => g.groupId === groupId);
      if (group) {
        group.questions.push(question);
        this.hasUnsavedChanges = true;
      }
    },
    
    // 更新题目
    updateQuestion(questionId: number, updates: Partial<Question>) {
      if (!this.currentPaper) return;
      for (const group of this.currentPaper.questionGroups) {
        const question = group.questions.find(q => q.questionId === questionId);
        if (question) {
          Object.assign(question, updates);
          this.hasUnsavedChanges = true;
          break;
        }
      }
    },
    
    // 删除题目
    deleteQuestion(questionId: number) {
      if (!this.currentPaper) return;
      for (const group of this.currentPaper.questionGroups) {
        const index = group.questions.findIndex(q => q.questionId === questionId);
        if (index !== -1) {
          group.questions.splice(index, 1);
          this.hasUnsavedChanges = true;
          break;
        }
      }
    },
    
    // 移动题目
    moveQuestion(fromGroupId: number, toGroupId: number, questionId: number, newIndex: number) {
      if (!this.currentPaper) return;
      const fromGroup = this.currentPaper.questionGroups.find(g => g.groupId === fromGroupId);
      const toGroup = this.currentPaper.questionGroups.find(g => g.groupId === toGroupId);
      if (fromGroup && toGroup) {
        const questionIndex = fromGroup.questions.findIndex(q => q.questionId === questionId);
        if (questionIndex !== -1) {
          const [question] = fromGroup.questions.splice(questionIndex, 1);
          toGroup.questions.splice(newIndex, 0, question);
          this.hasUnsavedChanges = true;
        }
      }
    },
    
    // 设置AI分析结果
    setAIAnalysis(analysis: AIAnalysisResult) {
      this.aiAnalysis = analysis;
    },
    
    // 标记已保存
    markAsSaved() {
      this.hasUnsavedChanges = false;
      this.autoSaveStatus = 'saved';
    },
  },
});
```

---

## 十二、关键功能实现要点

### 12.1 拖拽功能实现

```typescript
// src/views/exam-paper/editor/hooks/useDragDrop.ts
import { ref } from 'vue';
import { useExamPaperStore } from '@/store/modules/examPaper';

export function useDragDrop() {
  const store = useExamPaperStore();
  const isDragging = ref(false);
  const dragType = ref<'toolbar' | 'outline' | null>(null);
  
  // 从工具栏拖拽题型
  const onToolbarDragStart = (event: DragEvent, questionType: number) => {
    isDragging.value = true;
    dragType.value = 'toolbar';
    event.dataTransfer?.setData('questionType', String(questionType));
  };
  
  // 拖拽到编辑区域
  const onEditorDrop = (event: DragEvent, groupId: number, index: number) => {
    event.preventDefault();
    isDragging.value = false;
    
    if (dragType.value === 'toolbar') {
      const questionType = Number(event.dataTransfer?.getData('questionType'));
      // 创建新题目
      const newQuestion = createEmptyQuestion(questionType);
      store.addQuestion(groupId, newQuestion);
    }
    
    dragType.value = null;
  };
  
  // 大纲拖拽排序
  const onOutlineDragEnd = (event: any) => {
    // 更新题目顺序
    store.hasUnsavedChanges = true;
  };
  
  return {
    isDragging,
    onToolbarDragStart,
    onEditorDrop,
    onOutlineDragEnd,
  };
}
```

### 12.2 自动保存功能

```typescript
// src/views/exam-paper/editor/hooks/useAutoSave.ts
import { watch, onUnmounted } from 'vue';
import { useExamPaperStore } from '@/store/modules/examPaper';
import { updatePaper } from '@/api/exam-paper';
import { useDebounceFn } from '@vueuse/core';

export function useAutoSave() {
  const store = useExamPaperStore();
  let saveTimer: number | null = null;
  
  // 防抖保存
  const debouncedSave = useDebounceFn(async () => {
    if (!store.currentPaper || !store.hasUnsavedChanges) return;
    
    store.autoSaveStatus = 'saving';
    try {
      await updatePaper(store.currentPaper);
      store.markAsSaved();
    } catch (error) {
      store.autoSaveStatus = 'error';
      console.error('自动保存失败:', error);
    }
  }, 3000);
  
  // 监听变化
  watch(
    () => store.hasUnsavedChanges,
    (hasChanges) => {
      if (hasChanges) {
        debouncedSave();
      }
    }
  );
  
  // 页面离开前保存
  const beforeUnload = (event: BeforeUnloadEvent) => {
    if (store.hasUnsavedChanges) {
      event.preventDefault();
      event.returnValue = '您有未保存的更改，确定要离开吗？';
    }
  };
  
  window.addEventListener('beforeunload', beforeUnload);
  
  onUnmounted(() => {
    window.removeEventListener('beforeunload', beforeUnload);
  });
  
  return {
    autoSaveStatus: store.autoSaveStatus,
  };
}
```

---

## 十三、样式设计规范

### 13.1 编辑器主题色

```scss
// src/views/exam-paper/editor/styles/variables.scss

// 主题色
$primary-color: #409eff;
$success-color: #67c23a;
$warning-color: #e6a23c;
$danger-color: #f56c6c;
$info-color: #909399;

// 编辑器布局
$outline-width: 240px;
$overview-width: 280px;
$toolbar-height: 80px;
$header-height: 60px;

// 题目卡片
$question-card-bg: #ffffff;
$question-card-border: #ebeef5;
$question-card-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

// 拖拽状态
$drag-highlight-color: rgba(64, 158, 255, 0.1);
$drag-border-color: #409eff;

// 题型标签颜色
$type-colors: (
  single-choice: #409eff,
  multiple-choice: #67c23a,
  true-false: #e6a23c,
  fill-blank: #f56c6c,
  short-answer: #909399,
  essay: #9c27b0,
  matrix: #00bcd4,
  matching: #ff9800,
  sorting: #795548,
  composite: #607d8b,
);
```

---

## 十四、总结

本设计文档详细规划了在线组卷编辑器系统的完整架构，包括：

1. **四栏式编辑器布局**：左侧大纲导航、顶部题型工具栏、中间编辑区、右侧总览面板
2. **丰富的题型支持**：基础题型（单选、多选、判断、填空、简答、论述）+ 高级题型（矩阵单选/多选、连线、排序、组合）
3. **拖拽式交互**：工具栏拖拽添加题目、大纲拖拽排序、题目拖拽调整位置
4. **AI智能功能**：AI推荐题目、难度评估、改进建议、学情分析
5. **完整的阅卷系统**：客观题自动批改、主观题人工打分、快捷评语
6. **学情分析**：成绩分布直方图、等级饼图、知识点雷达图、AI分析报告
7. **学生端功能**：在线答题、自动保存、成绩查看、个人能力分析

预计总开发工时：约28个工作日

建议开发顺序：
1. 先完成基础架构和数据模型
2. 实现试卷编辑器核心功能
3. 逐步添加高级题型
4. 集成AI功能
5. 完善阅卷和统计功能
6. 最后开发学生端