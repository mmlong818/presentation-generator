'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { THEMES } from '@/lib/themes';
import { PROVIDER_PRESETS } from '@/lib/providers';
import type { ThemeId, BriefInput, BrandOverride } from '@/lib/types';

const LLM_STORAGE = 'pg_llm_config';
const DECK_STORAGE = 'pg_last_deck';

interface LLMConfig {
  presetId: string;
  model: string;
  apiKey: string;
  baseURL: string;
}

const DEFAULT_LLM: LLMConfig = { presetId: 'anthropic', model: 'claude-sonnet-4-5', apiKey: '', baseURL: '' };

export default function Home() {
  const router = useRouter();
  const [theme, setTheme] = useState<ThemeId>('soft-warm');
  const [brand, setBrand] = useState<BrandOverride | undefined>(undefined);
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [topic, setTopic] = useState('');
  const [audience, setAudience] = useState('');
  const [goal, setGoal] = useState('');
  const [duration, setDuration] = useState(15);
  const [density, setDensity] = useState<1 | 2>(1);
  const [notes, setNotes] = useState('');
  const [llm, setLlm] = useState<LLMConfig>(DEFAULT_LLM);
  const [llmDialogOpen, setLlmDialogOpen] = useState(false);
  const [isLocal, setIsLocal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<{
    preview?: string; hint?: string; raw_length?: number;
    first_attempt_preview?: string; first_attempt_length?: number;
    provider?: string; model?: string;
  } | null>(null);

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(LLM_STORAGE) : null;
    if (saved) {
      try { setLlm({ ...DEFAULT_LLM, ...JSON.parse(saved) }); } catch {}
    }
    fetch('/api/generate').then((r) => r.json()).then((d) => setIsLocal(!!d.local)).catch(() => {});
  }, []);

  function persistLlm(next: LLMConfig) {
    setLlm(next);
    if (typeof window !== 'undefined') localStorage.setItem(LLM_STORAGE, JSON.stringify(next));
  }

  const preset = PROVIDER_PRESETS.find((p) => p.id === llm.presetId);
  const llmReady = llm.presetId === 'claude-cli' ? isLocal : !!llm.apiKey && !!llm.model;

  async function handleGenerate() {
    setError(null);
    setErrorDetails(null);
    if (!topic.trim() || !audience.trim() || !goal.trim()) {
      setError('请把主题、听众、目标都填上。');
      return;
    }
    if (!llmReady) { setLlmDialogOpen(true); return; }
    if (!preset) { setError('未知 provider'); return; }

    setLoading(true);
    try {
      const brief: BriefInput = {
        topic: topic.trim(), audience: audience.trim(), goal: goal.trim(),
        durationMin: duration, density,
        notes: notes.trim() || undefined,
      };
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief,
          theme,
          brand,
          llm: {
            provider: preset.provider,
            model: llm.model || preset.defaultModel,
            apiKey: preset.provider === 'claude-cli' ? undefined : llm.apiKey,
            baseURL: preset.provider === 'openai-compat' ? (llm.baseURL || preset.baseURL) : undefined,
          },
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'unknown' }));
        setErrorDetails({
          preview: err.raw_preview,
          hint: err.hint,
          raw_length: err.raw_length,
          first_attempt_preview: err.first_attempt_preview,
          first_attempt_length: err.first_attempt_length,
          provider: err.provider,
          model: err.model,
        });
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const data = await res.json();
      sessionStorage.setItem(DECK_STORAGE, JSON.stringify(data.deck));
      router.push('/deck');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '生成失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-6 py-12 sm:px-12 lg:px-20 max-w-6xl mx-auto w-full">
      <header className="mb-14 flex items-start justify-between gap-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-stone-500 font-medium">A TALK CRAFTSMAN</div>
          <h1 className="text-4xl sm:text-5xl font-bold mt-3 tracking-tight">演讲生成器</h1>
          <p className="text-stone-600 mt-3 text-lg">填一段简介，选一个风格，30 秒后拿到可放映的幻灯片 + 讲稿。</p>
        </div>
        <Link href="/preview" className="text-sm px-4 py-2 rounded border border-stone-300 hover:bg-stone-100 whitespace-nowrap">
          🎨 主题画廊 →
        </Link>
      </header>

      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">1 · 选一种视觉风格</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.values(THEMES).map((th) => {
            const active = theme === th.id;
            return (
              <button
                key={th.id}
                type="button"
                onClick={() => setTheme(th.id)}
                className={`text-left p-4 rounded-lg border transition relative overflow-hidden ${
                  active ? 'border-stone-900 ring-2 ring-stone-900' : 'border-stone-200 hover:border-stone-400'
                }`}
                style={{ background: th.bg, color: th.text }}
              >
                {th.decoration && (
                  <div style={{ position: 'absolute', inset: 0, background: th.decoration, opacity: 0.6, pointerEvents: 'none', ...(th.id === 'risograph' ? { backgroundSize: '14px 14px' } : {}) }} />
                )}
                <div className="relative">
                  <div className="text-xs uppercase tracking-wider font-semibold" style={{ color: th.accent }}>{th.id}</div>
                  <div className="text-base font-bold mt-1" style={{ fontFamily: th.fontDisplay }}>{th.name}</div>
                  <div className="text-xs mt-2 opacity-70 leading-relaxed">{th.description}</div>
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4">
          <button onClick={() => setBrandDialogOpen(true)}
            className={`w-full text-left p-4 rounded-lg border-2 border-dashed transition ${
              brand ? 'border-stone-900 bg-stone-100' : 'border-stone-300 hover:border-stone-500'
            }`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider font-semibold text-stone-500">CUSTOM BRAND</div>
                <div className="text-base font-bold mt-1">定制模式 — 上传 Logo / 底图 / 自定义主色</div>
                <div className="text-xs mt-1 text-stone-500">
                  {brand ? (
                    <span className="text-stone-700">
                      已配置：
                      {brand.logoDataUrl && <span className="mr-3">✓ Logo</span>}
                      {brand.bgImageDataUrl && <span className="mr-3">✓ 底图</span>}
                      {brand.accent && <span className="mr-3">✓ accent {brand.accent}</span>}
                      {brand.brandName && <span className="mr-3">✓ {brand.brandName}</span>}
                    </span>
                  ) : '在上方任一基础主题之上叠加品牌元素，适合企业 / 个人 IP / 品牌发布'}
                </div>
              </div>
              {brand && (
                <button
                  onClick={(e) => { e.stopPropagation(); setBrand(undefined); }}
                  className="text-xs px-2 py-1 rounded border border-stone-300 hover:bg-white">
                  清空
                </button>
              )}
            </div>
          </button>
        </div>
      </section>

      <section className="mb-12 space-y-6">
        <h2 className="text-lg font-semibold">2 · 简介</h2>
        <Field label="主题" hint="一句话概括，越具体越好">
          <input value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="例：AI 时代教育需要重新出生"
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
          <input type="range" min={5} max={60} step={5} value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="w-full" />
        </Field>
        <Field label="PPT 密度" hint="决定 slides 数量 + 讲稿节奏">
          <div className="grid grid-cols-2 gap-3">
            {([
              { v: 1 as const, label: '每分钟 1 张', sub: `约 ${duration} 张 · 每页 ~60 秒讲稿（慢节奏，深度型）` },
              { v: 2 as const, label: '每分钟 2 张', sub: `约 ${duration * 2} 张 · 每页 ~30 秒讲稿（快节奏，发布型）` },
            ]).map((opt) => (
              <button key={opt.v} type="button" onClick={() => setDensity(opt.v)}
                className={`text-left p-3 rounded-md border transition ${density === opt.v ? 'border-stone-900 ring-2 ring-stone-900 bg-stone-900 text-white' : 'border-stone-300 hover:border-stone-500 bg-white'}`}>
                <div className="font-bold text-sm">{opt.label}</div>
                <div className={`text-xs mt-1 ${density === opt.v ? 'text-stone-300' : 'text-stone-500'}`}>{opt.sub}</div>
              </button>
            ))}
          </div>
        </Field>
        <Field label="补充素材（可选）" hint="你有的故事、数据、引言、立场。粘进来，AI 会优先用真实素材">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4}
            placeholder="例：上周一个学生跟我说……（粘真实故事在此处）"
            className="w-full p-3 rounded-md border border-stone-300 bg-white focus:outline-none focus:border-stone-900" />
        </Field>
      </section>

      <section className="mb-12">
        <h2 className="text-lg font-semibold mb-4">3 · 模型设置</h2>
        <button onClick={() => setLlmDialogOpen(true)}
          className={`w-full text-left p-4 rounded-lg border ${llmReady ? 'border-stone-300 bg-white' : 'border-amber-400 bg-amber-50'}`}>
          {llmReady ? (
            <>
              <div className="text-xs uppercase tracking-wider text-stone-500 font-semibold">{preset?.label}</div>
              <div className="text-base font-bold mt-1">{llm.model || preset?.defaultModel || '(未设置)'}</div>
              {llm.presetId === 'claude-cli' ? (
                <div className="text-xs mt-1 text-stone-500">使用本地 Claude CLI 订阅，零 API 费用</div>
              ) : (
                <div className="text-xs mt-1 text-stone-500">key: {llm.apiKey.slice(0, 7)}…{llm.apiKey.slice(-4)}</div>
              )}
            </>
          ) : (
            <div className="text-sm text-amber-900 font-medium">⚠ 点击此处配置模型</div>
          )}
        </button>
      </section>

      <section className="flex items-center gap-4 flex-wrap">
        <button onClick={handleGenerate} disabled={loading}
          className="px-8 py-3 rounded-md bg-stone-900 text-white font-semibold disabled:opacity-50">
          {loading ? '正在生成…（约 30 秒）' : '生成演讲 →'}
        </button>
        {error && (
          <div className="w-full mt-3 p-4 rounded-md border border-red-300 bg-red-50">
            <div className="text-sm text-red-800 font-medium">{error}</div>
            {errorDetails?.hint && (
              <div className="text-xs text-red-700 mt-2 leading-relaxed">💡 {errorDetails.hint}</div>
            )}
            {(errorDetails?.provider || errorDetails?.raw_length !== undefined) && (
              <div className="text-xs text-red-700 mt-2 font-mono">
                provider: {errorDetails.provider} · model: {errorDetails.model} · 末次 raw 长度: {errorDetails.raw_length} · 首次 raw 长度: {errorDetails.first_attempt_length}
              </div>
            )}
            {errorDetails?.first_attempt_preview && (
              <details className="mt-3">
                <summary className="text-xs text-red-700 cursor-pointer underline">查看首次 AI 返回的前 400 字</summary>
                <pre className="mt-2 p-3 bg-white border border-red-200 rounded text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-48 overflow-y-auto">{errorDetails.first_attempt_preview}</pre>
              </details>
            )}
            {errorDetails?.preview && (
              <details className="mt-2">
                <summary className="text-xs text-red-700 cursor-pointer underline">查看末次 AI 返回的前 800 字</summary>
                <pre className="mt-2 p-3 bg-white border border-red-200 rounded text-xs font-mono whitespace-pre-wrap overflow-x-auto max-h-64 overflow-y-auto">{errorDetails.preview}</pre>
              </details>
            )}
          </div>
        )}
      </section>

      <footer className="mt-16 pt-8 border-t border-stone-200 text-xs text-stone-500 leading-relaxed">
        <p>支持 9 种 LLM provider（Claude / GPT / DeepSeek / Kimi / 智谱 / Qwen / OpenRouter / 自定义 / 本地 Claude CLI 订阅）。所有 key 只存浏览器 localStorage。</p>
        <p className="mt-2">设计阶段沿用 presentation-coach 的 6 框架路由 + 5 维自检 + Anti-Slop 规则。版式系统可扩展。</p>
      </footer>

      {llmDialogOpen && (
        <LLMDialog initial={llm} isLocal={isLocal} onClose={() => setLlmDialogOpen(false)}
          onSave={(next) => { persistLlm(next); setLlmDialogOpen(false); }} />
      )}

      {brandDialogOpen && (
        <BrandDialog initial={brand} onClose={() => setBrandDialogOpen(false)}
          onSave={(b) => { setBrand(b); setBrandDialogOpen(false); }} />
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
    setCfg((c) => ({
      presetId: id,
      model: p.defaultModel,
      apiKey: c.apiKey, // 保留旧 key，方便切换
      baseURL: p.baseURL ?? '',
    }));
  }

  const needsKey = preset.provider !== 'claude-cli';
  const needsBaseURL = preset.id === 'custom';
  const isCli = preset.provider === 'claude-cli';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold">配置 LLM</h3>
        <p className="text-sm text-stone-600 mt-2">选 provider，填模型名和 key。所有 key 只存浏览器，不上传任何服务器（除 provider 自己）。</p>

        <div className="mt-5">
          <div className="text-sm font-medium mb-2">Provider</div>
          <div className="grid grid-cols-2 gap-2">
            {presets.map((p) => (
              <button key={p.id} onClick={() => pickPreset(p.id)}
                className={`text-left p-3 rounded border text-sm ${cfg.presetId === p.id ? 'border-stone-900 ring-2 ring-stone-900' : 'border-stone-200'}`}>
                <div className="font-bold">{p.label}</div>
                {p.note && <div className="text-xs text-stone-500 mt-1 leading-relaxed">{p.note}</div>}
              </button>
            ))}
          </div>
        </div>

        {isCli ? (
          <div className="mt-5 p-4 bg-stone-50 rounded text-sm text-stone-700 leading-relaxed">
            <div className="font-semibold mb-2">本地 Claude CLI 模式</div>
            <p>调用本地 <code className="bg-stone-200 px-1 rounded">claude</code> 命令，复用你的 Claude Code 订阅。无需 API key，不消耗 token 额度。</p>
            <p className="mt-2">前置条件：你的电脑安装了 Claude Code 且 <code className="bg-stone-200 px-1 rounded">claude --version</code> 能正常输出。</p>
          </div>
        ) : (
          <>
            {needsBaseURL && (
              <Field2 label="Base URL">
                <input value={cfg.baseURL} onChange={(e) => setCfg((c) => ({ ...c, baseURL: e.target.value }))}
                  placeholder="https://api.example.com/v1"
                  className="w-full p-2 rounded border border-stone-300 font-mono text-sm" />
              </Field2>
            )}
            <Field2 label="模型名" hint={preset.modelExamples.length ? `推荐：${preset.modelExamples.join(' / ')}` : undefined}>
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
            </Field2>
            {needsKey && (
              <Field2 label="API Key" hint={preset.signupURL ? <a href={preset.signupURL} target="_blank" rel="noreferrer" className="underline">在此申请 →</a> : undefined}>
                <input value={cfg.apiKey} onChange={(e) => setCfg((c) => ({ ...c, apiKey: e.target.value }))}
                  placeholder={preset.id === 'anthropic' ? 'sk-ant-…' : preset.id === 'openai' ? 'sk-…' : 'API key'}
                  type="password"
                  className="w-full p-2 rounded border border-stone-300 font-mono text-sm" />
              </Field2>
            )}
          </>
        )}

        <div className="flex gap-3 mt-6 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-stone-600">取消</button>
          <button
            onClick={() => onSave(cfg)}
            disabled={!isCli && (!cfg.apiKey || !cfg.model || (needsBaseURL && !cfg.baseURL))}
            className="px-5 py-2 rounded-md bg-stone-900 text-white disabled:opacity-50">
            保存
          </button>
        </div>
      </div>
    </div>
  );
}

