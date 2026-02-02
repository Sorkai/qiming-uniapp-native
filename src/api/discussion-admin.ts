/**
 * 课程讨论区管理端API
 * 对应后端接口文档:doc/backend/course-discussion-api.md
 * 供教师端和管理员端使用
 */

import { http } from "@/utils/http";
import { getUserList } from "./user";

//==================== 用户头像缓存 ====================

/** 用户头像缓存 */
const userAvatarCache = new Map<number, string>();

/**
 * 获取用户头像映射
 * @param userIds 用户 ID 列表
 * @returns 用户 ID 到头像的映射
 */
export async function getUserAvatars(
  userIds: number[]
): Promise<Map<number, string>> {
  // 过滤出缓存中没有的用户 ID
  const uncachedIds = userIds.filter(id => !userAvatarCache.has(id));

  if (uncachedIds.length > 0) {
    try {
      // 获取用户列表（设置较大的 pageSize 以获取更多用户）
      const res = await getUserList({ pageNum: 1, pageSize: 1000 });
      // 兼容后端返回格式：{ code, msg, data: { total, userList } }
      const responseData = (res as any)?.data || res;
      const userList = responseData?.userList || [];

      // 更新缓存
      for (const user of userList) {
        userAvatarCache.set(user.id, user.avatar || "");
      }
      console.log(
        "[API] getUserAvatars - 缓存更新完成，用户数量:",
        userList.length,
        "用户头像示例:",
        userList.slice(0, 3).map((u: any) => ({ id: u.id, avatar: u.avatar }))
      );
    } catch (error) {
      console.error("获取用户列表失败:", error);
    }
  }

  // 返回请求的用户头像
  const result = new Map<number, string>();
  for (const id of userIds) {
    result.set(id, userAvatarCache.get(id) || "");
  }
  return result;
}
import type {
  DiscussionPost,
  Pagination,
  PostStatus,
  Author
} from "./discussion";

//==================== 后端返回类型定义 ====================

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

/** 后端返回的列表响应 */
interface BackendListResponse {
  total: number;
  list: BackendPostListItem[];
}

/** 后端返回的帖子详情 */
interface BackendPostDetail {
  postId: number;
  courseId: string;
  courseName: string;
  title: string;
  content: string;
  contentHtml: string;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  tags: string[];
  likeCount: number;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isLiked: boolean;
  isOwner: boolean;
  createTime: string;
  editedAt?: string;
}

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
  itemType?: "post" | "reply";
  postId?: number; // 回复所属的帖子ID
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
  authorAvatar?: string; // 用户头像
  createTime: string;
}

/** 待审核列表响应 */
export interface PendingListResponse {
  total: number;
  list: PendingItem[];
}

/**敏感词 */
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
 * @description 使用前端讨论列表接口，通过status=pending筛选待审核内容
 *对应后端接口 GET /edu/frontend/v1/courses/{courseId}/discussions
 */
export async function getReviewQueue(params?: {
  priority?: "high" | "medium" | "low";
  courseId?: string;
  page?: number;
  pageSize?: number;
}): Promise<{
  list: ReviewQueueItem[];
  stats: {
    pending: number;
    highPriority: number;
    avgWaitTime: string;
  };
}> {
  // 如果没有提供courseId，尝试获取教师的课程列表
  if (!params?.courseId) {
    // 先获取教师课程统计，获取课程列表
    try {
      const statsRes = await getTeacherCourseStats();
      const courses = statsRes?.courses || [];

      if (courses.length === 0) {
        // 没有课程，返回空数据
        return {
          list: [],
          stats: {
            pending: 0,
            highPriority: 0,
            avgWaitTime: "0小时"
          }
        };
      }

      // 获取所有课程的待审核内容
      const allItems: ReviewQueueItem[] = [];
      let totalPending = 0;

      for (const course of courses) {
        try {
          const result = await getAdminDiscussions(course.courseId, {
            page: 1,
            pageSize: 100 // 获取较多数据
          });

          // 转换为ReviewQueueItem格式，并添加课程名称
          const items = result.data.list.map(item => ({
            ...item,
            courseName: course.courseName,
            riskLevel: "low" as const,
            matchedWords: [],
            priority: "medium" as const
          }));

          allItems.push(...items);
          totalPending += course.pendingCount || 0;
        } catch (error) {
          console.error(`获取课程 ${course.courseId} 讨论列表失败:`, error);
        }
      }

      // 分页处理
      const page = params?.page || 1;
      const pageSize = params?.pageSize || 20;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const pagedItems = allItems.slice(startIndex, endIndex);

      return {
        list: pagedItems,
        stats: {
          pending: totalPending,
          highPriority: 0,
          avgWaitTime: "0小时"
        }
      };
    } catch (error) {
      console.error("获取审核队列失败:", error);
      return {
        list: [],
        stats: {
          pending: 0,
          highPriority: 0,
          avgWaitTime: "0小时"
        }
      };
    }
  }

  // 有courseId，直接获取该课程的讨论列表
  try {
    const result = await getAdminDiscussions(params.courseId, {
      page: params.page || 1,
      pageSize: params.pageSize || 20
    });

    // 转换为ReviewQueueItem格式
    const items: ReviewQueueItem[] = result.data.list.map(item => ({
      ...item,
      riskLevel: "low" as const,
      matchedWords: [],
      priority: "medium" as const
    }));

    return {
      list: items,
      stats: {
        pending: result.data.pagination.total,
        highPriority: 0,
        avgWaitTime: "0小时"
      }
    };
  } catch (error) {
    console.error("获取审核队列失败:", error);
    return {
      list: [],
      stats: {
        pending: 0,
        highPriority: 0,
        avgWaitTime: "0小时"
      }
    };
  }
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
  // 兼容旧的参数名note，转换为新的参数名 reason
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
  data: { action: "approve" | "reject"; reason?: string; note?: string }
) {
  const requestData = {
    action: data.action,
    reason: data.reason || data.note
  };
  return http.request<{ code: number; msg: string; data: object }>(
    "post",
    `/edu/backend/v1/discussions/replies/${replyId}/review`,
    { data: requestData }
  );
}

