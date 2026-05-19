'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { THEMES } from '@/lib/themes';
import { PROVIDER_PRESETS } from '@/lib/providers';
import type { ThemeId, Deck } from '@/lib/types';

const LLM_STORAGE = 'pg_llm_config';
const DECK_STORAGE = 'pg_last_deck';
const HISTORY_KEY = 'pg_deck_history';
const HISTORY_MAX = 20;

interface LLMConfig {
  presetId: string; model: string; apiKey: string; baseURL: string;
}
const DEFAULT_LLM: LLMConfig = { presetId: 'anthropic', model: 'claude-sonnet-4-6', apiKey: '', baseURL: '' };

const THEMES_LIST = Object.values(THEMES);

function pushToHistory(deck: Deck) {
  try {
    const list: { id: string; deck: Deck }[] = JSON.parse(localStorage.getItem(HISTORY_KEY) ?? '[]');
    const filtered = list.filter((x) => x.deck.createdAt !== deck.createdAt);
    filtered.unshift({ id: crypto.randomUUID(), deck });
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered.slice(0, HISTORY_MAX)));
  } catch {}
}

export default function QuickPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState<ThemeId>('modern-minimal');
  const [llm, setLlm] = useState<LLMConfig>(DEFAULT_LLM);
  const [llmDialogOpen, setLlmDialogOpen] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorHint, setErrorHint] = useState<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(LLM_STORAGE);
    if (saved) { try { setLlm({ ...DEFAULT_LLM, ...JSON.parse(saved) }); } catch {} }
    fetch('/api/generate').then((r) => r.json()).then((d) => setIsLocal(!!d.local)).catch(() => {});
  }, []);

  function persistLlm(next: LLMConfig) {
    setLlm(next);
    localStorage.setItem(LLM_STORAGE, JSON.stringify(next));
  }

  const preset = PROVIDER_PRESETS.find((p) => p.id === llm.presetId);
  const llmReady = llm.presetId === 'claude-cli' ? isLocal : !!llm.apiKey && !!llm.model;

  async function handleGenerate() {
    setError(null); setErrorHint(null);
    if (!text.trim()) { setError('请先输入 PPT 描述'); return; }
    if (!llmReady) { setLlmDialogOpen(true); return; }

    setLoading(true);
    try {
      const res = await fetch('/api/quick', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim(),
          title: title.trim() || undefined,
          theme,
          llm: {
            provider: preset!.provider,
            model: llm.model || preset!.defaultModel,
            apiKey: preset!.provider === 'claude-cli' ? undefined : llm.apiKey,
            baseURL: preset!.provider === 'openai-compat' ? (llm.baseURL || preset!.baseURL) : undefined,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || `HTTP ${res.status}`);
        setErrorHint(data.hint || null);
        return;
      }

      const deck: Deck = data.deck;
      localStorage.setItem(DECK_STORAGE, JSON.stringify(deck));
      pushToHistory(deck);
      router.push('/deck');
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败');
    } finally {
      setLoading(false);
    }
  }

  const t = THEMES[theme];

  return (
    <main className="min-h-screen px-6 py-12 sm:px-12 lg:px-20 max-w-4xl mx-auto w-full">
      <header className="mb-10 flex items-start justify-between gap-6">
        <div>
          <Link href="/" className="text-xs text-stone-500 hover:text-stone-800">← 返回主页</Link>
          <h1 className="text-4xl sm:text-5xl font-bold mt-3 tracking-tight">快速直出</h1>
          <p className="text-stone-600 mt-2 text-lg">写好描述，一键生成 PPT。跳过大纲和讲稿。</p>
        </div>
      </header>

      <section className="space-y-6">
        {/* 标题（可选） */}
        <div>
          <label className="block text-sm font-medium mb-2">演示标题 <span className="text-stone-400 font-normal">— 可留空，AI 自动推断</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="例：2026 Q1 业务回顾"
            className="w-full p-3 rounded-md border border-stone-300 bg-white focus:outline-none focus:border-stone-900" />
        </div>

        {/* 主描述框 */}
        <div>
          <label className="block text-sm font-medium mb-2">
            PPT 内容描述
            <span className="text-stone-400 font-normal ml-2">— 按页描述，或整体描述都可以</span>
          </label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={14}
            placeholder={`示例：

第1页：封面，标题"AI 时代的产品增长"，副标题"2026 年度战略分享"

第2页：三个核心数字——日活 240万、GMV 18亿、NPS 62

第3页：我们面临的挑战：获客成本同比上涨 18%，留存率下滑 1.2pt，竞争格局加剧

第4页：三步策略：精细化运营 → 产品体验升级 → 生态合作拓展

第5页：CTA，号召听众加入下季度增长讨论`}
            className="w-full p-4 rounded-md border border-stone-300 bg-white focus:outline-none focus:border-stone-900 font-mono text-sm leading-relaxed resize-y"
          />
        </div>

        {/* 主题选择 */}
        <div>
          <label className="block text-sm font-medium mb-3">主题</label>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {THEMES_LIST.map((th) => (
              <button key={th.id} onClick={() => setTheme(th.id)}
                title={`${th.name} · ${th.description}`}
                className={`relative overflow-hidden rounded-md px-3 py-2 text-left transition border text-xs ${theme === th.id ? 'ring-2 ring-stone-900 border-stone-900' : 'border-stone-200 hover:border-stone-400'}`}
                style={{ background: th.bg, color: th.text }}>
                {th.decoration && (
                  <div style={{ position: 'absolute', inset: 0, background: th.decoration, opacity: 0.4, pointerEvents: 'none' }} />
                )}
                <span className="relative block font-semibold truncate" style={{ fontFamily: th.fontDisplay }}>{th.name}</span>
                <span className="relative block truncate opacity-60" style={{ color: th.muted }}>{th.mode}</span>
              </button>
            ))}
          </div>
          <div className="mt-2 text-xs text-stone-500">
            当前：<code className="bg-stone-100 px-1.5 py-0.5 rounded">{theme}</code> · {t.name} · {t.description}
          </div>
        </div>

        {/* LLM 配置 */}
        <div>
          <label className="block text-sm font-medium mb-2">模型</label>
          <button onClick={() => setLlmDialogOpen(true)}
            className={`w-full text-left p-4 rounded-lg border ${llmReady ? 'border-stone-300 bg-white' : 'border-amber-400 bg-amber-50'}`}>
            {llmReady ? (
              <>
                <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold">{preset?.label}</div>
                <div className="text-base font-bold mt-1">{llm.model || preset?.defaultModel}</div>
                {llm.presetId === 'claude-cli'
                  ? <div className="text-xs mt-1 text-stone-500">使用本地 Claude CLI 订阅</div>
                  : <div className="text-xs mt-1 text-stone-500">key: {llm.apiKey.slice(0, 7)}…{llm.apiKey.slice(-4)}</div>}
              </>
            ) : (
              <div className="text-sm text-amber-900 font-medium">⚠ 点击此处配置模型</div>
            )}
          </button>
        </div>
      </section>

      {/* 生成按钮 */}
      <div className="mt-8">
        <button onClick={handleGenerate} disabled={loading}
          className="px-10 py-3 rounded-md bg-stone-900 text-white font-semibold text-base disabled:opacity-50">
          {loading ? '生成中…' : '生成 PPT →'}
        </button>
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-md border border-red-300 bg-red-50">
          <div className="text-sm text-red-800 font-medium">{error}</div>
          {errorHint && <div className="text-xs text-red-700 mt-1">💡 {errorHint}</div>}
        </div>
      )}

      {llmDialogOpen && (
        <LLMDialog initial={llm} isLocal={isLocal}
          onClose={() => setLlmDialogOpen(false)}
          onSave={(next) => { persistLlm(next); setLlmDialogOpen(false); }} />
      )}
    </main>
  );
}

