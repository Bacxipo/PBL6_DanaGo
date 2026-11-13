'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export function PhotoPreview({ file, index, onRemove, disabled }) {
  const imageRef = useRef(null);

  useEffect(() => {
    if (typeof file === 'string') {
      imageRef.current.src = file;
      return;
    }
    const url = URL.createObjectURL(file);
    imageRef.current.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  return (
    <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-gray-200">
      {/* Local file previews use a browser object URL. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imageRef} alt={`Ảnh bài viết ${index + 1}${typeof file === 'string' ? '' : `: ${file.name}`}`} className="h-full w-full object-cover" />
      {onRemove && <button
        type="button"
        aria-label={`Xóa ảnh ${index + 1}: ${file.name}`}
        onClick={onRemove}
        disabled={disabled}
        className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white hover:bg-black/80 disabled:opacity-50"
      >
        <X className="h-4 w-4" />
      </button>}
    </div>
  );
}

export default function PostImagePreview({ files = [], onRemoveImage, disabled = false }) {
  return (
    <div className="flex flex-wrap gap-3" aria-label="Ảnh đã chọn cho bài viết">
      {files.map((file, index) => (
        <PhotoPreview key={`${typeof file === 'string' ? file : `${file.name}-${file.lastModified}`}-${index}`} file={file} index={index} onRemove={onRemoveImage ? () => onRemoveImage(index) : undefined} disabled={disabled} />
      ))}
    </div>
  );
}
