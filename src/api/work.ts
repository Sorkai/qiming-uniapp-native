import { http } from "@/utils/http";

export interface DeleteQuestionParams {
  deleteType: number; // 删除类型 1:试卷 2:作业
  sourceId: number; // 试卷、作业的ID
  questionId: number; // 习题的ID
}

export interface AddRandomQuestionParams {
  addType: number; // 新增的类型 1:试卷 2:作业
  sourceId: number; // 试卷、作业的ID
}

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

/**
 * 删除试卷、作业的单道习题
 */
export const deleteWorkQuestion = (data: DeleteQuestionParams) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/work/delete/question",
    { data }
  );
};

/**
 * 随机添加一道试卷、作业的习题
 */
export const addRandomWorkQuestion = (data: AddRandomQuestionParams) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/backend/v1/work/round/add/question",
    { data }
  );
}; 