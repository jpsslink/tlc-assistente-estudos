import React, { useState, useEffect } from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import { useIsFocused } from '@react-navigation/core';
import { useStudyState } from '../../hooks/useStudyState';

interface ChatInputProps {
  onSend: (text: string) => void;
  isLoading: boolean;
}

export function ChatInput({ onSend, isLoading }: ChatInputProps) {
  const [inputText, setInputText] = useState('');
  const isFocused = useIsFocused();
  const pendingChatInput = useStudyState((state) => state.pendingChatInput);
  const clearPendingChatInput = useStudyState((state) => state.clearPendingChatInput);

  useEffect(() => {
    if (isFocused && pendingChatInput) {
      setInputText(pendingChatInput);
      clearPendingChatInput();
    }
  }, [isFocused, pendingChatInput, clearPendingChatInput]);

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInputText('');
  };

  const disabled = isLoading || inputText.trim().length === 0;

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        value={inputText}
        onChangeText={setInputText}
        placeholder="Digite uma mensagem..."
        multiline
        testID="chat-text-input"
        editable={!isLoading}
      />
      <Pressable
        style={[styles.sendButton, disabled && styles.sendButtonDisabled]}
        onPress={handleSend}
        disabled={disabled}
        accessibilityLabel="Enviar"
        testID="chat-send-button"
      >
        <Text style={[styles.sendButtonText, disabled && styles.sendButtonTextDisabled]}>
          Enviar
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 17,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    fontSize: 17,
    color: '#1d1d1f',
    maxHeight: 120,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#0066cc',
    borderRadius: 9999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#cccccc',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  sendButtonTextDisabled: {
    color: '#ffffff',
  },
});
