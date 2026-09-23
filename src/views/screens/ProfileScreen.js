// src/views/screens/ProfileScreen.js
// Layar profil yang tampil untuk SEMUA role, tapi isinya menyesuaikan:
// hak akses yang ditampilkan diambil dari matriks PERMISSIONS.

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS, ROLES, getRules } from '../../constants/roles';

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const rules = getRules(user);
  if (!user) return <View style={styles.container} />;

  const handleLogout = () => {
    Alert.alert('Keluar', 'Yakin ingin keluar dari akun ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Keluar',
        style: 'destructive',
        onPress: () => {
          logout().catch((err) => Alert.alert('Gagal Keluar', err.message));
        },
      },
    ]);
  };


  const accessList = [
    { label: 'Meminjam e-book', granted: rules?.borrowBook },
    { label: 'Akses E-Journal ilmiah', granted: rules?.accessJournal },
    { label: 'Mengelola koleksi (tambah/edit/hapus)', granted: rules?.manageBooks },
    { label: 'Melihat dashboard pengelola', granted: rules?.viewDashboard },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user?.name?.charAt(0) || '?'}</Text>
        </View>
        <Text style={styles.name}>{user?.name}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{ROLE_LABELS[user?.role]}</Text>
        </View>
        <Text style={styles.faculty}>{user?.faculty}</Text>
      </View>

      <Text style={styles.sectionTitle}>Hak Akses Anda</Text>
      <View style={styles.card}>
        {accessList.map((item) => (
          <View key={item.label} style={styles.accessRow}>
            <Ionicons
              name={item.granted ? 'checkmark-circle' : 'close-circle'}
              size={18}
              color={item.granted ? '#1E8E3E' : '#C0392B'}
            />
            <Text style={[styles.accessText, !item.granted && styles.accessTextOff]}>
              {item.label}
            </Text>
          </View>
        ))}
        <View style={styles.divider} />
        <Text style={styles.quotaText}>
          Batas peminjaman bersamaan: {rules?.maxBorrow} judul
        </Text>
      </View>

      {}
      {user?.role === ROLES.EKSTERNAL && (
        <>
          <Text style={styles.sectionTitle}>Status Langganan</Text>
          <View style={styles.card}>
            <Text style={styles.subStatus}>
              {user.subscriptionActive
                ? '✅ Paket akses AKTIF'
                : '⚠️ Belum berlangganan — akses dibatasi'}
            </Text>
            {!user.subscriptionActive && (
              <TouchableOpacity
                style={styles.subButton}
                onPress={() => navigation.navigate('Langganan')}
              >
                <Text style={styles.subButtonText}>Lihat Paket Akses</Text>
              </TouchableOpacity>
            )}
          </View>
        </>
      )}

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={18} color="#C0392B" />
        <Text style={styles.logoutText}>Keluar</Text>
      </TouchableOpacity>

      {}
      <Text style={styles.buildTag}>build: logout-fix-v2</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  header: { alignItems: 'center', marginBottom: 24 },
  avatar: {
    width: 72, height: 72, borderRadius: 36, backgroundColor: '#2E5AAC',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: '700' },
  name: { fontSize: 18, fontWeight: '700' },
  username: { fontSize: 13, color: '#777', marginBottom: 8 },
  roleBadge: { backgroundColor: '#E7EEFB', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 4 },
  roleBadgeText: { color: '#2E5AAC', fontSize: 12, fontWeight: '600' },
  faculty: { fontSize: 12, color: '#888', marginTop: 6 },
  sectionTitle: { fontSize: 14, fontWeight: '700', marginBottom: 10, marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 16 },
  accessRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  accessText: { fontSize: 13, color: '#333', flex: 1 },
  accessTextOff: { color: '#999', textDecorationLine: 'line-through' },
  divider: { height: 1, backgroundColor: '#EEE', marginVertical: 8 },
  quotaText: { fontSize: 12, color: '#666' },
  subStatus: { fontSize: 13, color: '#333', marginBottom: 10 },
  subButton: { backgroundColor: '#2E5AAC', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  subButtonText: { color: '#fff', fontWeight: '600', fontSize: 13 },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    backgroundColor: '#FCE2E2', borderRadius: 10, padding: 14, marginTop: 8,
  },
  logoutText: { color: '#C0392B', fontWeight: '600' },
  buildTag: { textAlign: 'center', fontSize: 10, color: '#BBB', marginTop: 16 },
});
