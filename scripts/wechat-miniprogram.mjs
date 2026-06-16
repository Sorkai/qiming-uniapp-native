#!/usr/bin/env node
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { spawnSync } from "node:child_process";
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
    entry: "/account?menu=home"
  },
  {
    name: "student-courses",
    role: "student",
    entry: "/account?menu=course"
  },
  {
    name: "student-exams",
    role: "student",
    entry: "/account?menu=exam-center"
  },
  {
    name: "student-ai-app",
    role: "student",
    entry: "/account/ai-app?mode=student"
  },
  {
    name: "teacher-dashboard",
    role: "teacher",
    entry: "/welcome/index"
  },
  {
    name: "teacher-courses",
    role: "teacher",
    entry: "/course/list"
  },
  {
    name: "teacher-ai-app",
    role: "teacher",
    entry: "/ai-app/workspace"
  },
  {
    name: "admin-dashboard",
    role: "admin",
    entry: "/welcome/index"
  },
  {
    name: "admin-users",
    role: "admin",
    entry: "/user/list"
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
    pureSimulator: false,
    version: process.env.WECHAT_MINIPROGRAM_VERSION || "",
    desc: process.env.WECHAT_MINIPROGRAM_DESC || ""
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
    } else if (arg === "--pure-simulator") {
      options.pureSimulator = true;
    } else if (arg === "--version" && next) {
      options.version = next;
      i += 1;
    } else if (arg === "--desc" && next) {
      options.desc = next;
      i += 1;
    } else if (arg === "-h" || arg === "--help") {
      options.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  options.devServer = normalizeOrigin(options.devServer);
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

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function writeJson(file, value) {
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

function run(command, args, cwd = root) {
  const result = spawnSync(command, args, {
    cwd,
    stdio: "inherit",
    env: process.env
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

function buildQuery(route, role, devServer) {
  const params = new URLSearchParams();
  params.set("entry", route);
  params.set("demoRole", role);
  if (devServer) params.set("devServer", devServer);
  return params.toString();
}

function patchProjectConfig(options) {
  if (!existsSync(projectConfigPath)) {
    throw new Error(
      `Missing WeChat project config: ${projectConfigPath}. Run mini:build first.`
    );
  }
  const config = readJson(projectConfigPath);
  config.appid = options.appid || "";
  config.projectname = config.projectname || "IntellEdu";
  config.condition = config.condition || {};
  config.condition.miniprogram = {
    current: 0,
    list: routeMatrix.map((route, index) => ({
      id: index,
      name: route.name,
      pathName: "pages/index/index",
      query: buildQuery(route.entry, route.role, options.devServer),
      scene: null
    }))
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
  ensureBuildInstalled();
  run(pnpmCommand(), ["--dir", "native-app", "build:mp-weixin"]);
  patchProjectConfig(options);
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

  if (existsSync(projectConfigPath)) {
    const config = patchProjectConfig(options);
    const list = config.condition?.miniprogram?.list || [];
    add(
      list.length >= routeMatrix.length ? "OK" : "FAIL",
      "route matrix",
      `${list.length}/${routeMatrix.length} launch conditions`
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
    options.devServer ? "OK" : "WARN",
    "web-view dev server",
    options.devServer || "not set; fallback status page will render"
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

function runOpen(options) {
  if (!existsSync(buildDir)) runBuild(options);
  patchProjectConfig(options);
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
  if (!existsSync(buildDir)) runBuild(options);
  patchProjectConfig(options);
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
  if (!existsSync(buildDir)) runBuild(options);
  patchProjectConfig(options);
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
  if (!existsSync(buildDir)) runBuild(options);
  patchProjectConfig(options);
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
  open     Open the generated project in WeChat DevTools.
  preview  Generate a WeChat preview QR code through DevTools CLI.
  auto     Enable WeChat DevTools automation; requires a real AppID.
  upload   Upload through DevTools CLI; requires --version.

Options:
  --appid <wxappid>       Override WECHAT_MINIPROGRAM_APPID.
  --cli <path>            Override WECHAT_DEVTOOLS_CLI.
  --dev-server <origin>   H5 origin for web-view debugging, e.g. http://localhost:8851.
  --pure-simulator        Use DevTools pure simulator mode for open.
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
