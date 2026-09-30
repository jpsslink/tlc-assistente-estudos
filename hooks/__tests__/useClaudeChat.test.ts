import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useClaudeChat } from '../useClaudeChat';
import { ChatError, StudyState } from '../../types';
import { CURRICULUM } from '../../data/curriculum';

// Mock claudeApi
jest.mock('../../utils/claudeApi', () => ({
  streamMessage: jest.fn(),
}));

// Mock storage - override the global mock for readApiKey
jest.mock('../../utils/storage', () => ({
  readApiKey: jest.fn().mockResolvedValue('sk-ant-test-key'),
  writeApiKey: jest.fn(),
  readStudyState: jest.fn().mockReturnValue(null),
  writeStudyState: jest.fn(),
  MMKV_KEY: 'ia-assistente-estudos-state-v1',
  SECURE_KEY: 'anthropic-api-key',
}));

// Mock systemPrompt
jest.mock('../../utils/systemPrompt', () => ({
  buildPrompt: jest.fn().mockReturnValue('System prompt context'),
}));

import { streamMessage } from '../../utils/claudeApi';
import { readApiKey } from '../../utils/storage';
import { writeStudyState } from '../../utils/storage';

const mockStreamMessage = streamMessage as jest.Mock;
const mockReadApiKey = readApiKey as jest.Mock;

const mockStudyState: StudyState = {
  currentPhaseId: CURRICULUM[0].id,
  currentConceptIndex: 0,
  currentProjectIndex: 0,
  mode: 'concept',
  startDate: Date.now(),
  completedConcepts: [],
  completedProjects: [],
  projectStepStates: {},
  projectCriteriaStates: {},
  pendingChatInput: '',
};

