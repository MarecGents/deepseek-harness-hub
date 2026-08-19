// main.rs — dsh-hub 引导（Controller，壳入口）
//
// 职责：解析 CLI 诊断参数（T4.4），随后进入 dsh_hub_lib::run() 正常启动。
//   --assemble-only   装配 web profile 后退出：成功 → exit 0，失败 → exit 1
//   --smoke           装配 + 正常启动 + 建窗成功后自动退出：exit 0
//
// 注意：#![windows_subsystem = "windows"]（GUI 子系统）下 stdout/stderr 对
// 控制台不可见，诊断结果以 exit code 传递；失败细节另写 stderr（可经
// Start-Process -RedirectStandardError 捕获）。

#![windows_subsystem = "windows"]

use std::process::ExitCode;

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().collect();
    let assemble_only = args.iter().any(|a| a.as_str() == "--assemble-only");
    let smoke = args.iter().any(|a| a.as_str() == "--smoke");

    // T4.4：--assemble-only / --smoke 都先执行 profile 装配（幂等）。
    if assemble_only || smoke {
        if let Err(e) = dsh_hub_lib::assemble_profile() {
            eprintln!("dsh-hub: assemble failed: {e}");
            return ExitCode::FAILURE;
        }
        if assemble_only {
            return ExitCode::SUCCESS;
        }
    }

    // --smoke：置位内部标记，lib.rs setup 建窗成功后自动退出（见 lib.rs）。
    if smoke {
        dsh_hub_lib::enable_smoke_mode();
    }

    dsh_hub_lib::run();
    ExitCode::SUCCESS
}
