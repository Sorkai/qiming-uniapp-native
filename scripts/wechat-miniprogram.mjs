#!/usr/bin/env node
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { createServer } from "node:net";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const nativeProject = join(root, "native-app");
const buildDir = join(nativeProject, "dist", "build", "mp-weixin");
const projectConfigPath = join(buildDir, "project.config.json");
const artifactsDir = join(root, "artifacts", "wechat-miniprogram");

const realAppIdPattern = /^wx[a-zA-Z0-9]{16}$/;

const roleLabels = {
  student: "student",
  teacher: "teacher",
  admin: "admin"
};

const routeMatrix = [
  {
    name: "student-home",
    role: "student",
    entry: "/account?menu=home",
    expectText: "吴同学"
  },
  {
    name: "student-courses",
    role: "student",
    entry: "/account?menu=course",
    expectText: "我的课程"
  },
  {
    name: "student-course-study",
    role: "student",
    entry: "/course/1?section=course-learn",
    expectText: "章节目录"
  },
  {
    name: "student-course-mastery",
    role: "student",
    entry: "/course/1?section=mastery",
    expectText: "知识点"
  },
  {
    name: "student-course-qa",
    role: "student",
    entry: "/course/1?section=course-qa",
    expectText: "课程问答"
  },
  {
    name: "student-course-work",
    role: "student",
    entry: "/course/1?section=homework-exam",
    expectText: "作业考试"
  },
  {
    name: "student-exams",
    role: "student",
    entry: "/account?menu=exam-center",
    expectText: "试题试卷中心"
  },
  {
    name: "student-exam-do",
    role: "student",
    entry: "/student-exam-center/do/1",
    expectText: "考试"
  },
  {
    name: "student-exam-result",
    role: "student",
    entry: "/exam-paper/result/1",
    expectText: "考试结果"
  },
  {
    name: "student-ai-app",
    role: "student",
    entry: "/account/ai-app?mode=student",
    expectText: "学生模式"
  },
  {
    name: "teacher-dashboard",
    role: "teacher",
    entry: "/welcome/index",
    expectText: "教师"
  },
  {
    name: "teacher-courses",
    role: "teacher",
    entry: "/course/list",
    expectText: "课程名称"
  },
  {
    name: "teacher-course-category",
    role: "teacher",
    entry: "/course/category",
    expectText: "课程分类"
  },
  {
    name: "teacher-course-assessment",
    role: "teacher",
    entry: "/course/assessment",
    expectText: "课程中心"
  },
  {
    name: "teacher-discussion-review",
    role: "teacher",
    entry: "/course/discussion/review",
    expectText: "筛选条件"
  },
  {
    name: "teacher-ai-app",
    role: "teacher",
    entry: "/ai-app/workspace",
    expectText: "教师模式"
  },
  {
    name: "admin-dashboard",
    role: "admin",
    entry: "/welcome/index",
    expectText: "管理员"
  },
  {
    name: "admin-users",
    role: "admin",
    entry: "/user/list",
    expectText: "用户列表"
  },
  {
    name: "admin-course-category",
    role: "admin",
    entry: "/course/category",
    expectText: "课程分类"
  },
  {
    name: "admin-discussion-review",
    role: "admin",
    entry: "/course/discussion/review",
    expectText: "筛选条件"
  }
];

