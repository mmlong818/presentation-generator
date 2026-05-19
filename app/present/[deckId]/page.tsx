'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useEditorStore } from '@/lib/editor/store'
import { deckToEditor } from '@/lib/editor/compose'
import type { Deck } from '@/lib/types'
import type { EditorSlide, SlideElement } from '@/lib/editor/types'

const SlideCanvas = dynamic(() => import('@/components/editor/SlideCanvas'), { ssr: false })

const DECK_STORAGE = 'pg_last_deck'

/**
 * Fullscreen presentation mode:
 * - Arrow keys / Space / PageUp PageDown to navigate
 * - F toggles speaker view (current + next + notes + timer)
 * - Esc → back to /deck
 * - Element animations replay on slide change
 */
export default function PresentPage() {
  const presentation = useEditorStore(s => s.presentation)
  const setPresentation = useEditorStore(s => s.setPresentation)
  const setCurrentSlide = useEditorStore(s => s.setCurrentSlide)
  const [idx, setIdx] = useState(0)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [speakerView, setSpeakerView] = useState(false)
  const [startedAt] = useState(() => Date.now())
  const [now, setNow] = useState(Date.now())
  const wrapRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(1280)
  const [animationKey, setAnimationKey] = useState(0)

  // Load deck (fixture or localStorage)
  useEffect(() => {
    if (presentation) return
    try {
      const params = new URLSearchParams(window.location.search)
      const fixture = params.get('fixture')
      const themeOverride = params.get('theme') as Deck['theme'] | null
      if (fixture) {
        const mod = require('../../deck/page') as any
        if (mod.makeFixtureDeck) {
          setPresentation(deckToEditor(mod.makeFixtureDeck(fixture, themeOverride)))
          return
        }
      }
      const raw = localStorage.getItem(DECK_STORAGE)
      if (!raw) { setLoadError('找不到 deck。回 /deck 生成。'); return }
      const deck = JSON.parse(raw) as Deck
      setPresentation(deckToEditor(deck))
    } catch (e) {
      setLoadError(e instanceof Error ? e.message : '加载失败')
    }
  }, [presentation, setPresentation])

  // Keep editor store in sync for SlideCanvas
  useEffect(() => {
    setCurrentSlide(idx)
    setAnimationKey(k => k + 1)
  }, [idx, setCurrentSlide])

  // Container resize
  useEffect(() => {
    if (!wrapRef.current) return
    const ro = new ResizeObserver(entries => {
      for (const e of entries) {
        const w = e.contentRect.width
        if (w > 100) setContainerW(Math.floor(w))
      }
    })
    ro.observe(wrapRef.current)
    return () => ro.disconnect()
  }, [])

  // Timer
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 500)
    return () => clearInterval(i)
  }, [])

  // Keyboard
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!presentation) return
      const last = presentation.slides.length - 1
      if (e.key === 'Escape') {
        // Exit fullscreen if active, else navigate back.
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {})
        else window.location.href = '/deck'
        return
      }
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
        e.preventDefault(); setIdx(i => Math.min(last, i + 1)); return
      }
      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault(); setIdx(i => Math.max(0, i - 1)); return
      }
      if (e.key === 'Home') { setIdx(0); return }
      if (e.key === 'End') { setIdx(last); return }
      if (e.key.toLowerCase() === 'f') { setSpeakerView(v => !v); return }
      if (e.key.toLowerCase() === 'p') {
        // Request fullscreen
        const el = wrapRef.current?.parentElement
        if (el && !document.fullscreenElement) el.requestFullscreen().catch(() => {})
        return
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [presentation])

  if (loadError) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
        <p className="text-stone-300 mb-4">{loadError}</p>
        <Link href="/deck" className="px-4 py-2 bg-white text-black rounded">回 /deck</Link>
      </main>
    )
  }
  if (!presentation) {
    return <main className="min-h-screen flex items-center justify-center bg-black text-stone-400">加载中…</main>
  }

  const slide = presentation.slides[idx]
  const next = presentation.slides[idx + 1]
  const elapsed = Math.floor((now - startedAt) / 1000)
  const mm = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const ss = String(elapsed % 60).padStart(2, '0')

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Top bar: only show when not fullscreen */}
      <header className="flex items-center justify-between px-4 py-2 text-xs text-stone-400 border-b border-stone-800">
        <Link href="/deck" className="hover:text-white">← 回编辑</Link>
        <div>{idx + 1} / {presentation.slides.length} · 计时 {mm}:{ss}</div>
        <div className="flex items-center gap-3">
          <button onClick={() => setSpeakerView(v => !v)} className="hover:text-white">{speakerView ? '关闭演讲者视图' : '演讲者视图 (F)'}</button>
          <button onClick={() => wrapRef.current?.parentElement?.requestFullscreen()} className="hover:text-white">全屏 (P)</button>
        </div>
      </header>

      <div className="flex-1 flex" style={{ minHeight: 0 }}>
        {/* Main slide */}
        <div ref={wrapRef} className={`flex-1 flex items-center justify-center p-6 overflow-hidden ${speakerView ? 'bg-black' : 'bg-black'}`}>
          <div style={{ width: Math.min(containerW - 48, 1600), boxShadow: '0 20px 80px rgba(255,255,255,0.05)' }}>
            <AnimatedStage key={`${slide.id}-${animationKey}`} width={Math.min(containerW - 48, 1600)} slide={slide} />
          </div>
        </div>

        {/* Speaker side panel */}
        {speakerView && (
          <aside className="w-[380px] border-l border-stone-800 p-4 flex flex-col gap-4 text-sm bg-stone-950">
            <div>
              <div className="text-[10px] uppercase tracking-widest text-stone-500 mb-2">下一张</div>
              <div className="rounded overflow-hidden border border-stone-800 bg-black">
                {next ? <SlideCanvas width={340} readOnly slide={next} /> : <div className="aspect-video flex items-center justify-center text-stone-500 text-xs">最后一张</div>}
              </div>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-widest text-stone-500 mb-2">备注</div>
              <div className="text-stone-300 text-sm whitespace-pre-wrap leading-relaxed min-h-[6rem]">
                {slide.notes?.trim() || <span className="text-stone-600">（无备注）</span>}
              </div>
            </div>
            <div className="mt-auto text-xs text-stone-500 leading-relaxed">
              ← → 翻页 · F 切换面板 · P 全屏 · Esc 退出
            </div>
          </aside>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-stone-900">
        <div className="h-full bg-white transition-all" style={{ width: `${((idx + 1) / presentation.slides.length) * 100}%` }} />
      </div>
    </div>
  )
}

