// ─── 11 个版式组件 ───────────────────────────────────────────────────────────
// 每个组件签名：(props: { slide: <SpecificSlide>, t: ThemeTokens, n, total }) => JSX
// 新增版式：在本文件加组件 + 在底部 LAYOUT_COMPONENTS 注册。

import type { ThemeTokens } from '@/lib/themes';
import type {
  Slide, CoverSlide, StatementSlide, ProcessSlide, DataSlide,
  CompareSlide, TimelineSlide, ArgumentSlide, QuoteSlide,
  DiagramSlide, CTASlide, ChecklistSlide, BrandOverride,
  Matrix2x2Slide, ChartBarSlide, KpiBoardSlide,
  RoadmapSlide, CaseStudySlide, TableSlide,
  CausalitySlide, PersonaSlide, QuadrantSlide, QuestionSlide,
} from '@/lib/types';
import { Eyebrow, Footer, fillStyle, highlightText, highlightTextMulti, Decoration, BrandLogo, HUDChrome, RisoText, EditorialMasthead, smartLineBreak, forceFontStyle } from './shared';

interface LayoutProps<S extends Slide> { slide: S; t: ThemeTokens; n: number; total: number; }

// ─── 1. Cover ─────────────────────────────────────────────────────────────────
function Cover({ slide, t, n, total }: LayoutProps<CoverSlide>) {
  // editorial-monocle：底部章节标识 + 中部主标 + 副标 italic
  // 顶部刊头线由 EditorialMasthead 全局组件提供，此处不重复
  if (t.id === 'editorial-monocle') {
    return (
      <div style={{ ...fillStyle(t), padding: `140px ${t.padding * 0.6}px 100px`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: 22, color: t.accent, letterSpacing: '0.22em', fontWeight: 600, textTransform: 'uppercase', fontFamily: 'Georgia,serif', fontStyle: 'italic' }}>
            {slide.eyebrow ?? 'Essay · 2026'}
          </div>
        </div>
        <div>
          <h1 data-ef="title" style={{ fontFamily: t.fontDisplay, fontSize: t.hero, fontWeight: 800, lineHeight: 1.15, margin: 0, maxWidth: 1700, letterSpacing: t.letterSpacingTitle }}>
            {highlightText(slide.title, slide.highlight, t)}
          </h1>
          {slide.subtitle && (
            <p data-ef="subtitle" style={{ fontSize: 32, color: t.muted, marginTop: 40, maxWidth: 1100, lineHeight: 1.5, fontStyle: 'italic' }}>
              {slide.subtitle}
            </p>
          )}
        </div>
        <div style={{ borderTop: `1px solid ${t.rule}`, paddingTop: 16, fontSize: 18, color: t.muted, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'Georgia,serif' }}>
          Chapter Zero · Opening
        </div>
      </div>
    );
  }

  // brutalist-mono：标题占满 200px+
  if (t.id === 'brutalist-mono') {
    return (
      <div style={{ ...fillStyle(t), padding: `0 ${t.padding}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {slide.eyebrow && <div style={{ marginBottom: 36 }}><Eyebrow t={t}>{slide.eyebrow}</Eyebrow></div>}
        <h1 data-ef="title" style={{
          fontFamily: t.fontDisplay, fontSize: 200, fontWeight: 900,
          lineHeight: 1.0, margin: 0, letterSpacing: t.letterSpacingTitle,
        }}>
          {slide.highlight ? (
            <>
              {slide.title.split(slide.highlight)[0]}
              <span style={{ background: t.text, color: t.bg, padding: '0 16px' }}>{slide.highlight}</span>
              {slide.title.split(slide.highlight).slice(1).join(slide.highlight)}
            </>
          ) : slide.title}
        </h1>
        {slide.subtitle && (
          <p data-ef="subtitle" style={{ fontSize: 36, fontWeight: 700, marginTop: 48, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {slide.subtitle}
          </p>
        )}
        <Footer n={n} total={total} t={t} />
      </div>
    );
  }

  // midnight-luxe：超大衬线 light + 标题下 1px 金色细线
  if (t.id === 'midnight-luxe') {
    return (
      <div style={{ ...fillStyle(t), padding: `0 ${t.padding}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {slide.eyebrow && <div style={{ marginBottom: 48 }}><Eyebrow t={t}>{slide.eyebrow}</Eyebrow></div>}
        <h1 data-ef="title" style={{
          fontFamily: t.fontDisplay, fontSize: t.hero, fontWeight: 300,
          lineHeight: 1.12, margin: 0, maxWidth: 1700, letterSpacing: '-0.01em',
          color: t.text,
        }}>
          {highlightText(slide.title, slide.highlight, t)}
        </h1>
        {/* 1px 金色细线 */}
        <div style={{ marginTop: 48, width: 240, height: 1, background: t.accent }} />
        {slide.subtitle && (
          <p data-ef="subtitle" style={{ fontSize: 24, color: t.muted, marginTop: 40, maxWidth: 1200, lineHeight: 1.6, letterSpacing: '0.05em', fontFamily: t.fontBody }}>
            {slide.subtitle}
          </p>
        )}
      </div>
    );
  }

  // academic-paper：§ 编号 + Title Case + italic 衬线副标
  if (t.id === 'academic-paper') {
    return (
      <div style={{ ...fillStyle(t), padding: `100px ${t.padding}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{ fontSize: 22, color: t.muted, fontStyle: 'italic', fontFamily: t.fontDisplay }}>
          § {slide.eyebrow ?? '0.0 — Introduction'}
        </div>
        <h1 data-ef="title" style={{
          fontFamily: t.fontDisplay, fontSize: t.hero, fontWeight: 700,
          lineHeight: 1.2, margin: '32px 0 0', maxWidth: 1700, letterSpacing: 0,
        }}>
          {highlightText(slide.title, slide.highlight, t)}
        </h1>
        {slide.subtitle && (
          <p data-ef="subtitle" style={{ fontSize: 28, color: t.soft, fontStyle: 'italic', marginTop: 32, maxWidth: 1300, lineHeight: 1.55, fontFamily: t.fontDisplay }}>
            — {slide.subtitle}
          </p>
        )}
        <Footer n={n} total={total} t={t} />
      </div>
    );
  }

  // risograph：黑标题 + accent 红色文字 4px 偏移叠印
  if (t.id === 'risograph') {
    const risoLines = smartLineBreak(slide.title, 12, 16);
    const risoFs = Math.min(Math.max(t.hero - (risoLines.length > 1 ? 40 : 10), 88), 132);
    const renderLines = (color: string) => risoLines.map((line, i) => (
      <span key={i} style={{ display: 'block', color }}>{line}</span>
    ));
    return (
      <div style={{ ...fillStyle(t), padding: `0 ${t.padding}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {slide.eyebrow && <div style={{ marginBottom: 32 }}><Eyebrow t={t}>{slide.eyebrow}</Eyebrow></div>}
        <div style={{ position: 'relative' }}>
          {/* 红色偏移层 */}
          <h1
            aria-hidden
            ref={forceFontStyle(risoFs, 900)}
            style={{
              position: 'absolute', top: 4, left: 4,
              fontFamily: t.fontDisplay, fontSize: `${risoFs}px`, fontWeight: 900,
              lineHeight: 1.15, margin: 0, maxWidth: 1700,
              color: t.accent, mixBlendMode: 'multiply',
              pointerEvents: 'none',
            }}>
            {renderLines(t.accent)}
          </h1>
          {/* 主黑色层 */}
          <h1 data-ef="title"
            ref={forceFontStyle(risoFs, 900)}
            style={{
              position: 'relative',
              fontFamily: t.fontDisplay, fontSize: `${risoFs}px`, fontWeight: 900,
              lineHeight: 1.15, margin: 0, maxWidth: 1700,
              color: t.text, letterSpacing: t.letterSpacingTitle,
            }}>
            {renderLines(t.text)}
          </h1>
        </div>
        {slide.subtitle && (
          <p data-ef="subtitle" style={{ fontSize: t.body, color: t.soft, maxWidth: 1200, lineHeight: 1.5, marginTop: 48, fontFamily: t.fontDisplay }}>
            {slide.subtitle}
          </p>
        )}
      </div>
    );
  }

  // broadcast-hud：标题下 amber 一字宽块强调
  if (t.id === 'broadcast-hud') {
    return (
      <div style={{ ...fillStyle(t), padding: `0 ${t.padding}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        {slide.eyebrow && <div style={{ marginBottom: 36 }}><Eyebrow t={t}>{slide.eyebrow}</Eyebrow></div>}
        <h1 data-ef="title" style={{
          fontFamily: t.fontDisplay, fontSize: t.hero, fontWeight: 800,
          lineHeight: 1.1, margin: 0, maxWidth: 1700, letterSpacing: t.letterSpacingTitle,
        }}>
          {highlightText(slide.title, slide.highlight, t)}
        </h1>
        {/* amber 块作为 underscore 强调 */}
        <div style={{ marginTop: 24, width: 120, height: 16, background: t.accent }} />
        {slide.subtitle && (
          <p data-ef="subtitle" style={{ fontSize: t.body, color: t.muted, maxWidth: 1200, lineHeight: 1.5, marginTop: 32, fontFamily: t.fontMono, letterSpacing: '0.05em' }}>
            {slide.subtitle}
          </p>
        )}
      </div>
    );
  }

  // pop-magazine：大字 + 倾斜色块衬底，按标点切分多色叠
  if (t.id === 'pop-magazine') {
    const popLines = smartLineBreak(slide.title, 8, 11);
    const popFs = popLines.length > 2 ? 96 : popLines.length > 1 ? 136 : 176;
    const colors = ['#ffd13a', '#3a8aff', '#ff3a5a', '#2eb56a'];
    return (
      <div style={{ ...fillStyle(t), padding: `0 120px`, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center' }}>
        {slide.eyebrow && (
          <div style={{ marginBottom: 32 }}>
            <span style={{
              background: t.text, color: t.bg,
              padding: '6px 18px',
              fontSize: 22, fontWeight: 900, letterSpacing: '0.05em',
              fontFamily: t.fontDisplay, textTransform: 'uppercase',
            }}>{slide.eyebrow}</span>
          </div>
        )}
        <h1 data-ef="title"
          ref={forceFontStyle(popFs, 900)}
          style={{
            fontFamily: t.fontDisplay, fontSize: `${popFs}px`, fontWeight: 900,
            lineHeight: 1.18, margin: 0, letterSpacing: '-0.03em', color: t.text,
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14,
          }}>
          {popLines.map((line, i) => (
            <span key={i} style={{
              background: colors[i % colors.length],
              color: i % 2 === 1 ? t.bg : t.text,
              padding: '4px 22px', display: 'inline-block',
              transform: `rotate(${i % 2 === 0 ? -2 : 2}deg)`,
              whiteSpace: 'nowrap',
            }}>{line}</span>
          ))}
        </h1>
        {slide.subtitle && (
          <p data-ef="subtitle" style={{
            fontSize: 30, fontWeight: 700, marginTop: 40, color: t.text,
            display: 'inline-block', alignSelf: 'center',
          }}>
            <span style={{ background: '#ffd13a', padding: '4px 12px' }}>{slide.subtitle}</span>
          </p>
        )}
        <Footer n={n} total={total} t={t} />
      </div>
    );
  }

  // 默认实现
  const titleLines = smartLineBreak(slide.title, 13, 17);
  const titleFs = Math.min(Math.max(t.hero - (titleLines.length > 1 ? 36 : 16), 84), 120);
  return (
    <div style={{ ...fillStyle(t), padding: `0 ${t.padding}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {slide.eyebrow && <div style={{ marginBottom: 36 }}><Eyebrow t={t}>{slide.eyebrow}</Eyebrow></div>}
      <h1 data-ef="title"
        ref={forceFontStyle(titleFs, 800)}
        style={{
          fontFamily: t.fontDisplay,
          fontSize: `${titleFs}px`,
          fontWeight: 800,
          lineHeight: 1.22, margin: 0, maxWidth: 1700, letterSpacing: t.letterSpacingTitle,
        }}>
        {titleLines.map((line, i) => (
          <span key={i} style={{ display: 'block' }}>{highlightText(line, slide.highlight, t)}</span>
        ))}
      </h1>
      {slide.subtitle && (
        <p data-ef="subtitle" style={{ fontSize: t.body, color: t.soft, maxWidth: 1200, lineHeight: 1.5, marginTop: 40, fontFamily: t.fontDisplay }}>
          {slide.subtitle}
        </p>
      )}
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 2. Statement ─────────────────────────────────────────────────────────────
function Statement({ slide, t, n, total }: LayoutProps<StatementSlide>) {
  const align = slide.align ?? 'center';

  // brutalist-mono：整段反白（黑底白字），全 caps
  if (t.id === 'brutalist-mono') {
    return (
      <div style={{
        ...fillStyle(t), padding: t.padding,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          background: t.text, color: t.bg,
          padding: '80px 80px',
          maxWidth: 1600, width: '100%',
        }}>
          <h1 data-ef="title" style={{
            fontFamily: t.fontDisplay,
            fontSize: 96, fontWeight: 900, lineHeight: 1.2,
            margin: 0, textTransform: 'uppercase',
            letterSpacing: '-0.03em', textAlign: align,
          }}>
            {slide.title}
          </h1>
        </div>
        <Footer n={n} total={total} t={t} />
      </div>
    );
  }

  const lines = smartLineBreak(slide.title, 13, 17);
  const fs = lines.length > 1
    ? Math.min(Math.max(t.hero - 50, 80), 96)
    : Math.min(Math.max(t.hero - 30, 88), 108);
  return (
    <div style={{
      ...fillStyle(t),
      padding: `0 ${t.padding}px`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: align === 'center' ? 'center' : 'flex-start',
      textAlign: align,
    }}>
      <h1 data-ef="title"
        ref={forceFontStyle(fs, 800)}
        style={{
          fontFamily: t.fontDisplay,
          fontSize: `${fs}px`,
          fontWeight: 800,
          lineHeight: 1.3, margin: 0,
          maxWidth: 1500, letterSpacing: t.letterSpacingTitle,
          ...(align === 'left' ? { borderLeft: `8px solid ${t.accent}`, paddingLeft: 64 } : {}),
        }}>
        {lines.map((line, i) => (
          <span key={i} style={{ display: 'block' }}>{highlightTextMulti(line, slide.highlight, t)}</span>
        ))}
      </h1>
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 3. Process ──────────────────────────────────────────────────────────────
function Process({ slide, t, n, total }: LayoutProps<ProcessSlide>) {
  const isTech = t.id === 'tech-utility';
  const headLines = smartLineBreak(slide.heading, 14, 20);
  const headFs = Math.min(t.section, headLines.length > 1 ? 68 : 80);
  return (
    <div style={{ ...fillStyle(t), padding: `120px ${t.padding}px`, display: 'flex', flexDirection: 'column' }}>
      {slide.eyebrow && <Eyebrow t={t}>{slide.eyebrow}</Eyebrow>}
      <h2 data-ef="heading"
        ref={forceFontStyle(headFs, 700)}
        style={{ fontSize: `${headFs}px`, fontWeight: 700, margin: '24px 0 56px', lineHeight: 1.3, fontFamily: t.fontDisplay, maxWidth: 1700 }}>
        {headLines.map((line, i) => (
          <span key={i} style={{ display: 'block' }}>{line}</span>
        ))}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${slide.steps.length}, 1fr)`, gap: isTech ? 16 : 28, alignItems: 'stretch' }}>
        {slide.steps.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'stretch', gap: 0 }}>
            <div style={{
              flex: 1,
              background: t.paper, borderRadius: t.radius, padding: 36,
              border: t.id === 'brutalist-mono' ? `${t.borderWeight}px solid ${t.rule}` : `1px solid ${t.border}`,
              fontFamily: isTech ? t.fontMono : undefined,
            }}>
              <div style={{
                fontSize: isTech ? 24 : 30,
                color: t.accent, fontWeight: 700,
                fontFamily: isTech ? t.fontMono : t.fontDisplay,
                letterSpacing: isTech ? '0.05em' : undefined,
              }}>
                {isTech ? `[${String(i + 1).padStart(2, '0')}]` :
                 t.id === 'risograph' ? <RisoText t={t} offset={2} color={t.accent}>{String(i + 1).padStart(2, '0')}</RisoText> :
                 String(i + 1).padStart(2, '0')}
              </div>
              <div data-ef={`steps.${i}.title`} style={{ fontSize: t.body, fontWeight: 700, marginTop: 18, fontFamily: t.fontDisplay }}>{s.title}</div>
              {s.desc && <div data-ef={`steps.${i}.desc`} style={{ fontSize: t.caption, color: t.muted, marginTop: 14, lineHeight: 1.5 }}>{s.desc}</div>}
            </div>
            {/* tech: 节点之间用 mono ─→ */}
            {isTech && i < slide.steps.length - 1 && (
              <div style={{ display: 'flex', alignItems: 'center', padding: '0 4px', fontFamily: t.fontMono, fontSize: 28, color: t.muted, flexShrink: 0 }}>
                ─→
              </div>
            )}
          </div>
        ))}
      </div>
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 4. Data ──────────────────────────────────────────────────────────────────
function Data({ slide, t, n, total }: LayoutProps<DataSlide>) {
  const isLuxe = t.id === 'midnight-luxe';
  const isEditorial = t.id === 'editorial-monocle';
  const isAcademic = t.id === 'academic-paper';
  const useOldStyle = isLuxe || isEditorial || isAcademic;
  return (
    <div style={{ ...fillStyle(t), padding: `120px ${t.padding}px`, display: 'flex', flexDirection: 'column' }}>
      {slide.eyebrow && <Eyebrow t={t}>{slide.eyebrow}</Eyebrow>}
      <h2 data-ef="heading" style={{ fontSize: t.section, fontWeight: 700, margin: '24px 0 80px', lineHeight: 1.25, fontFamily: t.fontDisplay }}>
        {slide.heading}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${slide.stats.length}, 1fr)`, gap: 60, paddingTop: 32, borderTop: `${t.borderWeight}px solid ${t.rule}` }}>
        {slide.stats.map((s, i) => {
          const isPlaceholder = s.value === '—' || s.value === '-';
          const fs = Math.min(Math.max(t.hero - 24, 92), 132);
          return (
            <div key={i}>
              <div
                ref={forceFontStyle(fs, isLuxe ? 400 : 800)}
                style={{
                  fontSize: `${fs}px`,
                  fontWeight: isLuxe ? 400 : 800,
                  color: t.accent, lineHeight: 1.05,
                  fontFamily: t.fontDisplay,
                  fontVariantNumeric: useOldStyle ? 'tabular-nums oldstyle-nums' : 'tabular-nums',
                  opacity: isPlaceholder ? 0.35 : 1,
                  whiteSpace: 'nowrap',
                }}>
                <RisoText t={t} offset={3} color={t.accent}>{s.value}</RisoText>
              </div>
              {/* luxe: 巨数字下加金色 1px 细线 */}
              {isLuxe && !isPlaceholder && (
                <div style={{ width: 80, height: 1, background: t.accent, marginTop: 16 }} />
              )}
              <div style={{ fontSize: t.body, color: t.soft, marginTop: isLuxe ? 16 : 24, lineHeight: 1.5, fontWeight: 600 }}>{s.label}</div>
              {s.source && <div style={{ fontSize: t.caption, color: t.muted, marginTop: 10, lineHeight: 1.5, fontStyle: 'italic' }}>{s.source}</div>}
            </div>
          );
        })}
      </div>
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 5. Compare ──────────────────────────────────────────────────────────────
function Compare({ slide, t, n, total }: LayoutProps<CompareSlide>) {
  const accentBg = t.mode === 'dark'
    ? 'rgba(124,232,196,0.10)'
    : t.id === 'editorial-monocle' ? 'transparent'
    : t.id === 'brutalist-mono' ? '#fff'
    : 'rgba(37,99,235,0.06)';
  const headLines = smartLineBreak(slide.heading, 14, 20);
  const headFs = Math.min(t.section, headLines.length > 1 ? 68 : 80);
  return (
    <div style={{ ...fillStyle(t), padding: `110px ${t.padding}px`, display: 'flex', flexDirection: 'column' }}>
      {slide.eyebrow && <Eyebrow t={t}>{slide.eyebrow}</Eyebrow>}
      <h2
        ref={forceFontStyle(headFs, 700)}
        style={{ fontSize: `${headFs}px`, fontWeight: 700, margin: '24px 0 48px', lineHeight: 1.3, fontFamily: t.fontDisplay, maxWidth: 1700 }}>
        {headLines.map((line, i) => (
          <span key={i} style={{ display: 'block' }}>{line}</span>
        ))}
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, flex: 1 }}>
        {([{ data: slide.left, accent: false }, { data: slide.right, accent: true }] as const).map(({ data, accent }, idx) => (
          <div key={idx} style={{
            background: accent ? accentBg : t.paper,
            borderRadius: t.radius,
            padding: 48,
            border: accent ? `${t.borderWeight}px solid ${t.accent}` : `1px solid ${t.border}`,
          }}>
            <div style={{
              fontSize: 24, color: accent ? t.accent : t.muted, fontWeight: 600, letterSpacing: '0.1em',
              fontFamily: t.fontEyebrowSerif ?? t.fontDisplay, textTransform: 'uppercase',
            }}>{data.title}</div>
            <ul style={{ fontSize: 30, color: t.soft, lineHeight: 1.7, marginTop: 32, paddingLeft: 32, fontFamily: t.fontDisplay }}>
              {data.items.map((item, i) => <li key={i}>{item}</li>)}
            </ul>
          </div>
        ))}
      </div>
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 6. Timeline ─────────────────────────────────────────────────────────────
function Timeline({ slide, t, n, total }: LayoutProps<TimelineSlide>) {
  return (
    <div style={{ ...fillStyle(t), padding: `120px ${t.padding}px`, display: 'flex', flexDirection: 'column' }}>
      {slide.eyebrow && <Eyebrow t={t}>{slide.eyebrow}</Eyebrow>}
      <h2 data-ef="heading" style={{ fontSize: t.section, fontWeight: 700, margin: '24px 0 100px', lineHeight: 1.25, fontFamily: t.fontDisplay }}>
        {slide.heading}
      </h2>
      <div style={{ position: 'relative', flex: 1 }}>
        <div style={{ position: 'absolute', left: 0, right: 0, top: 60, height: t.borderWeight, background: t.rule }} />
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${slide.events.length}, 1fr)`, gap: 24 }}>
          {slide.events.map((e, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ width: 22, height: 22, background: t.accent, borderRadius: 999, margin: '50px auto 0' }} />
              <div style={{ fontSize: 50, fontWeight: 800, marginTop: 28, fontFamily: t.fontDisplay }}>{e.time}</div>
              <div style={{ fontSize: t.body, color: t.soft, marginTop: 10 }}>{e.title}</div>
              {e.desc && <div style={{ fontSize: t.caption, color: t.muted, marginTop: 6, lineHeight: 1.5 }}>{e.desc}</div>}
            </div>
          ))}
        </div>
      </div>
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 7. Argument ─────────────────────────────────────────────────────────────
function Argument({ slide, t, n, total }: LayoutProps<ArgumentSlide>) {
  const headLines = smartLineBreak(slide.heading, 14, 20);
  const headFs = Math.min(t.section, headLines.length > 1 ? 72 : 84);
  return (
    <div style={{ ...fillStyle(t), padding: `120px ${t.padding}px`, display: 'flex', flexDirection: 'column' }}>
      {slide.eyebrow && <Eyebrow t={t}>{slide.eyebrow}</Eyebrow>}
      <h2 data-ef="heading"
        ref={forceFontStyle(headFs, 700)}
        style={{ fontSize: `${headFs}px`, fontWeight: 700, margin: '24px 0 40px', lineHeight: 1.3, fontFamily: t.fontDisplay, maxWidth: 1600 }}>
        {headLines.map((line, i) => (
          <span key={i} style={{ display: 'block' }}>{highlightText(line, slide.highlight, t)}</span>
        ))}
      </h2>
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column',
        justifyContent: 'space-evenly',
        maxWidth: 1500, paddingTop: 32,
        borderTop: `${t.borderWeight}px solid ${t.rule}`,
      }}>
        {slide.points.map((p, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 36 }}>
            <div style={{
              fontSize: 56, color: t.accent, fontFamily: t.fontEyebrowSerif ?? t.fontDisplay,
              fontWeight: 700, minWidth: 96, lineHeight: 1,
            }}>{String(i + 1).padStart(2, '0')}</div>
            <div data-ef={`points.${i}`} style={{ fontSize: 36, color: t.soft, lineHeight: 1.45, fontFamily: t.fontDisplay }}>{p}</div>
          </div>
        ))}
      </div>
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 8. Quote ────────────────────────────────────────────────────────────────
function Quote({ slide, t, n, total }: LayoutProps<QuoteSlide>) {
  // editorial-monocle：真排印弯引号 + 受访者下加 1px 横线
  if (t.id === 'editorial-monocle') {
    return (
      <div style={{ ...fillStyle(t), padding: `0 ${t.padding * 1.2}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 1500 }}>
          <p data-ef="quote" style={{ fontSize: 56, fontWeight: 500, lineHeight: 1.45, margin: 0, fontFamily: t.fontDisplay, fontStyle: 'italic' }}>
            <span style={{ color: t.accent, fontWeight: 700 }}>”</span>
            {highlightText(slide.quote, slide.highlight, t)}
            <span style={{ color: t.accent, fontWeight: 700 }}>”</span>
          </p>
          <div data-ef="source" style={{ marginTop: 40, paddingTop: 16, borderTop: `1px solid ${t.rule}`, fontSize: 24, color: t.muted, fontStyle: 'italic' }}>
            — {slide.source}
          </div>
        </div>
        <Footer n={n} total={total} t={t} />
      </div>
    );
  }

  // academic-paper：块引格式（左 4px accent 竖线 + 缩进 + italic）
  if (t.id === 'academic-paper') {
    return (
      <div style={{ ...fillStyle(t), padding: `0 ${t.padding}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 1500, paddingLeft: 48, borderLeft: `4px solid ${t.accent}` }}>
          <p data-ef="quote" style={{ fontSize: 44, fontWeight: 400, lineHeight: 1.55, margin: 0, fontFamily: t.fontDisplay, fontStyle: 'italic' }}>
            {highlightText(slide.quote, slide.highlight, t)}
          </p>
          <div data-ef="source" style={{ marginTop: 32, fontSize: 22, color: t.muted, fontStyle: 'normal' }}>
            — {slide.source}
          </div>
        </div>
        <Footer n={n} total={total} t={t} />
      </div>
    );
  }

  // midnight-luxe：半透明金色巨型左引号 + 衬线斜体
  if (t.id === 'midnight-luxe') {
    return (
      <div style={{ ...fillStyle(t), padding: `0 ${t.padding * 1.2}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: 1500, position: 'relative' }}>
          <span style={{
            position: 'absolute', left: -120, top: -80,
            fontSize: 360, color: t.accent, opacity: 0.3, lineHeight: 1,
            fontFamily: t.fontDisplay, fontWeight: 400, pointerEvents: 'none',
          }}>“</span>
          <p data-ef="quote" style={{ fontSize: 56, fontWeight: 300, lineHeight: 1.5, margin: 0, fontFamily: t.fontDisplay, fontStyle: 'italic', position: 'relative' }}>
            {highlightText(slide.quote, slide.highlight, t)}
          </p>
          <div data-ef="source" style={{ marginTop: 48, fontSize: 22, color: t.accent, letterSpacing: '0.2em', textTransform: 'uppercase', fontFamily: t.fontBody }}>
            — {slide.source}
          </div>
        </div>
      </div>
    );
  }

  // brutalist-mono：整段反白（黑底白字）
  if (t.id === 'brutalist-mono') {
    return (
      <div style={{ ...fillStyle(t), padding: t.padding, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          background: t.text, color: t.bg,
          padding: 80, maxWidth: 1500,
          width: '100%',
        }}>
          <p data-ef="quote" style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.3, margin: 0, fontFamily: t.fontDisplay, textTransform: 'uppercase', letterSpacing: '-0.02em' }}>
            {slide.quote}
          </p>
          <div data-ef="source" style={{ marginTop: 40, fontSize: 22, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            — {slide.source}
          </div>
        </div>
        <Footer n={n} total={total} t={t} />
      </div>
    );
  }

  // 默认实现
  return (
    <div style={{ ...fillStyle(t), padding: `0 ${t.padding * 1.25}px`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ maxWidth: 1500 }}>
        <span style={{
          fontSize: 220, color: t.accent, lineHeight: 0.5,
          fontFamily: t.fontEyebrowSerif ?? 'Georgia,serif',
          fontWeight: 700, display: 'inline-block', height: 80,
        }}>&ldquo;</span>
        <p data-ef="quote" style={{ fontSize: 52, fontWeight: 500, lineHeight: 1.5, margin: '32px 0 48px', fontFamily: t.fontDisplay }}>
          {highlightText(slide.quote, slide.highlight, t)}
        </p>
        <div data-ef="source" style={{ fontSize: 24, color: t.muted, letterSpacing: '0.08em', fontStyle: 'italic' }}>
          — {slide.source}
        </div>
      </div>
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 9. Diagram (placeholder) ────────────────────────────────────────────────
function Diagram({ slide, t, n, total }: LayoutProps<DiagramSlide>) {
  const headLines = smartLineBreak(slide.heading, 14, 20);
  const headFs = Math.min(t.section, headLines.length > 1 ? 68 : 80);
  // 把 hint 中常见分隔符拆为多个要点显示
  const hintParts = slide.hint
    ? slide.hint.split(/[／/、，；;|]\s*|\n+/).map((s) => s.trim()).filter(Boolean)
    : [];
  return (
    <div style={{ ...fillStyle(t), padding: `120px ${t.padding}px`, display: 'flex', flexDirection: 'column' }}>
      {slide.eyebrow && <Eyebrow t={t}>{slide.eyebrow}</Eyebrow>}
      <h2 data-ef="heading"
        ref={forceFontStyle(headFs, 700)}
        style={{ fontSize: `${headFs}px`, fontWeight: 700, margin: '24px 0 48px', lineHeight: 1.3, fontFamily: t.fontDisplay }}>
        {headLines.map((line, i) => (
          <span key={i} style={{ display: 'block' }}>{line}</span>
        ))}
      </h2>
      <div style={{
        flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
        border: `2px dashed ${t.border}`, borderRadius: t.radius,
        background: t.paper, padding: 60,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 1300 }}>
          <div style={{ fontSize: 20, color: t.muted, letterSpacing: '0.18em', textTransform: 'uppercase', fontFamily: t.fontEyebrowSerif ?? t.fontDisplay }}>
            DIAGRAM · 待补图示
          </div>
          {hintParts.length > 1 ? (
            <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 20, alignItems: 'center' }}>
              {hintParts.map((p, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.accent, color: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 700, fontFamily: t.fontDisplay, flexShrink: 0 }}>{i + 1}</div>
                  <div style={{ fontSize: 30, color: t.soft, fontFamily: t.fontDisplay, fontWeight: 500 }}>{p}</div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ fontSize: 30, color: t.soft, marginTop: 24, lineHeight: 1.6, fontStyle: 'italic', fontFamily: t.fontDisplay }}>
              {slide.hint}
            </p>
          )}
        </div>
      </div>
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 10. CTA ─────────────────────────────────────────────────────────────────
function CTA({ slide, t, n, total }: LayoutProps<CTASlide>) {
  const actionLines = smartLineBreak(slide.newAction, 14, 18);
  const actionFs = actionLines.length > 1
    ? Math.min(Math.max(t.hero - 56, 64), 84)
    : Math.min(Math.max(t.hero - 30, 76), 96);
  return (
    <div style={{ ...fillStyle(t), padding: `120px ${t.padding}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start' }}>
      {slide.eyebrow && <div style={{ marginBottom: 40 }}><Eyebrow t={t}>{slide.eyebrow}</Eyebrow></div>}
      {slide.oldQuestion && (
        <div style={{ fontSize: 44, color: t.muted, fontFamily: t.fontDisplay, lineHeight: 1.4, fontWeight: 500 }}>
          不再问 <span style={{ textDecoration: 'line-through', textDecorationThickness: 2 }}>&ldquo;{slide.oldQuestion}&rdquo;</span>
        </div>
      )}
      <div data-ef="newAction"
        ref={forceFontStyle(actionFs, 800)}
        style={{
          fontSize: `${actionFs}px`,
          color: t.accent, fontFamily: t.fontDisplay, lineHeight: 1.3,
          margin: '40px 0 0', fontWeight: 800, maxWidth: 1600,
        }}>
        {actionLines.map((line, i) => (
          <span key={i} style={{ display: 'block' }}>{highlightText(line, slide.highlight, t)}</span>
        ))}
      </div>
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 11. Checklist ───────────────────────────────────────────────────────────
function Checklist({ slide, t, n, total }: LayoutProps<ChecklistSlide>) {
  const headLines = smartLineBreak(slide.heading, 14, 20);
  const headFs = Math.min(t.section, headLines.length > 1 ? 68 : 80);
  return (
    <div style={{ ...fillStyle(t), padding: `120px ${t.padding}px`, display: 'flex', flexDirection: 'column' }}>
      {slide.eyebrow && <Eyebrow t={t}>{slide.eyebrow}</Eyebrow>}
      <h2 data-ef="heading"
        ref={forceFontStyle(headFs, 700)}
        style={{ fontSize: `${headFs}px`, fontWeight: 700, margin: '24px 0 56px', lineHeight: 1.3, fontFamily: t.fontDisplay }}>
        {headLines.map((line, i) => (
          <span key={i} style={{ display: 'block' }}>{line}</span>
        ))}
      </h2>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-evenly', maxWidth: 1500 }}>
        {slide.items.map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 28, fontSize: 36, lineHeight: 1.4 }}>
            <div style={{
              width: 44, height: 44, borderRadius: t.radius > 0 ? 10 : 0, background: t.accent,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={t.bg} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 12 10 18 20 6" />
              </svg>
            </div>
            <span data-ef={`items.${i}`} style={{ color: t.soft, fontFamily: t.fontDisplay }}>{item}</span>
          </div>
        ))}
      </div>
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 12. Matrix 2x2 ──────────────────────────────────────────────────────────
function Matrix2x2({ slide, t, n, total }: LayoutProps<Matrix2x2Slide>) {
  const isBrutalist = t.id === 'brutalist-mono';
  return (
    <div style={{ ...fillStyle(t), padding: `120px ${t.padding}px`, display: 'flex', flexDirection: 'column' }}>
      {slide.eyebrow && <Eyebrow t={t}>{slide.eyebrow}</Eyebrow>}
      <h2 style={{ fontSize: Math.min(t.section, 56), fontWeight: 700, margin: '24px 0 56px', lineHeight: 1.25, fontFamily: t.fontDisplay, maxWidth: 1500 }}>
        {slide.heading}
      </h2>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', width: 920, height: 560 }}>
          {/* y 轴：左侧外，写在 flex column 里避免 rotate 重叠 */}
          <div style={{ position: 'absolute', left: -120, top: 0, bottom: 0, width: 90, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 20, color: t.muted, fontFamily: t.fontEyebrowSerif ?? t.fontDisplay, letterSpacing: '0.05em' }}>
            <div style={{ whiteSpace: 'nowrap' }}>↑ {slide.axes.y.high}</div>
            <div style={{ whiteSpace: 'nowrap' }}>{slide.axes.y.low}</div>
          </div>
          {/* x 轴 */}
          <div style={{ position: 'absolute', left: 0, bottom: -40, fontSize: 20, color: t.muted, fontFamily: t.fontEyebrowSerif ?? t.fontDisplay, letterSpacing: '0.05em' }}>
            {slide.axes.x.low}
          </div>
          <div style={{ position: 'absolute', right: 0, bottom: -40, fontSize: 20, color: t.muted, fontFamily: t.fontEyebrowSerif ?? t.fontDisplay, letterSpacing: '0.05em' }}>
            {slide.axes.x.high} →
          </div>
          {/* 4 格 */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', width: '100%', height: '100%', border: `${t.borderWeight}px solid ${t.rule}` }}>
            {slide.cells.map((c, i) => {
              const emphasized = c.emphasis;
              const inverted = isBrutalist && emphasized;
              return (
                <div key={i} style={{
                  padding: 32,
                  borderRight: i % 2 === 0 ? `${t.borderWeight}px solid ${t.rule}` : 'none',
                  borderBottom: i < 2 ? `${t.borderWeight}px solid ${t.rule}` : 'none',
                  border: emphasized && !isBrutalist ? `${t.borderWeight + 1}px solid ${t.accent}` : undefined,
                  background: inverted ? t.text : 'transparent',
                  color: inverted ? t.bg : t.text,
                  display: 'flex', flexDirection: 'column', justifyContent: 'center',
                }}>
                  <div style={{ fontSize: 36, fontWeight: 700, fontFamily: t.fontDisplay, lineHeight: 1.25 }}>
                    {emphasized ? <RisoText t={t} offset={2} color={t.text}>{c.label}</RisoText> : c.label}
                  </div>
                  {c.desc && <div style={{ fontSize: 22, color: inverted ? t.bg : t.muted, marginTop: 12, lineHeight: 1.45 }}>{c.desc}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>
      {slide.takeaway && (
        <div style={{ fontSize: 24, color: t.soft, marginTop: 48, fontStyle: 'italic', textAlign: 'center' }}>
          {slide.takeaway}
        </div>
      )}
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 13. Chart Bar (horizontal) ──────────────────────────────────────────────
function ChartBar({ slide, t, n, total }: LayoutProps<ChartBarSlide>) {
  const isBrutalist = t.id === 'brutalist-mono';
  const isLuxe = t.id === 'midnight-luxe';
  const isTech = t.id === 'tech-utility';
  const isRiso = t.id === 'risograph';
  const isEditorial = t.id === 'editorial-monocle';
  const isAcademic = t.id === 'academic-paper';
  const useOldStyle = isLuxe || isEditorial || isAcademic;
  const max = Math.max(...slide.bars.map((b) => b.value), 1);
  const formatNum = (v: number) => v.toLocaleString('zh-CN');
  const numFontVariant = useOldStyle ? 'tabular-nums oldstyle-nums' : 'tabular-nums';

  /** 渲染柱体内容（按主题各异） */
  function renderBar(value: number, isHi: boolean, widthPct: number) {
    const inverted = isBrutalist && isHi;

    // tech-utility: 刻度填充（每 10% 一格 4×4 间隔）
    if (isTech) {
      const cellPct = 100 / 25; // 25 格刻度
      return (
        <div style={{ width: `${widthPct}%`, height: '100%', display: 'flex', gap: 2, alignItems: 'center' }}>
          {Array.from({ length: Math.max(1, Math.round((widthPct / 100) * 25)) }).map((_, i) => (
            <div key={i} style={{ flex: 1, height: '100%', background: isHi ? t.accent : t.accent2 ?? t.text }} />
          ))}
        </div>
      );
    }

    // brutalist: 描边 + 内部斜线 SVG pattern
    if (isBrutalist) {
      return (
        <div style={{
          width: `${widthPct}%`, height: '100%',
          border: `2px solid ${t.text}`,
          background: isHi ? t.text : `repeating-linear-gradient(45deg, ${t.text} 0 2px, transparent 2px 8px)`,
        }} />
      );
    }

    // risograph: 红色主体 + 1px 偏移的蓝色叠层（mix-blend multiply）
    if (isRiso) {
      return (
        <div style={{ position: 'relative', width: `${widthPct}%`, height: '100%' }}>
          <div style={{
            position: 'absolute', left: 1, top: 1, width: '100%', height: '100%',
            background: t.accent2, mixBlendMode: 'multiply', opacity: 0.85,
          }} />
          <div style={{
            position: 'relative', width: '100%', height: '100%',
            background: isHi ? t.accent2 ?? t.text : t.accent,
          }} />
        </div>
      );
    }

    // 默认（含 luxe/editorial/academic）
    return (
      <div style={{
        width: `${widthPct}%`, height: '100%',
        background: isHi ? t.accent : t.text,
        border: inverted ? `2px solid ${t.text}` : 'none',
        borderRadius: t.radius > 0 ? 4 : 0,
      }} />
    );
  }

  return (
    <div style={{ ...fillStyle(t), padding: `120px ${t.padding}px`, display: 'flex', flexDirection: 'column' }}>
      {slide.eyebrow && <Eyebrow t={t}>{slide.eyebrow}</Eyebrow>}
      {/* academic: 加 Figure n. 衬线斜体小标 */}
      {isAcademic && (
        <div style={{ fontSize: 22, color: t.muted, fontStyle: 'italic', marginTop: 16, fontFamily: t.fontDisplay }}>
          Figure {n}. {slide.heading}
        </div>
      )}
      <h2 style={{
        fontSize: t.section, fontWeight: 700, margin: isAcademic ? '12px 0 56px' : '24px 0 64px',
        lineHeight: 1.25, fontFamily: t.fontDisplay, maxWidth: 1600,
        display: isAcademic ? 'none' : undefined,
      }}>
        {slide.heading}
      </h2>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 24 }}>
        {slide.bars.map((b) => {
          const isHi = slide.highlight === b.label;
          const widthPct = (b.value / max) * 100;
          return (
            <div key={b.label} style={{ display: 'grid', gridTemplateColumns: '240px 1fr 320px', alignItems: 'center', gap: 24 }}>
              <div style={{ fontSize: 28, color: t.muted, textAlign: 'right', paddingRight: 16, fontFamily: t.fontDisplay }}>{b.label}</div>
              <div style={{ position: 'relative', height: 48, background: 'transparent' }}>
                {renderBar(b.value, isHi, widthPct)}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 16 }}>
                <div style={{
                  fontSize: 32,
                  fontWeight: isHi ? 800 : (isLuxe ? 400 : 700),
                  color: isHi ? t.accent : t.text,
                  fontFamily: t.fontDisplay, fontVariantNumeric: numFontVariant,
                }}>
                  {formatNum(b.value)}
                </div>
                {b.note && <div style={{ fontSize: 22, color: t.muted }}>{b.note}</div>}
              </div>
            </div>
          );
        })}
      </div>
      <div style={{
        marginTop: 32, fontSize: 22, color: t.muted, display: 'flex', gap: 32,
        paddingTop: 16, borderTop: `${t.borderWeight}px solid ${t.rule}`,
        fontStyle: isAcademic ? 'italic' : undefined,
      }}>
        <span>单位: {slide.unit}</span>
        {slide.source && <span style={{ fontStyle: 'italic' }}>{slide.source}</span>}
      </div>
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 14. KPI Board ───────────────────────────────────────────────────────────
function KpiBoard({ slide, t, n, total }: LayoutProps<KpiBoardSlide>) {
  const isBrutalist = t.id === 'brutalist-mono';
  const isLuxe = t.id === 'midnight-luxe';
  const isAcademic = t.id === 'academic-paper';
  const isEditorial = t.id === 'editorial-monocle';
  const isTech = t.id === 'tech-utility';
  const isHud = t.id === 'broadcast-hud';
  const useOldStyle = isLuxe || isAcademic || isEditorial;
  const isFour = slide.kpis.length === 4;
  const cols = isFour ? 2 : 3;
  // luxe 用更大的衬线字号；hud 也巨大
  const valueSize = isLuxe ? (isFour ? 96 : 76)
    : isHud ? (isFour ? 104 : 80)
    : (isFour ? 80 : 64);

  function deltaColor(tone: 'pos' | 'neg' | 'flat' | undefined): string {
    if (tone === 'pos') return t.accent;
    if (tone === 'neg') return t.danger ?? t.text;
    return t.muted;
  }

  function deltaText(k: { delta?: string; deltaTone?: 'pos' | 'neg' | 'flat' }): string {
    if (!k.delta) return '';
    // Brutalist: 不用三角，用 +/- 文字
    if (isBrutalist) {
      return k.delta.replace(/^▲/, '+').replace(/^▼/, '-');
    }
    // Academic: ▲▼ 改 ↑↓
    if (isAcademic) {
      return k.delta.replace(/^▲/, '↑').replace(/^▼/, '↓');
    }
    // tech-utility: 同样改 ↑↓
    if (isTech) {
      return k.delta.replace(/^▲/, '↑').replace(/^▼/, '↓');
    }
    return k.delta;
  }

  const valueFontVariant = useOldStyle ? 'tabular-nums oldstyle-nums' : 'tabular-nums';
  const valueFontWeight = isLuxe ? 400 : (isAcademic ? 600 : 800);

  return (
    <div style={{ ...fillStyle(t), padding: `120px ${t.padding}px`, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        {slide.eyebrow ? <Eyebrow t={t}>{slide.eyebrow}</Eyebrow> : <span />}
        <div style={{ fontSize: 24, color: t.muted, fontFamily: t.fontEyebrowSerif ?? t.fontDisplay, letterSpacing: '0.1em' }}>
          {slide.period}
        </div>
      </div>
      <h2 style={{ fontSize: Math.min(t.section, 56), fontWeight: 700, margin: '24px 0 56px', lineHeight: 1.3, fontFamily: t.fontDisplay, maxWidth: 1600 }}>
        {slide.heading}
      </h2>
      <div style={{
        flex: 1, display: 'grid',
        gridTemplateColumns: `repeat(${cols}, 1fr)`,
        gridAutoRows: '1fr',
        // 多色主题用 gap 间隔卡片；单色主题用整张表分割线
        ...(t.palette ? { gap: 16 } : {
          border: `${t.borderWeight}px solid ${t.rule}`,
        }),
      }}>
        {slide.kpis.map((k, i) => {
          const col = i % cols;
          const row = Math.floor(i / cols);
          const totalRows = Math.ceil(slide.kpis.length / cols);
          // ── 多色主题：每张卡按 palette[i] 着色 ───────────────────────────
          const paletteCol = t.palette?.[i % t.palette.length];
          // pastel-bauhaus 的异形圆角（每张不同）
          const bauhausRadii = ['200px 16px 16px 16px', '16px 200px 16px 16px', '16px 16px 200px 16px', '16px 16px 16px 200px', '16px 100px 16px 100px', '100px 16px 100px 16px'];
          const cardStyle: React.CSSProperties = t.palette ? (
            t.paletteRule === 'flat' ? {
              background: paletteCol, padding: 32,
              borderRadius: t.id === 'pastel-bauhaus' ? bauhausRadii[i % 6] : t.radius,
              border: t.borderWeight ? `${t.borderWeight}px solid ${t.border}` : 'none',
            } : t.paletteRule === 'soft-tint' ? {
              background: paletteCol, padding: 32, borderRadius: t.radius,
              border: `${t.borderWeight}px solid ${t.border}`,
              backdropFilter: t.glass ? 'blur(16px)' : undefined,
              WebkitBackdropFilter: t.glass ? 'blur(16px)' : undefined,
            } : t.paletteRule === 'risograph-stack' ? {
              background: t.bg, padding: 32, borderRadius: 0,
              border: `${t.borderWeight}px solid ${t.text}`,
              boxShadow: `4px 4px 0 ${paletteCol}`,
            } : t.paletteRule === 'block-border' ? ({
              background: paletteCol, padding: 32, borderRadius: t.radius,
              border: `${t.borderWeight}px solid ${t.border}`,
            }) : t.paletteRule === 'foil-text' ? {
              background: t.paper, padding: 32, borderRadius: t.radius,
              border: `${t.borderWeight}px solid ${t.border}`,
              backdropFilter: t.glass ? 'blur(20px)' : undefined,
              WebkitBackdropFilter: t.glass ? 'blur(20px)' : undefined,
            } : {
              background: paletteCol, padding: 32, borderRadius: t.radius,
            }
          ) : {
            padding: 32,
            borderRight: col < cols - 1 ? `${t.borderWeight}px solid ${t.rule}` : 'none',
            borderBottom: row < totalRows - 1 ? `${t.borderWeight}px solid ${t.rule}` : 'none',
          };
          return (
            <div key={i} style={{
              ...cardStyle,
              display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            }}>
              <div style={{ fontSize: 24, color: t.muted, fontWeight: 600, letterSpacing: '0.08em', fontFamily: t.fontEyebrowSerif ?? t.fontDisplay, textTransform: 'uppercase' }}>
                {k.label}
              </div>
              <div style={{
                fontSize: valueSize,
                fontWeight: isHud ? 800 : valueFontWeight,
                lineHeight: 1.05,
                fontFamily: isHud ? t.fontMono : t.fontDisplay,
                fontVariantNumeric: valueFontVariant,
                margin: '20px 0 12px',
                color: isLuxe ? t.text : undefined,
                display: 'flex', alignItems: 'baseline', gap: 12,
                ...(t.paletteRule === 'foil-text' && t.palette ? {
                  background: `linear-gradient(135deg, ${t.palette[i % t.palette.length]}, ${t.palette[(i + 1) % t.palette.length]})`,
                  WebkitBackgroundClip: 'text',
                  backgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  color: 'transparent',
                } : {}),
              }}>
                <span>{k.value}</span>
                {/* hud: 旁附 ◉ LIVE 红点 */}
                {isHud && k.deltaTone === 'pos' && (
                  <span style={{
                    width: 14, height: 14, borderRadius: '50%',
                    background: t.accent2 ?? t.danger, marginLeft: 8,
                    flexShrink: 0, alignSelf: 'center',
                  }} />
                )}
              </div>
              {/* luxe: value 下加金色 1px 细线 */}
              {isLuxe && (
                <div style={{ width: 80, height: 1, background: t.accent, marginBottom: 12 }} />
              )}
              <div>
                {k.delta && (
                  <div style={{ fontSize: 26, color: deltaColor(k.deltaTone), fontWeight: 600, fontFamily: t.fontDisplay, fontVariantNumeric: 'tabular-nums' }}>
                    {deltaText(k)}
                  </div>
                )}
                {k.hint && <div style={{ fontSize: 20, color: t.muted, marginTop: 8, lineHeight: 1.4 }}>{k.hint}</div>}
              </div>
            </div>
          );
        })}
      </div>
      {slide.takeaway && (
        <div style={{ fontSize: 28, color: t.soft, marginTop: 32, fontStyle: 'italic', fontFamily: t.fontDisplay }}>
          {slide.takeaway}
        </div>
      )}
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 15. Roadmap ─────────────────────────────────────────────────────────────
function Roadmap({ slide, t, n, total }: LayoutProps<RoadmapSlide>) {
  const periodCount = slide.periods.length;
  const isTech = t.id === 'tech-utility';
  const isHud = t.id === 'broadcast-hud';
  return (
    <div style={{ ...fillStyle(t), padding: `120px ${t.padding}px`, display: 'flex', flexDirection: 'column' }}>
      {slide.eyebrow && <Eyebrow t={t}>{slide.eyebrow}</Eyebrow>}
      <h2 style={{ fontSize: Math.min(t.section, 52), fontWeight: 700, margin: '24px 0 48px', lineHeight: 1.25, fontFamily: t.fontDisplay, maxWidth: 1600 }}>
        {slide.heading}
      </h2>
      {/* 时段表头 */}
      <div style={{
        display: 'grid', gridTemplateColumns: `200px repeat(${periodCount}, 1fr)`,
        borderBottom: `${t.borderWeight}px solid ${t.rule}`, paddingBottom: 16,
      }}>
        <div />
        {slide.periods.map((p) => (
          <div key={p} style={{
            fontSize: 26, fontWeight: 600, color: t.muted,
            fontFamily: isTech || isHud ? t.fontMono : (t.fontEyebrowSerif ?? t.fontDisplay),
            letterSpacing: '0.08em',
          }}>
            {isHud ? `[${p}]` : p}
          </div>
        ))}
      </div>
      {/* 泳道 */}
      {slide.lanes.map((lane, i) => (
        <div key={i} style={{
          display: 'grid', gridTemplateColumns: `200px repeat(${periodCount}, 1fr)`,
          alignItems: 'center', minHeight: 96,
          borderBottom: isTech ? 'none' : `${t.borderWeight}px solid ${t.rule}`,
          backgroundImage: isTech ? `radial-gradient(circle, ${t.border} 1px, transparent 1.5px)` : undefined,
          backgroundSize: isTech ? `${100 / periodCount}% 100%` : undefined,
          backgroundPosition: isTech ? '0 50%' : undefined,
        }}>
          <div style={{
            fontSize: 26, fontWeight: 600, color: t.text,
            fontFamily: isTech ? t.fontMono : t.fontDisplay,
          }}>{lane.name}</div>
          <div style={{ position: 'relative', gridColumn: `2 / span ${periodCount}`, height: 56 }}>
            {lane.items.map((m, j) => {
              const idx = slide.periods.indexOf(m.period);
              if (idx === -1) return null;
              const span = m.span ?? 1;
              const left = `${(idx / periodCount) * 100}%`;
              const width = `calc(${(span / periodCount) * 100}% - 12px)`;
              return (
                <div key={j} style={{
                  position: 'absolute', left, width, top: 0, height: 56,
                  background: m.emphasis ? t.accent : t.text,
                  color: m.emphasis ? t.bg : t.bg,
                  display: 'flex', alignItems: 'center', padding: '0 16px',
                  fontSize: 22, fontWeight: 600,
                  fontFamily: isHud || isTech ? t.fontMono : t.fontDisplay,
                  borderRadius: t.radius > 0 ? 4 : 0,
                  marginLeft: 6, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                  {m.label}
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {slide.legend && (
        <div style={{ marginTop: 24, fontSize: 22, color: t.muted, fontStyle: 'italic' }}>{slide.legend}</div>
      )}
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 16. Case Study ──────────────────────────────────────────────────────────
function CaseStudy({ slide, t, n, total }: LayoutProps<CaseStudySlide>) {
  return (
    <div style={{ ...fillStyle(t), padding: `100px ${t.padding}px`, display: 'flex', flexDirection: 'column' }}>
      {slide.eyebrow && <Eyebrow t={t}>{slide.eyebrow}</Eyebrow>}
      <div style={{ marginTop: 24 }}>
        <div style={{ fontSize: 48, fontWeight: 800, fontFamily: t.fontDisplay, lineHeight: 1.2 }}>{slide.client}</div>
        {slide.clientMeta && <div style={{ fontSize: 22, color: t.muted, marginTop: 4 }}>{slide.clientMeta}</div>}
      </div>
      <div style={{ borderTop: `${t.borderWeight}px solid ${t.rule}`, marginTop: 24, paddingTop: 32, display: 'grid', gridTemplateColumns: '60% 40%', gap: 48, flex: 1 }}>
        {/* 左：叙事 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, paddingRight: 32, borderRight: `${t.borderWeight}px solid ${t.rule}` }}>
          {([['CONTEXT 背景', slide.context], ['CHALLENGE 挑战', slide.challenge], ['APPROACH 方法', slide.approach]] as const).map(([label, body]) => (
            <div key={label}>
              <div style={{ fontSize: t.caption, color: t.muted, fontWeight: 600, letterSpacing: '0.1em', fontFamily: t.fontEyebrowSerif ?? t.fontDisplay }}>{label}</div>
              <div style={{ fontSize: t.body, color: t.text, marginTop: 10, lineHeight: 1.55, fontFamily: t.fontDisplay }}>{body}</div>
            </div>
          ))}
        </div>
        {/* 右：结果 */}
        <div>
          <div style={{ fontSize: t.caption, color: t.accent, fontWeight: 600, letterSpacing: '0.1em', fontFamily: t.fontEyebrowSerif ?? t.fontDisplay, marginBottom: 24 }}>RESULTS 结果</div>
          {slide.results.map((r, i) => (
            <div key={i} style={{ paddingTop: i > 0 ? 24 : 0, marginTop: i > 0 ? 24 : 0, borderTop: i > 0 ? `${t.borderWeight}px solid ${t.rule}` : 'none' }}>
              <div style={{ fontSize: 56, fontWeight: 800, color: t.accent, lineHeight: 1, fontFamily: t.fontDisplay, fontVariantNumeric: 'tabular-nums' }}>{r.value}</div>
              <div style={{ fontSize: 22, color: t.muted, marginTop: 8 }}>{r.metric}</div>
              {r.delta && <div style={{ fontSize: 22, color: t.text, marginTop: 4, fontWeight: 600 }}>{r.delta}</div>}
            </div>
          ))}
        </div>
      </div>
      {slide.quote && (
        <div style={{ marginTop: 32, paddingTop: 24, borderTop: `${t.borderWeight}px solid ${t.rule}` }}>
          <div style={{ fontSize: 26, fontStyle: 'italic', fontFamily: t.fontDisplay, color: t.soft, lineHeight: 1.5 }}>
            &ldquo;{slide.quote}&rdquo;
          </div>
          {slide.quoteAttribution && <div style={{ fontSize: t.caption, color: t.muted, marginTop: 8 }}>— {slide.quoteAttribution}</div>}
        </div>
      )}
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 17. Table ───────────────────────────────────────────────────────────────
function TableLayout({ slide, t, n, total }: LayoutProps<TableSlide>) {
  const isBrutalist = t.id === 'brutalist-mono';
  const isAcademic = t.id === 'academic-paper';
  const isEditorial = t.id === 'editorial-monocle';
  const isLuxe = t.id === 'midnight-luxe';
  const useOldStyle = isAcademic || isEditorial || isLuxe;
  const colCount = slide.columns.length;

  // 三线表：仅在表头顶/表头底/末尾各一线，行间无线
  const topRuleWeight = isAcademic ? 1.5 : t.borderWeight + 0.5;
  const middleRuleWeight = isAcademic ? 0.5 : t.borderWeight;
  const bottomRuleWeight = isAcademic ? 1.5 : t.borderWeight + 0.5;
  const showRowLines = !isAcademic;

  return (
    <div style={{ ...fillStyle(t), padding: `120px ${t.padding}px`, display: 'flex', flexDirection: 'column' }}>
      {slide.eyebrow && <Eyebrow t={t}>{slide.eyebrow}</Eyebrow>}
      {/* academic: Figure n. 衬线斜体小标 */}
      {isAcademic && (
        <div style={{ fontSize: 22, color: t.muted, fontStyle: 'italic', marginTop: 16, fontFamily: t.fontDisplay }}>
          Table {n}. {slide.heading}
        </div>
      )}
      {!isAcademic && (
        <h2 style={{ fontSize: Math.min(t.section, 52), fontWeight: 700, margin: '24px 0 48px', lineHeight: 1.3, fontFamily: t.fontDisplay, maxWidth: 1600 }}>
          {slide.heading}
        </h2>
      )}
      <div style={{ marginTop: isAcademic ? 32 : 0, borderTop: `${topRuleWeight}px solid ${t.rule}` }}>
        {/* 表头 */}
        <div style={{ display: 'grid', gridTemplateColumns: `repeat(${colCount}, 1fr)`, borderBottom: `${middleRuleWeight}px solid ${t.rule}` }}>
          {slide.columns.map((c) => {
            const isHi = slide.highlightColumn === c.id;
            const inverted = isBrutalist && isHi;
            return (
              <div key={c.id} style={{
                fontSize: 22,
                color: isHi && !inverted ? t.accent : t.muted,
                fontWeight: 600,
                letterSpacing: isEditorial ? '0.04em' : '0.1em',
                fontFamily: t.fontEyebrowSerif ?? t.fontDisplay,
                textTransform: isEditorial ? 'none' : 'uppercase',
                fontStyle: isEditorial ? 'italic' : 'normal',
                fontVariant: isEditorial ? 'small-caps' : undefined,
                padding: 24,
                textAlign: c.align ?? 'left',
                background: inverted ? t.text : (isHi && !isAcademic ? `${t.accent}15` : 'transparent'),
              }}>{c.label}</div>
            );
          })}
        </div>
        {/* 行 */}
        {slide.rows.map((row, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: `repeat(${colCount}, 1fr)`,
            borderBottom: showRowLines && i < slide.rows.length - 1 ? `${t.borderWeight}px solid ${t.rule}` : 'none',
            fontWeight: row.emphasis ? 700 : 400,
          }}>
            {slide.columns.map((c) => {
              const isHi = slide.highlightColumn === c.id;
              const inverted = isBrutalist && isHi;
              return (
                <div key={c.id} style={{
                  fontSize: t.body, color: inverted ? t.bg : t.text, padding: 20,
                  textAlign: c.align ?? 'left',
                  background: inverted ? t.text : (isHi && !isAcademic ? `${t.accent}10` : 'transparent'),
                  fontFamily: t.fontDisplay,
                  fontVariantNumeric: c.align === 'right'
                    ? (useOldStyle ? 'tabular-nums oldstyle-nums' : 'tabular-nums')
                    : undefined,
                }}>
                  {row.cells[c.id] ?? '—'}
                </div>
              );
            })}
          </div>
        ))}
        <div style={{ borderTop: `${bottomRuleWeight}px solid ${t.rule}` }} />
      </div>
      {slide.source && (
        <div style={{ marginTop: 24, fontSize: 22, color: t.muted, fontStyle: 'italic' }}>
          {isAcademic ? `Source. ${slide.source}` : slide.source}
        </div>
      )}
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 18. Causality ───────────────────────────────────────────────────────────
function Causality({ slide, t, n, total }: LayoutProps<CausalitySlide>) {
  const count = slide.chain.length;
  const isTech = t.id === 'tech-utility';
  const isBrutalist = t.id === 'brutalist-mono';
  const arrow = isTech ? '─→' : '→';
  const headLines = smartLineBreak(slide.heading, 14, 20);
  const headFs = Math.min(t.section, headLines.length > 1 ? 68 : 80);
  return (
    <div style={{ ...fillStyle(t), padding: `120px ${t.padding}px`, display: 'flex', flexDirection: 'column' }}>
      {slide.eyebrow && <Eyebrow t={t}>{slide.eyebrow}</Eyebrow>}
      <h2
        ref={forceFontStyle(headFs, 700)}
        style={{ fontSize: `${headFs}px`, fontWeight: 700, margin: '24px 0 56px', lineHeight: 1.3, fontFamily: t.fontDisplay, maxWidth: 1700 }}>
        {headLines.map((line, i) => (
          <span key={i} style={{ display: 'block' }}>{line}</span>
        ))}
      </h2>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: isTech ? 16 : 32 }}>
        {slide.chain.map((link, i) => {
          const isLast = i === count - 1;
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: isTech ? 12 : 32, flex: '1 1 0' }}>
              <div style={{
                flex: 1, padding: 24,
                border: isLast ? `${t.borderWeight + 1}px solid ${t.accent}` : `${t.borderWeight}px solid ${t.rule}`,
                background: isBrutalist && isLast ? t.text : (isTech ? t.paper : 'transparent'),
                color: isBrutalist && isLast ? t.bg : t.text,
                minHeight: 200, display: 'flex', flexDirection: 'column', justifyContent: 'center',
                borderRadius: t.radius,
                fontFamily: isTech ? t.fontMono : undefined,
              }}>
                <div style={{
                  fontSize: t.body, fontWeight: 700,
                  fontFamily: isTech ? t.fontMono : t.fontDisplay,
                  lineHeight: 1.35,
                }}>
                  {link.cause}
                </div>
                {link.because && (
                  <div style={{
                    fontSize: t.caption,
                    color: isBrutalist && isLast ? t.bg : t.muted,
                    marginTop: 12, lineHeight: 1.5,
                    fontStyle: isTech ? 'normal' : 'italic',
                    fontFamily: isTech ? t.fontMono : undefined,
                  }}>
                    {isTech && '// '}{link.because}
                  </div>
                )}
              </div>
              {!isLast && (
                <div style={{
                  fontSize: isTech ? 28 : 36,
                  color: isTech ? t.accent : t.text,
                  fontFamily: t.fontMono, flexShrink: 0,
                }}>{arrow}</div>
              )}
            </div>
          );
        })}
      </div>
      {slide.conclusion && (
        <div style={{ marginTop: 48, fontSize: 28, color: t.accent, fontFamily: t.fontDisplay, fontWeight: 700, textAlign: 'center' }}>
          {slide.conclusion}
        </div>
      )}
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 19. Persona ─────────────────────────────────────────────────────────────
function Persona({ slide, t, n, total }: LayoutProps<PersonaSlide>) {
  const initial = slide.name.trim().charAt(0);
  return (
    <div style={{ ...fillStyle(t), padding: `100px ${t.padding}px`, display: 'flex', flexDirection: 'column' }}>
      {slide.eyebrow && <Eyebrow t={t}>{slide.eyebrow}</Eyebrow>}
      <div style={{ display: 'grid', gridTemplateColumns: '480px 1fr', gap: 64, marginTop: 32, flex: 1 }}>
        {/* 左：首字母头像 */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {/* tech-utility: 扫描线背景 */}
          {t.id === 'tech-utility' ? (
            <div style={{
              width: 480, height: 480, background: t.paper,
              border: `${t.borderWeight}px solid ${t.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: t.radius, position: 'relative', overflow: 'hidden',
              backgroundImage: `repeating-linear-gradient(0deg, transparent 0 4px, rgba(255,255,255,0.04) 4px 5px)`,
            }}>
              <div style={{
                fontSize: 280, fontWeight: 800, color: t.accent,
                fontFamily: t.fontMono, lineHeight: 1, letterSpacing: '-0.05em',
                position: 'relative', zIndex: 1,
              }}>{initial}</div>
              <div style={{ position: 'absolute', top: 16, left: 16, fontSize: 14, color: t.muted, fontFamily: t.fontMono, letterSpacing: '0.1em' }}>
                ID://0001
              </div>
            </div>
          ) : t.id === 'brutalist-mono' ? (
            // brutalist: [FACE] mono 占位
            <div style={{
              width: 480, height: 480, background: t.text, color: t.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: `${t.borderWeight}px solid ${t.text}`,
            }}>
              <div style={{
                fontSize: 56, fontWeight: 900, color: t.bg,
                fontFamily: t.fontMono, letterSpacing: '0.1em',
              }}>[FACE]</div>
            </div>
          ) : (
            <div style={{
              width: 480, height: 480, background: t.paper,
              border: `${t.borderWeight}px solid ${t.border}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: t.radius,
            }}>
              <div style={{
                fontSize: 320, fontWeight: 800, color: t.accent,
                fontFamily: t.fontDisplay, lineHeight: 1, letterSpacing: '-0.05em',
              }}>{initial}</div>
            </div>
          )}
          {slide.attributes && slide.attributes.length > 0 && (
            <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {slide.attributes.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 16, fontSize: 22, lineHeight: 1.5, fontFamily: t.fontDisplay }}>
                  <span style={{ color: t.muted, minWidth: 92, letterSpacing: '0.05em' }}>{a.label}</span>
                  <span style={{ color: t.text, fontWeight: 600 }}>{a.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* 右：信息 */}
        <div>
          <div style={{ fontSize: t.section, fontWeight: 800, fontFamily: t.fontDisplay, lineHeight: 1.1 }}>{slide.name}</div>
          <div style={{ fontSize: t.body, color: t.muted, marginTop: 8 }}>{slide.role}</div>
          {slide.quote && (
            <div style={{ marginTop: 32, paddingLeft: 24, borderLeft: `4px solid ${t.accent}` }}>
              <div style={{ fontSize: 28, fontStyle: 'italic', fontFamily: t.fontDisplay, color: t.text, lineHeight: 1.5 }}>
                &ldquo;{slide.quote}&rdquo;
              </div>
            </div>
          )}
          {slide.needs && slide.needs.length > 0 && (
            <div style={{ marginTop: 32 }}>
              <div style={{ fontSize: t.caption, color: t.accent, fontWeight: 600, letterSpacing: '0.15em', fontFamily: t.fontEyebrowSerif ?? t.fontDisplay }}>NEEDS 诉求</div>
              <ul style={{ fontSize: t.body, color: t.text, lineHeight: 1.6, marginTop: 12, paddingLeft: 24 }}>
                {slide.needs.map((nd, i) => <li key={i}>{nd}</li>)}
              </ul>
            </div>
          )}
          {slide.pains && slide.pains.length > 0 && (
            <div style={{ marginTop: 24 }}>
              <div style={{ fontSize: t.caption, color: t.muted, fontWeight: 600, letterSpacing: '0.15em', fontFamily: t.fontEyebrowSerif ?? t.fontDisplay }}>PAINS 痛点</div>
              <ul style={{ fontSize: t.body, color: t.muted, lineHeight: 1.6, marginTop: 12, paddingLeft: 24, listStyleType: 'circle' }}>
                {slide.pains.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 20. Quadrant (5×5 网格定位) ─────────────────────────────────────────────
function Quadrant({ slide, t, n, total }: LayoutProps<QuadrantSlide>) {
  const isBrutalist = t.id === 'brutalist-mono';
  const isTech = t.id === 'tech-utility';
  // 5×5 网格，AI 把点分到 25 个格子，避免重叠
  const cellSize = 100 / 5;
  return (
    <div style={{ ...fillStyle(t), padding: `100px ${t.padding}px`, display: 'flex', flexDirection: 'column' }}>
      {slide.eyebrow && <Eyebrow t={t}>{slide.eyebrow}</Eyebrow>}
      <h2 style={{ fontSize: 48, fontWeight: 700, margin: '20px 0 32px', lineHeight: 1.3, fontFamily: t.fontDisplay, maxWidth: 1600 }}>
        {slide.heading}
      </h2>
      <div style={{ flex: 1, position: 'relative', paddingLeft: 80, paddingBottom: 60 }}>
        {/* y 轴标签 */}
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 60, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ fontSize: 20, color: t.muted, fontFamily: t.fontEyebrowSerif ?? t.fontDisplay }}>↑ {slide.axes.y.high}</div>
          <div style={{ fontSize: 22, color: t.text, fontFamily: t.fontEyebrowSerif ?? t.fontDisplay, fontWeight: 600, transform: 'rotate(-90deg)', transformOrigin: 'left bottom', whiteSpace: 'nowrap' }}>{slide.axes.y.label}</div>
          <div style={{ fontSize: 20, color: t.muted, fontFamily: t.fontEyebrowSerif ?? t.fontDisplay }}>{slide.axes.y.low}</div>
        </div>
        {/* x 轴标签 */}
        <div style={{ position: 'absolute', left: 80, right: 0, bottom: 0, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 20, color: t.muted, fontFamily: t.fontEyebrowSerif ?? t.fontDisplay }}>{slide.axes.x.low}</div>
          <div style={{ fontSize: 22, color: t.text, fontFamily: t.fontEyebrowSerif ?? t.fontDisplay, fontWeight: 600 }}>{slide.axes.x.label}</div>
          <div style={{ fontSize: 20, color: t.muted, fontFamily: t.fontEyebrowSerif ?? t.fontDisplay }}>{slide.axes.x.high} →</div>
        </div>
        {/* 图表区 */}
        <div style={{ position: 'relative', width: '100%', height: '100%', border: `${t.borderWeight}px solid ${t.rule}` }}>
          {/* 中线（仅 modern-minimal / tech-utility 显示） */}
          {(t.id === 'modern-minimal' || isTech) && (
            <>
              <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1, background: t.border, borderLeft: `1px dashed ${t.border}` }} />
              <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: 1, borderTop: `1px dashed ${t.border}` }} />
            </>
          )}
          {/* 数据点 */}
          {slide.points.map((p) => {
            const isHi = slide.highlight === p.id;
            const xPct = (p.gridX + 0.5) * cellSize;
            const yPct = 100 - (p.gridY + 0.5) * cellSize;
            const dotSize = isHi ? 16 : 10;
            return (
              <div key={p.id} style={{
                position: 'absolute', left: `${xPct}%`, top: `${yPct}%`,
                transform: 'translate(-50%, -50%)', display: 'flex', alignItems: 'center', gap: 10,
              }}>
                {isBrutalist ? (
                  <span style={{ fontSize: isHi ? 28 : 22, fontWeight: 900, color: t.text, fontFamily: t.fontMono }}>
                    {isHi ? '◼' : '✕'}
                  </span>
                ) : isTech ? (
                  <div style={{ width: dotSize, height: dotSize, background: isHi ? t.accent : t.text }} />
                ) : (
                  <div style={{ width: dotSize, height: dotSize, background: isHi ? t.accent : t.text, borderRadius: '50%' }} />
                )}
                <span style={{
                  fontSize: isHi ? 22 : 18, fontWeight: isHi ? 700 : 500,
                  color: isHi ? t.accent : t.text, fontFamily: t.fontDisplay, whiteSpace: 'nowrap',
                }}>{p.label}</span>
              </div>
            );
          })}
        </div>
      </div>
      {slide.source && (
        <div style={{ marginTop: 16, fontSize: 20, color: t.muted, fontStyle: 'italic', textAlign: 'right' }}>{slide.source}</div>
      )}
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 21. Question ────────────────────────────────────────────────────────────
function Question({ slide, t, n, total }: LayoutProps<QuestionSlide>) {
  const qLines = smartLineBreak(slide.question, 12, 16);
  const qFs = qLines.length > 1
    ? Math.min(Math.max(t.hero - 60, 64), 84)
    : Math.min(Math.max(t.hero - 40, 76), 96);
  return (
    <div style={{ ...fillStyle(t), padding: `0 ${t.padding * 1.2}px`, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      {slide.eyebrow && <div style={{ marginBottom: 32 }}><Eyebrow t={t}>{slide.eyebrow}</Eyebrow></div>}
      <div style={{ position: 'relative', maxWidth: 1500 }}>
        {/* 巨型 ? 锚点 */}
        <div style={{
          position: 'absolute', left: -60, top: -120, fontSize: 320, fontWeight: 700,
          color: t.accent, opacity: 0.18, fontFamily: t.fontDisplay,
          lineHeight: 1, pointerEvents: 'none',
        }}>?</div>
        <h1
          ref={forceFontStyle(qFs, 700)}
          style={{
            fontFamily: t.fontDisplay, fontSize: `${qFs}px`, fontWeight: 700,
            lineHeight: 1.35, margin: 0, position: 'relative',
          }}>
          {qLines.map((line, i) => (
            <span key={i} style={{ display: 'block' }}>{line}</span>
          ))}
        </h1>
      </div>
      {slide.hints && slide.hints.length > 0 && (
        <div style={{ marginTop: 64, display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1300 }}>
          {slide.hints.map((h, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, fontSize: 26, color: t.muted, lineHeight: 1.5 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.text, marginTop: 14, flexShrink: 0 }} />
              <span>{h}</span>
            </div>
          ))}
        </div>
      )}
      {slide.invitation && (
        <div style={{ position: 'absolute', bottom: 80, left: 0, right: 0, textAlign: 'center', fontSize: 22, color: t.muted, fontStyle: 'italic' }}>
          {slide.invitation}
        </div>
      )}
      <Footer n={n} total={total} t={t} />
    </div>
  );
}

// ─── 注册中心：type → 组件 ────────────────────────────────────────────────────
import type { ComponentType } from 'react';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const LAYOUT_COMPONENTS: Record<string, ComponentType<LayoutProps<any>>> = {
  cover: Cover,
  statement: Statement,
  process: Process,
  data: Data,
  compare: Compare,
  timeline: Timeline,
  argument: Argument,
  quote: Quote,
  diagram: Diagram,
  cta: CTA,
  checklist: Checklist,
  'matrix-2x2': Matrix2x2,
  'chart-bar': ChartBar,
  'kpi-board': KpiBoard,
  roadmap: Roadmap,
  'case-study': CaseStudy,
  table: TableLayout,
  causality: Causality,
  persona: Persona,
  quadrant: Quadrant,
  question: Question,
};

// ─── 主调度器 ────────────────────────────────────────────────────────────────
export function SlideRenderer({ slide, t, n, total, brand, deckTitle }: {
  slide: Slide; t: ThemeTokens; n: number; total: number;
  brand?: BrandOverride; deckTitle?: string;
}) {
  const Comp = LAYOUT_COMPONENTS[slide.type];
  const isCover = slide.type === 'cover' || n === 1;
  const s = slide._style;
  const et: ThemeTokens = s ? {
    ...t,
    ...(s.fontDisplay ? { fontDisplay: s.fontDisplay } : {}),
    ...(s.fontBody ? { fontBody: s.fontBody } : {}),
    ...(s.heroScale != null ? { hero: Math.round(t.hero * s.heroScale) } : {}),
    ...(s.sectionScale != null ? { section: Math.round(t.section * s.sectionScale) } : {}),
    ...(s.bodyScale != null ? { body: Math.round(t.body * s.bodyScale) } : {}),
    ...(s.captionScale != null ? { caption: Math.round(t.caption * s.captionScale) } : {}),
    ...(s.bg ? { bg: s.bg } : {}),
    ...(s.paper ? { paper: s.paper } : {}),
    ...(s.text ? { text: s.text } : {}),
    ...(s.muted ? { muted: s.muted } : {}),
    ...(s.accent ? { accent: s.accent } : {}),
    ...(s.padding != null ? { padding: s.padding } : {}),
  } : t;
  return (
    <div style={{
      position: 'relative', width: '100%', height: '100%',
      background: et.bg, color: et.text, overflow: 'hidden',
    }}>
      <Decoration t={et} bgImageDataUrl={brand?.bgImageDataUrl} />
      <BrandLogo brand={brand} t={et} isCover={isCover} />
      {Comp ? (
        <Comp slide={slide} t={et} n={n} total={total} />
      ) : (
        <div style={{ ...fillStyle(et), padding: 100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 32, color: et.muted }}>未知版式：{slide.type}</div>
        </div>
      )}
      <HUDChrome t={et} n={n} total={total} deckTitle={deckTitle} />
      <EditorialMasthead t={et} n={n} total={total} deckTitle={deckTitle} />
    </div>
  );
}
