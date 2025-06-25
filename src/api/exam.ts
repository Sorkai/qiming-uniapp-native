import { http } from "@/utils/http";

export interface ExamListParams {
  pageNum: number;
  pageSize?: number;
  courseName?: string;
}

export interface ExamListResult {
  total: number;
  examList: Array<{
    examId: number;
    courseId: number;
    courseName: string;
    title: string;
    description: string;
    questionNum: number;
    totalPoints: number;
    timeLimit: number;
    availableFrom: string;
    availableTo: string;
  }>;
}

export interface ExamQuestionListParams {
  pageNum: number;
  pageSize?: number;
  examId: number;
}

export interface ExamQuestionListResult {
  total: number;
  questionList: Array<{
    questionType: number; // 题型:1-单选/2-多选/3-判断/4-填空/5-简答/6-论述
    title: string;
    stem: string;
    options: string; // JSON格式，如{"A":"选项1","B":"选项2"}
    correctAnswer: string;
    analysis: string;
    points: number;
    difficulty: number; // 难度等级(1-5)
    sortOrder: number;
  }>;
}

export interface ExamCreateParams {
  courseId: number;
  title: string;
  description: string;
  timeLimit: number; // 分钟
  availableFrom: string; // yyyy-MM-dd HH:mm:ss
  availableTo: string; // yyyy-MM-dd HH:mm:ss
}

export interface ExamUpdateParams {
  examId: number;
  title?: string;
  description?: string;
  timeLimit?: number; // 分钟
  availableFrom?: string; // yyyy-MM-dd HH:mm:ss
  availableTo?: string; // yyyy-MM-dd HH:mm:ss
}

export interface ExamDeleteParams {
  examId: number;
}

export interface ExamQuestionBatchAddParams {
  examId: number;
  questions: Array<{
    questionType: number; // 题型:1-单选/2-多选/3-判断/4-填空/5-简答/6-论述
    title: string;
    stem: string;
    options: string; // JSON格式，如{"A":"选项1","B":"选项2"}
    correctAnswer: string;
    analysis: string;
    points: number;
    difficulty: number; // 难度等级(1-5)
    sortOrder: number;
  }>;
}

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 获取课程考试列表
 */
export const getExamList = (params: ExamListParams) => {
  return http.request<ApiResponse<ExamListResult>>(
    "get",
    "/edu/backend/v1/course/exam/list",
    { params }
  );
};

/**
 * 获取考试试题列表
 */
export const getExamQuestionList = (params: ExamQuestionListParams) => {
  return http.request<ApiResponse<ExamQuestionListResult>>(
    "get",
    "/edu/backend/v1/exam/question/list",
    { params }
  );
};

/**
 * 创建课程考试
 */
export const createExam = (data: ExamCreateParams) => {
  return http.request<ApiResponse<{ examId: number }>>(
    "post",
    "/edu/backend/v1/course/exam/create",
    { data }
  );
};

/**
 * 更新课程考试
 */
export const updateExam = (data: ExamUpdateParams) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/course/exam/update",
    { data }
  );
};

/**
 * 删除课程考试
 */
export const deleteExam = (data: ExamDeleteParams) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/course/exam/delete",
    { data }
  );
};

/**
 * 批量添加课程考试试题
 */
export const batchAddExamQuestions = (data: ExamQuestionBatchAddParams) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/exam/question/batch/add",
    { data }
  );
}; 