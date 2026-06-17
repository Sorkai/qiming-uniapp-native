import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync
} from "node:fs";
import { dirname, join } from "node:path";

const root = process.cwd();
const distDir = join(root, "dist");
const verifyFile = "hyWOiOCR1C.txt";
const upstreamOrigin = "https://aiedu.intelledu.cn";

async function fetchBuffer(pathname) {
  const url = `${upstreamOrigin}/${pathname.replace(/^\/+/, "")}`;
  const response = await fetch(url, {
    headers: {
      "cache-control": "no-cache"
    }
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
  }
  return Buffer.from(await response.arrayBuffer());
}

async function fetchText(pathname) {
  return (await fetchBuffer(pathname)).toString("utf8");
}

function collectHtmlAssets(html) {
  const assets = new Set();
  const pattern = /(?:src|href)="\/(static\/[^"]+)"/g;
  for (const match of html.matchAll(pattern)) {
    assets.add(match[1]);
  }
  return assets;
}

function collectChunkAssets(js) {
  const assets = new Set();
  const pattern = /["'](static\/(?:js|css)\/[^"']+\.(?:js|css))["']/g;
  for (const match of js.matchAll(pattern)) {
    assets.add(match[1]);
  }
  return assets;
}

function writeAsset(pathname, content) {
  const target = join(distDir, pathname);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content);
}

async function mirrorAssets(initialAssets) {
  const pending = [...initialAssets];
  const mirrored = new Set();

  while (pending.length > 0) {
    const asset = pending.shift();
    if (!asset || mirrored.has(asset)) continue;
    mirrored.add(asset);

    const content = await fetchBuffer(asset);
    writeAsset(asset, content);

    if (asset.endsWith(".js")) {
      const nestedAssets = collectChunkAssets(content.toString("utf8"));
      for (const nested of nestedAssets) {
        if (!mirrored.has(nested)) pending.push(nested);
      }
    }
  }

  return mirrored;
}

function copyVerifyFile() {
  const source = join(root, "public", verifyFile);
  const target = join(distDir, verifyFile);
  if (!existsSync(source)) return;
  rmSync(target, { force: true });
  copyFileSync(source, target);
}

function assertOutput(assetCount) {
  const indexFile = join(distDir, "index.html");
  const html = readFileSync(indexFile, "utf8");
  if (html.length < 1024) {
    throw new Error(`dist/index.html is too small (${html.length} bytes)`);
  }
  if (html.includes(`${upstreamOrigin}/static/`)) {
    throw new Error("dist/index.html still points to cross-origin static assets");
  }
  if (!html.includes("/static/js/")) {
    throw new Error("dist/index.html does not reference a local JS entry");
  }
  if (assetCount < 2) {
    throw new Error(`mirrored asset count looks too small (${assetCount})`);
  }
  if (!existsSync(join(distDir, verifyFile))) {
    throw new Error(`dist/${verifyFile} was not generated`);
  }
}

rmSync(distDir, { recursive: true, force: true });
mkdirSync(distDir, { recursive: true });

const html = await fetchText("/");
const initialAssets = collectHtmlAssets(html);
const mirrored = await mirrorAssets(initialAssets);

writeFileSync(join(distDir, "index.html"), html);
writeFileSync(
  join(distDir, "version.json"),
  `${JSON.stringify(
    {
      mode: "wechat-h5-static-mirror",
      upstreamOrigin,
      mirroredAssets: mirrored.size,
      builtAt: new Date().toISOString()
    },
    null,
    2
  )}\n`
);
copyVerifyFile();
assertOutput(mirrored.size);

console.log(`[edgeone] mirrored ${mirrored.size} static assets from ${upstreamOrigin}`);
