import { createServer } from 'node:http'
import { Application } from '@webviewjs/webview'
const server = createServer((_q, r) => { r.writeHead(200); r.end('<!doctype html><body>t</body>') })
server.listen(3083, '127.0.0.1', () => console.log('server up'))
const app = new Application()
const win = app.createBrowserWindow({ title: 't', width: 400, height: 300 })
const wv = win.createWebview({ url: 'http://127.0.0.1:3083' })
app.whenReady({ interval: 16, ref: true })
let closed = false
win.on('close', () => {
  console.log('close event fired (window', closed ? 'again' : 'first', ')')
  if (!closed) {
    closed = true
    // 尝试：不 exit，hide，看窗口是否还能用（即 close 是否真的销毁了窗口）
    setTimeout(() => {
      try {
        win.hide()
        console.log('hide OK after close — window object still alive')
        setTimeout(() => {
          try {
            win.show(); win.focus()
            console.log('show OK after close — window RECOVERABLE (close was interceptable)')
          } catch (e) { console.log('show failed:', e.message) }
          app.exit(); server.close(); process.exit(0)
        }, 1500)
      } catch (e) {
        console.log('hide failed after close:', e.message)
        app.exit(); server.close(); process.exit(0)
      }
    }, 500)
  }
})
setTimeout(() => { console.log('triggering win.close()'); win.close() }, 3000)
