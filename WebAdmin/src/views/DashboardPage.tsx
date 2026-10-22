'use client';

import Link from 'next/link';
import Header from '@/components/Header';
import { AsyncContent } from '@/components/ui';
import { useApi, avatarFallback, formatDate, timeAgo, todayIso } from '@/lib/utils';
import { useAction, useAuth, usePending } from '@/lib/context';
import { Calendar, CheckCircle2, ChevronRight, ImageOff, Inbox, MapPin, MessageSquare, ShieldAlert, Star, Users, type LucideIcon } from 'lucide-react';
import { destinationApi, eventApi, feedApi, reviewApi, userApi } from '@/lib/api';
import { getTimeline } from '@/lib/types';

const DAY_MS = 86_400_000;

function Kpi({ title, value, note, icon: Icon, href, className }: { title: string; value: number | string; note: string; icon: LucideIcon; href: string; className: string }) {
  return (
    <Link href={href} className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs hover:shadow-md hover:border-[#006971]/30 transition-all">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-gray-500">{title}</span>
        <span className={`w-9 h-9 rounded-xl flex items-center justify-center ${className}`}><Icon className="w-5 h-5" /></span>
      </div>
      <p className="text-2xl font-black text-gray-900 mt-3">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{note}</p>
    </Link>
  );
}

// Loại nội dung trong hàng đợi kiểm duyệt
const KIND = {
  review: { label: 'Đánh giá', icon: Star, className: 'bg-cyan-50 text-cyan-700' },
  poi: { label: 'Địa điểm mới', icon: MapPin, className: 'bg-amber-50 text-amber-600' },
  event: { label: 'Sự kiện', icon: Calendar, className: 'bg-orange-50 text-[#a43c12]' },
  post: { label: 'Bài đăng', icon: MessageSquare, className: 'bg-[#e6f4f2] text-[#006971]' }
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { counts, moderation, refresh } = usePending();
  const { run, busy } = useAction();
  const isAdmin = user?.role === 'ADMIN';

  const destinations = useApi(destinationApi.listAll);
  const events = useApi(eventApi.listAll);
  const posts = useApi(() => feedApi.listByStatus('PENDING'));
  const reviews = useApi(() => reviewApi.listByStatus('PENDING')); // lỗi (backend chưa có API) thì bỏ qua, không có mục đánh giá
  // Danh sách tài khoản chỉ ADMIN xem được
  const users = useApi(userApi.list, [], isAdmin);

  const pendingTotal = moderation + counts.events;
  const allDestinations = destinations.data ?? [];
  const approved = allDestinations.filter((d) => d.status === 'APPROVED');

  const upcoming = (events.data ?? [])
    .filter((e) => e.status === 'APPROVED')
    .map((e) => ({ e, timeline: getTimeline(e) }))
    .filter((x) => x.timeline !== 'ENDED')
    .sort((a, b) => a.e.startDate.localeCompare(b.e.startDate));

  // Hàng đợi = địa điểm + sự kiện + bài đăng đang chờ duyệt, gửi trước xử lý trước
  const queue = [
    ...(reviews.data ?? []).map((r) => ({ key: `r${r.id}`, kind: 'review' as const, id: r.id, at: r.createdAt, title: `${r.user?.fullName ?? 'Du khách'} đánh giá ${r.rating}★`, sub: r.destination?.name ?? '', text: r.comment })),
    ...(destinations.data ?? []).filter((d) => d.status === 'PENDING').map((d) => ({ key: `d${d.id}`, kind: 'poi' as const, id: d.id, at: d.createdAt, title: d.name, sub: d.district, text: d.description })),
    ...(events.data ?? []).filter((e) => e.status === 'PENDING').map((e) => ({ key: `e${e.id}`, kind: 'event' as const, id: e.id, at: e.createdAt, title: e.name, sub: `${formatDate(e.startDate)} — ${formatDate(e.endDate)}`, text: e.description })),
    ...(posts.data ?? []).map((p) => ({ key: `p${p.id}`, kind: 'post' as const, id: p.id, at: p.createdAt, title: `${p.user.fullName} đăng bài`, sub: 'Cộng đồng', text: p.content }))
  ].sort((a, b) => a.at.localeCompare(b.at));

  const approve = async (item: (typeof queue)[number]) => {
    const ok = await run(async () => {
      if (item.kind === 'review') await reviewApi.setStatus(item.id, 'APPROVED');
      else if (item.kind === 'poi') await destinationApi.setStatus(item.id, 'APPROVED');
      else if (item.kind === 'event') await eventApi.setStatus(item.id, 'APPROVED');
      else await feedApi.setStatus(item.id, 'APPROVED');
    }, 'Đã duyệt.');
    if (ok) {
      destinations.reload();
      events.reload();
      posts.reload();
      reviews.reload();
      refresh();
    }
  };

  const newUsers7d = (users.data ?? []).filter((u) => Date.now() - Date.parse(u.createdAt) < 7 * DAY_MS);
  const daysUntil = (startDate: string) => Math.round((Date.parse(startDate.slice(0, 10)) - Date.parse(todayIso())) / DAY_MS);

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Tổng Quan Hệ Thống" breadcrumb="Dashboard" />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <AsyncContent loading={destinations.loading || events.loading} error={destinations.error || events.error} data={destinations.data && events.data} onRetry={() => { destinations.reload(); events.reload(); }}>
          {() => (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <Kpi title="Cần kiểm duyệt" value={pendingTotal} note={`${counts.reviews} đánh giá · ${counts.destinations} địa điểm · ${counts.events} sự kiện · ${counts.feedPosts} bài đăng`} icon={ShieldAlert} href="/moderation" className="bg-amber-50 text-amber-600" />
                <Kpi title="Điểm đến đang hiển thị" value={approved.length} note={`${allDestinations.length} điểm đến trong hệ thống`} icon={MapPin} href="/destinations" className="bg-[#e6f4f2] text-[#006971]" />
                {isAdmin && users.data && <Kpi title="Tài khoản mới (7 ngày)" value={newUsers7d.length} note={`${users.data.filter((u) => u.status === 'PENDING').length} tài khoản chờ kích hoạt`} icon={Users} href="/users" className="bg-purple-50 text-purple-600" />}
                <Kpi title="Sự kiện đang & sắp diễn ra" value={upcoming.length} note={`${events.data?.length ?? 0} sự kiện trong hệ thống`} icon={Calendar} href="/events" className="bg-orange-50 text-[#a43c12]" />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Hàng đợi kiểm duyệt */}
                <section className="lg:col-span-2 bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">Hàng Đợi Kiểm Duyệt</h3>
                      <p className="text-xs text-gray-500">Gửi trước xử lý trước · duyệt nhanh ngay tại đây</p>
                    </div>
                    <Link href="/moderation" className="text-xs font-bold text-[#006971] hover:underline flex items-center gap-1">Xem tất cả <ChevronRight className="w-3.5 h-3.5" /></Link>
                  </div>

                  {queue.length === 0 ? (
                    <div className="py-10 text-center text-gray-400">
                      <Inbox className="w-10 h-10 mx-auto mb-2 text-[#006971]/40" />
                      <p className="text-xs font-semibold">Đã xử lý hết. Không còn nội dung chờ duyệt.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {queue.slice(0, 5).map((item) => {
                        const { label, icon: Icon, className } = KIND[item.kind];
                        return (
                          <div key={item.key} className="py-3 flex items-start gap-3">
                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${className}`}><Icon className="w-4 h-4" /></div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <p className="text-xs font-bold text-gray-900">{item.title}</p>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">{label}</span>
                              </div>
                              <p className="text-[11px] text-[#006971] font-semibold">{item.sub}</p>
                              {item.text && <p className="text-[11px] text-gray-500 line-clamp-1 mt-0.5">{item.text}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-1.5 shrink-0">
                              <span className="text-[10px] text-gray-400">{timeAgo(item.at)}</span>
                              <button onClick={() => approve(item)} disabled={busy} className="px-2.5 py-1 bg-[#006971] hover:bg-[#005258] text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-60">
                                <CheckCircle2 className="w-3 h-3" /> Duyệt
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Sự kiện */}
                <section className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-sm text-gray-900">Sự Kiện Đang & Sắp Diễn Ra</h3>
                      <p className="text-xs text-gray-500">Đang được gợi ý vào lịch trình</p>
                    </div>
                    <Calendar className="w-5 h-5 text-[#006971]" />
                  </div>
                  <div className="space-y-3 flex-1">
                    {upcoming.length === 0 && <p className="text-xs text-gray-400 py-6 text-center">Chưa có sự kiện sắp tới.</p>}
                    {upcoming.slice(0, 4).map(({ e, timeline }) => (
                      <div key={e.id} className="flex gap-3 p-2.5 rounded-xl border border-gray-100 hover:border-[#006971]/30 hover:bg-[#e6f4f2]/40 transition-all">
                        {e.images[0] ? (
                          <img src={e.images[0].imageUrl} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><ImageOff className="w-4 h-4 text-gray-300" /></div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-gray-900 line-clamp-1">{e.name}</p>
                          <p className="text-[11px] text-gray-500">{formatDate(e.startDate)} — {formatDate(e.endDate)}</p>
                          <span className={`inline-block mt-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${timeline === 'HAPPENING' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {timeline === 'HAPPENING' ? 'Đang diễn ra' : `Còn ${daysUntil(e.startDate)} ngày`}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <Link href="/events" className="mt-4 w-full py-2.5 rounded-xl border border-[#e2e8f0] hover:bg-[#e6f4f2]/50 text-xs font-bold text-[#006971] flex items-center justify-center gap-1 transition-colors">
                    Quản lý sự kiện <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </section>
              </div>

              <div className={`grid grid-cols-1 gap-6 ${isAdmin && users.data ? 'lg:grid-cols-2' : ''}`}>
                {/* Tài khoản mới (chỉ ADMIN xem được danh sách tài khoản) */}
                {isAdmin && users.data && (
                  <section className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-sm text-gray-900">Tài Khoản Mới Đăng Ký</h3>
                      <Link href="/users" className="text-xs font-bold text-[#006971] hover:underline flex items-center gap-1">Quản lý <ChevronRight className="w-3.5 h-3.5" /></Link>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {[...users.data].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5).map((u) => (
                        <div key={u.id} className="py-2.5 flex items-center gap-3">
                          <img src={u.avatarUrl || avatarFallback(u.username)} alt="" className="w-9 h-9 rounded-lg bg-[#e6f4f2] border border-gray-200 object-cover" />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-900">{u.fullName}</p>
                            <p className="text-[11px] text-gray-400 truncate">{u.email}</p>
                          </div>
                          {u.status === 'PENDING' ? (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">Chờ kích hoạt</span>
                          ) : (
                            <span className="text-[10px] text-gray-400">{timeAgo(u.createdAt)}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                <section className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-sm text-gray-900">Điểm Đến Thêm Gần Đây</h3>
                    <Link href="/destinations" className="text-xs font-bold text-[#006971] hover:underline flex items-center gap-1">Xem thêm <ChevronRight className="w-3.5 h-3.5" /></Link>
                  </div>
                  {allDestinations.length === 0 ? (
                    <p className="text-xs text-gray-400 py-6 text-center">Chưa có điểm đến nào.</p>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {allDestinations.slice(0, 5).map((d) => (
                        <div key={d.id} className="py-2.5 flex items-center gap-3">
                          {d.images?.[0] ? <img src={d.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-200" /> : <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0"><ImageOff className="w-4 h-4 text-gray-300" /></div>}
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-gray-900 line-clamp-1">{d.name}</p>
                            <p className="text-[11px] text-gray-500">{d.district}</p>
                          </div>
                          <span className="text-[10px] text-gray-400 shrink-0">{timeAgo(d.createdAt)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </AsyncContent>
      </div>
    </div>
  );
}
