'use client';

import { X } from 'lucide-react';

export default function CreatePostHeader({ onClose }) {
  return (
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

  );
}
