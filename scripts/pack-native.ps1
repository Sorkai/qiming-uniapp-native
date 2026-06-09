param(
  [ValidateSet("android", "ios", "android,ios")]
  [string]$Platform = "android",
  [switch]$SkipPrepare
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$nativeProject = Join-Path $repoRoot "native-app"
$hbuilderCli = "G:\qiming-uniapp-native-tools\HBuilderX-5.07\HBuilderX\cli.exe"
$configPath = Join-Path $nativeProject "pack-config.local.json"
$examplePath = Join-Path $nativeProject "pack-config.example.json"

function Require-File([string]$Path, [string]$Message) {
  if (-not (Test-Path -LiteralPath $Path)) {
    throw $Message
  }
}

Require-File $hbuilderCli "HBuilderX CLI not found: $hbuilderCli"
Require-File $nativeProject "native app project not found: $nativeProject"
Require-File $configPath "Missing local pack config: $configPath. Copy $examplePath to pack-config.local.json and fill local certificate values."

$configText = Get-Content -LiteralPath $configPath -Raw -Encoding UTF8
if ($configText -match "CHANGE_ME") {
  throw "pack-config.local.json still contains CHANGE_ME placeholders."
}

if (-not $SkipPrepare) {
  Push-Location $repoRoot
  try {
    pnpm native:prepare
  } finally {
    Pop-Location
  }
}

& $hbuilderCli project open --path $nativeProject

$platformArg = if ($Platform -eq "android,ios") { "android,ios" } else { $Platform }
& $hbuilderCli pack --project $nativeProject --platform $platformArg --config $configPath --safemode true --sourceMap false
