#!/usr/bin/env node
import { mkdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { spawn } from "node:child_process";

const root = resolve(new URL("..", import.meta.url).pathname);
const defaultOrigin = "https://aiedu-mp.intelledu.cn";
const defaultApiOrigin = "https://aiedu-api.intelledu.cn";
const artifactsDir = join(root, "artifacts", "wechat-miniprogram");

const accounts = {
  admin: {
    mobile: process.env.QIMING_AUDIT_ADMIN_MOBILE || "13111111111",
    password: process.env.QIMING_AUDIT_ADMIN_PASSWORD || "123456"
  },
  student: {
    mobile: process.env.QIMING_AUDIT_STUDENT_MOBILE || "13111111112",
    password: process.env.QIMING_AUDIT_STUDENT_PASSWORD || "123456"
  },
  teacher: {
    mobile: process.env.QIMING_AUDIT_TEACHER_MOBILE || "13111111113",
    password: process.env.QIMING_AUDIT_TEACHER_PASSWORD || "123456"
  }
};

const roleMeta = {
  admin: { roleType: 3, roles: ["admin"], label: "管理员" },
  teacher: { roleType: 2, roles: ["teacher"], label: "教师" },
  student: { roleType: 1, roles: ["student"], label: "学生" }
};

const routes = [
  { role: "student", name: "student-account-home", entry: "/account?menu=home", expect: ["吴同学", "首页"] },
  { role: "student", name: "student-account-course", entry: "/account?menu=course", expect: ["课程"] },
  { role: "student", name: "student-account-classroom", entry: "/account?menu=classroom", expect: ["虚拟校园"] },
  { role: "student", name: "student-account-profile", entry: "/account?menu=profile", expect: ["个人资料"] },
  { role: "student", name: "student-account-cloud-disk", entry: "/account?menu=cloud-disk", expect: ["学习云盘", "云盘"] },
  { role: "student", name: "student-account-notification", entry: "/account?menu=notification", expect: ["通知"] },
  { role: "student", name: "student-account-todo", entry: "/account?menu=todo", expect: ["待办"] },
  { role: "student", name: "student-account-virtual-lab", entry: "/account?menu=virtual-lab", expect: ["虚拟实验室"] },
  { role: "student", name: "student-account-competition", entry: "/account?menu=competition", expect: ["赛事"] },
  { role: "student", name: "student-account-exam-center", entry: "/account?menu=exam-center", expect: ["试卷", "考试"] },
  { role: "student", name: "student-course-study", entry: "/course/1?section=course-learn", expect: ["章节", "课程学习"] },
  { role: "student", name: "student-course-mastery", entry: "/course/1?section=mastery", expect: ["知识点"] },
  { role: "student", name: "student-course-qa", entry: "/course/1?section=course-qa", expect: ["课程问答"] },
  { role: "student", name: "student-course-work", entry: "/course/1?section=homework-exam", expect: ["作业", "考试"] },
  { role: "student", name: "student-ai-app", entry: "/account/ai-app?mode=student", expect: ["学生模式", "学习助手"] },
  { role: "student", name: "student-ai-chat", entry: "/ai-app/chat", expect: ["学生模式", "互动答疑"] },
  { role: "student", name: "student-ai-generation", entry: "/ai-app/generation", expect: ["教学资源"] },
  { role: "student", name: "student-ai-path", entry: "/ai-app/path", expect: ["学习计划"] },
  { role: "student", name: "student-ai-profile", entry: "/ai-app/profile", expect: ["学情分析"] },
  { role: "student", name: "student-ai-assessment", entry: "/ai-app/assessment", expect: ["测验评估"] },
  { role: "teacher", name: "teacher-dashboard", entry: "/welcome/index", expect: ["教师"] },
  { role: "teacher", name: "teacher-course-list", entry: "/course/list", expect: ["课程", "课程名称"] },
  { role: "teacher", name: "teacher-course-category", entry: "/course/category", expect: ["课程分类"] },
  { role: "teacher", name: "teacher-course-assessment", entry: "/course/assessment", expect: ["作业", "考试"] },
  { role: "teacher", name: "teacher-course-plan", entry: "/course/teacherplan", expect: ["教案"] },
  { role: "teacher", name: "teacher-course-animation", entry: "/course/animation", expect: ["AI动画", "动画"] },
  { role: "teacher", name: "teacher-video-analysis", entry: "/course/video-analysis", expect: ["视频分析"] },
  { role: "teacher", name: "teacher-discussion-review", entry: "/course/discussion/review", expect: ["讨论", "筛选"] },
  { role: "teacher", name: "teacher-cloud-disk", entry: "/cloud-disk", expect: ["教学云盘", "云盘"] },
  { role: "teacher", name: "teacher-todo", entry: "/todo", expect: ["待办"] },
  { role: "teacher", name: "teacher-ai-chat", entry: "/ai-app/chat", expect: ["教师模式", "互动答疑"] },
  { role: "teacher", name: "teacher-ai-generation", entry: "/ai-app/generation", expect: ["教学资源"] },
  { role: "teacher", name: "teacher-ai-agentpdf", entry: "/ai-app/agentpdf", expect: ["资料研读"] },
  { role: "teacher", name: "teacher-ai-path", entry: "/ai-app/path", expect: ["学习计划"] },
  { role: "teacher", name: "teacher-ai-profile", entry: "/ai-app/profile", expect: ["学情分析"] },
  { role: "teacher", name: "teacher-ai-assessment", entry: "/ai-app/assessment", expect: ["测验评估"] },
  { role: "teacher", name: "teacher-ai-governance", entry: "/ai-app/governance", expect: ["治理看板"] },
  { role: "teacher", name: "teacher-ai-automation", entry: "/ai-app/automation", expect: ["常规任务"] },
  { role: "admin", name: "admin-dashboard", entry: "/welcome/index", expect: ["管理员"] },
  { role: "admin", name: "admin-user-list", entry: "/user/list", expect: ["用户列表", "用户"] },
  { role: "admin", name: "admin-course-list", entry: "/course/list", expect: ["课程"] },
  { role: "admin", name: "admin-course-category", entry: "/course/category", expect: ["课程分类"] },
  { role: "admin", name: "admin-course-assessment", entry: "/course/assessment", expect: ["作业", "考试"] },
  { role: "admin", name: "admin-discussion-review", entry: "/course/discussion/review", expect: ["讨论", "筛选"] },
  { role: "admin", name: "admin-ai-chat", entry: "/ai-app/chat", expect: ["管理员模式", "互动答疑"] },
  { role: "admin", name: "admin-ai-generation", entry: "/ai-app/generation", expect: ["教学资源"] },
  { role: "admin", name: "admin-ai-governance", entry: "/ai-app/governance", expect: ["治理看板"] }
];

function parseArgs(argv) {
  const options = {
    origin: process.env.QIMING_MINIPROGRAM_WEBVIEW_ORIGIN || defaultOrigin,
    apiOrigin: process.env.VITE_API_URL || defaultApiOrigin,
    outDir: "",
    route: "",
    role: "",
    waitMs: Number(process.env.QIMING_REAL_AUDIT_WAIT_MS || 9000),
    headed: false,
    browser: process.env.QIMING_MINIPROGRAM_BROWSER || ""
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];
    if (arg === "--") {
      continue;
    } else if (arg === "--origin" && next) {
      options.origin = next;
      i += 1;
    } else if (arg === "--api-origin" && next) {
      options.apiOrigin = next;
      i += 1;
    } else if (arg === "--out-dir" && next) {
      options.outDir = next;
      i += 1;
    } else if ((arg === "--route" || arg === "--only") && next) {
      options.route = next;
      i += 1;
    } else if (arg === "--role" && next) {
      options.role = next;
      i += 1;
    } else if (arg === "--wait-ms" && next) {
      options.waitMs = Number(next);
      i += 1;
    } else if (arg === "--headed") {
      options.headed = true;
    } else if (arg === "--browser" && next) {
      options.browser = next;
      i += 1;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  options.origin = new URL(options.origin).origin;
  options.apiOrigin = new URL(options.apiOrigin).origin;
  if (!Number.isFinite(options.waitMs) || options.waitMs < 0) {
    throw new Error(`Unsupported wait time: ${options.waitMs}`);
  }
  return options;
}

function resolveBrowserPath(explicitPath = "") {
  const candidates = [
    explicitPath,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
  ].filter(Boolean);
  return candidates.find(Boolean);
}

function wait(ms) {
  return new Promise(resolveWait => setTimeout(resolveWait, ms));
}

async function fetchJson(url, init = {}) {
  const response = await fetch(url, init);
  const text = await response.text();
  let json;
  try {
    json = JSON.parse(text);
  } catch {
    throw new Error(`${url} returned non-JSON: ${text.slice(0, 180)}`);
  }
  if (!response.ok) {
    throw new Error(`${url} failed with HTTP ${response.status}: ${text}`);
  }
  return json;
}

async function loginRole(role, apiOrigin) {
  const account = accounts[role];
  const login = await fetchJson(`${apiOrigin}/edu/v1/user/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(account)
  });
  const token = login?.data?.accessToken;
  if (!token) throw new Error(`Login did not return token for ${role}`);
  const detail = await fetchJson(`${apiOrigin}/edu/v1/user/detail`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json"
    },
    body: "{}"
  });
  const userInfo = detail?.data?.userInfo || {};
  const meta = roleMeta[role];
  const expires = Number(login.data.accessExpire || 0) * 1000;
  return {
    role,
    token,
    expires,
    userInfo: {
      accessToken: token,
      refreshToken: token,
      expires,
      avatar: userInfo.avatar || "/logo.svg",
      username: userInfo.mobile || account.mobile,
      nickname: userInfo.nickname || meta.label,
      roles: meta.roles,
      permissions: ["*:*:*"],
      roleType: Number(userInfo.roleType || meta.roleType),
      userId: Number(userInfo.id || 0)
    }
  };
}

async function resolveRoleFixtures(role, apiOrigin, session) {
  const fixtures = {};
  if (role !== "student") return fixtures;

  try {
    const courseList = await fetchJson(
      `${apiOrigin}/edu/frontend/v1/course/list?pageNum=1&pageSize=20`,
      {
        headers: {
          authorization: `Bearer ${session.token}`
        }
      }
    );
    const firstCourse = courseList?.data?.list?.find(item => item?.courseId);
    if (firstCourse?.courseId) {
      fixtures.courseId = Number(firstCourse.courseId);
    }
  } catch (error) {
    console.warn(
      `[WARN] unable to resolve student course fixture: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }

  return fixtures;
}

async function getFreePort() {
  const { createServer } = await import("node:net");
  return new Promise((resolvePort, rejectPort) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === "object") resolvePort(address.port);
        else rejectPort(new Error("Unable to allocate debug port"));
      });
    });
    server.on("error", rejectPort);
  });
}

