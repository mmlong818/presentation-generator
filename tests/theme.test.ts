import { describe, expect, it } from 'vitest'
import { resolveTheme } from '@/lib/editor/theme'
import { THEMES, VISIBLE_THEMES, visibleThemes } from '@/lib/themes'

describe('theme', () => {
  it('resolves a known theme to its tokens', () => {
    const t = resolveTheme('modern-minimal')
    expect(t.accent).toBeTruthy()
    expect(t.hero).toBeGreaterThan(0)
    expect(t.section).toBeGreaterThan(0)
    expect(t.padding).toBeGreaterThan(0)
  })

  it('falls back to modern-minimal on unknown id', () => {
    // @ts-expect-error
    const t = resolveTheme('nonexistent')
    const baseline = resolveTheme('modern-minimal')
    expect(t.bg).toBe(baseline.bg)
  })

  it('VISIBLE_THEMES has exactly 12 curated themes', () => {
    expect(VISIBLE_THEMES).toHaveLength(12)
    // No duplicates
    expect(new Set(VISIBLE_THEMES).size).toBe(12)
  })

  it('every VISIBLE_THEMES id exists in THEMES', () => {
    for (const id of VISIBLE_THEMES) {
      expect(THEMES[id]).toBeDefined()
    }
  })

  it('visibleThemes() returns objects', () => {
    const list = visibleThemes()
    expect(list).toHaveLength(12)
    expect(list[0].id).toBeTruthy()
    expect(list[0].name).toBeTruthy()
  })
})
