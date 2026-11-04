'use client';

import { useMemo, useState } from 'react';
import Header from '@/components/Header';
import { CategoryIcon, ErrorState, LoadingState } from '@/components/ui';
import { useApi, isMissingApi } from '@/lib/utils';
import { statsApi } from '@/lib/api';
import type { Trends } from '@/lib/types';
import { Compass, Download, Heart, MessageSquare, Route, Star, Users, Wallet, type LucideIcon } from 'lucide-react';

const RANGES = [
  { days: 30, label: '30 ngày' },
  { days: 90, label: '3 tháng' },
  { days: 180, label: '6 tháng' },
  { days: 365, label: '12 tháng' }
];

// Cột biểu đồ rỗng (≤31 ngày: theo tuần, còn lại: theo tháng) để giao diện luôn đủ khung khi chưa có dữ liệu
function emptyBuckets(days: number): Trends['itineraryTrend'] {
  const now = new Date();
  if (days <= 31) {
    return Array.from({ length: Math.ceil(days / 7) }, (_, i) => {
      const d = new Date(now.getTime() - (Math.ceil(days / 7) - 1 - i) * 7 * 86400000);
      return { label: `${d.getDate()}/${d.getMonth() + 1}`, from: '', to: '', count: 0 };
    });
  }
  const months = Math.max(1, Math.round(days / 30));
  return Array.from({ length: months }, (_, i) => ({ label: `T${new Date(now.getFullYear(), now.getMonth() - (months - 1 - i), 1).getMonth() + 1}`, from: '', to: '', count: 0 }));
}

const emptyTrends = (days: number): Trends => ({ days, itineraries: 0, newUsers: 0, reviews: 0, avgTripDays: 0, avgBudget: 0, itineraryTrend: emptyBuckets(days), categories: [], districts: [], topDestinations: [] });

function Kpi({ label, value, icon: Icon, className, rangeLabel }: { label: string; value: string; icon: LucideIcon; className: string; rangeLabel: string }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-[#e2e8f0] shadow-xs">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-semibold text-gray-500 uppercase">{label}</span>
        <span className={`p-2 rounded-xl ${className}`}><Icon className="w-4 h-4" /></span>
      </div>
      <h3 className="text-2xl font-black text-gray-900 mt-2">{value}</h3>
      <p className="text-[11px] text-gray-400 mt-0.5">{rangeLabel} gần nhất</p>
    </div>
  );
}

