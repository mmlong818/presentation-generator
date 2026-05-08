# 架构

## 数据流

```
用户填表
  ↓
POST /api/generate { brief, theme, brand, llm }
  ↓
buildSystemPrompt() 拼接：
  ├─ presentation-coach 方法论（6 框架路由 + Anti-Slop + 5 维自检）
  ├─ layoutSchemasForPrompt() 自动同步的版式 schema
  └─ 输出契约（JSON 格式）
  ↓
callLLM(provider) → Claude / OpenAI / DeepSeek / Claude CLI / ...
  ↓
parseLLMJSON()（剥 markdown / <think> / 弯引号 → JSON）
  ↓ 失败 → 自动重试一次（带纠错指令）
  ↓
validateAndFixDeck() 强约束校验 + 轻微修复
  ├─ matrix-2x2.cells === 4
  ├─ kpi-board.kpis === 4 || 6
  ├─ chart-bar.bars 4-8
  └─ ... per-layout 约束
  ↓
返回 Deck JSON
  ↓
sessionStorage → /deck 渲染
  ↓
SlideRenderer (theme tokens + brand override + chrome)
  ↓
导出：PNG → PDF (jsPDF) / PPTX (pptxgenjs) / TXT (script)
```

---

## 目录结构

```
app/
├── page.tsx              # 主页：表单 + 主题选择 + LLM 配置
├── deck/page.tsx         # 结果页：缩放预览 + 翻页 + 编辑 + 导出
├── preview/page.tsx      # 主题画廊：20 主题 × 11 版式 一站对比
├── api/generate/route.ts # 后端：调 LLM + 解析 + 校验
└── layout.tsx            # 全局 layout

lib/
├── types.ts              # Slide / Deck / Brief / Theme 类型定义
├── themes.ts             # 20 套主题 token 表
├── brand.ts              # Brand override 合并逻辑
├── providers.ts          # 9 LLM provider 预设（client+server 安全）
├── llm.ts                # ⚠ server-only：调 LLM 的 3 种实现
├── prompts.ts            # 系统提示词组装
├── json-extract.ts       # LLM 输出脏数据清洗
├── validate.ts           # slide 强约束校验器
├── export-pdf-pptx.ts    # PDF / PPTX 导出
└── layouts/registry.ts   # 21 版式 schema（写给 AI 看的菜单）

components/
├── SlideEditor.tsx       # 应用内通用字段编辑器
└── layouts/
    ├── shared.tsx        # Eyebrow / Footer / Decoration / RisoText / HUDChrome / EditorialMasthead
    └── index.tsx         # 21 个版式组件 + SlideRenderer 调度器

docs/
├── ARCHITECTURE.md       # 你正在看
├── DATABASE.md           # 接 SQLite/Postgres 指引
└── layout-spec.md        # 设计新版式的规则
```

---

## 核心设计决策

### 1. AI 不写代码，只填 JSON

每个版式是预定义的 React 组件，AI 输出 JSON 数据填进去。

**好处**：
- ✅ 视觉永远一致 / 安全（无代码注入）
- ✅ 可在线编辑（点字段改文字）
- ✅ 切主题瞬间生效
- ✅ 输出小、生成快、便宜

**代价**：
- AI 不能"发明"新版式 —— 但这正是 anti-slop 想要的效果

### 2. Server-only / Client 分层

`lib/llm.ts` 用了 `import 'server-only'` 包护栏。`PROVIDER_PRESETS` 从 `lib/providers.ts` 单独导出（纯数据，client+server 都能 import）。

这样客户端 bundle 不会被拖入 `child_process` / `fs` 等 Node API。

### 3. 主题与版式正交

主题 = 颜色 / 字体 / 装饰 token。版式 = 信息结构。任意组合不会翻车（21 版式 × 20 主题 = 420 种组合）。

部分主题在某些版式上有 signature 覆盖（如 broadcast-hud × kpi-board 加 LIVE 红点），但默认实现足够通用。

### 4. 诊断优先

LLM 输出失败时不会傻报"AI 输出无效"——会展示：
- provider / model
- 首次 + 末次 raw 输出长度
- 前 800 字符内容
- 自动诊断 hint（空字符串 → 提示 OAuth / key 问题）

---

## 扩展点

| 想加什么 | 改哪 | 工作量 |
|---|---|---|
| **新主题** | `lib/themes.ts` 加 token + `lib/prompts.ts` 加气质 | 30 min |
| **新版式** | 4 处：types / index.tsx / registry / validate.ts | 30-60 min |
| **新 LLM provider** | `lib/providers.ts` 加 preset；非 OpenAI 协议另加 `lib/llm.ts` 函数 | 15-30 min |
| **新导出格式** | `lib/export-pdf-pptx.ts` 加函数 + `app/deck/page.tsx` ExportMenu 加按钮 | 30 min |
| **数据库 / 历史记录** | 见 [DATABASE.md](DATABASE.md) | 1-3 小时 |

---

## 不在的功能

为保持核心精简，以下功能不内置（PR 欢迎）：

- 用户系统 / 鉴权
- Deck 数据库持久化
- 协作编辑（多人实时改 deck）
- 移动端原生 app（PWA 已可用）
- 内置图片库 / 图标库
- 真正可编辑的 PPTX（需要重写所有版式为 PowerPoint 原语）

---

## 性能数据

- 单次生成：约 25-45 秒（取决于 LLM provider、density、网络）
- 客户端 bundle：约 850KB gzip 240KB
- /preview 全览模式 20 主题同时渲染：约 1.2 秒首屏，60fps 切换
- PDF 导出 12 张幻灯片：约 8-15 秒（含截图 + 编码）
- PPTX 导出 12 张：类似时间，文件约 10-20 MB（图片质量 1.5×）

---

## 已知限制

1. **导出 PPTX 文字不可在 PowerPoint 编辑** —— 图片版的代价。改文字请回应用内
2. **claude-cli 模式仅本地** —— Vercel 部署没有 claude binary，自动隐藏选项
3. **AI 输出仍可能违反 schema** —— 内置自动重试 + 校验，但偶发会失败。报错时换模型（建议 claude-sonnet-4-5 / gpt-4o）通常解决
4. **手写体字体依赖系统** —— spec 列了 Tiempos / Söhne / Cormorant 等商业字体作首选，未装会 fallback 到免费字体
