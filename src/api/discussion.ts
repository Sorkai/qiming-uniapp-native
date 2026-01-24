/**
 * 课程讨论区 API
 * 对应后端接口文档:doc/backend/course-discussion-api.md
 */

import { http } from "@/utils/http";

//==================== 类型定义 ====================

/** 作者信息 */
export interface Author {
  id: string;
  name: string;
  avatar: string;
  isTeacher?: boolean;
  isAdmin?: boolean;
}

/** 回复 */
export interface Reply {
  id: string;
  author: Author;
  content: string;
  contentHtml: string;
  likeCount: number;
  isLiked: boolean;
  replyTo?: string;
  createdAt: string;
}

/** 帖子状态 */
export type PostStatus = "pending" | "approved" | "rejected" | "auto_approved";

/** 讨论帖子 */
export interface DiscussionPost {
  id: string;
  title?: string;
  content: string;
  contentHtml: string;
  author: Author;
  tags: string[];
  status: PostStatus;
  isPinned: boolean;
  likeCount: number;
  replyCount: number;
  viewCount: number;
  isLiked: boolean;
  createdAt: string;
  editedAt?: string;
  replies?: Reply[];
  hasMoreReplies?: boolean;
}

/** 分页信息 */
export interface Pagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

/** 统计数据 */
export interface DiscussionStats {
  totalPosts: number;
  totalReplies: number;
  activeUsers: number;
  resolvedRate: string;
  pendingReviewCount?: number;
  hotTags: Array<{ name: string; count: number }>;
}

/** 获取讨论列表参数 */
export interface GetDiscussionsParams {
  page?: number;
  pageSize?: number;
  sort?: "latest" | "hot" | "unanswered";
  keyword?: string;
  tag?: string;
  status?: PostStatus;
  authorId?: string;
}

/** 发布讨论参数 */
export interface CreateDiscussionParams {
  title?: string;
  content: string;
  tags?: string[];
}

/** 发布回复参数 */
export interface CreateReplyParams {
  content: string;
  parentReplyId?: string;
  replyToUserId?: string;
}

/** 举报原因 */
export type ReportReason =
  | "spam"
  | "inappropriate"
  | "harassment"
  | "misinformation"
  | "copyright"
  | "other";

/** 举报参数 */
export interface ReportParams {
  reason: ReportReason;
  description?: string;
}

/** 审核参数 */
export interface ReviewParams {
  action: "approve" | "reject";
  note?: string;
}

// ==================== API 接口 ====================

/**
 * 获取讨论列表
 * @param courseId 课程ID
 * @param params 查询参数
 */
export function getDiscussions(
  courseId: string,
  params?: GetDiscussionsParams
) {
  return http.request<{
    list: DiscussionPost[];
    pagination: Pagination;
  }>("get", `/api/v1/courses/${courseId}/discussions`, { params });
}

/**
 * 获取讨论详情
 * @param postId 帖子ID
 */
export function getDiscussionDetail(postId: string) {
  return http.request<DiscussionPost>("get", `/api/v1/discussions/${postId}`);
}

/**
 * 发布讨论
 * @param courseId 课程ID
 * @param data 帖子数据
 */
export function createDiscussion(
  courseId: string,
  data: CreateDiscussionParams
) {
  return http.request<{
    id: string;
    status: PostStatus;
    estimatedReviewTime: string;
  }>("post", `/api/v1/courses/${courseId}/discussions`, { data });
}

/**
 * 编辑讨论
 * @param postId 帖子ID
 * @param data 更新数据
 */
export function updateDiscussion(postId: string, data: CreateDiscussionParams) {
  return http.request<{ success: boolean }>(
    "put",
    `/api/v1/discussions/${postId}`,
    { data }
  );
}

/**
 * 删除讨论
 * @param postId 帖子ID
 */
export function deleteDiscussion(postId: string) {
  return http.request<{ success: boolean }>(
    "delete",
    `/api/v1/discussions/${postId}`
  );
}

/**
 * 获取回复列表
 * @param postId 帖子ID
 * @param params 分页参数
 */
export function getReplies(
  postId: string,
  params?: { page?: number; pageSize?: number }
) {
  return http.request<{
    list: Reply[];
    pagination: Pagination;
  }>("get", `/api/v1/discussions/${postId}/replies`, { params });
}

