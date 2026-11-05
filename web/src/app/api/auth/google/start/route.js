import { authJson, createGoogleServerClient, getWebOrigin, isSameOrigin } from '@/lib/google-auth-server';

export async function POST(request) {
  if (!isSameOrigin(request)) return authJson({ error: 'Yêu cầu không hợp lệ.' }, 403);
  try {
    const client = await createGoogleServerClient(request);
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${getWebOrigin(request)}/auth/callback`,
        skipBrowserRedirect: true,
        queryParams: { prompt: 'select_account' },
      },
    });
    if (error || !data.url) return authJson({ error: 'Không thể bắt đầu đăng nhập Google.' }, 502);
    return authJson({ url: data.url });
  } catch {
    return authJson({ error: 'Chưa cấu hình Supabase Auth ở server web.' }, 503);
  }
}
