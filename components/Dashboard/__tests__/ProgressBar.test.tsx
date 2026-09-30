import React from 'react';
import { render } from '@testing-library/react-native';
import { ProgressBar } from '../ProgressBar';

describe('ProgressBar', () => {
  it('renders phase progress label as X/Y — ZZ% (ESTD-03)', () => {
    const { getByText } = render(
      <ProgressBar
        completedConcepts={2}
        totalConcepts={5}
        completedProjects={1}
        totalProjects={9}
      />
    );
    // 2/5 = 40%
    expect(getByText('2/5 — 40%')).toBeTruthy();
  });

  it('renders overall progress label as X/9 projetos (ESTD-04)', () => {
    const { getByText } = render(
      <ProgressBar
        completedConcepts={0}
        totalConcepts={3}
        completedProjects={3}
        totalProjects={9}
      />
    );
    expect(getByText('3/9 projetos')).toBeTruthy();
  });

  it('renders 0 phase progress without crashing', () => {
    const { getByTestId } = render(
      <ProgressBar
        completedConcepts={0}
        totalConcepts={0}
        completedProjects={0}
        totalProjects={9}
      />
    );
    expect(getByTestId('phase-progress-label')).toBeTruthy();
  });

  it('renders 100% phase progress correctly', () => {
    const { getByText } = render(
      <ProgressBar
        completedConcepts={3}
        totalConcepts={3}
        completedProjects={0}
        totalProjects={9}
      />
    );
    expect(getByText('3/3 — 100%')).toBeTruthy();
  });

  it('renders both progress fill bars', () => {
    const { getByTestId } = render(
      <ProgressBar
        completedConcepts={1}
        totalConcepts={4}
        completedProjects={2}
        totalProjects={9}
      />
    );
    expect(getByTestId('phase-progress-fill')).toBeTruthy();
    expect(getByTestId('overall-progress-fill')).toBeTruthy();
  });
});
