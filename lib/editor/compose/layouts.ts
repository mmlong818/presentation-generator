// ─── 21 个版式 composer ──────────────────────────────────────────────────────
//
// 每个 composer: (slide, theme, n, total) -> SlideElement[]
// 同一份数据驱动 Konva 渲染 + pptxgenjs 导出。
//
// 坐标系 1920×1080 源 px。所有字号 / padding 走 theme token，主题之间字号
// 自动分级。
//
// 设计原则：
// - 简单直接，不做花哨装饰
// - 字号层级清晰：hero > section > body > caption
// - padding 留白由主题决定（academic 160px，brutalist 100px 等）
// - 高亮单词用 theme.accent 着色（highlight 字段）

import type {
  CoverSlide, StatementSlide, ProcessSlide, DataSlide, CompareSlide,
  TimelineSlide, ArgumentSlide, QuoteSlide, DiagramSlide, CTASlide,
  ChecklistSlide, Matrix2x2Slide, ChartBarSlide, ChartLineSlide,
  ChartPieSlide, ChartAreaSlide, KpiBoardSlide,
  RoadmapSlide, CaseStudySlide, TableSlide, CausalitySlide, PersonaSlide,
  QuadrantSlide, QuestionSlide, Slide,
} from '../../types'
import type { ResolvedTheme } from '../theme'
import type { SlideElement, TextElement } from '../types'
import { CANVAS_H, CANVAS_W } from '../types'
import { distributeH, distributeV, eyebrow, ellipse, fitTitleSize, headingHeight, line, rect, text, estimateLines } from './helpers'
import { buildLineChartSVG, buildPieChartSVG, buildAreaChartSVG, svgToDataUrl } from './charts'

// ─── helpers used across many layouts ────────────────────────────────────────

function bodyFont(theme: ResolvedTheme) { return theme.fontBody }
function displayFont(theme: ResolvedTheme) { return theme.fontDisplay }
function inner(theme: ResolvedTheme) { return CANVAS_W - 2 * theme.padding }

/**
 * Return the appropriate highlight emphasis for the theme.
 *
 * Most themes use color-based highlight (accent recolors the text). But some
 * themes (brutalist-mono) deliberately set accent === text, so color emphasis
 * disappears. For these, switch to inverted-block fill — text foreground
 * becomes the theme's background, span fills with the text color.
 */
function emphFor(theme: ResolvedTheme): {
  highlightColor: string
  highlightStyle?: 'color' | 'block'
  highlightFg?: string
} {
  const accent = (theme.accent || '').toLowerCase()
  const text = (theme.text || '').toLowerCase()
  if (accent === text || accent === '#000000' && text === '#000000') {
    return { highlightColor: theme.text, highlightStyle: 'block', highlightFg: theme.bg }
  }
  return { highlightColor: theme.accent }
}

function headingEl(value: string, theme: ResolvedTheme, opts: {
  y?: number; size?: number; highlight?: string
} = {}): TextElement {
  const size = opts.size ?? theme.section
  const w = inner(theme)
  // Allocate height for the actual number of wrapped lines, not a guess.
  const h = headingHeight(value, size, w, 1.22)
  const emph = emphFor(theme)
  return text({
    text: value,
    x: theme.padding,
    y: opts.y ?? 130,
    w,
    h,
    fontSize: size,
    fontFamily: displayFont(theme),
    color: theme.text,
    fontWeight: 800,
    lineHeight: 1.22,
    highlight: opts.highlight,
    ...emph,
    role: 'heading',
  })
}

/** Return the y-coordinate immediately below a heading placed at `y`. */
function afterHeading(value: string, theme: ResolvedTheme, y: number, size?: number, gap = 40): number {
  const fs = size ?? theme.section
  return y + headingHeight(value, fs, inner(theme), 1.22) + gap
}

function pageNumEl(n: number, total: number, theme: ResolvedTheme): TextElement {
  return text({
    text: `${String(n).padStart(2, '0')} / ${String(total).padStart(2, '0')}`,
    x: theme.padding,
    y: CANVAS_H - 50,
    w: inner(theme),
    h: 30,
    fontSize: 18,
    fontFamily: bodyFont(theme),
    color: theme.muted,
    align: 'right',
    role: 'caption',
  })
}

// ─── COVER ───────────────────────────────────────────────────────────────────
//
// Editorial-style left-aligned hierarchy. Vertically centered block:
//   [eyebrow (caption-size, accent, uppercase tracked)]
//   [TITLE (hero-size, dark)]
//   [thin accent rule]
//   [subtitle (body-size, muted)]
//
// All vertical positions computed from text-measure helpers so multi-line
// titles never collide with the subtitle.

function composeCover(s: CoverSlide, theme: ResolvedTheme): SlideElement[] {
  const out: SlideElement[] = []
  const x = theme.padding
  const w = inner(theme)

  const eyebrowSize = theme.caption
  // Cover titles read cleanest at 2 lines; allow 3 only as fallback if a single
  // line is too long to compress without going under the floor.
  const titleSize = fitTitleSize(s.title, theme.hero, w, 2, 0.6)
  const subtitleSize = theme.body * 1.05

  const titleLineH = 1.18
  const titleH = headingHeight(s.title, titleSize, w, titleLineH)
  const subtitleH = s.subtitle
    ? headingHeight(s.subtitle, subtitleSize, w, 1.4)
    : 0

  // Spacing constants (px in source coords)
  const eyebrowGap = 36           // gap below eyebrow row → title top
  const ruleGap = 36              // gap title → rule
  const ruleH = 4
  const subtitleGap = 32          // gap rule → subtitle
  const eyebrowRowH = 42

  const blockH =
    (s.eyebrow ? eyebrowRowH + eyebrowGap : 0)
    + titleH
    + (s.subtitle ? ruleGap + ruleH + subtitleGap + subtitleH : 0)

  // Vertically center, with a slight upward bias for an editorial feel.
  let cursorY = Math.max(180, Math.round((CANVAS_H - blockH) / 2 - 60))

  if (s.eyebrow) {
    out.push(text({
      text: s.eyebrow.toUpperCase(),
      x, y: cursorY, w, h: eyebrowRowH,
      fontSize: eyebrowSize,
      fontFamily: bodyFont(theme),
      color: theme.accent,
      fontWeight: 700,
      letterSpacing: 0.12,
      align: 'left',
      lineHeight: 1.4,
      role: 'caption',
    }))
    cursorY += eyebrowRowH + eyebrowGap
  }

  out.push(text({
    text: s.title,
    x, y: cursorY, w, h: titleH,
    fontSize: titleSize,
    fontFamily: displayFont(theme),
    color: theme.text,
    fontWeight: 800,
    lineHeight: titleLineH,
    letterSpacing: -0.01,
    highlight: s.highlight,
    ...emphFor(theme),
    role: 'hero',
  }))
  cursorY += titleH

  if (s.subtitle) {
    cursorY += ruleGap
    out.push(rect({
      x, y: cursorY, w: 96, h: ruleH,
      fill: theme.accent,
    }))
    cursorY += ruleH + subtitleGap

    out.push(text({
      text: s.subtitle,
      x, y: cursorY, w, h: subtitleH,
      fontSize: subtitleSize,
      fontFamily: bodyFont(theme),
      color: theme.muted,
      lineHeight: 1.4,
      role: 'body',
    }))
  }

  return out
}

// ─── STATEMENT ───────────────────────────────────────────────────────────────

function composeStatement(s: StatementSlide, theme: ResolvedTheme): SlideElement[] {
  const align = s.align ?? 'center'
  const w = inner(theme)
  // Statement should land cleanly on 1–2 lines. Browser line-break can't
  // optimize globally so a 3-line wrap often orphans tail punctuation; force
  // a shrink that fits in ≤2 lines so the layout reads as a unified beat.
  const base = theme.hero * 1.1
  const fs = fitTitleSize(s.title, base, w, 2, 0.5)
  const titleH = headingHeight(s.title, fs, w, 1.18)
  // Vertical center with slight bias above center.
  const y = Math.max(160, Math.round((CANVAS_H - titleH) / 2 - 30))

  return [text({
    text: s.title,
    x: theme.padding, y, w, h: titleH,
    fontSize: fs,
    fontFamily: displayFont(theme),
    color: theme.text,
    fontWeight: 800,
    lineHeight: 1.18,
    letterSpacing: -0.01,
    align,
    highlight: s.highlight?.[0],
    ...emphFor(theme),
    role: 'hero',
  })]
}

// ─── ARGUMENT ────────────────────────────────────────────────────────────────

