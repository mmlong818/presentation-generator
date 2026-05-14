import type { TimelineSlide } from '@/lib/types';
import {
  px, py, SLIDE_W,
  setBackground, addRect, addLine, addTextBox, addHeading, addPageNumber,
  type PptxTheme,
} from '../helpers';
import type PptxGenJS from 'pptxgenjs';
type PSlide = ReturnType<InstanceType<typeof PptxGenJS>['addSlide']>;

export function render(slide: PSlide, data: TimelineSlide, t: PptxTheme, n: number, total: number): void {
  setBackground(slide, '#' + t.bg);
  addHeading(slide, data.heading, t, py(60));

  const events = data.events.slice(0, 6);
  const timelineY = py(500);
  const colW = (SLIDE_W - 2 * t.paddingIn) / events.length;

  addLine(slide, t.paddingIn, timelineY, SLIDE_W - t.paddingIn, timelineY, '#' + t.rule, 1);

  events.forEach((ev, i) => {
    const dotX = t.paddingIn + (i + 0.5) * colW;
    addTextBox(slide, ev.time, {
      x: dotX - colW / 2, y: py(360), w: colW,
      fontSize: t.captionSize, color: '#' + t.accent, fontFace: t.fontBody, align: 'center',
    });
    addRect(slide, dotX - px(10), timelineY - py(12), px(20), py(24), '#' + t.accent);
    addTextBox(slide, ev.title, {
      x: dotX - colW / 2, y: timelineY + py(30), w: colW,
      fontSize: t.bodySize, color: '#' + t.text, fontFace: t.fontBody, bold: true, align: 'center', wrap: true,
    });
    if (ev.desc) {
      addTextBox(slide, ev.desc, {
        x: dotX - colW / 2, y: timelineY + py(120), w: colW,
        fontSize: t.captionSize, color: '#' + t.muted, fontFace: t.fontBody, align: 'center', wrap: true,
      });
    }
  });

  addPageNumber(slide, n, total, t);
}
