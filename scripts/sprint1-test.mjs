// Sprint 1 — exercise add/remove/reorder slides, drag element, double-click edit, inspector
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3010'
const out = path.resolve('.realcheck/sprint1')
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

await page.goto(`${BASE}/deck?fixture=process&theme=modern-minimal`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
await page.screenshot({ path: path.join(out, '01-initial.png') })

// Add slide
const addBtn = page.getByRole('button', { name: /\+ 新增/ })
await addBtn.click()
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(out, '02-after-add.png') })
const thumbsAfterAdd = await page.locator('aside canvas').count()
console.log('thumbs after add:', thumbsAfterAdd)

// Duplicate first slide
await page.locator('aside canvas').first().click()
await page.waitForTimeout(300)
const dupBtn = page.getByRole('button', { name: /复制/ })
await dupBtn.click()
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(out, '03-after-duplicate.png') })
const thumbsAfterDup = await page.locator('aside canvas').count()
console.log('thumbs after duplicate:', thumbsAfterDup)

// Click on a text element (the process heading) to select
await page.goto(`${BASE}/deck?fixture=process&theme=modern-minimal`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
const headingText = page.locator('[aria-label="text-overlay"]').last().locator('text=从想法到落地').first()
await headingText.click()
await page.waitForTimeout(400)
await page.screenshot({ path: path.join(out, '04-text-selected.png') })

// Inspector visible?
const inspectorSel = page.locator('aside.w-\\[260px\\]')
const inspectorTitle = await inspectorSel.locator('text=文本元素').count()
console.log('inspector showing text element controls:', inspectorTitle > 0)

// Double-click to enter edit mode
await headingText.dblclick()
await page.waitForTimeout(400)
const textareaCount = await page.locator('textarea').count()
console.log('textareas (edit mode):', textareaCount)
await page.screenshot({ path: path.join(out, '05-text-edit-mode.png') })

// Edit text and blur
const editTa = page.locator('textarea').first()
await editTa.fill('改后的标题：从想法到落地的真实路径')
await page.locator('canvas').first().click({ position: { x: 10, y: 10 } })  // click stage to blur
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(out, '06-after-edit.png') })
const bodyTxt = await page.locator('body').innerText()
console.log('contains edited text:', bodyTxt.includes('改后的标题'))

// Delete key on selected element
await page.locator('[aria-label="text-overlay"]').last().locator('text=改后的标题').first().click()
await page.waitForTimeout(300)
await page.keyboard.press('Delete')
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(out, '07-after-delete.png') })

// Undo
await page.keyboard.press('Control+z')
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(out, '08-after-undo.png') })

console.log('\nerrors:', errs.length)
errs.forEach(e => console.log(' ', e))

await browser.close()
console.log('done')
