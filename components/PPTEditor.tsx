'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import type { ElementStyleOverride, ElementLayoutOverride } from '@/lib/types';

interface Props {
  parentRef: React.RefObject<HTMLDivElement | null>;
  scale: number;
  styles: Record<string, ElementStyleOverride>;
  layouts: Record<string, ElementLayoutOverride>;
  onText: (path: string, value: string) => void;
  onStyle: (path: string, style: ElementStyleOverride) => void;
  onLayout: (path: string, layout: ElementLayoutOverride | null) => void;
}

interface Selection {
  path: string;
  rect: { x: number; y: number; w: number; h: number };
  text: string;
  isText: boolean;
  computed: {
    fontSize: number;
    fontFamily: string;
    fontWeight: string;
    fontStyle: string;
    color: string;
    textAlign: string;
  };
}

type DragMode =
  | { kind: 'none' }
  | { kind: 'move'; startX: number; startY: number; origRect: { x: number; y: number; w: number; h: number } }
  | { kind: 'resize'; handle: string; startX: number; startY: number; origRect: { x: number; y: number; w: number; h: number } };

const FONT_OPTIONS = [
  { label: '主题字体', value: '' },
  { label: 'Inter', value: 'Inter, sans-serif' },
  { label: 'Söhne Breit', value: '"Söhne Breit", "Inter Tight", Inter, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Playfair Display', value: '"Playfair Display", serif' },
  { label: 'DM Serif Display', value: '"DM Serif Display", serif' },
  { label: 'Space Grotesk', value: '"Space Grotesk", sans-serif' },
  { label: 'JetBrains Mono', value: '"JetBrains Mono", monospace' },
];

function rgbToHex(rgb: string): string {
  const m = rgb.match(/\d+/g);
  if (!m || m.length < 3) return '#000000';
  return '#' + m.slice(0, 3).map((n) => Number(n).toString(16).padStart(2, '0')).join('');
}

function findEfTarget(el: HTMLElement | null): HTMLElement | null {
  let cur: HTMLElement | null = el;
  while (cur && !cur.dataset.ef) cur = cur.parentElement;
  return cur?.dataset.ef ? cur : null;
}

