# 2026-05-19 · 架构转向 PPTist + 转换器原型

## 本次会话的核心决定

**放弃自研 WYSIWYG 编辑器，整体替换为 PPTist（Vue 3，~20k stars，MIT）**。

### 决定原因
- 自研 PPTEditor（`components/PPTEditor.tsx`）调试了一整天，连续踩坑：
  - contentEditable 被 React reconciliation 修剪掉用户输入
  - SelectionFrame 因 overlay 扩区导致坐标偏移
  - `_layout` 与 risograph 装饰层不兼容
  - `position: fixed` 在 transform 祖先下退化
  - rect-recompute useEffect 无限循环
- 用户失去信心，明确要求"不修了，而且不要了，直接替换"
- PPTist 已经把这些坑全趟过，并实现了远超自研的能力（导入导出 pptx、撤销、动画、协同等）

### 选定的整体架构（待执行）
- **前端**：保留 React (Next.js 当纯前端)。删除 `components/PPTEditor.tsx` / `DirectEditOverlay.tsx` / `SlideEditor.tsx`、删除 `components/layouts/*`（PPTist 接管渲染）、删除 `app/preview` `app/deck` 老编辑路径。
- **后端**：迁移到 FastAPI + SQLite。当前 Next.js `app/api/*` 全部迁移；`pptx-service/`（已存在的 Python 服务）合并进新 FastAPI 服务。
- **PPTist 集成方式**：iframe + postMessage。PPTist 自部署到 `/pptist/` 子路径。
- **源 of truth**：deck JSON（语义化）保留为源；PPTist JSON 是衍生物。AI 仍然生成 deck JSON，进编辑器时实时转换。
- **不做往返转换**：PPTist JSON → deck JSON 是启发式地狱（60-100h，碎），不投入。

## 本次会话完成的工作

### 1. 已完成（虽然现在用不上，但仍 commit 价值的）
- `components/PPTEditor.tsx`：修复 contentEditable 保存丢失（mount 时 `el.textContent = initial`，渲染空 div）、Esc / Ctrl+Enter / Enter（换行）键位、portal 工具栏到 body 避开 transform 影响、`OVERLAY_PAD = 400` 让画外元素可点
- `components/layouts/shared.tsx`：`Eyebrow` 接受 `efKey` prop，所有分支添加 `data-ef`
- `components/layouts/index.tsx`：21 个版式批量补 `data-ef`（子代理任务）—— 详细 path 清单见 git diff
  - Data: stats.${i}.value / label / source
  - Compare: heading / left.title / left.items.${i} / right.title / right.items.${i}
  - Timeline / Matrix2x2 / ChartBar / KpiBoard / Roadmap / CaseStudy / Table / Causality / Persona / Quadrant / Question 等全覆盖
- `app/deck/page.tsx`：清理脏 `_styles` 的判定加入 `!sv.color && !sv.textAlign` 守卫；编辑模式 scale × 0.78、`overflow: visible`、虚线边框
- risograph 封面：红色偏移装饰从兄弟 `<h1>` 改为 `data-ef` h1 的子 `<span>`（绝对定位），让 layout 拖动时跟随

### 2. 本次会话的真正产出 —— **deck → PPTist JSON 转换器原型**

位置：`pptx-service/converter/`

```
pptx-service/converter/
├── __init__.py          # deck_to_pptist(deck) -> dict 入口
├── __main__.py          # CLI: python -m converter <deck.json> [out.json]
├── geometry.py          # SCALE = 1000/1920 = 0.5208；sx/sy/sfont
├── theme.py             # FlatTheme.from_theme_id(...).to_pptist_theme()
│                        # 复用 pptx-service/theme.py 的 26 套 ThemeColors
├── text.py              # prosemirror HTML 构造：paragraph / simple / with_highlight
│                        # 产生 <p><strong><span style="color:..; font-size:..px;">..</span></strong></p>
├── ids.py               # nanoid(10) 短 ID
├── layouts/
│   ├── __init__.py      # LAYOUTS 注册表 dict
│   ├── cover.py         ✓
│   ├── statement.py     ✓
│   ├── argument.py      ✓
│   ├── compare.py       ✓ (使用 shape 元素做面板背景)
│   └── data.py          ✓
├── sample_deck.json     # 5 张测试 slide
└── sample_pptist.json   # 13KB 转换产物（已验证视觉 OK）
```

