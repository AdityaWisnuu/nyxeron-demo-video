// Recorder daemon: high-quality CDP screencast of one page per clip, a visible cursor, smooth eased mouse moves.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
import { execFileSync } from 'node:child_process'
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required', '--hide-scrollbars'] })
const N = process.env.WHO; const STATE = `./state-${N}.json`
const ctx = await browser.newContext({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1, ...(fs.existsSync(STATE) ? { storageState: STATE } : {}) })
await ctx.addInitScript({ path: './cursor.js' })
let p = await ctx.newPage(); globalThis.p = p
let cdp = null, frames = [], clip = null, cur = [960, 540]
const log = (...a) => fs.appendFileSync(`rec-${N}.log`, a.join(' ') + '\n')
globalThis.save = () => ctx.storageState({ path: STATE })
globalThis.start = async (name) => {
  clip = name; frames = []; fs.rmSync(`frames/${name}`, { recursive: true, force: true }); fs.mkdirSync(`frames/${name}`, { recursive: true })
  cdp = await ctx.newCDPSession(p)
  cdp.on('Page.screencastFrame', async (f) => { const i = frames.length; fs.writeFileSync(`frames/${name}/${String(i).padStart(5, '0')}.jpg`, Buffer.from(f.data, 'base64')); frames.push(f.metadata.timestamp); try { await cdp.send('Page.screencastFrameAck', { sessionId: f.sessionId }) } catch {} })
  await cdp.send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: 1920, maxHeight: 1080, everyNthFrame: 1 })
  globalThis.t0 = Date.now(); return 'rec ' + name
}
globalThis.stop = async () => {
  await cdp.send('Page.stopScreencast'); await cdp.detach(); cdp = null
  const name = clip, ts = frames
  const lines = []
  for (let i = 0; i < ts.length; i++) { lines.push(`file '${String(i).padStart(5, '0')}.jpg'`); lines.push(`duration ${Math.max(0.001, (ts[i + 1] ?? ts[i] + 0.04) - ts[i]).toFixed(4)}`) }
  lines.push(`file '${String(ts.length - 1).padStart(5, '0')}.jpg'`)
  fs.writeFileSync(`frames/${name}/list.txt`, lines.join('\n'))
  execFileSync('ffmpeg', ['-loglevel', 'error', '-y', '-f', 'concat', '-safe', '0', '-i', `frames/${name}/list.txt`, '-vf', 'fps=30,format=yuv420p', '-c:v', 'libx264', '-crf', '14', '-preset', 'medium', `clips/${name}.mp4`])
  return `${name}: ${ts.length} frames, ${(ts.at(-1) - ts[0]).toFixed(1)}s`
}
const ease = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
globalThis.moveTo = async (x, y, ms = 700) => {
  const [sx, sy] = cur, n = Math.max(8, Math.round(ms / 16))
  for (let i = 1; i <= n; i++) { const k = ease(i / n); await p.mouse.move(sx + (x - sx) * k, sy + (y - sy) * k); await p.waitForTimeout(16) }
  cur = [x, y]
}
globalThis.box = async (loc) => { const b = await loc.boundingBox(); if (!b) throw new Error('no box'); return b }
globalThis.hover = async (loc, ms = 700) => { await loc.scrollIntoViewIfNeeded(); const b = await box(loc); await moveTo(b.x + b.width / 2, b.y + b.height / 2, ms); await p.waitForTimeout(250) }
globalThis.click = async (loc, ms = 700) => { await hover(loc, ms); await p.mouse.down(); await p.waitForTimeout(90); await p.mouse.up(); await p.waitForTimeout(350) }
globalThis.wait = (ms) => p.waitForTimeout(ms)
globalThis.shot = (f) => p.screenshot({ path: f })
globalThis.newPage = async () => { await p.close(); p = await ctx.newPage(); globalThis.p = p; return 'new page' }
log('ready')
for (;;) {
  if (fs.existsSync(`cmd-${N}.txt`)) {
    const code = fs.readFileSync(`cmd-${N}.txt`, 'utf8'); fs.unlinkSync(`cmd-${N}.txt`)
    if (code.trim() === 'exit') break
    try { const r = await eval(`(async () => { ${code} })()`); log('OK', typeof r === 'string' ? r : JSON.stringify(r)) } catch (e) { log('ERR', e.message.split('\n')[0]) }
    log('---')
  }
  await new Promise((r) => setTimeout(r, 150))
}
await ctx.close(); await browser.close()
