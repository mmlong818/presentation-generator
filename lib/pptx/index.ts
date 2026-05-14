import type { Deck, Slide } from '@/lib/types';
import { buildPptxTheme } from './theme-map';
import { SLIDE_W, SLIDE_H } from './helpers';
import type { PptxTheme } from './helpers';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PSlide = any;

async function renderSlide(pslide: PSlide, data: Slide, t: PptxTheme, n: number, total: number): Promise<void> {
  if (data.type === 'diagram') throw new Error('diagram — screenshot fallback');
  const mod = await import(`./slides/${data.type}`);
  await mod.render(pslide, data, t, n, total);
}

export async function exportPPTXNative(deck: Deck, filename: string): Promise<void> {
  const PptxGenJS = (await import('pptxgenjs')).default;
  const pptx = new PptxGenJS();
  pptx.defineLayout({ name: 'PG_HD', width: SLIDE_W, height: SLIDE_H });
  pptx.layout = 'PG_HD';
  pptx.title = deck.title;

  const t = buildPptxTheme(deck.theme);
  const total = deck.slides.length;

  for (let i = 0; i < total; i++) {
    const data = deck.slides[i];
    const pslide = pptx.addSlide();
    try {
      await renderSlide(pslide, data, t, i + 1, total);
    } catch {
      // fallback: blank slide with note (no DOM access available here)
      pslide.background = { color: 'F0F0F0' };
      pslide.addText(`[${data.type}]`, { x: 1, y: 3, w: 11, h: 1.5, fontSize: 24, color: '888888', align: 'center' });
    }
  }

  await pptx.writeFile({ fileName: `${filename}.pptx` });
}
