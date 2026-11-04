'use client';

import React from 'react';
import { Store, Clock, Banknote } from 'lucide-react';
import Image from 'next/image';

export default function NewPlacePost({ post }) {
  const destination = post?.destination;
  const name = destination?.name ?? post?.placeName ?? post?.name ?? 'Địa điểm mới';
  const category = destination?.category?.name ?? post?.category;
  const openHours = destination?.openHours ?? (
    post?.openTime && post?.closeTime
      ? `${post.openTime} - ${post.closeTime}`
      : 'Chưa cung cấp'
  );
  const ticketPrice = destination?.ticketPrice ?? (
    post?.isFree
      ? 'Miễn phí vé'
      : post?.priceFrom != null && post?.priceTo != null
        ? `${post.priceFrom}đ - ${post.priceTo}đ`
        : 'Chưa cung cấp'
  );
  const displayPrice = ticketPrice.replace(/^(?:Khoảng giá|Giá)\s*:\s*/i, '').trim();
  const description = post?.content;
  const verification = {
    PENDING: { label: 'Địa điểm chờ xác minh', color: 'bg-amber-50 text-amber-700' },
    APPROVED: { label: 'Địa điểm đã được xác minh', color: 'bg-emerald-50 text-emerald-700' },
    REJECTED: { label: 'Địa điểm chưa được chấp thuận', color: 'bg-red-50 text-red-700' },
  }[destination?.status];

  return (
    <div className="space-y-3.5 bg-gray-50/70 p-4 rounded-2xl border border-gray-200/70">
      {/* Tên địa điểm & Danh mục */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Store className="w-5 h-5 text-[#006971]" />
          <h3 className="font-bold text-gray-900 text-base md:text-lg">
            {name}
          </h3>
        </div>
        {category && (
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#006971] text-white">
            {category}
          </span>
        )}
      </div>

      {verification && (
        <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${verification.color}`}>
          {verification.label}
        </span>
      )}

      {/* Giờ mở cửa & Khoảng giá */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600 bg-white p-2.5 rounded-xl border border-gray-100">
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-[#006971]" />
          <span>
            Giờ: <strong>{openHours}</strong>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Banknote className="w-3.5 h-3.5 text-amber-600" />
          <span>
            Khoảng giá: <strong>{displayPrice || 'Chưa cung cấp'}</strong>
          </span>
        </div>
      </div>

      {/* Mô tả */}
      {description && (
        <p className="text-xs md:text-sm text-gray-700 leading-relaxed">
          {description}
        </p>
      )}

      {/* Ảnh thực tế có thể vuốt ngang */}
      {post?.images && post.images.length > 0 && (
        <div className="min-w-0">
          <div
            className="flex w-full overflow-x-auto snap-x snap-mandatory rounded-xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label={`Ảnh địa điểm ${name}`}
            tabIndex={0}
          >
            {post.images.map((imgUrl, idx) => (
              <div key={`${imgUrl}-${idx}`} className="relative w-full shrink-0 snap-center snap-always h-64 sm:h-96 overflow-hidden bg-gray-100">
                <Image
                  src={imgUrl}
                  alt={`${name} - ảnh ${idx + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 650px"
                  className="object-contain"
                  draggable={false}
                />
                {post.images.length > 1 && (
                  <span className="absolute right-3 top-3 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                    {idx + 1}/{post.images.length}
                  </span>
                )}
              </div>
            ))}
          </div>
          {post.images.length > 1 && (
            <p className="mt-2 text-center text-xs text-gray-400">
              Vuốt ngang để xem thêm ảnh
            </p>
          )}
        </div>
      )}
    </div>
  );
}
