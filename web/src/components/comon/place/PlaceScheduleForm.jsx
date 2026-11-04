'use client';

import React from 'react';
import { Calendar } from 'lucide-react';

export default function PlaceScheduleForm({
    daysList = [],
    selectedDayId,
    setSelectedDayId,
    startTime,
    setStartTime
}) {
    return (
        <div className="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100/80 space-y-4">
            <h4 className="font-bold text-[#006971] text-sm flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>Thêm địa điểm này vào lịch trình của bạn</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Chọn Ngày ghé thăm
                    </label>
                    <select
                        value={selectedDayId}
                        onChange={(e) => setSelectedDayId(Number(e.target.value))}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#006971]/30 cursor-pointer"
                    >
                        {daysList.map((day) => (
                            <option key={day.id} value={day.id}>
                                {day.title}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Thời gian bắt đầu
                    </label>
                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-[#006971]/30 cursor-pointer"
                    />
                </div>
            </div>
        </div>
    );
}
