import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(new URL("./remaining.ts", import.meta.url), "utf8");
const studentExamSource = await readFile(
  new URL("./studentExamCenter.ts", import.meta.url),
  "utf8"
);

test("student learning account route is not exposed to staff roles", () => {
  const accountRoute = source.match(
    /path: "\/account",[\s\S]*?roles: \[([^\]]+)\]/
  );
  assert.ok(accountRoute, "account route contract missing");
  assert.equal(accountRoute[1].replace(/\s+/g, ""), '"student"');
});

test("shared account settings route remains available to all three roles", () => {
  const settingsRoute = source.match(
    /path: "\/account-settings",[\s\S]*?roles: \[([^\]]+)\]/
  );
  assert.ok(settingsRoute, "account settings route contract missing");
  const roles = settingsRoute[1]
    .match(/"[^"]+"/g)
    ?.map(role => role.slice(1, -1));
  assert.deepEqual(roles, ["admin", "teacher", "student"]);
});

test("flattened student exam center children retain student access", () => {
  for (const path of [
    "/student-exam-center/list",
    "/student-exam-center/detail/:id"
  ]) {
    const escapedPath = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const route = studentExamSource.match(
      new RegExp(`path: "${escapedPath}",[\\s\\S]*?roles: \\[([^\\]]+)\\]`)
    );
    assert.ok(route, `${path} role contract missing`);
    assert.equal(route[1].replace(/\s+/g, ""), '"student"');
  }
});
