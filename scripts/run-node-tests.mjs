import { spawnSync } from "node:child_process";
import { readdirSync } from "node:fs";
import { join } from "node:path";

const testFiles = [];

function collectTests(directory) {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) collectTests(path);
    if (entry.isFile() && entry.name.endsWith(".test.mjs")) {
      testFiles.push(path);
    }
  }
}

collectTests("src");
testFiles.sort();

if (testFiles.length === 0) {
  throw new Error("No Node test files found under src");
}

const result = spawnSync(process.execPath, ["--test", ...testFiles], {
  stdio: "inherit"
});

if (result.error) throw result.error;
process.exitCode = result.status ?? 1;
