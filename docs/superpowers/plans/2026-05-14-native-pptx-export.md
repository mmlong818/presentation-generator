# Native PPTX Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fully-editable native PPTX export where every slide element is an independent PowerPoint object (text box, shape, line, background), covering 18 of 20 slide types using pptxgenjs in the browser.

**Architecture:** Pure browser-side generation via `pptxgenjs ^4.0.1` (already in package.json). One entry file dispatches to per-slide-type renderer modules under `lib/pptx/slides/`. A `theme-map.ts` converts `ThemeTokens` → `PptxTheme`. Any renderer exception or `diagram` type falls back silently to screenshot embed reusing existing `captureSlide()`.

**Tech Stack:** TypeScript, pptxgenjs ^4.0.1, Next.js app router (dynamic import), existing `lib/themes.ts` token system

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `lib/pptx/helpers.ts` | Create | `px()`, `py()`, `hexColor()`, `addRect()`, `addLine()`, `addAccentLine()`, `addTextBox()`, `setBackground()`, `addPageNumber()`, `addEyebrow()`, `addHeading()` |
| `lib/pptx/theme-map.ts` | Create | `buildPptxTheme(themeId, brand?)` → `PptxTheme` |
| `lib/pptx/index.ts` | Create | `exportPPTXNative(deck, filename)` — assembles pptxgenjs, dispatches per slide type, fallback |
| `lib/pptx/slides/cover.ts` | Create | Cover renderer |
| `lib/pptx/slides/statement.ts` | Create | Statement renderer |
| `lib/pptx/slides/process.ts` | Create | Process renderer |
| `lib/pptx/slides/data.ts` | Create | Data renderer |
| `lib/pptx/slides/compare.ts` | Create | Compare renderer |
| `lib/pptx/slides/timeline.ts` | Create | Timeline renderer |
| `lib/pptx/slides/argument.ts` | Create | Argument renderer |
| `lib/pptx/slides/quote.ts` | Create | Quote renderer |
| `lib/pptx/slides/cta.ts` | Create | CTA renderer |
| `lib/pptx/slides/checklist.ts` | Create | Checklist renderer |
| `lib/pptx/slides/question.ts` | Create | Question renderer |
| `lib/pptx/slides/matrix-2x2.ts` | Create | Matrix 2×2 renderer |
| `lib/pptx/slides/chart-bar.ts` | Create | Chart bar renderer |
| `lib/pptx/slides/kpi-board.ts` | Create | KPI board renderer |
| `lib/pptx/slides/roadmap.ts` | Create | Roadmap renderer |
| `lib/pptx/slides/case-study.ts` | Create | Case study renderer |
| `lib/pptx/slides/table.ts` | Create | Table renderer |
| `lib/pptx/slides/causality.ts` | Create | Causality renderer |
| `lib/pptx/slides/persona.ts` | Create | Persona renderer |
| `lib/pptx/slides/quadrant.ts` | Create | Quadrant renderer |
| `app/deck/page.tsx` | Modify | Add "📝 PPTX（可编辑版）" button + `handlePPTXNative()` |

---

## Task 1: helpers.ts — coordinate conversion and primitive factories

**Files:**
- Create: `lib/pptx/helpers.ts`

```typescript
// lib/pptx/helpers.ts
import type PptxGenJS from 'pptxgenjs';

export const SLIDE_W = 13.333;
export const SLIDE_H = 7.5;

export function px(n: number): number { return n / 1920 * SLIDE_W; }
export function py(n: number): number { return n / 1080 * SLIDE_H; }

/** Strip leading # from color string — pptxgenjs wants bare hex */
export function hexColor(c: string): string { return c.replace(/^#/, ''); }

export interface PptxTheme {
  bg: string;
  text: string;
  accent: string;
  muted: string;
  rule: string;
  soft: string;
  fontDisplay: string;
  fontBody: string;
  fontMono: string;
  heroSize: number;
  sectionSize: number;
  bodySize: number;
  captionSize: number;
  paddingIn: number;
}

type Slide = ReturnType<PptxGenJS['addSlide']>;

export function setBackground(slide: Slide, color: string): void {
  slide.background = { color: hexColor(color) };
}

export function addRect(
  slide: Slide,
  x: number, y: number, w: number, h: number,
  color: string,
  opts?: { line?: { color: string; width: number }; transparency?: number },
): void {
  slide.addShape('rect', {
    x, y, w, h,
    fill: { color: hexColor(color) },
    line: opts?.line ? { color: hexColor(opts.line.color), width: opts.line.width } : { color: hexColor(color), width: 0 },
    ...(opts?.transparency !== undefined ? { transparency: opts.transparency } : {}),
  });
}

export function addLine(
  slide: Slide,
  x1: number, y1: number, x2: number, y2: number,
  color: string,
  width = 1,
): void {
  slide.addShape('line', {
    x: x1, y: y1,
    w: x2 - x1,
    h: y2 - y1,
    line: { color: hexColor(color), width },
  });
}

export function addAccentLine(slide: Slide, t: PptxTheme): void {
  addLine(slide, t.paddingIn, py(180), SLIDE_W - t.paddingIn, py(180), t.accent, 2);
}

export interface TextBoxOpts {
  x: number; y: number; w: number; h?: number;
  fontSize: number;
  color: string;
  fontFace: string;
  bold?: boolean;
  italic?: boolean;
  align?: 'left' | 'center' | 'right';
  valign?: 'top' | 'middle' | 'bottom';
  wrap?: boolean;
  shrinkText?: boolean;
  autoFit?: boolean;
}

export function addTextBox(slide: Slide, text: string, opts: TextBoxOpts): void {
  slide.addText(text, {
    x: opts.x, y: opts.y, w: opts.w, h: opts.h,
    fontSize: opts.fontSize,
    color: hexColor(opts.color),
    fontFace: opts.fontFace,
    bold: opts.bold ?? false,
    italic: opts.italic ?? false,
    align: opts.align ?? 'left',
    valign: opts.valign ?? 'top',
    wrap: opts.wrap ?? true,
    shrinkText: opts.shrinkText ?? false,
    autoFit: opts.autoFit ?? false,
    margin: 0,
  });
}

export function addPageNumber(slide: Slide, n: number, total: number, t: PptxTheme): void {
  addTextBox(slide, `${n} / ${total}`, {
    x: SLIDE_W - t.paddingIn - px(120),
    y: SLIDE_H - py(70),
    w: px(120),
    h: py(50),
    fontSize: t.captionSize,
    color: t.muted,
    fontFace: t.fontBody,
    align: 'right',
  });
}

export function addEyebrow(slide: Slide, text: string, t: PptxTheme): void {
  addTextBox(slide, text.toUpperCase(), {
    x: t.paddingIn,
    y: py(80),
    w: SLIDE_W - 2 * t.paddingIn,
    h: py(50),
    fontSize: t.captionSize,
    color: t.accent,
    fontFace: t.fontBody,
  });
}

export function addHeading(slide: Slide, text: string, t: PptxTheme, y: number): void {
  addTextBox(slide, text, {
    x: t.paddingIn,
    y,
    w: SLIDE_W - 2 * t.paddingIn,
    fontSize: t.sectionSize,
    color: t.text,
    fontFace: t.fontDisplay,
    bold: true,
  });
}
```

