const DEFAULT_MODEL = 'gpt-4o-mini';
const GEMINI_OPENAI_BASE = 'https://generativelanguage.googleapis.com/v1beta/openai';

export function getChatbotApiKey(): string | undefined {
  return process.env.OPENAI_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim();
}

export function isChatbotAiEnabled(): boolean {
  return Boolean(getChatbotApiKey());
}

export function getChatbotModel(): string {
  return process.env.OPENAI_CHATBOT_MODEL?.trim() || DEFAULT_MODEL;
}

function getApiBaseUrl(): string {
  const custom = process.env.CHATBOT_API_BASE_URL?.trim();
  if (custom) return custom.replace(/\/$/, '');

  const model = getChatbotModel();
  if (model.startsWith('gemini')) {
    return GEMINI_OPENAI_BASE;
  }

  return 'https://api.openai.com/v1';
}

type ChatRole = 'system' | 'user' | 'assistant';

async function chatCompletion(params: {
  system: string;
  messages: Array<{ role: ChatRole; content: string }>;
  temperature?: number;
  jsonMode?: boolean;
}): Promise<string> {
  const apiKey = getChatbotApiKey();
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY or GEMINI_API_KEY is not configured');
  }

  const body: Record<string, unknown> = {
    model: getChatbotModel(),
    temperature: params.temperature ?? 0,
    messages: [{ role: 'system', content: params.system }, ...params.messages],
  };

  if (params.jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const res = await fetch(`${getApiBaseUrl()}/chat/completions`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Chat API error ${res.status}: ${errText.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  const content = data.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('Empty chat API response');
  }

  return content;
}

export async function chatCompletionJson<T>(params: {
  system: string;
  messages: Array<{ role: ChatRole; content: string }>;
  temperature?: number;
}): Promise<T> {
  const content = await chatCompletion({ ...params, jsonMode: true });
  return JSON.parse(content) as T;
}

export async function chatCompletionText(params: {
  system: string;
  messages: Array<{ role: ChatRole; content: string }>;
  temperature?: number;
}): Promise<string> {
  return chatCompletion({ ...params, jsonMode: false });
}
