// ─── 编辑器数据模型 ──────────────────────────────────────────────────────────
//
// 关键设计：模型 = 渲染 = 导出。
// 同一个 SlideElement 数组驱动：(1) Konva 画布渲染 (2) PPTX 导出。永远不会"预览
// 和导出对不上"，因为它们读的是同一个对象。
//
// 坐标系：源 1920×1080 像素。Konva 渲染时按容器宽度等比缩放；pptxgenjs
// 导出时按 13.333 × 7.5 英寸映射。位置 / 尺寸 / 字号一切都在 1920×1080 空间内。

import type { ThemeId } from '../types'

export type ElementId = string

export type ElementKind = 'text' | 'rect' | 'ellipse' | 'line' | 'image'

interface BaseElement {
  id: ElementId
  type: ElementKind
  /** Left, top in source px (1920×1080 canvas). */
  x: number
  y: number
  /** Width, height in source px. */
  w: number
  h: number
  /** Rotation in degrees, clockwise. Optional, defaults 0. */
  rotate?: number
  /** Layer order; higher draws on top. Optional, defaults stable insertion order. */
  z?: number
  /** 0..1, multiplied with element-specific alphas. */
  opacity?: number
  /** When true, locked from selection / editing. */
  locked?: boolean
}

export interface TextElement extends BaseElement {
  type: 'text'
  text: string
  /** Source px font size. */
  fontSize: number
  fontFamily: string
  fontWeight?: number | string
  fontStyle?: 'normal' | 'italic'
  color: string
  align?: 'left' | 'center' | 'right'
  /** Multiplier of font size. */
  lineHeight?: number
  letterSpacing?: number
  /** A substring within `text` to be highlighted in `highlightColor`. */
  highlight?: string
  highlightColor?: string
  /** Optional semantic role — used by export to map text into PPT outline structure. */
  role?: 'heading' | 'body' | 'caption' | 'hero'
}

export interface RectElement extends BaseElement {
  type: 'rect'
  fill?: string
  stroke?: string
  strokeWidth?: number
  cornerRadius?: number
}

export interface EllipseElement extends BaseElement {
  type: 'ellipse'
  fill?: string
  stroke?: string
  strokeWidth?: number
}

export interface LineElement extends BaseElement {
  type: 'line'
  /** Endpoints in source px, ABSOLUTE (not relative to x/y). w/h are bounding box. */
  x1: number
  y1: number
  x2: number
  y2: number
  stroke: string
  strokeWidth: number
}

export interface ImageElement extends BaseElement {
  type: 'image'
  src: string
}

export type SlideElement =
  | TextElement
  | RectElement
  | EllipseElement
  | LineElement
  | ImageElement

export interface EditorSlide {
  id: string
  /** Background as solid color hex; future: gradient/image. */
  background: string
  elements: SlideElement[]
  /** Speaker notes — preserved from deck.script for the matching slide index. */
  notes?: string
}

export interface EditorPresentation {
  id: string
  title: string
  /** Canvas dimensions in source px. Fixed at 1920×1080 for now. */
  width: number
  height: number
  theme: ThemeId
  slides: EditorSlide[]
}

/** Used by the Konva renderer to know stage dimensions. */
export const CANVAS_W = 1920
export const CANVAS_H = 1080
