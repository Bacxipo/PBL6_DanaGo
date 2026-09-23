'use client';

import React from 'react';
import { User, Image as ImageIcon, MapPin, Tag } from 'lucide-react';

export default function CreatePostBox({ onOpenModal }) {
  return (
    <div className="bg-white rounded-2xl p-4 md:p-5 shadow-sm border border-slate-100 flex flex-col gap-4 mb-6">
      {/* Top row: Avatar & Placeholder input */}
      <div 
        onClick={onOpenModal}
        className="flex items-center gap-3 cursor-pointer group"
      >
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-teal-500 transition-colors">
          <User className="w-6 h-6" />
        </div>
        <span className="text-slate-400 font-medium text-base select-none group-hover:text-slate-500 transition-colors">
          Lưu lại dấu chân mới nhất của bạn nào!
        </span>
      </div>

      {/* Bottom row: Action Icons & Post Button */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={onOpenModal}
            title="Thêm ảnh"
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-colors cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={onOpenModal}
            title="Thêm địa điểm"
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-rose-500 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
          >
            <MapPin className="w-4 h-4" />
          </button>
          <button 
            type="button"
            onClick={onOpenModal}
            title="Thêm thẻ Vibe Tag"
            className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center text-amber-500 hover:bg-amber-50 hover:border-amber-200 transition-colors cursor-pointer"
          >
            <Tag className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={onOpenModal}
          className="bg-[#059669] hover:bg-[#047857] text-white font-bold px-6 py-2 rounded-full text-sm transition-colors cursor-pointer shadow-xs"
        >
          Đăng
        </button>
      </div>
    </div>
  );
}
