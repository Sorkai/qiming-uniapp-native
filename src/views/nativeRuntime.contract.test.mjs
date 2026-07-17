import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const read = relativePath =>
  readFileSync(new URL(relativePath, import.meta.url), "utf8");

const userProfile = read("account/components/UserProfile.vue");
const androidAudit = read("../../scripts/android-webview-audit.mjs");
const sharedRouteMatrix = read("../../scripts/wechat-real-session-audit.mjs");
const mainRuntime = read("../main.ts");
const globalStyles = read("../style/index.scss");
const nativeSync = read("../../scripts/sync-app-h5.mjs");

test("Android native status bar keeps an extra top clearance", () => {
  assert.match(mainRuntime, /isAndroidNative \? 6 : 0/);
  assert.match(mainRuntime, /qiming-native-android/);
  assert.match(
    globalStyles,
    /qiming-native-android[\s\S]*qiming-native-env-safe-top[\s\S]*\+ 6px/
  );
  assert.match(
    globalStyles,
    /qiming-native-android \.fixed-header[\s\S]*padding-top: var\(--pure-safe-area-top/
  );
  assert.match(
    globalStyles,
    /qiming-native-android \.app-main[\s\S]*64px \+ var\(--pure-safe-area-top/
  );
  assert.match(
    nativeSync,
    /isAndroidNative[\s\S]*\+ \(isAndroidNative \? 6 : 0\)/
  );
});

test("native profile keeps local activity fallback without calling an absent API", () => {
  assert.doesNotMatch(userProfile, /完成了《Python 基础入门》/);
  assert.match(userProfile, /const learningActivities = ref\(\[\]\)/);
  assert.match(userProfile, /classList\.contains\("qiming-native-webview"\)/);
  assert.match(
    userProfile,
    /const isNativeWebView =[\s\S]*if \(\s*isNativeWebView \|\|[\s\S]*return;/
  );
});

test("account audit ignores SVG style text and expects rendered page content", () => {
  assert.match(androidAudit, /clone\.querySelectorAll\("svg"\)/);
  assert.match(
    androidAudit,
    /activeMenuText: textWithoutSvg\(activeAccountMenu\)/
  );
  assert.match(
    androidAudit,
    /if \(userInfo \|\| destination\)[\s\S]*location\.reload\(\)/
  );
  assert.match(sharedRouteMatrix, /expect: \["课程信息", "AI总结"\]/);
  assert.match(sharedRouteMatrix, /expect: \["启明智教 · 2D 校园导览"\]/);
  assert.match(
    sharedRouteMatrix,
    /name: "student-course-work"[\s\S]*expect: \["作业考试"\]/
  );
});

test("Android route runner enforces compact digital-human checks", () => {
  const androidRunner = read("../../scripts/android-real-device-audit.mjs");
  assert.match(androidRunner, /expect-compact-digital-human/);
  assert.match(androidRunner, /expectsCompactDigitalHuman/);
  assert.match(androidRunner, /"\/account\/ai-app"/);
  assert.match(androidRunner, /"\/ai-app\/chat"/);
  assert.match(androidRunner, /"\/ai-app\/workspace"/);
  assert.doesNotMatch(androidRunner, /routePath\.startsWith\("\/ai-app\/"\)/);
});
