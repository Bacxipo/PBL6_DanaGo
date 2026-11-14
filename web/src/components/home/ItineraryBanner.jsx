'use client';

import Link from 'next/link';

export default function ItineraryBanner() {
    return (
        <div className="flex flex-wrap gap-4 bg-[#006971] rounded-2xl p-8 md:p-10 items-center justify-between shadow-sm">
            <div className="flex flex-col space-y-2">
                <h2 className="font-bold text-2xl md:text-3xl text-white">
                    Lập lịch trình thông minh
                </h2>
                <p className="text-cyan-100 text-sm md:text-base">
                    Để chúng tôi gợi ý hành trình hoàn hảo dựa trên sở thích và
                    ngân sách của bạn
                </p>
            </div>
            <div>
                <Link
                    href="/itinerary"
                    className="inline-flex items-center justify-center px-6 py-3 bg-white text-[#006971] hover:bg-gray-200 font-bold rounded-xl transition-colors shadow-md"
                >
                    Bắt đầu ngay
                </Link>
            </div>
        </div>
    );
}
