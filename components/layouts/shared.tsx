// ─── 版式组件共享：fill / Eyebrow / Footer / 高亮辅助 ────────────────────────
import type { CSSProperties, ReactNode } from 'react';
import type { ThemeTokens } from '@/lib/themes';
import type { BrandOverride } from '@/lib/types';

export const fillStyle = (t: ThemeTokens): CSSProperties => ({
  width: '100%',
  height: '100%',
  // 背景由外层 SlideRenderer wrapper 提供（以便 decoration / brand 底图能渲染在内容下面）
  background: 'transparent',
  color: t.text,
  fontFamily: t.fontBody,
  position: 'relative',
  overflow: 'hidden',
  letterSpacing: '-0.005em',
  zIndex: 1,
});

// ─── Eyebrow：11 种样式分支 ──────────────────────────────────────────────────

export function Eyebrow({ children, t }: { children: ReactNode; t: ThemeTokens }) {
  const base: CSSProperties = {
    fontSize: 22,
    color: t.accent,
    fontWeight: 600,
    fontFamily: t.fontEyebrowSerif ?? t.fontDisplay,
    display: 'inline-block',
  };

  switch (t.eyebrowStyle) {
    case 'rule-top':
      return (
        <div style={{ display: 'inline-block', borderTop: `${t.borderWeight}px solid ${t.rule}`, paddingTop: 16, minWidth: 200 }}>
          <div style={{ ...base, textTransform: 'uppercase', letterSpacing: '0.18em' }}>{children}</div>
        </div>
      );
    case 'underline':
      return <div style={{ ...base, textTransform: 'uppercase', letterSpacing: '0.18em', borderBottom: `${t.borderWeight}px solid ${t.rule}`, paddingBottom: 8 }}>{children}</div>;
    case 'mono-prefix':
      return (
        <div style={{ ...base, fontFamily: t.fontMono, textTransform: 'none', letterSpacing: '0.04em', fontSize: 20, color: t.accent }}>
          &gt; {children}
        </div>
      );
    case 'caps-tracking':
      return (
        <div style={{ ...base, textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 500, fontSize: 20, color: t.muted }}>
          {children}
        </div>
      );
    case 'serif-italic':
      return (
        <div style={{ ...base, fontStyle: 'italic', fontWeight: 400, fontSize: 24, color: t.accent, textTransform: 'none' }}>
          {children}
        </div>
      );
    case 'caps-bold':
      return (
        <div style={{ ...base, textTransform: 'uppercase', fontWeight: 900, fontSize: 24, color: t.text, letterSpacing: 0 }}>
          {children}
        </div>
      );
    case 'numbered':
      return (
        <div style={{ ...base, fontFamily: t.fontDisplay, fontStyle: 'italic', fontSize: 22, color: t.muted, fontWeight: 400 }}>
          § {children}
        </div>
      );
    case 'tag-block':
      return (
        <div style={{
          background: t.accent, color: t.bg, padding: '6px 14px',
          fontSize: 18, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em',
          display: 'inline-block',
        }}>
          {children}
        </div>
      );
    case 'live-marker':
      return (
        <div style={{ ...base, fontFamily: t.fontMono, fontSize: 20, color: t.accent2 ?? t.danger ?? t.accent, textTransform: 'uppercase', letterSpacing: '0.15em', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 14, height: 14, borderRadius: '50%', background: t.accent2 ?? t.danger ?? t.accent, display: 'inline-block' }} />
          {children}
        </div>
      );
    case 'gold-thin':
      return (
        <div style={{ ...base, fontWeight: 300, fontSize: 22, color: t.accent, textTransform: 'uppercase', letterSpacing: '0.22em' }}>
          {children}
        </div>
      );
    case 'circle-handwritten':
      return (
        <div style={{
          ...base,
          fontStyle: 'italic', fontWeight: 500, fontSize: 24, color: t.accent,
          textTransform: 'none',
          textDecoration: 'underline wavy',
          textUnderlineOffset: '8px',
          textDecorationThickness: '2px',
        }}>
          {children}
        </div>
      );
    case 'plain':
    default:
      return <div style={base}>{children}</div>;
  }
}

// ─── Footer ─────────────────────────────────────────────────────────────────