/**
 * Wrap SlideCanvas and replay element animations on each mount via inline CSS.
 * We inject a <style> with @keyframes scoped to the slide id, then mark elements
 * with data-animate attribute that get the animation applied.
 */
function AnimatedStage({ width, slide }: { width: number; slide: EditorSlide }) {
  const elements = slide.elements
  // Build a CSS string for elements with animation
  const css: string[] = []
  elements.forEach((el, i) => {
    if (!el.animation || el.animation.kind === 'none') return
    const dur = el.animation.duration ?? 400
    const delay = el.animation.delay ?? i * 80
    const kf = keyframeName(el.animation.kind as string)
    css.push(`[data-anim-id="${el.id}"] { animation: ${kf} ${dur}ms ${delay}ms both cubic-bezier(0.16, 1, 0.3, 1); opacity: 0; }`)
  })
  // Generic keyframes
  const kfCss = `
    @keyframes pg-fade { from { opacity: 0 } to { opacity: 1 } }
    @keyframes pg-slide-up { from { opacity: 0; transform: translateY(40px) } to { opacity: 1; transform: translateY(0) } }
    @keyframes pg-slide-down { from { opacity: 0; transform: translateY(-40px) } to { opacity: 1; transform: translateY(0) } }
    @keyframes pg-slide-left { from { opacity: 0; transform: translateX(60px) } to { opacity: 1; transform: translateX(0) } }
    @keyframes pg-slide-right { from { opacity: 0; transform: translateX(-60px) } to { opacity: 1; transform: translateX(0) } }
    @keyframes pg-scale { from { opacity: 0; transform: scale(0.92) } to { opacity: 1; transform: scale(1) } }
    @keyframes pg-zoom { from { opacity: 0; transform: scale(1.15) } to { opacity: 1; transform: scale(1) } }
  `
  return (
    <div data-stage style={{ position: 'relative', width }}>
      <style dangerouslySetInnerHTML={{ __html: kfCss + css.join('\n') }} />
      <SlideCanvas width={width} readOnly />
      {/* Inject data-anim-id attribute on text overlays via DOM after render. */}
      <AnimationApplier slide={slide} />
    </div>
  )
}

function keyframeName(kind: string): string {
  const map: Record<string, string> = {
    fade: 'pg-fade',
    'slide-up': 'pg-slide-up',
    'slide-down': 'pg-slide-down',
    'slide-left': 'pg-slide-left',
    'slide-right': 'pg-slide-right',
    scale: 'pg-scale',
    zoom: 'pg-zoom',
  }
  return map[kind as string] ?? 'pg-fade'
}

/**
 * Walk the rendered HTML overlay and tag elements with data-anim-id based on
 * their (x, y, w, h) — matching back to the SlideElement model is brittle but
 * sufficient for v1. A future refactor should let SlideCanvas accept data
 * attributes directly.
 */
function AnimationApplier({ slide }: { slide: EditorSlide }) {
  useEffect(() => {
    const overlay = document.querySelector('[aria-label="text-overlay"]')
    if (!overlay) return
    const divs = Array.from(overlay.querySelectorAll<HTMLDivElement>(':scope > div'))
    const texts = slide.elements.filter(e => e.type === 'text' && e.animation && e.animation.kind !== 'none')
    // Match by position; both arrays preserve element insertion order.
    let textIdx = 0
    divs.forEach(div => {
      const el = slide.elements.find(e => e.type === 'text' &&
        Math.abs(parseFloat(div.style.left) - e.x) < 1 &&
        Math.abs(parseFloat(div.style.top) - e.y) < 1)
      if (el?.animation && el.animation.kind !== 'none') {
        div.setAttribute('data-anim-id', el.id)
      }
    })
  }, [slide])
  return null
}
