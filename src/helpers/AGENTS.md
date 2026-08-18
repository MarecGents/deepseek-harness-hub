# AGENTS.md — src/helpers/（Helper 层）开发约束

> 本目录是 dsh-hub host half 的 **Helper（无状态工具）层**。2026-08-18 重构由 `src/services/*` 迁入（纯工具类）。
> 改动本目录任何文件前，**必须**先读根 [../../AGENTS.md](../../AGENTS.md) 与 [../AGENTS.md](../AGENTS.md) 与本文件。

## 文件归类

| 文件 | 模块类别 | 职责 | Tauri 迁移 |
|---|---|---|---|
| `state-store.ts` | **Helper** | `dshHome()` / 窗口状态文件路径 | 保留（$DSH_HOME 语义不变） |
| `dwm-theme.ts` | **Helper** | koffi 调 Dwm 设置标题栏主题（Windows 专属） | **重写**（Tauri 窗口 API） |
| `os-theme.ts` | **Helper** | 系统深浅色探测（Windows 专属） | **重写**（Tauri 主题 API） |
| `explorer.ts` | **Helper** | 打开文件夹 + 前置（koffi ShellExecuteW + EnumWindows） | **重写**（tauri shell） |
| `screen.ts` | **Helper** | 屏幕分辨率探测（resolveLaunchScreen） | **重写**（Tauri 屏幕 API） |
| `icons.ts` | **Helper** | 图标生成/解码（png-decode 配套） | 保留 |
| `png-decode.ts` | **Helper** | PNG 解码（纯函数） | 保留 |
| `sound.ts` | **Helper** | 声音资源路径/文件名解析 | 保留（播放走壳） |
| `app-id.ts` | **Helper** | AppUserModelId 设置 | **重写**（打包后由 manifest 提供） |

## Helper 层规范

1. **纯函数**：无状态、无副作用；输入输出类型明确（state-store 的读写是"文件 I/O 型工具"，属例外但仍无业务状态）。
2. **零依赖**：只依赖其他 helpers / 官方库；**禁止** import 上层（index/managers/server/services）。
3. **Windows 专属标记**：Windows-only 文件头注明"Tauri 迁移时重写"；跨平台代码不得直接依赖（经 theme-sync 桥 / 工厂注入）。
4. **接口文档**：每个导出函数前写 JSDoc（作用、参数、返回、副作用）。
5. **Build 前推演**：改完先推演（类型自洽、零依赖未破坏），再 `npm run build`。
