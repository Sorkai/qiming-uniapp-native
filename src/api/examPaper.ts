import { http } from "@/utils/http";

//==================== 类型定义 ====================

/** 试卷状态枚举 */
export enum PaperStatus {
  /** 草稿 - 未发布 */
  DRAFT = 0,
  /** 已发布 - 等待考试 */
  PUBLISHED = 1,
  /** 考试中 */
  IN_PROGRESS = 2,
  /** 考试结束 - 未批改 */
  ENDED = 3,
  /** 批改中 */
  GRADING = 4,
  /** 批改完成 - 未发布成绩 */
  GRADED = 5,
  /** 已发布成绩 */
  SCORE_RELEASED = 6
}

/** 题型枚举 */
export enum QuestionType {
  /** 单选题 */
  SINGLE_CHOICE = 1,
  /** 多选题 */
  MULTIPLE_CHOICE = 2,
  /** 判断题 */
  TRUE_FALSE = 3,
  /** 填空题 */
  FILL_BLANK = 4,
  /** 简答题 */
  SHORT_ANSWER = 5,
  /** 论述题 */
  ESSAY = 6,
  /** 矩阵单选 */
  MATRIX_SINGLE = 7,
  /** 矩阵多选 */
  MATRIX_MULTIPLE = 8,
  /** 连线题 */
  MATCHING = 9,
  /** 排序题 */
  ORDERING = 10
}

/** 用户角色枚举 */
export enum UserRole {
  /** 学生 */
  STUDENT = 1,
  /** 教师 */
  TEACHER = 2,
  /** 管理员 */
  ADMIN = 3
}

/** API响应类型 */
export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/** 分页参数 */
export interface PageParams {
  pageNum: number;
  pageSize?: number;
}

/** 分页结果 */
export interface PageResult<T> {
  total: number;
  list: T[];
}

// ==================== 试卷相关类型 ====================

/** 题目选项 */
export interface QuestionOption {
  key: string;
  content: string;
}

/** 矩阵题行/列 */
export interface MatrixItem {
  key: string;
  content: string;
}

/** 连线题配对项 */
export interface MatchingPair {
  left: string;
  right: string;
}

/** 题目数据 */
export interface Question {
  questionId: number;
  questionType: QuestionType;
  /** 题目标题（简短描述） */
  title: string;
  /** 题干内容 */
  stem: string;
  /** 选项（单选/多选/判断） */
  options?: QuestionOption[];
  /** 矩阵题行 */
  matrixRows?: MatrixItem[];
  /** 矩阵题列 */
  matrixCols?: MatrixItem[];
  /** 连线题配对 */
  matchingPairs?: MatchingPair[];
  /** 排序题选项 */
  orderingItems?: string[];
  /** 正确答案（单选/判断/填空） */
  correctAnswer?: string;
  /** 正确答案（多选/矩阵） */
  correctAnswers?: string[];
  /** 参考答案（简答/论述） */
  referenceAnswer?: string;
  /** 答案解析 */
  analysis?: string;
  /** 分值 */
  points: number;
  /** 难度等级(1-5) */
  difficulty?: number;
  /** 知识点标签 */
  knowledgePoints?: string[];
  /** 排序 */
  sortOrder: number;
}

// ==================== 题库相关类型 ====================

/** 题库题目 */
export interface QuestionBankItem {
  id: number;
  type: string;
  typeName: string;
  stem: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  correctAnswers?: string[];
  blanks?: Array<{ answer: string }>;
  referenceAnswer?: string;
  analysis?: string;
  knowledgePoints: string[];
  difficulty: string;
  difficultyName: string;
  points: number;
  createTime: string;
  useCount: number;
}

/** 搜索题库参数 */
export interface SearchQuestionBankParams {
  keyword?: string;
  type?: string;
  difficulty?: string;
  knowledgePoint?: string;
  pageNum?: number;
  pageSize?: number;
}

/** AI 出题参数 */
export interface AIGenerateQuestionParams {
  knowledgePoints: string;
  questionType: string;
  difficulty: string;
  count: number;
  includeAnalysis: boolean;
  polishMode?: boolean;
  originalContent?: string;
}

