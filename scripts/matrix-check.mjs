// 21 版式 × 12 主题 = 252 视觉矩阵
// 每个 cell 一张截图 + 检测是否有 Konva render errors。
//
// 用法：node scripts/matrix-check.mjs [batch=12]
//   - batch: 并发页数

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const BASE = process.env.PG_BASE_URL || 'http://localhost:3010'
const batch = parseInt(process.argv[2] ?? '6', 10)

// Read the fixture catalog at runtime (TS source, simple regex extract)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fxSrc = readFileSync(path.resolve(__dirname, '../lib/editor/test-fixtures.ts'), 'utf-8')
const fxKeys = [...fxSrc.matchAll(/key:\s*'([^']+)'/g)].map(m => m[1])
// One canonical per layout = first 'normal' per layoutType
const normalKeys = []
const seenLayouts = new Set()
for (const k of fxKeys) {
  const layoutType = k.split('.')[0]
  if (seenLayouts.has(layoutType)) continue
  // pick the first normal variant — assume keys are ordered with normal first
  seenLayouts.add(layoutType)
  normalKeys.push(k)
}
console.log(`Layouts covered: ${normalKeys.length}`)

const THEMES = [
  'modern-minimal','editorial-monocle','academic-paper','midnight-luxe',
  'swiss-grid','tech-utility','blueprint','cyberpunk-neon',
  'brutalist-mono','pop-magazine','risograph','glassmorphism',
]

const out = path.resolve('.realcheck/matrix')
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  locale: 'zh-CN',
  proxy: { server: 'http://localhost:7897', bypass: 'localhost,127.0.0.1' },
})

const cells = []
for (const fx of normalKeys) {
  for (const theme of THEMES) cells.push({ fx, theme })
}
console.log(`Total cells: ${cells.length}`)

const results = []
let done = 0
const pages = await Promise.all(Array.from({ length: batch }).map(() => ctx.newPage()))

async function runCell(page, cell) {
  const errors = []
  page.removeAllListeners()
  page.on('pageerror', e => errors.push(`[pageerror] ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`[console] ${m.text().slice(0, 200)}`) })
  const url = `${BASE}/deck?fx=${encodeURIComponent(cell.fx)}&theme=${cell.theme}`
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  } catch (e) {
    return { ...cell, ok: false, errors: [`goto: ${e.message}`] }
  }
  await page.waitForTimeout(700)
  // Hide left/right rails to capture clean slide
  await page.evaluate(() => {
    document.querySelectorAll('aside').forEach(a => (a.style.display = 'none'))
    document.querySelector('header.px-4')?.setAttribute('style', 'display:none')
  })
  await page.waitForTimeout(150)
  const file = path.join(out, `${cell.fx}__${cell.theme}.png`)
  await page.screenshot({ path: file })
  return { ...cell, ok: errors.length === 0, errors, file }
}

while (cells.length > 0) {
  const slice = cells.splice(0, batch)
  const t0 = Date.now()
  const out = await Promise.all(slice.map((cell, i) => runCell(pages[i], cell)))
  out.forEach(r => results.push(r))
  done += out.length
  const dt = ((Date.now() - t0) / 1000).toFixed(1)
  const errCnt = out.filter(r => !r.ok).length
  console.log(`${done}/${normalKeys.length * THEMES.length} (+${out.length} in ${dt}s, ${errCnt} fail)`)
}

const failed = results.filter(r => !r.ok)
writeFileSync(path.join(out, '_results.json'), JSON.stringify(results, null, 2))
console.log(`\nDone. ${results.length} cells, ${failed.length} fail`)
if (failed.length > 0) {
  console.log('Failed:')
  failed.forEach(r => console.log(`  ${r.fx} × ${r.theme}: ${r.errors[0] || 'unknown'}`))
}
await browser.close()
