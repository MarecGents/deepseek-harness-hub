// ipc-smoke.mjs — M1 本地窗口 IPC 冒烟断言（SOP §2.6）
//
// 前置：dev-shell-page.mjs（beforeDevCommand 已起）+ `cargo tauri dev` 窗口已打开。
// 逻辑：轮询 dev server /smoke 端点，断言窗口内页面 invoke('ping') 上报 pong。
// 用法：node scripts/ipc-smoke.mjs
// 模块类别：Helper（M1 验收脚本）

const PORT = 17891
const base = `http://127.0.0.1:${PORT}`

async function fetchSmoke(tries = 90) {
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(`${base}/smoke`)
      if (res.ok) return await res.json()
    } catch { /* dev server 未就绪，重试 */ }
    await new Promise((r) => setTimeout(r, 1000))
  }
  return null
}

const result = await fetchSmoke()
if (result?.result === 'pong') {
  console.log('PASS  ipc-smoke: invoke(ping) → pong（窗口 IPC + capabilities 链路 OK）')
  process.exit(0)
}
console.error(`FAIL  ipc-smoke: 未收到 pong（result=${JSON.stringify(result)}）`)
console.error('      检查：窗口是否创建（cargo tauri dev 日志）、dev page 是否加载、capabilities 是否授权（core:event:default/log:default）')
process.exit(1)
