# dsh-hub-auth-shim

**回环自动登录兜底**：外壳导航首页时不带 token 时，补一次带 token 的跳转，消除 401 白屏。

## 问题

dsh `0.1.2-rc.1` 给 web 面板加了 launch-token 鉴权（`dsh-client-connection` 的 `BrowserAuth`）：

- `/?token=X` → 303 + 30 天签名 cookie（**绑定 `host:port`**）
- 无 token 访问 `GET /` 一律 401（`dsh web authentication required`）

`0.1.5-rc.1` 进一步把鉴权从 `/api` 扩到**首页文档本身**（实测：同一条命令，0.1.2-rc.1 返回 200 + 应用页，0.1.5-rc.1 返回 401 text/plain）。

壳若只从 READY 行解析**端口**、导航到裸 `http://127.0.0.1:<port>`，webview 拿到 401 文本页 → **白屏**。cookie 又绑定 `host:port`，而壳用 `--port 0` 每次端口都变，缓存 cookie 救不了。

## 本插件做什么

包装 `connection.authorizeIndex()`（首页放行的唯一闸门）：

```
GET|HEAD /  且  Host 是回环 authority  且  无 token 参数  且  未持有当前 authority 的有效 cookie
  → 303 Location: connection.authenticatedUrl(http://<Host>/)
其余情况 → 原样交回原实现（含 401 与正常放行）
```

**与「把 `isAuthenticated` 放行」式止损补丁的区别**：那个直接关掉鉴权；本插件仍走官方 token 换 cookie 流程，`/api` 与非回环来源的鉴权强度**不变**。

### 为什么按 cookie 名精确判定

会话 cookie 名为 `dsh-auth-<base64url(sha256(authority))>`，authority 含端口。只看「有没有 cookie」会把**别的端口残留的过期 cookie**误判为已登录 → 交回原实现 → 401，正是要消除的白屏场景（curl 等不区分端口的客户端必然踩到；已在本机复现并修正）。测试内含真实服务器抓取的 cookie 名样本作为回归基线。

### 为什么需要它（而不是只靠壳侧修复）

壳侧正解是解析完整就绪 URL 并带 `?token=` 导航（PR #56）。本插件是**外壳修复落地/发布前的服务端兜底**，也覆盖「就绪行解析不到 token 时回退裸端口」这条分支。壳侧修复发布后本插件可移除。

## 挂载

随 `plugins/` 目录分发；装入 profile 的 `node_modules` 后，在 profile `package.json` 登记：

```json
{
  "dependencies": { "@dsh-external/dsh-hub-auth-shim": "link:<repo>/plugins/dsh-hub-auth-shim" },
  "dsh": { "profile": { "bundles": ["…", "@dsh-external/dsh-hub-auth-shim"] } }
}
```

## 验证

```bash
node --check lib/index.js          # 或 bash scripts/build.sh
node --test test/                  # 14 例：cookie 名算法 / authority 归一化 / 回环判定 / 包装行为与还原
```

端到端（隔离 DSH_HOME，端口任选）：

```bash
curl -s -o /dev/null -w '%{http_code}\n'            http://127.0.0.1:<port>/                   # 期望 303
curl -sL -o /dev/null -w '%{http_code}\n'           http://127.0.0.1:<port>/                   # 期望 200
curl -s -o /dev/null -w '%{http_code}\n' -X POST    http://127.0.0.1:<port>/api/remote.mux    # 期望 401（未降级）
curl -s -o /dev/null -w '%{http_code}\n' -H 'Host: evil.example' http://127.0.0.1:<port>/     # 期望 401
```

## 失效可观测

若 dsh 改了 `authorizeIndex` / `authenticatedUrl`，`apply()` 会打印
`[auth-shim] connection API 形态与预期不符 …` 而不是静默白屏；`inject` 取不到 `connection` 时打印
`[auth-shim] connection 服务不可用，跳过安装`。

## 回退

从 profile 的 `bundles` 与 `dependencies` 移除本插件即可（包装随之不再安装）。运行时也可用
`installLoopbackLogin()` 返回的 restore 函数还原。
