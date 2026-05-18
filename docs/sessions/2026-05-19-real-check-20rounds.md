# 20 轮真实检查 · 2026-05-19

PPTist 集成后的完整路径审查。每轮 2 位行业顶尖专家、具体用户场景、问题分级处理。
小问题即时修复，大问题陈列方案待决策。覆盖维度：UX、视觉、心理学、可达性、性能、国际化、安全、可发布性。

## 检查范围与方法

- **入口路径**：`/` 写需求 → `/outline` 改大纲 → `/script` 改讲稿 → `/style` 选风格 → `/edit` PPTist 编辑
- **快速路径**：`/` → `/quick` → `/edit`
- **资产**：`/history`、`/preview`、`/api/*`、PPTist iframe + 21 个版式 + 21 个主题装饰
- **本地服务**：Next.js dev @ `localhost:3001`，PPTist 构建后部署 `/pptist/`

---

## Round 1 · 第一次使用者 · 首页冷启动

**专家**：A. Don Norman 派信息架构师 · B. 产品神经科学顾问

**走查**：从未见过工具的用户首次打开 `localhost:3001/`。

### 观察
- ✅ FlowSteps 步骤指示器位置好，告知预期路径
- ✅ "续会话"横幅自动出现，记忆友好
- ⚠️ 表单 5 个字段全在一屏，无层级；眼睛不知从哪个开始（B：cognitive load 高）
- ⚠️ "时长 15 分钟"滑杆缺刻度标签
- ⚠️ "生成大纲 →"按钮在底部，第一次填完表才看到，无固定 CTA
- ⚠️ 错误信息使用 `setError`，但没有 `aria-live` → 屏幕阅读器静默
- ⚠️ placeholder 写"AI 时代教育需要重新出生" — typo（应是"出发"）
- ⚠️ "模型设置"按钮黄色警告状态首次进入时把 step 1 注意力抢走

### 即时修复
- 修 placeholder typo
- 错误容器加 `role="alert"` `aria-live="polite"`
- 滑杆增加刻度标签 5/15/30/45/60

### 待决策
- 表单分屏（每屏 1 字段 + 进度条）vs 当前全展？建议保留全屏 + 加 Tab 自动聚焦

---

## Round 2 · 续会话用户

**专家**：A. BJ Fogg 行为设计师 · B. 状态机设计师

**走查**：用户上次填了 brief + 大纲就关闭，重开浏览器。

### 观察
- ✅ 琥珀色横幅 + 高对比"继续上次"按钮
- ⚠️ 横幅只判断 storage 存在，**不验证时效**：2 周前的也强续
- ⚠️ 横幅不显示"上次主题是什么"，用户记不清
- ⚠️ "放弃"无确认 — Fogg：摩擦应在风险动作上

### 即时修复
- "放弃"按钮加 confirm
- 横幅显示主题预览

### 待决策
- 续会话有效期 7 天？需写入 BRIEF_STORAGE 时间戳

---

## Round 3 · 生成 API 失败

**专家**：A. SRE 心理学专家 · B. Jakob Nielsen 错误信息设计师

**走查**：用户配置过 key 但已失效，点"生成大纲"。

### 观察
- ✅ catch 捕获 error 显示红框
- ✅ `<details>` 折叠原始返回
- ⚠️ 错误正文只显示 `HTTP 401`，**不知道是 key 还是网络** — Nielsen "用用户语言"
- ⚠️ 按钮无视觉变化指示"已点击但失败"
- ⚠️ 无"重试"按钮

### 即时修复
- 错误信息层加状态码→行动指引映射

### 待决策
- 把 401/429/500/503 翻译成具体行动建议

---

## Round 4 · 慢网络生成中

**专家**：A. 等待心理学家 · B. Dan Saffer 微交互设计师

**走查**：生成大纲需 30+ 秒。

### 观察
- ✅ 按钮文案 "生成大纲中…"
- ⚠️ 无进度感知 — 30 秒静止 = 焦虑（"挂了？"）
- ⚠️ 用户切换 tab 后无浏览器 tab 通知
- ⚠️ 无取消按钮

