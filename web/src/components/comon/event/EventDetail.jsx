'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { AlertCircle, ArrowLeft, CalendarDays, ExternalLink, Heart, Loader2, MapPin, Ticket } from 'lucide-react';
import { eventLocation, eventMapUrl, formatEventDates, formatEventPrice, getEvent, toggleEventFavorite } from '@/lib/event-api';
import { getEventBadge } from './EventCard';

// Trang chi tiết /events/[id]: ảnh, thời gian, địa điểm, giá vé, mô tả, yêu thích
export default function EventDetail({ id }) {
  const router = useRouter();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageIndex, setImageIndex] = useState(0);
  const [favoriting, setFavoriting] = useState(false);
  const [favoriteError, setFavoriteError] = useState('');

  useEffect(() => {
    let active = true;
    const token = sessionStorage.getItem('accessToken');
    getEvent(id, token)
      .then((data) => { if (active) setEvent(data); })
      .catch((cause) => { if (active) setError(cause.message || 'Không tìm thấy sự kiện.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  const handleFavorite = async () => {
    if (!event || favoriting) return;
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }
    setFavoriting(true);
    setFavoriteError('');
    try {
      const result = await toggleEventFavorite(event.id, token);
      setEvent((previous) => ({ ...previous, isFavorited: result.favorited }));
    } catch (cause) {
      setFavoriteError(cause.message || 'Không thể cập nhật yêu thích.');
    } finally {
      setFavoriting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-32 text-gray-500">
        <Loader2 className="w-8 h-8 animate-spin text-[#006971]" />
        <p className="text-sm font-medium">Đang tải sự kiện...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div role="alert" className="flex flex-col items-center justify-center gap-3 py-32 text-red-500">
        <AlertCircle className="w-10 h-10" />
        <p className="text-base font-bold">{error || 'Không tìm thấy sự kiện.'}</p>
        <Link href="/events" className="px-4 py-2 bg-[#006971] text-white rounded-lg text-sm font-semibold hover:bg-[#00555c] transition-colors">
          Về danh sách sự kiện
        </Link>
      </div>
    );
  }

  const badge = getEventBadge(event);
  const images = event.images ?? [];
  const cover = images[imageIndex]?.imageUrl;

  return (
    <article className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <Link href="/events" className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#006971] hover:underline">
        <ArrowLeft className="w-4 h-4" /> Tất cả sự kiện
      </Link>

      <div className="space-y-3">
        <div className="relative aspect-[16/8] w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#e6f4f2] to-[#cfe9e6] shadow-sm">
          {cover ? (
            <Image src={cover} alt={event.name} fill unoptimized priority sizes="(max-width: 896px) 100vw, 896px" className="object-cover" />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-[#006971]/40">
              <CalendarDays className="h-14 w-14" />
            </div>
          )}
          <span className={`absolute left-4 top-4 rounded-lg px-3 py-1.5 text-xs font-bold shadow-sm ${badge.className}`}>{badge.text}</span>
        </div>

        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            {images.map((image, index) => (
              <button
                key={image.id}
                type="button"
                onClick={() => setImageIndex(index)}
                aria-label={`Xem ảnh ${index + 1}`}
                aria-pressed={index === imageIndex}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 cursor-pointer ${index === imageIndex ? 'border-[#006971]' : 'border-transparent opacity-70 hover:opacity-100'}`}
              >
                <Image src={image.imageUrl} alt="" fill unoptimized sizes="96px" className="object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-start justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{event.name}</h1>
        <button
          type="button"
          onClick={handleFavorite}
          disabled={favoriting}
          aria-pressed={!!event.isFavorited}
          className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold transition-colors cursor-pointer disabled:opacity-60 ${event.isFavorited ? 'border-rose-200 bg-rose-50 text-rose-600' : 'border-gray-200 bg-white text-gray-600 hover:border-rose-200 hover:text-rose-600'}`}
        >
          <Heart className={`h-4 w-4 ${event.isFavorited ? 'fill-rose-500 text-rose-500' : ''}`} />
          {event.isFavorited ? 'Đã yêu thích' : 'Yêu thích'}
        </button>
      </div>
      {favoriteError && <p role="alert" className="text-sm text-red-600">{favoriteError}</p>}

      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
        <div className="flex items-start gap-3">
          <CalendarDays className="mt-0.5 h-5 w-5 shrink-0 text-[#006971]" />
          <div>
            <dt className="text-[11px] font-semibold uppercase text-gray-400">Thời gian</dt>
            <dd className="text-sm font-bold text-gray-900">{formatEventDates(event)}</dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-rose-500" />
          <div>
            <dt className="text-[11px] font-semibold uppercase text-gray-400">Địa điểm</dt>
            <dd className="text-sm font-bold text-gray-900">{eventLocation(event)}</dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Ticket className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
          <div>
            <dt className="text-[11px] font-semibold uppercase text-gray-400">Giá vé</dt>
            <dd className="text-sm font-bold text-gray-900">{formatEventPrice(event.ticketPrice)}</dd>
          </div>
        </div>
      </dl>

      {event.description && (
        <section className="space-y-2">
          <h2 className="text-lg font-bold text-gray-900">Giới thiệu</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-gray-700">{event.description}</p>
        </section>
      )}

      <div className="flex flex-wrap gap-3">
        <a href={eventMapUrl(event)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl bg-[#006971] px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-[#00555c]">
          <MapPin className="h-4 w-4" /> Xem bản đồ <ExternalLink className="h-3.5 w-3.5" />
        </a>
        {event.destination && (
          <Link href={`/explore/place/${event.destination.id}`} className="inline-flex items-center gap-2 rounded-xl border border-[#006971]/30 bg-white px-5 py-2.5 text-sm font-bold text-[#006971] transition-colors hover:bg-[#e6f4f2]">
            Xem địa điểm: {event.destination.name}
          </Link>
        )}
      </div>
    </article>
  );
}
