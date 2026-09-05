# @dsh-external/dsh-model-efforts

为 dsh 自定义模型（pi-ai 供应商路由下的模型条目）提供**思考强度（reasoning effort）档位编辑器**的独立 dsh 插件。

## 背景

dsh 的思考强度档位来自 Host 模型目录元数据（`resolveModelInfo` → `reasoning.efforts`/`defaultEffort`），composer 的模型菜单（官方 seat 与 dsh-hub 嵌套 seat 均如此）只按该元数据显示档位；Host 请求路径还会拒绝未声明的档位（`UNSUPPORTED_REASONING_EFFORT`）。官方 Models 设置页**刻意不提供**该字段的编辑控件（`CustomProviderCard.tsx` "deliberately no reasoning-effort control"）——本插件补位。

## 定位与边界

- **官方写通道**：经 `ctx.settingsScope.bind({namespace:'llm-pi-ai'})` 写官方 `llm-pi-ai` 设置命名空间（与官方 Models 页同权同校验）。写入即过 llm-pi-ai schema + `assertServiceable` 校验，`settings/document-updated` 后热生效（下一请求即用新档位，无需重启）。
- **写路径分派**：
  - 纯 catalog 路由（resolved `models` 为空数组）→ 逐模型写 `providers.<route>.modelOverrides.<modelId>.reasoningEfforts`；
  - 手填 `models` 数组的路由 → 读-改-写**整组** `providers.<route>.models` 数组（settings 的 path op 会用对象覆盖数组中间节点，数组下标路径被禁止）。
- **声明形态**（与 llm-pi-ai schema 一致）：`false` = 非推理模型；字典键 ∈ `off/minimal/low/medium/high/xhigh/max`，值 = 发送到 API 的 wire 拼写（默认取档位名）；仅 `off` 允许 null（声明但不发参）；空字典/空串/仅 off 声明会被官方校验拒绝——插件端预校验同规则。
- **v1 边界**：只编辑**已存在**的模型条目（catalog 路由枚举既有 modelOverrides + 手填路由枚举 models 数组）；不新建供应商/模型；每档位 wire 拼写固定取档位名（v2 计划开放自定义拼写与 base/user 视图徽标）。

## 结构

```
lib/index.js     host 半：极简挂载壳（身份载体，无逻辑、无路由、无 ACL）
lib/client.js    client 半：settings.section（id=model-efforts, order=35）编辑器
test/            node:test（经 globalThis.__dshModelEffortsInternals 直测纯函数）
scripts/build.sh node --check 语法门禁
```

## 挂载

`cordis.patch.yml` 为**顶层 YAML 数组**（`plugins:` 映射形式 dsh 解析失败），`insert.id == insert.name == package.json name`（身份一致性铁律）。随 dsh-hub NSIS 分发时由 `scripts/assemble-profile.mjs` 自动 junction + 注册进 profile bundles；独立使用时 `npm i -g @dsh-external/dsh-model-efforts` 后把包名加入 profile 的 `dsh.profile.bundles`。

## 双轨分发

随 hub NSIS（`tauri.conf.json` resources `../plugins/**/*` 通配，零基建改动）+ 独立 npm（发布前跑 `node ../../scripts/verify-plugin.mjs`，P1-P5 全 PASS 才可 publish——AGENTS.md 铁律 6）。
