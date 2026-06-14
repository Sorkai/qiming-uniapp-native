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
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const iosRoot = join(repoRoot, "ios-native");
const buildRoot = join(iosRoot, "build-device");
const appName = "QimingIntellEdu";
const bundleId = "cn.intelledu.qiming";
const appPath = join(buildRoot, `${appName}.app`);
const resourceSource = join(repoRoot, "native-app", "src", "hybrid", "html");
const resourceTarget = join(appPath, "AppResources");
const appIconRoot = join(iosRoot, "Resources", "AppIcon");

const args = process.argv.slice(2);
const command = args[0] && !args[0].startsWith("-") ? args.shift() : "package";
const flags = parseFlags(args);

Promise.resolve().then(main).catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});

function main() {
  if (command === "help" || hasFlag("help")) {
    printHelp();
    return;
  }

  if (command !== "package") {
    throw new Error(`Unknown iOS device package command: ${command}`);
  }

  const profilePath = resolveProfilePath();
  const profile = readProvisioningProfile(profilePath);
  validateProvisioningProfile(profile, profilePath);
  const identity = resolveSigningIdentity();

  if (hasFlag("prepare")) {
    run("pnpm", ["native:prepare"]);
  }

  buildDeviceApp();
  signDeviceApp({ identity, profilePath, profile });
  packageIpa({ identity, profile });
}

function buildDeviceApp() {
  ensureFile(join(resourceSource, "index.html"), "Offline bundle is missing. Run pnpm native:prepare first.");
  rmSync(appPath, { recursive: true, force: true });
  mkdirSync(appPath, { recursive: true });
  cpSync(resourceSource, resourceTarget, { recursive: true });
  copyFileSync(join(iosRoot, "Resources", "Info.plist"), join(appPath, "Info.plist"));
  copyAppIcons(appPath);
  writeFileSync(join(appPath, "PkgInfo"), "APPL????");

  const sdkPath = capture("xcrun", ["--sdk", "iphoneos", "--show-sdk-path"]);
  const sourceFiles = [
    join(iosRoot, "Sources", "QimingApp", "AppDelegate.swift"),
    join(iosRoot, "Sources", "QimingApp", "SceneDelegate.swift"),
    join(iosRoot, "Sources", "QimingApp", "QimingWebViewController.swift")
  ];
  run("xcrun", [
    "swiftc",
    "-sdk",
    sdkPath,
    "-target",
    getString("target", "arm64-apple-ios17.0"),
    "-module-name",
    "QimingIntellEdu",
    "-O",
    "-emit-executable",
    "-o",
    join(appPath, appName),
    ...sourceFiles
  ]);
  removeAppleDoubleFiles(appPath);
  console.log(`Built iOS device app: ${appPath}`);
}

function copyAppIcons(targetAppPath) {
  const icons = [
    "AppIcon20x20@2x.png",
    "AppIcon20x20@3x.png",
    "AppIcon29x29@2x.png",
    "AppIcon29x29@3x.png",
    "AppIcon40x40@2x.png",
    "AppIcon40x40@3x.png",
    "AppIcon60x60@2x.png",
    "AppIcon60x60@3x.png",
    "AppIcon76x76@1x.png",
    "AppIcon76x76@2x.png",
    "AppIcon83.5x83.5@2x.png",
    "AppIcon1024x1024.png"
  ];
  for (const name of icons) {
    copyFileSync(join(appIconRoot, name), join(targetAppPath, name));
  }
}

function signDeviceApp({ identity, profilePath, profile }) {
  const embeddedProfilePath = join(appPath, "embedded.mobileprovision");
  copyFileSync(profilePath, embeddedProfilePath);

  const entitlementsPath = join(buildRoot, "device-entitlements.plist");
  writeFileSync(entitlementsPath, profile.entitlementsXml);

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
  console.log(`Signed ${bundleId} with ${identity}`);
}