- [ ] **Step 1: Create the file** — write `lib/pptx/helpers.ts` exactly as above

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty false 2>&1 | head -30`
Expected: zero errors in `lib/pptx/helpers.ts` (file may not appear at all if clean)

- [ ] **Step 3: Commit**

```bash
git add lib/pptx/helpers.ts
git commit -m "feat(pptx): helpers — coordinate conversion and primitive factories"
```

---

## Task 2: theme-map.ts — ThemeTokens → PptxTheme

**Files:**
- Create: `lib/pptx/theme-map.ts`
- Read: `lib/themes.ts` (THEMES export), `lib/types.ts` (ThemeId)

```typescript
// lib/pptx/theme-map.ts
import { THEMES } from '@/lib/themes';
import type { ThemeId } from '@/lib/types';
import type { PptxTheme } from './helpers';

function firstFont(stack: string): string {
  // e.g. '"Inter",sans-serif' → 'Inter'
  return stack.replace(/['"]/g, '').split(',')[0].trim();
}

function pxToPt(px: number): number { return Math.round(px * 0.75); }

function pxToIn(px: number): number { return px / 1920 * 13.333; }

function solidColor(css: string): string {
  // If the bg is a gradient, return the first hex color found; else strip #
  const m = css.match(/#([0-9a-fA-F]{6})/);
  return m ? m[1] : css.replace(/^#/, '');
}

export function buildPptxTheme(themeId: ThemeId): PptxTheme {
  const t = THEMES[themeId];
  return {
    bg: solidColor(t.bg),
    text: t.text.replace(/^#/, ''),
    accent: t.accent.replace(/^#/, ''),
    muted: t.muted.replace(/^#/, ''),
    rule: t.rule.replace(/^#/, ''),
    soft: t.soft.replace(/^#/, ''),
    fontDisplay: firstFont(t.fontDisplay),
    fontBody: firstFont(t.fontBody),
    fontMono: firstFont(t.fontMono),
    heroSize: pxToPt(t.hero),
    sectionSize: pxToPt(t.section),
    bodySize: pxToPt(t.body),
    captionSize: pxToPt(t.caption),
    paddingIn: pxToIn(t.padding),
  };
}
```

- [ ] **Step 1: Create the file** — write `lib/pptx/theme-map.ts` exactly as above

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty false 2>&1 | head -30`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/pptx/theme-map.ts
git commit -m "feat(pptx): theme-map — ThemeTokens to PptxTheme converter"
```

---

## Task 3: index.ts — entry point, dispatcher, fallback

**Files:**
- Create: `lib/pptx/index.ts`
- Read: `lib/export-pdf-pptx.ts` (for `captureSlide()` usage pattern)

```typescript
// lib/pptx/index.ts
import type { Deck, AnySlide } from '@/lib/types';
import { buildPptxTheme } from './theme-map';
import type { PptxTheme } from './helpers';
import { SLIDE_W, SLIDE_H } from './helpers';

type PptxSlide = ReturnType<import('pptxgenjs')['addSlide']>;

async function renderSlide(
  slide: PptxSlide,
  data: AnySlide,
  t: PptxTheme,
  idx: number,
  total: number,
): Promise<void> {
  const type = data.type;
  try {
    if (type === 'diagram') throw new Error('diagram — fallback');
    const mod = await import(`./slides/${type}`);
    await mod.render(slide, data, t, idx + 1, total);
  } catch {
    // fallback: should not reach here in index — handled by caller
    throw new Error('needs-fallback');
  }
}

export async function exportPPTXNative(deck: Deck, filename: string): Promise<void> {
  const { captureSlide } = await import('@/lib/export-pdf-pptx');
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'PG_HD', width: SLIDE_W, height: SLIDE_H });
  pptx.layout = 'PG_HD';
  pptx.title = deck.title;

  const t = buildPptxTheme(deck.themeId);
  const total = deck.slides.length;

  for (let i = 0; i < total; i++) {
    const data = deck.slides[i];
    const pslide = pptx.addSlide();
    try {
      await renderSlide(pslide, data, t, i, total);
    } catch {
      // fallback: screenshot embed
      try {
        const imgData = await captureSlide(i);
        pslide.addImage({ data: imgData, x: 0, y: 0, w: SLIDE_W, h: SLIDE_H });
      } catch {
        // if screenshot also fails, leave blank slide
      }
    }
  }

  await pptx.writeFile({ fileName: `${filename}.pptx` });
}
```

Note: `AnySlide` and `Deck` are existing exports from `lib/types.ts`. Check that `Deck` has `themeId: ThemeId` and `slides: AnySlide[]`.

- [ ] **Step 1: Check Deck type in lib/types.ts**

Run: `grep -n "interface Deck\|themeId\|AnySlide" lib/types.ts`
If `AnySlide` doesn't exist, check what the union type is called. It may be `SlideData` or a union. Update the import accordingly.

- [ ] **Step 2: Create the file** — write `lib/pptx/index.ts` with the correct type names from step 1

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit --pretty false 2>&1 | head -40`
Expected: no errors (slide module imports are dynamic so they won't error until slides exist)

- [ ] **Step 4: Commit**

```bash
git add lib/pptx/index.ts
git commit -m "feat(pptx): entry point — dispatcher with screenshot fallback"
```

---

## Task 4: cover + statement renderers

**Files:**
- Create: `lib/pptx/slides/cover.ts`
- Create: `lib/pptx/slides/statement.ts`

```typescript
// lib/pptx/slides/cover.ts
import type { CoverSlide } from '@/lib/types';
import {
  px, py, SLIDE_W, SLIDE_H,
  setBackground, addRect, addTextBox, addPageNumber, addEyebrow,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: CoverSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);

  // Vertical accent bar (left of title)
  addRect(slide, t.paddingIn - px(24), py(300), px(8), py(300), '#' + t.accent);

  if (data.eyebrow) addEyebrow(slide, data.eyebrow, t);

  // Title — split into runs for highlight
  const titleY = py(340);
  const titleW = SLIDE_W - 2 * t.paddingIn;
  if (data.highlight) {
    const parts = data.title.split(data.highlight);
    const runs: object[] = [];
    parts.forEach((part, i) => {
      if (part) runs.push({ text: part, options: { color: t.text, fontFace: t.fontDisplay, bold: true } });
      if (i < parts.length - 1) runs.push({ text: data.highlight!, options: { color: t.accent, fontFace: t.fontDisplay, bold: true } });
    });
    slide.addText(runs as Parameters<Slide['addText']>[0], {
      x: t.paddingIn, y: titleY, w: titleW,
      fontSize: t.heroSize,
      bold: true,
      wrap: true,
    });
  } else {
    addTextBox(slide, data.title, {
      x: t.paddingIn, y: titleY, w: titleW,
      fontSize: t.heroSize,
      color: '#' + t.text,
      fontFace: t.fontDisplay,
      bold: true,
    });
  }

  if (data.subtitle) {
    addTextBox(slide, data.subtitle, {
      x: t.paddingIn, y: py(520),
      w: SLIDE_W - 2 * t.paddingIn,
      fontSize: t.bodySize,
      color: '#' + t.muted,
      fontFace: t.fontBody,
    });
  }

  addPageNumber(slide, n, total, t);
}
```

```typescript
// lib/pptx/slides/statement.ts
import type { StatementSlide } from '@/lib/types';
import {
  py, SLIDE_W, SLIDE_H,
  setBackground, addLine, addTextBox, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: StatementSlide, t: PptxTheme): void {
  setBackground(slide, '#' + t.bg);

  const titleSize = Math.round(t.heroSize * 0.85);
  const centerY = py(340);
  const align = data.align ?? 'center';

  if (data.highlight && data.highlight.length > 0) {
    const highlighted = new Set(data.highlight);
    const words = data.title.split(' ');
    const runs: object[] = [];
    words.forEach((w, i) => {
      runs.push({ text: (i > 0 ? ' ' : '') + w, options: { color: highlighted.has(w) ? t.accent : t.text, fontFace: t.fontDisplay, bold: true } });
    });
    slide.addText(runs as Parameters<Slide['addText']>[0], {
      x: t.paddingIn, y: centerY, w: SLIDE_W - 2 * t.paddingIn,
      fontSize: titleSize,
      bold: true,
      align,
      wrap: true,
    });
  } else {
    addTextBox(slide, data.title, {
      x: t.paddingIn, y: centerY, w: SLIDE_W - 2 * t.paddingIn,
      fontSize: titleSize,
      color: '#' + t.text,
      fontFace: t.fontDisplay,
      bold: true,
      align,
    });
  }

  // Accent line below title
  addLine(slide, t.paddingIn, py(520), SLIDE_W - t.paddingIn, py(520), '#' + t.accent, 2);
}
```

- [ ] **Step 1: Create both files** as shown above

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty false 2>&1 | head -40`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/pptx/slides/cover.ts lib/pptx/slides/statement.ts
git commit -m "feat(pptx): cover + statement renderers"
```

---

## Task 5: process + data renderers

**Files:**
- Create: `lib/pptx/slides/process.ts`
- Create: `lib/pptx/slides/data.ts`

```typescript
// lib/pptx/slides/process.ts
import type { ProcessSlide } from '@/lib/types';
import {
  px, py, SLIDE_W, SLIDE_H,
  setBackground, addLine, addTextBox, addHeading, addPageNumber, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: ProcessSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(80));

  const steps = data.steps.slice(0, 5);
  const colW = (SLIDE_W - 2 * t.paddingIn) / steps.length;

  steps.forEach((step, i) => {
    const x = t.paddingIn + i * colW;
    // Vertical separator
    if (i > 0) addLine(slide, x, py(200), x, py(900), '#' + t.rule, 1);

    // Step number
    addTextBox(slide, String(i + 1).padStart(2, '0'), {
      x: x + px(20), y: py(220),
      w: colW - px(40),
      fontSize: Math.round(t.heroSize * 0.6),
      color: '#' + t.accent,
      fontFace: t.fontDisplay,
      bold: true,
    });
    // Step title
    addTextBox(slide, step.title, {
      x: x + px(20), y: py(430),
      w: colW - px(40),
      fontSize: t.bodySize,
      color: '#' + t.text,
      fontFace: t.fontBody,
      bold: true,
      wrap: true,
    });
    // Step desc
    if (step.desc) {
      addTextBox(slide, step.desc, {
        x: x + px(20), y: py(560),
        w: colW - px(40),
        fontSize: t.captionSize,
        color: '#' + t.muted,
        fontFace: t.fontBody,
        wrap: true,
      });
    }
  });

  addPageNumber(slide, n, total, t);
}
```

```typescript
// lib/pptx/slides/data.ts
import type { DataSlide } from '@/lib/types';
import {
  px, py, SLIDE_W, SLIDE_H,
  setBackground, addLine, addTextBox, addHeading, addPageNumber, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: DataSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(80));
  addLine(slide, t.paddingIn, py(180), SLIDE_W - t.paddingIn, py(180), '#' + t.accent, 2);

  const stats = data.stats.slice(0, 4);
  const colW = (SLIDE_W - 2 * t.paddingIn) / stats.length;

  stats.forEach((s, i) => {
    const x = t.paddingIn + i * colW;
    addTextBox(slide, s.value, {
      x: x + px(20), y: py(260),
      w: colW - px(40),
      fontSize: Math.round(t.heroSize * 0.75),
      color: '#' + t.accent,
      fontFace: t.fontDisplay,
      bold: true,
    });
    addTextBox(slide, s.label, {
      x: x + px(20), y: py(480),
      w: colW - px(40),
      fontSize: t.bodySize,
      color: '#' + t.muted,
      fontFace: t.fontBody,
      wrap: true,
    });
    if (s.source) {
      addTextBox(slide, s.source, {
        x: x + px(20), y: py(580),
        w: colW - px(40),
        fontSize: t.captionSize,
        color: '#' + t.muted,
        fontFace: t.fontBody,
        italic: true,
        wrap: true,
      });
    }
  });

  addPageNumber(slide, n, total, t);
}
```

- [ ] **Step 1: Create both files** as shown above

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty false 2>&1 | head -40`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/pptx/slides/process.ts lib/pptx/slides/data.ts
git commit -m "feat(pptx): process + data renderers"
```

---

## Task 6: argument + quote + cta renderers

**Files:**
- Create: `lib/pptx/slides/argument.ts`
- Create: `lib/pptx/slides/quote.ts`
- Create: `lib/pptx/slides/cta.ts`

```typescript
// lib/pptx/slides/argument.ts
import type { ArgumentSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addTextBox, addHeading, addPageNumber, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: ArgumentSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(80));

  data.points.forEach((point, i) => {
    const y = py(220) + i * py(120);
    // Accent bullet square
    addRect(slide, t.paddingIn, y + py(10), px(16), px(16), '#' + t.accent);
    addTextBox(slide, point, {
      x: t.paddingIn + px(32), y,
      w: SLIDE_W - 2 * t.paddingIn - px(32),
      fontSize: t.bodySize,
      color: '#' + t.text,
      fontFace: t.fontBody,
      wrap: true,
    });
  });

  addPageNumber(slide, n, total, t);
}
```

```typescript
// lib/pptx/slides/quote.ts
import type { QuoteSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addTextBox, addPageNumber, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: QuoteSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);

  // Large decorative quote mark
  addTextBox(slide, '“', {
    x: t.paddingIn, y: py(80),
    w: px(200),
    fontSize: Math.round(t.heroSize * 1.5),
    color: '#' + t.accent,
    fontFace: t.fontDisplay,
    bold: true,
  });

  addTextBox(slide, data.quote, {
    x: t.paddingIn, y: py(200),
    w: SLIDE_W - 2 * t.paddingIn,
    fontSize: t.sectionSize,
    color: '#' + t.text,
    fontFace: t.fontDisplay,
    italic: true,
    align: 'center',
    wrap: true,
  });

  addTextBox(slide, `— ${data.source}`, {
    x: t.paddingIn, y: py(700),
    w: SLIDE_W - 2 * t.paddingIn,
    fontSize: t.captionSize,
    color: '#' + t.muted,
    fontFace: t.fontBody,
    align: 'center',
  });

  addPageNumber(slide, n, total, t);
}
```

```typescript
// lib/pptx/slides/cta.ts
import type { CTASlide } from '@/lib/types';
import {
  py, SLIDE_W, SLIDE_H,
  setBackground, addTextBox, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: CTASlide, t: PptxTheme): void {
  // CTA inverts: accent background
  setBackground(slide, '#' + t.accent);

  const whiteColor = 'FFFFFF';
  const textSize = Math.round(t.heroSize * 0.8);

  addTextBox(slide, data.newAction, {
    x: t.paddingIn, y: py(380),
    w: SLIDE_W - 2 * t.paddingIn,
    fontSize: textSize,
    color: whiteColor,
    fontFace: t.fontDisplay,
    bold: true,
    align: 'center',
    wrap: true,
  });
}
```

- [ ] **Step 1: Create all three files** as shown above

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty false 2>&1 | head -40`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/pptx/slides/argument.ts lib/pptx/slides/quote.ts lib/pptx/slides/cta.ts
git commit -m "feat(pptx): argument + quote + cta renderers"
```

---

## Task 7: compare + timeline renderers

**Files:**
- Create: `lib/pptx/slides/compare.ts`
- Create: `lib/pptx/slides/timeline.ts`

```typescript
// lib/pptx/slides/compare.ts
import type { CompareSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addLine, addTextBox, addHeading, addPageNumber, hexColor, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: CompareSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(60));

  const midX = SLIDE_W / 2;
  const colW = (SLIDE_W - 2 * t.paddingIn) / 2 - px(20);
  const leftX = t.paddingIn;
  const rightX = midX + px(20);
  const contentY = py(200);
  const contentH = py(760);

  // Left column bg (slightly lighter — use 10% transparent bg)
  addRect(slide, leftX, contentY, colW, contentH, '#' + t.rule, { transparency: 85 });
  // Right column bg (accent tint)
  addRect(slide, rightX, contentY, colW, contentH, '#' + t.accent, { transparency: 90 });
  // Center divider
  addLine(slide, midX, contentY, midX, contentY + contentH, '#' + t.rule, 2);

  // Left column title
  addTextBox(slide, data.left.title, {
    x: leftX + px(20), y: contentY + py(20),
    w: colW - px(40),
    fontSize: t.bodySize,
    color: '#' + t.text,
    fontFace: t.fontBody,
    bold: true,
  });
  data.left.items.forEach((item, i) => {
    addTextBox(slide, `• ${item}`, {
      x: leftX + px(20), y: contentY + py(100) + i * py(100),
      w: colW - px(40),
      fontSize: t.bodySize,
      color: '#' + t.text,
      fontFace: t.fontBody,
      wrap: true,
    });
  });

  // Right column title
  addTextBox(slide, data.right.title, {
    x: rightX + px(20), y: contentY + py(20),
    w: colW - px(40),
    fontSize: t.bodySize,
    color: '#' + t.text,
    fontFace: t.fontBody,
    bold: true,
  });
  data.right.items.forEach((item, i) => {
    addTextBox(slide, `• ${item}`, {
      x: rightX + px(20), y: contentY + py(100) + i * py(100),
      w: colW - px(40),
      fontSize: t.bodySize,
      color: '#' + t.text,
      fontFace: t.fontBody,
      wrap: true,
    });
  });

  addPageNumber(slide, n, total, t);
}
```

```typescript
// lib/pptx/slides/timeline.ts
import type { TimelineSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addLine, addTextBox, addHeading, addPageNumber, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: TimelineSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(60));

  const events = data.events.slice(0, 6);
  const timelineY = py(500);
  const colW = (SLIDE_W - 2 * t.paddingIn) / events.length;

  // Horizontal timeline line
  addLine(slide, t.paddingIn, timelineY, SLIDE_W - t.paddingIn, timelineY, '#' + t.rule, 1);

  events.forEach((ev, i) => {
    const dotX = t.paddingIn + (i + 0.5) * colW;

    // Time label above
    addTextBox(slide, ev.time, {
      x: dotX - colW / 2, y: py(360),
      w: colW,
      fontSize: t.captionSize,
      color: '#' + t.accent,
      fontFace: t.fontBody,
      align: 'center',
    });

    // Accent dot
    addRect(slide, dotX - px(10), timelineY - py(12), px(20), py(24), '#' + t.accent);

    // Title below
    addTextBox(slide, ev.title, {
      x: dotX - colW / 2, y: timelineY + py(30),
      w: colW,
      fontSize: t.bodySize,
      color: '#' + t.text,
      fontFace: t.fontBody,
      bold: true,
      align: 'center',
      wrap: true,
    });

    if (ev.desc) {
      addTextBox(slide, ev.desc, {
        x: dotX - colW / 2, y: timelineY + py(120),
        w: colW,
        fontSize: t.captionSize,
        color: '#' + t.muted,
        fontFace: t.fontBody,
        align: 'center',
        wrap: true,
      });
    }
  });

  addPageNumber(slide, n, total, t);
}
```

- [ ] **Step 1: Create both files** as shown above

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty false 2>&1 | head -40`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add lib/pptx/slides/compare.ts lib/pptx/slides/timeline.ts
git commit -m "feat(pptx): compare + timeline renderers"
```

---

## Task 8: checklist + question renderers

**Files:**
- Create: `lib/pptx/slides/checklist.ts`
- Create: `lib/pptx/slides/question.ts`

```typescript
// lib/pptx/slides/checklist.ts
import type { ChecklistSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addLine, addTextBox, addHeading, addPageNumber, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: ChecklistSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(80));

  data.items.forEach((item, i) => {
    const y = py(220) + i * py(110);
    // Checkbox outline
    addRect(slide, t.paddingIn, y, px(28), py(38), '#' + t.bg, { line: { color: t.accent, width: 2 } });
    addTextBox(slide, item, {
      x: t.paddingIn + px(48), y,
      w: SLIDE_W - 2 * t.paddingIn - px(48),
      fontSize: t.bodySize,
      color: '#' + t.text,
      fontFace: t.fontBody,
      wrap: true,
    });
  });

  addPageNumber(slide, n, total, t);
}
```

```typescript
// lib/pptx/slides/question.ts
import type { QuestionSlide } from '@/lib/types';
import {
  py, SLIDE_W,
  setBackground, addTextBox, addPageNumber, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: QuestionSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);

  addTextBox(slide, data.question, {
    x: t.paddingIn, y: py(300),
    w: SLIDE_W - 2 * t.paddingIn,
    fontSize: Math.round(t.heroSize * 0.7),
    color: '#' + t.text,
    fontFace: t.fontDisplay,
    bold: true,
    align: 'center',
    wrap: true,
  });

  if (data.hints && data.hints.length > 0) {
    addTextBox(slide, data.hints.map(h => `• ${h}`).join('\n'), {
      x: t.paddingIn, y: py(620),
      w: SLIDE_W - 2 * t.paddingIn,
      fontSize: t.bodySize,
      color: '#' + t.muted,
      fontFace: t.fontBody,
      align: 'center',
      wrap: true,
    });
  }

  if (data.invitation) {
    addTextBox(slide, data.invitation, {
      x: t.paddingIn, y: py(850),
      w: SLIDE_W - 2 * t.paddingIn,
      fontSize: t.captionSize,
      color: '#' + t.accent,
      fontFace: t.fontBody,
      italic: true,
      align: 'center',
    });
  }

  addPageNumber(slide, n, total, t);
}
```

Note: `QuestionSlide` in `lib/types.ts` has fields `question`, `hints?`, and `invitation?`. Verify the field names before writing — run `grep -A 10 "QuestionSlide" lib/types.ts`.

- [ ] **Step 1: Verify QuestionSlide fields**

Run: `grep -A 10 "QuestionSlide" lib/types.ts`
Adjust field names in `question.ts` if they differ.

- [ ] **Step 2: Create both files**

- [ ] **Step 3: TypeScript check**

Run: `npx tsc --noEmit --pretty false 2>&1 | head -40`

- [ ] **Step 4: Commit**

```bash
git add lib/pptx/slides/checklist.ts lib/pptx/slides/question.ts
git commit -m "feat(pptx): checklist + question renderers"
```

---

## Task 9: matrix-2x2 + chart-bar renderers

**Files:**
- Create: `lib/pptx/slides/matrix-2x2.ts`
- Create: `lib/pptx/slides/chart-bar.ts`

```typescript
// lib/pptx/slides/matrix-2x2.ts
import type { Matrix2x2Slide } from '@/lib/types';
import {
  px, py, SLIDE_W, SLIDE_H,
  setBackground, addRect, addLine, addTextBox, addHeading, addPageNumber, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: Matrix2x2Slide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(60));

  const gridLeft = t.paddingIn;
  const gridTop = py(200);
  const gridW = SLIDE_W - 2 * t.paddingIn;
  const gridH = py(780);
  const midX = gridLeft + gridW / 2;
  const midY = gridTop + gridH / 2;

  // Grid lines
  addLine(slide, midX, gridTop, midX, gridTop + gridH, '#' + t.rule, 1);
  addLine(slide, gridLeft, midY, gridLeft + gridW, midY, '#' + t.rule, 1);

  // Axis labels
  const { x: xa, y: ya } = data.axes;
  addTextBox(slide, xa.low, { x: gridLeft, y: gridTop + gridH + py(10), w: gridW / 2, fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody });
  addTextBox(slide, xa.high, { x: midX, y: gridTop + gridH + py(10), w: gridW / 2, fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, align: 'right' });
  addTextBox(slide, ya.high, { x: gridLeft - px(80), y: gridTop, w: px(80), fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, align: 'right' });
  addTextBox(slide, ya.low, { x: gridLeft - px(80), y: midY, w: px(80), fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, align: 'right' });

  // Cells: order [top-left, top-right, bottom-left, bottom-right]
  const positions = [
    { x: gridLeft, y: gridTop },
    { x: midX, y: gridTop },
    { x: gridLeft, y: midY },
    { x: midX, y: midY },
  ];
  const cellW = gridW / 2;
  const cellH = gridH / 2;

  data.cells.forEach((cell, i) => {
    const { x, y } = positions[i];
    if (cell.emphasis) {
      addRect(slide, x + px(4), y + py(4), cellW - px(8), cellH - py(8), '#' + t.accent, { transparency: 85 });
    }
    addTextBox(slide, cell.label, { x: x + px(16), y: y + py(16), w: cellW - px(32), fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, bold: true, wrap: true });
    if (cell.desc) {
      addTextBox(slide, cell.desc, { x: x + px(16), y: y + py(80), w: cellW - px(32), fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, wrap: true });
    }
  });

  addPageNumber(slide, n, total, t);
}
```

```typescript
// lib/pptx/slides/chart-bar.ts
import type { ChartBarSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addTextBox, addHeading, addPageNumber, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: ChartBarSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(60));

  const bars = data.bars.slice(0, 8);
  const maxVal = Math.max(...bars.map(b => b.value), 1);
  const barAreaLeft = t.paddingIn + px(180);
  const barAreaW = SLIDE_W - barAreaLeft - t.paddingIn - px(120);
  const rowH = py(720) / bars.length;
  const barH = rowH * 0.55;
  const startY = py(200);

  bars.forEach((bar, i) => {
    const y = startY + i * rowH;
    const isHighlight = bar.label === data.highlight;
    const barW = (bar.value / maxVal) * barAreaW;

    // Label
    addTextBox(slide, bar.label, {
      x: t.paddingIn, y: y + rowH * 0.1,
      w: px(170),
      fontSize: t.captionSize,
      color: '#' + t.muted,
      fontFace: t.fontBody,
      align: 'right',
    });
    // Bar
    addRect(slide, barAreaLeft, y + (rowH - barH) / 2, barW, barH, '#' + (isHighlight ? t.accent : t.rule));
    // Value
    addTextBox(slide, String(bar.value), {
      x: barAreaLeft + barW + px(8), y: y + (rowH - barH) / 2,
      w: px(100),
      fontSize: t.bodySize,
      color: '#' + t.text,
      fontFace: t.fontBody,
      bold: isHighlight,
    });
  });

  if (data.source) {
    addTextBox(slide, data.source, {
      x: t.paddingIn, y: py(940),
      w: SLIDE_W - 2 * t.paddingIn,
      fontSize: t.captionSize,
      color: '#' + t.muted,
      fontFace: t.fontBody,
    });
  }

  addPageNumber(slide, n, total, t);
}
```

- [ ] **Step 1: Create both files** as shown above

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty false 2>&1 | head -40`

- [ ] **Step 3: Commit**

```bash
git add lib/pptx/slides/matrix-2x2.ts lib/pptx/slides/chart-bar.ts
git commit -m "feat(pptx): matrix-2x2 + chart-bar renderers"
```

---

## Task 10: kpi-board + roadmap renderers

**Files:**
- Create: `lib/pptx/slides/kpi-board.ts`
- Create: `lib/pptx/slides/roadmap.ts`

```typescript
// lib/pptx/slides/kpi-board.ts
import type { KpiBoardSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addTextBox, addPageNumber, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

const DELTA_POS = '22B800'; // green
const DELTA_NEG = 'D93025'; // red

export function render(slide: Slide, data: KpiBoardSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);

  addTextBox(slide, data.heading, {
    x: t.paddingIn, y: py(60),
    w: SLIDE_W - 2 * t.paddingIn - px(300),
    fontSize: t.sectionSize,
    color: '#' + t.text,
    fontFace: t.fontDisplay,
    bold: true,
  });
  addTextBox(slide, data.period, {
    x: SLIDE_W - t.paddingIn - px(300), y: py(70),
    w: px(290),
    fontSize: t.captionSize,
    color: '#' + t.muted,
    fontFace: t.fontBody,
    align: 'right',
  });

  const kpis = data.kpis.slice(0, 6);
  const cols = kpis.length <= 4 ? 4 : Math.min(kpis.length, 3);
  const rows = Math.ceil(kpis.length / cols);
  const cardW = (SLIDE_W - 2 * t.paddingIn - (cols - 1) * px(20)) / cols;
  const cardH = (py(700) - (rows - 1) * py(20)) / rows;
  const startY = py(180);

  kpis.forEach((kpi, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = t.paddingIn + col * (cardW + px(20));
    const y = startY + row * (cardH + py(20));

    addRect(slide, x, y, cardW, cardH, '#' + t.rule, { transparency: 90 });

    addTextBox(slide, kpi.value, {
      x: x + px(16), y: y + py(16),
      w: cardW - px(32),
      fontSize: Math.round(t.heroSize * 0.7),
      color: '#' + t.text,
      fontFace: t.fontDisplay,
      bold: true,
    });

    if (kpi.delta) {
      const deltaColor = kpi.deltaTone === 'pos' ? DELTA_POS : kpi.deltaTone === 'neg' ? DELTA_NEG : t.muted;
      addTextBox(slide, kpi.delta, {
        x: x + px(16), y: y + py(130),
        w: cardW - px(32),
        fontSize: t.captionSize,
        color: '#' + deltaColor,
        fontFace: t.fontBody,
      });
    }

    addTextBox(slide, kpi.label, {
      x: x + px(16), y: y + cardH - py(80),
      w: cardW - px(32),
      fontSize: t.captionSize,
      color: '#' + t.muted,
      fontFace: t.fontBody,
    });
  });

  if (data.takeaway) {
    addRect(slide, t.paddingIn, py(900), SLIDE_W - 2 * t.paddingIn, py(60), '#' + t.accent, { transparency: 80 });
    addTextBox(slide, data.takeaway, {
      x: t.paddingIn + px(16), y: py(905),
      w: SLIDE_W - 2 * t.paddingIn - px(32),
      fontSize: t.bodySize,
      color: '#' + t.text,
      fontFace: t.fontBody,
    });
  }

  addPageNumber(slide, n, total, t);
}
```

```typescript
// lib/pptx/slides/roadmap.ts
import type { RoadmapSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addTextBox, addHeading, addPageNumber, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: RoadmapSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(60));

  const periods = data.periods.slice(0, 4);
  const lanes = data.lanes.slice(0, 4);
  const labelColW = px(180);
  const gridLeft = t.paddingIn + labelColW + px(10);
  const gridW = SLIDE_W - gridLeft - t.paddingIn;
  const periodW = gridW / periods.length;
  const rowH = py(600) / lanes.length;
  const headerH = py(60);
  const startY = py(180);

  // Period headers
  periods.forEach((period, pi) => {
    const x = gridLeft + pi * periodW;
    addRect(slide, x, startY, periodW - px(4), headerH, '#' + t.accent, { transparency: 20 });
    addTextBox(slide, period, {
      x: x + px(8), y: startY + py(10),
      w: periodW - px(16),
      fontSize: t.captionSize,
      color: 'FFFFFF',
      fontFace: t.fontBody,
      align: 'center',
    });
  });

  // Lanes
  lanes.forEach((lane, li) => {
    const y = startY + headerH + py(10) + li * rowH;

    addTextBox(slide, lane.name, {
      x: t.paddingIn, y: y + rowH * 0.25,
      w: labelColW,
      fontSize: t.bodySize,
      color: '#' + t.text,
      fontFace: t.fontBody,
      bold: true,
    });

    lane.items.forEach((ms) => {
      const pi = periods.indexOf(ms.period);
      if (pi === -1) return;
      const span = ms.span ?? 1;
      const cellX = gridLeft + pi * periodW + px(4);
      const cellW = span * periodW - px(8);
      const cellColor = ms.emphasis ? t.accent : t.rule;
      const textColor = ms.emphasis ? 'FFFFFF' : t.text;

      addRect(slide, cellX, y + rowH * 0.15, cellW, rowH * 0.7, '#' + cellColor, { transparency: ms.emphasis ? 0 : 70 });
      addTextBox(slide, ms.label, {
        x: cellX + px(8), y: y + rowH * 0.15 + py(8),
        w: cellW - px(16),
        fontSize: t.captionSize,
        color: '#' + textColor,
        fontFace: t.fontBody,
        bold: ms.emphasis,
        wrap: true,
      });
    });
  });

  addPageNumber(slide, n, total, t);
}
```

- [ ] **Step 1: Create both files** as shown above

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty false 2>&1 | head -40`

- [ ] **Step 3: Commit**

```bash
git add lib/pptx/slides/kpi-board.ts lib/pptx/slides/roadmap.ts
git commit -m "feat(pptx): kpi-board + roadmap renderers"
```

---

## Task 11: case-study + table renderers

**Files:**
- Create: `lib/pptx/slides/case-study.ts`
- Create: `lib/pptx/slides/table.ts`

```typescript
// lib/pptx/slides/case-study.ts
import type { CaseStudySlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addLine, addTextBox, addPageNumber, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: CaseStudySlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);

  // Client header
  addTextBox(slide, data.client, {
    x: t.paddingIn, y: py(60),
    w: SLIDE_W * 0.6,
    fontSize: Math.round(t.heroSize * 0.5),
    color: '#' + t.accent,
    fontFace: t.fontDisplay,
    bold: true,
  });
  if (data.clientMeta) {
    addTextBox(slide, data.clientMeta, {
      x: t.paddingIn, y: py(160),
      w: SLIDE_W * 0.6,
      fontSize: t.captionSize,
      color: '#' + t.muted,
      fontFace: t.fontBody,
    });
  }

  // Divider
  addLine(slide, t.paddingIn, py(210), SLIDE_W - t.paddingIn, py(210), '#' + t.rule, 1);

  const leftW = SLIDE_W * 0.55 - t.paddingIn;
  const rightX = SLIDE_W * 0.58;
  const rightW = SLIDE_W - rightX - t.paddingIn;

  // Left sections
  const sections = [
    { label: 'CONTEXT', text: data.context },
    { label: 'CHALLENGE', text: data.challenge },
    { label: 'APPROACH', text: data.approach },
  ];
  let leftY = py(240);
  sections.forEach(({ label, text }) => {
    addTextBox(slide, label, {
      x: t.paddingIn, y: leftY,
      w: leftW, fontSize: t.captionSize,
      color: '#' + t.accent, fontFace: t.fontBody,
    });
    leftY += py(40);
    addTextBox(slide, text, {
      x: t.paddingIn, y: leftY,
      w: leftW, fontSize: t.bodySize,
      color: '#' + t.text, fontFace: t.fontBody, wrap: true,
    });
    leftY += py(160);
  });

  // Right: results
  let rightY = py(240);
  data.results.slice(0, 3).forEach((r) => {
    addRect(slide, rightX, rightY, rightW, py(130), '#' + t.rule, { transparency: 85 });
    addTextBox(slide, r.value, {
      x: rightX + px(16), y: rightY + py(10),
      w: rightW - px(32), fontSize: Math.round(t.heroSize * 0.45),
      color: '#' + t.accent, fontFace: t.fontDisplay, bold: true,
    });
    addTextBox(slide, r.metric + (r.delta ? `  ${r.delta}` : ''), {
      x: rightX + px(16), y: rightY + py(80),
      w: rightW - px(32), fontSize: t.captionSize,
      color: '#' + t.muted, fontFace: t.fontBody,
    });
    rightY += py(150);
  });

  // Quote box
  if (data.quote) {
    addRect(slide, rightX, rightY, rightW, py(200), '#' + t.accent, { transparency: 90 });
    addLine(slide, rightX, rightY, rightX, rightY + py(200), '#' + t.accent, 4);
    addTextBox(slide, `"${data.quote}"`, {
      x: rightX + px(20), y: rightY + py(16),
      w: rightW - px(32), fontSize: t.captionSize,
      color: '#' + t.text, fontFace: t.fontBody, italic: true, wrap: true,
    });
    if (data.quoteAttribution) {
      addTextBox(slide, `— ${data.quoteAttribution}`, {
        x: rightX + px(20), y: rightY + py(130),
        w: rightW - px(32), fontSize: t.captionSize,
        color: '#' + t.muted, fontFace: t.fontBody,
      });
    }
  }

  addPageNumber(slide, n, total, t);
}
```

```typescript
// lib/pptx/slides/table.ts
import type { TableSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addLine, addTextBox, addHeading, addPageNumber, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: TableSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(60));

  const cols = data.columns.slice(0, 5);
  const rows = data.rows.slice(0, 6);
  const tableLeft = t.paddingIn;
  const tableW = SLIDE_W - 2 * t.paddingIn;
  const colW = tableW / cols.length;
  const headerH = py(70);
  const rowH = py(680) / rows.length;
  const startY = py(190);

  // Header
  cols.forEach((col, ci) => {
    const x = tableLeft + ci * colW;
    addRect(slide, x, startY, colW - px(2), headerH, '#' + t.accent);
    addTextBox(slide, col.label, {
      x: x + px(12), y: startY + py(14),
      w: colW - px(24),
      fontSize: t.bodySize,
      color: 'FFFFFF',
      fontFace: t.fontBody,
      bold: true,
      align: col.align ?? 'left',
    });
  });

  // Data rows
  rows.forEach((row, ri) => {
    const y = startY + headerH + ri * rowH;
    const isEven = ri % 2 === 1;
    if (isEven || row.emphasis) {
      addRect(slide, tableLeft, y, tableW, rowH, '#' + (row.emphasis ? t.accent : t.rule), { transparency: row.emphasis ? 85 : 92 });
    }

    cols.forEach((col, ci) => {
      const x = tableLeft + ci * colW;
      const isHighlightCol = data.highlightColumn === col.id;
      if (isHighlightCol) {
        addLine(slide, x, y, x, y + rowH, '#' + t.accent, 3);
      }
      addTextBox(slide, row.cells[col.id] ?? '', {
        x: x + px(12) + (isHighlightCol ? px(3) : 0),
        y: y + py(14),
        w: colW - px(24),
        fontSize: t.bodySize,
        color: '#' + t.text,
        fontFace: t.fontBody,
        align: col.align ?? 'left',
      });
    });
  });

  if (data.source) {
    addTextBox(slide, data.source, {
      x: tableLeft, y: py(920),
      w: tableW,
      fontSize: t.captionSize,
      color: '#' + t.muted,
      fontFace: t.fontBody,
    });
  }

  addPageNumber(slide, n, total, t);
}
```

- [ ] **Step 1: Create both files** as shown above

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty false 2>&1 | head -40`

- [ ] **Step 3: Commit**

```bash
git add lib/pptx/slides/case-study.ts lib/pptx/slides/table.ts
git commit -m "feat(pptx): case-study + table renderers"
```

---

## Task 12: causality + persona + quadrant renderers

**Files:**
- Create: `lib/pptx/slides/causality.ts`
- Create: `lib/pptx/slides/persona.ts`
- Create: `lib/pptx/slides/quadrant.ts`

```typescript
// lib/pptx/slides/causality.ts
import type { CausalitySlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addLine, addTextBox, addHeading, addPageNumber, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: CausalitySlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(60));

  const chain = data.chain.slice(0, 5);
  const nodeW = px(260);
  const nodeH = py(180);
  const chainY = py(380);
  const totalW = SLIDE_W - 2 * t.paddingIn;
  const spacing = (totalW - chain.length * nodeW) / (chain.length - 1 || 1);

  chain.forEach((link, i) => {
    const x = t.paddingIn + i * (nodeW + spacing);
    // Node border rect
    addRect(slide, x, chainY, nodeW, nodeH, '#' + t.bg, { line: { color: t.accent, width: 2 } });
    addTextBox(slide, link.cause, {
      x: x + px(12), y: chainY + py(30),
      w: nodeW - px(24),
      fontSize: t.bodySize,
      color: '#' + t.text,
      fontFace: t.fontBody,
      align: 'center',
      wrap: true,
    });
    // Arrow
    if (i < chain.length - 1) {
      const arrowX = x + nodeW + spacing / 2;
      addTextBox(slide, '→', {
        x: arrowX - px(20), y: chainY + nodeH / 2 - py(20),
        w: px(40),
        fontSize: t.sectionSize,
        color: '#' + t.accent,
        fontFace: t.fontBody,
        align: 'center',
      });
      if (link.because) {
        addTextBox(slide, link.because, {
          x: x + nodeW + px(4), y: chainY + nodeH + py(10),
          w: spacing - px(8),
          fontSize: t.captionSize,
          color: '#' + t.muted,
          fontFace: t.fontBody,
          italic: true,
          align: 'center',
          wrap: true,
        });
      }
    }
  });

  if (data.conclusion) {
    addLine(slide, t.paddingIn, py(720), t.paddingIn + px(6), py(800), '#' + t.accent, 4);
    addTextBox(slide, data.conclusion, {
      x: t.paddingIn + px(20), y: py(725),
      w: SLIDE_W - 2 * t.paddingIn - px(20),
      fontSize: t.bodySize,
      color: '#' + t.text,
      fontFace: t.fontBody,
      bold: true,
      wrap: true,
    });
  }

  addPageNumber(slide, n, total, t);
}
```

```typescript
// lib/pptx/slides/persona.ts
import type { PersonaSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addLine, addTextBox, addPageNumber, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: PersonaSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);

  // Avatar circle (approximated as rect)
  const avatarSize = px(120);
  addRect(slide, t.paddingIn, py(80), avatarSize, avatarSize, '#' + t.accent);
  const initials = data.name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  addTextBox(slide, initials, {
    x: t.paddingIn, y: py(80),
    w: avatarSize, h: avatarSize,
    fontSize: Math.round(t.heroSize * 0.4),
    color: 'FFFFFF',
    fontFace: t.fontDisplay,
    bold: true,
    align: 'center',
    valign: 'middle',
  });

  const infoX = t.paddingIn + avatarSize + px(30);
  const infoW = SLIDE_W * 0.45 - avatarSize - px(30);

  addTextBox(slide, data.name, {
    x: infoX, y: py(90),
    w: infoW,
    fontSize: t.sectionSize,
    color: '#' + t.text,
    fontFace: t.fontDisplay,
    bold: true,
  });
  addTextBox(slide, data.role, {
    x: infoX, y: py(170),
    w: infoW,
    fontSize: t.bodySize,
    color: '#' + t.muted,
    fontFace: t.fontBody,
  });

  addLine(slide, t.paddingIn, py(250), SLIDE_W - t.paddingIn, py(250), '#' + t.rule, 1);

  // Attributes grid
  const attrs = data.attributes ?? [];
  attrs.slice(0, 6).forEach((attr, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const attrX = t.paddingIn + col * (SLIDE_W * 0.45);
    const attrY = py(280) + row * py(100);
    addTextBox(slide, attr.label.toUpperCase(), {
      x: attrX, y: attrY,
      w: px(300),
      fontSize: t.captionSize,
      color: '#' + t.muted,
      fontFace: t.fontBody,
    });
    addTextBox(slide, attr.value, {
      x: attrX, y: attrY + py(36),
      w: px(300),
      fontSize: t.bodySize,
      color: '#' + t.text,
      fontFace: t.fontBody,
    });
  });

  // Right column: needs + pains
  const rightX = SLIDE_W * 0.55;
  const rightW = SLIDE_W - rightX - t.paddingIn;
  let ry = py(260);

  if (data.needs && data.needs.length > 0) {
    addTextBox(slide, 'NEEDS', { x: rightX, y: ry, w: rightW, fontSize: t.captionSize, color: '#' + t.accent, fontFace: t.fontBody });
    ry += py(40);
    data.needs.forEach(need => {
      addTextBox(slide, `✓ ${need}`, { x: rightX, y: ry, w: rightW, fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, wrap: true });
      ry += py(70);
    });
  }

  if (data.pains && data.pains.length > 0) {
    ry += py(20);
    addTextBox(slide, 'PAINS', { x: rightX, y: ry, w: rightW, fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody });
    ry += py(40);
    data.pains.forEach(pain => {
      addTextBox(slide, `✗ ${pain}`, { x: rightX, y: ry, w: rightW, fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, wrap: true });
      ry += py(70);
    });
  }

  if (data.quote) {
    addLine(slide, t.paddingIn, py(760), t.paddingIn, py(880), '#' + t.accent, 4);
    addTextBox(slide, `"${data.quote}"`, {
      x: t.paddingIn + px(20), y: py(770),
      w: SLIDE_W * 0.5,
      fontSize: t.bodySize,
      color: '#' + t.text,
      fontFace: t.fontBody,
      italic: true,
      wrap: true,
    });
  }

  addPageNumber(slide, n, total, t);
}
```

```typescript
// lib/pptx/slides/quadrant.ts
import type { QuadrantSlide } from '@/lib/types';
import {
  px, py, SLIDE_W, SLIDE_H,
  setBackground, addRect, addLine, addTextBox, addHeading, addPageNumber, type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type Slide = ReturnType<PptxGenJS['addSlide']>;

export function render(slide: Slide, data: QuadrantSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(60));

  const gridLeft = t.paddingIn + px(30);
  const gridTop = py(180);
  const gridW = SLIDE_W - gridLeft - t.paddingIn - px(30);
  const gridH = py(760);
  const midX = gridLeft + gridW / 2;
  const midY = gridTop + gridH / 2;

  // Cross lines
  addLine(slide, midX, gridTop, midX, gridTop + gridH, '#' + t.rule, 1);
  addLine(slide, gridLeft, midY, gridLeft + gridW, midY, '#' + t.rule, 1);

  // Axis labels
  const { x: xa, y: ya } = data.axes;
  addTextBox(slide, xa.low, { x: gridLeft, y: gridTop + gridH + py(10), w: gridW / 2, fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody });
  addTextBox(slide, xa.high, { x: midX, y: gridTop + gridH + py(10), w: gridW / 2, fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, align: 'right' });
  addTextBox(slide, ya.high, { x: gridLeft - px(30), y: gridTop, w: px(30), fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, align: 'right' });
  addTextBox(slide, ya.low, { x: gridLeft - px(30), y: midY, w: px(30), fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, align: 'right' });

  // Points on 5×5 grid
  data.points.forEach(pt => {
    const isHL = data.highlight === pt.id;
    const dotX = gridLeft + (pt.gridX / 4) * gridW;
    const dotY = gridTop + (1 - pt.gridY / 4) * gridH;
    const dotR = px(14);

    addRect(slide, dotX - dotR / 2, dotY - dotR / 2, dotR, dotR, '#' + (isHL ? t.accent : t.muted));
    addTextBox(slide, pt.label, {
      x: dotX + dotR / 2 + px(4), y: dotY - py(20),
      w: px(200),
      fontSize: t.captionSize,
      color: '#' + (isHL ? t.accent : t.muted),
      fontFace: t.fontBody,
      bold: isHL,
    });
  });

  addPageNumber(slide, n, total, t);
}
```

- [ ] **Step 1: Create all three files** as shown above

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit --pretty false 2>&1 | head -40`

- [ ] **Step 3: Commit**

```bash
git add lib/pptx/slides/causality.ts lib/pptx/slides/persona.ts lib/pptx/slides/quadrant.ts
git commit -m "feat(pptx): causality + persona + quadrant renderers"
```

---

## Task 13: ExportMenu integration

**Files:**
- Modify: `app/deck/page.tsx`

Find the existing export menu in `app/deck/page.tsx`. There's already a `handleExportPPTX` function and a button for `🎞 PPTX（图片版）`. Add a new handler and button for the native version.

- [ ] **Step 1: Find the existing PPTX export handler**

Run: `grep -n "handleExport\|PPTX\|setBusy\|exportPPTX\|safeFileName" app/deck/page.tsx | head -30`
Note the exact line numbers and function names.

- [ ] **Step 2: Add `handlePPTXNative` function**

In `app/deck/page.tsx`, after the existing `handleExportPPTX` function (or in the same block as other export handlers), add:

```typescript
async function handlePPTXNative() {
  setBusy('PPTX可编辑');
  try {
    const { exportPPTXNative } = await import('@/lib/pptx');
    await exportPPTXNative(deck, safeFileName(deck.title));
  } catch (e) {
    alert(`可编辑 PPTX 导出失败：${e instanceof Error ? e.message : String(e)}`);
  } finally {
    setBusy(null);
    setOpen(false);
  }
}
```

- [ ] **Step 3: Add the button in the export menu**

Find the existing `🎞 PPTX（图片版）` button and add the new button immediately after it:

```tsx
<button
  onClick={handlePPTXNative}
  disabled={busy !== null}
  className="..."
>
  {busy === 'PPTX可编辑' ? '生成中…' : '📝 PPTX（可编辑版）'}
</button>
```

Copy the exact `className` from the existing PPTX button for consistent styling.

- [ ] **Step 4: TypeScript check**

Run: `npx tsc --noEmit --pretty false 2>&1 | head -40`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add app/deck/page.tsx
git commit -m "feat(pptx): add 'PPTX（可编辑版）' export button to ExportMenu"
```

---

## Post-Implementation Verification

- [ ] Start dev server: `pnpm dev` (or `npm run dev`)
- [ ] Open http://localhost:3000, create a deck with several slide types
- [ ] Click "📝 PPTX（可编辑版）" — file should download
- [ ] Open the downloaded `.pptx` in PowerPoint or LibreOffice
- [ ] Verify: text boxes are selectable and editable, background is solid color, accent lines are present
- [ ] Test a deck with a `diagram` slide — confirm it falls back silently (screenshot embed) without crashing
- [ ] Test with at least 3 different themes — verify colors differ correctly
