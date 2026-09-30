import React from 'react';
import { render } from '@testing-library/react-native';
import { MessageBubble } from '../MessageBubble';
import type { Message } from '../../../types';

const userMessage: Message = {
  id: 'msg-1',
  role: 'user',
  content: 'Hello, Claude!',
};

const assistantMessage: Message = {
  id: 'msg-2',
  role: 'assistant',
  content: 'Hello! How can I help you?',
};

const streamingMessage: Message = {
  id: 'msg-3',
  role: 'assistant',
  content: 'Streaming response...',
  isStreaming: true,
};

describe('MessageBubble', () => {
  it('renders user message as plain Text with right-aligned bubble', () => {
    const { getByTestId, getByText } = render(<MessageBubble message={userMessage} />);
    expect(getByTestId('message-bubble-user')).toBeTruthy();
    expect(getByText('Hello, Claude!')).toBeTruthy();
  });

  it('renders assistant message via Markdown (ESTD-34)', () => {
    const { getByTestId } = render(<MessageBubble message={assistantMessage} />);
    expect(getByTestId('message-bubble-assistant')).toBeTruthy();
  });

  it('shows streaming indicator when isStreaming=true (ESTD-26)', () => {
    const { getByTestId } = render(<MessageBubble message={streamingMessage} />);
    expect(getByTestId('streaming-indicator')).toBeTruthy();
  });

  it('does not show streaming indicator when isStreaming=false', () => {
    const { queryByTestId } = render(<MessageBubble message={assistantMessage} />);
    expect(queryByTestId('streaming-indicator')).toBeNull();
  });

  it('renders assistant message content', () => {
    const { getByText } = render(<MessageBubble message={assistantMessage} />);
    expect(getByText('Hello! How can I help you?')).toBeTruthy();
  });
});
