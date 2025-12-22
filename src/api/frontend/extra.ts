import { http } from "@/utils/http";
import type { ApiResponse } from "./types";

/**
 * 获取实验室统计数据
 */
export const getLabStats = () => {
  return http.request<ApiResponse<{
    animations: number;
    games: number;
    completed: number;
  }>>("get", "/edu/frontend/v1/lab/stats");
};

/**
 * 获取实验项目列表
 */
export const getLabList = (params?: { category?: string }) => {
  return http.request<ApiResponse<{
    list: Array<{
      id: number;
      title: string;
      description: string;
      icon: string;
      category: string;
      difficulty: "easy" | "medium" | "hard";
      duration: string;
      gradient: string;
      featured?: boolean;
      url: string;
    }>;
  }>>("get", "/edu/frontend/v1/lab/list", { params });
};

/**
 * 获取赛事场统计与排名
 */
export const getCompetitionStats = () => {
  return http.request<ApiResponse<{
    userRank: number;
    userPoints: number;
    ojStats: { total: number; solved: number };
    trainingStats: { categories: number; questions: number };
    securityStats: { participants: number };
  }>>("get", "/edu/frontend/v1/competition/stats");
};

/**
 * 获取热门赛事列表
 */
export const getCompetitionEvents = () => {
  return http.request<ApiResponse<{
    list: Array<{
      id: number;
      title: string;
      description: string;
      time: string;
      participants: number;
      status: "upcoming" | "ongoing" | "ended";
    }>;
  }>>("get", "/edu/frontend/v1/competition/events");
};

/**
 * 获取积分排行榜
 */
export const getLeaderboard = (params: { type: "weekly" | "monthly" | "total" }) => {
  return http.request<ApiResponse<{
    list: Array<{
      id: number;
      username: string;
      avatar: string;
      solved: number;
      points: number;
    }>;
  }>>("get", "/edu/frontend/v1/competition/leaderboard", { params });
};

/**
 * 获取 OJ 题目列表
 */
export const getOJProblemList = (params: {
  difficulty?: string;
  category?: string;
  keyword?: string;
  pageNum?: number;
  pageSize?: number;
}) => {
  return http.request<ApiResponse<{
    total: number;
    list: Array<{
      id: number;
      title: string;
      difficulty: "easy" | "medium" | "hard";
      acceptance: string;
      status: "solved" | "attempted" | "";
    }>;
  }>>("get", "/edu/frontend/v1/competition/oj/list", { params });
};

/**
 * 获取训练分类
 */
export const getTrainingCategories = () => {
  return http.request<ApiResponse<{
    list: Array<{
      id: number;
      name: string;
      icon: string;
      count: number;
      progress: number;
    }>;
  }>>("get", "/edu/frontend/v1/competition/training/categories");
};

/**
 * 获取国家安全竞赛题目
 */
export const getSecurityQuiz = () => {
  return http.request<ApiResponse<{
    questions: Array<{
      question: string;
      options: string[];
      answer: number;
    }>;
  }>>("get", "/edu/frontend/v1/competition/security/quiz");
};
