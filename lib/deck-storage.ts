// Centralized localStorage helpers for deck persistence + history.
//
// Keys:
//   pg_last_deck             — most recently opened/generated Deck (Deck shape)
//   pg_editor_presentation   — full EditorPresentation snapshot for high-fidelity reload
//                              (includes element-level edits the Deck shape can't represent)
//   pg_deck_history          — last N decks. Newest first. { id, deck, savedAt }
//
// Why 2 keys for the current deck:
// - pg_last_deck is the structural source (sources only) and is what the
//   API expects (e.g. /api/rewrite-slide). Stays valid after layout swap.
// - pg_editor_presentation captures element-level edits (text content,
//   x/y position, color overrides). Lets editor reload exactly where the
//   user left off, including unsaved drag/edit work.

import type { Deck } from './types'
import type { EditorPresentation } from './editor/types'

export const DECK_STORAGE = 'pg_last_deck'
export const EDITOR_STORAGE = 'pg_editor_presentation'
export const HISTORY_KEY = 'pg_deck_history'
export const HISTORY_MAX = 50

export interface HistoryEntry {
  id: string
  deck: Deck
  savedAt: string  // ISO timestamp
}

function safeJSONParse<T>(raw: string | null): T | null {
  if (!raw) return null
  try { return JSON.parse(raw) as T } catch { return null }
}

/**
 * Append/update a deck in history. Dedupes by deck.createdAt so the same
 * deck across edits collapses to one history row (with savedAt bumped).
 */
export function pushDeckToHistory(deck: Deck): void {
  if (typeof window === 'undefined') return
  const list = safeJSONParse<HistoryEntry[]>(localStorage.getItem(HISTORY_KEY)) ?? []
  // Remove any existing row for the same deck (matched by createdAt)
  const filtered = list.filter(x => x.deck.createdAt !== deck.createdAt)
  const entry: HistoryEntry = {
    id: typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `h_${Date.now()}`,
    deck,
    savedAt: new Date().toISOString(),
  }
  filtered.unshift(entry)
  localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, HISTORY_MAX)))
}

export function saveLastDeck(deck: Deck): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(DECK_STORAGE, JSON.stringify(deck))
}

export function loadLastDeck(): Deck | null {
  if (typeof window === 'undefined') return null
  return safeJSONParse<Deck>(localStorage.getItem(DECK_STORAGE))
}

export function saveEditorPresentation(p: EditorPresentation): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(EDITOR_STORAGE, JSON.stringify(p))
}

export function loadEditorPresentation(): EditorPresentation | null {
  if (typeof window === 'undefined') return null
  return safeJSONParse<EditorPresentation>(localStorage.getItem(EDITOR_STORAGE))
}

export function clearEditorPresentation(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(EDITOR_STORAGE)
}

/**
 * Reconstruct a Deck shape from an EditorPresentation. Uses slide.source as
 * the canonical Slide payload (so layout/structural intent is preserved);
 * element-level edits (text content / position drift) are not captured here.
 * Caller must supply the original deck's brief/framework/createdAt context.
 */
export function editorToDeck(p: EditorPresentation, ctx: Partial<Deck>): Deck {
  const slides = p.slides.map(s => s.source).filter(Boolean) as Deck['slides']
  return {
    title: p.title,
    theme: p.theme,
    framework: ctx.framework ?? 'duarte',
    brief: ctx.brief ?? { topic: p.title, audience: '', goal: '', durationMin: Math.max(5, p.slides.length) },
    script: ctx.script ?? [],
    slides,
    brand: ctx.brand,
    createdAt: ctx.createdAt ?? new Date().toISOString(),
    selfReview: ctx.selfReview,
  }
}