function composeArgument(s: ArgumentSlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  const x = theme.padding
  const w = inner(theme)

  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))

  // Heading: fit to ≤2 lines, optional highlight
  const headSize = fitTitleSize(s.heading, theme.section * 1.05, w, 2, 0.7)
  out.push(headingEl(s.heading, theme, { y: 130, size: headSize, highlight: s.highlight }))

  // Points: two-column rows (number badge + body text)
  const points = s.points ?? []
  if (points.length === 0) return out

  const count = points.length
  const top = afterHeading(s.heading, theme, 130, headSize, 60)
  const bot = CANVAS_H - 100

  // Adapt size to count: fewer points → larger text + more breathing room;
  // more points → smaller text so all fit without crowding.
  const sizeScale = count <= 3 ? 1.4
    : count === 4 ? 1.2
    : count === 5 ? 1.05
    : 0.95
  const bodySize = theme.body * sizeScale
  const numSize = bodySize * 0.85
  const numW = 88
  const numGap = 28
  // Indent the list ~2 characters in from the left margin so it sits visually
  // beneath the heading's body, not flush with the slide edge.
  const indent = Math.round(bodySize * 2)
  const itemX = x + indent

  // Estimate longest point's wrapped line count so rowH reserves enough
  // vertical room when points are long-form (multi-line) — previously fixed
  // rowH=bodySize*1.7 caused two-line points to crowd each other.
  const textW = w - indent - numW - numGap
  const maxLines = points.reduce(
    (a, p) => Math.max(a, estimateLines(p, bodySize, textW)),
    1,
  )
  const lineH = bodySize * 1.5
  // Row holds the text block plus a small bottom padding for breathing room.
  const rowH = Math.max(bodySize * 1.7, maxLines * lineH + bodySize * 0.3)
  // Gap scales with row height so multi-line rows aren't visually mashed.
  const minGap = maxLines === 1 ? bodySize * 1.2 : bodySize * 0.9

  const rows = distributeV({
    top,
    available: bot - top,
    count,
    rowH,
    minGap,
    align: 'center',
  })

  points.forEach((p, i) => {
    const { y, h: rowH } = rows[i]
    out.push(text({
      text: String(i + 1).padStart(2, '0'),
      x: itemX, y, w: numW, h: rowH,
      fontSize: numSize,
      fontFamily: displayFont(theme),
      color: theme.accent,
      fontWeight: 700,
      letterSpacing: 0.04,
      lineHeight: 1.4,
      role: 'caption',
    }))
    out.push(text({
      text: p,
      x: itemX + numW + numGap, y, w: w - indent - numW - numGap, h: rowH,
      fontSize: bodySize,
      fontFamily: bodyFont(theme),
      color: theme.text,
      lineHeight: 1.5,
      role: 'body',
    }))
  })

  out.push(pageNumEl(n, total, theme))
  return out
}

// ─── DATA ────────────────────────────────────────────────────────────────────

function composeData(s: DataSlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  const x = theme.padding
  const w = inner(theme)

  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  const headSize = fitTitleSize(s.heading, theme.section, w, 2, 0.7)
  out.push(headingEl(s.heading, theme, { y: 130, size: headSize }))

  const stats = s.stats ?? []
  const count = stats.length
  if (count === 0) return out

  const top = afterHeading(s.heading, theme, 130, headSize, 60)
  const bot = CANVAS_H - 100
  const avail = bot - top

  if (count <= 3) {
    const [primary, ...secondary] = stats
    const primaryW = count === 1 ? w : w * 0.58
    const primarySize = theme.hero * 1.18
    const primaryEstimate = primary.value.length * primarySize * 0.6
    const primaryFont = primaryEstimate > primaryW
      ? Math.max(primarySize * 0.52, primaryW / primary.value.length / 0.6)
      : primarySize
    const primaryY = top + Math.max(20, avail * 0.23)
    const primaryAlign = count === 1 ? 'center' as const : 'left' as const

    out.push(text({
      text: primary.value || '—',
      x, y: primaryY, w: primaryW, h: primaryFont * 1.15,
      fontSize: primaryFont,
      fontFamily: displayFont(theme),
      color: theme.accent,
      fontWeight: 800,
      lineHeight: 1.0,
      letterSpacing: -0.02,
      align: primaryAlign,
      role: 'hero',
      nowrap: true,
      ...(primary.value === '—' || primary.value === '-' ? { opacity: 0.35 } : {}),
    }))
    out.push(text({
      text: primary.label,
      x, y: primaryY + primaryFont * 1.15 + 22, w: primaryW, h: theme.body * 2.2,
      fontSize: theme.body * 1.05,
      fontFamily: bodyFont(theme),
      color: theme.text,
      fontWeight: 700,
      lineHeight: 1.4,
      align: primaryAlign,
      role: 'body',
    }))
    if (primary.source) {
      out.push(text({
        text: primary.source,
        x, y: primaryY + primaryFont * 1.15 + theme.body * 2.2 + 28, w: primaryW, h: theme.caption * 2,
        fontSize: theme.caption * 0.9,
        fontFamily: bodyFont(theme),
        color: theme.muted,
        fontStyle: 'italic',
        align: primaryAlign,
        role: 'caption',
      }))
    }

    if (secondary.length > 0) {
      const dividerX = x + w * 0.64
      const rightX = dividerX + 48
      const rightW = x + w - rightX
      const rowH = avail / secondary.length
      out.push(line({ x1: dividerX, y1: top, x2: dividerX, y2: bot, stroke: theme.border, strokeWidth: 2 }))
      secondary.forEach((stat, index) => {
        const rowTop = top + rowH * index
        if (index > 0) out.push(line({ x1: dividerX, y1: rowTop, x2: x + w, y2: rowTop, stroke: theme.border, strokeWidth: 1 }))
        const valueSize = theme.hero * 0.58
        const estimate = stat.value.length * valueSize * 0.6
        const valueFont = estimate > rightW ? Math.max(valueSize * 0.56, rightW / stat.value.length / 0.6) : valueSize
        const valueY = rowTop + Math.max(24, rowH * 0.18)
        out.push(text({
          text: stat.value || '—',
          x: rightX, y: valueY, w: rightW, h: valueFont * 1.1,
          fontSize: valueFont,
          fontFamily: displayFont(theme),
          color: theme.text,
          fontWeight: 750,
          lineHeight: 1.0,
          nowrap: true,
          role: 'hero',
          ...(stat.value === '—' || stat.value === '-' ? { opacity: 0.35 } : {}),
        }))
        out.push(text({
          text: stat.label,
          x: rightX, y: valueY + valueFont * 1.1 + 16, w: rightW, h: theme.body * 1.9,
          fontSize: theme.body * 0.88,
          fontFamily: bodyFont(theme),
          color: theme.text,
          fontWeight: 700,
          lineHeight: 1.35,
          role: 'body',
        }))
        if (stat.source) {
          out.push(text({
            text: stat.source,
            x: rightX, y: valueY + valueFont * 1.1 + theme.body * 1.9 + 18, w: rightW, h: theme.caption * 1.8,
            fontSize: theme.caption * 0.82,
            fontFamily: bodyFont(theme),
            color: theme.muted,
            fontStyle: 'italic',
            lineHeight: 1.35,
            role: 'caption',
          }))
        }
      })
    }

    out.push(pageNumEl(n, total, theme))
    return out
  }

  // Adapt value font to stat count: 2-3 stats → giant; 4 → tighter; 5+ → smaller.
  const valueScale = count <= 2 ? 1.0
    : count === 3 ? 0.9
    : count === 4 ? 0.7
    : 0.6
  const valueSize = theme.hero * valueScale
  const labelSize = theme.body * (count <= 3 ? 1.05 : 0.95)
  const sourceSize = theme.caption * 0.95

  // Distribute stat columns horizontally with consistent gutter.
  const gutter = 60
  const cols = distributeH({
    left: x, available: w, count,
    colW: (w - gutter * (count - 1)) / count,
    minGap: gutter,
    align: 'start',
  })

  // Vertical block: value + label + (optional) source. Centered in avail area.
  const valueH = valueSize * 1.15
  const labelH = labelSize * 2.4
  const hasSource = stats.some(st => !!st.source)
  const sourceH = sourceSize * 2
  const blockH = valueH + 18 + labelH + (hasSource ? 20 + sourceH : 0)
  const blockY = top + Math.max(0, (avail - blockH) / 2)

  stats.forEach((stat, i) => {
    const { x: cx, w: cw } = cols[i]
    // Long values like "4h → 18h" or "¥1.2 亿" need nowrap + auto-shrink.
    const valueStr = stat.value || '—'
    // Rough fit: assume display-weight char ≈ valueSize * 0.6 wide.
    const estWidth = valueStr.length * valueSize * 0.6
    const valueFontSize = estWidth > cw ? Math.max(valueSize * 0.5, (cw / valueStr.length) / 0.6) : valueSize
    out.push(text({
      text: valueStr,
      x: cx, y: blockY, w: cw, h: valueH,
      fontSize: valueFontSize,
      fontFamily: displayFont(theme),
      color: theme.accent,
      fontWeight: 800,
      lineHeight: 1.0,
      letterSpacing: -0.02,
      role: 'hero',
      nowrap: true,
    }))
    out.push(text({
      text: stat.label,
      x: cx, y: blockY + valueH + 18, w: cw, h: labelH,
      fontSize: labelSize,
      fontFamily: bodyFont(theme),
      color: theme.text,
      fontWeight: 700,
      lineHeight: 1.4,
      role: 'body',
    }))
    if (stat.source) {
      out.push(text({
        text: stat.source,
        x: cx, y: blockY + valueH + 18 + labelH + 20, w: cw, h: sourceH,
        fontSize: sourceSize,
        fontFamily: bodyFont(theme),
        color: theme.muted,
        fontStyle: 'italic',
        lineHeight: 1.4,
        role: 'caption',
      }))
    }
  })

  out.push(pageNumEl(n, total, theme))
  return out
}