describe('useClaudeChat', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockReadApiKey.mockResolvedValue('sk-ant-test-key');
    // Default: streaming completes immediately with no chunks
    mockStreamMessage.mockImplementation(async (_key, _payload, onChunk) => {
      onChunk('Hello');
    });
  });

  it('starts with empty messages, isLoading=false, chatError=null', () => {
    const { result } = renderHook(() => useClaudeChat());
    expect(result.current.messages).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.chatError).toBeNull();
  });

  it('appends user message and empty assistant message on sendMessage (ESTD-27, ESTD-28)', async () => {
    mockStreamMessage.mockImplementation(async () => {
      // No chunks
    });

    const { result } = renderHook(() => useClaudeChat());

    await act(async () => {
      await result.current.sendMessage('Hello', mockStudyState);
    });

    expect(result.current.messages.length).toBe(2);
    expect(result.current.messages[0].role).toBe('user');
    expect(result.current.messages[0].content).toBe('Hello');
    expect(result.current.messages[1].role).toBe('assistant');
  });

  it('sets isLoading=true while streaming and false when done (ESTD-26)', async () => {
    let resolveStream: (() => void) | undefined;
    mockStreamMessage.mockImplementation(
      () => new Promise<void>((resolve) => { resolveStream = resolve; })
    );

    const { result } = renderHook(() => useClaudeChat());

    act(() => {
      result.current.sendMessage('Hello', mockStudyState);
    });

    // isLoading should be true during streaming
    await waitFor(() => expect(result.current.isLoading).toBe(true));

    // Resolve the stream
    await act(async () => {
      resolveStream?.();
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('updates assistant message content progressively via onChunk (ESTD-27)', async () => {
    mockStreamMessage.mockImplementation(async (_key, _payload, onChunk) => {
      onChunk('Hello');
      onChunk(' World');
    });

    const { result } = renderHook(() => useClaudeChat());

    await act(async () => {
      await result.current.sendMessage('Hi', mockStudyState);
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    expect(assistantMsg?.content).toBe('Hello World');
  });

  it('sets chatError on 401 and does NOT clear messages (ESTD-29)', async () => {
    const error: ChatError = { code: 401, message: 'API key inválida.' };
    mockStreamMessage.mockRejectedValue(error);

    const { result } = renderHook(() => useClaudeChat());

    await act(async () => {
      await result.current.sendMessage('Hi', mockStudyState);
    });

    expect(result.current.chatError).toMatchObject({ code: 401 });
    // Messages still present (user + empty assistant)
    expect(result.current.messages.length).toBe(2);
  });

  it('sets chatError on 429 and does NOT clear messages (ESTD-30)', async () => {
    const error: ChatError = { code: 429, message: 'Limite atingido.' };
    mockStreamMessage.mockRejectedValue(error);

    const { result } = renderHook(() => useClaudeChat());

    await act(async () => {
      await result.current.sendMessage('Hi', mockStudyState);
    });

    expect(result.current.chatError).toMatchObject({ code: 429 });
    expect(result.current.messages.length).toBe(2);
  });

  it('sets chatError on 500 and does NOT clear messages (ESTD-31)', async () => {
    const error: ChatError = { code: 500, message: 'Erro servidor.' };
    mockStreamMessage.mockRejectedValue(error);

    const { result } = renderHook(() => useClaudeChat());

    await act(async () => {
      await result.current.sendMessage('Hi', mockStudyState);
    });

    expect(result.current.chatError).toMatchObject({ code: 500 });
    expect(result.current.messages.length).toBe(2);
  });

  it('sets chatError on network failure and does NOT clear messages (ESTD-32)', async () => {
    const error: ChatError = { code: 'network', message: 'Sem conexão.' };
    mockStreamMessage.mockRejectedValue(error);

    const { result } = renderHook(() => useClaudeChat());

    await act(async () => {
      await result.current.sendMessage('Hi', mockStudyState);
    });

    expect(result.current.chatError).toMatchObject({ code: 'network' });
    expect(result.current.messages.length).toBe(2);
  });

  it('isLoading is false after error', async () => {
    mockStreamMessage.mockRejectedValue({ code: 401, message: 'error' });

    const { result } = renderHook(() => useClaudeChat());

    await act(async () => {
      await result.current.sendMessage('Hi', mockStudyState);
    });

    expect(result.current.isLoading).toBe(false);
  });

  it('truncates to last 20 messages before API call (ESTD-33)', async () => {
    // We need to pre-populate messages to 22 before sending
    // We'll do this by sending 11 messages (each creates user+assistant)
    let callCount = 0;
    mockStreamMessage.mockImplementation(async (_key, _payload, onChunk) => {
      callCount++;
      onChunk(`Response ${callCount}`);
    });

    const { result } = renderHook(() => useClaudeChat());

    // Send 11 messages to accumulate 22 messages (11 user + 11 assistant)
    for (let i = 0; i < 11; i++) {
      await act(async () => {
        await result.current.sendMessage(`Message ${i}`, mockStudyState);
      });
    }

    // At this point we have 22 messages
    expect(result.current.messages.length).toBe(22);

    // On the 12th send, the API should receive at most 20 messages
    let capturedPayload: { messages: Array<{ role: string; content: string }> } | null = null;
    mockStreamMessage.mockImplementation(async (_key, payload, onChunk) => {
      capturedPayload = payload;
      onChunk('Final');
    });

    await act(async () => {
      await result.current.sendMessage('Message 11', mockStudyState);
    });

    expect(capturedPayload).not.toBeNull();
    expect((capturedPayload as any).messages.length).toBeLessThanOrEqual(20);
  });

  it('does not write to MMKV (chat history is ephemeral) (ESTD-48)', async () => {
    const { writeStudyState: mockWriteStudyState } = require('../../utils/storage');

    const { result } = renderHook(() => useClaudeChat());

    await act(async () => {
      await result.current.sendMessage('Hi', mockStudyState);
    });

    expect(mockWriteStudyState).not.toHaveBeenCalled();
  });

  it('clears chatError via clearError()', async () => {
    mockStreamMessage.mockRejectedValue({ code: 401, message: 'error' });

    const { result } = renderHook(() => useClaudeChat());

    await act(async () => {
      await result.current.sendMessage('Hi', mockStudyState);
    });

    expect(result.current.chatError).not.toBeNull();

    act(() => {
      result.current.clearError();
    });

    expect(result.current.chatError).toBeNull();
  });

  it('does nothing when sendMessage called with empty text', async () => {
    const { result } = renderHook(() => useClaudeChat());

    await act(async () => {
      await result.current.sendMessage('   ', mockStudyState);
    });

    expect(result.current.messages.length).toBe(0);
    expect(mockStreamMessage).not.toHaveBeenCalled();
  });

  it('sets chatError on missing API key', async () => {
    mockReadApiKey.mockResolvedValue(null);

    const { result } = renderHook(() => useClaudeChat());

    await act(async () => {
      await result.current.sendMessage('Hi', mockStudyState);
    });

    expect(result.current.chatError).toMatchObject({ code: 401 });
  });

  it('marks assistant message isStreaming=false when done', async () => {
    mockStreamMessage.mockImplementation(async (_key, _payload, onChunk) => {
      onChunk('done');
    });

    const { result } = renderHook(() => useClaudeChat());

    await act(async () => {
      await result.current.sendMessage('Hi', mockStudyState);
    });

    const assistantMsg = result.current.messages.find((m) => m.role === 'assistant');
    expect(assistantMsg?.isStreaming).toBe(false);
  });

  it('grows messages array with each conversation turn (ESTD-28)', async () => {
    const { result } = renderHook(() => useClaudeChat());

    await act(async () => {
      await result.current.sendMessage('First', mockStudyState);
    });
    expect(result.current.messages.length).toBe(2);

    await act(async () => {
      await result.current.sendMessage('Second', mockStudyState);
    });
    expect(result.current.messages.length).toBe(4);
  });
});
