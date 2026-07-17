import { http } from "@/utils/http";

type Result = {
  success: boolean;
  data: Array<any>;
};

function usesBundledStaticRoutes() {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }

  const root = document.documentElement;
  const searchParams = new URLSearchParams(window.location.search);
  const hashQuery = window.location.hash.includes("?")
    ? window.location.hash.slice(window.location.hash.indexOf("?") + 1)
    : "";
  const hashParams = new URLSearchParams(hashQuery);

  try {
    return (
      window.location.protocol === "file:" ||
      root.classList.contains("qiming-native-webview") ||
      root.classList.contains("qiming-mini-program-webview") ||
      root.dataset.qimingMiniProgram === "true" ||
      searchParams.get("qimingMiniProgram") === "1" ||
      hashParams.get("qimingMiniProgram") === "1" ||
      localStorage.getItem("qimingMiniProgramWebView") === "1" ||
      sessionStorage.getItem("qimingMiniProgramWebView") === "1"
    );
  } catch {
    return (
      window.location.protocol === "file:" ||
      root.classList.contains("qiming-native-webview") ||
      root.classList.contains("qiming-mini-program-webview") ||
      root.dataset.qimingMiniProgram === "true" ||
      searchParams.get("qimingMiniProgram") === "1" ||
      hashParams.get("qimingMiniProgram") === "1"
    );
  }
}

export const getAsyncRoutes = () => {
  if (usesBundledStaticRoutes()) {
    return Promise.resolve<Result>({
      success: true,
      data: []
    });
  }

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