function packageIpa({ identity, profile }) {
  const outputDir = resolveOutputPath(getString("output-dir", "artifacts/ios-release"));
  mkdirSync(outputDir, { recursive: true });

  const version = readPlistValue(join(appPath, "Info.plist"), "CFBundleShortVersionString") || "1.0.0";
  const build = readPlistValue(join(appPath, "Info.plist"), "CFBundleVersion") || "100";
  const packageBase = `QimingIntellEdu-iOS-device-v${version}-${build}-${shortSha()}`;
  const ipaPath = join(outputDir, `${packageBase}.ipa`);
  const notesPath = join(outputDir, `${packageBase}.release-notes.md`);
  const payloadRoot = join(buildRoot, "Payload");

  rmSync(payloadRoot, { recursive: true, force: true });
  rmSync(ipaPath, { force: true });
  mkdirSync(payloadRoot, { recursive: true });
  cpSync(appPath, join(payloadRoot, `${appName}.app`), { recursive: true });
  removeAppleDoubleFiles(payloadRoot);
  run("ditto", ["--norsrc", "-c", "-k", "--keepParent", payloadRoot, ipaPath], {
    env: { COPYFILE_DISABLE: "1" }
  });

  writeFileSync(
    notesPath,
    [
      `# ${packageBase}`,
      "",
      "- Package type: iOS device `.ipa`",
      `- Bundle id: \`${bundleId}\``,
      `- Version: \`${version} (${build})\``,
      `- Commit: \`${shortSha()}\``,
      `- Signing identity: \`${identity}\``,
      `- Provisioning profile: \`${profile.name}\``,
      `- Profile UUID: \`${profile.uuid}\``,
      `- Team ID: \`${profile.teamId}\``,
      `- App identifier: \`${profile.applicationIdentifier}\``,
      `- Local artifact: \`${ipaPath}\``,
      "",
      "## TestFlight Upload",
      "",
      "Upload this IPA with Xcode Organizer, Transporter, or App Store Connect API credentials:",
      "",
      "```bash",
      `xcrun altool --upload-app --type ios --file ${JSON.stringify(ipaPath)} --apiKey <APP_STORE_CONNECT_API_KEY_ID> --apiIssuer <APP_STORE_CONNECT_ISSUER_ID>`,
      "```",
      ""
    ].join("\n")
  );
  console.log(`iOS device IPA: ${ipaPath}`);
  console.log(`Release notes: ${notesPath}`);
}

function readProvisioningProfile(profilePath) {
  ensureFile(profilePath, `Provisioning profile not found: ${profilePath}`);
  const profilePlist = join(buildRoot, "provisioning-profile.plist");
  mkdirSync(buildRoot, { recursive: true });
  const decoded = spawnSync("security", ["cms", "-D", "-i", profilePath], {
    cwd: repoRoot,
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024
  });
  if (decoded.status !== 0) {
    throw new Error((decoded.stderr || decoded.stdout || "Could not decode provisioning profile.").trim());
  }
  writeFileSync(profilePlist, decoded.stdout);

  const entitlements = capture("/usr/libexec/PlistBuddy", ["-x", "-c", "Print :Entitlements", profilePlist]);
  return {
    path: profilePath,
    plistPath: profilePlist,
    entitlementsXml: entitlements,
    name: readPlistValue(profilePlist, "Name"),
    uuid: readPlistValue(profilePlist, "UUID"),
    teamId: readPlistValue(profilePlist, "TeamIdentifier:0"),
    applicationIdentifier: readPlistValue(profilePlist, "Entitlements:application-identifier"),
    getTaskAllow: readPlistValue(profilePlist, "Entitlements:get-task-allow"),
    expirationDate: readPlistValue(profilePlist, "ExpirationDate"),
    hasProvisionedDevices: plistKeyExists(profilePlist, "ProvisionedDevices")
  };
}

function validateProvisioningProfile(profile, profilePath) {
  const appId = profile.applicationIdentifier || "";
  const bundleSuffix = appId.includes(".") ? appId.slice(appId.indexOf(".") + 1) : "";
  const matchesBundleId = bundleSuffix === bundleId || bundleSuffix === "*";
  if (!matchesBundleId) {
    throw new Error(
      `Provisioning profile ${profilePath} is for ${appId || "(unknown app id)"}, not ${bundleId}.`
    );
  }
  if (profile.getTaskAllow === "true" && !hasFlag("allow-development-profile")) {
    throw new Error(
      "The provisioning profile has get-task-allow=true. TestFlight needs an App Store or Ad Hoc distribution profile. Pass --allow-development-profile only for local device experiments."
    );
  }
}

