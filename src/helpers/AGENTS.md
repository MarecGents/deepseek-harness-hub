# AGENTS.md — src/helpers/（Helper 层）开发约束

> 本目录是 dsh-hub host half 的 **Helper（无状态工具）层**。2026-08-18 重构由 `src/services/*` 迁入（纯工具类）。
> 改动本目录任何文件前，**必须**先读根 [../../AGENTS.md](../../AGENTS.md) 与 [../AGENTS.md](../AGENTS.md) 与本文件。

## 文件归类

| 文件 | 模块类别 | 职责 | Tauri 迁移 |
|---|---|---|---|
| `state-store.ts` | **Helper** | `dshHome()` / 窗口状态文件路径 | 保留（$DSH_HOME 语义不变） |
| `dwm-theme.ts` | **Helper** | koffi 调 Dwm 设置标题栏主题（Windows 专属） | **已删除**（WebView2 壳，dev-v2 Tauri-only） |
| `os-theme.ts` | **Helper** | 系统深浅色探测（Windows 专属） | **已删除**（WebView2 壳，dev-v2 Tauri-only） |
| `explorer.ts` | **Helper** | 打开文件夹 + 前置（koffi ShellExecuteW + EnumWindows） | **已删除**（WebView2 壳，dev-v2 Tauri-only） |
| `screen.ts` | **Helper** | 屏幕分辨率探测（resolveLaunchScreen） | **已删除**（WebView2 壳，dev-v2 Tauri-only） |
| `icons.ts` | **Helper** | 图标生成/解码（png-decode 配套） | **已删除**（WebView2 壳，dev-v2 Tauri-only） |
| `png-decode.ts` | **Helper** | PNG 解码（纯函数） | **已删除**（WebView2 壳，dev-v2 Tauri-only） |
| `sound.ts` | **Helper** | 声音资源路径/文件名解析 | **已删除**（WebView2 壳，dev-v2 Tauri-only；播放走 Rust 壳） |
| `app-id.ts` | **Helper** | AppUserModelId 设置 | **已删除**（WebView2 壳，dev-v2 Tauri-only） |

## Helper 层规范

1. **纯函数**：无状态、无副作用；输入输出类型明确（state-store 的读写是"文件 I/O 型工具"，属例外但仍无业务状态）。
2. **零依赖**：只依赖其他 helpers / 官方库；**禁止** import 上层（index/managers/server/services）。
3. **Windows 专属标记**：Windows-only 文件头注明平台依赖与归宿；跨平台代码不得直接依赖（经 tauri-shell 桥（DSH_CMD）/ 工厂注入）。
4. **接口文档**：每个导出函数前写 JSDoc（作用、参数、返回、副作用）。
5. **Build 前推演**：改完先推演（类型自洽、零依赖未破坏），再 `npm run build`。
