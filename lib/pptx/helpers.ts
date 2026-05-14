import type PptxGenJS from 'pptxgenjs';

export const SLIDE_W = 13.333;
export const SLIDE_H = 7.5;

export function px(n: number): number { return n / 1920 * SLIDE_W; }
export function py(n: number): number { return n / 1080 * SLIDE_H; }

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

type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function setBackground(slide: PSlide, color: string): void {
  slide.background = { color: hexColor(color) };
}

export function addRect(
  slide: PSlide,
  x: number, y: number, w: number, h: number,
  color: string,
  opts?: { line?: { color: string; width: number }; transparency?: number },
): void {
  slide.addShape('rect' as Parameters<PSlide['addShape']>[0], {
    x, y, w, h,
    fill: { color: hexColor(color) },
    line: opts?.line
      ? { color: hexColor(opts.line.color), width: opts.line.width }
      : { color: hexColor(color), width: 0 },
    ...(opts?.transparency !== undefined ? { transparency: opts.transparency } : {}),
  });
}

export function addLine(
  slide: PSlide,
  x1: number, y1: number, x2: number, y2: number,
  color: string,
  width = 1,
): void {
  slide.addShape('line' as Parameters<PSlide['addShape']>[0], {
    x: x1, y: y1,
    w: x2 - x1 || 0.001,
    h: y2 - y1 || 0.001,
    line: { color: hexColor(color), width },
  });
}

export function addAccentLine(slide: PSlide, t: PptxTheme): void {
  addLine(slide, t.paddingIn, py(180), SLIDE_W - t.paddingIn, py(180), '#' + t.accent, 2);
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
}

export function addTextBox(slide: PSlide, text: string, opts: TextBoxOpts): void {
  slide.addText(text, {
    x: opts.x, y: opts.y, w: opts.w,
    ...(opts.h !== undefined ? { h: opts.h } : {}),
    fontSize: opts.fontSize,
    color: hexColor(opts.color),
    fontFace: opts.fontFace,
    bold: opts.bold ?? false,
    italic: opts.italic ?? false,
    align: opts.align ?? 'left',
    valign: opts.valign ?? 'top',
    wrap: opts.wrap ?? true,
    margin: 0,
  });
}

export function addPageNumber(slide: PSlide, n: number, total: number, t: PptxTheme): void {
  addTextBox(slide, `${n} / ${total}`, {
    x: SLIDE_W - t.paddingIn - px(120),
    y: SLIDE_H - py(70),
    w: px(120),
    fontSize: t.captionSize,
    color: '#' + t.muted,
    fontFace: t.fontBody,
    align: 'right',
  });
}

export function addEyebrow(slide: PSlide, text: string, t: PptxTheme): void {
  addTextBox(slide, text.toUpperCase(), {
    x: t.paddingIn,
    y: py(80),
    w: SLIDE_W - 2 * t.paddingIn,
    fontSize: t.captionSize,
    color: '#' + t.accent,
    fontFace: t.fontBody,
  });
}

export function addHeading(slide: PSlide, text: string, t: PptxTheme, y: number): void {
  addTextBox(slide, text, {
    x: t.paddingIn,
    y,
    w: SLIDE_W - 2 * t.paddingIn,
    fontSize: t.sectionSize,
    color: '#' + t.text,
    fontFace: t.fontDisplay,
    bold: true,
  });
}
