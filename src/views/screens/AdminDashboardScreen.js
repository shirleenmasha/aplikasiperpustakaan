import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import BookController from '../../controllers/BookController';
import { useAuth } from '../../context/AuthContext';

export default function AdminDashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, borrowed: 0, full: 0 });

  const loadStats = useCallback(async () => {
    const { local } = await BookController.list({});
    setStats({
      total: local.length,
      borrowed: local.reduce((sum, b) => sum + b.borrowedBy, 0),
      full: local.filter((b) => b.borrowedBy >= b.quota).length,
    });
  }, []);

  useFocusEffect(useCallback(() => { loadStats(); }, [loadStats]));

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.greeting}>Selamat datang,</Text>
      <Text style={styles.name}>{user?.name}</Text>
      <Text style={styles.unit}>{user?.faculty}</Text>

      <View style={styles.statRow}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Judul Koleksi</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.borrowed}</Text>
          <Text style={styles.statLabel}>Sedang Dipinjam</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={[styles.statNumber, { color: '#C0392B' }]}>{stats.full}</Text>
          <Text style={styles.statLabel}>Kuota Penuh</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Aksi Cepat</Text>

      <TouchableOpacity style={styles.action} onPress={() => navigation.navigate('BookForm')}>
        <Ionicons name="add-circle" size={22} color="#2E5AAC" />
        <Text style={styles.actionText}>Tambah Koleksi Baru</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.action} onPress={() => navigation.navigate('Katalog')}>
        <Ionicons name="library" size={22} color="#2E5AAC" />
        <Text style={styles.actionText}>Kelola Koleksi Kampus</Text>
      </TouchableOpacity>

      <View style={styles.noteBox}>
        <Text style={styles.noteText}>
          Catatan: buku dari katalog Open Library tidak bisa diubah atau dihapus
          karena datanya milik pihak ketiga. Yang bisa dikelola hanya Koleksi Kampus.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  greeting: { fontSize: 13, color: '#777' },
  name: { fontSize: 20, fontWeight: '700', color: '#1a1a1a' },
  unit: { fontSize: 13, color: '#666', marginBottom: 20 },
  statRow: { flexDirection: 'row', gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center',
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4,
  },
  statNumber: { fontSize: 22, fontWeight: '700', color: '#2E5AAC' },
  statLabel: { fontSize: 11, color: '#777', marginTop: 4, textAlign: 'center' },
  sectionTitle: { fontSize: 15, fontWeight: '700', marginBottom: 10 },
  action: {
    flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#fff',
    borderRadius: 12, padding: 16, marginBottom: 10,
  },
  actionText: { fontSize: 14, color: '#333', fontWeight: '500' },
  noteBox: { backgroundColor: '#FFF9E6', borderRadius: 10, padding: 14, marginTop: 16, borderWidth: 1, borderColor: '#F0DFA0' },
  noteText: { fontSize: 12, color: '#7A6420', lineHeight: 18 },
});
