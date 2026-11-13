'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Clock, ChevronDown } from 'lucide-react';

const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = ['00', '05', '10', '15', '20', '25', '30', '35', '40', '45', '50', '55'];

const QUICK_PRESETS = [
    { label: '07:30 Sáng', val: '07:30' },
    { label: '08:30 Sáng', val: '08:30' },
    { label: '10:00 Sáng', val: '10:00' },
    { label: '11:30 Trưa', val: '11:30' },
    { label: '13:30 Chiều', val: '13:30' },
    { label: '15:00 Chiều', val: '15:00' },
    { label: '18:30 Tối', val: '18:30' },
    { label: '20:00 Tối', val: '20:00' },
];

export default function TimePicker24h({ value = '08:00', onChange, className = '', compact = false }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    const [currentHour, currentMinute] = (value && value.includes(':') ? value : '08:00').split(':');

    // Đóng popover khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSelectHour = (h) => {
        const newTime = `${h}:${currentMinute || '00'}`;
        if (onChange) onChange(newTime);
    };

    const handleSelectMinute = (m) => {
        const newTime = `${currentHour || '08'}:${m}`;
        if (onChange) onChange(newTime);
    };

    const handleSelectPreset = (val) => {
        if (onChange) onChange(val);
        setIsOpen(false);
    };

    return (
        <div className={`relative inline-block ${className}`} ref={containerRef}>
            {/* Nút bấm hiển thị khung giờ */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:border-[#006971] rounded-xl text-slate-800 font-bold transition-all shadow-2xs cursor-pointer ${
                    compact ? 'px-2 py-1 text-xs' : 'px-3 py-2 text-sm'
                }`}
            >
                <Clock className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-[#006971]`} />
                <span>{currentHour}:{currentMinute}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Bảng chọn khung giờ 0-23h và Phút */}
            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-2xl shadow-xl border border-slate-200/90 p-4 w-72 sm:w-80 animate-in fade-in zoom-in-95 duration-150">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100">
                        <span className="text-xs font-bold text-slate-700">
                            Chọn khung giờ (0h - 23h)
                        </span>
                        <span className="text-xs font-black text-[#006971] bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                            {currentHour}:{currentMinute}
                        </span>
                    </div>

                    {/* Khung cuộn chọn Giờ và Phút */}
                    <div className="grid grid-cols-2 gap-2 text-center">
                        {/* Cột Giờ (0 - 23h) */}
                        <div>
                            <span className="text-2xs font-bold text-slate-400 block mb-1">
                                GIỜ (0 - 23)
                            </span>
                            <div className="grid grid-cols-4 gap-1 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                                {HOURS.map((h) => {
                                    const isSelected = h === currentHour;
                                    return (
                                        <button
                                            key={h}
                                            type="button"
                                            onClick={() => handleSelectHour(h)}
                                            className={`py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                                isSelected
                                                    ? 'bg-[#006971] text-white shadow-xs'
                                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            {h}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Cột Phút */}
                        <div>
                            <span className="text-2xs font-bold text-slate-400 block mb-1">
                                PHÚT
                            </span>
                            <div className="grid grid-cols-3 gap-1 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                                {MINUTES.map((m) => {
                                    const isSelected = m === currentMinute;
                                    return (
                                        <button
                                            key={m}
                                            type="button"
                                            onClick={() => handleSelectMinute(m)}
                                            className={`py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                                                isSelected
                                                    ? 'bg-[#006971] text-white shadow-xs'
                                                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100'
                                            }`}
                                        >
                                            {m}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Các mốc giờ gợi ý nhanh */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                        <span className="text-2xs font-bold text-slate-400 block mb-1.5">
                            GỢI Ý KHUNG GIỜ NHANH:
                        </span>
                        <div className="grid grid-cols-4 gap-1">
                            {QUICK_PRESETS.map((p) => (
                                <button
                                    key={p.val}
                                    type="button"
                                    onClick={() => handleSelectPreset(p.val)}
                                    className="px-1.5 py-1 text-2xs font-semibold bg-slate-50 hover:bg-teal-50 text-slate-600 hover:text-[#006971] rounded-lg transition cursor-pointer truncate"
                                >
                                    {p.val}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Nút Xong */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="px-3 py-1 bg-[#006971] hover:bg-[#00555c] text-white text-xs font-bold rounded-lg shadow-xs cursor-pointer transition"
                        >
                            Xác nhận
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

