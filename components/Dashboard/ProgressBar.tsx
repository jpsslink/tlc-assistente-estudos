import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface ProgressBarProps {
  completedConcepts: number;
  totalConcepts: number;
  completedProjects: number;
  totalProjects: number;
}

export function ProgressBar({
  completedConcepts,
  totalConcepts,
  completedProjects,
  totalProjects,
}: ProgressBarProps) {
  const conceptPct = totalConcepts > 0 ? Math.round((completedConcepts / totalConcepts) * 100) : 0;
  const projectPct = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

  return (
    <View style={styles.container}>
      {/* Phase progress bar */}
      <View style={styles.barSection}>
        <Text style={styles.label} testID="phase-progress-label">
          {`${completedConcepts}/${totalConcepts} — ${conceptPct}%`}
        </Text>
        <View style={styles.track}>
          <View
            style={[styles.fill, { width: `${conceptPct}%` as any }]}
            testID="phase-progress-fill"
          />
        </View>
      </View>

      {/* Overall projects progress bar */}
      <View style={styles.barSection}>
        <Text style={styles.label} testID="overall-progress-label">
          {`${completedProjects}/${totalProjects} projetos`}
        </Text>
        <View style={styles.track}>
          <View
            style={[styles.fill, { width: `${projectPct}%` as any }]}
            testID="overall-progress-fill"
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 17,
    paddingVertical: 12,
  },
  barSection: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    color: '#1d1d1f',
    marginBottom: 4,
  },
  track: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#0066cc',
    borderRadius: 4,
  },
});
