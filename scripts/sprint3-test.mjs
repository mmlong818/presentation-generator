// Sprint 3 — icon picker, theme reduction, AI imagine stub
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3010'
const out = path.resolve('.realcheck/sprint3')
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  locale: 'zh-CN',
  proxy: { server: 'http://localhost:7897', bypass: 'localhost,127.0.0.1' },
})
const page = await ctx.newPage()
const errs = []
page.on('pageerror', e => errs.push(`[pageerror] ${e.message}`))
page.on('console', m => { if (m.type() === 'error') errs.push(`[console.error] ${m.text().slice(0, 200)}`) })

// 1) /quick page: should show 12 themes
await page.goto(`${BASE}/quick`, { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
const themeButtonsQuick = await page.locator('section >> button:has-text("dark"), section >> button:has-text("light")').count()
console.log('/quick visible theme buttons:', themeButtonsQuick, '(expect 12)')

// 2) Deck: open icon picker
await page.goto(`${BASE}/deck?fixture=statement&theme=modern-minimal`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
await page.getByRole('button', { name: /\+ 图标/ }).click()
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(out, '01-icon-picker.png') })
const iconCards = await page.locator('button[title*="·"]').count()
console.log('icon cards visible:', iconCards)

// 3) Pick a "rocket" icon
await page.locator('button[title*="rocket"]').first().click()
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(out, '02-after-pick-icon.png') })

// 4) Test imagine stub via /api
const res = await page.request.post(`${BASE}/api/imagine`, {
  data: { prompt: 'a clean isometric illustration of a rocket', provider: 'stub' },
})
const j = await res.json()
console.log('imagine stub status:', res.status(), 'returns dataUrl:', !!j.dataUrl)

console.log('\nerrors:', errs.length)
errs.forEach(e => console.log(' ', e))
await browser.close()
console.log('done')
