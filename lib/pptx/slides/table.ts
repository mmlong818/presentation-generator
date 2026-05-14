import type { TableSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addLine, addTextBox, addHeading, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: TableSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(60));

  const cols = data.columns.slice(0, 5);
  const rows = data.rows.slice(0, 6);
  const tableLeft = t.paddingIn;
  const tableW = SLIDE_W - 2 * t.paddingIn;
  const colW = tableW / cols.length;
  const headerH = py(70);
  const rowH = py(680) / Math.max(rows.length, 1);
  const startY = py(190);

  cols.forEach((col, ci) => {
    const x = tableLeft + ci * colW;
    addRect(slide, x, startY, colW - px(2), headerH, '#' + t.accent);
    addTextBox(slide, col.label, {
      x: x + px(12), y: startY + py(14), w: colW - px(24),
      fontSize: t.bodySize, color: 'FFFFFF', fontFace: t.fontBody, bold: true, align: col.align ?? 'left',
    });
  });

  rows.forEach((row, ri) => {
    const y = startY + headerH + ri * rowH;
    const isEven = ri % 2 === 1;
    if (isEven || row.emphasis) {
      addRect(slide, tableLeft, y, tableW, rowH, '#' + (row.emphasis ? t.accent : t.rule), { transparency: row.emphasis ? 85 : 92 });
    }
    cols.forEach((col, ci) => {
      const x = tableLeft + ci * colW;
      const isHL = data.highlightColumn === col.id;
      if (isHL) addLine(slide, x, y, x, y + rowH, '#' + t.accent, 3);
      addTextBox(slide, row.cells[col.id] ?? '', {
        x: x + px(12) + (isHL ? px(3) : 0), y: y + py(14), w: colW - px(24),
        fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, align: col.align ?? 'left',
      });
    });
  });

  if (data.source) {
    addTextBox(slide, data.source, {
      x: tableLeft, y: py(920), w: tableW,
      fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody,
    });
  }

  addPageNumber(slide, n, total, t);
}
