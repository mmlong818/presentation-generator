// ─── 编辑器主题适配层 ────────────────────────────────────────────────────────
//
// 把 `lib/themes.ts` 的 ThemeTokens 转换成 layout 函数需要的扁平结构。
// 字号 token (hero/section/body/caption) + padding + 配色 + 字体栈一站式拿到。

import { THEMES } from '../themes'
import type { ThemeId } from '../types'

export interface ResolvedTheme {
  id: ThemeId
  bg: string
  paper: string
  text: string
  muted: string
  soft: string
  accent: string
  accent2?: string
  border: string
  fontDisplay: string
  fontBody: string
  fontMono: string
  /** Source px sizes. */
  hero: number
  section: number
  body: number
  caption: number
  /** Source px safe-area inset. */
  padding: number
}

export function resolveTheme(themeId: ThemeId): ResolvedTheme {
  const t = THEMES[themeId] ?? THEMES['modern-minimal']
  return {
    id: themeId,
    bg: t.bg,
    paper: t.paper,
    text: t.text,
    muted: t.muted,
    soft: t.soft,
    accent: t.accent,
    accent2: t.accent2,
    border: t.border,
    fontDisplay: t.fontDisplay,
    fontBody: t.fontBody,
    fontMono: t.fontMono,
    hero: t.hero,
    section: t.section,
    body: t.body,
    caption: t.caption,
    padding: t.padding,
  }
}
