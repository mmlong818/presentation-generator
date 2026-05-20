# 演讲材料生成器 · Presentation Generator

> 把一个想法，变成一场可放映的演讲。
> 填一段简介 → 选一个风格 → 30 秒后拿到结构化的幻灯片 + 可编辑 PPTX + 演讲模式。

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mmlong818/presentation-generator)

---

## 为什么不一样

市面 AI 生成 PPT 工具的通病：内容空洞、视觉同质、AI 套路化堆砌、导出图片版无法二改。本项目反着做：

- **设计阶段嵌入演讲方法论** — 6 套主流框架（Winston / 金字塔 / SCQA / Duarte / StoryBrand / SUCCESs）按场景自动路由
- **AI 不写代码，只填结构化数据** — 24 种版式预定义，AI 只填 JSON。结果：永远视觉一致 / 安全 / 可编辑
- **12 套精选视觉主题，按字号 token 分级** — 每套有自己的 hero/section/body 尺寸 + padding + 字体栈 + 装饰层（blueprint 网格 / cyberpunk 霓虹 / risograph 颗粒）
- **真 WYSIWYG 编辑器** — Konva 画布 + HTML 文字层，双击改文字、拖拽移动、Shift 多选、方向键微调、Inspector 改字号/颜色/动画、对齐辅助线
- **可编辑 PPTX 原生导出** — 基于 pptxgenjs（MIT），可在 PowerPoint / Keynote 中继续编辑（不是图片版）
- **全屏演讲模式** — `/present/[id]` 全屏 + 方向键 + 演讲者视图 + 备注 + 计时器 + 元素入场动画
- **多格式导出** — PPTX · HTML 自包含单文件 · PDF（浏览器打印）· JSON
- **CLI / HTTP API** — `node bin/presgen.mjs render talk.md` 或 `POST /api/render`，无 UI 也能用（CLI 走本机 dev server）
- **11 种 LLM provider** — Claude / GPT / Gemini / DeepSeek / Kimi / 智谱 / Qwen / xAI / Mistral / OpenRouter / 自定义 baseURL / 本地 Claude CLI 订阅复用
- **局部 LLM 重写** — 编辑器内 ✨ 重写本张 slide，10 秒生成不重做整 deck
- **自动保存 + 历史** — 编辑实时落本地浏览器，刷新不丢；50 条历史 dedupe by createdAt
- **诚信底线硬编码** — 拒绝编造数据、空洞排比、伪装故事、emoji 装饰

---

## 功能速览

| | |
|---|---|
| **24 种版式** | 封面、单句冲击、流程、数据、对比、时间轴、论点、引言、KPI 看板、2×2 矩阵、柱状图、**折线图**、**饼图**、**堆叠面积图**、案例研究、人物画像、象限、提问、清单、行动号召、表格、因果链、路线图、示意图 |
| **12 套精选主题** | modern-minimal / editorial-monocle / academic-paper / midnight-luxe / swiss-grid / tech-utility / blueprint / cyberpunk-neon / brutalist-mono / pop-magazine / risograph / glassmorphism |
| **11 种 LLM** | Claude / GPT / Gemini / DeepSeek / Kimi / 智谱 / Qwen / xAI / Mistral / OpenRouter / 自定义 baseURL / 本地 Claude CLI 订阅 |
| **WYSIWYG 编辑** | 双击改文字 · 拖拽移动 · Shift 多选 · 方向键微调（Shift = 20px）· Ctrl+D 复制 · Ctrl+A 全选 · Ctrl+Z/Y 撤销 250 步 · z-order ⤒⤓ · 对齐辅助线 snap |
| **AI 工具** | ✨ 重写本张 slide（局部 LLM）· ✨ 图片生成（fal.ai / OpenAI）· 整 deck 重生成 |
| **演讲模式** | `/present/[id]` 全屏 + ←→/Space/PgUp/PgDn 翻页 + F 演讲者视图 + 备注 + 计时器 + 7 种元素入场动画 |
| **存储** | 编辑器 debounce 1.5s 自动保存 · 50 条历史 dedupe · localStorage 本地优先 |
| **CLI** | `node bin/presgen.mjs render talk.md --theme=editorial-monocle --out=deck.pptx`（需先启 dev server）|
| **HTTP API** | `POST /api/render`（pptx / html / json）· `POST /api/imagine`（AI 图片）· `POST /api/rewrite-slide`（局部重写） |
| **品牌定制** | Logo / 底图 / 自定义主色叠加；`.brandkit.json` 跨 deck 复用 |
| **导出** | PPTX（可编辑）· HTML 自包含单文件 · PDF（浏览器打印）· JSON |
| **i18n** | 中英双语 UI（编辑器右上角切换）|

