'use client';

import React from 'react';
import Link from 'next/link';
import { Calendar, Sparkles, MapPin, Compass } from 'lucide-react';
import ItineraryDetail from '@/components/comon/itinerary/ItineraryDetail';

export default function ItineraryPage() {
    return (
        <div className="dana-content-page w-full min-h-screen bg-slate-50/60 pb-16">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-[#073d46] via-[#006971] to-[#258d89] text-white py-10 px-4 mb-8 shadow-sm">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="space-y-2 max-w-2xl text-center md:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-amber-200 border border-white/20">
                            <Calendar size={14} className="text-amber-300" />
                            Kế Hoạch Du Lịch Đà Nẵng
                        </div>
                        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                            Lập Lịch Trình Chuyến Đi Của Bạn
                        </h1>
                        <p className="text-sm sm:text-base text-gray-200 leading-relaxed">
                            Tự tay lên kế hoạch chi tiết từng ngày, sắp xếp thứ tự và thời gian ghé thăm các điểm đến yêu thích tại Đà Nẵng & Quảng Nam.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                        <Link
                            href="/ai-plan"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md text-white text-xs font-semibold border border-white/20 transition-all shadow-sm"
                        >
                            <Sparkles size={14} className="text-amber-300" />
                            <span>Cần AI gợi ý địa điểm?</span>
                        </Link>
                        <Link
                            href="/explore"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-[#006971] hover:bg-gray-100 text-xs font-bold transition-all shadow-sm"
                        >
                            <Compass size={14} />
                            <span>Bản đồ khám phá</span>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Itinerary Content */}
            <main className="max-w-7xl mx-auto px-4">
                <ItineraryDetail isStandalone={true} />
            </main>
        </div>
    );
}

