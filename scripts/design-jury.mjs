// 12 主题 × 2-3 个关键 fixture 截图，给设计师评审用
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3010'
const out = path.resolve('.realcheck/jury')
mkdirSync(out, { recursive: true })

const THEMES = [
  'modern-minimal','editorial-monocle','academic-paper','midnight-luxe',
  'swiss-grid','tech-utility','blueprint','cyberpunk-neon',
  'brutalist-mono','pop-magazine','risograph','glassmorphism',
]

// 3 fixtures that exercise typography, hierarchy, and data viz
const FIXTURES = ['cover.normal', 'argument.3', 'data.3']

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  proxy: { server: 'http://localhost:7897', bypass: 'localhost,127.0.0.1' },
})
const page = await ctx.newPage()

const total = THEMES.length * FIXTURES.length
let done = 0
const t0 = Date.now()
for (const theme of THEMES) {
  for (const fx of FIXTURES) {
    const url = `${BASE}/deck?fx=${fx}&theme=${theme}`
    await page.goto(url, { waitUntil: 'networkidle' })
    await page.waitForTimeout(600)
    await page.evaluate(() => {
      document.querySelectorAll('aside').forEach(a => a.style.display = 'none')
      document.querySelector('header.px-4')?.setAttribute('style', 'display:none')
    })
    await page.waitForTimeout(120)
    await page.screenshot({ path: path.join(out, `${theme}__${fx}.png`) })
    done++
  }
}
console.log(`${done}/${total} cells in ${((Date.now() - t0)/1000).toFixed(1)}s`)
await browser.close()
