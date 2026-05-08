// ─── 主题 token 系统 v1 (canonical 9 themes) ─────────────────────────────────
// 主题是套在所有版式之上的"皮肤"。一个版式 × 9 主题 = 9 张视觉完全不同但信息结构一致的幻灯片。
// 新增主题：在此文件加 ThemeTokens 即可。版式组件读 tokens，不硬编码颜色字号。

import type { ThemeId } from './types';

export type EyebrowStyle =
  | 'plain'              // 默认无装饰
  | 'underline'          // 底部下划线
  | 'rule-top'           // 顶部一道横线
  | 'mono-prefix'        // 等宽 `> _ ` 前缀
  | 'caps-tracking'      // ALL CAPS letter-spacing 0.12em
  | 'serif-italic'       // 衬线斜体小写
  | 'caps-bold'          // ALL CAPS BOLD 无 tracking
  | 'numbered'           // § 2.3 章节编号
  | 'tag-block'          // 色块底反白小字
  | 'live-marker'        // ◉ LIVE 红点 + 等宽
  | 'gold-thin'          // 金色细 tracking-wide caps
  | 'circle-handwritten'; // 衬线斜体 + 波浪下划线

export interface ThemeTokens {
  id: ThemeId;
  name: string;
  description: string;
  mode: 'light' | 'dark';

  // ── 颜色 ────────────────────────────────────────────────────────────────────
  /** 背景。可为纯色 / linear-gradient / radial-gradient */
  bg: string;
  paper: string;        // 卡片/容器底色
  text: string;
  muted: string;
  soft: string;
  border: string;
  rule: string;         // 分割线主色（与 border 可不同）
  accent: string;
  accent2?: string;
  /** 警示色。brutalist 留空表示用 +/- 文字代替 */
  danger?: string;

  // ── 字体 ────────────────────────────────────────────────────────────────────
  fontDisplay: string;
  fontBody: string;
  fontMono: string;
  /** eyebrow 是否强制衬线 */
  fontEyebrowSerif?: string;

  // ── type scale ──────────────────────────────────────────────────────────────
  hero: number;
  section: number;
  body: number;
  caption: number;

  // ── layout ──────────────────────────────────────────────────────────────────
  padding: number;
  radius: number;
  borderWeight: number;
  letterSpacingTitle: string;

  // ── 装饰 ────────────────────────────────────────────────────────────────────
  showFooter: boolean;
  eyebrowStyle: EyebrowStyle;
  /** 声明性：本主题是否允许渐变（运行时不强制，仅用于文档与未来 lint） */
  allowGradient: boolean;
  /** 装饰层（每张幻灯片背后）。CSS background 字符串。 */
  decoration?: string;
  /** 玻璃质感卡片 */
  glass?: boolean;
  /** 特殊纹理规则（仅作文档说明，渲染由组件自行决定） */
  textureRule?: string;
  /** HUD chrome：主题级别在 SlideRenderer 外加四角取景器 + 顶底安全条 */
  hudChrome?: boolean;

  // ── v2 多色主题扩展 ─────────────────────────────────────────────────────────
  /** 4-6 色"指标用色"序列。绑定到 KPI/六宫格的卡片位置 c1..c6（装饰序列，非语义色） */
  palette?: string[];
  /**
   * palette 应用方式：
   * - flat: 平涂色块当卡片底色
   * - gradient-stop: 渐变色段（每色一段）
   * - soft-tint: 半透明叠色（适合东方主题）
   * - risograph-stack: 卡片有彩色错位投影
   * - block-border: 卡片描边或顶部边色
   * - foil-text: 数值文本用渐变 background-clip
   */
  paletteRule?: 'flat' | 'gradient-stop' | 'soft-tint' | 'risograph-stack' | 'block-border' | 'foil-text';
}

