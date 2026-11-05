export async function startGoogleLogin() {
  const response = await fetch('/api/auth/google/start', { method: 'POST' });
  const result = await response.json();
  if (!response.ok) throw new Error(result.error || 'Không thể bắt đầu đăng nhập Google.');
  window.location.assign(result.url);
}
