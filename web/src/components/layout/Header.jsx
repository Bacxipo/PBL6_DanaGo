'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User } from 'lucide-react';

export default function Header() {
    const pathname = usePathname();

    const getLinkClass = (path) => {
        const isActive = pathname === path;
        return isActive 
            ? "text-[#006971] font-bold text-sm border-b-2 border-[#006971] pb-1" 
            : "text-gray-600 hover:text-[#006971] text-sm font-semibold transition-colors";
    };

    return (
        <header className="bg-white shadow-md w-full py-4 sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 flex justify-between items-center">
                <Link href="/" className="text-[#006971] font-bold text-xl flex items-center gap-2">
                    Smart Trip Đà Nẵng
                </Link>
                <nav className="flex space-x-6 gap-x-8">
                    <Link href="/" className={getLinkClass('/')}>
                        Trang chủ
                    </Link>
                    <Link href="/explore" className={getLinkClass('/explore')}>
                        Khám phá
                    </Link>
                    <a href="#" className="text-gray-600 hover:text-[#006971] text-sm font-semibold">Cộng đồng</a>
                    <a href="#" className="text-gray-600 hover:text-[#006971] text-sm font-semibold">AI Plan</a>
                </nav>
                <Link href="/personal" className="flex items-center gap-2 text-gray-600 hover:text-[#006971] transition-colors">
                    <User className="w-5 h-5 cursor-pointer" />
                </Link>
            </div>
        </header>
    );
}