import Avatar from "@/assets/user.jpg";

/**
 * 格式化头像地址
 * @param avatar 原始头像地址
 * @param fallback 默认备用头像
 * @returns 格式化后的头像地址
 */
export function formatAvatar(
  avatar: string | undefined | null,
  fallback?: string
): string {
  const defaultFallback = fallback || Avatar;

  if (!avatar || avatar === "null" || avatar === "undefined" || avatar === "") {
    return defaultFallback;
  }

  let result = String(avatar).trim();

  // 1. 替换所有已知的旧域名和新域名，以便统一处理
  result = result.replace(/https?:\/\/aiedu-(file|api)\.lehinet\.com/g, "");
  result = result.replace(/https?:\/\/aiedu-api\.intelledu\.cn/g, "");

  // 2. 如果替换后是完整的 http 路径（指向其他域名），直接返回
  if (result.startsWith("http") || result.startsWith("data:")) {
    return result;
  }

  // 3. 处理本地资源路径
  if (
    result.startsWith("/src") ||
    result.startsWith("/@") ||
    result.includes("assets/") ||
    result.includes("static/")
  ) {
    return result;
  }

  // 4. 处理后端相对路径
  // 移除可能多余的路径前缀 (根据实际后端接口情况)
  result = result.replace(/^\/?api\//, "/");
  result = result.replace(/^\/?lehinet\//, "/");

  // 5. 根据环境生成最终地址
  if (import.meta.env.DEV) {
    // 开发环境统一走代理
    return "/api" + (result.startsWith("/") ? result : "/" + result);
  } else {
    // 线上环境使用环境变量中的 API 地址
    const baseUrl = import.meta.env.VITE_API_URL || "";
    // 如果 VITE_API_URL 是 /api，则返回 /api/xxx
    // 如果 VITE_API_URL 是 http...，则返回 http.../xxx
    if (baseUrl.startsWith("http")) {
      return baseUrl + (result.startsWith("/") ? result : "/" + result);
    } else {
      return (
        (baseUrl === "/" ? "" : baseUrl) +
        (result.startsWith("/") ? result : "/" + result)
      );
    }
  }
}
