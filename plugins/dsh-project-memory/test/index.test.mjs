import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { __internals } from '../lib/index.js'

const { cwdOf, readFact, readJournalTail, renderMemory, appendJournal, appendFact } = __internals

// Fresh throwaway workspace per test — renderMemory caches per cwd, so a
// unique dir keeps cache state from bleeding between tests.
function tempWorkspace() {
  const dir = mkdtempSync(join(tmpdir(), 'dsh-project-memory-test-'))
  return dir
}
function cleanup(dir) {
  rmSync(dir, { recursive: true, force: true })
}

describe('__internals', () => {
  it('exposes all helpers as non-undefined values', () => {
    const entries = { cwdOf, readFact, readJournalTail, renderMemory, appendJournal, appendFact }
    for (const [name, value] of Object.entries(entries)) {
      assert.notEqual(value, undefined, `__internals.${name} is undefined`)
    }
  })
})

describe('cwdOf', () => {
  it('resolves the cwd from session.header.cwd first', () => {
    assert.equal(cwdOf({ session: { header: { cwd: 'C:/ws1' } }, header: { cwd: 'C:/ws2' }, cwd: 'C:/ws3' }), 'C:/ws1')
  })

  it('falls back to header.cwd then bare cwd', () => {
    assert.equal(cwdOf({ header: { cwd: 'C:/ws2' }, cwd: 'C:/ws3' }), 'C:/ws2')
    assert.equal(cwdOf({ cwd: 'C:/ws3' }), 'C:/ws3')
  })

  it('returns null when no cwd is present anywhere', () => {
    assert.equal(cwdOf(null), null)
    assert.equal(cwdOf(undefined), null)
    assert.equal(cwdOf({}), null)
    assert.equal(cwdOf({ session: { header: {} } }), null)
  })
})

describe('readFact', () => {
  it('returns empty string when FACT.md is missing', () => {
    const dir = tempWorkspace()
    try {
      assert.equal(readFact(dir), '')
    } finally {
      cleanup(dir)
    }
  })

  it('returns the file content verbatim', () => {
    const dir = tempWorkspace()
    try {
      mkdirSync(join(dir, '.dsh-memory'))
      writeFileSync(join(dir, '.dsh-memory', 'FACT.md'), '- 项目使用 pnpm\n', 'utf8')
      assert.equal(readFact(dir), '- 项目使用 pnpm\n')
    } finally {
      cleanup(dir)
    }
  })

  it('returns empty string for a zero-byte FACT.md', () => {
    const dir = tempWorkspace()
    try {
      mkdirSync(join(dir, '.dsh-memory'))
      writeFileSync(join(dir, '.dsh-memory', 'FACT.md'), '', 'utf8')
      assert.equal(readFact(dir), '')
    } finally {
      cleanup(dir)
    }
  })

  it('reads only the last 64KB of an oversized FACT.md', () => {
    const dir = tempWorkspace()
    try {
      mkdirSync(join(dir, '.dsh-memory'))
      const big = 'x'.repeat(70 * 1024) // 70KB > MAX_FACT_BYTES (64KB)
      writeFileSync(join(dir, '.dsh-memory', 'FACT.md'), big, 'utf8')
      const tail = readFact(dir)
      assert.equal(tail.length, 64 * 1024)
      assert.equal(tail, big.slice(big.length - 64 * 1024))
    } finally {
      cleanup(dir)
    }
  })
})

describe('readJournalTail', () => {
  it('returns an empty array when JOURNAL.jsonl is missing', () => {
    const dir = tempWorkspace()
    try {
      assert.deepEqual(readJournalTail(dir), [])
    } finally {
      cleanup(dir)
    }
  })

  it('returns parsed lines with blanks trimmed away', () => {
    const dir = tempWorkspace()
    try {
      mkdirSync(join(dir, '.dsh-memory'))
      writeFileSync(join(dir, '.dsh-memory', 'JOURNAL.jsonl'), '{"n":1}\n\n  {"n":2}  \n', 'utf8')
      assert.deepEqual(readJournalTail(dir), ['{"n":1}', '{"n":2}'])
    } finally {
      cleanup(dir)
    }
  })

  it('returns an empty array for a zero-byte journal', () => {
    const dir = tempWorkspace()
    try {
      mkdirSync(join(dir, '.dsh-memory'))
      writeFileSync(join(dir, '.dsh-memory', 'JOURNAL.jsonl'), '', 'utf8')
      assert.deepEqual(readJournalTail(dir), [])
    } finally {
      cleanup(dir)
    }
  })

  it('caps the tail at the last 60 lines', () => {
    const dir = tempWorkspace()
    try {
      mkdirSync(join(dir, '.dsh-memory'))
      const lines = []
      for (let i = 1; i <= 70; i++) lines.push('{"i":' + i + '}')
      writeFileSync(join(dir, '.dsh-memory', 'JOURNAL.jsonl'), lines.join('\n') + '\n', 'utf8')
      const tail = readJournalTail(dir)
      assert.equal(tail.length, 60)
      assert.equal(JSON.parse(tail[0]).i, 11)
      assert.equal(JSON.parse(tail[59]).i, 70)
    } finally {
      cleanup(dir)
    }
  })
})

