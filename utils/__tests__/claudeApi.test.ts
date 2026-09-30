import { streamMessage, sendMessage, ClaudeApiPayload } from '../claudeApi';
import { ChatError } from '../../types';

const MOCK_API_KEY = 'sk-ant-test-key';
const MOCK_PAYLOAD: ClaudeApiPayload = {
  system: 'You are a tutor.',
  messages: [{ role: 'user', content: 'Hello' }],
};

// Helper to create a mock SSE stream
function makeSseStream(events: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    start(controller) {
      for (const event of events) {
        controller.enqueue(encoder.encode(event));
      }
      controller.close();
    },
  });
}

function makeFetchOk(body: ReadableStream<Uint8Array>): jest.Mock {
  return jest.fn().mockResolvedValue({
    ok: true,
    status: 200,
    body,
  } as unknown as Response);
}

function makeFetchError(status: number): jest.Mock {
  return jest.fn().mockResolvedValue({
    ok: false,
    status,
    body: null,
  } as unknown as Response);
}

function makeFetchNetworkError(): jest.Mock {
  return jest.fn().mockRejectedValue(new Error('Network error'));
}

describe('sendMessage', () => {
  it('sends correct request body with model, max_tokens, stream:false', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ content: [{ text: 'Hello response' }] }),
    } as unknown as Response);
    global.fetch = fetchMock;

    await sendMessage(MOCK_API_KEY, MOCK_PAYLOAD);

    const callArgs = fetchMock.mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.model).toBe('claude-sonnet-5-5');
    expect(body.max_tokens).toBe(4096);
    expect(body.stream).toBe(false);
    expect(body.system).toBe(MOCK_PAYLOAD.system);
    expect(body.messages).toEqual(MOCK_PAYLOAD.messages);
  });

  it('sends correct headers including x-api-key and anthropic-version', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ content: [{ text: 'ok' }] }),
    } as unknown as Response);
    global.fetch = fetchMock;

    await sendMessage(MOCK_API_KEY, MOCK_PAYLOAD);

    const headers = fetchMock.mock.calls[0][1].headers;
    expect(headers['x-api-key']).toBe(MOCK_API_KEY);
    expect(headers['anthropic-version']).toBe('2023-06-01');
    expect(headers['content-type']).toBe('application/json');
  });

  it('returns text from response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ content: [{ text: 'Expected response text' }] }),
    } as unknown as Response);

    const result = await sendMessage(MOCK_API_KEY, MOCK_PAYLOAD);
    expect(result).toBe('Expected response text');
  });

  it('throws ChatError with code 401 on 401 response', async () => {
    global.fetch = makeFetchError(401);
    await expect(sendMessage(MOCK_API_KEY, MOCK_PAYLOAD)).rejects.toMatchObject({
      code: 401,
    });
  });

  it('throws ChatError with code 429 on 429 response', async () => {
    global.fetch = makeFetchError(429);
    await expect(sendMessage(MOCK_API_KEY, MOCK_PAYLOAD)).rejects.toMatchObject({
      code: 429,
    });
  });

  it('throws ChatError with code network on network failure', async () => {
    global.fetch = makeFetchNetworkError();
    await expect(sendMessage(MOCK_API_KEY, MOCK_PAYLOAD)).rejects.toMatchObject({
      code: 'network',
    });
  });
});

