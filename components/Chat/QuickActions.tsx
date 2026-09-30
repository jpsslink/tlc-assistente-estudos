import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Concept, Project } from '../../types';

interface QuickActionsProps {
  currentConcept: Concept | null;
  currentProject: Project | null;
  stepStates: Record<number, boolean>;
  onAction: (prefill: string) => void;
  visible: boolean;
}

export function QuickActions({
  currentConcept,
  currentProject,
  stepStates,
  onAction,
  visible,
}: QuickActionsProps) {
  if (!visible) return null;

  const handleExplainConcept = () => {
    const title = currentConcept?.title ?? 'conceito atual';
    onAction(`Me explique o conceito atual: ${title}`);
  };

  const handleHelpProject = () => {
    const projectTitle = currentProject?.title ?? 'projeto atual';
    // Find first uncompleted step
    let firstUncompletedStep = '';
    if (currentProject) {
      const firstUncompleted = currentProject.steps.find((_, idx) => !stepStates[idx]);
      firstUncompletedStep = firstUncompleted?.title ?? '';
    }
    const prefill = firstUncompletedStep
      ? `Preciso de ajuda com o projeto atual: ${projectTitle}. Estou no passo: ${firstUncompletedStep}`
      : `Preciso de ajuda com o projeto atual: ${projectTitle}`;
    onAction(prefill);
  };

  const handleNextSteps = () => {
    onAction('Quais são os próximos passos no meu plano depois de completar o conceito/projeto atual?');
  };

  return (
    <View style={styles.container} testID="quick-actions">
      <Pressable
        style={styles.button}
        onPress={handleExplainConcept}
        accessibilityLabel="Explique este conceito"
      >
        <Text style={styles.buttonText}>Explique este conceito</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={handleHelpProject}
        accessibilityLabel="Ajude no projeto"
      >
        <Text style={styles.buttonText}>Ajude no projeto</Text>
      </Pressable>
      <Pressable
        style={styles.button}
        onPress={handleNextSteps}
        accessibilityLabel="Próximos passos"
      >
        <Text style={styles.buttonText}>Próximos passos</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 17,
    paddingVertical: 8,
    gap: 8,
    backgroundColor: '#f5f5f7',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  buttonText: {
    fontSize: 13,
    color: '#0066cc',
    fontWeight: '600',
  },
});
