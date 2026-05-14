import type { RoadmapSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addTextBox, addHeading, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: RoadmapSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(60));

  const periods = data.periods.slice(0, 4);
  const lanes = data.lanes.slice(0, 4);
  const labelColW = px(180);
  const gridLeft = t.paddingIn + labelColW + px(10);
  const gridW = SLIDE_W - gridLeft - t.paddingIn;
  const periodW = gridW / periods.length;
  const rowH = py(600) / lanes.length;
  const headerH = py(60);
  const startY = py(180);

  periods.forEach((period, pi) => {
    const x = gridLeft + pi * periodW;
    addRect(slide, x, startY, periodW - px(4), headerH, '#' + t.accent, { transparency: 20 });
    addTextBox(slide, period, {
      x: x + px(8), y: startY + py(10), w: periodW - px(16),
      fontSize: t.captionSize, color: 'FFFFFF', fontFace: t.fontBody, align: 'center',
    });
  });

  lanes.forEach((lane, li) => {
    const y = startY + headerH + py(10) + li * rowH;
    addTextBox(slide, lane.name, {
      x: t.paddingIn, y: y + rowH * 0.25, w: labelColW,
      fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, bold: true,
    });

    lane.items.forEach((ms) => {
      const pi = periods.indexOf(ms.period);
      if (pi === -1) return;
      const span = ms.span ?? 1;
      const cellX = gridLeft + pi * periodW + px(4);
      const cellW = span * periodW - px(8);
      const isBright = ms.emphasis === true;

      addRect(slide, cellX, y + rowH * 0.15, cellW, rowH * 0.7, '#' + (isBright ? t.accent : t.rule), { transparency: isBright ? 0 : 70 });
      addTextBox(slide, ms.label, {
        x: cellX + px(8), y: y + rowH * 0.15 + py(8), w: cellW - px(16),
        fontSize: t.captionSize, color: isBright ? 'FFFFFF' : '#' + t.text,
        fontFace: t.fontBody, bold: isBright, wrap: true,
      });
    });
  });

  addPageNumber(slide, n, total, t);
}
