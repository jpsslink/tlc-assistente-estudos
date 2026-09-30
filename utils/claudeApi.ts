import { Message, ChatError } from '../types';

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages';
const ANTHROPIC_VERSION = '2023-06-01';
const MODEL = 'claude-sonnet-5-5';
const MAX_TOKENS = 4096;

export interface ClaudeApiPayload {
  system: string;
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
}

function mapHttpError(status: number): ChatError {
  if (status === 401) return { code: 401, message: 'API key inválida. Verifique a configuração.' };
  if (status === 429) return { code: 429, message: 'Limite de requisições atingido. Aguarde um momento.' };
  if (status === 500) return { code: 500, message: 'Erro nos servidores da Anthropic. Tente novamente.' };
  if (status === 502) return { code: 502, message: 'Erro nos servidores da Anthropic. Tente novamente.' };
  if (status === 503) return { code: 503, message: 'Erro nos servidores da Anthropic. Tente novamente.' };
  return { code: 500, message: `Erro HTTP ${status}.` };
}

/**
 * Non-streaming fallback: sends message and returns full response text.
 * Used when response.body.getReader() is unavailable.
 */
export async function sendMessage(
  apiKey: string,
  payload: ClaudeApiPayload
): Promise<string> {
  let response: Response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        stream: false,
        system: payload.system,
        messages: payload.messages,
      }),
    });
  } catch {
    throw { code: 'network', message: 'Sem conexão com a internet.' } as ChatError;
  }

  if (!response.ok) {
    throw mapHttpError(response.status);
  }

  const json = await response.json();
  return json?.content?.[0]?.text ?? '';
}

/**
 * SSE streaming message. Calls onChunk for each text delta.
 * Falls back to sendMessage when response.body.getReader() is unavailable.
 */
export async function streamMessage(
  apiKey: string,
  payload: ClaudeApiPayload,
  onChunk: (text: string) => void
): Promise<void> {
  let response: Response;
  try {
    response = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        stream: true,
        system: payload.system,
        messages: payload.messages,
      }),
    });
  } catch {
    throw { code: 'network', message: 'Sem conexão com a internet.' } as ChatError;
  }

  if (!response.ok) {
    throw mapHttpError(response.status);
  }

  // Runtime detection: fall back to non-streaming if getReader is unavailable
  if (!response.body || typeof (response.body as ReadableStream).getReader !== 'function') {
    // Fallback: parse the response as non-streaming
    const json = await response.json();
    const text = json?.content?.[0]?.text ?? '';
    if (text) onChunk(text);
    return;
  }

  const reader = (response.body as ReadableStream<Uint8Array>).getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      // Process complete SSE lines
      const lines = buffer.split('\n');
      // Keep the last potentially incomplete line in the buffer
      buffer = lines.pop() ?? '';

      let currentEventType = '';
      for (const line of lines) {
        const trimmed = line.trimEnd();

        if (trimmed.startsWith('event:')) {
          currentEventType = trimmed.slice('event:'.length).trim();
        } else if (trimmed.startsWith('data:')) {
          const dataStr = trimmed.slice('data:'.length).trim();
          if (!dataStr || dataStr === '[DONE]') continue;

          // Skip ping events
          if (currentEventType === 'ping') {
            currentEventType = '';
            continue;
          }

          try {
            const parsed = JSON.parse(dataStr);

            // Handle content_block_delta events
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              const text = parsed.delta.text;
              if (text) onChunk(text);
            }

            // message_stop ends the stream
            if (parsed.type === 'message_stop') {
              return;
            }
          } catch {
            // Skip malformed JSON lines
          }

          currentEventType = '';
        } else if (trimmed === '') {
          // Empty line resets the current event
          currentEventType = '';
        }
      }
    }

    // Flush remaining buffer
    if (buffer.trim()) {
      const lines = buffer.split('\n');
      for (const line of lines) {
        const trimmed = line.trimEnd();
        if (trimmed.startsWith('data:')) {
          const dataStr = trimmed.slice('data:'.length).trim();
          if (!dataStr || dataStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(dataStr);
            if (parsed.type === 'content_block_delta' && parsed.delta?.type === 'text_delta') {
              const text = parsed.delta.text;
              if (text) onChunk(text);
            }
          } catch {
            // Skip malformed
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
