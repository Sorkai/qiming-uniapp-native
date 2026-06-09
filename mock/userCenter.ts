// 用户中心接口 mock 数据
// 注意：此文件已禁用所有 mock，登录等接口将调用真实后端
import { defineFakeRoute } from "vite-plugin-fake-server/client";

// 导出空数组，不拦截任何请求
export default defineFakeRoute([]);
