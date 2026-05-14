'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FlowSteps } from '../page';
import type { Outline, ScriptEntry } from '@/lib/types';

const OUTLINE_STORAGE = 'pg_pending_outline';
const SCRIPT_STORAGE = 'pg_pending_script';
const BRIEF_STORAGE = 'pg_pending_brief';

export default function ScriptPage() {
  const router = useRouter();
  const [outline, setOutline] = useState<Outline | null>(null);
  const [script, setScript] = useState<ScriptEntry[] | null>(null);

  useEffect(() => {
    try {
      const o = localStorage.getItem(OUTLINE_STORAGE);
      const s = localStorage.getItem(SCRIPT_STORAGE);
      const b = localStorage.getItem(BRIEF_STORAGE);
      if (!o || !s || !b) { router.push('/outline'); return; }
      setOutline(JSON.parse(o));
      setScript(JSON.parse(s));
    } catch { router.push('/'); }
  }, [router]);

  function persist(next: ScriptEntry[]) {
    setScript(next);
    localStorage.setItem(SCRIPT_STORAGE, JSON.stringify(next));
  }
  function updateText(slideIndex: number, text: string) {
    if (!script) return;
    persist(script.map((e) => e.slideIndex === slideIndex ? { ...e, text } : e));
  }
  function updateDuration(slideIndex: number, durationSec: number) {
    if (!script) return;
    persist(script.map((e) => e.slideIndex === slideIndex ? { ...e, durationSec } : e));
  }

  if (!outline || !script) {
    return <main className="min-h-screen flex items-center justify-center text-stone-500">加载中…</main>;
  }

  const totalSec = script.reduce((s, e) => s + e.durationSec, 0);

  return (
    <main className="min-h-screen px-6 py-10 sm:px-12 lg:px-16 max-w-4xl mx-auto pb-24">
      <header className="mb-6 flex items-baseline justify-between gap-4">
        <Link href="/outline" className="text-sm text-stone-600 hover:text-stone-900">← 返回大纲</Link>
        <div className="text-right">
          <div className="text-xs uppercase tracking-[0.2em] text-stone-500">STEP 3 / 4 · 改讲稿</div>
          <h1 className="text-2xl font-bold mt-1">讲稿编辑</h1>
        </div>
      </header>

      <FlowSteps current={3} />

      <section className="mt-8 mb-8 p-4 rounded-lg bg-stone-50 border border-stone-200 text-sm">
        <div className="font-semibold text-stone-700 mb-1">{outline.title}</div>
        <div className="text-stone-600">{outline.arc}</div>
        <div className="text-xs text-stone-500 mt-2">
          总时长：约 {Math.floor(totalSec/60)} 分 {totalSec%60} 秒 · {script.length} 节
        </div>
      </section>

      <section className="space-y-5">
        {script.map((entry, i) => {
          const sec = outline.sections[i];
          return (
            <article key={entry.slideIndex} className="border border-stone-300 rounded-lg overflow-hidden">
              <header className="px-5 py-3 bg-stone-100 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-stone-900 text-white flex items-center justify-center text-sm font-bold">
                    {entry.slideIndex}
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold truncate">{sec?.title}</div>
                    <div className="text-xs text-stone-500 truncate">{sec?.brief}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <input type="number" value={entry.durationSec} onChange={(e) => updateDuration(entry.slideIndex, Number(e.target.value) || 0)}
                    className="w-16 text-xs p-1 border border-stone-300 rounded" />
                  <span className="text-xs text-stone-500">秒</span>
                </div>
              </header>
              <textarea
                value={entry.text}
                onChange={(e) => updateText(entry.slideIndex, e.target.value)}
                rows={Math.max(4, entry.text.split('\n').length + 1)}
                className="w-full p-4 text-sm leading-relaxed border-0 resize-none focus:outline-none"
                placeholder="讲稿内容..."
              />
            </article>
          );
        })}
      </section>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-3 flex items-center justify-between gap-4 z-30">
        <div className="text-sm text-stone-600">
          满意讲稿后 → 选风格、密度，生成 PPT
        </div>
        <div className="flex items-center gap-3">
          <Link href="/outline" className="text-sm text-stone-600 hover:underline">← 改大纲</Link>
          <Link href="/style" className="px-6 py-2.5 rounded-md bg-stone-900 text-white font-semibold">
            选风格 →
          </Link>
        </div>
      </footer>
    </main>
  );
}
