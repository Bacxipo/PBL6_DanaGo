'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import heroImg from '../../assets/images/cr.jpg';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, MapPin, Search } from 'lucide-react';

export default function HomeHero() {
    const [searchQuery, setSearchQuery] = useState('');
    const router = useRouter();
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            router.push(
                `/explore?search=${encodeURIComponent(searchQuery.trim())}`,
            );
        } else {
            router.push('/explore');
        }
    };

    return (
        <div className="relative mx-auto w-full max-w-[1440px] overflow-hidden bg-[#063f48] text-white sm:rounded-3xl">
            <Image
                src={heroImg}
                alt="Khung cảnh Đà Nẵng"
                fill
                sizes="100vw"
                loading="eager"
                fetchPriority="high"
                className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#032f39]/95 via-[#063f48]/65 to-[#063f48]/10" />
            <div className="relative mx-auto max-w-7xl px-6 py-16 sm:px-10 sm:py-20 lg:py-24">
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-medium backdrop-blur-sm">
                    <MapPin size={14} aria-hidden="true" /> Đà Nẵng, Việt Nam
                </span>
                <h1 className="max-w-2xl text-4xl font-bold leading-[1.15] tracking-tight sm:text-5xl lg:text-6xl">
                    Một thành phố.
                    <br />
                    <span className="text-[#a7ece2]">
                        Muôn điều để khám phá.
                    </span>
                </h1>
                <p className="mb-8 mt-5 max-w-lg text-sm leading-7 text-white/85 sm:text-base">
                    Từ những bãi biển xanh đến góc quán quen của người địa
                    phương. Tìm hành trình Đà Nẵng dành riêng cho bạn.
                </p>
                <form
                    onSubmit={handleSearchSubmit}
                    role="search"
                    className="flex max-w-xl flex-col gap-2 rounded-2xl bg-white p-2 shadow-lg sm:flex-row sm:items-center"
                >
                    <label htmlFor="home-search" className="sr-only">
                        Tìm địa điểm tại Đà Nẵng
                    </label>
                    <Search
                        aria-hidden="true"
                        size={20}
                        className="ml-3 hidden shrink-0 text-[#006971] sm:block"
                    />
                    <input
                        id="home-search"
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Bạn muốn đến đâu ở Đà Nẵng?"
                        className="min-w-0 flex-1 rounded-xl px-3 py-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#006971]"
                    />
                    <button
                        type="submit"
                        className="rounded-xl bg-[#006971] px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-[#005258]"
                    >
                        Tìm kiếm
                    </button>
                </form>
                <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/80">
                    <span>Thử khám phá:</span>
                    {['Mỹ Khê', 'Ẩm thực', 'Sơn Trà'].map((name) => (
                        <Link
                            key={name}
                            href={`/explore?search=${encodeURIComponent(name)}`}
                            className="inline-flex items-center gap-1 underline decoration-white/30 underline-offset-4 hover:text-white"
                        >
                            {name}
                            <ArrowUpRight size={12} aria-hidden="true" />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
