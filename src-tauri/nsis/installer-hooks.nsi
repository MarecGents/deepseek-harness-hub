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
; Only NSIS_HOOK_POSTINSTALL is defined here. It bootstraps the private Node
; runtime + dsh dependencies into $INSTDIR\dsh-hub-win by running the bundled
; scripts\dsh-deps-install.ps1 resource.
;
; Window policy: we deliberately do NOT use nsExec::ExecToLog here — it creates a
; visible console window to capture stdout (users saw two popup consoles).
; Instead we use ExecWait + powershell -WindowStyle Hidden (no console window at
; all) and the script appends its "DEP: xx%" progress to $INSTDIR\dsh-hub-bootstrap.log.
;
; A non-zero bootstrap exit is tolerated (details are logged, installation is
; NOT aborted): at first launch the shell falls back to PATH-based node/dsh
; resolution when the private runtime is missing, so a flaky network must never
; block installation.
;
; NSIS_HOOK_POSTUNINSTALL（踩坑 #65）：Tauri 模板卸载段不删 glob resources 与
; 运行期生成内容——卸载后曾残留 400MB（_up_/icons = resources；dsh-hub-win/ =
; 安装期下载的私有 Node 运行时；另有引导日志）。只递归删 $INSTDIR 的已知子
; 目录，绝不动 $INSTDIR 本身（末尾非递归 RMDir 仅在目录已空时移除）。
; 并 best-effort 清理 profile（默认/DSH_HOME 环境变量）：移除 bundles 条目 +
; 删除悬空 junction——不清理的话卸载后用户 `dsh web` 会因加载不存在的
; @marecgents/dsh-hub 条目直接崩。清理失败不影响卸载（仅 DetailPrint 记录）。

!macro NSIS_HOOK_POSTINSTALL
  DetailPrint "dsh-hub: bootstrapping private Node runtime + dsh dependencies (install-time, 1-3 min)..."
  DetailPrint "dsh-hub: progress log: $INSTDIR\dsh-hub-bootstrap.log"
  ExecWait '"powershell.exe" -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "$INSTDIR\_up_\scripts\dsh-deps-install.ps1" -InstallDir "$INSTDIR"' $0
  ${If} $0 != 0
    DetailPrint "dsh-hub: bootstrap exited with code $0 - see $INSTDIR\dsh-hub-bootstrap.log; app will fall back to PATH/node at first launch"
  ${Else}
    DetailPrint "dsh-hub: private Node runtime bootstrap complete"
  ${EndIf}
!macroend

!macro NSIS_HOOK_POSTUNINSTALL
  RMDir /r "$INSTDIR\_up_"
  RMDir /r "$INSTDIR\icons"
  RMDir /r "$INSTDIR\dsh-hub-win"
  Delete "$INSTDIR\dsh-hub-bootstrap.log"
  RMDir "$INSTDIR"
  DetailPrint "dsh-hub: cleaning profile bundle entry (best-effort)"
  ; NSIS 中 $$ 转义为字面 $；PowerShell 单行：从 bundles 移除 @marecgents/dsh-hub
  ; + 删除 junction（Test-Path 会跟随悬空链接返回 false，改查 ReparsePoint 属性；
  ;   只删链接本身，不递归目标）。
  ExecWait 'powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Command "$$h=$$env:DSH_HOME; if(-not $$h){$$h=\"$$env:USERPROFILE\.dsh\"}; $$j=Join-Path $$h \"profiles\web\package.json\"; if(Test-Path $$j){ try{ $$o=Get-Content $$j -Raw|ConvertFrom-Json; $$o.dsh.profile.bundles=@($$o.dsh.profile.bundles|Where-Object{$$_ -ne \"@marecgents/dsh-hub\"}); $$o|ConvertTo-Json -Depth 10|Set-Content $$j -Encoding UTF8 }catch{ } }; $$l=Join-Path $$h \"profiles\web\node_modules\@marecgents\dsh-hub\"; try{ $$i=Get-Item $$l -Force -ErrorAction Stop; if($$i.Attributes -band [IO.FileAttributes]::ReparsePoint){ $$i.Delete() } }catch{ }"' $0
  ${If} $0 != 0
    DetailPrint "dsh-hub: profile cleanup exited with code $0 (non-fatal)"
  ${EndIf}
!macroend
