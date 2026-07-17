// ─── Zustand editor store ────────────────────────────────────────────────────
//
// 简单的全局状态：当前演示稿、选中幻灯片索引、选中元素 ID（多选）、撤销栈。
// 不做协同；本地内存即可。

import { create } from 'zustand'
import type { EditorPresentation, ElementId, SlideElement } from './types'
import type { LayoutType, Slide, ThemeId } from '../types'
import { defaultSlideForType, migrateSlide } from './layouts-catalog'
import { composeSlide } from './compose/layouts'
import { resolveTheme } from './theme'
import { resetIds } from './compose/helpers'
import { rethemeSlide } from './retheme'

interface HistoryEntry {
  presentation: EditorPresentation
  // Brief label for debugging the undo stack.
  label: string
}

interface EditorState {
  presentation: EditorPresentation | null
  currentSlide: number
  /** Multi-select: all selected element IDs. */
  selectedElementIds: ElementId[]
  /** Convenience accessor: first selected ID (kept for Inspector single-target editing). */
  selectedElementId: ElementId | null
  history: HistoryEntry[]
  future: HistoryEntry[]

  setPresentation: (p: EditorPresentation) => void
  setCurrentSlide: (idx: number) => void
  /**
   * Select an element. If `additive` is true, toggle membership; otherwise
   * replace the selection. Pass id=null to clear.
   */
  selectElement: (id: ElementId | null, opts?: { additive?: boolean }) => void
  selectAll: () => void

  updateElement: (id: ElementId, patch: Partial<SlideElement>) => void
  /** Apply same x/y delta to every currently-selected element. */
  nudgeSelected: (dx: number, dy: number) => void
  removeElement: (id: ElementId) => void
  removeSelected: () => void
  addElement: (element: SlideElement) => void
  duplicateSelected: () => void
  /** Z-order: bringToFront / sendToBack / bringForward / sendBackward */
  reorderElement: (id: ElementId, direction: 'front' | 'back' | 'forward' | 'backward') => void

  addSlide: (afterIndex?: number) => void
  removeSlide: (index: number) => void
  reorderSlides: (from: number, to: number) => void
  duplicateSlide: (index: number) => void
  insertSlideOfType: (afterIndex: number, type: LayoutType) => void
  changeSlideLayout: (index: number, type: LayoutType) => void
  /**
   * Replace a slide's structural source (e.g. after LLM rewrite returns a new
   * Slide payload) and re-compose its elements. Preserves notes.
   */
  replaceSlideSource: (index: number, newSource: Slide) => void
  /** Recompose the whole presentation with a new theme while preserving sources and notes. */
  changeTheme: (theme: ThemeId) => void

  undo: () => void
  redo: () => void
}

// Bump from 50: real users add/delete dozens of elements during editing and
// expect to be able to walk back the whole session. PPT editors (Keynote /
// PowerPoint) typically retain hundreds of steps. 250 covers a long session
// while keeping the snapshot cost bounded (each entry is a deck JSON copy).
const MAX_HISTORY = 250

function snapshot(p: EditorPresentation): EditorPresentation {
  return JSON.parse(JSON.stringify(p)) as EditorPresentation
}

