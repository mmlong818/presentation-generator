'use client'

import { useEffect, useState } from 'react'
import type { Deck, Slide } from '@/lib/types'

interface LLMConfig { presetId: string; model: string; apiKey: string; baseURL?: string }

interface Props {
  open: boolean
  deck: Deck
  slideIndex: number
  onClose: () => void
  onApply: (newSlide: Slide) => void
}

const LLM_STORAGE = 'pg_llm_config'

export default function RewriteSlideModal({ open, deck, slideIndex, onClose, onApply }: Props) {
  const [direction, setDirection] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [preview, setPreview] = useState<Slide | null>(null)

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') { e.preventDefault(); onClose() } }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const cur = deck.slides[slideIndex]

  async function generate() {
    setError(null)
    setBusy(true)
    setPreview(null)
    try {
      const llmStr = typeof window !== 'undefined' ? localStorage.getItem(LLM_STORAGE) : null
      const cfg: LLMConfig | null = llmStr ? JSON.parse(llmStr) : null
      const provider = cfg?.presetId || 'claude-cli'
      const llm = provider === 'claude-cli'
        ? { provider: 'claude-cli' as const, model: 'claude-sonnet-4-6' }
        : { provider: 'openai-compat' as const, model: cfg!.model, apiKey: cfg!.apiKey, baseURL: cfg?.baseURL }
      const res = await fetch('/api/rewrite-slide', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deck, slideIndex, direction: direction.trim() || undefined, llm }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
      setPreview(data.slide)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally { setBusy(false) }
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-6" onMouseDown={onClose}>
      <div className="bg-white rounded-lg w-[640px] max-h-[85vh] overflow-hidden flex flex-col" onMouseDown={(e) => e.stopPropagation()}>
        <header className="px-5 py-3 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="text-xs uppercase tracking-wider text-stone-500">第 {slideIndex + 1} 张 · {cur.type}</div>
            <h2 className="font-semibold mt-0.5">✨ 重写本张 slide</h2>
          </div>
          <button onClick={onClose} className="text-stone-500 hover:text-stone-900 text-sm">取消</button>
        </header>

        <div className="px-5 py-4 overflow-y-auto flex-1">
          <div className="text-xs text-stone-500 mb-2">期望（可空，留空按默认 = 更尖锐 + 加数据）</div>
          <textarea
            value={direction}
            onChange={(e) => setDirection(e.target.value)}
            placeholder="例：改成 question 提问 / 加上 25% 留存率数据 / 把 3 点压缩成 1 句"
            rows={3}
            className="w-full px-3 py-2 border border-stone-300 rounded text-sm" />

          <div className="mt-4">
            <button onClick={generate} disabled={busy}
              className="px-4 py-2 rounded bg-stone-900 text-white text-sm hover:bg-stone-800 disabled:opacity-50">
              {busy ? '调用 LLM 中…' : '生成新版本'}
            </button>
          </div>

          {error && (
            <div className="mt-3 p-3 rounded border border-red-300 bg-red-50 text-sm text-red-800">{error}</div>
          )}

          {preview && (
            <div className="mt-5">
              <div className="text-xs uppercase tracking-wider text-stone-500 mb-2">预览（点应用替换当前 slide）</div>
              <pre className="bg-stone-50 border border-stone-200 rounded p-3 text-xs overflow-auto max-h-[280px] font-mono">
{JSON.stringify(preview, null, 2)}
              </pre>
              <div className="flex gap-2 mt-3">
                <button onClick={() => { onApply(preview); onClose() }}
                  className="px-4 py-2 rounded bg-stone-900 text-white text-sm">✓ 应用替换</button>
                <button onClick={() => { setPreview(null) }}
                  className="px-4 py-2 rounded border border-stone-300 text-sm hover:bg-stone-50">重新生成</button>
              </div>
            </div>
          )}
        </div>

        <footer className="px-5 py-2 border-t border-stone-100 text-xs text-stone-400">
          调用 /api/rewrite-slide。Provider 从浏览器 localStorage 读取（同 /quick 配置）。
        </footer>
      </div>
    </div>
  )
}
