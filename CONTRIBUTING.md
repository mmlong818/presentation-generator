# 贡献指南

欢迎贡献。本项目核心扩展点已经设计成"加一行注册即可"的形态，三件最常见的扩展任务都很轻量。

---

## 加一个新主题（约 30-60 分钟）

参考 `docs/layout-spec.md` 的"主题契约"部分。最小步骤：

1. **types.ts** 加一个 `ThemeId`：
   ```ts
   export type ThemeId = ... | 'my-theme';
   ```

2. **lib/themes.ts** 加 `ThemeTokens` 条目：
   ```ts
   'my-theme': {
     id: 'my-theme', name: '我的主题', description: '...',
     mode: 'light', bg: '#...', text: '#...',
     // ... 其他 tokens
     palette: ['#...', '#...'],  // 可选
     paletteRule: 'flat',         // 可选
   },
   ```

3. **lib/prompts.ts** 加内容气质提示（让 AI 生成时按主题调内容）

4. （可选）`components/layouts/index.tsx` 加主题专属覆盖

参考已有 20 主题，3-5 个 token + decoration 已能让主题"一眼可辨"。

---

## 加一个新版式（约 30-60 分钟）

详见 `docs/layout-spec.md` 的"模板填写表"。最小步骤：

1. **types.ts** 加 `LayoutType` 和 Slide interface：
   ```ts
   export type LayoutType = ... | 'my-layout';
   export interface MyLayoutSlide extends LayoutBase {
     type: 'my-layout';
     // ... 字段
   }
   export type Slide = ... | MyLayoutSlide;
   ```

2. **components/layouts/index.tsx** 实现组件 + 注册：
   ```tsx
   function MyLayout({ slide, t, n, total }: LayoutProps<MyLayoutSlide>) {
     return <div style={fillStyle(t)}>...</div>;
   }
   export const LAYOUT_COMPONENTS = { ..., 'my-layout': MyLayout };
   ```

3. **lib/layouts/registry.ts** 加 schema：
   ```ts
   'my-layout': {
     type: 'my-layout',
     label: '我的版式',
     whenToUse: '什么时候用 / 不用',
     fieldsDoc: 'field1 (string), field2 (string[])',
     example: `{ "type": "my-layout", ... }`,
   },
   ```

4. **lib/validate.ts** 加强约束（项数 / 字符限制等）

完成。AI 立即可选用此版式。

---

## 加一个 LLM Provider（约 15 分钟）

如果是 OpenAI 兼容协议（DeepSeek / Moonshot / 智谱 / Qwen 都是），只需在 **lib/providers.ts** 加一个 preset：

```ts
{
  id: 'my-provider',
  label: '我的 Provider',
  provider: 'openai-compat',
  baseURL: 'https://api.example.com/v1',
  defaultModel: 'my-model-default',
  modelExamples: ['my-model-1', 'my-model-2'],
  signupURL: 'https://example.com/keys',
}
```

如果是非 OpenAI 协议（如自定义 wire format），需要在 **lib/llm.ts** 加 `callXxx` 函数 + `ProviderId` 一并注册。

---

## 代码风格

- TypeScript strict 模式
- 不引入 ESLint / Prettier 配置——用 `pnpm exec tsc --noEmit` 把关
- 中文注释 OK，但 commit message 用中文或英文都行
- 提交前跑 `pnpm build` 确保生产构建通过

---

## 提 PR

1. Fork 后从 `main` 切分支：`git checkout -b feat/my-theme`
2. 改完跑：
   ```bash
   pnpm exec tsc --noEmit
   pnpm build
   ```
3. PR 描述里说明：
   - 改了什么
   - `/preview` 页面截图（如果是视觉改动）
   - 是否有新依赖（尽量避免）

---

## 报 bug

issue 模板：

- **环境**：Node 版本 / OS / 浏览器
- **复现步骤**
- **期望 vs 实际**
- **如果是 LLM 输出问题**：贴 raw_preview（生成失败时 UI 会展示"查看 AI 实际返回"）

---

## License

贡献的代码在 AGPL-3.0 下发布。提交 PR 即视为同意此授权。
