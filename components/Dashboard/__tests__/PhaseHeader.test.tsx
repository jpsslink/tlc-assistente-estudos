import React from 'react';
import { render } from '@testing-library/react-native';
import { PhaseHeader } from '../PhaseHeader';

describe('PhaseHeader', () => {
  it('renders concept mode header text correctly', () => {
    const { getByText } = render(
      <PhaseHeader
        weekNumber={1}
        phaseName="FASE 1 — Fundamentos"
        mode="concept"
        currentIndex={1}
        totalCount={3}
      />
    );
    expect(getByText('Semana 1/14 | FASE 1 — Fundamentos | Conceito 1 de 3')).toBeTruthy();
  });

  it('renders project mode header text correctly', () => {
    const { getByText } = render(
      <PhaseHeader
        weekNumber={2}
        phaseName="FASE 1 — Fundamentos"
        mode="project"
        currentIndex={1}
        totalCount={2}
      />
    );
    expect(getByText('Semana 2/14 | FASE 1 — Fundamentos | Projeto 1 de 2')).toBeTruthy();
  });

  it('shows "Conceito" label when mode=concept', () => {
    const { getByText } = render(
      <PhaseHeader
        weekNumber={3}
        phaseName="Phase"
        mode="concept"
        currentIndex={2}
        totalCount={4}
      />
    );
    expect(getByText(/Conceito/)).toBeTruthy();
  });

  it('shows "Projeto" label when mode=project', () => {
    const { getByText } = render(
      <PhaseHeader
        weekNumber={3}
        phaseName="Phase"
        mode="project"
        currentIndex={1}
        totalCount={2}
      />
    );
    expect(getByText(/Projeto/)).toBeTruthy();
  });

  it('includes week number and total 14 in header', () => {
    const { getByText } = render(
      <PhaseHeader
        weekNumber={7}
        phaseName="FASE 4"
        mode="concept"
        currentIndex={1}
        totalCount={2}
      />
    );
    expect(getByText(/Semana 7\/14/)).toBeTruthy();
  });

  it('independent test: Week 4 / FASE 1 / concept mode / index 2 of 3 (ESTD-01)', () => {
    const { getByText } = render(
      <PhaseHeader
        weekNumber={4}
        phaseName="FASE 1 — Ferramentas e Memória"
        mode="concept"
        currentIndex={2}
        totalCount={3}
      />
    );
    expect(
      getByText('Semana 4/14 | FASE 1 — Ferramentas e Memória | Conceito 2 de 3')
    ).toBeTruthy();
  });
});
