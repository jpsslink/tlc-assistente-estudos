import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface PhaseHeaderProps {
  weekNumber: number;
  phaseName: string;
  mode: 'concept' | 'project';
  currentIndex: number;
  totalCount: number;
}

export function PhaseHeader({ weekNumber, phaseName, mode, currentIndex, totalCount }: PhaseHeaderProps) {
  const itemLabel = mode === 'concept' ? 'Conceito' : 'Projeto';
  const headerText = `Semana ${weekNumber}/14 | ${phaseName} | ${itemLabel} ${currentIndex} de ${totalCount}`;

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{headerText}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 17,
    paddingVertical: 12,
    backgroundColor: '#f5f5f7',
  },
  text: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1f',
    lineHeight: 20,
  },
});
