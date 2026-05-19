'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PROVIDER_PRESETS } from '@/lib/providers';
import type { BriefInput } from '@/lib/types';

const LLM_STORAGE = 'pg_llm_config';
const BRIEF_STORAGE = 'pg_pending_brief';
const OUTLINE_STORAGE = 'pg_pending_outline';
const SCRIPT_STORAGE = 'pg_pending_script';

interface LLMConfig {
  presetId: string; model: string; apiKey: string; baseURL: string;
}

const DEFAULT_LLM: LLMConfig = { presetId: 'anthropic', model: 'claude-sonnet-4-6', apiKey: '', baseURL: '' };

// Map common upstream failure modes to actionable, human language.
function humanizeError(raw: string): string {
  const m = raw.match(/HTTP (\d{3})/);
  const code = m ? Number(m[1]) : null;
  if (code === 401) return 'API key 似乎失效或写错，请重新打开"模型设置"检查。';
  if (code === 403) return '权限不足，可能是 key 没开通这个模型。';
  if (code === 429) return '服务商限流，1 分钟后重试或换 provider。';
  if (code === 408 || /timeout/i.test(raw)) return '上游响应超时，可换 provider 或稍后再试。';
  if (code && code >= 500) return '服务商出问题了，建议稍后再试或换 provider。';
  if (/fetch|network|ECONN|ENOTFOUND/i.test(raw)) return '网络似乎不通，检查梯子 / base URL。';
  return '可以重试一次，或在"模型设置"换个 provider。';
}

