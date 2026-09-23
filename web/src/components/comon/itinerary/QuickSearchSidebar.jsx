'use client';

import React, { useState } from 'react';
import { Search } from 'lucide-react';
import QuickSearchItem from './QuickSearchItem';
import { quickSearchCategoriesData } from '@/database/data';

export default function QuickSearchSidebar({ places = [], onAddPlace, onSelectPlace }) {
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
            <div className="flex items-center justify-between text-slate-800">
                <div className="flex items-center gap-2">
                    <Search className="w-5 h-5 text-[#006971]" />
                    <h2 className="font-bold text-lg">Tìm kiếm nhanh</h2>
                </div>
            </div>

            {/* Thanh Input tìm kiếm */}
            <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                    type="text"
                    placeholder="Tìm địa điểm, bãi biển, nhà hàng..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-100/70 border-none text-slate-800 text-sm pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006971]/30 placeholder:text-slate-400"
                />
            </div>

            {/* Các Filter Tag từ data */}
            <div className="flex items-center gap-2 flex-wrap">
                {quickSearchCategoriesData.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                            selectedCategory === cat.id
                                ? 'bg-[#006971] text-white shadow-xs'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
                        }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Danh sách gợi ý */}
            <div className="space-y-3 pt-1 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredPlaces.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                        Không tìm thấy địa điểm phù hợp
                    </div>
                ) : (
                    filteredPlaces.map((place) => (
                        <QuickSearchItem
                            key={place.id}
                            place={place}
                            onSelectPlace={onSelectPlace}
                            onAddPlace={onAddPlace}
                        />
                    ))
                )}
            </div>
        </div>
    );
}
