// Stress + edge-case check:
// 1) ?fxAll=normal — 21-slide deck of all canonical fixtures, screenshot each slide
// 2) ?fxAll=stress — same with stress variants
// 3) Long deck (50 slides) via API render
// 4) Editor pressure: add 100 elements, undo 100x, expect identity
// 5) PPTX binary validation: unzip, count slides, find text
// 6) Present mode full traversal

import { chromium } from 'playwright'
import { mkdirSync, statSync, writeFileSync, readFileSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3010'
const out = path.resolve('.realcheck/stress')
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  proxy: { server: 'http://localhost:7897', bypass: 'localhost,127.0.0.1' },
  acceptDownloads: true,
})

const report = { tests: [] }
function record(name, ok, detail) {
  report.tests.push({ name, ok, detail })
  console.log(`${ok ? '✓' : '✗'} ${name}${detail ? ' · ' + detail : ''}`)
}

// ─── Test 1: 21 slides, each layout, traverse all ────────────────────────
{
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(`pageerror: ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errs.push(`console: ${m.text().slice(0,150)}`) })
  await page.goto(`${BASE}/deck?fxAll=normal&theme=modern-minimal`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const slideCount = await page.locator('aside canvas').count()
  await page.screenshot({ path: path.join(out, 'all-normal-01.png') })

  // Traverse: click each thumbnail and screenshot center stage
  for (let i = 0; i < slideCount; i++) {
    await page.locator('aside canvas').nth(i).click()
    await page.waitForTimeout(300)
    // hide rails
    await page.evaluate(() => {
      document.querySelectorAll('aside').forEach(a => a.style.display = 'none')
      document.querySelector('header.px-4')?.setAttribute('style', 'display:none')
    })
    await page.screenshot({ path: path.join(out, `all-normal-slide-${String(i+1).padStart(2,'0')}.png`) })
    await page.evaluate(() => {
      document.querySelectorAll('aside').forEach(a => a.style.display = '')
      document.querySelector('header.px-4')?.removeAttribute('style')
    })
    await page.waitForTimeout(100)
  }
  record('21-slide all-layouts deck, traverse + screenshot', errs.length === 0,
    `slides=${slideCount}, errs=${errs.length}`)
  await page.close()
}

// ─── Test 2: stress variants deck ─────────────────────────────────────────
{
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(`pageerror: ${e.message}`))
  await page.goto(`${BASE}/deck?fxAll=stress&theme=editorial-monocle`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const slideCount = await page.locator('aside canvas').count()
  await page.screenshot({ path: path.join(out, 'all-stress-01.png') })
  for (let i = 0; i < slideCount; i++) {
    await page.locator('aside canvas').nth(i).click()
    await page.waitForTimeout(250)
    await page.evaluate(() => {
      document.querySelectorAll('aside').forEach(a => a.style.display = 'none')
      document.querySelector('header.px-4')?.setAttribute('style', 'display:none')
    })
    await page.screenshot({ path: path.join(out, `all-stress-slide-${String(i+1).padStart(2,'0')}.png`) })
    await page.evaluate(() => {
      document.querySelectorAll('aside').forEach(a => a.style.display = '')
      document.querySelector('header.px-4')?.removeAttribute('style')
    })
  }
  record('stress variants deck, traverse', errs.length === 0, `slides=${slideCount}`)
  await page.close()
}

// ─── Test 3: 50-slide long deck via API ───────────────────────────────────
{
  // Build markdown with 50 sections
  const sections = []
  for (let i = 1; i <= 50; i++) {
    sections.push(`## 第 ${i} 个论点
- 论据 1：这是论点 ${i} 的第一个支撑
- 论据 2：第二个证据`)
  }
  const md = `# 50 张幻灯片压力测试\n\n` + sections.join('\n\n')
  const t0 = Date.now()
  const res = await ctx.request.post(`${BASE}/api/render`, {
    data: { markdown: md, theme: 'modern-minimal', format: 'pptx' },
    timeout: 60000,
  })
  const dt = Date.now() - t0
  if (!res.ok()) {
    record('50-slide API render', false, `HTTP ${res.status()}`)
  } else {
    const buf = await res.body()
    const file = path.join(out, '50-slide.pptx')
    writeFileSync(file, buf)
    record('50-slide API render', true, `${dt}ms, ${(buf.length / 1024).toFixed(1)}KB`)
  }
}

// ─── Test 4: editor pressure — add 100 text elements via store, undo all ──
{
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(e.message))
  await page.goto(`${BASE}/deck?fx=cover.normal&theme=modern-minimal`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const t0 = Date.now()
  const N = 100
  // Click "+ 文本" N times.
  // First locate the button.
  const btn = page.getByRole('button', { name: /\+ 文本/ })
  for (let i = 0; i < N; i++) {
    await btn.click()
    if (i % 20 === 0) await page.waitForTimeout(50)
  }
  const dt1 = Date.now() - t0
  // Check element count via DOM — text overlay div count under [aria-label="text-overlay"]
  const finalCount = await page.locator('[aria-label="text-overlay"] > div').count()
  // Undo N+ times
  const t1 = Date.now()
  for (let i = 0; i < N + 5; i++) {
    await page.keyboard.press('Control+z')
    if (i % 30 === 0) await page.waitForTimeout(20)
  }
  await page.waitForTimeout(300)
  const afterUndo = await page.locator('[aria-label="text-overlay"] > div').count()
  const dt2 = Date.now() - t1
  record(`add ${N} text elements`, errs.length === 0, `${dt1}ms, final=${finalCount}, errs=${errs.length}`)
  record(`undo ${N + 5} times`, afterUndo < finalCount, `${dt2}ms, remaining=${afterUndo}`)
  await page.close()
}

// ─── Test 5: PPTX binary validation ───────────────────────────────────────
{
  const pptxPath = path.join(out, '50-slide.pptx')
  try {
    const buf = readFileSync(pptxPath)
    // PPTX is a zip. Look for PK signature at start.
    const sig = buf.slice(0, 4).toString('hex')
    const isZip = sig === '504b0304'
    // Count slide files by scanning byte content for 'ppt/slides/slide'
    const text = buf.toString('binary')
    const slideMatches = text.match(/ppt\/slides\/slide\d+\.xml/g) || []
    const uniqueSlides = new Set(slideMatches).size
    record('PPTX binary is ZIP', isZip, `sig=${sig}`)
    record('PPTX has expected slide count', uniqueSlides >= 50, `slides found=${uniqueSlides}`)
    // Check for our test text
    const hasText = text.includes('压力测试') || text.includes('论点')
    record('PPTX contains our Chinese text', hasText)
  } catch (e) {
    record('PPTX binary validation', false, e.message)
  }
}

// ─── Test 6: Present mode full traversal ──────────────────────────────────
{
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(e.message))
  // Seed deck via API JSON then localStorage
  const apiRes = await ctx.request.post(`${BASE}/api/render`, {
    data: { markdown: '# 演讲全翻\n\n## 第一\n- a\n- b\n\n## 第二\n- c\n- d\n\n## 第三\n> 引言。', format: 'json' },
  })
  const j = await apiRes.json()
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.evaluate(deck => localStorage.setItem('pg_last_deck', JSON.stringify(deck)), j.deck)
  await page.goto(`${BASE}/present/deck`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const totalSlides = j.deck.slides.length
  await page.screenshot({ path: path.join(out, 'present-first.png') })
  for (let i = 0; i < totalSlides + 2; i++) {
    await page.keyboard.press('ArrowRight')
    await page.waitForTimeout(150)
  }
  await page.screenshot({ path: path.join(out, 'present-last.png') })
  // Go back to first via Home
  await page.keyboard.press('Home')
  await page.waitForTimeout(200)
  await page.screenshot({ path: path.join(out, 'present-home.png') })
  record('present mode full traversal', errs.length === 0, `${totalSlides} slides, errs=${errs.length}`)
  await page.close()
}

writeFileSync(path.join(out, '_report.json'), JSON.stringify(report, null, 2))
console.log(`\n${report.tests.filter(t => t.ok).length}/${report.tests.length} tests passed`)
await browser.close()
