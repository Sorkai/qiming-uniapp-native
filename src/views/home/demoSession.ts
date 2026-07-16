// 首页"实时演示"用：根据角色登录并写入 token / localStorage，
// 同时设置 __DEMO_CAPTURE__ 让路由守卫放行。仅本地/演示环境使用。
import { http } from "@/utils/http";

type Role = "student" | "teacher" | "admin";

const FALLBACK_AVATAR = "/logo.svg";
const ROLE_TYPES: Record<Role, number> = {
  student: 1,
  teacher: 2,
  admin: 3
};

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

function writeDemoSession(
  role: Role,
  data: {
    token: string;
    expires: number;
    mobile: string;
    nickname: string;
    avatar?: string;
    roleType: number;
    userId: number;
  }
) {
  const cookieVal = JSON.stringify({
    accessToken: data.token,
    expires: data.expires,
    refreshToken: data.token
  });
  document.cookie = `authorized-token=${encodeURIComponent(cookieVal)}; path=/; expires=${new Date(data.expires).toUTCString()}`;
  document.cookie = `multiple-tabs=true; path=/; max-age=${7 * 86400}`;
  localStorage.setItem("qiming-demo-role", role);

  localStorage.setItem(
    "user-info",
    JSON.stringify({
      accessToken: data.token,
      refreshToken: data.token,
      expires: data.expires,
      avatar: data.avatar || FALLBACK_AVATAR,
      username: data.mobile,
      nickname: data.nickname,
      roles: [role],
      permissions: ["*:*:*"],
      roleType: data.roleType,
      userId: data.userId
    })
  );
  currentRole = role;
}

function writeFallbackDemoSession(role: Role) {
  const expires = Date.now() + 7 * 86400 * 1000;
  writeDemoSession(role, {
    token: `demo-${role}-${Date.now()}`,
    expires,
    mobile: ACCOUNTS[role],
    nickname:
      role === "student" ? "吴同学" : role === "teacher" ? "教师" : "管理员",
    avatar: FALLBACK_AVATAR,
    roleType: ROLE_TYPES[role],
    userId: role === "student" ? 1001 : role === "teacher" ? 2001 : 3001
  });
}

async function doLogin(role: Role) {
  const loginRes = await http.request<LoginResp>("post", "/edu/v1/user/login", {
    data: { mobile: ACCOUNTS[role], password: PASSWORD },
    timeout: 8000
  });
  const tk = loginRes.data.accessToken;
  const expMs = loginRes.data.accessExpire * 1000;

  const detailRes = await http.request<DetailResp>(
    "post",
    "/edu/v1/user/detail",
    { data: {}, timeout: 8000 },
    { headers: { Authorization: `Bearer ${tk}` } }
  );
  const u = detailRes.data.userInfo;

  writeDemoSession(role, {
    token: tk,
    expires: expMs,
    mobile: u.mobile,
    nickname: u.nickname,
    avatar: u.avatar,
    roleType: u.roleType,
    userId: u.id
  });
}

export async function ensureDemoSession(role: Role = "teacher") {
  if (currentRole === role) return;
  if (inflight) await inflight;
  if (currentRole === role) return;
  inflight = doLogin(role)
    .catch(error => {
      console.warn("[DemoSession] Falling back to local demo session", error);
      writeFallbackDemoSession(role);
    })
    .finally(() => (inflight = null));
  await inflight;
}

export function buildIframeUrl(route: string) {
  const base = window.location.origin;
  return `${base}/#${route.startsWith("/") ? route : "/" + route}`;
}
