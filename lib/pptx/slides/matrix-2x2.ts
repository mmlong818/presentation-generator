import type { Matrix2x2Slide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addLine, addTextBox, addHeading, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: Matrix2x2Slide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(60));

  const gridLeft = t.paddingIn + px(30);
  const gridTop = py(200);
  const gridW = SLIDE_W - gridLeft - t.paddingIn;
  const gridH = py(780);
  const midX = gridLeft + gridW / 2;
  const midY = gridTop + gridH / 2;

  addLine(slide, midX, gridTop, midX, gridTop + gridH, '#' + t.rule, 1);
  addLine(slide, gridLeft, midY, gridLeft + gridW, midY, '#' + t.rule, 1);

  const { x: xa, y: ya } = data.axes;
  addTextBox(slide, xa.low, { x: gridLeft, y: gridTop + gridH + py(10), w: gridW / 2, fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody });
  addTextBox(slide, xa.high, { x: midX, y: gridTop + gridH + py(10), w: gridW / 2, fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, align: 'right' });
  addTextBox(slide, ya.high, { x: gridLeft - px(80), y: gridTop, w: px(80), fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, align: 'right' });
  addTextBox(slide, ya.low, { x: gridLeft - px(80), y: midY, w: px(80), fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, align: 'right' });

  const positions = [
    { x: gridLeft, y: gridTop },
    { x: midX, y: gridTop },
    { x: gridLeft, y: midY },
    { x: midX, y: midY },
  ] as const;
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
