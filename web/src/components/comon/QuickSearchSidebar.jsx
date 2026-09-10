'use client';

import React, { useState } from 'react';
import { Search, Star, Plus } from 'lucide-react';

export default function QuickSearchSidebar({ places = [], onAddPlace }) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Lọc địa điểm theo danh mục
    const filteredPlaces = places.filter(place => {
        const matchesCategory = selectedCategory === 'all' || place.categoryType === selectedCategory;
        const matchesQuery = place.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesQuery;
    });

    return (
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs h-fit space-y-5">
            {/* Header Sidebar */}
            <div className="flex items-center gap-2 text-slate-800">
                <Search className="w-5 h-5 text-[#006971]" />
                <h2 className="font-bold text-lg">Tìm kiếm nhanh</h2>
            </div>

            {/* Thanh Input tìm kiếm */}
            <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Tìm địa điểm, quán ăn..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100/70 border-none text-slate-800 text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006971]/30 placeholder:text-slate-400"
                />
            </div>

            {/* Các Filter Tag */}
            <div className="flex items-center gap-2">
                {[
                    { id: 'all', label: 'Tất cả' },
                    { id: 'food', label: 'Ăn uống' },
                    { id: 'sightseeing', label: 'Tham quan' }
                ].map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            selectedCategory === cat.id
                                ? 'bg-[#006971] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Danh sách gợi ý */}
            <div className="space-y-4 pt-1">
                {filteredPlaces.map((place) => (
                    <div
                        key={place.id}
                        className="flex items-center justify-between gap-3 p-1 hover:bg-slate-50 rounded-xl transition"
                    >
                        <div className="flex items-center gap-3">
                            <img
                                src={place.img}
                                alt={place.name}
                                className="w-14 h-14 rounded-xl object-cover"
                            />
                            <div>
                                <h4 className="font-bold text-slate-800 text-sm">{place.name}</h4>
                                <div className="flex items-center gap-1 text-xs text-slate-600 mt-0.5">
                                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                    <span className="font-bold text-slate-700">{place.rating}</span>
                                    <span className="text-slate-400">({place.reviews})</span>
                                </div>
                                <span className="text-[11px] text-slate-400 block mt-0.5">
                                    {place.category}
                                </span>
                            </div>
                        </div>

                        {/* Nút Thêm vào lịch trình */}
                        <button
                            onClick={() => onAddPlace && onAddPlace(place)}
                            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-[#006971] hover:text-white flex items-center justify-center transition cursor-pointer"
                            title="Thêm vào lịch trình"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}