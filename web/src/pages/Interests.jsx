'use client';
import { useState } from 'react';
import Image from 'next/image';
import { Waves, Utensils, Landmark, Wine, Mountain, Coffee } from 'lucide-react';
import imgHeader from '@/assets/images/hoppy.jpg'; // Hoặc ảnh Đà Nẵng về đêm tương ứng

const INTEREST_OPTIONS = [
  { id: 'sea', label: 'Biển Mỹ Khê', icon: Waves },
  { id: 'food', label: 'Ẩm thực', icon: Utensils },
  { id: 'history', label: 'Di tích lịch sử', icon: Landmark },
  { id: 'nightlife', label: 'Giải trí ban đêm', icon: Wine },
  { id: 'hiking', label: 'Leo núi', icon: Mountain },
  { id: 'cafe', label: 'Cafe check-in', icon: Coffee },
];

export default function Interests() {
  const [selected, setSelected] = useState([]);

  const toggleInterest = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-xl flex flex-col md:flex-row overflow-hidden border border-gray-100">
        
        {/* Cột trái: Danh sách sở thích */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Sở thích của bạn</h2>
            <p className="text-xs text-gray-500 mt-1">Hãy chia sẻ nó với chúng tôi và mọi người</p>
          </div>

          {/* List các nút bấm sở thích */}
          <div className="space-y-3 mb-8">
            {INTEREST_OPTIONS.map((item) => {
              const Icon = item.icon;
              const isSelected = selected.includes(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => toggleInterest(item.id)}
                  className={`w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-full border text-sm font-semibold transition-all ${
                    isSelected
                      ? 'border-[#006971] bg-[#006971]/10 text-[#006971]'
                      : 'border-transparent text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4 text-gray-700" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Nút Hoàn tất */}
          <button
            type="button"
            className="w-full bg-[#006971] hover:bg-[#00555a] text-white font-semibold py-3 rounded-full text-sm transition-colors shadow-md"
          >
            Hoàn tất
          </button>
        </div>

        {/* Cột phải: Ảnh Welcome to Da Nang */}
        <div className="relative w-full md:w-1/2 min-h-[350px] md:min-h-[550px] hidden md:block">
          <Image src={imgHeader} alt="Welcome to Da Nang" fill priority className="object-cover object-left" sizes="(max-width: 768px) 100vw, 50vw" />
        </div>

      </div>
    </div>
  );
}