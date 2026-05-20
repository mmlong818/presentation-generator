'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useEditorStore } from '@/lib/editor/store'
import { deckToEditor } from '@/lib/editor/compose'
import { useT } from '@/lib/i18n'
import { FIXTURES, fixtureByKey } from '@/lib/editor/test-fixtures'
import type { Deck, LayoutType, Slide } from '@/lib/types'
import type { ImageElement, TextElement } from '@/lib/editor/types'

const SlideCanvas = dynamic(() => import('@/components/editor/SlideCanvas'), { ssr: false })
const SlideThumbnail = dynamic(() => import('@/components/editor/SlideThumbnail'), { ssr: false })
const Inspector = dynamic(() => import('@/components/editor/Inspector'), { ssr: false })
const LayoutPicker = dynamic(() => import('@/components/editor/LayoutPicker'), { ssr: false })
const IconPicker = dynamic(() => import('@/components/editor/IconPicker'), { ssr: false })
const RewriteSlideModal = dynamic(() => import('@/components/editor/RewriteSlideModal'), { ssr: false })

const DECK_STORAGE = 'pg_last_deck'

/** Hand-crafted fixtures for visual layout testing (no AI required). */
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
    return { ...base, slides: [{
      type: 'cover',
      eyebrow: 'A TALK · 2026',
      title: '如果 AI 已经会做所有作业，我们为什么还要教孩子做作业？',
      highlight: '为什么还要',
      subtitle: '一场关于教育的紧急对话',
    }] }
  }
  if (name === 'statement') {
    return { ...base, slides: [{
      type: 'statement',
      title: 'AI 不会让孩子失业，会让没学会用 AI 的孩子失业。',
      highlight: ['失业'],
      align: 'center',
    }] }
  }
  if (name === 'argument') {
    return { ...base, slides: [{
      type: 'argument', eyebrow: '三个事实', heading: '为什么现在必须谈这件事',
      highlight: '现在',
      points: [
        '市场窗口期短，今年错过明年就被锁死',
        '技术成熟度刚好够用，再等就是落后',
        '团队能力匹配，现在做最不挣扎',
      ],
    }] }
  }
  if (name === 'process') {
    return { ...base, slides: [{
      type: 'process', eyebrow: '执行三步', heading: '从想法到落地，只需要三步',
      steps: [
        { title: '观察现状', desc: '走出去看真实用户场景，避开自我臆测' },
        { title: '提出假设', desc: '把直觉写成可验证的命题，限定边界条件' },
        { title: '验证迭代', desc: '最小可行原型 → 真实反馈 → 决策保留或调整' },
      ],
    }] }
  }
  if (name === 'process4') {
    return { ...base, slides: [{
      type: 'process', eyebrow: '执行四步', heading: '从想法到落地的完整路径',
      steps: [
        { title: '观察', desc: '走出去看用户实际行为' },
        { title: '提案', desc: '写下可验证的假设和指标' },
        { title: '原型', desc: '最低成本拼出可触摸版本' },
        { title: '验证', desc: '真实环境跑数据，做去留决策' },
      ],
    }] }
  }
  if (name === 'quote') {
    return { ...base, slides: [{
      type: 'quote',
      quote: '唯一持久的竞争优势，是比对手学习更快的能力。',
      source: 'Arie de Geus', highlight: '学习更快',
    }] }
  }
  if (name === 'compare') {
    return { ...base, slides: [{
      type: 'compare', eyebrow: '路径选择', heading: '旧方式 vs 新方式',
      left: { title: '旧方式', items: ['人工跟踪订单状态', '周级报告，结果滞后', '事后归因，难闭环'] },
      right: { title: '新方式', items: ['自动监测全链路', '实时仪表盘可见', '因果推断 + 自动 A/B'] },
    }] }
  }
  if (name === 'data') {
    return { ...base, slides: [{
      type: 'data', eyebrow: '关键指标', heading: '三个数字告诉你为什么',
      stats: [
        { value: '85%', label: '用户留存率', source: '内部统计 2026 Q1' },
        { value: '3.2×', label: '效率提升' },
        { value: '¥120万', label: '年化节省成本', source: '财务模型测算' },
      ],
    }] }
  }
  if (name === 'argument5') {
    return { ...base, slides: [{
      type: 'argument', eyebrow: '五个事实', heading: '为什么现在必须谈这件事',
      highlight: '现在',
      points: [
        '市场窗口期短，今年错过明年就被锁死',
        '技术成熟度刚好够用，再等就是落后',
        '团队能力匹配，现在做最不挣扎',
        '资金成本处于历史低点，机会成本可控',
        '竞争尚未白热化，先发者拥有差异空间',
      ],
    }] }
  }
  return { ...base, slides: [{ type: 'statement', title: `未知 fixture: ${name}` }] }
}

