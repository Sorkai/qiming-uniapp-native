import { cpSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import type { Plugin } from "vite";

const PUBLIC_ASSET_WHITELIST = [
  "favicon.ico",
  "logo.svg",
  "manifest.webmanifest",
  "sw.js",
  "platform-config.json",
  "hyWOiOCR1C.txt",
  "campus-2d-bg.svg",
  "icons",
  "wasm",
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
  }
];

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
    }
  };
}
