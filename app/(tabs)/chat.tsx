import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useStudyState } from '../../hooks/useStudyState';
import { useClaudeChat } from '../../hooks/useClaudeChat';
import { readApiKey } from '../../utils/storage';
import { MessageList } from '../../components/Chat/MessageList';
import { QuickActions } from '../../components/Chat/QuickActions';
import { ChatInput } from '../../components/Chat/ChatInput';
import { ApiKeyConfig } from '../../components/shared/ApiKeyConfig';

export default function ChatScreen() {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [keyChecked, setKeyChecked] = useState(false);

  const state = useStudyState();
  const { messages, isLoading, chatError, sendMessage } = useClaudeChat();

  const concept = state.currentConcept();
  const project = state.currentProject();
  const stepStates = project ? (state.projectStepStates[project.id] ?? {}) : {};

  useEffect(() => {
    readApiKey().then((key) => {
      setApiKey(key);
      setKeyChecked(true);
    });
  }, []);

  const handleApiKeySaved = async () => {
    const key = await readApiKey();
    setApiKey(key);
  };

  const handleSend = (text: string) => {
    sendMessage(text, state);
  };

  const handleQuickAction = (prefill: string) => {
    // QuickActions calls onAction which calls sendMessage directly for Chat tab
    // Set as pending and trigger input – or send directly
    sendMessage(prefill, state);
  };

  if (!keyChecked) {
    return <View style={styles.container} />;
  }

  if (!apiKey) {
    return (
      <View style={styles.container} testID="chat-screen-no-key">
        <Text style={styles.noKeyMessage} testID="no-key-message">
          Configure sua API key para usar o chat
        </Text>
        <ApiKeyConfig onSaved={handleApiKeySaved} />
      </View>
    );
  }

  return (
    <View style={styles.container} testID="chat-screen">
      {chatError && (
        <View style={styles.errorRow} testID="chat-error">
          <Text style={styles.errorText}>{chatError.message}</Text>
        </View>
      )}
      <MessageList messages={messages} />
      <QuickActions
        currentConcept={concept}
        currentProject={project}
        stepStates={stepStates}
        onAction={handleQuickAction}
        visible={!!apiKey}
      />
      <ChatInput onSend={handleSend} isLoading={isLoading} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  noKeyMessage: {
    fontSize: 17,
    color: '#7a7a7a',
    textAlign: 'center',
    paddingHorizontal: 32,
    paddingTop: 48,
    paddingBottom: 16,
  },
  errorRow: {
    backgroundColor: '#fff3f3',
    borderBottomWidth: 1,
    borderBottomColor: '#ffcccc',
    paddingHorizontal: 17,
    paddingVertical: 10,
  },
  errorText: {
    fontSize: 14,
    color: '#d32f2f',
  },
});
