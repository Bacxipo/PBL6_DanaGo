'use client';

import React, { useState } from 'react';
import { ImageOff } from 'lucide-react';
import { getImageUrl } from '@/lib/utils';


export function ImageGallery({ images }: { images?: unknown[] }) {
  const urls = (images ?? []).map(getImageUrl).filter(Boolean);
  const [active, setActive] = useState(0);
  const current = urls[Math.min(active, urls.length - 1)];
  // Ảnh ngang thì lấp kín khung; ảnh dọc / vuông thì hiện trọn, hai bên lấp bằng ảnh làm mờ
  const [landscape, setLandscape] = useState(true);

  if (!urls.length) {
    return (
      <div className="h-48 rounded-2xl bg-gray-100 border border-gray-200 flex flex-col items-center justify-center gap-2 text-gray-400">
        <ImageOff className="w-6 h-6" />
        <span className="text-xs font-medium">Chưa có hình ảnh</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <a
        href={current}
        target="_blank"
        rel="noreferrer"
        title="Bấm để xem ảnh gốc"
        className="relative block w-full aspect-video rounded-2xl overflow-hidden border border-gray-200 bg-gray-100"
      >
        {!landscape && (
          <img src={current} alt="" aria-hidden className="absolute inset-0 w-full h-full object-cover blur-2xl scale-110" />
        )}
        <img
          src={current}
          alt=""
          onLoad={(e) => setLandscape(e.currentTarget.naturalWidth >= e.currentTarget.naturalHeight * 1.2)}
          className={`relative w-full h-full ${landscape ? 'object-cover' : 'object-contain'}`}
        />
      </a>
      {urls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, i) => (
            <button
              key={url + i}
              type="button"
              onClick={() => setActive(i)}
              className={`shrink-0 rounded-xl overflow-hidden border-2 cursor-pointer transition-colors ${
                i === active ? 'border-[#006971]' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <img src={url} alt="" className="w-16 h-16 object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function DetailRow({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={`p-3 rounded-xl bg-gray-50 border border-gray-100 ${full ? 'md:col-span-2' : ''}`}>
      <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-0.5">{label}</p>
      <div className="text-sm font-semibold text-gray-900 break-words">{children ?? '—'}</div>
    </div>
  );
}

export function DetailGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">{children}</div>;
}

// Thanh nút cuối popup
export function DetailActions({ children }: { children: React.ReactNode }) {
  return <div className="pt-4 mt-5 border-t border-[#e2e8f0] flex flex-wrap justify-end gap-2">{children}</div>;
}

export const detailButtonClass =
  'inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed';
