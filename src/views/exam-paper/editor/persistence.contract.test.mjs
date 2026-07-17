import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("./index.vue", import.meta.url), "utf8");
const saveBlock = source.slice(
  source.indexOf("const persistPaper"),
  source.indexOf("// 预览试卷")
);
const publishBlock = source.slice(
  source.indexOf("const confirmPublish"),
  source.indexOf("// 保存为模板对话框")
);
const loadBlock = source.slice(
  source.indexOf("const questionTypeKeyByCode"),
  source.indexOf("onMounted(async")
);
const detailLoadBlock = source.slice(
  source.indexOf("const loadPaperDetail"),
  source.indexOf("onMounted(async")
);

test("new papers persist once and switch to the real edit route", () => {
  assert.match(saveBlock, /const res = await createPaper\(paperData as any\)/);
  assert.match(saveBlock, /!isSuccessfulResponseCode\(res\.code\)/);
  assert.match(saveBlock, /Number\.isSafeInteger\(createdPaperId\)/);
  assert.match(saveBlock, /createdPaperId <= 0/);
  assert.match(
    saveBlock,
    /await router\.replace\(\{[\s\S]*name: "ExamPaperEditorEdit"[\s\S]*params: \{ id: String\(savedPaperId\) \}/
  );
  assert.match(source, /if \(savePaperTask\) return savePaperTask/);
  assert.doesNotMatch(saveBlock, /return;\s*\}/);
});

test("publishing a new paper requires its persisted backend ID", () => {
  assert.match(publishBlock, /const savedPaperId = await savePaper\(\)/);
  assert.match(publishBlock, /if \(savedPaperId === null\) return/);
  assert.match(
    publishBlock,
    /publishPaperAdvanced\(\{[\s\S]*paperId: savedPaperId/
  );
  assert.doesNotMatch(publishBlock, /Date\.now\(\)/);
});

test("failed saves cannot fall through to the publish request", () => {
  const failureGuard = publishBlock.indexOf(
    "if (savedPaperId === null) return;"
  );
  const publishRequest = publishBlock.indexOf("publishPaperAdvanced({");

  assert.notEqual(failureGuard, -1);
  assert.notEqual(publishRequest, -1);
  assert.ok(failureGuard < publishRequest);
  assert.match(saveBlock, /return null;/);
  assert.match(
    publishBlock,
    /if \(!isSuccessfulResponseCode\(res\.code\)\)[\s\S]*throw new Error/
  );
});

test("paper editor accepts both frontend and AiEdu success codes", () => {
  assert.match(
    source,
    /const isSuccessfulResponseCode = \(code: number\) =>[\s\S]*code === 0 \|\| code === 200/
  );
  assert.doesNotMatch(saveBlock, /res\.code !== 0/);
  assert.doesNotMatch(publishBlock, /res\.code !== 0/);
  assert.match(
    detailLoadBlock,
    /isSuccessfulResponseCode\(res\.code\) && res\.data/
  );
});

test("publishing an edited paper saves its latest revision first", () => {
  assert.match(publishBlock, /const savedPaperId = await savePaper\(\)/);
  assert.match(saveBlock, /const revisionToSave = paperRevision/);
  assert.match(
    saveBlock,
    /savedPaperId = await persistPaper\(revisionToSave\)/
  );
  assert.match(saveBlock, /while \(lastPersistedRevision < paperRevision\)/);
  assert.match(saveBlock, /const res = await updatePaper\(/);

  const saveBeforePublish = publishBlock.indexOf(
    "const savedPaperId = await savePaper();"
  );
  const publishRequest = publishBlock.indexOf("publishPaperAdvanced({");
  assert.ok(saveBeforePublish >= 0 && saveBeforePublish < publishRequest);
});

test("an older in-flight save cannot clear a newer edit", () => {
  assert.match(source, /paperRevision \+= 1/);
  assert.match(source, /\{ deep: true, flush: "sync" \}/);
  assert.match(
    saveBlock,
    /const paperData = JSON\.parse\([\s\S]*JSON\.stringify/
  );
  assert.match(
    saveBlock,
    /lastPersistedRevision = Math\.max\(lastPersistedRevision, revisionToSave\)/
  );
  assert.match(
    saveBlock,
    /if \(paperRevision === revisionToSave\) \{[\s\S]*hasUnsavedChanges\.value = false;[\s\S]*\} else \{[\s\S]*hasUnsavedChanges\.value = true;/
  );
});

test("save-and-leave waits for a successful persisted ID", () => {
  const goBackBlock = source.slice(
    source.indexOf("const goBack"),
    source.indexOf("// 拖拽事件")
  );
  const leaveGuardBlock = source.slice(
    source.indexOf("onBeforeRouteLeave"),
    source.indexOf("// 系统模板数据")
  );

  assert.match(
    goBackBlock,
    /savePaper\(\)\.then\(savedPaperId => \{[\s\S]*if \(savedPaperId !== null\) router\.back\(\)/
  );
  assert.match(
    leaveGuardBlock,
    /savePaper\(\)\.then\(savedPaperId => \{[\s\S]*savedPaperId === null \? next\(false\) : next\(\)/
  );
});

test("paper detail restores persisted editor configuration over defaults", () => {
  for (const field of ["settings", "antiCheat", "retake", "scoring"]) {
    assert.match(
      detailLoadBlock,
      new RegExp(
        `Object\\.assign\\(paper\\.${field}, data\\.${field} \\?\\? \\{\\}\\)`
      )
    );
    assert.doesNotMatch(
      detailLoadBlock,
      new RegExp(`paper\\.${field}\\s*=\\s*data\\.${field}`)
    );
  }
});

test("paper detail maps every backend question type into editor keys", () => {
  const expectedMappings = [
    ["SINGLE_CHOICE", "radio"],
    ["MULTIPLE_CHOICE", "checkbox"],
    ["TRUE_FALSE", "judge"],
    ["FILL_BLANK", "input"],
    ["SHORT_ANSWER", "textarea"],
    ["ESSAY", "textarea-essay"],
    ["MATRIX_SINGLE", "matrix-single"],
    ["MATRIX_MULTIPLE", "matrix-multiple"],
    ["MATCHING", "matching"],
    ["ORDERING", "ordering"],
    ["SLIDER", "slider"],
    ["NPS_RATING", "nps-rating"],
    ["STAR_RATING", "star-rating"],
    ["COMPOSITE", "composite"]
  ];

  for (const [enumKey, editorKey] of expectedMappings) {
    assert.match(
      loadBlock,
      new RegExp(`\\[QuestionType\\.${enumKey}\\]: "${editorKey}"`)
    );
  }
  assert.match(
    detailLoadBlock,
    /paper\.questionGroups = normalizeEditorQuestionGroups\(data\.questionGroups\)/
  );
});

test("question normalization preserves payloads and supplies editor aliases", () => {
  assert.match(
    loadBlock,
    /const question: Record<string, any> = \{ \.\.\.source, questionType \}/
  );
  assert.match(
    loadBlock,
    /const rows = preferQuestionArray\(source\.matrixRows, source\.rows\)/
  );
  assert.match(
    loadBlock,
    /const columns = preferQuestionArray\(source\.matrixCols, source\.columns\)/
  );
  assert.match(
    loadBlock,
    /question\.matrixRows = rows;[\s\S]*question\.rows = rows/
  );
  assert.match(
    loadBlock,
    /question\.matrixCols = columns;[\s\S]*question\.columns = columns/
  );
  assert.match(
    loadBlock,
    /preferQuestionArray\(source\.orderingItems, source\.items\)/
  );
  assert.match(
    loadBlock,
    /question\.orderingItems = items;[\s\S]*question\.items = items/
  );
  assert.match(loadBlock, /question\.matchingPairs = Array\.from/);
  assert.match(loadBlock, /question\.correctMatches = normalizeCorrectMatches/);
  assert.match(
    loadBlock,
    /question\.correctMatches \?\?[\s\S]*question\.correctAnswers \?\?[\s\S]*question\.correctAnswer/
  );
  assert.match(
    loadBlock,
    /source\.subQuestions\.map\(subQuestion =>[\s\S]*normalizeEditorQuestion\(subQuestion\)/
  );
  assert.match(
    loadBlock,
    /group\.questions\.map\(question =>[\s\S]*normalizeEditorQuestion\(question, groupQuestionType\)/
  );
  assert.match(
    saveBlock,
    /questionGroups: normalizeEditorQuestionGroups\(paper\.questionGroups\)/
  );
});
