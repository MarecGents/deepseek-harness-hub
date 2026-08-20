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
; scripts\dsh-deps-install.ps1 resource. stdout lines ("DEP: ...") are merged
; into the installer detail log via nsExec::ExecToLog, so the user sees live
; progress on the INSTFILES page.
;
; A non-zero bootstrap exit is tolerated (details are logged, installation is
; NOT aborted): at first launch the shell falls back to PATH-based node/dsh
; resolution when the private runtime is missing, so a flaky network must never
; block installation.

!macro NSIS_HOOK_POSTINSTALL
  DetailPrint "dsh-hub: bootstrapping private Node runtime + dsh dependencies (install-time)..."
  nsExec::ExecToLog 'powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File "$INSTDIR\_up_\scripts\dsh-deps-install.ps1" -InstallDir "$INSTDIR"'
  Pop $0
  ${If} $0 != 0
    DetailPrint "dsh-hub: bootstrap exited with code $0 - the app will fall back to PATH/node at first launch"
  ${EndIf}
!macroend
