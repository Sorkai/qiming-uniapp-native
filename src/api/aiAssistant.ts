import { http } from "@/utils/http";
import { getToken, formatToken } from "@/utils/auth";
import type {
  ScreenAnalyzeRequest,
  ScreenAnalyzeResponse,
  CourseQARequest,
  CourseQAResponse,
  ConversationListParams,
  ConversationListResponse,
  ConversationDetailResponse,
  CreateConversationReq,
  CreateConversationResponse,
  DeleteConversationResponse,
  MessageListResponse,
  MessageHistoryParams,
  UploadAttachmentParams,
  AttachmentInfo,
  MultimodalStreamReq,
  ContinueStreamReq,
  SSEEventData
} from "@/components/AiScreenCapture/types";

export type AnalyzeResult = {
  code: number;
  msg: string;
  data: ScreenAnalyzeResponse;
};

export type CourseQAResult = {
  code: number;
  msg: string;
  data: CourseQAResponse;
};

export type ConversationListResult = {
  code: number;
  msg: string;
  data: ConversationListResponse;
};

export type ConversationDetailResult = {
  code: number;
  msg: string;
  data: ConversationDetailResponse;
};

export type CreateConversationResult = {
  code: number;
  msg: string;
  data: CreateConversationResponse;
};

export type DeleteConversationResult = {
  code: number;
  msg: string;
  data: DeleteConversationResponse;
};

export type MessageHistoryResult = {
  code: number;
  msg: string;
  data: MessageListResponse;
};

export type UploadAttachmentResult = {
  code: number;
  msg: string;
  data: AttachmentInfo;
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

/**
 * 通用 AI 提问接口（图片 + 问题）
 */
export const askGeneralAi = (data: ScreenAnalyzeRequest) => {
  return http.request<AnalyzeResult>("post", "/edu/v1/ai/screen/analyze", {
    data
  });
};

/**
 * 单课问答（非流式）
 */
export const askCourseQa = (data: CourseQARequest) => {
  return http.request<CourseQAResult>("post", "/edu/frontend/v1/ai/qa", {
    data
  });
};

/**
 * 上传 AI 聊天图片附件
 */
export const uploadAiChatAttachment = (
  file: File | Blob,
  params: UploadAttachmentParams = {}
) => {
  const formData = new FormData();
  formData.append("file", file);
  if (params.scene) formData.append("scene", params.scene);
  if (params.conversation_id)
    formData.append("conversation_id", params.conversation_id);
  if (params.course_id) formData.append("course_id", String(params.course_id));

  return http.request<UploadAttachmentResult>(
    "post",
    "/edu/frontend/v1/ai/chat/attachments",
    {
      data: formData,
      headers: {
        "Content-Type": "multipart/form-data"
      }
    }
  );
};

/**
 * 新建会话并发起多模态流式对话（SSE）
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

/**
 * 在已有会话中继续发起多模态流式对话（SSE）
 */
export function continueAiChatStream(
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

/**
 * 创建 AI 会话
 */
export const createAiConversation = (data: CreateConversationReq) => {
  return http.request<CreateConversationResult>(
    "post",
    "/edu/frontend/v1/ai/conversations",
    {
      data
    }
  );
};

/**
 * 删除 AI 会话
 */
export const deleteAiConversation = (conversationId: string) => {
  return http.request<DeleteConversationResult>(
    "delete",
    `/edu/frontend/v1/ai/conversations/${conversationId}`
  );
};

/**
 * 获取 AI 会话列表
 */
export const getAiConversations = (params: ConversationListParams) => {
  return http.request<ConversationListResult>(
    "get",
    "/edu/frontend/v1/ai/conversations",
    {
      params
    }
  );
};

/**
 * 获取 AI 会话详情
 */
export const getAiConversationDetail = (conversationId: string) => {
  return http.request<ConversationDetailResult>(
    "get",
    `/edu/frontend/v1/ai/conversations/${conversationId}`
  );
};

/**
 * 获取 AI 会话消息历史
 */
export const getAiMessageHistory = (
  conversationId: string,
  params: MessageHistoryParams
) => {
  return http.request<MessageHistoryResult>(
    "get",
    `/edu/frontend/v1/ai/conversations/${conversationId}/messages`,
    {
      params
    }
  );
};