---

## 快速开始

### 前置条件
- Node.js 20+
- pnpm 8+（或 npm / yarn）
- 可选：本机已装 Claude Code CLI（用 `claude-cli` provider 不烧 API 额度）

### 安装与运行

```bash
git clone https://github.com/mmlong818/presentation-generator.git
cd presentation-generator
pnpm install
pnpm dev
```

打开 http://localhost:3000 → 配置 API key（存浏览器 localStorage，不上传任何服务器，除目标 LLM）→ 写需求 → 生成大纲 → 改讲稿 → 选风格 → 进入 `/deck` 编辑器 → 导出 PPTX。

### 已有 markdown 大纲，直接出 PPT

适用场景：
- 你的演讲稿是用 Notion / Obsidian / VSCode 写好的 markdown，不想再贴回 web UI
- 想把 GitHub README 一键转成技术分享 PPT
- 用 CI 自动化生成报告 PPT（git 跟踪 markdown 而不是 binary PPTX）

启动一个 dev server（在另一个 terminal）：

```bash
pnpm dev
```

然后 CLI 转 PPTX（不走 LLM，靠 markdown 启发式解析版式）：

```bash
node bin/presgen.mjs render talk.md --theme=editorial-monocle --out=talk.pptx
```

CLI 会 POST 到本机 `/api/render`，默认端口 3000。dev server 不在 3000 时加 `--remote=http://localhost:<port>`。

Markdown 约定：
- `# 标题` = deck 总标题
- `## 章节` = 一张 slide
- `- 项` = bullet（2-5 条自动选 argument 版式；6+ 选 checklist）
- `> 引言` = quote 版式
- `---` = 强制开新 slide

`npx presgen` 待 npm 发布后启用；当前用 `node bin/presgen.mjs`。

### HTTP API

```bash
# Markdown → PPTX
curl -X POST http://localhost:3000/api/render \
  -H 'Content-Type: application/json' \
  -d '{"markdown": "# Hi\n\n## Why\n- one\n- two\n- three", "theme": "modern-minimal"}' \
  -o deck.pptx

# 直接传 Deck JSON（已结构化数据）
curl -X POST http://localhost:3000/api/render \
  -H 'Content-Type: application/json' \
  -d @deck.json -o deck.pptx
```

### 编辑器快捷键

| 操作 | 快捷键 |
|---|---|
| 进入文字编辑 | 双击文字 |
| 多选 | Shift + 单击 |
| 全选当前 slide 元素 | Ctrl/Cmd + A |
| 复制选中（带 +24 偏移） | Ctrl/Cmd + D |
| 撤销 / 重做 | Ctrl/Cmd + Z / Y（栈深 250 步）|
| 微调位置 | 方向键 ±2px / Shift+方向键 ±20px |
| 删除选中 | Delete / Backspace |
| 取消选择 | Esc |
| 切换 slide | 方向键（无元素选中时）|

---