function freshId(type: string): string {
  return `${type[0]}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

export const useEditorStore = create<EditorState>((set, get) => ({
  presentation: null,
  currentSlide: 0,
  selectedElementIds: [],
  selectedElementId: null,
  history: [],
  future: [],

  setPresentation: (p) => set({
    presentation: p,
    currentSlide: 0,
    selectedElementIds: [],
    selectedElementId: null,
    history: [],
    future: [],
  }),

  setCurrentSlide: (idx) => set({
    currentSlide: idx,
    selectedElementIds: [],
    selectedElementId: null,
  }),

  selectElement: (id, opts) => {
    const additive = opts?.additive === true
    if (id === null) {
      set({ selectedElementIds: [], selectedElementId: null })
      return
    }
    const state = get()
    if (additive) {
      const cur = state.selectedElementIds
      const next = cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]
      set({
        selectedElementIds: next,
        selectedElementId: next[0] ?? null,
      })
    } else {
      set({ selectedElementIds: [id], selectedElementId: id })
    }
  },

  selectAll: () => {
    const state = get()
    if (!state.presentation) return
    const slide = state.presentation.slides[state.currentSlide]
    if (!slide) return
    const ids = slide.elements.map(e => e.id)
    set({ selectedElementIds: ids, selectedElementId: ids[0] ?? null })
  },

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

  nudgeSelected: (dx, dy) => {
    const state = get()
    if (!state.presentation || state.selectedElementIds.length === 0) return
    const next = snapshot(state.presentation)
    const slide = next.slides[state.currentSlide]
    if (!slide) return
    const ids = new Set(state.selectedElementIds)
    slide.elements = slide.elements.map(e => ids.has(e.id) ? { ...e, x: e.x + dx, y: e.y + dy } : e)
    pushHistory(state, 'nudgeSelected')
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
    set({
      presentation: next,
      selectedElementIds: state.selectedElementIds.filter(x => x !== id),
      selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
    })
  },

  removeSelected: () => {
    const state = get()
    if (!state.presentation || state.selectedElementIds.length === 0) return
    const next = snapshot(state.presentation)
    const slide = next.slides[state.currentSlide]
    if (!slide) return
    const ids = new Set(state.selectedElementIds)
    slide.elements = slide.elements.filter(e => !ids.has(e.id))
    pushHistory(state, 'removeSelected')
    set({ presentation: next, selectedElementIds: [], selectedElementId: null })
  },

  addElement: (element) => {
    const state = get()
    if (!state.presentation) return
    const next = snapshot(state.presentation)
    const slide = next.slides[state.currentSlide]
    if (!slide) return
    const manualElement = { ...element, origin: 'manual' as const }
    slide.elements.push(manualElement)
    pushHistory(state, 'addElement')
    set({
      presentation: next,
      selectedElementIds: [manualElement.id],
      selectedElementId: manualElement.id,
    })
  },

  duplicateSelected: () => {
    const state = get()
    if (!state.presentation || state.selectedElementIds.length === 0) return
    const next = snapshot(state.presentation)
    const slide = next.slides[state.currentSlide]
    if (!slide) return
    const ids = new Set(state.selectedElementIds)
    const clones = slide.elements
      .filter(e => ids.has(e.id))
      .map(e => ({
        ...JSON.parse(JSON.stringify(e)),
        id: freshId(e.type),
        origin: 'manual',
        x: e.x + 24,
        y: e.y + 24,
      }) as SlideElement)
    slide.elements.push(...clones)
    const cloneIds = clones.map(c => c.id)
    pushHistory(state, 'duplicateSelected')
    set({
      presentation: next,
      selectedElementIds: cloneIds,
      selectedElementId: cloneIds[0] ?? null,
    })
  },

  reorderElement: (id, direction) => {
    const state = get()
    if (!state.presentation) return
    const next = snapshot(state.presentation)
    const slide = next.slides[state.currentSlide]
    if (!slide) return
    const idx = slide.elements.findIndex(e => e.id === id)
    if (idx < 0) return
    const arr = slide.elements
    if (direction === 'front') {
      const [el] = arr.splice(idx, 1)
      arr.push(el)
    } else if (direction === 'back') {
      const [el] = arr.splice(idx, 1)
      arr.unshift(el)
    } else if (direction === 'forward' && idx < arr.length - 1) {
      const tmp = arr[idx]; arr[idx] = arr[idx + 1]; arr[idx + 1] = tmp
    } else if (direction === 'backward' && idx > 0) {
      const tmp = arr[idx]; arr[idx] = arr[idx - 1]; arr[idx - 1] = tmp
    }
    pushHistory(state, `reorder-${direction}`)
    set({ presentation: next })
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
    cloned.elements = cloned.elements.map(e => ({ ...e, id: freshId(e.type) }))
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
    set({ presentation: next, selectedElementIds: [], selectedElementId: null })
  },

  replaceSlideSource: (index, newSource) => {
    const state = get()
    if (!state.presentation) return
    const cur = state.presentation.slides[index]
    if (!cur) return
    const theme = resolveTheme(state.presentation.theme)
    const total = state.presentation.slides.length
    const elements = composeSlide(newSource, theme, index + 1, total)
    const next = snapshot(state.presentation)
    next.slides[index] = { ...next.slides[index], elements, source: newSource }
    pushHistory(state, 'replaceSlideSource')
    set({ presentation: next, selectedElementIds: [], selectedElementId: null })
  },

  changeTheme: (themeId) => {
    const state = get()
    if (!state.presentation || state.presentation.theme === themeId) return
    const previousTheme = resolveTheme(state.presentation.theme)
    const nextTheme = resolveTheme(themeId)
    const next = snapshot(state.presentation)
    const total = next.slides.length

    resetIds()
    next.theme = themeId
    next.slides = next.slides.map((slide, index) => rethemeSlide(slide, index, total, previousTheme, nextTheme))

    pushHistory(state, 'changeTheme')
    set({ presentation: next, selectedElementIds: [], selectedElementId: null })
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
      selectedElementIds: [],
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
      selectedElementIds: [],
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
