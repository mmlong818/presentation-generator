// Sprint 2 — exercise layout picker, change layout, add image, add text
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3010'
const out = path.resolve('.realcheck/sprint2')
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

await page.goto(`${BASE}/deck?fixture=cover&theme=modern-minimal`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

// 1) Open layout picker via "+ 版式"
await page.getByRole('button', { name: /\+ 版式/ }).click()
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(out, '01-picker-open.png') })

// 2) Pick "数据" KPI 看板
await page.locator('button', { hasText: /KPI 看板/ }).first().click()
await page.waitForTimeout(800)
await page.screenshot({ path: path.join(out, '02-after-insert-kpi.png') })
const thumbsAfterInsert = await page.locator('aside canvas').count()
console.log('thumbs after insert:', thumbsAfterInsert)

// 3) Switch the new slide's layout to 表格
await page.getByRole('button', { name: /切换版式/ }).click()
await page.waitForTimeout(500)
// Find the picker button whose name is "表格" — match the bold name div
await page.locator('button:has-text("表格"):has-text("多列对照")').first().click()
await page.waitForTimeout(800)
await page.screenshot({ path: path.join(out, '03-after-change-layout.png') })

// 4) Add text element
await page.getByRole('button', { name: /\+ 文本/ }).click()
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(out, '04-after-add-text.png') })

// 5) Inspector should now show the new text element since addElement selects it
const inspectorTitle = await page.locator('aside').last().locator('text=文本元素').count()
console.log('inspector shows text element:', inspectorTitle > 0)

// 6) Add image — fabricate a tiny png file and insert via file input
const filePath = path.resolve(out, '_sample.png')
const fs = await import('node:fs')
// 1x1 red png
const png = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108020000009077', 'hex')
fs.writeFileSync(filePath, png)
const fileInput = page.locator('input[type=file]').first()
await fileInput.setInputFiles(filePath)
await page.waitForTimeout(1000)
await page.screenshot({ path: path.join(out, '05-after-add-image.png') })

// 7) Undo
await page.keyboard.press('Control+z')
await page.waitForTimeout(400)
await page.keyboard.press('Control+z')
await page.waitForTimeout(400)
await page.screenshot({ path: path.join(out, '06-after-undo.png') })

console.log('\nerrors:', errs.length)
errs.forEach(e => console.log(' ', e))

await browser.close()
console.log('done')
