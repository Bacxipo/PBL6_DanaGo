'use client';

import React from 'react';
import { Calendar, ArrowLeft, Edit3 } from 'lucide-react';

export default function ItineraryHeader({title,startDate,endDate,onBackToList,onEditInfo,}) {
    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        if (dateStr.includes('/')) return dateStr;
        const [year, month, day] = dateStr.split('-');
        if (day && month && year) return `${day}/${month}/${year}`;
        return dateStr;
    };

    return (
        <div className="flex flex-col gap-4">
            {/* Top Navigation Row */}
            {onBackToList && (
                <div>
                    <button
                        onClick={onBackToList}
                        className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#006971] transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200/80 shadow-2xs"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Quay lại danh sách lịch trình</span>
                    </button>
                </div>
            )}

            {/* Main Title Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                            {title}
                        </h1>
                        {onEditInfo && (
                            <button
                                onClick={onEditInfo}
                                className="p-1.5 text-slate-400 hover:text-[#006971] hover:bg-teal-50 rounded-lg transition cursor-pointer"
                                title="Chỉnh sửa ngày & tiêu đề"
                            >
                                <Edit3 className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-2 text-slate-500 text-sm mt-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-[#006971]" />
                        <span>{formatDate(startDate)} - {formatDate(endDate)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
