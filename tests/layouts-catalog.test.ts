import { describe, expect, it } from 'vitest'
import { LAYOUTS, defaultSlideForType, migrateSlide } from '@/lib/editor/layouts-catalog'

describe('layouts-catalog', () => {
  it('covers all 21 layout types', () => {
    expect(LAYOUTS).toHaveLength(21)
    const types = new Set(LAYOUTS.map(l => l.type))
    expect(types.size).toBe(21)
  })

  it('every default slide has matching type discriminator', () => {
    for (const meta of LAYOUTS) {
      expect(meta.default.type).toBe(meta.type)
    }
  })

  it('defaultSlideForType returns deep-cloned data', () => {
    const a = defaultSlideForType('cover')
    const b = defaultSlideForType('cover')
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })

  it('throws on unknown type', () => {
    // @ts-expect-error
    expect(() => defaultSlideForType('nope')).toThrow()
  })

  it('migrateSlide carries heading/eyebrow across', () => {
    const from = { type: 'argument', heading: '为什么是现在', highlight: '现在', eyebrow: '三个事实', points: ['a', 'b'] } as const
    const next = migrateSlide(from as any, 'data')
    expect((next as any).heading).toBe('为什么是现在')
    expect((next as any).eyebrow).toBe('三个事实')
  })

  it('migrateSlide preserves highlight only when type matches', () => {
    const fromArgument = { type: 'argument', heading: 'h', highlight: 'foo', points: [] } as const
    const toStatement = migrateSlide(fromArgument as any, 'statement')
    // statement.highlight is string[], argument.highlight is string -> should not copy
    expect((toStatement as any).highlight).toBeUndefined()
  })
})
