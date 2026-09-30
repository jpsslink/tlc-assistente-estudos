import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Project } from '../../types';
import { ChecklistItem } from '../shared/ChecklistItem';

interface ProjectCardProps {
  project: Project;
  projectId: string;
  stepStates: Record<number, boolean>;
  criteriaStates: Record<number, boolean>;
  onStepToggle: (index: number, checked: boolean) => void;
  onCriteriaToggle: (index: number, checked: boolean) => void;
  onMarkDone: () => void;
  onNeedsConfirm: () => void;
}

function getProjectStatus(
  steps: Project['steps'],
  stepStates: Record<number, boolean>
): 'Não iniciado' | 'Em Progresso' | 'Aguardando Revisão' {
  if (steps.length === 0) return 'Aguardando Revisão';
  const checkedCount = steps.filter((_, idx) => stepStates[idx] === true).length;
  if (checkedCount === 0) return 'Não iniciado';
  if (checkedCount === steps.length) return 'Aguardando Revisão';
  return 'Em Progresso';
}

export function ProjectCard({
  project,
  projectId,
  stepStates,
  criteriaStates,
  onStepToggle,
  onCriteriaToggle,
  onMarkDone,
  onNeedsConfirm,
}: ProjectCardProps) {
  const status = getProjectStatus(project.steps, stepStates);

  const allCriteriaChecked =
    project.readinessCriteria.length > 0 &&
    project.readinessCriteria.every((_, idx) => criteriaStates[idx] === true);

  const handleMarkDone = () => {
    if (allCriteriaChecked) {
      onMarkDone();
    } else {
      onNeedsConfirm();
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{project.title}</Text>
      <Text style={styles.description}>{project.description}</Text>

      <View style={[styles.statusBadge, statusBadgeStyle(status)]}>
        <Text style={[styles.statusText, statusTextStyle(status)]}>{status}</Text>
      </View>

      {project.steps.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Passos</Text>
          {project.steps.map((step, idx) => (
            <ChecklistItem
              key={idx}
              label={step.title}
              checked={stepStates[idx] === true}
              onToggle={(checked) => onStepToggle(idx, checked)}
            />
          ))}
        </View>
      )}

      {project.readinessCriteria.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Critérios de conclusão</Text>
          {project.readinessCriteria.map((criterion, idx) => (
            <ChecklistItem
              key={idx}
              label={criterion}
              checked={criteriaStates[idx] === true}
              onToggle={(checked) => onCriteriaToggle(idx, checked)}
            />
          ))}
        </View>
      )}

      <Pressable
        style={[styles.button, styles.buttonPrimary]}
        onPress={handleMarkDone}
        accessibilityLabel="MARCAR COMO PRONTO"
      >
        <Text style={styles.buttonTextPrimary}>MARCAR COMO PRONTO</Text>
      </Pressable>
    </View>
  );
}

function statusBadgeStyle(status: string) {
  if (status === 'Em Progresso') return { backgroundColor: '#e8f0fe' };
  if (status === 'Aguardando Revisão') return { backgroundColor: '#e6f4ea' };
  return { backgroundColor: '#f5f5f7' };
}

function statusTextStyle(status: string) {
  if (status === 'Em Progresso') return { color: '#0066cc' };
  if (status === 'Aguardando Revisão') return { color: '#34a853' };
  return { color: '#7a7a7a' };
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 11,
    padding: 17,
    marginHorizontal: 17,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  title: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#7a7a7a',
    marginBottom: 12,
    lineHeight: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    borderRadius: 9999,
    paddingVertical: 4,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  button: {
    borderRadius: 9999,
    paddingVertical: 11,
    paddingHorizontal: 22,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPrimary: {
    backgroundColor: '#0066cc',
  },
  buttonTextPrimary: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
