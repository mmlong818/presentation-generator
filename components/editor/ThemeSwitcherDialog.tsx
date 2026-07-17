'use client'

import dynamic from 'next/dynamic'
import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { visibleThemes } from '@/lib/themes'
import { resolveTheme } from '@/lib/editor/theme'
import { rethemeSlide } from '@/lib/editor/retheme'
import { CANVAS_H, CANVAS_W, type EditorPresentation } from '@/lib/editor/types'
import type { ThemeId } from '@/lib/types'

const SlideCanvas = dynamic(() => import('./SlideCanvas'), { ssr: false })
const THEMES = visibleThemes()

interface Props {
  presentation: EditorPresentation
  slideIndex: number
  onClose: () => void
  onApply: (theme: ThemeId) => void
}

export default function ThemeSwitcherDialog({ presentation, slideIndex, onClose, onApply }: Props) {
  const [selected, setSelected] = useState<ThemeId>(presentation.theme)
  const [previewWidth, setPreviewWidth] = useState(720)
  const dialogRef = useRef<HTMLElement>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const selectedTheme = THEMES.find(theme => theme.id === selected) ?? THEMES[0]
  const changed = selected !== presentation.theme

  const previewSlide = useMemo(() => {
    const slide = presentation.slides[slideIndex]
    if (!slide) return undefined
    return rethemeSlide(
      slide,
      slideIndex,
      presentation.slides.length,
      resolveTheme(presentation.theme),
      resolveTheme(selected),
    )
  }, [presentation, selected, slideIndex])

  useEffect(() => {
    closeButtonRef.current?.focus()
  }, [])

  useEffect(() => {
    const element = previewRef.current
    if (!element) return
    const update = () => {
      const bounds = element.getBoundingClientRect()
      const width = Math.min(bounds.width, bounds.height * (CANVAS_W / CANVAS_H))
      setPreviewWidth(Math.max(180, Math.floor(width)))
    }
    update()
    const observer = new ResizeObserver(update)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  function handleDialogKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      onClose()
      return
    }
    if (event.key !== 'Tab') return
    const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )
    if (!focusable?.length) return
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 p-3 sm:p-6"
      onMouseDown={event => { if (event.target === event.currentTarget) onClose() }}
    >
      <section
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="theme-switcher-title"
        aria-describedby="theme-switcher-description"
        onKeyDown={handleDialogKeyDown}
        className="flex h-[min(820px,calc(100vh-24px))] w-full max-w-6xl flex-col overflow-hidden overscroll-contain rounded-xl bg-white shadow-2xl sm:h-[min(820px,calc(100vh-48px))]"
      >
        <header className="flex items-start justify-between gap-6 border-b border-stone-200 px-5 py-4 sm:px-6">
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">讲稿与新增素材保留</div>
            <h2 id="theme-switcher-title" className="mt-1 text-xl font-bold text-stone-950">更换整套 PPT 模板</h2>
            <p id="theme-switcher-description" className="mt-1 text-sm text-stone-600">先看当前页效果，确认后整套应用，不重新调用 AI。</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="关闭模板选择"
            className="h-9 w-9 flex-shrink-0 rounded-md border border-stone-300 text-lg text-stone-600 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
          >×</button>
        </header>

        <div className="grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(250px,0.8fr)_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_390px] lg:grid-rows-1">
          <div className="flex min-h-0 flex-col bg-stone-100 p-4 sm:p-6">
            <div className="mb-3 flex items-center justify-between gap-4 text-sm">
              <span className="font-semibold text-stone-900">当前页预览</span>
              <span className="truncate text-stone-500" aria-live="polite">第 {slideIndex + 1} 张 · {selectedTheme.name}</span>
            </div>
            <div ref={previewRef} className="flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-md border border-stone-300 bg-stone-200">
              {previewSlide && <SlideCanvas width={previewWidth} readOnly slide={previewSlide} />}
            </div>
            <p className="mt-3 text-xs leading-relaxed text-stone-600">
              结构化页面会按新模板重新排版；讲稿和手动新增的文字、图片、图标会保留。直接修改过的结构文字、位置和颜色会恢复为生成时内容，可用撤销恢复。
            </p>
          </div>

          <aside className="min-h-0 overflow-y-auto border-t border-stone-200 bg-white p-4 lg:border-l lg:border-t-0">
            <div className="mb-3 px-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-stone-500">选择模板</div>
            <div className="space-y-2">
              {THEMES.map(theme => {
                const active = selected === theme.id
                const current = presentation.theme === theme.id
                return (
                  <button
                    key={theme.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setSelected(theme.id)}
                    className={`grid w-full grid-cols-[68px_1fr_auto] items-center gap-3 rounded-lg border p-2.5 text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900 ${active ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900' : 'border-stone-200 hover:border-stone-400'}`}
                  >
                    <ThemeSwatch theme={theme} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-stone-900">{theme.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-stone-500">{theme.description.split('·')[0].trim()}</span>
                    </span>
                    <span className={`min-w-9 text-right text-xs font-semibold ${active ? 'text-stone-900' : 'text-stone-500'}`}>
                      {active ? '已选' : current ? '当前' : ''}
                    </span>
                  </button>
                )
              })}
            </div>
          </aside>
        </div>

        <footer className="flex items-center justify-between gap-4 border-t border-stone-200 bg-white px-5 py-3 sm:px-6">
          <div className="min-w-0 text-sm text-stone-600">已选择 <strong className="text-stone-900">{selectedTheme.name}</strong></div>
          <div className="flex flex-shrink-0 gap-3">
            <button type="button" onClick={onClose} className="rounded-md px-4 py-2 text-sm text-stone-600 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900">取消</button>
            <button
              type="button"
              disabled={!changed}
              onClick={() => onApply(selected)}
              className="rounded-md bg-stone-900 px-5 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-35 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-stone-900"
            >
              {changed ? '应用整套模板' : '当前正在使用'}
            </button>
          </div>
        </footer>
      </section>
    </div>
  )
}

function ThemeSwatch({ theme }: { theme: ReturnType<typeof visibleThemes>[number] }) {
  return (
    <span
      aria-hidden="true"
      className="relative block h-11 overflow-hidden rounded border"
      style={{ background: theme.bg, borderColor: theme.border }}
    >
      {theme.decoration && <span className="absolute inset-0 opacity-60" style={{ background: theme.decoration }} />}
      <span className="absolute bottom-2 left-2 right-2 h-1" style={{ background: theme.accent }} />
      <span className="absolute left-2 top-2 h-1.5 w-8" style={{ background: theme.text }} />
    </span>
  )
}
