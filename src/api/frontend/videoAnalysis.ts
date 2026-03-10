import { http } from "@/utils/http";
import type { ApiResponse } from "./types";

/** 视频分析任务信息 */
export interface VideoAnalyzeTask {
  taskId: string;
  status: string;
  progress: number;
  message: string;
  courseId: number;
  chapterId: number;
  fileName: string;
  createdAt: string;
  completedAt: string;
}

/** 视频分析完整结果 */
export interface VideoAnalyzeFullResult {
  taskId: string;
  status: string;
  courseId: number;
  chapterId: number;
  fileName: string;
  transcriptionText: string;
  summary: string;
  chaptersJson: string;
  qaJson: string;
  mindMapUrl: string;
  pptJson: string;
  createdAt: string;
  completedAt: string;
}

/** 章节速览项 */
export interface ChapterItem {
  title: string;
  summary: string;
  startTime: number;
  endTime: number;
}

/** 问答回顾项 */
export interface QaItem {
  question: string;
  answer: string;
}

/** PPT 页面项 */
export interface PptPage {
  pageIndex: number;
  imageUrl: string;
  summary: string;
  startTime: number;
  endTime: number;
}

/** 按模块查看的视频分析结果 */
export interface VideoAnalyzeModuleResult {
  taskId: string;
  status: string;
  courseId: number;
  chapterId: number;
  fileName: string;
  createdAt: string;
  completedAt: string;
  schemaVersion: string;
  modules: string[];
  moduleStatus: Record<string, string>;
  transcription?: { text: string };
  summary?: { text: string };
  chapters?: ChapterItem[];
  qaItems?: QaItem[];
  mindMap?: { url: string };
  pptPages?: PptPage[];
  meeting?: {
    keywords: string[];
    keyInformation: string[];
  };
}

/** 获取课程章节对应的视频分析任务 */
export const getVideoAnalyzeTask = (params: {
  courseId: number;
  chapterId: number;
}) => {
  return http.request<ApiResponse<VideoAnalyzeTask>>(
    "get",
    "/edu/frontend/v1/video/analyze/task",
    { params }
  );
};

/** 学生查看视频分析结果 */
export const getVideoAnalyzeResult = (params: { taskId: string }) => {
  return http.request<ApiResponse<VideoAnalyzeFullResult>>(
    "get",
    "/edu/frontend/v1/video/analyze/result",
    { params }
  );
};

/** 按模块查看视频分析结果 */
export const getVideoAnalyzeModules = (params: {
  taskId: string;
  modules?: string;
}) => {
  return http.request<ApiResponse<VideoAnalyzeModuleResult>>(
    "get",
    "/edu/frontend/v1/video/analyze/result/modules",
    { params }
  );
};
