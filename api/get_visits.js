import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseKey || '');

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido. Usa GET.' });
  }

  try {
    const { data, error } = await supabase.rpc('get_site_visits');
    if (error) throw error;
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json({ total: data ?? 0 });
  } catch (error) {
    console.error('Error al leer visitas:', error);
    return res.status(500).json({ error: 'Error interno al procesar la solicitud.' });
  }
}
