import { authJson, clearGoogleCookies, createGoogleServerClient, isSameOrigin } from '@/lib/google-auth-server';
import { cookies } from 'next/headers';
import { getWebOrigin } from '@/lib/google-auth-server';

export async function POST(request) {
  if (!isSameOrigin(request)) return authJson({ error: 'Yêu cầu không hợp lệ.' }, 403);
  let body;
  try {
    body = await request.json();
  } catch {
    return authJson({ error: 'Dữ liệu đăng nhập không hợp lệ.' }, 400);
  }
  if (typeof body?.code !== 'string' || !body.code || body.code.length > 4096) {
    return authJson({ error: 'Mã đăng nhập không hợp lệ.' }, 400);
  }
  try {
    const client = await createGoogleServerClient(request);
    const { data, error } = await client.auth.exchangeCodeForSession(body.code);
    if (error || !data.session) {
      return authJson({ error: 'Phiên đăng nhập Google đã hết hạn hoặc không hợp lệ. Vui lòng thử lại.' }, 401);
    }
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/identity/auth/google`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: data.session.access_token }),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok) {
      const message = typeof result.message === 'string' ? result.message : 'Không thể đăng nhập DanaGo.';
      if (response.status === 409 && result.code === 'ACCOUNT_LINK_REQUIRED') {
        const store = await cookies();
        store.set('danago-pending-link', data.session.access_token, {
          httpOnly: true, secure: new URL(getWebOrigin(request)).protocol === 'https:',
          sameSite: 'strict', path: '/api/auth/google/link', maxAge: 600,
        });
        return authJson({ error: message, code: result.code }, 409);
      }
      return authJson({ error: message }, response.status);
    }
    if (typeof result.accessToken !== 'string' || !result.accessToken) {
      return authJson({ error: 'Backend trả về phiên đăng nhập không hợp lệ.' }, 502);
    }
    // Only DanaGo credentials reach the browser. Supabase tokens stay on the server.
    return authJson({ accessToken: result.accessToken });
  } catch {
    return authJson({ error: 'Không thể hoàn tất đăng nhập. Kiểm tra cấu hình server và kết nối API.' }, 503);
  } finally {
    await clearGoogleCookies();
  }
}
