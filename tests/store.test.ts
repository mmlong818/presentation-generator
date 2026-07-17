import { beforeEach, describe, expect, it } from 'vitest'
import { useEditorStore } from '@/lib/editor/store'
import type { EditorPresentation, TextElement } from '@/lib/editor/types'
import { resolveTheme } from '@/lib/editor/theme'

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

  it('changeTheme recomposes sourced slides and supports undo', () => {
    const p = basePresentation()
    p.slides[0] = {
      ...baseSlide(),
      source: { type: 'statement', title: '内容不变，只换模板', highlight: ['换模板'] },
    }
    useEditorStore.getState().setPresentation(p)

    useEditorStore.getState().changeTheme('tech-utility')
    const changed = useEditorStore.getState().presentation!
    expect(changed.theme).toBe('tech-utility')
    expect(changed.slides[0].background).toBe(resolveTheme('tech-utility').bg)
    expect(changed.slides[0].elements.some(e => e.type === 'text' && e.text.includes('内容不变'))).toBe(true)

    useEditorStore.getState().undo()
    expect(useEditorStore.getState().presentation?.theme).toBe('modern-minimal')
  })

  it('changeTheme retokens custom slides without moving their elements', () => {
    const from = resolveTheme('modern-minimal')
    const to = resolveTheme('midnight-luxe')
    const p = basePresentation()
    p.slides[0].elements = [
      { id: 't1', type: 'text', x: 120, y: 160, w: 800, h: 100, text: '自定义内容', fontSize: 48, fontFamily: from.fontBody, color: from.text },
      { id: 't2', type: 'text', x: 120, y: 300, w: 800, h: 100, text: '品牌色', fontSize: 40, fontFamily: 'Custom', color: '#123456' },
    ]
    useEditorStore.getState().setPresentation(p)

    useEditorStore.getState().changeTheme('midnight-luxe')
    const elements = useEditorStore.getState().presentation!.slides[0].elements as TextElement[]
    expect(elements[0]).toMatchObject({ x: 120, y: 160, text: '自定义内容', fontFamily: to.fontBody, color: to.text })
    expect(elements[1]).toMatchObject({ color: '#123456', fontFamily: 'Custom' })
  })

  it('changeTheme preserves elements manually added to a sourced slide', () => {
    const from = resolveTheme('modern-minimal')
    const to = resolveTheme('midnight-luxe')
    const p = basePresentation()
    p.slides[0] = {
      ...baseSlide(),
      source: { type: 'statement', title: '结构内容' },
    }
    useEditorStore.getState().setPresentation(p)
    useEditorStore.getState().addElement({
      id: 't_manual',
      type: 'text',
      x: 111,
      y: 222,
      w: 500,
      h: 80,
      text: '手动补充内容',
      fontSize: 36,
      fontFamily: from.fontBody,
      color: from.text,
    })

    useEditorStore.getState().changeTheme('midnight-luxe')
    const manual = useEditorStore.getState().presentation!.slides[0].elements
      .find(element => element.id === 't_manual') as TextElement
    expect(manual).toMatchObject({
      origin: 'manual',
      x: 111,
      y: 222,
      text: '手动补充内容',
      fontFamily: to.fontBody,
      color: to.text,
    })
  })

  it('changeTheme recolors theme-aware SVG icons but leaves raster images untouched', () => {
    const from = resolveTheme('modern-minimal')
    const to = resolveTheme('midnight-luxe')
    const p = basePresentation()
    p.slides[0].elements = [
      {
        id: 'i_icon',
        type: 'image',
        origin: 'manual',
        x: 100,
        y: 100,
        w: 120,
        h: 120,
        src: `data:image/svg+xml,%3Csvg%20color%3D%22${encodeURIComponent(from.text)}%22%3E%3C%2Fsvg%3E`,
        themeColorRole: 'text',
      },
      {
        id: 'i_photo',
        type: 'image',
        origin: 'manual',
        x: 300,
        y: 100,
        w: 120,
        h: 120,
        src: 'data:image/png;base64,photo',
      },
    ]
    useEditorStore.getState().setPresentation(p)

    useEditorStore.getState().changeTheme('midnight-luxe')
    const images = useEditorStore.getState().presentation!.slides[0].elements
    expect(images[0]).toMatchObject({ themeColorRole: 'text' })
    expect((images[0] as { src: string }).src).toContain(encodeURIComponent(to.text))
    expect((images[1] as { src: string }).src).toBe('data:image/png;base64,photo')
  })
})
