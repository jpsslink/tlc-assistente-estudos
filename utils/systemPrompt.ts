import { StudyState, Concept, Project, Phase } from '../types';
import { CURRICULUM } from '../data/curriculum';

function getCurrentPhase(state: StudyState): Phase {
  return CURRICULUM.find((p) => p.id === state.currentPhaseId) ?? CURRICULUM[0];
}

function getCurrentConcept(state: StudyState): Concept | null {
  const phase = getCurrentPhase(state);
  return phase.concepts[state.currentConceptIndex] ?? null;
}

function getCurrentProject(state: StudyState): Project | null {
  const phase = getCurrentPhase(state);
  return phase.projects[state.currentProjectIndex] ?? null;
}

function formatWeek(state: StudyState): number {
  const msPerWeek = 7 * 24 * 3600 * 1000;
  const weeks = Math.ceil((Date.now() - state.startDate) / msPerWeek);
  return Math.min(14, Math.max(1, weeks));
}

export function buildPrompt(state: StudyState): string {
  const phase = getCurrentPhase(state);
  const concept = getCurrentConcept(state);
  const project = getCurrentProject(state);
  const week = formatWeek(state);

  const lines: string[] = [
    `Você é um tutor especializado em IA aplicada. O estudante está na Semana ${week} de 14 do plano de estudos.`,
    '',
    `FASE ATUAL: ${phase.name}`,
    `Objetivo da fase: ${phase.objective}`,
    '',
  ];

  if (concept) {
    lines.push(
      `CONCEITO ATUAL: ${concept.title}`,
      '',
      `Por que importa: ${concept.whyItMatters}`,
      '',
      `O que aprender: ${concept.whatToLearn}`,
      '',
      `Como aprender: ${concept.howToLearn}`,
      '',
      `Recursos sugeridos:`,
      ...concept.resources.map((r) => `- ${r}`),
      '',
    );
  }

  if (project) {
    lines.push(
      `PROJETO ATUAL: ${project.title}`,
      `Descrição: ${project.description}`,
      '',
      `Passos do projeto:`,
      ...project.steps.map((s, idx) => `${idx + 1}. ${s.title}: ${s.description}`),
      '',
      `Critérios de pronto:`,
      ...project.readinessCriteria.map((c) => `- ${c}`),
    );
  }

  lines.push(
    '',
    `Responda sempre em português. Seja específico ao contexto da fase e conceito/projeto atual.`,
    `Forneça exemplos práticos e orientados a código quando relevante.`,
  );

  return lines.join('\n');
}
