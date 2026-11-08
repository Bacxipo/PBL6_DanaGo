'use client';

import React, { useState, useEffect } from 'react';
import { X, Search, Check, MapPin, Star, Plus } from 'lucide-react';
import { getRawDestinations } from '@/lib/destination-api';

export default function SelectPlacesModal({
    isOpen,
    onClose,
    selectedPlaces = [],
    onConfirmSelection,
}) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(false);
    const [localSelected, setLocalSelected] = useState([]);

    useEffect(() => {
        if (isOpen) {
            setLocalSelected([...selectedPlaces]);
            loadDestinations();
        }
    }, [isOpen, selectedPlaces]);

    const loadDestinations = async () => {
        setLoading(true);
        try {
            const list = await getRawDestinations({ status: 'APPROVED' });
            setDestinations(list || []);
        } catch (err) {
            console.error('Lỗi tải danh sách địa điểm:', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const togglePlace = (place) => {
        const exists = localSelected.some((p) => p.id === place.id);
        if (exists) {
            setLocalSelected(localSelected.filter((p) => p.id !== place.id));
        } else {
            setLocalSelected([...localSelected, place]);
        }
    };

    // Lọc danh sách địa điểm theo từ khóa & danh mục
    const filtered = destinations.filter((p) => {
        const matchSearch =
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (p.district && p.district.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchCategory =
            selectedCategory === 'ALL' ||
            p.categoryName === selectedCategory ||
            (p.category && p.category.name === selectedCategory);
        return matchSearch && matchCategory;
    });

    const categories = ['ALL', ...new Set(destinations.map((d) => d.categoryName || d.category?.name).filter(Boolean))];

    const handleSave = () => {
        onConfirmSelection(localSelected);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">Chọn Điểm Tham Quan Mong Muốn</h3>
                        <p className="text-xs text-gray-500">
                            AI sẽ ưu tiên sắp xếp các điểm bạn chọn vào lịch trình phù hợp nhất.
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Tìm kiếm & Lọc */}
                <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm điểm đến theo tên, quận huyện (ví dụ: Mỹ Khê, Bà Nà, Chùa Cầu...)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#006971]/30 focus:border-[#006971]"
                        />
                    </div>

                    {/* Danh mục lọc nhanh */}
                    <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
                        {categories.slice(0, 8).map((cat) => (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-2.5 py-1 rounded-lg font-medium whitespace-nowrap transition-colors ${
                                    selectedCategory === cat
                                        ? 'bg-[#006971] text-white'
                                        : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-100'
                                }`}
                            >
                                {cat === 'ALL' ? 'Tất cả danh mục' : cat}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Danh sách địa điểm */}
                <div className="flex-1 overflow-y-auto p-4 divide-y divide-gray-100">
                    {loading ? (
                        <div className="py-12 text-center text-sm text-gray-500">Đang tải danh sách địa điểm...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-12 text-center text-sm text-gray-500">Không tìm thấy địa điểm nào phù hợp.</div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {filtered.map((place) => {
                                const isSelected = localSelected.some((p) => p.id === place.id);
                                const imgUrl =
                                    place.images?.[0]?.imageUrl ||
                                    place.images?.[0]?.url ||
                                    'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=400&q=80';

                                return (
                                    <div
                                        key={place.id}
                                        onClick={() => togglePlace(place)}
                                        className={`p-3 rounded-xl border flex gap-3 cursor-pointer transition-all ${
                                            isSelected
                                                ? 'border-[#006971] bg-teal-50/50 ring-1 ring-[#006971]'
                                                : 'border-gray-200 hover:border-gray-300 bg-white'
                                        }`}
                                    >
                                        <img
                                            src={imgUrl}
                                            alt={place.name}
                                            className="w-16 h-16 rounded-lg object-cover shrink-0 bg-gray-100"
                                        />
                                        <div className="flex-1 min-w-0 space-y-1">
                                            <div className="flex items-start justify-between gap-1">
                                                <h4 className="text-xs font-bold text-gray-900 truncate">{place.name}</h4>
                                                <span
                                                    className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 text-white ${
                                                        isSelected ? 'bg-[#006971]' : 'border border-gray-300'
                                                    }`}
                                                >
                                                    {isSelected && <Check size={12} strokeWidth={3} />}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-1 text-2xs text-gray-500">
                                                <MapPin size={10} className="text-[#006971]" />
                                                <span>{place.district || 'Đà Nẵng'}</span>
                                                <span className="mx-1">•</span>
                                                <Star size={10} className="text-amber-500 fill-amber-500" />
                                                <span>{place.avgRating || '4.5'}</span>
                                            </div>
                                            <div className="text-2xs text-gray-400 truncate">
                                                {place.ticketPrice || 'Miễn phí'}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50">
                    <span className="text-xs text-gray-600 font-medium">
                        Đã chọn: <strong className="text-[#006971]">{localSelected.length}</strong> địa điểm
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-200 transition-colors"
                        >
                            Hủy
                        </button>
                        <button
                            type="button"
                            onClick={handleSave}
                            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#006971] hover:bg-[#00555c] text-white shadow-xs transition-colors"
                        >
                            Xác nhận ({localSelected.length})
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

