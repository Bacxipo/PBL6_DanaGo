'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MapPin, ShieldCheck, Users, BarChart3, Calendar, Tags, LogOut, Compass, ExternalLink, type LucideIcon } from 'lucide-react';
import { useAuth, usePending } from '@/lib/context';
import { ROLE_LABEL } from '@/lib/types';

const WEB_USER_URL = process.env.NEXT_PUBLIC_WEB_USER_URL || 'http://localhost:3000';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  badge?: number;
  adminOnly?: boolean;
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { counts, moderation } = usePending();

  const navItems: NavItem[] = [
    { to: '/dashboard', label: 'Tổng quan', icon: LayoutDashboard },
    { to: '/destinations', label: 'Điểm đến du lịch', icon: MapPin },
    { to: '/categories', label: 'Danh mục', icon: Tags },
    { to: '/moderation', label: 'Kiểm duyệt nội dung', icon: ShieldCheck, badge: moderation },
    { to: '/users', label: 'Quản lý tài khoản', icon: Users, adminOnly: true },
    { to: '/analytics', label: 'Thống kê & Báo cáo', icon: BarChart3 },
    { to: '/events', label: 'Sự kiện & Lễ hội', icon: Calendar, badge: counts.events }
  ];

  return (
    <aside className="w-64 bg-white border-r border-[#e2e8f0] flex flex-col h-screen sticky top-0 z-30 select-none shadow-sm">
      <div className="p-5 border-b border-[#f1f5f9] flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#006971] text-white flex items-center justify-center shadow-md shadow-[#006971]/20">
          <Compass className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xl tracking-tight text-[#006971]">DaNaGo</span>
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#e6f4f2] text-[#006971]">Admin</span>
          </div>
          <p className="text-xs text-gray-500 font-medium">Cổng Quản Trị Hệ Thống</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 pb-2 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Phân hệ Quản Lý</div>
        {navItems
          .filter((item) => !item.adminOnly || user?.role === 'ADMIN')
          .map(({ to, label, icon: Icon, badge }) => {
            const active = pathname === to;
            return (
              <Link
                key={to}
                href={to}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all ${
                  active ? 'bg-[#006971] text-white shadow-sm shadow-[#006971]/25 font-semibold' : 'text-gray-600 hover:bg-[#f1f5f9] hover:text-[#006971]'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
                  {label}
                </span>
                {!!badge && <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${active ? 'bg-white text-[#006971]' : 'bg-[#FFB347]/20 text-[#a43c12]'}`}>{badge}</span>}
              </Link>
            );
          })}
      </nav>

      <div className="p-3 border-t border-[#e2e8f0] space-y-2 bg-[#e6f4f2]/40">
        <a href={WEB_USER_URL} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-gray-600 hover:text-[#006971] hover:bg-white rounded-lg transition-colors">
          <ExternalLink className="w-3.5 h-3.5" /> Xem Web Du Khách
        </a>
        <div className="flex items-center justify-between p-2 rounded-xl bg-white border border-[#e2e8f0]/80 shadow-xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-[#006971] text-white flex items-center justify-center font-bold text-sm shrink-0">{user?.fullName.charAt(0).toUpperCase()}</div>
            <div className="truncate">
              <p className="text-xs font-bold text-gray-900 truncate">{user?.fullName}</p>
              <p className="text-[10px] text-[#006971] font-semibold">{user && ROLE_LABEL[user.role]}</p>
            </div>
          </div>
          <button onClick={logout} title="Đăng xuất" aria-label="Đăng xuất" className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
