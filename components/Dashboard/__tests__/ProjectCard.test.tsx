import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ProjectCard } from '../ProjectCard';
import { Project } from '../../../types';

const mockProject: Project = {
  id: 'project-1',
  title: 'Chatbot com Memória',
  description: 'Construa um chatbot com histórico de conversação.',
  steps: [
    { title: 'Configurar ambiente', description: 'Setup the environment' },
    { title: 'Implementar API', description: 'Connect to the API' },
    { title: 'Adicionar memória', description: 'Add memory system' },
  ],
  readinessCriteria: [
    'O chatbot mantém contexto por 10 turnos',
    'Funciona sem erros em 5 testes consecutivos',
  ],
};

describe('ProjectCard', () => {
  it('renders all project steps via ChecklistItem (ESTD-15)', () => {
    const { getByText } = render(
      <ProjectCard
        project={mockProject}
        projectId="project-1"
        stepStates={{}}
        criteriaStates={{}}
        onStepToggle={jest.fn()}
        onCriteriaToggle={jest.fn()}
        onMarkDone={jest.fn()}
        onNeedsConfirm={jest.fn()}
      />
    );
    expect(getByText('Configurar ambiente')).toBeTruthy();
    expect(getByText('Implementar API')).toBeTruthy();
    expect(getByText('Adicionar memória')).toBeTruthy();
  });

  it('renders all readiness criteria via ChecklistItem (ESTD-15)', () => {
    const { getByText } = render(
      <ProjectCard
        project={mockProject}
        projectId="project-1"
        stepStates={{}}
        criteriaStates={{}}
        onStepToggle={jest.fn()}
        onCriteriaToggle={jest.fn()}
        onMarkDone={jest.fn()}
        onNeedsConfirm={jest.fn()}
      />
    );
    expect(getByText('O chatbot mantém contexto por 10 turnos')).toBeTruthy();
    expect(getByText('Funciona sem erros em 5 testes consecutivos')).toBeTruthy();
  });

  it('shows "Não iniciado" when no steps are checked (ESTD-16)', () => {
    const { getByText } = render(
      <ProjectCard
        project={mockProject}
        projectId="project-1"
        stepStates={{}}
        criteriaStates={{}}
        onStepToggle={jest.fn()}
        onCriteriaToggle={jest.fn()}
        onMarkDone={jest.fn()}
        onNeedsConfirm={jest.fn()}
      />
    );
    expect(getByText('Não iniciado')).toBeTruthy();
  });

  it('shows "Em Progresso" when some steps are checked (ESTD-17)', () => {
    const { getByText } = render(
      <ProjectCard
        project={mockProject}
        projectId="project-1"
        stepStates={{ 0: true }}
        criteriaStates={{}}
        onStepToggle={jest.fn()}
        onCriteriaToggle={jest.fn()}
        onMarkDone={jest.fn()}
        onNeedsConfirm={jest.fn()}
      />
    );
    expect(getByText('Em Progresso')).toBeTruthy();
  });

  it('shows "Aguardando Revisão" when all steps are checked (ESTD-18)', () => {
    const { getByText } = render(
      <ProjectCard
        project={mockProject}
        projectId="project-1"
        stepStates={{ 0: true, 1: true, 2: true }}
        criteriaStates={{}}
        onStepToggle={jest.fn()}
        onCriteriaToggle={jest.fn()}
        onMarkDone={jest.fn()}
        onNeedsConfirm={jest.fn()}
      />
    );
    expect(getByText('Aguardando Revisão')).toBeTruthy();
  });

  it('calls onMarkDone when all criteria checked and MARCAR COMO PRONTO pressed (ESTD-20)', () => {
    const onMarkDone = jest.fn();
    const onNeedsConfirm = jest.fn();
    const { getByText } = render(
      <ProjectCard
        project={mockProject}
        projectId="project-1"
        stepStates={{ 0: true, 1: true, 2: true }}
        criteriaStates={{ 0: true, 1: true }}
        onStepToggle={jest.fn()}
        onCriteriaToggle={jest.fn()}
        onMarkDone={onMarkDone}
        onNeedsConfirm={onNeedsConfirm}
      />
    );
    fireEvent.press(getByText('MARCAR COMO PRONTO'));
    expect(onMarkDone).toHaveBeenCalledTimes(1);
    expect(onNeedsConfirm).not.toHaveBeenCalled();
  });

  it('calls onNeedsConfirm when criteria unchecked and MARCAR COMO PRONTO pressed (ESTD-21)', () => {
    const onMarkDone = jest.fn();
    const onNeedsConfirm = jest.fn();
    const { getByText } = render(
      <ProjectCard
        project={mockProject}
        projectId="project-1"
        stepStates={{ 0: true, 1: true, 2: true }}
        criteriaStates={{ 0: true }}
        onStepToggle={jest.fn()}
        onCriteriaToggle={jest.fn()}
        onMarkDone={onMarkDone}
        onNeedsConfirm={onNeedsConfirm}
      />
    );
    fireEvent.press(getByText('MARCAR COMO PRONTO'));
    expect(onNeedsConfirm).toHaveBeenCalledTimes(1);
    expect(onMarkDone).not.toHaveBeenCalled();
  });

  it('calls onStepToggle when a step checkbox is pressed', () => {
    const onStepToggle = jest.fn();
    const { getAllByRole } = render(
      <ProjectCard
        project={mockProject}
        projectId="project-1"
        stepStates={{}}
        criteriaStates={{}}
        onStepToggle={onStepToggle}
        onCriteriaToggle={jest.fn()}
        onMarkDone={jest.fn()}
        onNeedsConfirm={jest.fn()}
      />
    );
    const checkboxes = getAllByRole('checkbox');
    fireEvent.press(checkboxes[0]);
    expect(onStepToggle).toHaveBeenCalledWith(0, true);
  });

  it('calls onCriteriaToggle when a criterion checkbox is pressed', () => {
    const onCriteriaToggle = jest.fn();
    const { getAllByRole } = render(
      <ProjectCard
        project={mockProject}
        projectId="project-1"
        stepStates={{}}
        criteriaStates={{}}
        onStepToggle={jest.fn()}
        onCriteriaToggle={onCriteriaToggle}
        onMarkDone={jest.fn()}
        onNeedsConfirm={jest.fn()}
      />
    );
    // Steps are first (3 checkboxes), criteria follow (2 checkboxes)
    const checkboxes = getAllByRole('checkbox');
    fireEvent.press(checkboxes[3]); // first criterion
    expect(onCriteriaToggle).toHaveBeenCalledWith(0, true);
  });

  it('renders project title and description', () => {
    const { getByText } = render(
      <ProjectCard
        project={mockProject}
        projectId="project-1"
        stepStates={{}}
        criteriaStates={{}}
        onStepToggle={jest.fn()}
        onCriteriaToggle={jest.fn()}
        onMarkDone={jest.fn()}
        onNeedsConfirm={jest.fn()}
      />
    );
    expect(getByText('Chatbot com Memória')).toBeTruthy();
    expect(getByText('Construa um chatbot com histórico de conversação.')).toBeTruthy();
  });

  it('renders MARCAR COMO PRONTO button', () => {
    const { getByText } = render(
      <ProjectCard
        project={mockProject}
        projectId="project-1"
        stepStates={{}}
        criteriaStates={{}}
        onStepToggle={jest.fn()}
        onCriteriaToggle={jest.fn()}
        onMarkDone={jest.fn()}
        onNeedsConfirm={jest.fn()}
      />
    );
    expect(getByText('MARCAR COMO PRONTO')).toBeTruthy();
  });
});
