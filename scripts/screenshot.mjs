// Headless screenshot tool for visual-verifying layouts.
//
// Usage: node scripts/screenshot.mjs <fixture> [theme] [outFile]
//   node scripts/screenshot.mjs cover modern-minimal cover.png
//   node scripts/screenshot.mjs statement
//
// Requires the dev server to be running (defaults to http://127.0.0.1:3002).

import { chromium } from 'playwright'
import path from 'node:path'
import { mkdirSync } from 'node:fs'

const BASE_URL = process.env.PG_BASE_URL || 'http://127.0.0.1:3002'

const [, , fixture = 'cover', theme = 'modern-minimal', outArg] = process.argv
const outDir = path.resolve('.shots')
mkdirSync(outDir, { recursive: true })
const out = path.resolve(outDir, outArg || `${fixture}-${theme}.png`)

const url = `${BASE_URL}/deck?fixture=${fixture}&theme=${theme}`

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1600, height: 1000 } })

// Surface page errors so we know if Konva fails to load
page.on('console', m => {
  const txt = m.text()
  if (txt.includes('webpack-hmr')) return
  console.log(`[${m.type()}]`, txt.slice(0, 300))
})
page.on('pageerror', err => console.error('[browser page error]', err.message))

console.log(`→ ${url}`)
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })

// Wait for the editor to actually hydrate + fixture to load
await page.waitForFunction(
  () => !document.body.innerText.includes('加载编辑器…'),
  { timeout: 30000 },
).catch(() => { /* fall through; the canvas selector check below will report */ })

// Wait for Konva (lazy-loaded) to mount a canvas. Fallback to a longer timeout
// since the dev server with Turbopack may need a few seconds to compile on first hit.
try {
  await page.waitForSelector('canvas', { timeout: 30000 })
} catch (e) {
  console.error('canvas never appeared. body text:')
  const body = await page.textContent('body')
  console.error((body || '').slice(0, 500))
  console.error('inner html snippet (main area):')
  const main = await page.$('main')
  if (main) console.error((await main.innerHTML()).slice(0, 800))
  throw e
}
await page.waitForTimeout(800)  // let any layout settle

// Capture the main slide wrapper (Konva canvas + HTML text overlay).
// The biggest <canvas> belongs to the main slide; its parent <div> wraps
// both the Konva stage and the HTML text overlay.
const canvases = await page.$$('canvas')
const sizes = await Promise.all(canvases.map(async c => {
  const box = await c.boundingBox()
  return { c, box }
}))
const main = sizes.sort((a, b) => (b.box?.width ?? 0) - (a.box?.width ?? 0))[0]
if (!main?.box) { console.error('no sized canvas'); process.exit(1) }

// The parent wrapper of the canvas contains the HTML overlay positioned over it.
// Take a screenshot covering the canvas's bounding box, which is sized to match
// the wrapper exactly.
await page.screenshot({
  path: out,
  clip: {
    x: main.box.x, y: main.box.y,
    width: main.box.width, height: main.box.height,
  },
})

console.log(`✓ saved ${out}  (${main.box.width.toFixed(0)}×${main.box.height.toFixed(0)})`)

await browser.close()
