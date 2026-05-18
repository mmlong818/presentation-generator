'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

type Status = 'idle' | 'loading-deck' | 'converting' | 'awaiting-iframe' | 'ready' | 'error'

interface PptistPresentation {
  title: string
  width: number
  height: number
  theme: unknown
  slides: unknown[]
}

const STATUS_TEXT: Record<Status, string> = {
  idle: '初始化…',
  'loading-deck': '读取演示稿…',
  converting: '转换为编辑器格式…',
  'awaiting-iframe': '等待编辑器启动…',
  ready: '已就绪 — 直接在下方编辑',
  error: '出错',
}

const PG_DECK_KEY = 'pg_last_deck'
const PPTIST_SNAPSHOT_KEY = 'pg_pptist_snapshot'
const ONBOARDING_SEEN_KEY = 'pg_edit_onboarded_v1'

export default function EditPage() {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const [usingFixture, setUsingFixture] = useState(false)
  const [usingSnapshot, setUsingSnapshot] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)

  const presentationRef = useRef<PptistPresentation | null>(null)
  const iframeReadyRef = useRef(false)
  const sentRef = useRef(false)

  function trySend() {
    if (sentRef.current) return
    if (!iframeReadyRef.current || !presentationRef.current) return
    iframeRef.current?.contentWindow?.postMessage(
      { type: 'load', presentation: presentationRef.current },
      '*',
    )
    sentRef.current = true
    setStatus('ready')
  }

  function triggerSave() {
    const iframe = iframeRef.current?.contentWindow as (Window & { __pptistSave?: () => void }) | null
    iframe?.__pptistSave?.()
  }

  function downloadBackup() {
    const snap = localStorage.getItem(PPTIST_SNAPSHOT_KEY)
    if (!snap) {
      alert('还没有保存过快照，先点"保存"再下载。')
      return
    }
    const blob = new Blob([snap], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `pptist-snapshot-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  useEffect(() => {
    function onMessage(event: MessageEvent) {
      const data = event.data
      if (!data || typeof data !== 'object') return
      if (data.type === 'ready') {
        iframeReadyRef.current = true
        trySend()
      }
      else if (data.type === 'save' && data.presentation) {
        try {
          localStorage.setItem(PPTIST_SNAPSHOT_KEY, JSON.stringify(data.presentation))
          setSavedAt(new Date().toLocaleTimeString())
        }
        catch (err) {
          setError(`保存失败: ${(err as Error).message}`)
        }
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  useEffect(() => {
    // Show onboarding once per browser. Defer to after iframe ready for less anxiety.
    if (status === 'ready' && !localStorage.getItem(ONBOARDING_SEEN_KEY)) {
      setShowOnboarding(true)
    }
  }, [status])

  function dismissOnboarding() {
    localStorage.setItem(ONBOARDING_SEEN_KEY, '1')
    setShowOnboarding(false)
  }

  async function loadPresentation(opts: { forceFromDeck?: boolean } = {}) {
    setError(null)
    setStatus('loading-deck')
    sentRef.current = false
    iframeReadyRef.current = false
    presentationRef.current = null

    try {
      if (!opts.forceFromDeck) {
        const snap = localStorage.getItem(PPTIST_SNAPSHOT_KEY)
        if (snap) {
          presentationRef.current = JSON.parse(snap) as PptistPresentation
          setUsingSnapshot(true)
          setUsingFixture(false)
          setStatus('awaiting-iframe')
          if (iframeRef.current) iframeRef.current.src = '/pptist/index.html'
          return
        }
      }

      setUsingSnapshot(false)
      const stored = localStorage.getItem(PG_DECK_KEY)
        ?? sessionStorage.getItem(PG_DECK_KEY)
      let deck: any
      if (stored) {
        deck = JSON.parse(stored)
        setUsingFixture(false)
      }
      else {
        const res = await fetch('/api/fixture-deck')
        if (!res.ok) throw new Error(`fixture ${res.status}`)
        deck = await res.json()
        setUsingFixture(true)
      }
      const params = new URLSearchParams(window.location.search)
      const themeOverride = params.get('theme')
      if (themeOverride && deck && typeof deck === 'object') {
        deck.theme = themeOverride
      }
      setStatus('converting')
      const res = await fetch('/api/to-pptist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deck),
      })
      const body = await res.json()
      if (!res.ok) throw new Error(body.error || `convert ${res.status}`)
      presentationRef.current = body.presentation as PptistPresentation
      setStatus('awaiting-iframe')
      if (iframeRef.current) iframeRef.current.src = '/pptist/index.html'
    }
    catch (err) {
      setError((err as Error).message)
      setStatus('error')
    }
  }

  function regenerateFromDeck() {
    if (!confirm('放弃当前编辑器中的所有修改，从原始 deck 重新生成？')) return
    localStorage.removeItem(PPTIST_SNAPSHOT_KEY)
    setSavedAt(null)
    setRegenerating(true)
    void loadPresentation({ forceFromDeck: true }).finally(() => setRegenerating(false))
  }

  useEffect(() => {
    void loadPresentation()
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', background: '#fafafa' }}>
      <header
        role="banner"
        style={{
          padding: '10px 20px',
          borderBottom: '1px solid #e5e7eb',
          display: 'flex',
          alignItems: 'center',
          gap: 16,
          background: '#fff',
          fontSize: 13,
        }}
      >
        <Link href="/" style={{ color: '#555', textDecoration: 'none', fontWeight: 500 }} aria-label="返回主页">← 返回</Link>
        <span style={{ color: '#9ca3af' }} aria-hidden="true">|</span>
        <strong style={{ fontSize: 14 }}>编辑器</strong>
        <span
          role="status"
          aria-live="polite"
          style={{ color: status === 'error' ? '#dc2626' : status === 'ready' ? '#059669' : '#6b7280' }}
        >
          {STATUS_TEXT[status]}
        </span>
        {usingFixture && (
          <span style={{ color: '#b45309', background: '#fef3c7', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
            示例数据 · 你还没生成自己的 deck
          </span>
        )}
        {usingSnapshot && (
          <span style={{ color: '#1d4ed8', background: '#dbeafe', padding: '2px 8px', borderRadius: 4, fontSize: 12 }}>
            已恢复上次编辑
          </span>
        )}
        {error && <span style={{ color: '#dc2626' }} role="alert">· {error}</span>}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
          {savedAt && (
            <span style={{ color: '#059669', fontSize: 12 }} title="保存到当前浏览器的本地存储，不会自动同步到其他设备">
              已保存到本地 {savedAt}
            </span>
          )}
          <button
            onClick={downloadBackup}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #d4d4d8',
              background: '#fff',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: 12,
            }}
            title="把当前保存的快照下载成 JSON 备份"
          >
            ↓ 备份 JSON
          </button>
          <button
            onClick={regenerateFromDeck}
            disabled={regenerating || status === 'loading-deck' || status === 'converting'}
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              border: '1px solid #d4d4d8',
              background: '#fff',
              color: '#6b7280',
              cursor: 'pointer',
              fontSize: 12,
            }}
            title="放弃编辑器内的修改，从原始 deck 重新生成"
          >
            {regenerating ? '重生成中…' : '↻ 从 deck 重生成'}
          </button>
          <button
            onClick={triggerSave}
            disabled={status !== 'ready'}
            style={{
              padding: '6px 14px',
              borderRadius: 6,
              border: '1px solid #d4d4d8',
              background: status === 'ready' ? '#111' : '#e5e5e5',
              color: status === 'ready' ? '#fff' : '#999',
              cursor: status === 'ready' ? 'pointer' : 'not-allowed',
              fontSize: 13,
              fontWeight: 500,
            }}
            aria-label="保存当前编辑到本地浏览器"
          >
            保存
          </button>
        </div>
      </header>
      <iframe
        ref={iframeRef}
        src="/pptist/index.html"
        style={{ flex: 1, border: 'none' }}
        title="PPTist 编辑器"
      />
      {showOnboarding && (
        <Onboarding onDismiss={dismissOnboarding} />
      )}
    </div>
  )
}

function Onboarding({ onDismiss }: { onDismiss: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onDismiss()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onDismiss])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 100,
      }}
      onClick={onDismiss}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: 480, background: '#fff', borderRadius: 12, padding: 28,
          boxShadow: '0 24px 48px rgba(0,0,0,0.25)',
        }}
      >
        <h2 id="onboarding-title" style={{ fontSize: 20, fontWeight: 700, marginBottom: 12 }}>
          欢迎来到编辑器
        </h2>
        <div style={{ fontSize: 14, color: '#374151', lineHeight: 1.7 }}>
          <p style={{ marginBottom: 10 }}>
            <strong>双击</strong>任何文本即可编辑。<strong>拖动</strong>元素调整位置。
          </p>
          <p style={{ marginBottom: 10 }}>
            修改后点右上角 <strong>保存</strong>，下次打开会自动恢复。
            <span style={{ color: '#6b7280', fontSize: 12 }}>（数据存在本地浏览器）</span>
          </p>
          <p style={{ marginBottom: 10 }}>
            导出 PPTX：使用编辑器顶栏的 <strong>菜单（左上汉堡图标） → 导出</strong>。
          </p>
          <p style={{ marginBottom: 0, color: '#6b7280', fontSize: 12 }}>
            常用快捷键：<kbd>Ctrl+Z</kbd> 撤销 · <kbd>Ctrl+S</kbd> 保存（被编辑器自身拦截）。
          </p>
        </div>
        <button
          onClick={onDismiss}
          autoFocus
          style={{
            marginTop: 20, width: '100%',
            padding: '10px 16px',
            background: '#111', color: '#fff',
            borderRadius: 8, border: 'none',
            fontSize: 14, fontWeight: 500, cursor: 'pointer',
          }}
        >
          知道了
        </button>
      </div>
    </div>
  )
}
