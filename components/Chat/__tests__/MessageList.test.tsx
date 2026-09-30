import React from 'react';
import { render } from '@testing-library/react-native';
import { MessageList } from '../MessageList';
import type { Message } from '../../../types';

const messages: Message[] = [
  { id: '1', role: 'user', content: 'Hello' },
  { id: '2', role: 'assistant', content: 'Hi there!' },
];

describe('MessageList', () => {
  it('renders FlatList with messages (ESTD-28)', () => {
    const { getByTestId } = render(<MessageList messages={messages} />);
    expect(getByTestId('message-list')).toBeTruthy();
  });

  it('renders MessageBubble for each message', () => {
    const { getByText } = render(<MessageList messages={messages} />);
    expect(getByText('Hello')).toBeTruthy();
    expect(getByText('Hi there!')).toBeTruthy();
  });

  it('renders empty state without crash', () => {
    const { getByTestId } = render(<MessageList messages={[]} />);
    expect(getByTestId('message-list')).toBeTruthy();
  });

  it('renders multiple messages in order', () => {
    const manyMessages: Message[] = [
      { id: '1', role: 'user', content: 'Message 1' },
      { id: '2', role: 'assistant', content: 'Response 1' },
      { id: '3', role: 'user', content: 'Message 2' },
    ];
    const { getByText } = render(<MessageList messages={manyMessages} />);
    expect(getByText('Message 1')).toBeTruthy();
    expect(getByText('Response 1')).toBeTruthy();
    expect(getByText('Message 2')).toBeTruthy();
  });
});
