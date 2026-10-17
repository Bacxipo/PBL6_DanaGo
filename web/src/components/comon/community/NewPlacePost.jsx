'use client';

import React from 'react';
import { Store, Clock, Banknote } from 'lucide-react';
import Image from 'next/image';

export default function NewPlacePost({ post }) {
  return (
    <div className="space-y-3.5 bg-gray-50/70 p-4 rounded-2xl border border-gray-200/70">
      {/* Tên địa điểm & Danh mục */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-[#006971]" />
          <h3 className="font-bold text-gray-900 text-base md:text-lg">
            {post?.placeName || post?.name || 'Địa điểm mới'}
          </h3>
        </div>
        {post?.category && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#006971] text-white">
            {post.category}
          </span>
        )}
      </div>

      {/* Giờ mở cửa & Khoảng giá */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 bg-white p-2.5 rounded-xl border border-gray-100">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#006971]" />
          <span>
            Giờ: <strong>{post?.openTime || '07:00'} - {post?.closeTime || '22:30'}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Banknote className="w-3.5 h-3.5 text-amber-600" />
          <span>
            Giá: <strong>{post?.isFree ? 'Miễn phí vé' : `${post?.priceFrom || '25.000'}đ - ${post?.priceTo || '65.000'}đ`}</strong>
          </span>
        </div>
      </div>

      {/* Mô tả */}
      {post?.description && (
        <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
          {post.description}
        </p>
      )}

      {/* Lưới ảnh thực tế */}
      {post?.images && post.images.length > 0 && (
        <div className={`grid gap-2 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {post.images.slice(0, 2).map((imgUrl, idx) => (
            <div key={idx} className="relative h-44 rounded-xl overflow-hidden bg-gray-100">
              <Image
                src={imgUrl}
                alt="Place preview"
                fill
                sizes="(max-width: 768px) 100vw, 300px"
                className="object-cover hover:scale-105 transition duration-300"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}