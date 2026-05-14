import type { QuadrantSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addLine, addTextBox, addHeading, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: QuadrantSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(60));

  const gridLeft = t.paddingIn + px(30);
  const gridTop = py(180);
  const gridW = SLIDE_W - gridLeft - t.paddingIn - px(30);
  const gridH = py(760);
  const midX = gridLeft + gridW / 2;
  const midY = gridTop + gridH / 2;

  addLine(slide, midX, gridTop, midX, gridTop + gridH, '#' + t.rule, 1);
  addLine(slide, gridLeft, midY, gridLeft + gridW, midY, '#' + t.rule, 1);

  const { x: xa, y: ya } = data.axes;
  addTextBox(slide, xa.low, { x: gridLeft, y: gridTop + gridH + py(10), w: gridW / 2, fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody });
  addTextBox(slide, xa.high, { x: midX, y: gridTop + gridH + py(10), w: gridW / 2, fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, align: 'right' });
  addTextBox(slide, ya.high, { x: gridLeft - px(30), y: gridTop, w: px(30), fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, align: 'right' });
  addTextBox(slide, ya.low, { x: gridLeft - px(30), y: midY, w: px(30), fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, align: 'right' });

  data.points.forEach(pt => {
    const isHL = data.highlight === pt.id;
    const dotX = gridLeft + (pt.gridX / 4) * gridW;
    const dotY = gridTop + (1 - pt.gridY / 4) * gridH;
    const dotR = px(14);

    addRect(slide, dotX - dotR / 2, dotY - dotR / 2, dotR, dotR, '#' + (isHL ? t.accent : t.muted));
    addTextBox(slide, pt.label, {
      x: dotX + dotR / 2 + px(4), y: dotY - py(20), w: px(200),
      fontSize: t.captionSize, color: '#' + (isHL ? t.accent : t.muted),
      fontFace: t.fontBody, bold: isHL,
    });
  });

  addPageNumber(slide, n, total, t);
}
