import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync, mkdirSync, existsSync, readdirSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createHash } from 'node:crypto'

import { __internals } from '../lib/index.js'

const {
  cwdOf,
  collectSnapshot,
  captureBaseline,
  loadBaseline,
  diffSnapshot,
  loadLedger,
  recordFinding,
  generateReport,
  SKIP_DIRS,
} = __internals

function tempWorkspace() {
  return mkdtempSync(join(tmpdir(), 'dsh-findings-ledger-test-'))
}
function cleanup(dir) {
  rmSync(dir, { recursive: true, force: true })
}

describe('__internals', () => {
  it('exposes all helpers as non-undefined values', () => {
    const entries = {
      cwdOf, collectSnapshot, captureBaseline, loadBaseline, diffSnapshot,
      loadLedger, recordFinding, generateReport, SKIP_DIRS,
    }
    for (const [name, value] of Object.entries(entries)) {
      assert.notEqual(value, undefined, `__internals.${name} is undefined`)
    }
  })
})

describe('cwdOf', () => {
  it('resolves the cwd from session.header.cwd first', () => {
    assert.equal(cwdOf({ session: { header: { cwd: 'C:/a' } }, header: { cwd: 'C:/b' }, cwd: 'C:/c' }), 'C:/a')
  })

  it('falls back to header.cwd then bare cwd', () => {
    assert.equal(cwdOf({ header: { cwd: 'C:/b' }, cwd: 'C:/c' }), 'C:/b')
    assert.equal(cwdOf({ cwd: 'C:/c' }), 'C:/c')
  })

  it('returns null when no cwd is present anywhere', () => {
    assert.equal(cwdOf(null), null)
    assert.equal(cwdOf({}), null)
  })
})

describe('SKIP_DIRS', () => {
  it('contains the standard ignore set', () => {
    for (const name of ['node_modules', '.git', '.dsh', '.dsh-memory', '.dsh-findings', 'dist', 'build', 'coverage']) {
      assert.equal(SKIP_DIRS.has(name), true, `SKIP_DIRS must contain ${name}`)
    }
  })
})

describe('collectSnapshot', () => {
  it('hashes workspace files with forward-slash relative paths', () => {
    const dir = tempWorkspace()
    try {
      writeFileSync(join(dir, 'a.txt'), 'hello', 'utf8')
      mkdirSync(join(dir, 'sub'))
      writeFileSync(join(dir, 'sub', 'b.txt'), 'world', 'utf8')
      const snap = collectSnapshot(dir)
      assert.deepEqual(Object.keys(snap).sort(), ['a.txt', 'sub/b.txt'])
      assert.equal(snap['a.txt'], createHash('sha1').update('hello').digest('hex'))
      assert.equal(snap['sub/b.txt'], createHash('sha1').update('world').digest('hex'))
    } finally {
      cleanup(dir)
    }
  })

  it('skips SKIP_DIRS entries and oversized files', () => {
    const dir = tempWorkspace()
    try {
      writeFileSync(join(dir, 'a.txt'), 'keep', 'utf8')
      mkdirSync(join(dir, 'node_modules'))
      writeFileSync(join(dir, 'node_modules', 'x.js'), 'skip', 'utf8')
      mkdirSync(join(dir, '.git'))
      writeFileSync(join(dir, '.git', 'HEAD'), 'skip', 'utf8')
      mkdirSync(join(dir, '.dsh-findings'))
      writeFileSync(join(dir, '.dsh-findings', 'ledger.jsonl'), 'skip', 'utf8')
      mkdirSync(join(dir, 'emptydir')) // dirs carry no entry themselves
      writeFileSync(join(dir, 'big.bin'), Buffer.alloc(4 * 1024 * 1024 + 1, 0), 'utf8')
      const snap = collectSnapshot(dir)
      assert.deepEqual(Object.keys(snap), ['a.txt'])
    } finally {
      cleanup(dir)
    }
  })

  it('survives a missing workspace directory', () => {
    const missing = join(tmpdir(), 'dsh-findings-ledger-nonexistent-' + Date.now())
    assert.deepEqual(collectSnapshot(missing), {})
  })
})

