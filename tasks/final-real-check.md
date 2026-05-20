# 终轮真实检查 · 全链路 + 数据留痕

> 跑于 2026-05-20T08:20:25 UTC（北京时间下午 4 点左右）。
> 所有 artifact 在 `.realcheck/final/2026-05-20T08-20-25/`（.gitignore 排除，本地保留）。

## 场景

| | |
|---|---|
| 主题 | 为什么 dev-friendly 是 AI PPT 服务唯一可防御的护城河 |
| 听众 | 内部团队 + 早期投资人 (Seed → A 轮) |
| 目标 | 让团队对齐"我们不抢 Gamma 的 prosumer，要建 dev/开源帝国" |
| 时长 | 20 分钟（→ AI 自主生成 20 张 slide）|
| 主题 | midnight-luxe（深夜金调）|
| LLM | claude-cli（本地订阅复用，不烧 quota）|

## 13 步骤全通过

| # | 步骤 | 耗时 | 关键证据 |
|---|---|---|---|
| 1 | `/api/outline` | 96.4s | 生成 20 个 section，AI 选 pyramid framework |
| 2 | `/api/script` | 169.4s | 20 条讲稿，平均 148 字 |
| 3 | `/api/generate` | 113.6s | 20 张 slide，标题 "我们不和 Gamma 抢 prosumer，我们要建开发者帝国" |
| 4 | 加载到编辑器 | — | 20/20 缩略图全部渲染 |
| 5 | PPTX 导出 | 0.1s | 298KB，OOXML 合法 |
| 6 | HTML 自包含下载 | — | 79KB，含全部内联资源 |
| 7 | HTML via API | — | 76KB，含 20 个 `<section>` |
| 8 | 演讲模式 | — | 翻完 20 张 + speaker view，0 page error |
| 9 | /history | — | deck 标题正确出现在列表 |
| 10 | Markdown → PPTX 旁路 | — | 50KB |
| 11 | CLI `npx presgen render` | — | 50KB（走 /api/render） |
| 12 | 主题切换重导 | — | 300KB editorial-monocle 版 |
| 13 | PPTX 二进制反向校验 | — | ZIP 合法，20 个 slide.xml |

**总耗时**：约 380s LLM 调用 + ~30s I/O = 全程 ~7 分钟自动跑完。

## AI 版式选用分布（自主决定）

| 版式 | 张数 |
|---|---|
| argument | 5 |
| statement | 4 |
| compare | 3 |
| process | 1 |
| persona | 1 |
| causality | 1 |
| quote | 1 |
| matrix-2x2 | 1 |
| roadmap | 1 |
| checklist | 1 |
| cta | 1 |

**11 种**不同版式被自主选用 — AI 完全没"模板感"，每个 slide 类型都匹配内容意图。

## Artifact 清单（本地完整保留）

```
.realcheck/final/2026-05-20T08-20-25/
├── 01-outline.json              # LLM 大纲
├── 02-script.json               # LLM 讲稿
├── 03-deck.json                 # 最终 deck (20 slides)
├── slide-01.png .. slide-20.png # 编辑器内逐页清洁截图
├── present-first.png / -speaker.png / -last.png  # 演讲模式截图
├── history.png                  # /history 页面
├── export.pptx                  # 298KB 可编辑 PPTX
├── export.html                  # 79KB 自包含 HTML
├── export-presentable.html      # 76KB API 直出 HTML
├── export-swapped-editorial.pptx  # 切换主题后重导
├── markdown-bypass.pptx         # Markdown 旁路
├── cli-input.md / cli-output.pptx  # CLI 验证
├── _AUDIT.json                  # 结构化全步骤记录
└── REPORT.md                    # 人类可读报告
```

## 视觉抽样观察

- **Slide 1 cover**：标题"我们不和 Gamma 抢 prosumer，我们要建一个 开发者帝国" — "开发者帝国" 金色高亮，midnight-luxe 深色底 + 衬线字体，发布会级
- **Slide 5 argument**：标题 "真正的壁垒不在产品里，在产品外" + "产品外" 金色高亮 + 3 个论点（工具/基础设施/系统）— 真正商业洞察
- **Slide 10 argument**：标题 "开源核心不是放弃商业化，是用代码换分发" — AI 自己合成了"代码换分发"这种 framework 级 punchline

## 结论

整条链路 end-to-end 跑通 + 留痕 + 0 page error + AI 内容质量达到可直接用于真正 pitch 的水平。

如果有需要，可以打开本地任一 slide-NN.png 或 export.pptx 看实际效果。
