// Sprint 4 — present mode + HTML export
import { chromium } from 'playwright'
import { mkdirSync, statSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3010'
const out = path.resolve('.realcheck/sprint4')
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1600, height: 1000 },
  locale: 'zh-CN',
  proxy: { server: 'http://localhost:7897', bypass: 'localhost,127.0.0.1' },
  acceptDownloads: true,
})
const page = await ctx.newPage()
const errs = []
page.on('pageerror', e => errs.push(`[pageerror] ${e.message}`))
page.on('console', m => { if (m.type() === 'error') errs.push(`[console.error] ${m.text().slice(0, 200)}`) })

// Load deck via fixture, then navigate to present
await page.goto(`${BASE}/deck?fixture=process&theme=modern-minimal`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)

// Navigate to /present (route exists, but needs a deck in localStorage)
// First, persist current presentation as the storage deck by exporting then re-importing pattern.
// Simpler: just call present route with state already in zustand — won't survive page nav.
// Strategy: open in same context, the presentation state is lost. So we test /present by loading a deck via localStorage.
await page.evaluate(() => {
  const deck = {
    title: '测试演讲',
    theme: 'modern-minimal',
    framework: 'duarte',
    brief: { topic: '', audience: '', goal: '', durationMin: 5 },
    script: [],
    createdAt: new Date().toISOString(),
    slides: [
      { type: 'cover', eyebrow: '示例', title: '欢迎来到演讲模式', subtitle: '方向键翻页 · Esc 退出' },
      { type: 'statement', title: '这是第二页。' },
      { type: 'argument', heading: '为什么演讲模式重要', points: ['听众焦点集中', '节奏可控', '导出可分享'] },
    ],
  }
  localStorage.setItem('pg_last_deck', JSON.stringify(deck))
})

await page.goto(`${BASE}/present/deck`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
await page.screenshot({ path: path.join(out, '01-present-slide1.png') })

// Arrow right → slide 2
await page.keyboard.press('ArrowRight')
await page.waitForTimeout(600)
await page.screenshot({ path: path.join(out, '02-present-slide2.png') })

// Toggle speaker view (F)
await page.keyboard.press('f')
await page.waitForTimeout(500)
await page.screenshot({ path: path.join(out, '03-speaker-view.png') })

const speakerPanel = await page.locator('text=备注').count()
console.log('speaker panel visible:', speakerPanel > 0)

// Right arrow → slide 3
await page.keyboard.press('ArrowRight')
await page.waitForTimeout(600)
await page.screenshot({ path: path.join(out, '04-present-slide3.png') })

// Counter check
const counter = await page.locator('text=/3 \\/ 3/').count()
console.log('counter at end:', counter > 0)

// Test HTML export — back to /deck and click HTML export
await page.goto(`${BASE}/deck`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1500)
const dlPromise = page.waitForEvent('download', { timeout: 20000 }).catch(() => null)
// hover the 导出 menu then click HTML
await page.locator('button:has-text("导出")').first().hover()
await page.waitForTimeout(300)
await page.locator('button:has-text("HTML 自包含")').click()
const dl = await dlPromise
if (dl) {
  const p = path.join(out, 'export.html')
  await dl.saveAs(p)
  const size = statSync(p).size
  console.log('HTML export saved:', size, 'bytes')
} else {
  console.log('HTML export: no download fired')
}

console.log('\nerrors:', errs.length)
errs.forEach(e => console.log(' ', e))
await browser.close()
console.log('done')
