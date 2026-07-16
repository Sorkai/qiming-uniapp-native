import {
  cpSync,
  existsSync,
  mkdirSync,
  statSync,
  writeFileSync
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { Plugin } from "vite";

const PUBLIC_ASSET_WHITELIST = [
  "favicon.ico",
  "hyWOiOCR1C.txt",
  "logo.svg",
  "manifest.webmanifest",
  "sw.js",
  "platform-config.json",
  "campus-2d-bg.svg",
  "icons",
  "wasm",
  "demo-resources",
  "demos",
  "virtualpeopleanimation",
  "homepage",
  "publicbackgroundpreset"
];

const STATIC_ASSET_MAPPINGS = [
  {
    source: resolve("src/assets/course-detail-images"),
    target: "static/images"
  },
  {
    source: resolve("src/assets/img"),
    target: "static/img"
  },
  {
    source: resolve("src/assets/img"),
    target: "img"
  }
];

const LEGACY_FONT_ALIASES = [
  {
    source: resolve("src/components/ReFlowChart/src/assets/iconfont/iconfont.eot"),
    targets: ["static/fonts/iconfont.45255860.eot"]
  },
  {
    source: resolve("src/assets/iconfont/iconfont.woff"),
    targets: [
      "static/fonts/iconfont.11a336a0.woff",
      "static/fonts/Abel-Regular-2.cdf518de.ttf",
      "static/fonts/AlibabaPuHuiTi-3-55-Regular.a86e7449.otf",
      "static/fonts/AlibabaPuHuiTi-3-85-Bold.8668b98c.otf",
      "static/fonts/AlibabaPuHuiTi-3-105-Heavy.41d6b335.otf",
      "static/fonts/AlibabaPuHuiTi-3-115-Black.7f3ce506.otf",
      "static/fonts/Poppins.e212f840.ttf",
      "static/fonts/Poppins-Bold.6de54279.otf",
      "static/fonts/AlimamaShuHeiTi-Bold.39f49cdf.otf"
    ]
  },
  {
    source: resolve("src/assets/iconfont/iconfont.ttf"),
    targets: ["static/fonts/iconfont.35db7646.ttf"]
  }
];

const LEGACY_SVG_ALIASES = [
  "img/setting.f563bd46.svg",
  "img/setting2.28d2d979.svg",
  "img/security.653bf422.svg",
  "img/security2.678efc80.svg",
  "static/img/setting.f563bd46.svg",
  "static/img/setting2.28d2d979.svg",
  "static/img/security.653bf422.svg",
  "static/img/security2.678efc80.svg",
  "static/img/iconfont.3381fb80.svg"
];

const legacySvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <path fill="#6b8cdb" d="M16 3 5 7v7c0 7 4.6 12.9 11 15 6.4-2.1 11-8 11-15V7L16 3Z"/>
  <path fill="#fff" d="M15 10h2v8h-2zm0 10h2v2h-2z"/>
</svg>
`;

export function copyPublicAssets(): Plugin {
  let outDir = "dist";

  return {
    name: "vite:copyPublicAssets",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    writeBundle() {
      const rootDir = process.cwd();
      const publicDir = resolve(rootDir, "public");
      const distDir = resolve(rootDir, outDir);

      for (const asset of PUBLIC_ASSET_WHITELIST) {
        const source = join(publicDir, asset);
        const target = join(distDir, asset);

        if (!existsSync(source)) continue;
        const sourceStat = statSync(source);

        if (sourceStat.isDirectory()) {
          cpSync(source, target, {
            recursive: true,
            force: true
          });
        } else {
          mkdirSync(dirname(target), { recursive: true });
          cpSync(source, target, { force: true });
        }
      }

      for (const asset of STATIC_ASSET_MAPPINGS) {
        if (!existsSync(asset.source)) continue;
        cpSync(asset.source, join(distDir, asset.target), {
          recursive: true,
          force: true
        });
      }

      for (const alias of LEGACY_FONT_ALIASES) {
        if (!existsSync(alias.source)) continue;
        for (const targetPath of alias.targets) {
          const target = join(distDir, targetPath);
          mkdirSync(dirname(target), { recursive: true });
          cpSync(alias.source, target, { force: true });
        }
      }

      for (const targetPath of LEGACY_SVG_ALIASES) {
        const target = join(distDir, targetPath);
        mkdirSync(dirname(target), { recursive: true });
        writeFileSync(target, legacySvg);
      }
    }
  };
}
