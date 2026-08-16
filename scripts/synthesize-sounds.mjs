#!/usr/bin/env node
/**
 * synthesize-sounds.mjs — original event chimes for dsh-hub, rendered to WAV
 * (44.1 kHz / 16-bit / mono). NOT copied from any library: each event is an
 * original note sequence with a sine-plus-harmonic voice and an exponential
 * decay, composed for the dsh-hub shell (Reasonix's mixkit files were dropped
 * per project decision — see assets/sounds/README.md).
 *
 * Events:
 *  - start     提问: quick ascending two-note (E5→A5)
 *  - success   完成: three-note ascending arpeggio (C5→E5→G5)
 *  - attention 需要你: two-tone alert (A5→E5)
 *  - error     出错: descending minor figure (F4→C#4→A3)
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const OUT_DIR = join(dirname(dirname(fileURLToPath(import.meta.url))), 'assets', 'sounds')
const SAMPLE_RATE = 44100

/** One sine-plus-harmonic note with an exponential decay envelope. */
function noteBuffer(freq, duration, volume) {
  const n = Math.floor(SAMPLE_RATE * duration)
  const buf = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const t = i / SAMPLE_RATE
    const attack = Math.min(1, i / (SAMPLE_RATE * 0.004))
    const decay = Math.exp(-3.2 * (i / n))
    const env = attack * decay * volume
    // Fundamental + gentle 2nd harmonic (octave shimmer) for a softer voice.
    buf[i] = env * (Math.sin(2 * Math.PI * freq * t) + 0.35 * Math.sin(4 * Math.PI * freq * t))
  }
  return buf
}

/** Mix sequential notes into one event buffer. */
function compose(notes, tail = 0.12) {
  const last = notes.reduce((max, n) => Math.max(max, n.offset + n.duration), 0)
  const total = last + tail
  const out = new Float32Array(Math.floor(SAMPLE_RATE * total))
  for (const { freq, offset, duration, volume } of notes) {
    const start = Math.floor(SAMPLE_RATE * offset)
    const src = noteBuffer(freq, duration, volume)
    for (let i = 0; i < src.length && start + i < out.length; i++) {
      out[start + i] += src[i]
    }
  }
  return out
}

/** Encode a float buffer as a 16-bit PCM WAV file. */
function toWav(samples) {
  const data = Buffer.alloc(samples.length * 2)
  for (let i = 0; i < samples.length; i++) {
    const v = Math.max(-1, Math.min(1, samples[i]))
    data.writeInt16LE(Math.round(v * 32767), i * 2)
  }
  const header = Buffer.alloc(44)
  header.write('RIFF', 0)
  header.writeUInt32LE(36 + data.length, 4)
  header.write('WAVE', 8)
  header.write('fmt ', 12)
  header.writeUInt32LE(16, 16) // fmt chunk size
  header.writeUInt16LE(1, 20) // PCM
  header.writeUInt16LE(1, 22) // mono
  header.writeUInt32LE(SAMPLE_RATE, 24)
  header.writeUInt32LE(SAMPLE_RATE * 2, 28) // byte rate
  header.writeUInt16LE(2, 32) // block align
  header.writeUInt16LE(16, 34) // bits per sample
  header.write('data', 36)
  header.writeUInt32LE(data.length, 40)
  return Buffer.concat([header, data])
}

const EVENTS = {
  'dsh-hub-start': compose([
    { freq: 659.25, offset: 0.00, duration: 0.09, volume: 0.30 },
    { freq: 880.00, offset: 0.10, duration: 0.14, volume: 0.30 },
  ]),
  'dsh-hub-success': compose([
    { freq: 523.25, offset: 0.00, duration: 0.15, volume: 0.30 },
    { freq: 659.25, offset: 0.16, duration: 0.16, volume: 0.30 },
    { freq: 783.99, offset: 0.33, duration: 0.30, volume: 0.32 },
  ]),
  'dsh-hub-attention': compose([
    { freq: 880.00, offset: 0.00, duration: 0.16, volume: 0.34 },
    { freq: 659.25, offset: 0.18, duration: 0.24, volume: 0.32 },
  ]),
  'dsh-hub-error': compose([
    { freq: 349.23, offset: 0.00, duration: 0.20, volume: 0.28 },
    { freq: 277.18, offset: 0.22, duration: 0.22, volume: 0.26 },
    { freq: 220.00, offset: 0.46, duration: 0.32, volume: 0.24 },
  ]),
}

mkdirSync(OUT_DIR, { recursive: true })
for (const [name, samples] of Object.entries(EVENTS)) {
  writeFileSync(join(OUT_DIR, `${name}.wav`), toWav(samples))
}
console.log(`[dsh-hub] synthesized ${Object.keys(EVENTS).length} event chimes into ${OUT_DIR}`)
