import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QuickActions } from '../QuickActions';
import type { Concept, Project } from '../../../types';

const mockConcept: Concept = {
  id: 'concept-1',
  title: 'RAG — Recall Semântico',
  whyItMatters: 'Porque é importante.',
  whatToLearn: 'RAG.',
  howToLearn: 'Pratique.',
  resources: [],
  pitfalls: [],
  readingTimeMinutes: 20,
};

const mockProject: Project = {
  id: 'project-1',
  title: 'Chatbot com RAG',
  description: 'Build a RAG chatbot.',
  steps: [
    { title: 'Configurar banco vetorial', description: 'Setup vector store' },
    { title: 'Implementar pipeline', description: 'Build pipeline' },
    { title: 'Testar recuperação', description: 'Test retrieval' },
  ],
  readinessCriteria: ['Recupera documentos com >80% de acurácia'],
};

describe('QuickActions', () => {
  it('renders null when visible=false (ESTD-40)', () => {
    const { queryByTestId } = render(
      <QuickActions
        currentConcept={mockConcept}
        currentProject={mockProject}
        stepStates={{}}
        onAction={jest.fn()}
        visible={false}
      />
    );
    expect(queryByTestId('quick-actions')).toBeNull();
  });

  it('renders three buttons when visible=true', () => {
    const { getByText } = render(
      <QuickActions
        currentConcept={mockConcept}
        currentProject={mockProject}
        stepStates={{}}
        onAction={jest.fn()}
        visible={true}
      />
    );
    expect(getByText('Explique este conceito')).toBeTruthy();
    expect(getByText('Ajude no projeto')).toBeTruthy();
    expect(getByText('Próximos passos')).toBeTruthy();
  });

  it('"Explique este conceito" calls onAction with concept title (ESTD-36)', () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <QuickActions
        currentConcept={mockConcept}
        currentProject={mockProject}
        stepStates={{}}
        onAction={onAction}
        visible={true}
      />
    );
    fireEvent.press(getByText('Explique este conceito'));
    expect(onAction).toHaveBeenCalledWith(
      expect.stringContaining('RAG — Recall Semântico')
    );
  });

  it('"Ajude no projeto" calls onAction with project title and first uncompleted step (ESTD-37)', () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <QuickActions
        currentConcept={mockConcept}
        currentProject={mockProject}
        stepStates={{ 0: true }} // step 0 completed, step 1 is first uncompleted
        onAction={onAction}
        visible={true}
      />
    );
    fireEvent.press(getByText('Ajude no projeto'));
    expect(onAction).toHaveBeenCalledWith(
      expect.stringContaining('Chatbot com RAG')
    );
    expect(onAction).toHaveBeenCalledWith(
      expect.stringContaining('Implementar pipeline')
    );
  });

  it('"Ajude no projeto" uses first uncompleted step when no steps done (ESTD-37)', () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <QuickActions
        currentConcept={mockConcept}
        currentProject={mockProject}
        stepStates={{}} // none completed
        onAction={onAction}
        visible={true}
      />
    );
    fireEvent.press(getByText('Ajude no projeto'));
    expect(onAction).toHaveBeenCalledWith(
      expect.stringContaining('Configurar banco vetorial')
    );
  });

  it('"Próximos passos" calls onAction with static next-steps text (ESTD-38)', () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <QuickActions
        currentConcept={mockConcept}
        currentProject={mockProject}
        stepStates={{}}
        onAction={onAction}
        visible={true}
      />
    );
    fireEvent.press(getByText('Próximos passos'));
    expect(onAction).toHaveBeenCalledWith(
      expect.stringContaining('próximos passos')
    );
  });

  it('renders component with testID when visible=true', () => {
    const { getByTestId } = render(
      <QuickActions
        currentConcept={mockConcept}
        currentProject={mockProject}
        stepStates={{}}
        onAction={jest.fn()}
        visible={true}
      />
    );
    expect(getByTestId('quick-actions')).toBeTruthy();
  });

  it('"Explique este conceito" prefill starts with correct prefix (ESTD-36)', () => {
    const onAction = jest.fn();
    const { getByText } = render(
      <QuickActions
        currentConcept={mockConcept}
        currentProject={mockProject}
        stepStates={{}}
        onAction={onAction}
        visible={true}
      />
    );
    fireEvent.press(getByText('Explique este conceito'));
    expect(onAction).toHaveBeenCalledWith(
      expect.stringContaining('Me explique o conceito atual:')
    );
  });
});