// ─── COMPARE ─────────────────────────────────────────────────────────────────

function composeCompare(s: CompareSlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  const x = theme.padding
  const w = inner(theme)

  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  const headSize = fitTitleSize(s.heading, theme.section, w, 2, 0.7)
  out.push(headingEl(s.heading, theme, { y: 130, size: headSize }))

  const top = afterHeading(s.heading, theme, 130, headSize, 60)
  const bot = CANVAS_H - 100
  const panelH = bot - top

  // Two equal columns side by side.
  const panelGap = 48
  const cols = distributeH({
    left: x, available: w, count: 2,
    colW: (w - panelGap) / 2,
    minGap: panelGap, align: 'start',
  })

  const renderPanel = (data: { title: string; items: string[] }, colIdx: number) => {
    const { x: px, w: pw } = cols[colIdx]
    // Right panel gets a subtle accent tint to suggest "this is the answer".
    const isAccent = colIdx === 1
    out.push(rect({
      x: px, y: top, w: pw, h: panelH,
      fill: isAccent ? theme.accent : theme.paper,
      opacity: isAccent ? 0.08 : 1,
      cornerRadius: 8,
    }))

    // Panel inner padding — at least 2 char widths so content has visible breathing room.
    const itemCount = data.items?.length ?? 0
    const previewItemSize = theme.body * (itemCount <= 3 ? 1.1 : itemCount === 4 ? 1.0 : 0.9)
    const ipad = Math.max(56, Math.round(previewItemSize * 1.8))

    // Panel title (small caps caption-style)
    const titleSize = theme.caption * 1.3
    const titleH = titleSize * 1.5
    out.push(text({
      text: data.title,
      x: px + ipad, y: top + ipad,
      w: pw - 2 * ipad, h: titleH,
      fontSize: titleSize,
      fontFamily: bodyFont(theme),
      color: isAccent ? theme.accent : theme.muted,
      fontWeight: 700,
      letterSpacing: 0.06,
      role: 'caption',
    }))

    // Items: vertical stack, centered in panel below title.
    if (itemCount === 0) return
    const itemSize = previewItemSize
    const itemTop = top + ipad + titleH + 28
    const itemAvail = panelH - (itemTop - top) - ipad
    const rows = distributeV({
      top: itemTop, available: itemAvail,
      count: itemCount,
      rowH: itemSize * 1.7,
      minGap: itemSize * 0.9,
      align: 'center',
    })

    data.items.forEach((it, i) => {
      const { y, h: rowH } = rows[i]
      // Bullet dot in accent color
      const dotR = itemSize * 0.18
      const dotCY = y + rowH / 2
      out.push(ellipse({
        cx: px + ipad + dotR,
        cy: dotCY,
        rx: dotR, ry: dotR,
        fill: isAccent ? theme.accent : theme.text,
        opacity: isAccent ? 1 : 0.7,
      }))
      out.push(text({
        text: it,
        x: px + ipad + dotR * 3 + 12,
        y, w: pw - 2 * ipad - dotR * 3 - 12, h: rowH,
        fontSize: itemSize,
        fontFamily: bodyFont(theme),
        color: theme.text,
        lineHeight: 1.45,
        role: 'body',
      }))
    })
  }

  renderPanel(s.left, 0)
  renderPanel(s.right, 1)
  out.push(pageNumEl(n, total, theme))
  return out
}

// ─── PROCESS ─────────────────────────────────────────────────────────────────

function composeProcess(s: ProcessSlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  const x = theme.padding
  const w = inner(theme)

  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  const headSize = fitTitleSize(s.heading, theme.section, w, 2, 0.7)
  out.push(headingEl(s.heading, theme, { y: 130, size: headSize }))

  const steps = s.steps ?? []
  const count = steps.length
  if (count === 0) return out

  const top = afterHeading(s.heading, theme, 130, headSize, 60)
  const bot = CANVAS_H - 100

  const titleSize = theme.body * (count <= 4 ? 1.05 : 0.9)
  const descSize = theme.caption * (count <= 4 ? 1.05 : 0.92)
  const gap = 24
  const cols = distributeH({
    left: x, available: w, count,
    colW: (w - gap * (count - 1)) / count,
    minGap: gap,
    align: 'start',
  })
  const avail = bot - top
  const railY = top + Math.max(120, avail * 0.34)
  const markerR = count >= 6 ? 30 : 36
  const firstCX = cols[0].x + cols[0].w / 2
  const lastCX = cols[cols.length - 1].x + cols[cols.length - 1].w / 2

  out.push(line({ x1: firstCX, y1: railY, x2: lastCX, y2: railY, stroke: theme.border, strokeWidth: 2 }))

  steps.forEach((step, i) => {
    const { x: cx, w: cw } = cols[i]
    const markerCX = cx + cw / 2
    out.push(ellipse({
      cx: markerCX, cy: railY,
      rx: markerR, ry: markerR,
      fill: theme.bg,
      stroke: theme.accent,
      strokeWidth: 2,
    }))
    out.push(text({
      text: String(i + 1).padStart(2, '0'),
      x: markerCX - markerR, y: railY - markerR * 0.52,
      w: markerR * 2, h: markerR * 1.1,
      fontSize: markerR * 0.68,
      fontFamily: displayFont(theme),
      color: theme.accent,
      fontWeight: 800,
      lineHeight: 1.0,
      align: 'center',
      role: 'caption',
    }))
    const titleY = railY + markerR + 34
    out.push(text({
      text: step.title,
      x: cx + 12, y: titleY, w: cw - 24, h: titleSize * 2.7,
      fontSize: titleSize,
      fontFamily: displayFont(theme),
      color: theme.text,
      fontWeight: 700,
      lineHeight: 1.3,
      align: 'center',
      role: 'body',
    }))
    if (step.desc) {
      out.push(text({
        text: step.desc,
        x: cx + 12, y: titleY + titleSize * 2.2,
        w: cw - 24, h: Math.max(100, bot - titleY - titleSize * 2.2),
        fontSize: descSize,
        fontFamily: bodyFont(theme),
        color: theme.muted,
        lineHeight: 1.5,
        align: 'center',
        role: 'caption',
      }))
    }
  })

  out.push(pageNumEl(n, total, theme))
  return out
}

// ─── TIMELINE ────────────────────────────────────────────────────────────────

function composeTimeline(s: TimelineSlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  out.push(headingEl(s.heading, theme))

  const events = s.events ?? []
  const headEnd = afterHeading(s.heading, theme, 130, undefined, 0)
  // Rail sits halfway down the remaining canvas so events have room above + below.
  const railY = headEnd + Math.max(120, (CANVAS_H - headEnd - 80) / 2 - 40)
  const total_w = inner(theme)
  const gap = 24
  const count = Math.max(1, events.length)
  const each_w = (total_w - gap * (count - 1)) / count

  out.push(rect({ x: theme.padding, y: railY, w: total_w, h: 3, fill: theme.border }))

  events.forEach((ev, i) => {
    const x = theme.padding + i * (each_w + gap)
    const cx = x + each_w / 2
    out.push(ellipse({ cx, cy: railY + 1.5, rx: 12, ry: 12, fill: theme.accent }))
    out.push(text({
      text: ev.time,
      x, y: railY - 90, w: each_w, h: 60,
      fontSize: theme.caption * 1.3,
      fontFamily: bodyFont(theme),
      color: theme.accent,
      fontWeight: 700,
      align: 'center',
      role: 'caption',
    }))
    out.push(text({
      text: ev.title,
      x, y: railY + 40, w: each_w, h: 80,
      fontSize: theme.body * 0.95,
      fontFamily: bodyFont(theme),
      color: theme.text,
      fontWeight: 700,
      align: 'center',
      lineHeight: 1.3,
      role: 'body',
    }))
    if (ev.desc) {
      out.push(text({
        text: ev.desc,
        x, y: railY + 140, w: each_w, h: 200,
        fontSize: theme.caption,
        fontFamily: bodyFont(theme),
        color: theme.muted,
        align: 'center',
        lineHeight: 1.5,
        role: 'caption',
      }))
    }
  })
  out.push(pageNumEl(n, total, theme))
  return out
}

