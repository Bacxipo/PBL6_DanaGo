'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import Image from 'next/image';

export default function ContentPost({ post }) {
  const imageSrc = post?.image || post?.imageUrl || post?.images?.[0];

  return (
    <div className="space-y-3">
      {/* Nội dung bài viết (cảm nghĩ hoặc câu hỏi) */}
      {post?.content && (
        <p className="text-gray-800 text-sm md:text-base leading-relaxed font-normal">
          {post.content}
        </p>
      )}

      {/* Badge địa điểm check-in nếu có */}
      {post?.location && (
        <div className="inline-flex items-center gap-1.5 bg-teal-50 border border-teal-100 text-[#006971] px-3 py-1 rounded-full text-xs font-semibold">
          <MapPin className="w-3.5 h-3.5 text-[#006971]" />
          <span>{post.location}</span>
        </div>
      )}

      {/* Ảnh đính kèm nếu có */}
      {imageSrc && (
        <div className="relative w-full h-72 md:h-80 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100">
          <Image
            src={imageSrc}
            alt="Post attachment"
            fill
            sizes="(max-width: 768px) 100vw, 650px"
            className="object-cover"
          />
        </div>
      )}
    </div>
  );
}