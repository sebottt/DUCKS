import { next, rewrite } from '@vercel/functions';

/**
 * Modo mantenimiento.
 *
 * Se activa poniendo MAINTENANCE_MODE=1 en las variables de entorno del
 * proyecto en Vercel (o en .env.local para probarlo con `vercel dev`).
 * No hace falta tocar codigo ni redesplegar nada mas que el cambio de variable.
 *
 * MAINTENANCE_BYPASS es un secreto opcional que te deja seguir viendo el sitio
 * mientras esta en mantenimiento: entras una vez a /?bypass=<secreto> y queda
 * guardado en una cookie durante 24 h. Sin esto no podrias comprobar el arreglo
 * que estas desplegando, porque tu tambien verias la pantalla.
 */

// El matcher evita que el middleware corra en rutas que deben seguir vivas:
//   - /api        las funciones tienen su propia logica
//   - /assets     el logo de la propia pantalla de mantenimiento
//   - /css, /js   estaticos
//   - maintenance.html  si no, se reescribiria sobre si misma en bucle
export const config = {
  matcher: ['/((?!api|assets|css|js|maintenance\\.html|favicon\\.ico).*)'],
};

const BYPASS_COOKIE = 'ducks_bypass';

export default function middleware(request) {
  if (process.env.MAINTENANCE_MODE !== '1') {
    return next();
  }

  const secret = process.env.MAINTENANCE_BYPASS;

  if (secret) {
    const url = new URL(request.url);

    // Primera entrada con el secreto en la URL: se recuerda en una cookie
    // para no tener que arrastrar el parametro por todo el sitio.
    if (url.searchParams.get('bypass') === secret) {
      return next({
        headers: {
          'Set-Cookie': `${BYPASS_COOKIE}=${secret}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
        },
      });
    }

    // Comparacion sobre la cookie ya parseada, no con includes() sobre la
    // cabecera cruda: `foo=xyz` no debe colar como si fuera `ducks_bypass=xyz`.
    const cookies = (request.headers.get('cookie') || '')
      .split(';')
      .map((c) => c.trim());

    if (cookies.includes(`${BYPASS_COOKIE}=${secret}`)) {
      return next();
    }
  }

  return rewrite(new URL('/maintenance.html', request.url));
}
