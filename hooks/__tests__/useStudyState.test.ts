import { act, renderHook } from '@testing-library/react-native';
import { MMKV } from 'react-native-mmkv';
import { useStudyState } from '../useStudyState';
import { CURRICULUM } from '../../data/curriculum';
import { MMKV_KEY } from '../../utils/storage';

// Reset the Zustand store before each test
beforeEach(() => {
  // Reset to initial state by getting store and replacing state
  act(() => {
    useStudyState.setState({
      currentPhaseId: CURRICULUM[0].id,
      currentConceptIndex: 0,
      currentProjectIndex: 0,
      mode: 'concept',
      startDate: Date.now(),
      completedConcepts: [],
      completedProjects: [],
      projectStepStates: {},
      projectCriteriaStates: {},
      pendingChatInput: '',
    });
  });
});

// Helper to get store state without hook (for actions that don't need rendering)
function getState() {
  return useStudyState.getState();
}

describe('useStudyState — initial state (ESTD-49)', () => {
  it('initializes with phase-1 as current phase', () => {
    const state = getState();
    expect(state.currentPhaseId).toBe(CURRICULUM[0].id);
  });

  it('initializes with concept index 0', () => {
    const state = getState();
    expect(state.currentConceptIndex).toBe(0);
  });

  it('initializes with project index 0', () => {
    const state = getState();
    expect(state.currentProjectIndex).toBe(0);
  });

  it('initializes in concept mode', () => {
    const state = getState();
    expect(state.mode).toBe('concept');
  });

  it('initializes with empty completedConcepts', () => {
    const state = getState();
    expect(state.completedConcepts).toEqual([]);
  });

  it('initializes with empty completedProjects', () => {
    const state = getState();
    expect(state.completedProjects).toEqual([]);
  });

  it('initializes with empty pendingChatInput', () => {
    const state = getState();
    expect(state.pendingChatInput).toBe('');
  });
});

describe('currentWeek() (ESTD-01)', () => {
  it('returns 1 when startDate is now', () => {
    act(() => {
      useStudyState.setState({ startDate: Date.now() });
    });
    const week = getState().currentWeek();
    expect(week).toBe(1);
  });

  it('caps at 14 after 14+ weeks', () => {
    const fifteenWeeksAgo = Date.now() - 15 * 7 * 24 * 3600 * 1000;
    act(() => {
      useStudyState.setState({ startDate: fifteenWeeksAgo });
    });
    const week = getState().currentWeek();
    expect(week).toBe(14);
  });

  it('returns week 2 after 8 days', () => {
    const eightDaysAgo = Date.now() - 8 * 24 * 3600 * 1000;
    act(() => {
      useStudyState.setState({ startDate: eightDaysAgo });
    });
    const week = getState().currentWeek();
    expect(week).toBe(2);
  });

  it('returns minimum of 1 for fresh install', () => {
    act(() => {
      useStudyState.setState({ startDate: Date.now() });
    });
    expect(getState().currentWeek()).toBeGreaterThanOrEqual(1);
  });
});

describe('markConceptRead() (ESTD-11, ESTD-12)', () => {
  it('advances currentConceptIndex when more concepts remain (ESTD-11)', () => {
    const phase1 = CURRICULUM[0];
    expect(phase1.concepts.length).toBeGreaterThan(1);

    act(() => {
      useStudyState.setState({ currentConceptIndex: 0 });
    });

    act(() => {
      getState().markConceptRead(phase1.concepts[0].id);
    });

    expect(getState().currentConceptIndex).toBe(1);
    expect(getState().mode).toBe('concept');
  });

  it('adds concept ID to completedConcepts', () => {
    const phase1 = CURRICULUM[0];
    act(() => {
      getState().markConceptRead(phase1.concepts[0].id);
    });
    expect(getState().completedConcepts).toContain(phase1.concepts[0].id);
  });

  it('sets mode to project when last concept read (ESTD-12)', () => {
    const phase1 = CURRICULUM[0];
    const lastConceptIndex = phase1.concepts.length - 1;

    act(() => {
      useStudyState.setState({ currentConceptIndex: lastConceptIndex });
    });

    act(() => {
      getState().markConceptRead(phase1.concepts[lastConceptIndex].id);
    });

    expect(getState().mode).toBe('project');
    expect(getState().currentProjectIndex).toBe(0);
  });

  it('does not duplicate concept ID in completedConcepts when marked twice', () => {
    const phase1 = CURRICULUM[0];
    act(() => {
      getState().markConceptRead(phase1.concepts[0].id);
    });
    act(() => {
      useStudyState.setState({ currentConceptIndex: 0 });
    });
    act(() => {
      getState().markConceptRead(phase1.concepts[0].id);
    });
    const count = getState().completedConcepts.filter(
      (id) => id === phase1.concepts[0].id
    ).length;
    expect(count).toBe(1);
  });
});

