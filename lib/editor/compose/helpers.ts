// ─── Element factory helpers ─────────────────────────────────────────────────
// Compose-time helpers shared by all 21 layout composers.

import type {
  TextElement,
  RectElement,
  EllipseElement,
  LineElement,
} from '../types'

let counter = 0
/**
 * Unique-ish ID generator. Not cryptographically strong; only needs to be unique
 * within a presentation. Reset whenever a deck is freshly composed so IDs are
 * stable across recompositions of the same deck (helpful for diffing).
 */
export function resetIds(): void {
  counter = 0
}

export function nextId(prefix = 'el'): string {
  counter += 1
  return `${prefix}_${counter}`
}

export interface TextOpts {
  text: string
  x: number
  y: number
  w: number
  h: number
  fontSize: number
  fontFamily: string
  color: string
  fontWeight?: number | string
  fontStyle?: 'normal' | 'italic'
  align?: 'left' | 'center' | 'right'
  lineHeight?: number
  letterSpacing?: number
  highlight?: string
  highlightColor?: string
  highlightStyle?: 'color' | 'block'
  highlightFg?: string
  role?: TextElement['role']
  z?: number
  rotate?: number
  nowrap?: boolean
  opacity?: number
}

export function text(o: TextOpts): TextElement {
  return {
    id: nextId('t'),
    type: 'text',
    origin: 'composed',
    x: o.x, y: o.y, w: o.w, h: o.h,
    text: o.text,
    fontSize: o.fontSize,
    fontFamily: o.fontFamily,
    fontWeight: o.fontWeight,
    fontStyle: o.fontStyle,
    color: o.color,
    align: o.align ?? 'left',
    lineHeight: o.lineHeight ?? 1.2,
    letterSpacing: o.letterSpacing,
    highlight: o.highlight,
    highlightColor: o.highlightColor,
    highlightStyle: o.highlightStyle,
    highlightFg: o.highlightFg,
    role: o.role,
    z: o.z,
    rotate: o.rotate,
    nowrap: o.nowrap,
    opacity: o.opacity,
  }
}

export interface RectOpts {
  x: number
  y: number
  w: number
  h: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  cornerRadius?: number
  opacity?: number
  z?: number
}

export function rect(o: RectOpts): RectElement {
  return {
    id: nextId('r'),
    type: 'rect',
    origin: 'composed',
    x: o.x, y: o.y, w: o.w, h: o.h,
    fill: o.fill,
    stroke: o.stroke,
    strokeWidth: o.strokeWidth,
    cornerRadius: o.cornerRadius,
    opacity: o.opacity,
    z: o.z,
  }
}

export interface EllipseOpts {
  cx: number
  cy: number
  rx: number
  ry: number
  fill?: string
  stroke?: string
  strokeWidth?: number
  opacity?: number
  z?: number
}

export function ellipse(o: EllipseOpts): EllipseElement {
  return {
    id: nextId('e'),
    type: 'ellipse',
    origin: 'composed',
    x: o.cx - o.rx, y: o.cy - o.ry,
    w: o.rx * 2, h: o.ry * 2,
    fill: o.fill,
    stroke: o.stroke,
    strokeWidth: o.strokeWidth,
    opacity: o.opacity,
    z: o.z,
  }
}

export interface LineOpts {
  x1: number; y1: number; x2: number; y2: number
  stroke: string
  strokeWidth?: number
  z?: number
  opacity?: number
}

export function line(o: LineOpts): LineElement {
  return {
    id: nextId('ln'),
    type: 'line',
    origin: 'composed',
    x: Math.min(o.x1, o.x2),
    y: Math.min(o.y1, o.y2),
    w: Math.abs(o.x2 - o.x1),
    h: Math.abs(o.y2 - o.y1),
    x1: o.x1, y1: o.y1, x2: o.x2, y2: o.y2,
    stroke: o.stroke,
    strokeWidth: o.strokeWidth ?? 2,
    z: o.z,
    opacity: o.opacity,
  }
}

/** Standard top-of-slide eyebrow text using theme accent + caption size. */
export function eyebrow(text_: string, theme: import('../theme').ResolvedTheme): TextElement {
  return text({
    text: text_.toUpperCase(),
    x: theme.padding, y: 60,
    w: 1920 - 2 * theme.padding, h: 40,
    fontSize: theme.caption,
    fontFamily: theme.fontBody,
    color: theme.accent,
    fontWeight: 700,
    letterSpacing: 0.12,
    align: 'left',
    role: 'caption',
  })
}

/**
 * Approximate how many lines a string will wrap to inside `width` at `fontSize`.
 * CJK chars take ~1× fontSize each; Latin takes ~0.55×. Returns ≥ 1.
 *
 * Used to budget heading vertical space before placing content below it.
 */
export function estimateLines(s: string, fontSize: number, width: number): number {
  if (!s) return 1
  // CJK chars + full-width punctuation render wider than fontSize in most
  // sans-serif fonts; Arial Black with CJK fallback can hit 1.2×. Empirically
  // tuning ratio: latin ~0.55, CJK ~1.15.
  const cjkCount = (s.match(/[㐀-鿿぀-ヿ가-힯，。！？：；、（）【】《》「」『』""'']/g) || []).length
  const cjkRatio = cjkCount / Math.max(1, s.length)
  const avgCharWidth = fontSize * (0.55 + 0.6 * cjkRatio)
  const charsPerLine = Math.max(1, Math.floor(width / avgCharWidth))
  const newlineLines = s.split(/\n+/).length
  const wrapped = Math.ceil(s.replace(/\n/g, '').length / charsPerLine)
  return Math.max(1, newlineLines, wrapped)
}

