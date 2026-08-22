#requires -Version 5.1
<#
.SYNOPSIS
  dsh-hub M5 bootstrap: installs a private Node runtime + dsh dependencies
  under <InstallDir>\dsh-hub-win\ (Windows PowerShell 5.1 compatible).

.DESCRIPTION
  Private layout (no global system pollution):
    <InstallDir>\dsh-hub-win\node\   -> node.exe + npm.cmd (downloaded, multi-source)
    <InstallDir>\dsh-hub-win\        -> npm --prefix global dir (@deepseek-ai/dsh + pnpm;
                                        dsh.cmd / pnpm.cmd shims are generated here,
                                        node.exe is linked here so the shims are
                                        self-contained without PATH changes)

  Flow:
    1. If <InstallDir>\dsh-hub-win\node\node.exe exists and --version >= 24 -> skip download.
    2. Probe >= 4 node download sources (official + 3 mainland-China mirrors) with a
       timed HEAD request; pick the fastest responder (failures/timeouts are skipped).
    3. Download the zip (Invoke-WebRequest, Start-BitsTransfer fallback), Expand-Archive,
       move the inner node-vX.Y.Z-win-x64/ contents into <InstallDir>\dsh-hub-win\node\.
    4. Probe >= 4 npm registries the same way, then run the private npm:
       npm install -g @deepseek-ai/dsh pnpm --prefix <InstallDir>\dsh-hub-win --registry <fastest>
    5. Progress is written to stdout as "DEP: <phase>" lines so the NSIS installer
       (nsExec::ExecToLog) can merge them into its detail log.

  Idempotent: re-running only fills gaps. Failures write to stderr and exit non-zero;
  the shell falls back to PATH-based resolution at startup, so a failed bootstrap
  never blocks app launch.

.PARAMETER InstallDir
  Application install directory (NSIS $INSTDIR). Defaults to the parent of this
  script's directory (i.e. $INSTDIR when deployed at $INSTDIR\scripts\...).

.PARAMETER DryRun
  Print the plan and source lists only; no network or filesystem changes; exit 0.
  Used to validate syntax / parameter binding without side effects.

.PARAMETER LogPath
  Optional file to append "DEP: <progress>" lines to (in addition to stdout).
  The NSIS installer passes $INSTDIR\dsh-hub-bootstrap.log and polls it so the
  install details view shows live bootstrap progress instead of a frozen UI.

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File dsh-deps-install.ps1 -InstallDir "C:\Program Files\DeepSeek Harness Hub"
#>
[CmdletBinding()]
param(
  [Parameter(Mandatory = $false, Position = 0)]
  [string]$InstallDir = '',

  [string]$LogPath = '',

  [switch]$DryRun
)

Set-StrictMode -Version 2.0
$ErrorActionPreference = 'Stop'