describe('streamMessage', () => {
  it('calls onChunk for each content_block_delta text_delta event', async () => {
    const sseEvents = [
      'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"Hello "}}\n\n',
      'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"World"}}\n\n',
      'data: {"type":"message_stop"}\n\n',
    ];
    global.fetch = makeFetchOk(makeSseStream(sseEvents));

    const chunks: string[] = [];
    await streamMessage(MOCK_API_KEY, MOCK_PAYLOAD, (t) => chunks.push(t));
    expect(chunks).toEqual(['Hello ', 'World']);
  });

  it('ignores ping events', async () => {
    const sseEvents = [
      'event: ping\ndata: {"type":"ping"}\n\n',
      'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"After ping"}}\n\n',
      'data: {"type":"message_stop"}\n\n',
    ];
    global.fetch = makeFetchOk(makeSseStream(sseEvents));

    const chunks: string[] = [];
    await streamMessage(MOCK_API_KEY, MOCK_PAYLOAD, (t) => chunks.push(t));
    expect(chunks).toEqual(['After ping']);
  });

  it('stops streaming on message_stop event', async () => {
    const sseEvents = [
      'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"First"}}\n\n',
      'data: {"type":"message_stop"}\n\n',
      'event: content_block_delta\ndata: {"type":"content_block_delta","delta":{"type":"text_delta","text":"After stop"}}\n\n',
    ];
    global.fetch = makeFetchOk(makeSseStream(sseEvents));

    const chunks: string[] = [];
    await streamMessage(MOCK_API_KEY, MOCK_PAYLOAD, (t) => chunks.push(t));
    expect(chunks).toEqual(['First']);
    expect(chunks).not.toContain('After stop');
  });

  it('throws ChatError 401 on 401 response', async () => {
    global.fetch = makeFetchError(401);
    await expect(
      streamMessage(MOCK_API_KEY, MOCK_PAYLOAD, jest.fn())
    ).rejects.toMatchObject({ code: 401 });
  });

  it('throws ChatError 429 on 429 response', async () => {
    global.fetch = makeFetchError(429);
    await expect(
      streamMessage(MOCK_API_KEY, MOCK_PAYLOAD, jest.fn())
    ).rejects.toMatchObject({ code: 429 });
  });

  it('throws ChatError 500 on 500 response', async () => {
    global.fetch = makeFetchError(500);
    await expect(
      streamMessage(MOCK_API_KEY, MOCK_PAYLOAD, jest.fn())
    ).rejects.toMatchObject({ code: 500 });
  });

  it('throws ChatError 502 on 502 response', async () => {
    global.fetch = makeFetchError(502);
    await expect(
      streamMessage(MOCK_API_KEY, MOCK_PAYLOAD, jest.fn())
    ).rejects.toMatchObject({ code: 502 });
  });

  it('throws ChatError 503 on 503 response', async () => {
    global.fetch = makeFetchError(503);
    await expect(
      streamMessage(MOCK_API_KEY, MOCK_PAYLOAD, jest.fn())
    ).rejects.toMatchObject({ code: 503 });
  });

  it('throws ChatError network on network failure', async () => {
    global.fetch = makeFetchNetworkError();
    await expect(
      streamMessage(MOCK_API_KEY, MOCK_PAYLOAD, jest.fn())
    ).rejects.toMatchObject({ code: 'network' });
  });

  it('sends stream:true in request body', async () => {
    const sseEvents = ['data: {"type":"message_stop"}\n\n'];
    const fetchMock = makeFetchOk(makeSseStream(sseEvents));
    global.fetch = fetchMock;

    await streamMessage(MOCK_API_KEY, MOCK_PAYLOAD, jest.fn());

    const body = JSON.parse(fetchMock.mock.calls[0][1].body);
    expect(body.stream).toBe(true);
    expect(body.model).toBe('claude-sonnet-5-5');
    expect(body.max_tokens).toBe(4096);
  });

  it('falls back to non-streaming when response.body.getReader is unavailable', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      body: null,
      json: async () => ({ content: [{ text: 'Fallback text' }] }),
    } as unknown as Response);

    const chunks: string[] = [];
    await streamMessage(MOCK_API_KEY, MOCK_PAYLOAD, (t) => chunks.push(t));
    expect(chunks).toEqual(['Fallback text']);
  });

  it('does not include apiKey in any thrown error message', async () => {
    global.fetch = makeFetchError(401);
    try {
      await streamMessage(MOCK_API_KEY, MOCK_PAYLOAD, jest.fn());
      fail('Expected error to be thrown');
    } catch (err) {
      const error = err as ChatError;
      expect(error.message).not.toContain(MOCK_API_KEY);
    }
  });

  it('sends to correct API endpoint', async () => {
    const sseEvents = ['data: {"type":"message_stop"}\n\n'];
    const fetchMock = makeFetchOk(makeSseStream(sseEvents));
    global.fetch = fetchMock;

    await streamMessage(MOCK_API_KEY, MOCK_PAYLOAD, jest.fn());
    expect(fetchMock.mock.calls[0][0]).toBe('https://api.anthropic.com/v1/messages');
  });
});