/** AI 生成的题目 */
export interface AIGeneratedQuestion {
  id: number;
  type: string;
  stem: string;
  options?: QuestionOption[];
  correctAnswer?: string;
  correctAnswers?: string[];
  blanks?: Array<{ answer: string }>;
  referenceAnswer?: string;
  analysis?: string;
  difficulty: string;
  knowledgePoints: string[];
}

/** 知识点 */
export interface KnowledgePoint {
  id: number;
  name: string;
  parentId?: number;
  questionCount: number;
  children?: KnowledgePoint[];
}

/** 题目分组 */
export interface QuestionGroup {
  groupId: number;
  groupName: string;
  questionType: QuestionType;
  questions: Question[];
  sortOrder: number;
}

/** 试卷基本信息 */
export interface Paper {
  paperId: number;
  /** 试卷标题 */
  title: string;
  /** 试卷描述 */
  description?: string;
  /** 所属课程ID */
  courseId: number;
  /** 所属课程名称 */
  courseName?: string;
  /** 创建者ID */
  creatorId: number;
  /** 创建者名称 */
  creatorName?: string;
  /** 试卷状态 */
  status: PaperStatus;
  /** 考试时长（分钟） */
  timeLimit: number;
  /** 总分 */
  totalPoints: number;
  /** 总题数 */
  totalQuestions: number;
  /** 开始时间 */
  startTime?: string;
  /** 结束时间 */
  endTime?: string;
  /** 创建时间 */
  createTime: string;
  /** 更新时间 */
  updateTime: string;
  /** 题目分组 */
  questionGroups?: QuestionGroup[];
}

/** 试卷列表项 */
export interface PaperListItem {
  paperId: number;
  title: string;
  courseName: string;
  creatorName: string;
  status: PaperStatus;
  statusText: string;
  timeLimit: number;
  totalPoints: number;
  totalQuestions: number;
  startTime?: string;
  endTime?: string;
  createTime: string;
  /** 参与人数 */
  participantCount: number;
  /** 已提交人数 */
  submittedCount: number;
  /** 已批改人数 */
  gradedCount: number;
}

// ==================== 发布相关类型 ====================

/** 发布目标类型 */
export enum PublishTargetType {
  /** 全部学生 */
  ALL = 1,
  /** 指定班级 */
  CLASS = 2,
  /** 指定学生 */
  STUDENT = 3
}

/** 发布配置 */
export interface PublishConfig {
  /** 发布目标类型 */
  targetType: PublishTargetType;
  /** 目标ID列表（班级ID或学生ID） */
  targetIds?: number[];
  /** 开始时间 */
  startTime: string;
  /** 结束时间 */
  endTime: string;
  /** 是否允许迟交 */
  allowLateSubmit?: boolean;
  /** 迟交截止时间 */
  lateSubmitDeadline?: string;
  /** 是否打乱题目顺序 */
  shuffleQuestions?: boolean;
  /** 是否打乱选项顺序 */
  shuffleOptions?: boolean;
  /** 是否显示答案解析（交卷后） */
  showAnalysis?: boolean;
  /** 是否显示正确答案（交卷后） */
  showCorrectAnswer?: boolean;
}

/** 发布目标学生 */
export interface PublishTargetStudent {
  studentId: number;
  studentName: string;
  studentNo: string;
  className: string;
  selected?: boolean;
}

/** 班级信息 */
export interface ClassInfo {
  classId: number;
  className: string;
  studentCount: number;
}

// ==================== 答卷相关类型 ====================

/** 学生答案 */
export interface StudentAnswer {
  questionId: number;
  answer: string | string[];
  /** 得分（批改后） */
  score?: number;
  /** 批改评语 */
  comment?: string;
  /** 是否正确（客观题自动判断） */
  isCorrect?: boolean;
}

