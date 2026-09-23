import BookModel from '../models/BookModel';
import RemoteBookModel from '../models/RemoteBookModel';
import { can, getRules, ROLES } from '../constants/roles';

function assertCan(user, permission, message) {
  if (!can(user, permission)) {
    throw new Error(message || 'Anda tidak memiliki izin untuk tindakan ini.');
  }
}


async function attachOverlay(remoteBooks) {
  const result = [];
  for (const book of remoteBooks) {
    const overlay = await BookModel.getOverlayFor(book.id);
    result.push({ ...book, ...overlay });
  }
  return result;
}


async function list(options = {}) {
  const { genre, query } = options;
  const localBooks = await BookModel.listLocalBooks();

  let remoteBooksRaw = [];
  if (query && query.trim()) {
    remoteBooksRaw = await RemoteBookModel.search(query.trim());
  } else if (genre) {
    remoteBooksRaw = await RemoteBookModel.fetchByGenre(genre);
  }
  const remoteBooks = await attachOverlay(remoteBooksRaw);

  const q = (query || '').trim().toLowerCase();
  const filteredLocal = localBooks.filter((b) => {
    const matchGenre = genre ? b.subject === genre : true;
    const matchQuery = q
      ? b.title.toLowerCase().includes(q) ||
        b.author.toLowerCase().includes(q) ||
        (b.isbn || '').includes(q)
      : true;
    return matchGenre && matchQuery;
  });

  return { local: filteredLocal, remote: remoteBooks };
}


async function getById(id) {
  const isLocal = id.startsWith('b');
  if (isLocal) {
    return BookModel.getLocalBookById(id);
  }
  const remoteBook = await RemoteBookModel.getById(id);
  if (!remoteBook) return null;
  const overlay = await BookModel.getOverlayFor(id);
  return { ...remoteBook, ...overlay };
}

async function create(bookInput, user) {
  assertCan(user, 'manageBooks', 'Hanya pengurus perpustakaan yang dapat menambah koleksi.');
  if (!bookInput.title || !bookInput.author) {
    throw new Error('Judul dan pengarang wajib diisi.');
  }
  return BookModel.insertLocalBook({
    id: 'b' + Date.now(),
    title: bookInput.title,
    author: bookInput.author,
    isbn: bookInput.isbn || '-',
    subject: bookInput.subject || 'textbooks',
    cover: `https://picsum.photos/seed/${Date.now()}/200/280`,
    quota: Number(bookInput.quota) || 1,
    borrowedBy: 0,
    loanDays: Number(bookInput.loanDays) || 7,
    contentType: 'none',
    content: null,
    contentUrl: null,
    contentName: null,
  });
}

async function _updateLocal(id, changes) {
  return BookModel.updateLocalBook(id, changes);
}

async function update(id, changes, user) {
  assertCan(user, 'manageBooks', 'Hanya pengurus perpustakaan yang dapat mengubah koleksi.');
  if (!id.startsWith('b')) {
    throw new Error('Buku dari katalog eksternal (Open Library) tidak bisa diedit.');
  }
  return _updateLocal(id, changes);
}

async function remove(id, user) {
  assertCan(user, 'manageBooks', 'Hanya pengurus perpustakaan yang dapat menghapus koleksi.');
  if (!id.startsWith('b')) {
    throw new Error('Buku dari katalog eksternal tidak bisa dihapus dari sini.');
  }
  return BookModel.deleteLocalBook(id);
}

async function setContent(id, payload, user) {
  assertCan(user, 'manageBooks', 'Hanya pengurus perpustakaan yang dapat mengunggah konten.');
  if (!id.startsWith('b')) {
    throw new Error('Konten hanya bisa diunggah untuk buku Koleksi Kampus.');
  }

  let contentUrl = payload.contentUrl || null;

  if (payload.localFileUri) {
    contentUrl = await BookModel.uploadContentFile(id, payload.localFileUri, payload.contentName);
  }

  return _updateLocal(id, {
    contentType: payload.contentType,
    content: payload.content || null,
    contentUrl,
    contentName: payload.contentName || null,
  });
}

async function borrow(id, user) {
  assertCan(user, 'borrowBook', 'Akun Anda tidak dapat meminjam e-book.');

  if (user.role === ROLES.EKSTERNAL && !user.subscriptionActive) {
    throw new Error('Silakan berlangganan paket akses terlebih dahulu untuk meminjam.');
  }

  const rules = getRules(user);
  const active = await getActiveLoans(user);
  if (active.length >= rules.maxBorrow) {
    throw new Error(
      `Anda sudah meminjam ${active.length} judul. Batas untuk akun Anda adalah ${rules.maxBorrow}.`
    );
  }

  const book = await getById(id);
  if (!book) throw new Error('Buku tidak ditemukan.');
  if (book.borrowedBy >= book.quota) throw new Error('Kuota peminjaman buku ini penuh.');

  await BookModel.addLoan(user.id, id);
  if (id.startsWith('b')) {
    return _updateLocal(id, { borrowedBy: book.borrowedBy + 1 });
  }
  return BookModel.setOverlayFor(id, { borrowedBy: book.borrowedBy + 1 });
}

async function returnBook(id, user) {
  const book = await getById(id);
  if (!book) throw new Error('Buku tidak ditemukan.');
  const newCount = Math.max(0, book.borrowedBy - 1);

  await BookModel.removeLoan(user.id, id);
  if (id.startsWith('b')) {
    return _updateLocal(id, { borrowedBy: newCount });
  }
  return BookModel.setOverlayFor(id, { borrowedBy: newCount });
}

async function getActiveLoans(user) {
  if (!user) return [];
  return BookModel.getLoansOf(user.id);
}

export default {
  list, getById, create, update, remove, borrow, returnBook, getActiveLoans, setContent,
};
