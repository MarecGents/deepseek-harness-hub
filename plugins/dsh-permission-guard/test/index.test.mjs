import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { __internals } from '../lib/index.js'

const {
  wildcardToRegExp,
  matchAny,
  capabilityKey,
  lastEventValue,
  decide,
  denialFor,
  readonlyDenial,
  isHostAllowed,
  isOriginAllowed,
  toJsonSchema,
  DEFAULT_CONFIG,
} = __internals

// Guard: every exported internal must actually resolve to a value.
describe('__internals', () => {
  it('exposes all helpers as non-undefined values', () => {
    const entries = {
      wildcardToRegExp, matchAny, capabilityKey, lastEventValue,
      decide, denialFor, readonlyDenial, isHostAllowed,
      isOriginAllowed, toJsonSchema, DEFAULT_CONFIG,
    }
    for (const [name, value] of Object.entries(entries)) {
      assert.notEqual(value, undefined, `__internals.${name} is undefined`)
    }
  })
})

describe('wildcardToRegExp', () => {
  it('translates a trailing * into a prefix match', () => {
    const re = wildcardToRegExp('bash=rm*')
    assert.equal(re.test('bash=rm -rf /tmp'), true)
    assert.equal(re.test('bash=rmx'), true) // `*` matches any run, incl. empty
    assert.equal(re.test('pwsh=rm -rf /tmp'), false)
  })

  it('anchors the pattern at both ends', () => {
    const re = wildcardToRegExp('bash=ls')
    assert.equal(re.test('bash=ls'), true)
    assert.equal(re.test('xbash=lsx'), false)
    assert.equal(re.test('bash=ls -la'), false)
  })

  it('matches literal dots only (regex metacharacters are escaped)', () => {
    const re = wildcardToRegExp('bash=node --check a.js')
    assert.equal(re.test('bash=node --check a.js'), true)
    assert.equal(re.test('bash=node --check aXjs'), false)
  })

  it('supports * in the middle of a pattern', () => {
    const re = wildcardToRegExp('bash=git *')
    assert.equal(re.test('bash=git push origin main'), true)
    assert.equal(re.test('bash=git push'), true)
    assert.equal(re.test('bash=gitx push'), false)
  })
})

describe('matchAny', () => {
  it('returns true when any pattern matches', () => {
    assert.equal(matchAny('bash=rm -rf /', ['bash=rm*', 'pwsh=rm*']), true)
  })

  it('returns false when no pattern matches', () => {
    assert.equal(matchAny('bash=ls', ['bash=rm*', 'pwsh=rm*']), false)
  })

  it('returns false for null/undefined/empty pattern lists', () => {
    assert.equal(matchAny('bash=ls', null), false)
    assert.equal(matchAny('bash=ls', undefined), false)
    assert.equal(matchAny('bash=ls', []), false)
  })
})

describe('capabilityKey', () => {
  it('builds bash=<command> with trimmed command', () => {
    assert.equal(capabilityKey({ name: 'bash', arguments: { command: '  ls -la  ' } }), 'bash=ls -la')
  })

  it('falls back to arguments.script for shell tools', () => {
    assert.equal(capabilityKey({ name: 'pwsh', arguments: { script: 'git status' } }), 'pwsh=git status')
  })

  it('uses the bare tool name for non-shell tools', () => {
    assert.equal(capabilityKey({ name: 'read', arguments: { path: 'x' } }), 'read')
    assert.equal(capabilityKey({ name: 'read' }), 'read')
  })

  it('yields an empty string for missing/empty exec', () => {
    assert.equal(capabilityKey(undefined), '')
    assert.equal(capabilityKey({}), '')
  })
})

