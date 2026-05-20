// Local LLM rewrite for a single slide.
//
// POST /api/rewrite-slide
// {
//   deck: Deck,            // full deck for context (theme, neighboring slides, title)
//   slideIndex: number,    // which slide to rewrite (0-based)
//   direction?: string,    // optional user nudge: "更尖锐" / "加数据" / "改成 question"
//   llm: ProviderConfig,
// }
// → { slide: Slide }       // new single slide payload
//
// Why this exists: users shouldn't have to /api/generate the entire deck just
// to fix one slide. This stays cheap (1 small LLM call) and contained (only
// returns one Slide).

import { NextRequest, NextResponse } from 'next/server'
import { callLLM, isLocalEnv } from '@/lib/llm'
import { parseLLMJSON } from '@/lib/json-extract'
import type { Deck, Slide } from '@/lib/types'
import type { ProviderConfig } from '@/lib/providers'
import { THEMES } from '@/lib/themes'
import { layoutSchemasForPrompt } from '@/lib/layouts/registry'

interface Req {
  deck: Deck
  slideIndex: number
  direction?: string
  llm: ProviderConfig
}

export const runtime = 'nodejs'
export const maxDuration = 60

export async function POST(req: NextRequest) {
  let body: Req
  try { body = await req.json() } catch { return NextResponse.json({ error: '请求体不是合法 JSON' }, { status: 400 }) }

  const { deck, slideIndex, direction, llm } = body
  if (!deck?.slides) return NextResponse.json({ error: '缺少 deck' }, { status: 400 })
  if (slideIndex < 0 || slideIndex >= deck.slides.length) return NextResponse.json({ error: 'slideIndex 越界' }, { status: 400 })
  if (!llm?.provider) return NextResponse.json({ error: '请选择 LLM provider' }, { status: 400 })
  if (llm.provider === 'claude-cli' && !isLocalEnv()) {
    return NextResponse.json({ error: 'Claude CLI 模式仅本地可用' }, { status: 400 })
  }
  if (llm.provider !== 'claude-cli' && !llm.apiKey) {
    return NextResponse.json({ error: '该 provider 需要 API key' }, { status: 400 })
  }

  const cur = deck.slides[slideIndex]
  const themeMeta = THEMES[deck.theme]
  const context = deck.slides.map((s, i) => {
    const title = (s as any).title || (s as any).heading || (s as any).question || (s as any).quote || `(${s.type})`
    return `${i === slideIndex ? '★' : ' '} ${String(i + 1).padStart(2, '0')}. ${s.type} — ${String(title).slice(0, 50)}`
  }).join('\n')

  const system = `你是一位资深演讲教练。任务：重写指定 slide。

输出契约：返回**纯 JSON**，一个完整的 Slide 对象（带 type 字段），可被同一 deck 使用。
不要解释、不要 markdown 代码块、不要外层数组。

**严格按以下 schema 的字段名输出**（字段不能凭空发明，否则前端会丢字段）：

${layoutSchemasForPrompt()}

诚信底线：不要编造数据。无源数据时 value 用"—"或带"需引用："前缀。
克制装饰：不要 emoji、不要"激动人心""赋能"等套话。`

  const user = `# Deck 上下文

标题：${deck.title}
主题：${deck.theme}${themeMeta ? ` (${themeMeta.name} · ${themeMeta.description})` : ''}
框架：${deck.framework}
听众：${deck.brief?.audience}
目标：${deck.brief?.goal}
全部 slides（★ 是待重写的）：

${context}

# 当前 slide（待重写）

\`\`\`json
${JSON.stringify(cur, null, 2)}
\`\`\`

# 用户期望

${direction?.trim() ? direction.trim() : '保持现有的语义骨架，但让文案更尖锐、更具体、更有数据。允许更换 type 如果有更匹配的版式。'}

# 任务

只输出一个 Slide JSON 对象。`

  let raw: string
  try {
    raw = await callLLM(llm, { system, user, maxTokens: 3000 })
  } catch (e) {
    return NextResponse.json({ error: `LLM 调用失败: ${e instanceof Error ? e.message : String(e)}` }, { status: 502 })
  }

  const parsed = parseLLMJSON<Slide>(raw)
  if (!parsed.ok) {
    return NextResponse.json({
      error: `LLM 输出 JSON 解析失败: ${parsed.error}`,
      raw: raw.slice(0, 500),
    }, { status: 502 })
  }
  const slide = parsed.data
  if (!slide.type) {
    return NextResponse.json({ error: 'LLM 返回的 slide 缺 type 字段', raw: raw.slice(0, 500) }, { status: 502 })
  }

  return NextResponse.json({ slide })
}
