import { NextRequest, NextResponse } from 'next/server';
import { buildQuickSystemPrompt, buildQuickUserPrompt } from '@/lib/prompts';
import { callLLM, isLocalEnv } from '@/lib/llm';
import { parseLLMJSON } from '@/lib/json-extract';
import { validateAndFixDeck, ValidationError } from '@/lib/validate';
import type { Deck, Slide, ThemeId } from '@/lib/types';
import type { ProviderConfig } from '@/lib/providers';

export const runtime = 'nodejs';
export const maxDuration = 60;

interface QuickRequest {
  text: string;
  title?: string;
  theme: ThemeId;
  llm: ProviderConfig;
}

export async function POST(req: NextRequest) {
  let body: QuickRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体不是合法 JSON' }, { status: 400 });
  }

  const { text, title, theme, llm } = body;

  if (!text?.trim()) return NextResponse.json({ error: '描述内容不能为空' }, { status: 400 });
  if (!llm?.provider) return NextResponse.json({ error: '请选择 LLM provider' }, { status: 400 });
  if (llm.provider === 'claude-cli' && !isLocalEnv()) {
    return NextResponse.json({ error: 'Claude CLI 模式仅本地可用' }, { status: 400 });
  }
  if (llm.provider !== 'claude-cli' && !llm.apiKey) {
    return NextResponse.json({ error: '该 provider 需要 API key' }, { status: 400 });
  }

  const system = buildQuickSystemPrompt();
  const user = buildQuickUserPrompt(text, theme, title);

  let raw: string;
  try {
    raw = await callLLM(llm, { system, user, maxTokens: 12000 });
  } catch (e) {
    return NextResponse.json({ error: `LLM 调用失败: ${e instanceof Error ? e.message : String(e)}` }, { status: 502 });
  }

  let parseResult = parseLLMJSON<{ title: string; slides: Slide[] }>(raw);

  if (!parseResult.ok) {
    const retryUser = `${user}

# ⚠ 上一次输出无法解析

错误：${parseResult.error}

请严格只输出 JSON 对象，第一个字符必须是 \`{\`，最后一个字符必须是 \`}\`。不要任何前言和解释。`;
    try {
      raw = await callLLM(llm, { system, user: retryUser, maxTokens: 12000 });
    } catch (e) {
      return NextResponse.json({ error: `重试失败: ${e instanceof Error ? e.message : String(e)}` }, { status: 502 });
    }
    parseResult = parseLLMJSON<{ title: string; slides: Slide[] }>(raw);
  }

  if (!parseResult.ok) {
    return NextResponse.json({
      error: `AI 输出无法解析为 JSON: ${parseResult.error}`,
      raw_preview: parseResult.preview,
      hint: '尝试换一个模型，或简化描述。',
    }, { status: 502 });
  }

  const { title: deckTitle, slides } = parseResult.data;

  if (!slides?.length) {
    return NextResponse.json({ error: 'AI 未生成任何幻灯片' }, { status: 502 });
  }

  try {
    validateAndFixDeck(slides);
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json({ error: `版式约束错误: ${e.message}` }, { status: 502 });
    }
    throw e;
  }

  const deck: Deck = {
    title: deckTitle || title || '演示文稿',
    theme,
    framework: 'custom',
    brief: { topic: text.slice(0, 100), audience: '', goal: '', durationMin: 0 },
    slides,
    script: [],
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ deck });
}
