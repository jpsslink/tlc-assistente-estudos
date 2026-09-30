import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { Timeline } from '../Timeline';
import { Phase } from '../../../types';

const mockPhases: Phase[] = [
  {
    id: 'phase-1',
    name: 'Fase 1 — Ferramentas',
    objective: 'Objetivo 1',
    weekRange: [1, 2],
    color: '#0066cc',
    concepts: [],
    projects: [
      { id: 'p1', title: 'Projeto A', description: 'Desc', steps: [], readinessCriteria: [] },
    ],
  },
  {
    id: 'phase-2',
    name: 'Fase 2 — Agentes',
    objective: 'Objetivo 2',
    weekRange: [3, 4],
    color: '#34a853',
    concepts: [],
    projects: [
      { id: 'p2', title: 'Projeto B', description: 'Desc', steps: [], readinessCriteria: [] },
    ],
  },
  {
    id: 'phase-3',
    name: 'Fase 3 — RAG',
    objective: 'Objetivo 3',
    weekRange: [5, 6],
    color: '#fbbc04',
    concepts: [],
    projects: [],
  },
  {
    id: 'phase-4',
    name: 'Fase 4',
    objective: 'Objetivo 4',
    weekRange: [7, 8],
    color: '#ea4335',
    concepts: [],
    projects: [],
  },
  {
    id: 'phase-5',
    name: 'Fase 5',
    objective: 'Objetivo 5',
    weekRange: [9, 10],
    color: '#9334e6',
    concepts: [],
    projects: [],
  },
  {
    id: 'phase-6',
    name: 'Fase 6',
    objective: 'Objetivo 6',
    weekRange: [11, 12],
    color: '#24c1e0',
    concepts: [],
    projects: [],
  },
  {
    id: 'phase-7',
    name: 'Fase 7',
    objective: 'Objetivo 7',
    weekRange: [13, 14],
    color: '#ff6d00',
    concepts: [],
    projects: [],
  },
];

describe('Timeline', () => {
  it('renders 14 week slots in a ScrollView (ESTD-57)', () => {
    const { getByTestId } = render(
      <Timeline currentWeek={1} completedPhaseIds={[]} phases={mockPhases} />
    );
    expect(getByTestId('timeline-scroll')).toBeTruthy();
    for (let w = 1; w <= 14; w++) {
      expect(getByTestId(`week-slot-${w}`)).toBeTruthy();
    }
  });

  it('current week slot has distinct style (ESTD-58)', () => {
    const { getByTestId } = render(
      <Timeline currentWeek={3} completedPhaseIds={[]} phases={mockPhases} />
    );
    const currentSlot = getByTestId('week-slot-3');
    // Check border style is applied
    const styles = currentSlot.props.style;
    const flatStyles = Array.isArray(styles) ? Object.assign({}, ...styles) : styles;
    expect(flatStyles.borderWidth).toBe(2);
  });

  it('completed phase slots have 50% opacity style (ESTD-59)', () => {
    const { getByTestId } = render(
      <Timeline currentWeek={3} completedPhaseIds={['phase-1']} phases={mockPhases} />
    );
    // Week 1 and 2 belong to phase-1 which is completed
    const slot1 = getByTestId('week-slot-1');
    const slot2 = getByTestId('week-slot-2');
    const styles1 = Array.isArray(slot1.props.style)
      ? Object.assign({}, ...slot1.props.style)
      : slot1.props.style;
    const styles2 = Array.isArray(slot2.props.style)
      ? Object.assign({}, ...slot2.props.style)
      : slot2.props.style;
    expect(styles1.opacity).toBe(0.5);
    expect(styles2.opacity).toBe(0.5);
  });

  it('non-completed slots do not have 0.5 opacity', () => {
    const { getByTestId } = render(
      <Timeline currentWeek={1} completedPhaseIds={[]} phases={mockPhases} />
    );
    const slot1 = getByTestId('week-slot-1');
    const slotStyles = Array.isArray(slot1.props.style)
      ? Object.assign({}, ...slot1.props.style)
      : slot1.props.style;
    expect(slotStyles.opacity).not.toBe(0.5);
  });

  it('long press on a slot shows Alert with phase name (ESTD-60)', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByTestId } = render(
      <Timeline currentWeek={1} completedPhaseIds={[]} phases={mockPhases} />
    );
    fireEvent(getByTestId('week-slot-1'), 'longPress');
    expect(alertSpy).toHaveBeenCalledWith(
      'Fase 1 — Ferramentas',
      expect.any(String)
    );
    alertSpy.mockRestore();
  });

  it('long press shows project titles in alert (ESTD-60)', () => {
    const alertSpy = jest.spyOn(Alert, 'alert');
    const { getByTestId } = render(
      <Timeline currentWeek={1} completedPhaseIds={[]} phases={mockPhases} />
    );
    fireEvent(getByTestId('week-slot-2'), 'longPress');
    const alertMessage = alertSpy.mock.calls[0][1];
    expect(alertMessage).toContain('Projeto A');
    alertSpy.mockRestore();
  });

  it('each slot uses phase color as backgroundColor', () => {
    const { getByTestId } = render(
      <Timeline currentWeek={1} completedPhaseIds={[]} phases={mockPhases} />
    );
    const slot1 = getByTestId('week-slot-1');
    const styles1 = Array.isArray(slot1.props.style)
      ? Object.assign({}, ...slot1.props.style)
      : slot1.props.style;
    expect(styles1.backgroundColor).toBe('#0066cc');

    const slot3 = getByTestId('week-slot-3');
    const styles3 = Array.isArray(slot3.props.style)
      ? Object.assign({}, ...slot3.props.style)
      : slot3.props.style;
    expect(styles3.backgroundColor).toBe('#34a853');
  });
});
