// 实时浏览器演示 — headed + slowMo，用户能看到每一步。
// 不烧 LLM quota（用 fixture 数据）；中间穿插 LLM 真跑 1 次让用户看到 AI 写。
//
// 用法：node scripts/live-walkthrough.mjs

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs'
import path from 'node:path'

const BASE = 'http://localhost:3010'
const out = path.resolve('.realcheck/live')
mkdirSync(out, { recursive: true })

const browser = await chromium.launch({
  headless: false,        // 用户可见
  slowMo: 350,            // 每个动作慢 350ms，方便看
  args: ['--start-maximized'],
})
const ctx = await browser.newContext({
  viewport: null,         // 用窗口实际大小
  locale: 'zh-CN',
  proxy: { server: 'http://localhost:7897', bypass: 'localhost,127.0.0.1' },
  acceptDownloads: true,
})
const page = await ctx.newPage()

const banner = (txt) => console.log(`\n▶ ${txt}`)
const sleep = (ms) => new Promise(r => setTimeout(r, ms))

const errs = []
page.on('pageerror', e => errs.push(`pageerror: ${e.message}`))

// ─── 1. 主页 ─────────────────────────────────────────────────────────────
banner('1. 打开主页')
await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
await sleep(2000)

// ─── 2. 编辑器加载 cover fixture ─────────────────────────────────────────
banner('2. 加载示例 cover (modern-minimal)')
await page.goto(`${BASE}/deck?fx=cover.normal&theme=modern-minimal`, { waitUntil: 'networkidle' })
await sleep(2500)

// ─── 3. 主题切换 ─────────────────────────────────────────────────────────
banner('3. 换主题 → editorial-monocle (米白衬线)')
await page.goto(`${BASE}/deck?fx=cover.normal&theme=editorial-monocle`, { waitUntil: 'networkidle' })
await sleep(2500)

banner('4. 换主题 → midnight-luxe (深色金调)')
await page.goto(`${BASE}/deck?fx=cover.normal&theme=midnight-luxe`, { waitUntil: 'networkidle' })
await sleep(2500)

banner('5. 换主题 → brutalist-mono (反白高亮)')
await page.goto(`${BASE}/deck?fx=cover.normal&theme=brutalist-mono`, { waitUntil: 'networkidle' })
await sleep(2500)

banner('6. 换主题 → blueprint (技术蓝图网格)')
await page.goto(`${BASE}/deck?fx=cover.normal&theme=blueprint`, { waitUntil: 'networkidle' })
await sleep(2500)

banner('7. 换主题 → cyberpunk-neon (霓虹双向晕染)')
await page.goto(`${BASE}/deck?fx=cover.normal&theme=cyberpunk-neon`, { waitUntil: 'networkidle' })
await sleep(2500)

// ─── 8. 21 个版式 quick tour ─────────────────────────────────────────────
banner('8. 浏览 21 个版式 (editorial-monocle 全集合 deck)')
await page.goto(`${BASE}/deck?fxAll=normal&theme=editorial-monocle`, { waitUntil: 'networkidle' })
await sleep(2500)
const total = await page.locator('aside canvas').count()
console.log(`  共 ${total} 张 slide，逐个翻`)
for (let i = 0; i < Math.min(total, 24); i++) {
  await page.locator('aside canvas').nth(i).click()
  await sleep(900)
}

// ─── 9. 新 3 个图表 ──────────────────────────────────────────────────────
banner('9. 新增 chart-line (折线图)')
await page.goto(`${BASE}/deck?fx=chart-line.multi&theme=midnight-luxe`, { waitUntil: 'networkidle' })
await sleep(3000)

banner('10. 新增 chart-pie (饼图)')
await page.goto(`${BASE}/deck?fx=chart-pie.normal&theme=editorial-monocle`, { waitUntil: 'networkidle' })
await sleep(3000)

banner('11. 新增 chart-area (堆叠面积)')
await page.goto(`${BASE}/deck?fx=chart-area.normal&theme=tech-utility`, { waitUntil: 'networkidle' })
await sleep(3000)

// ─── 12. 编辑器交互演示 ─────────────────────────────────────────────────
banner('12. 加载 process 版式，演示编辑器交互')
await page.goto(`${BASE}/deck?fx=process.3&theme=modern-minimal`, { waitUntil: 'networkidle' })
await sleep(2000)

banner('13. 点击文本元素 → Inspector 显示')
const firstText = page.locator('[aria-label="text-overlay"]').last().locator('text=观察现状').first()
await firstText.click()
await sleep(2500)

banner('14. 双击进入编辑模式')
await firstText.dblclick()
await sleep(2000)
await page.keyboard.press('Escape')
await sleep(1000)

banner('15. Shift+Click 多选 (再选一个文本)')
const secondText = page.locator('[aria-label="text-overlay"]').last().locator('text=提出假设').first()
await secondText.click({ modifiers: ['Shift'] })
await sleep(2500)

