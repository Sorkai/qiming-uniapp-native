param(
  [ValidateSet("android", "ios")]
  [string]$Platform = "android",
  [string]$DeviceId = "",
  [string]$EntryPath = "/welcome/index",
  [switch]$SkipPrepare,
  [switch]$NativeLog
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$nativeProject = Join-Path $repoRoot "native-app"
$hbuilderCli = "G:\qiming-uniapp-native-tools\HBuilderX-5.07\HBuilderX\cli.exe"
$adb = "G:\qiming-uniapp-native-tools\android-sdk\platform-tools\adb.exe"
$devicesScript = Join-Path $PSScriptRoot "native-devices.ps1"

function Require-File([string]$Path, [string]$Message) {
  if (-not (Test-Path -LiteralPath $Path)) {
    throw $Message
  }
}

function Get-AndroidDeviceLines {
  if (-not (Test-Path -LiteralPath $adb)) {
    throw "ADB not found: $adb"
  }
  $adbOutput = & $adb devices -l | Out-String
  return @(($adbOutput -split "`n") | Where-Object {
      $_ -match "\bdevice\b" -and $_ -notmatch "List of devices"
    })
}

function Assert-AndroidDevice([string]$RequestedDeviceId) {
  $deviceLines = Get-AndroidDeviceLines
  if ($deviceLines.Count -eq 0) {
    throw "No Android device attached. Connect a device or emulator, enable USB debugging, then rerun pnpm native:run:android."
  }
  if ($RequestedDeviceId) {
    $escapedDeviceId = [Regex]::Escape($RequestedDeviceId)
    $matched = $deviceLines | Where-Object { $_ -match "^$escapedDeviceId\s+" }
    if (-not $matched) {
      throw "Android device '$RequestedDeviceId' was not found. Run pnpm native:devices to list available devices."
    }
  }
  return $deviceLines.Count
}

Require-File $hbuilderCli "HBuilderX CLI not found: $hbuilderCli"
Require-File $nativeProject "native app project not found: $nativeProject"
Require-File $devicesScript "Native devices script not found: $devicesScript"

if ($Platform -eq "ios" -and $env:OS -eq "Windows_NT") {
  throw "iOS native launch is not available on this Windows host. Use macOS/HBuilderX iOS tooling for simulator or device launch."
}

if ($Platform -eq "android") {
  & $devicesScript -Platform android
  $androidDeviceCount = Assert-AndroidDevice $DeviceId
  Write-Host "Android device preflight: $androidDeviceCount device(s) available."
}

if (-not $SkipPrepare) {
  Push-Location $repoRoot
  try {
    pnpm native:prepare
  } finally {
    Pop-Location
  }
}

if ($Platform -eq "android") {
  $launchArgs = @(
    "launch",
    "app-android",
    "--project",
    $nativeProject,
    "--playground",
    "standard",
    "--pagePath",
    "pages/index/index",
    "--pageQuery",
    "entry=$([Uri]::EscapeDataString($EntryPath))"
  )
  if ($DeviceId) {
    $launchArgs += @("--deviceId", $DeviceId)
  }
  if ($NativeLog) {
    $launchArgs += @("--native-log", "true")
  }
  & $hbuilderCli @launchArgs
} else {
  & $devicesScript -Platform ios-iPhone
  $launchArgs = @(
    "launch",
    "app-ios",
    "--project",
    $nativeProject,
    "--iosTarget",
    "device",
    "--playground",
    "standard",
    "--pagePath",
    "pages/index/index",
    "--pageQuery",
    "entry=$([Uri]::EscapeDataString($EntryPath))"
  )
  if ($DeviceId) {
    $launchArgs += @("--deviceId", $DeviceId)
  }
  & $hbuilderCli @launchArgs
}