/** 学生答卷 */
export interface StudentSubmission {
  submissionId: number;
  paperId: number;
  paperTitle: string;
  studentId: number;
  studentName: string;
  studentNo: string;
  className: string;
  /** 提交状态：0-未提交 1-已提交 2-迟交 */
  submitStatus: number;
  /** 提交时间 */
  submitTime?: string;
  /** 开始答题时间 */
  startTime?: string;
  /** 用时（秒） */
  duration?: number;
  /** 总分 */
  totalScore?: number;
  /** 得分 */
  score?: number;
  /** 批改状态：0-未批改 1-批改中 2-已批改 */
  gradeStatus: number;
  /** 批改人ID */
  graderId?: number;
  /** 批改人名称 */
  graderName?: string;
  /** 批改时间 */
  gradeTime?: string;
  /** 学生答案列表 */
  answers?: StudentAnswer[];
}

/** 批改数据 */
export interface GradeData {
  submissionId: number;
  grades: Array<{
    questionId: number;
    score: number;
    comment?: string;
  }>;
}

// ==================== 统计相关类型 ====================

/** 试卷统计数据 */
export interface PaperStatistics {
  paperId: number;
  paperTitle: string;
  /** 参与人数 */
  participantCount: number;
  /** 已提交人数 */
  submittedCount: number;
  /** 已批改人数 */
  gradedCount: number;
  /** 平均分 */
  averageScore: number;
  /** 最高分 */
  maxScore: number;
  /** 最低分 */
  minScore: number;
  /** 及格率 */
  passRate: number;
  /** 优秀率（>=90分） */
  excellentRate: number;
  /** 分数分布 */
  scoreDistribution: Array<{
    range: string;
    count: number;
    percentage: number;
  }>;
  /** 题目正确率 */
  questionAccuracy: Array<{
    questionId: number;
    questionTitle: string;
    accuracy: number;
  }>;
}

// ==================== API请求参数类型 ====================

/** 获取试卷列表参数 */
export interface GetPaperListParams extends PageParams {
  /** 课程ID */
  courseId?: number;
  /** 试卷状态 */
  status?: PaperStatus;
  /** 关键词搜索 */
  keyword?: string;
  /** 创建者ID（教师查看自己的试卷） */
  creatorId?: number;
}

/** 创建试卷参数 */
export interface CreatePaperParams {
  title: string;
  description?: string;
  courseId: number;
  timeLimit: number;
  questionGroups: Array<{
    groupName: string;
    questionType: QuestionType;
    questions: Array<Omit<Question, "questionId" | "sortOrder">>;
  }>;
}

/** 更新试卷参数 */
export interface UpdatePaperParams {
  paperId: number;
  title?: string;
  description?: string;
  timeLimit?: number;
  questionGroups?: Array<{
    groupId?: number;
    groupName: string;
    questionType: QuestionType;
    questions: Array<Omit<Question, "sortOrder"> & { questionId?: number }>;
  }>;
}

/** 发布试卷参数 */
export interface PublishPaperParams {
  paperId: number;
  config: PublishConfig;
}

/** 获取答卷列表参数 */
export interface GetSubmissionListParams extends PageParams {
  paperId: number;
  /** 提交状态 */
  submitStatus?: number;
  /** 批改状态 */
  gradeStatus?: number;
  /** 学生姓名/学号搜索 */
  keyword?: string;
}

/** 获取学生考试列表参数（学生端） */
export interface GetStudentExamListParams extends PageParams {
  /** 课程ID */
  courseId?: number;
  /** 状态：0-待考试 1-进行中 2-已结束 */
  status?: number;
}

// ==================== API接口 ====================

/**
 * 获取试卷列表（教师/管理员）
 */
export const getPaperList = (params: GetPaperListParams) => {
  return http.request<ApiResponse<PageResult<PaperListItem>>>(
    "get",
    "/edu/backend/v1/paper/list",
    { params }
  );
};

/**
 * 获取试卷详情
 */
export const getPaperDetail = (paperId: number) => {
  return http.request<ApiResponse<Paper>>(
    "get",
    `/edu/backend/v1/paper/detail/${paperId}`
  );
};

/**
 * 创建试卷
 */
export const createPaper = (data: CreatePaperParams) => {
  return http.request<ApiResponse<{ paperId: number }>>(
    "post",
    "/edu/backend/v1/paper/create",
    { data }
  );
};

/**
 * 更新试卷
 */