describe('captureBaseline / loadBaseline', () => {
  it('writes baseline.json and returns the file count', () => {
    const dir = tempWorkspace()
    try {
      writeFileSync(join(dir, 'a.txt'), 'hello', 'utf8')
      mkdirSync(join(dir, 'sub'))
      writeFileSync(join(dir, 'sub', 'b.txt'), 'world', 'utf8')
      const count = captureBaseline(dir)
      assert.equal(count, 2)
      assert.equal(existsSync(join(dir, '.dsh-findings', 'baseline.json')), true)
    } finally {
      cleanup(dir)
    }
  })

  it('loadBaseline round-trips cwd, capturedAt and the file map', () => {
    const dir = tempWorkspace()
    try {
      assert.equal(loadBaseline(dir), null) // nothing captured yet
      writeFileSync(join(dir, 'a.txt'), 'hello', 'utf8')
      captureBaseline(dir)
      const base = loadBaseline(dir)
      assert.equal(base.cwd, dir)
      assert.equal(typeof base.capturedAt, 'string')
      assert.deepEqual(base.files, { 'a.txt': createHash('sha1').update('hello').digest('hex') })
    } finally {
      cleanup(dir)
    }
  })

  it('recapturing replaces the baseline with the current tree', () => {
    const dir = tempWorkspace()
    try {
      writeFileSync(join(dir, 'a.txt'), 'v1', 'utf8')
      captureBaseline(dir)
      writeFileSync(join(dir, 'a.txt'), 'v2-changed', 'utf8')
      writeFileSync(join(dir, 'new.txt'), 'added', 'utf8')
      const count = captureBaseline(dir)
      assert.equal(count, 2)
      const base = loadBaseline(dir)
      assert.equal(base.files['a.txt'], createHash('sha1').update('v2-changed').digest('hex'))
      assert.ok(base.files['new.txt'])
    } finally {
      cleanup(dir)
    }
  })
})

describe('diffSnapshot', () => {
  it('classifies Added / Modified / Deleted and sorts by path', () => {
    const base = { 'a.txt': '1', 'b.txt': '2', 'c.txt': '3' }
    const cur = { 'b.txt': '2', 'c.txt': '3x', 'd.txt': '4' }
    assert.deepEqual(diffSnapshot(base, cur), [
      { path: 'a.txt', status: 'D' },
      { path: 'c.txt', status: 'M' },
      { path: 'd.txt', status: 'A' },
    ])
  })

  it('returns an empty list for identical snapshots', () => {
    const same = { 'a.txt': 'h' }
    assert.deepEqual(diffSnapshot(same, { ...same }), [])
  })

  it('handles empty snapshots on either side', () => {
    assert.deepEqual(diffSnapshot({}, {}), [])
    assert.deepEqual(diffSnapshot({}, { 'n.txt': 'x' }), [{ path: 'n.txt', status: 'A' }])
    assert.deepEqual(diffSnapshot({ 'o.txt': 'x' }, {}), [{ path: 'o.txt', status: 'D' }])
  })
})

describe('loadLedger / recordFinding', () => {
  it('returns an empty array when the ledger does not exist', () => {
    const dir = tempWorkspace()
    try {
      assert.deepEqual(loadLedger(dir), [])
    } finally {
      cleanup(dir)
    }
  })

  it('appends findings as JSONL and parses them back', () => {
    const dir = tempWorkspace()
    try {
      const rec = recordFinding(dir, 'sess-1', 'the build script has a typo', 'scripts/build.sh', 'bug')
      assert.equal(rec.tag, 'bug')
      assert.equal(rec.statement, 'the build script has a typo')
      assert.equal(rec.targetFile, 'scripts/build.sh')
      assert.equal(rec.session, 'sess-1')
      assert.equal(typeof rec.ts, 'string')
      assert.equal(Number.isNaN(Date.parse(rec.ts)), false)

      recordFinding(dir, null, 'no target', null) // tag defaults to 'finding'
      const ledger = loadLedger(dir)
      assert.equal(ledger.length, 2)
      assert.deepEqual(ledger[0], rec)
      assert.equal(ledger[1].tag, 'finding')
      assert.equal(ledger[1].targetFile, null)
      assert.equal(ledger[1].session, null)
    } finally {
      cleanup(dir)
    }
  })
})

