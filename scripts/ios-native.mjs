#!/usr/bin/env node

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import { arch } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const iosRoot = join(repoRoot, "ios-native");
const sourceRoot = join(iosRoot, "Sources", "QimingApp");
const manifestPath = join(repoRoot, "native-app", "src", "manifest.json");
const resourceSource = join(repoRoot, "native-app", "src", "hybrid", "html");
const logoSource = join(repoRoot, "native-app", "src", "static", "logo.png");
const artifactRoot = join(repoRoot, "artifacts", "ios-native");
const simulatorBuildRoot = join(artifactRoot, "build", "simulator");
const deviceBuildRoot = join(artifactRoot, "build", "device");
const appName = "QimingIntellEdu";
const moduleName = "QimingIntellEdu";
const minimumIosVersion = "15.0";
const requiredPrivacyKeys = [
  "NSCameraUsageDescription",
  "NSMicrophoneUsageDescription",
  "NSPhotoLibraryUsageDescription",
  "NSPhotoLibraryAddUsageDescription"
];
const sourceFiles = [
  join(sourceRoot, "AppDelegate.swift"),
  join(sourceRoot, "SceneDelegate.swift"),
  join(sourceRoot, "QimingWebViewController.swift")
];

const argv = process.argv.slice(2);
const command =
  argv[0] === "--help" || argv[0] === "-h"
    ? argv.shift()
    : argv[0] && !argv[0].startsWith("-")
      ? argv.shift()
      : "check";
const flags = parseFlags(argv);
const manifest = readManifest();
const iosManifest = manifest?.["app-plus"]?.distribute?.ios || {};
const bundleId = String(iosManifest.bundleIdentifier || "").trim();
const dcloudAppId = String(
  process.env.QIMING_DCLOUD_APPID || manifest.appid || ""
).trim();
const versionName = String(manifest.versionName || "1.0.0");
const versionCode = String(manifest.versionCode || "100");

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

async function main() {
  validateKnownFlags();
  switch (command) {
    case "check":
      staticCheck();
      return;
    case "app-plus-check":
      validateManifestMetadata();
      appPlusCheck();
      return;
    case "doctor":
      doctor();
      return;
    case "build-simulator":
      staticCheck();
      buildSimulator();
      return;
    case "run-simulator":
      staticCheck();
      buildSimulator();
      runSimulator();
      return;
    case "package-simulator":
      staticCheck();
      buildSimulator();
      packageSimulator();
      return;
    case "profiles":
      validateManifestMetadata();
      listProfiles();
      return;
    case "package-device":
      staticCheck();
      packageDevice();
      return;
    case "self-test":
      selfTest();
      return;
    case "help":
    case "--help":
    case "-h":
      printHelp();
      return;
    default:
      throw new Error(`Unknown iOS native command: ${command}`);
  }
}

function readManifest() {
  ensureFile(manifestPath, "native-app/src/manifest.json is missing.");
  try {
    return JSON.parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    throw new Error(
      `native-app/src/manifest.json is invalid JSON: ${
        error instanceof Error ? error.message : error
      }`
    );
  }
}

function staticCheck() {
  const appIdStatus = validateManifestMetadata({
    requireDCloudAppId: hasFlag("require-dcloud-appid")
  });
  ensureFile(
    join(resourceSource, "index.html"),
    "Offline H5 bundle is missing. Run pnpm native:prepare first."
  );
  ensureFile(
    join(resourceSource, "qiming-native-bridge.js"),
    "Native bridge is missing from the offline H5 bundle."
  );
  ensureFile(
    join(resourceSource, "qiming-native-compat.js"),
    "Native compatibility script is missing from the offline H5 bundle."
  );
  ensureFile(logoSource, "native-app/src/static/logo.png is missing.");
  for (const sourceFile of sourceFiles)
    ensureFile(sourceFile, `Missing iOS source: ${sourceFile}`);

  const webViewSource = readFileSync(sourceFiles[2], "utf8");
  if (/demoRole|qiming-demo-role/.test(webViewSource)) {
    throw new Error(
      "The iOS production shell must not inject a demo role or demo session."
    );
  }
  const plist = renderInfoPlist();
  if (plist.includes("NSAllowsArbitraryLoads")) {
    throw new Error(
      "The generated Info.plist must not disable App Transport Security."
    );
  }
  const plistLint = spawnSync("plutil", ["-lint", "-"], {
    cwd: repoRoot,
    encoding: "utf8",
    input: plist
  });
  if (plistLint.error) {
    throw new Error(`plutil is unavailable: ${plistLint.error.message}`);
  }
  if (plistLint.status !== 0) {
    throw new Error(
      (
        plistLint.stderr ||
        plistLint.stdout ||
        "Generated Info.plist is invalid."
      ).trim()
    );
  }
  const swiftParse = spawnSync("xcrun", ["swiftc", "-parse", ...sourceFiles], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024
  });
  if (swiftParse.error) {
    throw new Error(`xcrun is unavailable: ${swiftParse.error.message}`);
  }
  if (swiftParse.status !== 0) {
    throw new Error(
      (
        swiftParse.stderr ||
        swiftParse.stdout ||
        "The iOS Swift sources failed syntax parsing."
      ).trim()
    );
  }

  const resourceFiles = countFiles(resourceSource);
  console.log(
    `iOS shell check OK: ${bundleId} ${versionName} (${versionCode})`
  );
  console.log(
    `Apple bundle id: syntax OK; registration and ownership are not verified without a matching provisioning profile.`
  );
  if (appIdStatus.kind === "configured") {
    console.log(`DCloud AppID: configured (${appIdStatus.value})`);
  } else {
    console.log(
      `DCloud AppID: ${appIdStatus.kind} (${appIdStatus.value || "empty"}); standalone ios-native shell checks are unaffected, but HBuilderX/App-Plus packaging is blocked.`
    );
  }
  console.log(`Offline bundle: ${resourceFiles} files at ${resourceSource}`);
  console.log("Production login: real /login route, no injected demo identity");
  console.log(
    "App Transport Security: strict HTTPS (no arbitrary-load exception)"
  );
  console.log(
    "Swift validation: syntax parse only; UIKit linking and iOS runtime still require full Xcode."
  );
}

