import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const distDir = join(root, "dist");
const verifyFile = "hyWOiOCR1C.txt";
const sourceName = "Sorkai/qiming-uniapp-native/wechat-miniprogram";

const wechatH5Env = {
  VITE_PUBLIC_PATH: "/",
  VITE_API_URL: "https://aiedu-api.intelledu.cn",
  VITE_ROUTER_HISTORY: "hash",
  VITE_CDN: "false",
  VITE_COMPRESSION: "none",
  VITE_DOCMEE_API_KEY: "",
  VITE_DOCMEE_CONTAINER_ID: "",
  VITE_QIMING_MINIPROGRAM_WEBVIEW_ORIGIN: "https://aiedu-mp.intelledu.cn"
};

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: {
      ...wechatH5Env,
      ...process.env,
      ...env,
      NODE_OPTIONS: process.env.NODE_OPTIONS || "--max-old-space-size=8192"
    },
    stdio: "inherit"
  });

  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with ${result.status}`);
  }
}

function readGitValue(args) {
  const result = spawnSync("git", args, {
    cwd: root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"]
  });
  return result.status === 0 ? result.stdout.trim() : "";
}

function assertFile(pathname, message = `${pathname} was not generated`) {
  if (!existsSync(join(distDir, pathname))) {
    throw new Error(message);
  }
}

function assertDistContains(needle, message) {
  const result = spawnSync(
    "grep",
    ["-R", "-F", "-q", needle, join(distDir, "static"), join(distDir, "index.html")],
    {
      cwd: root,
      stdio: "ignore"
    }
  );
  if (result.status !== 0) {
    throw new Error(message);
  }
}

function assertOutput() {
  const indexFile = join(distDir, "index.html");
  const html = readFileSync(indexFile, "utf8");

  if (html.length < 1024) {
    throw new Error(`dist/index.html is too small (${html.length} bytes)`);
  }
  if (!html.includes('/static/js/')) {
    throw new Error("dist/index.html does not reference a local JS entry");
  }
  if (html.includes("https://aiedu.intelledu.cn/static/")) {
    throw new Error("dist/index.html still points to the old production static origin");
  }

  const staticEntries = [...html.matchAll(/\/(static\/(?:js|css)\/[^\"']+)/g)].map(
    match => match[1]
  );
  for (const entry of staticEntries) {
    assertFile(entry, `HTML references missing asset: ${entry}`);
  }

  assertFile(verifyFile, `dist/${verifyFile} was not generated`);
  assertFile("logo.svg");
  assertFile("manifest.webmanifest");
  assertFile("icons/app-192.png");
  assertFile("icons/app-512.png");
  assertFile("platform-config.json");
  assertFile("homepage/bannerphoto.png");

  assertDistContains(
    "面向真实教学过程的智能教育平台",
    "dist does not contain the latest branded /home page copy"
  );
  assertDistContains(
    "aiedu-api.intelledu.cn",
    "dist does not contain the production API origin"
  );
}

rmSync(distDir, { recursive: true, force: true });
run("pnpm", ["exec", "vite", "build", "--mode", "wechat-h5"]);
assertOutput();

writeFileSync(
  join(distDir, "version.json"),
  `${JSON.stringify(
    {
      mode: "wechat-h5-source-build",
      source: sourceName,
      branch: readGitValue(["rev-parse", "--abbrev-ref", "HEAD"]),
      commit: readGitValue(["rev-parse", "--short", "HEAD"]),
      builtAt: new Date().toISOString()
    },
    null,
    2
  )}\n`
);

console.log("[edgeone] built WeChat H5 from current source branch");
