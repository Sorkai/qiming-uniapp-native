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
  image?: string; // base64图片
  timestamp: number;
  loading?: boolean;
}

// AI分析请求
export interface ScreenAnalyzeRequest {
  image: string; // base64截图
  question?: string; // 用户问题
}

// AI分析响应
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
