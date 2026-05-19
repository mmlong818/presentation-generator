'use client'

import { Stage, Layer, Rect, Ellipse, Line as KonvaLine } from 'react-konva'
import type { EditorSlide, SlideElement, TextElement } from '@/lib/editor/types'
import { CANVAS_H, CANVAS_W } from '@/lib/editor/types'

interface Props {
  slide: EditorSlide
  width: number
  isActive: boolean
  onClick: () => void
}

/**
 * Small static rendering of one slide for the sidebar list.
 * Same hybrid approach as SlideCanvas: shapes on Konva, text in HTML.
 */
export default function SlideThumbnail({ slide, width, isActive, onClick }: Props) {
  const scale = width / CANVAS_W
  const height = CANVAS_H * scale

  const shapes = slide.elements.filter(e => e.type !== 'text') as Exclude<SlideElement, TextElement>[]
  const texts = slide.elements.filter((e): e is TextElement => e.type === 'text')

  return (
    <div
      onClick={onClick}
      style={{
        cursor: 'pointer',
        border: isActive ? '2px solid #2563eb' : '2px solid transparent',
        borderRadius: 6,
        overflow: 'hidden',
        background: '#f5f5f5',
        position: 'relative',
        width, height,
        lineHeight: 0,
      }}
    >
      <Stage width={width} height={height} scale={{ x: scale, y: scale }} listening={false}>
        <Layer>
          <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill={slide.background} />
          {shapes.map(el => <ShapeNode key={el.id} el={el} />)}
        </Layer>
      </Stage>
      <div
        style={{
          position: 'absolute', left: 0, top: 0,
          width: CANVAS_W, height: CANVAS_H,
          transformOrigin: '0 0',
          transform: `scale(${scale})`,
          pointerEvents: 'none',
        }}
      >
        {texts.map(el => <TextNode key={el.id} el={el} />)}
      </div>
    </div>
  )
}

function ShapeNode({ el }: { el: Exclude<SlideElement, TextElement> }) {
  if (el.type === 'rect') {
    return (
      <Rect
        x={el.x} y={el.y} width={el.w} height={el.h}
        fill={el.fill}
        stroke={el.stroke}
        strokeWidth={el.strokeWidth}
        cornerRadius={el.cornerRadius}
        opacity={el.opacity ?? 1}
      />
    )
  }
  if (el.type === 'ellipse') {
    return (
      <Ellipse
        x={el.x + el.w / 2} y={el.y + el.h / 2}
        radiusX={el.w / 2} radiusY={el.h / 2}
        fill={el.fill}
        stroke={el.stroke}
        strokeWidth={el.strokeWidth}
        opacity={el.opacity ?? 1}
      />
    )
  }
  if (el.type === 'line') {
    return (
      <KonvaLine
        points={[el.x1, el.y1, el.x2, el.y2]}
        stroke={el.stroke}
        strokeWidth={el.strokeWidth}
        opacity={el.opacity ?? 1}
      />
    )
  }
  return null
}

function TextNode({ el }: { el: TextElement }) {
  const fontWeight = typeof el.fontWeight === 'number'
    ? el.fontWeight
    : el.fontWeight === 'bold' ? 700
    : 400

  let inner: React.ReactNode = el.text
  if (el.highlight && el.highlightColor) {
    const idx = el.text.indexOf(el.highlight)
    if (idx >= 0) {
      inner = (
        <>
          {el.text.slice(0, idx)}
          <span style={{ color: el.highlightColor }}>{el.highlight}</span>
          {el.text.slice(idx + el.highlight.length)}
        </>
      )
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: el.x, top: el.y, width: el.w, height: el.h,
        fontFamily: el.fontFamily,
        fontSize: el.fontSize,
        fontWeight,
        fontStyle: el.fontStyle === 'italic' ? 'italic' : 'normal',
        color: el.color,
        textAlign: el.align ?? 'left',
        lineHeight: el.lineHeight ?? 1.2,
        letterSpacing: el.letterSpacing ? `${el.letterSpacing}em` : undefined,
        lineBreak: 'strict',
        wordBreak: 'normal',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        opacity: el.opacity ?? 1,
      }}
    >
      {inner}
    </div>
  )
}
