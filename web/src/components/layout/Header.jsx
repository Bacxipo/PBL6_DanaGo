'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import UserAvatar from '@/components/comon/ui/UserAvatar';
import { getMyProfile } from '@/lib/feed-api';
import { useEffect, useState } from 'react';
import { Compass, ArrowUpRight } from 'lucide-react';

export default function Header() {
    const [profile, setProfile] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authReady, setAuthReady] = useState(false);

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
            if (!token) return;
            try {
                const user = await getMyProfile(token);
                if (
                    active &&
                    request === generation &&
                    token === sessionStorage.getItem('accessToken')
                )
                    setProfile(user);
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
                    className="flex items-center gap-2.5 text-2xl font-bold tracking-tight text-[#006971]"
                >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#006971] text-white">
                        <Compass size={22} aria-hidden="true" />
                    </span>
                    DanaGo<span className="text-[#ed9b50]">.</span>
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
                    <Link href="/ai-plan" className={getLinkClass('/ai-plan')}>
                        AI Gợi ý
                    </Link>
                </nav>
                <div className="flex min-w-24 items-center justify-end">
                    {authReady &&
                        (isLoggedIn ? (
                            <Link
                                href="/personal"
                                aria-label="Trang cá nhân"
                                className="flex items-center text-gray-600 hover:text-[#006971] transition-colors"
                            >
                                <UserAvatar user={profile} size={32} />
                            </Link>
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
