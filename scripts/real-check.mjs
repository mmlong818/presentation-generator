// Real-world expert walkthrough — opens every route, captures screenshots + DOM dumps
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3001'
const outDir = path.resolve('.realcheck')
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: 'zh-CN' })
const page = await ctx.newPage()

const errors = []
page.on('pageerror', e => errors.push(`[pageerror] ${e.message}`))
page.on('console', m => { if (m.type() === 'error') errors.push(`[console.error] ${m.text().slice(0, 300)}`) })
page.on('requestfailed', r => errors.push(`[reqfail] ${r.url()} ${r.failure()?.errorText}`))

const routes = ['/', '/style', '/outline', '/script', '/quick', '/deck', '/history']
const report = []

for (const r of routes) {
  errors.length = 0
  const url = `${BASE}${r}`
  console.log(`\n→ ${url}`)
  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 })
  } catch (e) {
    console.log(`  goto failed: ${e.message}`)
  }
  await page.waitForTimeout(1200)
  const file = path.join(outDir, `${r.replace(/\//g, '_') || 'root'}.png`)
  await page.screenshot({ path: file, fullPage: true })
  const title = await page.title()
  const h1 = await page.locator('h1').allInnerTexts().catch(() => [])
  const buttons = await page.locator('button').allInnerTexts().catch(() => [])
  const inputs = await page.locator('input,textarea,select').count()
  const bodyLen = (await page.locator('body').innerText()).length
  report.push({ route: r, title, h1, buttonCount: buttons.length, buttons: buttons.slice(0, 20), inputs, bodyLen, errors: [...errors] })
}

writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2))
console.log('\nSummary:')
for (const row of report) {
  console.log(`${row.route.padEnd(12)} title="${row.title}" h1=${JSON.stringify(row.h1).slice(0,80)} buttons=${row.buttonCount} inputs=${row.inputs} body=${row.bodyLen} errs=${row.errors.length}`)
}
await browser.close()
