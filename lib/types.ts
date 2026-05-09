// ─── 演讲生成器 · 核心类型定义 ────────────────────────────────────────────────
// 所有 layout 都继承 LayoutBase。新增 layout：1) 加 type，2) 实现组件，3) 注册。

export type ThemeId =
  // v1（10 套）
  | 'soft-warm'
  | 'editorial-monocle'
  | 'modern-minimal'
  | 'tech-utility'
  | 'brutalist-mono'
  | 'academic-paper'
  | 'midnight-luxe'
  | 'risograph'
  | 'kraft-paper'
  | 'broadcast-hud'
  // v2（10 套 · 浅色多色）
  | 'pastel-bauhaus'
  | 'summer-cocktail'
  | 'riso-pastel'
  | 'sunrise-gradient'
  | 'playground-block'
  | 'tea-ceremony'
  | 'paper-collage'
  | 'citrus-grove'
  | 'minimal-rainbow'
  | 'pop-magazine';

export type LayoutType =
  | 'cover'        // 封面
  | 'statement'    // 单句冲击
  | 'process'      // 流程
  | 'data'         // 数据点
  | 'compare'      // 左右对比
  | 'timeline'     // 时间轴
  | 'argument'     // 论点+支撑
  | 'quote'        // 引言
  | 'diagram'      // 图示（占位）
  | 'cta'          // 行动号召
  | 'checklist'    // 清单
  | 'matrix-2x2'   // 二维矩阵（4 格分类）
  | 'chart-bar'    // 横向柱状对比（4-8 类目）
  | 'kpi-board'    // KPI 看板（4 或 6 项）
  | 'roadmap'      // 季度路线（2-4 lane × 3-4 period）
  | 'case-study'   // 案例研究（背景/挑战/方法 + 结果 + 引言）
  | 'table'        // 紧凑表格（3-5 列 × 3-6 行）
  | 'causality'    // 因果链（3-5 节横向）
  | 'persona'      // 人物画像（首字母头像 + 信息）
  | 'quadrant'     // 散点象限（5-10 个 5×5 网格化定位）
  | 'question';    // 开放提问（巨型问号锚点）

// ─── 各 layout 的数据形状 ────────────────────────────────────────────────────

export interface LayoutBase {
  type: LayoutType;
  /** 章节眉，可选 */
  eyebrow?: string;
}

export interface CoverSlide extends LayoutBase {
  type: 'cover';
  title: string;
  subtitle?: string;
  /** 标题中要高亮的子串（accent 色） */
  highlight?: string;
}

export interface StatementSlide extends LayoutBase {
  type: 'statement';
  title: string;
  highlight?: string[];
  align?: 'center' | 'left';
}

export interface ProcessSlide extends LayoutBase {
  type: 'process';
  heading: string;
  steps: { title: string; desc?: string }[];
}

export interface DataSlide extends LayoutBase {
  type: 'data';
  heading: string;
  stats: {
    /** 数值。无源数据用 "—"（诚实占位） */
    value: string;
    label: string;
    /** 数据来源；无源时填"需引用：[来源类型]" */
    source?: string;
  }[];
}

export interface CompareSlide extends LayoutBase {
  type: 'compare';
  heading: string;
  left: { title: string; items: string[] };
  right: { title: string; items: string[] };
}

export interface TimelineSlide extends LayoutBase {
  type: 'timeline';
  heading: string;
  events: { time: string; title: string; desc?: string }[];
}

export interface ArgumentSlide extends LayoutBase {
  type: 'argument';
  heading: string;
  highlight?: string;
  points: string[];
}

export interface QuoteSlide extends LayoutBase {
  type: 'quote';
  quote: string;
  source: string;
  highlight?: string;
}

export interface DiagramSlide extends LayoutBase {
  type: 'diagram';
  heading: string;
  /** 简化处理：占位文本 */
  hint: string;
}

export interface CTASlide extends LayoutBase {
  type: 'cta';
  /** 删除掉的旧问法 */
  oldQuestion?: string;
  /** 新提议的话 / 行动 */
  newAction: string;
  highlight?: string;
}

export interface ChecklistSlide extends LayoutBase {
  type: 'checklist';
  heading: string;
  items: string[];
}

