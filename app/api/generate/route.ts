import { NextRequest, NextResponse } from 'next/server';
import { buildSystemPrompt, buildUserPrompt } from '@/lib/prompts';
import { callLLM, isLocalEnv } from '@/lib/llm';
import { parseLLMJSON } from '@/lib/json-extract';
import { validateAndFixDeck, ValidationError } from '@/lib/validate';
import type { Deck, GenerateRequest } from '@/lib/types';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let body: GenerateRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体不是合法 JSON' }, { status: 400 });
  }

  const { brief, theme, llm, brand } = body;
  if (!llm?.provider) {
    return NextResponse.json({ error: '请选择 LLM provider' }, { status: 400 });
  }
  if (llm.provider === 'claude-cli' && !isLocalEnv()) {
    return NextResponse.json({ error: 'Claude CLI 模式仅本地可用，部署版请选其他 provider' }, { status: 400 });
  }
  if (llm.provider !== 'claude-cli' && !llm.apiKey) {
    return NextResponse.json({ error: '该 provider 需要 API key' }, { status: 400 });
  }
  if (llm.provider !== 'claude-cli' && !llm.model) {
    return NextResponse.json({ error: '请指定 model' }, { status: 400 });
  }
  if (!brief?.topic || !brief?.audience || !brief?.goal) {
    return NextResponse.json({ error: '主题 / 听众 / 目标 不能为空' }, { status: 400 });
  }

  const system = buildSystemPrompt();
  const user = buildUserPrompt(brief, theme);

  // ── 第一次调用 ────────────────────────────────────────────────────────────
  let raw: string;
  try {
    raw = await callLLM(llm, { system, user, maxTokens: 16000 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: `LLM 调用失败: ${msg}` }, { status: 502 });
  }

  console.log(`[generate] LLM raw output length: ${raw.length}, first 200 chars:`, raw.slice(0, 200));
  let parseResult = parseLLMJSON<Omit<Deck, 'theme' | 'brief' | 'createdAt'>>(raw);
  let firstAttemptRaw = raw;

  // ── 第一次失败 → 自动重试一次（带纠错指令）────────────────────────────────
  if (!parseResult.ok) {
    console.warn('[generate] First parse failed:', parseResult.error);
    const retryUser = `${user}

# ⚠ 重要：上一次输出无法被解析

错误：${parseResult.error}

请**严格只输出 JSON 对象**，第一个字符必须是 \`{\`，最后一个字符必须是 \`}\`。
- 不要有任何前言（"以下是…"、"Here is…"）
- 不要包在 \`\`\`json 代码块里
- 不要在 JSON 之后写解释
- 字段引号必须是 ASCII 双引号 \`"\`，不要弯引号 \`""\`
- 字符串值里的换行用 \`\\n\` 转义
- 不要输出 thinking 内容
现在重新输出。`;

    try {
      raw = await callLLM(llm, { system, user: retryUser, maxTokens: 16000 });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      return NextResponse.json({ error: `重试 LLM 调用失败: ${msg}` }, { status: 502 });
    }
    console.log(`[generate] Retry raw output length: ${raw.length}, first 200 chars:`, raw.slice(0, 200));
    parseResult = parseLLMJSON<Omit<Deck, 'theme' | 'brief' | 'createdAt'>>(raw);
  }

  if (!parseResult.ok) {
    const rawLen = raw.length;
    const firstLen = firstAttemptRaw.length;
    return NextResponse.json({
      error: `AI 输出无法解析为 JSON（已重试一次）: ${parseResult.error}`,
      raw_preview: parseResult.preview || `(LLM 返回为空字符串，长度 0)`,
      raw_length: rawLen,
      first_attempt_preview: firstAttemptRaw.slice(0, 400) || '(空)',
      first_attempt_length: firstLen,
      hint: rawLen === 0
        ? '⚠ LLM 返回为空。最常见原因：claude CLI 模式下 OAuth 未登录 / 或 provider key 无效 / 或网络拦截。先用 anthropic 直连或 openai 模式测试。'
        : '常见原因：模型输出了思考过程 / 在 JSON 前后加了说明 / 使用了弯引号。建议：换个模型重试，或缩短 notes 字段。',
      provider: llm.provider,
      model: llm.model,
    }, { status: 502 });
  }

  const parsed = parseResult.data;

  if (!parsed.slides?.length || !parsed.script?.length) {
    return NextResponse.json({
      error: 'AI 输出缺少 slides 或 script 字段',
      raw_preview: JSON.stringify(parsed).slice(0, 800),
    }, { status: 502 });
  }

  // ── 强约束校验 ────────────────────────────────────────────────────────────
  try {
    validateAndFixDeck(parsed.slides);
  } catch (e) {
    if (e instanceof ValidationError) {
      return NextResponse.json({ error: `AI 输出违反版式约束 — ${e.message}。请重试或换模型。` }, { status: 502 });
    }
    throw e;
  }

  const deck: Deck = {
    ...parsed,
    theme,
    brief,
    brand,
    createdAt: new Date().toISOString(),
  };

  return NextResponse.json({ deck });
}

/** 给前端查询：当前是不是本地环境（决定要不要显示 claude-cli 选项） */
export async function GET() {
  return NextResponse.json({ local: isLocalEnv() });
}
