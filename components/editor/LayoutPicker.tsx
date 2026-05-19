'use client'

import { useEffect, useState } from 'react'
import { LAYOUTS } from '@/lib/editor/layouts-catalog'
import type { LayoutType } from '@/lib/types'

interface Props {
  open: boolean
  mode: 'insert' | 'change'
  onClose: () => void
  onPick: (type: LayoutType) => void
}

const CATEGORIES: Array<'叙事' | '结构' | '对比' | '数据' | '流程'> = ['叙事', '结构', '对比', '数据', '流程']

export default function LayoutPicker({ open, mode, onClose, onPick }: Props) {
  const [filter, setFilter] = useState<string>('')
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { e.preventDefault(); onClose() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])
  if (!open) return null
  const lower = filter.toLowerCase()
  const grouped = CATEGORIES.map(cat => ({
    cat,
    items: LAYOUTS.filter(l => l.category === cat).filter(l =>
      !lower || l.name.includes(filter) || l.type.includes(lower) || l.hint.includes(filter)
    ),
  }))
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6"
      onMouseDown={onClose}>
      <div className="bg-white rounded-lg w-[860px] max-h-[80vh] overflow-hidden flex flex-col"
        onMouseDown={(e) => e.stopPropagation()}>
        <header className="px-6 py-4 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-stone-500">
              {mode === 'insert' ? '新增 slide' : '切换当前 slide 版式'}
            </div>
            <h2 className="font-semibold mt-0.5">{mode === 'insert' ? '挑一个版式' : '换成另一个版式'}</h2>
          </div>
          <input value={filter} onChange={(e) => setFilter(e.target.value)}
            placeholder="搜版式名或类型..."
            className="px-3 py-1.5 text-sm border border-stone-300 rounded w-60" autoFocus />
        </header>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {grouped.map(g => g.items.length === 0 ? null : (
            <section key={g.cat}>
              <div className="text-xs uppercase tracking-widest text-stone-500 mb-3">{g.cat}</div>
              <div className="grid grid-cols-4 gap-3">
                {g.items.map(l => (
                  <button key={l.type}
                    onClick={() => { onPick(l.type); onClose() }}
                    className="text-left p-3 rounded border border-stone-200 hover:border-stone-900 hover:bg-stone-50 transition group">
                    <LayoutIcon type={l.type} />
                    <div className="text-sm font-semibold mt-2">{l.name}</div>
                    <div className="text-xs text-stone-500 mt-0.5 truncate" title={l.hint}>{l.hint}</div>
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="px-6 py-3 border-t border-stone-200 text-xs text-stone-500 flex justify-between">
          <span>{mode === 'change' ? '切换后会按字段映射保留 eyebrow / 标题，其他字段重置为默认占位。' : '插入后可在 Inspector 编辑每个字段。'}</span>
          <button onClick={onClose} className="text-stone-700 hover:underline">取消</button>
        </footer>
      </div>
    </div>
  )
}

/** Tiny inline SVG schematic that conveys the layout shape at-a-glance. */
function LayoutIcon({ type }: { type: LayoutType }) {
  const stroke = '#525252'
  const fill = '#a8a29e'
  switch (type) {
    case 'cover': return svg(<><rect x="6" y="20" width="36" height="6" fill={stroke} /><rect x="6" y="30" width="22" height="3" fill={fill} /></>)
    case 'statement': return svg(<><rect x="8" y="24" width="40" height="8" fill={stroke} /></>)
    case 'question': return svg(<><rect x="10" y="22" width="36" height="10" fill={stroke} /><circle cx="40" cy="36" r="2" fill={stroke} /></>)
    case 'quote': return svg(<><text x="6" y="20" fontSize="14" fontWeight="800" fill={stroke}>"</text><rect x="14" y="14" width="32" height="3" fill={fill} /><rect x="14" y="20" width="28" height="3" fill={fill} /><rect x="14" y="26" width="18" height="2" fill={stroke} /></>)
    case 'cta': return svg(<><rect x="6" y="20" width="42" height="5" fill={stroke} /><rect x="6" y="30" width="20" height="6" fill={stroke} /></>)
    case 'argument': return svg(<><rect x="6" y="6" width="42" height="4" fill={stroke} /><rect x="8" y="16" width="3" height="3" fill={stroke} /><rect x="14" y="16" width="34" height="3" fill={fill} /><rect x="8" y="24" width="3" height="3" fill={stroke} /><rect x="14" y="24" width="32" height="3" fill={fill} /><rect x="8" y="32" width="3" height="3" fill={stroke} /><rect x="14" y="32" width="30" height="3" fill={fill} /></>)
    case 'checklist': return svg(<><rect x="6" y="6" width="42" height="3" fill={stroke} /><rect x="8" y="14" width="3" height="3" fill={stroke} /><rect x="14" y="14" width="32" height="3" fill={fill} /><rect x="8" y="20" width="3" height="3" fill={stroke} /><rect x="14" y="20" width="28" height="3" fill={fill} /><rect x="8" y="26" width="3" height="3" fill={stroke} /><rect x="14" y="26" width="30" height="3" fill={fill} /></>)
    case 'compare': return svg(<><rect x="6" y="6" width="42" height="3" fill={stroke} /><rect x="6" y="13" width="18" height="22" fill={fill} opacity="0.4" /><rect x="30" y="13" width="18" height="22" fill={fill} opacity="0.7" /></>)
    case 'matrix-2x2': return svg(<><line x1="27" y1="6" x2="27" y2="42" stroke={stroke} /><line x1="6" y1="24" x2="48" y2="24" stroke={stroke} /></>)
    case 'quadrant': return svg(<><line x1="27" y1="6" x2="27" y2="42" stroke={stroke} /><line x1="6" y1="24" x2="48" y2="24" stroke={stroke} /><circle cx="16" cy="32" r="2" fill={stroke} /><circle cx="36" cy="16" r="2" fill={stroke} /><circle cx="20" cy="18" r="2" fill={stroke} /></>)
    case 'data': return svg(<><rect x="6" y="6" width="42" height="3" fill={stroke} /><text x="8" y="28" fontSize="11" fontWeight="800" fill={stroke}>85%</text><text x="22" y="28" fontSize="11" fontWeight="800" fill={stroke}>3.2×</text><text x="36" y="28" fontSize="9" fontWeight="800" fill={stroke}>¥1M</text></>)
    case 'kpi-board': return svg(<><rect x="4" y="14" width="13" height="12" fill={fill} opacity="0.5" /><rect x="19" y="14" width="13" height="12" fill={fill} opacity="0.5" /><rect x="34" y="14" width="13" height="12" fill={fill} opacity="0.5" /><rect x="4" y="28" width="13" height="12" fill={fill} opacity="0.5" /><rect x="19" y="28" width="13" height="12" fill={fill} opacity="0.5" /><rect x="34" y="28" width="13" height="12" fill={fill} opacity="0.5" /></>)
    case 'chart-bar': return svg(<><rect x="6" y="6" width="42" height="3" fill={stroke} /><rect x="6" y="14" width="32" height="4" fill={stroke} /><rect x="6" y="22" width="24" height="4" fill={fill} /><rect x="6" y="30" width="18" height="4" fill={fill} /><rect x="6" y="38" width="10" height="4" fill={fill} /></>)
    case 'table': return svg(<><line x1="6" y1="10" x2="48" y2="10" stroke={stroke} /><line x1="6" y1="20" x2="48" y2="20" stroke={stroke} /><line x1="6" y1="30" x2="48" y2="30" stroke={stroke} /><line x1="6" y1="40" x2="48" y2="40" stroke={stroke} /><line x1="20" y1="6" x2="20" y2="42" stroke={stroke} /><line x1="34" y1="6" x2="34" y2="42" stroke={stroke} /></>)
    case 'process': return svg(<><rect x="4" y="20" width="12" height="10" fill={fill} /><rect x="20" y="20" width="12" height="10" fill={fill} /><rect x="36" y="20" width="12" height="10" fill={fill} /><path d="M16 25 L20 25" stroke={stroke} /><path d="M32 25 L36 25" stroke={stroke} /></>)
    case 'timeline': return svg(<><line x1="6" y1="24" x2="48" y2="24" stroke={stroke} strokeWidth="2" /><circle cx="12" cy="24" r="2.5" fill={stroke} /><circle cx="22" cy="24" r="2.5" fill={stroke} /><circle cx="32" cy="24" r="2.5" fill={stroke} /><circle cx="42" cy="24" r="2.5" fill={stroke} /></>)
    case 'roadmap': return svg(<><rect x="4" y="10" width="13" height="6" fill={fill} /><rect x="20" y="18" width="20" height="6" fill={fill} /><rect x="32" y="26" width="13" height="6" fill={fill} /></>)
    case 'causality': return svg(<><circle cx="10" cy="24" r="4" fill={fill} /><path d="M14 24 L22 24" stroke={stroke} /><circle cx="26" cy="24" r="4" fill={fill} /><path d="M30 24 L38 24" stroke={stroke} /><circle cx="42" cy="24" r="4" fill={stroke} /></>)
    case 'case-study': return svg(<><rect x="6" y="6" width="42" height="3" fill={stroke} /><rect x="6" y="14" width="20" height="22" fill={fill} opacity="0.4" /><rect x="30" y="14" width="18" height="4" fill={fill} /><rect x="30" y="22" width="18" height="4" fill={fill} /><rect x="30" y="30" width="18" height="6" fill={stroke} /></>)
    case 'persona': return svg(<><circle cx="14" cy="20" r="7" fill={fill} /><rect x="26" y="14" width="22" height="3" fill={stroke} /><rect x="26" y="20" width="22" height="2" fill={fill} /><rect x="26" y="26" width="18" height="2" fill={fill} /><rect x="6" y="36" width="42" height="4" fill={fill} opacity="0.4" /></>)
    case 'diagram': return svg(<><circle cx="14" cy="14" r="4" fill={fill} /><circle cx="40" cy="14" r="4" fill={fill} /><circle cx="27" cy="34" r="4" fill={fill} /><path d="M14 14 L27 34" stroke={stroke} /><path d="M40 14 L27 34" stroke={stroke} /><path d="M14 14 L40 14" stroke={stroke} /></>)
    default: return svg(<rect x="6" y="6" width="42" height="36" fill={fill} />)
  }
}

function svg(children: React.ReactNode) {
  return (
    <svg viewBox="0 0 54 48" width="54" height="48" className="rounded bg-stone-50 border border-stone-200 group-hover:bg-white">
      {children}
    </svg>
  )
}