export const updatePaper = (data: UpdatePaperParams) => {
  return http.request<ApiResponse>("post", "/edu/backend/v1/paper/update", {
    data
  });
};

/**
 * 删除试卷
 */
export const deletePaper = (paperId: number) => {
  return http.request<ApiResponse>("post", "/edu/backend/v1/paper/delete", {
    data: { paperId }
  });
};

/**
 * 发布试卷
 */
export const publishPaper = (data: PublishPaperParams) => {
  return http.request<ApiResponse>("post", "/edu/backend/v1/paper/publish", {
    data
  });
};

/**
 * 撤回发布
 */
export const unpublishPaper = (paperId: number) => {
  return http.request<ApiResponse>("post", "/edu/backend/v1/paper/unpublish", {
    data: { paperId }
  });
};

/**
 * 获取可发布的班级列表
 */
export const getPublishClasses = (courseId: number) => {
  return http.request<ApiResponse<ClassInfo[]>>(
    "get",
    "/edu/backend/v1/paper/publish/classes",
    { params: { courseId } }
  );
};

/**
 * 获取可发布的学生列表
 */
export const getPublishStudents = (params: {
  courseId: number;
  classId?: number;
  keyword?: string;
}) => {
  return http.request<ApiResponse<PublishTargetStudent[]>>(
    "get",
    "/edu/backend/v1/paper/publish/students",
    { params }
  );
};

/**
 * 获取答卷列表（阅卷用）
 */
export const getSubmissionList = (params: GetSubmissionListParams) => {
  return http.request<ApiResponse<PageResult<StudentSubmission>>>(
    "get",
    "/edu/backend/v1/paper/submission/list",
    { params }
  );
};

/**
 * 获取答卷详情（阅卷用）
 */
export const getSubmissionDetail = (submissionId: number) => {
  return http.request<ApiResponse<StudentSubmission>>(
    "get",
    `/edu/backend/v1/paper/submission/detail/${submissionId}`
  );
};

/**
 * 提交批改
 */
export const submitGrade = (data: GradeData) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/paper/grade/submit",
    { data }
  );
};

/**
 * 批量自动批改（客观题）
 */
export const autoGradeObjective = (paperId: number) => {
  return http.request<ApiResponse<{ gradedCount: number }>>(
    "post",
    "/edu/backend/v1/paper/grade/auto",
    { data: { paperId } }
  );
};

/**
 * 发布成绩
 */
export const releaseScores = (paperId: number) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/paper/score/release",
    { data: { paperId } }
  );
};

/**
 * 获取试卷统计数据
 */
export const getPaperStatistics = (paperId: number) => {
  return http.request<ApiResponse<PaperStatistics>>(
    "get",
    `/edu/backend/v1/paper/statistics/${paperId}`
  );
};

// ==================== 学情分析相关类型 ====================

/** 学情分析总览数据 */
export interface LearningAnalyticsOverview {
  /** 考试总数 */
  totalExams: number;
  /** 参与学生数 */
  totalStudents: number;
  /** 平均分 */
  avgScore: number;
  /** 及格率 */
  passRate: number;
}

/** 成绩分布项 */
export interface ScoreDistributionItem {
  range: string;
  count: number;
  percentage: number;
}

/** 知识点掌握情况 */
export interface KnowledgePointMastery {
  name: string;
  mastery: number;
  questionCount: number;
}

/** 题型统计 */
export interface QuestionTypeStatItem {
  type: string;
  correctRate: number;
  avgTime: number;
}

/** 考试趋势 */
export interface ExamTrendItem {
  date: string;
  avgScore: number;
  passRate: number;
}

/** 学生排名 */
export interface StudentRankingItem {
  rank: number;
  name: string;
  studentId: string;
  score: number;
  trend: "up" | "down" | "same";
}

/** 学情分析完整数据 */
export interface LearningAnalyticsData {
  overview: LearningAnalyticsOverview;
  scoreDistribution: ScoreDistributionItem[];
  knowledgePoints: KnowledgePointMastery[];
  questionTypeStats: QuestionTypeStatItem[];
  examTrends: ExamTrendItem[];
  studentRanking: StudentRankingItem[];
}

