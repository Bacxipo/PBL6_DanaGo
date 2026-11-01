'use client';

import React from 'react';
import { Store, Layers, Clock, Moon, Camera, ChevronDown } from 'lucide-react';
export default function NewPlacePostForm({ placeData, onChangeField, categories = [], }) {
  const {
    placeName = '',
    openTime = '',
    closeTime = '',
    isFree = false,
    priceFrom = '',
    priceTo = '',
    description = '',
  } = placeData;

  return (
    <div className="space-y-4 pt-1">
      {/* Tên địa điểm */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 mb-1.5">
          <Store className="w-4 h-4 text-[#006971]" />
          <span>Tên địa điểm mới</span>
          <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={placeName}
          onChange={(e) => onChangeField('placeName', e.target.value)}
          placeholder="VD: Tiệm Cà Phê Rừng Dừa Cẩm Lệ, Bánh Mì Bà Lan CS2..."
          className="w-full px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:border-[#006971] focus:bg-white transition"
        />
      </div>

      {/* Danh mục */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-800 mb-1.5">
          <Layers className="w-4 h-4 text-[#006971]" />
          <span>Danh mục</span>
        </label>
        <div className="relative">
          <select
            value={placeData.categoryId ?? ''}
            onChange={(e) =>
              onChangeField('categoryId', e.target.value)
            }
            className="w-full appearance-none px-3.5 py-2.5 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:border-[#006971] focus:bg-white transition cursor-pointer"
          >
            <option value="">Chưa chọn danh mục</option>

            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
        </div>
      </div>

      {/* Giờ mở cửa & Chi phí */}
      <div className="space-y-2.5">
        <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-800">
          <Clock className="w-4 h-4 text-[#006971]" />
          <span>Giờ mở cửa & Chi phí</span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <span className="text-[11px] text-gray-500 block mb-1">Mở cửa</span>
            <div className="relative">
              <input
                type="time"
                value={openTime}
                onChange={(e) => onChangeField('openTime', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:border-[#006971]"
              />
              <Clock className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5" />
            </div>
          </div>

          <div>
            <span className="text-[11px] text-gray-500 block mb-1">Đóng cửa</span>
            <div className="relative">
              <input
                type="time"
                value={closeTime}
                onChange={(e) => onChangeField('closeTime', e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:border-[#006971]"
              />
              <Moon className="w-3.5 h-3.5 text-gray-400 absolute right-3 top-2.5" />
            </div>
          </div>
        </div>

        {/* Khoảng giá */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] text-gray-500">Khoảng giá tham khảo (VNĐ)</span>
            <label className="flex items-center gap-1.5 text-xs text-[#006971] cursor-pointer">
              <input
                type="checkbox"
                checked={isFree}
                onChange={(e) => onChangeField('isFree', e.target.checked)}
                className="rounded accent-[#006971] cursor-pointer"
              />
              <span className="text-[11px] font-medium">Miễn phí vé / trải nghiệm</span>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              disabled={isFree}
              value={isFree ? 'Miễn phí' : priceFrom}
              onChange={(e) => onChangeField('priceFrom', e.target.value)}
              placeholder="Từ: 25.000"
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-800 disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:border-[#006971]"
            />
            <input
              type="text"
              disabled={isFree}
              value={isFree ? 'Miễn phí' : priceTo}
              onChange={(e) => onChangeField('priceTo', e.target.value)}
              placeholder="Đến: 65.000"
              className="w-full px-3 py-2 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-800 disabled:bg-gray-100 disabled:text-gray-400 focus:outline-none focus:border-[#006971]"
            />
          </div>
        </div>
      </div>

      {/* Mô tả */}
      <div>
        <label className="block text-xs font-semibold text-gray-800 mb-1.5">
          Mô tả địa điểm
        </label>
        <textarea
          value={description}
          onChange={(e) => onChangeField('description', e.target.value)}
          rows={3}
          className="w-full p-3 text-xs rounded-xl bg-gray-50 border border-gray-200 text-gray-800 focus:outline-none focus:border-[#006971] focus:bg-white resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Quận/Huyện *
        </label>

        <input
          type="text"
          value={placeData.district}
          onChange={(e) =>
            onChangeField('district', e.target.value)
          }
          placeholder="VD: Hải Châu"
          className="w-full rounded-xl border p-3"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">
          Đường dẫn bản đồ
        </label>

        <input
          type="url"
          maxLength={4096}
          value={placeData.addressUrl}
          onChange={(e) =>
            onChangeField('addressUrl', e.target.value)
          }
          placeholder="https://..."
          className="w-full rounded-xl border p-3"
        />
      </div>
      {/* Ảnh thực tế */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-1 text-xs font-semibold text-gray-800">
            <Camera className="w-4 h-4 text-[#006971]" />
            <span>Ảnh thực tế</span>
            <span className="text-red-500">*</span>
          </label>
          <span className="text-[11px] text-gray-400">Tối đa 5 ảnh</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative w-24 h-16 rounded-xl overflow-hidden border border-gray-200">
            <p className="text-xs text-gray-500">
              Nhấn nút hình ảnh bên dưới để chọn từ 1 đến 5 ảnh thực tế.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
