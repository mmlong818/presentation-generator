'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { THEMES } from '@/lib/themes';
import { applyBrand } from '@/lib/brand';
import { SlideRenderer } from '@/components/layouts';
import SlideEditor from '@/components/SlideEditor';
import type { Deck, Slide } from '@/lib/types';

const DECK_STORAGE = 'pg_last_deck';

export default function DeckPage() {
  const [deck, setDeck] = useState<Deck | null>(null);
  const [idx, setIdx] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [editing, setEditing] = useState<'slide' | 'script' | null>(null);

  // 持久化任意 deck 修改回 sessionStorage
  function persistDeck(next: Deck) {
    setDeck(next);
    sessionStorage.setItem(DECK_STORAGE, JSON.stringify(next));
  }
  function updateSlide(slideIdx: number, next: Slide) {
    if (!deck) return;
    const slides = [...deck.slides];
    slides[slideIdx] = next;
    persistDeck({ ...deck, slides });
  }
  function updateScript(slideIndex: number, text: string) {
    if (!deck) return;
    const script = deck.script.map((e) => e.slideIndex === slideIndex ? { ...e, text } : e);
    persistDeck({ ...deck, script });
  }

  useEffect(() => {
    const raw = sessionStorage.getItem(DECK_STORAGE);
    if (raw) {
      try { setDeck(JSON.parse(raw)); } catch { setDeck(null); }
    }
  }, []);

  const next = useCallback(() => setIdx((i) => deck ? Math.min(i + 1, deck.slides.length - 1) : 0), [deck]);
  const prev = useCallback(() => setIdx((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); prev(); }
      else if (e.key === 'Escape') setFullscreen(false);
      else if (e.key === 'f' || e.key === 'F') setFullscreen((v) => !v);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev]);

  if (!deck) {
    return (
      <main className="min-h-screen flex items-center justify-center px-6 text-center">
        <div>
          <p className="text-stone-600">没有 deck 数据。可能是刚刷新过页面。</p>
          <Link href="/" className="inline-block mt-4 px-5 py-2 bg-stone-900 text-white rounded-md">返回主页</Link>
        </div>
      </main>
    );
  }

  const t = applyBrand(deck.theme, deck.brand);
  const slide = deck.slides[idx];
  const scriptEntry = deck.script.find((s) => s.slideIndex === idx + 1);

  if (fullscreen) {
    return (
      <FullscreenView deck={deck} idx={idx} t={t} onIdxChange={setIdx} onExit={() => setFullscreen(false)} />
    );
  }

  // 离屏导出容器：所有 slide 渲染到原生 1920×1080 让 html-to-image 截图
  const ExportRoot = (
    <div style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }} aria-hidden>
      {deck.slides.map((s, i) => (
        <div key={i} data-export-slide="1" style={{ width: 1920, height: 1080, marginBottom: 20 }}>
          <SlideRenderer slide={s} t={t} n={i + 1} total={deck.slides.length} brand={deck.brand} deckTitle={deck.title} />
        </div>
      ))}
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col">
      {ExportRoot}
      <header className="px-6 py-4 border-b border-stone-200 flex items-center gap-4 flex-wrap">
        <Link href="/" className="text-sm text-stone-600 hover:text-stone-900">← 返回</Link>
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate">{deck.title}</div>
          <div className="text-xs text-stone-500">
            {t.name} · {deck.framework} 框架 · {deck.slides.length} 张 · 约 {Math.round(deck.script.reduce((s, e) => s + e.durationSec, 0) / 60)} 分钟
          </div>
        </div>
        <button onClick={() => setFullscreen(true)} className="px-4 py-2 text-sm rounded bg-stone-900 text-white">
          全屏放映 (F)
        </button>
        <ExportMenu deck={deck} />
      </header>

      {editing === 'slide' && (
        <SlideEditor
          slide={slide}
          onClose={() => setEditing(null)}
          onSave={(next) => { updateSlide(idx, next); setEditing(null); }}
        />
      )}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 p-6 overflow-hidden">
        <div className="flex flex-col gap-4 min-h-0">
          <div className="flex-1 flex items-center justify-center bg-stone-100 rounded-lg overflow-hidden">
            <SlideStage slide={slide} t={t} idx={idx} total={deck.slides.length} brand={deck.brand} deckTitle={deck.title} />
          </div>
          <div className="flex items-center justify-between gap-3">
            <button onClick={prev} disabled={idx === 0} className="px-4 py-2 rounded border disabled:opacity-30">← 上一张</button>
            <div className="flex items-center gap-2">
              <button onClick={() => setEditing('slide')}
                className="px-3 py-2 rounded text-xs border border-stone-300 hover:bg-stone-100">
                ✎ 编辑此页
              </button>
              <div className="text-sm text-stone-600 px-2">
                {idx + 1} / {deck.slides.length}
              </div>
            </div>
            <button onClick={next} disabled={idx >= deck.slides.length - 1} className="px-4 py-2 rounded border disabled:opacity-30">下一张 →</button>
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {deck.slides.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`w-16 h-9 rounded text-xs flex-shrink-0 border ${i === idx ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300'}`}>
                {i + 1}
              </button>
            ))}
          </div>
        </div>

        <aside className="bg-stone-50 border border-stone-200 rounded-lg p-5 overflow-y-auto">
          <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-3 flex justify-between items-center">
            <span>讲稿 · 第 {idx + 1} 张</span>
            {editing === 'script' ? (
              <button onClick={() => setEditing(null)} className="text-stone-700 normal-case tracking-normal text-xs underline">完成</button>
            ) : (
              <button onClick={() => setEditing('script')} className="text-stone-700 normal-case tracking-normal text-xs underline">编辑</button>
            )}
          </div>
          {scriptEntry ? (
            <>
              <div className="text-xs text-stone-500 mb-3">约 {scriptEntry.durationSec} 秒</div>
              {editing === 'script' ? (
                <textarea
                  value={scriptEntry.text}
                  onChange={(e) => updateScript(scriptEntry.slideIndex, e.target.value)}
                  className="w-full text-sm leading-relaxed p-3 border border-stone-300 rounded resize-none"
                  rows={20}
                  autoFocus
                />
              ) : (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">{scriptEntry.text}</div>
              )}
            </>
          ) : (
            <div className="text-sm text-stone-500">这一张没有讲稿。</div>
          )}
          {deck.selfReview && (
            <div className="mt-8 pt-5 border-t border-stone-200 text-xs">
              <div className="font-semibold text-stone-700 mb-2">5 维自检</div>
              <Score label="哲学一致性" v={deck.selfReview.philosophy} />
              <Score label="信息层级" v={deck.selfReview.hierarchy} />
              <Score label="执行精度" v={deck.selfReview.execution} />
              <Score label="具体性" v={deck.selfReview.specificity} />
              <Score label="克制度" v={deck.selfReview.restraint} />
              {deck.selfReview.notes && <div className="text-stone-600 mt-3 italic">{deck.selfReview.notes}</div>}
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

function Score({ label, v }: { label: string; v: number }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-stone-600">{label}</span>
      <span className={v < 3 ? 'text-red-600 font-semibold' : 'text-stone-900'}>{v} / 5</span>
    </div>
  );
}

function SlideStage({ slide, t, idx, total, brand, deckTitle }: {
  slide: import('@/lib/types').Slide;
  t: import('@/lib/themes').ThemeTokens;
  idx: number; total: number;
  brand?: import('@/lib/types').BrandOverride;
  deckTitle?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    function recalc() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const sx = rect.width / 1920;
      const sy = rect.height / 1080;
      setScale(Math.min(sx, sy));
    }
    recalc();
    const ro = new ResizeObserver(recalc);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
      <div style={{
        width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'center center',
        flexShrink: 0,
      }}>
        <SlideRenderer slide={slide} t={t} n={idx + 1} total={total} brand={brand} deckTitle={deckTitle} />
      </div>
    </div>
  );
}