export function Footer({ n, total, t }: { n: number; total: number; t: ThemeTokens }) {
  if (!t.showFooter) return null;

  // brutalist-mono：粗体大号页码
  if (t.id === 'brutalist-mono') {
    return (
      <>
        <div style={{
          position: 'absolute', left: t.padding * 0.6, bottom: 60,
          fontSize: 32, color: t.text, fontWeight: 900, fontFamily: t.fontDisplay,
        }}>
          {String(n).padStart(2, '0')}/{String(total).padStart(2, '0')}
        </div>
      </>
    );
  }

  // 默认（editorial / academic / risograph 大概率）
  return (
    <>
      <div style={{
        position: 'absolute', left: t.padding * 0.6, bottom: 60,
        fontSize: 18, color: t.muted, letterSpacing: '0.1em',
        fontFamily: t.fontEyebrowSerif ?? t.fontDisplay,
      }}>
        {String(n).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>
      <div style={{
        position: 'absolute', right: t.padding * 0.6, bottom: 60,
        fontSize: 18, color: t.muted, letterSpacing: '0.18em',
        fontFamily: t.fontEyebrowSerif ?? t.fontDisplay, textTransform: 'uppercase',
      }}>
        A Talk
      </div>
    </>
  );
}

// ─── 主题级 chrome：Editorial 全局顶部刊头线 ─────────────────────────────────
export function EditorialMasthead({ t, n, total, deckTitle }: {
  t: ThemeTokens; n: number; total: number; deckTitle?: string;
}) {
  if (t.id !== 'editorial-monocle') return null;
  return (
    <>
      {/* 1px 黑色刊头线 */}
      <div style={{
        position: 'absolute', top: 60, left: t.padding * 0.6, right: t.padding * 0.6,
        height: 1, background: t.rule, zIndex: 5, pointerEvents: 'none',
      }} />
      {/* 顶部刊头：左侧 deck 标题 / 右侧页码 */}
      <div style={{
        position: 'absolute', top: 28, left: t.padding * 0.6, right: t.padding * 0.6,
        display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
        fontSize: 16, color: t.muted, fontFamily: t.fontEyebrowSerif ?? t.fontDisplay,
        fontStyle: 'italic', letterSpacing: '0.05em', zIndex: 5, pointerEvents: 'none',
      }}>
        <span>{deckTitle ?? 'A Talk'}</span>
        <span>No. {String(n).padStart(2, '0')}</span>
      </div>
    </>
  );
}

// ─── 装饰层 ─────────────────────────────────────────────────────────────────

export function Decoration({ t, bgImageDataUrl }: { t: ThemeTokens; bgImageDataUrl?: string }) {
  if (bgImageDataUrl) {
    return (
      <>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: `url(${bgImageDataUrl}) center/cover no-repeat`,
        }} />
        <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: t.bg, opacity: 0.6 }} />
      </>
    );
  }
  // ─── pastel-bauhaus：3 个几何拼贴形 ────────────────────────────────────────
  if (t.id === 'pastel-bauhaus') {
    return (
      <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', width: '100%', height: '100%' }}
           viewBox="0 0 1920 1080" preserveAspectRatio="none">
        <circle cx="220" cy="900" r="280" fill="#ffd1a4" style={{ mixBlendMode: 'multiply' }} opacity="0.85" />
        <polygon points="1620,80 1900,80 1760,420" fill="#a4d8e8" style={{ mixBlendMode: 'multiply' }} opacity="0.85" />
        <rect x="1500" y="700" width="320" height="320" fill="#f4b8c4" style={{ mixBlendMode: 'multiply' }} opacity="0.85" />
        <circle cx="1100" cy="180" r="120" fill="#c8e0a4" style={{ mixBlendMode: 'multiply' }} opacity="0.7" />
      </svg>
    );
  }

  // ─── summer-cocktail：4 个大色斑 blur ───────────────────────────────────────
  if (t.id === 'summer-cocktail') {
    return (
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        {[
          { c: '#ff5a8a', x: '10%', y: '15%', s: 380 },
          { c: '#ffb85a', x: '82%', y: '20%', s: 340 },
          { c: '#c5b8ff', x: '20%', y: '78%', s: 360 },
          { c: '#2a9a7a', x: '75%', y: '82%', s: 320 },
        ].map((b, i) => (
          <div key={i} style={{
            position: 'absolute', left: b.x, top: b.y, width: b.s, height: b.s,
            background: b.c, borderRadius: '50%',
            filter: 'blur(80px)', opacity: 0.55, mixBlendMode: 'multiply',
          }} />
        ))}
      </div>
    );
  }

  // ─── pop-magazine：左右两侧 60px 撞色条纹 ─────────────────────────────────
  if (t.id === 'pop-magazine') {
    const stripe = (side: 'left' | 'right') => (
      <div style={{
        position: 'absolute', top: 0, bottom: 0, [side]: 0, width: 60,
        display: 'flex', flexDirection: 'column', pointerEvents: 'none',
      }}>
        {['#ff3a5a','#ffd13a','#1a1a1a','#3a8aff','#2eb56a'].map((c, i) => (
          <div key={i} style={{ flex: 1, background: c }} />
        ))}
      </div>
    );
    return (
      <>
        {stripe('left')}
        {stripe('right')}
      </>
    );
  }

  if (!t.decoration) return null;
  if (t.id === 'risograph') {
    return (
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        backgroundImage: t.decoration,
        backgroundSize: '14px 14px',
        opacity: 0.6,
      }} />
    );
  }
  return (
    <div style={{
      position: 'absolute', inset: 0, pointerEvents: 'none',
      background: t.decoration,
    }} />
  );
}

