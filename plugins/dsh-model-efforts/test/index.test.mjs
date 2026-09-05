/**
 * @dsh-external/dsh-model-efforts — node:test suite for the pure helpers
 * exposed via globalThis.__dshModelEffortsInternals (lib/client.js runs the
 * loader registration only in the browser; under node the import is a no-op
 * aside from the test mirror).
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import '../lib/client.js'

const { THINKING_LEVELS, stripUndefined, validateEfforts, pickWriteMode, buildOps } =
  globalThis.__dshModelEffortsInternals

describe('stripUndefined', () => {
  it('drops undefined fields recursively', () => {
    assert.deepEqual(stripUndefined({ a: 1, b: undefined, c: { d: undefined, e: 2 } }), { a: 1, c: { e: 2 } })
  })
  it('keeps null and false (both meaningful declarations)', () => {
    assert.deepEqual(stripUndefined({ off: null, f: false }), { off: null, f: false })
  })
  it('strips undefined inside arrays', () => {
    assert.deepEqual(stripUndefined([{ a: undefined, b: 1 }, 2]), [{ b: 1 }, 2])
  })
})

describe('validateEfforts (mirror of llm-pi-ai write-time rules)', () => {
  it('accepts false (non-reasoning declaration)', () => {
    assert.equal(validateEfforts(false), null)
  })
  it('accepts a well-formed dict', () => {
    assert.equal(validateEfforts({ off: null, low: 'low', high: 'high' }), null)
  })
  it('rejects an empty dict (V1)', () => {
    assert.match(validateEfforts({}), /declare at least one/)
  })
  it('rejects a non-off null value (V2)', () => {
    assert.match(validateEfforts({ low: null }), /only the 'off' level/)
  })
  it('rejects an empty-string value (V3)', () => {
    assert.match(validateEfforts({ low: '' }), /must not be an empty string/)
  })
  it('rejects declaring only off (V4)', () => {
    assert.match(validateEfforts({ off: null }), /declaring only/)
  })
  it('rejects unknown levels', () => {
    assert.match(validateEfforts({ absurd: 'x' }), /unknown effort level/)
  })
  it('rejects non-string non-null values', () => {
    assert.match(validateEfforts({ low: 3 }), /must be a string or null/)
  })
  it('rejects non-object non-false input', () => {
    assert.match(validateEfforts(null), /must be false or an object/)
    assert.match(validateEfforts(['low']), /must be false or an object/)
  })
})

describe('pickWriteMode', () => {
  it('override mode for catalog-only routes (empty models array)', () => {
    assert.equal(pickWriteMode([]), 'override')
    assert.equal(pickWriteMode(null), 'override')
  })
  it('array mode for hand-declared routes', () => {
    assert.equal(pickWriteMode([{ id: 'm1' }]), 'array')
  })
})

describe('buildOps — override route', () => {
  it('builds a set op at the modelOverrides path', () => {
    const ops = buildOps('my-gateway', 'my-model', { off: null, high: 'high' }, [])
    assert.equal(ops.length, 1)
    assert.equal(ops[0].op, 'set')
    assert.deepEqual(ops[0].path, ['providers', 'my-gateway', 'modelOverrides', 'my-model', 'reasoningEfforts'])
    assert.deepEqual(ops[0].value, { off: null, high: 'high' })
  })
  it('builds an unset op for inherit (null)', () => {
    const ops = buildOps('gw', 'm', null, [])
    assert.equal(ops[0].op, 'unset')
    assert.deepEqual(ops[0].path, ['providers', 'gw', 'modelOverrides', 'm', 'reasoningEfforts'])
  })
  it('throws on an invalid declaration', () => {
    assert.throws(() => buildOps('gw', 'm', {}, []), /declare at least one/)
  })
})

describe('buildOps — hand-declared route (whole-array write)', () => {
  const models = [
    { id: 'm1', name: 'Model One', contextWindow: 8192 },
    { id: 'm2', name: 'Model Two' },
  ]
  it('rewrites the whole models array with the target entry updated', () => {
    const ops = buildOps('gw', 'm2', { low: 'low' }, models)
    assert.equal(ops.length, 1)
    assert.equal(ops[0].op, 'set')
    assert.deepEqual(ops[0].path, ['providers', 'gw', 'models'])
    const value = ops[0].value
    assert.equal(value.length, 2)
    assert.equal(value[0].id, 'm1')
    assert.deepEqual(value[1].reasoningEfforts, { low: 'low' })
  })
  it('removes the declaration on inherit (key dropped, other fields kept)', () => {
    const withEfforts = [{ id: 'm1', reasoningEfforts: { low: 'low' }, name: 'M1' }]
    const ops = buildOps('gw', 'm1', null, withEfforts)
    assert.deepEqual(ops[0].value, [{ id: 'm1', name: 'M1' }])
  })
  it('never produces an array-index path (applyPathOp would destroy the array)', () => {
    const ops = buildOps('gw', 'm2', { low: 'low' }, models)
    const flat = JSON.stringify(ops[0].path)
    assert.ok(!/\d/.test(flat.replace('models', '')), 'no numeric path segment allowed')
  })
  it('throws when models is not an array in array mode', () => {
    assert.throws(() => buildOps('gw', 'm', { low: 'low' }, 'nope'), /not an array/)
  })
})

describe('THINKING_LEVELS', () => {
  it('matches the dsh rc.1 level set', () => {
    assert.deepEqual(THINKING_LEVELS, ['off', 'minimal', 'low', 'medium', 'high', 'xhigh', 'max'])
  })
})
