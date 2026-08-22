; dsh-hub NSIS installer hooks — consumed by tauri-bundler `bundle.nsis.installerHooks`
; (see tauri-bundler crates/tauri-bundler/src/bundle/windows/nsis/{mod.rs,installer.nsi}).
;
; This file is `!include`d into the generated installer.nsi at compile time. The
; template inserts the macros below at fixed points inside the installer:
;   NSIS_HOOK_PREINSTALL   -> start of Section Install (before file copies)
;   NSIS_HOOK_POSTINSTALL  -> end of Section Install (after shortcuts; the
;                             INSTFILES detail page is still active)
;   NSIS_HOOK_PREUNINSTALL / NSIS_HOOK_POSTUNINSTALL -> uninstaller sections
;
; ── Install (bootstrap with live progress) ────────────────────────────────
; The private Node runtime bootstrap (dsh-deps-install.ps1) downloads node +
; npm packages and takes 1-3 min on first install. A plain ExecWait freezes
; the installer UI with zero feedback ("大厂" uninstallers keep the details
; view alive). We therefore:
;   1. run the bootstrap ASYNC via Exec (hidden window, no console popup),
;   2. poll $INSTDIR\dsh-hub-bootstrap.log (the script appends "DEP: ..." via
;      its -LogPath param) and mirror every NEW line into the details view,
;   3. stop on the "DEP: done" / "DEP: FAILED" sentinels, or after 6 minutes.
; Failure stays tolerated (same semantics as before): the app falls back to
; PATH-based node/dsh resolution at first launch, so a flaky network must
; never block installation.
;
; ── Uninstall (fast path) ─────────────────────────────────────────────────
; Tauri's uninstall template walks every bundled resource with a per-file
; `Delete` + details-view line — with the plugin lib/assets/node_modules
; closure plus the runtime-downloaded dsh-hub-win tree that is THOUSANDS of
; single-file operations, measurably slower than deleting by hand. NSIS
; uninstallers run from a %TEMP% copy of themselves, so the whole $INSTDIR
; content is deletable while uninstalling. NSIS_HOOK_PREUNINSTALL therefore
; nukes the known big directories up front (RMDir /r = one native recursive
; delete each); the template's per-file Delete pass then no-ops on missing
; files. Only KNOWN subdirectories are touched recursively — never $INSTDIR
; itself (the trailing non-recursive RMDir only removes it when empty), so a
; custom install location shared with other content stays safe.
; NSIS_HOOK_POSTUNINSTALL keeps the sweep (instant no-ops after the pre-pass)
; plus the best-effort profile cleanup: without it a leftover dangling
; junction / bundles entry breaks the user's plain `dsh web` after uninstall.

!macro NSIS_HOOK_POSTINSTALL
  DetailPrint "dsh-hub: bootstrapping private Node runtime + dsh dependencies (install-time, 1-3 min)..."
  DetailPrint "dsh-hub: progress log: $INSTDIR\dsh-hub-bootstrap.log"
  Delete "$INSTDIR\dsh-hub-bootstrap.log"
  Exec '"powershell.exe" -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "$INSTDIR\_up_\scripts\dsh-deps-install.ps1" -InstallDir "$INSTDIR" -LogPath "$INSTDIR\dsh-hub-bootstrap.log"'
  ; Live-progress poll. $R0 = lines already mirrored, $R1 = elapsed seconds,
  ; $R3 = done flag (1 = done sentinel seen, 2 = failed sentinel, 3 = timeout).
  StrCpy $R0 0
  StrCpy $R1 0
  StrCpy $R3 0
  ${DoWhile} $R3 = 0
    Sleep 700
    IntOp $R1 $R1 + 1
    ${If} $R1 >= 514
      StrCpy $R3 3
      ${ExitDo}
    ${EndIf}
    StrCpy $R2 0
    ClearErrors
    FileOpen $0 "$INSTDIR\dsh-hub-bootstrap.log" r
    ${IfNot} ${Errors}
      ${Do}
        ClearErrors
        FileRead $0 $3
        ${IfThen} ${Errors} ${|} ${ExitDo} ${|}
        IntOp $R2 $R2 + 1
        ${If} $R2 > $R0
          StrCpy $R0 $R2
          Push $3
          Call TrimNewlines
          Pop $3
          DetailPrint "bootstrap: $3"
          StrCpy $4 $3 9
          ${If} $4 == "DEP: done"
            StrCpy $R3 1
          ${EndIf}
          StrCpy $4 $3 11
          ${If} $4 == "DEP: FAILED"
            StrCpy $R3 2
          ${EndIf}
        ${EndIf}
      ${Loop}
      FileClose $0
    ${EndIf}
  ${Loop}
  ${If} $R3 = 1
    DetailPrint "dsh-hub: private Node runtime bootstrap complete"
  ${ElseIf} $R3 = 2
    DetailPrint "dsh-hub: bootstrap FAILED (see $INSTDIR\dsh-hub-bootstrap.log; app falls back to PATH/node at first launch)"
  ${Else}
    DetailPrint "dsh-hub: bootstrap progress timeout (~6min) — continuing (app falls back to PATH/node at first launch)"
  ${EndIf}
!macroend

