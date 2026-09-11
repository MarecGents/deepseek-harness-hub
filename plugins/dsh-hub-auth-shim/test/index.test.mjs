import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { __internals } from '../lib/index.js'

const {
  base64Url,
  normalizedAuthority,
  isLoopbackAuthority,
  sessionCookieName,
  hasCookieNamed,
  installLoopbackLogin,
} = __internals

/**
 * 造一个最小 req/res 替身。
 * @param {{method?: string, url?: string, host?: string, cookie?: string}} overrides
 * @returns {{req: object, res: object, state: object}}
 */
function harness(overrides = {}) {
  const headers = {}
  if (overrides.host !== undefined) headers.host = overrides.host
  if (overrides.cookie !== undefined) headers.cookie = overrides.cookie

  const state = { status: undefined, headers: undefined, ended: false, originalCalls: 0 }
  const req = { method: overrides.method ?? 'GET', url: overrides.url ?? '/', headers }
  const res = {
    writeHead(status, hdrs) {
      state.status = status
      state.headers = hdrs
    },
    end() {
      state.ended = true
    },
  }
  return { req, res, state }
}

/**
 * 造一个 connection 服务替身。
 * @param {object} [overrides]
 * @returns {object}
 */
function fakeConnection(overrides = {}) {
  const calls = { originalCalls: 0, authenticatedUrl: [] }
  const connection = {
    authorizeIndex(req, res) {
      calls.originalCalls += 1
      res.writeHead(401, { 'content-type': 'text/plain; charset=utf-8' })
      res.end()
      return false
    },
    authenticatedUrl(baseUrl) {
      calls.authenticatedUrl.push(baseUrl)
      return `${baseUrl}?token=TEST-TOKEN`
    },
    ...overrides,
  }
  connection.__calls = calls
  return connection
}

describe('cookie 名算法与内核一致', () => {
  it('sessionCookieName 命中实测样本（真实服务器抓取）', () => {
    // 样本来源：dsh 0.1.2-rc.1 本地实测，Set-Cookie 的 name 字段
    assert.equal(
      sessionCookieName('127.0.0.1:7182'),
      'dsh-auth-wfAzMcxTq76EyvVvdYNFay_AquvocU6gHEnpncyA79k',
    )
  })

  it('包含 authority，端口不同则 cookie 名不同', () => {
    assert.notEqual(sessionCookieName('127.0.0.1:7182'), sessionCookieName('127.0.0.1:7183'))
  })

  it('base64Url 去填充并使用 URL 安全字符集', () => {
    const out = base64Url(Buffer.from([0xfb, 0xff, 0xbf]))
    assert.equal(out.includes('+'), false)
    assert.equal(out.includes('/'), false)
    assert.equal(out.endsWith('='), false)
  })
})

describe('normalizedAuthority', () => {
  it('保留非默认端口', () => {
    assert.equal(normalizedAuthority('127.0.0.1:7182'), '127.0.0.1:7182')
  })

  it('主机名小写、去默认端口 80', () => {
    assert.equal(normalizedAuthority('LOCALHOST:80'), 'localhost')
    assert.equal(normalizedAuthority('LocalHost'), 'localhost')
  })

  it('IPv6 保留方括号，去默认端口', () => {
    assert.equal(normalizedAuthority('[::1]:3080'), '[::1]:3080')
    assert.equal(normalizedAuthority('[::1]:80'), '[::1]')
  })

  it('非法输入返回 undefined', () => {
    assert.equal(normalizedAuthority(''), undefined)
    assert.equal(normalizedAuthority(undefined), undefined)
    assert.equal(normalizedAuthority('[::1'), undefined)
  })
})

describe('isLoopbackAuthority', () => {
  it('识别 localhost / IPv6 / 整个 127/8', () => {
    assert.equal(isLoopbackAuthority('localhost'), true)
    assert.equal(isLoopbackAuthority('[::1]'), true)
    assert.equal(isLoopbackAuthority('127.0.0.1:7182'), true)
    assert.equal(isLoopbackAuthority('127.255.255.255:1'), true)
  })

  it('拒绝非回环与越界地址', () => {
    assert.equal(isLoopbackAuthority('evil.example'), false)
    assert.equal(isLoopbackAuthority('128.0.0.1'), false)
    assert.equal(isLoopbackAuthority('127.0.0.256'), false)
    assert.equal(isLoopbackAuthority('10.0.0.1'), false)
    assert.equal(isLoopbackAuthority(undefined), false)
  })
})

describe('hasCookieNamed', () => {
  it('按名精确命中，不受其它 cookie 干扰', () => {
    assert.equal(hasCookieNamed('a=1; target=2; b=3', 'target'), true)
    assert.equal(hasCookieNamed('prefix-target=2', 'target'), false)
    assert.equal(hasCookieNamed('', 'target'), false)
    assert.equal(hasCookieNamed(undefined, 'target'), false)
  })
})

describe('installLoopbackLogin', () => {
  it('API 形态不符时返回 undefined（不抛）', () => {
    assert.equal(installLoopbackLogin({}), undefined)
    assert.equal(installLoopbackLogin({ authorizeIndex() {} }), undefined)
  })

  it('回环 + 首页 + 无 token + 无 cookie → 303 带 token', () => {
    const connection = fakeConnection()
    installLoopbackLogin(connection)
    const { req, res, state } = harness({ host: '127.0.0.1:7182' })
    assert.equal(connection.authorizeIndex(req, res), false)
    assert.equal(state.status, 303)
    assert.equal(state.headers.location, 'http://127.0.0.1:7182/?token=TEST-TOKEN')
    assert.equal(connection.__calls.originalCalls, 0, '不应落到原实现')
  })

  it('已持有当前 authority 的有效 cookie → 交回原实现', () => {
    const connection = fakeConnection()
    installLoopbackLogin(connection)
    const cookie = `${sessionCookieName('127.0.0.1:7182')}=v1.abc.def`
    const { req, res, state } = harness({ host: '127.0.0.1:7182', cookie })
    connection.authorizeIndex(req, res)
    assert.equal(state.status, 401)
    assert.equal(connection.__calls.originalCalls, 1)
  })

  it('只带别的端口的过期 cookie → 仍然补跳转（防白屏关键用例）', () => {
    const connection = fakeConnection()
    installLoopbackLogin(connection)
    const stale = `${sessionCookieName('127.0.0.1:9999')}=v1.abc.def`
    const { req, res, state } = harness({ host: '127.0.0.1:7182', cookie: stale })
    connection.authorizeIndex(req, res)
    assert.equal(state.status, 303)
  })

  it('非回环 / 非首页 / 带 token / 非 GET → 一律交回原实现', () => {
    const cases = [
      { host: 'evil.example', url: '/' },
      { host: '10.0.0.1:3080', url: '/' },
      { host: '127.0.0.1:7182', url: '/assets/index.js' },
      { host: '127.0.0.1:7182', url: '/?token=X' },
      { host: '127.0.0.1:7182', url: '/', method: 'POST' },
    ]
    for (const c of cases) {
      const connection = fakeConnection()
      installLoopbackLogin(connection)
      const { req, res, state } = harness(c)
      connection.authorizeIndex(req, res)
      assert.equal(state.status, 401, `应落到原实现: ${JSON.stringify(c)}`)
      assert.equal(connection.__calls.originalCalls, 1)
    }
  })

  it('还原函数恢复原实现', () => {
    const connection = fakeConnection()
    const original = connection.authorizeIndex
    const restore = installLoopbackLogin(connection)
    assert.notEqual(connection.authorizeIndex, original)
    restore()
    assert.equal(connection.authorizeIndex, original)
  })
})
