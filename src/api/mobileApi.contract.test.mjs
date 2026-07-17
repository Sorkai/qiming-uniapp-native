import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  adaptBackendCourseListToPaperOptions,
  adaptUserDetailToMine
} from "./mobileApiAdapters.js";
import { normalizeExamPaperResponse } from "./examPaperResponse.js";

const apiDir = dirname(fileURLToPath(import.meta.url));
const readApi = fileName => readFileSync(resolve(apiDir, fileName), "utf8");

test("account profile keeps the legacy shape over the canonical user detail API", () => {
  const source = readApi("user.ts");

  assert.doesNotMatch(source, /http\.request<UserInfoResult>\("get", "\/mine"/);
  assert.match(source, /export const getMine[\s\S]*?getUserDetail\(\)\.then\(/);
  assert.match(source, /adaptUserDetailToMine/);

  assert.deepEqual(
    adaptUserDetailToMine({
      code: 200,
      data: {
        userInfo: {
          mobile: "13111111113",
          nickname: "教师",
          avatar: "avatar.png",
          info: "授课教师"
        }
      }
    }),
    {
      success: true,
      data: {
        avatar: "avatar.png",
        username: "13111111113",
        nickname: "教师",
        email: "",
        phone: "13111111113",
        description: "授课教师"
      }
    }
  );
});

test("exam-paper course options use the real course endpoint and adapt fields", () => {
  const source = readApi("examPaper.ts");

  assert.doesNotMatch(source, /\/edu\/backend\/v1\/paper\/course\/list/);
  assert.match(source, /\/edu\/backend\/v1\/course\/list/);
  assert.match(source, /pageNum: params\.pageNum \?\? 1/);
  assert.match(source, /pageSize: params\.pageSize \?\? 1000/);
  assert.match(source, /adaptBackendCourseListToPaperOptions/);

  assert.deepEqual(
    adaptBackendCourseListToPaperOptions(
      normalizeExamPaperResponse({
        code: 200,
        msg: "ok",
        data: {
          courseList: [
            { courseId: 7, title: "数据结构" },
            { courseId: 11, title: "操作系统" }
          ]
        }
      })
    ),
    {
      code: 0,
      msg: "ok",
      data: [
        { id: 7, name: "数据结构" },
        { id: 11, name: "操作系统" }
      ]
    }
  );

  assert.deepEqual(
    adaptBackendCourseListToPaperOptions({ code: 0, msg: "ok" }),
    { code: 0, msg: "ok", data: [] }
  );
});
