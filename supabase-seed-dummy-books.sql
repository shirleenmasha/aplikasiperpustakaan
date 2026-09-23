-- ==========================================================
-- DATA DUMMY TAMBAHAN — Koleksi Kampus
-- ==========================================================
-- CARA PAKAI: copy SELURUH isi file ini, paste ke Supabase Dashboard
-- -> SQL Editor -> New Query -> Run. AMAN dijalankan meski schema.sql
-- sebelumnya sudah pernah dijalankan (tidak akan menduplikat data lama).
--
-- Isinya 7 buku contoh dengan genre berbeda-beda. 5 di antaranya sudah
-- diisi konten teks (jadi bisa langsung dites: pinjam -> baca), 2 sisanya
-- SENGAJA dibiarkan kosong untuk contoh tampilan "konten belum diunggah".
--
-- CATATAN: seluruh judul & isi teks di bawah ini FIKTIF/karangan sendiri,
-- dibuat khusus untuk demo aplikasi ini -- bukan cuplikan dari buku asli
-- mana pun, supaya tidak melanggar hak cipta.
-- ==========================================================

insert into books (id, title, author, isbn, subject, cover, quota, borrowed_by, loan_days, content_type, content) values

  ('b2', 'Rahasia Semesta Kuantum', 'Dr. Wirawan Prasetya',
   '978-602-2001-01-1', 'science', 'https://picsum.photos/seed/b2/200/280', 3, 0, 7,
   'text',
   'Bab 1: Dunia yang Tak Terlihat

Fisika kuantum sering dianggap sebagai cabang ilmu yang sulit dipahami, padahal prinsip dasarnya sederhana: partikel-partikel penyusun alam semesta tidak selalu berperilaku seperti benda yang kita kenal sehari-hari. Sebuah elektron, misalnya, bisa berada di banyak posisi sekaligus sebelum diukur -- fenomena yang dikenal sebagai superposisi.

Bayangkan sebuah koin yang diputar di udara. Selama masih berputar, koin itu belum "memutuskan" apakah akan jatuh sebagai kepala atau ekor. Barulah setelah koin mendarat dan kita melihatnya, hasilnya pasti. Partikel kuantum bekerja dengan logika yang mirip, meski jauh lebih rumit.

Penemuan ini mengubah cara manusia memandang realitas. Jika dunia mikroskopis penuh ketidakpastian, apakah alam semesta yang kita tinggali benar-benar sepasti yang kita kira? Pertanyaan inilah yang akan terus kita telusuri di bab-bab berikutnya.'),

  ('b3', 'Ekonomi Digital Nusantara', 'Anindita Kusuma, S.E., M.M.',
   '978-602-2001-02-2', 'business', 'https://picsum.photos/seed/b3/200/280', 4, 0, 7,
   'text',
   'Bab 1: Gelombang Transformasi Digital

Sepuluh tahun terakhir menjadi saksi perubahan besar dalam cara masyarakat bertransaksi. Warung kelontong yang dulu hanya melayani pembeli datang langsung, kini banyak yang mulai menerima pembayaran digital dan bahkan berjualan lewat aplikasi.

Perubahan ini tidak lepas dari tiga faktor utama: meluasnya akses internet hingga ke daerah, harga perangkat pintar yang semakin terjangkau, dan kebiasaan baru masyarakat pasca-pandemi yang terbiasa bertransaksi tanpa tatap muka.

Bagi pelaku usaha kecil, era ini membuka peluang sekaligus tantangan. Peluang karena pasar yang bisa dijangkau jauh lebih luas dari sekadar tetangga sekitar toko; tantangan karena persaingan pun datang dari pelaku usaha di kota lain, bahkan negara lain. Bab-bab selanjutnya akan membahas strategi konkret menghadapi kedua sisi ini.'),

  ('b4', 'Catatan Seorang Perantau', 'Damar Anggoro',
   '978-602-2001-03-3', 'fiction', 'https://picsum.photos/seed/b4/200/280', 2, 0, 5,
   'text',
   'Satu

Kereta itu berangkat pukul lima pagi, ketika kabut masih betah menggantung di atas sawah-sawah kampung halamanku. Aku duduk di dekat jendela, menatap rumah-rumah kecil yang perlahan bergerak menjauh, seolah merekalah yang berjalan meninggalkanku, bukan sebaliknya.

Ibu bilang, "Kalau kangen, telepon saja. Jangan pendam sendiri." Aku mengangguk waktu itu, meski tahu betul bahwa rasa rindu tidak semudah itu disampaikan lewat kabel telepon.

Kota tujuanku besar, ramai, dan sama sekali tidak mengenalku. Di sanalah aku akan belajar banyak hal -- bukan cuma dari bangku kuliah, tapi dari setiap wajah asing yang kelak menjadi akrab, dari setiap kegagalan yang mengajarkan lebih banyak daripada keberhasilan.'),

  ('b5', 'Jejak Sejarah Nusantara Kuno', 'Prof. Bagas Mahendra',
   '978-602-2001-04-4', 'history', 'https://picsum.photos/seed/b5/200/280', 3, 0, 7,
   'none', null),

  ('b6', 'Psikologi Belajar Efektif', 'Ratna Puspitasari, M.Psi.',
   '978-602-2001-05-5', 'psychology', 'https://picsum.photos/seed/b6/200/280', 5, 0, 7,
   'text',
   'Bab 1: Mengapa Kita Lupa?

Salah satu keluhan paling umum dari pelajar adalah: "Sudah belajar semalaman, tapi besoknya lupa lagi." Fenomena ini bukan tanda kurang pintar, melainkan cara kerja otak yang memang butuh strategi belajar yang tepat.

Otak manusia cenderung membuang informasi yang dianggap tidak penting atau tidak diulang. Inilah yang disebut kurva lupa -- tanpa pengulangan, sebagian besar informasi baru akan hilang dalam waktu 24 jam pertama.

Kabar baiknya, ada teknik sederhana untuk melawan kurva ini: pengulangan berjarak (spaced repetition). Alih-alih belajar semalaman penuh menjelang ujian, mempelajari materi sedikit demi sedikit dalam beberapa hari terbukti jauh lebih efektif untuk membuat informasi tersimpan dalam ingatan jangka panjang.'),

  ('b7', 'Logika & Filsafat Ilmu', 'Drs. Wisnu Aditama, M.Hum.',
   '978-602-2001-06-6', 'philosophy', 'https://picsum.photos/seed/b7/200/280', 3, 0, 7,
   'none', null),

  ('b8', 'Panduan Pemrograman Web Dasar', 'Fajar Nugraha, S.Kom., M.T.',
   '978-602-2001-07-7', 'textbooks', 'https://picsum.photos/seed/b8/200/280', 4, 0, 7,
   'text',
   'Bab 1: Mengenal HTML, CSS, dan JavaScript

Setiap halaman web yang kita buka sehari-hari dibangun dari tiga bahan dasar. HTML berperan sebagai kerangka -- menentukan ada judul di sini, ada gambar di situ, ada tombol di sana. CSS berperan sebagai "penata rias", mengatur warna, jarak, dan tata letak agar enak dipandang. JavaScript berperan sebagai otak yang menghidupkan interaksi, misalnya saat tombol ditekan atau formulir diisi.

Ketiganya bekerja sama seperti membangun rumah: HTML adalah pondasi dan dindingnya, CSS adalah cat dan dekorasinya, sementara JavaScript adalah listrik yang membuat lampu bisa menyala dan pintu otomatis bisa terbuka.

Bab-bab selanjutnya akan mengajak kamu mempraktikkan ketiganya langsung, dimulai dari membuat halaman paling sederhana hingga formulir yang bisa merespons masukan pengguna.')

on conflict (id) do nothing;
