import { getToken, formatToken } from "@/utils/auth";
import axios from "axios";

/**
 * 单课AI互动（流式返回）
 * @param params 请求参数
 * @param onMessage 处理每条消息的回调函数
 * @returns 取消函数
 */
export function courseAIChatStream(
  params: {
    course_id?: number;
    conversation_id?: string;
    message: string;
  },
  onMessage: (data: {
    conversation_id: string;
    delta: string;
    finished: boolean;
  }) => void
) {
  // 创建AbortController用于取消请求
  const controller = new AbortController();
  const { signal } = controller;

  // 获取认证Token
  const token = getToken();
  const authHeader = token ? formatToken(token.accessToken) : "";

  // 使用fetch API发送POST请求并处理流式响应
  fetch("http://82.156.135.40:1004/edu/frontend/v1/ai/chat/stream", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
      "X-Requested-With": "XMLHttpRequest"
    },
    body: JSON.stringify(params),
    signal
  })
    .then(response => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // 获取响应的reader
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("无法获取响应流");
      }

      // 处理文本解码
      const decoder = new TextDecoder();
      let buffer = "";

      // 读取流
      function read() {
        reader
          .read()
          .then(({ done, value }) => {
            if (done) {
              return;
            }

            // 解码新的文本块并添加到缓冲区
            buffer += decoder.decode(value, { stream: true });

            // 处理缓冲区中的每个数据行
            const lines = buffer.split("\n");
            buffer = lines.pop() || ""; // 最后一行可能不完整，保留到下一次

            // 处理每一行
            for (const line of lines) {
              // 检查是否是SSE数据行
              if (line.startsWith("data: ")) {
                try {
                  // 解析JSON数据
                  const jsonStr = line.substring(6); // 移除 "data: " 前缀
                  if (jsonStr.trim()) {
                    const data = JSON.parse(jsonStr);
                    onMessage(data);
                  }
                } catch (error) {
                  console.error("解析SSE消息失败:", error, line);
                }
              }
            }

            // 继续读取
            read();
          })
          .catch(error => {
            console.error("流读取错误:", error);
            onMessage({
              conversation_id: params.conversation_id || "",
              delta: "连接出错，请稍后重试",
              finished: true
            });
          });
      }

      // 开始读取
      read();
    })
    .catch(error => {
      console.error("请求错误:", error);
      onMessage({
        conversation_id: params.conversation_id || "",
        delta: "连接出错，请稍后重试",
        finished: true
      });
    });

  // 返回取消函数
  return () => {
    controller.abort();
  };
}

/**
 * 获取会话历史
 * @param conversationId 会话ID
 * @returns 会话历史记录
 */
export function getConversationHistory(conversationId: string) {
  // 获取认证Token
  const token = getToken();
  const authHeader = token ? formatToken(token.accessToken) : "";

  // 直接使用URLSearchParams格式化数据，而不是JSON
  const params = new URLSearchParams();
  params.append("conversation_id", conversationId);

  // 使用axios原生方法
  return axios({
    method: "post",
    url: "http://82.156.135.40:1004/edu/frontend/v1/ai/get/conversations",
    data: params,
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: authHeader,
      "X-Requested-With": "XMLHttpRequest"
    }
  }).then(response => response.data);
}
