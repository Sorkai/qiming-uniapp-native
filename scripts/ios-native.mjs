#!/usr/bin/env node

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
const bundleId = manifest?.["app-plus"]?.distribute?.ios?.bundleIdentifier;
const versionName = String(manifest.versionName || "1.0.0");
const versionCode = String(manifest.versionCode || "100");

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

async function main() {
  switch (command) {
    case "check":
      staticCheck();
      return;
    case "doctor":
      staticCheck();
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
      listProfiles();
      return;
    case "package-device":
      staticCheck();
      packageDevice();
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
  return JSON.parse(readFileSync(manifestPath, "utf8"));
}

function staticCheck() {
  if (!bundleId || typeof bundleId !== "string") {
    throw new Error(
      "The iOS bundleIdentifier is missing from native-app/src/manifest.json."
    );
  }
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
  console.log(`Offline bundle: ${resourceFiles} files at ${resourceSource}`);
  console.log("Production login: real /login route, no injected demo identity");
  console.log(
    "App Transport Security: strict HTTPS (no arbitrary-load exception)"
  );
}

function doctor() {
  const failures = [];
  const developerDir = captureOptional("xcode-select", ["-p"]);
  if (!developerDir || !developerDir.includes("Xcode.app")) {
    failures.push(
      `Full Xcode is not selected (current developer dir: ${developerDir || "unavailable"}).`
    );
  }
  if (
    !captureOptional("xcrun", ["--sdk", "iphonesimulator", "--show-sdk-path"])
  ) {
    failures.push("The iPhone Simulator SDK is unavailable.");
  }
  if (!captureOptional("xcrun", ["--sdk", "iphoneos", "--show-sdk-path"])) {
    failures.push("The iPhoneOS SDK is unavailable.");
  }
  const identities = captureOptional("security", [
    "find-identity",
    "-v",
    "-p",
    "codesigning"
  ]);
  const identityCount = Number(
    identities.match(/(\d+) valid identities found/)?.[1] || 0
  );
  console.log(`Code-signing identities: ${identityCount}`);

  if (failures.length) {
    throw new Error(
      [
        "iOS toolchain is incomplete:",
        ...failures.map(item => `- ${item}`)
      ].join("\n")
    );
  }
  console.log("iOS toolchain doctor OK");
}

function buildSimulator() {
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
  run("codesign", ["--force", "--sign", "-", appPath]);
  console.log(`Built iOS Simulator app: ${appPath}`);
  return appPath;
}

function runSimulator() {
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
  console.log(`iOS Simulator package: ${output}`);
}

function packageDevice() {
  const profilePath = resolveProfilePath();
  const profile = decodeProfile(profilePath, deviceBuildRoot);
  validateProfile(profile, profilePath);
  const identity = resolveIdentity();
  const sdkPath = capture("xcrun", ["--sdk", "iphoneos", "--show-sdk-path"]);
  const appPath = prepareAppBundle(deviceBuildRoot);

  run("xcrun", [
    "swiftc",
    "-sdk",
    sdkPath,
    "-target",
    getString("target", "arm64-apple-ios15.0"),
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
  writeFileSync(entitlementsPath, profile.entitlementsXml, "utf8");
  run("codesign", [
    "--force",
    "--sign",
    identity,
    "--entitlements",
    entitlementsPath,
    "--timestamp=none",
    appPath
  ]);
  run("codesign", ["--verify", "--deep", "--strict", "--verbose=2", appPath]);

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
  <key>MinimumOSVersion</key><string>15.0</string>
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
  if (!explicit) {
    throw new Error(
      "Pass --profile /path/to/profile.mobileprovision or set IOS_PROVISIONING_PROFILE."
    );
  }
  const profilePath = resolve(repoRoot, explicit);
  ensureFile(profilePath, `Provisioning profile not found: ${profilePath}`);
  return profilePath;
}

function decodeProfile(profilePath, outputRoot) {
  mkdirSync(outputRoot, { recursive: true });
  const plistPath = join(outputRoot, "provisioning-profile.plist");
  const decoded = capture("security", ["cms", "-D", "-i", profilePath]);
  writeFileSync(plistPath, decoded, "utf8");
  return {
    plistPath,
    applicationIdentifier: plistValue(
      plistPath,
      "Entitlements:application-identifier"
    ),
    expirationDate: plistValue(plistPath, "ExpirationDate"),
    getTaskAllow: plistValue(plistPath, "Entitlements:get-task-allow"),
    entitlementsXml: capture("/usr/libexec/PlistBuddy", [
      "-x",
      "-c",
      "Print :Entitlements",
      plistPath
    ])
  };
}

function validateProfile(profile, profilePath) {
  const suffix = profile.applicationIdentifier.includes(".")
    ? profile.applicationIdentifier.slice(
        profile.applicationIdentifier.indexOf(".") + 1
      )
    : "";
  if (suffix !== bundleId && suffix !== "*") {
    throw new Error(
      `Provisioning profile ${profilePath} targets ${profile.applicationIdentifier}, not ${bundleId}.`
    );
  }
  if (
    profile.getTaskAllow === "true" &&
    !hasFlag("allow-development-profile")
  ) {
    throw new Error(
      "Development profile detected. Pass --allow-development-profile only for a local device build."
    );
  }
  if (
    profile.expirationDate &&
    Date.parse(profile.expirationDate) <= Date.now()
  ) {
    throw new Error(
      `Provisioning profile expired at ${profile.expirationDate}.`
    );
  }
}

function resolveIdentity() {
  const explicit = getString(
    "identity",
    process.env.IOS_CODE_SIGN_IDENTITY || ""
  );
  if (explicit) return explicit;
  const identities = capture("security", [
    "find-identity",
    "-v",
    "-p",
    "codesigning"
  ])
    .split(/\n/)
    .map(line => line.match(/"(.+)"/)?.[1])
    .filter(Boolean);
  const distribution = identities.find(value =>
    /^(Apple Distribution|iPhone Distribution):/.test(value)
  );
  if (distribution) return distribution;
  if (hasFlag("allow-development-profile")) {
    const development = identities.find(value =>
      /^(Apple Development|iPhone Developer):/.test(value)
    );
    if (development) return development;
  }
  throw new Error(
    "No suitable Apple code-signing identity was found in Keychain."
  );
}

function listProfiles() {
  const root = join(
    process.env.HOME || "",
    "Library",
    "MobileDevice",
    "Provisioning Profiles"
  );
  if (!existsSync(root)) {
    console.log(`No provisioning profile directory: ${root}`);
    return;
  }
  const profiles = [];
  for (const name of readdirSync(root)) {
    if (!/\.(mobileprovision|provisionprofile)$/.test(name)) continue;
    const path = join(root, name);
    try {
      const profile = decodeProfile(
        path,
        join(artifactRoot, "profile-scan", name.replace(/\W+/g, "-"))
      );
      if (
        profile.applicationIdentifier.endsWith(`.${bundleId}`) ||
        profile.applicationIdentifier.endsWith(".*")
      ) {
        profiles.push({ path, ...profile });
      }
    } catch {
      // Ignore unrelated or unreadable profiles during discovery.
    }
  }
  if (!profiles.length) {
    console.log(`No installed provisioning profiles match ${bundleId}.`);
    return;
  }
  for (const profile of profiles) {
    console.log(
      `${profile.path}\n  app id: ${profile.applicationIdentifier}\n  expires: ${profile.expirationDate}`
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

function resolveOutputDirectory() {
  const outputDir = resolve(
    repoRoot,
    getString("output-dir", "artifacts/ios-native/release")
  );
  mkdirSync(outputDir, { recursive: true });
  return outputDir;
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

function parseFlags(values) {
  const output = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = values[index + 1];
    if (!next || next.startsWith("--")) output[key] = true;
    else {
      output[key] = next;
      index += 1;
    }
  }
  return output;
}

function getString(name, fallback = "") {
  const value = flags[name];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function hasFlag(name) {
  return flags[name] === true || flags[name] === "true";
}

function capture(commandName, commandArgs) {
  const result = spawnSync(commandName, commandArgs, {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 16 * 1024 * 1024
  });
  if (result.status !== 0) {
    throw new Error(
      (result.stderr || result.stdout || `${commandName} failed`).trim()
    );
  }
  return result.stdout.trim();
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
  if (result.status !== 0 && !options.allowFailure) {
    throw new Error(
      `${commandName} ${commandArgs.join(" ")} failed with exit code ${result.status}`
    );
  }
}

function printHelp() {
  console.log(`
Usage:
  node scripts/ios-native.mjs check
  node scripts/ios-native.mjs doctor
  node scripts/ios-native.mjs build-simulator
  node scripts/ios-native.mjs run-simulator [--device-id <UDID>] [--entry /login]
  node scripts/ios-native.mjs package-simulator [--output-dir <path>]
  node scripts/ios-native.mjs profiles
  node scripts/ios-native.mjs package-device --profile <path> [--identity <name>]

The device command requires full Xcode, a signing identity, and a provisioning
profile matching ${bundleId || "the manifest bundle id"}.
`);
}
