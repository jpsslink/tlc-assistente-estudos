// Curriculum Types (static, read-only)

export interface Concept {
  id: string;
  title: string;
  whyItMatters: string;
  whatToLearn: string;
  howToLearn: string;
  resources: string[];
  pitfalls: string[];
  readingTimeMinutes: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  steps: Array<{ title: string; description: string }>;
  readinessCriteria: string[];
}

export interface Phase {
  id: string;
  name: string;
  objective: string;
  weekRange: [number, number];
  color: string;
  concepts: Concept[];
  projects: Project[];
}

// State Types (persisted via MMKV)

export interface StudyState {
  currentPhaseId: string;
  currentConceptIndex: number;
  currentProjectIndex: number;
  mode: 'concept' | 'project';
  startDate: number;
  completedConcepts: string[];
  completedProjects: string[];
  projectStepStates: Record<string, Record<number, boolean>>;
  projectCriteriaStates: Record<string, Record<number, boolean>>;
  // transient — excluded from MMKV persist via partialize
  pendingChatInput: string;
}

// Actions (useStudyState public interface)

export interface StudyStateActions {
  markConceptRead: (conceptId: string) => void;
  markProjectDone: (projectId: string, force?: boolean) => void;
  updateStepState: (projectId: string, stepIndex: number, checked: boolean) => void;
  updateCriteriaState: (projectId: string, criteriaIndex: number, checked: boolean) => void;
  setPendingChatInput: (text: string) => void;
  clearPendingChatInput: () => void;
  // computed selectors (not mutations)
  currentWeek: () => number;
  currentPhase: () => Phase;
  currentConcept: () => Concept | null;
  currentProject: () => Project | null;
}

// Chat Types (ephemeral, not persisted)

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  isStreaming?: boolean;
}

export interface ChatError {
  code: 401 | 429 | 500 | 502 | 503 | 'network';
  message: string;
}
