import { http } from "@/utils/http";
import { getToken, formatToken } from "@/utils/auth";
import {
  CreateConversationReq,
  CreateConversationResponse,
  ConversationDetailResponse,
  ConversationListResponse,
  ConversationListParams,
  ConversationHistoryResponse,
  DeleteConversationResponse,
  AttachmentInfo,
  MultimodalStreamReq,
  ContinueStreamReq,
  SSEEventData,
  MessageHistoryParams,
  MessageListResponse,
  CourseQARequest,
  CourseQAResponse,
  StreamCourseChatReq,
  SimpleChatStreamData,
  UploadAttachmentStsInitParams,
  UploadAttachmentStsInitResponse,
  UploadAttachmentStsCompleteParams
} from "@/components/AiScreenCapture/types";

// ===== 通用响应类型 =====
interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

// ===== 会话 CRUD =====

/** 创建 AI 会话
 * POST /edu/frontend/v1/ai/conversations
 */
export const createConversation = (data: CreateConversationReq) => {
  return http.request<ApiResponse<CreateConversationResponse>>(
    "post",
    "/edu/frontend/v1/ai/conversations",
    { data }
  );
};

/** 获取 AI 会话列表（分页）
 * GET /edu/frontend/v1/ai/conversations
 */
export const getConversationList = (params: ConversationListParams = {}) => {
  return http.request<ApiResponse<ConversationListResponse>>(
    "get",
    "/edu/frontend/v1/ai/conversations",
    { params }
  );
};

/** 获取 AI 会话详情
 * GET /edu/frontend/v1/ai/conversations/{conversationId}
 */
export const getConversationDetail = (conversationId: string) => {
  return http.request<ApiResponse<ConversationDetailResponse>>(
    "get",
    `/edu/frontend/v1/ai/conversations/${encodeURIComponent(conversationId)}`
  );
};

/** 删除 AI 会话（软删除）
 * DELETE /edu/frontend/v1/ai/conversations/{conversationId}
 */
export const deleteConversation = (conversationId: string) => {
  return http.request<ApiResponse<DeleteConversationResponse>>(
    "delete",
    `/edu/frontend/v1/ai/conversations/${encodeURIComponent(conversationId)}`
  );
};

/** 获取 AI 会话消息历史（分页）
 * GET /edu/frontend/v1/ai/conversations/{conversationId}/messages
 */
export const getMessageHistory = (
  conversationId: string,
  params: MessageHistoryParams = {}
) => {
  return http.request<ApiResponse<MessageListResponse>>(
    "get",
    `/edu/frontend/v1/ai/conversations/${encodeURIComponent(conversationId)}/messages`,
    { params }
  );
};

// ===== 传统接口 =====

/** 获取会话历史（传统接口）
 * GET /edu/frontend/v1/ai/get/conversations
 */
export const getConversationHistory = (conversationId: string) => {
  return http.request<ApiResponse<ConversationHistoryResponse>>(
    "get",
    "/edu/frontend/v1/ai/get/conversations",
    { params: { conversation_id: conversationId } }
  );
};

/** 单课问答（非流式）
 * POST /edu/frontend/v1/ai/qa
 */
export const courseQA = (data: CourseQARequest) => {
  return http.request<ApiResponse<CourseQAResponse>>(
    "post",
    "/edu/frontend/v1/ai/qa",
    { data }
  );
};

// ===== 附件上传 =====

/** 上传 AI 聊天图片附件
 * POST /edu/frontend/v1/ai/chat/attachments
 */
export const uploadChatAttachment = (
  file: File | Blob,
  options?: {
    scene?: string;
    conversation_id?: string;
    course_id?: number;
  }
) => {
  const formData = new FormData();
  formData.append("file", file);
  if (options?.scene) formData.append("scene", options.scene);
  if (options?.conversation_id)
    formData.append("conversation_id", options.conversation_id);
  if (options?.course_id)
    formData.append("course_id", String(options.course_id));

  return http.request<ApiResponse<AttachmentInfo>>(
    "post",
    "/edu/frontend/v1/ai/chat/attachments",
    {
      data: formData,
      headers: { "Content-Type": "multipart/form-data" }
    }
  );
};

/** 初始化 AI 聊天附件 STS 上传
 * POST /edu/frontend/v1/ai/chat/attachments/sts/init
 */
export const initChatAttachmentStsUpload = (
  data: UploadAttachmentStsInitParams
) => {
  return http.request<ApiResponse<UploadAttachmentStsInitResponse>>(
    "post",
    "/edu/frontend/v1/ai/chat/attachments/sts/init",
    { data }
  );
};

/** 完成 AI 聊天附件 STS 上传
 * POST /edu/frontend/v1/ai/chat/attachments/sts/complete
 */
export const completeChatAttachmentStsUpload = (
  data: UploadAttachmentStsCompleteParams
) => {
  return http.request<ApiResponse<AttachmentInfo>>(
    "post",
    "/edu/frontend/v1/ai/chat/attachments/sts/complete",
    { data }
  );
};

// ===== SSE 流式解析工具 =====

function buildAuthHeaders(): Record<string, string> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-Requested-With": "XMLHttpRequest"
  };
  if (token) {
    headers["Authorization"] = formatToken(token.accessToken);
  }
  return headers;
}

