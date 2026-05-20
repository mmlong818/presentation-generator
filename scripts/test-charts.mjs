// Visualize new chart layouts
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3010'
const out = path.resolve('.realcheck/charts')
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  proxy: { server: 'http://localhost:7897', bypass: 'localhost,127.0.0.1' },
})
const page = await ctx.newPage()
const cases = [
  ['chart-line.normal', 'modern-minimal'],
  ['chart-line.normal', 'editorial-monocle'],
  ['chart-line.multi', 'midnight-luxe'],
  ['chart-line.multi', 'cyberpunk-neon'],
  ['chart-pie.normal', 'modern-minimal'],
  ['chart-pie.normal', 'midnight-luxe'],
  ['chart-pie.normal', 'editorial-monocle'],
  ['chart-area.normal', 'modern-minimal'],
  ['chart-area.normal', 'tech-utility'],
  ['chart-area.normal', 'midnight-luxe'],
]
for (const [fx, theme] of cases) {
  await page.goto(`${BASE}/deck?fx=${fx}&theme=${theme}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await page.evaluate(() => {
    document.querySelectorAll('aside').forEach(a => a.style.display = 'none')
    document.querySelector('header.px-4')?.setAttribute('style', 'display:none')
  })
  await page.waitForTimeout(200)
  await page.screenshot({ path: path.join(out, `${fx}__${theme}.png`) })
}
await browser.close()
console.log('done')