export default function PPTEditor({ parentRef, scale, styles, layouts, onText, onStyle, onLayout }: Props) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const editingTextRef = useRef<HTMLDivElement>(null);
  const [sel, setSel] = useState<Selection | null>(null);
  const [drag, setDrag] = useState<DragMode>({ kind: 'none' });
  const [editing, setEditing] = useState(false);

  const computeSelectionFromTarget = useCallback((target: HTMLElement): Selection | null => {
    const parent = parentRef.current;
    if (!parent || !target.dataset.ef) return null;
    const path = target.dataset.ef;
    const pr = parent.getBoundingClientRect();
    const tr = target.getBoundingClientRect();
    const x = (tr.left - pr.left) / scale;
    const y = (tr.top - pr.top) / scale;
    const w = tr.width / scale;
    const h = tr.height / scale;
    const cs = window.getComputedStyle(target);
    const isText = !target.querySelector('[data-ef]') && target.textContent !== '';
    return {
      path,
      rect: { x, y, w, h },
      text: target.textContent ?? '',
      isText,
      computed: {
        fontSize: parseFloat(cs.fontSize) || 24,
        fontFamily: cs.fontFamily,
        fontWeight: cs.fontWeight,
        fontStyle: cs.fontStyle,
        color: rgbToHex(cs.color),
        textAlign: cs.textAlign || 'left',
      },
    };
  }, [parentRef, scale]);

  // Click on slide to select element
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (editing) return;
    const overlay = overlayRef.current;
    if (!overlay) return;
    overlay.style.pointerEvents = 'none';
    const el = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
    overlay.style.pointerEvents = 'auto';
    if (!el) { setSel(null); return; }
    const target = findEfTarget(el);
    if (!target) { setSel(null); return; }
    const next = computeSelectionFromTarget(target);
    setSel(next);
  };

  // Double-click to enter text edit mode
  const handleDoubleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    handleClick(e);
    setEditing(true);
  };

  // Esc to deselect / exit edit
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        if (editing) { commitText(); setEditing(false); }
        else setSel(null);
      }
      if (!sel || editing) return;
      // Ctrl+B / Ctrl+I：加粗 / 斜体
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        const cur = styles[sel.path] ?? {};
        if (e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          const isBold = (cur.fontWeight ?? sel.computed.fontWeight) === '700' || sel.computed.fontWeight === 'bold' || Number(sel.computed.fontWeight) >= 600;
          onStyle(sel.path, { ...cur, fontWeight: isBold ? '400' : '700' });
          return;
        }
        if (e.key === 'i' || e.key === 'I') {
          e.preventDefault();
          const isItalic = (cur.fontStyle ?? sel.computed.fontStyle) === 'italic';
          onStyle(sel.path, { ...cur, fontStyle: isItalic ? 'normal' : 'italic' });
          return;
        }
      }
      // arrow keys nudge layout
      const step = e.shiftKey ? 20 : 4;
      const cur = layouts[sel.path] ?? {};
      const base = cur.x != null ? cur : { x: sel.rect.x, y: sel.rect.y, w: sel.rect.w, h: sel.rect.h };
      let next: ElementLayoutOverride | null = null;
      if (e.key === 'ArrowLeft') next = { ...base, x: (base.x ?? 0) - step };
      else if (e.key === 'ArrowRight') next = { ...base, x: (base.x ?? 0) + step };
      else if (e.key === 'ArrowUp') next = { ...base, y: (base.y ?? 0) - step };
      else if (e.key === 'ArrowDown') next = { ...base, y: (base.y ?? 0) + step };
      if (next) {
        e.preventDefault();
        onLayout(sel.path, next);
        setSel((s) => s ? { ...s, rect: { x: next!.x ?? s.rect.x, y: next!.y ?? s.rect.y, w: next!.w ?? s.rect.w, h: next!.h ?? s.rect.h } } : s);
      }
      // R to reset layout override
      if (e.key === 'r' || e.key === 'R') {
        e.preventDefault();
        onLayout(sel.path, null);
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  // Refresh selection rect when scale or layouts change
  useEffect(() => {
    if (!sel || drag.kind !== 'none') return;
    const target = parentRef.current?.querySelector<HTMLElement>(`[data-ef="${sel.path}"]`);
    if (!target) return;
    const next = computeSelectionFromTarget(target);
    if (next) setSel(next);
  }, [scale, layouts, styles, computeSelectionFromTarget, parentRef, sel?.path]);

  function commitText() {
    if (!sel) return;
    const el = editingTextRef.current;
    if (!el) return;
    const text = el.innerText;
    if (text !== sel.text) onText(sel.path, text);
  }

  function patchStyle(patch: Partial<ElementStyleOverride>) {
    if (!sel) return;
    const cur = styles[sel.path] ?? {};
    const next: ElementStyleOverride = { ...cur, ...patch };
    onStyle(sel.path, next);
    setSel({ ...sel, computed: { ...sel.computed, ...(
      'fontSize' in patch ? { fontSize: patch.fontSize ?? sel.computed.fontSize } : {}
    ), ...(
      'color' in patch && patch.color ? { color: patch.color } : {}
    ), ...(
      'fontWeight' in patch && patch.fontWeight ? { fontWeight: patch.fontWeight } : {}
    ), ...(
      'fontStyle' in patch && patch.fontStyle ? { fontStyle: patch.fontStyle } : {}
    ) } });
  }

  // ─── Drag move ──────────────────────────────────────────────────────
  function startMove(e: React.MouseEvent) {
    if (!sel) return;
    e.preventDefault();
    e.stopPropagation();
    setDrag({
      kind: 'move',
      startX: e.clientX, startY: e.clientY,
      origRect: { ...sel.rect },
    });
  }
  function startResize(handle: string, e: React.MouseEvent) {
    if (!sel) return;
    e.preventDefault();
    e.stopPropagation();
    setDrag({
      kind: 'resize',
      handle,
      startX: e.clientX, startY: e.clientY,
      origRect: { ...sel.rect },
    });
  }

  useEffect(() => {
    if (drag.kind === 'none') return;
    function onMove(e: MouseEvent) {
      if (!sel || drag.kind === 'none') return;
      const dx = (e.clientX - drag.startX) / scale;
      const dy = (e.clientY - drag.startY) / scale;
      let next = { ...drag.origRect };
      if (drag.kind === 'move') {
        next.x = drag.origRect.x + dx;
        next.y = drag.origRect.y + dy;
      } else if (drag.kind === 'resize') {
        const h = drag.handle;
        if (h.includes('e')) next.w = Math.max(40, drag.origRect.w + dx);
        if (h.includes('s')) next.h = Math.max(20, drag.origRect.h + dy);
        if (h.includes('w')) {
          next.w = Math.max(40, drag.origRect.w - dx);
          next.x = drag.origRect.x + (drag.origRect.w - next.w);
        }
        if (h.includes('n')) {
          next.h = Math.max(20, drag.origRect.h - dy);
          next.y = drag.origRect.y + (drag.origRect.h - next.h);
        }
      }
      setSel((s) => s ? { ...s, rect: next } : s);
      onLayout(sel.path, { x: Math.round(next.x), y: Math.round(next.y), w: Math.round(next.w), h: Math.round(next.h) });
    }
    function onUp() { setDrag({ kind: 'none' }); }
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [drag, sel, scale, onLayout]);

  // ─── Render ─────────────────────────────────────────────────────────
  const sx = scale;

  return (
    <div
      ref={overlayRef}
      style={{ position: 'absolute', inset: 0, zIndex: 30, cursor: editing ? 'text' : 'default' }}
      onMouseDown={(e) => {
        if (editing) return;
        // click on empty area deselects
        if (e.target === overlayRef.current) setSel(null);
      }}
      onClick={editing ? undefined : handleClick}
      onDoubleClick={handleDoubleClick}
    >
      {/* Hint when nothing selected - 用 fixed 定位避免被 scale 缩成微型 */}
      {!sel && (
        <div style={{
          position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.75)', color: '#fff',
          fontSize: 13, padding: '8px 16px', borderRadius: 8,
          pointerEvents: 'none', letterSpacing: '0.04em', fontFamily: 'system-ui, -apple-system, sans-serif',
          zIndex: 50,
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        }}>
          点击选中 · 双击编辑文字 · 拖动移动 · 拖角缩放 · 方向键微调 (Shift 大步) · Ctrl+B/I 加粗斜体 · R 重置位置 · Esc 退选
        </div>
      )}

      {/* Selection ring + handles */}
      {sel && !editing && (
        <SelectionFrame
          rect={sel.rect}
          scale={sx}
          onMoveStart={startMove}
          onResizeStart={startResize}
        />
      )}

      {/* Inline text editor */}
      {sel && editing && (
        <InlineTextEditor
          rect={sel.rect}
          scale={sx}
          initial={sel.text}
          computed={sel.computed}
          inputRef={editingTextRef}
          onCommit={() => { commitText(); setEditing(false); }}
        />
      )}

      {/* Top toolbar (fixed, positioned above stage) */}
      {sel && !editing && (
        <FormatToolbar
          computed={sel.computed}
          patchStyle={patchStyle}
          onDelete={() => { onLayout(sel.path, null); onStyle(sel.path, {}); setSel(null); }}
          onEditText={() => setEditing(true)}
        />
      )}
    </div>
  );
}

