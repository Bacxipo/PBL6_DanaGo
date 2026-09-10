import React from 'react';
import { MapPin, Trash2 } from 'lucide-react';

export default function ItineraryCard({ item, onDelete }) {
    return (
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm relative group hover:shadow-md transition">
            <div className="relative w-full h-40 rounded-xl overflow-hidden mb-3">
                <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2.5 right-2.5 bg-white/90 backdrop-blur-xs text-slate-700 text-xs font-bold px-2.5 py-1 rounded-md shadow-xs flex items-center gap-1">
                    <span>{item.time}</span>
                </div>
            </div>

            <h3 className="font-bold text-slate-800 text-base">{item.name}</h3>
            <div className="flex items-center gap-1 text-slate-500 text-xs mt-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>{item.location}</span>
            </div>

            {/* Tag thể loại & Nút Xóa */}
            <div className="flex items-center justify-between mt-3">
                <span className="text-xs bg-teal-50 text-[#006971] px-2.5 py-1 rounded-md font-medium">
                    {item.tag}
                </span>
                <button
                    onClick={() => onDelete(item.id)}
                    className="text-slate-400 hover:text-red-500 transition cursor-pointer"
                    title="Xóa địa điểm"
                >
                    <Trash2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}