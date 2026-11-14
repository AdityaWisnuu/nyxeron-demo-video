// Deterministic capture: virtual time advances exactly 1/30 s per frame; an in-page director scrolls and moves the cursor.
import { chromium } from 'playwright-core'
import fs from 'node:fs'
const [url, out, secs, script] = process.argv.slice(2)
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=metal', '--enable-gpu', '--ignore-gpu-blocklist', '--hide-scrollbars', '--autoplay-policy=no-user-gesture-required'] })
const ctx = await b.newContext({ viewport: { width: 1920, height: 1080 } })
await ctx.addInitScript({ path: './cursor.js' })
const p = await ctx.newPage()
await p.goto(url, { waitUntil: 'networkidle' })
await p.waitForTimeout(2500)
fs.rmSync(out, { recursive: true, force: true }); fs.mkdirSync(out, { recursive: true })
const cdp = await ctx.newCDPSession(p)
await p.evaluate(fs.readFileSync(script, 'utf8'))
await cdp.send('Emulation.setVirtualTimePolicy', { policy: 'pause' })
const N = Math.round(Number(secs) * 30)
for (let i = 0; i < N; i++) {
  await new Promise((res) => { cdp.once('Emulation.virtualTimeBudgetExpired', res); cdp.send('Emulation.setVirtualTimePolicy', { policy: 'advance', budget: 1000 / 30 }) })
  await p.waitForTimeout(55) // let the media pipeline paint the seeked frame
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 92 })
  fs.writeFileSync(`${out}/${String(i).padStart(5, '0')}.jpg`, Buffer.from(data, 'base64'))
}
await b.close()
console.log('frames', N)