// ─── 玻璃质感卡片 style ──────────────────────────────────────────────────────

export function glassCardStyle(t: ThemeTokens): CSSProperties {
  if (!t.glass) return {};
  return {
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    background: t.paper,
    border: `1px solid ${t.border}`,
    boxShadow: '0 8px 32px rgba(0,0,0,0.08)',
  };
}

// ─── HUD Chrome（broadcast-hud 主题专用：四角取景器 + 顶底安全条）───────────

export function HUDChrome({ t, n, total, deckTitle }: { t: ThemeTokens; n: number; total: number; deckTitle?: string }) {
  if (!t.hudChrome) return null;
  const corner: CSSProperties = {
    position: 'absolute', width: 32, height: 32, borderColor: 'rgba(255,255,255,0.6)', borderStyle: 'solid', borderWidth: 0,
    pointerEvents: 'none', zIndex: 10,
  };
  return (
    <>
      {/* 四角 L 形取景器 */}
      <div style={{ ...corner, top: 32, left: 32, borderTopWidth: 2, borderLeftWidth: 2 }} />
      <div style={{ ...corner, top: 32, right: 32, borderTopWidth: 2, borderRightWidth: 2 }} />
      <div style={{ ...corner, bottom: 32, left: 32, borderBottomWidth: 2, borderLeftWidth: 2 }} />
      <div style={{ ...corner, bottom: 32, right: 32, borderBottomWidth: 2, borderRightWidth: 2 }} />
      {/* 顶部安全条 */}
      <div style={{
        position: 'absolute', top: 32, left: 80, right: 80, height: 36,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: t.fontMono, fontSize: 18, color: 'rgba(255,255,255,0.7)',
        textTransform: 'uppercase', letterSpacing: '0.2em', zIndex: 10, pointerEvents: 'none',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ width: 10, height: 10, background: t.accent2 ?? t.danger, borderRadius: '50%' }} />
          LIVE
        </div>
        <div style={{ flex: 1, textAlign: 'center', fontFamily: t.fontDisplay, textTransform: 'none', letterSpacing: '-0.01em' }}>
          {deckTitle && <span style={{ color: 'rgba(255,255,255,0.85)' }}>{deckTitle}</span>}
        </div>
        <div>{String(n).padStart(2, '0')} / {String(total).padStart(2, '0')}</div>
      </div>
      {/* 底部安全条 */}
      <div style={{
        position: 'absolute', bottom: 32, left: 80, right: 80, height: 24,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        fontFamily: t.fontMono, fontSize: 14, color: 'rgba(255,255,255,0.5)',
        letterSpacing: '0.15em', zIndex: 10, pointerEvents: 'none',
      }}>
        <div>BROADCAST · {new Date().toISOString().slice(0, 10)}</div>
        <div>HUD-01</div>
      </div>
    </>
  );
}

// ─── 用户上传的 Logo —————————————————————————————————————————

export function BrandLogo({ brand, t, isCover }: { brand?: BrandOverride; t: ThemeTokens; isCover: boolean }) {
  if (!brand?.logoDataUrl) return null;
  const placement = brand.logoPlacement ?? 'all-corners';
  if (placement === 'none') return null;
  if (placement === 'cover-only' && !isCover) return null;
  if (placement === 'cover-only' || (placement === 'all-corners' && isCover)) {
    return (
      <img src={brand.logoDataUrl} alt=""
        style={{
          position: 'absolute', top: 80, left: t.padding,
          maxHeight: 100, maxWidth: 280, objectFit: 'contain',
          opacity: 0.95, zIndex: 2, pointerEvents: 'none',
        }} />
    );
  }
  return (
    <img src={brand.logoDataUrl} alt=""
      style={{
        position: 'absolute',
        top: placement === 'footer-right' ? undefined : 50,
        bottom: placement === 'footer-right' ? 50 : undefined,
        right: 60,
        maxHeight: 56, maxWidth: 180, objectFit: 'contain',
        opacity: 0.85, zIndex: 2, pointerEvents: 'none',
      }} />
  );
}

