import { chromium } from 'playwright'
import { mkdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3010'
const out = path.resolve('.realcheck/llm-verify')
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  proxy: { server: 'http://localhost:7897', bypass: 'localhost,127.0.0.1' },
})
const page = await ctx.newPage()

// Use the tech-talk deck that had "4h → 18h" issue
const deck = JSON.parse(readFileSync('.realcheck/llm/tech-talk.deck.json', 'utf-8'))
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await page.evaluate(d => localStorage.setItem('pg_last_deck', JSON.stringify(d)), deck)
await page.goto(`${BASE}/deck`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)

// Go to slide 2 (data)
await page.locator('aside canvas').nth(1).click()
await page.waitForTimeout(500)
await page.evaluate(() => {
  document.querySelectorAll('aside').forEach(a => a.style.display = 'none')
  document.querySelector('header.px-4')?.setAttribute('style', 'display:none')
})
await page.screenshot({ path: path.join(out, 'data-after-fix.png') })
await browser.close()
console.log('done')
