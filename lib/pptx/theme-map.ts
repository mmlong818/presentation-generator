import { THEMES } from '@/lib/themes';
import type { ThemeId } from '@/lib/types';
import type { PptxTheme } from './helpers';

function firstFont(stack: string): string {
  return stack.replace(/['"]/g, '').split(',')[0].trim();
}

function pxToPt(px: number): number { return Math.round(px * 0.75); }

function pxToIn(pxVal: number): number { return pxVal / 1920 * 13.333; }

function solidColor(css: string): string {
  const m = css.match(/#([0-9a-fA-F]{6})/);
  return m ? m[1] : css.replace(/^#/, '');
}

export function buildPptxTheme(themeId: ThemeId): PptxTheme {
  const t = THEMES[themeId];
  return {
    bg: solidColor(t.bg),
    text: t.text.replace(/^#/, ''),
    accent: t.accent.replace(/^#/, ''),
    muted: t.muted.replace(/^#/, ''),
    rule: t.rule.replace(/^#/, ''),
    soft: t.soft.replace(/^#/, ''),
    fontDisplay: firstFont(t.fontDisplay),
    fontBody: firstFont(t.fontBody),
    fontMono: firstFont(t.fontMono),
    heroSize: pxToPt(t.hero),
    sectionSize: pxToPt(t.section),
    bodySize: pxToPt(t.body),
    captionSize: pxToPt(t.caption),
    paddingIn: pxToIn(t.padding),
  };
}
