'use client';

import React, { useState } from 'react';
import { MapPin, Heart } from 'lucide-react';
import Link from 'next/link';
import Rating from '../ui/Rating';
import Image from 'next/image';

export default function PlaceCard({ id, name, img, des, stars, price, category, address }) {
    const [isFav, setIsFav] = useState(false);

    const handleHeartClick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsFav(!isFav);
    };

    const imgSrc = typeof img === 'string' ? img : img?.src || img;

    const content = (
        <>
            <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                <div className="relative w-full h-full overflow-hidden">
                    <Image
                        src={imgSrc}
                        alt={name}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.08]"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                
                {category && (
                    <span className="absolute top-3 left-3 bg-[#006971]/85 backdrop-blur-md text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                        {category}
                    </span>
                )}

                {/* Biểu tượng Heart UI */}
                <button
                    type="button"
                    onClick={handleHeartClick}
                    className="absolute top-3 right-3 p-1.5 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-xs transition cursor-pointer z-10"
                    title={isFav ? "Bỏ yêu thích" : "Yêu thích"}
                >
                    <Heart
                        className={`w-4 h-4 transition-all duration-200 ${
                            isFav
                                ? 'fill-red-500 text-red-500 scale-110'
                                : 'text-white/90 hover:text-red-400'
                        }`}
                    />
                </button>

                {price && (
                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-md px-3 py-1 rounded-lg text-xs font-bold text-[#006971] shadow-sm">
                        {price}
                    </div>
                )}
            </div>

            <div className="p-4 flex flex-col flex-grow justify-between gap-3">
                <div>
                    <h3 className="font-bold text-base text-gray-800 group-hover:text-[#006971] transition-colors line-clamp-1">
                        {name}
                    </h3>
                    <p className="text-xs text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">
                        {des}
                    </p>
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-gray-500 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-[#006971] shrink-0" />
                        <span className="truncate max-w-[120px]">{address || "Đà Nẵng"}</span>
                    </div>

                    <div className="flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-md text-amber-700 font-semibold border border-amber-200/50">
                        <Rating rating={stars}/>
                    </div>  
                </div>
            </div>
        </>
    );

    if (id) {
        return (
            <Link href={`/explore/place/${id}`} className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between cursor-pointer">
                {content}
            </Link>
        );
    }

    return (
        <div className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 flex flex-col justify-between cursor-pointer">
            {content}
        </div>
    );
}
