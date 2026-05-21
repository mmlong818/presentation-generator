// 真实检查：张力 + Yuko 双专家对每个 fixture × 主题做完整使用
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, existsSync, statSync } from 'node:fs'
import path from 'node:path'

const BASE = process.env.PG_BASE_URL || 'http://localhost:3010'
const outDir = path.resolve('.realcheck/expert')
mkdirSync(outDir, { recursive: true })

const fixtures = ['cover', 'statement', 'argument', 'argument5', 'process', 'process4', 'data', 'compare', 'quote']
// Sample diverse themes — covers minimal, editorial, dark, tech, vintage families.
const themes = ['modern-minimal', 'editorial-monocle', 'midnight-luxe', 'tech-utility', 'pitch-deck-vc', 'swiss-grid']

const browser = await chromium.launch()
const proxy = process.env.PG_NO_PROXY ? undefined : { server: 'http://localhost:7897', bypass: 'localhost,127.0.0.1' }
const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, locale: 'zh-CN', proxy })
const page = await ctx.newPage()

const pageErrors = []
const consoleErrors = []
page.on('pageerror', e => pageErrors.push(e.message))
page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 300)) })

const obs = []  // observations

async function visitFixture(fx, th) {
  pageErrors.length = 0; consoleErrors.length = 0
  const url = `${BASE}/deck?fixture=${fx}&theme=${th}`
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  // wait for canvas hydration
  try {
    await page.waitForFunction(() => !document.body.innerText.includes('加载编辑器…'), { timeout: 15000 })
  } catch {}
  await page.waitForTimeout(800)
  const canvas = page.locator('canvas').first()
  const exists = await canvas.count() > 0
  const file = path.join(outDir, `${fx}__${th}.png`)
  await page.screenshot({ path: file, fullPage: false })
  const thumbCount = await page.locator('aside canvas').count()
  return { fx, th, canvas: exists, thumbCount, errs: [...pageErrors], consoleErrs: [...consoleErrors] }
}

// Phase 1: fixture × theme matrix
console.log('=== Phase 1: fixture × theme matrix ===')
for (const fx of fixtures) {
  for (const th of themes) {
    const r = await visitFixture(fx, th)
    obs.push({ phase: 'matrix', ...r })
    const tag = r.canvas ? '✓' : '✗'
    const errTag = r.errs.length ? ` [page:${r.errs.length}]` : ''
    const ceTag = r.consoleErrs.length ? ` [console:${r.consoleErrs.length}]` : ''
    console.log(`  ${tag} ${fx.padEnd(10)} × ${th.padEnd(22)}${errTag}${ceTag}`)
  }
}

// Phase 2: editor interactions on a real fixture
console.log('\n=== Phase 2: editor interactions (process, modern-minimal) ===')
await page.goto(`${BASE}/deck?fixture=process&theme=modern-minimal`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await page.screenshot({ path: path.join(outDir, 'editor-initial.png') })

// Try keyboard shortcuts
await page.keyboard.press('Control+z')
await page.waitForTimeout(200)
await page.keyboard.press('Control+y')
await page.waitForTimeout(200)
await page.screenshot({ path: path.join(outDir, 'editor-after-undo-redo.png') })

// Click undo / redo buttons
const undoBtn = page.getByRole('button', { name: /撤销/ })
const redoBtn = page.getByRole('button', { name: /重做/ })
console.log(`  undo button visible: ${await undoBtn.isVisible()}`)
console.log(`  redo button visible: ${await redoBtn.isVisible()}`)

// Phase 3: PPTX export
console.log('\n=== Phase 3: PPTX export ===')
await page.goto(`${BASE}/deck?fixture=cover&theme=modern-minimal`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
const dlPromise = page.waitForEvent('download', { timeout: 30000 }).catch(() => null)
// Toolbar uses dropdown menu now
await page.locator('button:has-text("导出")').first().hover()
await page.waitForTimeout(300)
await page.locator('button:has-text("PPTX")').first().click()
const dl = await dlPromise
if (dl) {
  const savedAt = path.join(outDir, 'export.pptx')
  await dl.saveAs(savedAt)
  const size = statSync(savedAt).size
  console.log(`  ✓ PPTX saved: ${savedAt}, ${size} bytes`)
  obs.push({ phase: 'export', size, path: savedAt })
} else {
  console.log('  ✗ No download triggered')
  obs.push({ phase: 'export', size: 0, error: 'no download' })
}

// Phase 4: home page wizard — without LLM key
console.log('\n=== Phase 4: home wizard step 1 ===')
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await page.fill('input[placeholder*="AI 时代教育"]', '为什么团队应该全员学会用 Claude Code')
await page.fill('input[placeholder*="家长"]', '15 人技术团队，含 3 名前端 / 8 名后端 / 2 名 PM / 2 名设计')
await page.fill('input[placeholder*="被打动"]', '愿意花一周试用 Claude Code，并在下次周会上报告结论')
await page.fill('textarea', '团队上周在一次 OKR 评审中花了 3 小时讨论代码评审瓶颈。最近三个迭代的代码评审平均等待时间从 4 小时涨到 18 小时。')
await page.screenshot({ path: path.join(outDir, 'home-filled.png'), fullPage: true })
console.log('  ✓ form filled')

// Try clicking generate-outline (should warn missing model)
const genBtn = page.getByRole('button', { name: /生成大纲/ })
await genBtn.click()
await page.waitForTimeout(1500)
await page.screenshot({ path: path.join(outDir, 'home-clicked-generate.png'), fullPage: true })
const bodyTxt = await page.locator('body').innerText()
console.log(`  body contains "配置模型": ${bodyTxt.includes('配置模型')}`)
console.log(`  body contains "API": ${bodyTxt.includes('API')}`)

writeFileSync(path.join(outDir, 'expert-report.json'), JSON.stringify(obs, null, 2))
console.log('\n=== Done. Report at .realcheck/expert/expert-report.json ===')

await browser.close()
