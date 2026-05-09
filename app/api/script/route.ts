import { NextRequest, NextResponse } from 'next/server';
import { buildScriptSystemPrompt, buildScriptUserPrompt } from '@/lib/prompts';
import { callLLM, isLocalEnv } from '@/lib/llm';
import { parseLLMJSON } from '@/lib/json-extract';
import type { ScriptEntry, ScriptRequest } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: ScriptRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体不是合法 JSON' }, { status: 400 });
  }

  const { brief, outline, llm } = body;
  if (!llm?.provider) return NextResponse.json({ error: '请选择 LLM provider' }, { status: 400 });
  if (llm.provider === 'claude-cli' && !isLocalEnv()) {
    return NextResponse.json({ error: 'Claude CLI 模式仅本地可用' }, { status: 400 });
  }
  if (llm.provider !== 'claude-cli' && !llm.apiKey) {
    return NextResponse.json({ error: '该 provider 需要 API key' }, { status: 400 });
  }
  if (!outline?.sections?.length) {
    return NextResponse.json({ error: '缺少大纲' }, { status: 400 });
  }

  const system = buildScriptSystemPrompt();
  const user = buildScriptUserPrompt(brief, outline);

  let raw: string;
  try {
    raw = await callLLM(llm, { system, user, maxTokens: 12000 });
  } catch (e) {
    return NextResponse.json({ error: `LLM 调用失败: ${e instanceof Error ? e.message : String(e)}` }, { status: 502 });
  }

  console.log(`[script] raw length: ${raw.length}, first 200:`, raw.slice(0, 200));
  let parseResult = parseLLMJSON<{ script: ScriptEntry[] }>(raw);

  if (!parseResult.ok) {
    try {
      raw = await callLLM(llm, {
        system,
        user: `${user}\n\n# ⚠ 上次输出无法解析：${parseResult.error}\n请只输出纯 JSON。`,
        maxTokens: 12000,
      });
    } catch (e) {
      return NextResponse.json({ error: `重试失败: ${e instanceof Error ? e.message : String(e)}` }, { status: 502 });
    }
    parseResult = parseLLMJSON<{ script: ScriptEntry[] }>(raw);
  }

  if (!parseResult.ok) {
    return NextResponse.json({
      error: `讲稿 JSON 解析失败: ${parseResult.error}`,
      raw_preview: parseResult.preview,
    }, { status: 502 });
  }

  const script = parseResult.data.script;
  if (!Array.isArray(script) || script.length === 0) {
    return NextResponse.json({ error: 'AI 输出缺少 script', raw_preview: JSON.stringify(parseResult.data).slice(0, 800) }, { status: 502 });
  }

  // 长度对齐：如果 AI 少给几节，补占位；多给则截断
  const sectionsLen = outline.sections.length;
  if (script.length < sectionsLen) {
    for (let i = script.length; i < sectionsLen; i++) {
      script.push({ slideIndex: i + 1, text: `[第 ${i + 1} 节讲稿待补]`, durationSec: outline.sections[i].durationSec });
    }
  } else if (script.length > sectionsLen) {
    script.length = sectionsLen;
  }

  return NextResponse.json({ script });
}
