import { http } from "@/utils/http";
import { getToken, formatToken } from "@/utils/auth";
import type {
  CreateConversationReq,
  ConversationInfo,
  ConversationListParams,
  AttachmentInfo,
  MultimodalStreamReq,
  ContinueStreamReq,
  SSEEventData,
  MessageHistoryParams
} from "@/components/AiScreenCapture/types";

// ===== 通用响应类型 =====
interface ApiResponse<T> {
  code: number;
  msg: string;
  data: T;
}

// ===== 会话 CRUD =====

/** 创建会话 */
export const createConversation = (data: CreateConversationReq) => {
  return http.request<ApiResponse<ConversationInfo>>(
    "post",
    "/edu/frontend/v1/ai/conversations",
    { data }
  );
};

/** 会话列表 */
export const getConversationList = (params: ConversationListParams = {}) => {
  return http.request<ApiResponse<{ list: ConversationInfo[]; total: number }>>(
    "get",
    "/edu/frontend/v1/ai/conversations",
    { params }
  );
};

/** 会话详情 */
export const getConversationDetail = (conversationId: string) => {
  return http.request<ApiResponse<ConversationInfo>>(
    "get",
    `/edu/frontend/v1/ai/conversations/${encodeURIComponent(conversationId)}`
  );
};

/** 删除会话（软删除） */
export const deleteConversation = (conversationId: string) => {
  return http.request<ApiResponse<null>>(
    "delete",
    `/edu/frontend/v1/ai/conversations/${encodeURIComponent(conversationId)}`
  );
};

/** 获取会话消息历史 */
export const getMessageHistory = (
  conversationId: string,
  params: MessageHistoryParams = {}
) => {
  return http.request<ApiResponse<{ list: any[]; total: number }>>(
    "get",
    `/edu/frontend/v1/ai/conversations/${encodeURIComponent(conversationId)}/messages`,
    { params }
  );
};

// ===== 附件上传 =====

/** 上传聊天图片附件 */
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

// ===== SSE 流式解析工具 =====

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

// ===== 多模态流式对话 =====

/** 新建会话并发起多模态流式对话 */
export function multimodalChatStream(
  params: MultimodalStreamReq,
  onEvent: (data: SSEEventData) => void
): () => void {
  const controller = new AbortController();

  fetch("/api/edu/frontend/v1/ai/chat/multimodal/stream", {
    method: "POST",
    headers: buildAuthHeaders(),
    body: JSON.stringify(params),
    signal: controller.signal
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      parseSSEStream(response, onEvent);
    })
    .catch(error => {
      if (error.name === "AbortError") return;
      console.error("多模态流式请求错误:", error);
      onEvent({
        event: "error",
        conversation_id: "",
        error_message: "连接出错，请稍后重试",
        finished: true
      });
    });

  return () => controller.abort();
}

/** 在已有会话中继续多模态流式对话 */
export function continueConversationStream(
  conversationId: string,
  params: ContinueStreamReq,
  onEvent: (data: SSEEventData) => void
): () => void {
  const controller = new AbortController();

  fetch(
    `/api/edu/frontend/v1/ai/conversations/${encodeURIComponent(conversationId)}/stream`,
    {
      method: "POST",
      headers: buildAuthHeaders(),
      body: JSON.stringify(params),
      signal: controller.signal
    }
  )
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      parseSSEStream(response, onEvent);
    })
    .catch(error => {
      if (error.name === "AbortError") return;
      console.error("继续会话流式请求错误:", error);
      onEvent({
        event: "error",
        conversation_id: conversationId,
        error_message: "连接出错，请稍后重试",
        finished: true
      });
    });

  return () => controller.abort();
}
