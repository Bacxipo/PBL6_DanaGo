'use client';

    import React, { useState } from 'react';
    import Link from 'next/link';
    import { Clock, Ticket, Car, Plus, Heart, CalendarPlus, Check } from 'lucide-react';

    export default function PlaceAction({
        time = '08:00 - 18:00',
        price = 'Miễn phí',
        move = 'Xe máy, ô tô, taxi',
        placeId,
        placeName,
        onAddToItinerary,
    }) {
        const [isFavorited, setIsFavorited] = useState(false);

        return (
                    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/90 w-full flex flex-col space-y-4">
                        <div className="flex items-start gap-3.5 pb-3 border-b border-slate-100">
                            <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#006971] flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 stroke-[2.2]" />
                            </div>
                            <div>
                                <h3 className="font-bold text-sm text-slate-800">Giờ mở cửa</h3>
                                <p className="text-xs text-slate-500 mt-0.5">{time}</p>
                            </div>
                        </div>

                            <div className="flex items-start gap-3.5 pb-3 border-b border-slate-100">
                                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                                    <Ticket className="w-5 h-5 stroke-[2.2]" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm text-slate-800">Giá vé tham quan</h3>
                                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{price}</p>
                                </div>
                            </div>

                                <div className="flex items-start gap-3.5 pb-3 border-b border-slate-100">
                                    <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center shrink-0">
                                        <Car className="w-5 h-5 stroke-[2.2]" />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm text-slate-800">Phương tiện di chuyển</h3>
                                        <p className="text-xs text-slate-500 mt-0.5">{move}</p>
                                    </div>
                                </div>

                                <div className="pt-2 space-y-2.5">
                                    {onAddToItinerary ? (
                                        <button
                                            type="button"
                                            onClick={onAddToItinerary}
                                            className="w-full flex items-center justify-center gap-2 bg-[#006971] hover:bg-[#00555c] active:scale-95 text-white py-3 rounded-xl font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all"
                                        >
                                            <CalendarPlus className="w-4 h-4 stroke-[2.2]" />
                                            <span>Thêm vào lịch trình</span>
                                        </button>
                                    ) : (
                                        <Link
                                            href="/itinerary"
                                            className="w-full flex items-center justify-center gap-2 bg-[#006971] hover:bg-[#00555c] active:scale-95 text-white py-3 rounded-xl font-bold text-xs sm:text-sm cursor-pointer shadow-sm transition-all text-center"
                                        >
                                            <CalendarPlus className="w-4 h-4 stroke-[2.2]" />
                                            <span>Lên kế hoạch đến điểm này</span>
                                        </Link>
                                    )}

                                    <button
                                        type="button"
                                        onClick={() => setIsFavorited((prev) => !prev)}
                                        className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer border ${isFavorited
                                                ? 'bg-rose-50 border-rose-200 text-rose-600'
                                                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                                            }`}
                                    >
                                        <Heart
                                            className={`w-4 h-4 transition-colors ${isFavorited ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                                                }`}
                                        />
                                        <span>{isFavorited ? 'Đã lưu vào yêu thích' : 'Lưu vào yêu thích'}</span>
                                    </button>
                                </div>
                            </div>
                            );
}