function LLMDialog({ initial, isLocal, onClose, onSave }: {
  initial: LLMConfig; isLocal: boolean;
  onClose: () => void; onSave: (next: LLMConfig) => void;
}) {
  const [cfg, setCfg] = useState<LLMConfig>(initial);
  const presets = PROVIDER_PRESETS.filter((p) => isLocal || !p.localOnly);
  const preset = presets.find((p) => p.id === cfg.presetId) ?? presets[0];

  function pickPreset(id: string) {
    const p = presets.find((x) => x.id === id);
    if (!p) return;
    setCfg((c) => ({ presetId: id, model: p.defaultModel, apiKey: c.apiKey, baseURL: p.baseURL ?? '' }));
  }

  const isCli = preset.provider === 'claude-cli';
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
              <div className="text-sm font-medium mb-2">
                模型名 {preset.modelExamples.length > 0 && <span className="text-stone-500 font-normal text-xs">— 推荐：{preset.modelExamples.join(' / ')}</span>}
              </div>
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
            <div className="mt-4">
              <div className="text-sm font-medium mb-2">
                API Key {preset.signupURL && <a href={preset.signupURL} target="_blank" rel="noreferrer" className="text-xs text-stone-500 font-normal underline">在此申请 →</a>}
              </div>
              <input type="password" value={cfg.apiKey} onChange={(e) => setCfg((c) => ({ ...c, apiKey: e.target.value }))}
                placeholder={preset.id === 'anthropic' ? 'sk-ant-…' : 'API key'}
                className="w-full p-2 rounded border border-stone-300 font-mono text-sm" />
            </div>
          </>
        )}
        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-stone-600">取消</button>
          <button onClick={() => onSave(cfg)}
            disabled={!isCli && (!cfg.apiKey || !cfg.model || (needsBaseURL && !cfg.baseURL))}
            className="px-5 py-2 rounded-md bg-stone-900 text-white disabled:opacity-50">保存</button>
        </div>
      </div>
    </div>
  );
}
