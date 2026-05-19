// PDF export — uses the browser's print pipeline.
//
// Approach: open a new window with print-optimized HTML where each slide is
// a separate @page-bound section. The user's browser handles the PDF rendering
// (Cmd/Ctrl+P → Save as PDF). This avoids server dependencies and works fully
// in BYOK mode.

import type { EditorPresentation, SlideElement, TextElement } from '../types'
import { CANVAS_H, CANVAS_W } from '../types'

export function exportPrintHTML(presentation: EditorPresentation): string {
  const slides = presentation.slides.map((s, i) => renderSlide(s.elements, i, s.background)).join('\n')
  const titleEsc = esc(presentation.title)
  return `<!doctype html>
<html lang="zh-CN"><head>
<meta charset="utf-8"><title>${titleEsc}</title>
<style>
  @page { size: ${CANVAS_W}px ${CANVAS_H}px; margin: 0 }
  *{box-sizing:border-box;margin:0;padding:0;-webkit-print-color-adjust:exact;print-color-adjust:exact}
  html,body{margin:0;padding:0;background:#fff}
  .slide{position:relative;width:${CANVAS_W}px;height:${CANVAS_H}px;overflow:hidden;page-break-after:always;break-after:page}
  .slide:last-child{page-break-after:auto;break-after:auto}
</style></head>
<body>
${slides}
<script>
  setTimeout(function(){window.print()}, 200);
</script>
</body></html>`
}

function renderSlide(elements: SlideElement[], idx: number, bg: string): string {
  const sorted = [...elements].sort((a, b) => (a.z ?? 0) - (b.z ?? 0))
  const body = sorted.map(renderElement).join('')
  return `<section class="slide" style="background:${esc(bg)}">${body}</section>`
}

function renderElement(el: SlideElement): string {
  const base = `position:absolute;left:${el.x}px;top:${el.y}px;width:${el.w}px;height:${el.h}px;` +
    (el.rotate ? `transform:rotate(${el.rotate}deg);` : '') +
    (el.opacity !== undefined ? `opacity:${el.opacity};` : '')
  if (el.type === 'text') return renderText(el as TextElement, base)
  if (el.type === 'rect') {
    return `<div style="${base}background:${esc((el as any).fill || 'transparent')};${(el as any).stroke ? `border:${(el as any).strokeWidth || 1}px solid ${esc((el as any).stroke)};` : ''}${(el as any).cornerRadius ? `border-radius:${(el as any).cornerRadius}px;` : ''}"></div>`
  }
  if (el.type === 'ellipse') {
    return `<div style="${base}background:${esc((el as any).fill || 'transparent')};border-radius:50%;${(el as any).stroke ? `border:${(el as any).strokeWidth || 1}px solid ${esc((el as any).stroke)};` : ''}"></div>`
  }
  if (el.type === 'line') {
    const e: any = el
    const dx = e.x2 - e.x1, dy = e.y2 - e.y1
    const len = Math.sqrt(dx * dx + dy * dy)
    const ang = Math.atan2(dy, dx) * 180 / Math.PI
    return `<div style="position:absolute;left:${e.x1}px;top:${e.y1}px;width:${len}px;height:${e.strokeWidth}px;background:${esc(e.stroke)};transform-origin:0 50%;transform:rotate(${ang}deg)"></div>`
  }
  if (el.type === 'image') {
    return `<img src="${esc((el as any).src)}" alt="" style="${base}object-fit:contain"/>`
  }
  return ''
}

function renderText(el: TextElement, openStyle: string): string {
  const fw = typeof el.fontWeight === 'number' ? el.fontWeight : (el.fontWeight === 'bold' ? 700 : 400)
  const style = `${openStyle}font-family:${esc(el.fontFamily)};font-size:${el.fontSize}px;font-weight:${fw};` +
    (el.fontStyle === 'italic' ? 'font-style:italic;' : '') +
    `color:${esc(el.color)};text-align:${el.align ?? 'left'};line-height:${el.lineHeight ?? 1.2};` +
    (el.letterSpacing ? `letter-spacing:${el.letterSpacing}em;` : '') +
    'line-break:strict;word-break:normal;overflow-wrap:break-word;white-space:pre-wrap;'
  let inner = esc(el.text)
  if (el.highlight && el.highlightColor) {
    const i = el.text.indexOf(el.highlight)
    if (i >= 0) {
      const before = esc(el.text.slice(0, i))
      const hl = esc(el.highlight)
      const after = esc(el.text.slice(i + el.highlight.length))
      inner = `${before}<span style="color:${esc(el.highlightColor)};white-space:nowrap">${hl}</span>${after}`
    }
  }
  return `<div style="${style}">${inner}</div>`
}

function esc(s: string | undefined | null): string {
  if (s == null) return ''
  return String(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!))
}

/** Open print-ready HTML in a new tab and trigger print dialog. */
export function exportPDF(presentation: EditorPresentation) {
  const html = exportPrintHTML(presentation)
  const w = window.open('', '_blank')
  if (!w) {
    alert('请允许弹出新窗口以导出 PDF。')
    return
  }
  w.document.open()
  w.document.write(html)
  w.document.close()
}