function parseArgs(argv) {
  const args = [...argv];
  const command = args.shift() || "doctor";
  const options = {
    appid:
      process.env.WECHAT_MINIPROGRAM_APPID ||
      process.env.MP_WEIXIN_APPID ||
      "",
    cli: process.env.WECHAT_DEVTOOLS_CLI || "",
    devServer:
      process.env.QIMING_MINIPROGRAM_WEBVIEW_ORIGIN ||
      process.env.WECHAT_MINIPROGRAM_DEV_SERVER ||
      "",
    role: process.env.QIMING_MINIPROGRAM_ROLE || "",
    entry: process.env.QIMING_MINIPROGRAM_ENTRY || "",
    pureSimulator: false,
    version: process.env.WECHAT_MINIPROGRAM_VERSION || "",
    desc: process.env.WECHAT_MINIPROGRAM_DESC || "",
    browser: process.env.QIMING_MINIPROGRAM_BROWSER || "",
    outDir: "",
    waitMs: Number(process.env.QIMING_MINIPROGRAM_H5_WAIT_MS || 8000),
    headed: false,
    allowLocalhostPreview: false
  };

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    const next = args[i + 1];
    if (arg === "--") {
      continue;
    } else if (arg === "--appid" && next) {
      options.appid = next;
      i += 1;
    } else if (arg === "--cli" && next) {
      options.cli = next;
      i += 1;
    } else if (arg === "--dev-server" && next) {
      options.devServer = next;
      i += 1;
    } else if (arg === "--role" && next) {
      options.role = next;
      i += 1;
    } else if (arg === "--entry" && next) {
      options.entry = next;
      i += 1;
    } else if (arg === "--pure-simulator") {
      options.pureSimulator = true;
    } else if (arg === "--version" && next) {
      options.version = next;
      i += 1;
    } else if (arg === "--desc" && next) {
      options.desc = next;
      i += 1;
    } else if (arg === "--browser" && next) {
      options.browser = next;
      i += 1;
    } else if (arg === "--out-dir" && next) {
      options.outDir = next;
      i += 1;
    } else if (arg === "--wait-ms" && next) {
      options.waitMs = Number(next);
      i += 1;
    } else if (arg === "--headed") {
      options.headed = true;
    } else if (arg === "--allow-localhost-preview") {
      options.allowLocalhostPreview = true;
    } else if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  options.devServer = normalizeOrigin(options.devServer);
  options.role = normalizeRole(options.role);
  options.entry = normalizeEntry(options.entry);
  if (!Number.isFinite(options.waitMs) || options.waitMs < 0) {
    throw new Error(`Unsupported wait time: ${options.waitMs}`);
  }
  return { command, options };
}

function normalizeOrigin(input) {
  const value = String(input || "").trim();
  if (!value) return "";
  const parsed = new URL(value);
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Unsupported dev server protocol: ${value}`);
  }
  return parsed.origin;
}

function normalizeRole(input) {
  const value = String(input || "").trim();
  if (!value) return "";
  if (["student", "teacher", "admin"].includes(value)) return value;
  throw new Error(`Unsupported mini program role: ${value}`);
}

function normalizeEntry(input) {
  let value = String(input || "").trim();
  if (!value) return "";
  try {
    value = decodeURIComponent(value);
  } catch {
    value = "/welcome/index";
  }
  value = value.replace(/^#/, "");
  if (!value.startsWith("/")) value = `/${value}`;
  if (value.startsWith("//") || value.includes("://")) {
    throw new Error(`Unsupported mini program entry: ${input}`);
  }
  return value;
}

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function run(command, args, cwd = root, env = {}) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: { ...process.env, ...env }
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with ${result.status}`);
  }
}

function pnpmCommand() {
  return process.platform === "win32" ? "pnpm.cmd" : "pnpm";
}

function resolveCliPath(explicitPath = "") {
  const candidates = [
    explicitPath,
    "/Applications/wechatwebdevtools.app/Contents/MacOS/cli",
    "/Applications/WeChatWebDevTools.app/Contents/MacOS/cli",
    "/Applications/WeChat DevTools.app/Contents/MacOS/cli",
    "/Applications/WeChatDeveloperTool.app/Contents/MacOS/cli",
    "/Applications/微信开发者工具.app/Contents/MacOS/cli"
  ].filter(Boolean);
  return candidates.find(candidate => existsSync(candidate)) || "";
}

function resolveBrowserPath(explicitPath = "") {
  const candidates = [
    explicitPath,
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Chromium.app/Contents/MacOS/Chromium"
  ].filter(Boolean);
  return candidates.find(candidate => existsSync(candidate)) || "";
}

function buildQuery(route, role, devServer) {
  const params = new URLSearchParams();
  params.set("entry", route);
  params.set("demoRole", role);
  if (devServer) params.set("devServer", devServer);
  return params.toString();
}