describe('renderMemory', () => {
  it('returns empty string for a missing cwd', () => {
    assert.equal(renderMemory(null), '')
  })

  it('returns empty string when no memory files exist', () => {
    const dir = tempWorkspace()
    try {
      assert.equal(renderMemory(dir), '')
    } finally {
      cleanup(dir)
    }
  })

  it('renders the FACT block when only FACT.md exists', () => {
    const dir = tempWorkspace()
    try {
      mkdirSync(join(dir, '.dsh-memory'))
      writeFileSync(join(dir, '.dsh-memory', 'FACT.md'), '- uses pnpm\n', 'utf8')
      const text = renderMemory(dir)
      assert.ok(text.includes('### 项目记忆（dsh-project-memory，自动加载）'))
      assert.ok(text.includes('## 项目事实（FACT）'))
      assert.ok(text.includes('- uses pnpm'))
      assert.equal(text.includes('JOURNAL'), false)
    } finally {
      cleanup(dir)
    }
  })

  it('renders both FACT and JOURNAL blocks when both exist', () => {
    const dir = tempWorkspace()
    try {
      mkdirSync(join(dir, '.dsh-memory'))
      writeFileSync(join(dir, '.dsh-memory', 'FACT.md'), '- fact\n', 'utf8')
      writeFileSync(join(dir, '.dsh-memory', 'JOURNAL.jsonl'), '{"tag":"lesson"}\n', 'utf8')
      const text = renderMemory(dir)
      assert.ok(text.includes('## 项目事实（FACT）'))
      assert.ok(text.includes('## 近期反馈流（JOURNAL 尾部）'))
      assert.ok(text.includes('{"tag":"lesson"}'))
    } finally {
      cleanup(dir)
    }
  })

  it('re-renders after a write invalidates the (mtime, size) cache key', () => {
    const dir = tempWorkspace()
    try {
      // first render caches the "empty workspace" state (missing files)
      assert.equal(renderMemory(dir), '')
      appendFact(dir, 'cached then uncached')
      assert.ok(renderMemory(dir).includes('cached then uncached'))
      // second append must also be picked up (size key changed again)
      appendFact(dir, 'second fact')
      const text = renderMemory(dir)
      assert.ok(text.includes('cached then uncached'))
      assert.ok(text.includes('second fact'))
    } finally {
      cleanup(dir)
    }
  })
})

describe('appendJournal', () => {
  it('creates .dsh-memory/JOURNAL.jsonl and appends the record as one JSON line', () => {
    const dir = tempWorkspace()
    try {
      const rec = { ts: '2026-09-02T00:00:00.000Z', session: 's1', tag: 'lesson', entry: 'hello' }
      appendJournal(dir, rec)
      appendJournal(dir, { ...rec, entry: 'world' })
      const p = join(dir, '.dsh-memory', 'JOURNAL.jsonl')
      assert.equal(existsSync(p), true)
      const lines = readFileSync(p, 'utf8').split('\n').filter(Boolean)
      assert.equal(lines.length, 2)
      assert.deepEqual(JSON.parse(lines[0]), rec)
      assert.equal(JSON.parse(lines[1]).entry, 'world')
    } finally {
      cleanup(dir)
    }
  })
})

describe('appendFact', () => {
  it('writes the first fact and reports duplicates as skipped', () => {
    const dir = tempWorkspace()
    try {
      assert.equal(appendFact(dir, 'uses pnpm'), true)
      assert.equal(existsSync(join(dir, '.dsh-memory', 'FACT.md')), true)
      assert.equal(appendFact(dir, 'uses pnpm'), false)
      assert.equal(readFileSync(join(dir, '.dsh-memory', 'FACT.md'), 'utf8'), '- uses pnpm\n')
    } finally {
      cleanup(dir)
    }
  })

  it('collapses multiline statements to one line', () => {
    const dir = tempWorkspace()
    try {
      assert.equal(appendFact(dir, 'line one\nline two'), true)
      assert.ok(readFileSync(join(dir, '.dsh-memory', 'FACT.md'), 'utf8').includes('- line one line two\n'))
    } finally {
      cleanup(dir)
    }
  })

  it('strips a leading markdown bullet and still dedupes against it', () => {
    const dir = tempWorkspace()
    try {
      assert.equal(appendFact(dir, '- bulleted fact'), true)
      assert.ok(readFileSync(join(dir, '.dsh-memory', 'FACT.md'), 'utf8').includes('- bulleted fact\n'))
      assert.equal(appendFact(dir, 'bulleted fact'), false)
    } finally {
      cleanup(dir)
    }
  })

  it('rejects blank statements without creating FACT.md', () => {
    const dir = tempWorkspace()
    try {
      assert.equal(appendFact(dir, '   '), false)
      assert.equal(appendFact(dir, '\n\n'), false)
      assert.equal(existsSync(join(dir, '.dsh-memory', 'FACT.md')), false)
    } finally {
      cleanup(dir)
    }
  })

  it('treats a whitespace-padded duplicate as a duplicate', () => {
    const dir = tempWorkspace()
    try {
      appendFact(dir, 'fact a')
      assert.equal(appendFact(dir, '  fact a  '), false)
    } finally {
      cleanup(dir)
    }
  })
})
