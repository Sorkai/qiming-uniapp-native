import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(
  new URL("./LoginDialog.vue", import.meta.url),
  "utf8"
);

test("home login maps backend role types before routing", () => {
  assert.match(source, /case 1:[\s\S]*return \["student"\]/);
  assert.match(source, /case 2:[\s\S]*return \["teacher"\]/);
  assert.match(source, /case 3:[\s\S]*return \["admin"\]/);
  assert.match(source, /roles: rolesForRoleType\(userInfo\.roleType\)/);
  assert.doesNotMatch(source, /roles:\s*\["admin"\]/);
});

test("home login requires user detail before reporting success", () => {
  assert.equal(source.match(/roles: \[\]/g)?.length, 2);
  assert.equal(source.match(/if \(!detail\?\.data\?\.userInfo\)/g)?.length, 2);
  assert.equal(source.match(/removeToken\(\);/g)?.length, 2);
  assert.match(
    source,
    /const detail = await fetchUserDetail\(\);[\s\S]*removeToken\(\);[\s\S]*message\(t\("login\.pureLoginSuccess"\)/
  );
  assert.match(
    source,
    /const detail = await fetchUserDetail\(\);[\s\S]*removeToken\(\);[\s\S]*ElMessage\.success\("注册成功，已自动登录"\)/
  );
});