describe('markProjectDone() (ESTD-20, ESTD-21)', () => {
  beforeEach(() => {
    act(() => {
      useStudyState.setState({ mode: 'project', currentProjectIndex: 0 });
    });
  });

  it('returns without advancing when criteria unchecked and force=false (ESTD-21)', () => {
    const phase1 = CURRICULUM[0];
    const project = phase1.projects[0];

    act(() => {
      useStudyState.setState({
        projectCriteriaStates: {}, // no criteria checked
      });
    });

    const stateBefore = getState().currentProjectIndex;
    act(() => {
      getState().markProjectDone(project.id); // no force
    });

    expect(getState().currentProjectIndex).toBe(stateBefore);
    expect(getState().completedProjects).not.toContain(project.id);
  });

  it('advances to next project within Phase 1 when first project done with force (ESTD-20)', () => {
    const phase1 = CURRICULUM[0];
    expect(phase1.projects.length).toBe(2); // Phase 1 has 2 projects

    act(() => {
      useStudyState.setState({ currentProjectIndex: 0, currentPhaseId: 'phase-1' });
    });

    act(() => {
      getState().markProjectDone(phase1.projects[0].id, true);
    });

    expect(getState().currentProjectIndex).toBe(1);
    expect(getState().currentPhaseId).toBe('phase-1'); // still in phase-1
  });

  it('advances to next phase after completing last project of a phase', () => {
    const phase1 = CURRICULUM[0];
    const lastProjectIndex = phase1.projects.length - 1;

    act(() => {
      useStudyState.setState({
        currentPhaseId: 'phase-1',
        currentProjectIndex: lastProjectIndex,
        mode: 'project',
      });
    });

    act(() => {
      getState().markProjectDone(phase1.projects[lastProjectIndex].id, true);
    });

    expect(getState().currentPhaseId).toBe(CURRICULUM[1].id);
    expect(getState().mode).toBe('concept');
    expect(getState().currentConceptIndex).toBe(0);
  });

  it('advances with force=true even when criteria unchecked', () => {
    const phase1 = CURRICULUM[0];
    act(() => {
      useStudyState.setState({ projectCriteriaStates: {} });
    });
    act(() => {
      getState().markProjectDone(phase1.projects[0].id, true);
    });
    expect(getState().completedProjects).toContain(phase1.projects[0].id);
  });

  it('advances normally when all criteria checked (no force needed)', () => {
    const phase1 = CURRICULUM[0];
    const project = phase1.projects[0];
    const criteriaStates: Record<number, boolean> = {};
    project.readinessCriteria.forEach((_, idx) => {
      criteriaStates[idx] = true;
    });

    act(() => {
      useStudyState.setState({
        projectCriteriaStates: { [project.id]: criteriaStates },
      });
    });

    act(() => {
      getState().markProjectDone(project.id);
    });

    expect(getState().completedProjects).toContain(project.id);
  });
});

describe('updateStepState and updateCriteriaState', () => {
  it('stores step state correctly', () => {
    act(() => {
      getState().updateStepState('phase-1-project-1', 0, true);
    });
    expect(getState().projectStepStates['phase-1-project-1'][0]).toBe(true);
  });

  it('stores criteria state correctly', () => {
    act(() => {
      getState().updateCriteriaState('phase-1-project-1', 2, true);
    });
    expect(getState().projectCriteriaStates['phase-1-project-1'][2]).toBe(true);
  });

  it('updates existing step state without affecting others', () => {
    act(() => {
      getState().updateStepState('phase-1-project-1', 0, true);
      getState().updateStepState('phase-1-project-1', 1, true);
    });
    act(() => {
      getState().updateStepState('phase-1-project-1', 0, false);
    });
    expect(getState().projectStepStates['phase-1-project-1'][0]).toBe(false);
    expect(getState().projectStepStates['phase-1-project-1'][1]).toBe(true);
  });
});