// ─── QUOTE ───────────────────────────────────────────────────────────────────

function composeQuote(s: QuoteSlide, theme: ResolvedTheme): SlideElement[] {
  const out: SlideElement[] = []
  const x = theme.padding
  const w = inner(theme)

  // Decorative opening quote mark — a supporting accent, not the protagonist.
  // Sized to ~section, color muted so it frames the quote without competing.
  const markSize = Math.round(theme.section * 1.1)
  const markW = Math.round(markSize * 0.7)
  const markGap = 24
  const textX = x + markW + markGap
  const textW = w - markW - markGap

  out.push(text({
    text: '“',  // LEFT DOUBLE QUOTATION MARK
    x, y: 180, w: markW, h: markSize * 0.9,
    fontSize: markSize,
    fontFamily: displayFont(theme),
    color: theme.muted,
    fontWeight: 700,
    lineHeight: 1.0,
  }))

  // Quote text is the hero — push close to theme.hero, allow up to 5 lines.
  const baseSize = Math.round(theme.hero * 0.55)
  const quoteSize = fitTitleSize(s.quote, baseSize, textW, 5, 0.55)
  const quoteH = headingHeight(s.quote, quoteSize, textW, 1.4)

  // Vertically center the quote + source block in the slide.
  const sourceH = s.source ? theme.body * 1.6 : 0
  const sourceGap = s.source ? 36 : 0
  const blockH = quoteH + sourceGap + sourceH
  // Restrict centering area to avoid clashing with the giant mark above.
  const minY = 220
  const maxY = CANVAS_H - 100
  const blockY = Math.max(minY, (minY + maxY - blockH) / 2)

  out.push(text({
    text: s.quote,
    x: textX, y: blockY, w: textW, h: quoteH,
    fontSize: quoteSize,
    fontFamily: displayFont(theme),
    color: theme.text,
    fontWeight: 500,
    lineHeight: 1.4,
    highlight: s.highlight,
    ...emphFor(theme),
    role: 'heading',
  }))

  if (s.source) {
    out.push(text({
      text: `— ${s.source}`,
      x: textX, y: blockY + quoteH + sourceGap, w: textW, h: sourceH,
      fontSize: theme.body * 0.95,
      fontFamily: bodyFont(theme),
      color: theme.muted,
      letterSpacing: 0.02,
      role: 'caption',
    }))
  }

  return out
}

// ─── CTA ─────────────────────────────────────────────────────────────────────

function composeCTA(s: CTASlide, theme: ResolvedTheme): SlideElement[] {
  const out: SlideElement[] = []
  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  let y = 240
  if (s.oldQuestion) {
    out.push(text({
      text: s.oldQuestion,
      x: theme.padding, y, w: inner(theme), h: theme.body * 2.4,
      fontSize: theme.body * 1.2,
      fontFamily: bodyFont(theme),
      color: theme.muted,
      lineHeight: 1.4,
      role: 'body',
    }))
    y += theme.body * 2.8 + 40
  }
  // Short newAction reads great at hero size; long ones must shrink to fit
  // 2-3 lines. Use fitTitleSize so the call-to-action always feels intentional.
  const actionMax = theme.hero * 0.95
  const actionSize = fitTitleSize(s.newAction, actionMax, inner(theme), 3, 0.5)
  out.push(text({
    text: s.newAction,
    x: theme.padding, y, w: inner(theme), h: 500,
    fontSize: actionSize,
    fontFamily: displayFont(theme),
    color: theme.text,
    fontWeight: 800,
    lineHeight: 1.15,
    highlight: s.highlight,
    ...emphFor(theme),
    role: 'hero',
  }))
  return out
}

// ─── CHECKLIST ───────────────────────────────────────────────────────────────

function composeChecklist(s: ChecklistSlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  const x = theme.padding
  const w = inner(theme)

  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  const headSize = fitTitleSize(s.heading, theme.section, w, 2, 0.7)
  out.push(headingEl(s.heading, theme, { y: 130, size: headSize }))

  const items = s.items ?? []
  const count = items.length
  if (count === 0) return out

  const top = afterHeading(s.heading, theme, 130, headSize, 60)
  const bot = CANVAS_H - 100

  // Adapt size to count, mirroring argument's pattern.
  const sizeScale = count <= 3 ? 1.35 : count === 4 ? 1.15 : count === 5 ? 1.0 : 0.9
  const bodySize = theme.body * sizeScale
  const checkBox = bodySize * 1.1
  const indent = Math.round(bodySize * 2)
  const itemX = x + indent

  const rows = distributeV({
    top, available: bot - top, count,
    rowH: bodySize * 1.7,
    minGap: bodySize * 1.1,
    align: 'center',
  })

  items.forEach((item, i) => {
    const { y, h: rowH } = rows[i]
    const cy = y + (rowH - checkBox) / 2

    // Filled accent box with white check
    out.push(rect({
      x: itemX, y: cy, w: checkBox, h: checkBox,
      fill: theme.accent, cornerRadius: Math.max(4, checkBox * 0.15),
    }))
    out.push(text({
      text: '✓',
      x: itemX, y: cy, w: checkBox, h: checkBox,
      fontSize: checkBox * 0.65,
      fontFamily: displayFont(theme),
      color: theme.bg,
      fontWeight: 800,
      align: 'center',
      lineHeight: 1.0,
    }))

    // Item text
    out.push(text({
      text: item,
      x: itemX + checkBox + 24, y, w: w - indent - checkBox - 24, h: rowH,
      fontSize: bodySize,
      fontFamily: bodyFont(theme),
      color: theme.text,
      lineHeight: rowH / bodySize,
      role: 'body',
    }))
  })

  out.push(pageNumEl(n, total, theme))
  return out
}

// ─── QUESTION ────────────────────────────────────────────────────────────────

function composeQuestion(s: QuestionSlide, theme: ResolvedTheme): SlideElement[] {
  const out: SlideElement[] = []
  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  out.push(text({
    text: '?',
    x: theme.padding, y: 200,
    w: 400, h: 600,
    fontSize: 400,
    fontFamily: displayFont(theme),
    color: theme.accent,
    fontWeight: 800,
    lineHeight: 1.0,
  }))
  out.push(text({
    text: s.question,
    x: theme.padding + 440, y: 260,
    w: inner(theme) - 440, h: 280,
    fontSize: theme.section * 0.95,
    fontFamily: displayFont(theme),
    color: theme.text,
    fontWeight: 700,
    lineHeight: 1.25,
    role: 'heading',
  }))
  const hints = s.hints ?? []
  hints.forEach((h, i) => {
    out.push(text({
      text: `· ${h}`,
      x: theme.padding + 440, y: 560 + i * (theme.body * 1.8),
      w: inner(theme) - 440, h: theme.body * 1.8,
      fontSize: theme.body,
      fontFamily: bodyFont(theme),
      color: theme.muted,
      lineHeight: 1.4,
      role: 'body',
    }))
  })
  if (s.invitation) {
    out.push(text({
      text: s.invitation,
      x: theme.padding + 440, y: 940,
      w: inner(theme) - 440, h: 60,
      fontSize: theme.caption * 1.3,
      fontFamily: bodyFont(theme),
      color: theme.accent,
      fontWeight: 700,
      role: 'caption',
    }))
  }
  return out
}

// ─── DIAGRAM (placeholder) ───────────────────────────────────────────────────

function composeDiagram(s: DiagramSlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  out.push(headingEl(s.heading, theme))
  const top = afterHeading(s.heading, theme, 130)
  const h = CANVAS_H - top - 80
  out.push(rect({
    x: theme.padding, y: top,
    w: inner(theme), h,
    fill: theme.paper, cornerRadius: 8,
  }))
  out.push(text({
    text: s.hint,
    x: theme.padding, y: top + h / 2 - 50,
    w: inner(theme), h: 100,
    fontSize: theme.body,
    fontFamily: bodyFont(theme),
    color: theme.muted,
    align: 'center',
    lineHeight: 1.5,
    role: 'body',
  }))
  out.push(pageNumEl(n, total, theme))
  return out
}

// ─── MATRIX 2x2 ──────────────────────────────────────────────────────────────

