// ─── deck → EditorPresentation 顶层入口 ──────────────────────────────────────

import type { Deck } from '../../types'
import { resolveTheme } from '../theme'
import type { EditorPresentation, EditorSlide } from '../types'
import { CANVAS_H, CANVAS_W } from '../types'
import { resetIds } from './helpers'
import { composeSlide } from './layouts'

export function deckToEditor(deck: Deck): EditorPresentation {
  resetIds()
  const theme = resolveTheme(deck.theme)
  const total = deck.slides.length
  const notesByIndex = new Map<number, string>()
  for (const entry of deck.script ?? []) notesByIndex.set(entry.slideIndex, entry.text)

  const slides: EditorSlide[] = deck.slides.map((s, i) => ({
    id: `s_${i + 1}`,
    background: theme.bg,
    elements: composeSlide(s, theme, i + 1, total),
    notes: notesByIndex.get(i + 1),
    source: s,
  }))

  return {
    id: 'deck',
    title: deck.title,
    width: CANVAS_W,
    height: CANVAS_H,
    theme: deck.theme,
    slides,
  }
}
