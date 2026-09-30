import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ConceptCard } from '../ConceptCard';
import { Concept } from '../../../types';

const mockConcept: Concept = {
  id: 'concept-1',
  title: 'Fundamentos de LLMs',
  whyItMatters: 'Porque é a base de tudo.',
  whatToLearn: 'Arquitetura Transformer, tokens.',
  howToLearn: 'Pratique com APIs.',
  resources: ['Resource 1', 'Resource 2'],
  pitfalls: ['Pitfall 1', 'Pitfall 2'],
  readingTimeMinutes: 35,
};

describe('ConceptCard', () => {
  it('renders the three action buttons', () => {
    const { getByText } = render(
      <ConceptCard
        concept={mockConcept}
        conceptIndex={1}
        totalConcepts={3}
        onMarkRead={jest.fn()}
        onAskClaude={jest.fn()}
      />
    );
    expect(getByText('MOSTRAR MATERIAL')).toBeTruthy();
    expect(getByText('MARCAR COMO LIDO')).toBeTruthy();
    expect(getByText('AJUDA COM ESTE CONCEITO')).toBeTruthy();
  });

  it('opens modal when MOSTRAR MATERIAL is pressed (ESTD-07)', () => {
    const { getByText, getByTestId } = render(
      <ConceptCard
        concept={mockConcept}
        conceptIndex={1}
        totalConcepts={3}
        onMarkRead={jest.fn()}
        onAskClaude={jest.fn()}
      />
    );
    fireEvent.press(getByText('MOSTRAR MATERIAL'));
    // Modal should be visible - check for section titles
    expect(getByText('Por que importa')).toBeTruthy();
    expect(getByText('O que aprender')).toBeTruthy();
    expect(getByText('Como aprender')).toBeTruthy();
    expect(getByText('Recursos sugeridos')).toBeTruthy();
    expect(getByText('Armadilhas comuns')).toBeTruthy();
  });

  it('shows reading time in modal (ESTD-08)', () => {
    const { getByText } = render(
      <ConceptCard
        concept={mockConcept}
        conceptIndex={1}
        totalConcepts={3}
        onMarkRead={jest.fn()}
        onAskClaude={jest.fn()}
      />
    );
    fireEvent.press(getByText('MOSTRAR MATERIAL'));
    expect(getByText(/35 min/)).toBeTruthy();
  });

  it('closes modal when close button is pressed (ESTD-09)', () => {
    const { getByText, queryByText } = render(
      <ConceptCard
        concept={mockConcept}
        conceptIndex={1}
        totalConcepts={3}
        onMarkRead={jest.fn()}
        onAskClaude={jest.fn()}
      />
    );
    fireEvent.press(getByText('MOSTRAR MATERIAL'));
    expect(getByText('Por que importa')).toBeTruthy();
    fireEvent.press(getByText('Fechar'));
    // After closing, sections should not be visible
    expect(queryByText('Por que importa')).toBeNull();
  });

  it('modal content is plain text not Markdown (ESTD-10)', () => {
    const { getByText } = render(
      <ConceptCard
        concept={mockConcept}
        conceptIndex={1}
        totalConcepts={3}
        onMarkRead={jest.fn()}
        onAskClaude={jest.fn()}
      />
    );
    fireEvent.press(getByText('MOSTRAR MATERIAL'));
    // Content should be rendered as plain text
    expect(getByText('Porque é a base de tudo.')).toBeTruthy();
  });

  it('calls onMarkRead when MARCAR COMO LIDO is pressed', () => {
    const onMarkRead = jest.fn();
    const { getByText } = render(
      <ConceptCard
        concept={mockConcept}
        conceptIndex={1}
        totalConcepts={3}
        onMarkRead={onMarkRead}
        onAskClaude={jest.fn()}
      />
    );
    fireEvent.press(getByText('MARCAR COMO LIDO'));
    expect(onMarkRead).toHaveBeenCalledTimes(1);
  });

  it('calls onAskClaude when AJUDA COM ESTE CONCEITO is pressed (ESTD-39)', () => {
    const onAskClaude = jest.fn();
    const { getByText } = render(
      <ConceptCard
        concept={mockConcept}
        conceptIndex={1}
        totalConcepts={3}
        onMarkRead={jest.fn()}
        onAskClaude={onAskClaude}
      />
    );
    fireEvent.press(getByText('AJUDA COM ESTE CONCEITO'));
    expect(onAskClaude).toHaveBeenCalledTimes(1);
  });

  it('renders concept title', () => {
    const { getByText } = render(
      <ConceptCard
        concept={mockConcept}
        conceptIndex={2}
        totalConcepts={3}
        onMarkRead={jest.fn()}
        onAskClaude={jest.fn()}
      />
    );
    expect(getByText('Fundamentos de LLMs')).toBeTruthy();
  });
});