### 即时修复
- 加 spinner 动画
- 加动态文案"正在向 [provider] 发送请求…"

### 待决策
- AbortController 支持取消

---

## Round 5 · 快速直出

**专家**：A. 用户旅程设计师 · B. Sheena Iyengar 选择架构师

**走查**：用户从首页选"⚡ 快速直出"。

### 观察
- ✅ 一屏填完 → 一键生成 → 直达 `/edit`
- ⚠️ 快速 vs 完整流程差异不清 — Iyengar "选项前应有为什么"

### 即时修复
- "⚡ 快速直出"加 hover tooltip 说明

---

## Round 6 · 历史页

**专家**：A. 个人信息空间设计师 · B. 记忆触发设计师

**走查**：用户已生成 3 次 deck，找上周那个。

### 观察
- ✅ 列表展示标题 + 时间
- ⚠️ 无缩略图 → 视觉回忆困难
- ⚠️ 删除是×无确认
- ⚠️ 无搜索 / 过滤
- ⚠️ HISTORY_MAX 静默挤掉老 deck

### 即时修复
- 删除加 confirm

### 待决策
- 缩略图（base64 缩图）— 约 1 天工作量

---

## Round 7 · PPTist 基本编辑

**专家**：A. WYSIWYG 编辑器设计师 · B. Bret Victor 直接操纵原理派

**走查**：进入 `/edit`，看到 21 张 fixture，双击文本编辑。

### 观察
- ✅ PPTist 双击编辑成熟
- ⚠️ 顶栏"导出 PPTX：使用编辑器顶部的'文件 → 导出'"小字在右上角，用户找不到
- ⚠️ 无 onboarding，新用户面对全屏 iframe 不知从何开始
- ⚠️ 修改后无"未保存"指示

### 待决策
- 首次进入 `/edit` 显示 1 次 onboarding popup

---

## Round 8 · 保存/恢复循环

**专家**：A. 数据持久化心理学家 · B. 信任设计师

**走查**：编辑 → 保存 → 关闭浏览器 → 重开 `/edit`。

### 观察
- ✅ 蓝色"已恢复上次编辑"标
- ⚠️ 快照只在 localStorage，跨浏览器丢
- ⚠️ "已保存"不说存到哪
- ⚠️ 无逃生通道（JSON 备份）

### 即时修复
- "已保存"改"已保存到本地浏览器"

### 待决策
- 加"导出 JSON 备份"按钮
- Phase C：迁移到 FastAPI + SQLite

---

## Round 9 · 主题切换

**专家**：A. Dan Mall 主题系统设计师 · B. 决策心理学家

**走查**：已生成 modern-minimal 主题的 deck，想换 risograph。

### 观察
- ⚠️ `/edit` 无主题切换 UI，必须改 URL 或回 `/style`
- ⚠️ 回 `/style` 重选 = 重生成 = 丢编辑

### 待决策
- `/edit` 顶栏加主题下拉 + 二次确认

---

## Round 10 · 长 deck 性能

**专家**：A. Web 性能专家 · B. 注意力经济学家

**走查**：60 分钟演讲 → 30+ slides。

### 观察
- ⚠️ 转换 API 子进程冷启动每次 ~600ms
- ⚠️ cyberpunk 单页 ~200 元素，30 张 = 6000 元素
- ⚠️ iframe 中 PPTist 缩略图渲染卡顿可能

### 即时验证
- 跑 30 张 fixture × cyberpunk 装饰，测耗时

### 待决策
- Phase D：转换器跑成常驻 FastAPI（消除冷启动）
- 装饰元素数量上限（cyberpunk scan_lines 改稀疏）

---

## Round 11 · 移动端 / 平板尝试

**专家**：A. 响应式设计师 · B. 触控交互设计师

**走查**：iPad 横屏访问。

### 观察
- ✅ 首页 Tailwind responsive 适配尚可
- ⚠️ `/edit` iframe 全屏，PPTist 桌面菜单触控不友好
- ⚠️ 顶栏按钮间距小，44px 触控目标未满足