/** 获取学情分析参数 */
export interface GetLearningAnalyticsParams {
  courseId?: number;
  startDate?: string;
  endDate?: string;
}

/**
 * 获取学情分析数据
 */
export const getLearningAnalytics = (params?: GetLearningAnalyticsParams) => {
  return http.request<ApiResponse<LearningAnalyticsData>>(
    "get",
    "/edu/backend/v1/paper/learning-analytics",
    { params }
  );
};

/**
 * 获取课程列表（用于筛选）
 */
export const getCourseList = () => {
  return http.request<ApiResponse<Array<{ id: number; name: string }>>>(
    "get",
    "/edu/backend/v1/course/list"
  );
};

// ==================== 题库和题目助手API ====================

/**
 * 搜索题库题目
 */
export const searchQuestionBank = (params: SearchQuestionBankParams) => {
  return http.request<ApiResponse<PageResult<QuestionBankItem>>>(
    "get",
    "/edu/backend/v1/question-bank/search",
    { params }
  );
};

/**
 * AI 生成题目
 */
export const aiGenerateQuestion = (data: AIGenerateQuestionParams) => {
  return http.request<ApiResponse<AIGeneratedQuestion[]>>(
    "post",
    "/edu/backend/v1/ai/generate-question",
    { data }
  );
};

/**
 * 获取知识点列表
 */
export const getKnowledgePoints = () => {
  return http.request<ApiResponse<KnowledgePoint[]>>(
    "get",
    "/edu/backend/v1/knowledge-points"
  );
};

// ==================== 题库管理API ====================

/** 题库文件夹 */
export interface QuestionFolder {
  id: number;
  name: string;
  parentId?: number;
  questionCount: number;
  createTime: string;
  children?: QuestionFolder[];
}

/** 获取题库列表参数 */
export interface GetQuestionBankListParams extends PageParams {
  keyword?: string;
  type?: string;
  difficulty?: string;
  knowledgePoint?: string;
  folderId?: number;
}

/** 题库题目完整信息 */
export interface QuestionBankFullItem extends QuestionBankItem {
  folderId?: number;
  folderName?: string;
  subject?: string;
  subjectName?: string;
}

/** 题库统计数据 */
export interface QuestionBankStatistics {
  total: number;
  radio: number;
  checkbox: number;
  judge: number;
  input: number;
  textarea: number;
}

/**
 * 获取题库列表
 */
export const getQuestionBankList = (params: GetQuestionBankListParams) => {
  return http.request<ApiResponse<PageResult<QuestionBankFullItem>>>(
    "get",
    "/edu/backend/v1/question-bank/list",
    { params }
  );
};

/**
 * 获取题库统计数据
 */
export const getQuestionBankStatistics = () => {
  return http.request<ApiResponse<QuestionBankStatistics>>(
    "get",
    "/edu/backend/v1/question-bank/statistics"
  );
};

/**
 * 创建题目
 */
export const createQuestion = (data: Partial<QuestionBankFullItem>) => {
  return http.request<ApiResponse<{ id: number }>>(
    "post",
    "/edu/backend/v1/question-bank/create",
    { data }
  );
};

/**
 * 更新题目
 */
export const updateQuestion = (data: Partial<QuestionBankFullItem>) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/question-bank/update",
    { data }
  );
};

/**
 * 删除题目
 */
export const deleteQuestion = (id: number) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/question-bank/delete",
    { data: { id } }
  );
};

/**
 * 批量删除题目
 */
export const batchDeleteQuestions = (ids: number[]) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/question-bank/batch-delete",
    { data: { ids } }
  );
};

/**
 * 导入题目
 */
export const importQuestions = (data: {
  file?: File;
  questions?: Partial<QuestionBankFullItem>[];
  folderId?: number;
}) => {
  return http.request<
    ApiResponse<{ importedCount: number; failedCount: number }>
  >("post", "/edu/backend/v1/question-bank/import", { data });
};

/**
 * 导出题目
 */
export const exportQuestions = (params: {
  ids?: number[];
  folderId?: number;
  format?: "json" | "excel" | "word";
}) => {
  return http.request<ApiResponse<{ downloadUrl: string }>>(
    "get",
    "/edu/backend/v1/question-bank/export",
    { params }
  );
};

