import { http } from "@/utils/http";

/**
 * 获取赛事列表
 */
export const getEventList = (params: {
  pageNum: number;
  pageSize?: number;
  title?: string;
  type?: string;
  status?: string;
}) => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      total: number;
      eventList: Array<{
        eventId: number;
        title: string;
        description: string;
        type: "coding" | "quiz" | "essay" | "comprehensive";
        startTime: string;
        endTime: string;
        questionCount: number;
        timeLimit: number;
        totalScore: number;
        participants: number;
        status: "upcoming" | "ongoing" | "ended";
      }>;
    };
  }>("get", "/edu/backend/v1/competition/event/list", { params });
};

/**
 * 获取赛事统计数据
 */
export const getEventStats = () => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      totalEvents: number;
      ongoingEvents: number;
      totalParticipants: number;
    };
  }>("get", "/edu/backend/v1/competition/event/stats");
};

/**
 * 添加或更新赛事
 */
export const upsertEvent = (data: {
  eventId?: number;
  title: string;
  description: string;
  type: string;
  startTime: string;
  endTime: string;
  questionCount?: number;
  timeLimit?: number;
  totalScore?: number;
  status: string;
}) => {
  return http.request<void>(
    "post",
    "/edu/backend/v1/competition/event/upsert",
    {
      data
    }
  );
};

/**
 * 删除赛事
 */
export const deleteEvent = (data: { eventId: number }) => {
  return http.request<void>(
    "post",
    "/edu/backend/v1/competition/event/delete",
    {
      data
    }
  );
};

/**
 * 获取赛事报名列表
 */
export const getEventParticipants = (params: { eventId: number }) => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      list: Array<{
        userId: number;
        username: string;
        realName: string;
        className: string;
        registerTime: string;
        status: "completed" | "pending";
      }>;
    };
  }>("get", "/edu/backend/v1/competition/event/participants", { params });
};

/**
 * 获取赛事排行榜
 */
export const getEventRankings = (params: { eventId: number }) => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      list: Array<{
        userId: number;
        username: string;
        avatar: string;
        className: string;
        score: number;
        duration: string;
      }>;
    };
  }>("get", "/edu/backend/v1/competition/event/rankings", { params });
};

// ==================== OJ 题目管理 ====================

/**
 * 获取OJ统计数据
 */
export const getOJStats = () => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      totalProblems: number;
      totalSubmissions: number;
      acceptRate: number;
      activeUsers: number;
    };
  }>("get", "/edu/backend/v1/oj/stats");
};

/**
 * 获取OJ题目列表
 */
export const getProblemList = (params: {
  pageNum: number;
  pageSize?: number;
  title?: string;
  difficulty?: string;
  tags?: string;
}) => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      total: number;
      list: Array<{
        problemId: number;
        title: string;
        difficulty: "easy" | "medium" | "hard";
        tags: string[];
        acceptCount: number;
        submitCount: number;
        acceptRate: number;
        timeLimit: number;
        memoryLimit: number;
        status: "published" | "draft";
        createTime: string;
      }>;
    };
  }>("get", "/edu/backend/v1/oj/problem/list", { params });
};

/**
 * 获取OJ题目详情
 */
export const getProblemDetail = (params: { problemId: number }) => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      problemId: number;
      title: string;
      difficulty: string;
      tags: string[];
      content: string;
      inputFormat: string;
      outputFormat: string;
      examples: Array<{ input: string; output: string; explanation?: string }>;
      timeLimit: number;
      memoryLimit: number;
      hint?: string;
      testCases: Array<{ input: string; output: string }>;
    };
  }>("get", "/edu/backend/v1/oj/problem/detail", { params });
};

/**
 * 添加或更新OJ题目
 */
export const upsertProblem = (data: {
  problemId?: number;
  title: string;
  difficulty: string;
  tags: string[];
  content: string;
  inputFormat: string;
  outputFormat: string;
  examples: Array<{ input: string; output: string; explanation?: string }>;
  timeLimit: number;
  memoryLimit: number;
  hint?: string;
  testCases: Array<{ input: string; output: string }>;
  status: string;
}) => {
  return http.request<void>("post", "/edu/backend/v1/oj/problem/upsert", {
    data
  });
};

