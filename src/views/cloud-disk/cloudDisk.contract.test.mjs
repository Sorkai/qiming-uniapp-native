import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import {
  formatCloudFileSize,
  normalizeCloudDiskPage,
  normalizeCloudDiskUpload,
  resolveCloudDiskFileUrl
} from "./cloudDiskRuntime.ts";

const readSource = relativePath =>
  readFile(new URL(relativePath, import.meta.url), "utf8");

test("normalizes the real enveloped file-list response without inventing dates", () => {
  const result = normalizeCloudDiskPage({
    code: 200,
    msg: "OK",
    data: {
      total: 1,
      fileList: [
        {
          fileId: 7,
          fileUrl: "https://files.example.test/lesson.pdf",
          fileName: "lesson",
          extension: "pdf",
          size: 1536,
          resourceType: "PDF"
        }
      ]
    }
  });

  assert.equal(result.total, 1);
  assert.deepEqual(result.files[0], {
    id: 7,
    name: "lesson.pdf",
    extension: "pdf",
    kind: "document",
    kindLabel: "文档",
    sizeBytes: 1536,
    sizeLabel: "1.50 KB",
    url: "https://files.example.test/lesson.pdf"
  });
  assert.equal("date" in result.files[0], false);
});

test("keeps a real empty response empty and rejects business errors", () => {
  assert.deepEqual(
    normalizeCloudDiskPage({ code: 200, data: { total: 0, fileList: [] } }),
    { total: 0, files: [] }
  );
  assert.throws(
    () => normalizeCloudDiskPage({ code: 403, msg: "没有权限" }),
    /没有权限/
  );
});

test("validates upload records and formats boundary file sizes", () => {
  assert.deepEqual(
    normalizeCloudDiskUpload({
      code: 200,
      data: { fileId: 9, url: "https://files.example.test/new.docx" }
    }),
    { fileId: 9, url: "https://files.example.test/new.docx" }
  );
  assert.throws(
    () => normalizeCloudDiskUpload({ code: 200, data: {} }),
    /有效文件记录/
  );
  assert.equal(formatCloudFileSize(0), "0 B");
  assert.equal(formatCloudFileSize(1024 * 1024), "1.00 MB");
});

test("resolves only safe http URLs for open, download and sharing", () => {
  assert.equal(
    resolveCloudDiskFileUrl("https://files.example.test/a b.pdf"),
    "https://files.example.test/a%20b.pdf"
  );
  assert.equal(
    resolveCloudDiskFileUrl("files/lesson.pdf", "https://api.example.test/edu"),
    "https://api.example.test/edu/files/lesson.pdf"
  );
  assert.equal(
    resolveCloudDiskFileUrl(
      "/files/lesson.pdf",
      "https://api.example.test/edu"
    ),
    "https://api.example.test/files/lesson.pdf"
  );

  for (const unsafeUrl of [
    "javascript:alert(1)",
    "data:text/html,unsafe",
    "file:///tmp/private.txt",
    "blob:https://example.test/id"
  ]) {
    assert.equal(resolveCloudDiskFileUrl(unsafeUrl), null);
  }
  assert.equal(resolveCloudDiskFileUrl("relative.pdf"), null);
});

test("all three role pages use the shared real cloud-disk workspace", async () => {
  const [teacher, student, admin, workspace, composable] = await Promise.all([
    readSource("./index.vue"),
    readSource("../account/components/CloudDisk.vue"),
    readSource("../online-disk/index.vue"),
    readSource("./CloudDiskWorkspace.vue"),
    readSource("./useCloudDisk.ts")
  ]);

  for (const source of [teacher, student, admin]) {
    assert.match(source, /CloudDiskWorkspace/);
    assert.doesNotMatch(source, /aiedu-api\.intelledu\.cn\/files/);
  }

  assert.match(composable, /getFileList\(\{ pageNum: nextPage, pageSize \}\)/);
  assert.match(composable, /await uploadFile\(formData\)/);
  assert.match(composable, /resolveCloudDiskFileUrl/);
  assert.doesNotMatch(composable, /window\.open\(file\.url/);
  assert.doesNotMatch(composable, /link\.href\s*=\s*file\.url/);
  assert.doesNotMatch(composable, /writeText\(file\.url\)/);
  assert.doesNotMatch(
    composable,
    /splice\(|files\.value\s*=\s*files\.value\.filter/
  );
  assert.match(workspace, /删除功能尚未接入后端/);
  assert.match(workspace, /disabled/);
  assert.match(workspace, /min-height: 44px/);
  assert.match(workspace, /max\(8px, env\(safe-area-inset-right/);
});

test("standalone and student notifications share the honest unavailable state", async () => {
  const [standalone, student, unavailableState] = await Promise.all([
    readSource("../system-notification/index.vue"),
    readSource("../account/components/SystemNotification.vue"),
    readSource("../system-notification/NotificationUnavailable.vue")
  ]);

  assert.match(standalone, /NotificationUnavailable/);
  assert.match(student, /NotificationUnavailable/);
  assert.match(unavailableState, /通知服务尚未接入/);
  assert.match(unavailableState, /不展示模拟通知/);

  for (const source of [standalone, student, unavailableState]) {
    assert.doesNotMatch(source, /2025\//);
    assert.doesNotMatch(source, /notificationList/);
    assert.doesNotMatch(source, /系统维护通知/);
  }
});
