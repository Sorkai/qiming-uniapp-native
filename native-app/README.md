# IntellEdu Android / HBuilderX Native Line

Uni-app shell for the existing IntellEdu H5 app.

This directory is the HBuilderX/App-Plus native container line. It is the main
home for Android packaging and also contains the HBuilderX iOS packaging
configuration when cloud/local HBuilderX packaging is used. It should stay
separate from `ios-native/`, which is the Xcode/UIKit simulator validation
shell.

Repository-level rule:

- Shared product pages live in the repo root `src/` tree.
- Android container behavior, Android manifest/package details, Android
  permissions, Android certificates, and Android device automation belong here
  or in the Android native tooling scripts.
- iOS simulator shell behavior belongs in `ios-native/`.
- Platform-specific fixes should use explicit platform boundaries instead of
  changing shared mobile behavior by accident.

Run from the repo root:

```powershell
pnpm native:prepare
pnpm --dir native-app build:app
```

`src/hybrid/html` is generated and intentionally ignored by Git. HBuilderX
packaging should be run after `pnpm native:prepare`.
