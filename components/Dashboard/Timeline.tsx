import React, { useState } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet, Alert } from 'react-native';
import { Phase } from '../../types';

interface TimelineProps {
  currentWeek: number;
  completedPhaseIds: string[];
  phases: Phase[];
}

export function Timeline({ currentWeek, completedPhaseIds, phases }: TimelineProps) {
  const [tooltipWeek, setTooltipWeek] = useState<number | null>(null);

  // Build a map from week number to phase
  const weekToPhase: Record<number, Phase> = {};
  for (const phase of phases) {
    const [start, end] = phase.weekRange;
    for (let w = start; w <= end; w++) {
      weekToPhase[w] = phase;
    }
  }

  const handleLongPress = (week: number) => {
    const phase = weekToPhase[week];
    if (!phase) return;

    const projectTitles = phase.projects.map((p) => `• ${p.title}`).join('\n');
    const message = projectTitles
      ? `${phase.name}\n\n${projectTitles}`
      : phase.name;

    Alert.alert(phase.name, projectTitles || undefined);
    setTooltipWeek(week);
  };

  return (
    <ScrollView
      horizontal
      style={styles.container}
      contentContainerStyle={styles.content}
      showsHorizontalScrollIndicator={false}
      testID="timeline-scroll"
    >
      {Array.from({ length: 14 }, (_, i) => i + 1).map((week) => {
        const phase = weekToPhase[week];
        const isCurrentWeek = week === currentWeek;
        const isCompleted = phase ? completedPhaseIds.includes(phase.id) : false;

        return (
          <Pressable
            key={week}
            onLongPress={() => handleLongPress(week)}
            style={[
              styles.weekSlot,
              { backgroundColor: phase?.color ?? '#e0e0e0' },
              isCurrentWeek && styles.currentWeek,
              isCompleted && styles.completedWeek,
            ]}
            testID={`week-slot-${week}`}
            accessibilityLabel={`Semana ${week}`}
          >
            <Text style={[styles.weekText, isCurrentWeek && styles.currentWeekText]}>
              {week}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  content: {
    paddingHorizontal: 17,
    flexDirection: 'row',
    gap: 4,
  },
  weekSlot: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  currentWeek: {
    borderWidth: 2,
    borderColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
  },
  completedWeek: {
    opacity: 0.5,
  },
  weekText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffff',
  },
  currentWeekText: {
    fontWeight: '700',
  },
});
