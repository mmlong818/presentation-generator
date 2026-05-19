// Markdown → Deck JSON parser.
//
// Convention:
//   # Title                  → deck.title (only first H1 used)
//   --- or ## Heading        → new slide boundary
//   ## ...                   → slide heading
//   ### ...                  → eyebrow (small caption above heading)
//   - bullet                 → adds a bullet to current slide
//   > quote                  → quote slide
//   Plain paragraph          → adds to body / brief
//   ![alt](url)              → image (deferred; not yet emitted as element)
//
// Layout inference rules (rough heuristic, can be hand-tuned later):
//   - quote line present     → 'quote'
//   - 2-5 bullets only       → 'argument'
//   - 6+ bullets             → 'checklist'
//   - first slide            → 'cover'
//   - no bullets, only h2    → 'statement'
//
// We deliberately keep this tiny and self-contained — no markdown lib dep.

import type { Deck, Slide, ThemeId } from './types'

export interface ParseOptions {
  theme?: ThemeId
  framework?: Deck['framework']
}

export function parseMarkdownDeck(md: string, opts: ParseOptions = {}): Deck {
  const lines = md.replace(/\r\n/g, '\n').split('\n')
  let title = ''
  const slides: SlideDraft[] = []
  let cur: SlideDraft | null = null

  function flush() {
    if (cur) slides.push(cur)
    cur = { heading: '', bullets: [], quote: undefined, source: undefined, paragraphs: [], eyebrow: undefined }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) continue

    if (line === '---') { flush(); continue }

    if (line.startsWith('# ') && !title) {
      title = line.slice(2).trim()
      continue
    }

    if (line.startsWith('## ')) {
      flush()
      cur!.heading = line.slice(3).trim()
      continue
    }

    if (line.startsWith('### ')) {
      if (!cur) flush()
      cur!.eyebrow = line.slice(4).trim()
      continue
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (!cur) flush()
      cur!.bullets.push(line.slice(2).trim())
      continue
    }

    if (line.startsWith('> ')) {
      if (!cur) flush()
      cur!.quote = line.slice(2).trim()
      continue
    }

    if (line.startsWith('— ') || line.startsWith('-- ')) {
      if (cur) (cur as SlideDraft).source = line.replace(/^—\s*|^--\s*/, '').trim()
      continue
    }

    if (!cur) flush()
    cur!.paragraphs.push(line)
  }
  flush()

  const trimmed = slides.filter(s => s.heading || s.bullets.length || s.quote || s.paragraphs.length)
  const out: Slide[] = trimmed.map((draft, i) => inferLayout(draft, i, title))

  return {
    title: title || '未命名演讲',
    theme: opts.theme ?? 'modern-minimal',
    framework: opts.framework ?? 'duarte',
    brief: { topic: title, audience: '', goal: '', durationMin: Math.max(5, out.length * 2) },
    script: [],
    createdAt: new Date().toISOString(),
    slides: out,
  }
}

interface SlideDraft {
  heading: string
  eyebrow?: string
  bullets: string[]
  quote?: string
  source?: string
  paragraphs: string[]
}

function inferLayout(d: SlideDraft, idx: number, deckTitle: string): Slide {
  // Quote trumps everything else when present.
  if (d.quote) {
    return {
      type: 'quote',
      quote: d.quote,
      source: d.source ?? '',
      eyebrow: d.eyebrow,
    }
  }
  // Bullet-driven layouts.
  if (d.bullets.length >= 6) {
    return {
      type: 'checklist',
      heading: d.heading || '清单',
      items: d.bullets,
      eyebrow: d.eyebrow,
    }
  }
  if (d.bullets.length >= 2) {
    return {
      type: 'argument',
      heading: d.heading || '论点',
      points: d.bullets,
      eyebrow: d.eyebrow,
    }
  }
  // Cover only when first slide AND no bullets/quote interfered above.
  if (idx === 0 && d.heading) {
    return {
      type: 'cover',
      title: d.heading || deckTitle,
      subtitle: d.paragraphs[0],
      eyebrow: d.eyebrow,
    }
  }
  if (d.heading && !d.bullets.length && d.paragraphs.length === 0) {
    return {
      type: 'statement',
      title: d.heading,
    }
  }
  // Fallback: statement with heading + first paragraph.
  return {
    type: 'statement',
    title: d.heading || d.paragraphs.join(' '),
  }
}