### 3. 验证状态
- 用户已经在 PPTist 在线 demo 验证过 `sample_pptist.json`
- 反馈："大体可以"
- 唯一问题：argument / data 的横线（`line` 元素）在 PPTist 里渲染成灰色面板 → **已修**（删除横线装饰，留待后续用 shape 矩形代替）

### 4. PPTist Schema 关键信息（已确认）
- **viewport**：1000 × 562.5（width=1000, ratio=0.5625）
- **text element**：`{ id, type:'text', left, top, width, height, rotate, content(prosemirror HTML), defaultFontName, defaultColor, lineHeight? }`
- **line element**：`Omit<PPTBaseElement, 'height'|'rotate'>`，需要 `start: [x,y], end: [x,y], style, color, points: [LinePoint, LinePoint]`
  - **本次踩坑**：我们 emit 的 line 在 PPTist 里渲染成灰色面板，疑似缺 `path` 字段。**后续如需横线分隔，用扁矩形 shape 代替更稳。**
- **shape element**：`{ viewBox: [w,h], path, fixedRatio, fill, opacity }` —— compare 面板用过，渲染 OK
- **theme**：`{ themeColors: string[6], fontColor, fontName, backgroundColor }`
- **slide background**：`{ type: 'solid', color }`
- **slide.remark**：演讲稿字符串，对应当前 deck 的 script[].text

## 下次登入要做的事（按优先级）

### Phase A：补完剩余 16 个版式转换器（8-10h）
按现有 `layouts/cover.py` 等的模式，每个版式约 30-40 行 Python。顺序建议：

1. **简单**：quote, cta, checklist, question, diagram（每个 30 min）
2. **中等**：process, timeline, persona（每个 45 min）
3. **复杂**：matrix-2x2, kpi-board, case-study, table, causality, quadrant（每个 60-90 min）
4. **最复杂**：chart-bar（直接映射 PPTist `PPTChartElement`，~ 90 min）, roadmap（lane × period 网格，~ 90 min）

补完之后，用 `app/deck/fixture` 或一个完整生成的 deck 跑一遍，全 21 版式视觉验证。

### ✅ Phase A 已完成（2026-05-19 续）

- 补完 16 个版式转换器：quote / cta / checklist / question / diagram / process / timeline / persona / matrix-2x2 / kpi-board / case-study / table / causality / quadrant / chart-bar / roadmap
- 抽取 `layouts/_common.py`（eyebrow_el / heading_el / text_el / rect_shape）
- 新增 `sample_all_layouts.json`（21 版式完整覆盖测试 deck）
- 全量转换 → `sample_all_pptist.json`（约 107 KB）
- PPTist 在线 demo 视觉验证通过

视觉调优记录（避免下次重做）：
- **整体上移**：eyebrow 120→60、heading 180→120、content_top 普遍 -120（heading 紧贴 eyebrow，避免内容下沉）
- **chart-bar 对齐**：label / bar / value 同一 `by` 基线；预留右侧 140px value 槽位防溢出
- **matrix-2x2 轴标签**：y 轴标签宽度 90→170 + 右对齐（避免"成本低"换行）；x 轴标签 `+16` → `-8`（贴近网格底边）
- **persona 防重叠**：attributes 高度 120→180 + lineHeight 1.7→1.5；quote 移到 attributes 下方 550；底部面板 640 起步
- **PPTist 缓存陷阱**：导入 JSON 后修改要重新"文件→导入"，PPTist 不会热重载

### Phase B：自部署 PPTist + iframe 集成（1-1.5 day）
1. 把 PPTist 仓库 clone 到本地，按其 README build 为静态站点
2. 部署到 `public/pptist/` 或独立路径
3. 主站新增 `/edit` 页面（或替换 `/deck`），里面嵌 iframe
4. 写 postMessage 协议：
   - 主站 → iframe：`{ type: 'load', presentation: {...} }`
   - iframe → 主站：`{ type: 'save', presentation: {...} }`、`{ type: 'export-pptx', blob }` 等
