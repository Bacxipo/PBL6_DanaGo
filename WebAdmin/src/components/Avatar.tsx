'use client';

import { useState } from 'react';
import { DEFAULT_AVATAR } from '@/lib/utils';

// Ảnh đại diện: chưa có ảnh (hoặc ảnh lỗi/đã bị xóa) thì dùng ảnh mặc định /default-avatar.svg
export default function Avatar({ src, alt = '', className = '' }: { src?: string | null; alt?: string; className?: string }) {
  const [failedUrl, setFailedUrl] = useState<string | null>(null);
  const url = src && src !== failedUrl ? src : DEFAULT_AVATAR;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={alt} onError={() => src && setFailedUrl(src)} className={className} />;
}
