import { supabase } from '../services/supabaseClient';

async function getAll() {
  const { data, error } = await supabase.from('journals').select('*').order('year', { ascending: false });
  if (error) throw new Error('Gagal memuat jurnal: ' + error.message);
  return data;
}

export default { getAll };
