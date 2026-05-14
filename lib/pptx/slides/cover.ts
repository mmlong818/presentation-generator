import type { CoverSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addTextBox, addPageNumber, addEyebrow,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: CoverSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);

  // Vertical accent bar
  addRect(slide, t.paddingIn - px(24), py(300), px(8), py(300), '#' + t.accent);

  if (data.eyebrow) addEyebrow(slide, data.eyebrow, t);

  const titleY = py(340);
  const titleW = SLIDE_W - 2 * t.paddingIn;

  if (data.highlight) {
    const idx = data.title.indexOf(data.highlight);
    if (idx >= 0) {
      const before = data.title.slice(0, idx);
      const after = data.title.slice(idx + data.highlight.length);
      const runs: object[] = [];
      if (before) runs.push({ text: before, options: { color: t.text, fontFace: t.fontDisplay, bold: true } });
      runs.push({ text: data.highlight, options: { color: t.accent, fontFace: t.fontDisplay, bold: true } });
      if (after) runs.push({ text: after, options: { color: t.text, fontFace: t.fontDisplay, bold: true } });
      slide.addText(runs as Parameters<PSlide['addText']>[0], {
        x: t.paddingIn, y: titleY, w: titleW, fontSize: t.heroSize, bold: true, wrap: true,
      });
    } else {
      addTextBox(slide, data.title, { x: t.paddingIn, y: titleY, w: titleW, fontSize: t.heroSize, color: '#' + t.text, fontFace: t.fontDisplay, bold: true });
    }
  } else {
    addTextBox(slide, data.title, { x: t.paddingIn, y: titleY, w: titleW, fontSize: t.heroSize, color: '#' + t.text, fontFace: t.fontDisplay, bold: true });
  }

  if (data.subtitle) {
    addTextBox(slide, data.subtitle, {
      x: t.paddingIn, y: py(530), w: SLIDE_W - 2 * t.paddingIn,
      fontSize: t.bodySize, color: '#' + t.muted, fontFace: t.fontBody,
    });
  }

  addPageNumber(slide, n, total, t);
}
