import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { normalizeExamPaperResponse } from "./examPaperResponse.js";

test("normalizes the AiEdu 200 success envelope to the exam-paper contract", () => {
  const data = { paperId: 42 };
  const response = normalizeExamPaperResponse({ code: 200, msg: "OK", data });

  assert.deepEqual(response, { code: 0, msg: "OK", data });
});

test("preserves legacy success and business error envelopes", () => {
  const legacySuccess = { code: 0, msg: "ok", data: { paperId: 7 } };
  const businessError = { code: 40001, msg: "invalid", data: null };

  assert.strictEqual(normalizeExamPaperResponse(legacySuccess), legacySuccess);
  assert.strictEqual(normalizeExamPaperResponse(businessError), businessError);
});

test("all exam-paper requests pass through the response normalizer", () => {
  const source = readFileSync(
    new URL("./examPaper.ts", import.meta.url),
    "utf8"
  );
  const normalizedCalls = source.match(/examPaperHttp\s*\.\s*request/g) || [];
  const rawCalls = source.match(/http\.request/g) || [];

  assert.ok(normalizedCalls.length >= 68);
  assert.equal(rawCalls.length, 0);
  assert.match(source, /\.then\(normalizeExamPaperResponse\)/);
});
