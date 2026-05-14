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

  // ── v3 · html-ppt-skill 移植（26 套）───────────────────────────────────────

  'arctic-cool': {
    id: 'arctic-cool', name: '北极蓝', description: '冰川蓝白 · 清冽专业 · 科技/金融/医疗', mode: 'light',
    bg: '#f2f6fb', paper: '#ffffff', text: '#0e1f33', muted: '#6b819b', soft: '#2a4a6b', border: '#ccd8ea', rule: '#ccd8ea',
    accent: '#1e6fb0', danger: '#c0392b',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 64, body: 34, caption: 22, padding: 140, radius: 4, borderWeight: 1, letterSpacingTitle: '-0.02em',
    showFooter: false, eyebrowStyle: 'caps-tracking', allowGradient: false,
  },

  'aurora-borealis': {
    id: 'aurora-borealis', name: '极光', description: '深宇宙 + 青绿极光 · AI/未来科技/创新', mode: 'dark',
    bg: '#06091c', paper: '#0a1130', text: '#e8f0ff', muted: '#6a7a9e', soft: '#a0b0d0', border: '#1a2040', rule: '#1a2040',
    accent: '#5ef2c6', danger: '#ff6b6b',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 64, body: 34, caption: 22, padding: 140, radius: 4, borderWeight: 1, letterSpacingTitle: '-0.02em',
    showFooter: false, eyebrowStyle: 'mono-prefix', allowGradient: true,
    decoration: 'radial-gradient(ellipse at 30% 20%,rgba(94,242,198,0.15) 0,transparent 50%),radial-gradient(ellipse at 70% 80%,rgba(124,96,255,0.12) 0,transparent 40%)',
  },

  'blueprint': {
    id: 'blueprint', name: '蓝图', description: '工程蓝图 · 等宽字体 · 建筑/工程/技术方案', mode: 'dark',
    bg: '#0b3a6f', paper: '#0a3260', text: '#e8f3ff', muted: '#7da8cf', soft: '#b0d0ef', border: '#3a6090', rule: '#3a6090',
    accent: '#ffffff', danger: '#ff8c42',
    fontDisplay: '"JetBrains Mono","SF Mono",ui-monospace,monospace', fontBody: '"JetBrains Mono","SF Mono",ui-monospace,monospace', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 120, section: 60, body: 30, caption: 20, padding: 140, radius: 0, borderWeight: 1, letterSpacingTitle: '0',
    showFooter: true, eyebrowStyle: 'mono-prefix', allowGradient: false,
    decoration: 'repeating-linear-gradient(0deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(255,255,255,0.03) 0,rgba(255,255,255,0.03) 1px,transparent 1px,transparent 40px)',
  },

  'catppuccin-latte': {
    id: 'catppuccin-latte', name: '猫奇拿铁', description: '奶油柔色 · 开发者友好 · 工具/开源/内部分享', mode: 'light',
    bg: '#eff1f5', paper: '#ffffff', text: '#4c4f69', muted: '#9ca0b0', soft: '#6c6f85', border: '#c5c8d1', rule: '#c5c8d1',
    accent: '#8839ef', danger: '#d20f39',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 64, body: 34, caption: 22, padding: 140, radius: 8, borderWeight: 1, letterSpacingTitle: '-0.02em',
    showFooter: false, eyebrowStyle: 'mono-prefix', allowGradient: false,
    palette: ['#8839ef','#1e66f5','#04a5e5','#40a02b','#fe640b','#df8e1d'],
    paletteRule: 'soft-tint',
  },

  'catppuccin-mocha': {
    id: 'catppuccin-mocha', name: '猫奇摩卡', description: '深色柔色 · 开发者友好 · 工具/开源/夜间主题', mode: 'dark',
    bg: '#1e1e2e', paper: '#313244', text: '#cdd6f4', muted: '#7f849c', soft: '#a6adc8', border: '#45475a', rule: '#45475a',
    accent: '#cba6f7', danger: '#f38ba8',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 64, body: 34, caption: 22, padding: 140, radius: 8, borderWeight: 1, letterSpacingTitle: '-0.02em',
    showFooter: false, eyebrowStyle: 'mono-prefix', allowGradient: false,
    palette: ['#cba6f7','#89b4fa','#94e2d5','#a6e3a1','#fab387','#f9e2af'],
    paletteRule: 'soft-tint',
  },

  'corporate-clean': {
    id: 'corporate-clean', name: '企业蓝', description: '标准企业蓝白 · 通用商务汇报', mode: 'light',
    bg: '#ffffff', paper: '#f5f7fa', text: '#0a2540', muted: '#8898aa', soft: '#3d5a78', border: '#dde3ea', rule: '#dde3ea',
    accent: '#1d4ed8', danger: '#dc2626',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 64, body: 36, caption: 22, padding: 140, radius: 4, borderWeight: 1, letterSpacingTitle: '-0.015em',
    showFooter: true, eyebrowStyle: 'caps-tracking', allowGradient: false,
  },

  'cyberpunk-neon': {
    id: 'cyberpunk-neon', name: '赛博朋克', description: '黑底霓虹紫 · 游戏/科技/发布会', mode: 'dark',
    bg: '#000000', paper: '#0f0f1a', text: '#f5f7ff', muted: '#6b6e8a', soft: '#9a9dc0', border: '#1a0a20', rule: '#1a0a20',
    accent: '#ff2bd6', accent2: '#00e5ff', danger: '#ff2b2b',
    fontDisplay: '"JetBrains Mono","SF Mono",ui-monospace,monospace', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 144, section: 72, body: 34, caption: 22, padding: 140, radius: 0, borderWeight: 1, letterSpacingTitle: '0.02em',
    showFooter: false, eyebrowStyle: 'mono-prefix', allowGradient: true,
    decoration: 'radial-gradient(ellipse at 20% 50%,rgba(255,43,214,0.12) 0,transparent 40%),radial-gradient(ellipse at 80% 50%,rgba(0,229,255,0.08) 0,transparent 40%)',
  },

  'dracula': {
    id: 'dracula', name: '德古拉', description: '紫色暗色系 · 开发者经典 · 技术分享', mode: 'dark',
    bg: '#282a36', paper: '#343746', text: '#f8f8f2', muted: '#6272a4', soft: '#8be9fd', border: '#44475a', rule: '#44475a',
    accent: '#bd93f9', accent2: '#50fa7b', danger: '#ff5555',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 64, body: 34, caption: 22, padding: 140, radius: 8, borderWeight: 1, letterSpacingTitle: '-0.015em',
    showFooter: false, eyebrowStyle: 'mono-prefix', allowGradient: false,
    palette: ['#bd93f9','#ff79c6','#8be9fd','#50fa7b','#ffb86c','#f1fa8c'],
    paletteRule: 'soft-tint',
  },

  'engineering-whiteprint': {
    id: 'engineering-whiteprint', name: '工程白图', description: '白底工程图纸 · 等宽标注 · 硬件/系统设计', mode: 'light',
    bg: '#ffffff', paper: '#f8fafc', text: '#0a1e46', muted: '#8090a8', soft: '#2a4a7a', border: '#0a1e46', rule: '#0a1e46',
    accent: '#1e5ac4', danger: '#c0392b',
    fontDisplay: '"JetBrains Mono","SF Mono",ui-monospace,monospace', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 120, section: 60, body: 30, caption: 20, padding: 140, radius: 0, borderWeight: 1, letterSpacingTitle: '0',
    showFooter: true, eyebrowStyle: 'mono-prefix', allowGradient: false,
    decoration: 'repeating-linear-gradient(0deg,rgba(10,30,70,0.04) 0,rgba(10,30,70,0.04) 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,rgba(10,30,70,0.04) 0,rgba(10,30,70,0.04) 1px,transparent 1px,transparent 40px)',
  },

  'glassmorphism': {
    id: 'glassmorphism', name: '玻璃态', description: '深蓝玻璃质感 · 模糊半透明卡 · AI/科技/产品', mode: 'dark',
    bg: '#0b1024', paper: '#0e1530', text: '#f2f4ff', muted: '#8287a8', soft: '#b0b5d8', border: '#1a2040', rule: '#1a2040',
    accent: '#7dd3fc', accent2: '#a78bfa', danger: '#fb7185',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 144, section: 72, body: 34, caption: 22, padding: 140, radius: 16, borderWeight: 1, letterSpacingTitle: '-0.02em',
    showFooter: false, eyebrowStyle: 'mono-prefix', allowGradient: true,
    glass: true,
    decoration: 'radial-gradient(ellipse at 25% 30%,rgba(125,211,252,0.12) 0,transparent 45%),radial-gradient(ellipse at 75% 70%,rgba(167,139,250,0.10) 0,transparent 40%)',
  },

  'gruvbox-dark': {
    id: 'gruvbox-dark', name: 'Gruvbox 暗', description: '温暖复古暗色 · 开发者/编辑器主题 · 技术', mode: 'dark',
    bg: '#282828', paper: '#3c3836', text: '#ebdbb2', muted: '#928374', soft: '#d5c4a1', border: '#504945', rule: '#504945',
    accent: '#fabd2f', accent2: '#b8bb26', danger: '#fb4934',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 64, body: 34, caption: 22, padding: 140, radius: 4, borderWeight: 1, letterSpacingTitle: '-0.015em',
    showFooter: false, eyebrowStyle: 'mono-prefix', allowGradient: false,
    palette: ['#fabd2f','#b8bb26','#8ec07c','#83a598','#d3869b','#fb4934'],
    paletteRule: 'soft-tint',
  },

  'memphis-pop': {
    id: 'memphis-pop', name: '孟菲斯', description: '80年代几何图案 · 几何色块 · 创意/设计/文化', mode: 'light',
    bg: '#fef6e8', paper: '#ffffff', text: '#111111', muted: '#666666', soft: '#333333', border: '#111111', rule: '#111111',
    accent: '#ff3d8b', accent2: '#3d8bff', danger: '#ff3d8b',
    fontDisplay: '"Archivo Black","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 156, section: 80, body: 34, caption: 22, padding: 140, radius: 0, borderWeight: 3, letterSpacingTitle: '-0.025em',
    showFooter: false, eyebrowStyle: 'caps-bold', allowGradient: false,
    palette: ['#ff3d8b','#3d8bff','#ffe800','#00c9a7','#ff6b35','#a855f7'],
    paletteRule: 'flat',
  },

  'midcentury': {
    id: 'midcentury', name: '中世纪现代', description: '50-60年代暖色 · 衬线 + 黄金色调 · 品牌/历史/经典', mode: 'light',
    bg: '#f3ead8', paper: '#f9f2e0', text: '#201810', muted: '#9a8868', soft: '#4a3820', border: '#8c7050', rule: '#8c7050',
    accent: '#d4902a', danger: '#c0392b',
    fontDisplay: '"Source Serif 4","Noto Serif SC",Georgia,serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Source Serif 4",Georgia,serif',
    hero: 132, section: 64, body: 34, caption: 22, padding: 140, radius: 0, borderWeight: 1, letterSpacingTitle: '-0.01em',
    showFooter: true, eyebrowStyle: 'serif-italic', allowGradient: false,
  },

  'minimal-white': {
    id: 'minimal-white', name: '纯白极简', description: '纯白无装饰 · 极简兜底 · 通用', mode: 'light',
    bg: '#ffffff', paper: '#fafafa', text: '#0c0d10', muted: '#9ca1b0', soft: '#4a4d5a', border: '#e0e0e2', rule: '#e0e0e2',
    accent: '#111216', danger: '#dc2626',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 64, body: 36, caption: 22, padding: 160, radius: 0, borderWeight: 1, letterSpacingTitle: '-0.02em',
    showFooter: false, eyebrowStyle: 'plain', allowGradient: false,
  },

  'nord': {
    id: 'nord', name: 'Nord', description: '北欧极地蓝 · 开发者经典 · 技术分享/工具', mode: 'dark',
    bg: '#2e3440', paper: '#3b4252', text: '#eceff4', muted: '#7b8394', soft: '#d8dee9', border: '#434c5e', rule: '#434c5e',
    accent: '#88c0d0', accent2: '#81a1c1', danger: '#bf616a',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 64, body: 34, caption: 22, padding: 140, radius: 4, borderWeight: 1, letterSpacingTitle: '-0.015em',
    showFooter: false, eyebrowStyle: 'caps-tracking', allowGradient: false,
    palette: ['#88c0d0','#81a1c1','#5e81ac','#a3be8c','#ebcb8b','#bf616a'],
    paletteRule: 'soft-tint',
  },

  'pitch-deck-vc': {
    id: 'pitch-deck-vc', name: 'VC Pitch', description: '标准 VC 风格 · 干净蓝白 · 融资路演', mode: 'light',
    bg: '#ffffff', paper: '#fafbfc', text: '#0b0d12', muted: '#8b93a8', soft: '#2a3048', border: '#e0e4eb', rule: '#e0e4eb',
    accent: '#0070f3', danger: '#ef4444',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 144, section: 72, body: 36, caption: 22, padding: 140, radius: 4, borderWeight: 1, letterSpacingTitle: '-0.025em',
    showFooter: false, eyebrowStyle: 'caps-tracking', allowGradient: false,
  },

  'retro-tv': {
    id: 'retro-tv', name: '复古电视', description: '70年代暖橙 · 衬线复古 · 媒体/品牌历史/怀旧', mode: 'light',
    bg: '#f5ecd7', paper: '#fbf5e2', text: '#2a1a08', muted: '#a68656', soft: '#4a2a10', border: '#c09060', rule: '#c09060',
    accent: '#e67e14', danger: '#c0392b',
    fontDisplay: '"Source Serif 4","Noto Serif SC",Georgia,serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Source Serif 4",Georgia,serif',
    hero: 132, section: 64, body: 34, caption: 22, padding: 140, radius: 0, borderWeight: 1, letterSpacingTitle: '-0.01em',
    showFooter: true, eyebrowStyle: 'serif-italic', allowGradient: false,
  },

  'rose-pine': {
    id: 'rose-pine', name: '玫瑰松针', description: '暗玫瑰紫 · 低调精致 · 设计/文学/创意', mode: 'dark',
    bg: '#191724', paper: '#26233a', text: '#e0def4', muted: '#6e6a86', soft: '#c0bce4', border: '#2a2740', rule: '#2a2740',
    accent: '#ebbcba', accent2: '#9ccfd8', danger: '#eb6f92',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 64, body: 34, caption: 22, padding: 140, radius: 8, borderWeight: 1, letterSpacingTitle: '-0.015em',
    showFooter: false, eyebrowStyle: 'caps-tracking', allowGradient: false,
    palette: ['#ebbcba','#c4a7e7','#9ccfd8','#31748f','#f6c177','#eb6f92'],
    paletteRule: 'soft-tint',
  },

  'sharp-mono': {
    id: 'sharp-mono', name: '锋利等宽', description: '全黑 + Arial Black · 极简粗野 · 设计宣言/manifesto', mode: 'light',
    bg: '#ffffff', paper: '#ffffff', text: '#000000', muted: '#4a4a4a', soft: '#1a1a1a', border: '#000000', rule: '#000000',
    accent: '#000000',
    fontDisplay: '"Archivo Black","Helvetica Neue",sans-serif', fontBody: '"Archivo Black","Helvetica Neue",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 200, section: 100, body: 36, caption: 24, padding: 100, radius: 0, borderWeight: 3, letterSpacingTitle: '-0.04em',
    showFooter: true, eyebrowStyle: 'caps-bold', allowGradient: false,
  },

  'soft-pastel': {
    id: 'soft-pastel', name: '柔粉马卡龙', description: '粉紫柔和 · 圆角卡片 · 美妆/生活方式/女性品牌', mode: 'light',
    bg: '#fdf7fb', paper: '#ffffff', text: '#3a1f33', muted: '#a28a99', soft: '#6a3a58', border: '#d8c0d0', rule: '#d8c0d0',
    accent: '#f49bb8', accent2: '#b49af0', danger: '#e05c8a',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 64, body: 34, caption: 22, padding: 140, radius: 12, borderWeight: 1, letterSpacingTitle: '-0.015em',
    showFooter: false, eyebrowStyle: 'plain', allowGradient: false,
    palette: ['#f49bb8','#b49af0','#97e0f0','#a8d8a0','#ffd08a','#fdf7fb'],
    paletteRule: 'soft-tint',
  },

  'solarized-light': {
    id: 'solarized-light', name: 'Solarized 浅', description: '米黄底蓝字 · 护眼经典 · 技术/学术', mode: 'light',
    bg: '#fdf6e3', paper: '#ffffff', text: '#073642', muted: '#93a1a1', soft: '#2a5060', border: '#c0c8c0', rule: '#c0c8c0',
    accent: '#268bd2', accent2: '#2aa198', danger: '#dc322f',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 64, body: 34, caption: 22, padding: 140, radius: 0, borderWeight: 1, letterSpacingTitle: '-0.015em',
    showFooter: false, eyebrowStyle: 'caps-tracking', allowGradient: false,
  },

  'swiss-grid': {
    id: 'swiss-grid', name: '瑞士网格红', description: '瑞士国际风格 · 红黑网格 · 设计/平面/品牌', mode: 'light',
    bg: '#ffffff', paper: '#f4f4f4', text: '#111111', muted: '#888888', soft: '#2a2a2a', border: '#111111', rule: '#111111',
    accent: '#d6001c', danger: '#d6001c',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 144, section: 72, body: 34, caption: 22, padding: 140, radius: 0, borderWeight: 2, letterSpacingTitle: '-0.025em',
    showFooter: true, eyebrowStyle: 'caps-tracking', allowGradient: false,
  },

  'tokyo-night': {
    id: 'tokyo-night', name: '东京夜晚', description: '蓝紫夜色 · 开发者偏好 · 技术/ACG/夜间', mode: 'dark',
    bg: '#1a1b26', paper: '#24283b', text: '#c0caf5', muted: '#565f89', soft: '#9aa5ce', border: '#2f334d', rule: '#2f334d',
    accent: '#7aa2f7', accent2: '#bb9af7', danger: '#f7768e',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 64, body: 34, caption: 22, padding: 140, radius: 4, borderWeight: 1, letterSpacingTitle: '-0.015em',
    showFooter: false, eyebrowStyle: 'mono-prefix', allowGradient: false,
    palette: ['#7aa2f7','#bb9af7','#7dcfff','#9ece6a','#ff9e64','#f7768e'],
    paletteRule: 'soft-tint',
  },

  'vaporwave': {
    id: 'vaporwave', name: '蒸汽波', description: '紫粉复古未来 · 80年代赛博 · 创意/音乐/潮流', mode: 'dark',
    bg: '#1a0938', paper: '#261050', text: '#fdf0ff', muted: '#8a6ba8', soft: '#d0a8f0', border: '#2a1050', rule: '#2a1050',
    accent: '#ff6ec7', accent2: '#00e5ff', danger: '#ff6b6b',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 144, section: 72, body: 34, caption: 22, padding: 140, radius: 0, borderWeight: 1, letterSpacingTitle: '0.02em',
    showFooter: false, eyebrowStyle: 'caps-tracking', allowGradient: true,
    decoration: 'linear-gradient(180deg,rgba(255,110,199,0.08) 0,rgba(0,229,255,0.06) 100%)',
  },

  'xiaohongshu': {
    id: 'xiaohongshu', name: '小红书', description: '暖白 + 红豆 · 生活方式内容 · 消费/美妆/种草', mode: 'light',
    bg: '#fffdfb', paper: '#ffffff', text: '#1a1210', muted: '#a08d85', soft: '#4a2820', border: '#e8d8d0', rule: '#e8d8d0',
    accent: '#ff2742', danger: '#ff2742',
    fontDisplay: '"Noto Serif SC","Source Han Serif SC",Georgia,serif', fontBody: '"PingFang SC","Microsoft YaHei",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Noto Serif SC",Georgia,serif',
    hero: 132, section: 64, body: 34, caption: 22, padding: 140, radius: 8, borderWeight: 1, letterSpacingTitle: '-0.01em',
    showFooter: false, eyebrowStyle: 'serif-italic', allowGradient: false,
  },

  'y2k-chrome': {
    id: 'y2k-chrome', name: 'Y2K 铬', description: '千禧金属铬 · 渐变紫蓝 · 潮流/科技回顾/时尚', mode: 'light',
    bg: '#dfe4ec', paper: '#eef1f6', text: '#1a1f2e', muted: '#8590a6', soft: '#2a3048', border: '#a0aabf', rule: '#a0aabf',
    accent: '#8a5cff', accent2: '#4ab8ff', danger: '#ff5c8a',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 64, body: 34, caption: 22, padding: 140, radius: 12, borderWeight: 1, letterSpacingTitle: '-0.02em',
    showFooter: false, eyebrowStyle: 'caps-tracking', allowGradient: true,
    decoration: 'linear-gradient(135deg,rgba(138,92,255,0.08) 0,rgba(74,184,255,0.08) 100%)',
  },

  // ── v4 · guizang 系列（9 套）────────────────────────────────────────────────

  'guizang-monocle': {
    id: 'guizang-monocle', name: '归藏·墨白', description: '墨汁纯黑 · 衬线书卷气 · 文化/知识/学术', mode: 'light',
    bg: '#f1efea', paper: '#faf8f3', text: '#0a0a0b', muted: '#5a5850', soft: '#2a2820', border: '#c8c4ba', rule: '#c8c4ba',
    accent: '#0a0a0b', danger: '#8a1a1a',
    fontDisplay: '"Source Serif 4","Noto Serif SC",Georgia,serif', fontBody: '"Source Serif 4","Noto Serif SC",Georgia,serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Source Serif 4",Georgia,serif',
    hero: 132, section: 64, body: 34, caption: 22, padding: 160, radius: 0, borderWeight: 0.5, letterSpacingTitle: '-0.005em',
    showFooter: false, eyebrowStyle: 'serif-italic', allowGradient: false,
  },

  'guizang-indigo': {
    id: 'guizang-indigo', name: '归藏·靛蓝', description: '靛蓝墨色 · 衬线典雅 · 政策/报告/高端商务', mode: 'light',
    bg: '#f1f3f5', paper: '#ffffff', text: '#0a1f3d', muted: '#6080a0', soft: '#1a3a6a', border: '#c0c8d0', rule: '#c0c8d0',
    accent: '#0a1f3d', danger: '#8a1a1a',
    fontDisplay: '"Source Serif 4","Noto Serif SC",Georgia,serif', fontBody: '"Source Serif 4","Noto Serif SC",Georgia,serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Source Serif 4",Georgia,serif',
    hero: 132, section: 64, body: 34, caption: 22, padding: 160, radius: 0, borderWeight: 0.5, letterSpacingTitle: '-0.005em',
    showFooter: false, eyebrowStyle: 'serif-italic', allowGradient: false,
  },

  'guizang-forest': {
    id: 'guizang-forest', name: '归藏·竹绿', description: '竹林暗绿 · 衬线自然 · 可持续/环境/东方', mode: 'light',
    bg: '#f5f1e8', paper: '#faf8f0', text: '#1a2e1f', muted: '#607060', soft: '#253020', border: '#c8c4b0', rule: '#c8c4b0',
    accent: '#1a2e1f', danger: '#8a1a1a',
    fontDisplay: '"Source Serif 4","Noto Serif SC",Georgia,serif', fontBody: '"Source Serif 4","Noto Serif SC",Georgia,serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Source Serif 4",Georgia,serif',
    hero: 132, section: 64, body: 34, caption: 22, padding: 160, radius: 0, borderWeight: 0.5, letterSpacingTitle: '-0.005em',
    showFooter: false, eyebrowStyle: 'serif-italic', allowGradient: false,
  },

  'guizang-dune': {
    id: 'guizang-dune', name: '归藏·沙丘', description: '沙漠暖黄 · 衬线朴素 · 人文/田野/旅行', mode: 'light',
    bg: '#f0e6d2', paper: '#f8f0e0', text: '#1f1a14', muted: '#706050', soft: '#3a2a18', border: '#c8baa8', rule: '#c8baa8',
    accent: '#1f1a14', danger: '#8a1a1a',
    fontDisplay: '"Source Serif 4","Noto Serif SC",Georgia,serif', fontBody: '"Source Serif 4","Noto Serif SC",Georgia,serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Source Serif 4",Georgia,serif',
    hero: 132, section: 64, body: 34, caption: 22, padding: 160, radius: 0, borderWeight: 0.5, letterSpacingTitle: '-0.005em',
    showFooter: false, eyebrowStyle: 'serif-italic', allowGradient: false,
  },

  'guizang-crimson': {
    id: 'guizang-crimson', name: '归藏·深红', description: '深红暗夜 · 衬线戏剧 · 发布会/文学/激情', mode: 'dark',
    bg: '#1a0a0a', paper: '#2a1010', text: '#f5e6e6', muted: '#a07070', soft: '#d0a0a0', border: '#3d1515', rule: '#3d1515',
    accent: '#e63946', danger: '#e63946',
    fontDisplay: '"Source Serif 4","Noto Serif SC",Georgia,serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Source Serif 4",Georgia,serif',
    hero: 132, section: 64, body: 34, caption: 22, padding: 160, radius: 0, borderWeight: 0.5, letterSpacingTitle: '-0.005em',
    showFooter: false, eyebrowStyle: 'serif-italic', allowGradient: false,
  },

  'guizang-slate': {
    id: 'guizang-slate', name: '归藏·石青', description: '石板蓝灰 · 衬线专业 · 科技/金融/正式报告', mode: 'light',
    bg: '#f0f2f4', paper: '#e4e8ec', text: '#1c2330', muted: '#6b7a8d', soft: '#2a3848', border: '#c8d0da', rule: '#c8d0da',
    accent: '#4a6fa5', danger: '#c0392b',
    fontDisplay: '"Source Serif 4","Noto Serif SC",Georgia,serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Source Serif 4",Georgia,serif',
    hero: 132, section: 64, body: 34, caption: 22, padding: 160, radius: 0, borderWeight: 0.5, letterSpacingTitle: '-0.005em',
    showFooter: false, eyebrowStyle: 'serif-italic', allowGradient: false,
  },

  'guizang-amber': {
    id: 'guizang-amber', name: '归藏·琥珀', description: '琥珀暗金 · 衬线典藏 · 金融/文化/奢侈品', mode: 'dark',
    bg: '#1c1608', paper: '#2a2010', text: '#f5ead0', muted: '#a09060', soft: '#d0b880', border: '#3d3010', rule: '#3d3010',
    accent: '#f4a100', danger: '#e06030',
    fontDisplay: '"Source Serif 4","Noto Serif SC",Georgia,serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Source Serif 4",Georgia,serif',
    hero: 132, section: 64, body: 34, caption: 22, padding: 160, radius: 0, borderWeight: 0.5, letterSpacingTitle: '-0.005em',
    showFooter: false, eyebrowStyle: 'serif-italic', allowGradient: false,
  },

  'guizang-teal': {
    id: 'guizang-teal', name: '归藏·松石', description: '松石绿清新 · 衬线自然 · 健康/可持续/东方', mode: 'light',
    bg: '#f0f6f5', paper: '#e0eeec', text: '#0d2b28', muted: '#5a8a85', soft: '#1a4a45', border: '#b8d8d5', rule: '#b8d8d5',
    accent: '#00897b', danger: '#c0392b',
    fontDisplay: '"Source Serif 4","Noto Serif SC",Georgia,serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Source Serif 4",Georgia,serif',
    hero: 132, section: 64, body: 34, caption: 22, padding: 160, radius: 0, borderWeight: 0.5, letterSpacingTitle: '-0.005em',
    showFooter: false, eyebrowStyle: 'serif-italic', allowGradient: false,
  },

  'guizang-night': {
    id: 'guizang-night', name: '归藏·夜蓝', description: '深夜靛蓝 · 衬线宁静 · 冥想/科技哲学/夜间', mode: 'dark',
    bg: '#0a0a0f', paper: '#12121a', text: '#e8e8f0', muted: '#6060a0', soft: '#a0a0d0', border: '#1e1e30', rule: '#1e1e30',
    accent: '#7c7cff', accent2: '#a0a0ff', danger: '#ff6b6b',
    fontDisplay: '"Source Serif 4","Noto Serif SC",Georgia,serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    fontEyebrowSerif: '"Source Serif 4",Georgia,serif',
    hero: 132, section: 64, body: 34, caption: 22, padding: 160, radius: 0, borderWeight: 0.5, letterSpacingTitle: '-0.005em',
    showFooter: false, eyebrowStyle: 'serif-italic', allowGradient: false,
  },

  // ── v5 · swiss 变体（4 套）─────────────────────────────────────────────────

  'swiss-ikb': {
    id: 'swiss-ikb', name: '瑞士·IKB蓝', description: '克莱因蓝 · 瑞士网格 · 艺术/设计/品牌', mode: 'light',
    bg: '#fafaf8', paper: '#ffffff', text: '#0a0a0a', muted: '#737373', soft: '#1a1a1a', border: '#d4d4d2', rule: '#d4d4d2',
    accent: '#002FA7', danger: '#c0392b',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 144, section: 72, body: 34, caption: 22, padding: 140, radius: 0, borderWeight: 2, letterSpacingTitle: '-0.025em',
    showFooter: true, eyebrowStyle: 'caps-tracking', allowGradient: false,
  },

  'swiss-lemon': {
    id: 'swiss-lemon', name: '瑞士·柠檬黄', description: '柠檬黄 · 瑞士网格 · 创意/食品/年轻', mode: 'light',
    bg: '#fafaf8', paper: '#ffffff', text: '#0a0a0a', muted: '#737373', soft: '#1a1a1a', border: '#d4d4d2', rule: '#d4d4d2',
    accent: '#FFD500', danger: '#c0392b',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 144, section: 72, body: 34, caption: 22, padding: 140, radius: 0, borderWeight: 2, letterSpacingTitle: '-0.025em',
    showFooter: true, eyebrowStyle: 'caps-tracking', allowGradient: false,
  },

  'swiss-neon-green': {
    id: 'swiss-neon-green', name: '瑞士·霓虹绿', description: '霓虹绿 · 瑞士网格 · 科技/环保/潮流', mode: 'light',
    bg: '#fafaf8', paper: '#ffffff', text: '#0a0a0a', muted: '#737373', soft: '#1a1a1a', border: '#d4d4d2', rule: '#d4d4d2',
    accent: '#C5E803', danger: '#c0392b',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 144, section: 72, body: 34, caption: 22, padding: 140, radius: 0, borderWeight: 2, letterSpacingTitle: '-0.025em',
    showFooter: true, eyebrowStyle: 'caps-tracking', allowGradient: false,
  },

  'swiss-orange': {
    id: 'swiss-orange', name: '瑞士·橙', description: '活力橙 · 瑞士网格 · 运动/消费/能量', mode: 'light',
    bg: '#fafaf8', paper: '#ffffff', text: '#0a0a0a', muted: '#737373', soft: '#1a1a1a', border: '#d4d4d2', rule: '#d4d4d2',
    accent: '#FF6B35', danger: '#c0392b',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 144, section: 72, body: 34, caption: 22, padding: 140, radius: 0, borderWeight: 2, letterSpacingTitle: '-0.025em',
    showFooter: true, eyebrowStyle: 'caps-tracking', allowGradient: false,
  },

  // ── v6 · open-slide（3 套）─────────────────────────────────────────────────

  'open-aurora': {
    id: 'open-aurora', name: 'Open·极光', description: '紫光暗底 · 通用开放 · 科技/AI/产品', mode: 'dark',
    bg: '#0E0E0E', paper: '#161616', text: '#F5F5F5', muted: '#8B8B8B', soft: '#C5C5C5', border: '#2A2A2A', rule: '#2A2A2A',
    accent: '#A78BFA', accent2: '#60a5fa', danger: '#f87171',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 144, section: 72, body: 34, caption: 22, padding: 140, radius: 4, borderWeight: 1, letterSpacingTitle: '-0.02em',
    showFooter: false, eyebrowStyle: 'caps-tracking', allowGradient: false,
  },

  'open-bright-sans': {
    id: 'open-bright-sans', name: 'Open·亮蓝', description: '谷歌风亮蓝 · 通用开放 · SaaS/工具/教育', mode: 'light',
    bg: '#ffffff', paper: '#f7f9fc', text: '#202124', muted: '#5f6368', soft: '#1a2030', border: '#e8eaed', rule: '#e8eaed',
    accent: '#1a73e8', danger: '#ea4335',
    fontDisplay: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","Helvetica Neue","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 132, section: 64, body: 34, caption: 22, padding: 140, radius: 8, borderWeight: 1, letterSpacingTitle: '-0.02em',
    showFooter: false, eyebrowStyle: 'caps-tracking', allowGradient: false,
  },

  'open-sticker-pop': {
    id: 'open-sticker-pop', name: 'Open·贴纸波普', description: '热粉贴纸 · 撞色边框 · 年轻/潮流/消费', mode: 'light',
    bg: '#fff2e8', paper: '#ffe6d3', text: '#2d1b4e', muted: '#9a8aa8', soft: '#4a2a70', border: '#2d1b4e', rule: '#2d1b4e',
    accent: '#ff4d8d', accent2: '#ffd600', danger: '#ff4d8d',
    fontDisplay: '"Archivo Black","Helvetica Neue","PingFang SC",sans-serif', fontBody: '"Inter","PingFang SC",sans-serif', fontMono: '"JetBrains Mono",ui-monospace,monospace',
    hero: 156, section: 80, body: 34, caption: 22, padding: 120, radius: 12, borderWeight: 3, letterSpacingTitle: '-0.03em',
    showFooter: false, eyebrowStyle: 'caps-bold', allowGradient: false,
    palette: ['#ff4d8d','#ffd600','#2d1b4e','#00e5ff','#b6ff00','#fff2e8'],
    paletteRule: 'block-border',
  },
};
