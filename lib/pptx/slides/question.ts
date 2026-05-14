import type { QuestionSlide } from '@/lib/types';
import {
  py, SLIDE_W,
  setBackground, addTextBox, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: QuestionSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);

  addTextBox(slide, data.question, {
    x: t.paddingIn, y: py(300), w: SLIDE_W - 2 * t.paddingIn,
    fontSize: Math.round(t.heroSize * 0.7), color: '#' + t.text,
    fontFace: t.fontDisplay, bold: true, align: 'center', wrap: true,
  });

  if (data.hints && data.hints.length > 0) {
    addTextBox(slide, data.hints.map(h => `• ${h}`).join('\n'), {
      x: t.paddingIn, y: py(620), w: SLIDE_W - 2 * t.paddingIn,
      fontSize: t.bodySize, color: '#' + t.muted, fontFace: t.fontBody, align: 'center', wrap: true,
    });
  }

  if (data.invitation) {
    addTextBox(slide, data.invitation, {
      x: t.paddingIn, y: py(850), w: SLIDE_W - 2 * t.paddingIn,
      fontSize: t.captionSize, color: '#' + t.accent, fontFace: t.fontBody, italic: true, align: 'center',
    });
  }

  addPageNumber(slide, n, total, t);
}
