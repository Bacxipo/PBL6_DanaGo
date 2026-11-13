'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CalendarDays, MapPin, Ticket } from 'lucide-react';
import { daysUntilStart, eventCover, eventLocation, formatEventDates, formatEventPrice, getEventTimeline } from '@/lib/event-api';

// Nhãn trạng thái theo thời gian diễn ra
export function getEventBadge(event) {
  const timeline = getEventTimeline(event);
  if (timeline === 'HAPPENING') return { text: 'Đang diễn ra', className: 'bg-emerald-500 text-white' };
  if (timeline === 'ENDED') return { text: 'Đã kết thúc', className: 'bg-gray-500 text-white' };
  const days = daysUntilStart(event);
  return { text: days <= 1 ? 'Ngày mai' : `Còn ${days} ngày`, className: 'bg-amber-500 text-white' };
}

export default function EventCard({ event }) {
  const cover = eventCover(event);
  const badge = getEventBadge(event);

  return (
    <Link
      href={`/events/${event.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-br from-[#e6f4f2] to-[#cfe9e6]">
        {cover ? (
          <Image src={cover} alt={event.name} fill unoptimized sizes="(max-width: 640px) 280px, 25vw" className="object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[#006971]/40">
            <CalendarDays className="h-10 w-10" />
          </div>
        )}
        <span className={`absolute left-3 top-3 rounded-lg px-2.5 py-1 text-[11px] font-bold shadow-sm ${badge.className}`}>{badge.text}</span>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-base font-bold text-gray-900">{event.name}</h3>
        <div className="mt-auto space-y-1.5 text-xs text-gray-600">
          <p className="flex items-center gap-2">
            <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[#006971]" />
            <span>{formatEventDates(event)}</span>
          </p>
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-rose-500" />
            <span className="line-clamp-1">{eventLocation(event)}</span>
          </p>
          <p className="flex items-center gap-2">
            <Ticket className="h-3.5 w-3.5 shrink-0 text-gray-400" />
            <b className="text-gray-800">{formatEventPrice(event.ticketPrice)}</b>
          </p>
        </div>
      </div>
    </Link>
  );
}
