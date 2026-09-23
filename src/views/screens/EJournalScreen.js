import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import JournalController from '../../controllers/JournalController';
import JournalCard from '../components/JournalCard';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../constants/roles';

export default function EJournalScreen({ navigation }) {
  const { user } = useAuth();
  const [journals, setJournals] = useState([]);

  const hasAccess = can(user, 'accessJournal') || user?.subscriptionActive;

  useEffect(() => {
    if (hasAccess) JournalController.list().then(setJournals);
  }, [hasAccess]);

  if (!hasAccess) {
    return (
      <View style={styles.lockContainer}>
        <Ionicons name="lock-closed" size={48} color="#B0B0B0" />
        <Text style={styles.lockTitle}>Akses Terbatas</Text>
        <Text style={styles.lockText}>
          Portal jurnal ilmiah hanya tersedia untuk civitas akademika atau
          pengguna umum dengan paket akses aktif.
        </Text>
        <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Langganan')}>
          <Text style={styles.buttonText}>Lihat Paket Akses</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>E-Journal Portal</Text>
      <FlatList
        data={journals}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <JournalCard journal={item} />}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA', padding: 16 },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 12 },
  lockContainer: { flex: 1, backgroundColor: '#F4F6FA', justifyContent: 'center', alignItems: 'center', padding: 32 },
  lockTitle: { fontSize: 17, fontWeight: '700', marginTop: 14, marginBottom: 8 },
  lockText: { fontSize: 13, color: '#777', textAlign: 'center', lineHeight: 20, marginBottom: 20 },
  button: { backgroundColor: '#2E5AAC', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 28 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
});
