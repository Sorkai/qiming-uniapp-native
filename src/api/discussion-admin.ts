/**
 * 课程讨论区管理端 API
 * 对应后端接口文档: doc/backend/course-discussion-api.md
 * 供教师端和管理员端使用
 */

import { http } from "@/utils/http";
import type {
  DiscussionPost,
  Pagination,
  PostStatus,
  Author
} from "./discussion";

// ==================== 类型定义 ====================

/** 举报状态 */
export type ReportStatus = "pending" | "resolved" | "dismissed";

/** 举报原因 */
export type ReportReason =
  | "spam"
  | "inappropriate"
  | "harassment"
  | "misinformation"
  | "copyright"
  | "other";

/** 举报记录 */
export interface ReportRecord {
  id: string;
  targetType: "post" | "reply";
  targetId: string;
  target: {
    id: string;
    title?: string;
    content: string;
    author: Author;
  };
  reporter: Author;
  reason: ReportReason;
  description?: string;
  status: ReportStatus;
  reportCount: number;
  createdAt: string;
  handledAt?: string;
  handledBy?: Author;
  handleNote?: string;
}

/** 审核队列项（扩展帖子信息） */
export interface ReviewQueueItem extends DiscussionPost {
  riskLevel: "low" | "medium" | "high" | "critical";
  matchedWords: string[];
  priority: "high" | "medium" | "low";
  courseName?: string;
}

/** 待审核项（后端返回格式） */
export interface PendingItem {
  id: number;
  type: "post" | "reply";
  courseId: string;
  courseName: string;
  postId?: number;
  postTitle?: string;
  content: string;
  authorId: number;
  authorName: string;
  createTime: string;
}

/** 待审核列表响应 */
export interface PendingListResponse {
  total: number;
  list: PendingItem[];
}

/** 敏感词 */
export interface SensitiveWord {
  id: string;
  word: string;
  category: "blacklist" | "graylist" | "whitelist";
  riskLevel: "low" | "medium" | "high" | "critical";
  isActive: boolean;
  hitCount: number;
  createdAt: string;
  updatedAt: string;
}

/** 用户信誉 */
export interface UserReputation {
  userId: string;
  userName: string;
  avatar: string;
  score: number;
  level: "trusted" | "normal" | "restricted";
  totalPosts: number;
  approvedPosts: number;
  rejectedPosts: number;
  reportedCount: number;
  warningCount: number;
  lastActiveAt: string;
}

/** 审计日志 */
export interface AuditLog {
  id: string;
  targetType: "post" | "reply";
  targetId: string;
  targetTitle?: string;
  action: "approve" | "reject" | "delete" | "pin" | "unpin";
  operator: Author & { role: string };
  reason?: string;
  previousStatus?: string;
  newStatus?: string;
  createdAt: string;
}

/** 全局统计数据 */
export interface GlobalStatistics {
  overview: {
    totalPosts: number;
    totalReplies: number;
    totalUsers: number;
    activeUsersToday: number;
    pendingReview: number;
    pendingReports: number;
  };
  trends: {
    posts: Array<{ date: string; count: number }>;
    replies: Array<{ date: string; count: number }>;
    activeUsers: Array<{ date: string; count: number }>;
  };
  topCourses: Array<{
    courseId: string;
    courseName: string;
    postCount: number;
    replyCount: number;
  }>;
  contentQuality: {
    approvalRate: string;
    rejectionRate: string;
    pendingRate: string;
    avgReviewTime: string;
  };
  userBehavior: {
    avgPostsPerUser: number;
    avgRepliesPerPost: number;
    avgLikesPerPost: number;
    reportRate: string;
  };
}

// ==================== 教师/管理员接口 ====================

/**
 * 获取审核队列
 * @param params 查询参数
 */
export function getReviewQueue(params?: {
  priority?: "high" | "medium" | "low";
  courseId?: string;
  page?: number;
  pageSize?: number;
}) {
  return http.request<{
    list: ReviewQueueItem[];
    stats: {
      pending: number;
      highPriority: number;
      avgWaitTime: string;
    };
  }>("get", "/api/v1/admin/discussions/review-queue", { params });
}

/**
 * 审核帖子
 * @param postId 帖子ID
 * @param data 审核数据
 */
export function reviewPost(
  postId: string | number,
  data: { action: "approve" | "reject"; reason?: string; note?: string }
) {
  // 兼容旧的参数名 note，转换为新的参数名 reason
  const requestData = {
    action: data.action,
    reason: data.reason || data.note
  };
  return http.request<{ code: number; msg: string; data: object }>(
    "post",
    `/edu/backend/v1/discussions/${postId}/review`,
    { data: requestData }
  );
}