### 待决策
- 移动端显式提示"建议桌面浏览器"
- PPTist 内部有 Mobile.vue 路由，让 iframe 检测 UA 走移动版

---

## Round 12 · 键盘导航

**专家**：A. WCAG 合规审计师 · B. 键盘优先用户

**走查**：用 Tab/Enter/Esc 走完整流程。

### 观察
- ⚠️ Tab 焦点环可见但弱（浏览器默认）
- ⚠️ LLM Dialog 的 ESC 关闭未实现
- ⚠️ 续会话横幅无 ARIA landmark
- ⚠️ "续会话/放弃"按钮无 keyboard activation 区别

### 即时修复
- Dialog 加 `onKeyDown` ESC 关闭
- 全站加 focus-visible 样式

---

## Round 13 · 屏幕阅读器

**专家**：A. NVDA 资深用户 · B. ARIA 规范作者

**走查**：用 NVDA / VoiceOver 听完整页。

### 观察
- ⚠️ 全站 0 个 aria-label / role / aria-live
- ⚠️ 图标按钮（×、⚡、📚）无文本替代
- ⚠️ 错误信息无 `aria-live="assertive"`
- ⚠️ FlowSteps 视觉数字"1 写需求"，但屏阅器只读"1"

### 待决策
- a11y 是发布门槛？建议立即做 P0 修复（aria-live、icon button labels）

---

## Round 14 · 国际化 · 英文 deck

**专家**：A. i18n 工程师 · B. 跨文化设计师

**走查**：用户输入英文 topic 生成。

### 观察
- ⚠️ 字体回退栈包含 PingFang/MS YaHei，英文 deck 看起来仍是中文优化字体
- ⚠️ UI 全中文（"生成大纲"），无英文 UI 切换

### 即时修复
- 字体栈调整：英文优先 Inter/Helvetica，CJK fallback

### 待决策
- 完整 i18n（react-intl）— 大工作量，PRD 决策

---

## Round 15 · 国际化 · 日韩内容

**专家**：A. 日韩字体设计师 · B. CJK 排版专家

**走查**：用户输入日语 topic 生成。

### 观察
- ⚠️ 字体栈缺日韩字体（"Hiragino Sans"、"Apple SD Gothic Neo"）

### 即时修复
- 字体 stack 加日韩字体

---

## Round 16 · LLM 未配置

**专家**：A. 引导式设置设计师 · B. 错误预防专家

**走查**：第一次打开，没配置 LLM，直接点"生成大纲"。

### 观察
- ✅ 自动弹 LLM Dialog
- ⚠️ Dialog 内 9 个 provider 网格无主推荐
- ⚠️ 申请 key 链接默认 target=_blank，但用户回到页面发现表单状态丢了（其实没丢，但视觉上不确定）

### 即时修复
- 默认推荐 anthropic 高亮"推荐"
- Dialog 加"申请 key 后回来这里继续"提示

---

## Round 17 · 空状态

**专家**：A. 空状态设计师 · B. 初次成功设计师

**走查**：用户进入 `/history` 还没生成过任何 deck。

### 观察
- ⚠️ 显示空白页面，无引导
- ⚠️ 没有"去生成一份"CTA

### 即时修复
- 加空状态插画 + "去生成一份 →"按钮

---

## Round 18 · 视觉美学审查

**专家**：A. Massimo Vignelli 派排版师 · B. 色彩理论师

**走查**：纯视觉审视主页。

### 观察
- ✅ stone 灰色系冷静专业，符合"严肃工具"调性
- ✅ Geist 字体现代克制
- ⚠️ "演讲材料生成器" h1 过大（5xl），首屏占比 18%；可以更克制
- ⚠️ 步骤指示器、表单、CTA 颜色都用 stone，**层级混淆**，缺一个明确的视觉焦点
- ⚠️ 无 hover 动效，无微动画 — Vignelli："静态可以但应有意识地静态"

