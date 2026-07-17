// 真跑一次 LLM — 用本地 Claude CLI 订阅生成 deck，落到 /deck 编辑器并截图每张。
// 不消耗 API 额度。

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3010'
const out = path.resolve('.realcheck/llm')
mkdirSync(out, { recursive: true })

const SCENARIOS = [
  {
    name: 'tech-talk',
    title: '为什么团队应该全员学会 AI 编程',
    theme: 'modern-minimal',
    text: `这是一场面向 15 人技术团队的内部分享。
我们最近三个迭代代码评审平均等待时间从 4 小时涨到 18 小时，团队 8 个后端 + 3 个前端 + 2 名 PM + 2 名设计师对 AI 编程工具认知差距大。
我希望先抛出问题（评审瓶颈数据），然后讲三个事实证明这是认知问题不是工具问题，再给出三步行动方案（试用一周 / 建 cookbook / 周会汇报），最后号召大家本周开始。
风格要数据驱动，不要鸡汤，要给出具体数字和具体行动。`,
  },
  {
    name: 'product-q1',
    title: '2026 Q1 业务复盘',
    theme: 'editorial-monocle',
    text: `这是一份给 CEO 和董事会的 Q1 业绩复盘。
关键数字：GMV $1.2M（同比 +18%），日活 240k（环比 -3%），NPS 62（+4），30 天留存 85%。
要先讲 3-4 个关键 KPI，然后展示 6 个月的渠道贡献柱状图（直营 APP 420 万、小程序 280 万、抖音店铺 180 万、京东 120 万、其他 40 万），
接着对比"过去的渠道策略 vs 新策略"，给出战略 2x2 矩阵（紧急性 × 重要性），最后是下一步行动号召。`,
  },
  {
    name: 'pitch-vc',
    title: 'Series A 融资 pitch',
    theme: 'midnight-luxe',
    text: `这是一份面向 VC 合伙人的 Series A pitch。
公司定位：源码可用 + BYOK 的 AI PPT 服务，主打 dev/power-user 市场。
要先有一个吸引人的封面（一句话定位），然后讲市场痛点（Gamma 不够灵活 / PowerPoint 不够智能），
我们的差异化（11 provider / 21 版式 / 12 主题 / 真 PPTX 导出 / CLI / API），
关键数据（用户增长 +180%、创作者收入 +240%、国家覆盖 14→27、NPS 4.8），
三步增长路径（PLG → community → enterprise），融资 $5M 用于扩产品 + 海外。`,
  },
]

const browser = await chromium.launch()
const ctx = await browser.newContext({
  viewport: { width: 1920, height: 1080 },
  locale: 'zh-CN',
  proxy: { server: 'http://localhost:7897', bypass: 'localhost,127.0.0.1' },
})
const page = await ctx.newPage()

const summary = []

for (const sc of SCENARIOS) {
  console.log(`\n=== ${sc.name} · ${sc.theme} ===`)
  const t0 = Date.now()
  const res = await page.request.post(`${BASE}/api/quick`, {
    data: {
      text: sc.text,
      title: sc.title,
      theme: sc.theme,
      llm: { provider: 'claude-cli', model: 'claude-sonnet-4-6' },
    },
    timeout: 120000,
  })
  const dt = ((Date.now() - t0) / 1000).toFixed(1)
  if (!res.ok()) {
    const txt = await res.text()
    console.log(`  ✗ HTTP ${res.status()} (${dt}s): ${txt.slice(0, 200)}`)
    summary.push({ name: sc.name, ok: false, error: txt.slice(0, 300) })
    continue
  }
  const data = await res.json()
  const deck = data.deck
  if (!deck) {
    console.log(`  ✗ no deck in response`)
    summary.push({ name: sc.name, ok: false, error: 'no deck' })
    continue
  }
  writeFileSync(path.join(out, `${sc.name}.deck.json`), JSON.stringify(deck, null, 2))
  const layoutCounts = {}
  for (const s of deck.slides) {
    layoutCounts[s.type] = (layoutCounts[s.type] || 0) + 1
  }
  console.log(`  ✓ ${dt}s, ${deck.slides.length} slides`)
  console.log(`  layouts: ${Object.entries(layoutCounts).map(([k, v]) => `${k}×${v}`).join(' ')}`)
  summary.push({
    name: sc.name, ok: true, durationS: parseFloat(dt),
    slides: deck.slides.length, layouts: layoutCounts, theme: deck.theme,
  })

  // Load into editor and screenshot each slide
  await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
  await page.evaluate(d => localStorage.setItem('pg_last_deck', JSON.stringify(d)), deck)
  await page.goto(`${BASE}/deck`, { waitUntil: 'networkidle' })
  await page.waitForTimeout(2000)
  const slideCount = await page.locator('aside canvas').count()
  console.log(`  rendered ${slideCount} thumbnails`)

  for (let i = 0; i < slideCount; i++) {
    await page.locator('aside canvas').nth(i).click()
    await page.waitForTimeout(300)
    await page.evaluate(() => {
      document.querySelectorAll('aside').forEach(a => a.style.display = 'none')
      document.querySelector('header.px-4')?.setAttribute('style', 'display:none')
    })
    await page.screenshot({ path: path.join(out, `${sc.name}-slide-${String(i+1).padStart(2,'0')}.png`) })
    await page.evaluate(() => {
      document.querySelectorAll('aside').forEach(a => a.style.display = '')
      document.querySelector('header.px-4')?.removeAttribute('style')
    })
  }

  // Export PPTX via API
  const pptxRes = await page.request.post(`${BASE}/api/render`, {
    data: { deck, format: 'pptx' },
    timeout: 30000,
  })
  if (pptxRes.ok()) {
    const buf = await pptxRes.body()
    writeFileSync(path.join(out, `${sc.name}.pptx`), buf)
    console.log(`  PPTX: ${(buf.length / 1024).toFixed(1)}KB`)
  }
}

writeFileSync(path.join(out, '_summary.json'), JSON.stringify(summary, null, 2))
console.log('\n=== Done ===')
console.log(JSON.stringify(summary, null, 2))
await browser.close()