function readLaunchOptions(config) {
  const condition = config.condition?.miniprogram;
  const currentIndex = Number.isInteger(condition?.current) ? condition.current : 0;
  const current = condition?.list?.[currentIndex] || condition?.list?.[0];
  if (!current?.query) return {};
  const params = new URLSearchParams(current.query);
  return {
    entry: params.get("entry") || "",
    role: params.get("demoRole") || "",
    devServer: params.get("devServer") || ""
  };
}

function readExistingLaunchOptions() {
  if (!existsSync(projectConfigPath)) return {};
  try {
    return readLaunchOptions(readJson(projectConfigPath));
  } catch {
    return {};
  }
}

function resolveLaunchOptions(options) {
  const existing = readExistingLaunchOptions();
  return {
    entry: normalizeEntry(options.entry || existing.entry || "/welcome/index"),
    role: normalizeRole(options.role || existing.role || "teacher"),
    devServer: normalizeOrigin(options.devServer || existing.devServer || "")
  };
}

function hasLaunchOverrides(options) {
  return Boolean(options.devServer || options.role || options.entry);
}

function isLocalhostOrigin(origin) {
  if (!origin) return false;
  const { hostname } = new URL(origin);
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".localhost")
  );
}

function assertPhonePreviewTarget(launch, options, command) {
  if (!launch.devServer) {
    throw new Error(
      `${command} needs --dev-server https://your-h5-domain. Without a web-view H5 origin, the QR code opens the fallback shell page.`
    );
  }

  const parsed = new URL(launch.devServer);
  if (parsed.protocol !== "https:" || isLocalhostOrigin(launch.devServer)) {
    if (options.allowLocalhostPreview) {
      console.warn(
        `[WARN] ${command} is using ${launch.devServer}. A phone QR preview usually cannot open localhost/http web-view pages; use this only for DevTools-side debugging.`
      );
      return;
    }
    throw new Error(
      `${command} needs a phone-accessible HTTPS H5 origin, but got ${launch.devServer}. Use mini:open for local DevTools simulator checks, or pass --dev-server https://your-h5-domain after adding it as a WeChat web-view business domain.`
    );
  }
}

function collectPhoneTargetChecks(options, launch, command = "mini:preflight") {
  const checks = [];
  const add = (status, name, detail = "") => checks.push({ status, name, detail });
  const appid = options.appid || "";
  const cliPath = resolveCliPath(options.cli);
  add(
    hasRealAppId(appid) ? "OK" : "FAIL",
    "WeChat AppID",
    appid || "set WECHAT_MINIPROGRAM_APPID=wx... or pass --appid wx..."
  );
  add(
    cliPath ? "OK" : "FAIL",
    "WeChat DevTools CLI",
    cliPath || "install WeChat DevTools or set WECHAT_DEVTOOLS_CLI"
  );

  if (!launch.devServer) {
    add(
      "FAIL",
      "web-view H5 origin",
      `${command} needs --dev-server https://your-h5-domain`
    );
    return checks;
  }

  const parsed = new URL(launch.devServer);
  add(
    parsed.protocol === "https:" ? "OK" : "FAIL",
    "HTTPS H5 origin",
    launch.devServer
  );
  add(
    !isLocalhostOrigin(launch.devServer) ? "OK" : "FAIL",
    "phone reachable origin",
    isLocalhostOrigin(launch.devServer)
      ? "localhost is only usable from this Mac, not from phone QR preview"
      : launch.devServer
  );
  return checks;
}

async function collectH5OriginChecks(origin) {
  const checks = [];
  const add = (status, name, detail = "") => checks.push({ status, name, detail });
  if (!origin) return checks;
  try {
    const response = await fetch(origin, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(10000)
    });
    add(
      response.ok ? "OK" : "FAIL",
      "H5 origin HTTP",
      `${response.status} ${response.statusText} ${response.url}`
    );
    const contentType = response.headers.get("content-type") || "";
    add(
      contentType.includes("text/html") ? "OK" : "WARN",
      "H5 origin content-type",
      contentType || "empty"
    );
  } catch (error) {
    add(
      "FAIL",
      "H5 origin HTTP",
      error instanceof Error ? error.message : String(error)
    );
  }
  return checks;
}

