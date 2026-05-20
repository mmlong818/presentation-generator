'use client'

import { Stage, Layer, Rect, Ellipse, Line as KonvaLine, Image as KonvaImage } from 'react-konva'
import { useEffect, useState } from 'react'
import type { EditorSlide, ImageElement, SlideElement, TextElement } from '@/lib/editor/types'
import { CANVAS_H, CANVAS_W } from '@/lib/editor/types'

interface Props {
  slide: EditorSlide
  width: number
  isActive: boolean
  onClick: () => void
}

/**
 * Small static rendering of one slide for the sidebar list.
 *
 * Must stay in lockstep with SlideCanvas rendering — anything that changes
 * how text wraps, how highlights render, or how decoration paints belongs
 * here too. Previously this file was a stripped-down clone and drifted, so
 * thumbnails showed different layouts than the main canvas.
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
        background: slide.background,
        position: 'relative',
        width, height,
        lineHeight: 0,
      }}
    >
      {/* Theme decoration layer (must mirror SlideCanvas) */}
      {slide.decoration && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: slide.decoration,
            backgroundSize: slide.decoration.startsWith('radial-gradient(circle')
              ? `${Math.max(4, Math.round(14 * scale))}px ${Math.max(4, Math.round(14 * scale))}px`
              : undefined,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
      <Stage width={width} height={height} scale={{ x: scale, y: scale }} listening={false}>
        <Layer>
          {/* Transparent rect; bg is on wrapper div behind decoration. */}
          <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="rgba(0,0,0,0)" />
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
          zIndex: 2,
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
        rotation={el.rotate ?? 0}
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
        rotation={el.rotate ?? 0}
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
  if (el.type === 'image') {
    return <ImageNode el={el} />
  }
  return null
}

function ImageNode({ el }: { el: ImageElement }) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    const i = new window.Image()
    i.crossOrigin = 'anonymous'
    i.onload = () => setImg(i)
    i.src = el.src
  }, [el.src])
  if (!img) return null
  return (
    <KonvaImage
      image={img}
      x={el.x} y={el.y} width={el.w} height={el.h}
      opacity={el.opacity ?? 1}
      rotation={el.rotate ?? 0}
    />
  )
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
      const before = el.text.slice(0, idx)
      const hl = el.text.slice(idx, idx + el.highlight.length)
      const after = el.text.slice(idx + el.highlight.length)
      // Mirror SlideCanvas: support both 'color' and 'block' (brutalist reverse-fill).
      if (el.highlightStyle === 'block') {
        inner = (
          <>
            {before}
            <span style={{
              background: el.highlightColor,
              color: el.highlightFg ?? '#ffffff',
              whiteSpace: 'nowrap',
              padding: '0 0.12em',
              boxDecorationBreak: 'clone',
              WebkitBoxDecorationBreak: 'clone',
            }}>{hl}</span>
            {after}
          </>
        )
      } else {
        inner = (
          <>
            {before}
            <span style={{ color: el.highlightColor, whiteSpace: 'nowrap' }}>{hl}</span>
            {after}
          </>
        )
      }
    }
  }

  const isHeading = el.role === 'hero' || el.role === 'heading'

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
        // keep-all for CJK avoids splitting compound words mid-character
        wordBreak: 'keep-all',
        overflowWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        textWrap: isHeading ? 'balance' : 'pretty',
        opacity: el.opacity ?? 1,
        transform: el.rotate ? `rotate(${el.rotate}deg)` : undefined,
        transformOrigin: el.rotate ? 'center' : undefined,
      } as React.CSSProperties}
    >
      {inner}
    </div>
  )
}