async function waitForBrowser(port, timeoutMs = 20000) {
  const startedAt = Date.now();
  let lastError;
  while (Date.now() - startedAt < timeoutMs) {
    try {
      return await fetchJson(`http://127.0.0.1:${port}/json/version`);
    } catch (error) {
      lastError = error;
      await wait(200);
    }
  }
  throw new Error(
    `Browser did not expose DevTools port ${port}: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`
  );
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
    this.listeners = [];
  }

  async connect() {
    this.socket = new WebSocket(this.wsUrl);
    await new Promise((resolveConnect, rejectConnect) => {
      this.socket.addEventListener("open", resolveConnect, { once: true });
      this.socket.addEventListener("error", () => rejectConnect(new Error(`Unable to connect CDP: ${this.wsUrl}`)), { once: true });
    });
    this.socket.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      if (message.id) {
        const pending = this.pending.get(message.id);
        if (!pending) return;
        this.pending.delete(message.id);
        if (message.error) pending.reject(new Error(message.error.message || "CDP command failed."));
        else pending.resolve(message.result);
        return;
      }
      for (const listener of this.listeners) listener(message);
    });
  }

  onMessage(listener) {
    this.listeners.push(listener);
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    return new Promise((resolveCommand, rejectCommand) => {
      this.pending.set(id, { resolve: resolveCommand, reject: rejectCommand });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  close() {
    this.socket?.close();
  }
}

function appendMiniQuery(entry, extra = {}) {
  const [path, rawQuery = ""] = entry.split("?");
  const params = new URLSearchParams(rawQuery);
  params.set("qimingMiniProgram", "1");
  params.set("qimingNative", "1");
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      params.set(key, String(value));
    }
  });
  const query = params.toString();
  return `${path}${query ? `?${query}` : ""}`;
}

