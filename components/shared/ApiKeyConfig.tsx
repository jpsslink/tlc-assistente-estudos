import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { readApiKey, writeApiKey } from '../../utils/storage';

interface ApiKeyConfigProps {
  onSaved?: () => void;
}

export function ApiKeyConfig({ onSaved }: ApiKeyConfigProps) {
  const [inputValue, setInputValue] = useState('');
  const [maskedKey, setMaskedKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    readApiKey().then((key) => {
      if (key) {
        // Display masked version: ••••xxxx (last 4 chars)
        const last4 = key.slice(-4);
        setMaskedKey(`••••${last4}`);
      }
    });
  }, []);

  const handleSave = async () => {
    const trimmed = inputValue.trim();
    if (!trimmed.startsWith('sk-ant-')) {
      setError('API key inválida. Deve começar com "sk-ant-".');
      return;
    }
    setError(null);
    await writeApiKey(trimmed);
    const last4 = trimmed.slice(-4);
    setMaskedKey(`••••${last4}`);
    setInputValue('');
    onSaved?.();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Anthropic API Key</Text>
      {maskedKey && (
        <Text style={styles.maskedKey} testID="masked-key">
          {maskedKey}
        </Text>
      )}
      <TextInput
        style={styles.input}
        value={inputValue}
        onChangeText={setInputValue}
        placeholder="sk-ant-..."
        secureTextEntry
        autoCapitalize="none"
        autoCorrect={false}
        testID="api-key-input"
      />
      {error && (
        <Text style={styles.error} testID="api-key-error">
          {error}
        </Text>
      )}
      <Pressable style={styles.button} onPress={handleSave} accessibilityLabel="Salvar">
        <Text style={styles.buttonText}>Salvar</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 17,
    backgroundColor: '#ffffff',
    borderRadius: 11,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 17,
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  maskedKey: {
    fontSize: 14,
    color: '#7a7a7a',
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 14,
    color: '#1d1d1f',
    marginBottom: 8,
  },
  error: {
    fontSize: 12,
    color: '#d32f2f',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#0066cc',
    borderRadius: 9999,
    paddingVertical: 11,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
});
