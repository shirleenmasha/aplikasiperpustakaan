// src/models/UserModel.js
// ==========================================================
// MODEL akun. Sumber kebenaran (source of truth) sekarang di
// tabel 'users' Supabase -- bukan lagi disimpan di HP.
//
// AsyncStorage TETAP dipakai, tapi HANYA untuk cache sesi login di
// HP ini (biar tidak perlu login ulang tiap buka app). Kalau AsyncStorage
// ini dihapus, data akun tidak hilang -- tinggal login lagi, karena
// datanya sudah aman di Supabase.
// ==========================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../services/supabaseClient';

const SESSION_KEY = '@digital_library/session';

// Cari akun yang cocok dengan username + password di Supabase.
async function findByCredentials(username, password) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('username', username.trim())
    .eq('password', password)
    .maybeSingle();

  if (error) throw new Error('Gagal menghubungi server: ' + error.message);
  return data ? mapUserRow(data) : null;
}

async function updateUser(id, changes) {
  const { data, error } = await supabase
    .from('users')
    .update(toUserRow(changes))
    .eq('id', id)
    .select()
    .single();

  if (error) throw new Error('Gagal memperbarui akun: ' + error.message);
  return mapUserRow(data);
}

// Kolom database snake_case (subscription_active) <-> kode JS camelCase
// (subscriptionActive). Pola yang sama persis dengan BookModel.js.
function mapUserRow(row) {
  return {
    id: row.id,
    username: row.username,
    password: row.password,
    name: row.name,
    role: row.role,
    faculty: row.faculty,
    subscriptionActive: row.subscription_active,
  };
}

function toUserRow(user) {
  const row = {};
  if (user.username !== undefined) row.username = user.username;
  if (user.password !== undefined) row.password = user.password;
  if (user.name !== undefined) row.name = user.name;
  if (user.role !== undefined) row.role = user.role;
  if (user.faculty !== undefined) row.faculty = user.faculty;
  if (user.subscriptionActive !== undefined) row.subscription_active = user.subscriptionActive;
  return row;
}

// ---------- Sesi login (cache lokal di HP, bukan sumber kebenaran) ----------
async function saveSession(user) {
  const { password, ...safeUser } = user; // password tidak ikut disimpan ke HP
  await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(safeUser));
  return safeUser;
}

async function getSession() {
  const raw = await AsyncStorage.getItem(SESSION_KEY);
  return raw ? JSON.parse(raw) : null;
}

async function clearSession() {
  await AsyncStorage.removeItem(SESSION_KEY);
}

export default {
  findByCredentials,
  updateUser,
  saveSession,
  getSession,
  clearSession,
};
