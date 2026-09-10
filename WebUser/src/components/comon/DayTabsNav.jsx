import React from 'react';

export default function DayTabsNav({ days = [], activeDay, onSelectDay }) {
    return (
        <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {days.map((day) => {
                const isActive = activeDay === day.id;
                return (
                    <button
                        key={day.id}
                        onClick={() => onSelectDay(day.id)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition cursor-pointer whitespace-nowrap ${
                            isActive
                                ? 'bg-emerald-50/60 border border-emerald-100 text-[#006971] font-semibold'
                                : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/60'
                        }`}
                    >
                        <span
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                                isActive
                                    ? 'bg-[#006971] text-white'
                                    : 'bg-slate-300 text-slate-600'
                            }`}
                        >
                            {day.id}
                        </span>
                        <span>{day.title}</span>
                        
                        <span className="text-xs bg-slate-200/80 text-slate-600 px-2 py-0.5 rounded-full font-normal">
                            {day.count} điểm
                        </span>
                    </button>
                );
            })}
        </div>
    );
}