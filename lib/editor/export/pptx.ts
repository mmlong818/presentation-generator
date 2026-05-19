// ─── PPTX 导出 ────────────────────────────────────────────────────────────────
//
// 关键设计：编辑器内的 SlideElement[] 直接映射成 pptxgenjs 调用。
// 模型 = 导出格式，所以预览看到什么 → 导出就是什么。永远不会失同步。
//
// 坐标系映射：源 1920×1080 px → PPTX 13.333"×7.5"
// - 位置/尺寸：px / 1920 × 13.333（线性）
// - 字号：px → pt = px × (13.333 × 72) / 1920 = px × 0.5

import type {
  EditorPresentation, EditorSlide, SlideElement,
} from '../types'

const SLIDE_W = 13.333
const SLIDE_H = 7.5
const PX_PER_INCH_W = 1920 / SLIDE_W
const PX_PER_INCH_H = 1080 / SLIDE_H

function pxToInW(px: number): number { return px / PX_PER_INCH_W }
function pxToInH(px: number): number { return px / PX_PER_INCH_H }

/** Source CSS px font size → PPTX point size. */
function pxToPt(px: number): number {
  // 1920 px wide → 960pt wide (13.333" × 72pt/in). So 1 px = 0.5 pt.
  return px * 0.5
}

function hex(color: string): string {
  // pptxgenjs wants hex without '#'. Pass-through for rgba/named is unsafe,
  // so we extract the hex if present, else fall back to black.
  const m = color?.match?.(/#?([0-9a-fA-F]{6})/)
  return m ? m[1] : '000000'
}

/**
 * Build a pptxgenjs instance from the editor presentation.
 * Exposed separately from `exportPPTX` so server-side code can stream the
 * buffer instead of writing a browser file.
 */
export async function buildPptxInstance(presentation: EditorPresentation): Promise<any> {
  const PptxGenJS = (await import('pptxgenjs')).default
  const pptx = new PptxGenJS()
  pptx.defineLayout({ name: 'PG_HD', width: SLIDE_W, height: SLIDE_H })
  pptx.layout = 'PG_HD'
  pptx.title = presentation.title

  for (const slide of presentation.slides) {
    const pslide = pptx.addSlide()
    pslide.background = { color: hex(slide.background) }
    if (slide.notes) pslide.addNotes(slide.notes)

    const sorted = [...slide.elements].map((el, idx) => ({ el, idx })).sort((a, b) => {
      const za = a.el.z ?? 0
      const zb = b.el.z ?? 0
      if (za !== zb) return za - zb
      return a.idx - b.idx
    }).map(p => p.el)

    for (const el of sorted) {
      renderElement(pslide, el)
    }
  }

  return pptx
}

export async function exportPPTX(presentation: EditorPresentation): Promise<void> {
  const pptx = await buildPptxInstance(presentation)
  await pptx.writeFile({ fileName: `${presentation.title || 'presentation'}.pptx` })
}

function renderElement(pslide: any, el: SlideElement): void {
  if (el.type === 'rect') {
    pslide.addShape('rect', {
      x: pxToInW(el.x), y: pxToInH(el.y),
      w: pxToInW(el.w), h: pxToInH(el.h),
      fill: el.fill ? { color: hex(el.fill), transparency: 100 - Math.round((el.opacity ?? 1) * 100) } : { type: 'none' },
      line: el.stroke ? { color: hex(el.stroke), width: el.strokeWidth ?? 1 } : { type: 'none' },
      rectRadius: el.cornerRadius ? pxToInW(el.cornerRadius) / Math.max(pxToInW(el.w), pxToInH(el.h)) : 0,
      rotate: el.rotate ?? 0,
    })
    return
  }

  if (el.type === 'ellipse') {
    pslide.addShape('ellipse', {
      x: pxToInW(el.x), y: pxToInH(el.y),
      w: pxToInW(el.w), h: pxToInH(el.h),
      fill: el.fill ? { color: hex(el.fill), transparency: 100 - Math.round((el.opacity ?? 1) * 100) } : { type: 'none' },
      line: el.stroke ? { color: hex(el.stroke), width: el.strokeWidth ?? 1 } : { type: 'none' },
      rotate: el.rotate ?? 0,
    })
    return
  }

  if (el.type === 'line') {
    pslide.addShape('line', {
      x: pxToInW(Math.min(el.x1, el.x2)),
      y: pxToInH(Math.min(el.y1, el.y2)),
      w: pxToInW(Math.abs(el.x2 - el.x1)),
      h: pxToInH(Math.abs(el.y2 - el.y1)),
      line: { color: hex(el.stroke), width: el.strokeWidth ?? 1 },
      flipH: el.x1 > el.x2,
      flipV: el.y1 > el.y2,
    })
    return
  }

  if (el.type === 'text') {
    const fontSize = pxToPt(el.fontSize)
    const baseOpts: any = {
      x: pxToInW(el.x), y: pxToInH(el.y),
      w: pxToInW(el.w), h: pxToInH(el.h),
      fontFace: firstFont(el.fontFamily),
      fontSize,
      align: el.align ?? 'left',
      valign: 'top',
      wrap: true,
      bold: typeof el.fontWeight === 'number'
        ? el.fontWeight >= 600
        : el.fontWeight === 'bold',
      italic: el.fontStyle === 'italic',
      lineSpacingMultiple: el.lineHeight ?? 1.2,
      rotate: el.rotate ?? 0,
      charSpacing: el.letterSpacing ? Math.round(el.letterSpacing * 100) : undefined,
    }

    // Highlight: split text into runs
    if (el.highlight && el.text.includes(el.highlight) && el.highlightColor) {
      const idx = el.text.indexOf(el.highlight)
      const before = el.text.slice(0, idx)
      const after = el.text.slice(idx + el.highlight.length)
      const runs: any[] = []
      if (before) runs.push({ text: before, options: { color: hex(el.color), fontFace: baseOpts.fontFace } })
      runs.push({ text: el.highlight, options: { color: hex(el.highlightColor), fontFace: baseOpts.fontFace } })
      if (after) runs.push({ text: after, options: { color: hex(el.color), fontFace: baseOpts.fontFace } })
      pslide.addText(runs, baseOpts)
    } else {
      pslide.addText(el.text, { ...baseOpts, color: hex(el.color) })
    }
    return
  }

  // image: not yet supported in editor; would map to addImage here.
}

/** Extract first font face from a CSS font stack so PowerPoint receives a real name. */
function firstFont(stack: string): string {
  const first = stack.split(',')[0].trim().replace(/^["']|["']$/g, '')
  return first || 'Arial'
}
