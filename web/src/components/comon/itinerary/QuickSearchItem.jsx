'use client';

import React from 'react';
import { Star, Plus } from 'lucide-react';
import Image from 'next/image';

export default function QuickSearchItem({ place, onSelectPlace, onAddPlace }) {
    if (!place) return null;

    const imgSrc = place.img || '';

    return (
        <div
            className="flex items-center justify-between gap-3 p-2 hover:bg-emerald-50/50 border border-transparent hover:border-emerald-100 rounded-2xl transition cursor-pointer group"
            onClick={() => onSelectPlace && onSelectPlace(place)}
        >
            <div className="flex items-center gap-3 min-w-0">
                <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100">
                    {imgSrc ? (
                        <Image
                            src={imgSrc}
                            alt={place.name}
                            fill
                            sizes="56px"
                            className="object-cover"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 text-[10px]">
                            Ảnh
                        </div>
                    )}
                </div>
                <div className="min-w-0">
                    <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-[#006971] transition">
                        {place.name}
                    </h4>
                    <div className="flex items-center gap-1 text-xs text-slate-600 mt-0.5">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400 shrink-0" />
                        <span className="font-bold text-slate-700">{place.rating || '4.5'}</span>
                        <span className="text-slate-400">({place.reviews || '100'})</span>
                    </div>
                    <span className="text-[11px] text-slate-400 block mt-0.5 truncate">
                        {place.category}
                    </span>
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
                <button
                    type="button"
                    onClick={(e) => {
                        e.stopPropagation();
                        if (onAddPlace) onAddPlace(place);
                    }}
                    className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 hover:bg-[#006971] hover:text-white flex items-center justify-center transition cursor-pointer"
                    title="Thêm nhanh vào ngày đang chọn"
                >
                    <Plus className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
