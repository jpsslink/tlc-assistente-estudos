import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { router } from 'expo-router';
import type { Concept, Project } from '../../../types';

// Mock expo-router
jest.mock('expo-router', () => ({
  router: {
    push: jest.fn(),
  },
}));

// Mock useStudyState with default concept mode
const mockState = {
  mode: 'concept' as 'concept' | 'project',
  currentConceptIndex: 0,
  currentProjectIndex: 0,
  completedConcepts: [] as string[],
  completedProjects: [] as string[],
  projectStepStates: {} as Record<string, Record<number, boolean>>,
  projectCriteriaStates: {} as Record<string, Record<number, boolean>>,
  pendingChatInput: '',
  currentPhaseId: 'phase-1',
  startDate: Date.now(),
};

const mockConcept = {
  id: 'phase-1-concept-1',
  title: 'Fundamentos de LLMs e Engenharia de Prompts',
  whyItMatters: 'Base de tudo.',
  whatToLearn: 'Transformer, tokens.',
  howToLearn: 'Pratique com APIs.',
  resources: ['Resource 1'],
  pitfalls: ['Pitfall 1'],
  readingTimeMinutes: 35,
};

const mockProject = {
  id: 'phase-1-project-1',
  title: 'Assistente CLI com Memória de Sessão',
  description: 'Construa um assistente CLI.',
  steps: [
    { title: 'Passo 1', description: 'Step desc 1' },
    { title: 'Passo 2', description: 'Step desc 2' },
  ],
  readinessCriteria: ['Critério 1', 'Critério 2'],
};

const mockPhase = {
  id: 'phase-1',
  name: 'Ferramentas e Memória',
  objective: 'Dominar ferramentas',
  weekRange: [1, 2] as [number, number],
  color: '#0066cc',
  concepts: [mockConcept],
  projects: [mockProject],
};

const mockMarkConceptRead = jest.fn();
const mockMarkProjectDone = jest.fn();
const mockSetPendingChatInput = jest.fn();
const mockUpdateStepState = jest.fn();
const mockUpdateCriteriaState = jest.fn();

const mockUseStudyState = {
  ...mockState,
  currentPhase: () => mockPhase,
  currentConcept: () => mockConcept as Concept | null,
  currentProject: () => null as Project | null,
  currentWeek: () => 1,
  markConceptRead: mockMarkConceptRead,
  markProjectDone: mockMarkProjectDone,
  setPendingChatInput: mockSetPendingChatInput,
  clearPendingChatInput: jest.fn(),
  updateStepState: mockUpdateStepState,
  updateCriteriaState: mockUpdateCriteriaState,
};

jest.mock('../../../hooks/useStudyState', () => ({
  useStudyState: () => mockUseStudyState,
}));

// Re-import after mocks
import DashboardScreen from '../index';

beforeEach(() => {
  jest.clearAllMocks();
  mockUseStudyState.mode = 'concept';
  mockUseStudyState.currentConcept = () => mockConcept as Concept | null;
  mockUseStudyState.currentProject = () => null as Project | null;
  mockUseStudyState.completedConcepts = [];
  mockUseStudyState.completedProjects = [];
  mockUseStudyState.projectStepStates = {};
  mockUseStudyState.projectCriteriaStates = {};
});

