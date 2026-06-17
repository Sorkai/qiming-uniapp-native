import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const distDir = join(root, "dist");
const verifyFile = "hyWOiOCR1C.txt";
const upstreamOrigin = "https://aiedu.intelledu.cn";

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "cache-control": "no-cache"
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return response.text();
}

function rewriteHtml(html) {
  return html
    .replace(/(src|href)="\/(static\/[^"]+)"/g, `$1="${upstreamOrigin}/$2"`)
    .replace(/(src|href)="\/(favicon\.ico|manifest\.webmanifest|logo\.svg)"/g, `$1="${upstreamOrigin}/$2"`);
}

function copyVerifyFile() {
  const source = join(root, "public", verifyFile);
  const target = join(distDir, verifyFile);
  if (!existsSync(source)) return;
  rmSync(target, { force: true });
  copyFileSync(source, target);
}

function assertOutput() {
  const indexFile = join(distDir, "index.html");
  const html = readFileSync(indexFile, "utf8");
  if (html.length < 1024) {
    throw new Error(`dist/index.html is too small (${html.length} bytes)`);
  }
  if (!html.includes(`${upstreamOrigin}/static/js/`)) {
    throw new Error("dist/index.html does not point to the production H5 JS entry");
  }
  if (!existsSync(join(distDir, verifyFile))) {
    throw new Error(`dist/${verifyFile} was not generated`);
  }
  console.log(`[edgeone] wrote mirror index (${html.length} bytes) -> ${upstreamOrigin}`);
}

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

const html = rewriteHtml(await fetchText(`${upstreamOrigin}/`));
writeFileSync(join(distDir, "index.html"), html);
writeFileSync(
  join(distDir, "version.json"),
  `${JSON.stringify(
    {
      mode: "wechat-h5-mirror",
      upstreamOrigin,
      builtAt: new Date().toISOString()
    },
    null,
    2
  )}\n`
);
copyVerifyFile();
assertOutput();
