'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FlowSteps } from '../page';
import type { Outline, OutlineSection, BriefInput } from '@/lib/types';

const OUTLINE_STORAGE = 'pg_pending_outline';
const BRIEF_STORAGE = 'pg_pending_brief';
const SCRIPT_STORAGE = 'pg_pending_script';
const LLM_STORAGE = 'pg_llm_config';

export default function OutlinePage() {
  const router = useRouter();
  const [outline, setOutline] = useState<Outline | null>(null);
  const [brief, setBrief] = useState<BriefInput | null>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const o = localStorage.getItem(OUTLINE_STORAGE);
      const b = localStorage.getItem(BRIEF_STORAGE);
      if (!o || !b) { router.push('/'); return; }
      setOutline(JSON.parse(o));
      setBrief(JSON.parse(b));
    } catch { router.push('/'); }
  }, [router]);

  function persist(next: Outline) {
    setOutline(next);
    localStorage.setItem(OUTLINE_STORAGE, JSON.stringify(next));
  }

  function updateSection(idx: number, patch: Partial<OutlineSection>) {
    if (!outline) return;
    const sections = [...outline.sections];
    sections[idx] = { ...sections[idx], ...patch };
    persist({ ...outline, sections });
  }
  function moveSection(idx: number, delta: -1 | 1) {
    if (!outline) return;
    const j = idx + delta;
    if (j < 0 || j >= outline.sections.length) return;
    const sections = [...outline.sections];
    [sections[idx], sections[j]] = [sections[j], sections[idx]];
    persist({ ...outline, sections });
  }
  function addSection(after: number) {
    if (!outline) return;
    const sections = [...outline.sections];
    sections.splice(after + 1, 0, {
      title: '新章节标题', brief: '这一页要讲什么...',
      durationSec: 60,
    });
    persist({ ...outline, sections });
  }
  function removeSection(idx: number) {
    if (!outline || outline.sections.length <= 2) return;
    const t = outline.sections[idx]?.title || '此节';
    if (!window.confirm(`确定删除「${t}」？此操作无法撤销。`)) return;
    persist({ ...outline, sections: outline.sections.filter((_, i) => i !== idx) });
  }

  async function handleGenerateScript() {
    if (!outline || !brief) return;
    setError(null);
    setGenerating(true);
    try {
      const llmStr = localStorage.getItem(LLM_STORAGE);
      if (!llmStr) throw new Error('未找到 LLM 配置，请回主页设置');
      const llmCfg = JSON.parse(llmStr);
      const { PROVIDER_PRESETS } = await import('@/lib/providers');
      const preset = PROVIDER_PRESETS.find((p) => p.id === llmCfg.presetId);
      if (!preset) throw new Error('Provider 配置失效，请回主页重新设置');

      const res = await fetch('/api/script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief, outline,
          llm: {
            provider: preset.provider,
            model: llmCfg.model || preset.defaultModel,
            apiKey: preset.provider === 'claude-cli' ? undefined : llmCfg.apiKey,
            baseURL: preset.provider === 'openai-compat' ? (llmCfg.baseURL || preset.baseURL) : undefined,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      localStorage.setItem(SCRIPT_STORAGE, JSON.stringify(data.script));
      router.push('/script');
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成讲稿失败');
    } finally { setGenerating(false); }
  }

  if (!outline) {
    return <main className="min-h-screen flex items-center justify-center text-stone-500">加载中…</main>;
  }

  const totalSec = outline.sections.reduce((s, x) => s + x.durationSec, 0);
  const targetSec = brief ? brief.durationMin * 60 : 0;
  const drift = totalSec - targetSec;

  return (
    <main
      className="min-h-screen pb-24"
      style={{
        width: '100%',
        maxWidth: 1280,
        marginLeft: 'auto',
        marginRight: 'auto',
        paddingLeft: 64,
        paddingRight: 64,
        paddingTop: 32,
      }}
    >
      <header className="mb-6 flex items-baseline justify-between gap-4">
        <Link href="/" className="text-sm text-stone-600 hover:text-stone-900">← 返回主页</Link>
        <div className="text-right">
          <div className="text-xs uppercase tracking-[0.2em] text-stone-500">STEP 2 / 4 · 改大纲</div>
          <h1 className="text-2xl font-bold mt-1">大纲编辑</h1>
        </div>
      </header>

      <FlowSteps current={2} />

      <section className="my-8 p-5 rounded-lg border border-stone-200 bg-stone-50">
        <Field label="演讲题目">
          <input value={outline.title} onChange={(e) => persist({ ...outline, title: e.target.value })}
            className="w-full p-2 border border-stone-300 rounded text-base font-bold bg-white" />
        </Field>
        <Field label="叙事弧线">
          <AutoTextarea value={outline.arc} onChange={(v) => persist({ ...outline, arc: v })}
            className="w-full p-2 border border-stone-300 rounded text-sm bg-white leading-relaxed" />
        </Field>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-3 text-xs text-stone-500">
          <span>
            <span className="text-stone-400 mr-1">框架</span>
            <span className="font-mono text-stone-700">{outline.framework}</span>
          </span>
          <span>
            <span className="text-stone-400 mr-1">总时长</span>
            <span className={Math.abs(drift) > targetSec * 0.1 ? 'text-amber-700 font-semibold' : 'text-stone-700'}>
              {Math.floor(totalSec/60)} 分 {totalSec%60} 秒
            </span>
            <span className="text-stone-400"> / 目标 {Math.floor(targetSec/60)} 分钟</span>
            {drift !== 0 && (
              <span className={`ml-1 ${Math.abs(drift) > targetSec * 0.1 ? 'text-amber-700' : 'text-stone-500'}`}>
                ({drift > 0 ? '超' : '差'} {Math.abs(drift)} 秒)
              </span>
            )}
          </span>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold mb-3">章节列表 · {outline.sections.length} 节</h2>
        <div className="border border-stone-200 rounded-lg bg-white divide-y divide-stone-200 overflow-hidden">
          {outline.sections.map((s, i) => (
            <div key={i} className="px-3 py-2 hover:bg-stone-50 group">
              {/* 标题行：序号 + 标题 + 时长 + 操作（全 inline） */}
              <div className="flex items-center gap-2">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                  {i + 1}
                </span>
                <input value={s.title} onChange={(e) => updateSection(i, { title: e.target.value })}
                  placeholder="章节标题（观点句）"
                  className="flex-1 px-2 py-1.5 border-b border-transparent focus:border-stone-400 hover:border-stone-300 text-base font-bold focus:outline-none bg-transparent" />
                <input type="number" value={s.durationSec}
                  onChange={(e) => updateSection(i, { durationSec: Number(e.target.value) || 0 })}
                  title="时长（秒）"
                  className="w-12 px-1.5 py-1 border border-stone-200 rounded text-sm text-center focus:border-stone-400" />
                <span className="text-xs text-stone-400">秒</span>

                <div className="flex items-center gap-0.5 flex-shrink-0 opacity-40 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => moveSection(i, -1)} disabled={i === 0}
                    title="上移"
                    className="w-6 h-6 rounded text-stone-500 disabled:opacity-30 hover:bg-stone-200 flex items-center justify-center text-xs">▲</button>
                  <button onClick={() => moveSection(i, 1)} disabled={i === outline.sections.length - 1}
                    title="下移"
                    className="w-6 h-6 rounded text-stone-500 disabled:opacity-30 hover:bg-stone-200 flex items-center justify-center text-xs">▼</button>
                  <button onClick={() => addSection(i)}
                    title="在下方插入新节"
                    className="w-6 h-6 rounded text-stone-700 hover:bg-stone-200 flex items-center justify-center text-sm">+</button>
                  {outline.sections.length > 2 && (
                    <button onClick={() => removeSection(i)}
                      title="删除此节"
                      className="w-6 h-6 rounded text-red-600 hover:bg-red-100 flex items-center justify-center">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
              {/* Brief 行：缩进对齐标题，紧贴标题下方 */}
              <div className="pl-9 pr-2 mt-1">
                <AutoTextarea value={s.brief} onChange={(v) => updateSection(i, { brief: v })}
                  placeholder="这一页要讲什么..."
                  className="w-full px-2 py-1 border-b border-transparent focus:border-stone-300 hover:border-stone-200 text-sm leading-relaxed text-stone-700 focus:outline-none bg-transparent" />
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-3 flex items-center justify-between gap-4 z-30">
        <div className="text-sm text-stone-600">
          {generating ? '正在生成讲稿（约 30-60 秒）…' : '满意大纲后 → 生成讲稿'}
        </div>
        <div className="flex items-center gap-3">
          {error && <div className="text-sm text-red-600 max-w-md truncate">{error}</div>}
          <Link href="/" className="text-sm text-stone-600 hover:underline">← 改需求</Link>
          <button onClick={handleGenerateScript} disabled={generating}
            className="px-6 py-2.5 rounded-md bg-stone-900 text-white font-semibold disabled:opacity-50">
            {generating ? '生成中…' : '生成讲稿 →'}
          </button>
        </div>
      </footer>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3 last:mb-0">
      <label className="block text-xs font-medium text-stone-600 mb-1">{label}</label>
      {children}
    </div>
  );
}

/** 自动按内容撑高的 textarea；最少 2 行 */
function AutoTextarea({ value, onChange, className, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  className?: string;
  placeholder?: string;
}) {
  const ref = useAutoHeight(value);
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={className}
      rows={1}
      style={{ resize: 'none', minHeight: '2rem', overflow: 'hidden' }}
    />
  );
}

function useAutoHeight(value: string) {
  const ref = useRef<HTMLTextAreaElement | null>(null);
  // recompute on value change
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  }, [value]);
  return ref;
}
