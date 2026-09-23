

const BASE_URL = 'https://openlibrary.org';
const COVER_URL = 'https://covers.openlibrary.org/b/id';
const PLACEHOLDER_COVER = 'https://placehold.co/200x280?text=No+Cover';

function mapWork(raw, fallbackGenre) {
  return {
    id: raw.key,                                  
    title: raw.title,
    author: raw.authorName || 'Tidak diketahui',
    isbn: raw.isbn || '-',
    subject: raw.subject || fallbackGenre || 'Umum',
    cover: raw.coverId
      ? `${COVER_URL}/${raw.coverId}-M.jpg`
      : PLACEHOLDER_COVER,
    source: 'remote',                             
  };
}

async function fetchByGenre(genreKey, limit = 12) {
  try {
    const res = await fetch(`${BASE_URL}/subjects/${genreKey}.json?limit=${limit}`);
    const json = await res.json();
    const works = json.works || [];
    return works.map((w) =>
      mapWork(
        {
          key: w.key,
          title: w.title,
          authorName: w.authors?.[0]?.name,
          coverId: w.cover_id,
        },
        genreKey
      )
    );
  } catch (err) {
    console.warn('Gagal mengambil genre', genreKey, err.message);
    return []; 
  }
}

// ---- Cari buku lintas genre (dipakai fitur search) ----
async function search(query, limit = 20) {
  try {
    const res = await fetch(
      `${BASE_URL}/search.json?q=${encodeURIComponent(query)}&limit=${limit}`
    );
    const json = await res.json();
    const docs = json.docs || [];
    return docs.map((d) =>
      mapWork({
        key: d.key,
        title: d.title,
        authorName: d.author_name?.[0],
        coverId: d.cover_i,
        isbn: d.isbn?.[0],
        subject: d.subject?.[0],
      })
    );
  } catch (err) {
    console.warn('Gagal mencari buku', err.message);
    return [];
  }
}

async function getById(id) {
  try {
    const res = await fetch(`${BASE_URL}${id}.json`);
    const raw = await res.json();
    return mapWork({
      key: id,
      title: raw.title,
      authorName: raw.authors?.[0]?.name, 
      coverId: raw.covers?.[0],
      subject: raw.subjects?.[0],
    });
  } catch (err) {
    console.warn('Gagal mengambil detail buku', err.message);
    return null;
  }
}

export default { fetchByGenre, search, getById };
