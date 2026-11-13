'use client';

import { useEffect, useRef, useState } from 'react';
import { Pencil } from 'lucide-react';
import UserAvatar from '@/components/comon/ui/UserAvatar';
import { updateMyAvatar } from '@/lib/feed-api';

export default function AvatarEditor({ profile, onSaved }) {
  const inputRef = useRef(null);
  const [selected, setSelected] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  useEffect(() => () => { if (selected) URL.revokeObjectURL(selected.url); }, [selected]);

  function selectFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setError('');
    setMessage('');
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024 || file.size === 0) {
      setError('Chọn ảnh JPG, PNG hoặc WebP, tối đa 5MB.');
      return;
    }
    setSelected({ file, url: URL.createObjectURL(file) });
    saveAvatar(file);
  }

  async function saveAvatar(file) {
    if (!file || saving || !profile) return;
    const token = sessionStorage.getItem('accessToken');
    if (!token) { setSelected(null); setError('Vui lòng đăng nhập để đổi ảnh đại diện.'); return; }
    setSaving(true);
    setError('');
    try {
      const updated = await updateMyAvatar(file, token);
      if (token !== sessionStorage.getItem('accessToken')) return;
      onSaved(updated);
      setSelected(null);
      setMessage('Đã đổi ảnh đại diện.');
      window.dispatchEvent(new CustomEvent('auth-changed', { detail: { type: 'avatar' } }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Không thể đổi ảnh đại diện.');
    } finally {
      setSelected(null);
      setSaving(false);
    }
  }

  return (
    <div className="flex w-40 shrink-0 flex-col items-center gap-2">
      <div className="relative h-32 w-32">
        <UserAvatar user={selected ? { ...profile, avatarUrl: selected.url } : profile} size={128} />
        <button type="button" onClick={() => inputRef.current?.click()} disabled={saving || !profile} aria-label="Thay đổi ảnh đại diện" title="Thay đổi ảnh đại diện" className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-[#006971] p-2 text-white shadow-md hover:bg-[#005258] disabled:opacity-50">
          <Pencil size={16} />
        </button>
        <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden disabled={saving || !profile} onChange={selectFile} />
      </div>
      {saving && <p role="status" className="text-xs text-gray-500">Đang cập nhật ảnh...</p>}
      {error && <p role="alert" className="text-center text-xs text-red-600">{error}</p>}
      {message && <p role="status" className="text-center text-xs text-green-700">{message}</p>}
    </div>
  );
}
