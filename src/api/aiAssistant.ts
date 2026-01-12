import { http } from "@/utils/http";
import type {
  ScreenAnalyzeRequest,
  ScreenAnalyzeResponse,
  ChatRequest,
  ChatResponse,
  HistoryRequest,
  HistoryResponse
} from "@/components/AiScreenCapture/types";

/** AI识屏分析结果类型 */
export type AnalyzeResult = {
  code: number;
  msg: string;
  data: ScreenAnalyzeResponse;
};

/** AI对话结果类型 */
export type ChatResult = {
  code: number;
  msg: string;
  data: ChatResponse;
};

/** 历史记录结果类型 */
export type HistoryResult = {
  code: number;
  msg: string;
  data: HistoryResponse;
};

/** 通用操作结果类型 */
export type CommonResult = {
  code: number;
  msg: string;
  data: any;
};

/**
 * AI识屏分析接口
 * @param data 包含截图base64和可选问题
 */
export const analyzeScreen = (data: ScreenAnalyzeRequest) => {
  return http.request<AnalyzeResult>(
    "post",
    "/edu/v1/ai/screen/analyze",
    { data }
  );
};

/**
 * AI继续对话接口
 * @param data 包含会话ID和用户消息
 */
export const chatWithContext = (data: ChatRequest) => {
  return http.request<ChatResult>(
    "post",
    "/edu/v1/ai/screen/chat",
    { data }
  );
};

/**
 * 获取AI对话历史记录
 * @param params 分页参数
 */
export const getChatHistory = (params: HistoryRequest) => {
  return http.request<HistoryResult>(
    "get",
    "/edu/v1/ai/screen/history",
    { params }
  );
};

/**
 * 删除AI对话历史记录
 * @param sessionId 会话ID
 */
export const deleteChatHistory = (sessionId: string) => {
  return http.request<CommonResult>(
    "delete",
    `/edu/v1/ai/screen/history/${sessionId}`,
    {}
  );
};

/**
 * 获取单个会话详情
 * @param sessionId 会话ID
 */
export const getSessionDetail = (sessionId: string) => {
  return http.request<{
    code: number;
    msg: string;
    data: {
      sessionId: string;
      title: string;
      messages: Array<{
        id: string;
        role: "user" | "assistant";
        content: string;
        image?: string;
        timestamp: number;
      }>;
      screenshot?: string;
      createdAt: number;
      updatedAt: number;
    };
  }>(
    "get",
    `/edu/v1/ai/screen/session/${sessionId}`,
    {}
  );
};
