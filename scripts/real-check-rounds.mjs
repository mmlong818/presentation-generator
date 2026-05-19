// 20 轮真实检查 harness。
// 每轮：
//   1. 选 expert pair + content seed + theme + format focus
//   2. 用 Markdown / API / 编辑器 / 演讲模式 跑完整路径
//   3. 留截图到 .realcheck/round-NN/
//   4. 收集 page errors / console errors / 缺失元素
//
// 用法：node scripts/real-check-rounds.mjs [start=1] [count=20]

import { chromium } from 'playwright'
import { mkdirSync, writeFileSync, statSync } from 'node:fs'
import path from 'node:path'

const BASE = process.env.PG_BASE_URL || 'http://localhost:3010'
const startRound = parseInt(process.argv[2] ?? '1', 10)
const count = parseInt(process.argv[3] ?? '20', 10)

const EXPERTS = [
  ['张力 (前麦肯锡顾问，金字塔原理)', 'Yuko (前 IDEO 视觉总监)'],
  ['Steve Jobs (产品发布会大师)', 'Edward Tufte (信息可视化奠基人)'],
  ['资深投资人 (红杉)', 'CFO (上市公司)'],
  ['特级教师 (公立校 25 年)', '学生家长 (海淀双胞胎母亲)'],
  ['三甲医院主任医师', '护士长 (ICU 20 年)'],
  ['品牌设计总监 (奢侈品集团)', '设计研究员 (Forrester)'],
  ['资深 PM (字节 8 年)', '前端架构师 (Vercel)'],
  ['销售总监 (SaaS 大客户)', '大客户经理 (TOP3 客户)'],
  ['连续创业者 (3 次退出)', 'VC 合伙人 (Series A 专家)'],
  ['公司律师 (上市合规)', '内审主管'],
  ['增长营销总监', 'UX 研究员'],
  ['CFO (跨境集团)', '四大审计 partner'],
  ['学术期刊主编 (Nature)', '同行评审委员会主席'],
  ['品牌公关总监', '上市公司发言人'],
  ['UX 设计师 (Airbnb 出身)', '资深前端 (React core 贡献)'],
  ['CEO (B2B SaaS)', '独立董事'],
  ['数据科学家 (DeepMind)', '业务分析师 (零售)'],
  ['国家级教练', '奥运冠军'],
  ['政策研究员 (清华公管)', '智库专家 (布鲁金斯)'],
  ['资深主持人 (CCTV)', '演讲教练 (TED 培训)'],
]

const CONTENT_SEEDS = [
  { topic: 'AI 时代教育', md: `# 如果 AI 已经会做所有作业，我们为什么还要教孩子做作业？

## 这是一场关于教育的紧急对话
2026 年，AI 写作业已经比 80% 的中学生写得好。

## 三个事实
- AI 作业市场窗口期短，今年错过明年就被锁死
- 技术成熟度刚好够用，再等就是落后
- 团队能力匹配，现在做最不挣扎

## 解决方案三步
- 观察现状：走出去看真实场景
- 提出假设：把直觉写成可验证命题
- 验证迭代：最小可行原型 → 真实反馈

## 引言
> 唯一持久的竞争优势，是比对手学习更快的能力。
— Arie de Geus
` },
  { topic: '产品战略复盘', md: `# 2026 Q1 增长复盘

## 关键发现
- 获客成本同比上涨 18%，留存率下滑 1.2pt
- 第二曲线尚未跑通
- 团队认知出现分歧

## 我们必须谈这件事
- 周级报告滞后超过 48 小时
- 数据看板对齐度不足 60%
- 跨部门决策周期 14 天

## 下一步行动
- 重建实时指标体系
- 设立北极星指标守护人
- 月度全员对齐会
` },
  { topic: '临床决策辅助', md: `# 基于 LLM 的临床辅助决策

## 当前痛点
- 病历回顾平均 23 分钟
- 鉴别诊断遗漏率 11%
- 抗生素使用合规率 78%

## 实施路径
- 病历摘要 AI 预生成
- 鉴别诊断模型 top-5
- 处方合规实时校验
- 高风险药物双签

## 数据
- 摘要时间 23 → 6 分钟
- 鉴别遗漏 11% → 3%
- 合规率 78% → 96%
` },
  { topic: '品牌 2026 发布', md: `# Acme 2026 年度发布会

## 一年看过去
- 用户规模 +180%
- 创造者收入 +240%
- 国家覆盖 14 → 27

## 三件大事
- 新一代创作工具发布
- 全球创作者基金启动
- 开放生态计划

## 引言
> 工具不会让你成为艺术家，但好工具能让艺术家不被工具拖累。
` },
]

