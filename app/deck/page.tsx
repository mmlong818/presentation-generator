'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEditorStore } from '@/lib/editor/store'
import { deckToEditor } from '@/lib/editor/compose'
import type { Deck } from '@/lib/types'

// Konva needs `window`; lazy-load these client-only.
const SlideCanvas = dynamic(() => import('@/components/editor/SlideCanvas'), { ssr: false })
const SlideThumbnail = dynamic(() => import('@/components/editor/SlideThumbnail'), { ssr: false })

const DECK_STORAGE = 'pg_last_deck'
const CANVAS_W = 1920

/** Minimal hand-crafted fixtures for testing individual layouts visually. */
function makeFixtureDeck(name: string, themeOverride?: Deck['theme'] | null): Deck {
  const theme: Deck['theme'] = themeOverride ?? 'modern-minimal'
  const base: Omit<Deck, 'slides'> = {
    title: '示例：演讲材料生成器',
    theme,
    framework: 'duarte',
    brief: { topic: '示例', audience: '内部演示', goal: '验证版式', durationMin: 5 },
    script: [],
    createdAt: new Date().toISOString(),
  }
  if (name === 'cover') {
    return {
      ...base,
      slides: [{
        type: 'cover',
        eyebrow: 'A TALK · 2026',
        title: '如果 AI 已经会做所有作业，我们为什么还要教孩子做作业？',
        highlight: '为什么还要',
        subtitle: '一场关于教育的紧急对话',
      }],
    }
  }
  if (name === 'statement') {
    return {
      ...base,
      slides: [{
        type: 'statement',
        title: 'AI 不会让孩子失业，会让没学会用 AI 的孩子失业。',
        highlight: ['失业'],
        align: 'center',
      }],
    }
  }
  if (name === 'argument') {
    return {
      ...base,
      slides: [{
        type: 'argument',
        eyebrow: '三个事实',
        heading: '为什么现在必须谈这件事',
        highlight: '现在',
        points: [
          '市场窗口期短，今年错过明年就被锁死',
          '技术成熟度刚好够用，再等就是落后',
          '团队能力匹配，现在做最不挣扎',
        ],
      }],
    }
  }
  if (name === 'process') {
    return {
      ...base,
      slides: [{
        type: 'process',
        eyebrow: '执行三步',
        heading: '从想法到落地，只需要三步',
        steps: [
          { title: '观察现状', desc: '走出去看真实用户场景，避开自我臆测' },
          { title: '提出假设', desc: '把直觉写成可验证的命题，限定边界条件' },
          { title: '验证迭代', desc: '最小可行原型 → 真实反馈 → 决策保留或调整' },
        ],
      }],
    }
  }
  if (name === 'process4') {
    return {
      ...base,
      slides: [{
        type: 'process',
        eyebrow: '执行四步',
        heading: '从想法到落地的完整路径',
        steps: [
          { title: '观察', desc: '走出去看用户实际行为' },
          { title: '提案', desc: '写下可验证的假设和指标' },
          { title: '原型', desc: '最低成本拼出可触摸版本' },
          { title: '验证', desc: '真实环境跑数据，做去留决策' },
        ],
      }],
    }
  }
  if (name === 'quote') {
    return {
      ...base,
      slides: [{
        type: 'quote',
        quote: '唯一持久的竞争优势，是比对手学习更快的能力。',
        source: 'Arie de Geus',
        highlight: '学习更快',
      }],
    }
  }
  if (name === 'compare') {
    return {
      ...base,
      slides: [{
        type: 'compare',
        eyebrow: '路径选择',
        heading: '旧方式 vs 新方式',
        left: { title: '旧方式', items: ['人工跟踪订单状态', '周级报告，结果滞后', '事后归因，难闭环'] },
        right: { title: '新方式', items: ['自动监测全链路', '实时仪表盘可见', '因果推断 + 自动 A/B'] },
      }],
    }
  }
  if (name === 'data') {
    return {
      ...base,
      slides: [{
        type: 'data',
        eyebrow: '关键指标',
        heading: '三个数字告诉你为什么',
        stats: [
          { value: '85%', label: '用户留存率', source: '内部统计 2026 Q1' },
          { value: '3.2×', label: '效率提升' },
          { value: '¥120万', label: '年化节省成本', source: '财务模型测算' },
        ],
      }],
    }
  }
  if (name === 'argument5') {
    return {
      ...base,
      slides: [{
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
      }],
    }
  }
  // Unknown fixture: return a single statement slide so /deck still renders.
  return {
    ...base,
    slides: [{ type: 'statement', title: `未知 fixture: ${name}` }],
  }
}

