'use client';

import { useState } from 'react';
import { changeMyPassword } from '@/lib/feed-api';

const EMPTY_PASSWORDS = { currentPassword: '', newPassword: '', confirmPassword: '' };

export default function ChangePasswordForm({ profile, loading }) {
  const [values, setValues] = useState(EMPTY_PASSWORDS);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  function reset() {
    setValues({ ...EMPTY_PASSWORDS });
    setError('');
    setMessage('');
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (saving || !profile || profile.authProvider === 'google') return;
    setError('');
    setMessage('');
    const token = sessionStorage.getItem('accessToken');
    if (!token) { setError('Vui lòng đăng nhập để đổi mật khẩu.'); return; }
    if (values.newPassword !== values.confirmPassword) { setError('Xác nhận mật khẩu mới không khớp.'); return; }
    if (values.newPassword === values.currentPassword) { setError('Mật khẩu mới phải khác mật khẩu hiện tại.'); return; }
    if (new TextEncoder().encode(values.newPassword).length > 72) { setError('Mật khẩu mới vượt quá giới hạn 72 byte.'); return; }
    setSaving(true);
    try {
      const result = await changeMyPassword(values, token);
      if (token !== sessionStorage.getItem('accessToken')) return;
      setValues({ ...EMPTY_PASSWORDS });
      setMessage(result.message);
    } catch (cause) {
      if (token === sessionStorage.getItem('accessToken')) setError(cause instanceof Error ? cause.message : 'Không thể đổi mật khẩu.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section>
      <h3 className="text-lg font-semibold text-gray-800">Thay đổi mật khẩu</h3>
      {profile?.authProvider === 'google' ? (
        <p className="mt-3 text-sm text-gray-500">Bạn đang đăng nhập bằng Google. Hãy thay đổi mật khẩu trong phần bảo mật tài khoản Google.</p>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <fieldset disabled={saving || loading || !profile} className="space-y-4">
            {[
              ['currentPassword', 'Mật khẩu hiện tại', 'current-password'],
              ['newPassword', 'Mật khẩu mới', 'new-password'],
              ['confirmPassword', 'Xác nhận mật khẩu mới', 'new-password'],
            ].map(([field, label, autoComplete]) => (
              <label key={field} className="flex flex-col gap-1 text-sm font-medium text-gray-700">
                <span>{label}</span>
                <input
                  type="password"
                  autoComplete={autoComplete}
                  required
                  minLength={field === 'currentPassword' ? undefined : 6}
                  maxLength={field === 'currentPassword' ? 1024 : 72}
                  value={values[field]}
                  onChange={(event) => { setValues((previous) => ({ ...previous, [field]: event.target.value })); setError(''); setMessage(''); }}
                  className="w-full rounded-xl border border-gray-200 p-2.5 text-sm text-gray-800 outline-none focus:border-[#006971]"
                />
              </label>
            ))}
            <p className="text-xs text-gray-500">Mật khẩu mới phải có ít nhất 6 ký tự.</p>
            <div className="flex justify-end gap-4">
              <button type="button" onClick={reset} className="rounded-xl bg-gray-200 px-5 py-2.5 text-sm font-semibold text-gray-800 disabled:opacity-50">Hủy</button>
              <button type="submit" className="rounded-xl bg-[#006971] px-5 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? 'Đang lưu...' : 'Đổi mật khẩu'}</button>
            </div>
          </fieldset>
          {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
          {message && <p role="status" className="text-sm text-green-700">{message}</p>}
        </form>
      )}
    </section>
  );
}
