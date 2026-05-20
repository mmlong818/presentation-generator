// Test /api/rewrite-slide end-to-end with the saved final-check deck.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import path from 'node:path'

const BASE = process.env.PG_BASE_URL || 'http://localhost:3010'
const out = path.resolve('.realcheck/rewrite-test')
mkdirSync(out, { recursive: true })

const deck = JSON.parse(readFileSync('.realcheck/final/2026-05-20T08-20-25/03-deck.json', 'utf-8'))
const slideIndex = 4 // slide 5: argument "真正的壁垒不在产品里，在产品外"
const direction = '改成 question 版式 — 把"产品外的壁垒"变成一个提问'

console.log(`Rewriting slide ${slideIndex + 1} (current type: ${deck.slides[slideIndex].type})`)
console.log(`Direction: ${direction}\n`)

const t0 = Date.now()
const res = await fetch(`${BASE}/api/rewrite-slide`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    deck,
    slideIndex,
    direction,
    llm: { provider: 'claude-cli', model: 'claude-sonnet-4-6' },
  }),
})
const dt = ((Date.now() - t0) / 1000).toFixed(1)
const data = await res.json()
if (!res.ok) {
  console.error(`✗ HTTP ${res.status} (${dt}s)`)
  console.error(data)
  process.exit(1)
}
writeFileSync(path.join(out, 'rewritten-slide.json'), JSON.stringify(data.slide, null, 2))
console.log(`✓ ${dt}s`)
console.log(`New type: ${data.slide.type}`)
console.log(`New content preview:`)
console.log(JSON.stringify(data.slide, null, 2).slice(0, 500))
