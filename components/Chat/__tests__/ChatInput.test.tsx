import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { ChatInput } from '../ChatInput';

// Mock @react-navigation/core
jest.mock('@react-navigation/core', () => ({
  useIsFocused: jest.fn().mockReturnValue(true),
}));

// Mock useStudyState
const mockClearPendingChatInput = jest.fn();
let mockPendingChatInput = '';

jest.mock('../../../hooks/useStudyState', () => ({
  useStudyState: jest.fn((selector) => {
    const state = {
      pendingChatInput: mockPendingChatInput,
      clearPendingChatInput: mockClearPendingChatInput,
    };
    return selector ? selector(state) : state;
  }),
}));

import { useIsFocused } from '@react-navigation/core';
const mockUseIsFocused = useIsFocused as jest.Mock;

beforeEach(() => {
  jest.clearAllMocks();
  mockPendingChatInput = '';
  mockUseIsFocused.mockReturnValue(true);
});

describe('ChatInput', () => {
  it('renders TextInput and send button', () => {
    const { getByTestId, getByText } = render(
      <ChatInput onSend={jest.fn()} isLoading={false} />
    );
    expect(getByTestId('chat-text-input')).toBeTruthy();
    expect(getByText('Enviar')).toBeTruthy();
  });

  it('send button is disabled when input is empty (ESTD-26)', () => {
    const { getByTestId } = render(
      <ChatInput onSend={jest.fn()} isLoading={false} />
    );
    const sendButton = getByTestId('chat-send-button');
    expect(sendButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('send button is disabled when isLoading=true (ESTD-26)', () => {
    const { getByTestId } = render(
      <ChatInput onSend={jest.fn()} isLoading={true} />
    );
    fireEvent.changeText(getByTestId('chat-text-input'), 'Hello');
    const sendButton = getByTestId('chat-send-button');
    expect(sendButton.props.accessibilityState?.disabled).toBe(true);
  });

  it('empty input send attempt does nothing (edge case)', () => {
    const onSend = jest.fn();
    const { getByTestId } = render(
      <ChatInput onSend={onSend} isLoading={false} />
    );
    fireEvent.press(getByTestId('chat-send-button'));
    expect(onSend).not.toHaveBeenCalled();
  });

  it('calls onSend with trimmed text and clears input on send', () => {
    const onSend = jest.fn();
    const { getByTestId } = render(
      <ChatInput onSend={onSend} isLoading={false} />
    );
    fireEvent.changeText(getByTestId('chat-text-input'), '  Hello World  ');
    fireEvent.press(getByTestId('chat-send-button'));
    expect(onSend).toHaveBeenCalledWith('Hello World');
    expect(getByTestId('chat-text-input').props.value).toBe('');
  });

  it('reads pendingChatInput on focus and calls clearPendingChatInput (AD-014)', async () => {
    mockPendingChatInput = 'Me explique o conceito atual: RAG';
    const { getByTestId } = render(
      <ChatInput onSend={jest.fn()} isLoading={false} />
    );
    await act(async () => {});
    expect(getByTestId('chat-text-input').props.value).toBe('Me explique o conceito atual: RAG');
    expect(mockClearPendingChatInput).toHaveBeenCalled();
  });
});