function patchProjectConfig(options) {
  if (!existsSync(projectConfigPath)) {
    throw new Error(
      `Missing WeChat project config: ${projectConfigPath}. Run mini:build first.`
    );
  }
  const config = readJson(projectConfigPath);
  const launch = resolveLaunchOptions(options);
  config.appid = hasRealAppId(options.appid)
    ? options.appid
    : hasRealAppId(config.appid)
      ? config.appid
      : "";
  config.projectname = config.projectname || "IntellEdu";
  config.condition = config.condition || {};
  config.condition.miniprogram = {
    current: 0,
    list: [
      {
        name: "current",
        pathName: "pages/index/index",
        query: buildQuery(launch.entry, launch.role, launch.devServer)
      },
      ...routeMatrix.map((route, index) => ({
        id: index,
        name: route.name,
        pathName: "pages/index/index",
        query: buildQuery(route.entry, route.role, launch.devServer),
        scene: null
      }))
    ]
  };
  writeJson(projectConfigPath, config);
  return config;
}

function hasRealAppId(appid) {
  return realAppIdPattern.test(String(appid || ""));
}

function assertRealAppId(options, command) {
  if (hasRealAppId(options.appid)) return;
  throw new Error(
    `${command} requires a real WeChat Mini Program AppID. Set WECHAT_MINIPROGRAM_APPID=wx... or pass --appid wx....`
  );
}

function ensureBuildInstalled() {
  if (existsSync(join(nativeProject, "node_modules"))) return;
  run(pnpmCommand(), ["--dir", "native-app", "install", "--frozen-lockfile"]);
}

function runBuild(options) {
  const launch = resolveLaunchOptions(options);
  const buildOptions = { ...options, ...launch };
  ensureBuildInstalled();
  run(pnpmCommand(), ["--dir", "native-app", "build:mp-weixin"], root, {
    VITE_QIMING_MINIPROGRAM_WEBVIEW_ORIGIN: buildOptions.devServer,
    VITE_QIMING_MINIPROGRAM_ROLE: buildOptions.role,
    VITE_QIMING_MINIPROGRAM_ENTRY: buildOptions.entry
  });
  patchProjectConfig(buildOptions);
}

function collectChecks(options) {
  const checks = [];
  const add = (status, name, detail = "") => checks.push({ status, name, detail });
  const requiredFiles = [
    "app.js",
    "app.json",
    "app.wxss",
    "project.config.json",
    "pages/index/index.js",
    "pages/index/index.json",
    "pages/index/index.wxml",
    "pages/index/index.wxss"
  ];

  if (!existsSync(buildDir)) {
    add("FAIL", "mp-weixin build output", `missing: ${buildDir}`);
    return checks;
  }

  add("OK", "mp-weixin build output", buildDir);
  for (const file of requiredFiles) {
    const fullPath = join(buildDir, file);
    add(existsSync(fullPath) ? "OK" : "FAIL", file, fullPath);
  }

  if (existsSync(join(buildDir, "app.json"))) {
    const appJson = readJson(join(buildDir, "app.json"));
    add(
      appJson.pages?.includes("pages/index/index") ? "OK" : "FAIL",
      "app.json pages",
      JSON.stringify(appJson.pages || [])
    );
  }

  let launchOptions = {};
  if (existsSync(projectConfigPath)) {
    const config = patchProjectConfig(options);
    launchOptions = readLaunchOptions(config);
    const list = config.condition?.miniprogram?.list || [];
    add(
      list.length >= routeMatrix.length + 1 ? "OK" : "FAIL",
      "route matrix",
      `${list.length}/${routeMatrix.length + 1} launch conditions`
    );
    add(
      hasRealAppId(config.appid) ? "OK" : "WARN",
      "WeChat AppID",
      config.appid || "empty for simulator import; set WECHAT_MINIPROGRAM_APPID for preview/upload/auto"
    );
  }

  const wxmlPath = join(buildDir, "pages", "index", "index.wxml");
  const jsPath = join(buildDir, "pages", "index", "index.js");
  if (existsSync(wxmlPath)) {
    const wxml = readFileSync(wxmlPath, "utf8");
    add(
      wxml.includes("<web-view") ? "OK" : "FAIL",
      "WeChat web-view branch",
      "pages/index/index.wxml"
    );
    add(
      wxml.includes("微信小程序") ? "OK" : "WARN",
      "fallback status UI",
      "visible when devServer is not provided"
    );
  }
  if (existsSync(jsPath)) {
    const js = readFileSync(jsPath, "utf8");
    add(
      js.includes("qimingMiniProgram") ? "OK" : "FAIL",
      "mini program runtime query",
      "qimingMiniProgram=1"
    );
  }

  const cliPath = resolveCliPath(options.cli);
  add(
    cliPath ? "OK" : "WARN",
    "WeChat DevTools CLI",
    cliPath || "not installed or WECHAT_DEVTOOLS_CLI not set"
  );
  add(
    launchOptions.devServer ? "OK" : "WARN",
    "web-view dev server",
    launchOptions.devServer || "not set; fallback status page will render"
  );
  return checks;
}