function FullscreenView({ deck, idx, t, onIdxChange, onExit }: {
  deck: Deck; idx: number; t: import('@/lib/themes').ThemeTokens;
  onIdxChange: (i: number) => void; onExit: () => void;
}) {
  const slide = deck.slides[idx];
  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center z-50">
      <button onClick={onExit} className="absolute top-4 right-4 z-10 px-3 py-1 text-xs bg-white/10 text-white rounded">退出 (Esc)</button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 text-white/60 text-xs">
        {idx + 1} / {deck.slides.length} · ← → 翻页 · F 退出
      </div>
      <SlideStage slide={slide} t={t} idx={idx} total={deck.slides.length} brand={deck.brand} deckTitle={deck.title} />
      {idx > 0 && <button onClick={() => onIdxChange(idx - 1)} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 text-3xl">‹</button>}
      {idx < deck.slides.length - 1 && <button onClick={() => onIdxChange(idx + 1)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 text-3xl">›</button>}
    </div>
  );
}

function safeFileName(s: string): string {
  return s.slice(0, 40).replace(/[^\w一-龥]/g, '_');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportJSON(deck: Deck) {
  const blob = new Blob([JSON.stringify(deck, null, 2)], { type: 'application/json' });
  downloadBlob(blob, `${safeFileName(deck.title)}.json`);
}

function exportScript(deck: Deck) {
  const lines: string[] = [];
  lines.push(deck.title);
  lines.push('='.repeat(deck.title.length * 2));
  lines.push('');
  lines.push(`框架: ${deck.framework}`);
  lines.push(`总张数: ${deck.slides.length}`);
  const totalSec = deck.script.reduce((s, e) => s + e.durationSec, 0);
  lines.push(`总时长: 约 ${Math.round(totalSec / 60)} 分 ${totalSec % 60} 秒`);
  lines.push('');
  lines.push('---');
  lines.push('');
  // 按 slideIndex 排序后输出
  const sorted = [...deck.script].sort((a, b) => a.slideIndex - b.slideIndex);
  for (const entry of sorted) {
    lines.push(`【第 ${entry.slideIndex} 张】`);
    lines.push(`（约 ${entry.durationSec} 秒）`);
    lines.push('');
    lines.push(entry.text);
    lines.push('');
    lines.push('---');
    lines.push('');
  }
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  downloadBlob(blob, `${safeFileName(deck.title)}_讲稿.txt`);
}

function ExportMenu({ deck }: { deck: Deck }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);

  async function handlePDF() {
    setBusy('PDF');
    try {
      const { exportPDF } = await import('@/lib/export-pdf-pptx');
      await exportPDF(deck, safeFileName(deck.title));
    } catch (e) {
      alert(`PDF 导出失败：${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(null); setOpen(false);
    }
  }
  async function handlePPTX() {
    setBusy('PPTX');
    try {
      const { exportPPTX } = await import('@/lib/export-pdf-pptx');
      await exportPPTX(deck, safeFileName(deck.title));
    } catch (e) {
      alert(`PPTX 导出失败：${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(null); setOpen(false);
    }
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen((v) => !v)} className="px-4 py-2 text-sm rounded border border-stone-300">
        {busy ? `导出 ${busy} 中…` : '导出 ▾'}
      </button>
      {open && !busy && (
        <div className="absolute right-0 top-full mt-2 bg-white border border-stone-200 rounded-md shadow-lg z-20 min-w-[180px] py-1">
          <button onClick={handlePDF} className="block w-full text-left px-4 py-2 text-sm hover:bg-stone-100">
            📄 PDF（图片版）
          </button>
          <button onClick={handlePPTX} className="block w-full text-left px-4 py-2 text-sm hover:bg-stone-100">
            🎞 PPTX（图片版）
          </button>
          <button onClick={() => { exportScript(deck); setOpen(false); }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-stone-100">
            📝 讲稿 TXT
          </button>
          <div className="border-t border-stone-200 my-1" />
          <button onClick={() => { exportJSON(deck); setOpen(false); }}
            className="block w-full text-left px-4 py-2 text-sm hover:bg-stone-100">
            ⚙ JSON（含所有数据）
          </button>
        </div>
      )}
    </div>
  );
}
