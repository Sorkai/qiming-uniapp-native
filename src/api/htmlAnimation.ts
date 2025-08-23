import { http } from "@/utils/http";

export interface HtmlAnimationTask {
  taskId: string;
  status: "pending" | "processing" | "completed" | "failed";
  version: number; // 0 表示还未分配版本(进行中)
  fileName: string;
  objectName: string;
  fileUrl?: string; // 完整可访问URL（后端新增）
  fileSize: number;
  errorMessage: string;
  createdAt: string;
  updatedAt: string;
  completedAt: string;
}

export interface HtmlAnimationListResult {
  courseId: number;
  chapterId: number;
  tasks: HtmlAnimationTask[];
  displayVersionRaw: string; // 可能是具体数字或 latest
  displayVersionResolved: string; // 解析后的版本号
}

export interface HtmlAnimationGenerateResult {
  courseId: number;
  chapterId: number;
  taskId: string;
  status: string;
  message: string;
}

export interface HtmlAnimationSyncResult {
  totalChapters: number;
  successChapters: number;
}

export interface HtmlAnimationDisplayResult {
  courseId: number;
  chapterId: number;
  version: string; // 当前展示版本（解析后的）
  url: string; // 展示文件 URL
}

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

// 生成动画
export const generateHtmlAnimation = (data: { courseId: number; chapterId: number }) => {
  return http.request<ApiResponse<HtmlAnimationGenerateResult>>("post", "/edu/backend/v1/html-animation/generate", { data });
};

// 动画任务列表
export const getHtmlAnimationList = (params: { courseId: number; chapterId: number }) => {
  return http.request<ApiResponse<HtmlAnimationListResult>>("get", "/edu/backend/v1/html-animation/list", { params });
};

// 设置展示版本
export const setHtmlAnimationDisplay = (data: { courseId: number; chapterId: number; version: string }) => {
  return http.request<ApiResponse>("post", "/edu/backend/v1/html-animation/display/set", { data });
};

// 强制同步
export const forceSyncHtmlAnimation = () => {
  return http.request<ApiResponse<HtmlAnimationSyncResult>>("post", "/edu/backend/v1/html-animation/sync", { data: {} });
};

// 获取展示版本（前台显示用，可选）
export const getHtmlAnimationDisplay = (params: { courseId: number; chapterId: number }) => {
  return http.request<ApiResponse<HtmlAnimationDisplayResult>>("get", "/edu/frontend/v1/html-animation/display", { params });
};
