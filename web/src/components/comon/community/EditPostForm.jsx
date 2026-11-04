'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

export default function EditPostForm({
  postId,
  content,
  onContentChange,
  onSubmit,
  onCancel,
  isSaving,
  isDeleting,
  error,
}) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';

    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={`edit-title-${postId}`}
      onCancel={(event) => {
        event.preventDefault();
        if (!isSaving) onCancel();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget || isSaving) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left || event.clientX > bounds.right ||
          event.clientY < bounds.top || event.clientY > bounds.bottom
        ) onCancel();
      }}
      className="fixed inset-0 m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-xl overflow-y-auto rounded-2xl border-0 bg-white p-0 shadow-2xl backdrop:bg-black/50"
    >
      <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
        <h2 id={`edit-title-${postId}`} className="text-lg font-bold text-gray-800">
          Chỉnh sửa bài viết
        </h2>
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          aria-label="Đóng chỉnh sửa"
          className="rounded-full p-2 text-gray-500 hover:bg-gray-100 disabled:opacity-50"
        >
          <X size={20} />
        </button>
      </div>
    <form
      onSubmit={onSubmit}
      className="space-y-4 p-5"
    >
      <label
        htmlFor={`edit-content-${postId}`}
        className="block text-sm font-semibold text-gray-700"
      >
        Chỉnh sửa nội dung
      </label>

      <textarea
        id={`edit-content-${postId}`}
        value={content}
        onChange={(event) => onContentChange(event.target.value)}
        disabled={isSaving}
        rows={5}
        className="w-full rounded-xl border border-gray-300 bg-white p-3 text-sm outline-none focus:border-[#006971]"
      />

      <div className="flex justify-end gap-2">
        <button
          type="button"
          disabled={isSaving}
          onClick={onCancel}
          className="rounded-lg px-4 py-2 text-sm text-gray-600 hover:bg-gray-200 disabled:opacity-50"
        >
          Hủy
        </button>

        <button
          type="submit"
          disabled={!content.trim() || isSaving || isDeleting}
          className="rounded-lg bg-[#006971] px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
    </form>
    </dialog>
  );
}
