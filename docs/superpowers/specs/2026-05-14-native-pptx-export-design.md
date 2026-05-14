# Native PPTX Export — Design Spec
**Date**: 2026-05-14  
**Status**: Approved

---

## 1. Goal

Replace image-based PPTX export with a fully editable native PPTX where every element (text box, shape, line, background) is an independent PowerPoint object. Users can open the file in PowerPoint / Keynote / LibreOffice and edit any element directly.

**Fidelity target**: ~95% visual match to HTML render. Colors, fonts, and text layout are exact; complex CSS decorations are simplified to solid-color shapes.

**Scope**: 18 of 21 slide types. `diagram` falls back to screenshot embed. Two other types that throw during render also fall back gracefully.

---

## 2. Approach

**Hybrid (phase 1 = pptxgenjs, phase 2 = Python migration for complex layouts)**

Phase 1 (this spec): Pure browser-side generation using `pptxgenjs ^4.0.1` (already in `package.json`). No new dependencies.

Phase 2 (future): Migrate `roadmap`, `quadrant`, `matrix-2x2`, `chart-bar` to the existing Python pptx-service for higher precision. Out of scope here.

---

## 3. File Structure

```
lib/pptx/
├── index.ts          # Entry: assembles PptxGenJS, dispatches to renderers
├── helpers.ts        # px(), py(), addTextBox(), addAccentLine(), addRect()
├── theme-map.ts      # ThemeTokens → PptxTheme
└── slides/
    ├── cover.ts
    ├── statement.ts
    ├── process.ts
    ├── data.ts
    ├── compare.ts
    ├── timeline.ts
    ├── argument.ts
    ├── quote.ts
    ├── cta.ts
    ├── checklist.ts
    ├── matrix-2x2.ts
    ├── chart-bar.ts
    ├── kpi-board.ts
    ├── roadmap.ts
    ├── case-study.ts
    ├── table.ts
    ├── causality.ts
    ├── persona.ts
    ├── quadrant.ts
    └── question.ts
```

Mirrors existing `components/layouts/` structure for easy cross-reference.

---

## 4. Coordinate System

```
SLIDE_W = 13.33"   (maps 1920px)
SLIDE_H = 7.50"    (maps 1080px)

px(n: number) = n / 1920 * 13.33   // horizontal
py(n: number) = n / 1080 * 7.50    // vertical
```

All position and size values in renderer files use `px()` / `py()` so they can be read alongside the HTML layout pixel values.

---

## 5. PptxTheme Interface

```typescript
interface PptxTheme {
  // Colors (hex strings, e.g. '#1a1a1a')
  bg: string;
  text: string;
  accent: string;
  muted: string;
  rule: string;
  soft: string;

  // Fonts (first family name only, e.g. 'Inter')
  fontDisplay: string;
  fontBody: string;
  fontMono: string;

  // Font sizes in points (px * 0.75)
  heroSize: number;      // t.hero px → pt
  sectionSize: number;   // t.section px → pt
  bodySize: number;      // t.body px → pt
  captionSize: number;   // ~18px → ~14pt

  // Layout
  paddingIn: number;     // t.padding px → inches (px / 1920 * 13.33)
}
```

`buildPptxTheme(themeId, brand?)` in `theme-map.ts`:
1. Looks up `THEMES[themeId]`
2. Applies `applyBrand()` overrides
3. Returns `PptxTheme`

**Font handling**: Font names passed directly to pptxgenjs. If the user's machine has the font (Inter, Playfair Display, etc.) it renders correctly. No embedding — keeps file size small. A comment in the exported file's `core.xml` notes the fonts used.

---

## 6. Helper Functions (helpers.ts)

```typescript
// Coordinate conversion
px(n: number): number
py(n: number): number

// Common element factories
addTextBox(slide, text, opts: TextBoxOpts): void
addRect(slide, x, y, w, h, color, opts?): void
addLine(slide, x1, y1, x2, y2, color, width?): void
addAccentLine(slide, t: PptxTheme): void  // standard 2pt horizontal accent bar
setBackground(slide, color: string): void
addPageNumber(slide, n: number, total: number, t: PptxTheme): void
addEyebrow(slide, text: string, t: PptxTheme): void
addHeading(slide, text: string, t: PptxTheme, y: number): void
```

---

## 7. Renderer Specifications (per slide type)

### cover
```
Background: t.bg
Eyebrow (if present): top-left, captionSize, accent color, uppercase
Title: left-aligned, heroSize, bold, t.text
  highlight words: accent color (split into runs)
Subtitle (if present): below title, bodySize, muted
Decoration: 4pt vertical accent rect, left of title, 2" tall
Page number: bottom-right
```

### statement
```
Background: t.bg
Title: centered or left (slide.align), heroSize * 0.85, bold
  highlight words: accent color runs
Decoration: 2pt horizontal accent line, full width, below title
```

### process
```
Background: t.bg
Heading: top, sectionSize, bold
N equal columns (steps.length, max 5):
  - Step number: heroSize * 0.6, accent color, bold
  - Step title: bodySize, bold
  - Step desc: captionSize, muted
Column separators: 1pt rule-color vertical lines
```

### data
```
Background: t.bg
Heading: top, sectionSize, bold
Top decoration: 2pt accent horizontal line, full width
Stats grid (stats.length columns, max 4):
  - value: heroSize * 0.75, accent color, bold
  - label: bodySize, muted
  - source: captionSize, muted, italic
```

