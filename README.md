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
- **25 套视觉主题，按字号 token 分级** —— 每套主题有自己的 hero/section/body 大小、padding、字体栈；不靠装饰糊弄
- **真正的 WYSIWYG 编辑器** —— 嵌入 PPTist (Vue 3，AGPL-3.0)，原生支持拖拽 / 撤销 / 导出 PPTX
- **诚信底线硬编码** —— 拒绝编造数据、空洞排比、伪装故事、emoji 装饰
- **5 维自检透明** —— 哲学一致性 / 信息层级 / 执行精度 / 具体性 / 克制度 全部展示给用户

---

## 功能速览

| | |
|---|---|
| **25 套主题** | editorial-monocle / modern-minimal / tech-utility / brutalist-mono / academic-paper / midnight-luxe / risograph / broadcast-hud / pastel-bauhaus / summer-cocktail / pop-magazine / blueprint / cyberpunk-neon / glassmorphism / memphis-pop / midcentury / minimal-white / pitch-deck-vc / retro-tv / swiss-grid / swiss-ikb / tokyo-night / vaporwave / xiaohongshu / open-sticker-pop |
| **21 种版式** | 封面、单句冲击、流程、数据、对比、时间轴、论点、引言、KPI 看板、矩阵、柱状图、案例研究、人物画像、象限、提问、清单、行动号召、表格、因果链、路线、图示 |
| **9 种 LLM** | Claude / GPT / DeepSeek / Kimi / 智谱 / Qwen / OpenRouter / 自定义 baseURL / 本地 Claude CLI 订阅 |
| **PPTist 编辑器** | 全屏 iframe 嵌入；deck → PPTist JSON 转换器自动转换；postMessage 双向通信；快照恢复 / JSON 备份导出 |
| **品牌定制** | 上传 Logo / 底图 / 自定义主色，叠加在任意基础主题上 |
| **PPT 密度** | 每分钟 1 张（深度型）或 2 张（发布型）—— 直接影响 AI 输出张数与讲稿节奏 |
| **导出** | 通过 PPTist 内置：PPTX · PDF · 图片 · JSON |

---

## 快速开始

### 前置条件
- Node.js 20+
- Python 3.10+（`/api/to-pptist` 转换器用）

### 安装与运行

```bash
# clone
git clone https://github.com/mmlong818/presentation-generator.git
cd presentation-generator

# install Node deps
pnpm install

# (一次性) 构建并部署 PPTist 编辑器到 public/pptist/
git clone https://github.com/pipipi-pikachu/PPTist.git ../PPTist
cd ../PPTist && npm install && npm run build-only
mkdir -p ../presentation-generator/public/pptist
cp -r dist/* ../presentation-generator/public/pptist/
cd ../presentation-generator

# run dev server
pnpm dev
```

打开 http://localhost:3000 → 点击模型设置按钮配置 API key（存在浏览器 localStorage，不会上传任何服务器，除目标 LLM）→ 写需求 → 生成大纲 → 改讲稿 → 选风格 → 进入 PPTist 编辑器。

> **注意**：PPTist 集成需要修改其源码（添加 hostBridge，跳过 iframe 模式下的默认 mock 数据加载）。已记录在 [`docs/sessions/2026-05-19-pptist-pivot.md`](docs/sessions/2026-05-19-pptist-pivot.md)。这些修改也是 AGPL-3.0。

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
- 编辑器修改保存为 PPTist 快照（`localStorage['pg_pptist_snapshot']`），跨浏览器不同步。可用顶栏 "↓ 备份 JSON" 导出
- 默认无数据库 —— 关页面即丢。需历史记录请参见 `docs/DATABASE.md`

---

## 技术栈

- **Frontend**: Next.js 16（App Router · Turbopack） · React 19 · Tailwind CSS 4 · TypeScript 5
- **Editor**: PPTist (Vue 3，AGPL-3.0) 通过 iframe + postMessage 集成
- **Converter**: Python 3.10+，deck JSON → PPTist JSON（`pptx-service/converter/`）
- **LLM SDK**: `@anthropic-ai/sdk` · `openai`（兼容多 provider）
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
  right to receive the complete corresponding source code. Operators must surface
  a "Source" link in the running app (footer or About page).
- ❌ **Closed-source commercial use is NOT permitted** under this license. For
  a proprietary / closed-source commercial license, contact the maintainer.

### Third-party components

This project bundles **[PPTist](https://github.com/pipipi-pikachu/PPTist)**
(© pipipi-pikachu, AGPL-3.0) as the embedded WYSIWYG slide editor. See
[NOTICE](NOTICE) for the full attribution of all bundled / integrated third-party
components.

### Source link

Operators deploying this app must publish a link to this repository (or their
modified fork) in the application UI so end-users can comply with AGPL §13. The
project ships with a "Source" link in the page footer by default — do not
remove it from production deployments.
