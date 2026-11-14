'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { inputClass } from '@/components/ui';
import { normalizeSearch } from '@/lib/utils';

export interface SearchSelectOption {
  value: string;
  label: string;
  hint?: string; // chữ phụ hiện bên phải (vd quận/huyện), cũng được dùng khi tìm kiếm
}

// Ô chọn có tìm kiếm (gõ không dấu cũng ra): dùng khi danh sách dài như danh sách điểm đến
export default function SearchSelect({
  value,
  onChange,
  options,
  placeholder = 'Chọn...',
  searchPlaceholder = 'Gõ để tìm...',
  emptyLabel = '— Không chọn —'
}: {
  value: string;
  onChange: (value: string) => void;
  options: SearchSelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLLIElement>(null);

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    const q = normalizeSearch(query);
    return q ? options.filter((o) => normalizeSearch(`${o.label} ${o.hint ?? ''}`).includes(q)) : options;
  }, [options, query]);

  const close = () => {
    setOpen(false);
    setQuery('');
    setActive(0);
  };

  // Bấm ra ngoài thì đóng danh sách
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setQuery('');
        setActive(0);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Giữ mục đang chọn bằng bàn phím luôn nằm trong vùng nhìn thấy
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest' });
  }, [active, open]);

  const choose = (next: string) => {
    onChange(next);
    close();
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => Math.min(i + 1, Math.max(filtered.length - 1, 0)));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault(); // không submit form khi đang chọn
      if (filtered[active]) choose(filtered[active].value);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      close();
    }
  };

  return (
    <div ref={rootRef} className="relative">
      {open ? (
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActive(0);
            }}
            onKeyDown={onKeyDown}
            placeholder={searchPlaceholder}
            className={`${inputClass} pl-8`}
            role="combobox"
            aria-expanded="true"
            aria-controls="search-select-list"
          />
        </div>
      ) : (
        <>
          <button type="button" onClick={() => setOpen(true)} className={`${inputClass} text-left cursor-pointer pr-14 truncate`} aria-haspopup="listbox">
            <span className={selected ? 'text-gray-900' : 'text-gray-400'}>{selected ? selected.label : placeholder}</span>
          </button>
          {selected && (
            <button type="button" onClick={() => onChange('')} aria-label="Bỏ chọn" title="Bỏ chọn" className="absolute right-8 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-rose-600 rounded cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </>
      )}

      {open && (
        <ul id="search-select-list" role="listbox" className="absolute z-50 mt-1 w-full max-h-56 overflow-y-auto bg-white border border-[#e2e8f0] rounded-xl shadow-lg py-1 text-xs">
          <li>
            <button type="button" onClick={() => choose('')} className="w-full text-left px-3 py-2 text-gray-500 hover:bg-[#e6f4f2]/70 cursor-pointer">
              {emptyLabel}
            </button>
          </li>
          {filtered.map((o, i) => (
            <li key={o.value} ref={i === active ? activeRef : undefined} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                onClick={() => choose(o.value)}
                onMouseEnter={() => setActive(i)}
                className={`w-full text-left px-3 py-2 flex items-center justify-between gap-3 cursor-pointer ${i === active ? 'bg-[#e6f4f2]' : ''} ${o.value === value ? 'font-bold text-[#006971]' : 'text-gray-800'}`}
              >
                <span className="truncate">{o.label}</span>
                {o.hint && <span className="text-[10px] text-gray-400 shrink-0">{o.hint}</span>}
              </button>
            </li>
          ))}
          {filtered.length === 0 && <li className="px-3 py-4 text-center text-gray-400">Không tìm thấy kết quả phù hợp</li>}
        </ul>
      )}
    </div>
  );
}
