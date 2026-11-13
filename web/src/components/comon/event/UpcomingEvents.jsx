'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { getEvents, getEventTimeline } from '@/lib/event-api';
import EventCard from './EventCard';

const MAX_ON_HOME = 10;

// Dải "Sự kiện sắp diễn ra" ở Trang chủ: chỉ hiện khi có sự kiện đang/sắp diễn ra
export default function UpcomingEvents() {
  const [events, setEvents] = useState([]);
  const sliderRef = useRef(null);

  useEffect(() => {
    let active = true;
    getEvents()
      .then((data) => { if (active) setEvents(data); })
      .catch(() => { /* lỗi mạng: ẩn dải sự kiện, không làm hỏng Trang chủ */ });
    return () => { active = false; };
  }, []);

  const upcoming = useMemo(
    () => events
      .filter((event) => getEventTimeline(event) !== 'ENDED')
      .sort((a, b) => a.startDate.localeCompare(b.startDate))
      .slice(0, MAX_ON_HOME),
    [events]
  );

  if (upcoming.length === 0) return null;

  const scroll = (direction) => {
    const slider = sliderRef.current;
    if (slider) slider.scrollBy({ left: direction * slider.offsetWidth, behavior: 'smooth' });
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2">
      <div className="flex items-center justify-between mb-6 gap-3">
        <h2 className="text-black font-bold text-2xl md:text-3xl">Sự kiện sắp diễn ra</h2>
        <div className="flex items-center gap-3">
          {upcoming.length > 4 && (
            <div className="hidden sm:flex items-center gap-2">
              <button type="button" onClick={() => scroll(-1)} title="Xem trước đó" className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition shadow-sm cursor-pointer bg-white">
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
              <button type="button" onClick={() => scroll(1)} title="Xem tiếp theo" className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 transition shadow-sm cursor-pointer bg-white">
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          )}
          <Link href="/events" className="inline-flex items-center gap-1 text-sm font-bold text-[#006971] hover:underline whitespace-nowrap">
            Xem tất cả <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div ref={sliderRef} className="flex gap-6 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scroll-smooth no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {upcoming.map((event) => (
          <div key={event.id} className="w-[280px] sm:w-[calc(50%-12px)] lg:w-[calc(25%-18px)] flex-shrink-0 snap-start">
            <EventCard event={event} />
          </div>
        ))}
      </div>
    </div>
  );
}
