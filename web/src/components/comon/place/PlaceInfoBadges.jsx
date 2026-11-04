'use client';

import React from 'react';
import { Clock, DollarSign, MapPin } from 'lucide-react';

export default function PlaceInfoBadges({ place }) {
    if (!place) return null;

    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-100/70 text-[#006971] flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4" />
                </div>
                <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Giờ mở cửa</span>
                    <span className="text-xs font-bold text-slate-700">{place.time || '08:00 - 18:00'}</span>
                </div>
            </div>

            <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100/70 text-amber-700 flex items-center justify-center shrink-0">
                    <DollarSign className="w-4 h-4" />
                </div>
                <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Vé tham quan</span>
                    <span className="text-xs font-bold text-slate-700">
                        {place.priceDisplay || (place.price ? `${place.price.toLocaleString('vi-VN')} đ` : 'Miễn phí')}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2.5 col-span-2 sm:col-span-1">
                <div className="w-8 h-8 rounded-lg bg-indigo-100/70 text-indigo-700 flex items-center justify-center shrink-0">
                    <MapPin className="w-4 h-4" />
                </div>
                <div>
                    <span className="text-[11px] text-slate-400 block font-medium">Khu vực</span>
                    <span className="text-xs font-bold text-slate-700">{place.address || 'Đà Nẵng'}</span>
                </div>
            </div>
        </div>
    );
}
