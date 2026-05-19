import { beforeEach, describe, expect, it } from 'vitest'
import { useEditorStore } from '@/lib/editor/store'
import type { EditorPresentation, TextElement } from '@/lib/editor/types'

const baseSlide = () => ({
  id: 's1', background: '#fff', elements: [], notes: undefined,
})

const basePresentation = (): EditorPresentation => ({
  id: 'p1', title: 't', theme: 'modern-minimal', width: 1920, height: 1080,
  slides: [baseSlide()],
})

describe('editor store', () => {
  beforeEach(() => {
    useEditorStore.setState({ presentation: null, currentSlide: 0, selectedElementId: null, history: [], future: [] } as any)
  })

  it('setPresentation initializes state', () => {
    useEditorStore.getState().setPresentation(basePresentation())
    const s = useEditorStore.getState()
    expect(s.presentation?.slides).toHaveLength(1)
    expect(s.currentSlide).toBe(0)
    expect(s.selectedElementId).toBeNull()
  })

  it('addSlide appends and selects new slide', () => {
    useEditorStore.getState().setPresentation(basePresentation())
    useEditorStore.getState().addSlide()
    const s = useEditorStore.getState()
    expect(s.presentation?.slides).toHaveLength(2)
    expect(s.currentSlide).toBe(1)
  })

  it('removeSlide refuses to leave 0 slides', () => {
    useEditorStore.getState().setPresentation(basePresentation())
    useEditorStore.getState().removeSlide(0)
    expect(useEditorStore.getState().presentation?.slides).toHaveLength(1)
  })

  it('reorderSlides moves and updates currentSlide', () => {
    const p = basePresentation()
    p.slides = [baseSlide(), { ...baseSlide(), id: 's2' }, { ...baseSlide(), id: 's3' }]
    useEditorStore.getState().setPresentation(p)
    useEditorStore.getState().reorderSlides(0, 2)
    const order = useEditorStore.getState().presentation!.slides.map(x => x.id)
    expect(order).toEqual(['s2', 's3', 's1'])
    expect(useEditorStore.getState().currentSlide).toBe(2)
  })

  it('addElement inserts and selects', () => {
    useEditorStore.getState().setPresentation(basePresentation())
    const el: TextElement = { id: 't1', type: 'text', x: 0, y: 0, w: 100, h: 50, text: 'hi', fontSize: 30, fontFamily: 'sans', color: '#000' }
    useEditorStore.getState().addElement(el)
    expect(useEditorStore.getState().presentation!.slides[0].elements).toHaveLength(1)
    expect(useEditorStore.getState().selectedElementId).toBe('t1')
  })

  it('updateElement patches in place', () => {
    useEditorStore.getState().setPresentation(basePresentation())
    const el: TextElement = { id: 't1', type: 'text', x: 0, y: 0, w: 100, h: 50, text: 'hi', fontSize: 30, fontFamily: 'sans', color: '#000' }
    useEditorStore.getState().addElement(el)
    useEditorStore.getState().updateElement('t1', { text: 'bye' })
    const got = useEditorStore.getState().presentation!.slides[0].elements[0] as TextElement
    expect(got.text).toBe('bye')
  })

  it('undo restores prior state', () => {
    useEditorStore.getState().setPresentation(basePresentation())
    const el: TextElement = { id: 't1', type: 'text', x: 0, y: 0, w: 100, h: 50, text: 'hi', fontSize: 30, fontFamily: 'sans', color: '#000' }
    useEditorStore.getState().addElement(el)
    expect(useEditorStore.getState().presentation!.slides[0].elements).toHaveLength(1)
    useEditorStore.getState().undo()
    expect(useEditorStore.getState().presentation!.slides[0].elements).toHaveLength(0)
  })

  it('duplicateSlide creates a clone with fresh ids', () => {
    const p = basePresentation()
    const el: TextElement = { id: 't1', type: 'text', x: 0, y: 0, w: 100, h: 50, text: 'a', fontSize: 30, fontFamily: 's', color: '#000' }
    p.slides[0].elements = [el]
    useEditorStore.getState().setPresentation(p)
    useEditorStore.getState().duplicateSlide(0)
    const slides = useEditorStore.getState().presentation!.slides
    expect(slides).toHaveLength(2)
    expect(slides[1].id).not.toBe(slides[0].id)
    expect(slides[1].elements[0].id).not.toBe(slides[0].elements[0].id)
  })

  it('insertSlideOfType creates from catalog default', () => {
    useEditorStore.getState().setPresentation(basePresentation())
    useEditorStore.getState().insertSlideOfType(0, 'cover')
    const slides = useEditorStore.getState().presentation!.slides
    expect(slides).toHaveLength(2)
    expect(slides[1].source?.type).toBe('cover')
    expect(slides[1].elements.length).toBeGreaterThan(0)
  })
})
