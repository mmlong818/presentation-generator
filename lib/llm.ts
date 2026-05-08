// ─── 多模型 provider · 服务器端实现 ──────────────────────────────────────────
// ⚠ 此文件含 Node-only API（child_process / fs / os），不可被 client 组件 import。
// 客户端要用的 PROVIDER_PRESETS / ProviderId 等纯数据从 './providers' 取。

import 'server-only';
import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';
import { spawn } from 'child_process';
import iconv from 'iconv-lite';
import type { ProviderConfig } from './providers';

/** Windows 上 claude CLI 可能用 GBK 输出错误信息。先按 UTF-8 解码，含乱码字符则改用 GBK。 */
function decodeBuffer(buf: Buffer): string {
  const utf8 = buf.toString('utf8');
  if (process.platform === 'win32' && /�/.test(utf8)) {
    try { return iconv.decode(buf, 'gbk'); } catch { return utf8; }
  }
  return utf8;
}

export interface LLMRequest {
  system: string;
  user: string;
  maxTokens?: number;
}

/** 统一入口 */
export async function callLLM(cfg: ProviderConfig, req: LLMRequest): Promise<string> {
  switch (cfg.provider) {
    case 'anthropic': return callAnthropic(cfg, req);
    case 'openai-compat': return callOpenAICompat(cfg, req);
    case 'claude-cli': return callClaudeCLI(req);
  }
}

// ─── Anthropic ────────────────────────────────────────────────────────────────
async function callAnthropic(cfg: ProviderConfig, req: LLMRequest): Promise<string> {
  if (!cfg.apiKey) throw new Error('Anthropic 需要 API key');
  const client = new Anthropic({ apiKey: cfg.apiKey });
  const resp = await client.messages.create({
    model: cfg.model,
    max_tokens: req.maxTokens ?? 16000,
    system: req.system,
    messages: [{ role: 'user', content: req.user }],
  });
  const block = resp.content.find((b) => b.type === 'text');
  if (!block || block.type !== 'text') throw new Error('Claude 未返回文本');
  return block.text.trim();
}

// ─── OpenAI 兼容（OpenAI / DeepSeek / OpenRouter / 智谱 / Qwen / 自定义）──────
async function callOpenAICompat(cfg: ProviderConfig, req: LLMRequest): Promise<string> {
  if (!cfg.apiKey) throw new Error('该 provider 需要 API key');
  const client = new OpenAI({
    apiKey: cfg.apiKey,
    baseURL: cfg.baseURL || 'https://api.openai.com/v1',
  });
  const tokens = req.maxTokens ?? 16000;
  const messages = [
    { role: 'system' as const, content: req.system },
    { role: 'user' as const, content: req.user },
  ];

  // OpenAI 新 reasoning 模型（o1/o3/gpt-5）只支持 max_completion_tokens
  // 老模型用 max_tokens。先猜一个，错了换另一个。
  const modelLower = cfg.model.toLowerCase();
  const preferCompletionTokens = /^(o\d|gpt-5|gpt-6)/.test(modelLower) || modelLower.includes('reasoning');

  async function attempt(useCompletionTokens: boolean): Promise<string> {
    const params: Record<string, unknown> = { model: cfg.model, messages };
    if (useCompletionTokens) params.max_completion_tokens = tokens;
    else params.max_tokens = tokens;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const resp = await client.chat.completions.create(params as any);
    const text = resp.choices[0]?.message?.content;
    if (!text) throw new Error('模型未返回文本');
    return text.trim();
  }

  try {
    return await attempt(preferCompletionTokens);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    // 智能回退：参数错误时换另一个
    if (/max_tokens|max_completion_tokens/.test(msg) && /not supported|unsupported/i.test(msg)) {
      return await attempt(!preferCompletionTokens);
    }
    throw e;
  }
}

// ─── Claude CLI（调本地命令行，用订阅授权）────────────────────────────────────
//
// 策略：通过 stdin 喂给 claude，避开 argv 长度限制（Windows ~32KB / 中文 prompt 容易超）
//
async function callClaudeCLI(req: LLMRequest): Promise<string> {
  const combined = `${req.system}\n\n# 用户输入\n\n${req.user}`;

  return new Promise<string>((resolve, reject) => {
    const args = [
      '--print',
      '--output-format', 'text',
    ];
    const child = spawn('claude', args, {
      shell: process.platform === 'win32',
      windowsHide: true,
      stdio: ['pipe', 'pipe', 'pipe'],
    });

    const stdoutChunks: Buffer[] = [];
    const stderrChunks: Buffer[] = [];
    child.stdout.on('data', (b: Buffer) => stdoutChunks.push(b));
    child.stderr.on('data', (b: Buffer) => stderrChunks.push(b));

    child.on('error', (e) => {
      if ((e as NodeJS.ErrnoException).code === 'ENOENT') {
        reject(new Error('找不到 claude 命令。请确认 Claude Code CLI 已安装并在 PATH 中。'));
      } else {
        reject(e);
      }
    });

    child.on('close', (code) => {
      const stdout = decodeBuffer(Buffer.concat(stdoutChunks));
      const stderr = decodeBuffer(Buffer.concat(stderrChunks));
      if (code === 0) {
        if (!stdout.trim()) {
          reject(new Error(`claude CLI 退出码 0 但输出为空。stderr: ${stderr || '(empty)'}`));
          return;
        }
        resolve(stdout.trim());
      } else {
        reject(new Error(`claude CLI 退出码 ${code}\nstderr: ${stderr.slice(0, 1000) || '(empty)'}\nstdout: ${stdout.slice(0, 500) || '(empty)'}`));
      }
    });

    // 写 prompt 到 stdin 然后关闭
    child.stdin.write(combined, 'utf8');
    child.stdin.end();
  });
}

/** 部署版（不在本地）应隐藏 localOnly 项 */
export function isLocalEnv(): boolean {
  return !process.env.VERCEL && !process.env.NETLIFY;
}
