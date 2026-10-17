'use client';

import React from 'react';
import { Plus, Calendar, Trash2, Compass } from 'lucide-react';
import Image from 'next/image';

export default function ItineraryListView({
    itineraries = [],
    onSelectItinerary,
    onCreateClick,
    onDeleteItinerary,
    calculateDaysList
}) {
    return (
        <div className="w-full bg-slate-50/50 p-4 sm:p-6 rounded-2xl min-h-[500px]">
            {/* Header list */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-200/60">
                <div>
                    <h2 className="text-2xl font-extrabold text-slate-800">Lịch trình của tôi</h2>
                    <p className="text-slate-500 text-sm mt-1">
                        Quản lý các kế hoạch và chuyến đi khám phá Đà Nẵng của bạn
                    </p>
                </div>
                <button
                    onClick={onCreateClick}
                    className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#006971] text-white font-semibold rounded-xl shadow-sm hover:bg-[#005259] transition cursor-pointer text-sm"
                >
                    <Plus className="w-4 h-4" />
                    <span>Tạo lịch trình mới</span>
                </button>
            </div>

            {/* List of itineraries */}
            {itineraries.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                        <Compass className="w-8 h-8 stroke-[1.5]" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-700 mb-1">Chưa có lịch trình nào</h3>
                    <p className="text-slate-500 text-sm max-w-sm mb-6">
                        Hãy lên kế hoạch cho chuyến đi Đà Nẵng của bạn ngay bây giờ bằng cách bấm Tạo lịch trình.
                    </p>
                    <button
                        onClick={onCreateClick}
                        className="px-6 py-2.5 bg-[#006971] text-white font-semibold rounded-xl shadow-sm hover:bg-[#005259] transition text-sm cursor-pointer"
                    >
                        Tạo lịch trình đầu tiên
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {itineraries.map((it) => {
                        const daysList = calculateDaysList(it.startDate, it.endDate, it.days);
                        const totalPlacesCount = Object.values(it.days || {}).reduce((acc, arr) => acc + (arr?.length || 0), 0);

                        return (
                            <div
                                key={it.id}
                                onClick={() => onSelectItinerary(it.id)}
                                className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition duration-200 p-5 cursor-pointer flex flex-col justify-between group relative overflow-hidden"
                            >
                                <div>
                                    <div className="relative h-44 w-full rounded-xl overflow-hidden mb-4 bg-slate-100">
                                        {it.coverImg ? (
                                            <Image
                                                src={it.coverImg}
                                                alt={it.title}
                                                fill
                                                sizes="(max-width: 768px) 100vw, 50vw"
                                                className="object-cover group-hover:scale-105 transition duration-300"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Không có ảnh</div>
                                        )}
                                        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-xs font-semibold px-2.5 py-1 rounded-lg z-10">
                                            {daysList.length} Ngày
                                        </div>
                                    </div>

                                    <div className="flex items-start justify-between gap-2">
                                        <h3 className="text-lg font-bold text-slate-800 group-hover:text-[#006971] transition line-clamp-1">
                                            {it.title}
                                        </h3>
                                        <button
                                            onClick={(e) => onDeleteItinerary(it.id, e)}
                                            className="text-slate-400 hover:text-red-500 p-1 rounded-lg hover:bg-red-50 transition shrink-0"
                                            title="Xóa lịch trình"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <div className="flex items-center gap-2 text-slate-500 text-xs font-medium mt-1">
                                        <Calendar className="w-3.5 h-3.5 text-[#006971]" />
                                        <span>{it.startDate} - {it.endDate}</span>
                                    </div>

                                    <p className="text-slate-600 text-xs mt-2 line-clamp-2">
                                        {it.description}
                                    </p>
                                </div>

                                <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 text-xs text-slate-500 font-medium">
                                    <span>{totalPlacesCount} địa điểm đã thêm</span>
                                    <span className="text-[#006971] font-bold group-hover:translate-x-1 transition">
                                        Xem chi tiết &rarr;
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
