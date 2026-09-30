import { buildPrompt } from '../systemPrompt';
import { StudyState } from '../../types';
import { CURRICULUM } from '../../data/curriculum';

function makeState(overrides: Partial<StudyState> = {}): StudyState {
  return {
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
    ...overrides,
  };
}

describe('buildPrompt (ESTD-25)', () => {
  it('returns a non-empty string', () => {
    const prompt = buildPrompt(makeState());
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('includes current week number', () => {
    const oneWeekAgo = Date.now() - 8 * 24 * 3600 * 1000;
    const prompt = buildPrompt(makeState({ startDate: oneWeekAgo }));
    expect(prompt).toMatch(/Semana \d+ de 14/);
  });

  it('includes current phase name', () => {
    const prompt = buildPrompt(makeState());
    expect(prompt).toContain(CURRICULUM[0].name);
  });

  it('includes current phase objective', () => {
    const prompt = buildPrompt(makeState());
    expect(prompt).toContain(CURRICULUM[0].objective);
  });

  it('includes concept title in concept mode', () => {
    const state = makeState({ mode: 'concept', currentConceptIndex: 0 });
    const prompt = buildPrompt(state);
    expect(prompt).toContain(CURRICULUM[0].concepts[0].title);
  });

  it('includes concept whyItMatters in concept mode', () => {
    const state = makeState({ mode: 'concept', currentConceptIndex: 0 });
    const prompt = buildPrompt(state);
    expect(prompt).toContain(CURRICULUM[0].concepts[0].whyItMatters);
  });

  it('includes concept whatToLearn in concept mode', () => {
    const state = makeState({ mode: 'concept', currentConceptIndex: 0 });
    const prompt = buildPrompt(state);
    expect(prompt).toContain(CURRICULUM[0].concepts[0].whatToLearn);
  });

  it('includes concept howToLearn in concept mode', () => {
    const state = makeState({ mode: 'concept', currentConceptIndex: 0 });
    const prompt = buildPrompt(state);
    expect(prompt).toContain(CURRICULUM[0].concepts[0].howToLearn);
  });

  it('includes concept resources in concept mode', () => {
    const state = makeState({ mode: 'concept', currentConceptIndex: 0 });
    const prompt = buildPrompt(state);
    CURRICULUM[0].concepts[0].resources.forEach((resource) => {
      expect(prompt).toContain(resource);
    });
  });

  it('includes project title', () => {
    const state = makeState({ currentProjectIndex: 0 });
    const prompt = buildPrompt(state);
    expect(prompt).toContain(CURRICULUM[0].projects[0].title);
  });

  it('includes project steps', () => {
    const state = makeState({ currentProjectIndex: 0 });
    const prompt = buildPrompt(state);
    CURRICULUM[0].projects[0].steps.forEach((step) => {
      expect(prompt).toContain(step.title);
    });
  });

  it('includes project readiness criteria', () => {
    const state = makeState({ currentProjectIndex: 0 });
    const prompt = buildPrompt(state);
    CURRICULUM[0].projects[0].readinessCriteria.forEach((criterion) => {
      expect(prompt).toContain(criterion);
    });
  });

  it('works in project mode (mode="project")', () => {
    const state = makeState({ mode: 'project', currentProjectIndex: 0 });
    const prompt = buildPrompt(state);
    expect(prompt).toContain(CURRICULUM[0].projects[0].title);
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(0);
  });

  it('works in concept mode (mode="concept")', () => {
    const state = makeState({ mode: 'concept', currentConceptIndex: 0 });
    const prompt = buildPrompt(state);
    expect(prompt).toContain(CURRICULUM[0].concepts[0].title);
    expect(typeof prompt).toBe('string');
  });

  it('includes week 14 when startDate is far in the past', () => {
    const farPast = Date.now() - 20 * 7 * 24 * 3600 * 1000;
    const prompt = buildPrompt(makeState({ startDate: farPast }));
    expect(prompt).toContain('Semana 14 de 14');
  });
});
