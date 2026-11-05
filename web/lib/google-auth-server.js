import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export function getWebOrigin(request) {
  // Standalone Next.js may use 0.0.0.0 as request.url inside Docker.
  // Prefer an explicitly configured public origin; otherwise use the HTTP Host.
  const configured = process.env.WEB_ORIGIN;
  if (configured) return new URL(configured).origin;
  const url = new URL(request.url);
  const host = request.headers.get('host');
  return host ? new URL(`${url.protocol}//${host}`).origin : url.origin;
}

export function isSameOrigin(request) {
  try {
    return request.headers.get('origin') === getWebOrigin(request);
  } catch {
    return false;
  }
}

export async function createGoogleServerClient(request) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error('Chưa cấu hình SUPABASE_URL và public key ở server web.');
  const store = await cookies();
  return createServerClient(url, key, {
    cookieOptions: {
      name: 'danago-google-auth',
      httpOnly: true,
      secure: new URL(getWebOrigin(request)).protocol === 'https:',
      sameSite: 'lax',
      path: '/',
      maxAge: 600,
    },
    cookies: {
      getAll: () => store.getAll(),
      setAll: (values) => {
        for (const { name, value, options } of values) store.set(name, value, options);
      },
    },
  });
}

export async function clearGoogleCookies() {
  const store = await cookies();
  for (const { name } of store.getAll()) {
    if (name.startsWith('danago-google-auth')) store.delete(name);
  }
}

export function authJson(body, status = 200) {
  return Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });
}
