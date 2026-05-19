import { describe, expect, it } from 'vitest'
import { exportHTML } from '@/lib/editor/export/html'
import type { EditorPresentation } from '@/lib/editor/types'

const sample = (): EditorPresentation => ({
  id: 'p', title: '测试 < ' + '"' + '>', theme: 'modern-minimal',
  width: 1920, height: 1080,
  slides: [{
    id: 's1', background: '#ffffff',
    elements: [
      { id: 't1', type: 'text', x: 100, y: 100, w: 1700, h: 200,
        text: 'Hello <bold> & "quotes"', fontSize: 64, fontFamily: 'Inter,sans-serif',
        color: '#000', fontWeight: 800, role: 'hero',
        highlight: 'bold', highlightColor: '#1f6feb' },
      { id: 'r1', type: 'rect', x: 100, y: 400, w: 500, h: 200,
        fill: '#1f6feb', cornerRadius: 8 },
    ],
  }, {
    id: 's2', background: '#0a0a0a',
    elements: [
      { id: 't2', type: 'text', x: 200, y: 200, w: 1500, h: 300,
        text: 'Second slide', fontSize: 48, fontFamily: 'sans', color: '#fff',
        animation: { kind: 'fade', delay: 100, duration: 500 } },
    ],
  }],
})

describe('HTML export', () => {
  it('produces a full HTML document', () => {
    const html = exportHTML(sample())
    expect(html.startsWith('<!doctype html>')).toBe(true)
    expect(html).toContain('</html>')
  })

  it('escapes title and text content', () => {
    const html = exportHTML(sample())
    // Title in <title> is escaped
    expect(html).toContain('&lt;')
    expect(html).toContain('&quot;')
    // No raw < or > inside the user text
    const textPos = html.indexOf('Hello')
    expect(html.slice(textPos, textPos + 50)).not.toContain('<bold>')
  })

  it('renders highlight span with nowrap', () => {
    const html = exportHTML(sample())
    expect(html).toMatch(/<span style="color:#1f6feb;white-space:nowrap">bold<\/span>/)
  })

  it('marks animated elements with data-anim attribute and CSS vars', () => {
    const html = exportHTML(sample())
    expect(html).toContain('data-anim="fade"')
    expect(html).toContain('--dur:500ms')
    expect(html).toContain('--delay:100ms')
  })

  it('emits one section per slide with active class on first', () => {
    const html = exportHTML(sample())
    const sections = html.match(/<section class="slide/g) ?? []
    expect(sections).toHaveLength(2)
    expect(html).toContain('<section class="slide active"')
  })

  it('background is applied to slide section', () => {
    const html = exportHTML(sample())
    expect(html).toContain('background:#ffffff')
    expect(html).toContain('background:#0a0a0a')
  })

  it('embeds keyboard navigation script', () => {
    const html = exportHTML(sample())
    expect(html).toContain('ArrowRight')
    expect(html).toContain('document.fullscreenElement')
  })
})
