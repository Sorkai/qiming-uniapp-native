import { ref, type Ref } from "vue";
import { ElMessage } from "element-plus";
import type { ChatMessage, SSEEventData, SimpleChatStreamData } from "../types";
import {
  createConversation,
  uploadChatAttachment,
  multimodalChatStream,
  continueConversationStream,
  getConversationHistory,
  streamCourseChat,
  courseQA
} from "@/api/frontend/aiConversation";

/** 课程上下文（用于单课AI互动接口） */
export interface CourseContext {
  courseId: Ref<number | null>;
  chapterId?: Ref<number | null>;
}

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
 * 当传入课程上下文时，文字消息自动走「单课AI互动」流式接口
 */
export function useAiChat(courseCtx?: CourseContext) {
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

  /** 是否处于单课AI互动模式 */
  const isCourseMode = () =>
    !!(courseCtx?.courseId?.value && courseCtx.courseId.value > 0);

  /**
   * 处理「单课AI互动」流式响应（简单格式）
   */
  const handleCourseStreamData = (
    data: SimpleChatStreamData,
    loadingMsgId: string,
    resolve: () => void
  ) => {
    if (data.conversation_id) {
      conversationId.value = data.conversation_id;
    }
    if (data.delta) {
      updateAssistantDelta(loadingMsgId, data.delta);
    }
    if (data.finished) {
      const msg = messages.value.find(m => m.id === loadingMsgId);
      if (msg) msg.loading = false;
      loading.value = false;
      resolve();
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
   * 截图分析 → 上传附件 → 创建会话 → 多模态流式对话
   */
  const analyzeScreenshot = async (image: string, question?: string) => {
    loading.value = true;
    currentImage.value = image;

    const userMsg = question || "请分析这张截图";
    const userMessage = addUserMessage(userMsg, image);
    const loadingMsg = addLoadingMessage();

    try {
      // 1. 将 base64 截图上传为附件
      const blob = base64ToBlob(image);
      const file = new File([blob], "screenshot.png", { type: blob.type });
      const uploadRes = await uploadChatAttachment(file, {
        scene: "general"
      });

      const attachmentId =
        (uploadRes as any)?.data?.attachment_id ??
        (uploadRes as any)?.attachment_id;
      const attachmentUrl =
        (uploadRes as any)?.data?.url ?? (uploadRes as any)?.url;

      if (!attachmentId) {
        throw new Error("附件上传失败");
      }

      // 2. 上传成功后，使用服务器返回的 URL 替换 base64
      if (attachmentUrl && userMessage) {
        userMessage.image = attachmentUrl;
      }

      // 3. 发起多模态流式对话
      await new Promise<void>(resolve => {
        cancelStream = multimodalChatStream(
          {
            scene: "general",
            course_id: isCourseMode() ? courseCtx!.courseId.value! : undefined,
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
   * 通过「单课AI互动」流式接口发送消息
   */
  const sendViaCourseStream = (
    message: string,
    loadingMsgId: string
  ): Promise<void> => {
    return new Promise<void>(resolve => {
      cancelStream = streamCourseChat(
        {
          course_id: courseCtx!.courseId.value!,
          chapter_id: courseCtx?.chapterId?.value ?? undefined,
          conversation_id: conversationId.value || undefined,
          message
        },
        data => handleCourseStreamData(data, loadingMsgId, resolve)
      );
    });
  };

  /**
   * 通过「单课问答（非流式）」接口发送消息
   */
  const sendCourseQa = async (message: string, loadingMsgId: string) => {
    try {
      const res = await courseQA({
        courseId: courseCtx!.courseId.value!,
        session_id: conversationId.value || undefined,
        userPrompt: message
      });
      if (res && res.data) {
        finalizeAssistantMessage(loadingMsgId, res.data.answer);
      } else {
        throw new Error("接口返回内容为空");
      }
    } catch (error) {
      console.error("单课问答接口调用失败:", error);
      finalizeAssistantMessage(loadingMsgId, "问答服务暂时不可用，请稍后重试");
    } finally {
      loading.value = false;
    }
  };

  /**
   * 发送追问消息（在已有会话中继续流式对话）
   * 当存在课程上下文时自动使用「单课AI互动」接口
   */
  const sendMessage = async (message: string, useNonStream = false) => {
    loading.value = true;
    addUserMessage(message);
    const loadingMsg = addLoadingMessage();

    try {
      if (isCourseMode()) {
        if (useNonStream) {
          // 单课问答非流式模式
          await sendCourseQa(message, loadingMsg.id);
        } else {
          // 单课AI互动流式模式
          await sendViaCourseStream(message, loadingMsg.id);
        }
      } else if (conversationId.value) {
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

  /**
   * 加载历史记录
   */
  const loadHistory = async (id: string) => {
    if (!id) return;
    loading.value = true;
    try {
      const res = await getConversationHistory(id);
      if (res && res.data && res.data.history) {
        conversationId.value = res.data.conversation_id || id;
        messages.value = res.data.history.map(item => ({
          id: generateId(),
          role: item.role as "user" | "assistant",
          content: item.content,
          timestamp: new Date(item.timestamp).getTime(),
          loading: false
        }));
      }
    } catch (error) {
      console.error("加载历史记录失败:", error);
      ElMessage.error("加载历史记录失败");
    } finally {
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

  /** 停止当前流式生成 */
  const stopGenerate = () => {
    if (cancelStream) {
      cancelStream();
      cancelStream = null;
    }
    // 结束最后一条 loading 状态的消息
    const last = messages.value[messages.value.length - 1];
    if (last && last.role === "assistant" && last.loading) {
      last.loading = false;
      if (!last.content) last.content = "已停止生成";
    }
    loading.value = false;
  };

  return {
    messages,
    loading,
    suggestions,
    conversationId,
    analyzeScreenshot,
    sendMessage,
    resetChat,
    stopGenerate,
    loadHistory
  };
}
