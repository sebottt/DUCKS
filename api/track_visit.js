import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseKey || '');

const rateLimit = new Map();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60000;
  const maxRequests = 10;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    const data = rateLimit.get(ip);
    if (now > data.resetTime) {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    } else if (data.count >= maxRequests) {
      return res.status(429).json({ error: 'Demasiadas peticiones.' });
    } else {
      data.count++;
    }
  }
  if (rateLimit.size > 1000) rateLimit.clear();

  try {
    const { data, error } = await supabase.rpc('increment_site_visits');
    if (error) throw error;
    return res.status(200).json({ total: data });
  } catch (error) {
    console.error('Error al incrementar visitas:', error);
    return res.status(500).json({ error: 'Error interno al procesar la solicitud.' });
  }
}
