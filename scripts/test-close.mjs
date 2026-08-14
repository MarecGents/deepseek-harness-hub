import { createServer } from 'node:http'
import { Application } from '@webviewjs/webview'
const server = createServer((_q, r) => { r.writeHead(200); r.end('<!doctype html><body>close test</body>') })
server.listen(3082, '127.0.0.1', () => console.log('up'))
const app = new Application()
const win = app.createBrowserWindow({ title: 'close test', width: 400, height: 300 })
const wv = win.createWebview({ url: 'http://127.0.0.1:3082' })
win.on('close', () => {
  console.log('close event fired')
  // 尝试阻止：hide + 延迟看是否还活着
  setTimeout(() => {
    try {
      win.show()
      win.focus()
      console.log('window still usable after close (CAN intercept)')
    } catch (e) {
      console.log('window gone after close (CANNOT intercept):', e.message)
    }
    app.exit(); server.close(); process.exit(0)
  }, 1000)
})
app.whenReady({ interval: 16, ref: true })
// 2.5s 后程序化关闭窗口测试
setTimeout(() => { win.close() }, 2500)
