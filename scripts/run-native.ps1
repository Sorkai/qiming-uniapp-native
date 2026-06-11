param(
  [ValidateSet("android", "ios")]
  [string]$Platform = "android",
  [string]$DeviceId = "",
  [string]$EntryPath = "/home",
  [string]$DevServer = "",
  [string]$DemoRole = "",
  [switch]$SkipPrepare,
  [switch]$NativeLog,
  [switch]$SkipGrantPermissions,
  [switch]$KeepBaseApk,
  [switch]$KeepRuntimeData,
  [int]$LaunchTimeoutSeconds = 180
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$nativeProject = Join-Path $repoRoot "native-app"
$hbuilderCli = "G:\qiming-uniapp-native-tools\HBuilderX-5.07\HBuilderX\cli.exe"
$adb = "G:\qiming-uniapp-native-tools\android-sdk\platform-tools\adb.exe"
$androidBaseApk = "G:\qiming-uniapp-native-tools\HBuilderX-5.07\HBuilderX\plugins\launcher\base\android_base.apk"
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

function Get-PhysicalAndroidDeviceLines {
  return @(Get-AndroidDeviceLines | Where-Object {
      $_ -notmatch "^emulator-"
    })
}

function Get-WindowsAndroidUsbIssues {
  if ($env:OS -ne "Windows_NT") {
    return @()
  }

  $androidVendorIds = @(
    "USB\VID_12D1",
    "USB\VID_18D1",
    "USB\VID_2717",
    "USB\VID_2A70",
    "USB\VID_22D9",
    "USB\VID_04E8",
    "USB\VID_0BB4",
    "USB\VID_2A45"
  )
  $keywordPattern = "Android|HUAWEI|HONOR|Harmony|Phone|MTP|ADB|HDB"

  try {
    $issues = @()
    $devices = @(Get-CimInstance Win32_PnPEntity -ErrorAction SilentlyContinue)

    foreach ($device in $devices) {
      $deviceId = ([string]$device.PNPDeviceID).ToUpperInvariant()
      if ([string]::IsNullOrWhiteSpace($deviceId)) {
        continue
      }

      $vendorMatch = $false
      foreach ($vendorId in $androidVendorIds) {
        if ($deviceId.StartsWith($vendorId)) {
          $vendorMatch = $true
          break
        }
      }

      $keywordMatch = (
        ($device.Name -match $keywordPattern) -or
        ($device.Description -match $keywordPattern)
      )
      $problemCode = 0
      [void][int]::TryParse([string]$device.ConfigManagerErrorCode, [ref]$problemCode)
      $status = [string]$device.Status
      $hasProblem = (($status -and $status -ne "OK") -or $problemCode -ne 0)

      if (($vendorMatch -or $keywordMatch) -and $hasProblem) {
        $name = [string]$device.Name
        if ($deviceId.StartsWith("USB\VID_12D1")) {
          $name = "Huawei/Honor Android USB ($name)"
        }
        $issues += [pscustomobject]@{
          Name = $name
          InstanceId = $device.PNPDeviceID
          Status = $status
          Problem = $problemCode
        }
      }
    }

    return $issues
  } catch {
    return @()
  }
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

function Get-AndroidDeviceId([string]$RequestedDeviceId) {
  $deviceLines = Get-AndroidDeviceLines
  if ($RequestedDeviceId) {
    return $RequestedDeviceId
  }
  $firstLine = $deviceLines | Select-Object -First 1
  return ($firstLine -split "\s+")[0]
}

function Grant-HBuilderPermissions([string]$ResolvedDeviceId) {
  $packageName = "io.dcloud.HBuilder"
  $permissions = @(
    "android.permission.READ_EXTERNAL_STORAGE",
    "android.permission.WRITE_EXTERNAL_STORAGE",
    "android.permission.CAMERA",
    "android.permission.RECORD_AUDIO",
    "android.permission.ACCESS_FINE_LOCATION",
    "android.permission.ACCESS_COARSE_LOCATION",
    "android.permission.READ_PHONE_STATE",
    "android.permission.CALL_PHONE",
    "android.permission.PROCESS_OUTGOING_CALLS"
  )

  foreach ($permission in $permissions) {
    & $adb -s $ResolvedDeviceId shell pm grant $packageName $permission 2>$null
  }
  & $adb -s $ResolvedDeviceId shell appops set $packageName MANAGE_EXTERNAL_STORAGE allow 2>$null
}

function Get-HBuilderVersionName([string]$ResolvedDeviceId) {
  $packageName = "io.dcloud.HBuilder"
  $packageInfo = & $adb -s $ResolvedDeviceId shell dumpsys package $packageName 2>$null | Out-String
  if ($packageInfo -match "versionName=([^\s]+)") {
    return $Matches[1]
  }
  return ""
}

function Install-HBuilderBase([string]$ResolvedDeviceId, [string]$Reason) {
  $packageName = "io.dcloud.HBuilder"
  Write-Host "$Reason Installing HBuilder Android base 15.07..."
  & $adb -s $ResolvedDeviceId shell am force-stop $packageName 2>$null
  & $adb -s $ResolvedDeviceId uninstall $packageName 2>$null | Out-Null
  & $adb -s $ResolvedDeviceId install -r -d $androidBaseApk
  $installedVersion = Get-HBuilderVersionName $ResolvedDeviceId
  if ($installedVersion -ne "15.07") {
    throw "HBuilder Android base install verification failed. Expected 15.07, got '$installedVersion'."
  }
  Write-Host "HBuilder Android base installed: $installedVersion"
}

function Ensure-HBuilderBase([string]$ResolvedDeviceId, [bool]$PreserveInstalledBase) {
  Require-File $androidBaseApk "HBuilderX Android base APK not found: $androidBaseApk"
  $expectedVersion = "15.07"
  $installedVersion = Get-HBuilderVersionName $ResolvedDeviceId

  if ($PreserveInstalledBase -and $installedVersion -eq $expectedVersion) {
    Write-Host "HBuilder Android base: $installedVersion"
    return
  }

  if (-not $PreserveInstalledBase -and $installedVersion -eq $expectedVersion) {
    Install-HBuilderBase $ResolvedDeviceId "Refreshing matching base to avoid stale 5.01/5.07 runtime resources."
    return
  }

  if ($installedVersion) {
    Install-HBuilderBase $ResolvedDeviceId "HBuilder Android base version is $installedVersion, expected $expectedVersion."
  } else {
    Install-HBuilderBase $ResolvedDeviceId "HBuilder Android base is not installed."
  }
}

function Reset-HBuilderRuntime([string]$ResolvedDeviceId) {
  $packageName = "io.dcloud.HBuilder"
  & $adb -s $ResolvedDeviceId shell am force-stop $packageName 2>$null
  & $adb -s $ResolvedDeviceId shell pm clear $packageName 2>$null
}

function Clear-NativeBuildOutput {
  $paths = @(
    (Join-Path $nativeProject "dist\build"),
    (Join-Path $nativeProject "dist\dev")
  )
  foreach ($path in $paths) {
    if (Test-Path -LiteralPath $path) {
      Remove-Item -LiteralPath $path -Recurse -Force
    }
  }
}

function Stop-NativeAppCompilerJobs {
  $escapedNativeProject = [Regex]::Escape($nativeProject)
  $jobs = Get-CimInstance Win32_Process | Where-Object {
    $_.CommandLine -match $escapedNativeProject -and
    $_.CommandLine -match "vite-plugin-uni\\bin\\uni\.js" -and
    $_.CommandLine -match "\s-p\s+app\b"
  }
  foreach ($job in $jobs) {
    Stop-Process -Id $job.ProcessId -Force -ErrorAction SilentlyContinue
  }
}

function Wait-AndroidLaunchReady([string]$ResolvedDeviceId, [string]$ExpectedEntryPath, [string]$ExpectedUrlPattern, [int]$TimeoutSeconds) {
  $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
  $expectedRoute = if ($ExpectedEntryPath) { "#$ExpectedEntryPath" } else { "" }
  $mismatchPattern = "compiled using HBuilderX 5\.01|mobile SDK version is 5\.07|Mismatching versions"

  while ((Get-Date) -lt $deadline) {
    $processId = (& $adb -s $ResolvedDeviceId shell pidof io.dcloud.HBuilder 2>$null | Out-String).Trim()
    $recentLogs = & $adb -s $ResolvedDeviceId logcat -d -t 500 2>$null | Out-String

    if ($recentLogs -match $mismatchPattern) {
      throw "Android runtime reported an HBuilderX version mismatch. Reinstall the 15.07 base APK and clear runtime data."
    }

    if (
      $processId -and
      $recentLogs -match $ExpectedUrlPattern -and
      (-not $expectedRoute -or $recentLogs -match [Regex]::Escape($expectedRoute))
    ) {
      return $true
    }

    if ($processId -and (Test-AndroidWebViewUrl $ResolvedDeviceId $ExpectedUrlPattern $expectedRoute)) {
      return $true
    }

    Start-Sleep -Seconds 2
  }

  return $false
}

function Test-AndroidWebViewUrl([string]$ResolvedDeviceId, [string]$ExpectedUrlPattern, [string]$ExpectedRoute) {
  try {
    $localPort = Get-AndroidWebViewDevToolsPort $ResolvedDeviceId
    $targetsJson = Invoke-WebRequest -UseBasicParsing -Uri "http://127.0.0.1:$localPort/json" -TimeoutSec 2
    $targets = $targetsJson.Content | ConvertFrom-Json
    foreach ($target in @($targets)) {
      $url = [string]$target.url
      if (
        $url -and
        $url -match $ExpectedUrlPattern -and
        (-not $ExpectedRoute -or $url -match [Regex]::Escape($ExpectedRoute))
      ) {
        return $true
      }
    }
  } catch {
    return $false
  }
  return $false
}

function Get-AndroidWebViewDevToolsPort([string]$ResolvedDeviceId) {
  $processId = (& $adb -s $ResolvedDeviceId shell pidof io.dcloud.HBuilder 2>$null | Out-String).Trim()
  if (-not $processId) {
    throw "HBuilder runtime is not running on Android device."
  }

  $localPort = 9224
  & $adb -s $ResolvedDeviceId forward --remove "tcp:$localPort" 2>$null
  & $adb -s $ResolvedDeviceId forward "tcp:$localPort" "localabstract:webview_devtools_remote_$processId" | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw "Failed to forward Android WebView DevTools port for process $processId."
  }
  return $localPort
}

function Invoke-AndroidWebViewNavigation([string]$ResolvedDeviceId, [string]$TargetUrl) {
  $localPort = Get-AndroidWebViewDevToolsPort $ResolvedDeviceId
  $targetUrlJson = $TargetUrl | ConvertTo-Json -Compress
  $script = @"
const WebSocket = require("ws");
const http = require("http");
let targetUrl = $targetUrlJson;

function requestJson(url) {
  return new Promise((resolve, reject) => {
    const request = http.get(url, response => {
      let body = "";
      response.setEncoding("utf8");
      response.on("data", chunk => {
        body += chunk;
      });
      response.on("end", () => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error("HTTP " + response.statusCode + " for " + url));
          return;
        }
        try {
          resolve(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
    request.on("error", reject);
    request.setTimeout(5000, () => {
      request.destroy(new Error("Timeout requesting " + url));
    });
  });
}

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

async function requestJsonWithRetry(url, attempts = 20) {
  let lastError;
  for (let index = 0; index < attempts; index += 1) {
    try {
      return await requestJson(url);
    } catch (error) {
      lastError = error;
      await sleep(500);
    }
  }
  throw lastError;
}

async function openWebSocketWithRetry(url, attempts = 10) {
  let lastError;
  for (let index = 0; index < attempts; index += 1) {
    try {
      const ws = new WebSocket(url);
      await new Promise((resolve, reject) => {
        ws.once("open", resolve);
        ws.once("error", reject);
      });
      return ws;
    } catch (error) {
      lastError = error;
      await sleep(500);
    }
  }
  throw lastError;
}

async function main() {
  let page = null;
  for (let index = 0; index < 20; index += 1) {
    const pages = await requestJsonWithRetry("http://127.0.0.1:$localPort/json", 4);
    page =
      pages.find(item => item.url && item.url.includes("/hybrid/html/index.html")) ||
      pages.find(item => item.type === "page" && item.url && item.url !== "about:blank");
    if (page && page.webSocketDebuggerUrl) {
      break;
    }
    await sleep(500);
  }
  if (!page) throw new Error("No debuggable WebView page found.");

  const ws = await openWebSocketWithRetry(page.webSocketDebuggerUrl);
  let id = 0;
  const pending = new Map();
  ws.on("message", data => {
    const message = JSON.parse(data.toString());
    if (message.id && pending.has(message.id)) {
      const { resolve, reject } = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) reject(new Error(JSON.stringify(message.error)));
      else resolve(message.result);
    }
  });
  function send(method, params = {}) {
    const messageId = ++id;
    ws.send(JSON.stringify({ id: messageId, method, params }));
    return new Promise((resolve, reject) =>
      pending.set(messageId, { resolve, reject })
    );
  }

  await send("Page.enable");
  await send("Runtime.enable");
  const statusResult = await send("Runtime.evaluate", {
    expression: "(() => { try { return Number(typeof plus !== 'undefined' && plus.navigator && plus.navigator.getStatusbarHeight && plus.navigator.getStatusbarHeight()) || 0; } catch (_) { return 0; } })()",
    returnByValue: true
  });
  const statusTop = Number(statusResult.result && statusResult.result.value) || 0;
  const appendQuery = (url, key, value) =>
    url + (url.includes("?") ? "&" : "?") + key + "=" + encodeURIComponent(value);
  targetUrl = appendQuery(targetUrl, "qimingNative", "1");
  if (statusTop > 0) {
    targetUrl = appendQuery(targetUrl, "nativeStatusTop", String(statusTop));
  }
  const targetHash = targetUrl.includes("#")
    ? targetUrl.slice(targetUrl.indexOf("#")).split("?")[0]
    : "";
  await send("Page.navigate", { url: targetUrl });
  let href = "";
  for (let index = 0; index < 30; index += 1) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const result = await send("Runtime.evaluate", {
      expression: "(() => { const text = document.body ? document.body.innerText.replace(/\\s+/g, ' ').trim() : ''; return { href: location.href, readyState: document.readyState, textLength: text.length, title: document.title }; })()",
      returnByValue: true
    });
    const state = result.result && result.result.value || {};
    href = state.href || "";
    if (
      href.includes(targetUrl.split("#")[0]) &&
      (!targetHash || href.includes(targetHash)) &&
      state.readyState !== "loading" &&
      Number(state.textLength || 0) > 0
    ) {
      break;
    }
  }
  console.log(href || "");
  ws.close();
}

main().catch(error => {
  console.error(error && (error.stack || error.message) || error);
  process.exit(1);
});
"@

  $actualUrl = ""
  $lastNodeOutput = ""
  $navigationSucceeded = $false
  for ($attempt = 1; $attempt -le 4; $attempt++) {
    if ($attempt -gt 1) {
      Start-Sleep -Seconds (2 * $attempt)
      [void](Get-AndroidWebViewDevToolsPort $ResolvedDeviceId)
    }

    $previousErrorActionPreference = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    try {
      $nodeOutput = $script | node - 2>&1
      $exitCode = $LASTEXITCODE
    } finally {
      $ErrorActionPreference = $previousErrorActionPreference
    }
    $lastNodeOutput = (($nodeOutput | Out-String).Trim())
    if ($exitCode -eq 0) {
      $actualUrl = (($nodeOutput | Where-Object { $_ } | Select-Object -Last 1) | Out-String).Trim()
      $navigationSucceeded = $true
      break
    }
    Write-Warning "Android WebView navigation attempt $attempt failed: $lastNodeOutput"
  }

  if (-not $navigationSucceeded) {
    throw "Failed to navigate Android WebView to dev server after retries: $TargetUrl. Last error: $lastNodeOutput"
  }
  if ($actualUrl -notmatch [Regex]::Escape($TargetUrl.Split("#")[0])) {
    throw "Android WebView navigation did not reach dev server. Expected '$TargetUrl', got '$actualUrl'."
  }
  Write-Host "Android WebView navigated: $actualUrl"
}

function Invoke-AndroidHBuilderLaunch([string[]]$LaunchArgs, [string]$ResolvedDeviceId, [string]$ExpectedEntryPath, [string]$ExpectedUrlPattern, [string]$ExpectedUrlLabel) {
  & $adb -s $ResolvedDeviceId logcat -c 2>$null

  $process = Start-Process `
    -FilePath $hbuilderCli `
    -ArgumentList $LaunchArgs `
    -WindowStyle Hidden `
    -PassThru

  Write-Host "HBuilderX launch pid: $($process.Id)"
  $ready = Wait-AndroidLaunchReady $ResolvedDeviceId $ExpectedEntryPath $ExpectedUrlPattern $LaunchTimeoutSeconds

  if ($ready) {
    $routeLabel = if ($ExpectedEntryPath) { "#$ExpectedEntryPath" } else { "" }
    Write-Host "Android launch verified: $ExpectedUrlLabel$routeLabel"
    if (-not $process.HasExited) {
      Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    }
    Stop-NativeAppCompilerJobs
    return
  }

  if (-not $process.HasExited) {
    Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
    Stop-NativeAppCompilerJobs
    $routeLabel = if ($ExpectedEntryPath) { "#$ExpectedEntryPath" } else { "" }
    throw "Timed out after $LaunchTimeoutSeconds seconds waiting for Android runtime to load $ExpectedUrlLabel$routeLabel."
  }

  if ($process.ExitCode -ne 0) {
    throw "HBuilderX CLI launch failed with exit code $($process.ExitCode)."
  }

  $routeLabel = if ($ExpectedEntryPath) { "#$ExpectedEntryPath" } else { "" }
  throw "HBuilderX CLI exited before Android runtime loaded $ExpectedUrlLabel$routeLabel."
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
  $physicalAndroidCount = (Get-PhysicalAndroidDeviceLines).Count
  $usbIssues = @(Get-WindowsAndroidUsbIssues)
  Write-Host "Android device preflight: $androidDeviceCount ADB device(s), $physicalAndroidCount physical device(s)."
  if (-not $DeviceId -and $physicalAndroidCount -eq 0) {
    Write-Warning "No physical Android device is visible to ADB; the launch will use an emulator unless you pass -DeviceId after fixing USB debugging/driver access."
  }
  foreach ($issue in $usbIssues) {
    Write-Warning "Windows sees an Android-like USB device that is not usable by ADB: $($issue.Name) [$($issue.InstanceId)] status=$($issue.Status) problem=$($issue.Problem)."
  }
  $resolvedAndroidDeviceId = Get-AndroidDeviceId $DeviceId
  if ($resolvedAndroidDeviceId -match "^emulator-") {
    Write-Host "Resolved Android target: $resolvedAndroidDeviceId (emulator)"
  } else {
    Write-Host "Resolved Android target: $resolvedAndroidDeviceId (physical)"
  }
}

if (-not $SkipPrepare) {
  Push-Location $repoRoot
  try {
    pnpm native:prepare
  } finally {
    Pop-Location
  }
}

$pageQueryParts = @("entry=$([Uri]::EscapeDataString($EntryPath))")
$expectedUrlPattern = "hybrid/html/index\.html"
$expectedUrlLabel = "hybrid/html/index.html"
$devServerTargetUrl = ""
if ($DevServer) {
  $pageQueryParts += "devServer=$([Uri]::EscapeDataString($DevServer))"
  $expectedUrlPattern = [Regex]::Escape($DevServer)
  $expectedUrlLabel = $DevServer
  $normalizedDevServer = $DevServer.TrimEnd("/")
  $devServerTargetUrl = "$normalizedDevServer/#$EntryPath"
}
if ($DemoRole) {
  $pageQueryParts += "demoRole=$([Uri]::EscapeDataString($DemoRole))"
  if ($devServerTargetUrl) {
    $separator = if ($devServerTargetUrl.Contains("?")) { "&" } else { "?" }
    $devServerTargetUrl = "${devServerTargetUrl}${separator}demoRole=$([Uri]::EscapeDataString($DemoRole))"
  }
}
$pageQuery = $pageQueryParts -join "&"

if ($Platform -eq "android") {
  if (-not $SkipGrantPermissions) {
    Ensure-HBuilderBase $resolvedAndroidDeviceId $KeepBaseApk.IsPresent
    if (-not $KeepRuntimeData) {
      Reset-HBuilderRuntime $resolvedAndroidDeviceId
    }
    Grant-HBuilderPermissions $resolvedAndroidDeviceId
  }

  Clear-NativeBuildOutput

  $launchArgs = @(
    "launch",
    "app-android",
    "--project",
    $nativeProject,
    "--playground",
    "standard",
    "--cleanCache",
    "true",
    "--pagePath",
    "pages/index/index",
    "--pageQuery",
    $pageQuery
  )
  if ($DeviceId) {
    $launchArgs += @("--deviceId", $DeviceId)
  }
  if ($NativeLog) {
    $launchArgs += @("--native-log", "true")
  }
  if ($DevServer) {
    Invoke-AndroidHBuilderLaunch $launchArgs $resolvedAndroidDeviceId "" "hybrid/html/index\.html" "hybrid/html/index.html"
    Invoke-AndroidWebViewNavigation $resolvedAndroidDeviceId $devServerTargetUrl
  } else {
    Invoke-AndroidHBuilderLaunch $launchArgs $resolvedAndroidDeviceId $EntryPath $expectedUrlPattern $expectedUrlLabel
  }
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
    $pageQuery
  )
  if ($DeviceId) {
    $launchArgs += @("--deviceId", $DeviceId)
  }
  & $hbuilderCli @launchArgs
}