function SelectionFrame({ rect, scale, onMoveStart, onResizeStart }: {
  rect: { x: number; y: number; w: number; h: number };
  scale: number;
  onMoveStart: (e: React.MouseEvent) => void;
  onResizeStart: (handle: string, e: React.MouseEvent) => void;
}) {
  const handleSize = 12 / scale;
  const offset = handleSize / 2;
  const handles: { id: string; x: number; y: number; cursor: string }[] = [
    { id: 'nw', x: -offset, y: -offset, cursor: 'nwse-resize' },
    { id: 'n',  x: rect.w / 2 - offset, y: -offset, cursor: 'ns-resize' },
    { id: 'ne', x: rect.w - offset, y: -offset, cursor: 'nesw-resize' },
    { id: 'e',  x: rect.w - offset, y: rect.h / 2 - offset, cursor: 'ew-resize' },
    { id: 'se', x: rect.w - offset, y: rect.h - offset, cursor: 'nwse-resize' },
    { id: 's',  x: rect.w / 2 - offset, y: rect.h - offset, cursor: 'ns-resize' },
    { id: 'sw', x: -offset, y: rect.h - offset, cursor: 'nesw-resize' },
    { id: 'w',  x: -offset, y: rect.h / 2 - offset, cursor: 'ew-resize' },
  ];
  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x, top: rect.y, width: rect.w, height: rect.h,
        border: `${2 / scale}px solid #3b82f6`,
        outline: `${1 / scale}px solid rgba(59,130,246,0.3)`,
        cursor: 'move',
      }}
      onMouseDown={onMoveStart}
    >
      {handles.map((h) => (
        <div
          key={h.id}
          onMouseDown={(e) => onResizeStart(h.id, e)}
          style={{
            position: 'absolute',
            left: h.x, top: h.y, width: handleSize, height: handleSize,
            background: '#fff',
            border: `${2 / scale}px solid #3b82f6`,
            cursor: h.cursor,
            borderRadius: 2 / scale,
          }}
        />
      ))}
    </div>
  );
}

