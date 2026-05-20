'use client'

import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import { Stage, Layer, Rect, Ellipse, Line as KonvaLine, Transformer, Image as KonvaImage } from 'react-konva'
import type Konva from 'konva'
import { useEditorStore } from '@/lib/editor/store'
import { CANVAS_H, CANVAS_W } from '@/lib/editor/types'
import type { EditorSlide, ImageElement, SlideElement, TextElement } from '@/lib/editor/types'

interface Props {
  /** Container width in CSS px; height auto via aspect ratio. */
  width: number
  /** Disable selection when used purely for preview. */
  readOnly?: boolean
  /** Optional override: render this slide instead of store.currentSlide. */
  slide?: EditorSlide
}

/**
 * Hybrid renderer:
 * - Konva canvas: shapes / images / background; selection & transform
 * - HTML overlay: text elements (native CJK line-break + highlight spans)
 * - Edit mode: textarea overlays on top of selected text element
 */
export default function SlideCanvas({ width, readOnly = false, slide: slideOverride }: Props) {
  const presentation = useEditorStore(s => s.presentation)
  const currentSlide = useEditorStore(s => s.currentSlide)
  const selectedId = useEditorStore(s => s.selectedElementId)
  const selectedIds = useEditorStore(s => s.selectedElementIds)
  const selectElement = useEditorStore(s => s.selectElement)
  const updateElement = useEditorStore(s => s.updateElement)
  const stageRef = useRef<Konva.Stage>(null)
  const trRef = useRef<Konva.Transformer>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  // Alignment guides shown during element drag (source-px coordinates).
  const [guides, setGuides] = useState<{ vert: number[]; horiz: number[] }>({ vert: [], horiz: [] })

  const slide = slideOverride ?? presentation?.slides[currentSlide]
  const scale = width / CANVAS_W
  const height = CANVAS_H * scale

  // Sort elements by z (default 0) so layering stays consistent across the
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

  // Attach transformer to the currently selected shape/image node
  useEffect(() => {
    if (readOnly) return
    const stage = stageRef.current
    const tr = trRef.current
    if (!stage || !tr) return
    if (!selectedId) {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
      return
    }
    const node = stage.findOne(`#${cssId(selectedId)}`)
    if (node) {
      tr.nodes([node])
      tr.getLayer()?.batchDraw()
    } else {
      tr.nodes([])
      tr.getLayer()?.batchDraw()
    }
  }, [selectedId, readOnly, sorted])

  // Clear editing if selection changes
  useEffect(() => {
    if (selectedId !== editingId) setEditingId(null)
  }, [selectedId, editingId])

  if (!slide) {
    return (
      <div style={{ width, height, background: '#f5f5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        无幻灯片
      </div>
    )
  }

  const shapes = sorted.filter((e): e is Exclude<SlideElement, TextElement> => e.type !== 'text')
  const texts = sorted.filter((e): e is TextElement => e.type === 'text')

  return (
    <div style={{
      position: 'relative', width, height, overflow: 'hidden',
      // Solid slide background on the wrapper; Konva Rect below is just for
      // visual debug / fallback. Decoration sits on top of this color.
      background: slide.background,
    }}>
      {/* Theme decoration layer (risograph grain, blueprint grid, etc.) */}
      {slide.decoration && (
        <div
          aria-hidden
          style={{
            position: 'absolute',
            inset: 0,
            background: slide.decoration,
            backgroundSize: slide.decoration.startsWith('radial-gradient(circle')
              ? `${Math.max(10, Math.round(14 * scale))}px ${Math.max(10, Math.round(14 * scale))}px`
              : undefined,
            pointerEvents: 'none',
            zIndex: 1,
          }}
        />
      )}
      {/* Background + shapes (Konva canvas) */}
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        scale={{ x: scale, y: scale }}
        onMouseDown={(e) => {
          if (readOnly) return
          if (e.target === e.target.getStage()) {
            selectElement(null)
            setEditingId(null)
          }
        }}
      >
        <Layer>
          {/* Transparent click-target rect; visible bg is on wrapper div behind decoration. */}
          <Rect x={0} y={0} width={CANVAS_W} height={CANVAS_H} fill="rgba(0,0,0,0)" listening={!readOnly} />
          {shapes.map(el => (
            <ShapeNode
              key={el.id}
              element={el}
              isSelected={selectedIds.includes(el.id)}
              readOnly={readOnly}
              onSelect={selectElement}
              onTransformEnd={(patch) => updateElement(el.id, patch)}
            />
          ))}
          {!readOnly && (
            <Transformer
              ref={trRef}
              rotateEnabled
              keepRatio={false}
              borderStroke="#2563eb"
              borderStrokeWidth={2}
              anchorStroke="#2563eb"
              anchorFill="#ffffff"
              anchorSize={10}
              boundBoxFunc={(_, newBox) => {
                if (newBox.width < 20 || newBox.height < 20) return _
                return newBox
              }}
            />
          )}
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
            allElements={slide.elements}
            isSelected={selectedIds.includes(el.id)}
            isEditing={el.id === editingId}
            readOnly={readOnly}
            onSelect={selectElement}
            onStartEdit={() => setEditingId(el.id)}
            onEndEdit={(nextText) => {
              setEditingId(null)
              if (nextText !== el.text) updateElement(el.id, { text: nextText })
            }}
            onDragEnd={(patch) => { updateElement(el.id, patch); setGuides({ vert: [], horiz: [] }) }}
            onDragGuides={setGuides}
          />
        ))}
      </div>
      {/* Alignment guide lines — only visible while dragging */}
      {(guides.vert.length > 0 || guides.horiz.length > 0) && (
        <div aria-hidden style={{
          position: 'absolute', left: 0, top: 0, width: CANVAS_W, height: CANVAS_H,
          transformOrigin: '0 0', transform: `scale(${scale})`,
          pointerEvents: 'none', zIndex: 50,
        }}>
          {guides.vert.map((x, i) => (
            <div key={`v${i}`} style={{
              position: 'absolute', left: x - 1, top: 0, width: 2, height: CANVAS_H,
              background: '#ec4899',
            }} />
          ))}
          {guides.horiz.map((y, i) => (
            <div key={`h${i}`} style={{
              position: 'absolute', left: 0, top: y - 1, width: CANVAS_W, height: 2,
              background: '#ec4899',
            }} />
          ))}
        </div>
      )}
    </div>
  )
}

