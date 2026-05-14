import type { KpiBoardSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addTextBox, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

const DELTA_POS = '22B800';
const DELTA_NEG = 'D93025';

export function render(slide: PSlide, data: KpiBoardSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);

  addTextBox(slide, data.heading, {
    x: t.paddingIn, y: py(60), w: SLIDE_W - t.paddingIn - px(300),
    fontSize: t.sectionSize, color: '#' + t.text, fontFace: t.fontDisplay, bold: true,
  });
  addTextBox(slide, data.period, {
    x: SLIDE_W - t.paddingIn - px(300), y: py(70), w: px(290),
    fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, align: 'right',
  });

  const kpis = data.kpis.slice(0, 6);
  const cols = kpis.length <= 4 ? 4 : Math.min(kpis.length, 3);
  const rows = Math.ceil(kpis.length / cols);
  const cardW = (SLIDE_W - 2 * t.paddingIn - (cols - 1) * px(20)) / cols;
  const cardH = (py(700) - (rows - 1) * py(20)) / rows;
  const startY = py(180);

  kpis.forEach((kpi, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = t.paddingIn + col * (cardW + px(20));
    const y = startY + row * (cardH + py(20));

    addRect(slide, x, y, cardW, cardH, '#' + t.rule, { transparency: 90 });
    addTextBox(slide, kpi.value, {
      x: x + px(16), y: y + py(16), w: cardW - px(32),
      fontSize: Math.round(t.heroSize * 0.7), color: '#' + t.text, fontFace: t.fontDisplay, bold: true,
    });

    if (kpi.delta) {
      const dc = kpi.deltaTone === 'pos' ? DELTA_POS : kpi.deltaTone === 'neg' ? DELTA_NEG : t.muted;
      addTextBox(slide, kpi.delta, {
        x: x + px(16), y: y + py(130), w: cardW - px(32),
        fontSize: t.captionSize, color: '#' + dc, fontFace: t.fontBody,
      });
    }

    addTextBox(slide, kpi.label, {
      x: x + px(16), y: y + cardH - py(80), w: cardW - px(32),
      fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody,
    });
  });

  if (data.takeaway) {
    addRect(slide, t.paddingIn, py(900), SLIDE_W - 2 * t.paddingIn, py(60), '#' + t.accent, { transparency: 80 });
    addTextBox(slide, data.takeaway, {
      x: t.paddingIn + px(16), y: py(905), w: SLIDE_W - 2 * t.paddingIn - px(32),
      fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody,
    });
  }

  addPageNumber(slide, n, total, t);
}
