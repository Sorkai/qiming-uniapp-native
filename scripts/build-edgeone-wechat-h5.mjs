import {
  existsSync,
  mkdirSync,
  readdirSync,
  statSync,
  copyFileSync,
  readFileSync,
  rmSync
} from "node:fs";
import { join } from "node:path";
import { spawnSync } from "node:child_process";

const root = process.cwd();
const distDir = join(root, "dist");
const indexFile = join(distDir, "index.html");
const verifyFile = "hyWOiOCR1C.txt";

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    env: process.env
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function copyVerifyFile() {
  const source = join(root, "public", verifyFile);
  const target = join(distDir, verifyFile);
  if (!existsSync(source)) return;
  mkdirSync(distDir, { recursive: true });
  rmSync(target, { force: true });
  copyFileSync(source, target);
}

function countFiles(dir) {
  if (!existsSync(dir)) return 0;
  return readdirSync(dir).reduce((total, name) => {
    const file = join(dir, name);
    const stats = statSync(file);
    return total + (stats.isDirectory() ? countFiles(file) : 1);
  }, 0);
}

function assertOutput() {
  if (!existsSync(indexFile)) {
    throw new Error("dist/index.html was not generated");
  }

  const html = readFileSync(indexFile, "utf8");
  if (html.length < 1024) {
    throw new Error(`dist/index.html is too small (${html.length} bytes)`);
  }

  if (!html.includes("/static/js/")) {
    throw new Error("dist/index.html does not reference the Vite JS entry");
  }

  const fileCount = countFiles(distDir);
  if (fileCount < 20) {
    throw new Error(`dist output looks incomplete (${fileCount} files)`);
  }

  console.log(`[edgeone] verified dist/index.html (${html.length} bytes), files=${fileCount}`);
}

run("pnpm", ["build:wechat-h5"]);
copyVerifyFile();
assertOutput();
