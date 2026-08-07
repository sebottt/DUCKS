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
//   - maintenance  si no, se reescribiria sobre si misma en bucle.
//     Con cleanUrls:true la pagina se sirve SIN extension, asi que hay que
//     excluir tanto /maintenance como /maintenance.html (esta ultima solo
//     recibe el 308 de cleanUrls, pero la dejamos fuera por si acaso).
export const config = {
  matcher: ['/((?!api|assets|css|js|maintenance|favicon\\.ico).*)'],
};

// OJO: con "cleanUrls": true en vercel.json, el build mapea maintenance.html
// al path "maintenance" (se ve en .vercel/output/config.json -> overrides).
// Reescribir a "/maintenance.html" apunta a una ruta que NO existe y devuelve
// 404 en todas las rutas interceptadas. Tiene que ser sin extension.
// OJO: /maintenance lleva Cache-Control: no-store en vercel.json, y tiene que
// seguir llevandolo. Sin eso el CDN cachea la respuesta de este rewrite y la
// sirve para cualquier ruta sin volver a ejecutar este middleware: el enlace
// ?bypass= deja de funcionar, y al apagar el mantenimiento la gente sigue
// viendo la pantalla hasta que expire la copia.
const MAINTENANCE_PATH = '/maintenance';

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

  return rewrite(new URL(MAINTENANCE_PATH, request.url));
}
