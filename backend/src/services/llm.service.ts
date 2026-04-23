import OpenAI from 'openai';
import { LLMConfig } from '../types';

let client: OpenAI | null = null;

export function getLLMClient(config: LLMConfig): OpenAI {
  if (!client || client.apiKey !== config.apiKey) {
    client = new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseUrl,
    });
  }
  return client;
}

export async function callLLM(
  config: LLMConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const openai = getLLMClient(config);
  
  const response = await openai.chat.completions.create({
    model: config.model || 'gpt-4o-mini',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.7,
    max_tokens: 4096,
  });

  return response.choices[0]?.message?.content || '';
}
