'use client';

import React, { useState } from 'react';
import { MapPin, Trash2, Clock } from 'lucide-react';
import Image from 'next/image';

export default function ItineraryCard({ item, onDelete, onUpdateTime }) {
    const [isEditingTime, setIsEditingTime] = useState(false);
    const [timeValue, setTimeValue] = useState(item.time || '08:00');

    const handleTimeChange = (e) => {
        const newTime = e.target.value;
        setTimeValue(newTime);
        if (onUpdateTime) {
            onUpdateTime(item.id, newTime);
        }
    };

    const imgSrc = item.img || '';

    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm relative group hover:shadow-md transition">
            <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3 bg-slate-100">
                {imgSrc ? (
                    <Image
                        src={imgSrc}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-400 text-xs">Không có ảnh</div>
                )}

                {/* Badge Thời gian bắt đầu */}
                <div className="absolute top-2.5 right-2.5 bg-white/95 backdrop-blur-xs text-slate-700 text-xs font-bold px-2.5 py-1 rounded-lg shadow-sm flex items-center gap-1.5 border border-slate-100">
                    <Clock className="w-3.5 h-3.5 text-[#006971]" />
                    {isEditingTime ? (
                        <input
                            type="time"
                            value={timeValue}
                            onChange={handleTimeChange}
                            onBlur={() => setIsEditingTime(false)}
                            autoFocus
                            className="bg-slate-100 px-1 rounded border border-slate-300 text-xs text-slate-800 focus:outline-none"
                        />
                    ) : (
                        <button
                            type="button"
                            onClick={() => setIsEditingTime(true)}
                            className="hover:text-[#006971] transition cursor-pointer"
                            title="Click để đổi thời gian bắt đầu"
                        >
                            {item.time || '08:00'}
                        </button>
                    )}
                </div>
            </div>

            <h3 className="font-bold text-slate-800 text-base line-clamp-1">{item.name}</h3>
            <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span className="truncate">{item.location || item.address || 'Đà Nẵng'}</span>
            </div>

            {/* Tag thể loại & Nút Xóa */}
            <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-50">
                <span className="text-[11px] bg-teal-50 text-[#006971] px-2.5 py-1 rounded-md font-semibold">
                    {item.tag || 'Địa điểm'}
                </span>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onDelete(item.id)}
                        className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Xóa địa điểm"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