function printChecks(checks) {
  const width = Math.max(...checks.map(check => check.name.length), 12);
  for (const check of checks) {
    const padded = check.name.padEnd(width, " ");
    console.log(`[${check.status}] ${padded} ${check.detail}`);
  }
  const failCount = checks.filter(check => check.status === "FAIL").length;
  const warnCount = checks.filter(check => check.status === "WARN").length;
  console.log(`Summary: ${checks.length - warnCount - failCount} OK, ${warnCount} WARN, ${failCount} FAIL`);
  if (failCount > 0) process.exitCode = 1;
}

function wait(ms) {
  return new Promise(resolveWait => setTimeout(resolveWait, ms));
}

function hasValidRouteContent(info, route) {
  const textLength = Number(info?.textLength);
  if (!Number.isFinite(textLength) || textLength === 0 || info?.blank) {
    return false;
  }
  const overflowX = Number(info?.overflowX);
  if (Number.isFinite(overflowX) && overflowX > 0) {
    return false;
  }
  return route.expectText
    ? String(info?.textSample || "").includes(route.expectText)
    : true;
}

function getFreePort() {
  return new Promise((resolvePort, rejectPort) => {
    const server = createServer();
    server.listen(0, "127.0.0.1", () => {
      const address = server.address();
      server.close(() => {
        if (address && typeof address === "object") {
          resolvePort(address.port);
        } else {
          rejectPort(new Error("Unable to allocate a local browser debug port."));
        }
      });
    });
    server.on("error", rejectPort);
  });
}

async function fetchJson(url, init) {
  const response = await fetch(url, init);
  if (!response.ok) {
    throw new Error(`${url} failed with HTTP ${response.status}`);
  }
  return response.json();
}

