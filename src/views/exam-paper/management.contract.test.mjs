import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const examPaperDir = dirname(fileURLToPath(import.meta.url));
const readSource = relativePath =>
  readFileSync(resolve(examPaperDir, relativePath), "utf8");

const api = readSource("../../api/examPaper.ts");
const overview = readSource("index.vue");
const myPapers = readSource("my-papers/index.vue");
const grading = readSource("grading/index.vue");

test("my papers send folder filters and execute real copy/delete requests", () => {
  assert.match(api, /folderId\?: number/);
  assert.match(myPapers, /folderId: selectedFolderId\.value \?\? undefined/);
  assert.match(myPapers, /await getPaperDetail\(paper\.paperId\)/);
  assert.match(myPapers, /await createPaperApi\(\{/);
  assert.match(myPapers, /await deletePaperApi\(paper\.paperId\)/);
  assert.match(
    myPapers,
    /await Promise\.all\(\[loadData\(\), loadStatistics\(\), fetchFolders\(\)\]\)/
  );
});

test("exam paper pages load real course options", () => {
  for (const source of [overview, myPapers, grading]) {
    assert.match(source, /getCourseList/);
    assert.match(source, /Array\.isArray\(res\.data\)/);
  }

  assert.doesNotMatch(overview, /value: "math"/);
  assert.doesNotMatch(myPapers, /\{ id: 1, name: "高等数学" \}/);
  assert.doesNotMatch(grading, /\{ id: 1, name: "高等数学" \}/);
});

test("all backend paper statuses use the shared status contract", () => {
  for (const status of [
    "DRAFT",
    "PUBLISHED",
    "IN_PROGRESS",
    "ENDED",
    "GRADING",
    "GRADED",
    "SCORE_RELEASED"
  ]) {
    assert.match(api, new RegExp(`PaperStatus\\.${status}`));
  }

  for (const source of [overview, myPapers]) {
    assert.match(source, /getPaperStatusText/);
    assert.match(source, /getPaperStatusType/);
    assert.doesNotMatch(source, /status === 1 \? "已发布" : "草稿"/);
  }
});
