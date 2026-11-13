'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera, UserCircle } from 'lucide-react';
import { Modal } from '@/components/ui';
import Avatar from '@/components/Avatar';
import { useAction, useAuth } from '@/lib/context';
import { userApi } from '@/lib/api';
import { ROLE_LABEL } from '@/lib/types';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024; // backend giới hạn 5MB

// Hồ sơ của tôi: xem thông tin và đổi ảnh đại diện (chưa đổi thì dùng ảnh mặc định)
export default function ProfileModal({ onClose }: { onClose: () => void }) {
  const { user, updateUser } = useAuth();
  const { run, busy } = useAction();
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<{ file: File; url: string } | null>(null);
  const [error, setError] = useState('');

  // Giải phóng URL xem trước khi đổi ảnh khác / đóng hộp thoại
  useEffect(() => () => { if (selected) URL.revokeObjectURL(selected.url); }, [selected]);

  if (!user) return null;

  const pick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ALLOWED_TYPES.includes(file.type)) return setError('Ảnh phải là JPG, PNG hoặc WebP.');
    if (file.size === 0 || file.size > MAX_SIZE) return setError('Ảnh không được vượt quá 5MB.');
    setError('');
    setSelected({ file, url: URL.createObjectURL(file) });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    const ok = await run(async () => {
      const updated = await userApi.updateMyAvatar(selected.file);
      updateUser({ ...user, avatarUrl: updated.avatarUrl ?? null });
    }, 'Đã đổi ảnh đại diện.');
    if (ok) onClose();
  };

  return (
    <Modal title="Hồ sơ của tôi" icon={UserCircle} maxWidth="max-w-sm" onClose={onClose}>
      <form onSubmit={save} className="space-y-4">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="relative w-28 h-28">
            <Avatar src={selected ? selected.url : user.avatarUrl} alt={`Ảnh đại diện của ${user.fullName}`} className="w-28 h-28 rounded-full object-cover bg-[#e6f4f2] border-2 border-white shadow-md" />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={busy}
              aria-label="Chọn ảnh đại diện mới"
              title="Chọn ảnh đại diện mới"
              className="absolute bottom-0 right-0 p-2 rounded-full bg-[#006971] text-white border-2 border-white shadow-md hover:bg-[#005258] disabled:opacity-60 cursor-pointer"
            >
              <Camera className="w-4 h-4" />
            </button>
            <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={pick} />
          </div>
          <div>
            <p className="font-bold text-gray-900">{user.fullName}</p>
            <p className="text-xs text-gray-500">{user.email}</p>
            <p className="text-[11px] font-semibold text-[#006971] mt-0.5">{ROLE_LABEL[user.role]}</p>
          </div>
          <p className="text-[11px] text-gray-400">JPG, PNG hoặc WebP, tối đa 5MB. Chưa chọn ảnh thì hiển thị ảnh mặc định.</p>
          {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
        </div>

        <div className="pt-3 border-t border-[#e2e8f0] flex justify-end gap-2">
          <button type="button" onClick={onClose} className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer">
            Đóng
          </button>
          <button type="submit" disabled={!selected || busy} className="px-4 py-2 text-xs font-bold text-white bg-[#006971] hover:bg-[#005258] rounded-xl shadow-xs disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer">
            {busy ? 'Đang tải ảnh...' : 'Lưu ảnh đại diện'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
