import type { CTASlide } from '@/lib/types';
import {
  py, SLIDE_W,
  setBackground, addTextBox,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: CTASlide, t: PptxTheme): void {
  setBackground(slide, '#' + t.accent);

  addTextBox(slide, data.newAction, {
    x: t.paddingIn, y: py(380), w: SLIDE_W - 2 * t.paddingIn,
    fontSize: Math.round(t.heroSize * 0.8), color: 'FFFFFF',
    fontFace: t.fontDisplay, bold: true, align: 'center', wrap: true,
  });
}
