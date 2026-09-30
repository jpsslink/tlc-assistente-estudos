import React, { useState } from 'react';
import { View, Text, Pressable, Modal, ScrollView, StyleSheet } from 'react-native';
import { Concept } from '../../types';

interface ConceptCardProps {
  concept: Concept;
  conceptIndex: number;
  totalConcepts: number;
  onMarkRead: () => void;
  onShowMaterial?: () => void;
  onAskClaude: () => void;
}

export function ConceptCard({
  concept,
  conceptIndex,
  totalConcepts,
  onMarkRead,
  onAskClaude,
}: ConceptCardProps) {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{concept.title}</Text>
      <Text style={styles.subtitle}>Conceito {conceptIndex} de {totalConcepts}</Text>

      <View style={styles.buttonRow}>
        <Pressable
          style={styles.button}
          onPress={() => setModalVisible(true)}
          accessibilityLabel="MOSTRAR MATERIAL"
        >
          <Text style={styles.buttonText}>MOSTRAR MATERIAL</Text>
        </Pressable>

        <Pressable
          style={styles.button}
          onPress={onMarkRead}
          accessibilityLabel="MARCAR COMO LIDO"
        >
          <Text style={styles.buttonText}>MARCAR COMO LIDO</Text>
        </Pressable>

        <Pressable
          style={[styles.button, styles.buttonPrimary]}
          onPress={onAskClaude}
          accessibilityLabel="AJUDA COM ESTE CONCEITO"
        >
          <Text style={[styles.buttonText, styles.buttonTextPrimary]}>AJUDA COM ESTE CONCEITO</Text>
        </Pressable>
      </View>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="fullScreen"
        testID="concept-material-modal"
      >
        <ScrollView style={styles.modal} contentContainerStyle={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{concept.title}</Text>
            <Text style={styles.readingTime}>Tempo estimado: {concept.readingTimeMinutes} min</Text>
            <Pressable
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
              accessibilityLabel="Fechar"
            >
              <Text style={styles.closeButtonText}>Fechar</Text>
            </Pressable>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Por que importa</Text>
            <Text style={styles.sectionContent}>{concept.whyItMatters}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>O que aprender</Text>
            <Text style={styles.sectionContent}>{concept.whatToLearn}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Como aprender</Text>
            <Text style={styles.sectionContent}>{concept.howToLearn}</Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recursos sugeridos</Text>
            {concept.resources.map((resource, idx) => (
              <Text key={idx} style={styles.listItem}>• {resource}</Text>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Armadilhas comuns</Text>
            {concept.pitfalls.map((pitfall, idx) => (
              <Text key={idx} style={styles.listItem}>• {pitfall}</Text>
            ))}
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
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
  subtitle: {
    fontSize: 14,
    color: '#7a7a7a',
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: 'column',
    gap: 8,
  },
  button: {
    backgroundColor: '#f5f5f7',
    borderRadius: 9999,
    paddingVertical: 11,
    paddingHorizontal: 22,
    alignItems: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#0066cc',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1d1d1f',
  },
  buttonTextPrimary: {
    color: '#ffffff',
  },
  modal: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  modalContent: {
    padding: 17,
  },
  modalHeader: {
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 34,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  readingTime: {
    fontSize: 14,
    color: '#7a7a7a',
    marginBottom: 12,
  },
  closeButton: {
    backgroundColor: '#f5f5f7',
    borderRadius: 9999,
    paddingVertical: 8,
    paddingHorizontal: 22,
    alignSelf: 'flex-start',
  },
  closeButtonText: {
    fontSize: 14,
    color: '#0066cc',
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#1d1d1f',
    marginBottom: 8,
  },
  sectionContent: {
    fontSize: 17,
    color: '#1d1d1f',
    lineHeight: 25,
  },
  listItem: {
    fontSize: 17,
    color: '#1d1d1f',
    lineHeight: 25,
    marginBottom: 4,
  },
});
