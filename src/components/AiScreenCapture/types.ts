/** AI识屏功能类型定义 */

// 截图区域
export interface CaptureArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

// 聊天消息
export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  image?: string; // base64图片
  timestamp: number;
  loading?: boolean;
}

// 会话信息
export interface ChatSession {
  sessionId: string;
  title: string;
  messages: ChatMessage[];
  screenshot?: string;
  createdAt: number;
  updatedAt: number;
}

// AI分析请求
export interface ScreenAnalyzeRequest {
  image: string; // base64截图
  question?: string; // 用户问题
  sessionId?: string; // 会话ID
}

// AI分析响应
export interface ScreenAnalyzeResponse {
  sessionId: string;
  answer: string;
  suggestions?: string[]; // 推荐问题
}

// 对话请求
export interface ChatRequest {
  sessionId: string;
  message: string;
}

// 对话响应
export interface ChatResponse {
  answer: string;
  suggestions?: string[];
}

// 历史记录请求
export interface HistoryRequest {
  page: number;
  pageSize: number;
}

// 历史记录响应
export interface HistoryResponse {
  total: number;
  list: ChatSession[];
}

// 组件状态
export type CaptureStatus = "idle" | "capturing" | "preview" | "chatting";

// 浮动按钮配置
export interface FloatButtonConfig {
  show: boolean;
  position: {
    right: number;
    bottom: number;
  };
}