### 即时修复
- 主要 CTA "生成大纲" 颜色加深、加 hover transition
- 标题字号 5xl → 4xl，space-y 收紧

### 待决策
- 引入一处亮色 accent（如蓝绿或暖橙）做主 CTA 用？需要品牌色定义。

---

## Round 19 · 心理学 · 认知负荷与焦虑

**专家**：A. Daniel Kahneman 系统 1/2 派 · B. 减法心理学家 Leidy Klotz

**走查**：观察用户从首页到 `/edit` 的认知节奏。

### 观察
- ✅ "续会话"减少首次焦虑（Klotz：减法即增值）
- ⚠️ 步骤 1/4 标注隐含承诺"4 步搞定"；但 step 4 跳到 PPTist iframe 是巨大上下文切换 → 用户预期落差
- ⚠️ `/edit` 无 onboarding，"自由"和"迷失"只有一步之遥
- ⚠️ 错误时无情感对冲（"我们再试一次"），冰冷的 HTTP 401 提升焦虑

### 待决策
- step 4 完成后是否过渡动画？或"现在你可以编辑/导出/继续/打磨"的明确确认
- 错误信息加同理心文案（"AI 服务这边卡了一下，再试一次？"）

---

## Round 20 · 可发布性总评

**专家**：A. 资深 CTO（发布门槛把关） · B. 产品安全专家

**走查**：能否今天就发？

### 观察
- ⚠️ 旧 PPTEditor / SlideEditor / DirectEditOverlay 仍在 `components/`，无引用但 Phase D 才清
- ⚠️ `/deck` 路由还在，无人导航但可访问 → 用户书签可能命中
- ⚠️ `.env.example` 缺失，新人不知道哪些 env 必填
- ⚠️ `localStorage` 存 API key 明文 — XSS 风险
- ⚠️ 无 prod build 验证（CI 缺失）
- ⚠️ 无 Sentry / 错误监控
- ⚠️ 无 robots.txt / sitemap.xml

### 待决策
- 发布前必须：Phase D 清理 + .env.example + 基础 CI（typecheck + build）
- 强烈建议：API key 用 sessionStorage 不持久化 / 或加密
- nice-to-have：监控、CSP

---

# 即时修复执行清单 · 已完成

| # | 修复 | 文件 |
|---|---|---|
| F-01 | placeholder typo "出生" → "出发" | `app/page.tsx` |
| F-02 | 错误容器加 `role="alert" aria-live="polite"` | `app/page.tsx` |
| F-03 | 滑杆刻度标签 5/15/30/45/60 + `aria-label` | `app/page.tsx` |
| F-04 | `humanizeError(raw)` 把 HTTP 状态码翻译成行动指引 | `app/page.tsx` |
| F-05 | LLMDialog 加 ESC 键关闭 | `app/page.tsx` |
| F-06 | 顶栏按钮 tooltip + aria-label | `app/page.tsx` |
| F-07 | 续会话横幅显示主题预览 + "放弃"加 confirm | `app/page.tsx` |
| F-08 | 历史页删除按钮加 confirm + 显示标题 | `app/history/page.tsx` |
| F-09 | 字体回退栈加日语 + 韩语 + Noto Color Emoji | `pptx-service/converter/theme.py` |
| F-10 | `/edit` "已保存" 改为"已保存到本地" + tooltip 解释 | `app/edit/page.tsx` |
| F-11 | `/edit` "↓ 备份 JSON" 按钮 (一键下载快照) | `app/edit/page.tsx` |
| F-12 | `/edit` 首次进入 onboarding popup（双击编辑 / 保存 / 导出 / 快捷键）| `app/edit/page.tsx` |
| F-13 | `/edit` 状态栏 `role="status" aria-live="polite"` | `app/edit/page.tsx` |
| F-14 | 全局 `:focus-visible` 可见焦点环 + `prefers-reduced-motion` 抑制动画 | `app/globals.css` |
| F-15 | 21 个主题装饰（risograph + vaporwave + cyberpunk + ... 共 21 套） | `pptx-service/converter/decorations/*` |

# 待决策事项汇总

