'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, CalendarDays, Loader2 } from 'lucide-react';
import { getEvents, getEventTimeline } from '@/lib/event-api';
import EventCard from './EventCard';

const TABS = [
  { key: 'current', label: 'Đang & sắp diễn ra' },
  { key: 'ended', label: 'Đã kết thúc' },
];

// Trang /events: danh sách đầy đủ, tách "đang & sắp diễn ra" và "đã kết thúc"
export default function EventList() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('current');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const token = sessionStorage.getItem('accessToken');
    getEvents(token)
      .then((data) => { if (active) setEvents(data); })
      .catch((cause) => { if (active) setError(cause.message || 'Không thể tải danh sách sự kiện.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [reloadKey]);

  const { current, ended } = useMemo(() => {
    const currentList = events.filter((event) => getEventTimeline(event) !== 'ENDED').sort((a, b) => a.startDate.localeCompare(b.startDate));
    const endedList = events.filter((event) => getEventTimeline(event) === 'ENDED').sort((a, b) => b.endDate.localeCompare(a.endDate));
    return { current: currentList, ended: endedList };
  }, [events]);

  const list = tab === 'current' ? current : ended;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Sự kiện & Lễ hội</h1>
        <p className="text-sm text-gray-500 mt-1">Các sự kiện, lễ hội đang và sắp diễn ra tại Đà Nẵng.</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map((item) => {
          const count = item.key === 'current' ? current.length : ended.length;
          const active = tab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              aria-pressed={active}
              className={`pb-3 px-3 text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${active ? 'text-[#006971] border-b-2 border-[#006971]' : 'text-gray-500 hover:text-gray-900'}`}
            >
              {item.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${active ? 'bg-[#e6f4f2] text-[#006971]' : 'bg-gray-100 text-gray-500'}`}>{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-gray-500">
          <Loader2 className="w-8 h-8 animate-spin text-[#006971]" />
          <p className="text-sm font-medium">Đang tải sự kiện...</p>
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-center justify-center gap-3 py-20 text-red-500">
          <AlertCircle className="w-10 h-10" />
          <p className="text-base font-bold">{error}</p>
          <button type="button" onClick={() => { setLoading(true); setError(''); setReloadKey((value) => value + 1); }} className="px-4 py-2 bg-[#006971] text-white rounded-lg text-sm font-semibold hover:bg-[#00555c] transition-colors cursor-pointer">
            Thử lại
          </button>
        </div>
      ) : list.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 py-20 text-gray-400">
          <CalendarDays className="w-10 h-10" />
          <p className="text-sm font-medium">{tab === 'current' ? 'Hiện chưa có sự kiện nào đang hoặc sắp diễn ra.' : 'Chưa có sự kiện nào đã kết thúc.'}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {list.map((event) => <EventCard key={event.id} event={event} />)}
        </div>
      )}
    </section>
  );
}
