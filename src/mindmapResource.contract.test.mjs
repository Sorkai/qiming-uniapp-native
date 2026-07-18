import assert from "node:assert/strict";
import test from "node:test";

import { normalizeMindmapResourceUrl } from "./utils/mindmap-resource.mjs";

const target = "https://aiedu-file.intelledu.cn";
const proxyOrigin = "https://aiedu-mp.intelledu.cn";

test("mindmap resources use the EdgeOne proxy in production", () => {
  assert.equal(
    normalizeMindmapResourceUrl(
      "https://aiedu-file.intelledu.cn/video_analysis/37/mind_map.json?rev=2",
      { target, proxyOrigin }
    ),
    "https://aiedu-mp.intelledu.cn/mindmap-file/video_analysis/37/mind_map.json?rev=2"
  );
});

test("mindmap resources use a relative proxy path in development", () => {
  assert.equal(
    normalizeMindmapResourceUrl(
      "https://aiedu-file.intelledu.cn/video_analysis/37/mind_map.json",
      { target, proxyOrigin, dev: true }
    ),
    "/mindmap-file/video_analysis/37/mind_map.json"
  );
});

test("mindmap resources from other origins remain unchanged", () => {
  const source = "https://example.test/mind_map.json";
  assert.equal(
    normalizeMindmapResourceUrl(source, { target, proxyOrigin }),
    source
  );
});
