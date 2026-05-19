# 世界级 AI PPT 服务 · 90 天路线

> 路径 A：开源、BYOK、本地跑、原生 PPTX、power-user / dev-friendly
> 启动日：2026-05-20
> 模式：自主长任务，每个 sprint 完成后读取本文件继续下一节点

## 战略原则
- 编辑器优先（名实必须相符）
- deck 作为 portable JSON 文档，未来云存仅加 sync layer
- BYOK + 11 provider 是护城河，不动
- 不做 real-time collab（路径 C 留接口不动手）

---

## Sprint 1（W1-2）— WYSIWYG 编辑核心 ✅ 已完成 (commit 036c13d)
**Done 标准**：用户能像在 PowerPoint 里改 deck

- [x] 侧栏接 `addSlide / removeSlide / reorderSlides`：每张缩略图旁出 + / − 按钮，缩略图支持 HTML5 drag-reorder
- [x] 顶部工具栏：+ 新增 / 复制 按钮（版式选择 modal 留 Sprint 2）
- [x] 双击文本元素 → 进入 textarea 行内编辑 → onBlur 写回 store（保留 highlight 着色）
- [x] Konva Transformer：选中形状/图片元素后显示拖拽柄 + 八向缩放
- [x] 右侧 Inspector 面板：选中元素后展示字号/字重/颜色/对齐 + 元素位置/大小 + 透明度
- [x] Backspace/Delete 删除选中元素，Esc 取消选择
- [x] 视觉回归脚本扩展：覆盖增删 reorder + 文本编辑回写

## Sprint 2（W3-4）— 结构操作 ✅ 已完成 (commit 138d04d)
**Done 标准**：用户可以重组 deck 而不重 generate

- [x] 每张 slide 顶部 "切换版式" 按钮：当前数据按字段映射到兼容版式（cover↔statement↔question 等）
- [x] "+" 插新 slide 时弹版式选择器（21 选 1，每个有缩略示意图）
- [x] 复制 slide（Sprint 1 已完成）；拆分 / 合并定为低优先级，未实施
- [x] 插入图片元素：拖入文件或文件选择器 → ImageElement，可拖拽缩放（Sprint 1 Transformer）
- [x] Slash menu 用 toolbar +文本 / +图片 等同实现（输入 "/" 触发的浮窗版本留 Sprint 3）

## Sprint 3（W5-6）— 视觉升级 ✅ 已完成 (commit dff988d)
**Done 标准**：slide 视觉品质从"模板感"跃迁

- [-] ECharts 真实数据驱动：定为下轮（chart-bar 当前手绘 rect 也合适，line/pie/area 新版式作为 backlog）
- [x] Lucide 图标库：IconPicker 64 个图标，工具栏 + 图标按钮 → SVG dataUrl
- [x] AI 图片生成：/api/imagine 支持 fal.ai / OpenAI / stub，Inspector 图片元素 ✨ AI 生成
- [x] 元素级 build-in 动画：BaseElement.animation schema + Inspector 编辑（播放 Sprint 4）
- [x] 主题筛减 25 → 12：VISIBLE_THEMES，旧 ThemeId 类型保留兼容

## Sprint 4（W7-8）— 演讲闭环 ✅ 已完成
**Done 标准**：从生成到讲完不离开应用

- [x] `/present/[deckId]` 路由：全屏、方向键翻页、Esc 退出、ProgressBar
- [x] 演讲者视图：当前 + 下一张预览 + 备注 + 时间计时器
- [x] HTML 自包含导出：单 .html 文件，含所有图片 base64 + 键盘导航 + 7 种动画
- [x] PDF 导出：浏览器原生 print 流水线 + @page CSS（替代 puppeteer，零服务依赖）

## Sprint 5（W9-10）— 质量与国际化 ✅ 已完成
**Done 标准**：海外用户可用、CI 守门

- [x] i18n：lib/i18n.ts 自研（避免 next-intl 服务端重写），40+ key zh/en
- [x] A11y：role="toolbar" / "listbox" / aria-label 关键按钮，键盘导航 Sprint 1 已有
- [x] Playwright 视觉回归入 CI（.github/workflows/ci.yml visual-regression job）
- [x] Vitest 单元测试 27 个：catalog / theme / store / html-export

## Sprint 6（W11-12）— Dev moat
**Done 标准**：CLI / API / 文档管理三件套，确立技术品牌

- [ ] Markdown deck 导入：`# Title` / `## Section` / `- bullet` → Deck JSON
- [ ] HTTP API `POST /api/render`：BYOK header + deck JSON → PPTX 字节
- [ ] CLI：`npx presgen "...prompt..." --theme=... --out=deck.pptx`
- [ ] `.brandkit` 文件格式：JSON schema，导入/导出/分享
- [ ] README 重写：突出 CLI / API / 11 provider / 方法论 / WYSIWYG

---

## 执行准则
1. 每完成一个 ✅ 立刻打勾本文件
2. 每个 Sprint 完结：跑 typecheck + build + 视觉回归，确认绿后 commit
3. 遇阻不停，绕开实现别的子项，单 sprint 内允许 80% 完成度
4. 不询问用户，按本文件的判断自行决断
5. 全部 commit 中文 + 简洁 message
