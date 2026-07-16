import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseKey || '');

const rateLimit = new Map();

export default async function handler(req, res) {
  
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60000; 
  const maxRequests = 5;

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    const data = rateLimit.get(ip);
    if (now > data.resetTime) {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    } else if (data.count >= maxRequests) {
      return res.status(429).json({ error: 'Demasiadas peticiones. Por favor, intenta de nuevo más tarde.' });
    } else {
      data.count++;
    }
  }

  
  if (rateLimit.size > 1000) rateLimit.clear();

  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  
  const username = req.body.nomb_usua;
  const comentario = req.body.come_usua;

  
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'El nombre de usuario es obligatorio y debe ser texto válido.' });
  }

  const cleanUsername = username.trim();

  if (!cleanUsername.startsWith('@')) {
    return res.status(400).json({ error: 'El nombre de usuario debe comenzar con @' });
  }

  if (cleanUsername.length > 60) {
    return res.status(400).json({ error: 'El nombre de usuario no puede exceder 60 caracteres' });
  }

  let cleanComentario = null;
  if (comentario !== undefined && comentario !== null) {
    if (typeof comentario !== 'string') {
      return res.status(400).json({ error: 'El comentario debe ser texto válido.' });
    }
    cleanComentario = comentario.trim();
    if (cleanComentario.length > 90) {
      return res.status(400).json({ error: 'El comentario no puede exceder 90 caracteres' });
    }
  }

  try {
    
    const { data, error } = await supabase
      .from('usuario') 
      .insert([
        { 
          nomb_usua: cleanUsername, 
          come_usua: cleanComentario,
          date_regi: new Date().toISOString()
        }
      ]);

    if (error) throw error;

    return res.status(200).json({ success: true, message: '¡Guardado correctamente!' });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    
    return res.status(500).json({ error: 'Error interno al procesar la solicitud.' });
  }
}