function InlineTextEditor({ rect, scale, initial, computed, inputRef, onCommit }: {
  rect: { x: number; y: number; w: number; h: number };
  scale: number;
  initial: string;
  computed: { fontSize: number; fontFamily: string; fontWeight: string; fontStyle: string; color: string; textAlign: string };
  inputRef: React.RefObject<HTMLDivElement | null>;
  onCommit: () => void;
}) {
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    el.focus();
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(range);
  }, [inputRef]);
  return (
    <div
      ref={inputRef}
      contentEditable
      suppressContentEditableWarning
      onBlur={onCommit}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); onCommit(); }
      }}
      style={{
        position: 'absolute',
        left: rect.x - 8, top: rect.y - 8,
        minWidth: rect.w + 16, minHeight: rect.h + 16,
        padding: 8, outline: '2px solid #3b82f6',
        background: 'rgba(255,255,255,0.92)',
        fontSize: computed.fontSize,
        fontFamily: computed.fontFamily,
        fontWeight: computed.fontWeight,
        fontStyle: computed.fontStyle,
        color: computed.color,
        textAlign: computed.textAlign as 'left' | 'center' | 'right',
        lineHeight: 1.2,
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
    >
      {initial}
    </div>
  );
}

function FormatToolbar({ computed, patchStyle, onDelete, onEditText }: {
  computed: { fontSize: number; fontFamily: string; fontWeight: string; fontStyle: string; color: string; textAlign: string };
  patchStyle: (p: Partial<ElementStyleOverride>) => void;
  onDelete: () => void;
  onEditText: () => void;
}) {
  const isBold = computed.fontWeight === '700' || computed.fontWeight === 'bold' || Number(computed.fontWeight) >= 600;
  const isItalic = computed.fontStyle === 'italic';
  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => e.stopPropagation()}
      style={{
        position: 'fixed', top: 80, left: '50%', transform: 'translateX(-50%)',
        zIndex: 100,
        background: 'rgba(20,20,20,0.95)', color: '#fff',
        padding: '8px 12px', borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 13, fontFamily: 'system-ui, -apple-system, sans-serif',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        whiteSpace: 'nowrap',
      }}>
      <span style={{ opacity: 0.6, fontSize: 11 }}>字号</span>
      <input
        type="number"
        value={Math.round(computed.fontSize)}
        onChange={(e) => patchStyle({ fontSize: Number(e.target.value) })}
        style={{ width: 60, padding: '4px 8px', borderRadius: 4, border: 'none', background: '#333', color: '#fff' }}
        min={8} max={400}
      />
      <select
        value={computed.fontFamily}
        onChange={(e) => patchStyle({ fontFamily: e.target.value || undefined })}
        style={{ padding: '4px 8px', borderRadius: 4, border: 'none', background: '#333', color: '#fff' }}
      >
        {FONT_OPTIONS.map((f) => (
          <option key={f.label} value={f.value}>{f.label}</option>
        ))}
      </select>
      <button
        onClick={() => patchStyle({ fontWeight: isBold ? '400' : '700' })}
        style={btnStyle(isBold)}
        title="加粗 (Ctrl+B)"
      ><b>B</b></button>
      <button
        onClick={() => patchStyle({ fontStyle: isItalic ? 'normal' : 'italic' })}
        style={btnStyle(isItalic)}
        title="斜体 (Ctrl+I)"
      ><i>I</i></button>
      <span style={{ opacity: 0.6, fontSize: 11, marginLeft: 4 }}>对齐</span>
      {(['left', 'center', 'right'] as const).map((a) => (
        <button key={a} onClick={() => patchStyle({ textAlign: a })} style={btnStyle(computed.textAlign === a)} title={`对齐: ${a}`}>
          {a === 'left' ? '⬛—' : a === 'center' ? '—⬛—' : '—⬛'}
        </button>
      ))}
      <span style={{ opacity: 0.6, fontSize: 11, marginLeft: 4 }}>颜色</span>
      <input
        type="color"
        value={computed.color.startsWith('#') ? computed.color : '#000000'}
        onChange={(e) => patchStyle({ color: e.target.value })}
        style={{ width: 32, height: 28, border: 'none', borderRadius: 4, background: 'transparent' }}
      />
      <div style={{ width: 1, height: 20, background: 'rgba(255,255,255,0.2)', margin: '0 4px' }} />
      <button onClick={onEditText} style={btnStyle(false)} title="编辑文字 (双击)">编辑</button>
      <button onClick={onDelete} style={{ ...btnStyle(false), color: '#fca5a5' }} title="重置覆盖">重置</button>
    </div>
  );
}

function btnStyle(active: boolean): React.CSSProperties {
  return {
    padding: '4px 10px', borderRadius: 4, border: 'none',
    background: active ? '#3b82f6' : '#333',
    color: '#fff', cursor: 'pointer', minWidth: 28,
    fontSize: 13,
  };
}
