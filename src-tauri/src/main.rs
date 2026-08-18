// Q3：debug/release 一律 GUI 子系统（无控制台窗口）。
#![windows_subsystem = "windows"]

fn main() {
    dsh_hub_lib::run()
}
