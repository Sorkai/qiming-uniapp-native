import { http } from "@/utils/http";
import type {
  ScreenAnalyzeRequest,
  ScreenAnalyzeResponse
} from "@/components/AiScreenCapture/types";

export type AnalyzeResult = {
  code: number;
  msg: string;
  data: ScreenAnalyzeResponse;
};

/**
 * 通用 AI 提问接口（图片 + 问题）
 */
export const askGeneralAi = (data: ScreenAnalyzeRequest) => {
  return http.request<AnalyzeResult>("post", "/edu/v1/ai/screen/analyze", {
    data
  });
};