function composeMatrix2x2(s: Matrix2x2Slide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  out.push(headingEl(s.heading, theme))

  const gridX = theme.padding + 80
  const gridY = afterHeading(s.heading, theme, 130)
  const gridW = inner(theme) - 80
  const gridH = CANVAS_H - gridY - 120  // leave room for axis labels + takeaway
  const gap = 16
  const cellW = (gridW - gap) / 2
  const cellH = (gridH - gap) / 2

  const positions: Array<[number, number]> = [
    [gridX, gridY],
    [gridX + cellW + gap, gridY],
    [gridX, gridY + cellH + gap],
    [gridX + cellW + gap, gridY + cellH + gap],
  ]

  s.cells.forEach((cell, i) => {
    const [cx, cy] = positions[i]
    const emph = !!cell.emphasis
    out.push(rect({
      x: cx, y: cy, w: cellW, h: cellH,
      fill: emph ? theme.accent : theme.paper,
      opacity: emph ? 0.12 : 1,
      cornerRadius: 6,
    }))
    out.push(text({
      text: cell.label,
      x: cx + 28, y: cy + 24, w: cellW - 56, h: theme.section * 0.85,
      fontSize: theme.section * 0.6,
      fontFamily: displayFont(theme),
      color: emph ? theme.accent : theme.text,
      fontWeight: 800,
      role: 'heading',
    }))
    if (cell.desc) {
      out.push(text({
        text: cell.desc,
        x: cx + 28, y: cy + 24 + theme.section * 0.85 + 16,
        w: cellW - 56, h: cellH - 100 - theme.section,
        fontSize: theme.caption * 1.05,
        fontFamily: bodyFont(theme),
        color: theme.muted,
        lineHeight: 1.45,
        role: 'caption',
      }))
    }
  })

  // Axis labels
  out.push(text({
    text: s.axes.x.low,
    x: gridX, y: gridY + gridH + 16, w: gridW / 2, h: 36,
    fontSize: theme.caption,
    fontFamily: bodyFont(theme),
    color: theme.muted,
    role: 'caption',
  }))
  out.push(text({
    text: s.axes.x.high,
    x: gridX + gridW / 2, y: gridY + gridH + 16, w: gridW / 2, h: 36,
    fontSize: theme.caption,
    fontFamily: bodyFont(theme),
    color: theme.muted,
    align: 'right',
    role: 'caption',
  }))
  out.push(text({
    text: s.axes.y.high,
    x: theme.padding, y: gridY + 8, w: 64, h: 36,
    fontSize: theme.caption,
    fontFamily: bodyFont(theme),
    color: theme.muted,
    align: 'right',
    role: 'caption',
  }))
  out.push(text({
    text: s.axes.y.low,
    x: theme.padding, y: gridY + gridH - 36, w: 64, h: 36,
    fontSize: theme.caption,
    fontFamily: bodyFont(theme),
    color: theme.muted,
    align: 'right',
    role: 'caption',
  }))
  if (s.takeaway) {
    out.push(text({
      text: `→ ${s.takeaway}`,
      x: theme.padding, y: CANVAS_H - 60, w: inner(theme), h: 40,
      fontSize: theme.caption * 1.1,
      fontFamily: bodyFont(theme),
      color: theme.accent,
      fontWeight: 700,
      role: 'caption',
    }))
  }
  out.push(pageNumEl(n, total, theme))
  return out
}

// ─── CHART BAR ───────────────────────────────────────────────────────────────

function composeChartBar(s: ChartBarSlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  out.push(headingEl(s.heading, theme))

  const bars = s.bars ?? []
  if (bars.length === 0) return out

  const top = afterHeading(s.heading, theme, 130)
  const bot = s.source ? 960 : 1000
  const chartH = bot - top
  // Auto-size label column to longest label, value column to longest value.
  // Was hard-coded 280 / 160 which clipped long labels and wrapped long values.
  const longestLabel = bars.reduce((a, b) => Math.max(a, b.label.length), 0)
  const longestValue = bars.reduce((a, b) => Math.max(a, `${b.value}${s.unit ?? ''}`.length), 0)
  // Conservative px-per-char estimate for CJK + ASCII mixed (theme.body ≈ 34px)
  const labelW = Math.max(280, Math.min(520, longestLabel * theme.body * 0.9))
  const valW = Math.max(160, Math.min(280, longestValue * theme.body * 0.55 + 24))
  const barAreaX = theme.padding + labelW + 20
  const barAreaW = CANVAS_W - theme.padding - barAreaX - valW - 12
  const max = Math.max(...bars.map(b => b.value), 1)
  const gap = 18
  const rowH = (chartH - gap * (bars.length - 1)) / bars.length
  const barH = Math.min(rowH - 12, 64)

  bars.forEach((b, i) => {
    const y = top + i * (rowH + gap)
    const by = y + (rowH - barH) / 2
    const emph = b.label === s.highlight
    const bw = (b.value / max) * barAreaW

    out.push(text({
      text: b.label,
      x: theme.padding, y: by, w: labelW, h: barH,
      fontSize: theme.body,
      fontFamily: bodyFont(theme),
      color: emph ? theme.accent : theme.text,
      fontWeight: emph ? 700 : 500,
      lineHeight: 1.2,
      role: 'body',
    }))
    out.push(rect({
      x: barAreaX, y: by, w: Math.max(2, bw), h: barH,
      fill: emph ? theme.accent : theme.text,
      opacity: emph ? 1 : 0.7,
      cornerRadius: 2,
    }))
    // U+00A0 between value and unit prevents browser from splitting them onto
    // separate lines when the available width is borderline.
    const unitStr = s.unit ? ` ${s.unit}` : ''
    out.push(text({
      text: `${b.value}${s.unit ?? ''}`,
      x: barAreaX + bw + 12, y: by,
      w: valW - 12, h: barH,
      fontSize: theme.body * 0.95,
      fontFamily: bodyFont(theme),
      color: emph ? theme.accent : theme.text,
      fontWeight: 700,
      lineHeight: 1.2,
      role: 'body',
      nowrap: true,
    }))
  })

  if (s.source) {
    out.push(text({
      text: `来源：${s.source}`,
      x: theme.padding, y: CANVAS_H - 60, w: inner(theme), h: 40,
      fontSize: theme.caption * 0.9,
      fontFamily: bodyFont(theme),
      color: theme.muted,
      role: 'caption',
    }))
  }
  out.push(pageNumEl(n, total, theme))
  return out
}

// ─── CHART LINE / PIE / AREA (SVG-rendered, embedded as image) ──────────────
//
// 这三种图表用纯 SVG 生成 → svgToDataUrl → ImageElement
// 单一 element，主题色/字号自动跟随，导出 PPTX 无损（pptxgenjs 把 SVG 转 PNG）