export default function DeckPage() {
  console.log('[deck] component render')
  const presentation = useEditorStore(s => s.presentation)
  const currentSlide = useEditorStore(s => s.currentSlide)
  const setPresentation = useEditorStore(s => s.setPresentation)
  const setCurrentSlide = useEditorStore(s => s.setCurrentSlide)
  const undo = useEditorStore(s => s.undo)
  const redo = useEditorStore(s => s.redo)
  const [loadError, setLoadError] = useState<string | null>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const [canvasWidth, setCanvasWidth] = useState(960)

  // Load deck from localStorage on mount.
  // Supports ?fixture=cover for layout-by-layout testing without running AI.
  useEffect(() => {
    console.log('[deck] load effect running, search =', window.location.search)
    try {
      const params = new URLSearchParams(window.location.search)
      const fixture = params.get('fixture')
      const themeOverride = params.get('theme') as Deck['theme'] | null

      if (fixture) {
        console.log('[deck] using fixture', fixture, themeOverride)
        const deck = makeFixtureDeck(fixture, themeOverride)
        const ep = deckToEditor(deck)
        console.log('[deck] composed', ep.slides.length, 'slides')
        setPresentation(ep)
        return
      }
      const raw = localStorage.getItem(DECK_STORAGE)
      if (!raw) {
        setLoadError('还没有生成 deck。回主页填写需求生成一份，或试 ?fixture=cover 查看示例。')
        return
      }
      const deck = JSON.parse(raw) as Deck
      if (themeOverride) deck.theme = themeOverride
      setPresentation(deckToEditor(deck))
    }
    catch (e) {
      setLoadError(`deck 解析失败：${e instanceof Error ? e.message : String(e)}`)
    }
  }, [setPresentation])

  // Resize observer for the canvas
  useEffect(() => {
    if (!canvasWrapRef.current) return
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = entry.contentRect.width
        if (w > 100) setCanvasWidth(Math.floor(w))
      }
    })
    ro.observe(canvasWrapRef.current)
    return () => ro.disconnect()
  }, [])

  // Keyboard shortcuts: Ctrl+Z / Ctrl+Y
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const ctrl = e.ctrlKey || e.metaKey
      if (ctrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if ((ctrl && e.key.toLowerCase() === 'y') || (ctrl && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo])

  async function handleExport() {
    if (!presentation) return
    try {
      const mod = await import('@/lib/editor/export/pptx')
      await mod.exportPPTX(presentation)
    }
    catch (e) {
      alert(`导出失败：${e instanceof Error ? e.message : String(e)}`)
    }
  }

  if (loadError) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center p-8">
        <p className="text-stone-700 mb-4">{loadError}</p>
        <Link href="/" className="px-4 py-2 bg-stone-900 text-white rounded">回主页</Link>
      </main>
    )
  }

  if (!presentation) {
    return (
      <main className="min-h-screen flex items-center justify-center text-stone-500">加载编辑器…</main>
    )
  }

  return (
    <div className="flex h-screen bg-stone-100">
      {/* Left sidebar: slide list */}
      <aside className="w-[220px] border-r border-stone-200 bg-white overflow-y-auto flex flex-col">
        <header className="p-3 border-b border-stone-200 flex items-center gap-2 text-sm">
          <Link href="/" className="text-stone-600 hover:text-stone-900">←</Link>
          <span className="font-semibold truncate" title={presentation.title}>{presentation.title}</span>
        </header>
        <div className="p-3 flex flex-col gap-2">
          {presentation.slides.map((slide, i) => (
            <div key={slide.id} className="flex items-center gap-2">
              <div className="text-xs text-stone-400 w-6 text-right shrink-0">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <SlideThumbnail
                  slide={slide}
                  width={170}
                  isActive={i === currentSlide}
                  onClick={() => setCurrentSlide(i)}
                />
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Center: canvas */}
      <main className="flex-1 flex flex-col">
        <header className="px-4 py-2 border-b border-stone-200 bg-white flex items-center gap-3 text-sm">
          <span className="text-stone-500">
            {currentSlide + 1} / {presentation.slides.length}
          </span>
          <span className="text-stone-400">·</span>
          <span className="text-stone-500">主题：{presentation.theme}</span>
          <div className="ml-auto flex items-center gap-2">
            <button
              onClick={() => undo()}
              className="px-2.5 py-1 text-xs rounded border border-stone-300 hover:bg-stone-50"
              title="撤销 (Ctrl+Z)"
            >↶ 撤销</button>
            <button
              onClick={() => redo()}
              className="px-2.5 py-1 text-xs rounded border border-stone-300 hover:bg-stone-50"
              title="重做 (Ctrl+Y)"
            >↷ 重做</button>
            <button
              onClick={handleExport}
              className="px-3 py-1.5 text-xs rounded bg-stone-900 text-white hover:bg-stone-800"
            >导出 PPTX</button>
          </div>
        </header>
        <div ref={canvasWrapRef} className="flex-1 flex items-center justify-center p-6 overflow-auto">
          <div style={{ width: Math.min(canvasWidth - 48, 1400), boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
            <SlideCanvas width={Math.min(canvasWidth - 48, 1400)} />
          </div>
        </div>
      </main>
    </div>
  )
}
