'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Compass } from 'lucide-react';
import { getFeedCategories } from '@/lib/feed-api';

export default function HomeCategories() {
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [categoriesError, setCategoriesError] = useState('');
    const [categoriesReloadKey, setCategoriesReloadKey] = useState(0);

    useEffect(() => {
        let active = true;
        async function loadCategories() {
            setCategoriesLoading(true);
            setCategoriesError('');
            try {
                const data = await getFeedCategories();
                if (active) setCategories(data);
            } catch (cause) {
                if (active) setCategoriesError(cause.message);
            } finally {
                if (active) setCategoriesLoading(false);
            }
        }
        loadCategories();
        return () => {
            active = false;
        };
    }, [categoriesReloadKey]);

    return (
        <section
            aria-labelledby="home-categories-title"
            className="w-full max-w-7xl mx-auto px-2"
        >
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-7">
                <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
                    <div>
                        <h2
                            id="home-categories-title"
                            className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900"
                        >
                            Bạn muốn khám phá điều gì?
                        </h2>
                        <p className="mt-1.5 text-sm text-slate-500">
                            Chọn một danh mục để tìm điểm đến cho chuyến đi của
                            bạn.
                        </p>
                    </div>
                    <Link
                        href="/explore"
                        className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-sm font-semibold text-[#006971] transition-colors hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006971]"
                    >
                        Xem tất cả{' '}
                        <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                    </Link>
                </div>
                <div className="flex flex-nowrap gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {categoriesLoading ? (
                        <p role="status">Đang tải danh mục...</p>
                    ) : categoriesError ? (
                        <div role="alert" className="text-red-600">
                            {categoriesError}
                            <button
                                type="button"
                                onClick={() =>
                                    setCategoriesReloadKey((value) => value + 1)
                                }
                                className="ml-2 underline"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : categories.length === 0 ? (
                        <p className="text-gray-500">
                            Chưa có danh mục địa điểm.
                        </p>
                    ) : (
                        categories.slice(0, 5).map((item) => (
                            <Link
                                key={item.id}
                                href={`/explore?category=${encodeURIComponent(item.name)}`}
                                className="group flex shrink-0 items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition-colors hover:border-teal-300 hover:bg-teal-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#006971]"
                            >
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#006971] ring-1 ring-slate-200 transition-colors group-hover:ring-teal-200">
                                    <Compass
                                        aria-hidden="true"
                                        className="h-5 w-5"
                                    />
                                </span>
                                <span className="whitespace-nowrap text-sm font-semibold leading-5 text-slate-700 group-hover:text-[#006971]">
                                    {item.name}
                                </span>
                                <ArrowUpRight
                                    aria-hidden="true"
                                    className="h-4 w-4 shrink-0 text-slate-400 group-hover:text-[#006971]"
                                />
                            </Link>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
