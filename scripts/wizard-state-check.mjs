// Inject localStorage state to drive wizard /outline /script /style without LLM key
import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3001'
const outDir = path.resolve('.realcheck/wizard')
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch()
const ctx = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'zh-CN' })
const page = await ctx.newPage()

// Seed localStorage on first page navigation
await page.goto(`${BASE}/`)
await page.evaluate(() => {
  const brief = { topic: '团队应全员学会用 Claude Code', audience: '15 人技术团队', goal: '愿意花一周试用并周会汇报', durationMin: 15, materials: '上周 OKR 评审花了 3 小时讨论代码评审瓶颈，平均等待 18 小时' }
  const outline = {
    title: '团队应全员学会用 Claude Code',
    framework: 'duarte',
    arc: '从一个具体痛点出发→暴露根因→提出试用方案→请求决策',
    sections: [
      { title: '评审等待时间从 4 小时涨到 18 小时', brief: '展示评审瓶颈数据，让团队感受到痛点的真实性', durationSec: 180 },
      { title: '问题不在工具，在认知差', brief: '8 个后端 3 个前端，对 AI 编码工具的认知和使用程度差异大', durationSec: 240 },
      { title: '提议：每人一周试用 + 建立 cookbook', brief: '具体行动方案，明确角色分工、时间表、产出物', durationSec: 300 },
      { title: '下周周会，每人 5 分钟汇报结论', brief: '降低决策成本，先试用再讨论是否全员推广', durationSec: 180 },
    ],
  }
  localStorage.setItem('pg_pending_brief', JSON.stringify(brief))
  localStorage.setItem('pg_pending_outline', JSON.stringify(outline))
})

// Visit /outline
await page.goto(`${BASE}/outline`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.screenshot({ path: path.join(outDir, 'outline.png'), fullPage: true })
const outlineH1 = await page.locator('h1,h2').allInnerTexts()
console.log('outline H1/H2:', outlineH1.slice(0, 3))

// Seed script state
await page.evaluate(() => {
  const script = [
    { sectionIdx: 0, text: '这周我们花了 3 小时讨论评审瓶颈。评审等待时间从 4 小时涨到 18 小时。' },
    { sectionIdx: 1, text: '问题不在工具，在于我们 8 个后端 3 个前端的认知差。' },
    { sectionIdx: 2, text: '我提议：每人一周试用 Claude Code，建立内部 cookbook。' },
    { sectionIdx: 3, text: '下周周会，每人 5 分钟汇报试用结论。' },
  ]
  localStorage.setItem('pg_pending_script', JSON.stringify(script))
})

await page.goto(`${BASE}/script`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.screenshot({ path: path.join(outDir, 'script.png'), fullPage: true })

await page.goto(`${BASE}/style`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.screenshot({ path: path.join(outDir, 'style.png'), fullPage: true })

await browser.close()
console.log('Done')
