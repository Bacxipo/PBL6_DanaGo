'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Sparkles } from 'lucide-react';
import { usePending } from '@/lib/context';

export default function Header({ title, breadcrumb }: { title: string; breadcrumb?: string }) {
  const [open, setOpen] = useState(false);
  const { counts } = usePending();

  const tasks = [
    { label: 'đánh giá chờ duyệt', count: counts.reviews, href: '/moderation' },
    { label: 'địa điểm đề xuất chờ duyệt', count: counts.destinations, href: '/moderation' },
    { label: 'bài đăng cộng đồng chờ duyệt', count: counts.feedPosts, href: '/moderation' },
    { label: 'sự kiện chờ duyệt', count: counts.events, href: '/events' }
  ].filter((t) => t.count > 0);

  return (
    <header className="h-16 bg-white border-b border-[#e2e8f0] px-6 flex items-center justify-between sticky top-0 z-20 shadow-2xs">
      <div>
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <span>DaNaGo Admin</span>
          <span>/</span>
          <span className="text-[#006971]">{breadcrumb || title}</span>
        </div>
        <h1 className="text-lg font-bold text-gray-900 tracking-tight">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            aria-label="Việc cần xử lý"
            className="w-9 h-9 rounded-lg border border-[#e2e8f0] flex items-center justify-center text-gray-600 hover:text-[#006971] hover:border-[#006971] bg-white transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4" />
            {tasks.length > 0 && <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-2 ring-2 ring-white" />}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-[#e2e8f0] p-3 z-50">
              <p className="pb-2 border-b border-[#e2e8f0] font-bold text-xs text-gray-900">Việc cần xử lý</p>
              {tasks.length === 0 && <p className="py-6 text-center text-[11px] text-gray-400">Không có nội dung nào đang chờ xử lý.</p>}
              {tasks.map((t) => (
                <Link key={t.label} href={t.href} onClick={() => setOpen(false)} className="flex items-center gap-2 py-2.5 px-2 rounded-lg hover:bg-[#e6f4f2]/60 text-xs text-gray-700">
                  <span className="w-2 h-2 rounded-full bg-[#006971] shrink-0" />
                  <span><b className="text-gray-900">{t.count}</b> {t.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#e6f4f2] text-[#006971] text-xs font-bold border border-[#006971]/20">
          <Sparkles className="w-3.5 h-3.5 text-[#FFB347]" />
          <span>TP. Đà Nẵng</span>
        </div>
      </div>
    </header>
  );
}
