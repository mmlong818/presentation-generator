import { describe, expect, it } from 'vitest'
import { parseMarkdownDeck } from '@/lib/markdown-deck'

describe('parseMarkdownDeck', () => {
  it('uses first H1 as title', () => {
    const d = parseMarkdownDeck('# 团队应该用 AI\n\n## 为什么\n- a\n- b\n- c')
    expect(d.title).toBe('团队应该用 AI')
  })

  it('makes the first slide cover when bullets follow heading', () => {
    const d = parseMarkdownDeck('# Welcome\n\n## intro\n这是开场段落')
    expect(d.slides[0].type).toBe('cover')
  })

  it('infers argument layout for 2-5 bullets', () => {
    const d = parseMarkdownDeck('# t\n\n## main\n## why\n- a\n- b\n- c')
    const arg = d.slides.find(s => s.type === 'argument')
    expect(arg).toBeDefined()
    expect((arg as any).points).toEqual(['a', 'b', 'c'])
  })

  it('infers checklist for 6+ bullets', () => {
    const d = parseMarkdownDeck('# t\n\n## tasks\n- 1\n- 2\n- 3\n- 4\n- 5\n- 6\n- 7')
    const cl = d.slides.find(s => s.type === 'checklist')
    expect(cl).toBeDefined()
    expect((cl as any).items.length).toBe(7)
  })

  it('quote slide from > prefix', () => {
    const d = parseMarkdownDeck('# t\n\n## q\n> 一句名言。')
    const q = d.slides.find(s => s.type === 'quote')
    expect(q).toBeDefined()
    expect((q as any).quote).toBe('一句名言。')
  })

  it('--- delimiter starts a new slide', () => {
    const d = parseMarkdownDeck('# t\n\n## a\nhello\n\n---\n\n## b\nworld')
    expect(d.slides.length).toBeGreaterThanOrEqual(2)
  })

  it('reads --theme via opts', () => {
    const d = parseMarkdownDeck('# t', { theme: 'editorial-monocle' })
    expect(d.theme).toBe('editorial-monocle')
  })

  it('### becomes eyebrow on the current slide', () => {
    const d = parseMarkdownDeck('# t\n\n## why\n### 三个事实\n- a\n- b\n- c')
    const arg = d.slides.find(s => s.type === 'argument')
    expect((arg as any).eyebrow).toBe('三个事实')
  })
})