function Bars({ title, hint, rows, icon }: { title: string; hint: string; rows: { key: string; label: string; count: number; icon?: string }[]; icon?: boolean }) {
  const max = Math.max(1, ...rows.map((r) => r.count));
  return (
    <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs space-y-4">
      <div>
        <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
        <p className="text-xs text-gray-400">{hint}</p>
      </div>
      {rows.length === 0 && <p className="text-xs text-gray-400 py-8 text-center">Chưa có dữ liệu trong khoảng thời gian này.</p>}
      <div className="space-y-3.5">
        {rows.map((r) => (
          <div key={r.key} className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-gray-700 flex items-center gap-1.5">{icon && <CategoryIcon name={r.icon} className="w-3.5 h-3.5 text-gray-400" />}{r.label}</span>
              <span className="font-bold text-gray-900">{r.count} <span className="font-normal text-gray-400">lượt</span></span>
            </div>
            <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#006971] rounded-full transition-all duration-500" style={{ width: `${(r.count / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [days, setDays] = useState(180);
  const { data, error, loading } = useApi(() => statsApi.trends(days), [days]);

  // Backend chưa có API: hiện đủ khung với số liệu 0
  const missing = isMissingApi(error);
  const t = useMemo(() => data ?? emptyTrends(days), [data, days]);
  const rangeLabel = RANGES.find((r) => r.days === days)!.label;
  const trendMax = Math.max(1, ...t.itineraryTrend.map((b) => b.count));

  const exportCsv = () => {
    const rows = [['Hạng', 'Điểm đến', 'Danh mục', 'Quận/Huyện', 'Lượt vào lịch trình', 'Lượt yêu thích', 'Đánh giá mới', 'Điểm TB'], ...t.topDestinations.map((d, i) => [i + 1, d.name, d.categoryName ?? '', d.district, d.inItineraries, d.favorites, d.reviews, d.avgRating])];
    const csv = '﻿' + rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `danago-bao-cao-${days}-ngay.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 flex flex-col">
      <Header title="Thống Kê & Báo Cáo" breadcrumb="Phân tích dữ liệu du lịch" />

      <div className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black text-gray-900">Phân Tích Xu Hướng Du Lịch</h2>
            <p className="text-xs text-gray-500 mt-0.5">Tổng hợp từ lịch trình, đánh giá và lượt yêu thích của du khách</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-white border border-[#e2e8f0] rounded-xl p-0.5 text-xs font-bold">
              {RANGES.map((r) => (
                <button key={r.days} onClick={() => setDays(r.days)} className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${days === r.days ? 'bg-[#006971] text-white shadow-xs' : 'text-gray-500 hover:text-gray-900'}`}>
                  {r.label}
                </button>
              ))}
            </div>
            <button onClick={exportCsv} className="flex items-center gap-2 px-3.5 py-2 border border-[#e2e8f0] bg-white hover:bg-gray-50 text-gray-700 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer">
              <Download className="w-4 h-4 text-[#006971]" /> Xuất CSV
            </button>
          </div>
        </div>

        {error && !missing && <ErrorState message={error} />}
        {loading && !data && !missing && <LoadingState />}

        {(data || missing) && (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              <Kpi label="Lịch trình tạo mới" value={String(t.itineraries)} icon={Route} className="bg-[#e6f4f2] text-[#006971]" rangeLabel={rangeLabel} />
              <Kpi label="Du khách mới" value={String(t.newUsers)} icon={Users} className="bg-purple-50 text-purple-700" rangeLabel={rangeLabel} />
              <Kpi label="Đánh giá gửi lên" value={String(t.reviews)} icon={MessageSquare} className="bg-cyan-50 text-cyan-700" rangeLabel={rangeLabel} />
              <Kpi label="Thời lượng chuyến đi TB" value={`${t.avgTripDays.toFixed(1)} ngày`} icon={Compass} className="bg-amber-50 text-amber-700" rangeLabel={rangeLabel} />
              <Kpi label="Ngân sách TB / chuyến" value={`${(t.avgBudget / 1_000_000).toFixed(1)} tr đ`} icon={Wallet} className="bg-orange-50 text-[#a43c12]" rangeLabel={rangeLabel} />
            </div>

            {/* Xu hướng tạo lịch trình */}
            <div className="bg-white p-6 rounded-2xl border border-[#e2e8f0] shadow-xs">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="font-bold text-sm text-gray-900">Lịch trình được tạo theo {days <= 31 ? 'tuần' : 'tháng'}</h3>
                  <p className="text-xs text-gray-500">Số lịch trình theo ngày tạo</p>
                </div>
                <span className="text-xs font-bold text-[#006971] bg-[#e6f4f2] px-2.5 py-1 rounded-lg">Tổng: {t.itineraries}</span>
              </div>
              <div className="h-52 flex items-end gap-2 sm:gap-3 border-b border-gray-200 px-1" role="img" aria-label={`Biểu đồ cột: ${t.itineraryTrend.map((b) => `${b.label} ${b.count}`).join(', ')}`}>
                {t.itineraryTrend.map((b, i) => (
                  <div key={`${b.label}-${i}`} className="flex-1 h-full flex flex-col justify-end items-center group relative">
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 -translate-y-full px-2 py-1 rounded-md bg-gray-900 text-white text-[10px] font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">{b.label}: {b.count} lịch trình</div>
                    <span className="text-[10px] font-bold text-gray-500 mb-1">{b.count > 0 ? b.count : ''}</span>
                    <div className="w-full max-w-14 bg-[#006971] group-hover:bg-[#005258] rounded-t transition-all duration-500" style={{ height: `${(b.count / trendMax) * 85}%`, minHeight: b.count > 0 ? 4 : 0 }} />
                  </div>
                ))}
              </div>
              <div className="flex gap-2 sm:gap-3 px-1 pt-2">
                {t.itineraryTrend.map((b, i) => <span key={`${b.label}-${i}`} className="flex-1 text-center text-[11px] font-bold text-gray-500">{b.label}</span>)}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Bars title="Danh mục được đưa vào lịch trình" hint="Số lượt điểm đến thuộc từng danh mục" icon rows={t.categories.map((c) => ({ key: String(c.id), label: c.name, count: c.count, icon: c.iconUrl }))} />
              <Bars title="Quận / huyện được ghé nhiều nhất" hint="Theo quận của điểm đến trong lịch trình" rows={t.districts.map((d) => ({ key: d.name, label: d.name, count: d.count }))} />
            </div>

            {/* Top điểm đến */}
            <div className="bg-white rounded-2xl border border-[#e2e8f0] shadow-xs overflow-hidden">
              <div className="p-6 pb-4">
                <h3 className="font-bold text-sm text-gray-900">Top điểm đến trong {rangeLabel.toLowerCase()} gần nhất</h3>
                <p className="text-xs text-gray-500">Xếp theo số lần được thêm vào lịch trình, sau đó theo lượt yêu thích</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-[#e6f4f2] border-y border-[#e2e8f0] text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                      <th className="py-3 pl-6">#</th>
                      <th className="py-3 px-3">Điểm đến</th>
                      <th className="py-3 px-3">Danh mục</th>
                      <th className="py-3 px-3 text-right">Vào lịch trình</th>
                      <th className="py-3 px-3 text-right">Yêu thích</th>
                      <th className="py-3 px-3 text-right">Đánh giá mới</th>
                      <th className="py-3 pr-6 text-right">Điểm TB</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-xs">
                    {t.topDestinations.length === 0 && (
                      <tr><td colSpan={7} className="py-8 text-center text-gray-400">Chưa có dữ liệu trong khoảng thời gian này.</td></tr>
                    )}
                    {t.topDestinations.map((d, i) => (
                      <tr key={d.id} className="hover:bg-[#e6f4f2]/40 transition-colors">
                        <td className="py-3 pl-6 font-bold text-gray-400">{i + 1}</td>
                        <td className="py-3 px-3"><p className="font-bold text-gray-900">{d.name}</p><p className="text-[11px] text-gray-400">{d.district}</p></td>
                        <td className="py-3 px-3">{d.categoryName && <span className="px-2 py-0.5 rounded-md bg-[#e6f4f2] text-[#006971] font-semibold text-[11px]">{d.categoryName}</span>}</td>
                        <td className="py-3 px-3 text-right font-bold text-gray-900 tabular-nums">{d.inItineraries}</td>
                        <td className="py-3 px-3 text-right tabular-nums"><span className="inline-flex items-center gap-1 text-gray-700"><Heart className="w-3 h-3 text-rose-400" />{d.favorites}</span></td>
                        <td className="py-3 px-3 text-right text-gray-700 tabular-nums">{d.reviews}</td>
                        <td className="py-3 pr-6 text-right"><span className="inline-flex items-center gap-1 font-bold text-gray-900"><Star className="w-3.5 h-3.5 fill-[#FFB347] text-[#FFB347]" />{d.avgRating.toFixed(1)}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
