# 演讲材料生成器 · Presentation Generator

> 把一个想法，变成一场可放映的演讲。
> 填一段简介 → 选一个风格 → 30 秒后拿到结构化的幻灯片 + 讲稿。

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/mmlong818/presentation-generator)

---

## 为什么不一样

市面 AI 生成 PPT 工具的通病：内容空洞、视觉同质、AI 套路化堆砌。本项目反着做：

- **设计阶段嵌入演讲方法论** —— 6 套主流框架（Winston / 金字塔 / SCQA / Duarte / StoryBrand / SUCCESs）按场景自动路由
- **AI 不写代码，只填结构化数据** —— 21 种版式预定义，AI 只填 JSON。结果：永远视觉一致 / 安全 / 可编辑
- **12 套精选视觉主题，按字号 token 分级** —— 每套主题有自己的 hero/section/body 大小、padding、字体栈
- **真 WYSIWYG 编辑器** —— Konva 画布 + HTML 文字层，双击改文字、拖拽移动、八向缩放、Inspector 编辑字号/颜色/动画
- **可编辑 PPTX 原生导出** —— 基于 pptxgenjs（MIT），可在 PowerPoint / Keynote 中继续编辑
- **全屏演讲模式** —— `/present/[id]` 全屏 + 方向键 + 演讲者视图 + 备注 + 计时器 + 元素入场动画
- **多格式导出** —— PPTX · HTML 自包含单文件 · PDF（浏览器打印）
- **CLI / HTTP API** —— `npx presgen render talk.md` 或 `POST /api/render`，无 UI 也能用
- **11 种 LLM provider** —— Claude / GPT / Gemini / DeepSeek / Kimi / 智谱 / Qwen / xAI / Mistral / OpenRouter / 自定义 / Claude CLI 订阅复用
- **诚信底线硬编码** —— 拒绝编造数据、空洞排比、伪装故事、emoji 装饰

---

## 功能速览

| | |
|---|---|
| **12 套精选主题** | modern-minimal / editorial-monocle / academic-paper / midnight-luxe / swiss-grid / tech-utility / blueprint / cyberpunk-neon / brutalist-mono / pop-magazine / risograph / glassmorphism |
| **21 种版式** | 封面、单句冲击、流程、数据、对比、时间轴、论点、引言、KPI 看板、2×2 矩阵、柱状图、案例研究、人物画像、象限、提问、清单、行动号召、表格、因果链、路线图、示意图 |
| **11 种 LLM** | Claude / GPT / Gemini / DeepSeek / Kimi / 智谱 / Qwen / xAI / Mistral / OpenRouter / 自定义 baseURL / 本地 Claude CLI 订阅 |
| **WYSIWYG 编辑** | `/deck` 双击文本编辑、拖拽缩放、版式切换、+ 文本/图片/图标、Inspector 改字号颜色动画 |
| **演讲模式** | `/present/[id]` 全屏 + ←→ 翻页 + F 演讲者视图 + 备注 + 计时器 + 元素动画 |
| **CLI** | `npx presgen render talk.md --theme=editorial-monocle --out=deck.pptx` |
| **HTTP API** | `POST /api/render`，body `{ markdown / deck, format: pptx/html/json }` |
| **品牌定制** | Logo / 底图 / 自定义主色叠加；`.brandkit.json` 跨 deck 复用 |
| **导出** | PPTX（可编辑）· HTML 自包含 · PDF（浏览器打印）· JSON |

---

## 快速开始

### 前置条件
- Node.js 20+

### 安装与运行

```bash
git clone https://github.com/mmlong818/presentation-generator.git
cd presentation-generator
pnpm install
pnpm dev
```

打开 http://localhost:3000 → 配置 API key（存在浏览器 localStorage，不会上传任何服务器，除目标 LLM）→ 写需求 → 生成大纲 → 改讲稿 → 选风格 → 进入 `/deck` 编辑器 → 导出 PPTX。

### 不想跑 LLM？

```bash
# Markdown → PPTX，跳过 AI 全流程
echo "# 团队应该用 AI

## 为什么是现在
- 市场窗口期短
- 技术成熟度刚好够用
- 团队能力匹配" > talk.md

pnpm dev &      # 起服务
node bin/presgen.mjs render talk.md --theme=editorial-monocle --out=talk.pptx
```

### HTTP API

```bash
curl -X POST http://localhost:3000/api/render \
  -H 'Content-Type: application/json' \
  -d '{"markdown": "# Hi\n\n## Why\n- one\n- two\n- three", "theme": "modern-minimal"}' \
  -o deck.pptx
```

---

## 文档导航

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) —— 数据流、扩展点、目录结构
- [`docs/DATABASE.md`](docs/DATABASE.md) —— 如何接 SQLite / Postgres 做 deck 历史
- [`docs/layout-spec.md`](docs/layout-spec.md) —— 设计新版式的规则
- [`CONTRIBUTING.md`](CONTRIBUTING.md) —— 加新主题 / 新版式的步骤

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

## 隐私

- API key 仅存浏览器 localStorage，不上传服务器（除目标 LLM）
- Logo / 底图均为客户端 base64，不持久化
- 后端只在请求生命周期内持有 key，不写日志（除 raw output 长度 + 前 200 字符的诊断信息，你可在 `app/api/generate/route.ts` 删除）
- 默认无数据库 —— 关页面即丢。需历史记录请参见 `docs/DATABASE.md`

---

## 技术栈

- **Frontend**: Next.js 16（App Router · Turbopack） · React 19 · Tailwind CSS 4 · TypeScript 5
- **LLM SDK**: `@anthropic-ai/sdk` · `openai`（兼容多 provider）
- **Export**: `pptxgenjs`（可编辑 PPTX，纯前端）· `jspdf` + `html-to-image`（PDF）
- **Validation**: `zod` · 自定义 slide 校验器
- **Architecture**: 客户端 / 服务端分层；`server-only` 包护栏；主题 token 系统 (hero/section/body/caption/padding)；可扩展的 layout/theme registry

---

## 贡献

参考 [CONTRIBUTING.md](CONTRIBUTING.md)。新主题 / 版式 / LLM provider 都有清晰的扩展点。

---

## License

**[AGPL-3.0](LICENSE)** © 2025-PRESENT The Presentation Generator Authors

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
html-to-image / zod) are MIT or similarly permissive — compatible with AGPL-3.0
downstream.

### Source link configuration

Forks should set the `NEXT_PUBLIC_SOURCE_URL` environment variable to point at
their own repository so the in-app footer link complies with AGPL §13 for that
deployment.