# TLS 1.2 — Windows PowerShell 5.1 may default to an older protocol.
try { [Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12 } catch { }

# ── Constants ───────────────────────────────────────────────────────────
$NodeVersion   = '24.19.0'
$NodeMajorMin  = 24
$ZipName       = "node-v$NodeVersion-win-x64.zip"
$HubDirName    = 'dsh-hub-win'
$ProbeTimeoutMs = 10000

# Node download sources (official + 3 mainland-China mirrors). The Tencent mirror
# serves dist files under /nodejs-release/ (verified live; /nodejs/ is 404).
$NodeSources = @(
  "https://nodejs.org/dist/v$NodeVersion/$ZipName",
  "https://registry.npmmirror.com/-/binary/node/v$NodeVersion/$ZipName",
  "https://mirrors.huaweicloud.com/nodejs/v$NodeVersion/$ZipName",
  "https://mirrors.cloud.tencent.com/nodejs-release/v$NodeVersion/$ZipName"
)

# npm registries (official + 3 mainland-China mirrors). Some mirrors 404 on a bare
# root HEAD, so latency is probed against a real package URL and the ROOT is passed
# to npm --registry.
$NpmRegistries = @(
  'https://registry.npmjs.org/',
  'https://registry.npmmirror.com',
  'https://mirrors.huaweicloud.com/repository/npm/',
  'https://mirrors.cloud.tencent.com/npm/'
)
$NpmProbePath = '@deepseek-ai%2Fdsh'

# ── Layout ──────────────────────────────────────────────────────────────
if ([string]::IsNullOrWhiteSpace($InstallDir)) {
  if ($PSScriptRoot) { $InstallDir = Split-Path $PSScriptRoot -Parent } else { $InstallDir = (Get-Location).Path }
}
$Root     = Join-Path $InstallDir $HubDirName
$NodeDir  = Join-Path $Root 'node'
$NodeExe  = Join-Path $NodeDir 'node.exe'
$NpmCmd   = Join-Path $NodeDir 'npm.cmd'
$DshCmd   = Join-Path $Root 'dsh.cmd'
$PnpmCmd  = Join-Path $Root 'pnpm.cmd'
$DshEntry = Join-Path $Root 'node_modules\@deepseek-ai\dsh\lib\bin.js'
$WorkDir  = Join-Path $Root '.bootstrap'

# ── Helpers ─────────────────────────────────────────────────────────────

# Progress sink: stdout (nsExec capture) + optional log file (NSIS live poll).
$script:DepLog = if ($LogPath) { $LogPath } else { $null }

function Write-Dep {
  param([string]$Msg)
  Write-Output "DEP: $Msg"
  if ($script:DepLog) { Add-Content -LiteralPath $script:DepLog -Value "DEP: $Msg" -Encoding UTF8 }
}

function Exit-Fail {
  param([string]$Msg, [int]$Code = 1)
  [Console]::Error.WriteLine("ERROR: $Msg")
  if ($script:DepLog) { Add-Content -LiteralPath $script:DepLog -Value "DEP: FAILED: $Msg" -Encoding UTF8 }
  exit $Code
}

# HEAD latency probe (ms) for a URL; $null on failure/timeout/non-2xx.
function Test-UrlLatency {
  param([string]$Url, [int]$TimeoutMs = $ProbeTimeoutMs)
  try {
    $req = [System.Net.HttpWebRequest]::Create($Url)
    $req.Method = 'HEAD'
    $req.Timeout = $TimeoutMs
    $req.ReadWriteTimeout = $TimeoutMs
    $req.AllowAutoRedirect = $true
    $req.UserAgent = 'dsh-hub-bootstrap/1.0'
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    $resp = $req.GetResponse()
    $sw.Stop()
    $code = [int]$resp.StatusCode
    $resp.Close()
    if ($code -ge 200 -and $code -lt 400) { return $sw.ElapsedMilliseconds }
    return $null
  } catch {
    return $null
  }
}

# Fastest responsive URL from a candidate list; $null if all fail.
function Select-Fastest {
  param([string[]]$Urls)
  $best = $null
  $bestMs = [long]::MaxValue
  foreach ($u in $Urls) {
    $ms = Test-UrlLatency -Url $u
    if ($null -ne $ms -and $ms -lt $bestMs) { $best = $u; $bestMs = $ms }
  }
  return $best
}

# Fastest responsive npm registry ROOT (probed via a real package URL).
function Select-FastestNpmRegistry {
  $best = $null
  $bestMs = [long]::MaxValue
  foreach ($r in $NpmRegistries) {
    $probe = $r.TrimEnd('/') + '/' + $NpmProbePath
    $ms = Test-UrlLatency -Url $probe
    if ($null -ne $ms -and $ms -lt $bestMs) { $best = $r; $bestMs = $ms }
  }
  return $best
}

# Private node ready = node.exe exists and --version reports >= 24.
function Test-NodeReady {
  if (-not (Test-Path -LiteralPath $NodeExe)) { return $false }
  try {
    $v = (& $NodeExe --version 2>$null | Out-String).Trim()
    if ($LASTEXITCODE -ne 0) { return $false }
    if ($v -match '^v(\d+)') { return [int]$matches[1] -ge $NodeMajorMin }
  } catch { }
  return $false
}

# dsh + pnpm ready = shims exist, entry exists, and dsh answers a version.
function Test-PrivateDepsReady {
  if (-not (Test-Path -LiteralPath $DshCmd))  { return $false }
  if (-not (Test-Path -LiteralPath $DshEntry)){ return $false }
  if (-not (Test-Path -LiteralPath $PnpmCmd)) { return $false }
  # The plugin package itself must also be present (dsh web loads
  # @marecgents/dsh-hub from the private prefix via the junction).
  $HubPkg = Join-Path $Root 'node_modules\@marecgents\dsh-hub\package.json'
  if (-not (Test-Path -LiteralPath $HubPkg)) { return $false }
  try {
    $v = (& $NodeExe $DshEntry --version 2>$null | Out-String).Trim()
    if ($LASTEXITCODE -ne 0 -or $v -notmatch '\d+\.\d+') { return $false }
  } catch { return $false }
  return $true
}

# Download with Invoke-WebRequest; Start-BitsTransfer fallback; then a system
# Node fetch fallback. The last one matters on machines whose Schannel TLS stack
# is broken (PowerShell/curl all fail SSL) but whose Node/OpenSSL still works —
# Node's fetch uses OpenSSL, independent of Windows Schannel.
function Invoke-Download {
  param([string]$Url, [string]$OutFile)
  $ProgressPreference = 'SilentlyContinue'
  try {
    Invoke-WebRequest -Uri $Url -OutFile $OutFile -UseBasicParsing -ErrorAction Stop
    return $true
  } catch { }
  try {
    Start-BitsTransfer -Source $Url -Destination $OutFile -ErrorAction Stop
    return $true
  } catch { }
  $sysNode = Get-Command node.exe -ErrorAction SilentlyContinue
  if ($sysNode) {
    $tmpJs = Join-Path $env:TEMP ("dsh-dl-" + [guid]::NewGuid().ToString('N') + ".mjs")
    $js = "import { writeFileSync } from 'node:fs'; const r = await fetch(process.argv[2], { redirect: 'follow' }); if (!r.ok) process.exit(1); writeFileSync(process.argv[3], Buffer.from(await r.arrayBuffer()));"
    Set-Content -Path $tmpJs -Value $js -Encoding UTF8
    try {
      & $sysNode.Source $tmpJs $Url $OutFile
      if ($LASTEXITCODE -eq 0 -and (Test-Path -LiteralPath $OutFile)) { return $true }
    } catch { }
    finally { Remove-Item $tmpJs -Force -ErrorAction SilentlyContinue }
  }
  return $false
}

# Download + extract node into $NodeDir. Returns $true on success.
function Install-PrivateNode {
  param([string]$Selected)
  New-Item -ItemType Directory -Force -Path $NodeDir | Out-Null
  Write-Dep "20% downloading node v$NodeVersion from $Selected"
  $zip = Join-Path $WorkDir $ZipName
  if (-not (Invoke-Download -Url $Selected -OutFile $zip)) {
    Exit-Fail -Msg "node zip download failed from all candidate sources (last tried: $Selected)"
  }
  $sizeMb = [math]::Round((Get-Item -LiteralPath $zip).Length / 1MB, 1)
  Write-Dep "50% node zip downloaded ($sizeMb MB), extracting..."
  $extract = Join-Path $WorkDir 'extract'
  New-Item -ItemType Directory -Force -Path $extract | Out-Null
  try {
    Expand-Archive -Path $zip -DestinationPath $extract -Force
  } catch {
    Exit-Fail -Msg "node zip extraction failed: $($_.Exception.Message)"
  }
  # Zip contains a single node-vX.Y.Z-win-x64/ folder; move its contents up.
  $inner = Get-ChildItem -LiteralPath $extract -Directory | Select-Object -First 1
  if ($null -eq $inner) { Exit-Fail -Msg "node zip contained no top-level directory" }
  Get-ChildItem -LiteralPath $inner.FullName -Force | Move-Item -Destination $NodeDir -Force
  Write-Dep "65% node runtime ready at $NodeExe"
  return $true
}

# Place node.exe at the npm prefix root so generated shims (which look for
# %dp0%\node.exe) are self-contained. Hard link first, copy as fallback.
function Ensure-ShimNode {
  $target = Join-Path $Root 'node.exe'
  if (Test-Path -LiteralPath $target) { return $true }
  try {
    New-Item -ItemType HardLink -Path $target -Target $NodeExe -ErrorAction Stop | Out-Null
    Write-Dep "node.exe hard-linked to npm prefix root ($target)"
  } catch {
    try {
      Copy-Item -LiteralPath $NodeExe -Destination $target -Force -ErrorAction Stop
      Write-Dep "node.exe copied to npm prefix root ($target)"
    } catch {
      [Console]::Error.WriteLine("WARN: could not place node.exe at prefix root: $($_.Exception.Message); shims will fall back to PATH")
      return $false
    }
  }
  return $true
}

# npm install -g @deepseek-ai/dsh @marecgents/dsh-hub pnpm into the private prefix.
function Install-PrivateDeps {
  param([string]$Registry)
  Write-Dep "75% installing @deepseek-ai/dsh + @marecgents/dsh-hub + pnpm via npm (registry: $Registry)"
  $env:Path = "$NodeDir;$env:Path"
  & $NpmCmd install -g @deepseek-ai/dsh @marecgents/dsh-hub pnpm --prefix $Root --registry $Registry --no-audit --no-fund --loglevel error
  if ($LASTEXITCODE -ne 0) {
    Exit-Fail -Msg "npm global install failed (exit $LASTEXITCODE)"
  }
  return $true
}

# ── Dry-run ─────────────────────────────────────────────────────────────
if ($DryRun) {
  Write-Output "DRYRUN: layout root   : $Root"
  Write-Output "DRYRUN: node dir      : $NodeDir"
  Write-Output "DRYRUN: npm prefix    : $Root (dsh.cmd / pnpm.cmd shims + node.exe)"
  Write-Output "DRYRUN: node sources  :"
  foreach ($s in $NodeSources) { Write-Output "DRYRUN:   - $s" }
  Write-Output "DRYRUN: npm registries:"
  foreach ($r in $NpmRegistries) { Write-Output "DRYRUN:   - $r" }
  if (Test-NodeReady) { Write-Output "DRYRUN: private node already ready -> download skipped" }
  else               { Write-Output "DRYRUN: would download node v$NodeVersion" }
  if (Test-PrivateDepsReady) { Write-Output "DRYRUN: dsh/pnpm already ready -> install skipped" }
  else                       { Write-Output "DRYRUN: would install @deepseek-ai/dsh + pnpm" }
  Write-Output "DRYRUN: ok (no changes made)"
  exit 0
}

# ── Main ────────────────────────────────────────────────────────────────
Write-Dep "1% bootstrapping private Node runtime under $Root"
New-Item -ItemType Directory -Force -Path $Root | Out-Null
New-Item -ItemType Directory -Force -Path $WorkDir | Out-Null

# 1. Node runtime.
if (-not (Test-NodeReady)) {
  Write-Dep "10% probing node download sources (official + 3 mirrors, HEAD latency)..."
  $selected = Select-Fastest -Urls $NodeSources
  if ($null -eq $selected) {
    [Console]::Error.WriteLine("WARN: all node sources failed latency probe; falling back to official source")
    $selected = $NodeSources[0]
  }
  Install-PrivateNode -Selected $selected | Out-Null
  if (-not (Test-NodeReady)) { Exit-Fail -Msg "node runtime self-check failed after install" }
} else {
  Write-Dep "10% node already ready ($(& $NodeExe --version)), download skipped"
}

# 2. node.exe at the prefix root (self-contained shims).
Ensure-ShimNode | Out-Null

# 3. dsh + pnpm via private npm.
if (-not (Test-PrivateDepsReady)) {
  Write-Dep "70% probing npm registries (official + 3 mirrors, HEAD latency)..."
  $registry = Select-FastestNpmRegistry
  if ($null -eq $registry) {
    [Console]::Error.WriteLine("WARN: all npm registries failed latency probe; falling back to official registry")
    $registry = $NpmRegistries[0]
  }
  Install-PrivateDeps -Registry $registry | Out-Null
  if (-not (Test-PrivateDepsReady)) { Exit-Fail -Msg "dsh/pnpm self-check failed after install" }
} else {
  Write-Dep "75% dsh/pnpm already ready, install skipped"
}

# 4. Cleanup + done.
Write-Dep "95% cleaning up temporary files"
Remove-Item -LiteralPath $WorkDir -Recurse -Force -ErrorAction SilentlyContinue
Write-Dep "100% private runtime ready: node=$NodeExe dsh=$DshCmd"
Write-Dep "done"  # stdout + 日志哨兵（NSIS 轮询据此结束安装进度镜像）
exit 0
