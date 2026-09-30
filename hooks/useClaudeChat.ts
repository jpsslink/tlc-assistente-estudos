import { useState, useCallback } from 'react';
import { Message, ChatError, StudyState } from '../types';
import { streamMessage } from '../utils/claudeApi';
import { buildPrompt } from '../utils/systemPrompt';
import { readApiKey } from '../utils/storage';

const MAX_HISTORY = 20;

function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function useClaudeChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatError, setChatError] = useState<ChatError | null>(null);

  const clearError = useCallback(() => {
    setChatError(null);
  }, []);

  const sendMessage = useCallback(async (text: string, studyState: StudyState) => {
    if (!text.trim()) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text,
    };

    // Append user message using functional update
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);
    setChatError(null);

    // Append empty assistant message immediately (streaming placeholder)
    const assistantId = generateId();
    const assistantMessage: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    };

    // We need a snapshot of current messages for the API call
    // Use messages ref captured at call time (before the new user message)
    // Then include userMessage so the API gets the full history
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      const apiKey = await readApiKey();
      if (!apiKey) {
        throw { code: 401, message: 'API key não configurada.' } as ChatError;
      }

      // Build system prompt from current study state
      const system = buildPrompt(studyState);

      // messages here is the snapshot at callback-creation time
      // Construct history: current messages + new user message, then truncate
      const historyWithUser = [...messages, userMessage];
      const truncated = historyWithUser.slice(-MAX_HISTORY);

      // Map to API format (role + content only)
      const apiMessages = truncated.map((m) => ({
        role: m.role,
        content: m.content,
      }));

      await streamMessage(apiKey, { system, messages: apiMessages }, (chunk) => {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? { ...m, content: m.content + chunk }
              : m
          )
        );
      });

      // Mark streaming complete
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        )
      );
    } catch (err) {
      const error = err as ChatError;
      setChatError(error);
      // Keep messages intact; mark assistant message as done
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId ? { ...m, isStreaming: false } : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  }, [messages]);

  return { messages, isLoading, chatError, sendMessage, clearError };
}
