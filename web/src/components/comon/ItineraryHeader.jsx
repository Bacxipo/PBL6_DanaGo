import React from 'react';
import { Calendar, Plus } from 'lucide-react';

export default function ItineraryHeader({title, startDate, endDate,onAddLocation }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800">
                    {title}
                </h1>
                <div className="flex items-center gap-2 text-slate-500 text-sm mt-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{startDate} - {endDate}</span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <button 
                    onClick={onAddLocation}
                    className="flex items-center gap-2 px-4 py-2 bg-[#006971] text-white font-medium rounded-xl shadow-sm hover:bg-[#005259] transition cursor-pointer"
                >
                    <Plus className="w-4 h-4" />
                    <span>Thêm địa điểm</span>
                </button>
            </div>
        </div>
    );
}