/**
 * 审核回复
 * @param replyId 回复ID
 * @param data 审核数据
 */
export function reviewReply(
  replyId: string | number,
  data: { action: "approve" | "reject"; reason?: string }
) {
  return http.request<{ code: number; msg: string; data: object }>(
    "post",
    `/edu/backend/v1/discussions/replies/${replyId}/review`,
    { data }
  );
}

/**
 * 批量审核
 * @param data 批量审核数据
 */
export function batchReview(data: {
  postIds: string[];
  action: "approve" | "reject";
  note?: string;
}) {
  return http.request<{
    success: number;
    failed: number;
    results: Array<{ postId: string; success: boolean; error?: string }>;
  }>("post", "/api/v1/admin/discussions/batch-review", { data });
}

/**
 * 批量删除
 * @param data 批量删除数据
 */
export function batchDelete(data: { postIds: string[]; reason?: string }) {
  return http.request<{ success: number; failed: number }>(
    "post",
    "/api/v1/admin/discussions/batch-delete",
    { data }
  );
}

/**
 * 获取举报列表
 * @param params 查询参数
 */
export function getReportList(params?: {
  status?: ReportStatus;
  reason?: ReportReason;
  courseId?: string;
  page?: number;
  pageSize?: number;
}) {
  return http.request<{
    list: ReportRecord[];
    pagination: Pagination;
    stats: {
      pending: number;
      resolvedToday: number;
      totalReports: number;
    };
  }>("get", "/api/v1/admin/discussions/reports", { params });
}

/**
 * 处理举报
 * @param reportId 举报ID
 * @param data 处理数据
 */
export function handleReport(
  reportId: string,
  data: {
    action: "delete" | "dismiss" | "warn";
    note?: string;
    punishUser?: boolean;
    punishType?: "warning" | "restrict" | "ban";
  }
) {
  return http.request<{ success: boolean }>(
    "post",
    `/api/v1/admin/discussions/reports/${reportId}/handle`,
    { data }
  );
}

// ==================== 管理员专属接口 ====================

/**
 * 获取敏感词列表
 * @param params 查询参数
 */
export function getSensitiveWords(params?: {
  category?: "blacklist" | "graylist" | "whitelist";
  keyword?: string;
  isActive?: boolean;
  page?: number;
  pageSize?: number;
}) {
  return http.request<{
    list: SensitiveWord[];
    pagination: Pagination;
    stats: {
      blacklist: number;
      graylist: number;
      whitelist: number;
    };
  }>("get", "/api/v1/admin/sensitive-words", { params });
}

/**
 * 添加敏感词
 * @param data 敏感词数据
 */
export function addSensitiveWord(data: {
  word: string;
  category: "blacklist" | "graylist" | "whitelist";
  riskLevel?: "low" | "medium" | "high" | "critical";
}) {
  return http.request<SensitiveWord>("post", "/api/v1/admin/sensitive-words", {
    data
  });
}

/**
 * 编辑敏感词
 * @param wordId 敏感词ID
 * @param data 更新数据
 */
export function updateSensitiveWord(
  wordId: string,
  data: {
    category?: "blacklist" | "graylist" | "whitelist";
    riskLevel?: "low" | "medium" | "high" | "critical";
    isActive?: boolean;
  }
) {
  return http.request<{ success: boolean }>(
    "put",
    `/api/v1/admin/sensitive-words/${wordId}`,
    { data }
  );
}

/**
 * 删除敏感词
 * @param wordId 敏感词ID
 */
export function deleteSensitiveWord(wordId: string) {
  return http.request<{ success: boolean }>(
    "delete",
    `/api/v1/admin/sensitive-words/${wordId}`
  );
}

/**
 * 批量导入敏感词
 * @param data 导入数据
 */
export function importSensitiveWords(data: {
  words: Array<{
    word: string;
    category: "blacklist" | "graylist" | "whitelist";
    riskLevel?: "low" | "medium" | "high" | "critical";
  }>;
  overwrite?: boolean;
}) {
  return http.request<{
    imported: number;
    skipped: number;
    errors: string[];
  }>("post", "/api/v1/admin/sensitive-words/import", { data });
}

/**
 * 获取用户信誉列表
 * @param params 查询参数
 */