/**
 * 置顶帖子
 * @param postId 帖子ID
 */
export function pinPost(postId: string | number) {
  return http.request<{ code: number; msg: string; data: object }>(
    "post",
    `/edu/backend/v1/discussions/${postId}/pin`
  );
}

/**
 * 取消置顶
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
 * 强制删除帖子
 * @param postId 帖子ID
 * @param reason 删除原因
 */
export function forceDeletePost(postId: string | number, reason?: string) {
  return http.request<{ code: number; msg: string; data: object }>(
    "delete",
    `/edu/backend/v1/discussions/${postId}/force`,
    { data: { reason } }
  );
}

/**
 * 强制删除回复
 * @param replyId 回复ID
 * @param reason 删除原因
 */
export function forceDeleteReply(replyId: string | number, reason?: string) {
  return http.request<{ code: number; msg: string; data: object }>(
    "delete",
    `/edu/backend/v1/discussions/replies/${replyId}/force`,
    { data: { reason } }
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
  }>("post", "/edu/backend/v1/discussions/batch-review", { data });
}

/**
 * 批量删除
 * @param data 批量删除数据
 */
export function batchDelete(data: { postIds: string[]; reason?: string }) {
  return http.request<{ success: number; failed: number }>(
    "post",
    "/edu/backend/v1/discussions/batch-delete",
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
  }>("get", "/edu/backend/v1/discussions/reports", { params });
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
    `/edu/backend/v1/discussions/reports/${reportId}/handle`,
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
  }>("get", "/edu/backend/v1/sensitive-words", { params });
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
  return http.request<SensitiveWord>(
    "post",
    "/edu/backend/v1/sensitive-words",
    { data }
  );
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
    `/edu/backend/v1/sensitive-words/${wordId}`,
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
    `/edu/backend/v1/sensitive-words/${wordId}`
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
  }>("post", "/edu/backend/v1/sensitive-words/import", { data });
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
  }>("get", "/edu/backend/v1/user-reputation", { params });
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
  }>("put", `/edu/backend/v1/user-reputation/${userId}`, { data });
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
  }>("get", "/edu/backend/v1/discussions/audit-logs", { params });
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
    "/edu/backend/v1/discussions/statistics",
    { params }
  );
}

/**
 * 获取待审核列表（管理员/教师）
 * @param params 查询参数
 * @description 对应后端接口 GET /edu/backend/v1/discussions/pending
 */
export async function getPendingList(params?: {
  courseId?: string;
  type?: "all" | "post" | "reply";
  pageNum: number;
  pageSize?: number;
}) {
  const response = await http.request<{
    code: number;
    msg: string;
    data: PendingListResponse;
  }>("get", "/edu/backend/v1/discussions/pending", { params });

  //调试：打印后端返回的数据，检查 authorAvatar 字段
  const responseData = (response as any)?.data || response;
  console.log("[API] getPendingList -后端返回数据:", responseData);
  console.log(
    "[API] getPendingList - authorAvatar 字段检查:",
    (responseData?.list || []).map((item: PendingItem) => ({
      id: item.id,
      authorName: item.authorName,
      authorAvatar: item.authorAvatar
    }))
  );

  return response;
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
  // 转换参数名：前端 page ->后端 pageNum
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
            avatar: item.authorAvatar || "",
            isTeacher: false,
            isAdmin: false
          },
          tags: [],
          status: "pending" as PostStatus,
          isPinned:
            (item as any).isPinned === true ||
            (item as any).isPinned === 1 ||
            String((item as any).isPinned) === "true" ||
            String((item as any).isPinned) === "1",
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
 * 获取管理端/教师端讨论列表
 * @param courseId 课程ID
 * @param params 查询参数
 * @description 对应后端接口 GET /edu/frontend/v1/courses/{courseId}/discussions
 *使用管理员或教师的token进行身份验证
 */