; TrimNewlines helper for the poll loop above (NSIS has no builtin trim).
; Usage: Push <string>; Call TrimNewlines; Pop <result>.
!macro TRIM_NEWLINES_FUNC
Function TrimNewlines
  Exch $0
  Push $2
  loop_trim:
    StrCpy $2 $0 1 -1
    StrCmp $2 "$\r" +2 0
    StrCmp $2 "$\n" 0 done_trim
  StrCpy $0 $0 -1
  Goto loop_trim
  done_trim:
  Pop $2
  Exch $0
FunctionEnd
!macroend
!insertmacro TRIM_NEWLINES_FUNC

!macro NSIS_HOOK_PREUNINSTALL
  ; ── Kill running shell + private sidecar BEFORE deleting anything ──
  ; Root cause of "uninstall not clean": the shell hides to tray on window
  ; close (closeToTray=true) and its private node sidecar
  ; ($INSTDIR\dsh-hub-win\node.exe) stays alive — deleting a locked install
  ; dir fails and leaves a partial tree. Kill by exact identity:
  ;   1. dsh-hub.exe (the shell; /T also takes its direct child tree)
  ;   2. any node.exe whose executable path is under dsh-hub-win (the private
  ;      sidecar — scoped match so the system node is never touched)
  ; 性能：Get-Process 本地进程快照比 Get-CimInstance 快 ~3x（卸载确认后的
  ; 等待感知更短）；不 Sleep——taskkill 同步返回后进程已死，直接进入删除。
  nsExec::ExecToStack 'taskkill /IM dsh-hub.exe /F /T'
  Pop $0
  nsExec::ExecToStack "powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command $\"Get-Process node -ErrorAction SilentlyContinue | Where-Object { $$_.Path -like '*dsh-hub-win*' } | Stop-Process -Force -ErrorAction SilentlyContinue$\""
  Pop $0
  ; Fast path first (see header): one native recursive delete per known
  ; small directory beats the template's per-file Delete walk. The BULK
  ; directory (dsh-hub-win, tens of thousands of runtime-downloaded files)
  ; is deliberately NOT touched here — it goes to the asynchronous final
  ; cleanup so the uninstall UI completes in seconds (大厂 pattern).
  RMDir /r "$INSTDIR\_up_"
  RMDir /r "$INSTDIR\icons"
  Delete "$INSTDIR\dsh-hub-bootstrap.log"
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  ; Sweep (instant no-ops after the pre-pass) + final non-recursive removal.
  RMDir /r "$INSTDIR\_up_"
  RMDir /r "$INSTDIR\icons"
  Delete "$INSTDIR\dsh-hub-bootstrap.log"
  RMDir "$INSTDIR"
  ; Bulk leftovers (dsh-hub-win ~35k files + the dir skeleton itself) go to a
  ; HIDDEN BACKGROUND cleaner fired after everything else — the uninstall UI
  ; finishes in seconds while the heavy disk deletion continues silently
  ; (same pattern as big-vendor installers). Failure leaves at most an inert
  ; file tree (uninstall key is already gone) — harmless, deletable by hand.
  DetailPrint "dsh-hub: cleaning profile bundle entry (best-effort)"
  ; NSIS 中 $$ 转义为字面 $；PowerShell 单行：从 bundles 移除 @marecgents/dsh-hub
  ; + 删除 junction（Test-Path 会跟随悬空链接返回 false，改查 ReparsePoint 属性；
  ;   只删链接本身，不递归目标）。
  ExecWait 'powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "$$h=$$env:DSH_HOME; if(-not $$h){$$h=\"$$env:USERPROFILE\.dsh\"}; $$j=Join-Path $$h \"profiles\web\package.json\"; if(Test-Path $$j){ try{ $$o=Get-Content $$j -Raw|ConvertFrom-Json; $$o.dsh.profile.bundles=@($$o.dsh.profile.bundles|Where-Object{$$_ -ne \"@marecgents/dsh-hub\"}); $$o|ConvertTo-Json -Depth 10|Set-Content $$j -Encoding UTF8 }catch{ } }; $$l=Join-Path $$h \"profiles\web\node_modules\@marecgents\dsh-hub\"; try{ $$i=Get-Item $$l -Force -ErrorAction Stop; if($$i.Attributes -band [IO.FileAttributes]::ReparsePoint){ $$i.Delete() } }catch{ }"' $0
  ${If} $0 != 0
    DetailPrint "dsh-hub: profile cleanup exited with code $0 (non-fatal)"
  ${EndIf}
  ; ExecShell (ShellExecute) = OS 级脱离进程：卸载器退出不等它（实测 Exec 的
  ; CreateProcess 子进程仍被卸载器生命周期拖住，3.5 万文件 ~50s 删除全部计入
  ; 可见卸载时长）。窗口策略：powershell -WindowStyle Hidden 无黑框。末尾对
  ; $INSTDIR 3s 后重试一次——清理器首删时卸载器临时副本可能仍握着目录句柄，
  ; 实测会留下空目录骨架。
  ExecShell "open" "powershell.exe" '-NoLogo -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "Remove-Item -LiteralPath \"$INSTDIR\dsh-hub-win\" -Recurse -Force -ErrorAction SilentlyContinue; Remove-Item -LiteralPath \"$INSTDIR\" -Recurse -Force -ErrorAction SilentlyContinue; Start-Sleep -Seconds 3; Remove-Item -LiteralPath \"$INSTDIR\" -Recurse -Force -ErrorAction SilentlyContinue"'
!macroend