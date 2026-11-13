'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPostLoginPath } from '@/lib/preference-api';

// Share the in-flight exchange when React Strict Mode runs the effect twice.
let pendingExchange;
function completeLogin() {
  pendingExchange ||= (async () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has('error')) throw new Error('Đăng nhập Google đã bị hủy hoặc từ chối.');
    const code = params.get('code');
    if (!code) throw new Error('Không tìm thấy mã đăng nhập. Vui lòng thử lại.');
    try {
      const response = await fetch('/api/auth/google/exchange', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const result = await response.json();
      if (!response.ok) {
        const error = new Error(result.error || 'Đăng nhập Google thất bại.');
        error.code = result.code;
        throw error;
      }
      sessionStorage.setItem('accessToken', result.accessToken);
      window.dispatchEvent(new Event('auth-changed'));
      window.location.replace(await getPostLoginPath(result.accessToken));
    } finally {
      window.history.replaceState(null, '', '/auth/callback');
    }
  })();
  return pendingExchange;
}

export default function GoogleCallback() {
  const [error, setError] = useState('');
  const [needsLink, setNeedsLink] = useState(false);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    let active = true;
    completeLogin().catch((err) => {
      if (!active) return;
      if (err.code === 'ACCOUNT_LINK_REQUIRED') setNeedsLink(true);
      else setError(err.message);
    });
    return () => { active = false; };
  }, []);

  async function handleLink(event) {
    event.preventDefault();
    if (saving) return;
    setSaving(true);
    setError('');
    try {
      const response = await fetch('/api/auth/google/link', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Không thể liên kết Google.');
      sessionStorage.setItem('accessToken', result.accessToken);
      window.dispatchEvent(new Event('auth-changed'));
      setPassword('');
      window.location.replace(await getPostLoginPath(result.accessToken));
    } catch (cause) {
      setError(cause.message || 'Không thể liên kết Google.');
    } finally {
      setSaving(false);
    }
  }

  if (needsLink) return <main className="mx-auto w-full max-w-md px-4 py-12">
    <form onSubmit={handleLink} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <h1 className="text-2xl font-bold text-[#006971]">Liên kết Google</h1>
      <p className="text-sm leading-relaxed text-gray-600">Email này đã có tài khoản DanaGo. Nhập mật khẩu DanaGo để liên kết Google và giữ nguyên hồ sơ, lịch trình cùng địa điểm yêu thích.</p>
      <div>
        <label htmlFor="link-password" className="mb-2 block text-sm font-semibold">Mật khẩu DanaGo</label>
        <input id="link-password" type="password" autoComplete="current-password" required maxLength={256} disabled={saving}
          value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-xl border border-gray-300 p-3" />
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button disabled={saving || !password} className="w-full rounded-xl bg-[#006971] p-3 font-semibold text-white disabled:opacity-50">
        {saving ? 'Đang liên kết…' : 'Liên kết và đăng nhập'}
      </button>
      <Link href="/login" className="block text-center text-sm text-[#006971] underline">Quay lại đăng nhập</Link>
    </form>
  </main>;
  return <main className="p-10 text-center">
    {error ? <><p role="alert" className="text-red-600">{error}</p><Link href="/login">Quay lại đăng nhập</Link></>
      : <p role="status">Đang hoàn tất đăng nhập Google…</p>}
  </main>;
}
