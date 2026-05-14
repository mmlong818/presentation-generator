import type { CaseStudySlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addLine, addTextBox, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: CaseStudySlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);

  addTextBox(slide, data.client, {
    x: t.paddingIn, y: py(60), w: SLIDE_W * 0.6,
    fontSize: Math.round(t.heroSize * 0.5), color: '#' + t.accent, fontFace: t.fontDisplay, bold: true,
  });
  if (data.clientMeta) {
    addTextBox(slide, data.clientMeta, {
      x: t.paddingIn, y: py(160), w: SLIDE_W * 0.6,
      fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody,
    });
  }

  addLine(slide, t.paddingIn, py(210), SLIDE_W - t.paddingIn, py(210), '#' + t.rule, 1);

  const leftW = SLIDE_W * 0.55 - t.paddingIn;
  const rightX = SLIDE_W * 0.58;
  const rightW = SLIDE_W - rightX - t.paddingIn;

  const sections = [
    { label: 'CONTEXT', text: data.context },
    { label: 'CHALLENGE', text: data.challenge },
    { label: 'APPROACH', text: data.approach },
  ];
  let leftY = py(240);
  sections.forEach(({ label, text }) => {
    addTextBox(slide, label, { x: t.paddingIn, y: leftY, w: leftW, fontSize: t.captionSize, color: '#' + t.accent, fontFace: t.fontBody });
    leftY += py(40);
    addTextBox(slide, text, { x: t.paddingIn, y: leftY, w: leftW, fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, wrap: true });
    leftY += py(160);
  });

  let rightY = py(240);
  data.results.slice(0, 3).forEach((r) => {
    addRect(slide, rightX, rightY, rightW, py(130), '#' + t.rule, { transparency: 85 });
    addTextBox(slide, r.value, {
      x: rightX + px(16), y: rightY + py(10), w: rightW - px(32),
      fontSize: Math.round(t.heroSize * 0.45), color: '#' + t.accent, fontFace: t.fontDisplay, bold: true,
    });
    addTextBox(slide, r.metric + (r.delta ? `  ${r.delta}` : ''), {
      x: rightX + px(16), y: rightY + py(80), w: rightW - px(32),
      fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody,
    });
    rightY += py(150);
  });

  if (data.quote) {
    addRect(slide, rightX, rightY, rightW, py(200), '#' + t.accent, { transparency: 90 });
    addLine(slide, rightX, rightY, rightX, rightY + py(200), '#' + t.accent, 4);
    addTextBox(slide, `"${data.quote}"`, {
      x: rightX + px(20), y: rightY + py(16), w: rightW - px(32),
      fontSize: t.captionSize, color: '#' + t.text, fontFace: t.fontBody, italic: true, wrap: true,
    });
    if (data.quoteAttribution) {
      addTextBox(slide, `— ${data.quoteAttribution}`, {
        x: rightX + px(20), y: rightY + py(130), w: rightW - px(32),
        fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody,
      });
    }
  }

  addPageNumber(slide, n, total, t);
}
