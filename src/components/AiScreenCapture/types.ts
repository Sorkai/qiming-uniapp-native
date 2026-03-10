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
  image?: string; // base64图片或附件URL
  timestamp: number;
  loading?: boolean;
}

// AI分析请求（旧接口保留）
export interface ScreenAnalyzeRequest {
  image: string; // base64截图
  question?: string; // 用户问题
}

// AI分析响应（旧接口保留）
export interface ScreenAnalyzeResponse {
  answer: string;
  suggestions?: string[]; // 推荐问题
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

// ===== AI 会话管理相关类型 =====

// 会话场景
export type AIScene = "general" | "course" | string;

// 创建会话请求
export interface CreateConversationReq {
  scene: AIScene;
  course_id?: number;
  chapter_id?: number;
}

// 创建会话响应
export interface ConversationInfo {
  conversation_id: string;
  scene: AIScene;
  title: string;
  expire_at: string;
  created_at: string;
}

// 会话列表查询参数
export interface ConversationListParams {
  page?: number;
  page_size?: number;
  scene?: AIScene;
  keyword?: string;
}

// 上传附件响应
export interface AttachmentInfo {
  attachment_id: string;
  url: string;
  mime_type: string;
  file_size: number;
  width: number;
  height: number;
  status: string;
  created_at: string;
}

// 多模态流式请求（新建会话）
export interface MultimodalStreamReq {
  scene: AIScene;
  course_id?: number;
  chapter_id?: number;
  message: string;
  attachment_ids?: string[];
  metadata?: Record<string, string>;
}

// 继续会话流式请求
export interface ContinueStreamReq {
  message: string;
  attachment_ids?: string[];
  metadata?: Record<string, string>;
}

// SSE 事件类型
export type SSEEventType =
  | "conversation.created"
  | "user_message.saved"
  | "assistant.delta"
  | "assistant.completed"
  | "error";

// SSE 事件数据
export interface SSEEventData {
  event: SSEEventType;
  conversation_id: string;
  message_id?: string;
  delta?: string;
  content_text?: string;
  finish_reason?: string;
  error_message?: string;
  finished: boolean;
  created_at?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

// 会话消息历史查询参数
export interface MessageHistoryParams {
  page?: number;
  page_size?: number;
}

// 历史消息项
export interface HistoryMessage {
  role: string;
  content: string;
  timestamp: string;
}