async function waitForBrowser(port, timeoutMs = 10000) {
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
      lastError instanceof Error ? lastError.message : lastError
    }`
  );
}

class CdpClient {
  constructor(wsUrl) {
    this.wsUrl = wsUrl;
    this.nextId = 1;
    this.pending = new Map();
  }

  async connect() {
    this.socket = new WebSocket(this.wsUrl);
    await new Promise((resolveConnect, rejectConnect) => {
      this.socket.addEventListener("open", resolveConnect, { once: true });
      this.socket.addEventListener(
        "error",
        () => rejectConnect(new Error(`Unable to connect CDP: ${this.wsUrl}`)),
        { once: true }
      );
    });
    this.socket.addEventListener("message", event => {
      const message = JSON.parse(event.data);
      if (!message.id) return;
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      if (message.error) {
        pending.reject(new Error(message.error.message || "CDP command failed."));
      } else {
        pending.resolve(message.result);
      }
    });
  }

  send(method, params = {}) {
    const id = this.nextId;
    this.nextId += 1;
    const payload = JSON.stringify({ id, method, params });
    return new Promise((resolveCommand, rejectCommand) => {
      this.pending.set(id, { resolve: resolveCommand, reject: rejectCommand });
      this.socket.send(payload);
    });
  }

  close() {
    this.socket?.close();
  }
}

function h5RouteUrl(devServer, route, smokeId = "") {
  const params = new URLSearchParams({
    demoRole: route.role,
    qimingNative: "1",
    qimingMiniProgram: "1"
  });
  if (smokeId) params.set("_qimingSmoke", smokeId);
  return `${devServer}/#${route.entry}${
    route.entry.includes("?") ? "&" : "?"
  }${params.toString()}`;
}

async function runH5Smoke(options) {
  const devServer = normalizeOrigin(options.devServer);
  if (!devServer) {
    throw new Error(
      "mini:h5-smoke requires --dev-server or QIMING_MINIPROGRAM_WEBVIEW_ORIGIN."
    );
  }

  const browserPath = resolveBrowserPath(options.browser);
  if (!browserPath) {
    throw new Error(
      "Chrome/Edge not found. Pass --browser /path/to/Chrome or install a Chromium browser."
    );
  }

  const debugPort = await getFreePort();
  const profileDir = mkdtempSync(join(tmpdir(), "qiming-mini-h5-smoke-"));
  const outDir =
    options.outDir ||
    join(
      artifactsDir,
      `h5-route-smoke-${new Date().toISOString().replace(/[:.]/g, "-")}`
    );
  mkdirSync(outDir, { recursive: true });

  const browserArgs = [
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
    await client.send("Emulation.setDeviceMetricsOverride", {
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      mobile: true
    });

    const inspectPageExpression = `(() => {
      const text = (document.body?.innerText || "").replace(/\\s+/g, " ").trim();
      const app = document.querySelector("#app");
      const vw = document.documentElement.clientWidth;
      const maxScrollWidth = Math.max(
        document.body.scrollWidth,
        document.documentElement.scrollWidth
      );
      return {
        href: location.href,
        title: document.title,
        textLength: text.length,
        textSample: text.slice(0, 420),
        appChildren: app?.children?.length || 0,
        overflowX: Math.max(0, Math.round(maxScrollWidth - vw)),
        scrollHeight: Math.round(Math.max(
          document.body.scrollHeight,
          document.documentElement.scrollHeight
        )),
        blank: Boolean(app) && !text,
        loadingDots: document.querySelectorAll(
          ".pure-loading, .loading, [class*=loading], [class*=Loading]"
        ).length
      };
    })()`;
    const inspectPage = async () => {
      const evaluation = await client.send("Runtime.evaluate", {
        returnByValue: true,
        awaitPromise: true,
        expression: inspectPageExpression
      });
      return evaluation.result?.value || {};
    };

    const results = [];
    for (const route of routeMatrix) {
      const url = h5RouteUrl(devServer, route, `${Date.now()}-${route.name}`);
      await client.send("Page.navigate", { url: "about:blank" });
      await wait(150);
      await client.send("Page.navigate", { url });
      const startedAt = Date.now();
      let info = await inspectPage();
      while (
        Date.now() - startedAt < options.waitMs &&
        !hasValidRouteContent(info, route)
      ) {
        await wait(300);
        info = await inspectPage();
      }
      info.matchedExpectedText = route.expectText
        ? String(info.textSample || "").includes(route.expectText)
        : true;
      const screenshot = await client.send("Page.captureScreenshot", {
        format: "png",
        fromSurface: true
      });
      const screenshotPath = join(outDir, `${route.name}.png`);
      writeFileSync(screenshotPath, Buffer.from(screenshot.data, "base64"));
      results.push({ ...route, url, screenshotPath, info });
      const failed = !hasValidRouteContent(info, route);
      const status = failed ? "FAIL" : "OK";
      console.log(
        `[${status}] ${route.name.padEnd(18, " ")} text=${String(
          info.textLength ?? 0
        ).padStart(4, " ")} overflowX=${info.overflowX ?? "?"} expect=${
          route.expectText || "-"
        } ${screenshotPath}`
      );
    }

    const summary = {
      generatedAt: new Date().toISOString(),
      devServer,
      viewport: { width: 390, height: 844, deviceScaleFactor: 3, mobile: true },
      browserPath,
      results
    };
    writeJson(join(outDir, "summary.json"), summary);
    const failed = results.filter(
      result => !hasValidRouteContent(result.info, result)
    );
    console.log(`Summary written: ${join(outDir, "summary.json")}`);
    console.log(
      `H5 route smoke: ${results.length - failed.length} OK, ${failed.length} FAIL`
    );
    if (failed.length > 0) process.exitCode = 1;
  } finally {
    client?.close();
    browserProcess.kill();
    await wait(300);
    try {
      rmSync(profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 150 });
    } catch (error) {
      console.warn(
        `[WARN] temporary browser profile cleanup skipped: ${
          error instanceof Error ? error.message : error
        }`
      );
    }
  }

  if (browserError && process.env.QIMING_MINIPROGRAM_DEBUG_BROWSER === "1") {
    console.error(browserError.trim());
  }
}

function runDoctor(options) {
  const checks = [];
  const add = (status, name, detail = "") => checks.push({ status, name, detail });
  add(existsSync(nativeProject) ? "OK" : "FAIL", "native-app project", nativeProject);
  add(
    existsSync(join(nativeProject, "package.json")) ? "OK" : "FAIL",
    "native-app package",
    join(nativeProject, "package.json")
  );
  add(
    existsSync(join(nativeProject, "pnpm-lock.yaml")) ? "OK" : "FAIL",
    "native-app lockfile",
    join(nativeProject, "pnpm-lock.yaml")
  );
  add(
    existsSync(join(nativeProject, "node_modules")) ? "OK" : "WARN",
    "native-app node_modules",
    existsSync(join(nativeProject, "node_modules"))
      ? join(nativeProject, "node_modules")
      : "missing; mini:build will install from lockfile"
  );
  add(
    existsSync(buildDir) ? "OK" : "WARN",
    "mp-weixin build output",
    existsSync(buildDir) ? buildDir : "missing; run pnpm mini:build"
  );
  const cliPath = resolveCliPath(options.cli);
  add(
    cliPath ? "OK" : "WARN",
    "WeChat DevTools CLI",
    cliPath || "install WeChat DevTools or set WECHAT_DEVTOOLS_CLI"
  );
  printChecks(checks);
}

async function runPreflight(options) {
  assertRealAppId(options, "mini:preflight");
  const launch = resolveLaunchOptions(options);
  runBuild({ ...options, ...launch });
  const checks = [
    ...collectPhoneTargetChecks(options, launch, "mini:preflight"),
    ...collectChecks({ ...options, ...launch }),
    ...(await collectH5OriginChecks(launch.devServer))
  ];
  printChecks(checks);
}

function runOpen(options) {
  if (!existsSync(buildDir) || hasLaunchOverrides(options)) {
    runBuild(options);
  } else {
    patchProjectConfig(options);
  }
  const cliPath = resolveCliPath(options.cli);
  if (!cliPath) {
    throw new Error(
      "WeChat DevTools CLI not found. Install WeChat DevTools or set WECHAT_DEVTOOLS_CLI."
    );
  }
  const args = ["open", "--project", buildDir];
  if (options.pureSimulator) args.push("--pure-simulator");
  run(cliPath, args);
}

function runPreview(options) {
  assertRealAppId(options, "mini:preview");
  const launch = resolveLaunchOptions(options);
  assertPhonePreviewTarget(launch, options, "mini:preview");
  runBuild({ ...options, ...launch });
  const cliPath = resolveCliPath(options.cli);
  if (!cliPath) {
    throw new Error(
      "WeChat DevTools CLI not found. Install WeChat DevTools or set WECHAT_DEVTOOLS_CLI."
    );
  }
  mkdirSync(artifactsDir, { recursive: true });
  run(cliPath, [
    "preview",
    "--project",
    buildDir,
    "--qr-format",
    "image",
    "--qr-output",
    join(artifactsDir, "preview.png"),
    "--info-output",
    join(artifactsDir, "preview-info.json")
  ]);
}

function runAuto(options) {
  assertRealAppId(options, "mini:auto");
  if (!existsSync(buildDir) || hasLaunchOverrides(options)) {
    runBuild(options);
  } else {
    patchProjectConfig(options);
  }
  const cliPath = resolveCliPath(options.cli);
  if (!cliPath) {
    throw new Error(
      "WeChat DevTools CLI not found. Install WeChat DevTools or set WECHAT_DEVTOOLS_CLI."
    );
  }
  run(cliPath, ["auto", "--project", buildDir, "--trust-project"]);
}

function runUpload(options) {
  assertRealAppId(options, "mini:upload");
  if (!options.version) {
    throw new Error("Missing --version or WECHAT_MINIPROGRAM_VERSION.");
  }
  const launch = resolveLaunchOptions(options);
  assertPhonePreviewTarget(launch, options, "mini:upload");
  runBuild({ ...options, ...launch });
  const cliPath = resolveCliPath(options.cli);
  if (!cliPath) {
    throw new Error(
      "WeChat DevTools CLI not found. Install WeChat DevTools or set WECHAT_DEVTOOLS_CLI."
    );
  }
  mkdirSync(artifactsDir, { recursive: true });
  run(cliPath, [
    "upload",
    "--project",
    buildDir,
    "--version",
    options.version,
    "--desc",
    options.desc || `IntellEdu mini program ${options.version}`,
    "--info-output",
    join(artifactsDir, "upload-info.json")
  ]);
}

function printHelp() {
  console.log(`Usage: node scripts/wechat-miniprogram.mjs <command> [options]

