import React, { useState } from 'react';
import {
  View, Text, Image, TouchableOpacity, StyleSheet, Alert, ScrollView,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import BookController from '../../controllers/BookController';
import { useAuth } from '../../context/AuthContext';
import { can, ROLES } from '../../constants/roles';

export default function BookDetailScreen({ route, navigation }) {
  const { user } = useAuth();
  const isAdmin = can(user, 'manageBooks');
  const { bookId } = route.params;
  const [book, setBook] = useState(null);
  const [isBorrowedByMe, setIsBorrowedByMe] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    const data = await BookController.getById(bookId);
    setBook(data);
    if (!isAdmin) {
      const loans = await BookController.getActiveLoans(user);
      setIsBorrowedByMe(loans.includes(bookId));
    }
    setLoading(false);
  };

  useFocusEffect(
    React.useCallback(() => { loadData(); }, [bookId])
  );

  if (loading || !book) return <View style={styles.center}><Text>Memuat...</Text></View>;

  const isAvailable = book.borrowedBy < book.quota;
  const isLocal = book.source === 'local';
  const needsSubscription = user?.role === ROLES.EKSTERNAL && !user?.subscriptionActive;
  const hasContent = book.contentType && book.contentType !== 'none';

  const handleBorrow = async () => {
    try {
      await BookController.borrow(book.id, user);
      // Setelah berhasil pinjam, langsung buka halaman baca -- tidak ada
      // lagi jeda timer, user langsung bisa masuk membaca.
      navigation.navigate('BookReader', { bookId: book.id });
    } catch (err) {
      Alert.alert('Gagal Pinjam', err.message);
    }
  };

  const handleReturn = () => {
    Alert.alert('Kembalikan Buku', `Kembalikan "${book.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Kembalikan',
        onPress: async () => {
          try {
            await BookController.returnBook(book.id, user);
            await loadData();
          } catch (err) {
            Alert.alert('Gagal', err.message);
          }
        },
      },
    ]);
  };

  const handleDelete = () => {
    Alert.alert('Hapus Buku', `Yakin hapus "${book.title}"?`, [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Hapus', style: 'destructive',
        onPress: async () => {
          try {
            await BookController.remove(book.id, user);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Gagal', err.message);
          }
        },
      },
    ]);
  };

  return (
    <ScrollView style={styles.scrollContainer} contentContainerStyle={styles.container}>
      <Image source={{ uri: book.cover }} style={styles.cover} />
      <Text style={styles.title}>{book.title}</Text>
      <Text style={styles.author}>{book.author}</Text>

      <View style={[styles.sourceBadge, { backgroundColor: isLocal ? '#DFF7E2' : '#E7EEFB' }]}>
        <Text style={{ color: isLocal ? '#1E8E3E' : '#2E5AAC', fontSize: 12 }}>
          {isLocal ? 'Koleksi Kampus' : 'Katalog Open Library'}
        </Text>
      </View>

      <View style={styles.metaBox}>
        <Text style={styles.metaLine}>ISBN: {book.isbn}</Text>
        <Text style={styles.metaLine}>Subjek/Genre: {book.subject}</Text>
        <Text style={styles.metaLine}>Kuota: {book.borrowedBy}/{book.quota} dipinjam</Text>
        <Text style={styles.metaLine}>Batas waktu akses: {book.loanDays} hari</Text>
      </View>

      {!isLocal && (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            Buku dari katalog eksternal belum memiliki konten yang bisa dibaca
            langsung di aplikasi ini — hanya metadata dari Open Library.
          </Text>
        </View>
      )}

      {isLocal && !hasContent && (
        <View style={styles.noticeBox}>
          <Text style={styles.noticeText}>
            {isAdmin
              ? 'Belum ada konten. Tekan "Edit / Ubah Konten" di bawah untuk menambahkan.'
              : 'Konten belum diunggah oleh pengurus perpustakaan.'}
          </Text>
        </View>
      )}

      {/* Admin: pratinjau konten kapan saja, tanpa perlu pinjam */}
      {isAdmin && isLocal && hasContent && (
        <TouchableOpacity
          style={styles.readBtn}
          onPress={() => navigation.navigate('BookReader', { bookId: book.id })}
        >
          <Text style={styles.readBtnText}>👁 Pratinjau Konten</Text>
        </TouchableOpacity>
      )}

      {/* Non-admin yang SUDAH meminjam: langsung bisa baca & kembalikan kapan saja */}
      {!isAdmin && isBorrowedByMe && hasContent && (
        <TouchableOpacity
          style={styles.readBtn}
          onPress={() => navigation.navigate('BookReader', { bookId: book.id })}
        >
          <Text style={styles.readBtnText}>📖 Baca E-Book</Text>
        </TouchableOpacity>
      )}
      {!isAdmin && isBorrowedByMe && (
        <TouchableOpacity style={styles.returnLink} onPress={handleReturn}>
          <Text style={styles.returnLinkText}>Kembalikan buku ini</Text>
        </TouchableOpacity>
      )}

      {/* Non-admin yang BELUM meminjam: tombol pinjam (dengan aturan langganan/kuota) */}
      {!isAdmin && !isBorrowedByMe && (
        needsSubscription ? (
          <View style={styles.lockBox}>
            <Text style={styles.lockText}>Peminjaman e-book hanya untuk pengguna berlangganan.</Text>
            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Langganan')}>
              <Text style={styles.buttonText}>Lihat Paket Akses</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.button, !isAvailable && styles.buttonDisabled]}
            onPress={handleBorrow}
            disabled={!isAvailable}
          >
            <Text style={styles.buttonText}>{isAvailable ? 'Pinjam E-Book' : 'Kuota Penuh'}</Text>
          </TouchableOpacity>
        )
      )}

      {/* Edit (termasuk ubah konten) & Hapus, HANYA untuk Koleksi Kampus & admin */}
      {isAdmin && isLocal && (
        <View style={styles.rowActions}>
          <TouchableOpacity style={styles.smallBtn} onPress={() => navigation.navigate('BookForm', { bookId: book.id })}>
            <Text style={styles.smallBtnText}>Edit / Ubah Konten</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.smallBtn, styles.deleteBtn]} onPress={handleDelete}>
            <Text style={[styles.smallBtnText, { color: '#C0392B' }]}>Hapus</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: { flex: 1, backgroundColor: '#F4F6FA' },
  container: { padding: 20, alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  cover: { width: 120, height: 168, borderRadius: 8, marginBottom: 16, backgroundColor: '#eee' },
  title: { fontSize: 18, fontWeight: '700', textAlign: 'center' },
  author: { fontSize: 14, color: '#666' },
  sourceBadge: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 8, marginBottom: 12 },
  metaBox: { backgroundColor: '#fff', borderRadius: 10, padding: 14, width: '100%', marginBottom: 16 },
  metaLine: { fontSize: 13, color: '#444', marginBottom: 4 },
  noticeBox: {
    backgroundColor: '#FFF9E6', borderRadius: 10, padding: 14, width: '100%',
    borderWidth: 1, borderColor: '#F0DFA0', marginBottom: 16,
  },
  noticeText: { fontSize: 12, color: '#8A7B3F', lineHeight: 18 },
  readBtn: {
    backgroundColor: '#2E5AAC', borderRadius: 10, paddingVertical: 14, width: '100%',
    alignItems: 'center', marginBottom: 10,
  },
  readBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  returnLink: { marginBottom: 16 },
  returnLinkText: { color: '#C0392B', fontSize: 13, fontWeight: '600' },
  button: { backgroundColor: '#2E5AAC', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 40 },
  buttonDisabled: { backgroundColor: '#B0B0B0' },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  lockBox: { alignItems: 'center', width: '100%' },
  lockText: { fontSize: 13, color: '#777', textAlign: 'center', marginBottom: 12, lineHeight: 19 },
  rowActions: { flexDirection: 'row', marginTop: 20, gap: 10, flexWrap: 'wrap', justifyContent: 'center' },
  smallBtn: { paddingVertical: 8, paddingHorizontal: 16, borderRadius: 8, backgroundColor: '#E7EEFB' },
  deleteBtn: { backgroundColor: '#FCE2E2' },
  smallBtnText: { color: '#2E5AAC', fontWeight: '600', fontSize: 13 },
});