/**
 * 删除OJ题目
 */
export const deleteProblem = (data: { problemId: number }) => {
  return http.request<void>("post", "/edu/backend/v1/oj/problem/delete", {
    data
  });
};

/**
 * 获取提交记录列表
 */
export const getSubmissionList = (params: {
  pageNum: number;
  pageSize?: number;
  problemId?: number;
  userId?: number;
  status?: string;
  language?: string;
}) => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      total: number;
      list: Array<{
        submissionId: number;
        problemId: number;
        problemTitle: string;
        userId: number;
        username: string;
        language: string;
        status:
          | "accepted"
          | "wrong_answer"
          | "time_limit"
          | "memory_limit"
          | "runtime_error"
          | "compile_error"
          | "pending";
        runTime: number;
        memory: number;
        submitTime: string;
      }>;
    };
  }>("get", "/edu/backend/v1/oj/submission/list", { params });
};

/**
 * 获取提交详情
 */
export const getSubmissionDetail = (params: { submissionId: number }) => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      submissionId: number;
      problemId: number;
      problemTitle: string;
      userId: number;
      username: string;
      language: string;
      code: string;
      status: string;
      runTime: number;
      memory: number;
      submitTime: string;
      testResults: Array<{
        caseId: number;
        status: string;
        runTime: number;
        memory: number;
        input?: string;
        expectedOutput?: string;
        actualOutput?: string;
      }>;
    };
  }>("get", "/edu/backend/v1/oj/submission/detail", { params });
};

// ==================== 作文批改管理 ====================

/**
 * 获取作文统计数据
 */
export const getEssayStats = () => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      totalEssays: number;
      pendingReview: number;
      avgScore: number;
      todaySubmissions: number;
    };
  }>("get", "/edu/backend/v1/essay/stats");
};

/**
 * 获取作文列表
 */
export const getEssayList = (params: {
  pageNum: number;
  pageSize?: number;
  keyword?: string;
  status?: string;
  topicId?: number;
}) => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      total: number;
      list: Array<{
        essayId: number;
        topicId: number;
        topicTitle: string;
        studentId: number;
        studentName: string;
        className: string;
        wordCount: number;
        submitTime: string;
        aiScore: number | null;
        teacherScore: number | null;
        status: "pending" | "ai_reviewed" | "teacher_reviewed";
      }>;
    };
  }>("get", "/edu/backend/v1/essay/list", { params });
};

/**
 * 获取作文详情
 */
export const getEssayDetail = (params: { essayId: number }) => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      essayId: number;
      topicId: number;
      topicTitle: string;
      topicRequirement: string;
      studentId: number;
      studentName: string;
      className: string;
      content: string;
      wordCount: number;
      submitTime: string;
      aiResult: {
        score: number;
        dimensions: Array<{
          name: string;
          score: number;
          maxScore: number;
          comment: string;
        }>;
        strengths: string[];
        weaknesses: string[];
        suggestions: string[];
        corrections: Array<{
          original: string;
          corrected: string;
          type: string;
          reason: string;
        }>;
      } | null;
      teacherResult: {
        score: number;
        comment: string;
        reviewTime: string;
      } | null;
    };
  }>("get", "/edu/backend/v1/essay/detail", { params });
};

/**
 * 提交教师批改结果
 */
export const submitTeacherReview = (data: {
  essayId: number;
  score: number;
  comment: string;
}) => {
  return http.request<void>("post", "/edu/backend/v1/essay/review", { data });
};

/**
 * 请求AI批改
 */
export const requestAIReview = (data: { essayId: number }) => {
  return http.request<void>("post", "/edu/backend/v1/essay/ai-review", {
    data
  });
};

/**
 * 发布作文题目
 */
export const publishEssayTopic = (data: {
  topicId?: number;
  title: string;
  requirement: string;
  wordLimit: { min: number; max: number };
  deadline: string;
  classIds: number[];
}) => {
  return http.request<void>("post", "/edu/backend/v1/essay/topic/publish", {
    data
  });
};

