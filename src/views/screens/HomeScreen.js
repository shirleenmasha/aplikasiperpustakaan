import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, SectionList, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import BookController from '../../controllers/BookController';
import BookCard from '../components/BookCard';
import { GENRES } from '../../constants/genres';
import { useAuth } from '../../context/AuthContext';
import { can, ROLE_LABELS } from '../../constants/roles';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const isAdmin = can(user, 'manageBooks'); 
  const [query, setQuery] = useState('');
  const [activeGenre, setActiveGenre] = useState(GENRES[0].key);
  const [localBooks, setLocalBooks] = useState([]);
  const [remoteBooks, setRemoteBooks] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadBooks = useCallback(async () => {
    setLoading(true);
    try {
      const { local, remote } = await BookController.list(
        query.trim() ? { query } : { genre: activeGenre }
      );
      setLocalBooks(local);
      setRemoteBooks(remote);
    } finally {
      setLoading(false);
    }
  }, [query, activeGenre]);

  useFocusEffect(
    useCallback(() => {
      loadBooks();
    }, [loadBooks])
  );

  const handleDelete = (book) => {
    Alert.alert('Hapus Buku', `Yakin hapus "${book.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive',
        onPress: async () => {
          try {
            await BookController.remove(book.id, user);
            loadBooks();
          } catch (err) {
            Alert.alert('Gagal', err.message);
          }
        },
      },
    ]);
  };

  const sections = [
    { title: `Koleksi Kampus (${localBooks.length})`, data: localBooks },
    {
      title: query.trim()
        ? `Hasil Pencarian — Open Library (${remoteBooks.length})`
        : `Katalog Referensi — Open Library (${remoteBooks.length})`,
      data: remoteBooks,
    },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.header}>Katalog Buku Digital</Text>
          {}
          <Text style={styles.roleLine}>
            {user?.name} · {ROLE_LABELS[user?.role]}
          </Text>
        </View>
        {}
        {isAdmin && (
          <TouchableOpacity style={styles.addBtn} onPress={() => navigation.navigate('BookForm')}>
            <Ionicons name="add" size={22} color="#fff" />
          </TouchableOpacity>
        )}
      </View>

      <TextInput
        style={styles.search}
        placeholder="Cari di seluruh katalog (judul/pengarang)..."
        value={query}
        onChangeText={setQuery}
        onSubmitEditing={loadBooks}
      />

      {}
      {!query.trim() && (
        <View style={styles.genreRow}>
          {GENRES.map((g) => (
            <TouchableOpacity
              key={g.key}
              style={[styles.chip, activeGenre === g.key && styles.chipActive]}
              onPress={() => setActiveGenre(g.key)}
            >
              <Text style={[styles.chipText, activeGenre === g.key && styles.chipTextActive]}>
                {g.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {loading && <ActivityIndicator style={{ marginVertical: 12 }} color="#2E5AAC" />}

      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <Text style={styles.sectionTitle}>{section.title}</Text>
        )}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            canManage={isAdmin}
            onPress={() => navigation.navigate('BookDetail', { bookId: item.id })}
            onEdit={() => navigation.navigate('BookForm', { bookId: item.id })}
            onDelete={() => handleDelete(item)}
          />
        )}
        renderSectionFooter={({ section }) =>
          section.data.length === 0 && !loading ? (
            <Text style={styles.empty}>Tidak ada buku di bagian ini.</Text>
          ) : null
        }
        contentContainerStyle={{ paddingBottom: 24 }}
        stickySectionHeadersEnabled={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 16 },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  header: { fontSize: 20, fontWeight: '700' },
  roleLine: { fontSize: 12, color: '#777', marginTop: 2 },
  addBtn: { backgroundColor: '#2E5AAC', borderRadius: 20, width: 36, height: 36, justifyContent: 'center', alignItems: 'center' },
  search: { backgroundColor: '#fff', borderRadius: 10, padding: 12, marginBottom: 12, borderWidth: 1, borderColor: '#E0E0E0' },
  genreRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0' },
  chipActive: { backgroundColor: '#2E5AAC', borderColor: '#2E5AAC' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  sectionTitle: { fontSize: 14, fontWeight: '700', color: '#333', marginTop: 8, marginBottom: 8 },
  empty: { textAlign: 'center', color: '#999', marginBottom: 12, fontSize: 12 },
});
