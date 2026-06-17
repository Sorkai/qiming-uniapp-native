// 首页"实时演示"用：根据角色登录并写入 token / localStorage，
// 同时设置 __DEMO_CAPTURE__ 让路由守卫放行。仅本地/演示环境使用。
import { http } from "@/utils/http";

type Role = "student" | "teacher" | "admin";

const ACCOUNTS: Record<Role, string> = {
  student: "13111111112",
  teacher: "13111111113",
  admin: "13111111111"
};

const PASSWORD = "123456";

let currentRole: Role | null = null;
let inflight: Promise<void> | null = null;

interface LoginResp {
  data: { accessToken: string; accessExpire: number; refreshAfter?: number };
}

interface DetailResp {
  data: {
    userInfo: {
      id: number;
      mobile: string;
      nickname: string;
      avatar?: string;
      roleType: number;
    };
  };
}

async function doLogin(role: Role) {
  const loginRes = await http.request<LoginResp>("post", "/edu/v1/user/login", {
    data: { mobile: ACCOUNTS[role], password: PASSWORD }
  });
  const tk = loginRes.data.accessToken;
  const expMs = loginRes.data.accessExpire * 1000;

  const detailRes = await http.request<DetailResp>(
    "post",
    "/edu/v1/user/detail",
    { data: {} },
    { headers: { Authorization: `Bearer ${tk}` } }
  );
  const u = detailRes.data.userInfo;

  const cookieVal = JSON.stringify({
    accessToken: tk,
    expires: expMs,
    refreshToken: tk
  });
  document.cookie = `authorized-token=${encodeURIComponent(cookieVal)}; path=/; expires=${new Date(expMs).toUTCString()}`;
  document.cookie = `multiple-tabs=true; path=/; max-age=${7 * 86400}`;

  localStorage.setItem(
    "user-info",
    JSON.stringify({
      refreshToken: tk,
      expires: expMs,
      avatar: u.avatar || "",
      username: u.mobile,
      nickname: u.nickname,
      roles: [role, "admin", "teacher", "student"],
      permissions: ["*:*:*"],
      roleType: u.roleType,
      userId: u.id
    })
  );
  currentRole = role;
}

export async function ensureDemoSession(role: Role = "teacher") {
  if (currentRole === role) return;
  if (inflight) await inflight;
  if (currentRole === role) return;
  inflight = doLogin(role).finally(() => (inflight = null));
  await inflight;
}

export function buildIframeUrl(route: string) {
  const base = window.location.origin;
  return `${base}/#${route.startsWith("/") ? route : "/" + route}`;
}