function validateManifestMetadata({ requireDCloudAppId = false } = {}) {
  const failures = [];
  if (!bundleId) {
    failures.push(
      "The iOS bundleIdentifier is missing from native-app/src/manifest.json."
    );
  } else if (!isValidBundleId(bundleId)) {
    failures.push(
      `The iOS bundleIdentifier is not a valid concrete Apple bundle id: ${bundleId}`
    );
  }
  if (!/^\d+(?:\.\d+){0,2}$/.test(versionName)) {
    failures.push(
      `versionName must contain one to three numeric components for CFBundleShortVersionString: ${versionName}`
    );
  }
  if (!/^\d+(?:\.\d+){0,2}$/.test(versionCode)) {
    failures.push(
      `versionCode must be a numeric Apple build version: ${versionCode}`
    );
  }
  const privacy = iosManifest.privacyDescription || {};
  for (const key of requiredPrivacyKeys) {
    if (!String(privacy[key] || "").trim()) {
      failures.push(`Missing non-empty iOS privacy description: ${key}`);
    }
  }

  const appIdStatus = classifyDCloudAppId(dcloudAppId);
  if (requireDCloudAppId && appIdStatus.kind !== "configured") {
    failures.push(dcloudAppIdFailure(appIdStatus));
  }
  if (failures.length) {
    throw new Error(
      [
        "iOS manifest preflight failed:",
        ...failures.map(item => `- ${item}`)
      ].join("\n")
    );
  }
  return appIdStatus;
}

function isValidBundleId(value) {
  return (
    value.length <= 255 &&
    /^[A-Za-z0-9][A-Za-z0-9-]*(?:\.[A-Za-z0-9][A-Za-z0-9-]*)+$/.test(value) &&
    !value.includes("..") &&
    !/[*.]/.test(value.slice(-1))
  );
}

function classifyDCloudAppId(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return { kind: "missing", value: "" };
  const suffix = normalized.replace(/^__UNI__/i, "");
  if (
    !normalized.startsWith("__UNI__") ||
    !/^[A-Za-z0-9]{6,32}$/.test(suffix)
  ) {
    return { kind: "invalid", value: normalized };
  }
  if (/^(?:QIMING|APPID|PLACEHOLDER|DEMO|TEST|X+|0+)$/i.test(suffix)) {
    return { kind: "placeholder", value: normalized };
  }
  return { kind: "configured", value: normalized };
}

function dcloudAppIdFailure(status) {
  const current = status.value || "empty";
  return `DCloud AppID is ${status.kind} (${current}). Supply the real value through QIMING_DCLOUD_APPID or the existing local packaging config; do not commit credentials or invent an AppID.`;
}

function doctor() {
  const target = getString("target", "all");
  if (!new Set(["all", "simulator", "device", "app-plus"]).has(target)) {
    throw new Error(
      `Unknown doctor target: ${target}. Use all, simulator, device, or app-plus.`
    );
  }
  if (target === "app-plus") validateManifestMetadata();
  else staticCheck();
  const report = collectToolchainReport({
    includeApple: target !== "app-plus",
    includeSigning: target === "all" || target === "device",
    includeAppPlus: target === "all" || target === "app-plus"
  });
  printToolchainReport(report, target);

  const failures = [];
  if (target === "all" || target === "simulator") {
    failures.push(
      ...simulatorPreflightFailures(report, { includeRuntime: true })
    );
  }
  if (target === "all" || target === "device") {
    failures.push(
      ...devicePreflightFailures(report, { includeCredentials: true })
    );
  }
  if (target === "all" || target === "app-plus") {
    failures.push(...appPlusPreflightFailures(report));
  }
  const uniqueFailures = [...new Set(failures)];
  if (uniqueFailures.length) {
    throw new Error(
      [
        `iOS ${target} preflight is blocked:`,
        ...uniqueFailures.map(item => `- ${item}`),
        "No simulator app, signed IPA, or App-Plus package was produced by doctor."
      ].join("\n")
    );
  }
  console.log(`iOS ${target} preflight OK`);
}

function appPlusCheck() {
  const report = collectToolchainReport({
    includeApple: false,
    includeSigning: false,
    includeAppPlus: true
  });
  printToolchainReport(report, "app-plus");
  const failures = appPlusPreflightFailures(report);
  if (failures.length) {
    throw new Error(
      [
        "HBuilderX/App-Plus iOS preflight is blocked:",
        ...failures.map(item => `- ${item}`)
      ].join("\n")
    );
  }
  console.log("HBuilderX/App-Plus iOS preflight OK");
}

function collectToolchainReport({
  includeApple = true,
  includeSigning = true,
  includeAppPlus = true
} = {}) {
  const developerDir = includeApple
    ? captureOptional("xcode-select", ["-p"])
    : "";
  const identities = includeSigning ? listSigningIdentities() : [];
  const profiles = includeSigning ? findMatchingProfiles() : [];
  const usableProfiles = profiles.filter(
    profile => profileValidationFailures(profile).length === 0
  );
  const hbuilderCli = includeAppPlus ? resolveHBuilderCli() : "";
  const hbuilderVersion = hbuilderCli
    ? stripAnsi(captureOptional(hbuilderCli, ["--version"]))
    : "";
  const hbuilderUserRaw = hbuilderCli
    ? stripAnsi(captureOptional(hbuilderCli, ["user", "info"]))
    : "";
  const hbuilderUser = hbuilderUserRaw
    .replace(/^\s*\d+:user info:OK\s*$/gim, "")
    .trim();
  return {
    developerDir,
    fullXcodeSelected: /\/Xcode(?:-[^/]+)?\.app\/Contents\/Developer$/.test(
      developerDir
    ),
    xcodebuildVersion: includeApple
      ? captureOptional("xcodebuild", ["-version"])
      : "",
    simulatorSdk: includeApple
      ? captureOptional("xcrun", [
          "--sdk",
          "iphonesimulator",
          "--show-sdk-path"
        ])
      : "",
    deviceSdk: includeApple
      ? captureOptional("xcrun", ["--sdk", "iphoneos", "--show-sdk-path"])
      : "",
    simctlPath: includeApple
      ? captureOptional("xcrun", ["--find", "simctl"])
      : "",
    iosSwiftcPath: includeApple
      ? captureOptional("xcrun", ["--find", "swiftc"])
      : "",
    identities,
    profiles,
    usableProfiles,
    hbuilderCli,
    hbuilderVersion,
    hbuilderUser,
    appIdStatus: classifyDCloudAppId(dcloudAppId)
  };
}