describe('lastEventValue', () => {
  const exec = (...events) => ({ agent: { session: { events } } })

  it('returns the value of the last matching event', () => {
    const events = [
      { type: 'sandbox/mode', data: { value: 'read-only' } },
      { type: 'other', data: { value: 'x' } },
      { type: 'sandbox/mode', data: { value: 'danger-full-access' } },
    ]
    assert.equal(lastEventValue(exec(...events), 'sandbox/mode'), 'danger-full-access')
  })

  it('falls back to data.mode then data.policy', () => {
    assert.equal(lastEventValue(exec({ type: 'approval/policy', data: { mode: 'ask' } }), 'approval/policy'), 'ask')
    assert.equal(lastEventValue(exec({ type: 'approval/policy', data: { policy: 'never' } }), 'approval/policy'), 'never')
  })

  it('returns undefined when no event matches', () => {
    assert.equal(lastEventValue(exec({ type: 'other', data: { value: 1 } }), 'sandbox/mode'), undefined)
  })

  it('returns undefined for missing session/events', () => {
    assert.equal(lastEventValue({}, 'sandbox/mode'), undefined)
    assert.equal(lastEventValue({ agent: { session: { events: 'nope' } } }, 'sandbox/mode'), undefined)
  })
})

describe('decide', () => {
  const config = {
    defaultTier: 'confirm',
    rules: [{ match: 'bash=*', tier: 'give-command' }],
    tiers: {
      auto: ['read', 'bash=ls*'],
      'give-command': ['bash=taskkill*'],
      confirm: ['bash=git push*'],
      never: ['bash=rm -rf*'],
    },
  }

  it('never wins over every other tier', () => {
    assert.equal(decide(config, 'bash=rm -rf /data'), 'never')
  })

  it('explicit tier beats the rules fallback', () => {
    assert.equal(decide(config, 'bash=git push origin'), 'confirm')
    assert.equal(decide(config, 'bash=ls -la'), 'auto')
    assert.equal(decide(config, 'read'), 'auto')
  })

  it('falls back to ordered rules when no tier matches', () => {
    assert.equal(decide(config, 'bash=whoami'), 'give-command')
  })

  it('returns defaultTier when nothing matches', () => {
    assert.equal(decide(config, 'pwsh=Get-Content x'), 'confirm')
  })

  it('tier precedence is never > confirm > give-command > auto', () => {
    const both = {
      defaultTier: 'auto',
      rules: [],
      tiers: { auto: ['x'], confirm: ['x'], never: ['x'], 'give-command': ['x'] },
    }
    assert.equal(decide(both, 'x'), 'never')
  })

  it('works against DEFAULT_CONFIG shipped entries', () => {
    assert.equal(decide(DEFAULT_CONFIG, 'pwsh=format c:'), 'never')
    assert.equal(decide(DEFAULT_CONFIG, 'bash=git push origin main'), 'confirm')
    assert.equal(decide(DEFAULT_CONFIG, 'permission_reload'), 'auto')
    assert.equal(decide(DEFAULT_CONFIG, 'bash=some-unknown-command'), 'confirm')
  })
})

describe('denialFor', () => {
  it('auto tier yields no denial (undefined)', () => {
    assert.equal(denialFor('auto', 'bash=ls'), undefined)
  })

  it('every deny tier yields a message containing the tier and key', () => {
    assert.equal(denialFor('never', 'bash=rm -rf /'), '权限拦截（never 层）：此操作被禁止 → bash=rm -rf /')
    assert.equal(denialFor('confirm', 'bash=curl x'), '权限拦截（confirm 层）：此操作需先确认 → bash=curl x')
    assert.equal(
      denialFor('give-command', 'bash=shutdown'),
      '权限拦截（give-command 层）：此操作需你手动执行，我不代跑 → bash=shutdown',
    )
  })

  it('handles unknown tiers with a generic message', () => {
    assert.equal(denialFor('custom-tier', 'k'), '权限拦截（custom-tier 层）：k')
  })
})

describe('readonlyDenial', () => {
  const config = { tiers: { auto: ['read', 'glob', 'bash=ls*'] } }

  it('allows entries on the auto tier', () => {
    assert.equal(readonlyDenial(config, 'read'), undefined)
    assert.equal(readonlyDenial(config, 'bash=ls -la'), undefined)
  })

  it('denies anything else with the given label', () => {
    const msg = readonlyDenial(config, 'bash=rm x', '只读会话')
    assert.equal(msg, '权限拦截（只读会话）：此操作不在只读放行列表 → bash=rm x')
  })
})

