import { http } from "@/utils/http";

type Result = {
  success: boolean;
  data: Array<any>;
};

export const getAsyncRoutes = () => {
  // 不走代理，保持原来的路径，确保mock数据可用
  return http.request<Result>(
    "get",
    "/get-async-routes",
    {},
    {
      baseURL: "" // 使用空baseURL，不会添加/api前缀
    }
  );
};
