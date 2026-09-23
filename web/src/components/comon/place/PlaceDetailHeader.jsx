'use client';

import React from 'react';
import { X, Star, MapPin } from 'lucide-react';
import Image from 'next/image';

export default function PlaceDetailHeader({ place, onClose }) {
    if (!place) return null;
    const imgSrc = place.img || '';

    return (
        <div className="relative h-56 sm:h-64 w-full bg-slate-100 shrink-0">
            {imgSrc ? (
                <Image
                    src={imgSrc}
                    alt={place.name}
                    fill
                    sizes="(max-width: 768px) 100vw, 600px"
                    className="object-cover"
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-slate-400">Không có ảnh</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            
            <button
                onClick={onClose}
                className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center transition backdrop-blur-md cursor-pointer"
            >
                <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-6 right-6 text-white">
                <span className="text-xs font-semibold px-2.5 py-1 bg-[#006971] rounded-md text-white inline-block mb-2">
                    {place.category}
                </span>
                <h2 className="text-2xl font-bold">{place.name}</h2>
                <div className="flex items-center gap-4 text-xs text-slate-200 mt-1">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="font-bold text-white">{place.rating || place.stars || '4.5'}</span>
                        <span>({place.reviews || '120'} đánh giá)</span>
                    </div>
                    {place.address && (
                        <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{place.address}</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
