# Qiming iOS Native Shell

This directory contains a thin UIKit/WKWebView shell for the offline business
bundle in `native-app/src/hybrid/html`. The shared Vue application remains the
business source; this shell only supplies the iOS container, safe-area handling,
permission prompts, and local asset serving.

The shell does not inject demo users or replace the real login flow. Bundle id,
version, build number, and privacy descriptions come from
`native-app/src/manifest.json`. App Transport Security remains strict, so
production API traffic must use HTTPS.

## Validation levels

These checks intentionally report different levels of evidence:

- `check` validates manifest metadata, required privacy text, generated
  `Info.plist`, offline resources, the native bridge, and Swift syntax. It does
  not link UIKit or prove Simulator/device runtime behavior.
- `doctor --target simulator` requires full Xcode, the Simulator SDK, and
  `simctl`.
- `doctor --target device` additionally requires an Apple signing identity and
  a non-expired provisioning profile matching `cn.intelledu.qiming`.
- `doctor --target app-plus` checks the separate HBuilderX/DCloud packaging
  path. The committed `__UNI__QIMING` value is an intentional placeholder and
  cannot produce an App-Plus package.

Run from the repository root:

```bash
node scripts/ios-native.mjs self-test
node scripts/ios-native.mjs check
node scripts/ios-native.mjs doctor --target simulator
node scripts/ios-native.mjs doctor --target device
node scripts/ios-native.mjs doctor --target app-plus
```

`doctor` defaults to `--target all`. A machine with only Apple Command Line
Tools will fail simulator/device preflight with an explicit full-Xcode message;
the script does not treat `swiftc -parse` as an iOS build.

## Simulator

Refresh the shared offline bundle before building:

```bash
pnpm native:prepare
node scripts/ios-native.mjs build-simulator
node scripts/ios-native.mjs run-simulator --device-id <SIMULATOR_UDID> --entry /login
node scripts/ios-native.mjs package-simulator --output-dir artifacts/ios-native/release
```

The zip contains an ad-hoc-signed Simulator `.app`. It cannot be installed on a
physical iPhone or uploaded to TestFlight.

## Physical device IPA

List installed profiles, then select one explicitly if more than one is usable:

```bash
node scripts/ios-native.mjs profiles
node scripts/ios-native.mjs package-device \
  --profile /path/to/profile.mobileprovision \
  --identity "Apple Distribution: Company (TEAMID)"
```

`--profile` may be omitted only when exactly one usable installed profile
matches the bundle id. `IOS_PROVISIONING_PROFILE` and
`IOS_CODE_SIGN_IDENTITY` provide local environment alternatives.

Before signing, the script verifies the profile platform, expiry, App ID
wildcard scope, Team ID, certificate SHA-1 membership, and identity type. It
expands wildcard `application-identifier` and keychain entitlements to the
concrete bundle id. Development profiles require
`--allow-development-profile` and are for local device testing only, not
TestFlight or App Store distribution.

No certificate, provisioning profile, DCloud AppID, or account credential is
generated or committed by this tooling. Simulator and device artifacts are
written under the ignored `artifacts/ios-native/` directory.

## HBuilderX App-Plus

The standalone UIKit shell does not require a DCloud AppID. HBuilderX/App-Plus
packaging does. Keep the public placeholder in Git and provide the real value
only through local packaging configuration or `QIMING_DCLOUD_APPID`:

```bash
QIMING_DCLOUD_APPID="$REAL_DCLOUD_APPID" \
  node scripts/ios-native.mjs app-plus-check
```

The preflight also requires the HBuilderX CLI to return a signed-in DCloud
account identity. It does not log in, upload, or package automatically.

## Legacy simulator and test harness

The repository keeps the earlier simulator/device helpers and route test files
under `scripts/ios-native-simulator.mjs`, `scripts/ios-native-device-package.mjs`,
and `scripts/ios-test-scripts/` for reproducible historical checks. Their
package aliases remain available as `pnpm native:ios:*`; they are test tooling
only. The production UIKit shell always starts at `/login` and never injects a
demo identity.