// Konva ids cannot start with a number per CSS selector rules — prefix.
function cssId(id: string) {
  return `el_${id.replace(/[^a-zA-Z0-9_-]/g, '_')}`
}

// ─── Shape nodes ────────────────────────────────────────────────────────────

function ShapeNode({ element, isSelected, readOnly, onSelect, onTransformEnd }: {
  element: Exclude<SlideElement, TextElement>
  isSelected: boolean
  readOnly: boolean
  onSelect: (id: string | null, opts?: { additive?: boolean }) => void
  onTransformEnd: (patch: Partial<SlideElement>) => void
}) {
  const handleSelect = readOnly ? undefined : (e: Konva.KonvaEventObject<MouseEvent>) => {
    e.cancelBubble = true
    onSelect(element.id, { additive: e.evt.shiftKey })
  }

  const commonDragEnd = (node: Konva.Node) => {
    onTransformEnd({ x: node.x(), y: node.y() } as Partial<SlideElement>)
  }

  const commonTransformEnd = (node: Konva.Node) => {
    const scaleX = node.scaleX()
    const scaleY = node.scaleY()
    node.scaleX(1)
    node.scaleY(1)
    onTransformEnd({
      x: node.x(),
      y: node.y(),
      w: Math.max(20, node.width() * scaleX),
      h: Math.max(20, node.height() * scaleY),
      rotate: node.rotation() || undefined,
    } as Partial<SlideElement>)
  }

  if (element.type === 'rect') {
    return (
      <Rect
        id={cssId(element.id)}
        x={element.x} y={element.y}
        width={element.w} height={element.h}
        fill={element.fill}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        cornerRadius={element.cornerRadius}
        opacity={element.opacity ?? 1}
        rotation={element.rotate ?? 0}
        draggable={!readOnly && !element.locked}
        onMouseDown={handleSelect}
        onDragEnd={(e) => commonDragEnd(e.target)}
        onTransformEnd={(e) => commonTransformEnd(e.target)}
      />
    )
  }

  if (element.type === 'ellipse') {
    const cx = element.x + element.w / 2
    const cy = element.y + element.h / 2
    return (
      <Ellipse
        id={cssId(element.id)}
        x={cx} y={cy}
        radiusX={element.w / 2} radiusY={element.h / 2}
        fill={element.fill}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        opacity={element.opacity ?? 1}
        rotation={element.rotate ?? 0}
        draggable={!readOnly && !element.locked}
        onMouseDown={handleSelect}
        onDragEnd={(e) => onTransformEnd({ x: e.target.x() - element.w / 2, y: e.target.y() - element.h / 2 })}
        onTransformEnd={(e) => {
          const node = e.target
          const sx = node.scaleX(), sy = node.scaleY()
          node.scaleX(1); node.scaleY(1)
          const newW = Math.max(20, element.w * sx)
          const newH = Math.max(20, element.h * sy)
          onTransformEnd({
            x: node.x() - newW / 2,
            y: node.y() - newH / 2,
            w: newW, h: newH,
            rotate: node.rotation() || undefined,
          })
        }}
      />
    )
  }

  if (element.type === 'line') {
    return (
      <KonvaLine
        id={cssId(element.id)}
        points={[element.x1, element.y1, element.x2, element.y2]}
        stroke={element.stroke}
        strokeWidth={element.strokeWidth}
        opacity={element.opacity ?? 1}
        onMouseDown={handleSelect}
      />
    )
  }

  if (element.type === 'image') {
    return <ImageNode el={element} readOnly={readOnly} onSelect={handleSelect}
      onDragEnd={(node) => commonDragEnd(node)}
      onTransformEnd={(node) => commonTransformEnd(node)} />
  }

  return null
}

