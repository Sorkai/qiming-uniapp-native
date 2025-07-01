import { http } from "@/utils/http";

export interface HomeworkListParams {
  pageNum: number;
  pageSize?: number;
  homeworkName?: string;
  courseId?: number;
}

export interface HomeworkListResult {
  total: number;
  homeworkList: Array<{
    homeworkId: number;
    courseId: number;
    courseName: string;
    chapterId: number;
    chapterName: string;
    hourId: number;
    hourName: string;
    title: string;
    description: string;
    questionNum: number;
    totalPoints: number;
    dueDate: string;
  }>;
}

export interface HomeworkQuestionListParams {
  pageNum: number;
  pageSize?: number;
  homeworkId: number;
}

export interface HomeworkQuestionListResult {
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

export interface HomeworkCreateParams {
  courseId: number;
  chapterId: number;
  hourId: number;
  title: string;
  description: string;
  dueDate: string; // yyyy-MM-dd HH:mm:ss
}

export interface HomeworkUpdateParams {
  homeworkId: number;
  title?: string;
  description?: string;
  dueDate?: string; // yyyy-MM-dd HH:mm:ss
}

export interface HomeworkDeleteParams {
  homeworkId: number;
}

export interface HomeworkQuestionBatchAddParams {
  homeworkId: number;
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
 * 获取课程章节作业列表
 */
export const getHomeworkList = (params: HomeworkListParams) => {
  return http.request<ApiResponse<HomeworkListResult>>(
    "get",
    "/edu/backend/v1/course/homework/list",
    { params }
  );
};

/**
 * 获取课程作业试题列表
 */
export const getHomeworkQuestionList = (params: HomeworkQuestionListParams) => {
  return http.request<ApiResponse<HomeworkQuestionListResult>>(
    "get",
    "/edu/backend/v1/homework/question/list",
    { params }
  );
};

/**
 * 创建课程作业
 */
export const createHomework = (data: HomeworkCreateParams) => {
  return http.request<ApiResponse<{ homeworkId: number }>>(
    "post",
    "/edu/backend/v1/course/homework/create",
    { data }
  );
};

/**
 * 更新课程作业
 */
export const updateHomework = (data: HomeworkUpdateParams) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/course/homework/update",
    { data }
  );
};

/**
 * 删除课程作业
 */
export const deleteHomework = (data: HomeworkDeleteParams) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/course/homework/delete",
    { data }
  );
};

/**
 * 批量添加课程作业试题
 */
export const batchAddHomeworkQuestions = (data: HomeworkQuestionBatchAddParams) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/homework/question/batch/add",
    { data }
  );
}; 