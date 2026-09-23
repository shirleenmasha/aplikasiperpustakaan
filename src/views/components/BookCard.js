import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';


export default function BookCard({ book, onPress, onEdit, onDelete, canManage = false }) {
  const isAvailable = book.borrowedBy < book.quota;
  const isLocal = book.source === 'local'; 
  const showActions = canManage && isLocal;  

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <Image source={{ uri: book.cover }} style={styles.cover} />
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>

        <View style={styles.badgeRow}>
          <View style={[styles.badge, { backgroundColor: isAvailable ? '#DFF7E2' : '#FCE2E2' }]}>
            <Text style={{ color: isAvailable ? '#1E8E3E' : '#C0392B', fontSize: 11 }}>
              {isAvailable ? `${book.quota - book.borrowedBy} slot` : 'Penuh'}
            </Text>
          </View>
          {!isLocal && (
            <View style={[styles.badge, { backgroundColor: '#E7EEFB' }]}>
              <Text style={{ color: '#2E5AAC', fontSize: 11 }}>Open Library</Text>
            </View>
          )}
        </View>
      </View>

      {showActions && (
        <View style={styles.actions}>
          <TouchableOpacity onPress={onEdit} style={styles.actionBtn}>
            <Ionicons name="pencil" size={18} color="#2E5AAC" />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} style={styles.actionBtn}>
            <Ionicons name="trash" size={18} color="#C0392B" />
          </TouchableOpacity>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 10,
    marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 4,
    alignItems: 'center',
  },
  cover: { width: 60, height: 84, borderRadius: 6, backgroundColor: '#eee' },
  info: { flex: 1, marginLeft: 12, justifyContent: 'center' },
  title: { fontSize: 15, fontWeight: '600', color: '#1a1a1a' },
  author: { fontSize: 13, color: '#555', marginTop: 2 },
  badgeRow: { flexDirection: 'row', gap: 6, marginTop: 6 },
  badge: { alignSelf: 'flex-start', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  actions: { justifyContent: 'space-around', height: 60, marginLeft: 6 },
  actionBtn: { padding: 4 },
});
