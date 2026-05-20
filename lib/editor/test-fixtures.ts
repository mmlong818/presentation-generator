// Rich fixtures for every one of the 21 layouts.
//
// Goals:
// - Cover every required field of every layout type
// - Include realistic Chinese content (typical of target users)
// - Include "stress" variants: max items, long text, edge values
//
// Used by:
// - scripts/matrix-check.mjs (252-cell visual matrix)
// - scripts/stress-check.mjs (long deck, edge cases)
// - /deck?fx=<key>&theme=... preview

import type { Slide } from '../types'

export interface FixtureMeta {
  key: string
  layoutType: Slide['type']
  /** Short label shown in UI */
  label: string
  /** "normal" baseline, "stress" pushes limits, "edge" weird input */
  category: 'normal' | 'stress' | 'edge'
  slide: Slide
}

export const FIXTURES: FixtureMeta[] = [
  // ─── COVER ────────────────────────────────────────────────────────────────
  { key: 'cover.normal', layoutType: 'cover', label: '封面 · 标准', category: 'normal', slide: {
    type: 'cover',
    eyebrow: 'A TALK · 2026',
    title: '如果 AI 已经会做所有作业，我们为什么还要教孩子做作业？',
    highlight: '为什么还要',
    subtitle: '一场关于教育的紧急对话',
  } },
  { key: 'cover.short', layoutType: 'cover', label: '封面 · 短标题', category: 'normal', slide: {
    type: 'cover',
    title: '我们要做什么',
    subtitle: '2026 路线图',
  } },
  { key: 'cover.long', layoutType: 'cover', label: '封面 · 超长标题', category: 'stress', slide: {
    type: 'cover',
    eyebrow: '2026 ANNUAL · 创业者闭门会',
    title: '为什么在一切都被 AI 重新定义的今天，作为创业者的我们必须重新审视产品和组织的所有第一性原理',
    highlight: '第一性原理',
    subtitle: '一场关于组织进化、产品迭代与战略选择的深度对话——给所有不甘于成为他人棋子的创业者',
  } },
  { key: 'cover.minimal', layoutType: 'cover', label: '封面 · 极简', category: 'edge', slide: {
    type: 'cover', title: '开始',
  } },

  // ─── STATEMENT ────────────────────────────────────────────────────────────
  { key: 'statement.normal', layoutType: 'statement', label: '单句 · 标准', category: 'normal', slide: {
    type: 'statement',
    title: 'AI 不会让孩子失业，会让没学会用 AI 的孩子失业。',
    highlight: ['失业'],
    align: 'center',
  } },
  { key: 'statement.multi-highlight', layoutType: 'statement', label: '单句 · 多高亮', category: 'normal', slide: {
    type: 'statement',
    title: '我们要做的不是优化现状，而是重新定义现状。',
    highlight: ['优化', '重新定义'],
    align: 'center',
  } },
  { key: 'statement.long', layoutType: 'statement', label: '单句 · 长句', category: 'stress', slide: {
    type: 'statement',
    title: '如果你今天不开始构建自己的 AI 能力，三年后你将不是被 AI 替代——而是被那个学会用 AI 的同事替代。',
    highlight: ['替代'],
    align: 'center',
  } },
  { key: 'statement.left', layoutType: 'statement', label: '单句 · 左对齐', category: 'normal', slide: {
    type: 'statement', title: '一切都将改变。', align: 'left',
  } },

  // ─── QUESTION ─────────────────────────────────────────────────────────────
  { key: 'question.normal', layoutType: 'question', label: '提问 · 标准', category: 'normal', slide: {
    type: 'question',
    eyebrow: '在我们开始之前',
    question: '如果今天就是公司最后一天，你最遗憾没做的事是什么？',
    hints: ['想三秒', '说出口', '不必完美'],
    invitation: '把答案写在便签上，会后我们继续讨论。',
  } },

  // ─── QUOTE ────────────────────────────────────────────────────────────────
  { key: 'quote.normal', layoutType: 'quote', label: '引言 · 标准', category: 'normal', slide: {
    type: 'quote',
    quote: '唯一持久的竞争优势，是比对手学习更快的能力。',
    source: 'Arie de Geus · 壳牌前战略总监',
    highlight: '学习更快',
  } },
  { key: 'quote.long', layoutType: 'quote', label: '引言 · 长', category: 'stress', slide: {
    type: 'quote',
    quote: '当一项技术达到临界点，它就不再被讨论是好是坏，它只是成为了空气——人们将不再询问要不要用它，就像我们不会询问要不要用电。',
    source: 'Kevin Kelly · 《The Inevitable》',
    highlight: '空气',
  } },

  // ─── CTA ──────────────────────────────────────────────────────────────────
  { key: 'cta.normal', layoutType: 'cta', label: '行动号召 · 标准', category: 'normal', slide: {
    type: 'cta',
    eyebrow: '下一步',
    newAction: '本周内完成 Claude Code 试用，下周一例会分享结论',
    highlight: '下周一',
  } },
  { key: 'cta.with-old', layoutType: 'cta', label: '行动号召 · 含旧问', category: 'normal', slide: {
    type: 'cta',
    oldQuestion: '我们要不要做 AI 化？',
    newAction: '我们做哪一块最容易先看到回报？',
    highlight: '哪一块',
  } },

  // ─── ARGUMENT ─────────────────────────────────────────────────────────────
  { key: 'argument.3', layoutType: 'argument', label: '论点 · 3 条', category: 'normal', slide: {
    type: 'argument',
    eyebrow: '三个事实',
    heading: '为什么现在必须谈这件事',
    highlight: '现在',
    points: [
      '市场窗口期短，今年错过明年就被锁死',
      '技术成熟度刚好够用，再等就是落后',
      '团队能力匹配，现在做最不挣扎',
    ],
  } },
  { key: 'argument.5', layoutType: 'argument', label: '论点 · 5 条', category: 'normal', slide: {
    type: 'argument',
    eyebrow: '五个事实',
    heading: '为什么现在必须谈这件事',
    highlight: '现在',
    points: [
      '市场窗口期短，今年错过明年就被锁死',
      '技术成熟度刚好够用，再等就是落后',
      '团队能力匹配，现在做最不挣扎',
      '资金成本处于历史低点，机会成本可控',
      '竞争尚未白热化，先发者拥有差异空间',
    ],
  } },
  { key: 'argument.long-points', layoutType: 'argument', label: '论点 · 长论据', category: 'stress', slide: {
    type: 'argument',
    eyebrow: '三个理由',
    heading: '为什么我们应该重新思考产品策略',
    points: [
      '我们用三年时间构建的功能矩阵，正在被 AI 工具用一周时间复刻。这不是被替代，这是被重新定义。',
      '团队 30% 的工程时间花在做用户能在 GPT 里 5 秒钟得到答案的事。这是认知的代价，不是开发的代价。',
      '产品的差异化必须从功能层面转移到信任层面、数据层面、生态层面——这是 AI 时代的硬通货。',
    ],
  } },

  // ─── CHECKLIST ────────────────────────────────────────────────────────────
  { key: 'checklist.normal', layoutType: 'checklist', label: '清单 · 标准', category: 'normal', slide: {
    type: 'checklist',
    eyebrow: '开始前',
    heading: '试用 Claude Code 前的准备清单',
    items: [
      '安装 Claude Code CLI 并完成订阅登录',
      '准备一个真实的工程任务（非 hello world）',
      '把任务拆成可观察的子步骤',
      '准备好回滚机制（git 分支）',
      '邀请一位结对评审者',
    ],
  } },
  { key: 'checklist.long', layoutType: 'checklist', label: '清单 · 10 条', category: 'stress', slide: {
    type: 'checklist',
    heading: 'Production-ready 检查清单',
    items: [
      '环境变量已加密入金库',
      '所有 API 接口已写单元测试',
      '错误监控（Sentry）已接入',
      '关键路径已加分布式追踪',
      'CI/CD 流水线绿灯',
      '降级和限流策略已就位',
      '数据库备份策略已验证',
      '回滚剧本已演练过',
      '负责人 oncall 排班已确认',
      '事故响应 SLA 已对齐',
    ],
  } },

  // ─── COMPARE ──────────────────────────────────────────────────────────────
  { key: 'compare.normal', layoutType: 'compare', label: '对比 · 标准', category: 'normal', slide: {
    type: 'compare',
    eyebrow: '路径选择',
    heading: '旧方式 vs 新方式',
    left: { title: '旧方式', items: ['人工跟踪订单状态', '周级报告，结果滞后', '事后归因，难闭环'] },
    right: { title: '新方式', items: ['自动监测全链路', '实时仪表盘可见', '因果推断 + 自动 A/B'] },
  } },
  { key: 'compare.imbalanced', layoutType: 'compare', label: '对比 · 不对称', category: 'edge', slide: {
    type: 'compare',
    heading: '现状 vs 理想',
    left: { title: '现在', items: ['月报上线即过时'] },
    right: { title: '理想', items: ['实时可见', '可下钻', '可订阅', '可对比', '可分享'] },
  } },

  // ─── MATRIX 2X2 ──────────────────────────────────────────────────────────
  { key: 'matrix-2x2.normal', layoutType: 'matrix-2x2', label: '2×2 · 标准', category: 'normal', slide: {
    type: 'matrix-2x2',
    eyebrow: '战略矩阵',
    heading: '紧急性 × 重要性',
    axes: {
      x: { low: '不紧急', high: '紧急' },
      y: { low: '不重要', high: '重要' },
    },
    cells: [
      { label: '安排时间做', desc: '战略级，须主动投入', emphasis: true },
      { label: '立即处理', desc: '危机或机会窗口' },
      { label: '可以委托', desc: '日常事务' },
      { label: '能丢就丢', desc: '消耗精力但价值低' },
    ] as any,
    takeaway: '把更多时间转移到"重要不紧急"',
  } },

  // ─── QUADRANT ─────────────────────────────────────────────────────────────
  { key: 'quadrant.normal', layoutType: 'quadrant', label: '象限定位 · 标准', category: 'normal', slide: {
    type: 'quadrant',
    eyebrow: '竞争格局',
    heading: '功能完整度 × 易用性',
    axes: {
      x: { label: '功能完整度', low: '少', high: '多' },
      y: { label: '易用性', low: '难', high: '易' },
    },
    points: [
      { id: 'a', label: '我们', gridX: 3, gridY: 4 },
      { id: 'b', label: 'A 厂', gridX: 4, gridY: 1 },
      { id: 'c', label: 'B 厂', gridX: 1, gridY: 3 },
      { id: 'd', label: 'C 厂', gridX: 2, gridY: 2 },
      { id: 'e', label: 'D 厂', gridX: 4, gridY: 4 },
    ],
    highlight: 'a',
  } },

  // ─── DATA ────────────────────────────────────────────────────────────────
  { key: 'data.3', layoutType: 'data', label: '数据 · 3 个数字', category: 'normal', slide: {
    type: 'data',
    eyebrow: '关键指标',
    heading: '三个数字告诉你为什么',
    stats: [
      { value: '85%', label: '用户留存率', source: '内部统计 2026 Q1' },
      { value: '3.2×', label: '效率提升', source: '工程团队自评' },
      { value: '¥120万', label: '年化节省成本', source: '财务模型测算' },
    ],
  } },
  { key: 'data.5', layoutType: 'data', label: '数据 · 5 个', category: 'stress', slide: {
    type: 'data',
    heading: '全方位增长',
    stats: [
      { value: '+180%', label: 'GMV' },
      { value: '+240%', label: '创作者收入' },
      { value: '+62%', label: 'DAU' },
      { value: '14→27', label: '国家覆盖' },
      { value: '4.8', label: 'NPS' },
    ],
  } },

  // ─── KPI BOARD ───────────────────────────────────────────────────────────
  { key: 'kpi-board.4', layoutType: 'kpi-board', label: 'KPI · 4 个', category: 'normal', slide: {
    type: 'kpi-board',
    heading: '2026 Q1 业绩看板',
    period: '2026 Q1',
    kpis: [
      { label: 'GMV', value: '$1.2M', delta: '+18%', deltaTone: 'pos', hint: 'YoY' },
      { label: '日活', value: '240k', delta: '-3%', deltaTone: 'neg', hint: 'QoQ' },
      { label: 'NPS', value: '62', delta: '+4', deltaTone: 'pos' },
      { label: '留存', value: '85%', delta: '0', deltaTone: 'flat' },
    ],
    takeaway: '增长稳定，留存到顶，活跃需注意',
  } },
  { key: 'kpi-board.6', layoutType: 'kpi-board', label: 'KPI · 6 个', category: 'stress', slide: {
    type: 'kpi-board',
    heading: '全栈指标',
    period: '2026 H1',
    kpis: [
      { label: 'GMV', value: '$2.4M', delta: '+22%', deltaTone: 'pos' },
      { label: 'DAU', value: '320k', delta: '+8%', deltaTone: 'pos' },
      { label: 'MAU', value: '1.2M', delta: '+15%', deltaTone: 'pos' },
      { label: 'NPS', value: '64', delta: '+2', deltaTone: 'pos' },
      { label: '留存 30d', value: '78%', delta: '-2%', deltaTone: 'neg' },
      { label: '获客成本', value: '$8.40', delta: '+18%', deltaTone: 'neg' },
    ],
  } },

  // ─── CHART BAR ───────────────────────────────────────────────────────────
  { key: 'chart-bar.normal', layoutType: 'chart-bar', label: '柱状图 · 标准', category: 'normal', slide: {
    type: 'chart-bar',
    eyebrow: '渠道贡献',
    heading: '各渠道 GMV 占比',
    unit: '万元',
    bars: [
      { label: '直营 APP', value: 420 },
      { label: '小程序', value: 280 },
      { label: '抖音店铺', value: 180 },
      { label: '京东', value: 120 },
      { label: '其他', value: 40 },
    ],
    highlight: '小程序',
    source: '财务系统 2026 Q1',
  } },
  { key: 'chart-bar.long-labels', layoutType: 'chart-bar', label: '柱状图 · 长标签', category: 'stress', slide: {
    type: 'chart-bar',
    heading: '各业务线营收',
    unit: 'M USD',
    bars: [
      { label: '企业级 SaaS 订阅', value: 12.4 },
      { label: '消费者付费会员', value: 8.7 },
      { label: '广告与流量分成', value: 5.2 },
      { label: '专业服务咨询', value: 3.1 },
      { label: '硬件销售（含周边）', value: 1.8 },
    ],
  } },

  // ─── TABLE ───────────────────────────────────────────────────────────────
  { key: 'table.normal', layoutType: 'table', label: '表格 · 标准', category: 'normal', slide: {
    type: 'table',
    heading: '方案对比',
    columns: [
      { id: 'name', label: '方案', align: 'left' },
      { id: 'cost', label: '成本', align: 'right' },
      { id: 'time', label: '工期', align: 'right' },
      { id: 'risk', label: '风险', align: 'center' },
    ],
    rows: [
      { cells: { name: '自研', cost: '$120k', time: '6 月', risk: '高' } },
      { cells: { name: '采购 + 集成', cost: '$60k', time: '2 月', risk: '中' }, emphasis: true },
      { cells: { name: '完全外包', cost: '$200k', time: '3 月', risk: '中' } },
    ],
    highlightColumn: 'cost',
    source: '采购评估 2026-03',
  } },
  { key: 'table.dense', layoutType: 'table', label: '表格 · 密集', category: 'stress', slide: {
    type: 'table',
    heading: '12 个月运营数据',
    columns: [
      { id: 'm', label: '月份', align: 'left' },
      { id: 'gmv', label: 'GMV', align: 'right' },
      { id: 'dau', label: 'DAU', align: 'right' },
      { id: 'nps', label: 'NPS', align: 'right' },
      { id: 'note', label: '事件' },
    ],
    rows: [
      { cells: { m: '01', gmv: '$80k', dau: '12k', nps: '52', note: '春节促销' } },
      { cells: { m: '02', gmv: '$95k', dau: '15k', nps: '54', note: '' } },
      { cells: { m: '03', gmv: '$110k', dau: '18k', nps: '56', note: '新版本' } },
      { cells: { m: '04', gmv: '$130k', dau: '21k', nps: '58', note: '618 预热' }, emphasis: true },
      { cells: { m: '05', gmv: '$150k', dau: '24k', nps: '60', note: '' } },
      { cells: { m: '06', gmv: '$180k', dau: '28k', nps: '62', note: '618 高峰' }, emphasis: true },
    ],
  } },

  // ─── PROCESS ─────────────────────────────────────────────────────────────
  { key: 'process.3', layoutType: 'process', label: '流程 · 3 步', category: 'normal', slide: {
    type: 'process',
    eyebrow: '执行三步',
    heading: '从想法到落地，只需要三步',
    steps: [
      { title: '观察现状', desc: '走出去看真实用户场景，避开自我臆测' },
      { title: '提出假设', desc: '把直觉写成可验证的命题，限定边界条件' },
      { title: '验证迭代', desc: '最小可行原型 → 真实反馈 → 决策保留或调整' },
    ],
  } },
  { key: 'process.6', layoutType: 'process', label: '流程 · 6 步', category: 'stress', slide: {
    type: 'process',
    heading: '完整产品发布流程',
    steps: [
      { title: '需求挖掘', desc: '用户访谈 + 数据分析' },
      { title: '方案设计', desc: 'PRD + 原型' },
      { title: '开发实施', desc: 'sprint 排期 + 日站会' },
      { title: '测试验收', desc: '功能 + 性能 + 安全' },
      { title: '灰度发布', desc: '5% → 20% → 100%' },
      { title: '监控复盘', desc: '指标看板 + 周度回顾' },
    ],
  } },

  // ─── TIMELINE ────────────────────────────────────────────────────────────
  { key: 'timeline.normal', layoutType: 'timeline', label: '时间轴 · 标准', category: 'normal', slide: {
    type: 'timeline',
    heading: '团队成长史',
    events: [
      { time: '2022', title: '团队成立', desc: '3 人，咖啡厅起步' },
      { time: '2023', title: '产品上线', desc: '首批 100 用户' },
      { time: '2024', title: '完成 A 轮', desc: '$5M 融资' },
      { time: '2025', title: '团队扩张', desc: '50 人，3 城办公' },
      { time: '2026', title: 'IPO 筹备', desc: '上交所主板' },
    ],
  } },

  // ─── ROADMAP ─────────────────────────────────────────────────────────────
  { key: 'roadmap.normal', layoutType: 'roadmap', label: '路线图 · 标准', category: 'normal', slide: {
    type: 'roadmap',
    heading: '2026 产品路线',
    periods: ['Q1', 'Q2', 'Q3', 'Q4'],
    lanes: [
      { name: '核心产品', items: [
        { period: 'Q1', label: 'v3.0 发布', emphasis: true },
        { period: 'Q2', label: '海外版' },
        { period: 'Q3', label: '企业版', span: 2 },
      ] },
      { name: '生态', items: [
        { period: 'Q2', label: '开放 API' },
        { period: 'Q4', label: '插件市场' },
      ] },
      { name: '组织', items: [
        { period: 'Q1', label: '招聘 +20' },
        { period: 'Q3', label: '海外办公室' },
      ] },
    ],
    legend: '高亮 = 关键里程碑',
  } },

  // ─── CAUSALITY ───────────────────────────────────────────────────────────
  { key: 'causality.normal', layoutType: 'causality', label: '因果链 · 标准', category: 'normal', slide: {
    type: 'causality',
    eyebrow: '根因分析',
    heading: '为什么留存率在下滑',
    chain: [
      { cause: '新版本上线' },
      { cause: '关键流程变长', because: '增加 2 步引导' },
      { cause: '完课率下降 15%', because: '用户在第 3 步流失' },
      { cause: '复访意愿降低', because: '首次体验差' },
      { cause: '30 天留存 -8pt', because: '前两周流失加剧' },
    ],
    conclusion: '应在引导流程中加入跳过选项',
  } },

  // ─── CASE STUDY ──────────────────────────────────────────────────────────
  { key: 'case-study.normal', layoutType: 'case-study', label: '案例 · 标准', category: 'normal', slide: {
    type: 'case-study',
    eyebrow: '客户案例',
    client: 'Acme 物流',
    clientMeta: '日均订单 50 万 · 华东头部第三方物流',
    context: '2025 Q4 业务高峰，仓配协同压力陡增',
    challenge: '订单异常率从 1.2% 升至 3.8%，客诉激增',
    approach: '接入 AI 调度引擎，重构异常预警机制，建立 SLA 看板',
    results: [
      { metric: '异常率', value: '0.6%', delta: '-83%' },
      { metric: '客诉量', value: '/3', delta: '-67%' },
      { metric: 'NPS', value: '64', delta: '+12' },
    ],
    quote: '上线两个月后，运营团队第一次睡了整觉。',
    quoteAttribution: '运营总监 · Acme',
  } },

  // ─── PERSONA ─────────────────────────────────────────────────────────────
  { key: 'persona.normal', layoutType: 'persona', label: '人物画像 · 标准', category: 'normal', slide: {
    type: 'persona',
    eyebrow: '典型用户',
    name: '张明',
    role: '上市公司产品总监',
    attributes: [
      { label: '年龄', value: '35' },
      { label: '城市', value: '上海' },
      { label: '团队', value: '15 人' },
      { label: '汇报', value: 'VP Product' },
    ],
    needs: [
      '快速产出可向 CEO 汇报的战略材料',
      '在跨部门会议上对齐认知',
      '让设计师不要再花周末做 PPT',
    ],
    pains: [
      '现有模板不够正式，AI 工具不够克制',
      '导出 PPTX 在公司电脑打不开',
      '团队没人统一改字号',
    ],
    quote: '一个真正能用的 AI PPT 工具，我们等了三年。',
  } },

  // ─── DIAGRAM ─────────────────────────────────────────────────────────────
  { key: 'diagram.normal', layoutType: 'diagram', label: '示意图 · 标准', category: 'normal', slide: {
    type: 'diagram',
    heading: '系统架构示意',
    hint: '前端 ↔ 网关 ↔ 服务集群 ↔ 数据库\n旁路：缓存、消息队列、监控',
  } },
]

export function fixtureByKey(key: string): FixtureMeta | undefined {
  return FIXTURES.find(f => f.key === key)
}

/** All fixtures grouped by layout type. */
export function fixturesByLayout(): Map<Slide['type'], FixtureMeta[]> {
  const map = new Map<Slide['type'], FixtureMeta[]>()
  for (const f of FIXTURES) {
    if (!map.has(f.layoutType)) map.set(f.layoutType, [])
    map.get(f.layoutType)!.push(f)
  }
  return map
}

/** One canonical "normal" fixture per layout — useful for the 21×N matrix. */
export function canonicalFixtures(): FixtureMeta[] {
  const byLayout = fixturesByLayout()
  const out: FixtureMeta[] = []
  for (const [, list] of byLayout) {
    out.push(list.find(f => f.category === 'normal') ?? list[0])
  }
  return out
}
