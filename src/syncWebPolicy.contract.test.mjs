import assert from "node:assert/strict";
import test from "node:test";
import { classifyWebCommit } from "../scripts/sync-web-policy.mjs";

test("known Web-only commits stay out of platform branches", () => {
  for (const hash of ["58f3aa2c", "13472e20", "ca70ce74", "989ac6a3"]) {
    assert.equal(classifyWebCommit({ hash }).webOnly, true);
  }
});

test("future Web-only commits require an explicit message marker", () => {
  assert.equal(
    classifyWebCommit({ subject: "fix: publish assets [web-only]" }).webOnly,
    true
  );
  assert.equal(classifyWebCommit({ body: "mobile-sync: no" }).webOnly, true);
  assert.equal(
    classifyWebCommit({ subject: "fix: shared course flow" }).webOnly,
    false
  );
});
