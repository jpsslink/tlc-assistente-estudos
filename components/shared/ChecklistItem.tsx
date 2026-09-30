import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';

interface ChecklistItemProps {
  label: string;
  checked: boolean;
  onToggle: (checked: boolean) => void;
  disabled?: boolean;
}

export function ChecklistItem({ label, checked, onToggle, disabled = false }: ChecklistItemProps) {
  const handlePress = () => {
    if (!disabled) {
      onToggle(!checked);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      style={styles.container}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      <View style={[styles.checkbox, checked && styles.checkboxChecked, disabled && styles.checkboxDisabled]}>
        {checked && <Text style={styles.checkmark}>✓</Text>}
      </View>
      <Text style={[styles.label, disabled && styles.labelDisabled]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#7a7a7a',
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0066cc',
    borderColor: '#0066cc',
  },
  checkboxDisabled: {
    borderColor: '#cccccc',
    backgroundColor: '#f0f0f0',
  },
  checkmark: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    flex: 1,
    fontSize: 17,
    color: '#1d1d1f',
    lineHeight: 25,
  },
  labelDisabled: {
    color: '#7a7a7a',
  },
});