function chartImageId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`
}

function commonChartCanvas(theme: ResolvedTheme): { x: number; y: number; w: number; h: number } {
  // Use the standard 1920×1080 source space; chart occupies area below heading
  return {
    x: theme.padding,
    y: 280,
    w: CANVAS_W - 2 * theme.padding,
    h: CANVAS_H - 280 - 120,
  }
}

function composeChartLine(s: ChartLineSlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  out.push(headingEl(s.heading, theme, { highlight: undefined }))

  const box = commonChartCanvas(theme)
  const svg = buildLineChartSVG({
    w: box.w, h: box.h,
    accent: theme.accent, text: theme.text, muted: theme.muted,
    fontFamily: theme.fontBody,
    xLabels: s.xLabels,
    series: s.series,
    unit: s.unit,
    highlight: s.highlight,
  })
  out.push({
    id: chartImageId('chart-line'),
    type: 'image',
    origin: 'composed',
    x: box.x, y: box.y, w: box.w, h: box.h,
    src: svgToDataUrl(svg),
  })

  if (s.source) {
    out.push(text({
      text: s.source,
      x: theme.padding, y: CANVAS_H - 110, w: inner(theme), h: 30,
      fontSize: theme.caption * 0.9,
      fontFamily: bodyFont(theme),
      color: theme.muted,
      fontStyle: 'italic',
      role: 'caption',
    }))
  }
  out.push(pageNumEl(n, total, theme))
  return out
}

function composeChartPie(s: ChartPieSlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  out.push(headingEl(s.heading, theme, { highlight: undefined }))

  const box = commonChartCanvas(theme)
  const svg = buildPieChartSVG({
    w: box.w, h: box.h,
    accent: theme.accent, text: theme.text, muted: theme.muted,
    fontFamily: theme.fontBody,
    slices: s.slices,
    centerLabel: s.centerLabel,
    highlight: s.highlight,
  })
  out.push({
    id: chartImageId('chart-pie'),
    type: 'image',
    origin: 'composed',
    x: box.x, y: box.y, w: box.w, h: box.h,
    src: svgToDataUrl(svg),
  })
  if (s.source) {
    out.push(text({
      text: s.source,
      x: theme.padding, y: CANVAS_H - 110, w: inner(theme), h: 30,
      fontSize: theme.caption * 0.9,
      fontFamily: bodyFont(theme),
      color: theme.muted,
      fontStyle: 'italic',
      role: 'caption',
    }))
  }
  out.push(pageNumEl(n, total, theme))
  return out
}

function composeChartArea(s: ChartAreaSlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  out.push(headingEl(s.heading, theme, { highlight: undefined }))

  const box = commonChartCanvas(theme)
  const svg = buildAreaChartSVG({
    w: box.w, h: box.h,
    accent: theme.accent, text: theme.text, muted: theme.muted,
    fontFamily: theme.fontBody,
    xLabels: s.xLabels,
    series: s.series,
    unit: s.unit,
    highlight: s.highlight,
  })
  out.push({
    id: chartImageId('chart-area'),
    type: 'image',
    origin: 'composed',
    x: box.x, y: box.y, w: box.w, h: box.h,
    src: svgToDataUrl(svg),
  })
  if (s.source) {
    out.push(text({
      text: s.source,
      x: theme.padding, y: CANVAS_H - 110, w: inner(theme), h: 30,
      fontSize: theme.caption * 0.9,
      fontFamily: bodyFont(theme),
      color: theme.muted,
      fontStyle: 'italic',
      role: 'caption',
    }))
  }
  out.push(pageNumEl(n, total, theme))
  return out
}

// ─── KPI BOARD ───────────────────────────────────────────────────────────────

const TONE: Record<string, string | undefined> = {
  pos: '#22c55e',
  neg: '#ef4444',
  flat: undefined,
}

function composeKpiBoard(s: KpiBoardSlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  out.push(text({
    text: s.heading,
    x: theme.padding, y: 120, w: inner(theme) - 360, h: theme.section * 1.5,
    fontSize: theme.section * 0.9,
    fontFamily: displayFont(theme),
    color: theme.text,
    fontWeight: 800,
    lineHeight: 1.2,
    role: 'heading',
  }))
  out.push(text({
    text: s.period,
    x: CANVAS_W - theme.padding - 360, y: 160, w: 360, h: 60,
    fontSize: theme.caption * 1.3,
    fontFamily: bodyFont(theme),
    color: theme.muted,
    align: 'right',
    role: 'caption',
  }))

  const kpis = s.kpis ?? []
  const cnt = kpis.length
  const cols = cnt === 6 ? 3 : cnt === 4 ? 2 : Math.min(4, Math.max(1, cnt))
  const rows = Math.ceil(cnt / cols)
  const gap = 24
  const top = afterHeading(s.heading, theme, 120, theme.section * 0.9)
  const gridH = CANVAS_H - top - 100
  const cellW = (inner(theme) - gap * (cols - 1)) / cols
  const cellH = (gridH - gap * (rows - 1)) / rows

  kpis.forEach((k, i) => {
    const r = Math.floor(i / cols)
    const c = i % cols
    const x = theme.padding + c * (cellW + gap)
    const y = top + r * (cellH + gap)
    out.push(rect({ x, y, w: cellW, h: cellH, fill: theme.paper, cornerRadius: 6 }))
    out.push(text({
      text: k.label,
      x: x + 28, y: y + 22, w: cellW - 56, h: theme.caption * 2,
      fontSize: theme.caption,
      fontFamily: bodyFont(theme),
      color: theme.muted,
      fontWeight: 700,
      role: 'caption',
    }))
    out.push(text({
      text: k.value,
      x: x + 28, y: y + 22 + theme.caption * 2 + 8, w: cellW - 56, h: theme.section,
      fontSize: theme.section,
      fontFamily: displayFont(theme),
      color: theme.text,
      fontWeight: 800,
      lineHeight: 1.05,
      role: 'heading',
    }))
    const deltaY = y + 22 + theme.caption * 2 + 8 + theme.section + 12
    if (k.delta) {
      const color = TONE[k.deltaTone ?? 'flat'] ?? theme.muted
      out.push(text({
        text: k.delta,
        x: x + 28, y: deltaY,
        w: cellW - 56, h: theme.body * 1.6,
        fontSize: theme.body,
        fontFamily: bodyFont(theme),
        color,
        fontWeight: 700,
        role: 'body',
      }))
    }
    if (k.hint) {
      // Place hint immediately under the delta (or under the value if no
      // delta) instead of pinning to the bottom of the cell, which leaves
      // a visible floating gap.
      const hintY = k.delta ? deltaY + theme.body * 1.6 + 6 : deltaY
      out.push(text({
        text: k.hint,
        x: x + 28, y: hintY, w: cellW - 56, h: 36,
        fontSize: theme.caption * 0.85,
        fontFamily: bodyFont(theme),
        color: theme.muted,
        role: 'caption',
      }))
    }
  })
  if (s.takeaway) {
    out.push(text({
      text: `→ ${s.takeaway}`,
      x: theme.padding, y: CANVAS_H - 60, w: inner(theme), h: 40,
      fontSize: theme.caption * 1.1,
      fontFamily: bodyFont(theme),
      color: theme.accent,
      fontWeight: 700,
      role: 'caption',
    }))
  }
  return out
}

// ─── ROADMAP ─────────────────────────────────────────────────────────────────

function composeRoadmap(s: RoadmapSlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  out.push(headingEl(s.heading, theme))

  const periods = s.periods ?? []
  const lanes = s.lanes ?? []
  if (!periods.length || !lanes.length) return out

  const top = 320
  const bot = s.legend ? 960 : 1000
  const laneLabelW = 200
  const gridW = inner(theme) - laneLabelW
  const periodW = gridW / periods.length
  const headerH = 56
  const laneH = (bot - top - headerH) / lanes.length

  periods.forEach((p, i) => {
    out.push(text({
      text: p,
      x: theme.padding + laneLabelW + i * periodW + 12,
      y: top + 8,
      w: periodW - 24, h: headerH - 16,
      fontSize: theme.caption * 1.2,
      fontFamily: bodyFont(theme),
      color: theme.accent,
      fontWeight: 700,
      align: 'center',
      role: 'caption',
    }))
  })
  out.push(rect({
    x: theme.padding, y: top + headerH - 2,
    w: inner(theme), h: 2, fill: theme.border,
  }))

  const periodIndex = new Map(periods.map((p, i) => [p, i]))
  lanes.forEach((lane, li) => {
    const ly = top + headerH + li * laneH
    if (li > 0) {
      out.push(rect({
        x: theme.padding, y: ly, w: inner(theme), h: 1,
        fill: theme.border, opacity: 0.5,
      }))
    }
    out.push(text({
      text: lane.name,
      x: theme.padding, y: ly + laneH / 2 - 24,
      w: laneLabelW - 16, h: 48,
      fontSize: theme.body * 0.95,
      fontFamily: bodyFont(theme),
      color: theme.text,
      fontWeight: 700,
      lineHeight: 1.3,
      role: 'body',
    }))

    for (const ms of lane.items) {
      const pi = periodIndex.get(ms.period)
      if (pi === undefined) continue
      const span = Math.min(Math.max(1, ms.span ?? 1), periods.length - pi)
      const mx = theme.padding + laneLabelW + pi * periodW + 12
      const mw = periodW * span - 24
      const mh = Math.min(laneH - 24, 72)
      const my = ly + (laneH - mh) / 2
      const emph = !!ms.emphasis
      out.push(rect({
        x: mx, y: my, w: mw, h: mh,
        fill: emph ? theme.accent : theme.paper,
        cornerRadius: 4,
      }))
      out.push(text({
        text: ms.label,
        x: mx + 16, y: my + 12, w: mw - 32, h: mh - 24,
        fontSize: theme.caption * 0.95,
        fontFamily: bodyFont(theme),
        color: emph ? theme.bg : theme.text,
        fontWeight: emph ? 700 : 500,
        lineHeight: 1.3,
        role: 'body',
      }))
    }
  })

  if (s.legend) {
    out.push(text({
      text: s.legend,
      x: theme.padding, y: CANVAS_H - 60, w: inner(theme), h: 40,
      fontSize: theme.caption * 0.9,
      fontFamily: bodyFont(theme),
      color: theme.muted,
      role: 'caption',
    }))
  }
  return out
}

// ─── CASE STUDY ──────────────────────────────────────────────────────────────

function composeCaseStudy(s: CaseStudySlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  out.push(text({
    text: s.client,
    x: theme.padding, y: 120, w: inner(theme), h: theme.section * 1.4,
    fontSize: theme.section * 0.9,
    fontFamily: displayFont(theme),
    color: theme.text,
    fontWeight: 800,
    lineHeight: 1.2,
    role: 'heading',
  }))
  if (s.clientMeta) {
    out.push(text({
      text: s.clientMeta,
      x: theme.padding, y: 120 + theme.section * 1.4 + 8,
      w: inner(theme), h: 50,
      fontSize: theme.body * 0.9,
      fontFamily: bodyFont(theme),
      color: theme.muted,
      role: 'caption',
    }))
  }

  const leftX = theme.padding
  const leftW = 1000
  const sections = [
    ['Context', s.context],
    ['Challenge', s.challenge],
    ['Approach', s.approach],
  ] as const

  const secTop = 320
  const secH = 180
  const secGap = 14
  sections.forEach(([label, body], i) => {
    const y = secTop + i * (secH + secGap)
    out.push(text({
      text: label,
      x: leftX, y, w: leftW, h: 40,
      fontSize: theme.caption,
      fontFamily: bodyFont(theme),
      color: theme.accent,
      fontWeight: 700,
      role: 'caption',
    }))
    out.push(text({
      text: body,
      x: leftX, y: y + 48, w: leftW, h: secH - 56,
      fontSize: theme.body * 0.9,
      fontFamily: bodyFont(theme),
      color: theme.text,
      lineHeight: 1.5,
      role: 'body',
    }))
  })

  // Right results panel
  const rightX = theme.padding + 1040
  const rightW = inner(theme) - 1040
  const results = s.results ?? []
  const rCount = Math.max(1, results.length)
  const panelY = secTop
  const panelH = 460
  out.push(rect({
    x: rightX, y: panelY, w: rightW, h: panelH,
    fill: theme.accent, opacity: 0.08, cornerRadius: 8,
  }))
  const eachR = (panelH - 40) / rCount
  results.forEach((r, i) => {
    const y = panelY + 20 + i * eachR
    out.push(text({
      text: r.metric,
      x: rightX + 28, y, w: rightW - 56, h: theme.caption * 1.8,
      fontSize: theme.caption * 0.9,
      fontFamily: bodyFont(theme),
      color: theme.muted,
      fontWeight: 700,
      role: 'caption',
    }))
    out.push(text({
      text: r.value,
      x: rightX + 28, y: y + theme.caption * 2,
      w: rightW - 56, h: theme.hero * 0.6,
      fontSize: theme.hero * 0.42,
      fontFamily: displayFont(theme),
      color: theme.accent,
      fontWeight: 800,
      lineHeight: 1.05,
      role: 'heading',
    }))
    if (r.delta) {
      out.push(text({
        text: r.delta,
        x: rightX + 28, y: y + theme.caption * 2 + theme.hero * 0.5,
        w: rightW - 56, h: 30,
        fontSize: theme.caption * 0.85,
        fontFamily: bodyFont(theme),
        color: theme.muted,
        role: 'caption',
      }))
    }
  })

  if (s.quote) {
    out.push(text({
      text: `“${s.quote}”`,
      x: rightX, y: panelY + panelH + 24, w: rightW, h: 120,
      fontSize: theme.body,
      fontFamily: bodyFont(theme),
      color: theme.text,
      lineHeight: 1.5,
      role: 'body',
    }))
    if (s.quoteAttribution) {
      out.push(text({
        text: `— ${s.quoteAttribution}`,
        x: rightX, y: panelY + panelH + 160, w: rightW, h: 36,
        fontSize: theme.caption * 0.85,
        fontFamily: bodyFont(theme),
        color: theme.muted,
        role: 'caption',
      }))
    }
  }
  return out
}

// ─── TABLE ───────────────────────────────────────────────────────────────────

function composeTable(s: TableSlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  out.push(headingEl(s.heading, theme))

  const cols = s.columns ?? []
  const rows = s.rows ?? []
  if (!cols.length) return out

  const tableX = theme.padding
  const tableW = inner(theme)
  const tableTop = 320
  const tableBot = s.source ? 960 : 1000
  const headerH = 60
  const rowCount = Math.max(1, rows.length)
  const rowH = Math.min(70, (tableBot - tableTop - headerH) / rowCount)
  const colW = tableW / cols.length

  // Highlight column background
  if (s.highlightColumn) {
    const hi = cols.findIndex(c => c.id === s.highlightColumn)
    if (hi >= 0) {
      out.push(rect({
        x: tableX + hi * colW, y: tableTop,
        w: colW, h: headerH + rowH * rows.length,
        fill: theme.accent, opacity: 0.08,
      }))
    }
  }
  // Header
  cols.forEach((col, i) => {
    out.push(text({
      text: col.label,
      x: tableX + i * colW + 16, y: tableTop + 16,
      w: colW - 32, h: headerH - 24,
      fontSize: theme.caption * 1.1,
      fontFamily: bodyFont(theme),
      color: theme.accent,
      fontWeight: 700,
      align: col.align,
      role: 'caption',
    }))
  })
  out.push(rect({
    x: tableX, y: tableTop + headerH - 2,
    w: tableW, h: 2, fill: theme.border,
  }))
  // Rows
  rows.forEach((row, r) => {
    const cells = row.cells ?? {}
    const emph = !!row.emphasis
    const ry = tableTop + headerH + r * rowH
    if (emph) {
      out.push(rect({ x: tableX, y: ry, w: tableW, h: rowH, fill: theme.paper }))
    }
    cols.forEach((col, i) => {
      out.push(text({
        text: cells[col.id] ?? '',
        x: tableX + i * colW + 16, y: ry + 14,
        w: colW - 32, h: rowH - 28,
        fontSize: theme.body * 0.9,
        fontFamily: bodyFont(theme),
        color: theme.text,
        fontWeight: emph ? 700 : 400,
        align: col.align,
        role: 'body',
      }))
    })
    if (r < rows.length - 1) {
      out.push(rect({
        x: tableX, y: ry + rowH - 1,
        w: tableW, h: 1, fill: theme.border, opacity: 0.5,
      }))
    }
  })
  if (s.source) {
    out.push(text({
      text: `来源：${s.source}`,
      x: tableX, y: CANVAS_H - 60, w: tableW, h: 40,
      fontSize: theme.caption * 0.85,
      fontFamily: bodyFont(theme),
      color: theme.muted,
      role: 'caption',
    }))
  }
  return out
}

// ─── CAUSALITY ───────────────────────────────────────────────────────────────

function composeCausality(s: CausalitySlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  out.push(headingEl(s.heading, theme))

  const chain = s.chain ?? []
  const cnt = Math.max(1, chain.length)
  const arrowW = 50
  const top = 320
  const nodeH = 540
  const w_each = (inner(theme) - arrowW * (cnt - 1)) / cnt

  chain.forEach((link, i) => {
    const x = theme.padding + i * (w_each + arrowW)
    out.push(rect({ x, y: top, w: w_each, h: nodeH, fill: theme.paper, cornerRadius: 6 }))
    out.push(text({
      text: link.cause,
      x: x + 24, y: top + 30, w: w_each - 48, h: 160,
      fontSize: theme.body,
      fontFamily: bodyFont(theme),
      color: theme.text,
      fontWeight: 700,
      lineHeight: 1.3,
      role: 'body',
    }))
    if (link.because) {
      out.push(text({
        text: `∵ ${link.because}`,
        x: x + 24, y: top + 220, w: w_each - 48, h: nodeH - 240,
        fontSize: theme.caption * 0.95,
        fontFamily: bodyFont(theme),
        color: theme.muted,
        lineHeight: 1.5,
        role: 'caption',
      }))
    }
    if (i < cnt - 1) {
      const ax = x + w_each
      out.push(text({
        text: '→',
        x: ax, y: top + nodeH / 2 - 40,
        w: arrowW, h: 80,
        fontSize: 60,
        fontFamily: displayFont(theme),
        color: theme.accent,
        fontWeight: 800,
        align: 'center',
        lineHeight: 1.0,
      }))
    }
  })
  if (s.conclusion) {
    out.push(text({
      text: `∴ ${s.conclusion}`,
      x: theme.padding, y: top + nodeH + 40,
      w: inner(theme), h: 80,
      fontSize: theme.body * 1.1,
      fontFamily: bodyFont(theme),
      color: theme.accent,
      fontWeight: 700,
      lineHeight: 1.4,
      role: 'body',
    }))
  }
  out.push(pageNumEl(n, total, theme))
  return out
}

// ─── PERSONA ─────────────────────────────────────────────────────────────────

function composePersona(s: PersonaSlide, theme: ResolvedTheme): SlideElement[] {
  const out: SlideElement[] = []
  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))

  const avatarSize = 280
  const avatarX = theme.padding
  const avatarY = 140
  const initial = (s.name[0] || '?').toUpperCase()
  out.push(ellipse({
    cx: avatarX + avatarSize / 2,
    cy: avatarY + avatarSize / 2,
    rx: avatarSize / 2, ry: avatarSize / 2,
    fill: theme.accent,
  }))
  out.push(text({
    text: initial,
    x: avatarX, y: avatarY + 50, w: avatarSize, h: avatarSize - 100,
    fontSize: 140,
    fontFamily: displayFont(theme),
    color: theme.bg,
    fontWeight: 800,
    align: 'center',
    lineHeight: 1.0,
  }))

  const infoX = avatarX + avatarSize + 60
  const infoW = CANVAS_W - infoX - theme.padding
  out.push(text({
    text: s.name,
    x: infoX, y: avatarY, w: infoW, h: theme.section * 1.3,
    fontSize: theme.section,
    fontFamily: displayFont(theme),
    color: theme.text,
    fontWeight: 800,
    lineHeight: 1.2,
    role: 'heading',
  }))
  out.push(text({
    text: s.role,
    x: infoX, y: avatarY + theme.section * 1.4, w: infoW, h: 60,
    fontSize: theme.caption * 1.3,
    fontFamily: bodyFont(theme),
    color: theme.accent,
    fontWeight: 700,
    role: 'caption',
  }))
  if (s.attributes && s.attributes.length > 0) {
    const attrTop = avatarY + theme.section * 1.4 + 80
    s.attributes.forEach((a, i) => {
      out.push(text({
        text: `${a.label}：${a.value}`,
        x: infoX, y: attrTop + i * (theme.body * 1.7),
        w: infoW, h: theme.body * 1.7,
        fontSize: theme.body * 0.9,
        fontFamily: bodyFont(theme),
        color: theme.text,
        lineHeight: 1.4,
        role: 'body',
      }))
    })
  }

  // Needs / Pains panels at bottom
  const bottomTop = 640
  const bottomH = 360
  const colW = (inner(theme) - 40) / 2

  const renderCol = (xPos: number, title: string, items: string[], color: string) => {
    out.push(rect({
      x: xPos, y: bottomTop, w: colW, h: bottomH,
      fill: theme.paper, cornerRadius: 6,
    }))
    out.push(text({
      text: title,
      x: xPos + 28, y: bottomTop + 22, w: colW - 56, h: 50,
      fontSize: theme.caption * 1.15,
      fontFamily: bodyFont(theme),
      color,
      fontWeight: 700,
      role: 'caption',
    }))
    items.forEach((it, i) => {
      out.push(text({
        text: `· ${it}`,
        x: xPos + 28, y: bottomTop + 80 + i * (theme.body * 1.7),
        w: colW - 56, h: theme.body * 1.7,
        fontSize: theme.body * 0.95,
        fontFamily: bodyFont(theme),
        color: theme.text,
        lineHeight: 1.5,
        role: 'body',
      }))
    })
  }
  if (s.needs && s.needs.length) renderCol(theme.padding, 'Needs', s.needs, theme.accent)
  if (s.pains && s.pains.length) renderCol(theme.padding + colW + 40, 'Pains', s.pains, theme.muted)

  // Pull quote attributed to this persona — placed in the gap between
  // attributes (which end around y=560 for typical themes) and the
  // needs/pains panels at y=640. Narrow window, so single-line italic.
  if (s.quote) {
    const quoteY = bottomTop - 70
    const quoteX = theme.padding
    const quoteW = inner(theme)
    out.push(text({
      text: `"${s.quote}"`,
      x: quoteX, y: quoteY, w: quoteW, h: 60,
      fontSize: theme.body * 0.95,
      fontFamily: displayFont(theme),
      color: theme.muted,
      fontStyle: 'italic',
      lineHeight: 1.3,
      align: 'center',
      role: 'caption',
    }))
  }

  return out
}

// ─── QUADRANT ────────────────────────────────────────────────────────────────

function composeQuadrant(s: QuadrantSlide, theme: ResolvedTheme, n: number, total: number): SlideElement[] {
  const out: SlideElement[] = []
  if (s.eyebrow) out.push(eyebrow(s.eyebrow, theme))
  out.push(headingEl(s.heading, theme))

  const plotX = theme.padding + 80
  const plotY = 320
  const plotW = inner(theme) - 280
  const plotH = 620
  out.push(rect({
    x: plotX, y: plotY, w: plotW, h: plotH,
    fill: theme.paper, cornerRadius: 4,
  }))
  out.push(rect({
    x: plotX, y: plotY + plotH / 2 - 1, w: plotW, h: 2, fill: theme.border,
  }))
  out.push(rect({
    x: plotX + plotW / 2 - 1, y: plotY, w: 2, h: plotH, fill: theme.border,
  }))

  // Axis labels
  out.push(text({
    text: s.axes.x.low,
    x: plotX, y: plotY + plotH + 10, w: plotW / 2, h: 36,
    fontSize: theme.caption * 0.9,
    fontFamily: bodyFont(theme),
    color: theme.muted,
    role: 'caption',
  }))
  out.push(text({
    text: s.axes.x.high,
    x: plotX + plotW / 2, y: plotY + plotH + 10, w: plotW / 2, h: 36,
    fontSize: theme.caption * 0.9,
    fontFamily: bodyFont(theme),
    color: theme.muted,
    align: 'right',
    role: 'caption',
  }))
  out.push(text({
    text: s.axes.y.high,
    x: plotX + plotW + 16, y: plotY, w: 200, h: 30,
    fontSize: theme.caption * 0.9,
    fontFamily: bodyFont(theme),
    color: theme.muted,
    role: 'caption',
  }))
  out.push(text({
    text: s.axes.y.low,
    x: plotX + plotW + 16, y: plotY + plotH - 30, w: 200, h: 30,
    fontSize: theme.caption * 0.9,
    fontFamily: bodyFont(theme),
    color: theme.muted,
    role: 'caption',
  }))

  // Axis titles (the field that was being silently dropped)
  if (s.axes.x.label) {
    out.push(text({
      text: s.axes.x.label,
      x: plotX, y: plotY + plotH + 56, w: plotW, h: 40,
      fontSize: theme.caption,
      fontFamily: bodyFont(theme),
      color: theme.text,
      fontWeight: 700,
      align: 'center',
      letterSpacing: 0.04,
      role: 'caption',
    }))
  }
  if (s.axes.y.label) {
    // Vertical-ish: place at left of the plot, rotated 90° counter-clockwise.
    out.push(text({
      text: s.axes.y.label,
      x: plotX - 220, y: plotY + plotH / 2 - 20, w: 200, h: 40,
      fontSize: theme.caption,
      fontFamily: bodyFont(theme),
      color: theme.text,
      fontWeight: 700,
      letterSpacing: 0.04,
      align: 'right',
      role: 'caption',
    }))
  }

  // Points
  const cellW = plotW / 5
  const cellH = plotH / 5
  const dotR = 22
  ;(s.points ?? []).forEach(p => {
    const gx = Math.max(0, Math.min(4, p.gridX))
    const gy = Math.max(0, Math.min(4, p.gridY))
    const cx = plotX + (gx + 0.5) * cellW
    const cy = plotY + (4 - gy + 0.5) * cellH
    const emph = p.id === s.highlight
    out.push(ellipse({
      cx, cy, rx: dotR, ry: dotR,
      fill: emph ? theme.accent : theme.text,
      opacity: emph ? 1 : 0.65,
    }))
    out.push(text({
      text: p.label,
      x: cx + dotR + 8, y: cy - 18, w: 220, h: 40,
      fontSize: theme.caption * 0.9,
      fontFamily: bodyFont(theme),
      color: emph ? theme.accent : theme.text,
      fontWeight: emph ? 700 : 400,
      role: 'body',
    }))
  })

  out.push(pageNumEl(n, total, theme))
  return out
}

// ─── Dispatch ────────────────────────────────────────────────────────────────

export function composeSlide(
  slide: Slide,
  theme: ResolvedTheme,
  n: number,
  total: number,
): SlideElement[] {
  switch (slide.type) {
    case 'cover':       return composeCover(slide, theme)
    case 'statement':   return composeStatement(slide, theme)
    case 'process':     return composeProcess(slide, theme, n, total)
    case 'data':        return composeData(slide, theme, n, total)
    case 'compare':     return composeCompare(slide, theme, n, total)
    case 'timeline':    return composeTimeline(slide, theme, n, total)
    case 'argument':    return composeArgument(slide, theme, n, total)
    case 'quote':       return composeQuote(slide, theme)
    case 'diagram':     return composeDiagram(slide, theme, n, total)
    case 'cta':         return composeCTA(slide, theme)
    case 'checklist':   return composeChecklist(slide, theme, n, total)
    case 'matrix-2x2':  return composeMatrix2x2(slide, theme, n, total)
    case 'chart-bar':   return composeChartBar(slide, theme, n, total)
    case 'chart-line':  return composeChartLine(slide, theme, n, total)
    case 'chart-pie':   return composeChartPie(slide, theme, n, total)
    case 'chart-area':  return composeChartArea(slide, theme, n, total)
    case 'kpi-board':   return composeKpiBoard(slide, theme, n, total)
    case 'roadmap':     return composeRoadmap(slide, theme, n, total)
    case 'case-study':  return composeCaseStudy(slide, theme, n, total)
    case 'table':       return composeTable(slide, theme, n, total)
    case 'causality':   return composeCausality(slide, theme, n, total)
    case 'persona':     return composePersona(slide, theme)
    case 'quadrant':    return composeQuadrant(slide, theme, n, total)
    case 'question':    return composeQuestion(slide, theme)
  }
}
