'use client';

import React from 'react';
import { Waves, Utensils, Landmark, FerrisWheel, Trees, Coffee } from 'lucide-react';

// Import data danh sách sở thích
import { interestOptions } from '@/database/data';

// Bảng ánh xạ icon từ chuỗi sang component của lucide-react
const iconMap = {
    Waves,
    Utensils,
    Landmark,
    FerrisWheel,
    Trees,
    Coffee,
};

export default function InterestTags({ selectedInterests = [], onToggleInterest }) {
    return (
        <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
                Bạn quan tâm điều gì nhất?
            </label>
            <div className="flex  flex-col flex-wrap gap-2 mb-5">
                {interestOptions.map((item) => {
                    const IconComponent = iconMap[item.icon] || Waves;
                    const isSelected = selectedInterests.includes(item.id);

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => onToggleInterest && onToggleInterest(item.id)}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-medium cursor-pointer transition ${
                                isSelected
                                    ? 'bg-[#006971] text-white shadow-sm'
                                    : 'bg-[#e5f3f4] text-[#006971] hover:bg-[#d0ecee]'
                            }`}
                        >
                            <IconComponent size={14} />
                            {item.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}