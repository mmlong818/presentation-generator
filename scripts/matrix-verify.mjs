// Quick re-screenshot a few fixtures to verify fixes.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3010'
const out = path.resolve('.realcheck/verify')
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  proxy: { server: 'http://localhost:7897', bypass: 'localhost,127.0.0.1' },
})
const page = await ctx.newPage()

const cases = [
  ['persona.normal', 'pop-magazine'],
  ['persona.normal', 'editorial-monocle'],
  ['quadrant.normal', 'academic-paper'],
  ['quadrant.normal', 'modern-minimal'],
]

for (const [fx, theme] of cases) {
  await page.goto(`${BASE}/deck?fx=${fx}&theme=${theme}`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(800)
  await page.evaluate(() => {
    document.querySelectorAll('aside').forEach(a => a.style.display = 'none')
    document.querySelector('header.px-4')?.setAttribute('style', 'display:none')
  })
  await page.waitForTimeout(150)
  await page.screenshot({ path: path.join(out, `${fx}__${theme}.png`) })
}
await browser.close()
console.log('done')
