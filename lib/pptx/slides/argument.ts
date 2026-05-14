import type { ArgumentSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addTextBox, addHeading, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: ArgumentSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(80));

  data.points.forEach((point, i) => {
    const y = py(220) + i * py(120);
    addRect(slide, t.paddingIn, y + py(10), px(16), px(16), '#' + t.accent);
    addTextBox(slide, point, {
      x: t.paddingIn + px(32), y, w: SLIDE_W - 2 * t.paddingIn - px(32),
      fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, wrap: true,
    });
  });

  addPageNumber(slide, n, total, t);
}
