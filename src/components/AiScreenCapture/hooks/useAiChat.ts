import { ref } from "vue";
import { ElMessage } from "element-plus";
import type { ChatMessage, ChatSession } from "../types";
import {
  analyzeScreen,
  chatWithContext,
  getChatHistory,
  deleteChatHistory
} from "@/api/aiAssistant";

/**
 * AI对话功能 Hook
 */
export function useAiChat() {
  // 当前会话ID
  const sessionId = ref<string>("");
  // 消息列表
  const messages = ref<ChatMessage[]>([]);
  // 是否正在加载
  const loading = ref(false);
  // 建议问题
  const suggestions = ref<string[]>([]);
  // 历史会话列表
  const historyList = ref<ChatSession[]>([]);
  // 历史总数
  const historyTotal = ref(0);

  /**
   * 生成唯一ID
   */
  const generateId = () => {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  /**
   * 添加用户消息
   */
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

  /**
   * 添加AI消息（加载中状态）
   */
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

  /**
   * 更新AI消息
   */
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

  /**
   * 发送截图进行分析
   * @param image base64截图
   * @param question 可选的初始问题
   */
  const analyzeScreenshot = async (image: string, question?: string) => {
    loading.value = true;

    // 添加用户消息
    addUserMessage(question || "请分析这张截图", image);

    // 添加加载中的AI消息
    const loadingMsg = addLoadingMessage();

    try {
      const response = await analyzeScreen({
        image,
        question,
        sessionId: sessionId.value || undefined
      });

      if (response.code === 0 && response.data) {
        // 更新会话ID
        sessionId.value = response.data.sessionId;
        // 更新AI回复
        updateAssistantMessage(loadingMsg.id, response.data.answer);
        // 更新建议问题
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

  /**
   * 发送对话消息
   * @param message 用户消息
   */
  const sendMessage = async (message: string) => {
    if (!sessionId.value) {
      ElMessage.warning("请先截图后再发送消息");
      return;
    }

    loading.value = true;

    // 添加用户消息
    addUserMessage(message);

    // 添加加载中的AI消息
    const loadingMsg = addLoadingMessage();

    try {
      const response = await chatWithContext({
        sessionId: sessionId.value,
        message
      });

      if (response.code === 0 && response.data) {
        // 更新AI回复
        updateAssistantMessage(loadingMsg.id, response.data.answer);
        // 更新建议问题
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

  /**
   * 获取历史记录
   */
  const fetchHistory = async (page: number = 1, pageSize: number = 10) => {
    try {
      const response = await getChatHistory({ page, pageSize });
      if (response.code === 0 && response.data) {
        historyList.value = response.data.list;
        historyTotal.value = response.data.total;
      }
    } catch (error) {
      console.error("获取历史记录失败:", error);
      ElMessage.error("获取历史记录失败");
    }
  };

  /**
   * 删除历史记录
   */
  const removeHistory = async (id: string) => {
    try {
      const response = await deleteChatHistory(id);
      if (response.code === 0) {
        historyList.value = historyList.value.filter(h => h.sessionId !== id);
        historyTotal.value--;
        ElMessage.success("删除成功");
      } else {
        ElMessage.error(response.msg || "删除失败");
      }
    } catch (error) {
      console.error("删除历史记录失败:", error);
      ElMessage.error("删除失败");
    }
  };

  /**
   * 加载历史会话
   */
  const loadSession = (session: ChatSession) => {
    sessionId.value = session.sessionId;
    messages.value = session.messages.map(m => ({
      ...m,
      loading: false
    }));
    suggestions.value = [];
  };

  /**
   * 重置对话
   */
  const resetChat = () => {
    sessionId.value = "";
    messages.value = [];
    suggestions.value = [];
    loading.value = false;
  };

  /**
   * 开始新对话
   */
  const startNewChat = () => {
    resetChat();
  };

  return {
    sessionId,
    messages,
    loading,
    suggestions,
    historyList,
    historyTotal,
    analyzeScreenshot,
    sendMessage,
    fetchHistory,
    removeHistory,
    loadSession,
    resetChat,
    startNewChat
  };
}