describe('DashboardScreen', () => {
  it('renders PhaseHeader (ESTD-01)', () => {
    const { getByText } = render(<DashboardScreen />);
    // PhaseHeader renders week/phase/concept info
    expect(getByText(/Semana 1\/14/)).toBeTruthy();
  });

  it('renders ProgressBar', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('phase-progress-label')).toBeTruthy();
    expect(getByTestId('overall-progress-label')).toBeTruthy();
  });

  it('renders Timeline', () => {
    const { getByTestId } = render(<DashboardScreen />);
    expect(getByTestId('timeline-scroll')).toBeTruthy();
  });

  it('renders ConceptCard when mode is concept (ESTD-01)', () => {
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('MARCAR COMO LIDO')).toBeTruthy();
    expect(getByText('MOSTRAR MATERIAL')).toBeTruthy();
  });

  it('does not render ProjectCard when mode is concept (ESTD-01)', () => {
    const { queryByText } = render(<DashboardScreen />);
    expect(queryByText('MARCAR COMO PRONTO')).toBeNull();
  });

  it('renders ProjectCard when mode is project (ESTD-01)', () => {
    mockUseStudyState.mode = 'project';
    mockUseStudyState.currentConcept = () => null as unknown as Concept;
    mockUseStudyState.currentProject = () => mockProject as Project;
    const { getByText } = render(<DashboardScreen />);
    expect(getByText('MARCAR COMO PRONTO')).toBeTruthy();
  });

  it('does not render ConceptCard when mode is project (ESTD-01)', () => {
    mockUseStudyState.mode = 'project';
    mockUseStudyState.currentConcept = () => null as unknown as Concept;
    mockUseStudyState.currentProject = () => mockProject as Project;
    const { queryByText } = render(<DashboardScreen />);
    expect(queryByText('MARCAR COMO LIDO')).toBeNull();
  });

  it('calls markConceptRead when MARCAR COMO LIDO is pressed (ESTD-02)', async () => {
    const { getByText } = render(<DashboardScreen />);
    await act(async () => {
      fireEvent.press(getByText('MARCAR COMO LIDO'));
    });
    expect(mockMarkConceptRead).toHaveBeenCalledWith(mockConcept.id);
  });

  it('shows Alert.alert on onNeedsConfirm (ESTD-21 to ESTD-24)', () => {
    mockUseStudyState.mode = 'project';
    mockUseStudyState.currentConcept = () => null as unknown as Concept;
    mockUseStudyState.currentProject = () => mockProject as Project;
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = render(<DashboardScreen />);
    // ProjectCard calls onNeedsConfirm when criteria unchecked
    fireEvent.press(getByText('MARCAR COMO PRONTO'));
    expect(alertSpy).toHaveBeenCalledWith(
      expect.any(String),
      expect.stringContaining('critérios'),
      expect.arrayContaining([
        expect.objectContaining({ text: 'Cancelar' }),
        expect.objectContaining({ text: 'Confirmar' }),
      ])
    );
  });

  it('calls markProjectDone with force=true on Confirm in Alert (ESTD-22)', () => {
    mockUseStudyState.mode = 'project';
    mockUseStudyState.currentConcept = () => null as unknown as Concept;
    mockUseStudyState.currentProject = () => mockProject as Project;
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = render(<DashboardScreen />);
    fireEvent.press(getByText('MARCAR COMO PRONTO'));
    // Get the confirm button handler from the Alert call
    const alertArgs = alertSpy.mock.calls[0];
    const buttons = alertArgs[2] as Array<{ text: string; onPress?: () => void }>;
    const confirmButton = buttons.find((b) => b.text === 'Confirmar');
    confirmButton?.onPress?.();
    expect(mockMarkProjectDone).toHaveBeenCalledWith(mockProject.id, true);
  });

  it('does not call markProjectDone on Cancel (ESTD-23)', () => {
    mockUseStudyState.mode = 'project';
    mockUseStudyState.currentConcept = () => null as unknown as Concept;
    mockUseStudyState.currentProject = () => mockProject as Project;
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByText } = render(<DashboardScreen />);
    fireEvent.press(getByText('MARCAR COMO PRONTO'));
    const alertArgs = alertSpy.mock.calls[0];
    const buttons = alertArgs[2] as Array<{ text: string; onPress?: () => void; style?: string }>;
    const cancelButton = buttons.find((b) => b.text === 'Cancelar');
    cancelButton?.onPress?.();
    expect(mockMarkProjectDone).not.toHaveBeenCalled();
  });

  it('calls setPendingChatInput and router.push on onAskClaude (ESTD-39)', () => {
    const { getByText } = render(<DashboardScreen />);
    fireEvent.press(getByText('AJUDA COM ESTE CONCEITO'));
    expect(mockSetPendingChatInput).toHaveBeenCalledWith(
      expect.stringContaining(mockConcept.title)
    );
    expect(router.push).toHaveBeenCalledWith('/(tabs)/chat');
  });

  it('ConceptMaterial modal visible when MOSTRAR MATERIAL tapped (ESTD-55)', () => {
    const { getByText } = render(<DashboardScreen />);
    fireEvent.press(getByText('MOSTRAR MATERIAL'));
    expect(getByText('Por que importa')).toBeTruthy();
    expect(getByText('O que aprender')).toBeTruthy();
  });
});
