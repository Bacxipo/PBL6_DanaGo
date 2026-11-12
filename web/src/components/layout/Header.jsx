'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sparkles } from 'lucide-react';
import UserAvatar from '@/components/comon/ui/UserAvatar';
import { getMyProfile } from '@/lib/feed-api';
import { useEffect, useState } from 'react';

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
                if (active && request === generation && token === sessionStorage.getItem('accessToken')) setProfile(user);
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
        const isActive = pathname === path || (path !== '/' && pathname?.startsWith(path));
        return isActive
            ? "text-[#006971] font-bold text-sm border-b-2 border-[#006971] pb-1"
            : "text-gray-600 hover:text-[#006971] text-sm font-semibold transition-colors";
    };

    return (
        <header className="bg-white shadow-md w-full py-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="text-[#006971] font-bold text-xl flex items-center gap-2">
                    DanaGo
                </Link>
                <nav className="flex space-x-6 gap-x-8">
                    <Link href="/" className={getLinkClass('/')}>
                        Trang chủ
                    </Link>
                    <Link href="/explore" className={getLinkClass('/explore')}>
                        Khám phá
                    </Link>
                    {authReady && isLoggedIn && (
                        <Link href="/itinerary" className={getLinkClass('/itinerary')}>
                            Lịch trình
                        </Link>
                    )}
                    <Link href="/community" className={getLinkClass('/community')}>
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
                <div className="flex min-w-24 items-center justify-end">
                    {authReady && (
                        isLoggedIn ? (
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
                                className="text-sm font-semibold text-gray-600 hover:text-[#006971]"
                            >
                                Đăng nhập
                            </Link>
                        )
                    )}
                </div>
            </div>
        </header>
    );
}