function ImageNode({ el, readOnly, onSelect, onDragEnd, onTransformEnd }: {
  el: ImageElement
  readOnly: boolean
  onSelect?: (e: Konva.KonvaEventObject<MouseEvent>) => void
  onDragEnd: (node: Konva.Node) => void
  onTransformEnd: (node: Konva.Node) => void
}) {
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
      id={cssId(el.id)}
      image={img}
      x={el.x} y={el.y}
      width={el.w} height={el.h}
      opacity={el.opacity ?? 1}
      rotation={el.rotate ?? 0}
      draggable={!readOnly && !el.locked}
      onMouseDown={onSelect}
      onDragEnd={(e) => onDragEnd(e.target)}
      onTransformEnd={(e) => onTransformEnd(e.target)}
    />
  )
}

// ─── Text overlay (HTML, browser-native typography) ─────────────────────────

function TextOverlay({ el, allElements, isSelected, isEditing, readOnly, onSelect, onStartEdit, onEndEdit, onDragEnd, onDragGuides }: {
  el: TextElement
  allElements: SlideElement[]
  isSelected: boolean
  isEditing: boolean
  readOnly: boolean
  onSelect: (id: string | null, opts?: { additive?: boolean }) => void
  onStartEdit: () => void
  onEndEdit: (nextText: string) => void
  onDragEnd: (patch: Partial<SlideElement>) => void
  onDragGuides: (g: { vert: number[]; horiz: number[] }) => void
}) {
  const fontWeight = typeof el.fontWeight === 'number'
    ? el.fontWeight
    : el.fontWeight === 'bold' ? 700
    : el.fontWeight === 'normal' ? 400
    : 400
  const italic = el.fontStyle === 'italic'

  const dragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null)
  const [dragOffset, setDragOffset] = useState<{ dx: number; dy: number }>({ dx: 0, dy: 0 })

  function onMouseDown(e: React.MouseEvent) {
    if (readOnly || isEditing) return
    e.stopPropagation()
    onSelect(el.id, { additive: e.shiftKey })
    dragRef.current = { startX: e.clientX, startY: e.clientY, origX: el.x, origY: el.y }

    // Snap target edges of OTHER elements + slide center.
    const others = allElements.filter(o => o.id !== el.id)
    const snapVert: number[] = [CANVAS_W / 2]   // slide vertical center
    const snapHoriz: number[] = [CANVAS_H / 2]  // slide horizontal center
    for (const o of others) {
      snapVert.push(o.x, o.x + o.w / 2, o.x + o.w)
      snapHoriz.push(o.y, o.y + o.h / 2, o.y + o.h)
    }
    const SNAP = 6 // px in source space

    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      const parent = document.querySelector('[aria-label="text-overlay"]') as HTMLElement | null
      const sm = parent ? getCanvasScale(parent) : 1
      let dx = (ev.clientX - dragRef.current.startX) / sm
      let dy = (ev.clientY - dragRef.current.startY) / sm

      // Compute candidate edges for the dragged element
      const cx = dragRef.current.origX + dx
      const cy = dragRef.current.origY + dy
      const ownVerts = [cx, cx + el.w / 2, cx + el.w]
      const ownHorizs = [cy, cy + el.h / 2, cy + el.h]
      const activeVert: number[] = []
      const activeHoriz: number[] = []

      // Snap X
      let bestDx = 0, bestAbsX = SNAP + 1
      for (const ov of ownVerts) for (const sv of snapVert) {
        const d = sv - ov
        if (Math.abs(d) < bestAbsX) { bestAbsX = Math.abs(d); bestDx = d }
      }
      if (bestAbsX <= SNAP) {
        dx += bestDx
        // Re-derive guides at snapped position
        const snappedOwn = [cx + bestDx, cx + bestDx + el.w / 2, cx + bestDx + el.w]
        for (const ov of snappedOwn) {
          if (snapVert.some(sv => Math.abs(sv - ov) < 0.5)) activeVert.push(ov)
        }
      }

      // Snap Y
      let bestDy = 0, bestAbsY = SNAP + 1
      for (const oh of ownHorizs) for (const sh of snapHoriz) {
        const d = sh - oh
        if (Math.abs(d) < bestAbsY) { bestAbsY = Math.abs(d); bestDy = d }
      }
      if (bestAbsY <= SNAP) {
        dy += bestDy
        const snappedOwn = [cy + bestDy, cy + bestDy + el.h / 2, cy + bestDy + el.h]
        for (const oh of snappedOwn) {
          if (snapHoriz.some(sh => Math.abs(sh - oh) < 0.5)) activeHoriz.push(oh)
        }
      }

      setDragOffset({ dx, dy })
      onDragGuides({ vert: activeVert, horiz: activeHoriz })
    }
    const onUp = (ev: MouseEvent) => {
      if (!dragRef.current) return
      const parent = document.querySelector('[aria-label="text-overlay"]') as HTMLElement | null
      const sm = parent ? getCanvasScale(parent) : 1
      // Re-compute final snapped delta the same way as onMove (cheap).
      let dx = (ev.clientX - dragRef.current.startX) / sm
      let dy = (ev.clientY - dragRef.current.startY) / sm
      const cx = dragRef.current.origX + dx
      const cy = dragRef.current.origY + dy
      const ownVerts = [cx, cx + el.w / 2, cx + el.w]
      const ownHorizs = [cy, cy + el.h / 2, cy + el.h]
      let bestDx = 0, bestAbsX = SNAP + 1
      for (const ov of ownVerts) for (const sv of snapVert) {
        const d = sv - ov
        if (Math.abs(d) < bestAbsX) { bestAbsX = Math.abs(d); bestDx = d }
      }
      if (bestAbsX <= SNAP) dx += bestDx
      let bestDy = 0, bestAbsY = SNAP + 1
      for (const oh of ownHorizs) for (const sh of snapHoriz) {
        const d = sh - oh
        if (Math.abs(d) < bestAbsY) { bestAbsY = Math.abs(d); bestDy = d }
      }
      if (bestAbsY <= SNAP) dy += bestDy

      dragRef.current = null
      setDragOffset({ dx: 0, dy: 0 })
      onDragGuides({ vert: [], horiz: [] })
      if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
        onDragEnd({ x: el.x + dx, y: el.y + dy })
      }
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // Inline edit mode: textarea overlay with same typography
  if (isEditing) {
    return (
      <textarea
        autoFocus
        defaultValue={el.text}
        onBlur={(e) => onEndEdit(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Escape') { e.preventDefault(); onEndEdit(el.text) }
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            e.preventDefault()
            onEndEdit((e.target as HTMLTextAreaElement).value)
          }
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
          background: 'rgba(255,255,255,0.9)',
          outline: '2px solid #2563eb',
          outlineOffset: 0,
          border: 'none',
          padding: 0,
          margin: 0,
          resize: 'none',
          overflow: 'hidden',
          pointerEvents: 'auto',
        }}
      />
    )
  }

  const inner = renderWithHighlight(el)

  return (
    <div
      onMouseDown={onMouseDown}
      onDoubleClick={readOnly ? undefined : (e) => { e.stopPropagation(); onStartEdit() }}
      style={{
        position: 'absolute',
        left: el.x + dragOffset.dx, top: el.y + dragOffset.dy, width: el.w, height: el.h,
        fontFamily: el.fontFamily,
        fontSize: el.fontSize,
        fontWeight,
        fontStyle: italic ? 'italic' : 'normal',
        color: el.color,
        textAlign: el.align ?? 'left',
        lineHeight: el.lineHeight ?? 1.2,
        letterSpacing: el.letterSpacing ? `${el.letterSpacing}em` : undefined,
        lineBreak: 'strict',
        wordBreak: el.nowrap ? 'keep-all' : 'normal',
        overflowWrap: el.nowrap ? 'normal' : 'break-word',
        whiteSpace: el.nowrap ? 'nowrap' : 'pre-wrap',
        // Balance line lengths for hero/heading text so the last line doesn't
        // get a single orphan character ("路" alone, etc.).
        // Chrome 114+ / Firefox 121+ / Safari 17.5+ support text-wrap.
        ...(el.nowrap ? {} : {
          textWrap: (el.role === 'hero' || el.role === 'heading' ? 'balance' : 'pretty') as 'balance' | 'pretty',
        }),
        opacity: el.opacity ?? 1,
        transform: el.rotate ? `rotate(${el.rotate}deg)` : undefined,
        transformOrigin: el.rotate ? 'center' : undefined,
        pointerEvents: readOnly ? 'none' : 'auto',
        cursor: readOnly ? 'default' : 'move',
        userSelect: 'none',
        outline: isSelected ? '2px dashed #2563eb' : undefined,
        outlineOffset: 4,
      }}
    >
      {inner}
    </div>
  )
}

function getCanvasScale(parent: HTMLElement): number {
  const t = parent.style.transform || ''
  const m = /scale\(([\d.]+)\)/.exec(t)
  return m ? parseFloat(m[1]) : 1
}

function renderWithHighlight(el: TextElement): React.ReactNode {
  if (!el.highlight || !el.highlightColor) return el.text
  const idx = el.text.indexOf(el.highlight)
  if (idx < 0) return el.text
  const before = el.text.slice(0, idx)
  const after = el.text.slice(idx + el.highlight.length)
  // Block style: inverted fill (e.g. for brutalist themes where accent==text)
  if (el.highlightStyle === 'block') {
    return (
      <>
        {before}
        <span style={{
          background: el.highlightColor,
          color: el.highlightFg ?? '#ffffff',
          whiteSpace: 'nowrap',
          padding: '0 0.12em',
          // Tight box-decoration so wrapped spans keep contiguous fill
          boxDecorationBreak: 'clone',
          WebkitBoxDecorationBreak: 'clone',
        }}>{el.highlight}</span>
        {after}
      </>
    )
  }
  return (
    <>
      {before}
      <span style={{ color: el.highlightColor, whiteSpace: 'nowrap' }}>{el.highlight}</span>
      {after}
    </>
  )
}
