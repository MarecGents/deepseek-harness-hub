#requires -Version 5.1
<#
.SYNOPSIS
  dsh-hub 卸载级 profile 清理：从 $DSH_HOME 的各个 profile 中移除所有
  dsh-hub 相关残留（bundles 条目 + junction 链接点），保留 .dsh 本身与
  用户其他配置（会话/设置/凭据不动）。

.DESCRIPTION
  背景：dsh-hub 把自身与 4 个插件以 junction 方式装配进
  $DSH_HOME/profiles/<name>/（node_modules/@marecgents/dsh-hub 与
  node_modules/@dsh-external/*），并在 package.json 的 dsh.profile.bundles
  注册条目。卸载时若不清理这些条目与悬空 junction，plain `dsh web` 启动
  即崩（resolveBundleDir 对无法解析的 bundle 直接 throw：
  "cannot resolve profile bundle …"），旧状态还会污染重装（rc.9 测试机
  卡「启动 dsh 服务并载入工作区」根因，2026-08-27 隔离复现）。

  本脚本幂等：bundles 移除 @marecgents/dsh-hub 与 @dsh-external/*；
  删除对应 junction 链接点（(Get-Item).Delete() 只删链接点不递归目标）；
  不触碰 .dsh 其他内容。shell 卸载器在 PREUNINSTALL（删 _up_ 前）调用它；
  旧安装无本脚本时由 NSIS POSTUNINSTALL 的内联兜底完成同类清理。

.PARAMETER DshHome
  dsh 数据目录；缺省取 $env:DSH_HOME，否则 ~/.dsh。

.EXAMPLE
  powershell -NoProfile -ExecutionPolicy Bypass -File uninstall-cleanup.ps1 -DshHome E:\temp\dshhome
#>
[CmdletBinding()]
param(
  [string]$DshHome = ''
)

$ErrorActionPreference = 'SilentlyContinue'
function Write-Clean([string]$Msg) { Write-Output "dsh-hub-cleanup: $Msg" }

if ([string]::IsNullOrWhiteSpace($DshHome)) {
  if ($env:DSH_HOME) { $DshHome = $env:DSH_HOME }
  else { $DshHome = Join-Path $env:USERPROFILE '.dsh' }
}
$profilesDir = Join-Path $DshHome 'profiles'
if (-not (Test-Path -LiteralPath $profilesDir)) {
  Write-Clean "no profiles dir, nothing to do ($profilesDir)"
  exit 0
}

# 删除 ReparsePoint 链接点本身（不递归目标；悬空 junction 同样可删。
# 与 NSIS 内联兜底同款 (Get-Item).Delete() 语义，实测安全。）
function Remove-ReparsePoint([string]$Path) {
  if (-not (Test-Path -LiteralPath $Path)) { return }
  $item = Get-Item -LiteralPath $Path -Force
  if ($null -eq $item) { return }
  if (-not ($item.Attributes -band [IO.FileAttributes]::ReparsePoint)) { return }
  $item.Delete()
  if (-not (Test-Path -LiteralPath $Path)) { Write-Clean "removed link: $Path" }
}

$profiles = @(Get-ChildItem -LiteralPath $profilesDir -Directory)
foreach ($profile in $profiles) {
  $pkg = Join-Path $profile.FullName 'package.json'
  if (Test-Path -LiteralPath $pkg) {
    try {
      $o = Get-Content -LiteralPath $pkg -Raw | ConvertFrom-Json
      $bundles = @($o.dsh.profile.bundles)
      $kept = @($bundles | Where-Object {
        $_ -ne '@marecgents/dsh-hub' -and $_ -notlike '@dsh-external/*'
      })
      if ($kept.Count -ne $bundles.Count) {
        $o.dsh.profile.bundles = $kept
        # 关键：JSON 写入必须无 BOM且为单字符串——PS5.1 Set-Content -Encoding UTF8
        # 会带 BOM（dsh JSON.parse 不接受："Unexpected token ﻿" 启动即崩）；
        # 直接管道 ConvertTo-Json 会产生 string[]（WriteAllText 写出空文件），
        # 必须 Out-String 聚合成单字符串。
        $raw = ($o | ConvertTo-Json -Depth 10 | Out-String).Trim() + "`n"
        [System.IO.File]::WriteAllText($pkg, $raw, (New-Object System.Text.UTF8Encoding($false)))
        Write-Clean ("bundles cleaned in {0}: {1}" -f $profile.Name, ($bundles -join ', '))
      }
    } catch {
      # 任一 profile 清单损坏不影响其他 profile 与 junction 清理
    }
  }
  $nm = Join-Path $profile.FullName 'node_modules'
  if (Test-Path -LiteralPath $nm) {
    Remove-ReparsePoint (Join-Path $nm '@marecgents\dsh-hub')
    $extDir = Join-Path $nm '@dsh-external'
    if (Test-Path -LiteralPath $extDir) {
      $plugins = @(Get-ChildItem -LiteralPath $extDir -Force)
      foreach ($p in $plugins) { Remove-ReparsePoint $p.FullName }
      if (@(Get-ChildItem -LiteralPath $extDir -Force).Count -eq 0) {
        Remove-Item -LiteralPath $extDir -Force
        Write-Clean "removed empty @dsh-external dir: $extDir"
      }
    }
  }
}

Write-Clean "done (DshHome=$DshHome)"
exit 0