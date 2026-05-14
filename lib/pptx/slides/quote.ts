import type { QuoteSlide } from '@/lib/types';
import {
  py, SLIDE_W,
  setBackground, addTextBox, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: QuoteSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);

  addTextBox(slide, '“', {
    x: t.paddingIn, y: py(80), w: py(160),
    fontSize: Math.round(t.heroSize * 1.5), color: '#' + t.accent, fontFace: t.fontDisplay, bold: true,
  });

  addTextBox(slide, data.quote, {
    x: t.paddingIn, y: py(200), w: SLIDE_W - 2 * t.paddingIn,
    fontSize: t.sectionSize, color: '#' + t.text, fontFace: t.fontDisplay, italic: true, align: 'center', wrap: true,
  });

  addTextBox(slide, `— ${data.source}`, {
    x: t.paddingIn, y: py(700), w: SLIDE_W - 2 * t.paddingIn,
    fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, align: 'center',
  });

  addPageNumber(slide, n, total, t);
}
