import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { File } from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker';
import BookController from '../../controllers/BookController';
import { GENRES } from '../../constants/genres';
import { useAuth } from '../../context/AuthContext';

export default function BookFormScreen({ route, navigation }) {
  const { user } = useAuth();
  const bookId = route.params?.bookId;
  const isEdit = !!bookId;

  const [form, setForm] = useState({
    title: '', author: '', isbn: '', subject: GENRES[0].key, quota: '1', loanDays: '7',
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

 
  const [contentMode, setContentMode] = useState('text'); 
  const [contentText, setContentText] = useState('');
  const [pickedFile, setPickedFile] = useState(null); 

  useEffect(() => {
    if (isEdit) {
      (async () => {
        const book = await BookController.getById(bookId);
        if (book) {
          setForm({
            title: book.title,
            author: book.author,
            isbn: book.isbn,
            subject: book.subject,
            quota: String(book.quota),
            loanDays: String(book.loanDays),
          });
    
          if (book.contentType === 'text') {
            setContentMode('text');
            setContentText(book.content || '');
          } else if (book.contentType === 'pdf') {
            setContentMode('pdf');
            setPickedFile({ uri: null, name: book.contentName, alreadyUploaded: true });
          }
        }
        setLoading(false);
      })();
    }
  }, [bookId]);

  const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      setPickedFile({ uri: asset.uri, name: asset.name, alreadyUploaded: false });
    } catch (err) {
      Alert.alert('Gagal Memilih File', err.message);
    }
  };

  const handleSubmit = async () => {
    setSaving(true);
    try {
      let savedBook;
      if (isEdit) {
        savedBook = await BookController.update(bookId, {
          title: form.title,
          author: form.author,
          isbn: form.isbn,
          subject: form.subject,
          quota: Number(form.quota),
          loanDays: Number(form.loanDays),
        }, user);
      } else {
        savedBook = await BookController.create(form, user);
      }

      if (contentMode === 'text' && contentText.trim()) {
        await BookController.setContent(
          savedBook.id,
          { contentType: 'text', content: contentText },
          user
        );
      } else if (contentMode === 'pdf' && pickedFile && !pickedFile.alreadyUploaded) {
        await BookController.setContent(
          savedBook.id,
          { contentType: 'pdf', localFileUri: pickedFile.uri, contentName: pickedFile.name },
          user
        );
      }

      navigation.goBack(); 
    } catch (err) {
      Alert.alert('Gagal Menyimpan', err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <View style={styles.center}><Text>Memuat data...</Text></View>;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ padding: 20 }}>
      <Text style={styles.header}>{isEdit ? 'Edit Buku' : 'Tambah Buku Baru'}</Text>

      <Text style={styles.label}>Judul</Text>
      <TextInput style={styles.input} value={form.title} onChangeText={(v) => handleChange('title', v)} />

      <Text style={styles.label}>Pengarang</Text>
      <TextInput style={styles.input} value={form.author} onChangeText={(v) => handleChange('author', v)} />

      <Text style={styles.label}>ISBN</Text>
      <TextInput style={styles.input} value={form.isbn} onChangeText={(v) => handleChange('isbn', v)} />

      <Text style={styles.label}>Genre</Text>
      <View style={styles.chipRow}>
        {GENRES.map((g) => (
          <TouchableOpacity
            key={g.key}
            style={[styles.chip, form.subject === g.key && styles.chipActive]}
            onPress={() => handleChange('subject', g.key)}
          >
            <Text style={[styles.chipText, form.subject === g.key && styles.chipTextActive]}>
              {g.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Kuota Peminjaman</Text>
      <TextInput style={styles.input} value={form.quota} onChangeText={(v) => handleChange('quota', v)} keyboardType="numeric" />

      <Text style={styles.label}>Batas Waktu Akses (hari)</Text>
      <TextInput style={styles.input} value={form.loanDays} onChangeText={(v) => handleChange('loanDays', v)} keyboardType="numeric" />

      {}
      <View style={styles.divider} />
      <Text style={styles.sectionHeader}>Isi Konten E-Book (opsional)</Text>
      <Text style={styles.sectionHint}>
        Bisa diisi sekarang atau nanti lewat tombol Edit. Mahasiswa/umum baru
        bisa membaca ini setelah meminjam buku.
      </Text>

      <View style={styles.chipRow}>
        <TouchableOpacity
          style={[styles.tab, contentMode === 'text' && styles.chipActive]}
          onPress={() => setContentMode('text')}
        >
          <Text style={[styles.chipText, contentMode === 'text' && styles.chipTextActive]}>Tulis Teks</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, contentMode === 'pdf' && styles.chipActive]}
          onPress={() => setContentMode('pdf')}
        >
          <Text style={[styles.chipText, contentMode === 'pdf' && styles.chipTextActive]}>Upload PDF</Text>
        </TouchableOpacity>
      </View>

      {contentMode === 'text' ? (
        <TextInput
          style={styles.textarea}
          value={contentText}
          onChangeText={setContentText}
          placeholder="Tempel atau ketik isi buku di sini..."
          multiline
          textAlignVertical="top"
        />
      ) : (
        <>
          <TouchableOpacity style={styles.pickBtn} onPress={handlePickFile}>
            <Ionicons name="document-attach" size={20} color="#2E5AAC" />
            <Text style={styles.pickBtnText}>
              {pickedFile && !pickedFile.alreadyUploaded ? 'Ganti File' : 'Pilih File PDF dari Perangkat'}
            </Text>
          </TouchableOpacity>
          {pickedFile && (
            <View style={styles.fileInfo}>
              <Ionicons name="document-text" size={16} color="#555" />
              <Text style={styles.fileName} numberOfLines={1}>
                {pickedFile.name} {pickedFile.alreadyUploaded ? '(sudah tersimpan)' : '(baru dipilih)'}
              </Text>
            </View>
          )}
        </>
      )}

      <TouchableOpacity
        style={[styles.button, saving && styles.buttonDisabled]}
        onPress={handleSubmit}
        disabled={saving}
      >
        <Text style={styles.buttonText}>
          {saving ? 'Menyimpan...' : isEdit ? 'Simpan Perubahan' : 'Tambah Buku'}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F6FA' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 16 },
  label: { fontSize: 13, color: '#555', marginBottom: 4, marginTop: 10 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 12, borderWidth: 1, borderColor: '#E0E0E0' },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { paddingVertical: 6, paddingHorizontal: 14, borderRadius: 16, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0' },
  tab: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#fff', borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center' },
  chipActive: { backgroundColor: '#2E5AAC', borderColor: '#2E5AAC' },
  chipText: { fontSize: 13, color: '#555' },
  chipTextActive: { color: '#fff', fontWeight: '600' },
  divider: { height: 1, backgroundColor: '#E0E0E0', marginTop: 24, marginBottom: 16 },
  sectionHeader: { fontSize: 15, fontWeight: '700', color: '#333', marginBottom: 4 },
  sectionHint: { fontSize: 12, color: '#888', marginBottom: 12, lineHeight: 17 },
  textarea: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#E0E0E0',
    minHeight: 160, fontSize: 13, lineHeight: 20, marginTop: 4,
  },
  pickBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff',
    borderRadius: 10, borderWidth: 1, borderColor: '#2E5AAC', borderStyle: 'dashed',
    padding: 16, justifyContent: 'center', marginTop: 4,
  },
  pickBtnText: { color: '#2E5AAC', fontWeight: '600', fontSize: 13 },
  fileInfo: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 10, backgroundColor: '#fff', borderRadius: 8, padding: 12 },
  fileName: { flex: 1, fontSize: 12, color: '#444' },
  button: { backgroundColor: '#2E5AAC', borderRadius: 10, padding: 15, marginTop: 24 },
  buttonDisabled: { backgroundColor: '#9AAFD4' },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 15 },
});
