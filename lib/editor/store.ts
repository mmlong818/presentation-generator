// ─── Zustand editor store ────────────────────────────────────────────────────
//
// 简单的全局状态：当前演示稿、选中幻灯片索引、选中元素 ID、撤销栈。
// 不做协同；本地内存即可。

import { create } from 'zustand'
import type { EditorPresentation, ElementId, SlideElement } from './types'
import type { LayoutType, Slide } from '../types'
import { defaultSlideForType, migrateSlide } from './layouts-catalog'
import { composeSlide } from './compose/layouts'
import { resolveTheme } from './theme'

interface HistoryEntry {
  presentation: EditorPresentation
  // Brief label for debugging the undo stack.
  label: string
}

interface EditorState {
  presentation: EditorPresentation | null
  currentSlide: number
  selectedElementId: ElementId | null
  history: HistoryEntry[]
  future: HistoryEntry[]

  setPresentation: (p: EditorPresentation) => void
  setCurrentSlide: (idx: number) => void
  selectElement: (id: ElementId | null) => void

  updateElement: (id: ElementId, patch: Partial<SlideElement>) => void
  removeElement: (id: ElementId) => void
  addElement: (element: SlideElement) => void
  addSlide: (afterIndex?: number) => void
  removeSlide: (index: number) => void
  reorderSlides: (from: number, to: number) => void
  duplicateSlide: (index: number) => void
  insertSlideOfType: (afterIndex: number, type: LayoutType) => void
  changeSlideLayout: (index: number, type: LayoutType) => void

  undo: () => void
  redo: () => void
}

const MAX_HISTORY = 50

function snapshot(p: EditorPresentation): EditorPresentation {
  return JSON.parse(JSON.stringify(p)) as EditorPresentation
}

export const useEditorStore = create<EditorState>((set, get) => ({
  presentation: null,
  currentSlide: 0,
  selectedElementId: null,
  history: [],
  future: [],

  setPresentation: (p) => set({
    presentation: p,
    currentSlide: 0,
    selectedElementId: null,
    history: [],
    future: [],
  }),

  setCurrentSlide: (idx) => set({ currentSlide: idx, selectedElementId: null }),

  selectElement: (id) => set({ selectedElementId: id }),

  updateElement: (id, patch) => {
    const state = get()
    if (!state.presentation) return
    const next = snapshot(state.presentation)
    const slide = next.slides[state.currentSlide]
    if (!slide) return
    const idx = slide.elements.findIndex(e => e.id === id)
    if (idx < 0) return
    slide.elements[idx] = { ...slide.elements[idx], ...patch } as SlideElement
    pushHistory(state, 'updateElement')
    set({ presentation: next })
  },

  removeElement: (id) => {
    const state = get()
    if (!state.presentation) return
    const next = snapshot(state.presentation)
    const slide = next.slides[state.currentSlide]
    if (!slide) return
    const before = slide.elements.length
    slide.elements = slide.elements.filter(e => e.id !== id)
    if (slide.elements.length === before) return
    pushHistory(state, 'removeElement')
    set({ presentation: next, selectedElementId: null })
  },

  addElement: (element) => {
    const state = get()
    if (!state.presentation) return
    const next = snapshot(state.presentation)
    const slide = next.slides[state.currentSlide]
    if (!slide) return
    slide.elements.push(element)
    pushHistory(state, 'addElement')
    set({ presentation: next, selectedElementId: element.id })
  },

  addSlide: (afterIndex) => {
    const state = get()
    if (!state.presentation) return
    const at = afterIndex ?? state.currentSlide
    const next = snapshot(state.presentation)
    next.slides.splice(at + 1, 0, {
      id: `s_${Date.now()}`,
      background: next.slides[at]?.background ?? '#ffffff',
      elements: [],
    })
    pushHistory(state, 'addSlide')
    set({ presentation: next, currentSlide: at + 1 })
  },

  removeSlide: (index) => {
    const state = get()
    if (!state.presentation) return
    if (state.presentation.slides.length <= 1) return
    const next = snapshot(state.presentation)
    next.slides.splice(index, 1)
    pushHistory(state, 'removeSlide')
    set({
      presentation: next,
      currentSlide: Math.min(state.currentSlide, next.slides.length - 1),
    })
  },

  reorderSlides: (from, to) => {
    const state = get()
    if (!state.presentation) return
    const next = snapshot(state.presentation)
    const [moved] = next.slides.splice(from, 1)
    next.slides.splice(to, 0, moved)
    pushHistory(state, 'reorderSlides')
    set({
      presentation: next,
      currentSlide: to,
    })
  },

  duplicateSlide: (index) => {
    const state = get()
    if (!state.presentation) return
    const src = state.presentation.slides[index]
    if (!src) return
    const next = snapshot(state.presentation)
    const cloned = snapshot({ ...state.presentation, slides: [src] } as EditorPresentation).slides[0]
    cloned.id = `s_${Date.now()}`
    cloned.elements = cloned.elements.map(e => ({ ...e, id: `${e.type[0]}_${Math.random().toString(36).slice(2, 9)}` }))
    next.slides.splice(index + 1, 0, cloned)
    pushHistory(state, 'duplicateSlide')
    set({ presentation: next, currentSlide: index + 1 })
  },

  insertSlideOfType: (afterIndex, type) => {
    const state = get()
    if (!state.presentation) return
    const source = defaultSlideForType(type)
    const theme = resolveTheme(state.presentation.theme)
    const total = state.presentation.slides.length + 1
    const slideNo = afterIndex + 2
    const elements = composeSlide(source, theme, slideNo, total)
    const next = snapshot(state.presentation)
    next.slides.splice(afterIndex + 1, 0, {
      id: `s_${Date.now()}`,
      background: theme.bg,
      elements,
      source,
    })
    pushHistory(state, 'insertSlideOfType')
    set({ presentation: next, currentSlide: afterIndex + 1 })
  },

  changeSlideLayout: (index, type) => {
    const state = get()
    if (!state.presentation) return
    const cur = state.presentation.slides[index]
    if (!cur) return
    const newSource: Slide = cur.source ? migrateSlide(cur.source, type) : defaultSlideForType(type)
    const theme = resolveTheme(state.presentation.theme)
    const total = state.presentation.slides.length
    const elements = composeSlide(newSource, theme, index + 1, total)
    const next = snapshot(state.presentation)
    next.slides[index] = { ...next.slides[index], elements, source: newSource }
    pushHistory(state, 'changeSlideLayout')
    set({ presentation: next, selectedElementId: null })
  },

  undo: () => {
    const state = get()
    if (state.history.length === 0 || !state.presentation) return
    const prev = state.history[state.history.length - 1]
    const future = [...state.future, { presentation: state.presentation, label: 'redo-point' }]
    set({
      presentation: prev.presentation,
      history: state.history.slice(0, -1),
      future,
      selectedElementId: null,
    })
  },

  redo: () => {
    const state = get()
    if (state.future.length === 0 || !state.presentation) return
    const nxt = state.future[state.future.length - 1]
    set({
      presentation: nxt.presentation,
      history: [...state.history, { presentation: state.presentation, label: 'undo-point' }],
      future: state.future.slice(0, -1),
      selectedElementId: null,
    })
  },
}))

function pushHistory(state: EditorState, label: string) {
  if (!state.presentation) return
  const entry: HistoryEntry = { presentation: snapshot(state.presentation), label }
  state.history.push(entry)
  if (state.history.length > MAX_HISTORY) state.history.shift()
  state.future.length = 0
}