function printToolchainReport(report, target) {
  console.log(`iOS doctor target: ${target}`);
  if (target !== "app-plus") {
    console.log(
      `Developer directory: ${report.developerDir || "unavailable"} (${report.fullXcodeSelected ? "full Xcode" : "not full Xcode"})`
    );
    console.log(
      `xcodebuild: ${firstLine(report.xcodebuildVersion) || "unavailable"}`
    );
  }
  if (target === "all" || target === "simulator") {
    console.log(`Simulator SDK: ${report.simulatorSdk || "unavailable"}`);
    console.log(`simctl: ${report.simctlPath || "unavailable"}`);
  }
  if (target === "all" || target === "device") {
    console.log(`iPhoneOS SDK: ${report.deviceSdk || "unavailable"}`);
    console.log(`Code-signing identities: ${report.identities.length}`);
    console.log(
      `Matching provisioning profiles: ${report.profiles.length} (${report.usableProfiles.length} usable for this command)`
    );
  }
  if (target === "all" || target === "app-plus") {
    console.log(
      `HBuilderX CLI: ${report.hbuilderCli ? `${report.hbuilderCli} ${firstLine(report.hbuilderVersion)}` : "unavailable"}`
    );
    console.log(
      `HBuilderX account: ${report.hbuilderUser ? "identity returned" : "not logged in or identity unavailable"}`
    );
    console.log(
      `DCloud AppID: ${report.appIdStatus.kind} (${report.appIdStatus.value || "empty"})`
    );
  }
}

function simulatorPreflightFailures(report, { includeRuntime = false } = {}) {
  const failures = [];
  if (!report.fullXcodeSelected) {
    failures.push(fullXcodeFailure(report.developerDir));
  }
  if (!report.xcodebuildVersion) {
    failures.push("xcodebuild cannot load a full Xcode toolchain.");
  }
  if (!report.simulatorSdk) {
    failures.push("The iPhone Simulator SDK is unavailable.");
  }
  if (!report.iosSwiftcPath) {
    failures.push("The Xcode Swift compiler is unavailable through xcrun.");
  }
  if (includeRuntime && !report.simctlPath) {
    failures.push(
      "simctl is unavailable, so no iOS Simulator can be installed or launched."
    );
  }
  return failures;
}

function devicePreflightFailures(report, { includeCredentials = false } = {}) {
  const failures = [];
  if (!report.fullXcodeSelected) {
    failures.push(fullXcodeFailure(report.developerDir));
  }
  if (!report.xcodebuildVersion) {
    failures.push("xcodebuild cannot load a full Xcode toolchain.");
  }
  if (!report.deviceSdk) {
    failures.push("The iPhoneOS SDK is unavailable.");
  }
  if (!report.iosSwiftcPath) {
    failures.push("The Xcode Swift compiler is unavailable through xcrun.");
  }
  if (includeCredentials) {
    if (!report.identities.length) {
      failures.push(
        "Keychain contains no valid Apple Development or Apple Distribution code-signing identity."
      );
    }
    const explicitProfile = getString(
      "profile",
      process.env.IOS_PROVISIONING_PROFILE || ""
    );
    if (!explicitProfile && !report.usableProfiles.length) {
      failures.push(
        `No usable installed provisioning profile matches ${bundleId}. Pass --profile or set IOS_PROVISIONING_PROFILE after obtaining a real profile.`
      );
    } else if (explicitProfile) {
      const profilePath = resolve(repoRoot, explicitProfile);
      if (!existsSync(profilePath) || !statSync(profilePath).isFile()) {
        failures.push(`Provisioning profile not found: ${profilePath}`);
      } else {
        try {
          const profile = decodeProfile(
            profilePath,
            join(artifactRoot, "preflight", "explicit-profile")
          );
          const profileFailures = profileValidationFailures(profile);
          failures.push(...profileFailures);
          if (!profileFailures.length && report.identities.length) {
            try {
              resolveIdentity(profile, report.identities);
            } catch (error) {
              failures.push(
                `Signing identity validation failed: ${
                  error instanceof Error ? error.message : error
                }`
              );
            }
          }
        } catch (error) {
          failures.push(
            `Provisioning profile validation failed: ${
              error instanceof Error ? error.message : error
            }`
          );
        }
      }
    } else if (report.usableProfiles.length && report.identities.length) {
      const identityMatchesProfile = report.usableProfiles.some(profile => {
        try {
          resolveIdentity(profile, report.identities);
          return true;
        } catch {
          return false;
        }
      });
      if (!identityMatchesProfile) {
        failures.push(
          `No valid Keychain signing identity matches the Team ID and type of the installed ${bundleId} profiles.`
        );
      }
    }
  }
  return failures;
}

function appPlusPreflightFailures(report) {
  const failures = [];
  if (report.appIdStatus.kind !== "configured") {
    failures.push(dcloudAppIdFailure(report.appIdStatus));
  }
  if (!report.hbuilderCli) {
    failures.push("HBuilderX CLI is unavailable.");
  } else if (!report.hbuilderUser) {
    failures.push(
      "HBuilderX CLI returned no signed-in DCloud account identity; cloud packaging requires an authenticated account."
    );
  }
  return failures;
}

function fullXcodeFailure(developerDir) {
  return `Full Xcode is not selected (current developer directory: ${developerDir || "unavailable"}). Install/finish Xcode separately, launch it once, then select /Applications/Xcode.app/Contents/Developer with xcode-select.`;
}

function buildSimulator() {
  const report = collectToolchainReport({
    includeApple: true,
    includeSigning: false,
    includeAppPlus: false
  });
  requirePreflight("iOS Simulator build", simulatorPreflightFailures(report));
  const sdkPath = capture("xcrun", [
    "--sdk",
    "iphonesimulator",
    "--show-sdk-path"
  ]);
  const appPath = prepareAppBundle(simulatorBuildRoot);
  const targetArch = arch() === "x64" ? "x86_64" : "arm64";
  run("xcrun", [
    "swiftc",
    "-sdk",
    sdkPath,
    "-target",
    `${targetArch}-apple-ios15.0-simulator`,
    "-module-name",
    moduleName,
    "-O",
    "-emit-executable",
    "-o",
    join(appPath, appName),
    ...sourceFiles
  ]);
  removeAppleDoubleFiles(appPath);
  run("codesign", ["--force", "--sign", "-", appPath]);
  run("codesign", ["--verify", "--deep", "--strict", "--verbose=2", appPath]);
  verifyAppBundle(appPath);
  console.log(`Built iOS Simulator app: ${appPath}`);
  return appPath;
}

function runSimulator() {
  const report = collectToolchainReport({
    includeApple: true,
    includeSigning: false,
    includeAppPlus: false
  });
  requirePreflight(
    "iOS Simulator runtime",
    simulatorPreflightFailures(report, { includeRuntime: true })
  );
  const appPath = join(simulatorBuildRoot, `${appName}.app`);
  const deviceId = getString("device-id") || resolveBootedSimulator();
  run("xcrun", ["simctl", "uninstall", deviceId, bundleId], {
    allowFailure: true
  });
  run("xcrun", ["simctl", "install", deviceId, appPath]);
  const entry = getString("entry", "/login");
  run("xcrun", ["simctl", "launch", deviceId, bundleId, "--entry", entry]);
  console.log(`Launched ${bundleId} on ${deviceId}: ${entry}`);
}

