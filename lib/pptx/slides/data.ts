import type { DataSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addLine, addTextBox, addHeading, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: DataSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(80));
  addLine(slide, t.paddingIn, py(180), SLIDE_W - t.paddingIn, py(180), '#' + t.accent, 2);

  const stats = data.stats.slice(0, 4);
  const colW = (SLIDE_W - 2 * t.paddingIn) / stats.length;

  stats.forEach((s, i) => {
    const x = t.paddingIn + i * colW;
    addTextBox(slide, s.value, {
      x: x + px(20), y: py(260), w: colW - px(40),
      fontSize: Math.round(t.heroSize * 0.75), color: '#' + t.accent, fontFace: t.fontDisplay, bold: true,
    });
    addTextBox(slide, s.label, {
      x: x + px(20), y: py(480), w: colW - px(40),
      fontSize: t.bodySize, color: '#' + t.muted, fontFace: t.fontBody, wrap: true,
    });
    if (s.source) {
      addTextBox(slide, s.source, {
        x: x + px(20), y: py(580), w: colW - px(40),
        fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, italic: true, wrap: true,
      });
    }
  });

  addPageNumber(slide, n, total, t);
}