export const THEMES: Record<ThemeId, ThemeTokens> = {

  // 1. ────────────────────────────────────────────────────────────────────────
  'soft-warm': {
    id: 'soft-warm',
    name: '暖米奶油',
    description: '柔和人文 · 衬线大字 · 创业故事、用户研究、品牌发布',
    mode: 'light',
    bg: '#f6f4ef',
    paper: '#fffdf7',
    text: '#2a2620',
    muted: '#857d6e',
    soft: '#5a4d3e',
    border: '#d6cfbf',
    rule: '#d6cfbf',
    accent: '#c9591f',
    danger: '#a23b1c',
    fontDisplay: '"Source Han Serif SC","Noto Serif SC",Georgia,serif',
    fontBody: '"PingFang SC","Helvetica Neue","Inter",sans-serif',
    fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Source Han Serif SC",Georgia,serif',
    hero: 124, section: 64, body: 36, caption: 22,
    padding: 160, radius: 0, borderWeight: 0.5,
    letterSpacingTitle: '-0.005em',
    showFooter: false, eyebrowStyle: 'serif-italic', allowGradient: false,
  },

  // 2. ────────────────────────────────────────────────────────────────────────
  'editorial-monocle': {
    id: 'editorial-monocle',
    name: '杂志衬线',
    description: '知识编辑权威 · 黑红衬线 · 行业洞察、深度报告、媒体型 deck',
    mode: 'light',
    bg: '#faf8f3',
    paper: '#ffffff',
    text: '#0f0f0e',
    muted: '#5e5b54',
    soft: '#3d362d',
    border: '#0f0f0e',
    rule: '#0f0f0e',
    accent: '#8a1c1c',
    danger: '#8a1c1c',
    fontDisplay: '"Tiempos Headline","Source Serif 4","Source Han Serif SC",Georgia,serif',
    fontBody: '"Tiempos Text","Source Serif 4","Source Han Serif SC",Georgia,serif',
    fontMono: '"IBM Plex Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Tiempos Headline","Source Serif 4",Georgia,serif',
    hero: 124, section: 64, body: 34, caption: 22,
    padding: 160, radius: 0, borderWeight: 1,
    letterSpacingTitle: '-0.005em',
    showFooter: true, eyebrowStyle: 'serif-italic', allowGradient: false,
  },

  // 3. ────────────────────────────────────────────────────────────────────────
  'modern-minimal': {
    id: 'modern-minimal',
    name: '瑞士网格',
    description: '中性通用 · 蓝 accent · 产品 review、跨部门汇报、通用兜底',
    mode: 'light',
    bg: '#ffffff',
    paper: '#f6f6f5',
    text: '#0a0a0a',
    muted: '#737373',
    soft: '#404040',
    border: '#e5e5e5',
    rule: '#e5e5e5',
    accent: '#1f6feb',
    danger: '#dc2626',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif',
    fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif',
    fontMono: '"JetBrains Mono","SF Mono",ui-monospace,monospace',
    hero: 132, section: 72, body: 36, caption: 22,
    padding: 140, radius: 0, borderWeight: 1,
    letterSpacingTitle: '-0.02em',
    showFooter: false, eyebrowStyle: 'caps-tracking', allowGradient: false,
  },

  // 4. ────────────────────────────────────────────────────────────────────────
  'tech-utility': {
    id: 'tech-utility',
    name: '工程暗色',
    description: '工程数据控制台 · 终端绿青 · 技术分享、SRE、架构评审',
    mode: 'dark',
    bg: '#0a0c0e',
    paper: '#14171a',
    text: '#e6e8eb',
    muted: '#7a8088',
    soft: '#c8ccd4',
    border: '#2a2f35',
    rule: '#2a2f35',
    accent: '#4ade80',
    accent2: '#38bdf8',
    danger: '#f87171',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif',
    fontBody: '"Inter","PingFang SC",sans-serif',
    fontMono: '"JetBrains Mono","SF Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 64, body: 34, caption: 22,
    padding: 140, radius: 2, borderWeight: 1,
    letterSpacingTitle: '-0.015em',
    showFooter: false, eyebrowStyle: 'mono-prefix', allowGradient: false,
  },

  // 5. ────────────────────────────────────────────────────────────────────────
  'brutalist-mono': {
    id: 'brutalist-mono',
    name: '粗野黑白',
    description: '锋利反套路 · 纯黑白 + 反白强调 · 设计 talk、品牌 manifesto',
    mode: 'light',
    bg: '#ffffff',
    paper: '#ffffff',
    text: '#000000',
    muted: '#404040',
    soft: '#262626',
    border: '#000000',
    rule: '#000000',
    accent: '#000000',  // brutalist 无独立 accent，强调用反白
    fontDisplay: '"Helvetica Neue","Arial Black","PingFang SC",sans-serif',
    fontBody: '"Helvetica Neue","Inter","PingFang SC",sans-serif',
    fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 200, section: 100, body: 36, caption: 24,
    padding: 100, radius: 0, borderWeight: 2,
    letterSpacingTitle: '-0.04em',
    showFooter: true, eyebrowStyle: 'caps-bold', allowGradient: false,
  },

  // 6. ────────────────────────────────────────────────────────────────────────
  'academic-paper': {
    id: 'academic-paper',
    name: '学术论文',
    description: '严谨引用 · EB Garamond 衬线 · 白皮书、政策建议、学术报告',
    mode: 'light',
    bg: '#fdfdfb',
    paper: '#ffffff',
    text: '#1c1c1a',
    muted: '#5e5e58',
    soft: '#3d3d38',
    border: '#cfcfca',
    rule: '#cfcfca',
    accent: '#5b1a1a',
    danger: '#5b1a1a',
    fontDisplay: '"Computer Modern Serif","EB Garamond","Source Serif 4","Source Han Serif SC",Georgia,serif',
    fontBody: '"EB Garamond","Source Serif 4","Source Han Serif SC",Georgia,serif',
    fontMono: '"Computer Modern Typewriter","JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"EB Garamond",Georgia,serif',
    hero: 116, section: 60, body: 32, caption: 22,
    padding: 160, radius: 0, borderWeight: 0.5,
    letterSpacingTitle: '0',
    showFooter: true, eyebrowStyle: 'numbered', allowGradient: false,
  },

  // 7. ────────────────────────────────────────────────────────────────────────
  'midnight-luxe': {
    id: 'midnight-luxe',
    name: '深夜奢华',
    description: '高端私享 · 衬线超大 + 金色细线 · 投资人路演、奢侈品/金融',
    mode: 'dark',
    bg: '#0e1116',
    paper: '#161a21',
    text: '#e8e2d4',
    muted: '#8a8478',
    soft: '#cfc7b5',
    border: '#2a2e36',
    rule: '#2a2e36',
    accent: '#c8a96a',
    accent2: '#d4b87f',  // per G review，调亮
    danger: '#c47266',
    fontDisplay: '"Cormorant Garamond","Tiempos Headline","Source Serif 4",Georgia,serif',
    fontBody: '"Inter","Söhne","Helvetica Neue","PingFang SC",sans-serif',
    fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Inter",sans-serif',
    hero: 156, section: 72, body: 34, caption: 22,
    padding: 160, radius: 0, borderWeight: 0.5,
    letterSpacingTitle: '-0.01em',
    showFooter: false, eyebrowStyle: 'gold-thin', allowGradient: false,
  },

  // 8. ────────────────────────────────────────────────────────────────────────
  'risograph': {
    id: 'risograph',
    name: '油印套色',
    description: '设计师手作 · 红蓝错位双色叠印 · 设计周分享、内部 jam、创意提案',
    mode: 'light',
    bg: '#f0e8d8',
    paper: '#f0e8d8',
    text: '#1c1c1c',
    muted: '#6e6a5e',
    soft: '#3a3833',
    border: '#1c1c1c',
    rule: '#1c1c1c',
    accent: '#ff5a5f',
    accent2: '#3858bd',
    danger: '#ff5a5f',
    fontDisplay: '"Söhne Breit","Inter Tight","Inter","PingFang SC",sans-serif',
    fontBody: '"Inter","PingFang SC",sans-serif',
    fontMono: '"DM Mono","JetBrains Mono",ui-monospace,monospace',
    hero: 156, section: 84, body: 34, caption: 22,
    padding: 140, radius: 0, borderWeight: 1,
    letterSpacingTitle: '-0.02em',
    showFooter: false, eyebrowStyle: 'tag-block', allowGradient: false,
    textureRule: '关键图形元素 1-2px 错位双色叠印',
    decoration: 'radial-gradient(circle,rgba(255,90,95,0.10) 1px,transparent 1.5px)',
  },

  // 9. ────────────────────────────────────────────────────────────────────────
  'kraft-paper': {
    id: 'kraft-paper',
    name: '牛皮纸手账',
    description: '工坊手作温度 · 衬线 + 打字机 · 餐饮、教育、可持续品牌、工作坊',
    mode: 'light',
    bg: '#d4b896',
    paper: '#c9a87a',  // ⚠ 故意比 bg 深，模拟"在浅色桌面贴一块深色便签"
    text: '#2a1f15',
    muted: '#5d4a32',
    soft: '#3a2f22',
    border: '#2a1f15',
    rule: '#2a1f15',
    accent: '#1a3d2e',
    accent2: '#6b3410',
    danger: '#8a2a1c',
    fontDisplay: '"Caslon","Lora","Source Serif 4","Source Han Serif SC",Georgia,serif',
    fontBody: '"Lora","Source Serif 4","Source Han Serif SC",Georgia,serif',
    fontMono: '"Special Elite","Courier Prime","JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Lora",Georgia,serif',
    hero: 124, section: 64, body: 32, caption: 22,
    padding: 140, radius: 4, borderWeight: 1,
    letterSpacingTitle: '-0.005em',
    showFooter: true, eyebrowStyle: 'circle-handwritten', allowGradient: false,
    textureRule: '底层叠 4% 不透明度米色噪点 + dashed 分割线',
    decoration: 'radial-gradient(circle,rgba(42,31,21,0.06) 0.5px,transparent 1px)',
  },

  // 10. ───────────────────────────────────────────────────────────────────────
  'broadcast-hud': {
    id: 'broadcast-hud',
    name: '广播 HUD',
    description: '直播节奏 · 黄红 accent + 取景器角标 · 发布会、直播 deck、电竞',
    mode: 'dark',
    bg: '#050709',
    paper: 'rgba(255,255,255,0.04)',
    text: '#ffffff',
    muted: '#9ca3af',
    soft: '#d1d5db',
    border: 'rgba(255,255,255,0.30)',
    rule: 'rgba(255,255,255,0.30)',
    accent: '#fbbf24',
    accent2: '#ef4444',
    danger: '#ef4444',
    fontDisplay: '"Söhne Breit","Inter Tight","Inter","PingFang SC",sans-serif',
    fontBody: '"Inter","PingFang SC",sans-serif',
    fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 156, section: 76, body: 34, caption: 22,
    padding: 160, radius: 0, borderWeight: 1,
    letterSpacingTitle: '-0.025em',
    showFooter: true, eyebrowStyle: 'live-marker', allowGradient: false,
    glass: true,
    hudChrome: true,
  },

  // ────────────────────────────────────────────────────────────────────────────
  // v2 · 10 套浅色多色主题 (T11-T20)
  // ────────────────────────────────────────────────────────────────────────────

  // 11 ────────────────────────────────────────────────────────────────────────
  'pastel-bauhaus': {
    id: 'pastel-bauhaus',
    name: '柔色包豪斯',
    description: '几何拼贴 · 大圆+三角+方 · 教培、文创、设计周',
    mode: 'light',
    bg: '#fbf6ed', paper: '#fbf6ed',
    text: '#1a1a18', muted: '#5a5a55', soft: '#3a3a35',
    border: '#1a1a18', rule: '#1a1a18',
    accent: '#d65a3a', danger: '#d65a3a',
    fontDisplay: '"Archivo Black","Helvetica Neue","PingFang SC",sans-serif',
    fontBody: '"Inter","PingFang SC",sans-serif',
    fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 156, section: 80, body: 34, caption: 22,
    padding: 140, radius: 16, borderWeight: 0,
    letterSpacingTitle: '-0.03em',
    showFooter: false, eyebrowStyle: 'mono-prefix', allowGradient: false,
    palette: ['#ffd1a4','#a4d8e8','#f4b8c4','#c8e0a4','#ffe7a4','#d4c4e8'],
    paletteRule: 'flat',
  },

  // 12 ────────────────────────────────────────────────────────────────────────
  'summer-cocktail': {
    id: 'summer-cocktail',
    name: '夏日鸡尾酒',
    description: '透明色斑模糊 · 玻璃卡 · 节庆、饮品、生活方式',
    mode: 'light',
    bg: '#fff8e8', paper: 'rgba(255,248,232,0.65)',
    text: '#2a1a3a', muted: '#6a4a8a', soft: '#3a2a4a',
    border: 'rgba(106,74,138,0.25)', rule: 'rgba(106,74,138,0.25)',
    accent: '#ff5a8a', accent2: '#2a9a7a', danger: '#ff5a8a',
    fontDisplay: '"Playfair Display","Source Serif 4",Georgia,serif',
    fontBody: '"Inter","PingFang SC",sans-serif',
    fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"JetBrains Mono",ui-monospace,monospace',
    hero: 144, section: 72, body: 34, caption: 22,
    padding: 140, radius: 24, borderWeight: 1.5,
    letterSpacingTitle: '-0.015em',
    showFooter: false, eyebrowStyle: 'mono-prefix', allowGradient: true,
    glass: true,
    palette: ['#ff5a8a','#ffb85a','#c5b8ff','#2a9a7a','#5a8aff','#a55ad6'],
    paletteRule: 'soft-tint',
  },

  // 13 ────────────────────────────────────────────────────────────────────────
  'riso-pastel': {
    id: 'riso-pastel',
    name: '柔光油印',
    description: '亚文化诚意 · 双色错位 · 设计周、独立刊物、文化机构',
    mode: 'light',
    bg: '#fdf3e7', paper: '#fdf3e7',
    text: '#2a2a3a', muted: '#5a5a7a', soft: '#3a3a4a',
    border: '#2a2a3a', rule: '#2a2a3a',
    accent: '#ff8aaf', accent2: '#6ab8e8', danger: '#ff8aaf',
    fontDisplay: '"Archivo Black","Helvetica Neue","PingFang SC",sans-serif',
    fontBody: '"Inter","PingFang SC",sans-serif',
    fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"JetBrains Mono",ui-monospace,monospace',
    hero: 156, section: 80, body: 34, caption: 22,
    padding: 140, radius: 0, borderWeight: 2.5,
    letterSpacingTitle: '-0.025em',
    showFooter: false, eyebrowStyle: 'mono-prefix', allowGradient: false,
    textureRule: '4×4 网点底纹 + 卡片 4-6px 彩色错位投影',
    decoration: 'radial-gradient(circle,rgba(42,42,58,0.10) 1px,transparent 1.5px)',
    palette: ['#ff8aaf','#6ab8e8','#ffd83d','#8ad6a8','#c5a8ff','#ffb85a'],
    paletteRule: 'risograph-stack',
  },

  // 14 ────────────────────────────────────────────────────────────────────────
  'sunrise-gradient': {
    id: 'sunrise-gradient',
    name: '晨曦渐变',
    description: '日出渐变 · 玻璃卡 + foil 数字 · AI/SaaS、年报开篇',
    mode: 'light',
    bg: 'linear-gradient(160deg,#ffe5d4 0%,#ffd1c4 25%,#ffb8c8 50%,#d4b0e0 75%,#b8c4f0 100%)',
    paper: 'rgba(255,255,255,0.45)',
    text: '#3a2845', muted: '#6a4a7a', soft: '#4a3856',
    border: 'rgba(255,255,255,0.6)', rule: 'rgba(255,255,255,0.6)',
    accent: '#ff5a7a', accent2: '#a58aff', danger: '#b06a8a',
    fontDisplay: '"Playfair Display","Source Serif 4",Georgia,serif',
    fontBody: '"Inter","PingFang SC",sans-serif',
    fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"JetBrains Mono",ui-monospace,monospace',
    hero: 144, section: 72, body: 34, caption: 22,
    padding: 140, radius: 18, borderWeight: 1,
    letterSpacingTitle: '-0.015em',
    showFooter: false, eyebrowStyle: 'mono-prefix', allowGradient: true,
    glass: true,
    decoration: 'radial-gradient(circle at 86% 14%,#ffb85a 0px,#ff8a4a 80px,transparent 280px)',
    palette: ['#ff5a7a','#ff8a4a','#ffd83d','#6ad6a8','#6ab8e8','#a58aff'],
    paletteRule: 'foil-text',
  },

  // 15 ────────────────────────────────────────────────────────────────────────
  'playground-block': {
    id: 'playground-block',
    name: '原色积木',
    description: '硬描边 + 硬阴影 · 原色三色 · 教育、儿童、玩乐品牌',
    mode: 'light',
    bg: '#fff8e0', paper: '#ffffff',
    text: '#1a1a18', muted: '#1a1a18', soft: '#1a1a18',
    border: '#1a1a18', rule: '#1a1a18',
    accent: '#ff4d4d', danger: '#ff4d4d',
    fontDisplay: '"Archivo Black","Helvetica Neue","PingFang SC",sans-serif',
    fontBody: '"Inter","PingFang SC",sans-serif',
    fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 200, section: 96, body: 36, caption: 24,
    padding: 120, radius: 28, borderWeight: 4,
    letterSpacingTitle: '-0.03em',
    showFooter: false, eyebrowStyle: 'tag-block', allowGradient: false,
    palette: ['#ff4d4d','#ffd83d','#2e7aff','#2eb56a','#ff8a3d','#ffffff'],
    paletteRule: 'block-border',
  },

  // 16 ────────────────────────────────────────────────────────────────────────
  'tea-ceremony': {
    id: 'tea-ceremony',
    name: '茶席',
    description: '东方克制 · 朱印+衬线竖排 · 文化、东方品牌、典礼',
    mode: 'light',
    bg: '#f7f1e6', paper: '#f7f1e6',
    text: '#2a3a2a', muted: '#6a6a4a', soft: '#3a4a3a',
    border: '#c4b896', rule: '#c4b896',
    accent: '#b8331a', danger: '#b8331a',
    fontDisplay: '"Noto Serif SC","Source Han Serif SC","STKaiti","Source Serif 4",serif',
    fontBody: '"Source Serif 4","Noto Serif SC","Source Han Serif SC",serif',
    fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Noto Serif SC","Source Serif 4",serif',
    hero: 132, section: 64, body: 32, caption: 22,
    padding: 160, radius: 0, borderWeight: 1,
    letterSpacingTitle: '0',
    showFooter: true, eyebrowStyle: 'serif-italic', allowGradient: false,
    palette: [
      'rgba(184,51,26,0.08)','rgba(214,138,158,0.18)','rgba(212,168,42,0.18)',
      'rgba(90,138,74,0.15)','rgba(74,90,138,0.12)','rgba(106,90,42,0.10)',
    ],
    paletteRule: 'soft-tint',
  },

  // 17 ────────────────────────────────────────────────────────────────────────
  'paper-collage': {
    id: 'paper-collage',
    name: '纸艺拼贴',
    description: '剪刀+胶带 · 旋转纸条 · 手工、文创、杂志栏目',
    mode: 'light',
    bg: '#f5efe2', paper: '#fff5d4',
    text: '#2a2418', muted: '#6a5a3a', soft: '#3a3022',
    border: 'rgba(42,36,24,0.15)', rule: 'rgba(42,36,24,0.15)',
    accent: '#c41a1a', danger: '#c41a1a',
    fontDisplay: '"Playfair Display","Source Serif 4",Georgia,serif',
    fontBody: '"Inter","PingFang SC",sans-serif',
    fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 72, body: 34, caption: 22,
    padding: 140, radius: 0, borderWeight: 1,
    letterSpacingTitle: '-0.015em',
    showFooter: false, eyebrowStyle: 'mono-prefix', allowGradient: false,
    palette: ['#fff5d4','#d4e8d4','#ffd1c8','#d4dcf0','#f0d4dc','#f5efe2'],
    paletteRule: 'flat',
    textureRule: 'KPI 卡 ±1.5° 旋转 + 顶部 60×18 黄色胶带',
  },

  // 18 ────────────────────────────────────────────────────────────────────────
  'citrus-grove': {
    id: 'citrus-grove',
    name: '柑橘园',
    description: '球体果实 + 鲜亮 · 餐饮、农业、饮品季报',
    mode: 'light',
    bg: '#fdfaee', paper: '#ffffff',
    text: '#1f3a14', muted: '#4a6a3a', soft: '#2f4a24',
    border: '#1f3a14', rule: '#1f3a14',
    accent: '#ff8a1a', accent2: '#6ad048', danger: '#d65a8a',
    fontDisplay: '"Archivo Black","Helvetica Neue","PingFang SC",sans-serif',
    fontBody: '"Inter","PingFang SC",sans-serif',
    fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 156, section: 80, body: 34, caption: 22,
    padding: 140, radius: 24, borderWeight: 2,
    letterSpacingTitle: '-0.025em',
    showFooter: false, eyebrowStyle: 'mono-prefix', allowGradient: true,
    decoration: 'radial-gradient(circle at 12% 22%,#ffe066 0,#ff9a1a 40px,transparent 120px),radial-gradient(circle at 86% 78%,#d8f87a 0,#6ad048 40px,transparent 130px),radial-gradient(circle at 70% 18%,#ff8a1a 0,#d65a8a 40px,transparent 110px)',
    palette: ['#ffe066','#d8f87a','#ff9a1a','#6ad048','#ff8aa8','#fdfaee'],
    paletteRule: 'block-border',
  },

  // 19 ────────────────────────────────────────────────────────────────────────
  'minimal-rainbow': {
    id: 'minimal-rainbow',
    name: '极简彩虹',
    description: '中性 + 顶部细色条 · SaaS、平台、通用兜底',
    mode: 'light',
    bg: '#fafafa', paper: '#fafafa',
    text: '#1a1a1a', muted: '#888888', soft: '#404040',
    border: '#e5e5e5', rule: '#e5e5e5',
    accent: '#1a1a1a', danger: '#ff5a5a',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif',
    fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif',
    fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 72, body: 36, caption: 22,
    padding: 140, radius: 0, borderWeight: 4,
    letterSpacingTitle: '-0.025em',
    showFooter: false, eyebrowStyle: 'mono-prefix', allowGradient: false,
    palette: ['#ff5a5a','#ffb33d','#ffe14a','#5fcc5f','#4ab8ff','#a55ad6'],
    paletteRule: 'block-border',
  },

  // 20 ────────────────────────────────────────────────────────────────────────
  'pop-magazine': {
    id: 'pop-magazine',
    name: '大字杂志',
    description: '撞色 + 大字 + 黑边 · 媒体、流行、节目宣传',
    mode: 'light',
    bg: '#f0e8d4', paper: '#ffffff',
    text: '#1a1a1a', muted: '#1a1a1a', soft: '#1a1a1a',
    border: '#1a1a1a', rule: '#1a1a1a',
    accent: '#ff3a5a', accent2: '#ffd13a', danger: '#ff3a5a',
    fontDisplay: '"Archivo Black","Helvetica Neue","PingFang SC",sans-serif',
    fontBody: '"Inter","PingFang SC",sans-serif',
    fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 220, section: 96, body: 36, caption: 24,
    padding: 160, radius: 0, borderWeight: 4,
    letterSpacingTitle: '-0.035em',
    showFooter: true, eyebrowStyle: 'caps-bold', allowGradient: false,
    palette: ['#ff3a5a','#ffd13a','#1a1a1a','#3a8aff','#2eb56a','#f0e8d4'],
    paletteRule: 'flat',
  },
};
