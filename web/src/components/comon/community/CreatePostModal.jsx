'use client';

import React, { useState } from 'react';
import { User, X, Image as ImageIcon, MapPin, Store, Sparkles, HelpCircle} from 'lucide-react';

import ExperiencePostForm from './ExperiencePostForm';
import NewPlacePostForm from './NewPlacePostForm';
export default function CreatePostModal({ isOpen, onClose, onAddPost }) {
  const [postType, setPostType] = useState('trai-nghiem');
  const [content, setContent] = useState('');

  const [placeData, setPlaceData] = useState({
    placeName: '',
    category: 'Ẩm thực',
    openTime: '07:00',
    closeTime: '22:30',
    isFree: false,
    priceFrom: '25.000',
    priceTo: '65.000',
    description: '',
  });

  const handlePlaceFieldChange = (field, value) => {
    setPlaceData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAddPost) {
      onAddPost({
        id: Date.now(),
        postType,
        content: content.trim() || 'Lưu lại khoảng khắc mới nhất của bạn nào !',
        ...placeData,
        user: { name: 'abc_user' },
        date: new Date().toLocaleDateString('vi-VN'),
      });
    }
    onClose();
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-3xl p-6 shadow-2xl max-w-lg w-full relative space-y-5 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 hover:text-gray-800 p-1 hover:bg-gray-100 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <h3 className="text-lg font-bold text-gray-900">
            Tạo bài viết mới
          </h3>
        </div>

        {/* User profile & Tags */}
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-gray-500 text-slate-400 flex items-center justify-center shrink-0 overflow-hidden group-hover:border-teal-500 transition-colors">
              <User className="w-6 h-6" />
            </div>

            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-900 text-base">abc_user</span>
              
              {postType === 'trai-nghiem' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-teal-50 text-[#006971] px-2 py-0.5 rounded-full border border-teal-100">
                  <Sparkles size={11} />
                  Trải nghiệm
                </span>
              )}

              {postType === 'hoi-dap' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                  <HelpCircle size={11} />
                  Hỏi đáp
                </span>
              )}

              {postType === 'dia-diem-moi' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-200">
                  <Store size={11} />
                  Địa điểm mới
                </span>
              )}
            </div>
          </div>

          {/* 3 Nút chọn loại */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPostType('trai-nghiem')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                postType === 'trai-nghiem'
                  ? 'bg-[#006971] text-white shadow-xs'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Trải nghiệm
            </button>

            <button
              type="button"
              onClick={() => setPostType('hoi-dap')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                postType === 'hoi-dap'
                  ? 'bg-[#006971] text-white shadow-xs'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Hỏi đáp
            </button>

            <button
              type="button"
              onClick={() => setPostType('dia-diem-moi')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${
                postType === 'dia-diem-moi'
                  ? 'bg-[#006971] text-white shadow-xs'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Địa điểm mới
            </button>
          </div>
        </div>

        {postType === 'dia-diem-moi' ? (
          <NewPlacePostForm 
            placeData={placeData} 
            onChangeField={handlePlaceFieldChange} 
          />
        ) : (
          <ExperiencePostForm 
            postType={postType} 
            content={content} 
            onChangeContent={setContent} 
          />
        )}

        {/* Attachment Toolbar */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-gray-800">
            Thêm vào bài viết của bạn
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              title="Thêm ảnh"
              className="text-[#00a896] hover:opacity-80 p-1 transition cursor-pointer"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
            <button
              type="button"
              title="Thêm vị trí"
              className="text-rose-500 hover:opacity-80 p-1 transition cursor-pointer"
            >
              <MapPin className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Nút Đăng */}
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full py-3 bg-[#006971] hover:bg-[#00555c] text-white font-bold rounded-full text-sm transition cursor-pointer shadow-sm active:scale-[0.99]"
        >
          Đăng
        </button>
      </div>
    </div>
  );
}