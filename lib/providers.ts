// ─── Provider 预设（纯数据，client+server 都可 import）────────────────────────

export type ProviderId = 'anthropic' | 'openai-compat' | 'claude-cli';

export interface ProviderConfig {
  provider: ProviderId;
  model: string;
  apiKey?: string;
  baseURL?: string;
}

export interface ProviderPreset {
  id: string;
  label: string;
  provider: ProviderId;
  baseURL?: string;
  defaultModel: string;
  modelExamples: string[];
  signupURL?: string;
  /** 仅本地可用（部署版隐藏） */
  localOnly?: boolean;
  note?: string;
}

export const PROVIDER_PRESETS: ProviderPreset[] = [
  {
    id: 'claude-cli',
    label: 'Claude CLI 订阅（本地）',
    provider: 'claude-cli',
    defaultModel: '(由 CLI 选择)',
    modelExamples: [],
    localOnly: true,
    note: '调用本地 claude 命令，复用你的 Claude Code 订阅，不消耗 API 额度。仅本地运行可用。',
  },
  {
    id: 'anthropic',
    label: 'Anthropic 官方',
    provider: 'anthropic',
    defaultModel: 'claude-sonnet-4-5',
    modelExamples: ['claude-sonnet-4-5', 'claude-opus-4-5', 'claude-haiku-4-5'],
    signupURL: 'https://console.anthropic.com/settings/keys',
  },
  {
    id: 'openai',
    label: 'OpenAI',
    provider: 'openai-compat',
    baseURL: 'https://api.openai.com/v1',
    defaultModel: 'gpt-4o',
    modelExamples: ['gpt-4o', 'gpt-4o-mini', 'o1', 'o1-mini'],
    signupURL: 'https://platform.openai.com/api-keys',
  },
  {
    id: 'deepseek',
    label: 'DeepSeek',
    provider: 'openai-compat',
    baseURL: 'https://api.deepseek.com/v1',
    defaultModel: 'deepseek-chat',
    modelExamples: ['deepseek-chat', 'deepseek-reasoner'],
    signupURL: 'https://platform.deepseek.com/api_keys',
    note: '性价比高，推理模型适合复杂结构化输出',
  },
  {
    id: 'openrouter',
    label: 'OpenRouter（多模型聚合）',
    provider: 'openai-compat',
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'anthropic/claude-sonnet-4-5',
    modelExamples: ['anthropic/claude-sonnet-4-5', 'openai/gpt-4o', 'google/gemini-2.5-pro', 'deepseek/deepseek-chat'],
    signupURL: 'https://openrouter.ai/keys',
    note: '一个 key 用所有模型，按 token 计费',
  },
  {
    id: 'moonshot',
    label: '月之暗面 Kimi',
    provider: 'openai-compat',
    baseURL: 'https://api.moonshot.cn/v1',
    defaultModel: 'moonshot-v1-32k',
    modelExamples: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    signupURL: 'https://platform.moonshot.cn/console/api-keys',
  },
  {
    id: 'zhipu',
    label: '智谱 GLM',
    provider: 'openai-compat',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4',
    defaultModel: 'glm-4.5',
    modelExamples: ['glm-4.5', 'glm-4.5-air', 'glm-4-plus'],
    signupURL: 'https://open.bigmodel.cn/usercenter/apikeys',
  },
  {
    id: 'qwen',
    label: '通义千问 Qwen',
    provider: 'openai-compat',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    defaultModel: 'qwen-max',
    modelExamples: ['qwen-max', 'qwen-plus', 'qwen-turbo', 'qwen3-max'],
    signupURL: 'https://dashscope.console.aliyun.com/apiKey',
  },
  {
    id: 'custom',
    label: '自定义 baseURL',
    provider: 'openai-compat',
    baseURL: '',
    defaultModel: '',
    modelExamples: [],
    note: '任何 OpenAI 兼容协议的服务',
  },
];
