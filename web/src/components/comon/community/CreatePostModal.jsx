'use client';

import React, { useState } from 'react';
import { X, User, ImagePlus, MapPin, Tag } from 'lucide-react';

export default function CreatePostModal({ isOpen, onClose, onAddPost }) {
  const [content, setContent] = useState('');
  const [selectedRatio, setSelectedRatio] = useState('1:1');
  const [location, setLocation] = useState('');
  const [showLocationInput, setShowLocationInput] = useState(false);

  if (!isOpen) return null;

  const ratios = ['1:1', '16:9', '4:5', '9:16'];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    if (onAddPost) {
      onAddPost({
        id: Date.now(),
        user: {
          name: 'abc',
          avatar: null
        },
        date: new Date().toLocaleDateString('vi-VN'),
        content: content.trim(),
        location: location || null,
        aspectRatio: selectedRatio,
        likes: 0,
        isLiked: false,
        type: 'standard'
      });
    }

    setContent('');
    setLocation('');
    setShowLocationInput(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="bg-white rounded-3xl p-6 shadow-2xl max-w-lg w-full relative space-y-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 -mx-6 px-6">
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-bold text-slate-900 flex-1 text-center pr-6">
            Tạo bài viết mới
          </h3>
        </div>

        {/* User profile */}
        <div className="flex items-center gap-3 pt-1">
          <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center overflow-hidden shrink-0">
            <User className="w-6 h-6" />
          </div>
          <span className="font-bold text-slate-900 text-base">abc</span>
        </div>

        {/* Text Input area */}
        <div className="py-2">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Lưu lại dấu chân mới nhất của bạn nào!"
            rows={4}
            className="w-full border-none focus:outline-none resize-none text-base sm:text-lg font-medium text-slate-800 placeholder-slate-300 bg-transparent"
          />

          {showLocationInput && (
            <div className="mt-2 flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
              <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Nhập địa điểm check-in..."
                className="bg-transparent border-none text-sm text-slate-800 placeholder-slate-400 focus:outline-none w-full"
              />
            </div>
          )}
        </div>

        {/* Aspect Ratio Chips */}
        <div className="flex items-center gap-2 py-1">
          {ratios.map((ratio) => {
            const isSelected = selectedRatio === ratio;
            return (
              <button
                key={ratio}
                type="button"
                onClick={() => setSelectedRatio(ratio)}
                className={`text-xs px-3.5 py-1.5 rounded-full font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-[#1e40af] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {ratio}
              </button>
            );
          })}
        </div>

        {/* Attachment Toolbar */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-slate-700">
            Thêm vào bài viết của bạn
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              title="Thêm ảnh"
              className="w-8 h-8 rounded-full bg-sky-100 text-sky-600 hover:bg-sky-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <ImagePlus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowLocationInput(!showLocationInput)}
              title="Thêm địa điểm"
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                showLocationInput ? 'bg-rose-200 text-rose-700' : 'bg-rose-100 text-rose-600 hover:bg-rose-200'
              }`}
            >
              <MapPin className="w-4 h-4" />
            </button>
            <button
              type="button"
              title="Thêm Vibe Tag"
              className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 hover:bg-amber-200 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Tag className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!content.trim()}
          className={`w-full py-3.5 font-bold rounded-2xl text-center text-base transition-colors ${
            content.trim()
              ? 'bg-[#059669] hover:bg-[#047857] text-white cursor-pointer shadow-md'
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          Đăng
        </button>
      </div>
    </div>
  );
}
