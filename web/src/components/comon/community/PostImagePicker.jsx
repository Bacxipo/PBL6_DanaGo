'use client';

import { useRef } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import PostImagePreview from './PostImagePreview';

export default function PostImagePicker({ files, onFilesChange, onRemoveImage, onError, disabled = false, showPreview = true, children }) {
  const fileInputRef = useRef(null);
  return (
    <>
        <input
          ref={fileInputRef}
          hidden
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          disabled={disabled}
          onChange={(e) => {
            const selected = Array.from(e.target.files || []);
            e.target.value = '';
            if (!selected.length) return;

            if (files.length + selected.length > 5) {
              onError('Chỉ được chọn tối đa 5 ảnh.');
              e.target.value = '';
              return;
            }

            if (
              selected.some(
                (file) =>
                  !['image/jpeg', 'image/png', 'image/webp'].includes(file.type) ||
                  file.size > 5 * 1024 * 1024,
              )
            ) {
              onError('Ảnh phải là JPG, PNG hoặc WebP, tối đa 5MB mỗi ảnh.');
              e.target.value = '';
              return;
            }

            onError('');
            onFilesChange([...files, ...selected]);
          }}
        />

      {showPreview && files.length > 0 && <PostImagePreview files={files} onRemoveImage={onRemoveImage} disabled={disabled} />}
        <p className="text-sm text-gray-500">
          Đã chọn {files.length}/5 ảnh
        </p>

      {children}
        {/* Attachment Toolbar */}
        <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs sm:text-sm font-semibold text-gray-800">
            Thêm vào bài viết của bạn
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              title="Thêm ảnh"
              aria-label="Chọn ảnh cho bài viết"
              disabled={disabled}
              onClick={() => fileInputRef.current?.click()}
              className="text-[#00a896] hover:opacity-80 p-1 transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ImageIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

    </>
  );
}
