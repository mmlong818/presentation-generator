import type { ChartBarSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addTextBox, addHeading, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: ChartBarSlide, t: PptxTheme, n: number, total: number): void {
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
    const isHL = bar.label === data.highlight;
    const barW = (bar.value / maxVal) * barAreaW;

    addTextBox(slide, bar.label, {
      x: t.paddingIn, y: y + rowH * 0.1, w: px(170),
      fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, align: 'right',
    });
    addRect(slide, barAreaLeft, y + (rowH - barH) / 2, barW, barH, '#' + (isHL ? t.accent : t.rule));
    addTextBox(slide, String(bar.value), {
      x: barAreaLeft + barW + px(8), y: y + (rowH - barH) / 2, w: px(100),
      fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, bold: isHL,
    });
  });

  if (data.source) {
    addTextBox(slide, data.source, {
      x: t.paddingIn, y: py(940), w: SLIDE_W - 2 * t.paddingIn,
      fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody,
    });
  }

  addPageNumber(slide, n, total, t);
}
