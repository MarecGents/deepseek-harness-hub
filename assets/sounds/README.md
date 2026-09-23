# 提示音素材

5 段事件提示音为 **dsh-hub 原创合成**（`scripts/synthesize-sounds.mjs` 生成），
**不复制任何第三方库**——此前复用的 Reasonix/Mixkit 文件已按项目决定移除。

| 文件 | 事件 | 旋律（原创） |
|---|---|---|
| `dsh-hub-start.wav` | 提问（用户提交，`turn/start`） | 快速上行双音（E5→A5） |
| `dsh-hub-success.wav` | 完成（`turn/end` → `completed`，主会话 depth 0） | 三音上行琶音（C5→E5→G5） |
| `dsh-hub-subagent-success.wav` | 子代理完成（`turn/end` → `completed`，depth > 0） | 单音短滴（A5，音量 0.20） |
| `dsh-hub-attention.wav` | 需要你（AI 请求批准，`approval/asked`） | 双音提醒（A5→E5） |
| `dsh-hub-error.wav` | 出错（`turn/end` → `error`） | 下行小调（F4→C#4→A3） |

`subagent-success` 与 `success` 按 `session.header.delegationDepth` 分流（depth > 0
即子代理）：子任务完成是背景事件、可能密集触发，故刻意用更短更轻的音，避免盖过
主任务完成音。分流点在 `src/controllers/session-runtime.ts`。

## 规格与再生成

- 44.1 kHz / 16-bit / 单声道 WAV；基音 + 轻微二次谐波，指数衰减包络
- 修改旋律后重新生成：`node scripts/synthesize-sounds.mjs`
- 播放：Rust 壳 `play_sound` 命令 → `win.eval` → 浏览器 HTMLAudio（`/api/dsh-hub/sounds/*` 路由伺服 WAV，`--autoplay-policy=no-user-gesture-required` 放行）——Node 进程无 `Audio`，声音必须在页面播放（踩坑 #36）

## 新增一种提示音的接线清单

音效种类跨越四端，漏掉任何一处都是**静默失效**（事件照发、就是不出声），
逐项确认：

1. `src/models/sound.ts` — `TaskSoundKind` 联合类型加新种类
2. `src/controllers/session-runtime.ts` — 触发条件（哪个事件、什么条件下用）
3. `src-tauri/src/managers/window_ops.rs` — `play_sound` 的 `matches!` 白名单，
   漏加则 Rust 直接 `Err("unknown sound kind")` 拒收
4. `src-tauri/src/shell-init.js` — `MG_SOUND_URLS` 映射，漏加则 `mgPlaySound`
   取不到 url 直接 return（无报错）
5. 本目录 — WAV 素材 + 上方表格；素材由 `scripts/synthesize-sounds.mjs` 生成，
   **不要手写一次性脚本产物**（旋律将无法再生成）
