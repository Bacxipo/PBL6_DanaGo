'use client';

import React from 'react';
import { Calendar, ArrowLeft, Edit3, Save, Check, Sparkles, CheckSquare } from 'lucide-react';

    export default function ItineraryHeader({
        title,
        startDate,
        endDate,
        hasUnsavedChanges = false,
        onSave,
        onBackToList,
        onEditInfo,
        onToggleChecklist,
        totalChecklistCount = 0,
        completedChecklistCount = 0,
    }) {
        const formatDate = (dateStr) => {
            if (!dateStr) return '';
            if (dateStr.includes('/')) return dateStr;
            const [year, month, day] = dateStr.split('-');
            if (day && month && year) return `${day}/${month}/${year}`;
            return dateStr;
        };

                    return (
                    <div className="flex flex-col gap-4">
                        {/* Top Navigation Row: Back button, Checklist Button & Save Button */}
                        <div className="flex items-center justify-between gap-3 flex-wrap">
                            <button
                                type="button"
                                onClick={onBackToList}
                                className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 hover:text-[#006971] transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-2xs hover:border-[#006971]"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Quay lại danh sách</span>
                            </button>

                            {/* Các nút tác vụ: Nút Checklist & Nút Lưu */}
                            <div className="flex items-center gap-2.5">
                                {/* NÚT CHECKLIST HÀNH LÝ */}
                                {onToggleChecklist && (
                                    <button
                                        type="button"
                                        onClick={onToggleChecklist}
                                        className="inline-flex items-center gap-2 px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all cursor-pointer bg-white text-slate-700 border-slate-200 hover:border-[#006971] hover:text-[#006971] hover:bg-teal-50/40 shadow-2xs active:scale-95"
                                        title="Mở danh sách kiểm tra vật dụng cần mang"
                                    >
                                        <CheckSquare className="w-4 h-4 text-[#006971]" />
                                        <span>Checklist</span>
                                        {totalChecklistCount > 0 && (
                                            <span
                                                className={`px-2 py-0.5 rounded-full text-2xs font-extrabold transition-all ${completedChecklistCount === totalChecklistCount
                                                        ? 'bg-emerald-100 text-emerald-700'
                                                        : 'bg-teal-100 text-[#006971]'
                                                    }`}
                                            >
                                                {completedChecklistCount}/{totalChecklistCount}
                                            </span>
                                        )}
                                    </button>
                                )}

                                {/* NÚT LƯU LỊCH TRÌNH */}
                                {hasUnsavedChanges ? (
                                    <div className="flex items-center gap-2">
                                        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-semibold bg-amber-50 text-amber-700 border border-amber-200 animate-pulse">
                                            <span className="w-2 h-2 rounded-full bg-amber-500" />
                                            Có thay đổi chưa lưu
                                        </span>
                                        <button
                                            type="button"
                                            onClick={onSave}
                                            className="inline-flex items-center gap-2 px-5 py-2 sm:py-2.5 rounded-xl bg-[#006971] hover:bg-[#00555c] active:scale-95 text-white text-xs sm:text-sm font-bold shadow-md transition-all cursor-pointer ring-2 ring-[#006971]/20"
                                            title="Lưu toàn bộ thay đổi lịch trình và checklist"
                                        >
                                            <Save className="w-4 h-4 stroke-[2.5]" />
                                            <span>Lưu lịch trình</span>
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={onSave}
                                        className="inline-flex items-center gap-1.5 px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs sm:text-sm font-semibold transition cursor-pointer hover:bg-emerald-100"
                                        title="Lịch trình đã được lưu an toàn"
                                    >
                                        <Check className="w-4 h-4 text-emerald-600 stroke-[2.5]" />
                                        <span>Đã lưu</span>
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Main Title Row */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-xs">
                            <div>
                                <div className="flex items-center gap-3">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                                        {title}
                                    </h1>
                                    {onEditInfo && (
                                        <button
                                            type="button"
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
                                    <span>
                                        {formatDate(startDate)} - {formatDate(endDate)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    );
}
