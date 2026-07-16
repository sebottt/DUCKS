import { createClient } from '@supabase/supabase-js';

// Vercel inyectará aquí de forma ultra segura las variables de entorno que guardaste en su panel
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl || '', supabaseKey || '');

// Almacén simple en memoria para rate limiting (best-effort en serverless)
const rateLimit = new Map();

export default async function handler(req, res) {
  // Rate limiting básico basado en IP
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60000; // 1 minuto
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

  // Limpiar IPs antiguas (opcional, para evitar leaks de memoria, aunque Vercel mata la instancia)
  if (rateLimit.size > 1000) rateLimit.clear();

  // Solo permitimos peticiones POST de envío de datos
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  // Utilizar estrictamente los nombres de columna de la base de datos
  const username = req.body.nomb_usua;
  const comentario = req.body.come_usua;

  // Validación de tipos y formato
  if (!username || typeof username !== 'string') {
    return res.status(400).json({ error: 'El nombre de usuario es obligatorio y debe ser texto válido.' });
  }

  const cleanUsername = username.trim().toLowerCase();

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
    // Insertamos los datos en Supabase
    const { data, error } = await supabase
      .from('usuario') 
      .insert([
        { 
          nomb_usua: cleanUsername, 
          come_usua: cleanComentario,
          date_regi: new Date().toISOString()
        }
      ]);

    if (error) {
      // Código de error 23505 = unique_violation (Registro duplicado)
      if (error.code === '23505') {
        return res.status(400).json({ error: '¡Este nickname ya está participando en el sorteo!' });
      }
      throw error;
    }

    return res.status(200).json({ success: true, message: '¡Guardado correctamente!' });
  } catch (error) {
    console.error('Error interno del servidor:', error);
    // No exponer el error real (error.message) al cliente por seguridad
    return res.status(500).json({ error: 'Error interno al procesar la solicitud.' });
  }
}