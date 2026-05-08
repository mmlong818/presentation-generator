import { NextRequest, NextResponse } from 'next/server';
import { buildOutlineSystemPrompt, buildOutlineUserPrompt } from '@/lib/prompts';
import { callLLM, isLocalEnv } from '@/lib/llm';
import { parseLLMJSON } from '@/lib/json-extract';
import type { Outline, OutlineRequest } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: OutlineRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体不是合法 JSON' }, { status: 400 });
  }

  const { brief, theme, llm } = body;
  if (!llm?.provider) return NextResponse.json({ error: '请选择 LLM provider' }, { status: 400 });
  if (llm.provider === 'claude-cli' && !isLocalEnv()) {
    return NextResponse.json({ error: 'Claude CLI 模式仅本地可用' }, { status: 400 });
  }
  if (llm.provider !== 'claude-cli' && !llm.apiKey) {
    return NextResponse.json({ error: '该 provider 需要 API key' }, { status: 400 });
  }
  if (!brief?.topic || !brief?.audience || !brief?.goal) {
    return NextResponse.json({ error: '主题 / 听众 / 目标 不能为空' }, { status: 400 });
  }

  const system = buildOutlineSystemPrompt();
  const user = buildOutlineUserPrompt(brief, theme);

  let raw: string;
  try {
    raw = await callLLM(llm, { system, user, maxTokens: 6000 });
  } catch (e: unknown) {
    return NextResponse.json({ error: `LLM 调用失败: ${e instanceof Error ? e.message : String(e)}` }, { status: 502 });
  }

  console.log(`[outline] raw length: ${raw.length}, first 200:`, raw.slice(0, 200));
  let parseResult = parseLLMJSON<Outline>(raw);

  if (!parseResult.ok) {
    // 重试一次
    try {
      raw = await callLLM(llm, {
        system,
        user: `${user}\n\n# ⚠ 上次输出无法解析，错误：${parseResult.error}\n请只输出纯 JSON。`,
        maxTokens: 6000,
      });
    } catch (e: unknown) {
      return NextResponse.json({ error: `重试失败: ${e instanceof Error ? e.message : String(e)}` }, { status: 502 });
    }
    parseResult = parseLLMJSON<Outline>(raw);
  }

  if (!parseResult.ok) {
    return NextResponse.json({
      error: `大纲 JSON 解析失败: ${parseResult.error}`,
      raw_preview: parseResult.preview,
    }, { status: 502 });
  }

  const outline = parseResult.data;
  if (!outline.sections?.length) {
    return NextResponse.json({ error: 'AI 输出缺少 sections', raw_preview: JSON.stringify(outline).slice(0, 800) }, { status: 502 });
  }

  return NextResponse.json({ outline });
}
