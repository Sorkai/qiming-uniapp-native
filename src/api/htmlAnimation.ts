import { http } from "@/utils/http";

export interface HtmlAnimationTask {
  taskId: string;
  status: string;
  version: number;
  fileName: string;
  objectName: string;
  fileUrl?: string;
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
  displayVersionRaw: string;
  displayVersionResolved: string;
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
  version: string;
  url: string;
  previewUrl?: string;
  previewVideoUrl?: string;
}

export interface ApiResponse<T = any> {
  code: number;
  msg: string;
  data: T;
}

const HTML_ANIMATION_PROCESSING_STATUSES = new Set([
  "pending",
  "submitted",
  "processing",
  "queued",
  "running",
  "in_progress",
  "generating"
]);

const HTML_ANIMATION_COMPLETED_STATUSES = new Set([
  "completed",
  "success",
  "succeeded",
  "done",
  "finished"
]);

const HTML_ANIMATION_FAILED_STATUSES = new Set([
  "failed",
  "failure",
  "error",
  "cancelled",
  "canceled"
]);

export function normalizeHtmlAnimationTaskStatus(
  task?: Partial<HtmlAnimationTask> | null
) {
  const rawStatus = String(task?.status || "")
    .trim()
    .toLowerCase();

  const hasCompletedSignal =
    Number(task?.version || 0) > 0 ||
    Boolean(task?.completedAt) ||
    Boolean(task?.fileUrl);

  if (HTML_ANIMATION_FAILED_STATUSES.has(rawStatus)) {
    return "failed";
  }

  if (HTML_ANIMATION_COMPLETED_STATUSES.has(rawStatus) || hasCompletedSignal) {
    return "completed";
  }

  if (HTML_ANIMATION_PROCESSING_STATUSES.has(rawStatus) || !rawStatus) {
    return "processing";
  }

  return rawStatus;
}

export function normalizeHtmlAnimationTask(task: HtmlAnimationTask) {
  return {
    ...task,
    status: normalizeHtmlAnimationTaskStatus(task)
  };
}

export const generateHtmlAnimation = (data: {
  courseId: number;
  chapterId: number;
}) => {
  return http.request<ApiResponse<HtmlAnimationGenerateResult>>(
    "post",
    "/edu/v1/html-animation/generate",
    { data }
  );
};

export const getHtmlAnimationList = (params: {
  courseId: number;
  chapterId: number;
}) => {
  return http.request<ApiResponse<HtmlAnimationListResult>>(
    "get",
    "/edu/v1/html-animation/list",
    { params }
  );
};

export const setHtmlAnimationDisplay = (data: {
  courseId: number;
  chapterId: number;
  version: string;
}) => {
  return http.request<ApiResponse>(
    "post",
    "/edu/v1/html-animation/display/set",
    { data }
  );
};

export const forceSyncHtmlAnimation = () => {
  return http.request<ApiResponse<HtmlAnimationSyncResult>>(
    "post",
    "/edu/v1/html-animation/sync",
    { data: {} }
  );
};

export const getHtmlAnimationDisplay = (params: {
  courseId: number;
  chapterId: number;
}) => {
  return http.request<ApiResponse<HtmlAnimationDisplayResult>>(
    "get",
    "/edu/v1/html-animation/display",
    { params }
  );
};
