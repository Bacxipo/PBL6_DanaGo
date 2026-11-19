'use client';

import React, { useMemo, useState } from 'react';
import { MapPin, Search, X } from 'lucide-react';
import PostImagePreview from './PostImagePreview';

export default function ExperiencePostForm({ postType, content, onChangeContent, files = [], onRemoveImage, isSubmitting = false, destinations = [], selectedDestination, onSelectDestination }) {
  const [searchTerm, setSearchTerm] = useState('');
  const filteredDestinations = useMemo(() => {
    const query = searchTerm.trim().toLocaleLowerCase('vi');
    if (!query) return destinations.slice(0, 8);
    return destinations.filter((place) => `${place.name} ${place.district} ${place.address}`.toLocaleLowerCase('vi').includes(query)).slice(0, 8);
  }, [destinations, searchTerm]);

  return (
    <div className="space-y-4">
    <div className="py-12 min-h-[180px] flex items-center justify-center">
      <textarea
        value={content}
        onChange={(e) => onChangeContent(e.target.value)}
        placeholder={
          postType === 'hoi-dap'
            ? 'Bạn muốn đặt câu hỏi gì về du lịch Đà Nẵng nào ?'
            : 'Lưu lại khoảng khắc mới nhất của bạn nào !'
        }
        rows={3}
        className="w-full text-center border-none focus:outline-none resize-none text-base sm:text-lg font-medium text-gray-700 placeholder-gray-400 bg-transparent leading-relaxed"
      />
    </div>
    {postType === 'trai-nghiem' && <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700"><MapPin size={16} className="text-[#006971]" /> Gắn địa điểm <span className="font-normal text-slate-400">(không bắt buộc)</span></span>
        {selectedDestination && <button type="button" onClick={() => onSelectDestination(null)} disabled={isSubmitting} className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-red-600"><X size={14} /> Bỏ chọn</button>}
      </div>
      {selectedDestination ? (
        <div className="flex items-center justify-between rounded-xl border border-teal-200 bg-white px-3 py-2.5">
          <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#006971]">{selectedDestination.name}</p><p className="truncate text-xs text-slate-500">{selectedDestination.address || selectedDestination.district || 'Đà Nẵng'}</p></div>
          <MapPin size={17} className="ml-3 shrink-0 text-[#006971]" />
        </div>
      ) : (
        <>
          <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input type="search" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} disabled={isSubmitting} placeholder="Tìm địa điểm (Sơn Trà, Mỹ Khê...)" className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#006971]" /></div>
          {searchTerm.trim() && <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-slate-200 bg-white">{filteredDestinations.length ? filteredDestinations.map((place) => <button type="button" key={place.id} onClick={() => { onSelectDestination(place); setSearchTerm(''); }} className="flex w-full items-start gap-2 border-b border-slate-100 px-3 py-2.5 text-left last:border-0 hover:bg-teal-50"><MapPin size={15} className="mt-0.5 shrink-0 text-[#006971]" /><span className="min-w-0"><span className="block truncate text-sm font-semibold text-slate-700">{place.name}</span><span className="block truncate text-xs text-slate-500">{place.address || place.district || 'Đà Nẵng'}</span></span></button>) : <p className="px-3 py-3 text-sm text-slate-500">Không tìm thấy địa điểm.</p>}</div>}
        </>
      )}
    </div>}
    {files.length > 0 && <PostImagePreview files={files} onRemoveImage={onRemoveImage} disabled={isSubmitting} />}
    </div>
  );
}
