'use client';

import React from 'react';
import { MapPin } from 'lucide-react';
import Image from 'next/image';

export default function ContentPost({ post }) {
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
      {post.images?.length > 0 && (
        <div>
          <div
            className="flex w-full overflow-x-auto snap-x snap-mandatory rounded-2xl [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Ảnh bài viết"
            tabIndex={0}
          >
            {post.images.map((url, index) => (
              <div
                key={`${url}-${index}`}
                className="relative w-full shrink-0 snap-center snap-always h-64 sm:h-96 overflow-hidden bg-gray-100"
              >
                <Image
                  src={url}
                  alt={`Ảnh bài viết ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 650px"
                  className="object-contain"
                  draggable={false}
                />

                {post.images.length > 1 && (
                  <span
                    className="
                absolute right-3 top-3
                rounded-full bg-black/60
                px-3 py-1 text-xs font-medium text-white
              "
                  >
                    {index + 1}/{post.images.length}
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
