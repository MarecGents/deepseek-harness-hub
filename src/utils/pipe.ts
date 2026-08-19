/**
 * Pipe parsing utilities — pure functions for the two-way pipe protocol.
 *
 * @module dsh-hub/utils/pipe
 * @category Utils（纯函数，无副作用）
 */

import { MG_TRAY_PREFIX, type MgTrayFrame } from '../models/pipe.js'

/**
 * 解析一行 stdin 输入为壳下行帧（`MG_TRAY <json>`）。
 * @param line - 原始行（可能带换行符，readline 已剥离）。
 * @returns 帧对象；非 MG_TRAY 前缀或 JSON 非法 → null（调用方负责区分与日志）。
 */
export function parseMgTrayLine(line: string): MgTrayFrame | null {
  if (!line.startsWith(MG_TRAY_PREFIX)) return null
  try {
    return JSON.parse(line.slice(MG_TRAY_PREFIX.length)) as MgTrayFrame
  } catch {
    return null
  }
}
