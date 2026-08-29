# @dsh-external/dsh-usage-stats

[English](README.en.md) | 中文

DeepSeek Harness (DSH) 用量统计插件：聚合所有会话的 token 使用量（输入 / 输出 / 缓存读 / 缓存写），按模型与按天明细，并在设置页展示，可配置单价估算费用。

![topic](https://img.shields.io/badge/DSH-plugin-blue) ![license](https://img.shields.io/badge/license-BSD--3--Clause-green) [![GitHub](https://img.shields.io/badge/GitHub-dsh--plugin--topic-informational)](https://github.com/topics/dsh-plugin)

## 功能
- **聚合总览**：全部会话的 token 总量、请求数、会话数。
- **按模型明细**：每个 provider/model 的请求数与各项 token。
- **按天明细**：每日用量列表 + 简易趋势图。
- **单价与费用估算**：内置常见 provider 单价，可在设置页按模型覆盖，支持 USD/RMB 显示。
- **加载优化**：后台预热 + 会话变化防抖重扫 + 增量按会话缓存 + stale-while-revalidate，打开设置页不阻塞。

## 安装

### ① 插件市场一键安装
若已安装 [dsh-market](https://github.com/dsh-market/dsh-market) 插件市场：

1. 打开 **Settings → Plugin Market**
2. 搜索 `dsh-usage-stats`（或 `@dsh-external/dsh-usage-stats`）
3. 点 **安装**，刷新页面即可在设置页看到「用量统计」

> 插件市场只收录其 registry 里列出的源；若搜索不到，请先用下面②/③/④安装，再考虑把它加入市场 registry。

### ② dsh plugin add（官方安装命令）

本包已声明 `dsh.bundle` manifest，可用官方命令直接安装：

```bash
dsh plugin --profile web add @dsh-external/dsh-usage-stats
```

> 包未发布 npm 时会回退为 GitHub 源码安装，依赖网络可达 github.com。

### ③ dsh-super-injector 直接注入

```bash
dev_inject_plugin <本仓库目录>
```

### ④ 克隆 + 打包安装

```bash
git clone https://github.com/dustinmoon78/dsh-usage-stats.git
cd dsh-usage-stats
bash scripts/build.sh      # 校验 lib 并产出 tgz
# 在目标环境安装/注入产出的 tgz
```

## 数据流
遍历 `ctx.sessionPersistence` 的会话快照（`listSnapshots` / `list`），`inspect`/`readFrom` 读取事件，折叠 `assistant/message` 与 `assistant/chunk(usage)` 的 token 字段，按当前生效的 provider/model（`request/header`）归属。

## API

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `GET` | `/dsh-usage-stats/api` | 总览（`?refresh=1` 强制重扫） |
| `POST` | `/dsh-usage-stats/api/prices` | 保存单价/汇率 |

```bash
curl -s 'http://127.0.0.1:<port>/dsh-usage-stats/api'
```

返回结构含 `total`、`byModel`（每模型含 `byDay`）、`byDay`、`sessionCount`、`generatedAt`、`prices`、`refreshing`。

## 依赖

- 宿主须提供服务：`webServer`、`sessionPersistence`、`sessionProjectionCache`。
- 运行时 peer：`cordis`（`>=4.0.0-rc <5`）。

## License

BSD-3-Clause
