import React from 'react';
import { View, ScrollView, Alert, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { useStudyState } from '../../hooks/useStudyState';
import { PhaseHeader } from '../../components/Dashboard/PhaseHeader';
import { ProgressBar } from '../../components/Dashboard/ProgressBar';
import { ConceptCard } from '../../components/Dashboard/ConceptCard';
import { ProjectCard } from '../../components/Dashboard/ProjectCard';
import { Timeline } from '../../components/Dashboard/Timeline';
import { CURRICULUM } from '../../data/curriculum';

export default function DashboardScreen() {
  const state = useStudyState();

  const phase = state.currentPhase();
  const concept = state.currentConcept();
  const project = state.currentProject();
  const weekNumber = state.currentWeek();

  const totalProjects = CURRICULUM.reduce((sum, p) => sum + p.projects.length, 0);

  // Determine indices for PhaseHeader
  const currentIndex = state.mode === 'concept'
    ? state.currentConceptIndex + 1
    : state.currentProjectIndex + 1;
  const totalCount = state.mode === 'concept'
    ? phase.concepts.length
    : phase.projects.length;

  const completedPhaseIds = CURRICULUM
    .filter((p) => p.projects.every((proj) => state.completedProjects.includes(proj.id)))
    .map((p) => p.id);

  const handleMarkConceptRead = () => {
    if (concept) {
      state.markConceptRead(concept.id);
    }
  };

  const handleMarkProjectDone = () => {
    if (project) {
      state.markProjectDone(project.id);
    }
  };

  const handleNeedsConfirm = () => {
    if (!project) return;
    const projectId = project.id;
    Alert.alert(
      'Critérios pendentes',
      'Ainda há critérios de pronto não marcados. Deseja avançar mesmo assim?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Confirmar',
          onPress: () => {
            state.markProjectDone(projectId, true);
          },
        },
      ]
    );
  };

  const handleAskClaude = () => {
    if (concept) {
      state.setPendingChatInput(`Me explique o conceito atual: ${concept.title}`);
      router.push('/(tabs)/chat');
    }
  };

  const stepStates = project ? (state.projectStepStates[project.id] ?? {}) : {};
  const criteriaStates = project ? (state.projectCriteriaStates[project.id] ?? {}) : {};

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <PhaseHeader
        weekNumber={weekNumber}
        phaseName={phase.name}
        mode={state.mode}
        currentIndex={currentIndex}
        totalCount={totalCount}
      />
      <ProgressBar
        completedConcepts={state.completedConcepts.length}
        totalConcepts={phase.concepts.length}
        completedProjects={state.completedProjects.length}
        totalProjects={totalProjects}
      />
      {state.mode === 'concept' && concept && (
        <ConceptCard
          concept={concept}
          conceptIndex={state.currentConceptIndex + 1}
          totalConcepts={phase.concepts.length}
          onMarkRead={handleMarkConceptRead}
          onAskClaude={handleAskClaude}
        />
      )}
      {state.mode === 'project' && project && (
        <ProjectCard
          project={project}
          projectId={project.id}
          stepStates={stepStates}
          criteriaStates={criteriaStates}
          onStepToggle={(idx, checked) => state.updateStepState(project.id, idx, checked)}
          onCriteriaToggle={(idx, checked) => state.updateCriteriaState(project.id, idx, checked)}
          onMarkDone={handleMarkProjectDone}
          onNeedsConfirm={handleNeedsConfirm}
        />
      )}
      <Timeline
        currentWeek={weekNumber}
        completedPhaseIds={completedPhaseIds}
        phases={CURRICULUM}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  content: {
    paddingBottom: 24,
  },
});