describe('pendingChatInput', () => {
  it('setPendingChatInput sets the value', () => {
    act(() => {
      getState().setPendingChatInput('hello world');
    });
    expect(getState().pendingChatInput).toBe('hello world');
  });

  it('clearPendingChatInput clears to empty string', () => {
    act(() => {
      getState().setPendingChatInput('some text');
    });
    act(() => {
      getState().clearPendingChatInput();
    });
    expect(getState().pendingChatInput).toBe('');
  });
});

describe('computed selectors', () => {
  it('currentPhase returns CURRICULUM[0] by default', () => {
    const phase = getState().currentPhase();
    expect(phase.id).toBe(CURRICULUM[0].id);
  });

  it('currentConcept returns first concept in concept mode', () => {
    act(() => {
      useStudyState.setState({ mode: 'concept', currentConceptIndex: 0 });
    });
    const concept = getState().currentConcept();
    expect(concept?.id).toBe(CURRICULUM[0].concepts[0].id);
  });

  it('currentConcept returns null in project mode', () => {
    act(() => {
      useStudyState.setState({ mode: 'project' });
    });
    const concept = getState().currentConcept();
    expect(concept).toBeNull();
  });

  it('currentProject returns first project', () => {
    act(() => {
      useStudyState.setState({ currentProjectIndex: 0 });
    });
    const project = getState().currentProject();
    expect(project?.id).toBe(CURRICULUM[0].projects[0].id);
  });
});

describe('curriculum structure validation', () => {
  it('Phase 1 name is "Ferramentas e Memória" (ESTD-01)', () => {
    expect(CURRICULUM[0].name).toBe('Ferramentas e Memória');
  });

  it('Phase 1 has exactly 2 projects (ESTD-20)', () => {
    expect(CURRICULUM[0].projects.length).toBe(2);
  });

  it('CURRICULUM has exactly 7 phases', () => {
    expect(CURRICULUM.length).toBe(7);
  });

  it('Total projects across all phases is 9', () => {
    const total = CURRICULUM.reduce((sum, phase) => sum + phase.projects.length, 0);
    expect(total).toBe(9);
  });
});

describe('Hydration from MMKV persist (ESTD-47)', () => {
  beforeEach(() => {
    // Clear shared MMKV mock storage so each test starts clean
    const mmkv = new MMKV();
    mmkv.clearAll();
  });

  it('restores all 8 persisted state fields from MMKV on rehydrate (ESTD-47)', async () => {
    const mmkv = new MMKV();
    const savedState = {
      currentPhaseId: CURRICULUM[1].id,
      currentConceptIndex: 0,
      currentProjectIndex: 0,
      mode: 'concept' as const,
      startDate: 1000000,
      completedConcepts: ['concept-1-1'],
      completedProjects: ['project-1-1'],
      projectStepStates: { 'project-1-1': { 0: true } },
      projectCriteriaStates: { 'project-1-1': { 0: true } },
    };
    // Zustand createJSONStorage wraps state as { state: {...}, version: 0 }
    mmkv.set(MMKV_KEY, JSON.stringify({ state: savedState, version: 0 }));

    await act(async () => {
      await (useStudyState as any).persist.rehydrate();
    });

    const state = getState();
    expect(state.currentPhaseId).toBe(CURRICULUM[1].id);
    expect(state.currentConceptIndex).toBe(0);
    expect(state.currentProjectIndex).toBe(0);
    expect(state.mode).toBe('concept');
    expect(state.startDate).toBe(1000000);
    expect(state.completedConcepts).toEqual(['concept-1-1']);
    expect(state.completedProjects).toEqual(['project-1-1']);
    expect(state.projectStepStates).toEqual({ 'project-1-1': { 0: true } });
    expect(state.projectCriteriaStates).toEqual({ 'project-1-1': { 0: true } });
  });

  it('resets out-of-bounds currentConceptIndex to 0 with console.warn on rehydrate (ESTD-50)', async () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const mmkv = new MMKV();
    const phase0 = CURRICULUM[0];
    const badState = {
      currentPhaseId: phase0.id,
      currentConceptIndex: phase0.concepts.length + 5,
      currentProjectIndex: 0,
      mode: 'concept' as const,
      startDate: Date.now(),
      completedConcepts: [],
      completedProjects: [],
      projectStepStates: {},
      projectCriteriaStates: {},
    };
    mmkv.set(MMKV_KEY, JSON.stringify({ state: badState, version: 0 }));

    await act(async () => {
      await (useStudyState as any).persist.rehydrate();
    });

    const state = getState();
    expect(state.currentConceptIndex).toBe(0);
    expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('out of bounds'));
    warnSpy.mockRestore();
  });
});
