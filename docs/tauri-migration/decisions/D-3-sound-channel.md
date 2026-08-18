# D-3 声音三端通道决策

> 日期：2026-08-17 · 拍板权：用户 · SOP 前置：D3（M3 §4.2）

## 决策

**HTMLAudio（前端播放，最简单，跨平台，零 Rust 开销）**。

### 选项分析

| 选项 | 体积 | 跨平台 | Rust 复杂度 | 需要 |
|---|---|---|---|---|
| HTMLAudio | 0 | ✅ | 无 | `window.postMessage` 或 `__DSH_SHELL__` 回调 |
| Rust rodio-cpal | +500KB crate | ⚠️ macOS/Linux 需设备枚举 | 高 | 壳层音频播放 |
| 平台命令 afplay/paplay/aplay | 0 | ⚠️ 逐端 | 低 | Command::new + 路径解析 |

### 理由

- dsh-hub 的声音场景唯一：任务完成通知 "叮"（30s 冷却）
- HTMLAudio 由 dsh-web 客户端层播放（通知 toast 前端已有声音支持），不需要 Rust 壳参与
- M4 主桥 `notifyTaskComplete` → 侧边栏/前端 → `Audio` 对象播放

### 落地

M4 bridge 文件：notify.rs（Rust 命令壳）+ bridge-server.ts（SSE 下行 `dsh:notify`）→ 前端 `new Audio(url).play()`。
