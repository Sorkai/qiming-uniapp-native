import assert from "node:assert/strict";
import test from "node:test";

import { onRequest } from "../edge-functions/mindmap-file/[[default]].js";

test("EdgeOne file proxy forwards only safe reads to the fixed file origin", async () => {
  let upstreamRequest;
  const response = await onRequest({
    request: new Request(
      "https://aiedu-mp.intelledu.cn/mindmap-file/demo-resources/course/exercise-set.json?version=2",
      {
        headers: {
          Accept: "application/json",
          Authorization: "Bearer private-token",
          Cookie: "private-cookie=1",
          Range: "bytes=0-127"
        }
      }
    ),
    fetch: async request => {
      upstreamRequest = request;
      return new Response('{"title":"练习题集"}', {
        status: 206,
        headers: {
          "Content-Range": "bytes 0-127/512",
          "Content-Type": "application/json"
        }
      });
    }
  });

  assert.equal(
    upstreamRequest.url,
    "https://aiedu-file.intelledu.cn/demo-resources/course/exercise-set.json?version=2"
  );
  assert.equal(upstreamRequest.headers.get("accept"), "application/json");
  assert.equal(upstreamRequest.headers.get("range"), "bytes=0-127");
  assert.equal(upstreamRequest.headers.get("authorization"), null);
  assert.equal(upstreamRequest.headers.get("cookie"), null);
  assert.equal(response.status, 206);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.equal(response.headers.get("content-range"), "bytes 0-127/512");
  assert.equal(await response.text(), '{"title":"练习题集"}');
});

test("EdgeOne file proxy answers CORS preflight without contacting upstream", async () => {
  let called = false;
  const response = await onRequest({
    request: new Request(
      "https://aiedu-mp.intelledu.cn/mindmap-file/demo.json",
      { method: "OPTIONS" }
    ),
    fetch: async () => {
      called = true;
      throw new Error("unexpected fetch");
    }
  });

  assert.equal(response.status, 204);
  assert.equal(called, false);
  assert.match(
    response.headers.get("access-control-allow-methods") || "",
    /GET/
  );
});

test("EdgeOne file proxy rejects writes and malformed proxy paths", async () => {
  for (const request of [
    new Request("https://aiedu-mp.intelledu.cn/mindmap-file/demo.json", {
      method: "POST"
    }),
    new Request(
      "https://aiedu-mp.intelledu.cn/mindmap-file//untrusted.example/file"
    )
  ]) {
    let called = false;
    const response = await onRequest({
      request,
      fetch: async () => {
        called = true;
        throw new Error("unexpected fetch");
      }
    });
    assert.equal(called, false);
    assert.ok([400, 405].includes(response.status));
    assert.equal(response.headers.get("access-control-allow-origin"), "*");
  }
});

test("EdgeOne file proxy refuses redirects away from the fixed file origin", async () => {
  const response = await onRequest({
    request: new Request(
      "https://aiedu-mp.intelledu.cn/mindmap-file/redirect.json"
    ),
    fetch: async () =>
      new Response(null, {
        status: 302,
        headers: { Location: "https://untrusted.example/file.json" }
      })
  });

  assert.equal(response.status, 502);
  assert.equal(response.headers.get("access-control-allow-origin"), "*");
  assert.match(await response.text(), /Unsafe upstream redirect/);
});
