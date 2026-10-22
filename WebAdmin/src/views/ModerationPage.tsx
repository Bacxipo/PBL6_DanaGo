'use client';

import { useState } from 'react';
import Header from '@/components/Header';
import { StatusBadge, StatusFilter, AsyncContent, EmptyState } from '@/components/ui';
import { useApi, removeById, avatarFallback, isMissingApi, timeAgo } from '@/lib/utils';
import { useAction, useAuth, usePending } from '@/lib/context';
import type { ContentStatus } from '@/lib/types';
import { CheckCircle2, XCircle, ExternalLink, MapPin, MessageSquare, Heart, Star } from 'lucide-react';
import { destinationApi, feedApi, reviewApi, userApi } from '@/lib/api';

type Tab = 'reviews' | 'pois' | 'posts';

// Nút duyệt / từ chối dùng chung cho cả 2 loại nội dung
function ReviewButtons({ status, busy, onSet }: { status: ContentStatus; busy: boolean; onSet: (s: ContentStatus) => void }) {
  return (
    <div className="flex items-center gap-2">
      {status !== 'APPROVED' && (
        <button disabled={busy} onClick={() => onSet('APPROVED')} className="px-3 py-1.5 bg-[#006971] hover:bg-[#005258] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60">
          <CheckCircle2 className="w-3.5 h-3.5" /> Phê duyệt
        </button>
      )}
      {status !== 'REJECTED' && (
        <button disabled={busy} onClick={() => onSet('REJECTED')} className="px-3 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-60">
          <XCircle className="w-3.5 h-3.5" /> Từ chối
        </button>
      )}
    </div>
  );
}

