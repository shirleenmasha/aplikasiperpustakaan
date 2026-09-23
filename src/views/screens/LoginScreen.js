

import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';

export default function LoginScreen() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleLogin = async () => {
    setSubmitting(true);
    try {
      await login(username, password);
    } catch (err) {
      Alert.alert('Login Gagal', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.logo}>📚 Digital Library</Text>
      <Text style={styles.subtitle}>Universitas — Perpustakaan Digital Terpadu</Text>

      <TextInput
        style={styles.input}
        placeholder="NIM / Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        onSubmitEditing={handleLogin}
      />

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>{submitting ? 'Memproses...' : 'Masuk'}</Text>
      </TouchableOpacity>

      <Text style={styles.note}>
        Hak akses Anda ditentukan otomatis berdasarkan akun yang digunakan.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, justifyContent: 'center', padding: 24, backgroundColor: '#F4F6FA' },
  logo: { fontSize: 26, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginBottom: 32 },
  input: {
    backgroundColor: '#fff', borderRadius: 10, padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: '#E0E0E0',
  },
  button: { backgroundColor: '#2E5AAC', borderRadius: 10, padding: 15, marginTop: 8 },
  buttonDisabled: { backgroundColor: '#9AAFD4' },
  buttonText: { color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 15 },
  note: { fontSize: 11, color: '#999', textAlign: 'center', marginTop: 18, lineHeight: 16 },
  demoBox: { marginTop: 24, padding: 14, backgroundColor: '#EEF2F9', borderRadius: 10 },
  demoTitle: { fontSize: 12, fontWeight: '700', color: '#444', marginBottom: 6 },
  demoLine: { fontSize: 12, color: '#666', marginBottom: 2 },
});
