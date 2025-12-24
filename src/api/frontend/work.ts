import { http } from "@/utils/http";
import type { ApiResponse } from "./types";

export interface ExamDetailParams {
  examId: number;
  courseId: number;
}

export interface ExamDetailResult {
  examId: number;
  title: string;
  description: string;
  questionNum: number;
  totalPoints: number;
  timeLimit: number;
  availableFrom: string;
  availableTo: string;
  finished: number;
  score: number;
  questionList: Array<{
    questionId: number;
    questionType: number;
    title: string;
    stem: string;
    content?: string;
    options: string | null;
    correctAnswer: string;
    analysis: string;
    points: number;
    difficulty: number;
    sortOrder: number;
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
  questionNum: number;
  totalPoints: number;
  dueDate: string;
  finished: number;
  score: number;
  questionList: Array<{
    questionId: number;
    questionType: number;
    title: string;
    stem: string;
    content?: string;
    options: string | null;
    correctAnswer: string;
    analysis: string;
    points: number;
    difficulty: number;
    sortOrder: number;
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
  questionNum: number;
  totalPoints: number;
  timeLimit: number;
  availableFrom: string;
  availableTo: string;
  status: number;
  score: number;
}

export interface CourseHomeworkListResult {
  homeworkId: number;
  title: string;
  description: string;
  questionNum: number;
  totalPoints: number;
  dueDate: string;
  status: number;
  score: number;
}

export interface WrongQuestionListParams {
  page?: number; // 兼容旧参数
  pageNum?: number; // 文档中的参数名
  pageSize?: number;
  sourceType?: number; // 1：作业，2：考试，3：自测题
  courseId?: number; // 可选课程筛选
}

export interface WrongQuestionListResult {
  total: number;
  list: Array<{
    id: number; // 错题ID
    sourceType: number; // 来源类型 1:作业 2:考试 3:自测题
    sourceId: number; // 来源ID
    sourceName: string; // 来源名称
    questionId: number; // 题目ID
    questionType: number; // 1-单选/2-多选/3-判断/4-填空/5-简答/6-论述
    title: string; // 题目标题
    stem: string; // 题目题干
    options: string | null; // 选项(JSON字符串)
    analysis: string | null; // 解析
    answer: string; // 正确答案
    userAnswer: string; // 用户答案
    wrongNum: number; // 错误次数
    lastWrongTime: string; // 最近错误时间
  }>;
}

/**
 * 获取考试详情
 */
export const getExamDetail = (params: ExamDetailParams) => {
  return http.request<ApiResponse<ExamDetailResult>>(
    "get",
    "/edu/frontend/v1/exam/detail",
    { params }
  );
};

/**
 * 提交考试答案
 */
export const submitExamAnswers = (data: SubmitExamAnswersParams) => {
  return http.request<ApiResponse<ExamAnswerResult>>(
    "post",
    "/edu/frontend/v1/exam/submit",
    { data }
  );
};

/**
 * 获取作业详情
 */
export const getHomeworkDetail = (params: HomeworkDetailParams) => {
  return http.request<ApiResponse<HomeworkDetailResult>>(
    "get",
    "/edu/frontend/v1/homework/detail",
    { params }
  );
};

/**
 * 提交作业答案
 */
export const submitHomeworkAnswers = (data: SubmitHomeworkAnswersParams) => {
  return http.request<ApiResponse<HomeworkAnswerResult>>(
    "post",
    "/edu/frontend/v1/homework/submit",
    { data }
  );
};

/**
 * 获取用户课程考试列表
 */
export const getUserCourseExamList = (params: { courseId: number }) => {
  return http.request<ApiResponse<CourseExamListResult[]>>(
    "get",
    "/edu/frontend/v1/course/exam/list",
    { params }
  );
};

/**
 * 获取用户课程作业列表
 */
export const getUserCourseHomeworkList = (params: { courseId: number }) => {
  return http.request<ApiResponse<CourseHomeworkListResult[]>>(
    "get",
    "/edu/frontend/v1/course/homework/list",
    { params }
  );
};

/**
 * 获取用户错题列表
 */
export const getUserWrongQuestionList = (params: WrongQuestionListParams) => {
  return http.request<ApiResponse<WrongQuestionListResult>>(
    "get",
    "/edu/frontend/v1/wrong/question/list",
    { params }
  );
};
