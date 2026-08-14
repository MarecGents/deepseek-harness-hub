import { createServer } from 'node:http'
import { Application } from '@webviewjs/webview'
const server = createServer((_q, r) => { r.writeHead(200); r.end('<!doctype html><body>t</body>') })
server.listen(3084, '127.0.0.1', () => console.log('up'))
const app = new Application()
const win = app.createBrowserWindow({ title: 't', width: 400, height: 300 })
win.createWebview({ url: 'http://127.0.0.1:3084' })
// 不用 whenReady 的 ref（避免窗口关闭后 loop 停）——测试用自身 timer ref
const pump = setInterval(() => { app.pumpEvents?.() }, 16)
let n = 0
win.on('close', () => {
  console.log('close fired #', ++n)
  // 尝试 setClosable(false) 阻止
  try { win.setClosable(false); console.log('setClosable(false) OK') } catch (e) { console.log('setClosable err', e.message) }
  try { win.hide(); console.log('hide OK') } catch (e) { console.log('hide err', e.message) }
  if (n >= 2) { clearInterval(pump); app.exit(); process.exit(0) }
})
setTimeout(() => { console.log('win.close() #1'); win.close() }, 3000)
setTimeout(() => { console.log('win.close() #2'); win.close() }, 6000)