describe('generateReport', () => {
  it('marks a finding verified when its target file changed after the baseline', () => {
    const dir = tempWorkspace()
    try {
      writeFileSync(join(dir, 'a.txt'), 'base', 'utf8')
      captureBaseline(dir)
      recordFinding(dir, 's1', 'new module added', 'new.txt', 'fix')
      writeFileSync(join(dir, 'new.txt'), 'content', 'utf8')

      const { report, file } = generateReport(dir)
      assert.equal(report.schema_version, 'dsh-findings-ledger/v1')
      assert.equal(report.coverage.baseline.captured, true)
      assert.equal(report.coverage.change_tracking.changes, 1)
      assert.deepEqual(report.coverage.change_tracking.changedFiles, ['new.txt'])
      assert.equal(report.findings.length, 1)
      assert.equal(report.findings[0].verified, true)
      assert.equal(report.findings[0].reason, 'file-changed')
      assert.deepEqual(report.coverage.findings, { total: 1, verified: 1, unverified: 0 })
      assert.equal(report.coverage.status, 'complete')
      assert.equal(report.run_status, 'complete')

      // the report file is persisted under .dsh-findings/reports/
      assert.equal(existsSync(file), true)
      const parsed = JSON.parse(readFileSync(file, 'utf8'))
      assert.equal(parsed.schema_version, 'dsh-findings-ledger/v1')
      const reports = readdirSync(join(dir, '.dsh-findings', 'reports'))
      assert.equal(reports.length >= 1, true)
      assert.ok(reports.every((n) => /^task-review-\d+\.json$/.test(n)))
    } finally {
      cleanup(dir)
    }
  })

  it('marks an unchanged target as unverified and the coverage as partial', () => {
    const dir = tempWorkspace()
    try {
      writeFileSync(join(dir, 'a.txt'), 'base', 'utf8')
      writeFileSync(join(dir, 'old.txt'), 'base', 'utf8')
      captureBaseline(dir)
      recordFinding(dir, 's1', 'new module added', 'new.txt', 'fix')
      recordFinding(dir, 's1', 'old module changed', 'old.txt', 'fix')
      writeFileSync(join(dir, 'new.txt'), 'content', 'utf8') // old.txt untouched

      const { report } = generateReport(dir)
      assert.equal(report.coverage.findings.total, 2)
      assert.equal(report.coverage.findings.verified, 1)
      assert.equal(report.coverage.findings.unverified, 1)
      assert.equal(report.coverage.status, 'partial')
      assert.equal(report.findings[0].verified, true)
      assert.equal(report.findings[1].verified, false)
      assert.equal(report.findings[1].reason, 'file-unchanged')
    } finally {
      cleanup(dir)
    }
  })

  it('reports incomplete when errors are passed in', () => {
    const dir = tempWorkspace()
    try {
      const { report } = generateReport(dir, null, [{ code: 'lint-failed', stage: 'scan' }])
      assert.equal(report.run_status, 'incomplete')
      assert.equal(report.coverage.status, 'incomplete')
      assert.deepEqual(report.errors, [{ code: 'lint-failed', stage: 'scan' }])
    } finally {
      cleanup(dir)
    }
  })

  it('handles a workspace without a baseline or findings', () => {
    const dir = tempWorkspace()
    try {
      const { report } = generateReport(dir)
      assert.equal(report.coverage.baseline.captured, false)
      assert.equal(report.coverage.findings.total, 0)
      assert.equal(report.coverage.status, 'none')
      assert.equal(report.run_status, 'none')
      assert.equal(report.coverage.change_tracking.changes, 0)
    } finally {
      cleanup(dir)
    }
  })

  it('normalizes targetFile paths (backslashes, ./ prefix)', () => {
    const dir = tempWorkspace()
    try {
      captureBaseline(dir)
      recordFinding(dir, 's1', 'windows-style target', '.\\sub\\file.txt', 'fix')
      mkdirSync(join(dir, 'sub'))
      writeFileSync(join(dir, 'sub', 'file.txt'), 'new', 'utf8')
      const { report } = generateReport(dir)
      assert.equal(report.findings[0].targetFile, 'sub/file.txt')
      assert.equal(report.findings[0].verified, true)
    } finally {
      cleanup(dir)
    }
  })
})
