'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import UserAvatar from '@/components/comon/ui/UserAvatar';
import { getMyProfile } from '@/lib/feed-api';
import { useEffect, useState } from 'react';
import { ArrowUpRight, Bell } from 'lucide-react';
import { getMyNotifications } from '@/lib/notification-api';

export default function Header() {
    const [profile, setProfile] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authReady, setAuthReady] = useState(false);
    const [unreadNotifications, setUnreadNotifications] = useState(0);

    const pathname = usePathname();

    useEffect(() => {
        let active = true;
        let generation = 0;
        const syncAuth = async () => {
            const request = ++generation;
            const token = sessionStorage.getItem('accessToken');
            setIsLoggedIn(Boolean(token));
            setAuthReady(true);
            setProfile(null);
            if (!token) {
                setUnreadNotifications(0);
                return;
            }
            try {
                const [userResult, notificationsResult] = await Promise.allSettled([
                    getMyProfile(token),
                    getMyNotifications(token),
                ]);
                if (userResult.status === 'fulfilled' &&
                    active &&
                    request === generation &&
                    token === sessionStorage.getItem('accessToken')
                )
                    setProfile(userResult.value);
                if (notificationsResult.status === 'fulfilled' && active && token === sessionStorage.getItem('accessToken')) {
                    setUnreadNotifications(notificationsResult.value.filter((item) => !item.isRead).length);
                }
            } catch {
                if (active && request === generation) setProfile(null);
            }
        };

        syncAuth();

        window.addEventListener('auth-changed', syncAuth);

        return () => {
            active = false;
            window.removeEventListener('auth-changed', syncAuth);
        };
    }, [pathname]);

    const getLinkClass = (path) => {
        const isActive =
            pathname === path || (path !== '/' && pathname?.startsWith(path));
        return isActive
            ? 'whitespace-nowrap rounded-full bg-teal-50 px-4 py-2 text-sm font-semibold text-[#006971]'
            : 'whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-[#006971]';
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200/70 bg-white/95 backdrop-blur-xl">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-y-3 px-4 py-4 sm:px-6">
                <Link
                    href="/"
                    className="flex items-center gap-2.5 text-2xl font-extrabold tracking-tight text-[#006971]"
                >
                    <img src="/danago_logo_mark.svg" alt="DanaGo" className="h-9 w-9 object-contain" />
                    <span><span className="text-[#006971]">Dana</span><span className="text-[#ed9b50]">Go</span></span>
                </Link>
                <nav
                    aria-label="Điều hướng chính"
                    className="order-last flex w-full items-center gap-1 overflow-x-auto pb-1 [scrollbar-width:none] md:order-none md:w-auto md:pb-0"
                >
                    <Link href="/" className={getLinkClass('/')}>
                        Trang chủ
                    </Link>
                    <Link href="/explore" className={getLinkClass('/explore')}>
                        Khám phá
                    </Link>
                    <Link href="/lodging" className={getLinkClass('/lodging')}>
                        Nơi lưu trú
                    </Link>
                    {authReady && isLoggedIn && (
                        <Link
                            href="/itinerary"
                            className={getLinkClass('/itinerary')}
                        >
                            Lịch trình
                        </Link>
                    )}
                    <Link
                        href="/community"
                        className={getLinkClass('/community')}
                    >
                        Cộng đồng
                    </Link>
                    <Link
                        href="/ai-plan"
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            pathname === '/ai-plan'
                                ? 'bg-[#006971] text-white shadow-xs'
                                : 'bg-[#e6f4f5] text-[#006971] hover:bg-[#d4eff1]'
                        }`}
                    >
                        <Sparkles size={13} className="text-amber-500 fill-amber-400" />
                        <span>AI Plan</span>
                    </Link>
                </nav>
                <div className="flex min-w-24 items-center justify-end gap-3">
                    {authReady &&
                        (isLoggedIn ? (
                            <>
                            <Link
                                href="/personal"
                                aria-label="Trang cá nhân"
                                className="flex items-center text-gray-600 hover:text-[#006971] transition-colors"
                            >
                                <UserAvatar user={profile} size={32} />
                            </Link>
                            <Link href="/notifications" aria-label="Thông báo" className="relative text-gray-600 transition-colors hover:text-[#006971]">
                                <Bell size={21} />
                                {unreadNotifications > 0 && <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-red-500 px-1 text-center text-[10px] font-bold leading-4 text-white">{unreadNotifications > 99 ? '99+' : unreadNotifications}</span>}
                            </Link>
                            </>
                        ) : (
                            <Link
                                href="/login"
                                className="inline-flex items-center gap-2 rounded-full bg-[#006971] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#005258]"
                            >
                                Đăng nhập{' '}
                                <ArrowUpRight size={15} aria-hidden="true" />
                            </Link>
                        ))}
                </div>
            </div>
        </header>
    );
}
