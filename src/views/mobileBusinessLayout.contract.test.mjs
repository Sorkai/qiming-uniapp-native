import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const viewsDir = dirname(fileURLToPath(import.meta.url));
const readView = relativePath =>
  readFileSync(resolve(viewsDir, relativePath), "utf8");

const studentPaperDetail = readView("exam-paper/student-center/detail.vue");
const homeworkDetail = readView("account/homework-detail.vue");
const examDetail = readView("account/exam-detail.vue");
const paperEditor = readView("exam-paper/editor/index.vue");
const paperTemplates = readView("exam-paper/templates/index.vue");
const paperStatistics = readView("exam-paper/statistics/index.vue");
const classroom = readView("course/classroom/index.vue");

test("student detail flows remove layered mobile gutters", () => {
  assert.match(studentPaperDetail, /@media \(width <= 768px\)/);
  assert.match(studentPaperDetail, /margin: 0 !important/);
  assert.match(studentPaperDetail, /\.paper-info-card,[\s\S]*padding: 8px/);
  assert.match(homeworkDetail, /\.main-content[\s\S]*padding: 0 8px/);
  assert.match(examDetail, /\.main-content[\s\S]*padding: 0 8px/);
});

test("student detail controls preserve phone touch targets", () => {
  assert.match(studentPaperDetail, /min-height: 44px/);
  assert.match(homeworkDetail, /min-height: 44px/);
  assert.match(examDetail, /min-height: 44px/);
});

test("paper editor uses a scrollable toolbar and a single-column outline", () => {
  assert.match(paperEditor, /\.header-right[\s\S]*overflow-x: auto/);
  assert.match(paperEditor, /\.toolbar-groups[\s\S]*overflow-x: auto/);
  assert.match(
    paperEditor,
    /\.editor-outline,[\s\S]*\.editor-outline\.collapsed[\s\S]*width: 100%/
  );
});

test("paper templates collapse below their former 300px minimum", () => {
  assert.match(paperTemplates, /grid-template-columns: minmax\(0, 1fr\)/);
  assert.match(paperTemplates, /\.templates-page[\s\S]*padding: 8px/);
  assert.match(paperTemplates, /min-height: 44px/);
});

test("paper statistics release chart width on phones", () => {
  assert.match(paperStatistics, /\.statistics-container[\s\S]*padding: 8px/);
  assert.match(
    paperStatistics,
    /\.chart-card,[\s\S]*\.detail-card[\s\S]*min-width: 0[\s\S]*padding: 8px/
  );
});

test("mobile campus exposes reachable alternatives to scaled SVG hotspots", () => {
  assert.match(classroom, /class="mobile-campus-nav"/);
  assert.match(
    classroom,
    /\.campus-container \.hot-zone[\s\S]*pointer-events: none/
  );
  assert.match(classroom, /\.mobile-campus-action[\s\S]*min-height: 48px/);
});
