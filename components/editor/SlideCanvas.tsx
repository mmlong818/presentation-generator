'use client'

import { Fragment, useMemo, useRef } from 'react'
import { Stage, Layer, Rect, Ellipse, Line as KonvaLine } from 'react-konva'
import type Konva from 'konva'
import { useEditorStore } from '@/lib/editor/store'
import { CANVAS_H, CANVAS_W } from '@/lib/editor/types'
import type { EditorSlide, SlideElement, TextElement } from '@/lib/editor/types'

interface Props {
  /** Container width in CSS px; height auto via aspect ratio. */
  width: number
  /** Disable selection when used purely for preview. */
  readOnly?: boolean
}

/**
 * Render a single slide.
 *
 * Hybrid approach:
 * - Konva canvas: shapes (rect / ellipse / line) and the slide background.
 * - HTML overlay: text elements rendered as absolutely-positioned <div>.
 *   This gives us native browser CJK line-breaking (避头尾) and multi-color
 *   highlight spans for free, instead of fighting Konva's single-style Text.
 *
 * Both layers share the same 1920×1080 source coordinate space and the same
 * CSS scale to fit `width`. The PPTX exporter reads the same SlideElement
 * data, so preview and export stay aligned.
 */
export default function SlideCanvas({ width, readOnly = false }: Props) {
  const presentation = useEditorStore(s => s.presentation)
  const currentSlide = useEditorStore(s => s.currentSlide)
  const selectedId = useEditorStore(s => s.selectedElementId)
  const selectElement = useEditorStore(s => s.selectElement)
  const stageRef = useRef<Konva.Stage>(null)

  const slide = presentation?.slides[currentSlide]
  const scale = width / CANVAS_W
  const height = CANVAS_H * scale

  // Sort elements by z (default 0) so layering is preserved between the
  // shape layer (Konva) and the text overlay (HTML).
  const sorted = useMemo(() => {
    if (!slide) return []
    return [...slide.elements].map((el, idx) => ({ el, idx })).sort((a, b) => {
      const za = a.el.z ?? 0
      const zb = b.el.z ?? 0
      if (za !== zb) return za - zb
      return a.idx - b.idx
    }).map(p => p.el)
  }, [slide])

  if (!slide) {
    return (
      <div style={{ width, height, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        无幻灯片
      </div>
    )
  }

  const shapes = sorted.filter(e => e.type !== 'text')
  const texts = sorted.filter((e): e is TextElement => e.type === 'text')

  return (
    <div style={{ position: 'relative', width, height, overflow: 'hidden' }}>
      {/* Background + shapes (Konva canvas) */}
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scale={{ x: scale, y: scale }}
        onMouseDown={(e) => {
          if (readOnly) return
          if (e.target === e.target.getStage()) selectElement(null)
        }}
      >
        <Layer>
          <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill={slide.background} listening={!readOnly} />
          {shapes.map(el => (
            <ShapeNode
              key={el.id}
              element={el}
              isSelected={el.id === selectedId}
              readOnly={readOnly}
              onSelect={selectElement}
            />
          ))}
        </Layer>
      </Stage>

      {/* Text overlay (HTML, scaled to match canvas) */}
      <div
        aria-label="text-overlay"
        style={{
          position: 'absolute', left: 0, top: 0,
          width: CANVAS_W, height: CANVAS_H,
          transformOrigin: '0 0',
          transform: `scale(${scale})`,
          pointerEvents: 'none',
        }}
      >
        {texts.map(el => (
          <TextOverlay
            key={el.id}
            el={el}
            isSelected={el.id === selectedId}
            readOnly={readOnly}
            onSelect={selectElement}
          />
        ))}
      </div>
    </div>
  )
}

// ─── Shape nodes ────────────────────────────────────────────────────────────

function ShapeNode({ element, isSelected, readOnly, onSelect }: {
  element: Exclude<SlideElement, TextElement>
  isSelected: boolean
  readOnly: boolean
  onSelect: (id: string | null) => void
}) {
  const handleClick = readOnly ? undefined : (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    onSelect(element.id)
  }

  if (element.type === 'rect') {
    return (
      <Fragment>
        <Rect
          x={element.x} y={element.y}
          width={element.w} height={element.h}
          fill={element.fill}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
          cornerRadius={element.cornerRadius}
          opacity={element.opacity ?? 1}
          rotation={element.rotate ?? 0}
          onMouseDown={handleClick}
        />
        {isSelected && <SelectionFrame x={element.x} y={element.y} w={element.w} h={element.h} />}
      </Fragment>
    )
  }

  if (element.type === 'ellipse') {
    const cx = element.x + element.w / 2
    const cy = element.y + element.h / 2
    return (
      <Fragment>
        <Ellipse
          x={cx} y={cy}
          radiusX={element.w / 2} radiusY={element.h / 2}
          fill={element.fill}
          stroke={element.stroke}
          strokeWidth={element.strokeWidth}
          opacity={element.opacity ?? 1}
          rotation={element.rotate ?? 0}
          onMouseDown={handleClick}
        />
        {isSelected && <SelectionFrame x={element.x} y={element.y} w={element.w} h={element.h} />}
      </Fragment>
    )
  }

  if (element.type === 'line') {
    return (
      <KonvaLine
        points={[element.x1, element.y1, element.x2, element.y2]}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        opacity={element.opacity ?? 1}
        onMouseDown={handleClick}
      />
    )
  }

  return null
}

function SelectionFrame({ x, y, w, h }: { x: number; y: number; w: number; h: number }) {
  return (
    <Rect
      x={x - 4} y={y - 4}
      width={w + 8} height={h + 8}
      stroke="#2563eb"
      strokeWidth={2}
      dash={[6, 4]}
      fill="transparent"
      listening={false}
    />
  )
}

// ─── Text overlay (HTML, browser-native typography) ─────────────────────────

function TextOverlay({ el, isSelected, readOnly, onSelect }: {
  el: TextElement
  isSelected: boolean
  readOnly: boolean
  onSelect: (id: string | null) => void
}) {
  const fontWeight = typeof el.fontWeight === 'number'
    ? el.fontWeight
    : el.fontWeight === 'bold' ? 700
    : el.fontWeight === 'normal' ? 400
    : 400
  const italic = el.fontStyle === 'italic'

  // Build the inner content: split into 3 spans if a highlight substring exists.
  const inner = renderWithHighlight(el)

  return (
    <div
      onMouseDown={readOnly ? undefined : (e) => {
        e.stopPropagation()
        onSelect(el.id)
      }}
      style={{
        position: 'absolute',
        left: el.x, top: el.y, width: el.w, height: el.h,
        fontFamily: el.fontFamily,
        fontSize: el.fontSize,
        fontWeight,
        fontStyle: italic ? 'italic' : 'normal',
        color: el.color,
        textAlign: el.align ?? 'left',
        lineHeight: el.lineHeight ?? 1.2,
        letterSpacing: el.letterSpacing ? `${el.letterSpacing}em` : undefined,
        // Native CJK line-breaking + avoid-leading-punctuation rules.
        lineBreak: 'strict',
        wordBreak: 'normal',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        opacity: el.opacity ?? 1,
        transform: el.rotate ? `rotate(${el.rotate}deg)` : undefined,
        transformOrigin: el.rotate ? 'center' : undefined,
        pointerEvents: readOnly ? 'none' : 'auto',
        cursor: readOnly ? 'default' : 'text',
        userSelect: 'none',
        outline: isSelected ? '2px dashed #2563eb' : undefined,
        outlineOffset: 4,
      }}
    >
      {inner}
    </div>
  )
}

function renderWithHighlight(el: TextElement): React.ReactNode {
  if (!el.highlight || !el.highlightColor) return el.text
  const idx = el.text.indexOf(el.highlight)
  if (idx < 0) return el.text
  const before = el.text.slice(0, idx)
  const after = el.text.slice(idx + el.highlight.length)
  return (
    <>
      {before}
      <span style={{ color: el.highlightColor, whiteSpace: 'nowrap' }}>{el.highlight}</span>
      {after}
    </>
  )
}
