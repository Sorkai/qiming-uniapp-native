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
const virtualPeoplePage = read("../../public/virtual-people/index.html");

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
    assert.match(
      panel,
      /target\.protocol === "file:" \? "\*" : target\.origin/
    );
    assert.doesNotMatch(panel, /\$\{base\}\/virtual-people/);
  }
});

test("embedded digital human accepts only its file-scheme parent messages", () => {
  assert.match(virtualPeoplePage, /event\.source === window\.parent/);
  assert.match(virtualPeoplePage, /window\.location\.protocol === 'file:'/);
  assert.match(
    virtualPeoplePage,
    /event\.origin === 'null' \|\| event\.origin === 'file:\/\/'/
  );
  assert.match(
    virtualPeoplePage,
    /if \(!isSameOrigin && !isTrustedFileParent\) return;/
  );
});
