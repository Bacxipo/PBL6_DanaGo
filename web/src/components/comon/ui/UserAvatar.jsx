'use client';

import { useState } from 'react';
import Image from 'next/image';

// Ảnh đại diện mặc định khi người dùng chưa tải ảnh hoặc ảnh bị lỗi (file nằm ở web/public)
export const DEFAULT_AVATAR = '/default-avatar.svg';

export default function UserAvatar({ user, size = 40 }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const url = user?.avatarUrl;
  const src = url && url !== failedUrl ? url : DEFAULT_AVATAR;
  return (
    <span style={{ width: size, height: size }} className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100">
      <Image src={src} alt={`Ảnh đại diện của ${user?.fullName || user?.username || 'người dùng'}`} width={size} height={size} unoptimized onError={() => url && setFailedUrl(url)} className="h-full w-full object-cover" />
    </span>
  );
}
