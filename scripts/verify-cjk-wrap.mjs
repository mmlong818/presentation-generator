import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3010'
const out = path.resolve('.realcheck/cjk-fix')
mkdirSync(out, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  proxy: { server: 'http://localhost:7897', bypass: 'localhost,127.0.0.1' },
})
const page = await ctx.newPage()

// Inject a quote slide with the exact CJK content that broke
const deck = {
  title: '测试',
  theme: 'editorial-monocle',
  framework: 'duarte',
  brief: { topic: 'x', audience: 'x', goal: 'x', durationMin: 1 },
  script: [],
  createdAt: new Date().toISOString(),
  slides: [
    {
      type: 'quote',
      quote: '一个会提问、会选择、会热爱的孩子，AI 拿不走。',
      source: '演讲者观点 · 2026',
      highlight: 'AI 拿不走',
    },
    // Also test an argument with long highlighted text
    {
      type: 'argument',
      eyebrow: '三个事实',
      heading: '为什么我们必须现在重新思考',
      highlight: '现在重新思考',
      points: [
        '市场窗口期已经开始关闭',
        '技术成熟度刚好够用',
        '团队认知差距决定了护城河',
      ],
    },
  ],
}

await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await page.evaluate(d => localStorage.setItem('pg_last_deck', JSON.stringify(d)), deck)
await page.goto(`${BASE}/deck`, { waitUntil: 'networkidle' })
await page.waitForTimeout(2000)
// Take both thumbnail panel + main canvas
await page.screenshot({ path: path.join(out, 'full-page.png'), fullPage: true })
// Hide sidebar and screenshot main only for slide 1 (quote)
await page.locator('aside canvas').nth(0).click()
await page.waitForTimeout(500)
await page.evaluate(() => {
  document.querySelectorAll('aside').forEach(a => a.style.display = 'none')
  document.querySelector('header.px-4')?.setAttribute('style', 'display:none')
})
await page.screenshot({ path: path.join(out, 'main-quote.png') })
// Restore and shoot argument
await page.evaluate(() => {
  document.querySelectorAll('aside').forEach(a => a.style.display = '')
  document.querySelector('header.px-4')?.removeAttribute('style')
})
await page.locator('aside canvas').nth(1).click()
await page.waitForTimeout(500)
await page.evaluate(() => {
  document.querySelectorAll('aside').forEach(a => a.style.display = 'none')
  document.querySelector('header.px-4')?.setAttribute('style', 'display:none')
})
await page.screenshot({ path: path.join(out, 'main-argument.png') })
await browser.close()
console.log('done')