5. PPTist 端需要少量改动支持 postMessage（参考其 [openSource branch issues](https://github.com/pipipi-pikachu/PPTist/issues?q=postMessage)）

### Phase C：后端迁移 FastAPI + SQLite（2-3 day）
1. 新建 `backend/` 目录，FastAPI 项目
2. 复用 `pptx-service/` 的 Python 代码（直接合并）
3. 端点迁移：
   - `app/api/outline/route.ts` → `POST /api/outline`
   - `app/api/script/route.ts` → `POST /api/script`
   - `app/api/generate/route.ts` → `POST /api/generate`
   - `pptx-service/main.py` 的 pptx export → `POST /api/export/pptx`
   - 新增：`POST /api/deck`（保存）、`GET /api/deck/{id}`、`GET /api/decks`、`POST /api/deck/{id}/pptist`（按需转换）
4. SQLAlchemy + SQLite：`Deck` 表（id, title, theme, deck_json, pptist_json?, created_at, updated_at）
5. 前端 fetch 改打 FastAPI 地址（环境变量）

### Phase D：清理老代码（0.5 day）
- 删除 `components/PPTEditor.tsx` / `DirectEditOverlay.tsx` / `SlideEditor.tsx`
- 删除 `components/layouts/*`（PPTist 接管渲染）
- 删除或简化 `app/deck`（合并到 `/edit`）
- 删除 `app/preview`（主题画廊已经不再需要 —— 主题概念由转换器内部消化）
- `lib/themes.ts` 保留（转换器引用其 token）
- `lib/types.ts` 保留（deck schema 仍是 AI 输出的标准）

## 当前 git 状态（未提交的改动）

```
modified:   app/page.tsx
modified:   app/preview/page.tsx
modified:   app/style/page.tsx
modified:   app/deck/page.tsx        # 编辑模式缩放 + 脏样式清理
modified:   components/SlideEditor.tsx  # 未引用，可删除
modified:   components/PPTEditor.tsx    # 各种修复（虽然这玩意要删了）
modified:   components/layouts/index.tsx   # 21 版式补 data-ef
modified:   components/layouts/shared.tsx  # Eyebrow 加 efKey
modified:   lib/prompts.ts
modified:   lib/themes.ts
modified:   pptx-service/theme.py
?? components/DirectEditOverlay.tsx   # 未引用，删除
?? pptx-service/converter/           # 本次新增产物 —— 重点保留
?? pptx-service/test_generate.py
?? docs/sessions/2026-05-18-night-iteration.md
?? docs/sessions/2026-05-19-pptist-pivot.md  # 本文件
?? docs/superpowers/plans/2026-05-14-pptx-native-service.md
```

**建议提交策略**：
- 一次 commit：`feat(converter): deck → PPTist JSON converter prototype (5 layouts)` —— 主要内容
- 另一次 commit：`docs(session): pivot to PPTist + 5-layout converter validated` —— 本文档
- PPTEditor / layouts/data-ef / Eyebrow 的改动可以 commit 但**要标注 deprecated**，因为整套要删。或者干脆 stash 掉等 phase D 时统一删除。

## 关键决策记录（避免下次重新讨论）

- **Q：源 of truth 是 deck 还是 PPTist JSON？** A：deck（保留 AI 再生成能力）
- **Q：前端 Vite 还是继续 Next.js？** A：继续 Next.js 当纯前端
- **Q：PPTist 怎么嵌？** A：iframe + postMessage
- **Q：要不要做 PPTist → deck 反向转换？** A：不做，启发式地狱
- **Q：要不要保留当前 PPTEditor 作"快速编辑"补充？** A：不保留，全部由 PPTist 接管
- **Q：26 套主题怎么办？** A：转换器扁平化为 PPTist 的 `theme.themeColors[6] + fontColor + fontName + backgroundColor`，视觉约 85% 还原，可接受
- **Q：横线分隔等装饰元素怎么办？** A：删除装饰，或用 shape 矩形代替（line 元素 PPTist 渲染异常）

## 可恢复性检查

下次 session 启动只需要：
1. 读这份文档（位于 `docs/sessions/2026-05-19-pptist-pivot.md`）
2. 跑一遍 `cd pptx-service && python -m converter converter/sample_deck.json converter/sample_pptist.json` 确认转换器还在工作
3. 直接开始 Phase A
