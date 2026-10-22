'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

// ───────── Định dạng ─────────
// 'YYYY-MM-DD' hoặc ISO -> 'DD/MM/YYYY'
export function formatDate(value: string) {
  const [y, m, d] = value.slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
}

export function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function timeAgo(value: string) {
  const min = Math.max(0, Math.round((Date.now() - Date.parse(value)) / 60000));
  if (min < 1) return 'Vừa xong';
  if (min < 60) return `${min} phút trước`;
  const h = Math.round(min / 60);
  if (h < 24) return `${h} giờ trước`;
  const d = Math.round(h / 24);
  return d < 30 ? `${d} ngày trước` : formatDate(value);
}

// Trang vẫn hiện đầy đủ giao diện khi backend chưa có API tương ứng
export const isMissingApi = (error: string | null) => !!error?.startsWith('Backend chưa có API này');

export const splitLines = (text: string) => text.split('\n').map((s) => s.trim()).filter(Boolean);

// Chuỗi rỗng -> undefined (không gửi field trống lên API)
export const orUndefined = (v: string) => v.trim() || undefined;

export const avatarFallback = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;

// ───────── Tải dữ liệu từ API ─────────
// Tải dữ liệu từ API: tự gọi lại khi deps đổi và bỏ kết quả của request cũ.
export function useApi<T>(fetcher: () => Promise<T>, deps: unknown[] = [], enabled = true) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(enabled);
  const latest = useRef(0);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const reload = useCallback(async () => {
    const id = ++latest.current;
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current();
      if (id === latest.current) setData(result);
    } catch (e) {
      if (id === latest.current) setError(e instanceof Error ? e.message : 'Đã có lỗi xảy ra.');
    } finally {
      if (id === latest.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, reload, ...deps]);

  return { data, error, loading, reload, setData };
}

// Cập nhật danh sách trong state bằng kết quả API trả về (không cần tải lại cả bảng)
export const upsertById = <T extends { id: number }>(list: T[] | null, item: T) =>
  list?.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [item, ...(list ?? [])];

export const removeById = <T extends { id: number }>(list: T[] | null, id: number) => list?.filter((x) => x.id !== id) ?? null;
