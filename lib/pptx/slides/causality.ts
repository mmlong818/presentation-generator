import type { CausalitySlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addLine, addTextBox, addHeading, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: CausalitySlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(60));

  const chain = data.chain.slice(0, 5);
  const nodeW = px(260);
  const nodeH = py(180);
  const chainY = py(380);
  const totalW = SLIDE_W - 2 * t.paddingIn;
  const spacing = chain.length > 1 ? (totalW - chain.length * nodeW) / (chain.length - 1) : 0;

  chain.forEach((link, i) => {
    const x = t.paddingIn + i * (nodeW + spacing);
    addRect(slide, x, chainY, nodeW, nodeH, '#' + t.bg, { line: { color: t.accent, width: 2 } });
    addTextBox(slide, link.cause, {
      x: x + px(12), y: chainY + py(30), w: nodeW - px(24),
      fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, align: 'center', wrap: true,
    });

    if (i < chain.length - 1) {
      const arrowX = x + nodeW + spacing / 2;
      addTextBox(slide, '→', {
        x: arrowX - px(20), y: chainY + nodeH / 2 - py(20), w: px(40),
        fontSize: t.sectionSize, color: '#' + t.accent, fontFace: t.fontBody, align: 'center',
      });
      if (link.because) {
        addTextBox(slide, link.because, {
          x: x + nodeW + px(4), y: chainY + nodeH + py(10), w: spacing - px(8),
          fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, italic: true, align: 'center', wrap: true,
        });
      }
    }
  });

  if (data.conclusion) {
    addLine(slide, t.paddingIn, py(720), t.paddingIn, py(800), '#' + t.accent, 4);
    addTextBox(slide, data.conclusion, {
      x: t.paddingIn + px(20), y: py(725), w: SLIDE_W - 2 * t.paddingIn - px(20),
      fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, bold: true, wrap: true,
    });
  }

  addPageNumber(slide, n, total, t);
}