// ─── Academic Footnote（学术主题专用，固定底部小字脚注）─────────────────────
export function AcademicFootnote({ t, source }: { t: ThemeTokens; source?: string }) {
  if (!source) return null;
  if (t.id !== 'academic-paper') {
    // 非 academic 主题用普通 italic
    return (
      <div style={{ marginTop: 24, fontSize: 18, color: t.muted, fontStyle: 'italic', lineHeight: 1.5 }}>
        {source}
      </div>
    );
  }
  // academic：上加 0.5px 横线，small italic + Source. 前缀
  return (
    <div style={{
      position: 'absolute', bottom: 100, left: t.padding, right: t.padding,
      paddingTop: 12, borderTop: `0.5px solid ${t.rule}`,
      fontSize: 18, color: t.muted, fontStyle: 'italic', lineHeight: 1.5,
      fontFamily: t.fontDisplay,
    }}>
      Source. {source}
    </div>
  );
}

// ─── Risograph 错位文字（红主体 + accent2 偏移叠印）────────────────────────────
/**
 * 仅 risograph 主题生效；其他主题原样输出 children。
 * 用于：data 大数字、matrix-2x2 强调格、process 编号等关键视觉元素。
 */
export function RisoText({ t, children, offset = 4, color }: {
  t: ThemeTokens; children: ReactNode; offset?: number; color?: string;
}) {
  if (t.id !== 'risograph') {
    return <span style={color ? { color } : undefined}>{children}</span>;
  }
  return (
    <span style={{ position: 'relative', display: 'inline-block', whiteSpace: 'nowrap' }}>
      <span style={{
        position: 'absolute', left: offset, top: offset,
        color: t.accent2 ?? t.accent, mixBlendMode: 'multiply',
        pointerEvents: 'none', whiteSpace: 'nowrap',
      }}>{children}</span>
      <span style={{ position: 'relative', color: color ?? t.text, whiteSpace: 'nowrap' }}>{children}</span>
    </span>
  );
}

// ─── 中文标题智能断句：在最近的标点（，。：；！？）后强制换行 ──────────────
// 用于长标题。当一行 chars 数 > softLimit，从软切点（标点）切分。
const CN_BREAKS = /([，。：；！？、])/;
export function smartLineBreak(text: string, softLimit = 14, hardLimit = 18): string[] {
  if (text.length <= softLimit) return [text];
  const parts = text.split(CN_BREAKS);
  // 把分隔符回填到前一段
  const segments: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (i % 2 === 0) segments.push(parts[i]);
    else segments[segments.length - 1] = (segments[segments.length - 1] ?? '') + parts[i];
  }
  // 贪心合并：在 hardLimit 内尽量塞，超了换行
  const lines: string[] = [];
  let cur = '';
  for (const seg of segments) {
    if (!seg) continue;
    if (!cur) { cur = seg; continue; }
    if ((cur + seg).length <= hardLimit) cur += seg;
    else { lines.push(cur); cur = seg; }
  }
  if (cur) lines.push(cur);
  // 没有标点可切 → 退回单行靠 CSS wrap
  return lines.length > 1 ? lines : [text];
}

// 强力设字号 ref：绕过未知代码剥离 inline style 的 bug
export function forceFontStyle(fs: number, fw: number | string = 700) {
  return (el: HTMLElement | null) => {
    if (!el) return;
    el.style.setProperty('font-size', `${fs}px`, 'important');
    el.style.setProperty('font-weight', String(fw), 'important');
  };
}

// ─── 高亮辅助 ────────────────────────────────────────────────────────────────

export function highlightText(text: string, highlight: string | undefined, t: ThemeTokens): ReactNode {
  if (!highlight) return text;
  const idx = text.indexOf(highlight);
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <span style={{ color: t.accent }}>{highlight}</span>
      {text.slice(idx + highlight.length)}
    </>
  );
}

export function highlightTextMulti(text: string, highlights: string[] | undefined, t: ThemeTokens): ReactNode {
  if (!highlights?.length) return text;
  const nodes: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  for (const h of highlights) {
    const idx = text.indexOf(h, cursor);
    if (idx === -1) continue;
    nodes.push(text.slice(cursor, idx));
    nodes.push(<span key={`h${key++}`} style={{ color: t.accent }}>{h}</span>);
    cursor = idx + h.length;
  }
  nodes.push(text.slice(cursor));
  return <>{nodes}</>;
}