function Field2({ label, hint, children }: { label: string; hint?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mt-4">
      <div className="text-sm font-medium mb-2">
        {label} {hint && <span className="text-stone-500 font-normal text-xs">— {hint}</span>}
      </div>
      {children}
    </div>
  );
}

// ─── Brand 定制弹窗 ──────────────────────────────────────────────────────────
const MAX_FILE_BYTES = 3 * 1024 * 1024; // 3MB 上限

function BrandDialog({ initial, onClose, onSave }: {
  initial: BrandOverride | undefined;
  onClose: () => void;
  onSave: (b: BrandOverride | undefined) => void;
}) {
  const [accent, setAccent] = useState(initial?.accent ?? '');
  const [brandName, setBrandName] = useState(initial?.brandName ?? '');
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(initial?.logoDataUrl);
  const [bgDataUrl, setBgDataUrl] = useState<string | undefined>(initial?.bgImageDataUrl);
  const [logoPlacement, setLogoPlacement] = useState<NonNullable<BrandOverride['logoPlacement']>>(
    initial?.logoPlacement ?? 'all-corners'
  );
  const [error, setError] = useState<string | null>(null);

  function handleFile(f: File, setter: (v: string) => void) {
    if (f.size > MAX_FILE_BYTES) {
      setError(`文件过大（>${(MAX_FILE_BYTES / 1024 / 1024).toFixed(0)}MB），请压缩后重传`);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => { setter(reader.result as string); setError(null); };
    reader.onerror = () => setError('读取失败');
    reader.readAsDataURL(f);
  }

  function handleSave() {
    const next: BrandOverride = {
      accent: accent || undefined,
      brandName: brandName.trim() || undefined,
      logoDataUrl,
      bgImageDataUrl: bgDataUrl,
      logoPlacement,
    };
    const hasAny = next.accent || next.logoDataUrl || next.bgImageDataUrl || next.brandName;
    onSave(hasAny ? next : undefined);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold">定制模式</h3>
        <p className="text-sm text-stone-600 mt-2 leading-relaxed">
          叠加在你选中的基础主题之上。logo / 底图 / 主色都是覆盖项，可以单独使用。
          所有文件**仅存储在浏览器**，不上传任何服务器。
        </p>

        <Field2 label="品牌 / 个人名（可选）" hint="出现在某些版式的副标题位">
          <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="例：Acme · 2026 年终发布会"
            className="w-full p-2 rounded border border-stone-300 text-sm" />
        </Field2>

        <Field2 label="Logo 图片（可选）" hint="PNG / SVG，建议透明底，≤3MB">
          <div className="flex items-center gap-3 flex-wrap">
            <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], setLogoDataUrl)}
              className="text-sm" />
            {logoDataUrl && (
              <>
                <div className="bg-stone-100 p-2 rounded border" style={{ width: 80, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={logoDataUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                </div>
                <button onClick={() => setLogoDataUrl(undefined)} className="text-xs text-stone-600 underline">移除</button>
              </>
            )}
          </div>
          {logoDataUrl && (
            <div className="mt-3">
              <div className="text-xs text-stone-600 mb-2">Logo 显示位置：</div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { v: 'cover-only' as const, label: '只在封面' },
                  { v: 'all-corners' as const, label: '封面大 + 其他角标' },
                  { v: 'footer-right' as const, label: '页脚右下' },
                  { v: 'none' as const, label: '不显示（仅留品牌名）' },
                ].map((opt) => (
                  <button key={opt.v} onClick={() => setLogoPlacement(opt.v)}
                    className={`text-xs px-3 py-1.5 rounded border ${logoPlacement === opt.v ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300'}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </Field2>

        <Field2 label="底图（可选）" hint="JPG / PNG / WebP，会与主题色半透明融合，≤3MB">
          <div className="flex items-center gap-3 flex-wrap">
            <input type="file" accept="image/png,image/jpeg,image/webp"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], setBgDataUrl)}
              className="text-sm" />
            {bgDataUrl && (
              <>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={bgDataUrl} alt="" style={{ width: 100, height: 56, objectFit: 'cover', borderRadius: 4, border: '1px solid #e5e5e5' }} />
                <button onClick={() => setBgDataUrl(undefined)} className="text-xs text-stone-600 underline">移除</button>
              </>
            )}
          </div>
        </Field2>

        <Field2 label="自定义主色 accent（可选）" hint="覆盖基础主题的 accent">
          <div className="flex items-center gap-3">
            <input type="color" value={accent || '#7c3aed'} onChange={(e) => setAccent(e.target.value)}
              className="w-12 h-10 rounded border border-stone-300 cursor-pointer" />
            <input type="text" value={accent} onChange={(e) => setAccent(e.target.value)} placeholder="#7c3aed (留空=用主题默认)"
              className="flex-1 p-2 rounded border border-stone-300 font-mono text-sm" />
            {accent && <button onClick={() => setAccent('')} className="text-xs text-stone-600 underline">清空</button>}
          </div>
        </Field2>

        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}

        <div className="flex gap-3 mt-6 justify-between items-center">
          <button onClick={() => onSave(undefined)} className="text-sm text-stone-500 underline">
            完全清空 / 不使用
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-stone-600">取消</button>
            <button onClick={handleSave} className="px-5 py-2 rounded-md bg-stone-900 text-white">保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}