/**
 * 获取作文题目列表
 */
export const getEssayTopicList = () => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      list: Array<{
        topicId: number;
        title: string;
        deadline: string;
        submissions: number;
      }>;
    };
  }>("get", "/edu/backend/v1/essay/topic/list");
};

// ==================== 题库管理 ====================

/**
 * 获取题库统计数据
 */
export const getQuestionBankStats = () => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      totalQuestions: number;
      totalCategories: number;
      usageCount: number;
      avgAccuracy: number;
    };
  }>("get", "/edu/backend/v1/question-bank/stats");
};

/**
 * 获取分类树
 */
export const getCategoryTree = () => {
  return http.request<{
    code: number;
    msg: string;
    data: Array<{
      categoryId: number;
      name: string;
      questionCount: number;
      children?: Array<{
        categoryId: number;
        name: string;
        questionCount: number;
      }>;
    }>;
  }>("get", "/edu/backend/v1/question-bank/category/tree");
};

/**
 * 添加或更新分类
 */
export const upsertCategory = (data: {
  categoryId?: number;
  name: string;
  parentId?: number;
}) => {
  return http.request<void>(
    "post",
    "/edu/backend/v1/question-bank/category/upsert",
    { data }
  );
};

/**
 * 删除分类
 */
export const deleteCategory = (data: { categoryId: number }) => {
  return http.request<void>(
    "post",
    "/edu/backend/v1/question-bank/category/delete",
    { data }
  );
};

/**
 * 获取题目列表
 */
export const getQuestionList = (params: {
  pageNum: number;
  pageSize?: number;
  categoryId?: number;
  type?: string;
  difficulty?: string;
  keyword?: string;
}) => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      total: number;
      list: Array<{
        questionId: number;
        content: string;
        type: "single" | "multiple" | "judge" | "fill" | "essay";
        difficulty: "easy" | "medium" | "hard";
        categoryId: number;
        categoryName: string;
        score: number;
        usageCount: number;
        accuracy: number;
        createTime: string;
      }>;
    };
  }>("get", "/edu/backend/v1/question-bank/question/list", { params });
};

/**
 * 获取题目详情
 */
export const getQuestionDetail = (params: { questionId: number }) => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      questionId: number;
      content: string;
      type: string;
      difficulty: string;
      categoryId: number;
      score: number;
      options?: Array<{ content: string; isAnswer: boolean }>;
      answer: any;
      analysis: string;
    };
  }>("get", "/edu/backend/v1/question-bank/question/detail", { params });
};

/**
 * 添加或更新题目
 */
export const upsertQuestion = (data: {
  questionId?: number;
  content: string;
  type: string;
  difficulty: string;
  categoryId: number;
  score: number;
  options?: Array<{ content: string; isAnswer: boolean }>;
  answer: any;
  analysis: string;
}) => {
  return http.request<void>(
    "post",
    "/edu/backend/v1/question-bank/question/upsert",
    { data }
  );
};

/**
 * 删除题目
 */
export const deleteQuestion = (data: { questionId: number }) => {
  return http.request<void>(
    "post",
    "/edu/backend/v1/question-bank/question/delete",
    { data }
  );
};

/**
 * 批量删除题目
 */
export const batchDeleteQuestions = (data: { questionIds: number[] }) => {
  return http.request<void>(
    "post",
    "/edu/backend/v1/question-bank/question/batch-delete",
    { data }
  );
};

/**
 * 导入题目
 */
export const importQuestions = (data: FormData) => {
  return http.request<{
    code: number;
    msg: string;
    data: { success: number; failed: number };
  }>("post", "/edu/backend/v1/question-bank/question/import", { data });
};

// ==================== 排行榜 ====================

/**
 * 获取积分排行榜
 */
export const getLeaderboard = (params: {
  type: "total" | "weekly" | "monthly";
}) => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      list: Array<{
        userId: number;
        username: string;
        avatar: string;
        points: number;
        rank: number;
      }>;
    };
  }>("get", "/edu/backend/v1/competition/leaderboard", { params });
};