export async function getAdminDiscussions(
  courseId: string,
  params?: {
    page?: number;
    pageSize?: number;
    sortBy?: "latest" | "hot" | "most_replies";
    tag?: string;
  }
): Promise<{
  data: {
    list: DiscussionPost[];
    pagination: Pagination;
  };
}> {
  // 转换参数名：前端 page -> 后端 pageNum
  const backendParams = {
    pageNum: params?.page || 1,
    pageSize: params?.pageSize || 20,
    sortBy: params?.sortBy,
    tag: params?.tag,
    _t: Date.now() // 添加时间戳防止缓存，解决状态切换后刷新过快导致的状态闪烁
  };

  console.log(
    "[API] getAdminDiscussions - courseId:",
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

    console.log("[API] getAdminDiscussions success:", response);

    // 兼容后端是否包裹 data 字段
    const backendData = (response as { data?: BackendListResponse }).data
      ? (response as { data: BackendListResponse }).data
      : (response as BackendListResponse);
    const total = backendData?.total || 0;
    const pageSize = backendParams.pageSize || 20;
    const currentPage = backendParams.pageNum;
    const totalPages = Math.ceil(total / pageSize);

    // 调试：打印原始数据中的 authorAvatar 字段
    console.log(
      "[API] getAdminDiscussions - authorAvatar values:",
      (backendData?.list || []).map((item: BackendPostListItem) => ({
        postId: item.postId,
        authorName: item.authorName,
        authorAvatar: item.authorAvatar
      }))
    );

    // 转换列表项格式
    const list: DiscussionPost[] = (backendData?.list || []).map(item => ({
      id: String(item.postId),
      title: item.title,
      content: item.content,
      contentHtml: item.content,
      author: {
        id: String(item.authorId),
        name: item.authorName,
        avatar: item.authorAvatar || "", // 确保空值时使用空字符串
        isTeacher: false,
        isAdmin: false
      },
      tags: item.tags || [],
      status: "approved" as PostStatus,
      isPinned:
        (item as any).isPinned === true ||
        (item as any).isPinned === 1 ||
        String((item as any).isPinned) === "true" ||
        String((item as any).isPinned) === "1",
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
    console.error("获取管理端讨论列表失败:", error);
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
 * 获取管理端/教师端讨论详情
 * @param postId 帖子ID
 * @description 对应后端接口 GET /edu/frontend/v1/discussions/{postId}
 * 使用管理员或教师的token进行身份验证
 */
export async function getAdminDiscussionDetail(
  postId: string | number
): Promise<{
  data: DiscussionPost & {
    courseId: string;
    courseName: string;
    isOwner: boolean;
  };
} | null> {
  console.log("[API] getAdminDiscussionDetail - postId:", postId);

  try {
    const response = await http.request<
      | {
          code: number;
          msg: string;
          data: BackendPostDetail;
        }
      | BackendPostDetail
    >("get", `/edu/frontend/v1/discussions/${postId}`);

    console.log("[API] getAdminDiscussionDetail success:", response);

    // 兼容后端是否包裹 data 字段
    const backendData = (response as { data?: BackendPostDetail }).data
      ? (response as { data: BackendPostDetail }).data
      : (response as BackendPostDetail);

    if (!backendData) {
      return null;
    }

    // 转换为前端格式
    const detail: DiscussionPost & {
      courseId: string;
      courseName: string;
      isOwner: boolean;
    } = {
      id: String(backendData.postId),
      title: backendData.title,
      content: backendData.content,
      contentHtml: backendData.contentHtml || backendData.content,
      author: {
        id: String(backendData.authorId),
        name: backendData.authorName,
        avatar: backendData.authorAvatar,
        isTeacher: false,
        isAdmin: false
      },
      tags: backendData.tags || [],
      status: "approved" as PostStatus,
      isPinned:
        (backendData as any).isPinned === true ||
        (backendData as any).isPinned === 1 ||
        String((backendData as any).isPinned) === "true" ||
        String((backendData as any).isPinned) === "1",
      likeCount: backendData.likeCount,
      replyCount: backendData.replyCount,
      viewCount: backendData.viewCount,
      isLiked: backendData.isLiked,
      createdAt: backendData.createTime,
      editedAt: backendData.editedAt,
      courseId: backendData.courseId,
      courseName: backendData.courseName,
      isOwner: backendData.isOwner
    };

    return { data: detail };
  } catch (error) {
    console.error("获取管理端讨论详情失败:", error);
    return null;
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
  }>("get", "/edu/backend/v1/teacher/discussions/stats", {
    params: courseId ? { courseId } : undefined
  });
}
