'use client'

import { useEditorStore } from '@/lib/editor/store'
import type { SlideElement, TextElement } from '@/lib/editor/types'

const PRESET_COLORS = ['#0a0a0a', '#525252', '#1f6feb', '#ef4444', '#f59e0b', '#10b981', '#a855f7', '#ec4899', '#ffffff']

/**
 * Right-side panel: edits the currently selected element.
 * If nothing is selected, shows slide-level controls.
 */
export default function Inspector() {
  const presentation = useEditorStore(s => s.presentation)
  const currentSlide = useEditorStore(s => s.currentSlide)
  const selectedId = useEditorStore(s => s.selectedElementId)
  const updateElement = useEditorStore(s => s.updateElement)
  const removeElement = useEditorStore(s => s.removeElement)

  const slide = presentation?.slides[currentSlide]
  const element = slide?.elements.find(e => e.id === selectedId) ?? null

  if (!element) {
    return (
      <aside className="w-[260px] border-l border-stone-200 bg-white p-4 text-sm text-stone-500">
        <div className="font-semibold text-stone-700 mb-2">Inspector</div>
        <div>选中元素后编辑。</div>
        <div className="mt-6 text-xs text-stone-400 leading-relaxed">
          <div>· 双击文字进入编辑模式</div>
          <div>· 拖拽元素移动</div>
          <div>· 选中图形显示缩放柄</div>
          <div>· Delete 删除选中</div>
        </div>
      </aside>
    )
  }

  return (
    <aside className="w-[260px] border-l border-stone-200 bg-white p-4 text-sm overflow-y-auto">
      <div className="font-semibold text-stone-700 mb-3 flex items-center justify-between">
        <span>{labelFor(element.type)}</span>
        <button onClick={() => removeElement(element.id)}
          className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded">删除</button>
      </div>

      {/* Position & size */}
      <Section title="位置 / 尺寸">
        <div className="grid grid-cols-2 gap-2">
          <NumInput label="x" value={Math.round(element.x)} onChange={(v) => updateElement(element.id, { x: v })} />
          <NumInput label="y" value={Math.round(element.y)} onChange={(v) => updateElement(element.id, { y: v })} />
          <NumInput label="w" value={Math.round(element.w)} onChange={(v) => updateElement(element.id, { w: Math.max(20, v) })} />
          <NumInput label="h" value={Math.round(element.h)} onChange={(v) => updateElement(element.id, { h: Math.max(20, v) })} />
        </div>
        <NumInput label="旋转" value={Math.round(element.rotate ?? 0)} onChange={(v) => updateElement(element.id, { rotate: v || undefined })} />
      </Section>

      {element.type === 'text' && <TextControls element={element} onChange={(p) => updateElement(element.id, p)} />}

      {(element.type === 'rect' || element.type === 'ellipse') && (
        <Section title="填充 / 描边">
          <ColorPicker label="填充" value={(element as any).fill ?? '#000000'} onChange={(c) => updateElement(element.id, { fill: c } as Partial<SlideElement>)} />
          <ColorPicker label="描边" value={(element as any).stroke ?? '#000000'} onChange={(c) => updateElement(element.id, { stroke: c } as Partial<SlideElement>)} />
          <NumInput label="描边粗" value={(element as any).strokeWidth ?? 0} onChange={(v) => updateElement(element.id, { strokeWidth: v } as Partial<SlideElement>)} />
          {element.type === 'rect' && (
            <NumInput label="圆角" value={(element as any).cornerRadius ?? 0} onChange={(v) => updateElement(element.id, { cornerRadius: v } as Partial<SlideElement>)} />
          )}
        </Section>
      )}

      <Section title="透明度">
        <input type="range" min={0} max={100} value={Math.round((element.opacity ?? 1) * 100)}
          onChange={(e) => updateElement(element.id, { opacity: Number(e.target.value) / 100 })}
          className="w-full" />
        <div className="text-xs text-stone-500 text-right">{Math.round((element.opacity ?? 1) * 100)}%</div>
      </Section>
    </aside>
  )
}

function TextControls({ element, onChange }: { element: TextElement; onChange: (p: Partial<TextElement>) => void }) {
  return (
    <>
      <Section title="字体">
        <NumInput label="字号" value={element.fontSize} onChange={(v) => onChange({ fontSize: Math.max(8, v) })} />
        <select value={String(element.fontWeight ?? 400)}
          onChange={(e) => onChange({ fontWeight: Number(e.target.value) })}
          className="w-full text-xs px-2 py-1.5 border border-stone-300 rounded mt-2">
          {[300, 400, 500, 600, 700, 800, 900].map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        <div className="flex gap-1 mt-2">
          {(['left', 'center', 'right'] as const).map(a => (
            <button key={a} onClick={() => onChange({ align: a })}
              className={`flex-1 text-xs py-1 border rounded ${element.align === a ? 'bg-stone-900 text-white border-stone-900' : 'border-stone-300'}`}>
              {a === 'left' ? '左' : a === 'center' ? '中' : '右'}
            </button>
          ))}
        </div>
      </Section>
      <Section title="颜色">
        <ColorPicker label="颜色" value={element.color} onChange={(c) => onChange({ color: c })} />
      </Section>
      <Section title="高亮 (跨行整词不断)">
        <input value={element.highlight ?? ''} onChange={(e) => onChange({ highlight: e.target.value || undefined })}
          placeholder="子串" className="w-full text-xs px-2 py-1.5 border border-stone-300 rounded" />
        {element.highlight && (
          <ColorPicker label="高亮色" value={element.highlightColor ?? '#1f6feb'} onChange={(c) => onChange({ highlightColor: c })} />
        )}
      </Section>
    </>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-4 pb-4 border-b border-stone-100 last:border-0">
      <div className="text-xs uppercase tracking-wider text-stone-500 mb-2">{title}</div>
      {children}
    </div>
  )
}

function NumInput({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <label className="flex items-center gap-2 text-xs text-stone-600">
      <span className="w-8 shrink-0">{label}</span>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)}
        className="flex-1 min-w-0 px-2 py-1 border border-stone-300 rounded text-xs" />
    </label>
  )
}

function ColorPicker({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="mt-1">
      <div className="flex items-center gap-2">
        <span className="text-xs text-stone-600 w-12 shrink-0">{label}</span>
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)}
          className="w-8 h-7 border border-stone-300 rounded cursor-pointer" />
        <input value={value} onChange={(e) => onChange(e.target.value)}
          className="flex-1 min-w-0 px-2 py-1 border border-stone-300 rounded text-xs font-mono" />
      </div>
      <div className="flex gap-1 mt-2 flex-wrap">
        {PRESET_COLORS.map(c => (
          <button key={c} onClick={() => onChange(c)}
            style={{ background: c }}
            className="w-5 h-5 rounded border border-stone-300 hover:scale-110 transition"
            title={c} />
        ))}
      </div>
    </div>
  )
}

function labelFor(type: SlideElement['type']): string {
  return {
    text: '文本元素',
    rect: '矩形',
    ellipse: '椭圆',
    line: '直线',
    image: '图片',
  }[type]
}
