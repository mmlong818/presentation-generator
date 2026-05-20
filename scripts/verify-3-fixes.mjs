import { chromium } from 'playwright'
import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3010'
const out = path.resolve('.realcheck/opt-verify')
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  proxy: { server: 'http://localhost:7897', bypass: 'localhost,127.0.0.1' },
})
const page = await ctx.newPage()

const cases = [
  { name: 'product-q1', slideIdx: 1, label: 'kpi-board (hint position)' },  // 2nd slide
  { name: 'pitch-vc', slideIdx: 3, label: 'kpi-board midnight-luxe' },
  { name: 'tech-talk', slideIdx: 3, label: 'argument long-points' },   // 4th slide
  { name: 'tech-talk', slideIdx: 5, label: 'cta newAction sizing' },   // 6th slide
  { name: 'pitch-vc', slideIdx: 5, label: 'cta midnight-luxe' },
]

for (const c of cases) {
  const deck = JSON.parse(readFileSync(`.realcheck/llm/${c.name}.deck.json`, 'utf-8'))
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.evaluate(d => localStorage.setItem('pg_last_deck', JSON.stringify(d)), deck)
  await page.goto(`${BASE}/deck`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  await page.locator('aside canvas').nth(c.slideIdx).click()
  await page.waitForTimeout(400)
  await page.evaluate(() => {
    document.querySelectorAll('aside').forEach(a => a.style.display = 'none')
    document.querySelector('header.px-4')?.setAttribute('style', 'display:none')
  })
  await page.screenshot({ path: path.join(out, `${c.name}-${c.slideIdx}-${c.label.replace(/[^\w-]+/g, '_')}.png`) })
}
await browser.close()
console.log('done')
