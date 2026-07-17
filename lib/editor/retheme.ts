import type { EditorSlide, SlideElement } from './types'
import type { ResolvedTheme } from './theme'
import { composeSlide } from './compose/layouts'

/** Apply a new theme to one slide without changing its structured content or notes. */
export function rethemeSlide(
  slide: EditorSlide,
  index: number,
  total: number,
  from: ResolvedTheme,
  to: ResolvedTheme,
): EditorSlide {
  const elements = slide.source
    ? [
        ...composeSlide(slide.source, to, index + 1, total),
        ...slide.elements.filter(isManualElement).map(element => rethemeElement(element, from, to)),
      ]
    : slide.elements.map(element => rethemeElement(element, from, to))

  return {
    ...slide,
    background: to.bg,
    decoration: to.decoration,
    elements,
  }
}

function isManualElement(element: SlideElement): boolean {
  if (element.origin) return element.origin === 'manual'
  if (element.type === 'image') return !element.id.startsWith('chart-')
  return !/^(?:t|r|e|ln)_\d+$/.test(element.id)
}

function rethemeElement(element: SlideElement, from: ResolvedTheme, to: ResolvedTheme): SlideElement {
  const color = (value: string | undefined): string | undefined => {
    if (!value) return value
    if (value === from.text) return to.text
    if (value === from.muted) return to.muted
    if (value === from.soft) return to.soft
    if (value === from.accent) return to.accent
    if (value === from.paper) return to.paper
    if (value === from.border) return to.border
    if (from.accent2 && value === from.accent2) return to.accent2 ?? to.accent
    return value
  }

  if (element.type === 'text') {
    const isHeading = element.role === 'hero' || element.role === 'heading'
    const fontFamily = element.fontFamily === from.fontMono ? to.fontMono
      : isHeading && element.fontFamily === from.fontDisplay ? to.fontDisplay
      : element.fontFamily === from.fontBody ? to.fontBody
      : element.fontFamily === from.fontDisplay ? to.fontDisplay
      : element.fontFamily
    return {
      ...element,
      color: color(element.color) ?? element.color,
      highlightColor: color(element.highlightColor),
      fontFamily,
    }
  }
  if (element.type === 'image') {
    const role = element.themeColorRole ?? (element.src.includes('currentColor') ? 'text' : undefined)
    if (!role) return element
    const fromColor = role === 'accent' ? from.accent : from.text
    const toColor = role === 'accent' ? to.accent : to.text
    const src = element.src
      .replaceAll('currentColor', encodeURIComponent(toColor))
      .replaceAll(encodeURIComponent(fromColor), encodeURIComponent(toColor))
      .replaceAll(fromColor, toColor)
    return { ...element, src, themeColorRole: role }
  }
  if (element.type === 'line') {
    return { ...element, stroke: color(element.stroke) ?? element.stroke }
  }
  if (element.type === 'rect' || element.type === 'ellipse') {
    return { ...element, fill: color(element.fill), stroke: color(element.stroke) }
  }
  return element
}
