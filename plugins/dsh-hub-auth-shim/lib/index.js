/**
 * dsh-hub-auth-shim — 回环自动登录兜底（宿主半边）。
 *
 * 背景：dsh 0.1.2-rc.1 起 web 面板加了 launch-token 鉴权（dsh-client-connection
 * BrowserAuth）；0.1.5-rc.1 进一步把鉴权从 `/api` 扩到**首页文档本身**，无 token
 * 访问 `GET /` 直接 401 text/plain。
 *
 * 桌面壳只从 READY 行解析端口时，导航到裸 `http://127.0.0.1:<port>` 就会拿到 401 页，
 * 表现为白屏。壳侧正解是解析完整就绪 URL 并带 `?token=` 导航（见 PR #56）；
 * 本插件是**外壳侧修复落地前的服务端兜底**，且不降低鉴权强度：
 *
 * 包装 `connection.authorizeIndex()`（首页放行的唯一闸门）——
 * 仅当请求来自回环 authority、方法为 GET/HEAD、路径为 `/`、无 token 查询参数、
 * 且**未持有当前 authority 对应的有效会话 cookie** 时，改为 303 跳到
 * `connection.authenticatedUrl()`，由官方 token 流程完成换 cookie。
 * `/api`、非回环来源、非首页路径、已持有有效 cookie 的请求一律原样交回原实现。
 *
 * 与「把 isAuthenticated 放行」式止损补丁的区别：那个是直接关掉鉴权；
 * 本插件仍走官方 token 换 cookie，鉴权强度不变。
 *
 * 为什么按 cookie 名精确判定：会话 cookie 名为
 * `dsh-auth-<base64url(sha256(authority))>`，authority 含端口。只看「有没有 cookie」
 * 会把**别的端口残留的过期 cookie** 误判为已登录 → 交回原实现 → 401，
 * 那正是要消除的白屏场景（curl 等不区分端口的客户端必然踩到）。
 *
 * @module @dsh-external/dsh-hub-auth-shim
 */

import { createHash } from 'node:crypto'

export const name = '@dsh-external/dsh-hub-auth-shim'

/** connection 服务提供 authorizeIndex / authenticatedUrl。 */
export const inject = ['connection']

/** 内核会话 cookie 前缀（dsh-client-connection 的 COOKIE_PREFIX）。 */
const COOKIE_PREFIX = 'dsh-auth-'
const TOKEN_QUERY = 'token'
const LOOPBACK_V4 = /^127\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/

/**
 * 复刻内核 encodeBase64Url：标准 base64 换成 URL 安全字符集并去掉填充。
 * @param input - 原始字节。
 * @returns base64url 文本。
 */
function base64Url(input) {
  return input
    .toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/u, '')
}

/**
 * 复刻内核归一化 authority：主机名小写、去默认端口、IPv6 保留方括号。
 * @param host - 原始 Host 头。
 * @returns 归一化 authority，无法解析时为 undefined。
 */
function normalizedAuthority(host) {
  if (typeof host !== 'string' || host === '') return undefined

  const raw = host.trim().toLowerCase()

  if (raw.startsWith('[')) {
    const end = raw.indexOf(']')
    if (end === -1) return undefined
    const hostname = raw.slice(1, end)
    const port = raw.slice(end + 1).replace(/^:/u, '')
    return port === '' || port === '80' ? `[${hostname}]` : `[${hostname}]:${port}`
  }

  const at = raw.lastIndexOf(':')
  const hasPort = at !== -1 && /^\d+$/u.test(raw.slice(at + 1))
  const hostname = hasPort ? raw.slice(0, at) : raw
  const port = hasPort ? raw.slice(at + 1) : ''
  return port === '' || port === '80' ? hostname : `${hostname}:${port}`
}

/**
 * 判断 authority 是否指向回环地址（localhost / IPv6 ::1 / 整个 127/8）。
 * @param authority - 归一化 authority。
 * @returns 仅当明确是回环时为真。
 */
function isLoopbackAuthority(authority) {
  if (authority === undefined) return false

  let hostname = authority
  if (hostname.startsWith('[')) {
    const end = hostname.indexOf(']')
    if (end === -1) return false
    hostname = hostname.slice(1, end)
  } else {
    hostname = hostname.split(':')[0]
  }

  if (hostname === 'localhost' || hostname === '::1') return true

  const match = hostname.match(LOOPBACK_V4)
  return match !== null && match.slice(1).every((part) => Number(part) <= 255)
}

/**
 * 当前 authority 对应的会话 cookie 名。
 * @param authority - 归一化 authority。
 * @returns cookie 名。
 */
function sessionCookieName(authority) {
  return COOKIE_PREFIX + base64Url(createHash('sha256').update(authority).digest())
}

/**
 * Cookie 头里是否带有指定名字的 cookie。
 * @param headerValue - 原始 Cookie 头。
 * @param wanted - 期望的 cookie 名。
 * @returns 命中为真。
 */
function hasCookieNamed(headerValue, wanted) {
  if (typeof headerValue !== 'string' || headerValue === '') return false
  return headerValue.split(';').some((segment) => {
    const at = segment.indexOf('=')
    if (at === -1) return false
    return segment.slice(0, at).trim() === wanted
  })
}

/**
 * 包装 connection.authorizeIndex，返回可卸载的还原函数。
 * @param connection - connection 服务实例。
 * @returns 还原函数；API 形态不符时返回 undefined。
 */
function installLoopbackLogin(connection) {
  const original = connection.authorizeIndex
  if (typeof original !== 'function' || typeof connection.authenticatedUrl !== 'function') {
    return undefined
  }

  connection.authorizeIndex = function authorizeIndexWithLoopbackLogin(req, res) {
    if (req.method === 'GET' || req.method === 'HEAD') {
      const authority = normalizedAuthority(req.headers?.host)
      if (isLoopbackAuthority(authority)) {
        const url = new URL(req.url ?? '/', 'http://dsh.invalid')
        const hasSession = hasCookieNamed(req.headers?.cookie, sessionCookieName(authority))
        if (url.pathname === '/' && !hasSession && !url.searchParams.has(TOKEN_QUERY)) {
          res.writeHead(303, {
            'cache-control': 'no-store',
            location: connection.authenticatedUrl(`http://${req.headers.host}/`),
            'referrer-policy': 'no-referrer',
          })
          res.end()
          return false
        }
      }
    }
    return original.call(connection, req, res)
  }

  return () => {
    connection.authorizeIndex = original
  }
}

/**
 * 安装兜底。
 * @param ctx - 宿主插件上下文（已注入 connection）。
 * @returns disposer（cordis effect 用），或 undefined。
 */
export function apply(ctx) {
  const connection = ctx?.connection
  if (connection === undefined) {
    ctx?.logger?.warn?.('[auth-shim] connection 服务不可用，跳过安装')
    return undefined
  }

  const restore = installLoopbackLogin(connection)
  if (restore === undefined) {
    console.warn(
      '[auth-shim] connection API 形态与预期不符（authorizeIndex/authenticatedUrl 缺失），'
      + '首页自动登录未安装 —— 外壳不带 token 导航时可能白屏',
    )
    return undefined
  }

  ctx?.logger?.info?.('[auth-shim] 已安装：回环来源的未鉴权首页请求将自动补发 token')
  return restore
}

export const __internals = {
  COOKIE_PREFIX,
  TOKEN_QUERY,
  base64Url,
  normalizedAuthority,
  isLoopbackAuthority,
  sessionCookieName,
  hasCookieNamed,
  installLoopbackLogin,
}
