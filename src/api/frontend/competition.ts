import { http } from "@/utils/http";
import type { ApiResponse } from "./types";

// ==================== OJ 相关 ====================

/**
 * 获取学生OJ统计数据
 */
export const getStudentOJStats = () => {
  return http.request<
    ApiResponse<{
      totalProblems: number;
      solved: number;
      attempted: number;
      rank: number;
    }>
  >("get", "/edu/frontend/v1/oj/stats");
};

/**
 * 获取学生端题目列表
 */
export const getStudentProblemList = (params: {
  pageNum: number;
  pageSize?: number;
  title?: string;
  difficulty?: string;
  tags?: string;
  status?: string; // all, solved, attempted, unsolved
}) => {
  return http.request<
    ApiResponse<{
      total: number;
      list: Array<{
        problemId: number;
        title: string;
        difficulty: "easy" | "medium" | "hard";
        tags: string[];
        acceptRate: number;
        myStatus: "solved" | "attempted" | null;
      }>;
    }>
  >("get", "/edu/frontend/v1/oj/problem/list", { params });
};

/**
 * 获取题目详情
 */
export const getStudentProblemDetail = (params: { problemId: number }) => {
  return http.request<
    ApiResponse<{
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
      myStatus: "solved" | "attempted" | null;
    }>
  >("get", "/edu/frontend/v1/oj/problem/detail", { params });
};

/**
 * 获取我的提交记录
 */
export const getMySubmissions = (params: {
  pageNum: number;
  pageSize?: number;
  problemId?: number;
}) => {
  return http.request<
    ApiResponse<{
      total: number;
      list: Array<{
        submissionId: number;
        problemId: number;
        problemTitle: string;
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
    }>
  >("get", "/edu/frontend/v1/oj/submission/my", { params });
};

/**
 * 运行代码（不计入提交）
 */
export const runCode = (data: {
  problemId: number;
  language: string;
  code: string;
  input?: string;
}) => {
  return http.request<
    ApiResponse<{
      status: string;
      output: string;
      runTime: number;
      memory: number;
      error?: string;
    }>
  >("post", "/edu/frontend/v1/oj/run", { data });
};

/**
 * 提交代码
 */
export const submitCode = (data: {
  problemId: number;
  language: string;
  code: string;
}) => {
  return http.request<
    ApiResponse<{
      submissionId: number;
      status: string;
      runTime: number;
      memory: number;
      passedCases: number;
      totalCases: number;
    }>
  >("post", "/edu/frontend/v1/oj/submit", { data });
};

// ==================== 作文批改相关 ====================

/**
 * 获取作文题目列表
 */
export const getEssayTopics = () => {
  return http.request<
    ApiResponse<{
      list: Array<{
        topicId: number;
        title: string;
        requirement: string;
        wordLimit: { min: number; max: number };
        deadline: string;
        hasSubmitted: boolean;
        score?: number;
      }>;
    }>
  >("get", "/edu/frontend/v1/essay/topics");
};

/**
 * 获取我的作文
 */
export const getMyEssay = (params: { topicId: number }) => {
  return http.request<
    ApiResponse<{
      essayId: number | null;
      content: string;
      wordCount: number;
      submitTime: string | null;
      status: "draft" | "submitted" | "ai_reviewed" | "teacher_reviewed";
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
    }>
  >("get", "/edu/frontend/v1/essay/my", { params });
};

/**
 * 保存草稿
 */
export const saveDraft = (data: { topicId: number; content: string }) => {
  return http.request<void>("post", "/edu/frontend/v1/essay/draft", { data });
};

/**
 * 提交作文
 */
export const submitEssay = (data: { topicId: number; content: string }) => {
  return http.request<
    ApiResponse<{
      essayId: number;
    }>
  >("post", "/edu/frontend/v1/essay/submit", { data });
};

/**
 * 请求AI预检查
 */
export const requestAICheck = (data: { content: string }) => {
  return http.request<
    ApiResponse<{
      score: number;
      dimensions: Array<{ name: string; score: number; maxScore: number }>;
      suggestions: string[];
      corrections: Array<{ original: string; corrected: string; type: string }>;
    }>
  >("post", "/edu/frontend/v1/essay/ai-check", { data });
};

// ==================== 题库训练相关 ====================

/**
 * 获取训练分类列表
 */
export const getTrainingCategories = () => {
  return http.request<
    ApiResponse<
      Array<{
        categoryId: number;
        name: string;
        total: number;
        completed: number;
        children?: Array<{
          categoryId: number;
          name: string;
          total: number;
          completed: number;
        }>;
      }>
    >
  >("get", "/edu/frontend/v1/training/categories");
};

/**
 * 获取训练题目
 */
export const getTrainingQuestions = (params: {
  categoryId: number;
  mode: string; // sequential, random
}) => {
  return http.request<
    ApiResponse<{
      list: Array<{
        questionId: number;
        content: string;
        type: "single" | "multiple" | "judge" | "fill" | "essay";
        difficulty: "easy" | "medium" | "hard";
        score: number;
        options?: Array<{ content: string; isAnswer?: boolean }>;
        answer?: any;
        analysis?: string;
      }>;
    }>
  >("get", "/edu/frontend/v1/training/questions", { params });
};

/**
 * 提交训练答案
 */
export const submitTrainingAnswer = (data: {
  questionId: number;
  answer: any;
  isCorrect: boolean;
}) => {
  return http.request<void>("post", "/edu/frontend/v1/training/answer", {
    data
  });
};

/**
 * 获取错题列表
 */
export const getWrongQuestions = () => {
  return http.request<
    ApiResponse<{
      list: Array<{
        questionId: number;
        content: string;
        type: string;
        difficulty: string;
        wrongCount: number;
        lastWrongTime: string;
        options?: Array<{ content: string; isAnswer?: boolean }>;
        answer?: any;
        analysis?: string;
      }>;
    }>
  >("get", "/edu/frontend/v1/training/wrong");
};

/**
 * 清空错题
 */
export const clearWrongQuestions = () => {
  return http.request<void>("post", "/edu/frontend/v1/training/wrong/clear");
};

/**
 * 开始模拟考试
 */
export const startMockExam = (data: {
  categoryId: number;
  questionCount: number;
  duration: number;
}) => {
  return http.request<
    ApiResponse<{
      examId: number;
      questions: Array<{
        questionId: number;
        content: string;
        type: string;
        difficulty: string;
        score: number;
        options?: Array<{ content: string }>;
      }>;
    }>
  >("post", "/edu/frontend/v1/training/exam/start", { data });
};

/**
 * 提交模拟考试
 */
export const submitMockExam = (data: {
  questions: Array<{ questionId: number }>;
  answers: any[];
}) => {
  return http.request<
    ApiResponse<{
      score: number;
      totalScore: number;
      correctCount: number;
      wrongCount: number;
      details: Array<{
        questionId: number;
        isCorrect: boolean;
        userAnswer: any;
        correctAnswer: any;
      }>;
    }>
  >("post", "/edu/frontend/v1/training/exam/submit", { data });
};

/**
 * 获取学生竞赛综合统计
 */
export const getCompetitionOverview = () => {
  return http.request<
    ApiResponse<{
      ojStats: {
        total: number;
        solved: number;
        rank: number;
      };
      essayStats: {
        submitted: number;
        avgScore: number;
      };
      trainingStats: {
        completed: number;
        accuracy: number;
      };
    }>
  >("get", "/edu/frontend/v1/competition/overview");
};