describe('isHostAllowed', () => {
  it('allows loopback hosts with a port', () => {
    assert.equal(isHostAllowed({ headers: { host: '127.0.0.1:3000' } }), true)
    assert.equal(isHostAllowed({ headers: { host: 'localhost:8080' } }), true)
  })

  it('is case-insensitive and trims whitespace', () => {
    assert.equal(isHostAllowed({ headers: { host: '  LOCALHOST ' } }), true)
  })

  it('allows bracketed IPv6 loopback', () => {
    assert.equal(isHostAllowed({ headers: { host: '[::1]:5000' } }), true)
  })

  it('rejects non-loopback hosts (incl. DNS-rebinding lookalikes)', () => {
    assert.equal(isHostAllowed({ headers: { host: 'example.com' } }), false)
    assert.equal(isHostAllowed({ headers: { host: '127.0.0.1.evil.com' } }), false)
    assert.equal(isHostAllowed({ headers: { host: 'localhost.example.com:80' } }), false)
  })

  it('rejects a missing host header', () => {
    assert.equal(isHostAllowed({ headers: {} }), false)
  })
})

describe('isOriginAllowed', () => {
  it('rejects a missing/empty Origin header', () => {
    assert.equal(isOriginAllowed({ headers: {} }), false)
    assert.equal(isOriginAllowed({ headers: { origin: '' } }), false)
  })

  it('allows loopback http(s) origins', () => {
    assert.equal(isOriginAllowed({ headers: { origin: 'http://127.0.0.1:5173' } }), true)
    assert.equal(isOriginAllowed({ headers: { origin: 'https://localhost' } }), true)
  })

  it('rejects IPv6 origins (URL.hostname keeps the brackets, so the ::1 comparison misses)', () => {
    // Documents current behavior: new URL('http://[::1]:9000').hostname === '[::1]'
    assert.equal(isOriginAllowed({ headers: { origin: 'http://[::1]:9000' } }), false)
  })

  it('allows only tauri://localhost', () => {
    assert.equal(isOriginAllowed({ headers: { origin: 'tauri://localhost' } }), true)
    assert.equal(isOriginAllowed({ headers: { origin: 'tauri://evil.com' } }), false)
  })

  it('rejects cross-site origins and malformed values', () => {
    assert.equal(isOriginAllowed({ headers: { origin: 'https://evil.com' } }), false)
    assert.equal(isOriginAllowed({ headers: { origin: 'not a url' } }), false)
  })
})

describe('toJsonSchema', () => {
  it('maps a parameter spec to a JSON schema object', () => {
    const schema = toJsonSchema({
      entry: { type: 'string', required: true, description: '内容' },
      tag: { type: 'string' },
    })
    assert.deepEqual(schema, {
      type: 'object',
      properties: {
        entry: { type: 'string', description: '内容' },
        tag: { type: 'string' },
      },
      required: ['entry'],
    })
  })

  it('omits `required` when no parameter is required', () => {
    const schema = toJsonSchema({ a: { type: 'number' } })
    assert.equal('required' in schema, false)
  })

  it('defaults to string type and tolerates an empty/missing spec', () => {
    assert.deepEqual(toJsonSchema({ x: {} }), { type: 'object', properties: { x: { type: 'string' } } })
    assert.deepEqual(toJsonSchema(null), { type: 'object', properties: {} })
  })
})

describe('DEFAULT_CONFIG', () => {
  it('ships the strict default posture with four tiers', () => {
    assert.equal(DEFAULT_CONFIG.policy, 'follow')
    assert.equal(DEFAULT_CONFIG.defaultTier, 'confirm')
    for (const tier of ['auto', 'give-command', 'confirm', 'never']) {
      assert.ok(Array.isArray(DEFAULT_CONFIG.tiers[tier]), `tiers.${tier} must be a list`)
      assert.ok(DEFAULT_CONFIG.tiers[tier].length > 0)
    }
    assert.ok(DEFAULT_CONFIG.rules.length > 0)
  })

  it('keeps the Windows red lines under pwsh= only', () => {
    assert.equal(matchAny('pwsh=format c:', DEFAULT_CONFIG.tiers.never), true)
    assert.equal(matchAny('bash=format c:', DEFAULT_CONFIG.tiers.never), false)
  })
})