export function getUserReputationList(params?: {
  level?: "trusted" | "normal" | "restricted";
  keyword?: string;
  sortBy?: "score" | "rejectedPosts" | "reportedCount";
  sortOrder?: "asc" | "desc";
  page?: number;
  pageSize?: number;
}) {
  return http.request<{
    list: UserReputation[];
    pagination: Pagination;
    stats: {
      trusted: number;
      normal: number;
      restricted: number;
    };
  }>("get", "/api/v1/admin/user-reputation", { params });
}

/**
 * 调整用户信誉
 * @param userId 用户ID
 * @param data 调整数据
 */
export function updateUserReputation(
  userId: string,
  data: {
    scoreChange?: number;
    reason: string;
    newLevel?: "trusted" | "normal" | "restricted";
  }
) {
  return http.request<{
    userId: string;
    previousScore: number;
    newScore: number;
    previousLevel: string;
    newLevel: string;
  }>("put", `/api/v1/admin/user-reputation/${userId}`, { data });
}

/**
 * 获取审计日志
 * @param params 查询参数
 */
export function getAuditLogs(params?: {
  targetType?: "post" | "reply";
  action?: "approve" | "reject" | "delete" | "pin" | "unpin";
  operatorId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  pageSize?: number;
}) {
  return http.request<{
    list: AuditLog[];
    pagination: Pagination;
  }>("get", "/api/v1/admin/discussions/audit-logs", { params });
}

/**
 * 获取全局统计
 * @param params 查询参数
 */
export function getGlobalStatistics(params?: {
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
}) {
  return http.request<GlobalStatistics>(
    "get",
    "/api/v1/admin/discussions/statistics",
    { params }
  );
}

/**
 * 获取待审核列表（管理员/教师）
 * @param params 查询参数
 * @description 对应后端接口 GET /edu/backend/v1/discussions/pending
 */
export function getPendingList(params?: {
  courseId?: string;
  type?: "all" | "post" | "reply";
  pageNum: number;
  pageSize?: number;
}) {
  return http.request<{
    code: number;
    msg: string;
    data: PendingListResponse;
  }>("get", "/edu/backend/v1/discussions/pending", { params });
}

/**
 * 获取教师课程讨论列表（教师专用，获取所教课程的所有讨论）
 * @param params 查询参数
 */
export async function getTeacherDiscussions(params?: {
  courseId?: string;
  status?: PostStatus;
  keyword?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  data: {
    list: ReviewQueueItem[];
    pagination: Pagination;
  };
}> {
  // 转换参数名：前端 page -> 后端 pageNum
  const backendParams = {
    courseId: params?.courseId,
    pageNum: params?.page || 1,
    pageSize: params?.pageSize || 20
  };

  try {
    const response = await http.request<{
      code: number;
      msg: string;
      data: PendingListResponse;
    }>("get", "/edu/backend/v1/discussions/pending", { params: backendParams });

    //兼容后端返回格式，转换为前端期望的格式
    const backendData = (response as any)?.data || response;
    const total = backendData?.total || 0;
    const pageSize = backendParams.pageSize || 20;
    const currentPage = backendParams.pageNum;
    const totalPages = Math.ceil(total / pageSize);

    // 转换列表项格式
    const list: ReviewQueueItem[] = (backendData?.list || []).map(
      (item: PendingItem) =>
        ({
          id: String(item.id),
          title: item.postTitle || "",
          content: item.content,
          contentHtml: item.content,
          author: {
            id: String(item.authorId),
            name: item.authorName,
            avatar: "",
            isTeacher: false,
            isAdmin: false
          },
          tags: [],
          status: "pending" as PostStatus,
          isPinned: false,
          likeCount: 0,
          replyCount: 0,
          viewCount: 0,
          isLiked: false,
          createdAt: item.createTime,
          courseName: item.courseName,
          riskLevel: "low",
          matchedWords: [],
          priority: "medium"
        }) as ReviewQueueItem
    );

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
 * 获取教师课程统计
 * @param courseId 课程ID（可选，不传则获取所有课程汇总）
 */
export function getTeacherCourseStats(courseId?: string) {
  return http.request<{
    totalPosts: number;
    totalReplies: number;
    pendingReview: number;
    pendingReports: number;
    todayPosts: number;
    weekPosts: number;
    courses: Array<{
      courseId: string;
      courseName: string;
      postCount: number;
      pendingCount: number;
    }>;
  }>("get", "/api/v1/teacher/discussions/stats", {
    params: courseId ? { courseId } : undefined
  });
}
