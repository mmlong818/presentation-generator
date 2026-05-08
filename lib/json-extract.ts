// ─── 从 LLM 输出中提取合法 JSON ──────────────────────────────────────────────
// 处理常见的"脏输出"：markdown 包裹、思考标签、前后说明文字、智能引号等。

/** 尝试从原始文本中抽出第一个完整 JSON 对象。返回 null 表示找不到。 */
export function extractJSON(raw: string): string | null {
  if (!raw) return null;
  let s = raw;

  // 1. 剥 <think>...</think> 块（DeepSeek-reasoner / Qwen-thinking 等）
  s = s.replace(/<think(?:ing)?>[\s\S]*?<\/think(?:ing)?>/gi, '');

  // 2. 剥 markdown 代码块 ```json ... ```
  const codeBlockMatch = s.match(/```(?:json|JSON)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) s = codeBlockMatch[1];

  // 3. 剥常见前缀 "Here is the JSON:" / "以下是 deck:" / "Output:" 等
  s = s.replace(/^[^{[]*?(?=[{[])/, '');

  // 4. 找第一个 { 到匹配的 }（处理嵌套）
  const start = s.indexOf('{');
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < s.length; i++) {
    const ch = s[i];
    if (escape) { escape = false; continue; }
    if (ch === '\\') { escape = true; continue; }
    if (ch === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (ch === '{') depth++;
    else if (ch === '}') {
      depth--;
      if (depth === 0) return s.slice(start, i + 1);
    }
  }
  // 没有平衡的右括号 → 截断输出，返回从 { 到结尾让 JSON.parse 报具体错
  return s.slice(start);
}

/** 把"花式引号"换成标准 ASCII 引号（AI 偶尔会输出 " " ' '） */
export function normalizeQuotes(json: string): string {
  // 仅在字符串值之外替换；为简化，全局替换一次。如果误伤可再优化。
  // 注意保留中文文本中的中文引号 "" '' （这些是 “”‘’）
  // AI 经常把 JSON 的字段引号生成为弯引号，这里只在键边界做最小替换：
  return json
    .replace(/[“”](?=\s*[:,}\]])/g, '"')   // 弯右引号紧跟 : , } ]
    .replace(/(?<=[{,]\s*)[“”]/g, '"')     // 弯引号紧跟 { 或 ,
    .replace(/[‘’]/g, "'");                // 单引号统一
}

/** 完整解析流程：抽取 → 归一化 → parse */
export function parseLLMJSON<T = unknown>(raw: string): { ok: true; data: T } | { ok: false; error: string; preview: string } {
  const extracted = extractJSON(raw);
  if (!extracted) {
    return { ok: false, error: '未找到 JSON 对象', preview: raw.slice(0, 800) };
  }
  let candidate = extracted.trim();
  try {
    return { ok: true, data: JSON.parse(candidate) as T };
  } catch {
    // 重试：归一化引号
    candidate = normalizeQuotes(candidate);
    try {
      return { ok: true, data: JSON.parse(candidate) as T };
    } catch (e) {
      return {
        ok: false,
        error: e instanceof Error ? e.message : String(e),
        preview: candidate.slice(0, 800),
      };
    }
  }
}
