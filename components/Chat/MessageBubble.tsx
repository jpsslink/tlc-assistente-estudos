import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import Markdown from 'react-native-markdown-display';
import { Message } from '../../types';

interface MessageBubbleProps {
  message: Message;
}

const markdownStyles = {
  code_inline: {
    backgroundColor: '#f5f5f7',
    fontFamily: 'monospace',
    fontSize: 14,
    color: '#1d1d1f',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  fence: {
    backgroundColor: '#f5f5f7',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
  },
  code_block: {
    backgroundColor: '#f5f5f7',
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    fontFamily: 'monospace',
    fontSize: 13,
    color: '#1d1d1f',
  },
  body: {
    fontSize: 17,
    color: '#1d1d1f',
    lineHeight: 25,
  },
};

export function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  if (isUser) {
    return (
      <View style={styles.userRow} testID="message-bubble-user">
        <View style={styles.userBubble}>
          <Text style={styles.userText}>{message.content}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.assistantRow} testID="message-bubble-assistant">
      <View style={styles.assistantBubble}>
        <Markdown style={markdownStyles}>{message.content}</Markdown>
        {message.isStreaming && (
          <ActivityIndicator
            size="small"
            color="#0066cc"
            style={styles.streamingIndicator}
            testID="streaming-indicator"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  userRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginVertical: 4,
    paddingHorizontal: 17,
  },
  userBubble: {
    backgroundColor: '#0066cc',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: '80%',
  },
  userText: {
    color: '#ffffff',
    fontSize: 17,
    lineHeight: 23,
  },
  assistantRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginVertical: 4,
    paddingHorizontal: 17,
  },
  assistantBubble: {
    backgroundColor: '#f5f5f7',
    borderRadius: 18,
    paddingVertical: 10,
    paddingHorizontal: 14,
    maxWidth: '90%',
  },
  streamingIndicator: {
    marginTop: 6,
    alignSelf: 'flex-start',
  },
});
