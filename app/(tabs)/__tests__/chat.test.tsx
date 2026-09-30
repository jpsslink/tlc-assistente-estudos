import React from 'react';
import { render, act, fireEvent } from '@testing-library/react-native';
import * as storage from '../../../utils/storage';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: { push: jest.fn() },
}));

// Mock @react-navigation/core
jest.mock('@react-navigation/core', () => ({
  useIsFocused: jest.fn().mockReturnValue(true),
}));

// Mock storage
jest.mock('../../../utils/storage', () => ({
  readApiKey: jest.fn().mockResolvedValue(null),
  writeApiKey: jest.fn().mockResolvedValue(undefined),
  readStudyState: jest.fn().mockReturnValue(null),
  writeStudyState: jest.fn(),
  MMKV_KEY: 'ia-assistente-estudos-state-v1',
  SECURE_KEY: 'anthropic-api-key',
}));

// Mock useStudyState
const mockStudyState = {
  mode: 'concept' as 'concept' | 'project',
  currentPhaseId: 'phase-1',
  currentConceptIndex: 0,
  currentProjectIndex: 0,
  completedConcepts: [] as string[],
  completedProjects: [] as string[],
  projectStepStates: {} as Record<string, Record<number, boolean>>,
  projectCriteriaStates: {} as Record<string, Record<number, boolean>>,
  pendingChatInput: '',
  startDate: Date.now(),
  currentPhase: () => ({ id: 'phase-1', name: 'Ferramentas', objective: '', weekRange: [1,2], color: '#000', concepts: [], projects: [] }),
  currentConcept: () => null,
  currentProject: () => null,
  currentWeek: () => 1,
  markConceptRead: jest.fn(),
  markProjectDone: jest.fn(),
  setPendingChatInput: jest.fn(),
  clearPendingChatInput: jest.fn(),
  updateStepState: jest.fn(),
  updateCriteriaState: jest.fn(),
};

jest.mock('../../../hooks/useStudyState', () => ({
  useStudyState: jest.fn((selector) => {
    return selector ? selector(mockStudyState) : mockStudyState;
  }),
}));

// Mock useClaudeChat
const mockMessages = [] as any[];
const mockSendMessage = jest.fn();
let mockIsLoading = false;
let mockChatError: any = null;

jest.mock('../../../hooks/useClaudeChat', () => ({
  useClaudeChat: () => ({
    messages: mockMessages,
    isLoading: mockIsLoading,
    chatError: mockChatError,
    sendMessage: mockSendMessage,
    clearError: jest.fn(),
  }),
}));

const mockReadApiKey = storage.readApiKey as jest.Mock;

import ChatScreen from '../chat';

beforeEach(() => {
  jest.clearAllMocks();
  mockReadApiKey.mockResolvedValue(null);
  mockIsLoading = false;
  mockChatError = null;
});

describe('ChatScreen', () => {
  it('shows no-key message when API key not configured (ESTD-43)', async () => {
    mockReadApiKey.mockResolvedValue(null);
    const { getByTestId } = render(<ChatScreen />);
    await act(async () => {});
    expect(getByTestId('no-key-message')).toBeTruthy();
  });

  it('shows ApiKeyConfig when no API key (ESTD-43)', async () => {
    mockReadApiKey.mockResolvedValue(null);
    const { getByTestId } = render(<ChatScreen />);
    await act(async () => {});
    expect(getByTestId('api-key-input')).toBeTruthy();
  });

  it('does not show QuickActions when no API key (ESTD-40)', async () => {
    mockReadApiKey.mockResolvedValue(null);
    const { queryByTestId } = render(<ChatScreen />);
    await act(async () => {});
    expect(queryByTestId('quick-actions')).toBeNull();
  });

  it('shows MessageList when API key configured (ESTD-41)', async () => {
    mockReadApiKey.mockResolvedValue('sk-ant-testkey1234');
    const { getByTestId } = render(<ChatScreen />);
    await act(async () => {});
    expect(getByTestId('message-list')).toBeTruthy();
  });

  it('shows ChatInput when API key configured (ESTD-41)', async () => {
    mockReadApiKey.mockResolvedValue('sk-ant-testkey1234');
    const { getByTestId } = render(<ChatScreen />);
    await act(async () => {});
    expect(getByTestId('chat-text-input')).toBeTruthy();
  });

  it('shows QuickActions when API key configured (ESTD-41)', async () => {
    mockReadApiKey.mockResolvedValue('sk-ant-testkey1234');
    const { getByTestId } = render(<ChatScreen />);
    await act(async () => {});
    expect(getByTestId('quick-actions')).toBeTruthy();
  });

  it('shows chatError inline without clearing history (ESTD-29 to ESTD-32)', async () => {
    mockReadApiKey.mockResolvedValue('sk-ant-testkey1234');
    mockChatError = { code: 401, message: 'API key inválida. Verifique a configuração.' };
    const { getByTestId } = render(<ChatScreen />);
    await act(async () => {});
    expect(getByTestId('chat-error')).toBeTruthy();
  });

  it('displays error message text (ESTD-29)', async () => {
    mockReadApiKey.mockResolvedValue('sk-ant-testkey1234');
    mockChatError = { code: 401, message: 'API key inválida. Verifique a configuração.' };
    const { getByText } = render(<ChatScreen />);
    await act(async () => {});
    expect(getByText('API key inválida. Verifique a configuração.')).toBeTruthy();
  });

  it('renders full chat screen without crashing (ESTD-54)', async () => {
    mockReadApiKey.mockResolvedValue('sk-ant-testkey1234');
    const { getByTestId } = render(<ChatScreen />);
    await act(async () => {});
    expect(getByTestId('chat-screen')).toBeTruthy();
  });
});
