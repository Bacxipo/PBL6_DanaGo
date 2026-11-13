import { cookies } from 'next/headers';
import { authJson, isSameOrigin } from '@/lib/google-auth-server';

export async function POST(request) {
  if (!isSameOrigin(request)) return authJson({ error: 'Yêu cầu không hợp lệ.' }, 403);
  const store = await cookies();
  const token = store.get('danago-pending-link')?.value;
  if (!token) return authJson({ error: 'Phiên liên kết đã hết hạn. Vui lòng đăng nhập Google lại.' }, 401);
  let body;
  try { body = await request.json(); } catch {
    return authJson({ error: 'Dữ liệu không hợp lệ.' }, 400);
  }
  if (typeof body?.password !== 'string' || !body.password || body.password.length > 256) {
    return authJson({ error: 'Vui lòng nhập mật khẩu hợp lệ.' }, 400);
  }
  try {
    const apiUrl = process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    const response = await fetch(`${apiUrl.replace(/\/$/, '')}/identity/auth/google/link`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accessToken: token, password: body.password }),
      cache: 'no-store', signal: AbortSignal.timeout(15000),
    });
    const result = await response.json();
    if (!response.ok) return authJson({ error: typeof result.message === 'string' ? result.message : 'Không thể liên kết Google.' }, response.status);
    if (typeof result.accessToken !== 'string' || !result.accessToken) return authJson({ error: 'Phiên đăng nhập không hợp lệ.' }, 502);
    store.set('danago-pending-link', '', { httpOnly: true, sameSite: 'strict', path: '/api/auth/google/link', maxAge: 0 });
    return authJson({ accessToken: result.accessToken });
  } catch {
    return authJson({ error: 'Không thể kết nối máy chủ. Vui lòng thử lại.' }, 503);
  }
}
