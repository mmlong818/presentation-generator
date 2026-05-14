import type { ChecklistSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addTextBox, addHeading, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: ChecklistSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(80));

  data.items.forEach((item, i) => {
    const y = py(220) + i * py(110);
    addRect(slide, t.paddingIn, y, px(28), py(38), '#' + t.bg, { line: { color: t.accent, width: 2 } });
    addTextBox(slide, item, {
      x: t.paddingIn + px(48), y, w: SLIDE_W - 2 * t.paddingIn - px(48),
      fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, wrap: true,
    });
  });

  addPageNumber(slide, n, total, t);
}
