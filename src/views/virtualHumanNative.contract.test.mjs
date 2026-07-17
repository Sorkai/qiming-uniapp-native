import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const viewsDir = dirname(fileURLToPath(import.meta.url));
const read = relativePath =>
  readFileSync(resolve(viewsDir, relativePath), "utf8");

const accountPanel = read("account/ai-app/components/VirtualHumanPanel.vue");
const standalonePanel = read("ai-app/components/VirtualHumanPanel.vue");
const accountAiApp = read("account/ai-app/index.vue");
const virtualPeoplePage = read("../../public/virtual-people/index.html");
const androidAudit = read("../../scripts/android-webview-audit.mjs");

test("digital human asset URL stays beside the app entry on file and web URLs", () => {
  const relativeAsset = "virtual-people/index.html";

  assert.equal(
    new URL(
      relativeAsset,
      "file:///storage/emulated/0/Android/data/io.dcloud.HBuilder/apps/HBuilder/www/hybrid/html/index.html?v=0#/home"
    ).href,
    "file:///storage/emulated/0/Android/data/io.dcloud.HBuilder/apps/HBuilder/www/hybrid/html/virtual-people/index.html"
  );
  assert.equal(
    new URL(relativeAsset, "https://example.com/app/#/home").href,
    "https://example.com/app/virtual-people/index.html"
  );
});

test("both digital human panels use deploy-relative URLs and file-safe messaging", () => {
  for (const panel of [accountPanel, standalonePanel]) {
    assert.match(
      panel,
      /new URL\("virtual-people\/index\.html", window\.location\.href\)/
    );
    assert.match(panel, /target\.origin === "null" \|\| !\/\^https\?:\$\//);
    assert.match(panel, /event\.source !== iframe\.contentWindow/);
    assert.match(panel, /data\.source !== "qiming-virtual-people"/);
    assert.doesNotMatch(panel, /\$\{base\}\/virtual-people/);
  }
});

test("embedded digital human accepts only its trusted local parent messages", () => {
  assert.match(virtualPeoplePage, /event\.source === window\.parent/);
  assert.match(
    virtualPeoplePage,
    /!\['http:', 'https:'\]\.includes\(window\.location\.protocol\)/
  );
  assert.match(
    virtualPeoplePage,
    /event\.origin === 'null' \|\| event\.origin === 'file:\/\/'/
  );
  assert.match(
    virtualPeoplePage,
    /if \(!isSameOrigin && !isTrustedFileParent\) return;/
  );
});

test("native motion manifest is inlined before file fetch", () => {
  assert.match(
    virtualPeoplePage,
    /getElementById\(\s*'qiming-motion-manifest-json'\s*\)/
  );
  assert.match(virtualPeoplePage, /JSON\.parse\(inlineManifest\.textContent\)/);
});

test("digital human reports readiness and supports bundled three.js", () => {
  assert.match(
    virtualPeoplePage,
    /source: 'qiming-virtual-people', type, \.\.\.detail/
  );
  assert.match(virtualPeoplePage, /emitParent\('ready'/);
  assert.match(virtualPeoplePage, /emitParent\('error'/);
  assert.match(
    virtualPeoplePage,
    /typeof THREE\.Timer === 'function' \? new THREE\.Timer\(\) : new THREE\.Clock\(\)/
  );
  assert.match(virtualPeoplePage, /const LOCAL_TTS_ENABLED = false/);
  assert.match(standalonePanel, /系统中文音色/);
  assert.doesNotMatch(standalonePanel, /仅本地女声|加载本地/);
  assert.doesNotMatch(virtualPeoplePage, /<option value="(?:auto|local)">/);
  assert.match(virtualPeoplePage, /reloadLocalTtsBtn\?\.addEventListener/);
});

test("Android compact layout mounts only the lightweight 2D digital human", () => {
  assert.match(
    accountAiApp,
    /canMountInline3D\.value =[\s\S]*window\.innerWidth > 1280[\s\S]*\/\^https\?:\$\//
  );
  assert.match(
    accountAiApp,
    /v-if="canMountInline3D"\s*\n\s*class="ai-human-column/
  );
  assert.doesNotMatch(
    accountAiApp,
    /v-if="canMountInline3D[^\n]*"\s*\n\s*class="ai-chat-dialog-panel/
  );
  assert.match(accountAiApp, /floatingHumanRef\.value\?\.speak\?\.\(text\)/);
  assert.match(androidAudit, /--expect-compact-digital-human/);
  assert.match(androidAudit, /inline3DIframeCount/);
  assert.match(androidAudit, /floating2DVisible/);
});
