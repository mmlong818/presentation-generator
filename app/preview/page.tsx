'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { THEMES } from '@/lib/themes';
import { SlideRenderer } from '@/components/layouts';
import { FIXTURE_SLIDES } from './fixture';
import type { ThemeId } from '@/lib/types';
import type { ThemeTokens } from '@/lib/themes';
import type { Slide } from '@/lib/types';

const THEMES_LIST = Object.values(THEMES);

// 4 张代表性版式：封面 / 单句 / 数据 / CTA
const PREVIEW_INDICES = [
  FIXTURE_SLIDES.findIndex((s) => s.type === 'cover'),
  FIXTURE_SLIDES.findIndex((s) => s.type === 'statement'),
  FIXTURE_SLIDES.findIndex((s) => s.type === 'data'),
  FIXTURE_SLIDES.findIndex((s) => s.type === 'cta'),
].map((i) => Math.max(i, 0));

const PREVIEW_SLIDES = PREVIEW_INDICES.map((i) => FIXTURE_SLIDES[i]);

const THEME_GROUPS: { label: string; start: number; end: number }[] = [
  { label: 'v1 · 沉稳经典', start: 0, end: 10 },
  { label: 'v2 · 多色活泼', start: 10, end: 20 },
  { label: 'v3 · html-ppt-skill', start: 20, end: 46 },
  { label: 'v4 · 归藏', start: 46, end: 55 },
  { label: 'v5 · Swiss 变体', start: 55, end: 59 },
  { label: 'v6 · Open Slide', start: 59, end: 62 },
];

export default function PreviewPage() {
  const [theme, setTheme] = useState<ThemeId>('soft-warm');
  const [slideIdx, setSlideIdx] = useState(0);
  const [mode, setMode] = useState<'single' | 'grid'>('grid');

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
        <h1 className="font-bold">主题画廊</h1>
        <span className="text-xs text-stone-400">{THEMES_LIST.length} 套主题 · 无需 API key</span>
        <div className="ml-auto flex gap-2">
          <button onClick={() => setMode('single')}
            className={`px-3 py-1.5 text-xs rounded ${mode === 'single' ? 'bg-stone-900 text-white' : 'border border-stone-300'}`}>
            单页深探
          </button>
          <button onClick={() => setMode('grid')}
            className={`px-3 py-1.5 text-xs rounded ${mode === 'grid' ? 'bg-stone-900 text-white' : 'border border-stone-300'}`}>
            全览 {THEMES_LIST.length} 主题 × 4 版式
          </button>
        </div>
      </header>

      {mode === 'single' && (
        <div className="px-6 py-3 border-b border-stone-200 bg-stone-50 flex items-center gap-3 flex-wrap">
          <span className="text-xs text-stone-500 uppercase tracking-wider">版式</span>
          {FIXTURE_SLIDES.map((s, i) => (
            <button key={i} onClick={() => setSlideIdx(i)}
              className={`text-xs px-3 py-1.5 rounded ${slideIdx === i ? 'bg-stone-900 text-white' : 'bg-white border border-stone-300 hover:border-stone-500'}`}>
              {s.type}
            </button>
          ))}
        </div>
      )}

      {mode === 'single' ? (
        <SingleMode theme={theme} onTheme={setTheme} slideIdx={slideIdx} t={t} slide={slide} />
      ) : (
        <GridMode onThemeClick={(id) => { setTheme(id); setMode('single'); }} />
      )}
    </main>
  );
}

function SingleMode({ theme, onTheme, slideIdx, t, slide }: {
  theme: ThemeId; onTheme: (id: ThemeId) => void;
  slideIdx: number; t: ThemeTokens; slide: Slide;
}) {
  return (
    <div className="flex-1 grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-4 p-4 overflow-hidden min-h-0">
      <aside className="bg-white border border-stone-200 rounded-lg overflow-y-auto p-3 min-h-0">
        {THEME_GROUPS.map((g) => (
          <div key={g.label}>
            <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold mt-4 mb-2 px-2 first:mt-0">{g.label}</div>
            <div className="flex flex-col gap-1.5">
              {THEMES_LIST.slice(g.start, g.end).map((th) => (
                <ThemeButton key={th.id} th={th} active={theme === th.id} onClick={() => onTheme(th.id)} />
              ))}
            </div>
          </div>
        ))}
      </aside>

      <div className="flex flex-col gap-3 min-h-0 overflow-hidden">
        <SlideStage slide={slide} t={t} idx={slideIdx} total={FIXTURE_SLIDES.length} />
        <div className="text-xs text-stone-500 text-center flex-shrink-0">
          ← / → 切换版式 · 点击左侧切换主题 · 当前: <code className="bg-stone-200 px-1.5 py-0.5 rounded">{theme}</code> · {slide.type}
        </div>
      </div>
    </div>
  );
}

function GridMode({ onThemeClick }: { onThemeClick: (id: ThemeId) => void }) {
  return (
    <div className="flex-1 overflow-y-auto p-6">
      {THEME_GROUPS.map((g) => (
        <section key={g.label} className="mb-10">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-stone-500 mb-4">{g.label}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-5">
            {THEMES_LIST.slice(g.start, g.end).map((th) => (
              <ThemeCard key={th.id} th={th} onClick={() => onThemeClick(th.id)} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ThemeCard({ th, onClick }: { th: ThemeTokens; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="text-left bg-white border border-stone-200 rounded-xl overflow-hidden hover:border-stone-400 hover:shadow-md transition group">
      <div className="px-4 py-3 border-b border-stone-100 flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-bold">{th.name}</div>
          <code className="text-[10px] text-stone-400">{th.id}</code>
        </div>
        <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${th.mode === 'dark' ? 'bg-stone-800 text-stone-300' : 'bg-stone-100 text-stone-600'}`}>
          {th.mode}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-px bg-stone-200">
        {PREVIEW_SLIDES.map((slide, i) => (
          <div key={i} className="aspect-[16/9] relative overflow-hidden bg-stone-100">
            <ScaledStage slide={slide} t={th} />
          </div>
        ))}
      </div>
      <div className="px-4 py-2 text-[10px] text-stone-400 group-hover:text-stone-600 transition">
        点击单页深探 →
      </div>
    </button>
  );
}

function ThemeButton({ th, active, onClick }: { th: ThemeTokens; active: boolean; onClick: () => void }) {
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

function SlideStage({ slide, t, idx, total }: { slide: Slide; t: ThemeTokens; idx: number; total: number }) {
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

function ScaledStage({ slide, t }: { slide: Slide; t: ThemeTokens }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.1);
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
        <SlideRenderer slide={slide} t={t} n={1} total={4} />
      </div>
    </div>
  );
}