export default function DeckPage() {
  const presentation = useEditorStore(s => s.presentation)
  const currentSlide = useEditorStore(s => s.currentSlide)
  const selectedElementId = useEditorStore(s => s.selectedElementId)
  const setPresentation = useEditorStore(s => s.setPresentation)
  const setCurrentSlide = useEditorStore(s => s.setCurrentSlide)
  const addSlide = useEditorStore(s => s.addSlide)
  const removeSlide = useEditorStore(s => s.removeSlide)
  const reorderSlides = useEditorStore(s => s.reorderSlides)
  const duplicateSlide = useEditorStore(s => s.duplicateSlide)
  const insertSlideOfType = useEditorStore(s => s.insertSlideOfType)
  const changeSlideLayout = useEditorStore(s => s.changeSlideLayout)
  const replaceSlideSource = useEditorStore(s => s.replaceSlideSource)
  const removeElement = useEditorStore(s => s.removeElement)
  const removeSelected = useEditorStore(s => s.removeSelected)
  const nudgeSelected = useEditorStore(s => s.nudgeSelected)
  const duplicateSelected = useEditorStore(s => s.duplicateSelected)
  const selectAll = useEditorStore(s => s.selectAll)
  const selectedIds = useEditorStore(s => s.selectedElementIds)
  const addElement = useEditorStore(s => s.addElement)
  const selectElement = useEditorStore(s => s.selectElement)
  const undo = useEditorStore(s => s.undo)
  const redo = useEditorStore(s => s.redo)
  const [loadError, setLoadError] = useState<string | null>(null)
  const canvasWrapRef = useRef<HTMLDivElement>(null)
  const [canvasWidth, setCanvasWidth] = useState(960)
  const [dragFrom, setDragFrom] = useState<number | null>(null)
  const [pickerMode, setPickerMode] = useState<'insert' | 'change' | null>(null)
  const [iconPickerOpen, setIconPickerOpen] = useState(false)
  const [rewriteOpen, setRewriteOpen] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const exportMenuRef = useRef<HTMLDivElement>(null)

  // Click outside closes the export dropdown
  useEffect(() => {
    if (!exportOpen) return
    function onDocClick(e: MouseEvent) {
      if (!exportMenuRef.current?.contains(e.target as Node)) setExportOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setExportOpen(false)
    }
    document.addEventListener('mousedown', onDocClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDocClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [exportOpen])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { t, locale, setLocale } = useT()

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const fixture = params.get('fixture')
      const fx = params.get('fx')           // new: rich named fixture
      const fxAll = params.get('fxAll')     // new: all 21 layouts as one deck
      const themeOverride = params.get('theme') as Deck['theme'] | null

      // ?fx=cover.long&theme=midnight-luxe → single-slide rich fixture
      if (fx) {
        const meta = fixtureByKey(fx)
        if (!meta) { setLoadError(`未知 fixture key: ${fx}`); return }
        const deck: Deck = {
          title: meta.label, theme: themeOverride ?? 'modern-minimal', framework: 'duarte',
          brief: { topic: meta.label, audience: 'test', goal: 'visual', durationMin: 1 },
          script: [], createdAt: new Date().toISOString(),
          slides: [meta.slide],
        }
        setPresentation(deckToEditor(deck))
        return
      }

      // ?fxAll=normal → all 21 layouts (normal category) as one deck
      if (fxAll) {
        const cat = fxAll as 'normal' | 'stress' | 'edge' | 'all'
        const picked = FIXTURES.filter(f => cat === 'all' || f.category === cat)
        // ensure one per layout when cat=='normal'
        const seen = new Set<Slide['type']>()
        const slides: Slide[] = []
        for (const f of picked) {
          if (cat === 'normal' && seen.has(f.layoutType)) continue
          seen.add(f.layoutType)
          slides.push(f.slide)
        }
        const deck: Deck = {
          title: `Matrix · ${cat}`, theme: themeOverride ?? 'modern-minimal', framework: 'duarte',
          brief: { topic: 'matrix', audience: 'test', goal: 'visual', durationMin: 30 },
          script: [], createdAt: new Date().toISOString(),
          slides,
        }
        setPresentation(deckToEditor(deck))
        return
      }

      if (fixture) {
        const deck = makeFixtureDeck(fixture, themeOverride)
        setPresentation(deckToEditor(deck))
        return
      }
      const raw = localStorage.getItem(DECK_STORAGE)
      if (!raw) {
        setLoadError('还没有生成 deck。回主页填写需求生成一份，或试 ?fixture=cover / ?fx=cover.long / ?fxAll=normal 查看示例。')
        return
      }
      const deck = JSON.parse(raw) as Deck
      if (themeOverride) deck.theme = themeOverride
      setPresentation(deckToEditor(deck))
    } catch (e) {
      setLoadError(`deck 解析失败：${e instanceof Error ? e.message : String(e)}`)
    }
  }, [setPresentation])

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

  // Keyboard shortcuts
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName
      const isFormField = tag === 'INPUT' || tag === 'TEXTAREA' || (e.target as HTMLElement)?.isContentEditable
      const ctrl = e.ctrlKey || e.metaKey

      if (ctrl && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault(); undo(); return
      }
      if ((ctrl && e.key.toLowerCase() === 'y') || (ctrl && e.shiftKey && e.key.toLowerCase() === 'z')) {
        e.preventDefault(); redo(); return
      }
      if (isFormField) return

      // Ctrl/Cmd+A — select all elements on current slide
      if (ctrl && e.key.toLowerCase() === 'a') {
        e.preventDefault(); selectAll(); return
      }
      // Ctrl/Cmd+D — duplicate selected elements
      if (ctrl && e.key.toLowerCase() === 'd') {
        e.preventDefault(); duplicateSelected(); return
      }

      if (e.key === 'Escape') { selectElement(null); return }
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedIds.length > 0) {
        e.preventDefault()
        removeSelected()
        return
      }

      // Arrow keys with selection → nudge; without selection → switch slide.
      if (selectedIds.length > 0) {
        const step = e.shiftKey ? 20 : 2
        if (e.key === 'ArrowLeft')  { e.preventDefault(); nudgeSelected(-step, 0); return }
        if (e.key === 'ArrowRight') { e.preventDefault(); nudgeSelected(step, 0);  return }
        if (e.key === 'ArrowUp')    { e.preventDefault(); nudgeSelected(0, -step); return }
        if (e.key === 'ArrowDown')  { e.preventDefault(); nudgeSelected(0, step);  return }
      } else {
        if (e.key === 'ArrowDown' && presentation && currentSlide < presentation.slides.length - 1) {
          e.preventDefault(); setCurrentSlide(currentSlide + 1)
        }
        if (e.key === 'ArrowUp' && currentSlide > 0) {
          e.preventDefault(); setCurrentSlide(currentSlide - 1)
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [undo, redo, selectedIds, removeSelected, nudgeSelected, duplicateSelected, selectAll, selectElement, presentation, currentSlide, setCurrentSlide])

  function handleImageFile(file: File) {
    if (!file.type.startsWith('image/')) return
    if (file.size > 8 * 1024 * 1024) { alert('图片过大（>8MB）'); return }
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      const el: ImageElement = {
        id: `i_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        type: 'image',
        x: 200, y: 200, w: 800, h: 600,
        src,
      }
      addElement(el)
    }
    reader.readAsDataURL(file)
  }

  function handleAddText() {
    const el: TextElement = {
      id: `t_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
      type: 'text',
      x: 240, y: 480, w: 1400, h: 120,
      text: '点击此处编辑文字',
      fontSize: 64,
      fontFamily: '"Inter","PingFang SC",sans-serif',
      fontWeight: 700,
      color: '#0a0a0a',
      align: 'left',
      lineHeight: 1.25,
      role: 'body',
    }
    addElement(el)
  }

  async function handleExport() {
    if (!presentation) return
    try {
      const mod = await import('@/lib/editor/export/pptx')
      await mod.exportPPTX(presentation)
    } catch (e) {
      alert(`导出失败：${e instanceof Error ? e.message : String(e)}`)
    }
  }

  async function handleExportHTML() {
    if (!presentation) return
    const mod = await import('@/lib/editor/export/html')
    mod.downloadHTML(presentation)
  }

  async function handleExportPDF() {
    if (!presentation) return
    const mod = await import('@/lib/editor/export/pdf')
    mod.exportPDF(presentation)
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
    return <main className="min-h-screen flex items-center justify-center text-stone-500">加载编辑器…</main>
  }

  return (
    <div className="flex h-screen bg-stone-100">
      {/* Left sidebar: slide list */}
      <aside className="w-[230px] border-r border-stone-200 bg-white overflow-y-auto flex flex-col">
        <header className="p-3 border-b border-stone-200 flex items-center gap-2 text-sm">
          <Link href="/" className="text-stone-600 hover:text-stone-900" aria-label={t('common.back')}>←</Link>
          <span className="font-semibold truncate flex-1" title={presentation.title}>{presentation.title}</span>
          <button onClick={() => setLocale(locale === 'zh' ? 'en' : 'zh')}
            className="text-[10px] uppercase text-stone-500 hover:text-stone-900 border border-stone-200 rounded px-1.5 py-0.5"
            aria-label="Toggle language"
            title="语言 / Language">{locale === 'zh' ? 'EN' : '中'}</button>
        </header>
        <div className="p-2 border-b border-stone-200 flex items-center gap-1" role="toolbar" aria-label="Slide management">
          <button onClick={() => setPickerMode('insert')}
            className="flex-1 text-xs px-2 py-1.5 rounded bg-stone-900 text-white hover:bg-stone-800"
            aria-label={t('deck.new_layout')}
            title="选版式新增 slide">+ {t('deck.new_layout')}</button>
          <button onClick={() => addSlide()}
            className="text-xs px-2 py-1.5 rounded border border-stone-300 hover:bg-stone-50"
            aria-label={t('deck.blank')}
            title="新增空白 slide">{t('deck.blank')}</button>
          <button onClick={() => duplicateSlide(currentSlide)}
            className="text-xs px-2 py-1.5 rounded border border-stone-300 hover:bg-stone-50"
            aria-label={t('deck.duplicate')}
            title="复制当前 slide">⎘</button>
        </div>
        <div className="p-3 flex flex-col gap-2" role="listbox" aria-label="Slides">
          {presentation.slides.map((slide, i) => (
            <div
              key={slide.id}
              className={`flex items-stretch gap-2 group ${dragFrom === i ? 'opacity-50' : ''}`}
              draggable
              onDragStart={() => setDragFrom(i)}
              onDragOver={(e) => { e.preventDefault() }}
              onDrop={() => {
                if (dragFrom !== null && dragFrom !== i) reorderSlides(dragFrom, i)
                setDragFrom(null)
              }}
              onDragEnd={() => setDragFrom(null)}
            >
              <div className="text-xs text-stone-400 w-6 text-right shrink-0 pt-2 cursor-grab" title="拖拽重排">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <SlideThumbnail
                  slide={slide}
                  width={160}
                  isActive={i === currentSlide}
                  onClick={() => setCurrentSlide(i)}
                />
              </div>
              <div className="flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition">
                <button onClick={() => removeSlide(i)}
                  disabled={presentation.slides.length <= 1}
                  className="text-xs w-5 h-5 rounded text-red-600 hover:bg-red-50 disabled:opacity-30 leading-none"
                  title="删除">✕</button>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Center: canvas */}
      <main className="flex-1 flex flex-col">
        <header className="px-4 py-2 border-b border-stone-200 bg-white flex items-center gap-3 text-sm">
          <span className="text-stone-500">{currentSlide + 1} / {presentation.slides.length}</span>
          <span className="text-stone-400">·</span>
          <span className="text-stone-500">主题：{presentation.theme}</span>
          <span className="text-stone-400">·</span>
          <button onClick={() => setRewriteOpen(true)}
            className="px-2.5 py-1 text-xs rounded border border-stone-300 hover:bg-stone-50"
            title="LLM 重写本张 slide">✨ 重写</button>
          <button onClick={handleAddText}
            className="px-2.5 py-1 text-xs rounded border border-stone-300 hover:bg-stone-50"
            title="新增文本元素">+ 文本</button>
          <button onClick={() => fileInputRef.current?.click()}
            className="px-2.5 py-1 text-xs rounded border border-stone-300 hover:bg-stone-50"
            title="插入图片元素">+ 图片</button>
          <button onClick={() => setIconPickerOpen(true)}
            className="px-2.5 py-1 text-xs rounded border border-stone-300 hover:bg-stone-50"
            title="插入图标 (Lucide)">+ 图标</button>
          <input ref={fileInputRef} type="file" accept="image/*" hidden
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f); e.target.value = '' }} />
          <div className="ml-auto flex items-center gap-2">
            <button onClick={() => undo()} className="px-2.5 py-1 text-xs rounded border border-stone-300 hover:bg-stone-50" title="撤销 (Ctrl+Z)">↶ 撤销</button>
            <button onClick={() => redo()} className="px-2.5 py-1 text-xs rounded border border-stone-300 hover:bg-stone-50" title="重做 (Ctrl+Y)">↷ 重做</button>
            <Link href={`/present/${encodeURIComponent(presentation.id)}`}
              className="px-3 py-1.5 text-xs rounded border border-stone-300 hover:bg-stone-50">▶ 演讲</Link>
            <div ref={exportMenuRef} className="relative">
              <button
                onClick={() => setExportOpen(v => !v)}
                aria-haspopup="menu"
                aria-expanded={exportOpen}
                className="px-3 py-1.5 text-xs rounded bg-stone-900 text-white hover:bg-stone-800"
              >导出 {exportOpen ? '▴' : '▾'}</button>
              {exportOpen && (
                <div role="menu" className="absolute right-0 top-full bg-white border border-stone-200 rounded shadow-lg z-50 min-w-[160px] py-1">
                  <button onClick={() => { setExportOpen(false); handleExport() }}
                    role="menuitem"
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-stone-50">PPTX</button>
                  <button onClick={() => { setExportOpen(false); handleExportHTML() }}
                    role="menuitem"
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-stone-50">HTML 自包含</button>
                  <button onClick={() => { setExportOpen(false); handleExportPDF() }}
                    role="menuitem"
                    className="block w-full text-left px-3 py-2 text-xs hover:bg-stone-50">PDF (浏览器打印)</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div ref={canvasWrapRef} className="flex-1 flex items-center justify-center p-6 overflow-auto"
          onDragOver={(e) => { e.preventDefault() }}
          onDrop={(e) => {
            e.preventDefault()
            const f = e.dataTransfer?.files?.[0]
            if (f) handleImageFile(f)
          }}
        >
          <div style={{ width: Math.min(canvasWidth - 48, 1400), boxShadow: '0 10px 40px rgba(0,0,0,0.08)' }}>
            <SlideCanvas width={Math.min(canvasWidth - 48, 1400)} />
          </div>
        </div>
      </main>

      {/* Right: Inspector */}
      <Inspector />

      {iconPickerOpen && (
        <IconPicker
          open
          onClose={() => setIconPickerOpen(false)}
          onPick={(svgDataUrl, name) => {
            const el: ImageElement = {
              id: `i_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
              type: 'image',
              x: 900, y: 460, w: 160, h: 160,
              src: svgDataUrl,
            }
            addElement(el)
          }}
        />
      )}

      {pickerMode && (
        <LayoutPicker
          open
          mode={pickerMode}
          onClose={() => setPickerMode(null)}
          onPick={(type: LayoutType) => {
            if (pickerMode === 'insert') insertSlideOfType(currentSlide, type)
            else changeSlideLayout(currentSlide, type)
          }}
        />
      )}

      {rewriteOpen && presentation && (() => {
        // Reconstruct a Deck shape from the editor state so the API has full context.
        const deckShape = {
          title: presentation.title,
          theme: presentation.theme,
          framework: 'duarte' as const,
          brief: { topic: presentation.title, audience: '', goal: '', durationMin: presentation.slides.length },
          script: [],
          createdAt: new Date().toISOString(),
          slides: presentation.slides.map(s => s.source).filter(Boolean),
        } as any
        return (
          <RewriteSlideModal
            open
            deck={deckShape}
            slideIndex={currentSlide}
            onClose={() => setRewriteOpen(false)}
            onApply={(newSlide) => replaceSlideSource(currentSlide, newSlide)}
          />
        )
      })()}
    </div>
  )
}
