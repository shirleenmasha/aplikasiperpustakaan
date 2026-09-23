// src/views/components/JournalCard.js
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function JournalCard({ journal }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{journal.title}</Text>
      <Text style={styles.meta}>{journal.authors} · {journal.publisher} ({journal.year})</Text>
      <Text style={styles.abstract} numberOfLines={3}>{journal.abstract}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 12,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4,
  },
  title: { fontSize: 15, fontWeight: '600', color: '#1a1a1a', marginBottom: 4 },
  meta: { fontSize: 12, color: '#777', marginBottom: 6 },
  abstract: { fontSize: 13, color: '#444', lineHeight: 18 },
});