// ─── matrix-2x2 ──────────────────────────────────────────────────────────────
export interface Matrix2x2Slide extends LayoutBase {
  type: 'matrix-2x2';
  heading: string;
  axes: {
    x: { low: string; high: string };
    y: { low: string; high: string };
  };
  /** 必须 4 个，顺序：左上 / 右上 / 左下 / 右下 */
  cells: [MatrixCell, MatrixCell, MatrixCell, MatrixCell];
  takeaway?: string;
}
export interface MatrixCell {
  label: string;
  desc?: string;
  emphasis?: boolean;
}

// ─── chart-bar ───────────────────────────────────────────────────────────────
export interface ChartBarSlide extends LayoutBase {
  type: 'chart-bar';
  heading: string;
  unit: string;
  /** 4-8 项 */
  bars: ChartBar[];
  /** 要强调的 bar.label */
  highlight?: string;
  source?: string;
}
export interface ChartBar {
  label: string;
  value: number;
  note?: string;
}

// ─── kpi-board ───────────────────────────────────────────────────────────────
export interface KpiBoardSlide extends LayoutBase {
  type: 'kpi-board';
  heading: string;
  period: string;
  /** 必须 4 或 6 项 */
  kpis: Kpi[];
  takeaway?: string;
}
export interface Kpi {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: 'pos' | 'neg' | 'flat';
  hint?: string;
}

// ─── roadmap ─────────────────────────────────────────────────────────────────
export interface RoadmapSlide extends LayoutBase {
  type: 'roadmap';
  heading: string;
  /** 3-4 个时段名 */
  periods: string[];
  /** 2-4 条赛道 */
  lanes: RoadmapLane[];
  legend?: string;
}
export interface RoadmapLane {
  name: string;
  items: RoadmapMilestone[];
}
export interface RoadmapMilestone {
  /** 必须在 periods 中 */
  period: string;
  /** 跨几个时段，默认 1 */
  span?: number;
  label: string;
  emphasis?: boolean;
}

// ─── case-study ──────────────────────────────────────────────────────────────
export interface CaseStudySlide extends LayoutBase {
  type: 'case-study';
  client: string;
  clientMeta?: string;
  context: string;
  challenge: string;
  approach: string;
  /** 1-3 个量化结果 */
  results: CaseResult[];
  quote?: string;
  quoteAttribution?: string;
}
export interface CaseResult {
  metric: string;
  value: string;
  delta?: string;
}

// ─── table ───────────────────────────────────────────────────────────────────
export interface TableSlide extends LayoutBase {
  type: 'table';
  heading: string;
  /** 3-5 列 */
  columns: TableColumn[];
  /** 3-6 行 */
  rows: TableRow[];
  /** column.id */
  highlightColumn?: string;
  source?: string;
}
export interface TableColumn {
  id: string;
  label: string;
  align?: 'left' | 'right' | 'center';
}
export interface TableRow {
  cells: Record<string, string>;
  emphasis?: boolean;
}

// ─── causality ───────────────────────────────────────────────────────────────
export interface CausalitySlide extends LayoutBase {
  type: 'causality';
  heading: string;
  /** 3-5 节因果链 */
  chain: CausalLink[];
  conclusion?: string;
}
export interface CausalLink {
  cause: string;
  because?: string;
}

// ─── persona ─────────────────────────────────────────────────────────────────
export interface PersonaSlide extends LayoutBase {
  type: 'persona';
  /** 显示名（用于首字母头像 + 标题）≤ 12 字 */
  name: string;
  role: string;
  attributes?: PersonaAttr[];
  quote?: string;
  needs?: string[];
  pains?: string[];
}
export interface PersonaAttr {
  label: string;
  value: string;
}

// ─── quadrant ────────────────────────────────────────────────────────────────
export interface QuadrantSlide extends LayoutBase {
  type: 'quadrant';
  heading: string;
  axes: {
    x: { label: string; low: string; high: string };
    y: { label: string; low: string; high: string };
  };
  /** 5-10 个点，坐标用 5×5 网格（gridX/gridY ∈ [0,4] 整数） */
  points: QuadrantPoint[];
  /** 高亮某个 point.id */
  highlight?: string;
  source?: string;
}
export interface QuadrantPoint {
  id: string;
  label: string;
  /** 整数 0-4，对应 5×5 网格列 */
  gridX: number;
  /** 整数 0-4，对应 5×5 网格行 */
  gridY: number;
}

// ─── question ────────────────────────────────────────────────────────────────
export interface QuestionSlide extends LayoutBase {
  type: 'question';
  /** 必须以 ? 或 ？结尾 */
  question: string;
  hints?: string[];
  invitation?: string;
}

