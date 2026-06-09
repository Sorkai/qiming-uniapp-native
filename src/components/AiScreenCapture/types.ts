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
  placeholder?: string;
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

// 会话列表详情项
export interface ConversationListItem {
  conversation_id: string;
  scene: string;
  course_id?: number;
  chapter_id?: number;
  title: string;
  summary: string;
  last_message_preview: string;
  last_message_at: string;
  message_count: number;
  attachment_count: number;
  expire_at: string;
  created_at: string;
}

// 创建会话响应
export interface CreateConversationResponse {
  conversation_id: string;
  scene: string;
  course_id?: number;
  chapter_id?: number;
  title: string;
  expire_at: string;
  created_at: string;
}

// 删除会话响应
export interface DeleteConversationResponse {
  conversation_id: string;
  deleted: boolean;
}

// 会话详情响应
export interface ConversationDetailResponse {
  conversation_id: string;
  scene: string;
  course_id?: number;
  chapter_id?: number;
  title: string;
  summary: string;
  status: string;
  message_count: number;
  attachment_count: number;
  last_message_at: string;
  expire_at: string;
  created_at: string;
  updated_at: string;
}

// 会话列表响应
export interface ConversationListResponse {
  total: number;
  list: ConversationListItem[];
  page: number;
  page_size: number;
  has_more: boolean;
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

// 上传附件请求参数
export interface UploadAttachmentParams {
  scene?: string;
  conversation_id?: string;
  course_id?: number;
}

// AI 聊天附件 STS 上传初始化请求参数
export interface UploadAttachmentStsInitParams {
  scene?: string;
  conversation_id?: string;
  course_id?: number;
  file_name: string;
  content_type: string;
  file_size: number;
}

// AI 聊天附件 STS 临时凭证
export interface AttachmentStsCredentials {
  tmp_secret_id?: string;
  tmp_secret_key?: string;
  security_token?: string;
  session_token?: string;
  tmpSecretId?: string;
  tmpSecretKey?: string;
  securityToken?: string;
  sessionToken?: string;
  start_time?: number;
  expired_time?: number;
  region?: string;
  bucket?: string;
  upload_host?: string;
  upload_url?: string;
}

// AI 聊天附件 STS 上传初始化响应
export interface UploadAttachmentStsInitResponse {
  attachment_id: string;
  upload_token: string;
  object_key: string;
  upload_url: string;
  credentials?: AttachmentStsCredentials;
  expired_time?: number;
}

// AI 聊天附件 STS 上传完成请求参数
export interface UploadAttachmentStsCompleteParams {
  upload_token: string;
  width?: number;
  height?: number;
  sha256?: string;
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

/** 传统会话历史响应格式 (GET /edu/frontend/v1/ai/get/conversations) */
export interface ConversationHistoryResponse {
  conversation_id: string;
  history: Array<{
    role: string;
    content: string;
    timestamp: string;
  }>;
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

// 消息内容分段
export interface ContentSegment {
  type: string;
  text?: string;
  attachment_id?: string;
  url?: string;
  mime_type?: string;
  width?: number;
  height?: number;
}

// 消息附件
export interface MessageAttachment {
  attachment_id: string;
  url: string;
  mime_type: string;
  width?: number;
  height?: number;
  file_size?: number;
}

// 会话消息详情
export interface ConversationMessage {
  message_id: string;
  role: string;
  content_text: string;
  content_segments?: ContentSegment[];
  attachments?: MessageAttachment[];
  status: string;
  tool_calls?: any[];
  created_at: string;
}

// 会话消息列表响应
export interface MessageListResponse {
  total: number;
  list: ConversationMessage[];
  page: number;
  page_size: number;
  has_more: boolean;
}

// 单课问答（非流式）请求参数
export interface CourseQARequest {
  courseId: number;
  session_id?: string;
  userPrompt: string;
}

// 单课问答（非流式）响应数据
export interface CourseQAResponse {
  answer: string;
}

// 单课AI互动（流式）请求参数
export interface StreamCourseChatReq {
  course_id?: number;
  chapter_id?: number;
  conversation_id?: string;
  message?: string;
}

// 单课AI互动（流式）SSE 返回数据（简单格式）
export interface SimpleChatStreamData {
  conversation_id: string;
  delta: string;
  finished: boolean;
}
