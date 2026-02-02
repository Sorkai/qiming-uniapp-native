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
  isOwner?: boolean;
  replyTo?: string;
  replyToId?: string;
  parentReplyId?: string;
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

/** 获取讨论列表参数（前端使用） */
export interface GetDiscussionsParams {
  page?: number;
  pageSize?: number;
  sort?: "latest" | "hot" | "unanswered" | "most_replies";
  keyword?: string;
  tag?: string;
  status?: PostStatus;
  authorId?: string;
}

/** 后端API期望的参数格式 */
interface BackendDiscussionsParams {
  pageNum: number;
  pageSize?: number;
  sortBy?: "latest" | "hot" | "most_replies";
  tag?: string;
}

/** 后端返回的帖子列表项 */
interface BackendPostListItem {
  postId: number;
  title: string;
  content: string;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  tags: string[];
  likeCount: number;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLiked: boolean;
  createTime: string;
}

/** 后端返回的回复列表项 */
interface BackendReplyListItem {
  replyId: number;
  content: string;
  contentHtml: string;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  parentReplyId: number;
  replyToUserId: number;
  replyToUserName: string;
  likeCount: number;
  isLiked: boolean;
  isOwner: boolean;
  createTime: string;
}

/** 后端返回的列表响应 */
interface BackendListResponse {
  total: number;
  list: BackendPostListItem[];
}

/** 后端回复列表响应 */
interface BackendReplyListResponse {
  total: number;
  list: BackendReplyListItem[];
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
export type ReportReason = "spam" | "abuse" | "inappropriate" | "other";

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
export async function getDiscussions(
  courseId: string,
  params?: GetDiscussionsParams
): Promise<{ data: { list: DiscussionPost[]; pagination: Pagination } }> {
  // 转换参数名：前端 page -> 后端 pageNum，前端 sort -> 后端 sortBy
  const backendParams: any = {
    pageNum: params?.page || 1,
    pageSize: params?.pageSize || 20,
    _t: Date.now() // 添加时间戳防止缓存
  };

  // 转换排序参数
  if (params?.sort && params.sort !== "unanswered") {
    backendParams.sortBy = params.sort as "latest" | "hot" | "most_replies";
  }

  if (params?.tag) {
    backendParams.tag = params.tag;
  }

  console.log(
    "[API] getDiscussions - courseId:",
    courseId,
    "params:",
    backendParams
  );

  try {
    const response = await http.request<
      | {
          code: number;
          msg: string;
          data: BackendListResponse;
        }
      | BackendListResponse
    >("get", `/edu/frontend/v1/courses/${courseId}/discussions`, {
      params: backendParams
    });

    console.log("[API] getDiscussions success:", response);

    // 兼容后端是否包裹 data 字段
    const backendData = (response as { data?: BackendListResponse }).data
      ? (response as { data: BackendListResponse }).data
      : (response as BackendListResponse);
    const total = backendData?.total || 0;
    const pageSize = backendParams.pageSize || 20;
    const currentPage = backendParams.pageNum;
    const totalPages = Math.ceil(total / pageSize);

    // 转换列表项格式
    const list: DiscussionPost[] = (backendData?.list || []).map(item => ({
      id: String(item.postId),
      title: item.title,
      content: item.content,
      contentHtml: item.content, // 后端可能未返回HTML格式，使用原始内容
      author: {
        id: String(item.authorId),
        name: item.authorName,
        avatar: item.authorAvatar,
        isTeacher: false,
        isAdmin: false
      },
      tags: item.tags || [],
      status: "approved" as PostStatus,
      isPinned: !!item.isPinned,
      likeCount: item.likeCount,
      replyCount: item.replyCount,
      viewCount: item.viewCount,
      isLiked: item.isLiked,
      createdAt: item.createTime
    }));

    return {
      data: {
        list,
        pagination: {
          page: currentPage,
          pageSize,
          total,
          totalPages
        }
      }
    };
  } catch (error) {
    console.error("获取讨论列表失败:", error);
    // 返回空数据，避免页面崩溃
    return {
      data: {
        list: [],
        pagination: {
          page: 1,
          pageSize: 20,
          total: 0,
          totalPages: 0
        }
      }
    };
  }
}

/**
 * 获取讨论详情
 * @param postId 帖子ID
 */
export function getDiscussionDetail(postId: string) {
  return http.request<DiscussionPost>(
    "get",
    `/edu/frontend/v1/discussions/${postId}`
  );
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
  }>("post", `/edu/frontend/v1/courses/${courseId}/discussions`, { data });
}

/**
 * 编辑讨论
 * @param postId 帖子ID
 * @param data 更新数据
 */
export function updateDiscussion(postId: string, data: CreateDiscussionParams) {
  return http.request<{ success: boolean }>(
    "put",
    `/edu/frontend/v1/discussions/${postId}`,
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
    `/edu/frontend/v1/discussions/${postId}`
  );
}

/**
 * 获取回复列表
 * @param postId 帖子ID
 * @param params 分页参数
 */
