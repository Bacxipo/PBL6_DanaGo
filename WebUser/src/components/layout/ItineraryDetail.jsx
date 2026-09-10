import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import ItineraryHeader from '../comon/ItineraryHeader';
import DayTabsNav from '../comon/DayTabsNav';
import ItineraryCard from '../comon/ItineraryCard';
import DayColumnEmpty from '../comon/DayColumnEmpty';
import QuickSearchSidebar from '../comon/QuickSearchSidebar';

export default function ItineraryDetail() {
    const [activeDay, setActiveDay] = useState(1);

    const daysData = [
        { id: 1, title: 'Ngày 1 (15/10)', count: 3 },
        { id: 2, title: 'Ngày 2 (16/10)', count: 0 },
    ];

    const [itinerary, setItinerary] = useState({
        1: [
            {
                id: 101,
                name: 'Bãi biển Mỹ Khê',
                location: 'Sơn Trà, Đà Nẵng',
                time: '08:00',
                tag: 'Biển',
                img: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80',
            },
            {
                id: 102,
                name: 'Cầu Rồng',
                location: 'Hải Châu, Đà Nẵng',
                time: '14:00',
                tag: 'Kiến trúc',
                img: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=600&q=80',
            },
        ],
        2: [],
    });

    const quickSearchPlaces = [
        {
            id: 201,
            name: 'Mì Quảng Bà Mua',
            rating: '4.5',
            reviews: '240',
            category: 'Ẩm thực địa phương',
            categoryType: 'food',
            img: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?auto=format&fit=crop&w=200&q=80',
        },
        {
            id: 202,
            name: 'Bà Nà Hills',
            rating: '4.8',
            reviews: '1.2k',
            category: 'Khu du lịch sinh thái',
            categoryType: 'sightseeing',
            img: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=200&q=80',
        },
    ];

    const handleDeletePlace = (dayId, placeId) => {
        setItinerary((prev) => ({
            ...prev,
            [dayId]: prev[dayId].filter((item) => item.id !== placeId),
        }));
    };

    return (
        <div className="w-full bg-slate-50/50 p-6 rounded-2xl min-h-screen">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <ItineraryHeader 
                        title="Đà Nẵng 3 Ngày 2 Đêm"
                        startDate="15/10/2024"
                        endDate="17/10/2024"
                    />

                    <DayTabsNav 
                        days={daysData} 
                        activeDay={activeDay} 
                        onSelectDay={setActiveDay} 
                    />

                    {/* Các cột hiển thị danh sách theo ngày */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        {/* Cột Ngày 1 */}
                        <div className="space-y-4">
                            {itinerary[1]?.map((item) => (
                                <ItineraryCard 
                                    key={item.id} 
                                    item={item} 
                                    onDelete={(id) => handleDeletePlace(1, id)} 
                                />
                            ))}

                            <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-500 hover:text-[#006971] hover:border-[#006971] hover:bg-emerald-50/30 transition font-medium flex items-center justify-center gap-2 cursor-pointer">
                                <Plus className="w-4 h-4" />
                                <span>Thêm điểm</span>
                            </button>
                        </div>

                        {/* Cột Ngày 2 (Trống) */}
                        <DayColumnEmpty onExplore={() => console.log('Khám phá địa điểm')} />
                    </div>
                </div>

                {/* CỘT PHẢI - SIDEBAR (1/3) */}
                <div>
                    <QuickSearchSidebar 
                        places={quickSearchPlaces} 
                        onAddPlace={(place) => console.log('Thêm địa điểm:', place)} 
                    />
                </div>

            </div>
        </div>
    );
}