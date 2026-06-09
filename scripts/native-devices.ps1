param(
  [ValidateSet("android", "ios-iPhone", "ios-simulator", "all")]
  [string]$Platform = "all",
  [int]$TimeoutSeconds = 20
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$hbuilderCli = "G:\qiming-uniapp-native-tools\HBuilderX-5.07\HBuilderX\cli.exe"
$adb = "G:\qiming-uniapp-native-tools\android-sdk\platform-tools\adb.exe"
$checks = New-Object System.Collections.Generic.List[object]

function Add-DeviceResult([string]$Name, [string]$Status, [string]$Detail) {
  $checks.Add([pscustomobject]@{
    Name = $Name
    Status = $Status
    Detail = $Detail
  })
}

function Invoke-WithTimeout([scriptblock]$Block, [int]$Timeout) {
  $job = Start-Job -ScriptBlock $Block
  try {
    $completed = Wait-Job -Job $job -Timeout $Timeout
    if (-not $completed) {
      Stop-Job -Job $job -Force
      return [pscustomobject]@{
        ExitCode = 124
        Output = "timed out after $Timeout seconds"
      }
    }
    $output = Receive-Job -Job $job -ErrorAction SilentlyContinue | Out-String
    return [pscustomobject]@{
      ExitCode = 0
      Output = $output.Trim()
    }
  } finally {
    Remove-Job -Job $job -Force -ErrorAction SilentlyContinue
  }
}

function Count-AndroidDevices([string]$AdbOutput) {
  return @(($AdbOutput -split "`n") | Where-Object {
      $_ -match "\bdevice\b" -and $_ -notmatch "List of devices"
    }).Count
}

function Count-HBuilderDevices([string]$Output) {
  if ([string]::IsNullOrWhiteSpace($Output)) {
    return 0
  }
  return @(($Output -split "`n") | Where-Object {
      $line = $_.Trim()
      $line -and $line -notmatch "^\[|\bCLI\b|^\s*$"
    }).Count
}

if (-not (Test-Path -LiteralPath $hbuilderCli)) {
  Add-DeviceResult "HBuilderX CLI" "FAIL" "missing: $hbuilderCli"
} else {
  Add-DeviceResult "HBuilderX CLI" "OK" $hbuilderCli
}

if ($Platform -eq "all" -or $Platform -eq "android") {
  if (Test-Path -LiteralPath $adb) {
    $adbResult = Invoke-WithTimeout { & "G:\qiming-uniapp-native-tools\android-sdk\platform-tools\adb.exe" devices -l } $TimeoutSeconds
    $androidCount = Count-AndroidDevices $adbResult.Output
    Add-DeviceResult "ADB android devices" ($(if ($androidCount -gt 0) { "OK" } else { "WARN" })) ($(if ($androidCount -gt 0) { "$androidCount device(s)" } else { "no Android device attached" }))
  } else {
    Add-DeviceResult "ADB" "WARN" "missing: $adb"
  }

  if (Test-Path -LiteralPath $hbuilderCli) {
    $androidCli = Invoke-WithTimeout { & "G:\qiming-uniapp-native-tools\HBuilderX-5.07\HBuilderX\cli.exe" devices list --platform android } $TimeoutSeconds
    $androidCliCount = Count-HBuilderDevices $androidCli.Output
    Add-DeviceResult "HBuilderX android devices" ($(if ($androidCli.ExitCode -eq 124) { "WARN" } elseif ($androidCliCount -gt 0) { "OK" } else { "WARN" })) ($(if ($androidCli.ExitCode -eq 124) { $androidCli.Output } elseif ($androidCliCount -gt 0) { "$androidCliCount device(s)" } else { "no device returned by HBuilderX" }))
  }
}

if ($Platform -eq "all" -or $Platform -eq "ios-iPhone" -or $Platform -eq "ios-simulator") {
  if ($env:OS -eq "Windows_NT") {
    Add-DeviceResult "iOS devices" "WARN" "iOS device/simulator launch requires macOS or HBuilderX iOS tooling; current host is Windows."
  } elseif (Test-Path -LiteralPath $hbuilderCli) {
    $iosPlatform = if ($Platform -eq "ios-simulator") { "ios-simulator" } else { "ios-iPhone" }
    $iosCli = Invoke-WithTimeout { & "G:\qiming-uniapp-native-tools\HBuilderX-5.07\HBuilderX\cli.exe" devices list --platform $using:iosPlatform } $TimeoutSeconds
    $iosCount = Count-HBuilderDevices $iosCli.Output
    Add-DeviceResult "HBuilderX $iosPlatform devices" ($(if ($iosCli.ExitCode -eq 124) { "WARN" } elseif ($iosCount -gt 0) { "OK" } else { "WARN" })) ($(if ($iosCli.ExitCode -eq 124) { $iosCli.Output } elseif ($iosCount -gt 0) { "$iosCount device(s)" } else { "no device returned by HBuilderX" }))
  }
}

$checks | Format-Table -AutoSize -Wrap

$okCount = @($checks | Where-Object { $_.Status -eq "OK" }).Count
$warnCount = @($checks | Where-Object { $_.Status -eq "WARN" }).Count
$failCount = @($checks | Where-Object { $_.Status -eq "FAIL" }).Count
Write-Host ""
Write-Host "Native devices summary: $okCount OK, $warnCount WARN, $failCount FAIL"

if ($failCount -gt 0) {
  exit 1
}