export default function Home() {
  const router = useRouter();
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState(15);
  const [notes, setNotes] = useState('');
  const [llm, setLlm] = useState<LLMConfig>(DEFAULT_LLM);
  const [llmDialogOpen, setLlmDialogOpen] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{ preview?: string; hint?: string } | null>(null);
  const [resumeStep, setResumeStep] = useState<'/outline' | '/script' | '/style' | null>(null);
  const [resumeBrief, setResumeBrief] = useState<string | null>(null);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LLM_STORAGE) : null;
    if (saved) { try { setLlm({ ...DEFAULT_LLM, ...JSON.parse(saved) }); } catch {} }
    fetch('/api/generate').then((r) => r.json()).then((d) => setIsLocal(!!d.local)).catch(() => {});
    // 检测未完成会话
    const briefRaw = localStorage.getItem(BRIEF_STORAGE);
    const hasBrief = !!briefRaw;
    const hasOutline = !!localStorage.getItem(OUTLINE_STORAGE);
    const hasScript = !!localStorage.getItem(SCRIPT_STORAGE);
    if (hasBrief && hasOutline && hasScript) setResumeStep('/style');
    else if (hasBrief && hasOutline) setResumeStep('/script');
    else if (hasBrief) setResumeStep('/outline');
    if (briefRaw) {
      try {
        const b = JSON.parse(briefRaw) as BriefInput;
        if (b?.topic) setResumeBrief(b.topic.slice(0, 80));
      } catch {}
    }
  }, []);

  function persistLlm(next: LLMConfig) {
    setLlm(next);
    if (typeof window !== 'undefined') localStorage.setItem(LLM_STORAGE, JSON.stringify(next));
  }

  const preset = PROVIDER_PRESETS.find((p) => p.id === llm.presetId);
  const llmReady = llm.presetId === 'claude-cli' ? isLocal : !!llm.apiKey && !!llm.model;

  function buildLLMPayload() {
    if (!preset) throw new Error('未知 provider');
    return {
      provider: preset.provider,
      model: llm.model || preset.defaultModel,
      apiKey: preset.provider === 'claude-cli' ? undefined : llm.apiKey,
      baseURL: preset.provider === 'openai-compat' ? (llm.baseURL || preset.baseURL) : undefined,
    };
  }

  async function handleGenerateOutline() {
    setError(null); setErrorDetails(null);
    if (!topic.trim() || !audience.trim() || !goal.trim()) {
      setError('请把主题、听众、目标都填上。'); return;
    }
    if (!llmReady) { setLlmDialogOpen(true); return; }
    if (!preset) { setError('未知 provider'); return; }

    setLoading(true);
    try {
      const brief: BriefInput = {
        topic: topic.trim(), audience: audience.trim(), goal: goal.trim(),
        durationMin: duration,
        // density 在 step 4 选；这里不带，让 outline 走 1 张/分钟
        notes: notes.trim() || undefined,
      };
      const res = await fetch('/api/outline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brief, llm: buildLLMPayload() }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setErrorDetails({ preview: err.raw_preview, hint: err.hint });
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      localStorage.setItem(BRIEF_STORAGE, JSON.stringify(brief));
      localStorage.setItem(OUTLINE_STORAGE, JSON.stringify(data.outline));
      // 清掉旧 script，避免老数据干扰
      localStorage.removeItem(SCRIPT_STORAGE);
      router.push('/outline');
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败');
    } finally { setLoading(false); }
  }

  return (
    <main className="min-h-screen px-6 py-12 sm:px-12 lg:px-20 max-w-4xl mx-auto w-full">
      {resumeStep && (
        <div className="mb-6 p-4 rounded-lg border border-amber-300 bg-amber-50" role="region" aria-label="续会话">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="text-sm text-amber-900 min-w-0 flex-1">
              <div className="font-semibold">检测到上次未完成的会话</div>
              {resumeBrief && (
                <div className="text-xs text-amber-700 mt-1 truncate" title={resumeBrief}>
                  上次主题：{resumeBrief}
                </div>
              )}
            </div>
            <div className="flex gap-2 shrink-0">
              <Link href={resumeStep} className="text-sm px-4 py-2 rounded bg-amber-900 text-white font-medium hover:bg-amber-800">
                继续上次
              </Link>
              <button
                onClick={() => {
                  if (!confirm('确定要放弃上次未完成的会话吗？\n这会清除你写过的主题、大纲、讲稿。')) return;
                  localStorage.removeItem(BRIEF_STORAGE);
                  localStorage.removeItem(OUTLINE_STORAGE);
                  localStorage.removeItem(SCRIPT_STORAGE);
                  setResumeStep(null);
                  setResumeBrief(null);
                }}
                className="text-sm px-3 py-2 rounded border border-amber-300 text-amber-800 hover:bg-amber-100"
              >
                放弃
              </button>
            </div>
          </div>
        </div>
      )}
      <header className="mb-12 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium">STEP 1 / 4 · 写需求</div>
          <h1 className="text-4xl sm:text-5xl font-bold mt-3 tracking-tight">演讲材料生成器</h1>
          <p className="text-stone-600 mt-3 text-lg">先把演讲想清楚 — 大纲 → 讲稿 → 风格 → PPT。每步都可改。</p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/quick"
            title="跳过大纲/讲稿编辑，AI 一次性出 PPT。适合主题已经想清楚、要快速看到结果。"
            aria-label="快速直出：跳过中间步骤，AI 一次性生成完整 PPT"
            className="text-sm px-4 py-2 rounded border border-stone-300 hover:bg-stone-100 whitespace-nowrap"
          >⚡ 快速直出</Link>
          <Link
            href="/history"
            title="查看你之前生成过的 deck"
            className="text-sm px-4 py-2 rounded border border-stone-300 hover:bg-stone-100 whitespace-nowrap"
          >📚 历史</Link>
          <Link
            href="/deck"
            title="打开编辑器查看最近一次的 deck"
            className="text-sm px-4 py-2 rounded border border-stone-300 hover:bg-stone-100 whitespace-nowrap"
          >✎ 编辑器</Link>
        </div>
      </header>

      <FlowSteps current={1} />

      <section className="space-y-6 mt-10">
        <Field label="主题" hint="一句话概括，越具体越好">
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="例：AI 时代教育需要重新出发"
            className="w-full p-3 rounded-md border border-stone-300 bg-white focus:outline-none focus:border-stone-900" />
        </Field>
        <Field label="听众" hint="谁会坐在台下？">
          <input value={audience} onChange={(e) => setAudience(e.target.value)} placeholder="例：家长 + 中学生 / 投资人 / 同事"
            className="w-full p-3 rounded-md border border-stone-300 bg-white focus:outline-none focus:border-stone-900" />
        </Field>
        <Field label="目标" hint="演讲完，希望听众做什么 / 记住什么？">
          <input value={goal} onChange={(e) => setGoal(e.target.value)} placeholder="例：被打动，重新思考教孩子的方式"
            className="w-full p-3 rounded-md border border-stone-300 bg-white focus:outline-none focus:border-stone-900" />
        </Field>
        <Field label={`时长：${duration} 分钟`}>
          <input
            type="range" min={5} max={60} step={5}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            aria-label={`演讲时长 ${duration} 分钟`}
            className="w-full"
          />
          <div className="flex justify-between text-[10px] text-stone-400 mt-1 px-0.5 select-none" aria-hidden="true">
            <span>5</span><span>15</span><span>30</span><span>45</span><span>60</span>
          </div>
        </Field>
        <Field label="补充素材（可选）" hint="你有的故事、数据、引言、立场，AI 优先用真实素材">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
            placeholder="例：上周一个学生跟我说……"
            className="w-full p-3 rounded-md border border-stone-300 bg-white focus:outline-none focus:border-stone-900" />
        </Field>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold mb-3 text-stone-700">模型设置</h2>
        <button onClick={() => setLlmDialogOpen(true)}
          className={`w-full text-left p-4 rounded-lg border ${llmReady ? 'border-stone-300 bg-white' : 'border-amber-400 bg-amber-50'}`}>
          {llmReady ? (
            <>
              <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold">{preset?.label}</div>
              <div className="text-base font-bold mt-1">{llm.model || preset?.defaultModel}</div>
              {llm.presetId === 'claude-cli' ? (
                <div className="text-xs mt-1 text-stone-500">使用本地 Claude CLI 订阅</div>
              ) : (
                <div className="text-xs mt-1 text-stone-500">key: {llm.apiKey.slice(0, 7)}…{llm.apiKey.slice(-4)}</div>
              )}
            </>
          ) : (
            <div className="text-sm text-amber-900 font-medium">⚠ 点击此处配置模型</div>
          )}
        </button>
      </section>

      <section className="mt-10 flex items-center gap-4 flex-wrap">
        <button onClick={handleGenerateOutline} disabled={loading}
          className="px-8 py-3 rounded-md bg-stone-900 text-white font-semibold disabled:opacity-50">
          {loading ? '生成大纲中…' : '生成大纲 →'}
        </button>
      </section>

      {error && (
        <div className="mt-4 p-4 rounded-md border border-red-300 bg-red-50" role="alert" aria-live="polite">
          <div className="text-sm text-red-800 font-medium">{error}</div>
          {errorDetails?.hint && <div className="text-xs text-red-700 mt-2">💡 {errorDetails.hint}</div>}
          <div className="text-xs text-red-700 mt-2">{humanizeError(error)}</div>
          {errorDetails?.preview && (
            <details className="mt-2">
              <summary className="text-xs text-red-700 cursor-pointer underline">查看 AI 返回内容</summary>
              <pre className="mt-2 p-3 bg-white border border-red-200 rounded text-xs font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">{errorDetails.preview}</pre>
            </details>
          )}
        </div>
      )}

      <footer className="mt-16 pt-8 border-t border-stone-200 text-xs text-stone-500 leading-relaxed">
        <p>支持 9 种 LLM provider。所有 key 仅存浏览器。开源 AGPL-3.0。</p>
      </footer>

      {llmDialogOpen && (
        <LLMDialog initial={llm} isLocal={isLocal} onClose={() => setLlmDialogOpen(false)}
          onSave={(next) => { persistLlm(next); setLlmDialogOpen(false); }} />
      )}
    </main>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">
        {label} {hint && <span className="text-stone-500 font-normal">— {hint}</span>}
      </label>
      {children}
    </div>
  );
}