export default function ModerationPage() {
  const { user } = useAuth();
  const { counts, refresh } = usePending();
  const { run, busy } = useAction();
  const [tab, setTab] = useState<Tab>('reviews');
  const [status, setStatus] = useState<ContentStatus>('PENDING');

  const reviews = useApi(() => reviewApi.listByStatus(status), [status], tab === 'reviews');
  const reviewsMissing = isMissingApi(reviews.error); // backend chưa có API duyệt đánh giá
  const pois = useApi(() => destinationApi.listByStatus(status), [status], tab === 'pois');
  const posts = useApi(() => feedApi.listByStatus(status), [status], tab === 'posts');
  // Chỉ ADMIN xem được danh sách tài khoản -> dùng để hiện tên người gửi địa điểm
  const users = useApi(userApi.list, [], user?.role === 'ADMIN');
  const userName = (id?: number) => users.data?.find((u) => u.id === id)?.fullName ?? (id ? `Tài khoản #${id}` : 'Quản trị viên');

  // Đổi trạng thái xong thì bỏ mục khỏi danh sách đang lọc
  const moderate = (kind: Tab, id: number, next: ContentStatus) =>
    run(async () => {
      if (kind === 'reviews') {
        await reviewApi.setStatus(id, next);
        reviews.setData((xs) => removeById(xs, id));
      } else if (kind === 'pois') {
        await destinationApi.setStatus(id, next);
        pois.setData((xs) => removeById(xs, id));
      } else {
        await feedApi.setStatus(id, next);
        posts.setData((xs) => removeById(xs, id));
      }
      refresh();
    }, next === 'APPROVED' ? 'Đã phê duyệt.' : 'Đã từ chối.');

  const tabs = [
    { key: 'reviews' as const, label: 'Đánh giá của du khách', icon: Star, count: counts.reviews },
    { key: 'pois' as const, label: 'Địa điểm đề xuất', icon: MapPin, count: counts.destinations },
    { key: 'posts' as const, label: 'Bài đăng cộng đồng', icon: MessageSquare, count: counts.feedPosts }
  ];

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Kiểm Duyệt Nội Dung" breadcrumb="Kiểm duyệt cộng đồng" />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex border-b border-[#e2e8f0] gap-6">
          {tabs.map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)} className={`pb-3.5 px-2 text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${tab === t.key ? 'text-[#006971] border-b-2 border-[#006971]' : 'text-gray-500 hover:text-gray-900'}`}>
              <t.icon className="w-4 h-4" /> {t.label}
              {t.count > 0 && <span className="px-2 py-0.5 text-xs rounded-full bg-amber-100 text-amber-800 font-bold">{t.count}</span>}
            </button>
          ))}
        </div>

        <StatusFilter value={status} onChange={setStatus} />

        {tab === 'reviews' && (
          <AsyncContent loading={reviews.loading} error={reviewsMissing ? null : reviews.error} data={reviewsMissing ? [] : reviews.data} onRetry={reviews.reload}>
            {(list) =>
              list.length === 0 ? (
                <EmptyState icon={Star} title="Không có đánh giá nào trong mục này" />
              ) : (
                <div className="space-y-3">
                  {list.map((r) => (
                    <div key={r.id} className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs hover:border-[#006971]/40 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <img src={r.user?.avatarUrl || avatarFallback(r.user?.fullName ?? String(r.userId))} alt="" className="w-11 h-11 rounded-full bg-[#e6f4f2] border border-gray-200 shrink-0 object-cover" />
                        <div className="space-y-1.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-gray-900 text-sm">{r.user?.fullName ?? `Tài khoản #${r.userId}`}</span>
                            <span className="text-xs text-gray-400">• {timeAgo(r.createdAt)}</span>
                            <span className="text-xs text-gray-500">tại</span>
                            <span className="text-xs font-bold text-[#006971] bg-[#e6f4f2] px-2 py-0.5 rounded-md">{r.destination?.name ?? `Điểm đến #${r.destinationId}`}</span>
                          </div>
                          <div className="flex items-center gap-0.5" aria-label={`${r.rating} trên 5 sao`}>
                            {[...Array(5)].map((_, i) => <span key={i} className={`text-sm ${i < r.rating ? 'text-amber-400' : 'text-gray-200'}`}>★</span>)}
                          </div>
                          {r.comment && <p className="text-gray-700 text-sm leading-relaxed">&ldquo;{r.comment}&rdquo;</p>}
                          {r.images.length > 0 && (
                            <div className="flex gap-2 pt-1">{r.images.map((url) => <img key={url} src={url} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />)}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                        <StatusBadge status={r.status} />
                        <ReviewButtons status={r.status} busy={busy} onSet={(s) => moderate('reviews', r.id, s)} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </AsyncContent>
        )}

        {tab === 'pois' && (
          <AsyncContent loading={pois.loading} error={pois.error} data={pois.data} onRetry={pois.reload}>
            {(list) =>
              list.length === 0 ? (
                <EmptyState icon={MapPin} title="Không có địa điểm nào trong mục này" />
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {list.map((d) => (
                    <div key={d.id} className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-700">{d.district}</span>
                          <h4 className="font-bold text-base text-gray-900 mt-1">{d.name}</h4>
                        </div>
                        <StatusBadge status={d.status} />
                      </div>
                      {d.description && <p className="text-xs text-gray-600 leading-relaxed bg-[#e6f4f2] p-3 rounded-xl">&ldquo;{d.description}&rdquo;</p>}
                      <dl className="grid grid-cols-2 gap-2 text-xs">
                        <div><dt className="text-gray-400 text-[10px] uppercase font-semibold">Tọa độ GPS</dt><dd className="font-mono text-gray-800">{d.latitude ?? '—'}, {d.longitude ?? '—'}</dd></div>
                        <div>
                          <dt className="text-gray-400 text-[10px] uppercase font-semibold">Bản đồ</dt>
                          <dd>{d.addressUrl ? <a href={d.addressUrl} target="_blank" rel="noreferrer" className="text-[#006971] hover:underline inline-flex items-center gap-1">Mở Google Maps <ExternalLink className="w-3 h-3" /></a> : <span className="text-rose-600">Chưa có link</span>}</dd>
                        </div>
                        <div><dt className="text-gray-400 text-[10px] uppercase font-semibold">Giờ mở cửa</dt><dd className="text-gray-800">{d.openHours ?? '—'}</dd></div>
                        <div><dt className="text-gray-400 text-[10px] uppercase font-semibold">Giá vé</dt><dd className="text-gray-800">{d.ticketPrice ?? '—'}</dd></div>
                      </dl>
                      <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-gray-500">Người gửi: <b className="text-gray-700">{userName(d.createdBy)}</b> · {timeAgo(d.createdAt)}</span>
                        <ReviewButtons status={d.status} busy={busy} onSet={(s) => moderate('pois', d.id, s)} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </AsyncContent>
        )}

        {tab === 'posts' && (
          <AsyncContent loading={posts.loading} error={posts.error} data={posts.data} onRetry={posts.reload}>
            {(list) =>
              list.length === 0 ? (
                <EmptyState icon={MessageSquare} title="Không có bài đăng nào trong mục này" />
              ) : (
                <div className="space-y-3">
                  {list.map((p) => (
                    <div key={p.id} className="bg-white rounded-2xl border border-[#e2e8f0] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="flex items-start gap-4 min-w-0">
                        <img src={p.user.avatarUrl || avatarFallback(p.user.username)} alt="" className="w-11 h-11 rounded-full bg-[#e6f4f2] border border-gray-200 shrink-0 object-cover" />
                        <div className="space-y-1.5 min-w-0">
                          <p className="text-sm"><b className="text-gray-900">{p.user.fullName}</b> <span className="text-xs text-gray-400">• {timeAgo(p.createdAt)}</span></p>
                          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">{p.content}</p>
                          {p.images.length > 0 && (
                            <div className="flex gap-2 pt-1">{p.images.map((im) => <img key={im.id} src={im.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover border border-gray-200" />)}</div>
                          )}
                          <p className="text-[11px] text-gray-400 flex items-center gap-3"><span className="flex items-center gap-1"><Heart className="w-3 h-3" />{p._count.likes}</span><span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{p._count.comments}</span></p>
                        </div>
                      </div>
                      <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                        <StatusBadge status={p.status} />
                        <ReviewButtons status={p.status} busy={busy} onSet={(s) => moderate('posts', p.id, s)} />
                      </div>
                    </div>
                  ))}
                </div>
              )
            }
          </AsyncContent>
        )}
      </div>
    </div>
  );
}
