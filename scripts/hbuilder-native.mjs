#!/usr/bin/env node

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { platform as hostPlatform } from "node:os";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const argv = process.argv.slice(2);

const readArg = (name, fallback = "") => {
  const index = argv.indexOf(name);
  return index >= 0 && argv[index + 1] ? argv[index + 1] : fallback;
};
const hasFlag = name => argv.includes(name);

function printUsage() {
  process.stdout.write(
    `Usage: node scripts/hbuilder-native.mjs --platform <android|ios> [options]\n\nOptions:\n  --device <id>       Android adb serial or iOS device id\n  --project <path>    uni-app project (default: native-app)\n  --cli <path>        HBuilderX CLI path\n  --native-log <bool> Enable Android native logs (default: true)\n  --self-test         Print the resolved launch command without running it\n  -h, --help          Show this help\n`
  );
}

if (hasFlag("-h") || hasFlag("--help")) {
  printUsage();
  process.exit(0);
}

const targetPlatform = readArg("--platform");
if (!["android", "ios"].includes(targetPlatform)) {
  throw new Error("--platform must be android or ios");
}

const project = resolve(readArg("--project", resolve(root, "native-app")));
const defaultCli =
  hostPlatform() === "darwin"
    ? "/Applications/HBuilderX.app/Contents/MacOS/cli"
    : resolve(
        process.env.HBUILDERX_HOME || "C:/Program Files/HBuilderX",
        "cli.exe"
      );
const cli = resolve(readArg("--cli", process.env.HBUILDERX_CLI || defaultCli));

function detectAndroidDevice() {
  const output = execFileSync(process.env.ADB || "adb", ["devices"], {
    encoding: "utf8"
  });
  const devices = output
    .split(/\r?\n/)
    .slice(1)
    .map(line => line.trim().split(/\s+/))
    .filter(parts => parts.length >= 2 && parts[1] === "device")
    .map(parts => parts[0]);
  if (devices.length !== 1) {
    throw new Error(
      `Expected exactly one authorized Android device, found ${devices.length}`
    );
  }
  return devices[0];
}

let device = readArg("--device", process.env.HBUILDERX_DEVICE_ID || "");
if (!device && targetPlatform === "android" && !hasFlag("--self-test")) {
  device = detectAndroidDevice();
}

const commandArgs = [
  "launch",
  targetPlatform === "android" ? "app-android" : "app-ios",
  "--project",
  project
];
if (device) commandArgs.push("--deviceId", device);
if (targetPlatform === "android") {
  commandArgs.push(
    "--playground",
    readArg("--playground", "standard"),
    "--native-log",
    readArg("--native-log", "true")
  );
}

if (hasFlag("--self-test")) {
  process.stdout.write(
    `${JSON.stringify({ ok: true, cli, commandArgs }, null, 2)}\n`
  );
  process.exit(0);
}

if (!existsSync(cli)) throw new Error(`HBuilderX CLI not found: ${cli}`);
if (!existsSync(project))
  throw new Error(`uni-app project not found: ${project}`);
if (!device) throw new Error(`No ${targetPlatform} device id was provided`);

const result = spawnSync(cli, commandArgs, { stdio: "inherit" });
if (result.error) throw result.error;
process.exit(result.status ?? 1);