export async function getReplies(
  postId: string,
  params?: { page?: number; pageSize?: number }
): Promise<{ data: { list: Reply[]; total: number } }> {
  try {
    const backendParams: any = {
      pageNum: params?.page || 1,
      pageSize: params?.pageSize || 20,
      _t: Date.now() // 添加时间戳防止缓存
    };

    const response = await http.request<
      | {
          code: number;
          msg: string;
          data: BackendReplyListResponse;
        }
      | BackendReplyListResponse
    >("get", `/edu/frontend/v1/discussions/${postId}/replies`, {
      params: backendParams
    });

    // 兼容后端是否包裹 data 字段
    const backendData = (response as { data?: BackendReplyListResponse }).data
      ? (response as { data: BackendReplyListResponse }).data
      : (response as BackendReplyListResponse);

    const list: Reply[] = (backendData?.list || []).map(item => ({
      id: String(item.replyId),
      author: {
        id: String(item.authorId),
        name: item.authorName,
        avatar: item.authorAvatar,
        isTeacher: false, // 后端若有此字段可对应映射
        isAdmin: false
      },
      content: item.content,
      contentHtml: item.contentHtml || item.content,
      likeCount: item.likeCount,
      isLiked: item.isLiked,
      isOwner: item.isOwner,
      replyTo: item.replyToUserName,
      replyToId: String(item.replyToUserId),
      parentReplyId: String(item.parentReplyId),
      createdAt: item.createTime
    }));

    return {
      data: {
        list,
        total: backendData?.total || 0
      }
    };
  } catch (error) {
    console.error("获取回复列表失败:", error);
    return {
      data: {
        list: [],
        total: 0
      }
    };
  }
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
  }>("post", `/edu/frontend/v1/discussions/${postId}/replies`, { data });
}

/**
 * 编辑回复
 * @param replyId 回复ID
 * @param data 更新数据
 */
export function updateReply(replyId: string, data: { content: string }) {
  return http.request<{ success: boolean }>(
    "put",
    `/edu/frontend/v1/discussions/replies/${replyId}`,
    { data }
  );
}

/**
 * 删除回复
 * @param replyId 回复ID
 */
export function deleteReply(replyId: string) {
  return http.request<{ success: boolean }>(
    "delete",
    `/edu/frontend/v1/discussions/replies/${replyId}`
  );
}

/**
 * 点赞帖子
 * @param postId 帖子ID
 */
export function likePost(postId: string) {
  return http.request<{ success: boolean; likeCount: number }>(
    "post",
    `/edu/frontend/v1/discussions/${postId}/like`
  );
}

/**
 * 取消点赞帖子
 * @param postId 帖子ID
 */
export function unlikePost(postId: string) {
  return http.request<{ success: boolean; likeCount: number }>(
    "delete",
    `/edu/frontend/v1/discussions/${postId}/like`
  );
}

/**
 * 点赞回复
 * @param replyId 回复ID
 */
export function likeReply(replyId: string) {
  return http.request<{ success: boolean; likeCount: number }>(
    "post",
    `/edu/frontend/v1/discussions/replies/${replyId}/like`
  );
}

/**
 * 取消点赞回复
 * @param replyId 回复ID
 */
export function unlikeReply(replyId: string) {
  return http.request<{ success: boolean; likeCount: number }>(
    "delete",
    `/edu/frontend/v1/discussions/replies/${replyId}/like`
  );
}

/**
 * 举报帖子
 * @param postId 帖子ID
 * @param data 举报数据
 */
export function reportPost(postId: string | number, data: ReportParams) {
  const id = typeof postId === "string" ? parseInt(postId, 10) : postId;
  return http.request<{ success: boolean }>(
    "post",
    `/edu/frontend/v1/discussions/${id}/report`,
    { data }
  );
}

/**
 * 举报回复
 * @param replyId 回复ID
 * @param data 举报数据
 */
export function reportReply(replyId: string | number, data: ReportParams) {
  const id = typeof replyId === "string" ? parseInt(replyId, 10) : replyId;
  return http.request<{ success: boolean }>(
    "post",
    `/edu/frontend/v1/discussions/replies/${id}/report`,
    { data }
  );
}

/**
 * 置顶帖子（管理员/教师专用）
 * @param postId 帖子ID
 */
export function pinPost(postId: string | number) {
  return http.request<{ code: number; msg: string; data: object }>(
    "post",
    `/edu/backend/v1/discussions/${postId}/pin`
  );
}

/**
 * 取消置顶帖子（管理员/教师专用）
 * @param postId 帖子ID
 */
export function unpinPost(postId: string | number) {
  return http.request<{ code: number; msg: string; data: object }>(
    "delete",
    `/edu/backend/v1/discussions/${postId}/pin`,
    { params: { _t: Date.now() } }
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
    `/edu/frontend/v1/discussions/${postId}/review`,
    { data }
  );
}

/**
 * 获取讨论统计数据
 * @param _courseId 课程ID
 * @description 后端暂未提供此接口，使用mock数据
 */
export function getDiscussionStats(_courseId: string) {
  // Mock数据 - 后端接口暂未实现
  const mockStats: DiscussionStats = {
    totalPosts: 128,
    totalReplies: 456,
    activeUsers: 89,
    resolvedRate: "76%",
    pendingReviewCount: 5,
    hotTags: [
      { name: "作业问题", count: 45 },
      { name: "课程内容", count: 38 },
      { name: "考试相关", count: 25 },
      { name: "学习方法", count: 20 }
    ]
  };
  return Promise.resolve({ data: mockStats });
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
 * @param _courseId 课程ID
 * @description 后端暂未提供此接口，使用mock数据
 */
export function getHotTags(_courseId: string) {
  // Mock数据 - 后端接口暂未实现
  const mockTags: Array<{ name: string; count: number; type?: string }> = [
    { name: "作业问题", count: 45 },
    { name: "课程内容", count: 38 },
    { name: "考试相关", count: 25 },
    { name: "学习方法", count: 20 },
    { name: "实验报告", count: 15 },
    { name: "资料分享", count: 12 }
  ];
  return Promise.resolve({ data: mockTags });
}
