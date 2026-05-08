// ─── 测试用 fixture deck：覆盖关键版式 ──────────────────────────────────────
import type { Slide } from '@/lib/types';

export const FIXTURE_SLIDES: Slide[] = [
  {
    type: 'cover',
    eyebrow: 'Q1 · 2026',
    title: '一份覆盖所有版式的演示',
    highlight: '所有版式',
    subtitle: '20 套主题快速预览',
  },
  {
    type: 'statement',
    title: '当一道题 AI 三秒能答，孩子知道这道题已经死了。',
    highlight: ['AI 三秒', '已经死了'],
  },
  {
    type: 'quote',
    quote: '如果你不能简单解释一件事，说明你还没真正理解它。',
    source: 'Albert Einstein（推测，无确切出处）',
    highlight: '简单解释',
  },
  {
    type: 'data',
    eyebrow: '关键指标',
    heading: '三个数字告诉我们什么',
    stats: [
      { value: '47.2%', label: '毛利率', source: '内部财报' },
      { value: '—', label: '获客成本同比', source: '需引用：投放系统数据' },
      { value: '2,140 万', label: '月活用户', source: '内部 BI' },
    ],
  },
  {
    type: 'kpi-board',
    eyebrow: '经营仪表盘',
    heading: '毛利改善但获客成本同步抬升',
    period: '2026 Q1',
    kpis: [
      { label: '营收', value: '¥18.4亿', delta: '+12.3%', deltaTone: 'pos', hint: '符合指引上沿' },
      { label: '毛利率', value: '47.2%', delta: '+3.1pt', deltaTone: 'pos', hint: '供应链贡献' },
      { label: '获客成本', value: '¥312', delta: '+18%', deltaTone: 'neg', hint: '渠道竞价加剧' },
      { label: 'MAU', value: '2,140万', delta: '+6.8%', deltaTone: 'pos', hint: '新城市贡献' },
      { label: '30 日留存', value: '38.5%', delta: '-1.2pt', deltaTone: 'neg', hint: '需关注' },
      { label: 'NPS', value: '47', delta: '—', deltaTone: 'flat', hint: '样本未刷新' },
    ],
    takeaway: '增长健康，但获客成本与留存曲线已开始背离',
  },
  {
    type: 'chart-bar',
    eyebrow: 'Q1 营收',
    heading: '华东独大，西南增速最快但盘子最小',
    unit: '万元',
    bars: [
      { label: '华东', value: 5610, note: '+18% YoY' },
      { label: '华北', value: 4820, note: '+9%' },
      { label: '华南', value: 3150, note: '+12%' },
      { label: '西南', value: 1720, note: '+47%' },
      { label: '东北', value: 2940, note: '-3%' },
    ],
    highlight: '西南',
    source: '需引用：内部 BI 看板',
  },
  {
    type: 'matrix-2x2',
    eyebrow: '战略优先级',
    heading: 'Q3 资源应该投在哪里',
    axes: { x: { low: '影响小', high: '影响大' }, y: { low: '投入低', high: '投入高' } },
    cells: [
      { label: '重投入低回报', desc: '立即砍掉' },
      { label: '战略投资', desc: '高优持续投入', emphasis: true },
      { label: '维持现状', desc: '不增不减' },
      { label: '速赢机会', desc: '本季度内拿下' },
    ],
    takeaway: '把 70% 团队带宽压到右上格',
  },
  {
    type: 'compare',
    eyebrow: '两个世界',
    heading: '我们花 12 年训练孩子做 AI 最擅长的事',
    left: { title: '学校教的', items: ['把信息装进脑子', '一个人独自答题', '标准答案得高分'] },
    right: { title: '世界要的', items: ['把问题问得更好', '与 AI 协作产出', '判断哪个答案值得用'] },
  },
  {
    type: 'process',
    eyebrow: '推进路径',
    heading: '四步推进，每一步都可衡量',
    steps: [
      { title: '诊断', desc: '识别真正的问题' },
      { title: '拆解', desc: '分解为可执行单元' },
      { title: '执行', desc: '小步快跑迭代' },
      { title: '复盘', desc: '提炼可复用经验' },
    ],
  },
  {
    type: 'argument',
    eyebrow: '厌学的真相',
    heading: '不是难——是没意义',
    highlight: '没意义',
    points: [
      '当一道题 AI 三秒能答，孩子知道这道题已经死了',
      '当一篇范文 AI 一键生成，孩子知道写它是在表演',
      '当排名比好奇心更重要，孩子学会了关闭自己',
    ],
  },
  {
    type: 'cta',
    eyebrow: '从今晚开始',
    oldQuestion: '今天考了多少分？',
    newAction: '今天你问了什么好问题？',
    highlight: '好问题',
  },
];
