import { supabase } from '../services/supabaseClient';
import * as FileSystem from 'expo-file-system';
import { decode } from 'base64-arraybuffer';

const STORAGE_BUCKET = 'book-contents';

async function listLocalBooks() {
  const { data, error } = await supabase.from('books').select('*').order('created_at', { ascending: false });
  if (error) throw new Error('Gagal memuat koleksi: ' + error.message);
  return data.map(mapBookRow);
}

async function getLocalBookById(id) {
  const { data, error } = await supabase.from('books').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error('Gagal memuat buku: ' + error.message);
  return data ? mapBookRow(data) : null;
}

async function insertLocalBook(book) {
  const { data, error } = await supabase.from('books').insert(toBookRow(book)).select().single();
  if (error) throw new Error('Gagal menyimpan buku: ' + error.message);
  return mapBookRow(data);
}

async function updateLocalBook(id, changes) {
  const { data, error } = await supabase.from('books').update(toBookRow(changes)).eq('id', id).select().single();
  if (error) throw new Error('Gagal memperbarui buku: ' + error.message);
  return mapBookRow(data);
}

async function deleteLocalBook(id) {
  const { error } = await supabase.from('books').delete().eq('id', id);
  if (error) throw new Error('Gagal menghapus buku: ' + error.message);
  return true;
}

function mapBookRow(row) {
  return {
    id: row.id,
    title: row.title,
    author: row.author,
    isbn: row.isbn,
    subject: row.subject,
    cover: row.cover,
    quota: row.quota,
    borrowedBy: row.borrowed_by,
    loanDays: row.loan_days,
    contentType: row.content_type,
    content: row.content,
    contentUrl: row.content_url,
    contentName: row.content_name,
    source: 'local',
  };
}

function toBookRow(book) {
  const row = {};
  if (book.id !== undefined) row.id = book.id;
  if (book.title !== undefined) row.title = book.title;
  if (book.author !== undefined) row.author = book.author;
  if (book.isbn !== undefined) row.isbn = book.isbn;
  if (book.subject !== undefined) row.subject = book.subject;
  if (book.cover !== undefined) row.cover = book.cover;
  if (book.quota !== undefined) row.quota = book.quota;
  if (book.borrowedBy !== undefined) row.borrowed_by = book.borrowedBy;
  if (book.loanDays !== undefined) row.loan_days = book.loanDays;
  if (book.contentType !== undefined) row.content_type = book.contentType;
  if (book.content !== undefined) row.content = book.content;
  if (book.contentUrl !== undefined) row.content_url = book.contentUrl;
  if (book.contentName !== undefined) row.content_name = book.contentName;
  return row;
}

async function uploadContentFile(bookId, localUri, fileName) {
  const base64 = await FileSystem.readAsStringAsync(localUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const path = `${bookId}/${Date.now()}-${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, decode(base64), { contentType: 'application/pdf', upsert: true });

  if (uploadError) throw new Error('Gagal upload file: ' + uploadError.message);

  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function getOverlayFor(id) {
  const { data, error } = await supabase.from('remote_overlays').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error('Gagal memuat status pinjam: ' + error.message);
  if (!data) return { quota: 3, loanDays: 7, borrowedBy: 0 }; // belum pernah disentuh -> default
  return { quota: data.quota, loanDays: data.loan_days, borrowedBy: data.borrowed_by };
}

async function setOverlayFor(id, values) {
  const current = await getOverlayFor(id);
  const merged = { ...current, ...values };
  const { error } = await supabase.from('remote_overlays').upsert({
    id,
    quota: merged.quota,
    loan_days: merged.loanDays,
    borrowed_by: merged.borrowedBy,
  });
  if (error) throw new Error('Gagal memperbarui status pinjam: ' + error.message);
  return merged;
}

async function getLoansOf(userId) {
  const { data, error } = await supabase.from('loans').select('book_id').eq('user_id', userId);
  if (error) throw new Error('Gagal memuat data pinjaman: ' + error.message);
  return data.map((r) => r.book_id);
}

async function addLoan(userId, bookId) {
  const { error } = await supabase.from('loans').insert({ user_id: userId, book_id: bookId });
  if (error) throw new Error('Gagal mencatat pinjaman: ' + error.message);
}

async function removeLoan(userId, bookId) {
  const { data, error: selectError } = await supabase
    .from('loans')
    .select('id')
    .eq('user_id', userId)
    .eq('book_id', bookId)
    .order('borrowed_at', { ascending: true })
    .limit(1);
  if (selectError) throw new Error('Gagal mencari data pinjaman: ' + selectError.message);
  if (!data || data.length === 0) return;

  const { error } = await supabase.from('loans').delete().eq('id', data[0].id);
  if (error) throw new Error('Gagal menghapus data pinjaman: ' + error.message);
}

export default {
  listLocalBooks,
  getLocalBookById,
  insertLocalBook,
  updateLocalBook,
  deleteLocalBook,
  uploadContentFile,
  getOverlayFor,
  setOverlayFor,
  getLoansOf,
  addLoan,
  removeLoan,
};
