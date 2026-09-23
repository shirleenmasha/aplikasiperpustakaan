import React, { useEffect, useMemo, useState } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import BookController from '../../controllers/BookController';
import { useAuth } from '../../context/AuthContext';
import { can } from '../../constants/roles';


const CHARS_PER_PAGE = 700;

function paginateText(text) {
  if (!text) return ['(Konten kosong)'];
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const pages = [];
  let current = '';

  for (const para of paragraphs) {
    if (!current) {
      current = para;
    } else if (current.length + 2 + para.length <= CHARS_PER_PAGE) {
      current += '\n\n' + para;
    } else {
      pages.push(current);
      current = para;
    }
  }
  if (current) pages.push(current);
  return pages.length ? pages : ['(Konten kosong)'];
}

export default function BookReaderScreen({ route, navigation }) {
  const { user } = useAuth();
  const { bookId } = route.params;
  const isAdmin = can(user, 'manageBooks');

  const [book, setBook] = useState(null);
  const [canRead, setCanRead] = useState(false);
  const [checking, setChecking] = useState(true);
  const [pageIndex, setPageIndex] = useState(0);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        setChecking(true);
        const data = await BookController.getById(bookId);
        setBook(data);

        if (isAdmin) {
          setCanRead(true);
        } else {
          const loans = await BookController.getActiveLoans(user);
          setCanRead(loans.includes(bookId));
        }
        setChecking(false);
      })();
    }, [bookId])
  );

  const pages = useMemo(() => {
    if (book?.contentType === 'text') return paginateText(book.content);
    return [];
  }, [book?.content, book?.contentType]);

  const goNext = () => setPageIndex((p) => Math.min(p + 1, pages.length - 1));
  const goPrev = () => setPageIndex((p) => Math.max(p - 1, 0));

  const handleReturn = () => {
    Alert.alert('Kembalikan Buku', 'Selesai membaca dan kembalikan buku ini?', [
      { text: 'Batal', style: 'cancel' },
      {
        text: 'Kembalikan',
        onPress: async () => {
          try {
            await BookController.returnBook(bookId, user);
            navigation.goBack();
          } catch (err) {
            Alert.alert('Gagal', err.message);
          }
        },
      },
    ]);
  };

  if (checking) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#2E5AAC" />
      </View>
    );
  }

  if (!canRead) {
    return (
      <View style={styles.center}>
        <Ionicons name="lock-closed" size={40} color="#B0B0B0" />
        <Text style={styles.lockedText}>Anda belum meminjam buku ini.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Kembali</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (book?.contentType === 'pdf') {
    const handleOpenPdf = async () => {
      try {
        await Linking.openURL(book.contentUrl);
      } catch (err) {
        Alert.alert('Gagal Membuka File', 'Tidak ada aplikasi pembaca PDF yang terpasang di HP ini.');
      }
    };
    return (
      <View style={styles.center}>
        <Ionicons name="document-text" size={48} color="#2E5AAC" />
        <Text style={styles.pdfInfoText}>{book.contentName || 'File PDF'}</Text>
        <TouchableOpacity style={styles.pdfOpenBtn} onPress={handleOpenPdf}>
          <Text style={styles.pdfOpenBtnText}>Buka File PDF</Text>
        </TouchableOpacity>
        {!isAdmin && (
          <TouchableOpacity style={{ marginTop: 16 }} onPress={handleReturn}>
            <Text style={{ color: '#C0392B', fontWeight: '600', fontSize: 13 }}>Kembalikan buku ini</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  }

  if (!book || book.contentType === 'none') {
    return (
      <View style={styles.center}>
        <Text style={styles.lockedText}>Konten belum tersedia untuk buku ini.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.bookTitle} numberOfLines={1}>{book.title}</Text>
        <Text style={styles.pageIndicator}>Halaman {pageIndex + 1} dari {pages.length}</Text>
      </View>

      {}
      <View style={styles.pageArea}>
        <TouchableOpacity style={styles.tapZoneLeft} onPress={goPrev} activeOpacity={1} />
        <TouchableOpacity style={styles.tapZoneRight} onPress={goNext} activeOpacity={1} />
        <Text style={styles.pageText}>{pages[pageIndex]}</Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.navBtn, pageIndex === 0 && styles.navBtnDisabled]}
          onPress={goPrev}
          disabled={pageIndex === 0}
        >
          <Ionicons name="chevron-back" size={20} color={pageIndex === 0 ? '#BBB' : '#2E5AAC'} />
          <Text style={[styles.navBtnText, pageIndex === 0 && styles.navBtnTextDisabled]}>Sebelumnya</Text>
        </TouchableOpacity>

        {!isAdmin && (
          <TouchableOpacity style={styles.returnBtn} onPress={handleReturn}>
            <Text style={styles.returnBtnText}>Kembalikan</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.navBtn, pageIndex === pages.length - 1 && styles.navBtnDisabled]}
          onPress={goNext}
          disabled={pageIndex === pages.length - 1}
        >
          <Text style={[styles.navBtnText, pageIndex === pages.length - 1 && styles.navBtnTextDisabled]}>Berikutnya</Text>
          <Ionicons name="chevron-forward" size={20} color={pageIndex === pages.length - 1 ? '#BBB' : '#2E5AAC'} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFaF3' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FDFaF3', padding: 24 },
  lockedText: { fontSize: 13, color: '#777', textAlign: 'center', marginTop: 12, marginBottom: 20 },
  backBtn: { backgroundColor: '#2E5AAC', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 28 },
  backBtnText: { color: '#fff', fontWeight: '600' },
  pdfInfoText: { fontSize: 14, color: '#444', marginTop: 12, marginBottom: 20, textAlign: 'center' },
  pdfOpenBtn: { backgroundColor: '#2E5AAC', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  pdfOpenBtnText: { color: '#fff', fontWeight: '600', fontSize: 13 },

  header: {
    paddingTop: 16, paddingHorizontal: 20, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: '#EAE4D3',
  },
  bookTitle: { fontSize: 15, fontWeight: '700', color: '#2b2b2b' },
  pageIndicator: { fontSize: 12, color: '#999', marginTop: 2 },

  pageArea: { flex: 1, paddingHorizontal: 28, paddingVertical: 28, justifyContent: 'center' },
  pageText: { fontSize: 16, lineHeight: 27, color: '#2b2b2b' },
  // Zona transparan buat tap kiri/kanan, di belakang teks (teks tetap kebaca,
  // tap di area kosong kiri-kanan yang memicu ganti halaman).
  tapZoneLeft: { position: 'absolute', left: 0, top: 0, bottom: 0, width: '30%', zIndex: 1 },
  tapZoneRight: { position: 'absolute', right: 0, top: 0, bottom: 0, width: '30%', zIndex: 1 },

  footer: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderTopWidth: 1, borderTopColor: '#EAE4D3',
  },
  navBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, paddingVertical: 8, paddingHorizontal: 10 },
  navBtnDisabled: {},
  navBtnText: { color: '#2E5AAC', fontWeight: '600', fontSize: 13 },
  navBtnTextDisabled: { color: '#BBB' },
  returnBtn: { backgroundColor: '#FCE2E2', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 16 },
  returnBtnText: { color: '#C0392B', fontWeight: '600', fontSize: 12 },
});
