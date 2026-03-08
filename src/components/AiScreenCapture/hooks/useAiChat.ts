import { ref } from "vue";
import { ElMessage } from "element-plus";
import type { ChatMessage } from "../types";
import { askGeneralAi } from "../../../api/aiAssistant";

/**
 * AI 对话 Hook（通用接口模式）
 * 仅发送 image + question，不维护历史记录。
 */
export function useAiChat() {
  const messages = ref<ChatMessage[]>([]);
  const loading = ref(false);
  const suggestions = ref<string[]>([]);
  const currentImage = ref("");

  const generateId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`;
  };

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

  const updateAssistantMessage = (id: string, content: string) => {
    const index = messages.value.findIndex(m => m.id === id);
    if (index !== -1) {
      messages.value[index] = {
        ...messages.value[index],
        content,
        loading: false
      };
    }
  };

  const analyzeScreenshot = async (image: string, question?: string) => {
    loading.value = true;
    currentImage.value = image;

    addUserMessage(question || "请分析这张截图", image);
    const loadingMsg = addLoadingMessage();

    try {
      const response = await askGeneralAi({
        image,
        question
      });

      if (response.code === 0 && response.data) {
        updateAssistantMessage(loadingMsg.id, response.data.answer);
        suggestions.value = response.data.suggestions || [];
      } else {
        updateAssistantMessage(
          loadingMsg.id,
          response.msg || "分析失败，请重试"
        );
      }
    } catch (error) {
      console.error("AI分析失败:", error);
      updateAssistantMessage(loadingMsg.id, "网络错误，请稍后重试");
      ElMessage.error("AI分析失败，请稍后重试");
    } finally {
      loading.value = false;
    }
  };

  const sendMessage = async (message: string) => {
    if (!currentImage.value) {
      ElMessage.warning("请先截图后再发送问题");
      return;
    }

    loading.value = true;
    addUserMessage(message);
    const loadingMsg = addLoadingMessage();

    try {
      const response = await askGeneralAi({
        image: currentImage.value,
        question: message
      });

      if (response.code === 0 && response.data) {
        updateAssistantMessage(loadingMsg.id, response.data.answer);
        suggestions.value = response.data.suggestions || [];
      } else {
        updateAssistantMessage(
          loadingMsg.id,
          response.msg || "回复失败，请重试"
        );
      }
    } catch (error) {
      console.error("发送消息失败:", error);
      updateAssistantMessage(loadingMsg.id, "网络错误，请稍后重试");
      ElMessage.error("发送消息失败，请稍后重试");
    } finally {
      loading.value = false;
    }
  };

  const resetChat = () => {
    currentImage.value = "";
    messages.value = [];
    suggestions.value = [];
    loading.value = false;
  };

  return {
    messages,
    loading,
    suggestions,
    analyzeScreenshot,
    sendMessage,
    resetChat
  };
}