## 文档导航

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — 数据流、扩展点、目录结构
- [`docs/DATABASE.md`](docs/DATABASE.md) — 如何接 SQLite / Postgres 做云存
- [`docs/layout-spec.md`](docs/layout-spec.md) — 设计新版式的规则
- [`CONTRIBUTING.md`](CONTRIBUTING.md) — 加新主题 / 新版式 / 新 provider 的步骤
- [`tasks/world-class-roadmap.md`](tasks/world-class-roadmap.md) — 6 个 Sprint 路线全记录

---

## 部署

### Vercel（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mmlong818/presentation-generator)

零环境变量。访客自带 API key（存浏览器）。

### Docker / 自建

```bash
pnpm build
pnpm start  # 默认 :3000
```

支持 Node 20+ 标准 Next.js 部署。

---

## 隐私 & 数据

- **API key 仅存浏览器 localStorage**，不上传服务器（除目标 LLM 调用本身）
- **Logo / 底图均为客户端 base64**，不持久化
- **deck / 历史 / 编辑状态全本地 localStorage**：刷新不丢，关浏览器仍在；清缓存即清空
- 后端只在请求生命周期内持有 key，不写日志（除 raw output 长度 + 前 200 字符的诊断信息，可在 `app/api/generate/route.ts` 删除）
- 默认无数据库 — 需云端历史/团队协作请参见 [`docs/DATABASE.md`](docs/DATABASE.md)

---

## 技术栈

- **Frontend**: Next.js 16（App Router · Turbopack）· React 19 · Tailwind CSS 4 · TypeScript 5
- **Editor**: react-konva 19（画布） · zustand 5（状态）· lucide-react（图标库 64 个）
- **LLM SDK**: `@anthropic-ai/sdk` · `openai`（兼容多 provider 走 OpenAI API 协议）
- **Export**: `pptxgenjs`（可编辑 PPTX，纯前端）· `jspdf` + `html-to-image`（PDF）· 自研 SVG chart builder
- **Validation**: `zod` · 自定义 slide 校验器
- **Testing**: Vitest（39 单元测试）· Playwright（视觉回归 24 版式 × 12 主题 = 288 cell 矩阵）
- **CI**: GitHub Actions — typecheck + test + build + 视觉回归 artifact 上传
- **Architecture**: 客户端 / 服务端分层 · `server-only` 包护栏 · 主题 token 系统（hero/section/body/caption/padding）· 可扩展的 layout/theme/provider registry

---

## 贡献

参考 [CONTRIBUTING.md](CONTRIBUTING.md)。新主题 / 版式 / LLM provider 都有清晰的扩展点。

人员名单见 [CONTRIBUTORS.md](CONTRIBUTORS.md)。

---

## License

**[AGPL-3.0](LICENSE)** © 2025-PRESENT totoroo and contributors

This project is licensed under the **GNU Affero General Public License v3.0**.

### What this means

- ✅ **Free to use, modify, and run** (personal, commercial, internal tooling)
- ✅ **Free to charge for hosted access**（你可以卖订阅）
- ⚠️ **Strong copyleft**: if you distribute it OR run it as a network service,
  you MUST release the entire source — including your modifications — under AGPL-3.0
- ⚠️ **AGPL §13 (network use)**: every user accessing the deployed app has the
  right to receive the complete corresponding source code. The app ships with a
  "Source" link in the page footer that satisfies this requirement — do not
  remove it in production deployments.
- ❌ **Closed-source commercial use is NOT permitted** under this license. For a
  proprietary / closed-source commercial license, contact the maintainer.

### Third-party dependencies

All NPM dependencies (Next.js / React / Tailwind / pptxgenjs / jspdf /
html-to-image / konva / zustand / lucide-react / zod) are MIT or similarly
permissive — compatible with AGPL-3.0 downstream.

### Source link configuration

Forks should set the `NEXT_PUBLIC_SOURCE_URL` environment variable to point at
their own repository so the in-app footer link complies with AGPL §13 for that
deployment.