export function FlowSteps({ current }: { current: 1 | 2 | 3 | 4 }) {
  const steps = ['写需求', '改大纲', '改讲稿', '选风格 + 出 PPT'];
  return (
    <div className="flex items-center gap-2 text-xs">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full
              ${active ? 'bg-stone-900 text-white' : done ? 'bg-stone-200 text-stone-700' : 'bg-stone-100 text-stone-400'}`}>
              <span className="font-mono">{n}</span>
              <span>{label}</span>
            </div>
            {n < steps.length && <div className={`w-6 h-px ${done ? 'bg-stone-400' : 'bg-stone-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}

function LLMDialog({ initial, isLocal, onClose, onSave }: {
  initial: LLMConfig; isLocal: boolean;
  onClose: () => void; onSave: (next: LLMConfig) => void;
}) {
  const [cfg, setCfg] = useState<LLMConfig>(initial);
  const presets = PROVIDER_PRESETS.filter((p) => isLocal || !p.localOnly);
  const preset = presets.find((p) => p.id === cfg.presetId) ?? presets[0];

  // ESC closes the dialog (keyboard a11y).
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function pickPreset(id: string) {
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    setCfg((c) => ({ presetId: id, model: p.defaultModel, apiKey: c.apiKey, baseURL: p.baseURL ?? '' }));
  }

  const isCli = preset.provider === 'claude-cli';
  const needsKey = !isCli;
  const needsBaseURL = preset.id === 'custom';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold">配置 LLM</h3>
        <p className="text-sm text-stone-600 mt-2">所有 key 仅存浏览器，不上传服务器。</p>
        <div className="mt-5">
          <div className="text-sm font-medium mb-2">Provider</div>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button key={p.id} onClick={() => pickPreset(p.id)}
                className={`text-left p-3 rounded border text-sm ${cfg.presetId === p.id ? 'border-stone-900 ring-2 ring-stone-900' : 'border-stone-200'}`}>
                <div className="font-bold">{p.label}</div>
                {p.note && <div className="text-xs text-stone-500 mt-1">{p.note}</div>}
              </button>
            ))}
          </div>
        </div>
        {isCli ? (
          <div className="mt-5 p-4 bg-stone-50 rounded text-sm">使用本地 <code className="bg-stone-200 px-1 rounded">claude</code> 命令，复用你的 Claude Code 订阅。</div>
        ) : (
          <>
            {needsBaseURL && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">Base URL</div>
                <input value={cfg.baseURL} onChange={(e) => setCfg((c) => ({ ...c, baseURL: e.target.value }))}
                  placeholder="https://api.example.com/v1"
                  className="w-full p-2 rounded border border-stone-300 font-mono text-sm" />
              </div>
            )}
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">模型名 {preset.modelExamples.length > 0 && <span className="text-stone-500 font-normal text-xs">— 推荐：{preset.modelExamples.join(' / ')}</span>}</div>
              <input value={cfg.model} onChange={(e) => setCfg((c) => ({ ...c, model: e.target.value }))}
                placeholder={preset.defaultModel}
                className="w-full p-2 rounded border border-stone-300 font-mono text-sm" />
              {preset.modelExamples.length > 0 && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {preset.modelExamples.map((m) => (
                    <button key={m} onClick={() => setCfg((c) => ({ ...c, model: m }))}
                      className="text-xs px-2 py-1 rounded bg-stone-100 hover:bg-stone-200">{m}</button>
                  ))}
                </div>
              )}
            </div>
            {needsKey && (
              <div className="mt-4">
                <div className="text-sm font-medium mb-2">
                  API Key {preset.signupURL && <a href={preset.signupURL} target="_blank" rel="noreferrer" className="text-xs text-stone-500 font-normal underline">在此申请 →</a>}
                </div>
                <input type="password" value={cfg.apiKey} onChange={(e) => setCfg((c) => ({ ...c, apiKey: e.target.value }))}
                  placeholder={preset.id === 'anthropic' ? 'sk-ant-…' : 'API key'}
                  className="w-full p-2 rounded border border-stone-300 font-mono text-sm" />
              </div>
            )}
          </>
        )}
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-stone-600">取消</button>
          <button onClick={() => onSave(cfg)} disabled={!isCli && (!cfg.apiKey || !cfg.model || (needsBaseURL && !cfg.baseURL))}
            className="px-5 py-2 rounded-md bg-stone-900 text-white disabled:opacity-50">保存</button>
        </div>
      </div>
    </div>
  );
}
