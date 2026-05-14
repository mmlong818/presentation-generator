import type { CompareSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addLine, addTextBox, addHeading, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: CompareSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(60));

  const midX = SLIDE_W / 2;
  const colW = (SLIDE_W - 2 * t.paddingIn) / 2 - px(20);
  const leftX = t.paddingIn;
  const rightX = midX + px(20);
  const contentY = py(200);
  const contentH = py(760);

  addRect(slide, leftX, contentY, colW, contentH, '#' + t.rule, { transparency: 85 });
  addRect(slide, rightX, contentY, colW, contentH, '#' + t.accent, { transparency: 90 });
  addLine(slide, midX, contentY, midX, contentY + contentH, '#' + t.rule, 2);

  addTextBox(slide, data.left.title, {
    x: leftX + px(20), y: contentY + py(20), w: colW - px(40),
    fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, bold: true,
  });
  data.left.items.forEach((item, i) => {
    addTextBox(slide, `• ${item}`, {
      x: leftX + px(20), y: contentY + py(100) + i * py(100), w: colW - px(40),
      fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, wrap: true,
    });
  });

  addTextBox(slide, data.right.title, {
    x: rightX + px(20), y: contentY + py(20), w: colW - px(40),
    fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, bold: true,
  });
  data.right.items.forEach((item, i) => {
    addTextBox(slide, `• ${item}`, {
      x: rightX + px(20), y: contentY + py(100) + i * py(100), w: colW - px(40),
      fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, wrap: true,
    });
  });

  addPageNumber(slide, n, total, t);
}
