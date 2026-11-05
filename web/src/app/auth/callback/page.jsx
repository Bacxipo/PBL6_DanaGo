'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

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
      if (!response.ok) throw new Error(result.error || 'Đăng nhập Google thất bại.');
      sessionStorage.setItem('accessToken', result.accessToken);
      window.dispatchEvent(new Event('auth-changed'));
      window.location.replace('/community');
    } finally {
      window.history.replaceState(null, '', '/auth/callback');
    }
  })();
  return pendingExchange;
}

export default function GoogleCallback() {
  const [error, setError] = useState('');
  useEffect(() => { completeLogin().catch((err) => setError(err.message)); }, []);
  return <main className="p-10 text-center">
    {error ? <><p role="alert" className="text-red-600">{error}</p><Link href="/login">Quay lại đăng nhập</Link></>
      : <p role="status">Đang hoàn tất đăng nhập Google…</p>}
  </main>;
}
