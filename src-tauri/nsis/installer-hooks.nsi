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
; Window policy: we deliberately do NOT use nsExec::ExecToLog here — it creates
; a visible console window to capture stdout (users saw two popup consoles).
; Instead we use ExecWait + powershell -WindowStyle Hidden (no console window at
; all) and the script appends its "DEP: xx%" progress to $INSTDIR\dsh-hub-bootstrap.log.
;
; A non-zero bootstrap exit is tolerated (details are logged, installation is
; NOT aborted): at first launch the shell falls back to PATH-based node/dsh
; resolution when the private runtime is missing, so a flaky network must never
; block installation.

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
