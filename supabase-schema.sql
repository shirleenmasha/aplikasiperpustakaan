-- ==========================================================
-- SKEMA DATABASE — Digital Library Universitas (Supabase)
-- ==========================================================
-- CARA PAKAI: copy SELURUH isi file ini, paste ke Supabase Dashboard
-- -> SQL Editor -> New Query -> Run. Detail langkahnya ada di README.md.
--
-- CATATAN KEAMANAN (baca ini, penting):
-- Tabel 'users' di sini menyimpan password APA ADANYA (plaintext) dan
-- policy RLS-nya "allow all" (siapa pun dengan anon key bisa baca/tulis).
-- Ini SENGAJA disederhanakan supaya cocok untuk tugas kuliah/demo dan
-- gampang di-setup. UNTUK PRODUKSI SUNGGUHAN, wajib pakai Supabase Auth
-- (supabase.auth.signUp/signInWithPassword) + password ter-hash otomatis,
-- dan policy RLS yang membatasi row sesuai auth.uid(). Ini dicatat juga
-- di README.
-- ==========================================================

-- ---------- Tabel akun ----------
create table if not exists users (
  id text primary key,
  username text unique not null,
  password text not null,
  name text not null,
  role text not null check (role in ('mahasiswa', 'admin', 'eksternal')),
  faculty text,
  subscription_active boolean not null default false
);

-- ---------- Koleksi Kampus (buku lokal, full CRUD oleh admin) ----------
create table if not exists books (
  id text primary key,
  title text not null,
  author text not null,
  isbn text default '-',
  subject text default 'textbooks',
  cover text,
  quota int not null default 1,
  borrowed_by int not null default 0,
  loan_days int not null default 7,
  content_type text not null default 'none', -- 'none' | 'text' | 'pdf'
  content text,          -- dipakai kalau content_type = 'text'
  content_url text,       -- dipakai kalau content_type = 'pdf' (URL Supabase Storage)
  content_name text,      -- nama file asli
  created_at timestamptz not null default now()
);

-- ---------- Status pinjam untuk buku dari Open Library ----------
-- Judul/pengarang/dsb buku ini TIDAK disimpan di sini (datanya diambil
-- langsung dari Open Library tiap kali dibuka). Yang disimpan cuma
-- status kuota peminjaman, karena itu aturan internal kita.
create table if not exists remote_overlays (
  id text primary key,   -- contoh: "/works/OL45804W"
  quota int not null default 3,
  loan_days int not null default 7,
  borrowed_by int not null default 0
);

-- ---------- Catatan siapa sedang meminjam apa ----------
create table if not exists loans (
  id bigint generated always as identity primary key,
  user_id text not null references users(id) on delete cascade,
  book_id text not null,
  borrowed_at timestamptz not null default now()
);

-- ---------- E-Journal (read-only) ----------
create table if not exists journals (
  id text primary key,
  title text not null,
  authors text,
  publisher text,
  year int,
  abstract text
);

-- ==========================================================
-- ROW LEVEL SECURITY -- diaktifkan tapi dibuat permisif untuk demo
-- ==========================================================
alter table users enable row level security;
alter table books enable row level security;
alter table remote_overlays enable row level security;
alter table loans enable row level security;
alter table journals enable row level security;

drop policy if exists "allow all users" on users;
create policy "allow all users" on users for all using (true) with check (true);

drop policy if exists "allow all books" on books;
create policy "allow all books" on books for all using (true) with check (true);

drop policy if exists "allow all overlays" on remote_overlays;
create policy "allow all overlays" on remote_overlays for all using (true) with check (true);

drop policy if exists "allow all loans" on loans;
create policy "allow all loans" on loans for all using (true) with check (true);

drop policy if exists "allow all journals" on journals;
create policy "allow all journals" on journals for all using (true) with check (true);

-- ==========================================================
-- DATA AWAL (akun demo + 1 buku contoh + jurnal contoh)
-- ==========================================================
insert into users (id, username, password, name, role, faculty, subscription_active) values
  ('u1', '2211001', '123456', 'Rizky Ramadhan', 'mahasiswa', 'Fakultas Teknik', true),
  ('u2', 'admin', 'admin123', 'Ibu Sri Wahyuni', 'admin', 'UPT Perpustakaan', true),
  ('u3', 'umum', 'umum123', 'Agus Setiawan', 'eksternal', 'Umum / Non-Civitas', false)
on conflict (id) do nothing;

insert into books (id, title, author, isbn, subject, cover, quota, borrowed_by, loan_days) values
  ('b1', 'Pengantar Algoritma & Struktur Data (Terbitan Kampus)', 'Dr. Budi Santoso',
   '978-602-1234-56-7', 'computer_science', 'https://picsum.photos/seed/b1/200/280', 3, 1, 7)
on conflict (id) do nothing;

insert into journals (id, title, authors, publisher, year, abstract) values
  ('j1', 'Implementasi Machine Learning pada Sistem Rekomendasi Perpustakaan',
   'A. Pratama, R. Kurnia', 'Jurnal Ilmu Komputer Nasional', 2024,
   'Penelitian ini membahas penerapan algoritma collaborative filtering untuk merekomendasikan buku kepada pengguna perpustakaan digital kampus.'),
  ('j2', 'Analisis Perilaku Mahasiswa dalam Mengakses Referensi Digital',
   'N. Aulia', 'Prosiding Seminar Nasional Teknologi Pendidikan', 2023,
   'Studi ini mengevaluasi pola akses mahasiswa terhadap e-book dan jurnal elektronik selama masa perkuliahan aktif.'),
  ('j3', 'Keamanan Data pada Sistem Single Sign-On Kampus',
   'F. Hidayat, M. Salsabila', 'Jurnal Keamanan Sistem Informasi', 2024,
   'Artikel ini mengkaji celah keamanan umum pada integrasi SSO berbasis SIAKAD dan mitigasinya.')
on conflict (id) do nothing;