/**
 * Adapt a heading font size so the text never wraps to more than `maxLines`.
 * Shrinks by 8% per iteration until satisfied or a floor (default 60% of base)
 * is hit.
 *
 * Also avoids the "orphan" pattern: when the wrap fits exactly maxLines but
 * the last line ends up with very few characters (≤ 2 CJK chars), shrink one
 * more step so the text balances better. (Browser text-wrap:balance handles
 * this at render time too, but we want estimated layout space to be
 * consistent for both Konva and pptxgenjs output.)
 */
export function fitTitleSize(
  text: string,
  base: number,
  width: number,
  maxLines = 3,
  floorRatio = 0.6,
): number {
  let size = base
  const floor = base * floorRatio
  while (estimateLines(text, size, width) > maxLines && size > floor) {
    size = Math.round(size * 0.92)
  }
  // Orphan check: at the current size, would the last line have only 1-2
  // characters? If so, drop one more step (still respecting floor).
  if (size > floor) {
    const cjkCount = (text.match(/[㐀-鿿぀-ヿ가-힯]/g) || []).length
    const cjkRatio = cjkCount / Math.max(1, text.length)
    const avgCharWidth = size * (0.55 + 0.6 * cjkRatio)
    const charsPerLine = Math.max(1, Math.floor(width / avgCharWidth))
    const remainder = text.replace(/\n/g, '').length % charsPerLine
    if (remainder > 0 && remainder <= 2) {
      size = Math.round(size * 0.92)
    }
  }
  return size
}

// ─── Layout distribution helpers (flex-style position computation) ───────────
//
// These let layout composers describe intent — "stack N rows, center them,
// keep gap proportional to row height" — instead of hand-rolling y arithmetic
// in every layout. Output is still absolute positions, so the rest of the
// rendering / export pipeline stays unchanged.

export type DistributeAlign = 'start' | 'center' | 'end' | 'space-between' | 'space-around'

export interface DistributeResult { y: number; h: number }

/**
 * Distribute N items vertically within [top, top+available].
 *
 * - `rowH`: intrinsic row height (single text line + padding, etc.)
 * - `minGap`: minimum spacing between rows
 * - `align`:
 *     'start'         — items pinned to the top, gap = minGap
 *     'center'        — items centered as a single block, gap = minGap
 *     'end'           — items pinned to the bottom
 *     'space-between' — first item at top, last at bottom, gap distributed
 *     'space-around'  — equal padding above/below each item
 *
 * Returns one DistributeResult per item with computed `y` (absolute) and `h`.
 * The rowH stays constant; only y changes per item.
 */
export function distributeV(opts: {
  top: number
  available: number
  count: number
  rowH: number
  minGap: number
  align: DistributeAlign
}): DistributeResult[] {
  const { top, available, count, rowH, minGap, align } = opts
  if (count <= 0) return []

  const minTotal = count * rowH + (count - 1) * minGap
  const slack = Math.max(0, available - minTotal)

  // Effective starting y and per-item gap depend on align mode.
  let startY = top
  let gap = minGap

  if (slack <= 0 || align === 'start') {
    startY = top
    gap = minGap
  } else if (align === 'center') {
    startY = top + slack / 2
    gap = minGap
  } else if (align === 'end') {
    startY = top + slack
    gap = minGap
  } else if (align === 'space-between' && count > 1) {
    startY = top
    gap = minGap + slack / (count - 1)
  } else if (align === 'space-around') {
    const pad = slack / (count * 2)
    startY = top + pad
    gap = minGap + pad * 2
  }

  const out: DistributeResult[] = []
  for (let i = 0; i < count; i++) {
    out.push({
      y: Math.round(startY + i * (rowH + gap)),
      h: rowH,
    })
  }
  return out
}

/**
 * Distribute N items horizontally within [left, left+available].
 * Same semantics as distributeV, on the x axis.
 */
export function distributeH(opts: {
  left: number
  available: number
  count: number
  colW: number
  minGap: number
  align: DistributeAlign
}): Array<{ x: number; w: number }> {
  const { left, available, count, colW, minGap, align } = opts
  if (count <= 0) return []
  const minTotal = count * colW + (count - 1) * minGap
  const slack = Math.max(0, available - minTotal)

  let startX = left
  let gap = minGap
  if (slack <= 0 || align === 'start') { startX = left; gap = minGap }
  else if (align === 'center') { startX = left + slack / 2 }
  else if (align === 'end') { startX = left + slack }
  else if (align === 'space-between' && count > 1) { startX = left; gap = minGap + slack / (count - 1) }
  else if (align === 'space-around') { const pad = slack / (count * 2); startX = left + pad; gap = minGap + pad * 2 }

  const out: Array<{ x: number; w: number }> = []
  for (let i = 0; i < count; i++) {
    out.push({ x: Math.round(startX + i * (colW + gap)), w: colW })
  }
  return out
}

/**
 * Compute a tight heading box height that contains the wrapped text.
 * Adds a small bottom-pad so descenders + Konva's slight overshoot don't
 * touch the next element.
 */
export function headingHeight(s: string, fontSize: number, width: number, lineHeight = 1.22): number {
  const lines = estimateLines(s, fontSize, width)
  return Math.ceil(lines * fontSize * lineHeight) + 8
}