### compare
```
Background: t.bg
Heading: top, sectionSize, bold
Left column (left.title + items): bg slightly lighter rect
Right column (right.title + items): accent-tinted rect
Center divider: 2pt rule line, full height
Items: bodySize bullets
```

### timeline
```
Background: t.bg
Heading: top, sectionSize, bold
Horizontal timeline: rule-color line across middle
Events (events.length, max 6):
  - Dot: accent circle 12pt
  - Time: above dot, captionSize, accent
  - Title: below dot, bodySize, bold
  - Desc: below title, captionSize, muted
```

### argument
```
Background: t.bg
Heading: top, sectionSize, bold
  highlight: accent color run
Points: left-aligned list, bodySize
  bullet: accent color square 8pt
  text: t.text
```

### quote
```
Background: t.bg (or dark variant for emphasis)
Large quote mark: heroSize * 2, accent, top-left decorative
Quote text: centered, sectionSize, italic, t.text
  highlight: accent color run
Source: below, captionSize, muted
```

### cta
```
Background: t.accent (inverted for impact)
newAction: centered, heroSize * 0.8, white/bg-contrast, bold
  highlight: contrasting accent run
```

### checklist
```
Background: t.bg
Heading: top, sectionSize, bold
Items: bodySize
  checkbox: accent square outline 14pt left
  text: t.text
```

### matrix-2x2
```
Background: t.bg
Heading: top, sectionSize, bold
2×2 grid lines: 1pt rule color
Axis labels: captionSize, muted (x-low/high, y-low/high)
4 cells: each has label (bodySize bold) + desc (captionSize)
  emphasis cell: accent background rect
```

### chart-bar
```
Background: t.bg
Heading: top, sectionSize, bold
Bars: horizontal bars, height proportional to value
  normal: muted fill
  highlight bar: accent fill
  value label: right of bar, bodySize bold
  bar label: left, captionSize
Unit + source: bottom, captionSize muted
```

### kpi-board
```
Background: t.bg
Heading + period: top, sectionSize bold / captionSize muted
4 or 6 KPI cards (equal grid):
  card bg: slightly off-bg rect
  value: heroSize * 0.7, bold
  delta: captionSize, green(pos)/red(neg)/muted(flat)
  label: captionSize muted
  hint: captionSize italic muted
Takeaway: bottom bar, bodySize, accent bg strip
```

### roadmap
```
Background: t.bg
Heading: top, sectionSize bold
Period headers: equal columns, captionSize, accent bg strip
Lane names: left column, bodySize bold
Milestone cells: rounded rect, accent or muted fill
  emphasis: accent fill, white text
  normal: muted fill, t.text
```

### case-study
```
Background: t.bg
Client name: heroSize * 0.5, bold, accent
clientMeta: captionSize muted
Left column (60%): context, challenge, approach (labeled sections)
Right column (40%): results cards (metric + value + delta), quote box
```

### table
```
Background: t.bg
Heading: top, sectionSize bold
Header row: accent bg, white text, bodySize bold
Data rows alternating: bg / slightly-off-bg
  emphasis rows: soft accent tint
  highlight column: accent left border 3pt
Source: bottom, captionSize muted
```

### causality
```
Background: t.bg
Heading: top, sectionSize bold
Horizontal chain (chain.length nodes, max 5):
  Node rect: accent outline, bodySize cause text
  Arrow between nodes: accent color →
  Because text: below arrow, captionSize italic muted
Conclusion: bottom, bodySize bold, accent left border
```

### persona
```
Background: t.bg
Avatar circle: accent bg, white initials, heroSize * 0.4
Name: sectionSize bold
Role: bodySize muted
Attributes grid (2 columns): label captionSize muted / value bodySize
Quote: italic bodySize, accent left border
Needs / Pains: two columns, checklist style
```

### quadrant
```
Background: t.bg
Heading: top, sectionSize bold
Cross lines: 1pt rule, full width + full height intersecting at center
Axis labels: x-low/high below axis, y-low/high beside axis, captionSize muted
Points: 8pt circle, accent (highlighted) or muted
  label: captionSize beside circle
```

### question
```
Background: t.bg (or dark)
Question text: centered, heroSize * 0.7, bold
  must end with ?
Hints: below, bodySize muted, bullet list
Invitation: bottom, captionSize italic accent
```

---

## 8. Fallback Strategy

Any slide where:
- `slide.type === 'diagram'`
- The renderer throws an exception

→ falls back to screenshot embed (reuses existing `captureSlide()` from `lib/export-pdf-pptx.ts`). The fallback is silent — no error shown to user, export continues.

---

## 9. Integration

**ExportMenu** (`app/deck/page.tsx`):

```tsx
// Add below existing PPTX button:
<button onClick={handlePPTXNative} className="...">
  📝 PPTX（可编辑版）
</button>
```

```typescript
async function handlePPTXNative() {
  setBusy('PPTX可编辑');
  try {
    const { exportPPTXNative } = await import('@/lib/pptx');
    await exportPPTXNative(deck, safeFileName(deck.title));
  } catch (e) {
    alert(`可编辑 PPTX 导出失败：${e instanceof Error ? e.message : String(e)}`);
  } finally {
    setBusy(null); setOpen(false);
  }
}
```

Existing `📄 PDF` and `🎞 PPTX（图片版）` are untouched.

---

## 10. Out of Scope

- Font embedding (bloats file size; document font names instead)
- CSS gradient reproduction (use nearest solid color)
- Per-theme decoration customization (B-level simplification: uniform accent lines/rects)
- Python pptx-service migration (Phase 2)
- Slide master / template (flat slide-by-slide generation only)
- Animation / transitions
