'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import PlaceDetailHeader from './PlaceDetailHeader';
import PlaceInfoBadges from './PlaceInfoBadges';
import PlaceScheduleForm from './PlaceScheduleForm';

export default function PlaceDetailModal({
    place,
    isOpen,
    onClose,
    daysList = [],
    activeDayId = 1,
    onAddPlace
}) {
    const [selectedDayId, setSelectedDayId] = useState(activeDayId);
    const [startTime, setStartTime] = useState('08:00');

    const [prevActiveDayId, setPrevActiveDayId] = useState(activeDayId);
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

    // Synchronize state during render when props change
    if (activeDayId !== prevActiveDayId || isOpen !== prevIsOpen) {
        setPrevActiveDayId(activeDayId);
        setPrevIsOpen(isOpen);
        setSelectedDayId(activeDayId || 1);
        setStartTime('08:00');
    }

    if (!isOpen || !place) return null;

    const handleAdd = () => {
        if (onAddPlace) {
            onAddPlace(place, Number(selectedDayId), startTime);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in duration-200">
                {/* Header Image & Title Sub-component */}
                <PlaceDetailHeader place={place} onClose={onClose} />

                {/* Body Content */}
                <div className="p-6 overflow-y-auto space-y-6 flex-1">
                    {/* Key Info Badges Sub-component */}
                    <PlaceInfoBadges place={place} />

                    {/* Description & Detail Info */}
                    <div className="space-y-2">
                        <h4 className="font-bold text-slate-800 text-sm">Giới thiệu địa điểm</h4>
                        <p className="text-slate-600 text-sm leading-relaxed">
                            {place.infor || place.des || 'Địa điểm hấp dẫn không thể bỏ qua khi du lịch Đà Nẵng.'}
                        </p>
                    </div>

                    {/* Schedule Selector Box Sub-component */}
                    <PlaceScheduleForm
                        daysList={daysList}
                        selectedDayId={selectedDayId}
                        setSelectedDayId={setSelectedDayId}
                        startTime={startTime}
                        setStartTime={setStartTime}
                    />
                </div>

                {/* Footer Action */}
                <div className="p-4 px-6 border-t border-slate-100 flex items-center justify-between bg-slate-50 shrink-0">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl text-slate-600 hover:bg-slate-200 text-sm font-semibold transition cursor-pointer"
                    >
                        Đóng
                    </button>
                    <button
                        onClick={handleAdd}
                        className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white bg-[#006971] hover:bg-[#005259] text-sm font-semibold shadow-md transition cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Thêm vào lịch trình</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