/**
 * 获取题库文件夹列表
 */
export const getQuestionFolders = () => {
  return http.request<ApiResponse<QuestionFolder[]>>(
    "get",
    "/edu/backend/v1/question-bank/folders"
  );
};

/**
 * 创建题库文件夹
 */
export const createQuestionFolder = (data: {
  name: string;
  parentId?: number;
}) => {
  return http.request<ApiResponse<{ id: number }>>(
    "post",
    "/edu/backend/v1/question-bank/folders/create",
    { data }
  );
};

/**
 * 更新题库文件夹
 */
export const updateQuestionFolder = (data: { id: number; name: string }) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/question-bank/folders/update",
    { data }
  );
};

/**
 * 删除题库文件夹
 */
export const deleteQuestionFolder = (id: number) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/question-bank/folders/delete",
    { data: { id } }
  );
};

/**
 * 移动题目到文件夹
 */
export const moveQuestionsToFolder = (data: {
  questionIds: number[];
  folderId: number;
}) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/question-bank/move-to-folder",
    { data }
  );
};

/**
 * 归档题目到题库
 */
export const archiveQuestionToBank = (data: {
  questions: Array<Partial<QuestionBankFullItem>>;
}) => {
  return http.request<ApiResponse<{ archivedCount: number }>>(
    "post",
    "/edu/backend/v1/question-bank/archive",
    { data }
  );
};

/**
 * 批量归档题目到题库
 */
export const batchArchiveToBank = (data: {
  questions: Array<Partial<QuestionBankFullItem>>;
}) => {
  return http.request<ApiResponse<{ archivedCount: number }>>(
    "post",
    "/edu/backend/v1/question-bank/batch-archive",
    { data }
  );
};

/**
 * 保存为模板
 */
export const saveAsTemplate = (data: {
  name: string;
  description?: string;
  questionGroups: any[];
}) => {
  return http.request<ApiResponse<{ templateId: number }>>(
    "post",
    "/edu/backend/v1/paper/save-as-template",
    { data }
  );
};

/**
 * 获取模板详情
 */
export const getTemplateDetail = (templateId: string) => {
  return http.request<ApiResponse<any>>(
    "get",
    `/edu/backend/v1/paper/template/${templateId}`
  );
};

// ==================== 试卷发布高级配置 ====================

/** 试卷高级发布配置 */
export interface AdvancedPublishConfig extends PublishConfig {
  /** 防作弊设置 */
  antiCheat?: {
    /** 是否启用IP限制（同一IP只能答一次） */
    ipRestriction?: boolean;
    /** 是否启用浏览器指纹检测 */
    browserFingerprint?: boolean;
    /** 是否禁止切换窗口 */
    preventWindowSwitch?: boolean;
    /** 切换窗口警告次数上限 */
    maxWindowSwitchWarnings?: number;
  };
  /** 补考设置 */
  retake?: {
    /** 是否允许补考 */
    allowRetake?: boolean;
    /** 最大补考次数 */
    maxRetakeCount?: number;
    /** 补考开始时间 */
    retakeStartTime?: string;
    /** 补考结束时间 */
    retakeEndTime?: string;
    /** 补考是否使用原题 */
    useOriginalQuestions?: boolean;
  };
  /** 成绩设置 */
  scoring?: {
    /** 及格分数线 */
    passScore?: number;
    /** 是否取最高分（多次考试） */
    useHighestScore?: boolean;
  };
}

/**
 * 发布试卷（高级配置）
 */
export const publishPaperAdvanced = (data: {
  paperId: number;
  config: AdvancedPublishConfig;
}) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/paper/publish-advanced",
    { data }
  );
};

// ==================== 学生端API ====================

/**
 * 获取学生考试列表
 */
export const getStudentExamList = (params: GetStudentExamListParams) => {
  return http.request<
    ApiResponse<
      PageResult<{
        paperId: number;
        paperTitle: string;
        courseName: string;
        timeLimit: number;
        totalPoints: number;
        startTime: string;
        endTime: string;
        /** 状态：0-待考试 1-进行中 2-已结束 */
        status: number;
        /** 是否已提交 */
        submitted: boolean;
        /** 得分（成绩发布后） */
        score?: number;
      }>
    >
  >("get", "/edu/frontend/v1/exam/list", { params });
};

