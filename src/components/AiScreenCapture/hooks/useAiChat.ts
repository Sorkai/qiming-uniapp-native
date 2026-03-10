import { ref } from "vue";
import { ElMessage } from "element-plus";
import type { ChatMessage, SSEEventData } from "../types";
import {
  uploadChatAttachment,
  multimodalChatStream,
  continueConversationStream
} from "@/api/frontend/aiConversation";

/**
 * 将 base64 数据转为 Blob，用于附件上传
 */
function base64ToBlob(base64: string): Blob {
  const parts = base64.split(",");
  const mime = parts[0]?.match(/:(.*?);/)?.[1] || "image/png";
  const byteStr = atob(parts[1]);
  const ab = new ArrayBuffer(byteStr.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteStr.length; i++) {
    ia[i] = byteStr.charCodeAt(i);
  }
  return new Blob([ab], { type: mime });
}

/**
 * AI 对话 Hook（多模态流式模式）
 * 支持截图上传附件 → 多模态流式对话 → 连续追问
 */
export function useAiChat() {
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);
  const suggestions = ref<string[]>([]);
  const conversationId = ref("");
  const currentImage = ref("");
  let cancelStream: (() => void) | null = null;

  const generateId = () =>
    `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;

  const addUserMessage = (content: string, image?: string) => {
    const message: ChatMessage = {
      id: generateId(),
      role: "user",
      content,
      image,
      timestamp: Date.now()
    };
    messages.value.push(message);
    return message;
  };

  const addLoadingMessage = () => {
    const message: ChatMessage = {
      id: generateId(),
      role: "assistant",
      content: "",
      timestamp: Date.now(),
      loading: true
    };
    messages.value.push(message);
    return message;
  };

  const updateAssistantDelta = (id: string, delta: string) => {
    const msg = messages.value.find(m => m.id === id);
    if (msg) {
      msg.content += delta;
      msg.loading = false;
    }
  };

  const finalizeAssistantMessage = (id: string, fullContent?: string) => {
    const msg = messages.value.find(m => m.id === id);
    if (msg) {
      if (fullContent !== undefined) msg.content = fullContent;
      msg.loading = false;
    }
  };

  /**
   * 处理 SSE 事件统一逻辑
   */
  const handleSSEEvent = (
    data: SSEEventData,
    loadingMsgId: string,
    resolve: () => void
  ) => {
    switch (data.event) {
      case "conversation.created":
        if (data.conversation_id) {
          conversationId.value = data.conversation_id;
        }
        break;
      case "assistant.delta":
        if (data.delta) {
          updateAssistantDelta(loadingMsgId, data.delta);
        }
        break;
      case "assistant.completed":
        finalizeAssistantMessage(loadingMsgId, data.content_text);
        loading.value = false;
        resolve();
        break;
      case "error":
        finalizeAssistantMessage(
          loadingMsgId,
          data.error_message || "AI 服务暂时不可用"
        );
        loading.value = false;
        resolve();
        break;
    }
    if (data.finished && data.event !== "assistant.completed" && data.event !== "error") {
      loading.value = false;
      resolve();
    }
  };

  /**
   * 截图分析 → 上传附件 → 多模态流式对话
   */
  const analyzeScreenshot = async (image: string, question?: string) => {
    loading.value = true;
    currentImage.value = image;

    const userMsg = question || "请分析这张截图";
    addUserMessage(userMsg, image);
    const loadingMsg = addLoadingMessage();

    try {
      // 1. 将 base64 截图上传为附件
      const blob = base64ToBlob(image);
      const file = new File([blob], "screenshot.png", { type: blob.type });
      const uploadRes = await uploadChatAttachment(file, { scene: "general" });

      const attachmentId =
        (uploadRes as any)?.data?.attachment_id ??
        (uploadRes as any)?.attachment_id;

      if (!attachmentId) {
        throw new Error("附件上传失败");
      }

      // 2. 发起多模态流式对话
      await new Promise<void>(resolve => {
        cancelStream = multimodalChatStream(
          {
            scene: "general",
            message: userMsg,
            attachment_ids: [attachmentId]
          },
          data => handleSSEEvent(data, loadingMsg.id, resolve)
        );
      });
    } catch (error) {
      console.error("AI分析失败:", error);
      finalizeAssistantMessage(
        loadingMsg.id,
        "分析失败，请在下方直接输入您的问题"
      );
      loading.value = false;
    }
  };

  /**
   * 发送追问消息（在已有会话中继续流式对话）
   */
  const sendMessage = async (message: string) => {
    loading.value = true;
    addUserMessage(message);
    const loadingMsg = addLoadingMessage();

    try {
      if (conversationId.value) {
        // 已有会话，继续对话
        await new Promise<void>(resolve => {
          cancelStream = continueConversationStream(
            conversationId.value,
            { message },
            data => handleSSEEvent(data, loadingMsg.id, resolve)
          );
        });
      } else {
        // 无会话 ID，创建新会话（可能截图上传失败后直接发文字）
        await new Promise<void>(resolve => {
          cancelStream = multimodalChatStream(
            {
              scene: "general",
              message
            },
            data => handleSSEEvent(data, loadingMsg.id, resolve)
          );
        });
      }
    } catch (error) {
      console.error("发送消息失败:", error);
      finalizeAssistantMessage(loadingMsg.id, "网络错误，请稍后重试");
      ElMessage.error("发送消息失败，请稍后重试");
      loading.value = false;
    }
  };

  const resetChat = () => {
    if (cancelStream) {
      cancelStream();
      cancelStream = null;
    }
    currentImage.value = "";
    conversationId.value = "";
    messages.value = [];
    suggestions.value = [];
    loading.value = false;
  };

  return {
    messages,
    loading,
    suggestions,
    conversationId,
    analyzeScreenshot,
    sendMessage,
    resetChat
  };
}