const THEMES = ['modern-minimal', 'editorial-monocle', 'midnight-luxe', 'cyberpunk-neon', 'tech-utility', 'swiss-grid', 'brutalist-mono', 'pop-magazine']

async function runRound(round) {
  const idx = (round - 1) % EXPERTS.length
  const expertPair = EXPERTS[idx]
  const seed = CONTENT_SEEDS[(round - 1) % CONTENT_SEEDS.length]
  const theme = THEMES[(round - 1) % THEMES.length]

  const out = path.resolve('.realcheck', `round-${String(round).padStart(2, '0')}`)
  mkdirSync(out, { recursive: true })

  const report = {
    round,
    experts: expertPair,
    seed: seed.topic,
    theme,
    flows: [],
    bugs: [],
    pageErrors: [],
    consoleErrors: [],
  }

  const browser = await chromium.launch()
  const ctx = await browser.newContext({
    viewport: { width: 1600, height: 1000 },
    locale: 'zh-CN',
    proxy: { server: 'http://localhost:7897', bypass: 'localhost,127.0.0.1' },
    acceptDownloads: true,
  })
  const page = await ctx.newPage()
  page.on('pageerror', e => report.pageErrors.push(e.message))
  page.on('console', m => { if (m.type() === 'error') report.consoleErrors.push(m.text().slice(0, 200)) })

  try {
    // Flow 1: Markdown → API → JSON deck
    const apiRes = await page.request.post(`${BASE}/api/render`, {
      data: { markdown: seed.md, theme, format: 'json' },
    })
    const apiData = await apiRes.json()
    report.flows.push({ name: 'api-render-json', ok: apiRes.ok(), status: apiRes.status(), slides: apiData?.deck?.slides?.length || 0 })
    if (!apiRes.ok()) report.bugs.push(`API /api/render JSON 失败: ${apiRes.status()} ${JSON.stringify(apiData).slice(0, 200)}`)

    // Flow 2: Markdown → API → PPTX (binary)
    const pptxRes = await page.request.post(`${BASE}/api/render`, {
      data: { markdown: seed.md, theme, format: 'pptx' },
    })
    if (pptxRes.ok()) {
      const buf = await pptxRes.body()
      writeFileSync(path.join(out, 'api-export.pptx'), buf)
      report.flows.push({ name: 'api-render-pptx', ok: true, bytes: buf.length })
    } else {
      report.flows.push({ name: 'api-render-pptx', ok: false, status: pptxRes.status() })
      report.bugs.push(`API /api/render PPTX 失败: ${pptxRes.status()}`)
    }

    // Flow 3: Markdown → API → HTML
    const htmlRes = await page.request.post(`${BASE}/api/render`, {
      data: { markdown: seed.md, theme, format: 'html' },
    })
    if (htmlRes.ok()) {
      const html = await htmlRes.text()
      writeFileSync(path.join(out, 'api-export.html'), html)
      report.flows.push({ name: 'api-render-html', ok: true, bytes: html.length })
    } else {
      report.bugs.push(`API /api/render HTML 失败: ${htmlRes.status()}`)
    }

    // Flow 4: Seed the deck into localStorage and visit /deck
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' })
    await page.evaluate(deck => localStorage.setItem('pg_last_deck', JSON.stringify(deck)), apiData.deck)
    await page.goto(`${BASE}/deck`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: path.join(out, 'deck-open.png') })
    const slidesCount = await page.locator('aside canvas').count()
    report.flows.push({ name: 'deck-load', ok: slidesCount > 0, slides: slidesCount })
    if (slidesCount === 0) report.bugs.push('Deck 编辑器未加载缩略图')

    // Flow 5: Open layout picker
    const layoutBtn = page.getByRole('button', { name: /\+ .*版式/ }).first()
    if (await layoutBtn.count() > 0) {
      await layoutBtn.click()
      await page.waitForTimeout(400)
      const picker = await page.locator('text=挑一个版式').count()
      report.flows.push({ name: 'layout-picker', ok: picker > 0 })
      if (picker === 0) report.bugs.push('LayoutPicker 未打开')
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
    }

    // Flow 6: Open icon picker
    const iconBtn = page.getByRole('button', { name: /\+ 图标/ }).first()
    if (await iconBtn.count() > 0) {
      await iconBtn.click()
      await page.waitForTimeout(400)
      const iconCnt = await page.locator('button[title*="·"]').count()
      report.flows.push({ name: 'icon-picker', ok: iconCnt > 50, count: iconCnt })
      if (iconCnt < 50) report.bugs.push(`IconPicker 图标数异常: ${iconCnt}`)
      await page.keyboard.press('Escape')
      await page.waitForTimeout(200)
    }

    // Flow 7: Switch language to EN, check labels
    const langBtn = page.locator('button[aria-label="Toggle language"]')
    if (await langBtn.count() > 0) {
      await langBtn.click()
      await page.waitForTimeout(300)
      const enLabel = await page.locator('text=Layout').count()
      report.flows.push({ name: 'i18n-en', ok: enLabel > 0 })
      if (enLabel === 0) report.bugs.push('EN 语言切换未生效')
      await langBtn.click()
      await page.waitForTimeout(200)
    }

    // Flow 8: Add text element via toolbar
    const addTextBtn = page.getByRole('button', { name: /\+ 文本/ }).first()
    if (await addTextBtn.count() > 0) {
      await addTextBtn.click()
      await page.waitForTimeout(400)
      const inspectorTxt = await page.locator('aside').last().locator('text=文本元素').count()
      report.flows.push({ name: 'add-text', ok: inspectorTxt > 0 })
    }

    // Flow 9: Present mode
    await page.goto(`${BASE}/present/deck`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(2000)
    await page.screenshot({ path: path.join(out, 'present.png') })
    const counter = await page.locator('text=/\\d+ \\/ \\d+/').count()
    report.flows.push({ name: 'present-open', ok: counter > 0 })

    // Flow 10: Press right arrow several times then F for speaker view
    for (let i = 0; i < 2; i++) {
      await page.keyboard.press('ArrowRight')
      await page.waitForTimeout(300)
    }
    await page.keyboard.press('f')
    await page.waitForTimeout(400)
    await page.screenshot({ path: path.join(out, 'present-speaker.png') })
    const speakerOK = await page.locator('text=备注').count()
    report.flows.push({ name: 'present-speaker', ok: speakerOK > 0 })

    // Flow 11: HTML download from /deck
    await page.goto(`${BASE}/deck`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1500)
    const dlPromise = page.waitForEvent('download', { timeout: 15000 }).catch(() => null)
    await page.locator('button:has-text("导出")').first().hover()
    await page.waitForTimeout(300)
    const htmlBtn = page.locator('button:has-text("HTML 自包含")').first()
    if (await htmlBtn.count() > 0) {
      await htmlBtn.click()
      const dl = await dlPromise
      if (dl) {
        const p = path.join(out, 'deck-export.html')
        await dl.saveAs(p)
        report.flows.push({ name: 'html-download', ok: true, bytes: statSync(p).size })
      } else {
        report.flows.push({ name: 'html-download', ok: false })
        report.bugs.push('HTML 导出未触发下载')
      }
    }

    // Flow 12: Visit home, history, quick — ensure no crash
    for (const route of ['/', '/history', '/quick']) {
      await page.goto(`${BASE}${route}`, { waitUntil: 'networkidle' })
      await page.waitForTimeout(500)
      await page.screenshot({ path: path.join(out, `route${route.replace(/\//g, '_') || '_root'}.png`) })
    }
    report.flows.push({ name: 'static-routes', ok: report.pageErrors.length === 0 })

  } catch (e) {
    report.bugs.push(`harness 异常: ${e.message}`)
  } finally {
    await browser.close()
  }

  writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2))
  return report
}

console.log(`\n=== 真实检查：${startRound} ~ ${startRound + count - 1} 轮 ===\n`)
const summary = []
for (let r = startRound; r < startRound + count; r++) {
  process.stdout.write(`Round ${String(r).padStart(2, '0')}: `)
  const t0 = Date.now()
  const rep = await runRound(r)
  const dt = ((Date.now() - t0) / 1000).toFixed(1)
  const okFlows = rep.flows.filter(f => f.ok).length
  const bugCnt = rep.bugs.length
  const errCnt = rep.pageErrors.length + rep.consoleErrors.length
  console.log(`${okFlows}/${rep.flows.length} flows ok · bugs=${bugCnt} · errs=${errCnt} · ${dt}s`)
  summary.push({ round: r, ok: okFlows, total: rep.flows.length, bugs: bugCnt, errs: errCnt })
}

writeFileSync(path.resolve('.realcheck/summary.json'), JSON.stringify(summary, null, 2))
console.log('\n=== 完成 ===')
console.log('详情：.realcheck/round-NN/report.json')
