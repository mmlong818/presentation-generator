// Headless deck rendering endpoint.
//
// POST /api/render
// Content-Type: application/json | text/markdown
// Body shapes:
//   { deck: Deck, format?: 'pptx' | 'html' | 'json' }
//   { markdown: string, theme?: ThemeId, format?: 'pptx' | 'html' | 'json' }
//
// Returns binary PPTX, raw HTML, or JSON depending on format.
// No auth: BYOK pattern means this endpoint is for the user's own keys.
// If you self-host and expose publicly, gate via reverse proxy / API key.

import { NextResponse } from 'next/server'
import { deckToEditor } from '@/lib/editor/compose'
import { exportHTML } from '@/lib/editor/export/html'
import { parseMarkdownDeck } from '@/lib/markdown-deck'
import type { Deck, ThemeId } from '@/lib/types'

interface Req {
  deck?: Deck
  markdown?: string
  theme?: ThemeId
  format?: 'pptx' | 'html' | 'json'
}

export async function POST(req: Request) {
  let body: Req
  try { body = await req.json() } catch { return NextResponse.json({ error: '请求体不是合法 JSON' }, { status: 400 }) }

  const format = body.format ?? 'pptx'

  let deck: Deck
  if (body.deck) {
    deck = body.deck
  } else if (body.markdown) {
    deck = parseMarkdownDeck(body.markdown, { theme: body.theme })
  } else {
    return NextResponse.json({ error: '需要 deck 或 markdown 字段' }, { status: 400 })
  }

  try {
    const editor = deckToEditor(deck)

    if (format === 'json') {
      return NextResponse.json({ deck, editor })
    }
    if (format === 'html') {
      const html = exportHTML(editor)
      return new Response(html, { headers: { 'Content-Type': 'text/html;charset=utf-8' } })
    }
    if (format === 'pptx') {
      // pptxgenjs runs in Node too; build binary buffer and stream back.
      const { buildPPTX } = await import('@/lib/editor/export/pptx-node')
      const buf = await buildPPTX(editor)
      return new Response(new Uint8Array(buf), {
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
          'Content-Disposition': `attachment; filename="${encodeURIComponent(deck.title || 'deck')}.pptx"`,
        },
      })
    }
    return NextResponse.json({ error: `未知 format: ${format}` }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    endpoint: '/api/render',
    description: 'Render a deck (or Markdown) to PPTX / HTML / JSON',
    body: {
      deck: 'Deck JSON (optional)',
      markdown: 'Markdown string (optional, alternative to deck)',
      theme: 'ThemeId override (optional)',
      format: '"pptx" | "html" | "json" (default pptx)',
    },
    example_curl: `curl -X POST http://localhost:3000/api/render \\
  -H 'Content-Type: application/json' \\
  -d '{"markdown": "# Hi\\n\\n## Why\\n- one\\n- two\\n- three", "theme": "modern-minimal"}' \\
  -o deck.pptx`,
  })
}
