import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { MMKV } from 'react-native-mmkv';
import { StudyState, StudyStateActions, Phase, Concept, Project } from '../types';
import { CURRICULUM } from '../data/curriculum';
import { MMKV_KEY } from '../utils/storage';

const mmkvStorage = new MMKV();

// Zustand storage adapter for MMKV
const zustandMmkvStorage = {
  getItem: (name: string): string | null => {
    return mmkvStorage.getString(name) ?? null;
  },
  setItem: (name: string, value: string): void => {
    mmkvStorage.set(name, value);
  },
  removeItem: (name: string): void => {
    mmkvStorage.delete(name);
  },
};

type StoreState = StudyState & StudyStateActions;

const getDefaultState = (): StudyState => ({
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

export const useStudyState = create<StoreState>()(
  persist(
    (set, get) => ({
      ...getDefaultState(),

      markConceptRead: (conceptId: string) => {
        const state = get();
        const phase = CURRICULUM.find((p) => p.id === state.currentPhaseId);
        if (!phase) return;

        const newCompleted = state.completedConcepts.includes(conceptId)
          ? state.completedConcepts
          : [...state.completedConcepts, conceptId];

        const isLastConcept = state.currentConceptIndex >= phase.concepts.length - 1;

        if (isLastConcept) {
          // Transition to project mode
          set({
            completedConcepts: newCompleted,
            mode: 'project',
            currentProjectIndex: 0,
          });
        } else {
          set({
            completedConcepts: newCompleted,
            currentConceptIndex: state.currentConceptIndex + 1,
          });
        }
      },

      markProjectDone: (projectId: string, force?: boolean) => {
        const state = get();
        const phase = CURRICULUM.find((p) => p.id === state.currentPhaseId);
        if (!phase) return;

        // Check if all criteria are checked
        const criteriaStates = state.projectCriteriaStates[projectId] ?? {};
        const project = phase.projects[state.currentProjectIndex];
        if (!project) return;

        const allCriteriaChecked =
          project.readinessCriteria.length === 0 ||
          project.readinessCriteria.every(
            (_, idx) => criteriaStates[idx] === true
          );

        if (!allCriteriaChecked && !force) {
          // Caller must show confirm dialog; we return without advancing
          return;
        }

        const newCompleted = state.completedProjects.includes(projectId)
          ? state.completedProjects
          : [...state.completedProjects, projectId];

        // Phase 1 special case: might have more projects
        const hasMoreProjects = state.currentProjectIndex < phase.projects.length - 1;

        if (hasMoreProjects) {
          // Advance to next project within same phase
          set({
            completedProjects: newCompleted,
            currentProjectIndex: state.currentProjectIndex + 1,
          });
        } else {
          // Advance to next phase
          const currentPhaseIndex = CURRICULUM.findIndex((p) => p.id === state.currentPhaseId);
          const nextPhase = CURRICULUM[currentPhaseIndex + 1];

          if (nextPhase) {
            set({
              completedProjects: newCompleted,
              currentPhaseId: nextPhase.id,
              currentConceptIndex: 0,
              currentProjectIndex: 0,
              mode: 'concept',
            });
          } else {
            // All phases complete
            set({ completedProjects: newCompleted });
          }
        }
      },

      updateStepState: (projectId: string, stepIndex: number, checked: boolean) => {
        const state = get();
        const existing = state.projectStepStates[projectId] ?? {};
        set({
          projectStepStates: {
            ...state.projectStepStates,
            [projectId]: { ...existing, [stepIndex]: checked },
          },
        });
      },

      updateCriteriaState: (projectId: string, criteriaIndex: number, checked: boolean) => {
        const state = get();
        const existing = state.projectCriteriaStates[projectId] ?? {};
        set({
          projectCriteriaStates: {
            ...state.projectCriteriaStates,
            [projectId]: { ...existing, [criteriaIndex]: checked },
          },
        });
      },

      setPendingChatInput: (text: string) => {
        set({ pendingChatInput: text });
      },

      clearPendingChatInput: () => {
        set({ pendingChatInput: '' });
      },

      currentWeek: () => {
        const { startDate } = get();
        const msPerWeek = 7 * 24 * 3600 * 1000;
        const weeks = Math.ceil((Date.now() - startDate) / msPerWeek);
        return Math.min(14, Math.max(1, weeks));
      },

      currentPhase: (): Phase => {
        const { currentPhaseId } = get();
        return CURRICULUM.find((p) => p.id === currentPhaseId) ?? CURRICULUM[0];
      },

      currentConcept: (): Concept | null => {
        const state = get();
        if (state.mode !== 'concept') return null;
        const phase = get().currentPhase();
        return phase.concepts[state.currentConceptIndex] ?? null;
      },

      currentProject: (): Project | null => {
        const state = get();
        const phase = get().currentPhase();
        return phase.projects[state.currentProjectIndex] ?? null;
      },
    }),
    {
      name: MMKV_KEY,
      storage: createJSONStorage(() => zustandMmkvStorage),
      partialize: (state) => {
        // Exclude pendingChatInput from MMKV persistence
        const { pendingChatInput: _excluded, ...persisted } = state;
        return persisted as StoreState;
      },
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        // Validate currentConceptIndex is in bounds
        const phase = CURRICULUM.find((p) => p.id === state.currentPhaseId);
        if (phase && state.currentConceptIndex >= phase.concepts.length) {
          console.warn(
            `[useStudyState] currentConceptIndex (${state.currentConceptIndex}) out of bounds for phase ${state.currentPhaseId}. Resetting to 0.`
          );
          state.currentConceptIndex = 0;
        }
      },
    }
  )
);
