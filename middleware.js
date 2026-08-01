import { next, rewrite } from '@vercel/functions';

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

    
    
    if (url.searchParams.get('bypass') === secret) {
      return next({
        headers: {
          'Set-Cookie': `${BYPASS_COOKIE}=${secret}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=86400`,
        },
      });
    }

    
    
    const cookies = (request.headers.get('cookie') || '')
      .split(';')
      .map((c) => c.trim());

    if (cookies.includes(`${BYPASS_COOKIE}=${secret}`)) {
      return next();
    }
  }

  return rewrite(new URL('/maintenance.html', request.url));
}
