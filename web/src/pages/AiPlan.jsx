'use client';

import React, { useState } from 'react';
import {Calendar,Sparkles,PlusCircle} from 'lucide-react';

import DayTabsNav from '@/components/comon/itinerary/DayTabsNav';
import ItineraryCard from '@/components/comon/itinerary/ItineraryCard';
import InterestTags from '@/components/comon/ai-plan/InterestTags';

import { initialItineraryData, itineraryDaysData } from '@/database/data';


export default function AIPlanPage() {
    // State cơ bản phục vụ hiển thị UI
    const [startDate, setStartDate] = useState('2024-09-24');
    const [endDate, setEndDate] = useState('2024-09-25');
    const [budget, setBudget] = useState('3.000.000 VND');
    const [selectedInterests, setSelectedInterests] = useState(['bien-dao', 'am-thuc']);
    const [activeDay, setActiveDay] = useState(1);

    // Toggle màu nút sở thích đơn giản
    const toggleInterest = (id) => {
        setSelectedInterests((prev) =>
            prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
        );
    };
    
    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* ================= CỘT TRÁI: FORM BỘ LỌC ================= */}
                <aside className="lg:col-span-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    
                    {/* Chọn ngày đi & ngày về */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Thời gian chuyến đi:
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <span className="block text-xs text-gray-500 mb-1">Từ ngày</span>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 text-gray-700 focus:outline-none focus:border-[#006971] cursor-pointer"
                                />
                            </div>
                            <div>
                                <span className="block text-xs text-gray-500 mb-1">Đến ngày</span>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-300 text-gray-700 focus:outline-none focus:border-[#006971] cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Ngân sách */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-2">
                            Ngân sách:
                        </label>
                        <input
                            type="text"
                            value={budget}
                            onChange={(e) => setBudget(e.target.value)}
                            className="w-full px-4 py-2.5 text-sm rounded-xl border border-gray-300 text-gray-800 focus:outline-none focus:border-[#006971]"
                        />
                    </div>

                    {/* Tags sở thích */}
                    <InterestTags 
                        selectedInterests={selectedInterests}
                        onToggleInterest={toggleInterest}
                    />

                    {/* Nút hành động */}
                    <div className="pt-2 space-y-3">
                        <button
                            type="button"
                            className="w-full py-3 px-4 rounded-full border border-gray-300 hover:border-gray-400 bg-white font-semibold text-gray-800 text-sm flex items-center justify-center gap-2 shadow-sm transition hover:bg-gray-50 cursor-pointer"
                        >
                            <Sparkles size={16} className="text-amber-500" />
                            Tạo lịch trình tự động
                        </button>
                        <button
                            type="button"
                            className="w-full py-3 px-4 rounded-full bg-[#006971] hover:bg-[#005258] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                        >
                            <PlusCircle size={16} />
                            Thêm vào danh sách lịch trình
                        </button>
                    </div>
                </aside>

                {/* ================= CỘT PHẢI: HIỂN THỊ LỊCH TRÌNH ================= */}
                <section className="lg:col-span-8 space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Lịch trình lên tự động
                        </h2>
                        <div className="flex items-center gap-1.5 text-xs text-gray-500 mt-1">
                            <Calendar size={14} className="text-gray-400" />
                            <span>24/09/2024 - 25/09/2024</span>
                        </div>
                    </div>

                    {/* Thanh Tab chọn ngày */}
                    <div className="border-b border-gray-200/80 pb-2">
                        <DayTabsNav
                            days={itineraryDaysData}
                            activeDay={activeDay}
                            onSelectDay={(id) => setActiveDay(id)}
                        />
                    </div>

                    {/* Danh sách thẻ địa điểm của ngày đó */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(initialItineraryData[activeDay] || []).map((place) => (
                            <ItineraryCard
                                key={place.id}
                                item={place}
                                onDelete={() => {}}
                                onUpdateTime={() => {}}
                            />
                        ))}
                    </div>
                </section>

            </div>
        </div>
    );
}