function packageSimulator() {
  const appPath = join(simulatorBuildRoot, `${appName}.app`);
  const outputDir = resolveOutputDirectory();
  const output = join(
    outputDir,
    `${appName}-iOS-simulator-v${versionName}-${versionCode}.zip`
  );
  rmSync(output, { force: true });
  run("ditto", ["--norsrc", "-c", "-k", "--keepParent", appPath, output], {
    env: { COPYFILE_DISABLE: "1" }
  });
  verifyZipEntries(output, [
    `${appName}.app/Info.plist`,
    `${appName}.app/${appName}`,
    `${appName}.app/AppResources/index.html`
  ]);
  console.log(`iOS Simulator package: ${output}`);
}

function packageDevice() {
  const report = collectToolchainReport({
    includeApple: true,
    includeSigning: true,
    includeAppPlus: false
  });
  requirePreflight(
    "iOS device package",
    devicePreflightFailures(report, { includeCredentials: true })
  );
  const target = getString("target", `arm64-apple-ios${minimumIosVersion}`);
  if (target !== `arm64-apple-ios${minimumIosVersion}`) {
    throw new Error(
      `Unsupported iOS device target: ${target}. This bundle declares MinimumOSVersion ${minimumIosVersion}; use arm64-apple-ios${minimumIosVersion} or update the version contract deliberately.`
    );
  }
  const profilePath = resolveProfilePath();
  const profile = decodeProfile(profilePath, deviceBuildRoot);
  validateProfile(profile, profilePath);
  const identity = resolveIdentity(profile, report.identities);
  const sdkPath = capture("xcrun", ["--sdk", "iphoneos", "--show-sdk-path"]);
  const appPath = prepareAppBundle(deviceBuildRoot);

  run("xcrun", [
    "swiftc",
    "-sdk",
    sdkPath,
    "-target",
    target,
    "-module-name",
    moduleName,
    "-O",
    "-emit-executable",
    "-o",
    join(appPath, appName),
    ...sourceFiles
  ]);

  copyFileSync(profilePath, join(appPath, "embedded.mobileprovision"));
  const entitlementsPath = join(deviceBuildRoot, "signing-entitlements.plist");
  prepareSigningEntitlements(profile, entitlementsPath);
  removeAppleDoubleFiles(appPath);
  run("codesign", [
    "--force",
    "--sign",
    identity.hash,
    "--entitlements",
    entitlementsPath,
    "--timestamp=none",
    appPath
  ]);
  run("codesign", ["--verify", "--deep", "--strict", "--verbose=2", appPath]);
  verifyAppBundle(appPath);
  const signedIdentifier = capture("codesign", ["-d", "--verbose=4", appPath], {
    includeStderr: true
  });
  if (!signedIdentifier.includes(`Identifier=${bundleId}`)) {
    throw new Error(
      `Signed app identifier verification failed; expected Identifier=${bundleId}.`
    );
  }

  const outputDir = resolveOutputDirectory();
  const payloadRoot = join(deviceBuildRoot, "Payload");
  const output = join(
    outputDir,
    `${appName}-iOS-device-v${versionName}-${versionCode}.ipa`
  );
  rmSync(payloadRoot, { recursive: true, force: true });
  rmSync(output, { force: true });
  mkdirSync(payloadRoot, { recursive: true });
  cpSync(appPath, join(payloadRoot, `${appName}.app`), { recursive: true });
  run("ditto", ["--norsrc", "-c", "-k", "--keepParent", payloadRoot, output], {
    env: { COPYFILE_DISABLE: "1" }
  });
  verifyZipEntries(output, [
    `Payload/${appName}.app/Info.plist`,
    `Payload/${appName}.app/${appName}`,
    `Payload/${appName}.app/embedded.mobileprovision`,
    `Payload/${appName}.app/AppResources/index.html`
  ]);
  console.log(`Signing identity: ${identity.name} (${identity.hash})`);
  console.log(
    `Provisioning profile: ${profile.name || profile.uuid || profilePath} (${profile.profileType})`
  );
  console.log(`iOS device IPA: ${output}`);
}

function prepareAppBundle(buildRoot) {
  const appPath = join(buildRoot, `${appName}.app`);
  rmSync(appPath, { recursive: true, force: true });
  mkdirSync(appPath, { recursive: true });
  cpSync(resourceSource, join(appPath, "AppResources"), { recursive: true });
  writeFileSync(join(appPath, "Info.plist"), renderInfoPlist(), "utf8");
  writeFileSync(join(appPath, "PkgInfo"), "APPL????", "utf8");
  createAppIcons(appPath);
  removeAppleDoubleFiles(appPath);
  return appPath;
}

function createAppIcons(appPath) {
  const icons = [
    ["AppIcon20x20@2x.png", 40],
    ["AppIcon20x20@3x.png", 60],
    ["AppIcon29x29@2x.png", 58],
    ["AppIcon29x29@3x.png", 87],
    ["AppIcon40x40@2x.png", 80],
    ["AppIcon40x40@3x.png", 120],
    ["AppIcon60x60@2x.png", 120],
    ["AppIcon60x60@3x.png", 180],
    ["AppIcon76x76@1x.png", 76],
    ["AppIcon76x76@2x.png", 152],
    ["AppIcon83.5x83.5@2x.png", 167],
    ["AppIcon1024x1024.png", 1024]
  ];
  const flattenedJpeg = join(appPath, ".qiming-icon-source.jpg");
  const flattenedPng = join(appPath, ".qiming-icon-source.png");
  run("sips", [
    "-s",
    "format",
    "jpeg",
    "-s",
    "formatOptions",
    "100",
    logoSource,
    "--out",
    flattenedJpeg
  ]);
  run("sips", ["-s", "format", "png", flattenedJpeg, "--out", flattenedPng]);
  for (const [name, size] of icons) {
    run("sips", [
      "-z",
      String(size),
      String(size),
      flattenedPng,
      "--out",
      join(appPath, name)
    ]);
  }
  rmSync(flattenedJpeg, { force: true });
  rmSync(flattenedPng, { force: true });
}

