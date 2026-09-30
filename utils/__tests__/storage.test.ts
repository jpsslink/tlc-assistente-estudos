import { MMKV } from 'react-native-mmkv';
import { readStudyState, MMKV_KEY } from '../storage';

beforeEach(() => {
  // Clear the shared MMKV mock storage before each test
  const mmkv = new MMKV();
  mmkv.clearAll();
});

describe('readStudyState — ESTD-50', () => {
  it('returns null when MMKV key is absent', () => {
    const result = readStudyState();
    expect(result).toBeNull();
  });

  it('returns null and calls console.warn on invalid JSON (ESTD-50)', () => {
    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const mmkv = new MMKV();
    mmkv.set(MMKV_KEY, '{not valid json');

    const result = readStudyState();

    expect(result).toBeNull();
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to parse study state')
    );
    warnSpy.mockRestore();
  });

  it('returns parsed state when MMKV contains valid JSON', () => {
    const mmkv = new MMKV();
    const validState = {
      currentPhaseId: 'phase-1',
      currentConceptIndex: 1,
      currentProjectIndex: 0,
      mode: 'concept',
      startDate: 1000000,
      completedConcepts: ['c1'],
      completedProjects: [],
      projectStepStates: {},
      projectCriteriaStates: {},
      pendingChatInput: '',
    };
    mmkv.set(MMKV_KEY, JSON.stringify(validState));

    const result = readStudyState();

    expect(result).not.toBeNull();
    expect(result?.currentPhaseId).toBe('phase-1');
    expect(result?.currentConceptIndex).toBe(1);
    expect(result?.completedConcepts).toEqual(['c1']);
  });
});
