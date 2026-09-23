import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

const PLANS = [
  { id: 'p1', name: 'Harian', price: 'Rp 5.000', duration: '1 hari', perks: ['Akses e-book', 'Maks. 2 pinjam'] },
  { id: 'p2', name: 'Bulanan', price: 'Rp 49.000', duration: '30 hari', perks: ['Akses e-book', 'Akses E-Journal', 'Maks. 5 pinjam'], popular: true },
  { id: 'p3', name: 'Tahunan', price: 'Rp 399.000', duration: '365 hari', perks: ['Semua fitur Bulanan', 'Prioritas antrian kuota'] },
];

export default function SubscriptionScreen({ navigation }) {
  const { user, activateSubscription } = useAuth();
  const [processing, setProcessing] = useState(null);

  const handleSubscribe = async (plan) => {
    setProcessing(plan.id);
    try {
      // Simulasi proses pembayaran
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await activateSubscription();
      Alert.alert(
        'Pembayaran Berhasil',
        `Paket ${plan.name} aktif. Akses Anda sudah dibuka.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      Alert.alert('Gagal', err.message);
    } finally {
      setProcessing(null);
    }
  };

  if (user?.subscriptionActive) {
    return (
      <View style={styles.center}>
        <Ionicons name="checkmark-circle" size={56} color="#1E8E3E" />
        <Text style={styles.activeTitle}>Paket Akses Aktif</Text>
        <Text style={styles.activeText}>Anda sudah bisa mengakses seluruh koleksi.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 16 }}>
      <Text style={styles.header}>Pilih Paket Akses</Text>
      <Text style={styles.subheader}>
        Koleksi perpustakaan gratis untuk civitas akademika. Sebagai pengguna umum,
        Anda perlu berlangganan untuk membuka akses penuh.
      </Text>

      {PLANS.map((plan) => (
        <View key={plan.id} style={[styles.planCard, plan.popular && styles.planPopular]}>
          {plan.popular && (
            <View style={styles.popularBadge}>
              <Text style={styles.popularText}>PALING DIPILIH</Text>
            </View>
          )}
          <Text style={styles.planName}>{plan.name}</Text>
          <Text style={styles.planPrice}>{plan.price}</Text>
          <Text style={styles.planDuration}>berlaku {plan.duration}</Text>

          {plan.perks.map((perk) => (
            <View key={perk} style={styles.perkRow}>
              <Ionicons name="checkmark" size={15} color="#1E8E3E" />
              <Text style={styles.perkText}>{perk}</Text>
            </View>
          ))}

          <TouchableOpacity
            style={[styles.buyBtn, processing === plan.id && styles.buyBtnDisabled]}
            onPress={() => handleSubscribe(plan)}
            disabled={processing !== null}
          >
            <Text style={styles.buyBtnText}>
              {processing === plan.id ? 'Memproses...' : 'Pilih Paket'}
            </Text>
          </TouchableOpacity>
        </View>
      ))}

      <Text style={styles.disclaimer}>
        Pembayaran pada prototipe ini masih simulasi. Integrasi payment gateway
        (Midtrans/Xendit) dilakukan pada tahap pengembangan berikutnya.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F4F6FA' },
  activeTitle: { fontSize: 18, fontWeight: '700', marginTop: 12 },
  activeText: { fontSize: 13, color: '#666', marginTop: 6, textAlign: 'center' },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 6 },
  subheader: { fontSize: 13, color: '#666', lineHeight: 19, marginBottom: 20 },
  planCard: { backgroundColor: '#fff', borderRadius: 12, padding: 18, marginBottom: 14, borderWidth: 1, borderColor: '#E8E8E8' },
  planPopular: { borderColor: '#2E5AAC', borderWidth: 2 },
  popularBadge: { position: 'absolute', top: -1, right: 12, backgroundColor: '#2E5AAC', paddingHorizontal: 10, paddingVertical: 3, borderBottomLeftRadius: 8, borderBottomRightRadius: 8 },
  popularText: { color: '#fff', fontSize: 9, fontWeight: '700' },
  planName: { fontSize: 15, fontWeight: '700', color: '#333' },
  planPrice: { fontSize: 24, fontWeight: '700', color: '#2E5AAC', marginTop: 4 },
  planDuration: { fontSize: 12, color: '#888', marginBottom: 12 },
  perkRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  perkText: { fontSize: 13, color: '#444' },
  buyBtn: { backgroundColor: '#2E5AAC', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 12 },
  buyBtnDisabled: { backgroundColor: '#9AAFD4' },
  buyBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  disclaimer: { fontSize: 11, color: '#999', lineHeight: 16, marginTop: 8, marginBottom: 20 },
});
