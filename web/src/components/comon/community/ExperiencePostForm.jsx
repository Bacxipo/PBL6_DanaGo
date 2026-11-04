'use client';

import React from 'react';

export default function ExperiencePostForm({ postType, content, onChangeContent }) {
  return (
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
  );
}