function resolveProfilePath() {
  const value = getString("profile", process.env.IOS_PROVISIONING_PROFILE || "");
  if (!value) {
    throw new Error(
      "Missing provisioning profile. Pass --profile /path/to/profile.mobileprovision or set IOS_PROVISIONING_PROFILE."
    );
  }
  return resolve(repoRoot, value);
}

function resolveSigningIdentity() {
  const explicit = getString("identity", process.env.IOS_CODE_SIGN_IDENTITY || "");
  if (explicit) return explicit;

  const output = capture("security", ["find-identity", "-v", "-p", "codesigning"]);
  const identities = output
    .split(/\n/)
    .map(line => line.match(/"(.+)"/)?.[1])
    .filter(Boolean);
  const distribution = identities.find(name =>
    /^(Apple Distribution|iPhone Distribution):/.test(name)
  );
  if (distribution) return distribution;

  if (hasFlag("allow-development-profile")) {
    const development = identities.find(name => /^(Apple Development|iPhone Developer):/.test(name));
    if (development) return development;
  }

  throw new Error(
    "No Apple Distribution signing identity found. Install the certificate in Keychain or pass --identity \"Apple Distribution: ...\"."
  );
}

function readPlistValue(plistPath, key) {
  const result = spawnSync("/usr/libexec/PlistBuddy", ["-c", `Print :${key}`, plistPath], {
    cwd: repoRoot,
    encoding: "utf8"
  });
  return result.status === 0 ? result.stdout.trim() : "";
}

function plistKeyExists(plistPath, key) {
  const result = spawnSync("/usr/libexec/PlistBuddy", ["-c", `Print :${key}`, plistPath], {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: "ignore"
  });
  return result.status === 0;
}

function removeAppleDoubleFiles(rootPath) {
  if (!existsSync(rootPath)) return;
  for (const item of readdirSync(rootPath, { withFileTypes: true })) {
    const itemPath = join(rootPath, item.name);
    if (item.name.startsWith("._")) {
      rmSync(itemPath, { recursive: true, force: true });
      continue;
    }
    if (item.isDirectory()) removeAppleDoubleFiles(itemPath);
  }
}

function shortSha() {
  try {
    return capture("git", ["rev-parse", "--short", "HEAD"]);
  } catch {
    return "unknown";
  }
}

function resolveOutputPath(value) {
  return resolve(repoRoot, value);
}

function parseFlags(values) {
  const parsed = {};
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index];
    if (value === "--") continue;
    if (!value.startsWith("--")) continue;
    const key = value.slice(2);
    const next = values[index + 1];
    if (!next || next === "--" || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }
    parsed[key] = next;
    index += 1;
  }
  return parsed;
}

function hasFlag(name) {
  return Boolean(flags[name] || flags[name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())]);
}

function getString(name, fallback = "") {
  const value = flags[name] ?? flags[name.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())];
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function ensureFile(path, message) {
  if (!existsSync(path)) throw new Error(message);
  if (!statSync(path).isFile()) throw new Error(message);
}

function capture(commandName, commandArgs) {
  const result = spawnSync(commandName, commandArgs, { cwd: repoRoot, encoding: "utf8" });
  if (result.status !== 0) {
    throw new Error((result.stderr || result.stdout || `${commandName} failed`).trim());
  }
  return result.stdout.trim();
}

function run(commandName, commandArgs, options = {}) {
  const result = spawnSync(commandName, commandArgs, {
    cwd: repoRoot,
    stdio: "inherit",
    env: options.env ? { ...process.env, ...options.env } : process.env
  });
  if (result.status !== 0) {
    throw new Error(`${commandName} ${commandArgs.join(" ")} failed with exit code ${result.status}`);
  }
}

function printHelp() {
  console.log(`
Usage:
  pnpm native:ios:ipa -- --profile /path/to/profile.mobileprovision [--identity "Apple Distribution: ..."]

Options:
  --profile <path>                 Provisioning profile for ${bundleId}
  --identity <name>                Code signing identity. Defaults to the first Apple Distribution identity.
  --output-dir <path>              Output directory. Defaults to artifacts/ios-release.
  --target <triple>                Swift target. Defaults to arm64-apple-ios17.0.
  --allow-development-profile      Allow a development profile for local device experiments.

Environment:
  IOS_PROVISIONING_PROFILE         Fallback provisioning profile path.
  IOS_CODE_SIGN_IDENTITY           Fallback signing identity.
`);
}
