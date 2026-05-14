import type { StatementSlide } from '@/lib/types';
import {
  py, SLIDE_W,
  setBackground, addLine, addTextBox,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: StatementSlide, t: PptxTheme): void {
  setBackground(slide, '#' + t.bg);

  const titleSize = Math.round(t.heroSize * 0.85);
  const align = data.align ?? 'center';

  if (data.highlight && data.highlight.length > 0) {
    const highlighted = new Set(data.highlight);
    const words = data.title.split(' ');
    const runs: object[] = [];
    words.forEach((w, i) => {
      runs.push({ text: (i > 0 ? ' ' : '') + w, options: { color: highlighted.has(w) ? t.accent : t.text, fontFace: t.fontDisplay, bold: true } });
    });
    slide.addText(runs as Parameters<PSlide['addText']>[0], {
      x: t.paddingIn, y: py(340), w: SLIDE_W - 2 * t.paddingIn,
      fontSize: titleSize, bold: true, align, wrap: true,
    });
  } else {
    addTextBox(slide, data.title, {
      x: t.paddingIn, y: py(340), w: SLIDE_W - 2 * t.paddingIn,
      fontSize: titleSize, color: '#' + t.text, fontFace: t.fontDisplay, bold: true, align,
    });
  }

  addLine(slide, t.paddingIn, py(520), SLIDE_W - t.paddingIn, py(520), '#' + t.accent, 2);
}
