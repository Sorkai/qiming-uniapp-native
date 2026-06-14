# Qiming iOS Native Simulator Shell

This is a thin UIKit/WKWebView shell used to validate the existing
`native-app/src/hybrid/html` offline bundle on Apple Silicon iOS simulators.

This directory is the iOS native line for simulator and Xcode-driven
validation. It is intentionally separate from `native-app/`, the HBuilderX /
App-Plus native container line used for Android packaging and HBuilderX cloud or
local packaging flows.

Repository-level rule:

- Shared product pages live in the repo root `src/` tree.
- iOS shell behavior, WKWebView loading, iOS safe areas, iOS diagnostics, and
  simulator automation belong here or in `scripts/ios-native-simulator.mjs`.
- Android container behavior belongs in `native-app/`.
- Platform-specific CSS or runtime changes must use explicit iOS markers such
  as `html.qiming-native-webview.qiming-native-ios`; do not solve an iOS-only
  issue by changing broad shared mobile selectors unless the same behavior has
  been accepted for Android too.

HBuilderX 5.07 ships an x86_64-only standard iOS simulator base in
`Pandora_simulator.app`, which cannot be installed on arm64 simulators. This
native shell keeps the business UI in the generated uni-app/H5 bundle while
letting Xcode build a real arm64 simulator `.app`.

Run from the repo root:

```bash
pnpm native:prepare
pnpm native:run:ios -- --device-id <SIMULATOR_UDID> --demo-role teacher --entry /welcome/index
```

Screenshots:

```bash
pnpm native:ios:screenshot -- --device-id <SIMULATOR_UDID> --output artifacts/ios-simulator/teacher.png
```
