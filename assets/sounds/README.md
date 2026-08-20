# 提示音素材

4 段事件提示音为 **dsh-hub 原创合成**（`scripts/synthesize-sounds.mjs` 生成），
**不复制任何第三方库**——此前复用的 Reasonix/Mixkit 文件已按项目决定移除。

| 文件 | 事件 | 旋律（原创） |
|---|---|---|
| `dsh-hub-start.wav` | 提问（用户提交，`turn/start`） | 快速上行双音（E5→A5） |
| `dsh-hub-success.wav` | 完成（`turn/end` → `completed`） | 三音上行琶音（C5→E5→G5） |
| `dsh-hub-attention.wav` | 需要你（AI 请求批准，`approval/asked`） | 双音提醒（A5→E5） |
| `dsh-hub-error.wav` | 出错（`turn/end` → `error`） | 下行小调（F4→C#4→A3） |

## 规格与再生成

- 44.1 kHz / 16-bit / 单声道 WAV；基音 + 轻微二次谐波，指数衰减包络
- 修改旋律后重新生成：`node scripts/synthesize-sounds.mjs`
- 播放：Rust 壳 `play_sound` 命令 → `win.eval` → 浏览器 HTMLAudio（`/api/dsh-hub/sounds/*` 路由伺服 WAV，`--autoplay-policy=no-user-gesture-required` 放行）——Node 进程无 `Audio`，声音必须在页面播放（踩坑 #36）