export type Slide =
  | CoverSlide
  | StatementSlide
  | ProcessSlide
  | DataSlide
  | CompareSlide
  | TimelineSlide
  | ArgumentSlide
  | QuoteSlide
  | DiagramSlide
  | CTASlide
  | ChecklistSlide
  | Matrix2x2Slide
  | ChartBarSlide
  | KpiBoardSlide
  | RoadmapSlide
  | CaseStudySlide
  | TableSlide
  | CausalitySlide
  | PersonaSlide
  | QuadrantSlide
  | QuestionSlide;

// ─── 整篇 deck ─────────────────────────────────────────────────────────────────

export interface ScriptEntry {
  /** 1-based slide index */
  slideIndex: number;
  text: string;
  durationSec: number;
}

export interface Deck {
  title: string;
  theme: ThemeId;
  /** 用户初始 brief，用于"重新生成"时复用 */
  brief: BriefInput;
  /** 框架名（duarte / pyramid / scqa / winston / storybrand / success） */
  framework: string;
  slides: Slide[];
  script: ScriptEntry[];
  selfReview?: SelfReview;
  /** 定制模式：覆盖主题的 logo / 底图 / 主色 */
  brand?: BrandOverride;
  createdAt: string;
}

export interface BrandOverride {
  /** 自定义 accent 色 */
  accent?: string;
  /** 底图（base64 data URL） */
  bgImageDataUrl?: string;
  /** Logo（base64 data URL） */
  logoDataUrl?: string;
  /** Logo 显示策略 */
  logoPlacement?: 'cover-only' | 'all-corners' | 'footer-right' | 'none';
  /** 自定义 deck 副标题 / 品牌名 */
  brandName?: string;
}

export interface BriefInput {
  topic: string;
  audience: string;
  goal: string;
  durationMin: number;
  /** PPT 密度：每分钟 1 张（慢节奏，每页 ~60s）or 2 张（快节奏，每页 ~30s）。默认 1。 */
  density?: 1 | 2;
  /** 可选：用户已有的核心观点 / 自身故事素材 */
  notes?: string;
}

// ─── 演讲大纲（第一步生成，用户可编辑） ─────────────────────────────────────
export interface Outline {
  /** 演讲题目 */
  title: string;
  /** 框架名（duarte / pyramid / scqa / winston / storybrand / success） */
  framework: string;
  /** 一段话讲整体叙事弧线 */
  arc: string;
  /** 章节列表（顺序即演讲顺序）*/
  sections: OutlineSection[];
}

export interface OutlineSection {
  /** 章节/页面标题（观点句） */
  title: string;
  /** 建议版式（参考 LayoutType；最终可由 deck 阶段调整）*/
  suggestedLayout?: LayoutType;
  /** 这一页要讲什么（1-2 句话）*/
  brief: string;
  /** 时长（秒） */
  durationSec: number;
}

export interface SelfReview {
  philosophy: number;     // 1-5
  hierarchy: number;
  execution: number;
  specificity: number;
  restraint: number;
  notes?: string;
}

// ─── 表单 + 生成请求 ──────────────────────────────────────────────────────────

export interface GenerateRequest {
  brief: BriefInput;
  theme: ThemeId;
  brand?: BrandOverride;
  /** 用户确认（或编辑过）的大纲。为空 → AI 一气呵成 */
  outline?: Outline;
  /** 用户确认（或编辑过）的讲稿。提供时 AI 只生成 slides，不重写讲稿 */
  script?: ScriptEntry[];
  /** Provider 配置：决定调哪个模型 */
  llm: {
    provider: 'anthropic' | 'openai-compat' | 'claude-cli';
    model: string;
    apiKey?: string;
    baseURL?: string;
  };
}

export interface OutlineRequest {
  brief: BriefInput;
  /** 可选：用于内容气质提示。流程线性化后通常省略 */
  theme?: ThemeId;
  llm: GenerateRequest['llm'];
}

export interface OutlineResponse {
  outline: Outline;
}

// ─── 讲稿（独立生成步骤） ────────────────────────────────────────────────────
export interface ScriptRequest {
  brief: BriefInput;
  outline: Outline;
  llm: GenerateRequest['llm'];
}

export interface ScriptResponse {
  script: ScriptEntry[];
}

export interface GenerateResponse {
  deck: Deck;
}
