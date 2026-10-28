'use client';

import React, { useState } from 'react';
import { MapPin, Heart, Image as ImageIcon } from 'lucide-react';
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
            {imgSrc ? (
                <div className="relative w-full h-48 overflow-hidden bg-gray-100">
                    <div className="relative w-full h-full overflow-hidden">
                        <Image
                            src={imgSrc}
                            alt={name}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
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
            ) : (
                <div className="relative w-full h-48 bg-gradient-to-b from-gray-50 to-gray-100/80 border-b border-gray-100 flex flex-col items-center justify-center">
                    {category && (
                        <span className="absolute top-3 left-3 bg-[#006971]/10 text-[#006971] text-xs font-semibold px-2.5 py-1 rounded-full border border-[#006971]/20">
                            {category}
                        </span>
                    )}

                    {/* Biểu tượng Heart UI */}
                    <button
                        type="button"
                        onClick={handleHeartClick}
                        className="absolute top-3 right-3 p-1.5 rounded-full bg-gray-200/70 hover:bg-gray-300 transition cursor-pointer z-10"
                        title={isFav ? "Bỏ yêu thích" : "Yêu thích"}
                    >
                        <Heart
                            className={`w-4 h-4 transition-all duration-200 ${
                                isFav
                                    ? 'fill-red-500 text-red-500 scale-110'
                                    : 'text-gray-400 hover:text-red-400'
                            }`}
                        />
                    </button>

                    {/* Trạng thái trống khi chưa có hình ảnh */}
                    <div className="flex flex-col items-center justify-center gap-1.5 text-gray-400 select-none">
                        <div className="w-12 h-12 rounded-full bg-gray-200/60 flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-6 h-6 stroke-[1.5]" />
                        </div>
                        <span className="text-xs text-gray-400 font-medium">Chưa có hình ảnh</span>
                    </div>

                    {price && (
                        <div className="absolute bottom-3 right-3 bg-white/95 border border-gray-200/80 px-3 py-1 rounded-lg text-xs font-bold text-[#006971] shadow-xs">
                            {price}
                        </div>
                    )}
                </div>
            )}

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
