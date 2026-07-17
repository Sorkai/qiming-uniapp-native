import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  buildGradingAnswerDrafts,
  flattenPaperQuestions,
  formatGradingAnswer,
  getFrozenSnapshotQuestions,
  getUnmatchedAnswerIds,
  isGradeScoreValid,
  isObjectiveQuestionType
} from "./gradingRuntime.ts";

test("paper questions are flattened in group and question order", () => {
  const questions = flattenPaperQuestions([
    {
      sortOrder: 2,
      questions: [
        { questionId: 3, questionType: 5, points: 10, sortOrder: 2 },
        { questionId: 2, questionType: 1, points: 5, sortOrder: 1 }
      ]
    },
    {
      sortOrder: 1,
      questions: [
        { questionId: 1, questionType: "radio", points: 5, sortOrder: 1 }
      ]
    }
  ]);

  assert.deepEqual(
    questions.map(question => question.questionId),
    [1, 2, 3]
  );
});

test("submission answers are merged without inventing missing scores", () => {
  const questions = [
    { questionId: 1, questionType: 1, points: 5 },
    { questionId: 2, questionType: 5, points: 10 }
  ];
  const drafts = buildGradingAnswerDrafts(questions, [
    {
      questionId: 1,
      answer: "B",
      score: 5,
      comment: "客观题正确",
      isCorrect: true
    }
  ]);

  assert.equal(drafts[0].score, 5);
  assert.equal(drafts[0].isCorrect, true);
  assert.equal(drafts[1].answer, null);
  assert.equal(drafts[1].score, null);
  assert.equal(drafts[1].comment, "");
});

test("grading is blocked without a frozen paper snapshot", () => {
  assert.throws(
    () => getFrozenSnapshotQuestions(undefined),
    /缺少冻结试卷快照/
  );
  assert.throws(
    () => getFrozenSnapshotQuestions({ questionGroups: [] }),
    /快照中没有题目/
  );
});

test("grading questions come from the frozen snapshot only", () => {
  const currentPaperQuestionId = 101;
  const frozenQuestions = getFrozenSnapshotQuestions({
    questionGroups: [
      {
        sortOrder: 1,
        questions: [
          { questionId: 901, questionType: 1, points: 8, sortOrder: 1 }
        ]
      }
    ]
  });

  assert.deepEqual(
    frozenQuestions.map(question => question.questionId),
    [901]
  );
  assert.equal(
    frozenQuestions.some(
      question => question.questionId === currentPaperQuestionId
    ),
    false
  );
});

test("grading validation rejects missing and out-of-range scores", () => {
  assert.equal(isGradeScoreValid(null, 10), false);
  assert.equal(isGradeScoreValid(-1, 10), false);
  assert.equal(isGradeScoreValid(11, 10), false);
  assert.equal(isGradeScoreValid(0, 10), true);
  assert.equal(isGradeScoreValid(10, 10), true);
});

test("question classification, unmatched answers and structured display are stable", () => {
  [1, 2, 3, 4, 7, 8, 9, 10].forEach(questionType => {
    assert.equal(
      isObjectiveQuestionType(questionType),
      true,
      `backend auto-grade type ${questionType} should stay objective`
    );
  });
  [5, 6, 11, 12, 13, 14].forEach(questionType => {
    assert.equal(
      isObjectiveQuestionType(questionType),
      false,
      `manual grade type ${questionType} must not be auto-graded`
    );
  });
  assert.equal(isObjectiveQuestionType("input"), true);
  assert.equal(isObjectiveQuestionType("slider"), false);
  assert.equal(isObjectiveQuestionType("nps-rating"), false);
  assert.equal(isObjectiveQuestionType("star-rating"), false);
  assert.deepEqual(
    getUnmatchedAnswerIds(
      [{ questionId: 1, questionType: 1, points: 5 }],
      [
        { questionId: 1, answer: "A" },
        { questionId: 9, answer: "B" }
      ]
    ),
    [9]
  );
  assert.equal(
    formatGradingAnswer({ 第一空: "A", 第二空: ["B", "C"] }),
    "第一空：A；第二空：B，C"
  );
});

test("grading detail stays wired to real APIs and contains no seeded records", async () => {
  const source = await readFile(
    new URL("./detail.vue", import.meta.url),
    "utf8"
  );
  const requiredCalls = [
    "getPaperDetail(",
    "getSubmissionList(",
    "getSubmissionDetail(",
    "submitGrade(",
    "autoGradeObjective(",
    "releaseScores("
  ];
  const requiredSnapshotGuards = [
    "getFrozenSnapshotQuestions(data.paperSnapshot)",
    "snapshotQuestions,",
    "答卷题目与试卷版本不一致"
  ];
  const requiredLeaveGuards = [
    "onBeforeRouteLeave(async () =>",
    "onBeforeRouteUpdate(async (to, from) =>",
    'window.addEventListener("beforeunload"',
    'window.removeEventListener("beforeunload"'
  ];
  const requiredMobileGuards = [
    "@media (width <= 640px)",
    "min-height: 44px",
    "min-width: 44px",
    "overflow-x: hidden",
    "overflow-x: auto",
    "overflow-wrap: anywhere"
  ];

  requiredCalls.forEach(snippet => {
    assert.equal(
      source.includes(snippet),
      true,
      `missing API wiring: ${snippet}`
    );
  });
  requiredSnapshotGuards.forEach(snippet => {
    assert.equal(
      source.includes(snippet),
      true,
      `missing frozen snapshot wiring: ${snippet}`
    );
  });
  assert.equal(
    source.includes("paper.value?.questionGroups"),
    false,
    "current paper questions must never be used as a grading fallback"
  );
  requiredLeaveGuards.forEach(snippet => {
    assert.equal(
      source.includes(snippet),
      true,
      `missing unsaved-change guard: ${snippet}`
    );
  });
  requiredMobileGuards.forEach(snippet => {
    assert.equal(
      source.includes(snippet),
      true,
      `missing mobile grading guard: ${snippet}`
    );
  });
  assert.equal(
    source.includes('? "客观题" : "人工批改"'),
    true,
    "manual-grade questions must be labelled explicitly"
  );
  ["陈明轩", "林若彤", "setTimeout(resolve"].forEach(snippet => {
    assert.equal(
      source.includes(snippet),
      false,
      `seeded data remains: ${snippet}`
    );
  });
});
