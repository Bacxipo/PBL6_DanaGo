'use client';

import { useState } from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';

export default function UserAvatar({ user, size = 40 }) {
  const [failedUrl, setFailedUrl] = useState(null);
  const url = user?.avatarUrl;
  return (
    <span style={{ width: size, height: size }} className="inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-100 text-slate-400">
      {url && url !== failedUrl ? (
        <Image src={url} alt={`Ảnh đại diện của ${user.fullName || user.username || 'người dùng'}`} width={size} height={size} unoptimized onError={() => setFailedUrl(url)} className="h-full w-full object-cover" />
      ) : <User size={Math.round(size / 2)} />}
    </span>
  );
}
