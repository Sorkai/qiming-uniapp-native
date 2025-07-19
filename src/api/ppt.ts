import { http } from "@/utils/http";

interface PptTokenResponse {
  code: number;
  msg: string;
  data: {
    token: string;
    expire: number;
  };
}

// 获取AI PPT生成token
export const getPptToken = () => {
  return http.request<PptTokenResponse>("post", "/edu/v1/user/get/ppt/token", {
    baseURL: "https://aiedu-api.lehinet.com"
  });
}; 