'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Bell, CheckCheck } from 'lucide-react';
import { getMyNotifications, markAllNotificationsAsRead, markNotificationAsRead } from '@/lib/notification-api';

const FILTERS = [['ALL', 'Tất cả'], ['UNREAD', 'Chưa đọc'], ['COMMUNITY', 'Cộng đồng'], ['ITINERARY', 'Lịch trình'], ['PROMOTION', 'Sự kiện']];

function kind(item) {
  const value = `${item.type || ''} ${item.referenceType || ''}`.toUpperCase();
  if (value.includes('ITINERARY')) return 'ITINERARY';
  if (value.includes('PROMO') || value.includes('EVENT')) return 'PROMOTION';
  if (value.includes('COMMUNITY') || value.includes('POST') || value.includes('COMMENT') || value.includes('LIKE')) return 'COMMUNITY';
  return 'SYSTEM';
}

function hrefFor(item) {
  const reference = (item.referenceType || '').toUpperCase();
  if (!item.referenceId) return null;
  if (reference === 'EVENT' || kind(item) === 'PROMOTION') return `/events/${item.referenceId}`;
  if (reference === 'USER') return `/personal/${item.referenceId}`;
  if (reference === 'POST') return `/personal?postId=${item.referenceId}`;
  if (reference === 'DESTINATION') return `/explore/place/${item.referenceId}`;
  if (reference === 'ITINERARY' || kind(item) === 'ITINERARY') return '/itinerary';
  return null;
}

export default function NotificationsPage() {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [authenticated, setAuthenticated] = useState(false);

  async function load() {
    const token = sessionStorage.getItem('accessToken');
    if (!token) { setAuthenticated(false); setItems([]); setLoading(false); return; }
    setAuthenticated(true);
    setLoading(true); setError('');
    try { setItems(await getMyNotifications(token)); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Không thể tải thông báo.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { load(); window.addEventListener('auth-changed', load); return () => window.removeEventListener('auth-changed', load); }, []);

  const visible = useMemo(() => items.filter((item) => filter === 'ALL' || (filter === 'UNREAD' ? !item.isRead : kind(item) === filter)), [items, filter]);

  async function read(item) {
    if (item.isRead) return;
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;
    try { await markNotificationAsRead(item.id, token); setItems((current) => current.map((value) => value.id === item.id ? { ...value, isRead: true } : value)); } catch { /* keep current state */ }
  }

  async function readAll() {
    const token = sessionStorage.getItem('accessToken');
    if (!token) return;
    await markAllNotificationsAsRead(token);
    setItems((current) => current.map((item) => ({ ...item, isRead: true })));
  }

  if (!authenticated && !loading) return <div className="mx-auto max-w-3xl px-4 py-16 text-center"><p>Bạn cần đăng nhập để xem thông báo.</p><Link href="/login" className="mt-4 inline-block text-[#006971] underline">Đăng nhập</Link></div>;

  return <section className="dana-content-page mx-auto min-h-screen max-w-3xl px-4 py-8"><div className="mb-5 flex items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-[#163438]">Thông báo</h1><p className="text-sm text-slate-500">Cập nhật hoạt động và lịch trình của bạn.</p></div><button type="button" onClick={readAll} disabled={!items.some((item) => !item.isRead)} className="inline-flex items-center gap-2 rounded-full border border-teal-100 px-3 py-2 text-sm font-semibold text-[#006971] disabled:opacity-40"><CheckCheck size={16} /> Đọc tất cả</button></div><div className="mb-5 flex gap-2 overflow-x-auto pb-1">{FILTERS.map(([key, label]) => <button key={key} type="button" onClick={() => setFilter(key)} className={`whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold ${filter === key ? 'bg-[#006971] text-white' : 'bg-white text-slate-600 ring-1 ring-slate-200'}`}>{label}</button>)}</div>{loading ? <p role="status">Đang tải thông báo...</p> : error ? <p role="alert" className="text-red-600">{error}</p> : visible.length === 0 ? <div className="rounded-2xl border border-dashed border-teal-200 bg-teal-50/40 p-12 text-center text-slate-500"><Bell className="mx-auto mb-3" /><p>Không có thông báo nào.</p></div> : <div className="space-y-3">{visible.map((item) => { const href = hrefFor(item); const content = <div className={`flex gap-3 rounded-2xl border p-4 ${item.isRead ? 'border-slate-200 bg-white' : 'border-teal-200 bg-teal-50/60'}`}><Bell className="mt-1 shrink-0 text-[#006971]" size={20} /><div className="min-w-0 flex-1"><p className="font-semibold text-[#163438]">{item.title || 'Thông báo'}</p><p className="mt-1 text-sm text-slate-600">{item.content}</p><p className="mt-2 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString('vi-VN')}</p></div></div>; return <div key={item.id} onClick={() => read(item)}>{href ? <Link href={href}>{content}</Link> : content}</div>; })}</div>}</section>;
}