banner('16. 方向键微调 (4 次右 + 2 次下)')
for (let i = 0; i < 4; i++) { await page.keyboard.press('ArrowRight'); await sleep(300) }
for (let i = 0; i < 2; i++) { await page.keyboard.press('ArrowDown'); await sleep(300) }
await sleep(1500)

banner('17. Ctrl+Z 撤销 6 次')
for (let i = 0; i < 6; i++) { await page.keyboard.press('Control+z'); await sleep(400) }
await sleep(1000)

banner('18. 打开版式选择器 (24 选 1)')
await page.locator('button:has-text("+ 版式")').first().click()
await sleep(3000)
await page.keyboard.press('Escape')
await sleep(1000)

banner('19. 打开图标选择器 (64 Lucide)')
await page.locator('button:has-text("+ 图标")').first().click()
await sleep(3000)
await page.keyboard.press('Escape')
await sleep(1000)

banner('20. 切换版式 demo')
await page.locator('button:has-text("切换版式")').first().click()
await sleep(2000)
// 选 question
const questionBtn = page.locator('button:has-text("提问"):has-text("抛问题")').first()
if (await questionBtn.count() > 0) {
  await questionBtn.click()
  await sleep(3000)
}

// ─── 21. 演讲模式 ────────────────────────────────────────────────────────
banner('21. 进入演讲模式')
// 先注入 multi-slide deck
await page.goto(`${BASE}/deck?fxAll=normal&theme=editorial-monocle`, { waitUntil: 'networkidle' })
await sleep(2000)
const deckJson = await page.evaluate(() => {
  const raw = localStorage.getItem('pg_last_deck')
  return raw
})
// fxAll doesn't persist to localStorage; instead, evaluate the editor presentation
// just navigate to /present route
await page.goto(`${BASE}/present/deck`, { waitUntil: 'networkidle' })
await sleep(3000)

banner('22. 演讲翻页（→ 5 次）')
for (let i = 0; i < 5; i++) {
  await page.keyboard.press('ArrowRight')
  await sleep(1200)
}

banner('23. F 切换演讲者视图')
await page.keyboard.press('f')
await sleep(3500)

banner('24. Esc 退出，回 /deck')
await page.keyboard.press('Escape')
await sleep(2000)

// ─── 25. LLM 真跑：让用户看到 AI 重写 ────────────────────────────────────
banner('25. 真 LLM — 重写 process 的某点')
await page.goto(`${BASE}/deck?fx=argument.3&theme=midnight-luxe`, { waitUntil: 'networkidle' })
await sleep(2500)
await page.locator('button:has-text("✨ 重写")').first().click()
await sleep(2500)

// Fill direction
const ta = page.locator('textarea').first()
await ta.fill('改成 question 版式，把 3 个论点改写成 3 个让人睡不着觉的问题')
await sleep(2000)

banner('26. 点"生成新版本" — 调 Claude CLI (10-15 秒)')
await page.locator('button:has-text("生成新版本")').click()
// Wait for response
const t0 = Date.now()
const previewSel = page.locator('pre').first()
let waited = 0
while (!(await previewSel.isVisible().catch(() => false))) {
  await sleep(500)
  waited += 500
  if (waited > 90000) break
}
const dt = ((Date.now() - t0) / 1000).toFixed(1)
console.log(`  LLM 返回 ${dt}s`)
await sleep(4000)

banner('27. 点"✓ 应用替换"')
await page.locator('button:has-text("✓ 应用替换")').click()
await sleep(3000)

// ─── 28. 导出 PPTX ───────────────────────────────────────────────────────
banner('28. 导出菜单展开')
await page.locator('button:has-text("导出")').first().hover()
await sleep(2000)
await page.locator('button:has-text("HTML 自包含")').click()
const dl = await page.waitForEvent('download', { timeout: 20000 }).catch(() => null)
if (dl) {
  const file = path.join(out, 'live-export.html')
  await dl.saveAs(file)
  console.log(`  HTML 已下载：${file}`)
}
await sleep(2000)

// ─── 29. 主题选择页 ──────────────────────────────────────────────────────
banner('29. /style 页 — 12 主题色卡')
await page.goto(`${BASE}/style`, { waitUntil: 'networkidle' })
await sleep(5000)

// ─── 30. 历史 ────────────────────────────────────────────────────────────
banner('30. /history')
await page.goto(`${BASE}/history`, { waitUntil: 'networkidle' })
await sleep(3000)

console.log(`\n=== 演示结束 ===`)
console.log(`page errors: ${errs.length}`)
if (errs.length > 0) errs.forEach(e => console.log(`  ${e}`))
console.log(`留 5 秒后自动关闭浏览器`)
await sleep(5000)
await browser.close()
