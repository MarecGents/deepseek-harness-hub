# 提示音素材

4 个 WAV 来自 **Mixkit**（免费许可，可商用、无需署名），与
[DeepSeek-Reasonix](https://github.com/MarecGents/DeepSeek-Reasonix) 桌面端
`desktop/frontend/public/sounds/` 使用的提示音一致（参考其 `sound.ts`）。

| 文件 | 事件 | 播放时机 |
|---|---|---|
| `mixkit-software-interface-start-2574.wav` | 提问 | 用户提交新问题（`turn/start`） |
| `mixkit-correct-answer-tone-2870.wav` | 完成 | 回合正常结束（`turn/end` → `completed`） |
| `mixkit-positive-notification-951.wav` | 需要你 | AI 请求批准/提问（`approval/asked`） |
| `mixkit-software-interface-back-2575.wav` | 出错 | 回合报错中断（`turn/end` → `error`） |

来源：https://mixkit.co/free-sound-effects/（免费许可，允许商业使用）。