Commands:
  doctor   Check local mini program tooling.
  build    Build native-app as mp-weixin and patch launch conditions.
  smoke    Verify generated mp-weixin files and route conditions.
  h5-smoke Capture mobile screenshots for the H5 route matrix.
  preflight
           Build and verify AppID, HTTPS H5 origin, DevTools CLI, and route matrix before preview/upload.
  open     Open the generated project in WeChat DevTools.
  preview  Generate a WeChat preview QR code through DevTools CLI.
  auto     Enable WeChat DevTools automation; requires a real AppID.
  upload   Upload through DevTools CLI; requires --version.

Options:
  --appid <wxappid>       Override WECHAT_MINIPROGRAM_APPID.
  --cli <path>            Override WECHAT_DEVTOOLS_CLI.
  --dev-server <origin>   H5 origin for web-view debugging, e.g. http://localhost:8851.
  --role <role>           Launch role: student, teacher, or admin.
  --entry <path>          Launch H5 route, e.g. /welcome/index.
  --pure-simulator        Use DevTools pure simulator mode for open.
  --browser <path>        Chromium browser path for h5-smoke.
  --out-dir <path>        Screenshot output directory for h5-smoke.
  --wait-ms <ms>          Per-route wait time for h5-smoke.
  --headed                Run h5-smoke with a visible browser window.
  --allow-localhost-preview
                          Allow localhost/http preview QR generation for DevTools-only debugging.
  --version <semver>      Upload version.
  --desc <text>           Upload description.
`);
}

try {
  const { command, options } = parseArgs(process.argv.slice(2));
  if (options.help || command === "help") {
    printHelp();
  } else if (command === "doctor") {
    runDoctor(options);
  } else if (command === "build") {
    runBuild(options);
    printChecks(collectChecks(options));
  } else if (command === "smoke") {
    printChecks(collectChecks(options));
  } else if (command === "h5-smoke") {
    await runH5Smoke(options);
  } else if (command === "preflight") {
    await runPreflight(options);
  } else if (command === "open") {
    runOpen(options);
  } else if (command === "preview") {
    runPreview(options);
  } else if (command === "auto") {
    runAuto(options);
  } else if (command === "upload") {
    runUpload(options);
  } else {
    throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
