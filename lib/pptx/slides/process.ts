import type { ProcessSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addLine, addTextBox, addHeading, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: ProcessSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(80));

  const steps = data.steps.slice(0, 5);
  const colW = (SLIDE_W - 2 * t.paddingIn) / steps.length;

  steps.forEach((step, i) => {
    const x = t.paddingIn + i * colW;
    if (i > 0) addLine(slide, x, py(200), x, py(900), '#' + t.rule, 1);
    addTextBox(slide, String(i + 1).padStart(2, '0'), {
      x: x + px(20), y: py(220), w: colW - px(40),
      fontSize: Math.round(t.heroSize * 0.6), color: '#' + t.accent, fontFace: t.fontDisplay, bold: true,
    });
    addTextBox(slide, step.title, {
      x: x + px(20), y: py(430), w: colW - px(40),
      fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, bold: true, wrap: true,
    });
    if (step.desc) {
      addTextBox(slide, step.desc, {
        x: x + px(20), y: py(560), w: colW - px(40),
        fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, wrap: true,
      });
    }
  });

  addPageNumber(slide, n, total, t);
}
