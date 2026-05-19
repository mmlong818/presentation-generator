// ─── 21 个版式目录 ──────────────────────────────────────────────────────────
//
// 用途：
// (1) 新建 slide 时给一个 sensible default 数据
// (2) 切换版式时把当前 slide 的可复用字段（title/heading/highlight/eyebrow）映射过来
//
// 这里的 default 严格遵守 lib/types.ts 的 Slide schema，让 picker 立即可渲染。

import type { Slide, LayoutType } from '../types'

export interface LayoutMeta {
  type: LayoutType
  name: string
  category: '叙事' | '对比' | '数据' | '流程' | '结构'
  hint: string
  default: Slide
}

export const LAYOUTS: LayoutMeta[] = [
  { type: 'cover', name: '封面', category: '叙事', hint: '标题 + 副标题 + eyebrow',
    default: { type: 'cover', eyebrow: 'A TALK · 2026', title: '在此输入主标题', subtitle: '副标题或一句话引子', highlight: '主标题' } },

  { type: 'statement', name: '单句冲击', category: '叙事', hint: '中心大字一句话',
    default: { type: 'statement', title: '一句话写下你想让听众记住的核心论断。', align: 'center' } },

  { type: 'question', name: '提问', category: '叙事', hint: '抛问题让听众停下',
    default: { type: 'question', eyebrow: '思考', question: '在此输入要抛给听众的问题？' } },

  { type: 'quote', name: '引言', category: '叙事', hint: '名人名言或用户原话',
    default: { type: 'quote', quote: '在此粘贴引言原文。', source: '来源' } },

  { type: 'cta', name: '行动号召', category: '叙事', hint: '收尾的下一步',
    default: { type: 'cta', eyebrow: '下一步', newAction: '具体行动或下一步联系方式' } },

  { type: 'argument', name: '论点', category: '结构', hint: '3-5 个并列论据',
    default: { type: 'argument', eyebrow: '三个事实', heading: '为什么是现在', highlight: '现在', points: ['论据 1', '论据 2', '论据 3'] } },

  { type: 'checklist', name: '清单', category: '结构', hint: '勾选项列表',
    default: { type: 'checklist', heading: '准备清单', items: ['第一项', '第二项', '第三项'] } },

  { type: 'compare', name: '对比', category: '对比', hint: '左右两栏',
    default: { type: 'compare', heading: '新方式 vs 旧方式', left: { title: '旧方式', items: ['特征 A', '特征 B'] }, right: { title: '新方式', items: ['特征 X', '特征 Y'] } } },

  { type: 'matrix-2x2', name: '2×2 矩阵', category: '对比', hint: '四象限分类',
    default: { type: 'matrix-2x2', heading: '战略矩阵',
      axes: { x: { low: '横-低', high: '横-高' }, y: { low: '纵-低', high: '纵-高' } },
      cells: [{ label: '象限 1' }, { label: '象限 2' }, { label: '象限 3' }, { label: '象限 4' }] } as Slide },

  { type: 'quadrant', name: '象限定位', category: '对比', hint: '在 2x2 中放点',
    default: { type: 'quadrant', heading: '玩家定位',
      axes: { x: { label: '横轴', low: '低', high: '高' }, y: { label: '纵轴', low: '低', high: '高' } },
      points: [
        { id: 'a', label: '玩家 A', gridX: 1, gridY: 3 },
        { id: 'b', label: '玩家 B', gridX: 3, gridY: 1 },
      ] } },

  { type: 'data', name: '数据', category: '数据', hint: '2-5 个关键数字',
    default: { type: 'data', heading: '关键数字', stats: [{ value: '85%', label: '指标一' }, { value: '3.2×', label: '指标二' }] } },

  { type: 'kpi-board', name: 'KPI 看板', category: '数据', hint: '指标 + 同比变化',
    default: { type: 'kpi-board', heading: '业绩看板', period: '2026 Q1',
      kpis: [
        { label: 'GMV', value: '$1.2M', delta: '+18%', deltaTone: 'pos' },
        { label: '日活', value: '240k', delta: '-3%', deltaTone: 'neg' },
        { label: 'NPS', value: '62', delta: '+4', deltaTone: 'pos' },
        { label: '留存', value: '85%', delta: '0', deltaTone: 'flat' },
      ] } },

  { type: 'chart-bar', name: '柱状图', category: '数据', hint: '横向条形对比',
    default: { type: 'chart-bar', heading: '渠道贡献', unit: '万元',
      bars: [{ label: '渠道 A', value: 40 }, { label: '渠道 B', value: 28 }, { label: '渠道 C', value: 12 }] } },

  { type: 'table', name: '表格', category: '数据', hint: '多列对照',
    default: { type: 'table', heading: '对照表',
      columns: [{ id: 'k', label: '维度' }, { id: 'v', label: '值' }],
      rows: [{ cells: { k: '指标 A', v: '高' } }, { cells: { k: '指标 B', v: '中' } }] } },

  { type: 'process', name: '流程', category: '流程', hint: '3-6 步骤',
    default: { type: 'process', heading: '执行三步',
      steps: [{ title: '步骤 1', desc: '说明' }, { title: '步骤 2', desc: '说明' }, { title: '步骤 3', desc: '说明' }] } },

  { type: 'timeline', name: '时间轴', category: '流程', hint: '历史/路线点',
    default: { type: 'timeline', heading: '历程',
      events: [{ time: '2024', title: '事件 A' }, { time: '2025', title: '事件 B' }, { time: '2026', title: '事件 C' }] } },

  { type: 'roadmap', name: '路线图', category: '流程', hint: '多 lane × 时间',
    default: { type: 'roadmap', heading: '产品路线', periods: ['Q1', 'Q2', 'Q3', 'Q4'],
      lanes: [
        { name: '主线', items: [{ period: 'Q1', label: '里程碑 1' }, { period: 'Q3', label: '里程碑 2' }] },
        { name: '辅助', items: [{ period: 'Q2', label: '辅助任务' }] },
      ] } },

  { type: 'causality', name: '因果链', category: '流程', hint: 'A → B → C',
    default: { type: 'causality', heading: '因果链',
      chain: [{ cause: '原因' }, { cause: '过程', because: '因为...' }, { cause: '结果', because: '所以...' }] } },

  { type: 'case-study', name: '案例研究', category: '叙事', hint: '一个客户故事',
    default: { type: 'case-study', client: '客户名', context: '当时背景', challenge: '面临的挑战', approach: '采取的方法',
      results: [{ metric: '指标', value: '+30%' }] } },

  { type: 'persona', name: '人物画像', category: '叙事', hint: '典型用户档案',
    default: { type: 'persona', name: '张三', role: '产品经理',
      attributes: [{ label: '年龄', value: '32' }, { label: '城市', value: '上海' }],
      needs: ['目标 A'], pains: ['痛点 A'] } },

  { type: 'diagram', name: '示意图', category: '结构', hint: '抽象示意',
    default: { type: 'diagram', heading: '系统示意', hint: '在此填示意图描述' } },
]

/** Look up the default slide payload for a layout type. */
export function defaultSlideForType(type: LayoutType): Slide {
  const meta = LAYOUTS.find(l => l.type === type)
  if (!meta) throw new Error(`Unknown layout: ${type}`)
  return JSON.parse(JSON.stringify(meta.default))
}

/**
 * Best-effort field migration from old slide to new layout. Preserves
 * eyebrow / heading / title / highlight if both layouts use them.
 */
export function migrateSlide(from: Slide, toType: LayoutType): Slide {
  const next = defaultSlideForType(toType) as any
  const src = from as any
  // eyebrow lives in LayoutBase so always allow copying.
  if (src.eyebrow) next.eyebrow = src.eyebrow
  if ('heading' in next && (src.heading || src.title)) next.heading = src.heading ?? src.title
  if ('title' in next && (src.title || src.heading)) next.title = src.title ?? src.heading
  // highlight has incompatible types across slides (string vs string[]). Only
  // copy when both sides accept the same shape.
  if ('highlight' in next && typeof src.highlight === typeof next.highlight) {
    next.highlight = src.highlight
  }
  return next as Slide
}