function applyRouteFixtures(entry, fixtures = {}) {
  if (fixtures.courseId) {
    return entry.replace(/^\/course\/1(?=([?#]|$))/, `/course/${fixtures.courseId}`);
  }
  return entry;
}

function buildUrl(origin, route, fixtures = {}) {
  const routePath = appendMiniQuery(applyRouteFixtures(route.entry, fixtures), {
    _qimingRealAudit: `${Date.now()}-${route.name}`
  });
  return `${origin}/#${routePath}`;
}

async function seedSession(client, origin, session) {
  await client.send("Page.navigate", { url: `${origin}/?seed=${Date.now()}` });
  await wait(500);
  await client.send("Runtime.evaluate", {
    awaitPromise: true,
    expression: `(() => {
      const userInfo = ${JSON.stringify(session.userInfo)};
      const cookieInfo = {
        accessToken: userInfo.accessToken,
        expires: userInfo.expires,
        refreshToken: userInfo.refreshToken
      };
      document.cookie = 'authorized-token=' + encodeURIComponent(JSON.stringify(cookieInfo)) + '; path=/; expires=' + new Date(userInfo.expires).toUTCString();
      document.cookie = 'multiple-tabs=true; path=/; max-age=${7 * 86400}';
      localStorage.setItem('user-info', JSON.stringify(userInfo));
      localStorage.setItem('userId', String(userInfo.userId || ''));
      localStorage.setItem('userMobile', userInfo.username || '');
      localStorage.setItem('userRoleType', String(userInfo.roleType || ''));
      localStorage.setItem('qimingNativeWebView', '1');
      localStorage.setItem('qimingMiniProgramWebView', '1');
      sessionStorage.setItem('qimingNativeWebView', '1');
      sessionStorage.setItem('qimingMiniProgramWebView', '1');
      localStorage.removeItem('account_active_menu');
      sessionStorage.removeItem('qimingNativeLastRoute');
    })()`
  });
}

const isVisibleElementSource = `function isVisibleElement(el) {
  if (!el) return false;
  const rect = el.getBoundingClientRect();
  const style = getComputedStyle(el);
  return rect.width > 1 && rect.height > 1 && style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity || 1) > 0.01;
}`;

const inspectExpression = `(() => {
  ${isVisibleElementSource}
  const rectInfo = el => {
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      visible: isVisibleElement(el)
    };
  };
  const text = (document.body?.innerText || '').replace(/\\s+/g, ' ').trim();
  const loadingEls = Array.from(document.querySelectorAll('.el-loading-mask, .pure-loading, [class*=loading], [class*=Loading]')).filter(isVisibleElement);
  const brokenImages = Array.from(document.images)
    .filter(img => isVisibleElement(img) && img.complete && img.naturalWidth === 0)
    .slice(0, 20)
    .map(img => img.currentSrc || img.src || img.getAttribute('src') || '');
  const visibleImages = Array.from(document.images).filter(img => isVisibleElement(img));
  const app = document.querySelector('#app');
  const mainCandidates = [
    '.app-main',
    '.main-content',
    '.account-main',
    '.ai-app-root',
    '.course-detail-page',
    '.course-detail-container',
    '.el-main',
    '#app'
  ];
  const main = mainCandidates.map(selector => document.querySelector(selector)).find(isVisibleElement);
  const navbar = document.querySelector('.navbar, .header');
  const accountMain = document.querySelector('.account-main');
  const aiRoot = document.querySelector('.ai-app-root');
  const aiLeftRail = document.querySelector('.ai-app-left-rail');
  const sidebarLogo = document.querySelector('.sidebar-logo-container');
  const sidebarWordmark = document.querySelector('.sidebar-logo-container .sidebar-title');
  const scrollHeight = Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);
  const viewportHeight = document.documentElement.clientHeight;
  const viewportWidth = document.documentElement.clientWidth;
  const maxScrollWidth = Math.max(document.body.scrollWidth, document.documentElement.scrollWidth);
  return {
    href: location.href,
    title: document.title,
    textLength: text.length,
    textSample: text.slice(0, 700),
    appChildren: app?.children?.length || 0,
    blank: Boolean(app) && text.length < 20,
    loadingCount: loadingEls.length,
    brokenImages,
    visibleImageCount: visibleImages.length,
    overflowX: Math.max(0, Math.round(maxScrollWidth - viewportWidth)),
    scrollHeight,
    viewportHeight,
    bottomGap: Math.max(0, Math.round(viewportHeight - (main?.getBoundingClientRect().bottom || 0))),
    layout: {
      navbar: rectInfo(navbar),
      main: rectInfo(main),
      accountMain: rectInfo(accountMain),
      aiRoot: rectInfo(aiRoot),
      aiLeftRail: rectInfo(aiLeftRail),
      sidebarLogo: rectInfo(sidebarLogo),
      sidebarWordmark: rectInfo(sidebarWordmark),
      sidebarText: sidebarWordmark?.textContent?.trim() || ''
    }
  };
})()`;

function analyze(info, route, consoleErrors, networkIssues) {
  const failures = [];
  const warnings = [];
  if (info.blank || info.textLength < 20) failures.push("blank-page");
  if (info.loadingCount > 0) failures.push(`loading-visible:${info.loadingCount}`);
  if (info.overflowX > 2) failures.push(`overflow-x:${info.overflowX}`);
  if (info.brokenImages?.length) failures.push(`broken-images:${info.brokenImages.length}`);
  if (route.expect?.length && !route.expect.some(item => info.textSample.includes(item))) {
    failures.push(`missing-expected:${route.expect.join("|")}`);
  }
  const seriousConsole = consoleErrors.filter(
    item =>
      /uncaught|TypeError|ReferenceError|Cannot access|Unhandled error/i.test(
        item
      ) && !/Access to XMLHttpRequest|Failed to load resource/i.test(item)
  );
  if (seriousConsole.length) failures.push(`console-errors:${seriousConsole.length}`);
  const apiNetwork = networkIssues.filter(item => item.status >= 400);
  const browserAbortNetwork = networkIssues.filter(item => item.errorText);
  if (apiNetwork.length) warnings.push(`api-network:${apiNetwork.length}`);
  if (browserAbortNetwork.length) {
    warnings.push(`browser-network:${browserAbortNetwork.length}`);
  }
  if (route.name.includes("ai-") && info.layout?.aiLeftRail?.width > 120) {
    failures.push(`ai-left-rail-too-wide:${info.layout.aiLeftRail.width}`);
  }
  return { failures, warnings };
}

async function captureBottom(client) {
  await client.send("Runtime.evaluate", {
    awaitPromise: true,
    expression: `(() => {
      const candidates = ['.main-container .el-scrollbar__wrap', '.app-main', '.account-container', document.scrollingElement ? '__doc__' : ''];
      for (const selector of candidates) {
        const el = selector === '__doc__' ? document.scrollingElement : selector ? document.querySelector(selector) : null;
        if (!el) continue;
        if (el.scrollHeight > el.clientHeight + 8) {
          el.scrollTop = el.scrollHeight;
          return selector;
        }
      }
      window.scrollTo(0, Math.max(document.body.scrollHeight, document.documentElement.scrollHeight));
      return 'window';
    })()`
  });
  await wait(350);
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const browserPath = resolveBrowserPath(options.browser);
  if (!browserPath) throw new Error("Chrome/Edge not found.");
  const outDir =
    options.outDir ||
    join(artifactsDir, `real-session-audit-${new Date().toISOString().replace(/[:.]/g, "-")}`);
  mkdirSync(outDir, { recursive: true });

  const selectedRoutes = routes.filter(route => {
    if (options.route && route.name !== options.route) return false;
    if (options.role && route.role !== options.role) return false;
    return true;
  });
  if (!selectedRoutes.length) {
    throw new Error("No matching routes for audit.");
  }

  const sessions = {};
  const fixtures = {};
  for (const role of [...new Set(selectedRoutes.map(route => route.role))]) {
    sessions[role] = await loginRole(role, options.apiOrigin);
    fixtures[role] = await resolveRoleFixtures(
      role,
      options.apiOrigin,
      sessions[role]
    );
  }

  const debugPort = await getFreePort();
  const profileDir = join(tmpdir(), `qiming-real-audit-${Date.now()}`);
  const browserArgs = [
    "--remote-debugging-address=127.0.0.1",
    `--remote-debugging-port=${debugPort}`,
    `--user-data-dir=${profileDir}`,
    "--no-first-run",
    "--no-default-browser-check",
    "--disable-background-networking",
    "--disable-renderer-backgrounding",
    "--window-size=390,844"
  ];
  if (!options.headed) browserArgs.push("--headless=new");
  const browserProcess = spawn(browserPath, browserArgs, {
    stdio: ["ignore", "ignore", "pipe"]
  });
  let browserError = "";
  browserProcess.stderr.on("data", chunk => {
    browserError += chunk.toString();
  });

  const results = [];
  let client;
  try {
    await waitForBrowser(debugPort);
    const tab = await fetchJson(`http://127.0.0.1:${debugPort}/json/new`, {
      method: "PUT"
    });
    client = new CdpClient(tab.webSocketDebuggerUrl);
    await client.connect();
    await client.send("Page.enable");
    await client.send("Runtime.enable");
    await client.send("Network.enable");
    await client.send("Log.enable");
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });

    for (const route of selectedRoutes) {
      const consoleErrors = [];
      const networkIssues = [];
      const onMessage = message => {
        if (message.method === "Runtime.consoleAPICalled") {
          const text = (message.params.args || [])
            .map(arg => arg.value || arg.description || "")
            .join(" ");
          if (message.params.type === "error" || /error|failed|timeout|uncaught/i.test(text)) {
            consoleErrors.push(text.slice(0, 300));
          }
        }
        if (message.method === "Runtime.exceptionThrown") {
          const details = message.params.exceptionDetails || {};
          const description =
            details.exception?.description ||
            details.exception?.value ||
            details.text ||
            "Runtime exception";
          const stack = details.stackTrace?.callFrames
            ?.slice(0, 5)
            .map(frame => `${frame.url}:${frame.lineNumber + 1}:${frame.columnNumber + 1}`)
            .join(" <- ");
          consoleErrors.push(
            `${String(description).slice(0, 500)}${stack ? `\n${stack}` : ""}`
          );
        }
        if (message.method === "Log.entryAdded") {
          const entry = message.params.entry;
          if (entry.level === "error") consoleErrors.push(String(entry.text || "").slice(0, 300));
        }
        if (message.method === "Network.responseReceived") {
          const response = message.params.response;
          if (response.status >= 400) {
            networkIssues.push({
              status: response.status,
              url: response.url.slice(0, 220)
            });
          }
        }
        if (message.method === "Network.loadingFailed") {
          networkIssues.push({
            status: 0,
            errorText: message.params.errorText,
            url: message.params.requestId
          });
        }
      };
      client.onMessage(onMessage);

      await seedSession(client, options.origin, sessions[route.role]);
      const url = buildUrl(options.origin, route, fixtures[route.role]);
      await client.send("Page.navigate", { url });

      const startedAt = Date.now();
      let info = {};
      while (Date.now() - startedAt < options.waitMs) {
        await wait(500);
        const evaluated = await client.send("Runtime.evaluate", {
          returnByValue: true,
          awaitPromise: true,
          expression: inspectExpression
        });
        info = evaluated.result?.value || {};
        const expectedReady =
          !route.expect?.length || route.expect.some(item => String(info.textSample || "").includes(item));
        if (!info.blank && info.textLength > 80 && info.loadingCount === 0 && expectedReady) break;
      }
      await wait(600);
      const firstShot = await client.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true
      });
      const screenshotPath = join(outDir, `${route.name}.png`);
      writeFileSync(screenshotPath, Buffer.from(firstShot.data, "base64"));

      await captureBottom(client);
      const bottomEval = await client.send("Runtime.evaluate", {
        returnByValue: true,
        awaitPromise: true,
        expression: inspectExpression
      });
      const bottomInfo = bottomEval.result?.value || {};
      const bottomShot = await client.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true
      });
      const bottomScreenshotPath = join(outDir, `${route.name}-bottom.png`);
      writeFileSync(bottomScreenshotPath, Buffer.from(bottomShot.data, "base64"));

      const { failures, warnings } = analyze(
        info,
        route,
        consoleErrors,
        networkIssues
      );
      const result = {
        label: route.name,
        ...route,
        url,
        ok: failures.length === 0,
        failures,
        warnings,
        screenshotPath,
        bottomScreenshotPath,
        info,
        bottomInfo,
        consoleErrors: consoleErrors.slice(0, 20),
        networkIssues: networkIssues.slice(0, 30)
      };
      results.push(result);
      console.log(
        `[${result.ok ? "OK" : "FAIL"}] ${route.name.padEnd(32, " ")} text=${String(info.textLength || 0).padStart(4)} broken=${info.brokenImages?.length || 0} overflowX=${info.overflowX ?? "?"} ${failures.join(",") || screenshotPath}${warnings.length ? ` warnings=${warnings.join(",")}` : ""}`
      );
    }
  } finally {
    client?.close();
    browserProcess.kill();
    await wait(250);
    rmSync(profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    origin: options.origin,
    apiOrigin: options.apiOrigin,
    totals: {
      routes: results.length,
      ok: results.filter(item => item.ok).length,
      fail: results.filter(item => !item.ok).length
    },
    results
  };
  const summaryPath = join(outDir, "summary.json");
  writeFileSync(summaryPath, `${JSON.stringify(summary, null, 2)}\n`);
  console.log(`Summary written: ${summaryPath}`);
  if (summary.totals.fail > 0) process.exitCode = 1;
  if (browserError && process.env.QIMING_REAL_AUDIT_DEBUG_BROWSER === "1") {
    console.error(browserError.trim());
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
