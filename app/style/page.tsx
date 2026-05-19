'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FlowSteps } from '../page';
import { THEMES } from '@/lib/themes';
import type { ThemeId, BriefInput, BrandOverride, Outline, ScriptEntry } from '@/lib/types';

const BRIEF_STORAGE = 'pg_pending_brief';
const OUTLINE_STORAGE = 'pg_pending_outline';
const SCRIPT_STORAGE = 'pg_pending_script';
const BRAND_STORAGE = 'pg_pending_brand';
const THEME_STORAGE = 'pg_pending_theme';
const DENSITY_STORAGE = 'pg_pending_density';
const LLM_STORAGE = 'pg_llm_config';
const DECK_STORAGE = 'pg_last_deck';
const MAX_FILE_BYTES = 3 * 1024 * 1024;

export default function StylePage() {
  const router = useRouter();
  const [brief, setBrief] = useState<BriefInput | null>(null);
  const [outline, setOutline] = useState<Outline | null>(null);
  const [script, setScript] = useState<ScriptEntry[] | null>(null);
  const [theme, setTheme] = useState<ThemeId>('modern-minimal');
  const [density, setDensity] = useState<1 | 2>(1);
  const [brand, setBrand] = useState<BrandOverride | undefined>();
  const [brandDialogOpen, setBrandDialogOpen] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const b = localStorage.getItem(BRIEF_STORAGE);
      const o = localStorage.getItem(OUTLINE_STORAGE);
      const s = localStorage.getItem(SCRIPT_STORAGE);
      if (!b || !o || !s) { router.push('/'); return; }
      setBrief(JSON.parse(b));
      setOutline(JSON.parse(o));
      setScript(JSON.parse(s));
      // 恢复之前选过的
      const t = localStorage.getItem(THEME_STORAGE);
      const d = localStorage.getItem(DENSITY_STORAGE);
      const br = localStorage.getItem(BRAND_STORAGE);
      if (t) setTheme(JSON.parse(t));
      if (d) setDensity(JSON.parse(d));
      if (br) setBrand(JSON.parse(br));
    } catch { router.push('/'); }
  }, [router]);

  function persistTheme(v: ThemeId) { setTheme(v); localStorage.setItem(THEME_STORAGE, JSON.stringify(v)); }
  function persistDensity(v: 1 | 2) { setDensity(v); localStorage.setItem(DENSITY_STORAGE, JSON.stringify(v)); }
  function persistBrand(v: BrandOverride | undefined) {
    setBrand(v);
    if (v) localStorage.setItem(BRAND_STORAGE, JSON.stringify(v));
    else localStorage.removeItem(BRAND_STORAGE);
  }

  async function handleGenerateDeck() {
    if (!brief || !outline || !script) return;
    setError(null);
    setGenerating(true);
    try {
      const llmStr = localStorage.getItem(LLM_STORAGE);
      if (!llmStr) throw new Error('未找到 LLM 配置');
      const llmCfg = JSON.parse(llmStr);
      const { PROVIDER_PRESETS } = await import('@/lib/providers');
      const preset = PROVIDER_PRESETS.find((p) => p.id === llmCfg.presetId);
      if (!preset) throw new Error('Provider 配置失效');

      const briefWithDensity = { ...brief, density };
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brief: briefWithDensity, theme, brand, outline, script,
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
      localStorage.setItem(DECK_STORAGE, JSON.stringify(data.deck));
      router.push('/deck');
    } catch (e) {
      setError(e instanceof Error ? e.message : '生成失败');
    } finally { setGenerating(false); }
  }

  if (!outline) {
    return <main className="min-h-screen flex items-center justify-center text-stone-500">加载中…</main>;
  }

  const totalSlides = density === 1 ? outline.sections.length : outline.sections.length * 2;

  return (
    <main className="min-h-screen px-6 py-10 sm:px-12 lg:px-16 max-w-6xl mx-auto pb-24">
      <header className="mb-6 flex items-baseline justify-between gap-4">
        <Link href="/script" className="text-sm text-stone-600 hover:text-stone-900">← 返回讲稿</Link>
        <div className="text-right">
          <div className="text-xs uppercase tracking-[0.2em] text-stone-500">STEP 4 / 4 · 选风格</div>
          <h1 className="text-2xl font-bold mt-1">视觉风格 + 密度</h1>
        </div>
      </header>

      <FlowSteps current={4} />

      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-4">视觉风格</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Object.values(THEMES).map((th) => {
            const active = theme === th.id;
            return (
              <button key={th.id} type="button" onClick={() => persistTheme(th.id)}
                className={`text-left p-4 rounded-lg border transition relative overflow-hidden ${active ? 'border-stone-900 ring-2 ring-stone-900' : 'border-stone-200 hover:border-stone-400'}`}
                style={{ background: th.bg, color: th.text }}>
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
        <div className="mt-3">
          <button onClick={() => setBrandDialogOpen(true)}
            className={`w-full text-left p-4 rounded-lg border-2 border-dashed ${brand ? 'border-stone-900 bg-stone-100' : 'border-stone-300 hover:border-stone-500'}`}>
            <div className="text-xs uppercase tracking-wider font-semibold text-stone-500">CUSTOM BRAND</div>
            <div className="text-base font-bold mt-1">定制 — 上传 Logo / 底图 / 自定义主色</div>
            <div className="text-xs mt-1 text-stone-500">
              {brand ? '已配置 · 点击修改' : '在基础主题之上叠加品牌元素，适合企业 / 个人 IP'}
            </div>
          </button>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold mb-4">PPT 密度</h2>
        <div className="grid grid-cols-2 gap-3">
          {([
            { v: 1 as const, label: '每分钟 1 张', sub: `约 ${outline.sections.length} 张 · 慢节奏 · 深度型` },
            { v: 2 as const, label: '每分钟 2 张', sub: `约 ${outline.sections.length * 2} 张 · 快节奏 · 发布型（每节大纲拆 2 张）` },
          ]).map((opt) => (
            <button key={opt.v} onClick={() => persistDensity(opt.v)}
              className={`text-left p-4 rounded-md border ${density === opt.v ? 'border-stone-900 ring-2 ring-stone-900 bg-stone-900 text-white' : 'border-stone-300 hover:border-stone-500 bg-white'}`}>
              <div className="font-bold">{opt.label}</div>
              <div className={`text-xs mt-1 ${density === opt.v ? 'text-stone-300' : 'text-stone-500'}`}>{opt.sub}</div>
            </button>
          ))}
        </div>
        <div className="mt-3 text-xs text-stone-500">
          预计生成 <strong>{totalSlides} 张</strong> 幻灯片
        </div>
      </section>

      <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-200 px-6 py-3 flex items-center justify-between gap-4 z-30">
        <div className="text-sm text-stone-600">
          {generating ? '生成完整 PPT 中（约 60 秒）…' : '一切就绪 → 生成最终 PPT'}
        </div>
        <div className="flex items-center gap-3">
          {error && <div className="text-sm text-red-600 max-w-md truncate">{error}</div>}
          <Link href="/script" className="text-sm text-stone-600 hover:underline">← 改讲稿</Link>
          <button onClick={handleGenerateDeck} disabled={generating}
            className="px-6 py-2.5 rounded-md bg-stone-900 text-white font-semibold disabled:opacity-50">
            {generating ? '生成中…' : `✨ 生成 ${totalSlides} 张 PPT →`}
          </button>
        </div>
      </footer>

      {brandDialogOpen && (
        <BrandDialog initial={brand} onClose={() => setBrandDialogOpen(false)}
          onSave={(b) => { persistBrand(b); setBrandDialogOpen(false); }} />
      )}
    </main>
  );
}

