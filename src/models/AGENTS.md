# AGENTS.md — src/models/（Model 层）开发约束

> 本目录是 dsh-hub host half 的 **Model（共享类型/常量）层**（2026-08-18 第八轮落地）。只放类型与常量，**零运行时业务副作用**。
> 改动本目录任何文件前，**必须**先读根 [../../AGENTS.md](../../AGENTS.md) 与 [../AGENTS.md](../AGENTS.md) 与本文件。

## 文件归类

| 文件 | 模块类别 | 职责 |
|---|---|---|
| `pipe.ts` | **Model** | 管道协议类型/常量：`TrayCommand`/`MgTrayFrame`/`DshCmdPayload`/`DshCmdName`/`MG_TRAY_PREFIX`/`DSH_CMD_PREFIX` |
| `shell-config.ts` | **Model** | `ShellConfig` 接口 + `DEFAULT_SHELL_CONFIG`（配置三处一致的单一来源） |
| `plugin-config.ts` | **Model** | `PluginConfig` 接口（Cordis 插件 Config 的纯类型单一来源） |
| `sound.ts` | **Model** | 提示音类型：`TaskSoundKind` = start/success/attention/error（session-runtime ↔ Tauri play_sound 共享） |

## Model 层红线

1. **纯类型/常量**：只允许 interface/type/const 字面量；禁止函数体、IO、业务逻辑、import 上层模块。
2. **单一来源**：跨层共享的类型只在此定义一次；原定义处（如 config-api 的 ShellConfig、tray 的 TrayCommand）改为 import + re-export 保持消费方兼容。
3. **协议同步**：`pipe.ts` 的命令名/帧结构变更必须同步 `src-tauri/src/managers/node.rs` 分发表 ↔ `src/managers/tauri-shell.ts` ↔ `src/controllers/tray-pipe.ts`。
4. **配置三处一致**：新增 `ShellConfig` 字段必须同步 ① 本文件接口 ② `DEFAULT_SHELL_CONFIG` ③ config-api POST 白名单——漏一处 = 保存静默丢失。

> 新增共享类型先判断归属（管道协议 → pipe.ts；壳配置 → shell-config.ts；其它 → 按领域命名新文件）。单一模块私有类型留在原模块。
