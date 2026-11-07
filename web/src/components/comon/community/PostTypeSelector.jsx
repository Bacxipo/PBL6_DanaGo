'use client';

export default function PostTypeSelector({ postType, onChange, disabled = false }) {
  return (
    <div className="flex items-center gap-2">
      <button
        disabled={disabled}
        type="button"
        onClick={() => onChange('trai-nghiem')}
        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${postType === 'trai-nghiem'
          ? 'bg-[#006971] text-white shadow-xs'
          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
      >
        Trải nghiệm
      </button>

      <button
        disabled={disabled}
        type="button"
        onClick={() => onChange('hoi-dap')}
        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${postType === 'hoi-dap'
          ? 'bg-[#006971] text-white shadow-xs'
          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
      >
        Hỏi đáp
      </button>

      <button
        disabled={disabled}
        type="button"
        onClick={() => onChange('dia-diem-moi')}
        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition cursor-pointer ${postType === 'dia-diem-moi'
          ? 'bg-[#006971] text-white shadow-xs'
          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
      >
        Địa điểm mới
      </button>
    </div>
  );
}