function parseSSEStream(
  response: Response,
  onEvent: (data: SSEEventData) => void
) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("无法获取响应流");

  const decoder = new TextDecoder();
  let buffer = "";

  function read() {
    reader!
      .read()
      .then(({ done, value }) => {
        if (done) return;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.substring(6).trim();
            if (!jsonStr) continue;
            try {
              const data: SSEEventData = JSON.parse(jsonStr);
              onEvent(data);
            } catch (e) {
              console.error("解析SSE消息失败:", e, line);
            }
          }
        }
        read();
      })
      .catch(error => {
        console.error("流读取错误:", error);
        onEvent({
          event: "error",
          conversation_id: "",
          error_message: "连接出错，请稍后重试",
          finished: true
        });
      });
  }

  read();
}

/** 解析简单格式的 SSE 流（单课AI互动接口格式）*/
function parseSimpleSSEStream(
  response: Response,
  onEvent: (data: SimpleChatStreamData) => void
) {
  const reader = response.body?.getReader();
  if (!reader) throw new Error("无法获取响应流");

  const decoder = new TextDecoder();
  let buffer = "";

  function read() {
    reader!
      .read()
      .then(({ done, value }) => {
        if (done) return;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const jsonStr = line.substring(6).trim();
            if (!jsonStr) continue;
            try {
              const data: SimpleChatStreamData = JSON.parse(jsonStr);
              onEvent(data);
            } catch (e) {
              console.error("解析SSE消息失败:", e, line);
            }
          }
        }
        read();
      })
      .catch(error => {
        console.error("流读取错误:", error);
        onEvent({
          conversation_id: "",
          delta: "",
          finished: true
        });
      });
  }

  read();
}

// ===== 单课 AI 互动（流式） =====

/** 单课AI互动（流式）
 * POST /edu/frontend/v1/ai/chat/stream
 * 返回取消函数
 */
export function streamCourseChat(
  params: StreamCourseChatReq,
  onEvent: (data: SimpleChatStreamData) => void
): () => void {
  const controller = new AbortController();
  const baseURL = import.meta.env.VITE_API_URL || "/api";

  fetch(`${baseURL}/edu/frontend/v1/ai/chat/stream`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(params),
    signal: controller.signal
  })
    .then(async response => {
      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error?.message || errorData.msg || errorMsg;
        } catch (e) {
          // 无法解析错误响应
        }
        console.error("单课AI互动流式请求错误:", errorMsg);
        onEvent({
          conversation_id: "",
          delta: `错误: ${errorMsg}`,
          finished: true
        });
        return;
      }
      parseSimpleSSEStream(response, onEvent);
    })
    .catch(error => {
      if (error.name === "AbortError") return;
      console.error("单课AI互动流式请求错误:", error);
      onEvent({
        conversation_id: "",
        delta: "",
        finished: true
      });
    });

  return () => controller.abort();
}

// ===== 多模态流式对话 =====

/** 新建会话并发起多模态流式对话
 * POST /edu/frontend/v1/ai/chat/multimodal/stream
 * 返回取消函数
 */
export function multimodalChatStream(
  params: MultimodalStreamReq,
  onEvent: (data: SSEEventData) => void
): () => void {
  const controller = new AbortController();
  const baseURL = import.meta.env.VITE_API_URL || "/api";

  fetch(`${baseURL}/edu/frontend/v1/ai/chat/multimodal/stream`, {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(params),
    signal: controller.signal
  })
    .then(async response => {
      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error?.message || errorData.msg || errorMsg;
        } catch (e) {
          // 无法解析错误响应
        }
        throw new Error(errorMsg);
      }
      parseSSEStream(response, onEvent);
    })
    .catch(error => {
      if (error.name === "AbortError") return;
      console.error("多模态流式请求错误:", error);
      onEvent({
        event: "error",
        conversation_id: "",
        error_message: error.message || "连接出错，请稍后重试",
        finished: true
      });
    });

  return () => controller.abort();
}

/** 在已有会话中继续多模态流式对话
 * POST /edu/frontend/v1/ai/conversations/{conversationId}/stream
 * 返回取消函数
 */
export function continueConversationStream(
  conversationId: string,
  params: ContinueStreamReq,
  onEvent: (data: SSEEventData) => void
): () => void {
  const controller = new AbortController();
  const baseURL = import.meta.env.VITE_API_URL || "/api";

  fetch(
    `${baseURL}/edu/frontend/v1/ai/conversations/${encodeURIComponent(conversationId)}/stream`,
    {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify(params),
      signal: controller.signal
    }
  )
    .then(async response => {
      if (!response.ok) {
        let errorMsg = `HTTP ${response.status}`;
        try {
          const errorData = await response.json();
          errorMsg = errorData.error?.message || errorData.msg || errorMsg;
        } catch (e) {
          // 无法解析错误响应
        }
        throw new Error(errorMsg);
      }
      parseSSEStream(response, onEvent);
    })
    .catch(error => {
      if (error.name === "AbortError") return;
      console.error("继续会话流式请求错误:", error);
      onEvent({
        event: "error",
        conversation_id: conversationId,
        error_message: error.message || "连接出错，请稍后重试",
        finished: true
      });
    });

  return () => controller.abort();
}
