import { existsSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const distDir = join(root, "dist");
const verifyFile = "hyWOiOCR1C.txt";

function run(command, args, env = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    env: {
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

function assertFile(pathname, message = `${pathname} was not generated`) {
  if (!existsSync(join(distDir, pathname))) {
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
}

rmSync(distDir, { recursive: true, force: true });
run("pnpm", ["exec", "vite", "build", "--mode", "wechat-h5"]);
assertOutput();

writeFileSync(
  join(distDir, "version.json"),
  `${JSON.stringify(
    {
      mode: "wechat-h5-source-build",
      source: "qiming-uniapp-native/wechat-miniprogram",
      builtAt: new Date().toISOString()
    },
    null,
    2
  )}\n`
);

console.log("[edgeone] built WeChat H5 from current source branch");