/**
 * 发布回复
 * @param postId 帖子ID
 * @param data 回复数据
 */
export function createReply(postId: string, data: CreateReplyParams) {
  return http.request<{
    id: string;
    status: PostStatus;
  }>("post", `/api/v1/discussions/${postId}/replies`, { data });
}

/**
 * 删除回复
 * @param postId 帖子ID
 * @param replyId 回复ID
 */
export function deleteReply(postId: string, replyId: string) {
  return http.request<{ success: boolean }>(
    "delete",
    `/api/v1/discussions/${postId}/replies/${replyId}`
  );
}

/**
 * 点赞帖子
 * @param postId 帖子ID
 */
export function likePost(postId: string) {
  return http.request<{ success: boolean; likeCount: number }>(
    "post",
    `/api/v1/discussions/${postId}/like`
  );
}

/**
 * 取消点赞帖子
 * @param postId 帖子ID
 */
export function unlikePost(postId: string) {
  return http.request<{ success: boolean; likeCount: number }>(
    "delete",
    `/api/v1/discussions/${postId}/like`
  );
}

/**
 * 点赞回复
 * @param postId 帖子ID
 * @param replyId 回复ID
 */
export function likeReply(postId: string, replyId: string) {
  return http.request<{ success: boolean; likeCount: number }>(
    "post",
    `/api/v1/discussions/${postId}/replies/${replyId}/like`
  );
}

/**
 * 取消点赞回复
 * @param postId 帖子ID
 * @param replyId 回复ID
 */
export function unlikeReply(postId: string, replyId: string) {
  return http.request<{ success: boolean; likeCount: number }>(
    "delete",
    `/api/v1/discussions/${postId}/replies/${replyId}/like`
  );
}

/**
 * 举报帖子
 * @param postId 帖子ID
 * @param data 举报数据
 */
export function reportPost(postId: string, data: ReportParams) {
  return http.request<{ success: boolean }>(
    "post",
    `/api/v1/discussions/${postId}/report`,
    { data }
  );
}

/**
 * 举报回复
 * @param postId 帖子ID
 * @param replyId 回复ID
 * @param data 举报数据
 */
export function reportReply(
  postId: string,
  replyId: string,
  data: ReportParams
) {
  return http.request<{ success: boolean }>(
    "post",
    `/api/v1/discussions/${postId}/replies/${replyId}/report`,
    { data }
  );
}

/**
 * 置顶帖子（管理员/教师）
 * @param postId 帖子ID
 */
export function pinPost(postId: string) {
  return http.request<{ success: boolean }>(
    "post",
    `/api/v1/discussions/${postId}/pin`
  );
}

/**
 * 取消置顶帖子（管理员/教师）
 * @param postId 帖子ID
 */
export function unpinPost(postId: string) {
  return http.request<{ success: boolean }>(
    "delete",
    `/api/v1/discussions/${postId}/pin`
  );
}

/**
 * 审核帖子（管理员/教师）
 * @param postId 帖子ID
 * @param data 审核数据
 */
export function reviewPost(postId: string, data: ReviewParams) {
  return http.request<{ success: boolean }>(
    "post",
    `/api/v1/discussions/${postId}/review`,
    { data }
  );
}

/**
 * 获取讨论统计数据
 * @param courseId 课程ID
 */
export function getDiscussionStats(courseId: string) {
  return http.request<DiscussionStats>(
    "get",
    `/api/v1/courses/${courseId}/discussions/stats`
  );
}

/**
 * 获取审核队列（管理员/教师）
 * @param params 查询参数
 */
export function getReviewQueue(params?: {
  priority?: "high" | "medium" | "low";
  courseId?: string;
  page?: number;
  pageSize?: number;
}) {
  return http.request<{
    list: Array<
      DiscussionPost & {
        riskLevel: string;
        matchedWords: string[];
        priority: string;
      }
    >;
    stats: {
      pending: number;
      highPriority: number;
      avgWaitTime: string;
    };
  }>("get", "/api/v1/admin/discussions/review-queue", { params });
}

/**
 * 获取热门标签
 * @param courseId 课程ID
 */
export function getHotTags(courseId: string) {
  return http.request<Array<{ name: string; count: number; type?: string }>>(
    "get",
    `/api/v1/courses/${courseId}/discussions/tags`
  );
}