function renderInfoPlist() {
  const privacy =
    manifest?.["app-plus"]?.distribute?.ios?.privacyDescription || {};
  const displayName = xmlEscape(String(manifest.name || "IntellEdu"));
  const privacyValue = (key, fallback) =>
    xmlEscape(String(privacy[key] || fallback));
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key><string>zh_CN</string>
  <key>CFBundleDisplayName</key><string>${displayName}</string>
  <key>CFBundleExecutable</key><string>${appName}</string>
  <key>CFBundleIdentifier</key><string>${xmlEscape(bundleId)}</string>
  <key>CFBundleInfoDictionaryVersion</key><string>6.0</string>
  <key>CFBundleName</key><string>${displayName}</string>
  <key>CFBundlePackageType</key><string>APPL</string>
  <key>CFBundleShortVersionString</key><string>${xmlEscape(versionName)}</string>
  <key>CFBundleVersion</key><string>${xmlEscape(versionCode)}</string>
  <key>CFBundleIcons</key>
  <dict>
    <key>CFBundlePrimaryIcon</key>
    <dict>
      <key>CFBundleIconFiles</key>
      <array><string>AppIcon60x60</string><string>AppIcon76x76</string><string>AppIcon83.5x83.5</string></array>
      <key>UIPrerenderedIcon</key><false/>
    </dict>
  </dict>
  <key>ITSAppUsesNonExemptEncryption</key><false/>
  <key>LSRequiresIPhoneOS</key><true/>
  <key>MinimumOSVersion</key><string>${minimumIosVersion}</string>
  <key>NSCameraUsageDescription</key><string>${privacyValue("NSCameraUsageDescription", "Used to scan and upload learning materials.")}</string>
  <key>NSMicrophoneUsageDescription</key><string>${privacyValue("NSMicrophoneUsageDescription", "Used for voice input and classroom interaction.")}</string>
  <key>NSPhotoLibraryUsageDescription</key><string>${privacyValue("NSPhotoLibraryUsageDescription", "Used to select learning images, videos, and files.")}</string>
  <key>NSPhotoLibraryAddUsageDescription</key><string>${privacyValue("NSPhotoLibraryAddUsageDescription", "Used to save learning files and exports.")}</string>
  <key>UIApplicationSceneManifest</key>
  <dict>
    <key>UIApplicationSupportsMultipleScenes</key><false/>
    <key>UISceneConfigurations</key>
    <dict>
      <key>UIWindowSceneSessionRoleApplication</key>
      <array>
        <dict>
          <key>UISceneConfigurationName</key><string>Default Configuration</string>
          <key>UISceneDelegateClassName</key><string>${moduleName}.SceneDelegate</string>
        </dict>
      </array>
    </dict>
  </dict>
  <key>UILaunchScreen</key><dict/>
  <key>UIRequiresFullScreen</key><true/>
  <key>UIStatusBarStyle</key><string>UIStatusBarStyleDarkContent</string>
  <key>UIDeviceFamily</key><array><integer>1</integer><integer>2</integer></array>
  <key>UISupportedInterfaceOrientations</key>
  <array><string>UIInterfaceOrientationPortrait</string></array>
  <key>UISupportedInterfaceOrientations~ipad</key>
  <array>
    <string>UIInterfaceOrientationPortrait</string>
    <string>UIInterfaceOrientationPortraitUpsideDown</string>
    <string>UIInterfaceOrientationLandscapeLeft</string>
    <string>UIInterfaceOrientationLandscapeRight</string>
  </array>
</dict>
</plist>
`;
}

function resolveBootedSimulator() {
  const json = JSON.parse(
    capture("xcrun", ["simctl", "list", "devices", "booted", "-j"])
  );
  const device = Object.values(json.devices || {})
    .flat()
    .find(item => item.state === "Booted");
  if (!device?.udid)
    throw new Error(
      "No booted iOS Simulator was found. Boot one or pass --device-id."
    );
  return device.udid;
}

function resolveProfilePath() {
  const explicit = getString(
    "profile",
    process.env.IOS_PROVISIONING_PROFILE || ""
  );
  if (explicit) {
    const profilePath = resolve(repoRoot, explicit);
    ensureFile(profilePath, `Provisioning profile not found: ${profilePath}`);
    return profilePath;
  }

  const eligible = findMatchingProfiles().filter(
    profile => profileValidationFailures(profile).length === 0
  );
  if (!eligible.length) {
    throw new Error(
      `No usable installed provisioning profile matches ${bundleId}. Pass --profile /path/to/profile.mobileprovision or set IOS_PROVISIONING_PROFILE.`
    );
  }
  if (eligible.length > 1) {
    throw new Error(
      [
        `Multiple usable provisioning profiles match ${bundleId}; select one explicitly with --profile:`,
        ...eligible.map(
          profile => `- ${profile.path} (${profile.name || profile.uuid})`
        )
      ].join("\n")
    );
  }
  console.log(`Using installed provisioning profile: ${eligible[0].path}`);
  return eligible[0].path;
}

function decodeProfile(profilePath, outputRoot) {
  mkdirSync(outputRoot, { recursive: true });
  const plistPath = join(outputRoot, "provisioning-profile.plist");
  const decoded = capture("security", ["cms", "-D", "-i", profilePath]);
  writeFileSync(plistPath, decoded, "utf8");
  const profile = {
    path: profilePath,
    plistPath,
    name: plistValue(plistPath, "Name"),
    uuid: plistValue(plistPath, "UUID"),
    teamId: plistValue(plistPath, "TeamIdentifier:0"),
    applicationIdentifierPrefix: plistValue(
      plistPath,
      "ApplicationIdentifierPrefix:0"
    ),
    applicationIdentifier: plistValue(
      plistPath,
      "Entitlements:application-identifier"
    ),
    expirationDate: plistValue(plistPath, "ExpirationDate"),
    getTaskAllow: plistValue(plistPath, "Entitlements:get-task-allow"),
    platform: plistValue(plistPath, "Platform:0"),
    hasProvisionedDevices: plistKeyExists(plistPath, "ProvisionedDevices"),
    provisionsAllDevices: plistValue(plistPath, "ProvisionsAllDevices"),
    developerCertificateHashes: provisioningCertificateHashes(plistPath),
    entitlementsXml: capture("/usr/libexec/PlistBuddy", [
      "-x",
      "-c",
      "Print :Entitlements",
      plistPath
    ])
  };
  profile.profileType = classifyProfileType(profile);
  return profile;
}

function validateProfile(profile, profilePath) {
  const failures = profileValidationFailures(profile);
  if (failures.length) {
    throw new Error(
      [
        `Provisioning profile is not usable: ${profilePath}`,
        ...failures.map(item => `- ${item}`)
      ].join("\n")
    );
  }
}

function profileValidationFailures(profile) {
  const failures = [];
  if (!profile.applicationIdentifier) {
    failures.push("The profile has no application-identifier entitlement.");
  } else if (!profileAppIdMatches(profile.applicationIdentifier, bundleId)) {
    failures.push(
      `Profile App ID ${profile.applicationIdentifier} does not match ${bundleId}.`
    );
  }
  if (!profile.teamId) {
    failures.push("The profile has no TeamIdentifier.");
  } else if (
    profile.applicationIdentifierPrefix &&
    profile.applicationIdentifierPrefix !== profile.teamId
  ) {
    failures.push(
      `ApplicationIdentifierPrefix ${profile.applicationIdentifierPrefix} differs from TeamIdentifier ${profile.teamId}.`
    );
  }
  if (!profile.developerCertificateHashes.length) {
    failures.push("The profile contains no readable DeveloperCertificates.");
  }
  if (profile.platform && profile.platform !== "iOS") {
    failures.push(`The profile platform is ${profile.platform}, not iOS.`);
  }
  const expiration = Date.parse(profile.expirationDate || "");
  if (!profile.expirationDate || Number.isNaN(expiration)) {
    failures.push("The profile expiration date is missing or unreadable.");
  } else if (expiration <= Date.now()) {
    failures.push(`The profile expired at ${profile.expirationDate}.`);
  }
  if (
    profile.getTaskAllow === "true" &&
    !hasFlag("allow-development-profile")
  ) {
    failures.push(
      "Development profile detected. Pass --allow-development-profile only for a local device build; it is not a TestFlight/App Store profile."
    );
  }
  return failures;
}

function profileAppIdMatches(applicationIdentifier, expectedBundleId) {
  const separator = applicationIdentifier.indexOf(".");
  if (separator < 1) return false;
  const pattern = applicationIdentifier.slice(separator + 1);
  if (pattern === "*") return true;
  if (!pattern.endsWith(".*")) return pattern === expectedBundleId;
  const prefix = pattern.slice(0, -2);
  return expectedBundleId.startsWith(`${prefix}.`);
}

function classifyProfileType(profile) {
  if (profile.getTaskAllow === "true") return "development";
  if (profile.provisionsAllDevices === "true") return "enterprise";
  if (profile.hasProvisionedDevices) return "ad-hoc";
  return "app-store";
}

function resolveIdentity(profile, identities = listSigningIdentities()) {
  const explicit = getString(
    "identity",
    process.env.IOS_CODE_SIGN_IDENTITY || ""
  );
  if (explicit) {
    const selected = identities.find(
      identity =>
        identity.hash.toLowerCase() === explicit.toLowerCase() ||
        identity.name === explicit
    );
    if (!selected) {
      throw new Error(
        `Requested signing identity is not a valid Keychain identity: ${explicit}`
      );
    }
    validateIdentityForProfile(selected, profile);
    return selected;
  }

  const developmentProfile = profile.getTaskAllow === "true";
  const candidates = identities.filter(identity =>
    developmentProfile
      ? /^(Apple Development|iPhone Developer):/.test(identity.name)
      : /^(Apple Distribution|iPhone Distribution):/.test(identity.name)
  );
  const teamMatches = candidates.filter(
    identity => !identity.teamId || identity.teamId === profile.teamId
  );
  if (teamMatches.length) {
    validateIdentityForProfile(teamMatches[0], profile);
    return teamMatches[0];
  }
  throw new Error(
    `No suitable ${developmentProfile ? "Apple Development" : "Apple Distribution"} identity for Team ID ${profile.teamId} was found in Keychain.`
  );
}

function validateIdentityForProfile(identity, profile) {
  const developmentProfile = profile.getTaskAllow === "true";
  const developmentIdentity = /^(Apple Development|iPhone Developer):/.test(
    identity.name
  );
  const distributionIdentity =
    /^(Apple Distribution|iPhone Distribution):/.test(identity.name);
  if (developmentProfile && !developmentIdentity) {
    throw new Error(
      `Development profile requires an Apple Development identity, not ${identity.name}.`
    );
  }
  if (!developmentProfile && !distributionIdentity) {
    throw new Error(
      `Distribution profile requires an Apple Distribution identity, not ${identity.name}.`
    );
  }
  if (identity.teamId && profile.teamId && identity.teamId !== profile.teamId) {
    throw new Error(
      `Signing identity Team ID ${identity.teamId} does not match profile Team ID ${profile.teamId}.`
    );
  }
  if (
    profile.developerCertificateHashes.length &&
    !profile.developerCertificateHashes.includes(identity.hash)
  ) {
    throw new Error(
      `Signing identity ${identity.hash} is not included in the provisioning profile DeveloperCertificates.`
    );
  }
}

function listSigningIdentities() {
  return parseSigningIdentities(
    captureOptional("security", ["find-identity", "-v", "-p", "codesigning"])
  );
}

function parseSigningIdentities(output) {
  return String(output || "")
    .split(/\n/)
    .map(line => {
      const match = line.match(/^\s*\d+\)\s+([A-Fa-f0-9]{40})\s+"(.+)"/);
      if (!match) return null;
      return {
        hash: match[1].toUpperCase(),
        name: match[2],
        teamId: match[2].match(/\(([A-Z0-9]{10})\)\s*$/)?.[1] || ""
      };
    })
    .filter(Boolean);
}

function provisioningProfileRoot() {
  return join(
    process.env.HOME || "",
    "Library",
    "MobileDevice",
    "Provisioning Profiles"
  );
}

function findMatchingProfiles() {
  const root = provisioningProfileRoot();
  if (!existsSync(root)) return [];
  const profiles = [];
  for (const name of readdirSync(root)) {
    if (!/\.(mobileprovision|provisionprofile)$/.test(name)) continue;
    const path = join(root, name);
    try {
      const profile = decodeProfile(
        path,
        join(artifactRoot, "profile-scan", name.replace(/\W+/g, "-"))
      );
      if (profileAppIdMatches(profile.applicationIdentifier, bundleId)) {
        profiles.push(profile);
      }
    } catch {
      // Discovery ignores corrupt or unrelated profiles; explicit use reports errors.
    }
  }
  return profiles.sort(
    (left, right) =>
      Date.parse(right.expirationDate || "") -
      Date.parse(left.expirationDate || "")
  );
}

function listProfiles() {
  const root = provisioningProfileRoot();
  if (!existsSync(root)) {
    console.log(
      `No provisioning profile directory: ${root}. A real-device IPA cannot be signed on this account yet.`
    );
    return;
  }
  const profiles = findMatchingProfiles();
  if (!profiles.length) {
    console.log(`No installed provisioning profiles match ${bundleId}.`);
    return;
  }
  for (const profile of profiles) {
    console.log(
      `${profile.path}\n  name: ${profile.name || "unknown"}\n  uuid: ${profile.uuid || "unknown"}\n  type: ${profile.profileType}\n  team id: ${profile.teamId || "unknown"}\n  app id: ${profile.applicationIdentifier}\n  expires: ${profile.expirationDate}`
    );
  }
}

function plistValue(plistPath, key) {
  return captureOptional("/usr/libexec/PlistBuddy", [
    "-c",
    `Print :${key}`,
    plistPath
  ]);
}

function plistKeyExists(plistPath, key) {
  const result = spawnSync("/usr/libexec/PlistBuddy", [
    "-c",
    `Print :${key}`,
    plistPath
  ]);
  return result.status === 0;
}

function provisioningCertificateHashes(plistPath) {
  const count = Number(
    captureOptional("plutil", [
      "-extract",
      "DeveloperCertificates",
      "raw",
      "-o",
      "-",
      plistPath
    ])
  );
  if (!Number.isInteger(count) || count < 1) return [];
  const hashes = [];
  for (let index = 0; index < count; index += 1) {
    const base64 = captureOptional("plutil", [
      "-extract",
      `DeveloperCertificates.${index}`,
      "raw",
      "-o",
      "-",
      plistPath
    ]);
    if (!base64) return [];
    hashes.push(
      createHash("sha1")
        .update(Buffer.from(base64, "base64"))
        .digest("hex")
        .toUpperCase()
    );
  }
  return hashes;
}

function prepareSigningEntitlements(profile, entitlementsPath) {
  writeFileSync(entitlementsPath, profile.entitlementsXml, "utf8");
  const expandedAppId = expandProfileAppId(
    profile.applicationIdentifier,
    bundleId
  );
  run("plutil", [
    "-replace",
    "application-identifier",
    "-string",
    expandedAppId,
    entitlementsPath
  ]);

  const groupsRaw = captureOptional("plutil", [
    "-extract",
    "keychain-access-groups",
    "json",
    "-o",
    "-",
    entitlementsPath
  ]);
  if (groupsRaw) {
    const groups = JSON.parse(groupsRaw).map(group =>
      String(group).endsWith(".*")
        ? expandProfileAppId(String(group), bundleId)
        : group
    );
    run("plutil", [
      "-replace",
      "keychain-access-groups",
      "-json",
      JSON.stringify(groups),
      entitlementsPath
    ]);
  }
  run("plutil", ["-lint", entitlementsPath]);
  const actualAppId = plistValue(entitlementsPath, "application-identifier");
  if (actualAppId !== expandedAppId) {
    throw new Error(
      `Signing entitlements contain ${actualAppId || "no application-identifier"}, expected ${expandedAppId}.`
    );
  }
}

function expandProfileAppId(applicationIdentifier, expectedBundleId) {
  const separator = applicationIdentifier.indexOf(".");
  if (separator < 1) {
    throw new Error(
      `Provisioning profile application-identifier is invalid: ${applicationIdentifier}`
    );
  }
  const teamPrefix = applicationIdentifier.slice(0, separator);
  const pattern = applicationIdentifier.slice(separator + 1);
  if (pattern === expectedBundleId) return applicationIdentifier;
  if (pattern === "*" || pattern.endsWith(".*")) {
    if (!profileAppIdMatches(applicationIdentifier, expectedBundleId)) {
      throw new Error(
        `Provisioning profile ${applicationIdentifier} cannot expand to ${expectedBundleId}.`
      );
    }
    return `${teamPrefix}.${expectedBundleId}`;
  }
  throw new Error(
    `Provisioning profile ${applicationIdentifier} does not match ${expectedBundleId}.`
  );
}

function resolveOutputDirectory() {
  const outputDir = resolve(
    repoRoot,
    getString("output-dir", "artifacts/ios-native/release")
  );
  mkdirSync(outputDir, { recursive: true });
  return outputDir;
}

function requirePreflight(label, failures) {
  const uniqueFailures = [...new Set(failures)];
  if (!uniqueFailures.length) return;
  throw new Error(
    [
      `${label} preflight failed:`,
      ...uniqueFailures.map(item => `- ${item}`),
      "No build or package was produced."
    ].join("\n")
  );
}

function verifyAppBundle(appPath) {
  const plistPath = join(appPath, "Info.plist");
  ensureFile(plistPath, `App bundle Info.plist is missing: ${plistPath}`);
  ensureFile(
    join(appPath, appName),
    `App bundle executable is missing: ${join(appPath, appName)}`
  );
  ensureFile(
    join(appPath, "AppResources", "index.html"),
    "App bundle offline entry is missing."
  );
  const actualBundleId = plistValue(plistPath, "CFBundleIdentifier");
  const actualVersion = plistValue(plistPath, "CFBundleShortVersionString");
  const actualBuild = plistValue(plistPath, "CFBundleVersion");
  if (
    actualBundleId !== bundleId ||
    actualVersion !== versionName ||
    actualBuild !== versionCode
  ) {
    throw new Error(
      `App bundle metadata mismatch: ${actualBundleId} ${actualVersion} (${actualBuild}), expected ${bundleId} ${versionName} (${versionCode}).`
    );
  }
}

function verifyZipEntries(archivePath, requiredEntries) {
  ensureFile(archivePath, `Archive was not created: ${archivePath}`);
  if (statSync(archivePath).size === 0) {
    throw new Error(`Archive is empty: ${archivePath}`);
  }
  const entries = new Set(
    capture("unzip", ["-Z1", archivePath]).split(/\r?\n/)
  );
  const missing = requiredEntries.filter(entry => !entries.has(entry));
  if (missing.length) {
    throw new Error(
      `Archive ${archivePath} is missing required entries: ${missing.join(", ")}`
    );
  }
}

function resolveHBuilderCli() {
  const candidates = [
    "/Applications/HBuilderX.app/Contents/MacOS/cli",
    join(
      process.env.HOME || "",
      "Applications",
      "HBuilderX.app",
      "Contents",
      "MacOS",
      "cli"
    )
  ];
  return (
    candidates.find(path => existsSync(path) && statSync(path).isFile()) || ""
  );
}

function firstLine(value) {
  return String(value || "")
    .split(/\r?\n/)
    .map(line => line.trim())
    .find(Boolean);
}

function stripAnsi(value) {
  return String(value || "")
    .replace(/\u001b\[[0-9;]*m/g, "")
    .trim();
}

function removeAppleDoubleFiles(root) {
  if (!existsSync(root)) return;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.name.startsWith("._")) {
      rmSync(path, { recursive: true, force: true });
    } else if (entry.isDirectory()) {
      removeAppleDoubleFiles(path);
    }
  }
}

function countFiles(root) {
  let count = 0;
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    const path = join(root, entry.name);
    if (entry.isDirectory()) count += countFiles(path);
    else if (entry.isFile()) count += 1;
  }
  return count;
}

function ensureFile(path, message) {
  if (!existsSync(path) || !statSync(path).isFile()) throw new Error(message);
}

function xmlEscape(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

function selfTest() {
  assert.equal(isValidBundleId("cn.intelledu.qiming"), true);
  assert.equal(isValidBundleId("com.example.*"), false);
  assert.equal(isValidBundleId("single"), false);
  assert.deepEqual(classifyDCloudAppId("__UNI__QIMING"), {
    kind: "placeholder",
    value: "__UNI__QIMING"
  });
  assert.equal(classifyDCloudAppId("__UNI__A1B2C3D").kind, "configured");
  assert.equal(
    profileAppIdMatches("TEAM123456.cn.intelledu.qiming", bundleId),
    true
  );
  assert.equal(
    profileAppIdMatches("TEAM123456.cn.intelledu.*", bundleId),
    true
  );
  assert.equal(
    profileAppIdMatches("TEAM123456.com.example.*", bundleId),
    false
  );
  assert.equal(
    expandProfileAppId("TEAM123456.cn.intelledu.*", bundleId),
    `TEAM123456.${bundleId}`
  );
  assert.equal(
    parseSigningIdentities(
      '  1) 0123456789ABCDEF0123456789ABCDEF01234567 "Apple Distribution: Example (TEAM123456)"\n     1 valid identities found'
    )[0].teamId,
    "TEAM123456"
  );
  assert.deepEqual(parseFlags(["--", "--target=simulator"]), {
    target: "simulator"
  });
  const entitlementsPath = join(artifactRoot, "self-test-entitlements.plist");
  const profilePath = join(artifactRoot, "self-test-profile.plist");
  mkdirSync(artifactRoot, { recursive: true });
  try {
    prepareSigningEntitlements(
      {
        applicationIdentifier: "TEAM123456.cn.intelledu.*",
        entitlementsXml: `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>application-identifier</key><string>TEAM123456.cn.intelledu.*</string>
<key>keychain-access-groups</key><array><string>TEAM123456.cn.intelledu.*</string></array>
</dict></plist>`
      },
      entitlementsPath
    );
    assert.equal(
      plistValue(entitlementsPath, "application-identifier"),
      `TEAM123456.${bundleId}`
    );
    assert.deepEqual(
      JSON.parse(
        capture("plutil", [
          "-extract",
          "keychain-access-groups",
          "json",
          "-o",
          "-",
          entitlementsPath
        ])
      ),
      [`TEAM123456.${bundleId}`]
    );
    writeFileSync(
      profilePath,
      `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>DeveloperCertificates</key><array><data>AQID</data></array>
</dict></plist>`,
      "utf8"
    );
    assert.deepEqual(provisioningCertificateHashes(profilePath), [
      "7037807198C22A7D2B0807371D763779A84FDFCF"
    ]);
  } finally {
    rmSync(entitlementsPath, { force: true });
    rmSync(profilePath, { force: true });
  }
  console.log("iOS native helper self-test OK: 14 assertions");
}

function parseFlags(values) {
  const output = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === "--") continue;
    if (!value.startsWith("--")) {
      output.__positionals ||= [];
      output.__positionals.push(value);
      continue;
    }
    const equals = value.indexOf("=");
    if (equals > 2) {
      output[value.slice(2, equals)] = value.slice(equals + 1);
      continue;
    }
    const key = value.slice(2);
    const next = values[index + 1];
    if (!next || next === "--" || next.startsWith("--")) output[key] = true;
    else {
      output[key] = next;
      index += 1;
    }
  }
  return output;
}

function validateKnownFlags() {
  const allowed = {
    check: ["require-dcloud-appid"],
    "app-plus-check": [],
    doctor: ["target", "profile", "identity", "allow-development-profile"],
    "build-simulator": [],
    "run-simulator": ["device-id", "entry"],
    "package-simulator": ["output-dir"],
    profiles: ["allow-development-profile"],
    "package-device": [
      "profile",
      "identity",
      "target",
      "output-dir",
      "allow-development-profile"
    ],
    "self-test": [],
    help: [],
    "--help": [],
    "-h": []
  };
  if (!allowed[command]) return;
  const positionals = flags.__positionals || [];
  if (positionals.length) {
    throw new Error(
      `Unexpected positional arguments: ${positionals.join(", ")}`
    );
  }
  const unknown = Object.keys(flags).filter(
    key => key !== "__positionals" && !allowed[command].includes(key)
  );
  if (unknown.length) {
    throw new Error(
      `Unknown option(s) for ${command}: ${unknown.map(key => `--${key}`).join(", ")}`
    );
  }
}

function getString(name, fallback = "") {
  const value = flags[name];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function hasFlag(name) {
  return flags[name] === true || flags[name] === "true";
}

function capture(commandName, commandArgs, options = {}) {
  const result = spawnSync(commandName, commandArgs, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024
  });
  if (result.error) {
    throw new Error(`${commandName} is unavailable: ${result.error.message}`);
  }
  if (result.status !== 0) {
    throw new Error(
      (result.stderr || result.stdout || `${commandName} failed`).trim()
    );
  }
  return options.includeStderr
    ? `${result.stdout || ""}${result.stderr || ""}`.trim()
    : (result.stdout || "").trim();
}

function captureOptional(commandName, commandArgs) {
  try {
    return capture(commandName, commandArgs);
  } catch {
    return "";
  }
}

function run(commandName, commandArgs, options = {}) {
  const result = spawnSync(commandName, commandArgs, {
    cwd: repoRoot,
    stdio: "inherit",
    env: options.env ? { ...process.env, ...options.env } : process.env
  });
  if (result.error) {
    throw new Error(`${commandName} is unavailable: ${result.error.message}`);
  }
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(
      `${commandName} ${commandArgs.join(" ")} failed with exit code ${result.status}`
    );
  }
}

function printHelp() {
  console.log(`
Usage:
  node scripts/ios-native.mjs self-test
  node scripts/ios-native.mjs check
  node scripts/ios-native.mjs check --require-dcloud-appid
  node scripts/ios-native.mjs doctor [--target all|simulator|device|app-plus]
  node scripts/ios-native.mjs app-plus-check
  node scripts/ios-native.mjs build-simulator
  node scripts/ios-native.mjs run-simulator [--device-id <UDID>] [--entry /login]
  node scripts/ios-native.mjs package-simulator [--output-dir <path>]
  node scripts/ios-native.mjs profiles
  node scripts/ios-native.mjs package-device [--profile <path>] [--identity <name-or-sha1>]

Standalone shell checks do not require a DCloud AppID. HBuilderX/App-Plus
packaging requires QIMING_DCLOUD_APPID and a signed-in DCloud account.

Simulator commands require full Xcode, not Command Line Tools alone. The device
command additionally requires a valid signing identity and provisioning profile
matching ${bundleId || "the manifest bundle id"}. Development profiles require
--allow-development-profile and cannot be used for TestFlight/App Store release.
`);
}