/**
 * 开始考试
 */
export const startExam = (paperId: number) => {
  return http.request<
    ApiResponse<{
      submissionId: number;
      paper: Paper;
      remainingTime: number;
    }>
  >("post", "/edu/frontend/v1/exam/start", { data: { paperId } });
};

/**
 * 保存答案（自动保存，包含答题时长）
 */
export const saveAnswer = (data: {
  submissionId: number;
  questionId: number;
  answer: string | string[];
  duration?: number; // 该题累计答题时长（秒）
}) => {
  return http.request<ApiResponse>("post", "/edu/frontend/v1/exam/save", {
    data
  });
};

/**
 * 提交试卷
 */
export const submitExam = (submissionId: number) => {
  return http.request<
    ApiResponse<{
      score?: number;
      showScore: boolean;
    }>
  >("post", "/edu/frontend/v1/exam/submit", { data: { submissionId } });
};

/**
 * 查看考试结果
 */
export const getExamResult = (submissionId: number) => {
  return http.request<ApiResponse<StudentSubmission>>(
    "get",
    `/edu/frontend/v1/exam/result/${submissionId}`
  );
};

// ==================== 工具函数 ====================

/**
 * 获取试卷状态文本
 */
export const getPaperStatusText = (status: PaperStatus): string => {
  const statusMap: Record<PaperStatus, string> = {
    [PaperStatus.DRAFT]: "草稿",
    [PaperStatus.PUBLISHED]: "已发布",
    [PaperStatus.IN_PROGRESS]: "考试中",
    [PaperStatus.ENDED]: "已结束",
    [PaperStatus.GRADING]: "批改中",
    [PaperStatus.GRADED]: "已批改",
    [PaperStatus.SCORE_RELEASED]: "已发布成绩"
  };
  return statusMap[status] || "未知";
};

/**
 * 获取试卷状态标签类型
 */
export const getPaperStatusType = (status: PaperStatus): string => {
  const typeMap: Record<PaperStatus, string> = {
    [PaperStatus.DRAFT]: "info",
    [PaperStatus.PUBLISHED]: "primary",
    [PaperStatus.IN_PROGRESS]: "warning",
    [PaperStatus.ENDED]: "danger",
    [PaperStatus.GRADING]: "warning",
    [PaperStatus.GRADED]: "success",
    [PaperStatus.SCORE_RELEASED]: "success"
  };
  return typeMap[status] || "info";
};

/**
 * 获取题型名称
 */
export const getQuestionTypeName = (type: QuestionType): string => {
  const typeMap: Record<QuestionType, string> = {
    [QuestionType.SINGLE_CHOICE]: "单选题",
    [QuestionType.MULTIPLE_CHOICE]: "多选题",
    [QuestionType.TRUE_FALSE]: "判断题",
    [QuestionType.FILL_BLANK]: "填空题",
    [QuestionType.SHORT_ANSWER]: "简答题",
    [QuestionType.ESSAY]: "论述题",
    [QuestionType.MATRIX_SINGLE]: "矩阵单选",
    [QuestionType.MATRIX_MULTIPLE]: "矩阵多选",
    [QuestionType.MATCHING]: "连线题",
    [QuestionType.ORDERING]: "排序题"
  };
  return typeMap[type] || "未知题型";
};

/**
 * 判断是否为客观题（可自动批改）
 */
export const isObjectiveQuestion = (type: QuestionType): boolean => {
  return [
    QuestionType.SINGLE_CHOICE,
    QuestionType.MULTIPLE_CHOICE,
    QuestionType.TRUE_FALSE,
    QuestionType.FILL_BLANK,
    QuestionType.MATCHING,
    QuestionType.ORDERING
  ].includes(type);
};

/**
 * 判断是否为主观题（需人工批改）
 */
export const isSubjectiveQuestion = (type: QuestionType): boolean => {
  return [QuestionType.SHORT_ANSWER, QuestionType.ESSAY].includes(type);
};
