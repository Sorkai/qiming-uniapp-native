# Qiming iOS Native Shell

This directory contains a thin UIKit/WKWebView shell for the current offline
business bundle in `native-app/src/hybrid/html`.

The shell is deliberately isolated from the shared Vue source:

- Business pages remain owned by `vue-pure-admin-max/agent` and are synced into
  this repository through the existing web sync flow.
- The iOS shell only loads the generated offline bundle, applies native safe
  areas, exposes camera/microphone prompts, and serves local assets.
- It does not inject demo users or replace the real login flow.
- Bundle id, version, build number, and privacy descriptions are read from
  `native-app/src/manifest.json` by the build script.
- App Transport Security is not relaxed. Production API traffic must use HTTPS.

Commands are intentionally callable without changing the shared root
`package.json`:

```bash
node scripts/ios-native.mjs check
node scripts/ios-native.mjs doctor
node scripts/ios-native.mjs build-simulator
node scripts/ios-native.mjs run-simulator --device-id <SIMULATOR_UDID>
node scripts/ios-native.mjs package-simulator
node scripts/ios-native.mjs profiles
node scripts/ios-native.mjs package-device --profile /path/to/profile.mobileprovision
```

Before building, refresh the offline business bundle:

```bash
pnpm native:prepare
```

Simulator and device artifacts are written below the ignored
`artifacts/ios-native/` directory. A real-device IPA additionally requires full
Xcode, an Apple signing identity, and a provisioning profile for
`cn.intelledu.qiming`.
