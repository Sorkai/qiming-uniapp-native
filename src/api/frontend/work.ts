import { http } from "@/utils/http";

export interface ExamDetailParams {
  examId: number;
  courseId: number;
}

export interface ExamDetailResult {
  examId: number;
  title: string;
  description: string;
  questionCount: number;
  totalScore: number;
  timeLimit: number;
  startTime: string;
  endTime: string;
  questions: Array<{
    questionId: number;
    title: string;
    content: string;
    type: number; // 1：单选题，2：多选题，3：判断题，4：填空题，5：简答题
    score: number;
    options?: Array<{
      optionId: string;
      content: string;
    }>;
  }>;
}

export interface SubmitExamAnswersParams {
  examId: number;
  courseId: number;
  answers: Array<{
    questionId: number;
    answer: string;
  }>;
}

export interface ExamAnswerResult {
  score: number;
  totalScore: number;
}

export interface HomeworkDetailParams {
  homeworkId: number;
  courseId: number;
}

export interface HomeworkDetailResult {
  homeworkId: number;
  title: string;
  description: string;
  questionCount: number;
  totalScore: number;
  deadline: string;
  questions: Array<{
    questionId: number;
    title: string;
    content: string;
    type: number; // 1：单选题，2：多选题，3：判断题，4：填空题，5：简答题
    score: number;
    options?: Array<{
      optionId: string;
      content: string;
    }>;
  }>;
}

export interface SubmitHomeworkAnswersParams {
  homeworkId: number;
  courseId: number;
  answers: Array<{
    questionId: number;
    answer: string;
  }>;
}

export interface HomeworkAnswerResult {
  score: number;
  totalScore: number;
}

export interface CourseExamListResult {
  examId: number;
  title: string;
  description: string;
  questionCount: number;
  totalScore: number;
  timeLimit: number;
  startTime: string;
  endTime: string;
  status: number; // 1：未开始，2：进行中，3：已完成，4：已过期
  score?: number; // 仅当status=3时有值
}

export interface CourseHomeworkListResult {
  homeworkId: number;
  title: string;
  description: string;
  questionCount: number;
  totalScore: number;
  deadline: string;
  status: number; // 1：未开始，2：进行中，3：已完成，4：已过期
  score?: number; // 仅当status=3时有值
}

export interface WrongQuestionListParams {
  page: number;
  pageSize: number;
  sourceType?: number; // 来源类型（1：作业，2：考试，不传则查询全部）
}

export interface WrongQuestionListResult {
  total: number;
  list: Array<{
    wrongQuestionId: number;
    questionId: number;
    title: string;
    content: string;
    type: number; // 1：单选题，2：多选题，3：判断题，4：填空题，5：简答题
    options?: Array<{
      optionId: string;
      content: string;
    }>;
    answer: string; // 正确答案
    userAnswer: string; // 用户答案
    sourceType: number; // 来源类型（1：作业，2：考试）
    sourceId: number; // 来源ID（作业ID或考试ID）
    sourceTitle: string; // 来源标题（作业标题或考试标题）
    createTime: string; // 创建时间
  }>;
}

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 获取考试详情
 */
export const getExamDetail = (data: ExamDetailParams) => {
  return http.request<ApiResponse<ExamDetailResult>>(
    "post",
    "/edu/frontend/v1/work/getExamDetail",
    { data }
  );
};

/**
 * 提交考试答案
 */
export const submitExamAnswers = (data: SubmitExamAnswersParams) => {
  return http.request<ApiResponse<ExamAnswerResult>>(
    "post",
    "/edu/frontend/v1/work/submitExamAnswers",
    { data }
  );
};

/**
 * 获取作业详情
 */
export const getHomeworkDetail = (data: HomeworkDetailParams) => {
  return http.request<ApiResponse<HomeworkDetailResult>>(
    "post",
    "/edu/frontend/v1/work/getHomeworkDetail",
    { data }
  );
};

/**
 * 提交作业答案
 */
export const submitHomeworkAnswers = (data: SubmitHomeworkAnswersParams) => {
  return http.request<ApiResponse<HomeworkAnswerResult>>(
    "post",
    "/edu/frontend/v1/work/submitHomeworkAnswers",
    { data }
  );
};

/**
 * 获取用户课程考试列表
 */
export const getUserCourseExamList = (data: { courseId: number }) => {
  return http.request<ApiResponse<CourseExamListResult[]>>(
    "post",
    "/edu/frontend/v1/work/getUserCourseExamList",
    { data }
  );
};

/**
 * 获取用户课程作业列表
 */
export const getUserCourseHomeworkList = (data: { courseId: number }) => {
  return http.request<ApiResponse<CourseHomeworkListResult[]>>(
    "post",
    "/edu/frontend/v1/work/getUserCourseHomeworkList",
    { data }
  );
};

/**
 * 获取用户错题列表
 */
export const getUserWrongQuestionList = (data: WrongQuestionListParams) => {
  return http.request<ApiResponse<WrongQuestionListResult>>(
    "post",
    "/edu/frontend/v1/work/getUserWrongQuestionList",
    { data }
  );
}; 