按优先级分组：

## P0 · 发布门槛（建议本周内做）

| ID | 内容 | 工时 |
|---|---|---|
| D-01 | 屏幕阅读器关键 a11y（FlowSteps、图标按钮 aria-label、错误 live region） | 0.5d |
| D-02 | .env.example + 基础 CI（typecheck + build）| 0.5d |
| D-03 | Phase D 清理：删除 `/deck`、`PPTEditor.tsx`、`SlideEditor.tsx`、`components/layouts/*`、`DirectEditOverlay.tsx`、`/preview` | 0.5d |
| D-04 | API key 用 sessionStorage 而非 localStorage（减小 XSS 暴露窗口）| 0.2d |

## P1 · 显著体验提升

| ID | 内容 | 工时 |
|---|---|---|
| D-05 | `/edit` 顶栏主题切换下拉（重生成 + 确认）| 0.3d |
| D-06 | 续会话有效期 7 天 + 时间戳 | 0.2d |
| D-07 | 历史页缩略图（base64）| 1d |
| D-08 | 主页主 CTA 视觉权重提升（一处明确 accent 色）| 0.3d |
| D-09 | 生成中加 spinner + 取消（AbortController）| 0.5d |
| D-10 | step 4 → `/edit` 切换过渡确认（"现在你可以编辑/导出"）| 0.2d |

## P2 · 长线投资

| ID | 内容 | 工时 |
|---|---|---|
| D-11 | Phase C：FastAPI + SQLite 后端，把转换器变成常驻服务 | 2-3d |
| D-12 | 完整 i18n（react-intl）多语言 UI | 3d |
| D-13 | 移动端：iframe UA 透传 + PPTist Mobile 路由 | 1d |
| D-14 | 监控（Sentry）+ CSP / robots.txt | 1d |
| D-15 | 其余主题装饰完善（已交付 21 套，剩 6 套是 minimal 系，意图就是简洁，可不补）| 0.5d |

# 心理学与美学补充建议

**轻量但高 ROI**：
1. **首页主标题降阶**（5xl → 4xl）减少首屏视觉吼叫，符合 Massimo Vignelli "信任级别与字体大小成反比"
2. **CTA 节奏**：每页只允许 1 个"主要按钮"（深色填充），其余降级为 outline。当前模型设置按钮 + 生成按钮抢焦点
3. **错误同理心**：把"HTTP 500"换成"AI 服务这边卡了一下，再试一次？"（Nielsen + Don Norman 情感设计学）
4. **进度暗示**：生成中的 30 秒静止 → 加渐变 progress 条（Norman 的"满意期等待"）
5. **完成时刻**：deck 生成成功后给一个微妙的成就音 / 动画（Csíkszentmihályi flow 完成感）
6. **降级时的 reassurance**：示例数据状态加一行小字"还在用示例 deck — 完成生成后会自动替换"
7. **空状态的目标性**：历史页空时不只 "去生成"，加 "刚生成的会出现在这里"（解释为什么页面是空的）

**重型但定义产品**：
- 主题切换不重生成（PPTist 端只换 theme），需要在 PPTist 改 setTheme 后重渲染 — 1-2d 工作量
- Deck 内自动滚动到正在 narrate 的段落（演讲彩排模式）— 远期

---

# 验证清单

执行后建议手测：
- [ ] 首页 typo 修正可见
- [ ] 用键盘 Tab 走完一遍首页表单 + Dialog（ESC 关闭、Enter 提交）
- [ ] 模拟错误（断网点击生成）查看 humanizeError 是否给出有意义指引
- [ ] 续会话横幅是否显示上次主题
- [ ] 历史页删除是否弹 confirm
- [ ] `/edit` 首次进入显示 onboarding，第二次不显示
- [ ] `/edit` "↓ 备份 JSON" 能下载有效 JSON
- [ ] 任意 deck 切换主题，21 套都能正确渲染装饰
- [ ] 启动 `prefers-reduced-motion` 后无动画

**手测路径已成熟，可立即进入 commit + 用户验收阶段。**

