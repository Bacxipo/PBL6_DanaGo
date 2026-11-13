'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';

// Dãy trang gọn: 1 … 4 5 6 … 20
function pageItems(page: number, totalPages: number): (number | 'gap-left' | 'gap-right')[] {
  const items: (number | 'gap-left' | 'gap-right')[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) items.push(p);
    else if (p < page && items[items.length - 1] !== 'gap-left') items.push('gap-left');
    else if (p > page && items[items.length - 1] !== 'gap-right') items.push('gap-right');
  }
  return items;
}

export default function Pagination({ page, totalPages, onChange }: { page: number; totalPages: number; onChange: (page: number) => void }) {
  if (totalPages <= 1) return null;

  const btn = 'min-w-8 h-8 px-2 inline-flex items-center justify-center rounded-lg text-xs font-bold transition-colors cursor-pointer';
  return (
    <nav aria-label="Phân trang" className="flex items-center justify-center gap-1 flex-wrap">
      <button type="button" onClick={() => onChange(page - 1)} disabled={page <= 1} aria-label="Trang trước" className={`${btn} text-gray-600 hover:bg-[#e6f4f2] disabled:opacity-40 disabled:cursor-not-allowed`}>
        <ChevronLeft className="w-4 h-4" />
      </button>
      {pageItems(page, totalPages).map((item) =>
        typeof item === 'number' ? (
          <button
            key={item}
            type="button"
            onClick={() => onChange(item)}
            aria-current={item === page ? 'page' : undefined}
            className={`${btn} ${item === page ? 'bg-[#006971] text-white shadow-sm' : 'text-gray-600 hover:bg-[#e6f4f2]'}`}
          >
            {item}
          </button>
        ) : (
          <span key={item} className="px-1 text-gray-400 text-xs select-none">…</span>
        )
      )}
      <button type="button" onClick={() => onChange(page + 1)} disabled={page >= totalPages} aria-label="Trang sau" className={`${btn} text-gray-600 hover:bg-[#e6f4f2] disabled:opacity-40 disabled:cursor-not-allowed`}>
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