function BrandDialog({ initial, onClose, onSave }: {
  initial: BrandOverride | undefined;
  onClose: () => void; onSave: (b: BrandOverride | undefined) => void;
}) {
  const [accent, setAccent] = useState(initial?.accent ?? '');
  const [brandName, setBrandName] = useState(initial?.brandName ?? '');
  const [logoDataUrl, setLogoDataUrl] = useState<string | undefined>(initial?.logoDataUrl);
  const [bgDataUrl, setBgDataUrl] = useState<string | undefined>(initial?.bgImageDataUrl);
  const [logoPlacement, setLogoPlacement] = useState<NonNullable<BrandOverride['logoPlacement']>>(initial?.logoPlacement ?? 'all-corners');
  const [error, setError] = useState<string | null>(null);

  function handleFile(f: File, setter: (v: string) => void) {
    if (f.size > MAX_FILE_BYTES) { setError('文件过大（>3MB）'); return; }
    const reader = new FileReader();
    reader.onload = () => { setter(reader.result as string); setError(null); };
    reader.readAsDataURL(f);
  }
  function handleSave() {
    const next: BrandOverride = {
      accent: accent || undefined, brandName: brandName.trim() || undefined,
      logoDataUrl, bgImageDataUrl: bgDataUrl, logoPlacement,
    };
    const hasAny = next.accent || next.logoDataUrl || next.bgImageDataUrl || next.brandName;
    onSave(hasAny ? next : undefined);
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold">定制品牌</h3>
        <p className="text-sm text-stone-600 mt-2">叠加在基础主题之上。所有文件仅存浏览器，不上传服务器。</p>
        <div className="mt-4">
          <div className="text-sm font-medium mb-1">品牌 / 个人名（可选）</div>
          <input value={brandName} onChange={(e) => setBrandName(e.target.value)} placeholder="例：Acme · 2026 年终发布会"
            className="w-full p-2 rounded border border-stone-300 text-sm" />
        </div>
        <div className="mt-4">
          <div className="text-sm font-medium mb-1">Logo（PNG/SVG，≤3MB）</div>
          <div className="flex items-center gap-3 flex-wrap">
            <input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], setLogoDataUrl)} className="text-sm" />
            {logoDataUrl && (<>
              <div className="bg-stone-100 p-2 rounded border" style={{ width: 80, height: 50, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={logoDataUrl} alt="" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
              </div>
              <button onClick={() => setLogoDataUrl(undefined)} className="text-xs text-stone-600 underline">移除</button>
            </>)}
          </div>
          {logoDataUrl && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {([
                { v: 'cover-only' as const, l: '只在封面' },
                { v: 'all-corners' as const, l: '封面大 + 其他角标' },
                { v: 'footer-right' as const, l: '页脚右下' },
                { v: 'none' as const, l: '不显示' },
              ]).map((o) => (
                <button key={o.v} onClick={() => setLogoPlacement(o.v)}
                  className={`text-xs px-3 py-1.5 rounded border ${logoPlacement === o.v ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-300'}`}>{o.l}</button>
              ))}
            </div>
          )}
        </div>
        <div className="mt-4">
          <div className="text-sm font-medium mb-1">底图（≤3MB）</div>
          <div className="flex items-center gap-3 flex-wrap">
            <input type="file" accept="image/png,image/jpeg,image/webp"
              onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0], setBgDataUrl)} className="text-sm" />
            {bgDataUrl && (<>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bgDataUrl} alt="" style={{ width: 100, height: 56, objectFit: 'cover', borderRadius: 4, border: '1px solid #e5e5e5' }} />
              <button onClick={() => setBgDataUrl(undefined)} className="text-xs text-stone-600 underline">移除</button>
            </>)}
          </div>
        </div>
        <div className="mt-4">
          <div className="text-sm font-medium mb-1">自定义主色 accent（可选）</div>
          <div className="flex items-center gap-3">
            <input type="color" value={accent || '#7c3aed'} onChange={(e) => setAccent(e.target.value)}
              className="w-12 h-10 rounded border border-stone-300 cursor-pointer" />
            <input value={accent} onChange={(e) => setAccent(e.target.value)} placeholder="#7c3aed (留空=用主题默认)"
              className="flex-1 p-2 rounded border border-stone-300 font-mono text-sm" />
          </div>
        </div>
        {error && <div className="mt-3 text-sm text-red-600">{error}</div>}
        <div className="flex gap-3 mt-6 justify-between">
          <button onClick={() => onSave(undefined)} className="text-sm text-stone-500 underline">完全清空</button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-4 py-2 text-stone-600">取消</button>
            <button onClick={handleSave} className="px-5 py-2 rounded-md bg-stone-900 text-white">保存</button>
          </div>
        </div>
      </div>
    </div>
  );
}
