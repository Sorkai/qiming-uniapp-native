import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const welcomeDir = dirname(fileURLToPath(import.meta.url));
const readWelcomeFile = relativePath =>
  readFileSync(resolve(welcomeDir, relativePath), "utf8");

const welcome = readWelcomeFile("index.vue");
const stats = readWelcomeFile("components/StatsOverview.vue");
const efficientIndex = readWelcomeFile("components/charts/EfficientIndex.vue");
const courseStatistics = readWelcomeFile(
  "components/charts/CourseStatistics.vue"
);

test("mobile welcome keeps a safe, near-full-width content gutter", () => {
  assert.match(
    welcome,
    /margin-right: max\(8px, env\(safe-area-inset-right, 0px\)\)/
  );
  assert.match(
    welcome,
    /margin-left: max\(8px, env\(safe-area-inset-left, 0px\)\)/
  );
  assert.match(welcome, /min-height: 44px/);
});

test("mobile overview uses two compact statistic columns", () => {
  assert.match(stats, /flex: 0 0 50%/);
  assert.match(stats, /max-width: 50%/);
  assert.match(stats, /min-height: 132px/);
});

test("analysis panels stay single-column through phone landscape widths", () => {
  assert.match(
    welcome,
    /orientation: landscape[\s\S]*max-height: 520px[\s\S]*pointer: coarse/
  );
  assert.match(courseStatistics, /@media screen and \(max-width: 991px\)/);
  assert.match(
    courseStatistics,
    /grid-template-columns: minmax\(0, 1fr\) !important/
  );
  assert.match(efficientIndex, /@media screen and \(max-width: 991px\)/);
});

test("welcome analysis controls preserve 44px touch targets", () => {
  assert.match(efficientIndex, /min-width: 44px[\s\S]*height: 44px/);
  assert.match(courseStatistics, /min-height: 44px/);
  assert.match(courseStatistics, /min-width: 44px[\s\S]*height: 44px/);
});

test("analysis headings use readable solid text", () => {
  assert.doesNotMatch(efficientIndex, /bg-clip-text text-transparent/);
  assert.doesNotMatch(courseStatistics, /bg-clip-text text-transparent/);
});
