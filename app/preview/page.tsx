'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { THEMES } from '@/lib/themes';
import { SlideRenderer } from '@/components/layouts';
import { FIXTURE_SLIDES } from './fixture';
import type { ThemeId } from '@/lib/types';

const THEMES_LIST = Object.values(THEMES);

export default function PreviewPage() {
  const [theme, setTheme] = useState<ThemeId>('soft-warm');
  const [slideIdx, setSlideIdx] = useState(0);
  const [mode, setMode] = useState<'single' | 'grid'>('single');

  const t = THEMES[theme];
  const slide = FIXTURE_SLIDES[slideIdx];

  const next = useCallback(() => setSlideIdx((i) => Math.min(i + 1, FIXTURE_SLIDES.length - 1)), []);
  const prev = useCallback(() => setSlideIdx((i) => Math.max(i - 1, 0)), []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (mode !== 'single') return;
      if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [next, prev, mode]);

  return (
    <main className="h-screen flex flex-col bg-stone-100 overflow-hidden">
      <header className="px-6 py-4 border-b border-stone-200 bg-white flex items-center gap-4 flex-wrap">
        <Link href="/" className="text-sm text-stone-600 hover:text-stone-900">← 主页</Link>
        <h1 className="font-bold">主题画廊（无需 API key）</h1>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setMode('single')}
            className={`px-3 py-1.5 text-xs rounded ${mode === 'single' ? 'bg-stone-900 text-white' : 'border border-stone-300'}`}>
            单页对比
          </button>
          <button onClick={() => setMode('grid')}
            className={`px-3 py-1.5 text-xs rounded ${mode === 'grid' ? 'bg-stone-900 text-white' : 'border border-stone-300'}`}>
            20 主题 × 1 版式 全览
          </button>
        </div>
      </header>

      <div className="px-6 py-3 border-b border-stone-200 bg-stone-50 flex items-center gap-3 flex-wrap">
        <span className="text-xs text-stone-500 uppercase tracking-wider">版式</span>
        {FIXTURE_SLIDES.map((s, i) => (
          <button key={i} onClick={() => setSlideIdx(i)}
            className={`text-xs px-3 py-1.5 rounded ${slideIdx === i ? 'bg-stone-900 text-white' : 'bg-white border border-stone-300 hover:border-stone-500'}`}>
            {s.type}
          </button>
        ))}
      </div>

      {mode === 'single' ? (
        <SingleMode theme={theme} onTheme={setTheme} slideIdx={slideIdx} t={t} slide={slide} />
      ) : (
        <GridMode slide={slide} />
      )}
    </main>
  );
}

function SingleMode({ theme, onTheme, slideIdx, t, slide }: {
  theme: ThemeId; onTheme: (id: ThemeId) => void;
  slideIdx: number; t: import('@/lib/themes').ThemeTokens;
  slide: import('@/lib/types').Slide;
}) {
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 p-4 overflow-hidden min-h-0">
      {/* 主题选择器 */}
      <aside className="bg-white border border-stone-200 rounded-lg overflow-y-auto p-3 min-h-0">
        <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold mb-3 px-2">v1 · 沉稳 10 套</div>
        <div className="flex flex-col gap-2">
          {THEMES_LIST.slice(0, 10).map((th) => (
            <ThemeButton key={th.id} th={th} active={theme === th.id} onClick={() => onTheme(th.id)} />
          ))}
        </div>
        <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold mt-5 mb-3 px-2">v2 · 多色 10 套</div>
        <div className="flex flex-col gap-2">
          {THEMES_LIST.slice(10).map((th) => (
            <ThemeButton key={th.id} th={th} active={theme === th.id} onClick={() => onTheme(th.id)} />
          ))}
        </div>
      </aside>

      {/* 大幻灯片预览 */}
      <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
        <SlideStage slide={slide} t={t} idx={slideIdx} total={FIXTURE_SLIDES.length} />
        <div className="text-xs text-stone-500 text-center flex-shrink-0">
          ← / → 切换版式 · 点击左侧切换主题 · 现在: <code className="bg-stone-200 px-1.5 py-0.5 rounded">{theme}</code> · {slide.type}
        </div>
      </div>
    </div>
  );
}

function ThemeButton({ th, active, onClick }: { th: import('@/lib/themes').ThemeTokens; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className={`text-left p-2 rounded border transition relative overflow-hidden ${active ? 'border-stone-900 ring-2 ring-stone-900' : 'border-stone-200 hover:border-stone-400'}`}
      style={{ background: th.bg, color: th.text }}>
      {th.decoration && (
        <div style={{ position: 'absolute', inset: 0, background: th.decoration, opacity: 0.4, pointerEvents: 'none', ...(th.id === 'risograph' || th.id === 'riso-pastel' ? { backgroundSize: '14px 14px' } : {}) }} />
      )}
      <div className="relative">
        <div className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: th.accent }}>{th.id}</div>
        <div className="text-sm font-bold mt-0.5" style={{ fontFamily: th.fontDisplay }}>{th.name}</div>
      </div>
    </button>
  );
}

function GridMode({ slide }: { slide: import('@/lib/types').Slide }) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {THEMES_LIST.map((th) => (
          <div key={th.id} className="flex flex-col bg-white rounded-lg border border-stone-200 overflow-hidden">
            <div className="px-3 py-2 border-b border-stone-200 flex items-center justify-between bg-stone-50">
              <span className="text-xs font-bold">{th.name}</span>
              <code className="text-[10px] text-stone-500">{th.id}</code>
            </div>
            <div className="aspect-[16/9] relative bg-stone-100">
              <div className="absolute inset-0">
                <ScaledStage slide={slide} t={th} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SlideStage({ slide, t, idx, total }: {
  slide: import('@/lib/types').Slide;
  t: import('@/lib/themes').ThemeTokens;
  idx: number; total: number;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    function recalc() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setScale(Math.min(rect.width / 1920, rect.height / 1080));
    }
    recalc();
    const ro = new ResizeObserver(recalc);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={containerRef} className="flex-1 flex items-center justify-center bg-stone-200 rounded-lg overflow-hidden min-h-0">
      <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'center center', flexShrink: 0 }}>
        <SlideRenderer slide={slide} t={t} n={idx + 1} total={total} />
      </div>
    </div>
  );
}

function ScaledStage({ slide, t }: { slide: import('@/lib/types').Slide; t: import('@/lib/themes').ThemeTokens }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.2);
  useEffect(() => {
    function recalc() {
      const el = containerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setScale(Math.min(rect.width / 1920, rect.height / 1080));
    }
    recalc();
    const ro = new ResizeObserver(recalc);
    if (containerRef.current) ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);
  return (
    <div ref={containerRef} className="w-full h-full flex items-center justify-center overflow-hidden">
      <div style={{ width: 1920, height: 1080, transform: `scale(${scale})`, transformOrigin: 'center center', flexShrink: 0 }}>
        <SlideRenderer slide={slide} t={t} n={1} total={FIXTURE_SLIDES.length} />
      </div>
    </div>
  );
}
