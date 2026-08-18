// dev-shell-page.mjs — M1 临时页伺服（T1.7）
//
// 职责：极简静态页（深色背景 + 一行文字 + IPC 冒烟上报端点）由本地 http server 伺服，
//       `tauri.conf.json` 的 devUrl 指向它（M4 起废弃，devUrl 改指 dsh web 端口）。
// 模块类别：Helper（dev 工具）

import { createServer } from 'node:http'
import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = dirname(dirname(fileURLToPath(import.meta.url)))
const PORT = 17891

/** 每次请求动态读取（dev 期改 html 即时生效，不缓存旧内容） */
const html = () => readFileSync(join(root, 'dev', 'index.html'))

/** IPC 冒烟结果（页面 invoke 后经 /smoke?result= 上报；ipc-smoke.mjs 轮询断言） */
let smokeResult = null

const server = createServer((req, res) => {
  const url = new URL(req.url, `http://127.0.0.1:${PORT}`)
  if (url.pathname === '/smoke') {
    if (url.searchParams.has('result')) smokeResult = url.searchParams.get('result')
    res.setHeader('content-type', 'application/json')
    res.end(JSON.stringify({ result: smokeResult }))
    return
  }
  res.setHeader('content-type', 'text/html; charset=utf-8')
  res.end(html())
})

server.listen(PORT, '127.0.0.1', () => {
  console.log(`[dev-shell] serving http://127.0.0.1:${PORT}`)
})
